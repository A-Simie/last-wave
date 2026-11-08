import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SIGNAL_BOX_NOTE } from '../src/data/items.ts';
import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import {
    BEACH_PASSES,
    ENTRY_QUEST,
    OFFICER_CUTSCENE,
    QUEUE_CUTSCENE,
    TICKET_DIALOGUE,
    directionsDialogue
} from '../src/episodes/episode-01/entry.ts';
import {
    BEACH_ARRIVAL_SPAWN,
    BEACH_FRIEND_SPAWN,
    ENTRY_SOLIDS,
    OFFICER_PLAYER_MARK,
    QUEUE_MARK,
    STREET_FRIEND_ROUTE
} from '../src/episodes/episode-01/entryLayout.ts';
import { OPENING_CUTSCENE, OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import { StreetEntryProgress } from '../src/episodes/episode-01/StreetEntryProgress.ts';
import {
    createBeachArrivalSnapshot,
    isBeachArrivalPosition,
    isFoundationPosition,
    isFoundationSnapshot
} from '../src/scenes/FoundationState.ts';
import { CutsceneSystem } from '../src/systems/CutsceneSystem.ts';
import { DialogueSystem } from '../src/systems/DialogueSystem.ts';
import { InventorySystem } from '../src/systems/InventorySystem.ts';
import { SAVE_STORAGE_KEY, SAVE_VERSION, SaveSystem, validateSaveState } from '../src/systems/SaveSystem.ts';

const questAt = (definition, count) => ({
    questId: definition.id,
    completedObjectiveIds: definition.objectives.slice(0, count).map(({ id }) => id)
});
const directions = { dialogueId: 'e1-beach-directions', nodeId: 'directions', choiceId: 'thanks' };
const purchase = { dialogueId: TICKET_DIALOGUE.id, nodeId: 'offer', choiceId: 'buy' };
const setup = (count = 0, packed = true) => {
    const inventory = new InventorySystem([STARTER_BAG, BEACH_PASSES]);
    if (packed) inventory.acquire(STARTER_BAG.id);
    if (count >= 6) inventory.acquire(BEACH_PASSES.id);
    return { inventory, progress: new StreetEntryProgress(inventory, questAt(ENTRY_QUEST, count)) };
};
const snapshot = (count) => ({
    sceneId: 'foundation',
    area: count === 8 ? 'beach-arrival' : 'tideline',
    playerPosition: [...(count === 8 ? BEACH_ARRIVAL_SPAWN : QUEUE_MARK)],
    quest: questAt(SIGNAL_CHECK_QUEST, 3),
    inventory: { itemIds: [SIGNAL_BOX_NOTE.id, STARTER_BAG.id, ...(count >= 6 ? [BEACH_PASSES.id] : [])] },
    opening: questAt(OPENING_QUEST, count >= 3 ? 3 : 2),
    entry: questAt(ENTRY_QUEST, count),
    beach: questAt(BEACH_QUEST, 0)
});
const envelope = (state, version = SAVE_VERSION) => ({ version, savedAt: 1793952000000, state });

test('belongings, actual control practice, exit, directions and officer are ordered prerequisites', () => {
    const { inventory, progress } = setup(0, false);
    assert.equal(progress.lesson, null);
    assert.equal(progress.practise('move'), false);
    assert.equal(progress.funds, 0);
    inventory.acquire(STARTER_BAG.id);
    assert.equal(progress.lesson.id, 'move');
    assert.equal(progress.practise('look'), false);
    assert.equal(progress.leaveCafe(), false);
    assert.equal(progress.choose(directions), false);
    assert.equal(progress.choose(purchase), false);
    assert.equal(progress.finishCutscene(OFFICER_CUTSCENE.id), false);
    assert.equal(progress.finishCutscene(QUEUE_CUTSCENE.id), false);
    assert.equal(progress.practise('move'), true);
    assert.equal(progress.practise('move'), false);
    assert.equal(progress.lesson.id, 'look');
    assert.equal(progress.leaveCafe(), false);
    assert.equal(progress.practise('look'), true);
    assert.equal(progress.lesson.id, 'interact');
    assert.equal(progress.leaveCafe(), true);
    assert.equal(progress.leaveCafe(), true);
    assert.equal(progress.lesson, null);
    assert.equal(progress.quest.state.completedCount, 3);
    assert.equal(progress.choose({ ...directions, choiceId: 'leave' }), false);
    assert.equal(progress.choose(directions), true);
    assert.equal(progress.choose(directions), false);
    assert.equal(progress.finishCutscene(OPENING_CUTSCENE.id), false);
    assert.equal(progress.finishCutscene(OFFICER_CUTSCENE.id), true);
    assert.equal(progress.quest.state.completedCount, 5);
    assert.equal(progress.funds, 10);
    assert.equal(progress.canQueue, false);
});

test('pedestrian directions are reusable and only the acknowledged directions advance the route', () => {
    const { progress } = setup(3);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (choice) => progress.choose(choice);
    dialogue.open(directionsDialogue('Suited commuter'));
    dialogue.choose('greeting', 'leave');
    assert.equal(progress.quest.state.completedCount, 3);
    dialogue.open(directionsDialogue('Seafront pedestrian'));
    dialogue.choose('greeting', 'beach');
    assert.equal(progress.quest.state.completedCount, 3);
    assert.equal(dialogue.choose('greeting', 'thanks'), false);
    dialogue.choose('directions', 'thanks');
    assert.equal(progress.quest.state.completedCount, 4);
    dialogue.open(directionsDialogue('Another pedestrian'));
    dialogue.choose('greeting', 'beach');
    dialogue.choose('directions', 'thanks');
    assert.equal(progress.quest.state.completedCount, 4);
});

test('one attainable payment acquires both passes; cancel, wrong-node and stale purchase actions cannot spend twice', () => {
    const { inventory, progress } = setup(5);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (choice) => progress.choose(choice);
    let acquisitions = 0;
    inventory.onStateChange = () => acquisitions++;
    dialogue.open(TICKET_DIALOGUE);
    dialogue.choose('offer', 'later');
    assert.equal(progress.funds, 10);
    assert.equal(progress.quest.state.completedCount, 5);
    assert.equal(progress.choose({ ...purchase, nodeId: 'receipt' }), false);
    dialogue.open(TICKET_DIALOGUE);
    assert.equal(dialogue.choose('offer', 'buy'), true);
    assert.equal(dialogue.state.nodeId, 'receipt');
    assert.equal(progress.funds, 0);
    assert.equal(progress.quest.state.completedCount, 6);
    assert.equal(progress.canQueue, true);
    assert.equal(dialogue.choose('offer', 'buy'), false);
    assert.equal(progress.choose(purchase), false);
    assert.equal(acquisitions, 1);
    assert.deepEqual(inventory.snapshot.itemIds, [STARTER_BAG.id, BEACH_PASSES.id]);
});

test('cinematic cancellation preserves the queue; completion or skip admits once and allows an explicit failed-entry retry', () => {
    for (const skip of [false, true]) {
        const { progress } = setup(6);
        const cutscene = new CutsceneSystem();
        let arrivals = 0;
        progress.onArrivalRequested = () => arrivals++;
        cutscene.onFinished = (id) => progress.finishCutscene(id);
        cutscene.play(QUEUE_CUTSCENE);
        cutscene.cancel();
        assert.equal(progress.quest.state.completedCount, 6);
        assert.equal(arrivals, 0);
        cutscene.play(QUEUE_CUTSCENE);
        assert.equal(cutscene.advance(QUEUE_CUTSCENE.id, 'wrong-beat'), false);
        if (skip) cutscene.skip(QUEUE_CUTSCENE.id);
        else for (const beat of QUEUE_CUTSCENE.beats) cutscene.advance(QUEUE_CUTSCENE.id, beat.id);
        assert.equal(progress.quest.state.completedCount, 7);
        assert.equal(arrivals, 1);
        assert.equal(progress.finishCutscene(QUEUE_CUTSCENE.id), false);
        assert.equal(progress.finishCutscene(OFFICER_CUTSCENE.id), false);
        assert.equal(arrivals, 1);
        assert.equal(progress.requestArrival(), true);
        assert.equal(arrivals, 2);
        assert.equal(progress.funds, 0);
    }
});

test('completed lessons restore without relearning; disposed entry models reject late actions', () => {
    for (const [count, lesson] of [
        [0, 'move'],
        [1, 'look'],
        [2, 'interact'],
        [3, null]
    ]) {
        const { progress } = setup(count);
        assert.equal(progress.lesson?.id ?? null, lesson);
    }
    const { inventory, progress } = setup(5);
    progress.destroy();
    assert.equal(progress.choose(purchase), false);
    assert.equal(progress.practise('move'), false);
    assert.equal(progress.leaveCafe(), false);
    assert.equal(progress.finishCutscene(OFFICER_CUTSCENE.id), false);
    assert.equal(progress.requestArrival(), false);
    assert.deepEqual(inventory.snapshot.itemIds, [STARTER_BAG.id]);
});

test('current saves round-trip every street step and the arrival boundary without leaking mutable arrays', () => {
    let raw = null;
    const saves = new SaveSystem(
        () => ({
            getItem: () => raw,
            setItem: (_, data) => {
                raw = data;
            },
            removeItem: () => {
                raw = null;
            }
        }),
        () => 1793952000000
    );
    for (let count = 0; count <= 8; count++) {
        const state = snapshot(count);
        assert.equal(isFoundationSnapshot(state), true, `entry stage ${count}`);
        assert.equal(saves.save(state).status, 'ready');
        const loaded = saves.load();
        assert.deepEqual(loaded.save, envelope(state));
        loaded.save.state.entry.completedObjectiveIds.length = 0;
        assert.deepEqual(saves.load().save.state, state);
        const { inventory } = setup();
        inventory.restore({ itemIds: state.inventory.itemIds.filter((id) => id !== SIGNAL_BOX_NOTE.id) });
        const restored = new StreetEntryProgress(inventory, state.entry);
        assert.equal(restored.funds, count >= 6 ? 0 : 10);
        assert.equal(restored.quest.state.completedCount, count);
    }
});

test('entry invariants reject skipped lessons, forged tickets, missing funds prerequisites and mismatched areas', () => {
    const state = snapshot(6);
    for (const invalid of [
        { ...state, entry: null },
        { ...state, entry: questAt(OPENING_QUEST, 3) },
        { ...state, entry: { questId: ENTRY_QUEST.id, completedObjectiveIds: ['meet-officer'] } },
        { ...state, entry: { questId: ENTRY_QUEST.id, completedObjectiveIds: ['practise-move', 'practise-move'] } },
        { ...snapshot(1), opening: questAt(OPENING_QUEST, 1), inventory: { itemIds: [SIGNAL_BOX_NOTE.id] } },
        { ...snapshot(3), opening: questAt(OPENING_QUEST, 2) },
        { ...snapshot(2), opening: questAt(OPENING_QUEST, 3) },
        { ...snapshot(5), inventory: state.inventory },
        { ...state, inventory: { itemIds: [STARTER_BAG.id, SIGNAL_BOX_NOTE.id] } },
        { ...state, inventory: { itemIds: [...state.inventory.itemIds, BEACH_PASSES.id] } },
        { ...snapshot(7), area: 'beach-arrival', playerPosition: BEACH_ARRIVAL_SPAWN },
        { ...snapshot(8), area: 'tideline', playerPosition: QUEUE_MARK },
        { ...snapshot(8), playerPosition: QUEUE_MARK },
        { ...snapshot(8), playerPosition: [0, 1, -16] }
    ])
        assert.equal(validateSaveState(envelope(invalid)).status, 'invalid', JSON.stringify(invalid));
    assert.equal(validateSaveState(envelope({ ...state, area: 'hospital' })).status, 'incompatible');
});

test('arrival candidates require paid admission and validate before replacing any source state', () => {
    const current = snapshot(7);
    const original = structuredClone(current);
    const candidate = createBeachArrivalSnapshot(current);
    assert.equal(candidate.area, 'beach-arrival');
    assert.deepEqual(candidate.playerPosition, BEACH_ARRIVAL_SPAWN);
    assert.equal(candidate.entry.completedObjectiveIds.length, 8);
    assert.deepEqual(candidate.inventory, current.inventory);
    assert.deepEqual(current, original);
    candidate.inventory.itemIds.length = 0;
    candidate.entry.completedObjectiveIds.length = 0;
    assert.deepEqual(current, original);
    for (const count of [0, 4, 5, 6, 8]) assert.throws(() => createBeachArrivalSnapshot(snapshot(count)), /not ready/);
    assert.throws(() => createBeachArrivalSnapshot({ ...current, playerPosition: [0, -5, 0] }), /not ready/);
});

test('v2 migration preserves completed departures and stored bytes, and relocates only newly occupied entrance footprints', () => {
    for (const openingCount of [0, 1, 2, 3]) {
        const legacy = snapshot(openingCount === 3 ? 3 : 0);
        legacy.opening = questAt(OPENING_QUEST, openingCount);
        if (openingCount < 2) legacy.inventory.itemIds = [SIGNAL_BOX_NOTE.id];
        delete legacy.entry;
        delete legacy.area;
        delete legacy.beach;
        const raw = JSON.stringify(envelope(legacy, 2));
        const saves = new SaveSystem(() => ({
            getItem: (key) => (key === SAVE_STORAGE_KEY ? raw : null),
            setItem: () => assert.fail('Migration wrote storage'),
            removeItem: () => assert.fail('Migration deleted storage')
        }));
        const result = saves.load();
        assert.equal(result.status, 'ready');
        assert.equal(result.save.version, SAVE_VERSION);
        assert.equal(result.save.state.entry.completedObjectiveIds.length, openingCount === 3 ? 3 : 0);
        assert.deepEqual(result.save.state.playerPosition, legacy.playerPosition);
    }
    const occupied = { ...snapshot(3), playerPosition: [72.5, 1.04, -11.8] };
    delete occupied.area;
    delete occupied.entry;
    const migrated = validateSaveState(envelope(occupied, 2));
    assert.equal(migrated.status, 'ready');
    assert.deepEqual(migrated.save.state.playerPosition, [70.5, 1.04, 6.4]);
    assert.equal(validateSaveState(envelope({ ...occupied, playerPosition: [0, -5, 0] }, 2)).status, 'invalid');
    assert.equal(validateSaveState(envelope(occupied, 3)).status, 'invalid');
});

test('authored approach, staging and arrival positions clear static collision, while entrance solids reject penetration', () => {
    for (const position of [...STREET_FRIEND_ROUTE, OFFICER_PLAYER_MARK, QUEUE_MARK])
        assert.equal(isFoundationPosition(position), true, JSON.stringify(position));
    for (const position of [BEACH_ARRIVAL_SPAWN, BEACH_FRIEND_SPAWN])
        assert.equal(isBeachArrivalPosition(position), true);
    for (const solid of ENTRY_SOLIDS)
        assert.equal(
            isFoundationPosition([solid.position[0], Math.max(1, solid.position[1] - 0.2), solid.position[2]]),
            false,
            solid.name
        );
});
