import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { BEACH_ARRIVAL_SPAWN } from '../src/episodes/episode-01/entryLayout.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import { WAVE_BLACKOUT, WAVE_WARNING } from '../src/episodes/episode-01/wave.ts';
import { EVACUATION_GATES, WAVE_PLAYER_MARK } from '../src/episodes/episode-01/waveLayout.ts';
import { WaveProgress, eyelidClosure } from '../src/episodes/episode-01/WaveProgress.ts';
import { isFoundationSnapshot } from '../src/scenes/FoundationState.ts';
import { CutsceneSystem } from '../src/systems/CutsceneSystem.ts';
import { SAVE_VERSION, SaveSystem, validateSaveState } from '../src/systems/SaveSystem.ts';

const quest = (definition, complete = true) => ({
    questId: definition.id,
    completedObjectiveIds: complete ? definition.objectives.map(({ id }) => id) : []
});
const beach = () => ({
    sceneId: 'foundation',
    area: 'beach-arrival',
    playerPosition: [...BEACH_ARRIVAL_SPAWN],
    quest: quest(SIGNAL_CHECK_QUEST, false),
    opening: quest(OPENING_QUEST),
    entry: quest(ENTRY_QUEST),
    beach: quest(BEACH_QUEST),
    inventory: { itemIds: [STARTER_BAG.id, BEACH_PASSES.id] },
    wave: 'before-wave'
});
const run = () => {
    const progress = new WaveProgress();
    progress.start(true);
    progress.finishCutscene(WAVE_WARNING.id);
    return progress;
};
const finishRoute = (progress) => EVACUATION_GATES.forEach(({ position }) => progress.update(0.1, position));
const tick = (progress, seconds) => {
    for (let i = 0; i < Math.ceil(seconds * 10); i++) progress.update(0.1, WAVE_PLAYER_MARK);
};

test('the warning requires every beach discovery and starts once; foreign completions grant nothing', () => {
    const progress = new WaveProgress();
    assert.equal(progress.start(false), false);
    assert.equal(progress.finishCutscene(WAVE_WARNING.id), false);
    assert.equal(progress.start(true), true);
    assert.equal(progress.start(true), false);
    assert.equal(progress.finishCutscene('e1-cafe-opening'), false);
    assert.equal(progress.finishCutscene(WAVE_BLACKOUT.id), false);
    assert.equal(progress.finishCutscene(WAVE_WARNING.id), true);
    assert.equal(progress.finishCutscene(WAVE_WARNING.id), false);
    assert.equal(progress.state.phase, 'evacuating');
    assert.equal(progress.checkpoint, 'before-wave');
});

test('reader-paced warning, stale input and skip all retain a playable evacuation', () => {
    for (const skip of [true, false]) {
        const progress = new WaveProgress();
        const cutscene = new CutsceneSystem();
        progress.start(true);
        cutscene.onFinished = (id) => progress.finishCutscene(id);
        cutscene.play(WAVE_WARNING);
        assert.equal(cutscene.advance(WAVE_WARNING.id, 'wave'), false);
        tick(progress, 90);
        assert.equal(progress.state.phase, 'warning');
        if (skip) cutscene.skip(WAVE_WARNING.id);
        else for (const beat of WAVE_WARNING.beats) cutscene.advance(WAVE_WARNING.id, beat.id);
        assert.equal(progress.state.phase, 'evacuating');
        assert.equal(progress.checkpoint, 'before-wave');
    }
});

test('only ordered inland route gates cause separation and the fall, with no chase timeout', () => {
    const progress = run();
    progress.update(0.1, EVACUATION_GATES[2].position);
    progress.update(0.1, EVACUATION_GATES[1].position);
    progress.update(0.1, [0, 100, 0]);
    progress.update(0.1, [NaN, 1, 0]);
    assert.equal(progress.state.gate, 0);
    tick(progress, 120);
    assert.equal(progress.state.phase, 'evacuating');
    progress.update(0.1, EVACUATION_GATES[0].position);
    progress.update(0.1, EVACUATION_GATES[0].position);
    assert.equal(progress.state.gate, 1);
    progress.update(0.1, EVACUATION_GATES[1].position);
    assert.equal(progress.state.phase, 'separated');
    progress.update(0.1, EVACUATION_GATES[2].position);
    assert.equal(progress.state.phase, 'falling');
    assert.equal(progress.running, false);
    assert.equal(progress.checkpoint, 'before-wave');
});

