import assert from 'node:assert/strict';
import { test } from 'node:test';

import { selectGuideDialogue } from '../src/data/dialogues.ts';
import { SIGNAL_BOX } from '../src/data/foundation.ts';
import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { DialogueSystem } from '../src/systems/DialogueSystem.ts';
import { QuestSystem } from '../src/systems/QuestSystem.ts';

const [accept, inspect, report] = SIGNAL_CHECK_QUEST.objectives.map((objective) => objective.event);

test('quest snapshots restore each ordered stage and resume from its next event', () => {
    const ids = SIGNAL_CHECK_QUEST.objectives.map(({ id }) => id);
    for (let count = 0; count <= ids.length; count++) {
        const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
        const snapshots = [];
        quest.onStateChange = (state) => snapshots.push(state.completedCount);
        const snapshot = { questId: SIGNAL_CHECK_QUEST.id, completedObjectiveIds: ids.slice(0, count) };

        assert.equal(quest.restore(snapshot), true);
        assert.deepEqual(quest.snapshot, snapshot);
        assert.equal(quest.state.completedCount, count);
        assert.equal(quest.restore(snapshot), true);
        assert.deepEqual(snapshots, count === 0 ? [] : [count]);
        if (count < ids.length) {
            assert.equal(quest.handle(SIGNAL_CHECK_QUEST.objectives[count].event), true);
            assert.equal(quest.state.completedCount, count + 1);
        } else {
            assert.equal(quest.handle(report), false);
            assert.equal(quest.state.status, 'completed');
        }
    }
});

test('invalid quest restoration is atomic and destroyed quests cannot be restored', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    quest.handle(accept);
    const before = quest.snapshot;
    let changes = 0;
    quest.onStateChange = () => changes++;
    const invalid = [
        null,
        {},
        { ...before, questId: 'unknown' },
        { ...before, completedObjectiveIds: 'speak-to-guide' },
        { ...before, completedObjectiveIds: ['check-signal-box'] },
        { ...before, completedObjectiveIds: ['speak-to-guide', 'speak-to-guide'] },
        { ...before, completedObjectiveIds: ['speak-to-guide', 'check-signal-box', 'report-back', 'unknown'] },
        { ...before, completedObjectiveIds: new Array(1) }
    ];
    for (const snapshot of invalid) {
        assert.equal(quest.restore(snapshot), false);
        assert.deepEqual(quest.snapshot, before);
    }
    assert.equal(changes, 0);
    quest.destroy();
    assert.equal(quest.restore(before), false);
    assert.equal(changes, 0);
});

test('quest persistence is isolated from caller snapshots and later definition mutations', () => {
    const definition = structuredClone(SIGNAL_CHECK_QUEST);
    const quest = new QuestSystem(definition);
    const snapshot = { questId: definition.id, completedObjectiveIds: ['speak-to-guide'] };
    quest.restore(snapshot);
    snapshot.completedObjectiveIds.push('check-signal-box');
    quest.snapshot.completedObjectiveIds.push('report-back');
    definition.objectives[1].id = 'changed';
    definition.objectives[1].event.targetId = 'changed';

    assert.deepEqual(quest.snapshot.completedObjectiveIds, ['speak-to-guide']);
    assert.equal(quest.handle(inspect), true);
    assert.deepEqual(quest.snapshot.completedObjectiveIds, ['speak-to-guide', 'check-signal-box']);
});

test('a quest starts inactive with its authored first objective', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);

    assert.equal(quest.state.questId, 'foundation-signal-check');
    assert.equal(quest.state.title, 'Signal check');
    assert.equal(quest.state.status, 'inactive');
    assert.equal(quest.state.completedCount, 0);
    assert.equal(quest.state.totalCount, 3);
    assert.deepEqual(quest.state.objective, {
        id: 'speak-to-guide',
        text: SIGNAL_CHECK_QUEST.objectives[0].text
    });
});

