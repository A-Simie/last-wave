import type { DialogueDefinition } from '../systems/DialogueSystem';
import type { QuestState } from '../systems/QuestSystem';

export const GUIDE_DIALOGUE = {
    id: 'foundation-guide',
    speaker: 'Guide',
    start: 'greeting',
    nodes: {
        greeting: {
            text: 'Welcome to the test area. What would you like to try?',
            choices: [
                { id: 'movement', label: 'How do I move around?', next: 'movement' },
                { id: 'signal', label: 'What should I investigate?', next: 'signal' },
                { id: 'goodbye', label: 'I will explore on my own.', next: null }
            ]
        },
        movement: {
            text: 'Use WASD to walk, Shift to sprint, and Space to jump. Move the mouse to look around.\n\nOn touch screens, drag on the left to move and on the right to look. Drag farther to sprint; double-tap on the right to jump.',
            choices: [
                { id: 'back', label: 'I have another question.', next: 'greeting' },
                { id: 'goodbye', label: 'Thanks. I am ready to explore.', next: null }
            ]
        },
        signal: {
            text: 'Could you check the amber signal box in front of me? Get close with a clear view, then press E or tap the interaction button. Come back and tell me once you have checked it.',
            choices: [
                { id: 'accept', label: 'I will check the signal box.', next: 'accepted' },
                { id: 'back', label: 'I have another question.', next: 'greeting' },
                { id: 'goodbye', label: 'Maybe later.', next: null }
            ]
        },
        accepted: {
            text: 'Thank you. Check the amber signal box, then return here to report what you found. Your quest tracker will show the next objective.',
            choices: [{ id: 'goodbye', label: 'On my way.', next: null }]
        }
    }
} satisfies DialogueDefinition;

const GUIDE_REMINDER_DIALOGUE = {
    ...GUIDE_DIALOGUE,
    nodes: {
        greeting: {
            ...GUIDE_DIALOGUE.nodes.greeting,
            text: 'The signal box still needs a check. I will be here when you are ready to report back.'
        },
        movement: GUIDE_DIALOGUE.nodes.movement,
        signal: {
            text: 'Look for the amber signal box in front of me. Get close with a clear view and press E or tap the interaction button. Then return to me.',
            choices: [
                { id: 'back', label: 'I have another question.', next: 'greeting' },
                { id: 'goodbye', label: 'I will go and check it.', next: null }
            ]
        }
    }
} satisfies DialogueDefinition;

const GUIDE_REPORT_DIALOGUE = {
    ...GUIDE_DIALOGUE,
    nodes: {
        greeting: {
            text: 'You are back. What did you find at the signal box?',
            choices: [
                { id: 'report', label: 'I checked the signal box.', next: 'thanks' },
                { id: 'movement', label: 'Remind me how to move around.', next: 'movement' },
                { id: 'goodbye', label: 'I will report back in a moment.', next: null }
            ]
        },
        movement: GUIDE_DIALOGUE.nodes.movement,
        thanks: {
            text: 'Good work. You checked the signal box and reported back. The signal check is complete. You can keep exploring the test area.',
            choices: [{ id: 'goodbye', label: 'Thanks. I will keep exploring.', next: null }]
        }
    }
} satisfies DialogueDefinition;

const GUIDE_COMPLETED_DIALOGUE = {
    ...GUIDE_DIALOGUE,
    nodes: {
        greeting: {
            text: 'Thanks again for checking the signal box. That task is complete. Feel free to keep exploring.',
            choices: [
                { id: 'movement', label: 'Remind me how to move around.', next: 'movement' },
                { id: 'goodbye', label: 'See you around.', next: null }
            ]
        },
        movement: GUIDE_DIALOGUE.nodes.movement
    }
} satisfies DialogueDefinition;

export const selectGuideDialogue = (quest: QuestState): DialogueDefinition => {
    if (quest.status === 'inactive') return GUIDE_DIALOGUE;
    if (quest.status === 'completed') return GUIDE_COMPLETED_DIALOGUE;
    return quest.objective.id === 'report-back' ? GUIDE_REPORT_DIALOGUE : GUIDE_REMINDER_DIALOGUE;
};
