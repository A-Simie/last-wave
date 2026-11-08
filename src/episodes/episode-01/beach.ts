import type { DialogueDefinition } from '../../systems/DialogueSystem.ts';
import type { QuestDefinition } from '../../systems/QuestSystem.ts';

export const BEACH_FRIEND_DIALOGUE: DialogueDefinition = {
    id: 'e1-beach-friend',
    speaker: 'Friend',
    start: 'greeting',
    nodes: {
        greeting: {
            text: 'See? I told you we needed to come out.\n\nNo rush. What would make this a good afternoon for you?',
            choices: [
                { id: 'quiet', label: 'Some quiet by the water.', next: 'quiet' },
                { id: 'company', label: 'Good company. And something cold.', next: 'company' },
                { id: 'later', label: 'Let’s look around first.', next: null }
            ]
        },
        quiet: {
            text: 'Then let’s make room for that. We can watch the swimmers from the end of the boardwalk. I’ll walk with you.',
            choices: [{ id: 'continue', label: 'That sounds good.', next: 'together' }]
        },
        company: {
            text: 'I can manage the company. The little citrus cart can handle the rest. We can wander over together.',
            choices: [{ id: 'continue', label: 'A pretty good plan.', next: 'together' }]
        },
        together: {
            text: 'A breeze, a cold drink, and a little time together. Let’s enjoy it.',
            choices: [{ id: 'enjoy', label: 'Let’s take our time.', next: null }]
        }
    }
};

export const BEACH_DRINKS_DIALOGUE: DialogueDefinition = {
    id: 'e1-beach-drinks',
    speaker: 'Citrus cart attendant',
    start: 'offer',
    nodes: {
        offer: {
            text: 'Warm walk over? Your day passes include a chilled citrus water each. Plenty of ice, and a shady place to take a breather.',
            choices: [
                { id: 'take', label: 'Two citrus waters, please.', next: 'served' },
                { id: 'later', label: 'We’ll come back in a little while.', next: null }
            ]
        },
        served: {
            text: 'Here you go—one for each of you. No extra charge. Enjoy the breeze, and bring the cups back when you’re done.',
            choices: [{ id: 'thanks', label: 'Thank you!', next: null }]
        }
    }
};

export const BEACH_SHORE_DIALOGUE: DialogueDefinition = {
    id: 'e1-beach-shore',
    speaker: 'At the shoreline',
    start: 'look',
    nodes: {
        look: {
            text: 'Small waves fold onto the pale sand. Beyond the swim markers, the sea catches the afternoon light. Nearby swimmers tread water and drift into slow, easy strokes.\n\nFor a moment, there is nowhere else you need to be.',
            choices: [
                { id: 'notice', label: 'Take in the sea air.', next: null },
                { id: 'later', label: 'Keep walking for now.', next: null }
            ]
        }
    }
};

export const BEACH_QUEST: QuestDefinition = {
    id: 'e1-beach-exploration',
    title: 'A little sea air',
    order: 'any',
    objectives: [
        {
            id: 'friend',
            text: 'Talk with your friend',
            event: {
                type: 'dialogue-choice',
                dialogueId: BEACH_FRIEND_DIALOGUE.id,
                nodeId: 'together',
                choiceId: 'enjoy'
            }
        },
        {
            id: 'drinks',
            text: 'Share chilled drinks',
            event: { type: 'dialogue-choice', dialogueId: BEACH_DRINKS_DIALOGUE.id, nodeId: 'offer', choiceId: 'take' }
        },
        {
            id: 'shore',
            text: 'Look out at the shoreline',
            event: { type: 'dialogue-choice', dialogueId: BEACH_SHORE_DIALOGUE.id, nodeId: 'look', choiceId: 'notice' }
        }
    ],
    completionMessage:
        'A moment shared. Keep enjoying the beach, or save here. The next story chapter is still to come.'
};

export const BEACH_LOCAL_DIALOGUE: DialogueDefinition = {
    id: 'e1-beach-local',
    speaker: 'Beachgoer',
    start: 'hello',
    nodes: {
        hello: {
            text: 'Best breeze all afternoon! There’s shade by the loungers, and cold water at the citrus cart. We’re taking the scenic route today.',
            choices: [{ id: 'thanks', label: 'Enjoy your afternoon.', next: null }]
        }
    }
};
