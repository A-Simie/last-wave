import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PLAYER_SPAWN } from '../src/data/foundation.ts';
import { SIGNAL_BOX_NOTE } from '../src/data/items.ts';
import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import {
    BEACH_DRINKS_DIALOGUE,
    BEACH_FRIEND_DIALOGUE,
    BEACH_QUEST,
    BEACH_SHORE_DIALOGUE
} from '../src/episodes/episode-01/beach.ts';
import {
    BEACH_DRINK_CART,
    BEACH_STANDING_PEOPLE,
    BEACH_V4_DRESSING_SOLIDS,
    BEACH_WALKER_ROUTES
} from '../src/episodes/episode-01/beachLayout.ts';
import { BeachNavigation } from '../src/episodes/episode-01/BeachNavigation.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { BEACH_ARRIVAL_SPAWN } from '../src/episodes/episode-01/entryLayout.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import {
    copyFoundationSnapshot,
    isBeachArrivalPosition,
    isFoundationSnapshot,
    isLegacyBeachArrivalPosition
} from '../src/scenes/FoundationState.ts';
import { DialogueSystem } from '../src/systems/DialogueSystem.ts';
import { isQuestSnapshot, QuestSystem } from '../src/systems/QuestSystem.ts';
import { SAVE_STORAGE_KEY, SAVE_VERSION, SaveSystem, validateSaveState } from '../src/systems/SaveSystem.ts';

const questAt = (definition, count) => ({
    questId: definition.id,
    completedObjectiveIds: definition.objectives.slice(0, count).map(({ id }) => id)
});
const snapshot = (ids = []) => ({
    sceneId: 'foundation',
    area: 'beach-arrival',
    playerPosition: [...BEACH_ARRIVAL_SPAWN],
    quest: questAt(SIGNAL_CHECK_QUEST, 3),
    opening: questAt(OPENING_QUEST, 3),
    entry: questAt(ENTRY_QUEST, 8),
    inventory: { itemIds: [SIGNAL_BOX_NOTE.id, STARTER_BAG.id, BEACH_PASSES.id] },
    beach: { questId: BEACH_QUEST.id, completedObjectiveIds: [...ids] },
    wave: 'before-wave'
});
const envelope = (state, version = SAVE_VERSION) => ({ version, savedAt: 1793952000000, state });

test('all six exploration orders complete once without losing early discoveries', () => {
    for (const order of [
        [0, 1, 2],
        [0, 2, 1],
        [1, 0, 2],
        [1, 2, 0],
        [2, 0, 1],
        [2, 1, 0]
    ]) {
        const quest = new QuestSystem(BEACH_QUEST);
        assert.equal(quest.state.status, 'active');
        let notifications = 0;
        quest.onStateChange = () => notifications++;
        for (const [index, id] of order.entries()) {
            const event = BEACH_QUEST.objectives[id].event;
            assert.equal(quest.handle(event), true);
            assert.equal(quest.handle(event), false);
            assert.equal(quest.state.completedCount, index + 1);
            assert.equal(quest.state.remainingObjectives.length, 2 - index);
        }
        assert.deepEqual(quest.snapshot.completedObjectiveIds, ['friend', 'drinks', 'shore']);
        assert.equal(notifications, 3);
        assert.equal(quest.state.status, 'completed');
    }
});

test('every discovery subset restores independently and resumes only missing stops', () => {
    for (let mask = 0; mask < 8; mask++) {
        const completed = BEACH_QUEST.objectives.filter((_, i) => mask & (1 << i));
        const state = snapshot(completed.map(({ id }) => id).reverse());
        const saved = validateSaveState(envelope(state));
        assert.equal(saved.status, 'ready');
        const quest = new QuestSystem(BEACH_QUEST);
        assert.equal(quest.restore(saved.save.state.beach), true);
        assert.equal(quest.state.completedCount, completed.length);
        for (const objective of BEACH_QUEST.objectives)
            assert.equal(quest.handle(objective.event), !completed.includes(objective));
        assert.equal(quest.state.status, 'completed');
    }
});

test('same-size discovery rollbacks publish a changed set, remain isolated and reject corruption atomically', () => {
    const quest = new QuestSystem(BEACH_QUEST);
    quest.restore(snapshot(['shore']).beach);
    let changes = 0;
    quest.onStateChange = () => changes++;
    const source = snapshot(['drinks']).beach;
    assert.equal(quest.restore(source), true);
    source.completedObjectiveIds.push('friend');
    quest.state.remainingObjectives[0].text = 'mutated';
    const before = quest.snapshot;
    for (const ids of [['unknown'], ['friend', 'friend'], new Array(1), [null]]) {
        assert.equal(quest.restore({ ...before, completedObjectiveIds: ids }), false);
        assert.deepEqual(quest.snapshot, before);
    }
    assert.equal(changes, 1);
    quest.destroy();
    assert.equal(quest.handle(BEACH_QUEST.objectives[0].event), false);
    assert.equal(quest.restore(before), false);
});

