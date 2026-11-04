import type { QuestDefinition } from '../systems/QuestSystem';

export const SIGNAL_CHECK_QUEST = {
    id: 'foundation-signal-check',
    title: 'Signal check',
    objectives: [
        {
            id: 'speak-to-guide',
            text: 'Talk to the purple guide and offer to check the signal box.',
            event: { type: 'dialogue-choice', dialogueId: 'foundation-guide', nodeId: 'signal', choiceId: 'accept' }
        },
        {
            id: 'check-signal-box',
            text: 'Check the amber signal box.',
            event: { type: 'interaction', targetId: 'signal-box' }
        },
        {
            id: 'report-back',
            text: 'Return to the guide and report what you found.',
            event: { type: 'dialogue-choice', dialogueId: 'foundation-guide', nodeId: 'greeting', choiceId: 'report' }
        }
    ],
    completionMessage: 'You checked the signal box and reported back to the guide.'
} satisfies QuestDefinition;
