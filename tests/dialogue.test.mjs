import assert from 'node:assert/strict';
import { test } from 'node:test';

import { GUIDE_DIALOGUE } from '../src/data/dialogues.ts';
import { DialogueSystem } from '../src/systems/DialogueSystem.ts';

test('a conversation opens once and cannot be replaced while active', () => {
    const dialogue = new DialogueSystem();
    const states = [];
    dialogue.onStateChange = (state) => states.push(state);

    assert.equal(dialogue.state, null);
    assert.equal(dialogue.choose('greeting', 'movement'), false);
    assert.equal(dialogue.open(GUIDE_DIALOGUE), true);
    assert.equal(dialogue.state.speaker, 'Guide');
    assert.equal(dialogue.state.nodeId, 'greeting');
    assert.equal(dialogue.open({ ...GUIDE_DIALOGUE, id: 'another-guide' }), false);
    assert.equal(dialogue.state.dialogueId, 'foundation-guide');
    assert.equal(states.length, 1);
});

test('authored choices visit both branches and can return to the greeting', () => {
    const dialogue = new DialogueSystem();
    const visited = [];
    dialogue.onStateChange = (state) => visited.push(state?.nodeId);

    dialogue.open(GUIDE_DIALOGUE);
    assert.equal(dialogue.choose('greeting', 'movement'), true);
    assert.match(dialogue.state.text, /WASD/);
    assert.equal(dialogue.choose('movement', 'back'), true);
    assert.equal(dialogue.choose('greeting', 'signal'), true);
    assert.match(dialogue.state.text, /amber signal box/);
    assert.deepEqual(visited, ['greeting', 'movement', 'greeting', 'signal']);
});

test('unknown and stale choices cannot skip the current response', () => {
    const dialogue = new DialogueSystem();
    dialogue.open(GUIDE_DIALOGUE);
    dialogue.choose('greeting', 'movement');
    const state = dialogue.state;
    let notifications = 0;
    dialogue.onStateChange = () => notifications++;

    assert.equal(dialogue.choose('greeting', 'goodbye'), false);
    assert.equal(dialogue.choose('movement', 'missing'), false);
    assert.deepEqual(dialogue.state, state);
    assert.equal(notifications, 0);
});

test('ending and cancellation close once; reopening starts a fresh conversation', () => {
    const dialogue = new DialogueSystem();
    const states = [];
    dialogue.onStateChange = (state) => states.push(state);

    dialogue.open(GUIDE_DIALOGUE);
    dialogue.choose('greeting', 'signal');
    assert.equal(dialogue.choose('signal', 'goodbye'), true);
    assert.equal(dialogue.state, null);
    const count = states.length;
    dialogue.close();
    assert.equal(states.length, count);
    assert.equal(dialogue.open(GUIDE_DIALOGUE), true);
    assert.equal(dialogue.state.nodeId, 'greeting');
    dialogue.close();
    assert.equal(states.at(-1), null);
});

test('missing start nodes are rejected before publishing any active state', () => {
    const dialogue = new DialogueSystem();
    let notifications = 0;
    dialogue.onStateChange = () => notifications++;

    assert.throws(() => dialogue.open({ ...GUIDE_DIALOGUE, start: 'missing' }), /missing start node/);
    assert.equal(dialogue.state, null);
    assert.equal(notifications, 0);
});

test('broken links and duplicate choice IDs are rejected before opening', () => {
    const dialogue = new DialogueSystem();
    const invalid = (choices) => ({
        ...GUIDE_DIALOGUE,
        nodes: { greeting: { text: 'Test', choices } }
    });

    assert.throws(
        () => dialogue.open(invalid([{ id: 'next', label: 'Continue', next: 'missing' }])),
        /missing destination/
    );
    assert.throws(
        () =>
            dialogue.open(
                invalid([
                    { id: 'same', label: 'One', next: null },
                    { id: 'same', label: 'Two', next: null }
                ])
            ),
        /duplicate choice/
    );
    assert.equal(dialogue.state, null);
});

test('destroy closes an active conversation and releases its subscriber', () => {
    const dialogue = new DialogueSystem();
    const states = [];
    dialogue.onStateChange = (state) => states.push(state);
    dialogue.open(GUIDE_DIALOGUE);
    dialogue.destroy();

    assert.equal(dialogue.state, null);
    assert.equal(states.at(-1), null);
    assert.equal(dialogue.onStateChange, null);
    dialogue.destroy();
    assert.equal(states.length, 2);
});

test('only validated choices publish source IDs after transitioning, including endings', () => {
    const dialogue = new DialogueSystem();
    const selections = [];
    dialogue.onChoice = (selection) => selections.push({ ...selection, next: dialogue.state?.nodeId ?? null });

    dialogue.open(GUIDE_DIALOGUE);
    assert.equal(dialogue.choose('greeting', 'missing'), false);
    assert.equal(dialogue.choose('greeting', 'movement'), true);
    assert.equal(dialogue.choose('greeting', 'goodbye'), false);
    assert.equal(dialogue.choose('movement', 'goodbye'), true);
    assert.deepEqual(selections, [
        { dialogueId: 'foundation-guide', nodeId: 'greeting', choiceId: 'movement', next: 'movement' },
        { dialogueId: 'foundation-guide', nodeId: 'movement', choiceId: 'goodbye', next: null }
    ]);

    dialogue.open(GUIDE_DIALOGUE);
    dialogue.close();
    dialogue.open(GUIDE_DIALOGUE);
    dialogue.destroy();
    assert.equal(selections.length, 2);
    assert.equal(dialogue.onChoice, null);
});