test('reading, cancelling, declining and stale conversation choices do not complete beach moments', () => {
    const quest = new QuestSystem(BEACH_QUEST);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (choice) => quest.handle({ type: 'dialogue-choice', ...choice });
    for (const definition of [BEACH_FRIEND_DIALOGUE, BEACH_DRINKS_DIALOGUE, BEACH_SHORE_DIALOGUE]) {
        dialogue.open(definition);
        dialogue.close();
        dialogue.open(definition);
        assert.equal(dialogue.choose(definition.start, 'later'), true);
    }
    assert.equal(quest.state.completedCount, 0);
    dialogue.open(BEACH_DRINKS_DIALOGUE);
    assert.equal(dialogue.choose('served', 'take'), false);
    dialogue.choose('offer', 'take');
    assert.equal(dialogue.choose('offer', 'take'), false);
    assert.deepEqual(quest.snapshot.completedObjectiveIds, ['drinks']);
    dialogue.close();
    dialogue.open(BEACH_FRIEND_DIALOGUE);
    dialogue.choose('greeting', 'quiet');
    dialogue.choose('quiet', 'continue');
    assert.equal(quest.state.completedCount, 1);
    dialogue.choose('together', 'enjoy');
    assert.equal(quest.state.completedCount, 2);
    dialogue.open(BEACH_SHORE_DIALOGUE);
    dialogue.choose('look', 'notice');
    assert.equal(quest.state.completedCount, 3);
});

test('both friend replies reach the acknowledged social moment', () => {
    for (const branch of ['quiet', 'company']) {
        const quest = new QuestSystem(BEACH_QUEST);
        const dialogue = new DialogueSystem();
        dialogue.onChoice = (choice) => quest.handle({ type: 'dialogue-choice', ...choice });
        dialogue.open(BEACH_FRIEND_DIALOGUE);
        assert.match(dialogue.state.text, /^See\? I told you we needed to come out\./);
        dialogue.choose('greeting', branch);
        dialogue.choose(branch, 'continue');
        dialogue.choose('together', 'enjoy');
        assert.deepEqual(quest.snapshot.completedObjectiveIds, ['friend']);
    }
});

test('v4 requires discovery state and rejects moments earned outside admitted beach exploration', () => {
    const state = snapshot(['shore']);
    const missing = { ...state };
    delete missing.beach;
    for (const invalid of [
        missing,
        { ...state, beach: null },
        { ...state, beach: questAt(ENTRY_QUEST, 1) },
        { ...state, inventory: { itemIds: [STARTER_BAG.id, SIGNAL_BOX_NOTE.id] } },
        { ...state, area: 'tideline', playerPosition: PLAYER_SPAWN, entry: questAt(ENTRY_QUEST, 7) }
    ]) {
        assert.equal(isFoundationSnapshot(invalid), false);
        assert.equal(validateSaveState(envelope(invalid)).status, 'invalid');
    }
    assert.equal(isQuestSnapshot(state.beach, ENTRY_QUEST), false);
    const copied = copyFoundationSnapshot(state);
    copied.beach.completedObjectiveIds.push('friend');
    assert.deepEqual(state.beach.completedObjectiveIds, ['shore']);
});

test('v3 arrival migration retains all three earlier quests, ownership, positions and stored bytes', () => {
    const legacy = snapshot();
    delete legacy.beach;
    const raw = JSON.stringify(envelope(legacy, 3));
    const saves = new SaveSystem(() => ({
        getItem: (key) => (key === SAVE_STORAGE_KEY ? raw : null),
        setItem: () => assert.fail('Migration must not write'),
        removeItem: () => assert.fail('Migration must not delete')
    }));
    const loaded = saves.load();
    assert.equal(loaded.status, 'ready');
    assert.deepEqual(loaded.save, envelope(snapshot()));
    const tideline = { ...legacy, area: 'tideline', playerPosition: PLAYER_SPAWN, entry: questAt(ENTRY_QUEST, 6) };
    const migrated = validateSaveState(envelope(tideline, 3));
    assert.equal(migrated.status, 'ready');
    assert.equal(migrated.save.state.area, 'tideline');
    assert.deepEqual(migrated.save.state.entry, tideline.entry);
    assert.deepEqual(migrated.save.state.beach, snapshot().beach);
});

test('only newly occupied legacy beach positions relocate; invalid old geometry and corrupt ownership still fail', () => {
    for (const solid of BEACH_V4_DRESSING_SOLIDS) {
        const point = [solid.position[0], 1.04, solid.position[2]];
        assert.equal(isLegacyBeachArrivalPosition(point), true, solid.name);
        const newlyOccupied = !isBeachArrivalPosition(point);
        const legacy = { ...snapshot(), playerPosition: point };
        delete legacy.beach;
        const migrated = validateSaveState(envelope(legacy, 3));
        assert.equal(migrated.status, 'ready', solid.name);
        assert.deepEqual(migrated.save.state.playerPosition, newlyOccupied ? BEACH_ARRIVAL_SPAWN : point);
        assert.equal(
            validateSaveState(envelope({ ...legacy, beach: snapshot().beach })).status,
            newlyOccupied ? 'invalid' : 'ready'
        );
    }
    for (const point of [
        [100, 1, 0],
        [0, -5, 0],
        [15.7, 1.04, 0],
        [0, 1.04, -16]
    ])
        assert.equal(validateSaveState(envelope({ ...snapshot(), playerPosition: point }, 3)).status, 'invalid');
    assert.equal(
        validateSaveState(
            envelope({ ...snapshot(), inventory: { itemIds: [] }, playerPosition: BEACH_DRINK_CART.position }, 3)
        ).status,
        'invalid'
    );
});