test('out-of-order events are ignored rather than saved for later objectives', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const states = [];
    quest.onStateChange = (state) => states.push(state);

    assert.equal(quest.handle(inspect), false);
    assert.equal(quest.handle(report), false);
    assert.equal(states.length, 0);
    assert.equal(quest.handle(accept), true);
    assert.equal(quest.state.status, 'active');
    assert.equal(quest.state.objective.id, 'check-signal-box');
    assert.equal(quest.state.completedCount, 1);
    assert.equal(quest.handle(report), false);
    assert.equal(states.length, 1);
});

test('ordered objectives complete once and duplicate actions cannot skip or restart progress', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const states = [];
    quest.onStateChange = (state) => states.push([state.status, state.completedCount]);

    for (const event of [accept, inspect, report]) {
        assert.equal(quest.handle(event), true);
        assert.equal(quest.handle(event), false);
    }
    assert.deepEqual(states, [
        ['active', 1],
        ['active', 2],
        ['completed', 3]
    ]);
    assert.equal(quest.state.objective, null);
    assert.equal(quest.state.completionMessage, SIGNAL_CHECK_QUEST.completionMessage);
    for (const event of [accept, inspect, report]) assert.equal(quest.handle(event), false);
    assert.equal(states.length, 3);
});

test('dialogue, node, choice, event type, and target IDs must all match', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    for (const field of ['dialogueId', 'nodeId', 'choiceId']) {
        assert.equal(quest.handle({ ...accept, [field]: 'unrelated' }), false);
    }
    assert.equal(quest.handle({ type: 'interaction', targetId: accept.choiceId }), false);
    assert.equal(quest.handle(accept), true);
    assert.equal(quest.handle({ ...inspect, targetId: 'npc-guide' }), false);
    assert.equal(quest.state.completedCount, 1);
    assert.equal(quest.handle(inspect), true);
    assert.equal(quest.state.objective.id, 'report-back');
});

test('reset clears active and completed progress and publishes only a changed state', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const initial = quest.state;
    let notifications = 0;
    quest.onStateChange = () => notifications++;

    quest.reset();
    assert.equal(notifications, 0);
    quest.handle(accept);
    quest.reset();
    assert.deepEqual(quest.state, initial);
    quest.reset();
    assert.equal(notifications, 2);

    for (const event of [accept, inspect, report]) quest.handle(event);
    quest.reset();
    assert.deepEqual(quest.state, initial);
    assert.equal(notifications, 6);
    assert.equal(quest.handle(report), false);
    assert.equal(quest.handle(inspect), false);
});

test('instances and published objective snapshots do not share mutable progress', () => {
    const first = new QuestSystem(SIGNAL_CHECK_QUEST);
    const second = new QuestSystem(SIGNAL_CHECK_QUEST);
    const snapshot = first.state;
    snapshot.objective.text = 'Changed by a consumer';
    snapshot.objective.id = 'changed';
    snapshot.completedCount = 100;
    first.handle(accept);

    assert.equal(first.state.completedCount, 1);
    assert.equal(second.state.completedCount, 0);
    assert.equal(second.state.objective.id, 'speak-to-guide');
    assert.equal(second.state.objective.text, SIGNAL_CHECK_QUEST.objectives[0].text);
});

test('the same tracker runs a different authored event sequence', () => {
    const definition = {
        id: 'another-quest',
        title: 'Switch check',
        completionMessage: 'Switch confirmed.',
        objectives: [
            { id: 'switch', text: 'Use the switch.', event: { type: 'interaction', targetId: 'switch' } },
            {
                id: 'confirm',
                text: 'Tell the operator.',
                event: { type: 'dialogue-choice', dialogueId: 'operator', nodeId: 'check', choiceId: 'confirm' }
            }
        ]
    };
    const quest = new QuestSystem(definition);

    assert.equal(quest.state.totalCount, 2);
    assert.equal(quest.handle(definition.objectives[0].event), true);
    assert.equal(quest.state.status, 'active');
    assert.equal(quest.state.objective.id, 'confirm');
    assert.equal(quest.handle(definition.objectives[1].event), true);
    assert.equal(quest.state.status, 'completed');
    assert.equal(quest.state.completionMessage, 'Switch confirmed.');
});

