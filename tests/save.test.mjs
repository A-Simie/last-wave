import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    GROUND,
    NEIGHBOR_BUILDINGS,
    NPC_POSITION,
    PLAYER_SPAWN,
    SIGNAL_BOX,
    STREET_PLANTERS
} from '../src/data/foundation.ts';
import { SIGNAL_BOX_NOTE } from '../src/data/items.ts';
import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import { OPENING_SOLIDS, OPENING_SPAWN } from '../src/episodes/episode-01/openingLayout.ts';
import { FOUNDATION_SCENE_ID, isFoundationPosition, isFoundationSnapshot } from '../src/scenes/FoundationState.ts';
import { InventorySystem } from '../src/systems/InventorySystem.ts';
import { QuestSystem } from '../src/systems/QuestSystem.ts';
import { SAVE_STORAGE_KEY, SAVE_VERSION, SaveSystem, validateSaveState } from '../src/systems/SaveSystem.ts';

const now = 1_793_779_200_000;
const snapshot = (count = 0, clue = count >= 2) => ({
    sceneId: FOUNDATION_SCENE_ID,
    playerPosition: [...PLAYER_SPAWN],
    quest: {
        questId: SIGNAL_CHECK_QUEST.id,
        completedObjectiveIds: SIGNAL_CHECK_QUEST.objectives.slice(0, count).map(({ id }) => id)
    },
    inventory: { itemIds: clue ? [SIGNAL_BOX_NOTE.id] : [] },
    opening: { questId: OPENING_QUEST.id, completedObjectiveIds: [] }
});
const envelope = (state = snapshot()) => ({ version: SAVE_VERSION, savedAt: now, state });
const storage = () => {
    const entries = new Map();
    return {
        entries,
        getItem: (key) => entries.get(key) ?? null,
        setItem: (key, value) => entries.set(key, value),
        removeItem: (key) => entries.delete(key)
    };
};

test('checkpoints round-trip every reachable quest/clue combination into fresh models', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    for (const [count, clue] of [
        [0, false],
        [0, true],
        [1, false],
        [1, true],
        [2, true],
        [3, true]
    ]) {
        const state = snapshot(count, clue);
        state.playerPosition = [-1.1, 1, 3];
        assert.equal(saves.save(state).status, 'ready');
        const result = saves.load();
        assert.equal(result.status, 'ready');
        assert.deepEqual(result.save, envelope(state));

        const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
        const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
        assert.equal(quest.restore(result.save.state.quest), true);
        assert.equal(inventory.restore(result.save.state.inventory), true);
        assert.equal(quest.state.completedCount, count);
        assert.equal(inventory.state.items.length, clue ? 1 : 0);
    }
});

test('saved values and returned snapshots do not alias callers or persist display content', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    const state = snapshot(2);
    state.inventory.title = '<script>not trusted content</script>';
    const result = saves.save(state);
    state.quest.completedObjectiveIds.length = 0;
    state.inventory.itemIds.length = 0;
    state.playerPosition[0] = 8;
    result.save.state.inventory.itemIds.length = 0;
    result.save.state.playerPosition[0] = 5;
    const loaded = saves.load();
    loaded.save.state.quest.completedObjectiveIds.push('report-back');

    assert.deepEqual(saves.load().save, envelope(snapshot(2)));
    assert.equal(local.getItem(SAVE_STORAGE_KEY).includes('not trusted'), false);
    const validated = validateSaveState(envelope(snapshot(1)));
    assert.equal(validated.status, 'ready');
    assert.equal(validated.save.version, SAVE_VERSION);
});

test('explicit saving overwrites one slot and deletion preserves unrelated browser storage', () => {
    const local = storage();
    local.setItem('other-game', 'keep');
    let time = now;
    const saves = new SaveSystem(
        () => local,
        () => time
    );
    assert.equal(saves.load().status, 'missing');
    saves.save(snapshot(0));
    time++;
    saves.save(snapshot(3));
    assert.equal(local.entries.size, 2);
    assert.deepEqual(saves.load().save, { ...envelope(snapshot(3)), savedAt: time });
    assert.equal(saves.clear(), true);
    assert.equal(saves.clear(), true);
    assert.equal(saves.load().status, 'missing');
    assert.equal(local.getItem('other-game'), 'keep');
});

test('missing, malformed and oversized checkpoint data are distinguished without changing storage', () => {
    const local = storage();
    const saves = new SaveSystem(() => local);
    assert.equal(saves.load().status, 'missing');
    for (const raw of ['', '{', 'null', '[]', 'true', '{}', 'x'.repeat(16_385)]) {
        local.setItem(SAVE_STORAGE_KEY, raw);
        assert.equal(saves.load().status, 'invalid', raw.slice(0, 20));
        assert.equal(local.getItem(SAVE_STORAGE_KEY), raw);
    }
});