test('exploration paths connect the arrival, cart, shore and lounger aisles with swept corner clearance', () => {
    const navigation = new BeachNavigation(isBeachArrivalPosition);
    const points = [
        BEACH_ARRIVAL_SPAWN,
        [-8.5, 1.04, 5.6],
        [0, 1.04, -13.8],
        [4, 1.04, 1.4],
        [-13.5, 1.04, -4],
        [11, 1.04, -5],
        [11.7, 1.04, 9.8],
        [-44, 1.04, -30],
        [45, 1.04, -30],
        [-43, 1.04, 9.8],
        [43, 1.04, 9.8],
        [0, 1.04, -34]
    ];
    for (const from of points) {
        for (const to of points) {
            const route = navigation.route(from, to);
            assert.ok(route?.length, `${from} to ${to}`);
            let previous = from;
            for (const point of route) {
                assert.equal(navigation.clearSegment(previous, point), true);
                previous = point;
            }
            assert.deepEqual(previous, [to[0], 1.04, to[2]]);
        }
    }
    assert.equal(navigation.route(BEACH_ARRIVAL_SPAWN, BEACH_DRINK_CART.position), null);
    assert.equal(navigation.clearSegment([-10.8, 1.04, 3.8], [-6.2, 1.04, 3.8]), false);
    for (const route of BEACH_WALKER_ROUTES) {
        for (let i = 0; i < route.length; i++)
            assert.equal(navigation.clearSegment(route[i], route[(i + 1) % route.length]), true);
    }
});

test('restored companions stand nearby without overlapping players or occupied walkways', () => {
    const navigation = new BeachNavigation(isBeachArrivalPosition);
    const occupied = BEACH_STANDING_PEOPLE.map(({ position }) => position);
    for (const player of [
        [0, 1.04, 3.6],
        [-8.5, 1.04, 5.6],
        [0, 1.04, -14],
        [14.9, 1.04, 10],
        [-13.5, 1.04, -4]
    ]) {
        const near = navigation.near(player, BEACH_ARRIVAL_SPAWN, occupied);
        assert.ok(near);
        assert.equal(isBeachArrivalPosition(near), true);
        assert.ok(Math.hypot(near[0] - player[0], near[2] - player[2]) >= 2);
        for (const other of occupied) assert.ok(Math.hypot(near[0] - other[0], near[2] - other[2]) > 1.15);
    }
});

test('companion routes go around oncoming walkers and take the direct path once they pass', () => {
    const navigation = new BeachNavigation(isBeachArrivalPosition);
    const from = [-4, 1.04, -10.8];
    const to = [2, 1.04, -10.8];
    const walker = [-1, 1.04, -10.8];
    const route = navigation.route(from, to, [walker]);
    assert.ok(route?.length > 1);
    let previous = from;
    for (const point of route) {
        for (let t = 0; t <= 1; t += 0.01) {
            const sample = [
                previous[0] + (point[0] - previous[0]) * t,
                1.04,
                previous[2] + (point[2] - previous[2]) * t
            ];
            assert.equal(isBeachArrivalPosition(sample), true);
            assert.ok(Math.hypot(sample[0] - walker[0], sample[2] - walker[2]) >= 1.15 - 0.00001);
        }
        previous = point;
    }
    assert.deepEqual(previous, to);
    assert.deepEqual(navigation.route(from, to, [[-6, 1.04, -10.8]]), [to]);
    assert.equal(navigation.route(from, to, [to]), null);
});

test('a companion already yielding inside the walking margin can escape without approaching the walker', () => {
    const navigation = new BeachNavigation(isBeachArrivalPosition);
    const walker = [-1, 1.04, -10.8];
    const from = [-1.72, 1.04, -10.8];
    const to = [2, 1.04, -10.8];
    const route = navigation.route(from, to, [walker]);
    assert.ok(route?.length > 1);
    let previous = from;
    let clearance = 0.72;
    for (const point of route) {
        for (let t = 0; t <= 1; t += 0.01) {
            const x = previous[0] + (point[0] - previous[0]) * t;
            const z = previous[2] + (point[2] - previous[2]) * t;
            const distance = Math.hypot(x - walker[0], z - walker[2]);
            assert.ok(distance >= clearance - 0.00001);
            assert.equal(isBeachArrivalPosition([x, 1.04, z]), true);
            clearance = Math.min(1.15, distance);
        }
        previous = point;
    }
    assert.deepEqual(previous, to);
});