test('invalid empty, duplicate-ID, and duplicate-event quest definitions are rejected', () => {
    const [first, second] = SIGNAL_CHECK_QUEST.objectives;
    const create = (objectives) => new QuestSystem({ ...SIGNAL_CHECK_QUEST, objectives });

    assert.throws(() => create([]), /at least one objective/);
    assert.throws(() => create([first, { ...second, id: first.id }]), /duplicate objective/);
    assert.throws(() => create([first, { ...second, event: first.event }]), /duplicate event/);
});

test('destroy clears progress and listeners and rejects events retained from an old scene', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    quest.handle(accept);
    let notifications = 0;
    quest.onStateChange = () => notifications++;
    const delayedAction = () => quest.handle(inspect);

    quest.destroy();
    assert.equal(quest.onStateChange, null);
    assert.equal(quest.state.status, 'inactive');
    assert.equal(delayedAction(), false);
    assert.equal(quest.handle(accept), false);
    quest.reset();
    quest.destroy();
    assert.equal(notifications, 0);
});

test('reading, declining, and cancelling the guide offer do not accept the quest', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (selection) => quest.handle({ type: 'dialogue-choice', ...selection });

    dialogue.open(selectGuideDialogue(quest.state));
    dialogue.choose('greeting', 'movement');
    dialogue.choose('movement', 'back');
    dialogue.choose('greeting', 'signal');
    dialogue.close();
    dialogue.open(selectGuideDialogue(quest.state));
    dialogue.choose('greeting', 'signal');
    dialogue.choose('signal', 'goodbye');

    assert.equal(dialogue.state, null);
    assert.equal(quest.state.status, 'inactive');
    assert.equal(quest.state.completedCount, 0);
});

test('authored guide choices and signal-box identity drive the complete quest and return dialogue', () => {
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const dialogue = new DialogueSystem();
    dialogue.onChoice = (selection) => quest.handle({ type: 'dialogue-choice', ...selection });
    const openGuide = () => dialogue.open(selectGuideDialogue(quest.state));

    openGuide();
    assert.equal(dialogue.choose('greeting', 'report'), false);
    dialogue.choose('greeting', 'signal');
    assert.equal(dialogue.choose('signal', 'accept'), true);
    assert.equal(dialogue.state.nodeId, 'accepted');
    assert.equal(quest.state.objective.id, 'check-signal-box');
    assert.equal(dialogue.choose('signal', 'accept'), false);
    dialogue.close();

    openGuide();
    assert.equal(dialogue.choose('greeting', 'report'), false);
    dialogue.choose('greeting', 'signal');
    assert.equal(dialogue.choose('signal', 'accept'), false);
    dialogue.close();

    assert.equal(quest.handle({ type: 'interaction', targetId: SIGNAL_BOX.name }), true);
    openGuide();
    assert.equal(quest.state.status, 'active');
    assert.equal(dialogue.choose('greeting', 'report'), true);
    assert.equal(dialogue.state.nodeId, 'thanks');
    assert.equal(quest.state.status, 'completed');
    assert.equal(dialogue.choose('greeting', 'report'), false);
    dialogue.close();

    openGuide();
    assert.match(dialogue.state.text, /task is complete/);
    assert.equal(dialogue.choose('greeting', 'report'), false);
    dialogue.choose('greeting', 'movement');
    assert.equal(dialogue.choose('movement', 'back'), true);
    dialogue.close();

    quest.reset();
    openGuide();
    dialogue.choose('greeting', 'signal');
    assert.equal(dialogue.choose('signal', 'accept'), true);
    assert.equal(quest.state.completedCount, 1);
});