test('unsupported checkpoint versions and scene identities are retained as incompatible', () => {
    const local = storage();
    const saves = new SaveSystem(() => local);
    for (const data of [
        { ...envelope(), version: SAVE_VERSION + 1 },
        { ...envelope(), version: 99, state: null },
        envelope({ ...snapshot(), sceneId: 'future-scene' })
    ]) {
        const raw = JSON.stringify(data);
        local.setItem(SAVE_STORAGE_KEY, raw);
        assert.equal(saves.load().status, 'incompatible');
        assert.equal(local.getItem(SAVE_STORAGE_KEY), raw);
    }
});

test('checkpoint envelopes require a real version, valid timestamp and complete scene state', () => {
    for (const data of [
        { ...envelope(), version: '1' },
        { ...envelope(), version: 0 },
        { ...envelope(), version: 1.5 },
        { ...envelope(), savedAt: 'today' },
        { ...envelope(), savedAt: -1 },
        { ...envelope(), savedAt: Infinity },
        { ...envelope(), savedAt: NaN },
        { ...envelope(), savedAt: 8.64e15 + 1 },
        { ...envelope(), savedAt: 1.5 },
        { ...envelope(), state: null },
        { ...envelope(), state: {} },
        { ...envelope(), state: { ...snapshot(), sceneId: 1 } }
    ]) {
        assert.equal(validateSaveState(data).status, 'invalid');
    }
});

test('unknown, duplicate, skipped and inconsistent progress is rejected as one whole checkpoint', () => {
    const state = snapshot(2);
    for (const invalid of [
        { ...state, quest: { ...state.quest, questId: 'other-quest' } },
        { ...state, quest: { ...state.quest, completedObjectiveIds: ['check-signal-box'] } },
        { ...state, quest: { ...state.quest, completedObjectiveIds: ['speak-to-guide', 'speak-to-guide'] } },
        { ...state, inventory: { itemIds: ['unknown'] } },
        { ...state, inventory: { itemIds: [SIGNAL_BOX_NOTE.id, SIGNAL_BOX_NOTE.id] } },
        { ...state, inventory: { itemIds: [] } },
        { ...snapshot(3), inventory: { itemIds: [] } },
        { ...state, quest: null },
        { ...state, inventory: null }
    ]) {
        assert.equal(isFoundationSnapshot(invalid), false);
        assert.equal(validateSaveState(envelope(invalid)).status, 'invalid');
    }
});

test('safe positions include café aisles, doorway, open street, sidewalks and supported table tops', () => {
    for (const position of [
        PLAYER_SPAWN,
        [-1.1, 0.999, 0],
        [-1.1, 4, 0],
        [6.25, 1.014, 4.6],
        [8.1, 1.014, 5.76],
        [8.1, 1.014, 6.65],
        [7.7, 1.794, 0],
        [-1.1, 2.2, -3.5],
        [5.95, 1, -1.05],
        [12, 1, 8],
        [24, 1, 13.2],
        [-18, 1, 19.5],
        [63, 1, 40],
        [10, 1, 0]
    ]) {
        assert.equal(isFoundationPosition(position), true, JSON.stringify(position));
    }
});

test('unsafe foundation positions reject non-finite coordinates, bounds and solid penetration', () => {
    for (const position of [
        null,
        {},
        [0, 1],
        [0, 1, 0, 0],
        [0, '1', 0],
        [NaN, 1, 0],
        [0, Infinity, 0],
        new Array(3),
        [GROUND.position[0] + GROUND.size[0] / 2, 1, 13],
        [0, 1, GROUND.position[2] - GROUND.size[2] / 2],
        [0, -100, 0],
        [0, 100, 0],
        [0, 0.8, 0],
        [0, 1.1, 0],
        NPC_POSITION,
        ...[...NEIGHBOR_BUILDINGS, ...STREET_PLANTERS, SIGNAL_BOX].map(({ position }) => [position[0], 1, position[2]])
    ]) {
        assert.equal(isFoundationPosition(position), false, JSON.stringify(position));
    }
});

test('invalid live snapshots never overwrite the last valid checkpoint', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    saves.save(snapshot(2));
    const before = local.getItem(SAVE_STORAGE_KEY);
    assert.equal(saves.save({ ...snapshot(3), playerPosition: [0, -100, 0] }).status, 'invalid');
    assert.equal(local.getItem(SAVE_STORAGE_KEY), before);
    const invalidClock = new SaveSystem(
        () => local,
        () => NaN
    );
    assert.equal(invalidClock.save(snapshot()).status, 'invalid');
    assert.equal(local.getItem(SAVE_STORAGE_KEY), before);
});

test('blocked storage getters and storage operations report failure while retaining saved data', () => {
    const local = storage();
    const good = new SaveSystem(
        () => local,
        () => now
    );
    good.save(snapshot(2));
    const before = local.getItem(SAVE_STORAGE_KEY);
    const blocked = new SaveSystem(() => {
        throw new Error('SecurityError');
    });
    assert.equal(blocked.load().status, 'unavailable');
    assert.equal(blocked.save(snapshot()).status, 'unavailable');
    assert.equal(blocked.clear(), false);

    const failing = new SaveSystem(() => ({
        getItem: () => {
            throw new Error('read failed');
        },
        setItem: () => {
            throw new Error('QuotaExceededError');
        },
        removeItem: () => {
            throw new Error('delete failed');
        }
    }));
    assert.equal(failing.load().status, 'unavailable');
    assert.equal(failing.save(snapshot()).status, 'unavailable');
    assert.equal(failing.clear(), false);
    assert.equal(local.getItem(SAVE_STORAGE_KEY), before);
    assert.equal(good.load().status, 'ready');
});

