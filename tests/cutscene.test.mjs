import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
    OPENING_CUTSCENE,
    OPENING_QUEST,
    TV_DIALOGUE,
    ATTENDANT_DIALOGUE
} from '../src/episodes/episode-01/opening.ts';
import { WAVE_BLACKOUT, WAVE_WARNING } from '../src/episodes/episode-01/wave.ts';
import { CutsceneSystem } from '../src/systems/CutsceneSystem.ts';
import { DialogueSystem } from '../src/systems/DialogueSystem.ts';
import { QuestSystem } from '../src/systems/QuestSystem.ts';

test('the authored opening preserves speakers and only completes after the final line', () => {
    const cutscene = new CutsceneSystem();
    const finished = [];
    cutscene.onFinished = (...event) => finished.push(event);
    assert.equal(cutscene.play(OPENING_CUTSCENE), true);
    for (const beat of OPENING_CUTSCENE.beats) {
        assert.equal(finished.length, 0);
        assert.deepEqual(cutscene.state.beat, beat);
        assert.equal(cutscene.advance(OPENING_CUTSCENE.id, beat.id), true);
    }
    assert.equal(cutscene.state, null);
    assert.deepEqual(finished, [[OPENING_CUTSCENE.id, false]]);
    assert.equal(cutscene.skip(OPENING_CUTSCENE.id), false);
});

test('wave cinematics preserve automatic playback through every beat and restore manual opening playback', () => {
    const cutscene = new CutsceneSystem();
    for (const definition of [WAVE_WARNING, WAVE_BLACKOUT]) {
        cutscene.play(definition);
        for (const beat of definition.beats) {
            assert.equal(cutscene.state.automatic, true);
            cutscene.state.automatic = false;
            assert.equal(cutscene.state.automatic, true);
            assert.equal(cutscene.advance(definition.id, beat.id), true);
        }
        assert.equal(cutscene.state, null);
    }
    cutscene.play(OPENING_CUTSCENE);
    assert.notEqual(cutscene.state.automatic, true);
});

test('stale beat IDs, another sequence and concurrent playback cannot skip dialogue', () => {
    const cutscene = new CutsceneSystem();
    cutscene.play(OPENING_CUTSCENE);
    assert.equal(cutscene.play(OPENING_CUTSCENE), false);
    assert.equal(cutscene.advance('wrong-sequence', 'broadcast'), false);
    assert.equal(cutscene.skip('wrong-sequence'), false);
    assert.equal(cutscene.advance(OPENING_CUTSCENE.id, 'lets-go'), false);
    assert.equal(cutscene.advance(OPENING_CUTSCENE.id, 'broadcast'), true);
    assert.equal(cutscene.advance(OPENING_CUTSCENE.id, 'broadcast'), false);
    assert.equal(cutscene.state.beat.id, 'tired-fan');
});

test('skip preserves the belongings and exit prerequisites and replay cannot advance them', () => {
    const cutscene = new CutsceneSystem();
    const quest = new QuestSystem(OPENING_QUEST);
    cutscene.onFinished = (cutsceneId) => quest.handle({ type: 'cutscene-complete', cutsceneId });
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-exit' }), false);
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-belongings' }), false);
    assert.equal(quest.handle({ type: 'cutscene-complete', cutsceneId: 'other-opening' }), false);
    cutscene.play(OPENING_CUTSCENE);
    cutscene.skip(OPENING_CUTSCENE.id);
    assert.equal(quest.state.objective.id, 'collect-belongings');
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-exit' }), false);
    cutscene.play(OPENING_CUTSCENE);
    cutscene.skip(OPENING_CUTSCENE.id);
    assert.equal(quest.state.completedCount, 1);
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-belongings' }), true);
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-belongings' }), false);
    assert.equal(quest.handle({ type: 'interaction', targetId: 'cafe-exit' }), true);
    assert.equal(quest.state.status, 'completed');
    cutscene.play(OPENING_CUTSCENE);
    cutscene.skip(OPENING_CUTSCENE.id);
    assert.equal(quest.state.completedCount, 3);
});

test('cancelling a sequence does not complete it and destruction rejects retained actions', () => {
    const cutscene = new CutsceneSystem();
    let finished = 0;
    let changes = 0;
    cutscene.onFinished = () => finished++;
    cutscene.onStateChange = () => changes++;
    cutscene.play(OPENING_CUTSCENE);
    cutscene.cancel();
    cutscene.cancel();
    assert.equal(finished, 0);
    assert.equal(changes, 2);
    assert.equal(cutscene.play(OPENING_CUTSCENE), true);
    cutscene.destroy();
    assert.equal(cutscene.play(OPENING_CUTSCENE), false);
    assert.equal(cutscene.advance(OPENING_CUTSCENE.id, 'broadcast'), false);
    assert.equal(cutscene.skip(OPENING_CUTSCENE.id), false);
    assert.equal(cutscene.state, null);
    assert.equal(finished, 0);
    assert.equal(changes, 3);
});

test('cutscene definitions and projections cannot mutate the running sequence', () => {
    const definition = structuredClone(OPENING_CUTSCENE);
    const cutscene = new CutsceneSystem();
    cutscene.play(definition);
    definition.beats[0].text = 'changed';
    definition.beats.length = 0;
    cutscene.state.beat.text = 'changed again';
    assert.equal(cutscene.state.beat.text, OPENING_CUTSCENE.beats[0].text);
    assert.equal(cutscene.state.totalCount, 5);
});

test('invalid authoring is rejected before a sequence becomes active', () => {
    const cutscene = new CutsceneSystem();
    for (const definition of [
        { ...OPENING_CUTSCENE, id: '' },
        { ...OPENING_CUTSCENE, beats: [] },
        { ...OPENING_CUTSCENE, beats: [OPENING_CUTSCENE.beats[0], OPENING_CUTSCENE.beats[0]] },
        { ...OPENING_CUTSCENE, beats: [{ ...OPENING_CUTSCENE.beats[0], text: ' ' }] }
    ]) {
        assert.throws(() => cutscene.play(definition));
        assert.equal(cutscene.state, null);
    }
});

test('TV and attendant conversations are valid and never gate or advance the story quest', () => {
    const quest = new QuestSystem(OPENING_QUEST);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (selection) => quest.handle({ type: 'dialogue-choice', ...selection });
    quest.handle({ type: 'cutscene-complete', cutsceneId: OPENING_CUTSCENE.id });
    dialogue.open(TV_DIALOGUE);
    dialogue.choose('broadcast', 'close');
    dialogue.open(ATTENDANT_DIALOGUE);
    dialogue.choose('greeting', 'news');
    dialogue.choose('news', 'goodbye');
    assert.equal(dialogue.state, null);
    assert.equal(quest.state.completedCount, 1);
});
