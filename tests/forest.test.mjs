import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { FOREST_SPEECH } from '../src/entry/forestDialogue.ts';
import { FOREST_EYE_ANCHORS, FOREST_SCARE_START, forestBatFlight } from '../src/entry/forestScare.ts';
import {
    FOREST_DURATION,
    FOREST_SEEN_KEY,
    ForestTimeline,
    hasSeenForest,
    rememberForest
} from '../src/entry/ForestTimeline.ts';

test('Forest timeline crosses the six authored beats and completes at 44 seconds', () => {
    const timeline = new ForestTimeline();
    assert.equal(timeline.state.phase, 'darkness');
    for (const [seconds, phase] of [
        [4, 'figures'],
        [14.6, 'eyes'],
        [5.4, 'bats'],
        [8, 'reveal'],
        [6, 'board'],
        [6, 'ready']
    ]) {
        timeline.update(seconds);
        assert.equal(timeline.state.phase, phase);
    }
    assert.deepEqual(timeline.state, { time: 44, phase: 'ready', ready: true, caption: '', board: 1 });
    timeline.update(100);
    assert.equal(timeline.state.time, FOREST_DURATION);
});

test('Skip from every phase reaches the same final state as completion and replay starts cleanly', () => {
    const complete = new ForestTimeline(true).state;
    for (const time of [0, 4, 12, 17.4, 24, 32, 35]) {
        const timeline = new ForestTimeline();
        timeline.update(time);
        timeline.skip();
        assert.deepEqual(timeline.state, complete);
        timeline.replay();
        assert.equal(timeline.state.time, 0);
        assert.equal(timeline.state.caption, '');
    }
});

test('Pause, invalid deltas and retained callbacks after cleanup cannot advance the sequence', () => {
    const timeline = new ForestTimeline();
    timeline.update(12);
    const snapshot = timeline.state;
    for (const dt of [0, -1, NaN, Infinity]) timeline.update(dt);
    assert.deepEqual(timeline.state, snapshot);
    timeline.destroy();
    timeline.skip();
    timeline.replay();
    timeline.update(20);
    assert.deepEqual(timeline.state, snapshot);
});

test('Seen preference stays separate from manual checkpoints and storage denial is recoverable', () => {
    const values = new Map([['last-wave.checkpoint', 'existing checkpoint bytes']]);
    const storage = () => ({
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value)
    });
    assert.equal(hasSeenForest(storage), false);
    rememberForest(storage);
    assert.equal(values.get(FOREST_SEEN_KEY), 'seen');
    assert.equal(hasSeenForest(storage), true);
    assert.equal(values.get('last-wave.checkpoint'), 'existing checkpoint bytes');
    const denied = () => {
        throw new Error('SecurityError');
    };
    assert.equal(hasSeenForest(denied), false);
    assert.doesNotThrow(() => rememberForest(denied));
});

test('Media clock seeks select the matching caption without advancing disposed timelines', () => {
    const timeline = new ForestTimeline();
    for (const cue of FOREST_SPEECH) {
        timeline.seek((cue.start + cue.end) / 2);
        assert.equal(timeline.state.caption, cue.text);
    }
    timeline.seek(100);
    assert.equal(timeline.state.ready, true);
    timeline.replay();
    timeline.seek(NaN);
    assert.equal(timeline.state.time, 0);
    timeline.destroy();
    timeline.seek(20);
    assert.equal(timeline.state.time, 0);
});

test('Deployed intro matches the verified soundtrack and complete authored cue timings', () => {
    const metadata = JSON.parse(readFileSync(new URL('./fixtures/forest-audio.json', import.meta.url), 'utf8'));
    const deployed = readFileSync(new URL('../public/assets/forest/forest-story.mp3', import.meta.url));
    assert.equal(createHash('sha256').update(deployed).digest('hex'), metadata.sha256);
    assert.equal(deployed.length, metadata.bytes);
    assert.equal(metadata.duration, FOREST_DURATION);
    assert.deepEqual(metadata.cues, FOREST_SPEECH);
    let previous = 0;
    for (const cue of FOREST_SPEECH) {
        assert.ok(cue.start >= previous, 'Spoken lines overlap');
        assert.ok(cue.end > cue.start && cue.end <= FOREST_DURATION);
        previous = cue.end;
    }
});

test('Every bat bursts from a physical watcher position and takes a spatially varied flight path', () => {
    const exits = [];
    for (let i = 0; i < 20; i++) {
        const launch = FOREST_SCARE_START + i * 0.035;
        const first = forestBatFlight(i, launch);
        const source = FOREST_EYE_ANCHORS[i % FOREST_EYE_ANCHORS.length];
        for (let axis = 0; axis < 3; axis++) assert.ok(Math.abs(first.position[axis] - source[axis]) < 1e-5);
        assert.equal(forestBatFlight(i, launch - 0.1).visible, false);
        const moving = forestBatFlight(i, launch + 2.5);
        assert.ok(Math.hypot(...moving.position.map((v, axis) => v - source[axis])) > 2);
        exits.push(moving.position);
    }
    assert.ok(
        exits.some((p) => p[2] > 8),
        'No close camera pass'
    );
    assert.ok(
        exits.some((p) => p[2] < -3),
        'No deeper forest flight'
    );
    assert.ok(Math.max(...exits.map((p) => p[0])) - Math.min(...exits.map((p) => p[0])) > 10);
});

test('Verified soundtrack metadata shares the visual scare cue and explicit distinct voice assignments', () => {
    const metadata = JSON.parse(readFileSync(new URL('./fixtures/forest-audio.json', import.meta.url), 'utf8'));
    assert.equal(metadata.scare.start, FOREST_SCARE_START);
    assert.equal(metadata.voices.find((v) => v.role === 'Man').voice, 'am_michael');
    assert.equal(metadata.voices.find((v) => v.role === 'Woman').voice, 'af_bella');
    assert.ok(metadata.scare.duration > 0);
    assert.notEqual(metadata.voices[0].voice, metadata.voices[1].voice);
});