test('fall, blinking and black loading use bounded game time and pause without completing', () => {
    const progress = run();
    finishRoute(progress);
    const stopped = progress.state;
    for (const dt of [0, -1, Infinity, NaN]) progress.update(dt, WAVE_PLAYER_MARK);
    assert.deepEqual(progress.state, stopped);
    progress.update(60, WAVE_PLAYER_MARK);
    assert.equal(progress.state.elapsed, 0.1);
    tick(progress, 2.4);
    assert.equal(progress.state.phase, 'blinking');
    tick(progress, 6.5);
    assert.equal(progress.state.phase, 'loading');
    assert.equal(progress.checkpoint, 'after-blackout');
    tick(progress, 1.3);
    assert.equal(progress.state.phase, 'complete');
    const complete = progress.state;
    tick(progress, 10);
    assert.deepEqual(progress.state, complete);
});

test('skipping the fall reaches black loading once; cancellation and destroyed callbacks never advance', () => {
    const progress = run();
    const cutscene = new CutsceneSystem();
    cutscene.onFinished = (id) => progress.finishCutscene(id);
    finishRoute(progress);
    cutscene.play(WAVE_BLACKOUT);
    cutscene.cancel();
    assert.equal(progress.checkpoint, 'before-wave');
    cutscene.play(WAVE_BLACKOUT);
    cutscene.skip(WAVE_BLACKOUT.id);
    assert.equal(progress.state.phase, 'loading');
    assert.equal(progress.finishCutscene(WAVE_BLACKOUT.id), false);
    const snapshot = progress.state;
    progress.destroy();
    tick(progress, 30);
    assert.equal(progress.start(true), false);
    assert.equal(progress.beginBlink(), false);
    assert.deepEqual(progress.state, snapshot);
});

test('eyelids close and reopen slowly, while steady mode is monotonic and both end fully black', () => {
    assert.ok(eyelidClosure(1.2, false) > eyelidClosure(2.1, false));
    assert.ok(eyelidClosure(3.4, false) > eyelidClosure(4.2, false));
    let previous = 0;
    for (let t = 0; t <= 7; t += 0.025) {
        for (const steady of [false, true]) assert.ok(eyelidClosure(t, steady) >= 0 && eyelidClosure(t, steady) <= 1);
        const next = eyelidClosure(t, true);
        assert.ok(next >= previous);
        previous = next;
    }
    assert.equal(eyelidClosure(6.4, true), 1);
    assert.equal(eyelidClosure(6.4, false), 1);
});

test('v5 saves only safe pre-event or post-blackout boundaries with complete admission and discoveries', () => {
    const state = beach();
    assert.equal(isFoundationSnapshot(state), true);
    assert.equal(isFoundationSnapshot({ ...state, wave: 'after-blackout' }), true);
    for (const wave of [undefined, null, 'warning', 'evacuating', 'blinking', 'complete', {}])
        assert.equal(isFoundationSnapshot({ ...state, wave }), false);
    assert.equal(isFoundationSnapshot({ ...state, wave: 'after-blackout', beach: quest(BEACH_QUEST, false) }), false);
    assert.equal(isFoundationSnapshot({ ...state, wave: 'after-blackout', inventory: { itemIds: [] } }), false);
    assert.equal(isFoundationSnapshot({ ...state, wave: 'after-blackout', playerPosition: [0, 4, 24] }), false);
    assert.equal(new WaveProgress('after-blackout').state.phase, 'complete');
    assert.throws(() => new WaveProgress('evacuating'), /Invalid/);
});

test('v4 migration preserves every discovery subset, inventory and exact stored bytes', () => {
    for (let mask = 0; mask < 8; mask++) {
        const state = beach();
        state.beach.completedObjectiveIds = BEACH_QUEST.objectives
            .filter((_, i) => mask & (1 << i))
            .map(({ id }) => id);
        delete state.wave;
        const raw = JSON.stringify({ version: 4, savedAt: 1, state });
        const saves = new SaveSystem(() => ({
            getItem: () => raw,
            setItem: () => assert.fail('migration wrote storage')
        }));
        const loaded = saves.load();
        assert.equal(loaded.status, 'ready');
        assert.equal(loaded.save.version, SAVE_VERSION);
        assert.deepEqual(loaded.save.state, { ...state, wave: 'before-wave' });
    }
    const invalid = { ...beach(), beach: null };
    assert.equal(validateSaveState({ version: 4, savedAt: 1, state: invalid }).status, 'invalid');
});

test('post-blackout storage failures preserve the previous manual checkpoint and allow retry', () => {
    let raw = null;
    let blocked = false;
    const saves = new SaveSystem(() => ({
        getItem: () => raw,
        setItem: (_, value) => {
            if (blocked) throw new Error('quota');
            raw = value;
        }
    }));
    saves.save(beach());
    const before = raw;
    blocked = true;
    assert.equal(saves.save({ ...beach(), wave: 'after-blackout' }).status, 'unavailable');
    assert.equal(raw, before);
    blocked = false;
    assert.equal(saves.save({ ...beach(), wave: 'after-blackout' }).status, 'ready');
    assert.equal(saves.load().save.state.wave, 'after-blackout');
});
