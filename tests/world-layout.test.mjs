import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import { isBeachArrivalPosition, isFoundationPosition, isV4FoundationPosition } from '../src/scenes/FoundationState.ts';
import { SAVE_VERSION, SaveSystem, validateSaveState } from '../src/systems/SaveSystem.ts';

const quest = (definition, count = definition.objectives.length) => ({
    questId: definition.id,
    completedObjectiveIds: definition.objectives.slice(0, count).map(({ id }) => id)
});
const state = (area, playerPosition) => ({
    sceneId: 'foundation',
    area,
    playerPosition,
    quest: quest(SIGNAL_CHECK_QUEST, 0),
    opening: quest(OPENING_QUEST),
    entry: quest(ENTRY_QUEST, area === 'tideline' ? 4 : 8),
    beach: quest(BEACH_QUEST, area === 'tideline' ? 0 : 3),
    inventory: { itemIds: [STARTER_BAG.id, ...(area === 'tideline' ? [] : [BEACH_PASSES.id])] },
    wave: 'before-wave'
});

test('the former entrance and shoreline barriers are clear across continuous walkable approaches', () => {
    for (let z = -12; z >= -30; z -= 0.1) assert.equal(isFoundationPosition([82.75, 1.04, z]), true, `entrance ${z}`);
    for (let z = 3.6; z >= -34; z -= 0.1) assert.equal(isBeachArrivalPosition([0, 1.04, z]), true, `shore ${z}`);
    for (let x = -44; x <= 44; x += 0.1)
        assert.equal(isBeachArrivalPosition([x, 1.04, -30]), true, `expanded shore ${x}`);
    assert.equal(isBeachArrivalPosition([-15.7, 1.04, -30]), true);
    assert.equal(isBeachArrivalPosition([15.7, 1.04, -30]), true);
    assert.equal(isBeachArrivalPosition([0, 1.04, -36]), false);
});

test('current checkpoints retain the expanded city, both beach wings and the open shallows', () => {
    for (const [area, points] of [
        [
            'tideline',
            [
                [-136, 1.04, 7.25],
                [148, 1.04, 19.3],
                [-116, 1.04, 53.3],
                [130, 1.04, 54.35]
            ]
        ],
        [
            'beach-arrival',
            [
                [-44, 1.04, -30],
                [44, 1.04, -30],
                [0, 1.04, -34]
            ]
        ]
    ]) {
        for (const point of points) {
            const current = state(area, point);
            const loaded = validateSaveState({ version: SAVE_VERSION, savedAt: 1, state: current });
            assert.equal(loaded.status, 'ready');
            assert.deepEqual(loaded.save.state, current);
            assert.equal(validateSaveState({ version: 4, savedAt: 1, state: current }).status, 'invalid');
        }
    }
});

test('old city saves displaced by new blocks migrate to a clear approach without changing progress or storage', () => {
    for (const point of [
        [-70, 1.04, 0],
        [-88, 1.04, 27.6],
        [86, 1.04, 62.6]
    ]) {
        assert.equal(isV4FoundationPosition(point), true);
        assert.equal(isFoundationPosition(point), false);
        const old = state('tideline', point);
        delete old.wave;
        const raw = JSON.stringify({ version: 4, savedAt: 42, state: old });
        const saves = new SaveSystem(() => ({
            getItem: () => raw,
            setItem: () => assert.fail('Migration wrote storage'),
            removeItem: () => assert.fail('Migration deleted storage')
        }));
        const loaded = saves.load();
        assert.equal(loaded.status, 'ready');
        assert.deepEqual(loaded.save.state, { ...old, playerPosition: [70.5, 1.04, 6.4], wave: 'before-wave' });
        assert.equal(loaded.save.savedAt, 42);
    }
    for (const [area, point] of [
        ['tideline', [0, 1.1, 0]],
        ['beach-arrival', [15.7, 1.04, 0]]
    ])
        assert.equal(validateSaveState({ version: 4, savedAt: 1, state: state(area, point) }).status, 'invalid');
});