test('every load reads current storage rather than reusing an earlier menu snapshot', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    saves.save(snapshot(1));
    assert.equal(saves.load().status, 'ready');
    local.setItem(SAVE_STORAGE_KEY, JSON.stringify(envelope(snapshot(3))));
    assert.equal(saves.load().save.state.quest.completedObjectiveIds.length, 3);
    local.setItem(SAVE_STORAGE_KEY, '{broken');
    assert.equal(saves.load().status, 'invalid');
    local.removeItem(SAVE_STORAGE_KEY);
    assert.equal(saves.load().status, 'missing');
});

test('legacy version-1 saves migrate in memory and keep existing storage until an explicit save', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    const legacy = snapshot(3);
    delete legacy.opening;
    const raw = JSON.stringify({ version: 1, savedAt: now, state: legacy });
    local.setItem(SAVE_STORAGE_KEY, raw);
    const result = saves.load();
    assert.equal(result.status, 'ready');
    assert.deepEqual(result.save, envelope(snapshot(3)));
    assert.equal(local.getItem(SAVE_STORAGE_KEY), raw);
    saves.save(result.save.state);
    assert.equal(JSON.parse(local.getItem(SAVE_STORAGE_KEY)).version, 2);
    assert.equal(validateSaveState(envelope(legacy)).status, 'invalid');
});

const withOpening = (count, base = snapshot()) => ({
    ...base,
    playerPosition: [...OPENING_SPAWN],
    inventory: { itemIds: [...base.inventory.itemIds, ...(count >= 2 ? [STARTER_BAG.id] : [])] },
    opening: {
        questId: OPENING_QUEST.id,
        completedObjectiveIds: OPENING_QUEST.objectives.slice(0, count).map(({ id }) => id)
    }
});

test('each story stage round-trips independently of foundation progress with its protected bag', () => {
    const local = storage();
    const saves = new SaveSystem(
        () => local,
        () => now
    );
    for (let count = 0; count <= 3; count++) {
        for (let foundation = 0; foundation <= 3; foundation++) {
            const state = withOpening(count, snapshot(foundation));
            assert.equal(saves.save(state).status, 'ready');
            const result = saves.load();
            assert.deepEqual(result.save.state, state);
            const story = new QuestSystem(OPENING_QUEST);
            const inventory = new InventorySystem([SIGNAL_BOX_NOTE, STARTER_BAG]);
            assert.equal(story.restore(result.save.state.opening), true);
            assert.equal(inventory.restore(result.save.state.inventory), true);
            assert.equal(story.state.completedCount, count);
            assert.equal(
                inventory.state.items.some((item) => item.kind === 'quest'),
                count >= 2
            );
        }
    }
    const result = saves.load();
    result.save.state.opening.completedObjectiveIds.length = 0;
    assert.equal(saves.load().save.state.opening.completedObjectiveIds.length, 3);
});

test('story checkpoints reject missing, skipped, duplicate, forged and inconsistent progression', () => {
    const state = withOpening(2);
    for (const invalid of [
        { ...state, opening: null },
        { ...state, opening: { ...state.opening, questId: 'unknown' } },
        { ...state, opening: { ...state.opening, completedObjectiveIds: ['collect-belongings'] } },
        { ...state, opening: { ...state.opening, completedObjectiveIds: ['watch-opening', 'watch-opening'] } },
        { ...state, inventory: { itemIds: [] } },
        { ...withOpening(1), inventory: { itemIds: [STARTER_BAG.id] } },
        { ...snapshot(), inventory: { itemIds: [STARTER_BAG.id] } }
    ]) {
        assert.equal(validateSaveState(envelope(invalid)).status, 'invalid');
    }
});

test('café furniture and overhead fixtures reject penetration before and after the intro', () => {
    for (const box of OPENING_SOLIDS) {
        const position = [box.position[0], Math.max(1, box.position[1] - 0.2), box.position[2]];
        assert.equal(isFoundationSnapshot({ ...snapshot(), playerPosition: position }), false, box.name);
        assert.equal(isFoundationSnapshot({ ...withOpening(1), playerPosition: position }), false, box.name);
    }
});

test('furnished checkpoints allow clear aisles and table tops but reject blocked overhead clearance', () => {
    for (const position of [
        OPENING_SPAWN,
        [6.25, 1.014, 1.8],
        [6.25, 1.014, 4.05],
        [8.1, 1.014, 4.05],
        [7.7, 1.794, 0]
    ]) {
        assert.equal(
            isFoundationSnapshot({ ...withOpening(1), playerPosition: position }),
            true,
            JSON.stringify(position)
        );
    }
    assert.equal(isFoundationSnapshot({ ...withOpening(1), playerPosition: [8.96, 2.834, -4.31] }), false);
});
