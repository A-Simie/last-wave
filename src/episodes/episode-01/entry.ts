import type { CutsceneDefinition } from '../../systems/CutsceneSystem.ts';
import type { DialogueDefinition } from '../../systems/DialogueSystem.ts';
import type { InventoryItemDefinition } from '../../systems/InventorySystem.ts';
import type { QuestDefinition } from '../../systems/QuestSystem.ts';

export const BEACH_ADMISSION_COST = 10;

export const BEACH_PASSES: InventoryItemDefinition = {
    id: 'e1-beach-passes',
    kind: 'quest',
    title: 'Two beach day passes',
    source: 'Seafront Beach ticket booth',
    description:
        'Admit You + Friend. Ten credits paid from the beach money on your phone. Keep the passes together for the entrance queue.\n\nA protected story item: your passes stay with you across checkpoints and beach arrival.'
};

export const OFFICER_CUTSCENE: CutsceneDefinition = {
    id: 'e1-beach-officer',
    title: 'Seafront Beach',
    setting: 'The beach entrance. Warm pavement gives way to shade beneath a broad sea-green arch.',
    finishLabel: 'Find the booth',
    skipLabel: 'Skip directions',
    beats: [
        {
            id: 'welcome',
            speaker: 'Beach officer',
            text: 'Afternoon, you two. Looking for a little sea air? This is the entrance to Seafront Beach.',
            shot: 'officer'
        },
        {
            id: 'tickets',
            speaker: 'Beach officer',
            text: 'The ticket booth is on your left. Two day passes are ten credits. You can pay with your phone.',
            shot: 'booth',
            dialoguePlacement: 'top-right'
        },
        {
            id: 'queue',
            speaker: 'Beach officer',
            text: 'Then join the marked line under the arch. Keep both passes ready and stay together. We will wave you through.',
            shot: 'line',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'together',
            speaker: 'Friend',
            text: 'We still have our ten credits of beach money. Tickets first, then somewhere with a breeze.',
            shot: 'friend'
        }
    ]
};

export const QUEUE_CUTSCENE: CutsceneDefinition = {
    id: 'e1-beach-queue',
    title: 'Almost at the water',
    setting: 'Two friends wait their turn beneath the beach arch.',
    finishLabel: 'Enter together',
    skipLabel: 'Enter beach',
    beats: [
        {
            id: 'our-turn',
            speaker: 'Friend',
            text: 'Two passes, two of us. I can already feel the breeze from here.',
            shot: 'queue-friend'
        },
        {
            id: 'admitted',
            speaker: 'Beach officer',
            text: 'You are next. Both passes are good. Follow the boardwalk down to the sand, and enjoy your afternoon.',
            shot: 'admission'
        }
    ]
};

export const ENTRY_QUEST: QuestDefinition = {
    id: 'e1-to-the-beach',
    title: 'A little sea air',
    objectives: [
        {
            id: 'practise-move',
            text: 'Try moving a few steps with your bag packed.',
            event: { type: 'control-practiced', control: 'move' }
        },
        {
            id: 'practise-look',
            text: 'Look around and find the café doorway.',
            event: { type: 'control-practiced', control: 'look' }
        },
        {
            id: 'practise-interact',
            text: 'Approach the café doorway and choose Head outside.',
            event: { type: 'interaction', targetId: 'cafe-exit' }
        },
        {
            id: 'ask-directions',
            text: 'Ask a pedestrian on Seafront Avenue how to reach the beach.',
            event: {
                type: 'dialogue-choice',
                dialogueId: 'e1-beach-directions',
                nodeId: 'directions',
                choiceId: 'thanks'
            }
        },
        {
            id: 'meet-officer',
            text: 'Follow the BEACH signs east past Lemon Market. Speak to the officer at the big arch.',
            event: { type: 'cutscene-complete', cutsceneId: OFFICER_CUTSCENE.id }
        },
        {
            id: 'buy-passes',
            text: 'Buy two day passes at the booth left of the arch. Your phone has 10 credits reserved.',
            event: { type: 'dialogue-choice', dialogueId: 'e1-beach-tickets', nodeId: 'offer', choiceId: 'buy' }
        },
        {
            id: 'join-queue',
            text: 'Take both passes to the back of the marked entrance queue.',
            event: { type: 'cutscene-complete', cutsceneId: QUEUE_CUTSCENE.id }
        },
        {
            id: 'arrive-beach',
            text: 'Enter the beach together. Use the queue marker to retry if needed.',
            event: { type: 'interaction', targetId: 'beach-arrival' }
        }
    ],
    completionMessage: 'You and your friend made it to the beach. Take in the view.'
};

export type EntryLesson = {
    readonly id: 'move' | 'look' | 'interact';
    readonly title: string;
    readonly text: string;
    readonly desktop: string;
    readonly touch: string;
};

export const ENTRY_LESSONS: readonly EntryLesson[] = [
    {
        id: 'move',
        title: 'A few steps toward the sea',
        text: 'Bag and phone packed. Try walking a few steps before we head out. Your friend will wait for you.',
        desktop:
            'Click the scene to play, then use WASD or the arrow keys to move. Hold Shift to sprint. Gamepad: left stick.',
        touch: 'Drag on the left half of the scene to move. Drag farther to sprint.'
    },
    {
        id: 'look',
        title: 'Find your way',
        text: 'Now turn the camera and look for the open doorway. These hints advance when you try the control.',
        desktop: 'Click the scene, then move your mouse to look around. Esc releases the mouse. Gamepad: right stick.',
        touch: 'Drag on the right half of the scene to look around.'
    },
    {
        id: 'interact',
        title: 'Leave together',
        text: 'Walk close to the café doorway. Choose Head outside when its prompt appears. Outside, people can help you find the beach.',
        desktop: 'Press E while playing, or click the on-screen interaction prompt. Conversations wait for your reply.',
        touch: 'Tap the on-screen Head outside prompt. Tap replies to continue conversations.'
    }
];

export const directionsDialogue = (speaker: string, x = 0, z = 7): DialogueDefinition => ({
    id: 'e1-beach-directions',
    speaker,
    start: 'greeting',
    nodes: {
        greeting: {
            text: 'Escaping the heat too? What can I help you with?',
            choices: [
                { id: 'beach', label: 'Which way is the beach?', next: 'directions' },
                { id: 'leave', label: 'Just passing through. Thanks.', next: null }
            ]
        },
        directions: {
            text:
                z > 35
                    ? 'This is Market Street. Take the side street toward Seafront Avenue, then follow the green BEACH signs to the big arch just east of the crossing. The officer in the entrance plaza will show you where to get tickets.'
                    : x > 98
                      ? 'Head west along Seafront Avenue toward the big sea-green arch. The entrance plaza is on the ocean side, just before the quiet side street. The officer there will show you where to get tickets.'
                      : 'Head east along this pavement, past the pharmacy and Lemon Market. Follow the green BEACH signs across the quiet side street. Turn left into the entrance plaza—you cannot miss the big arch. The officer will show you where to get tickets.',
            choices: [
                {
                    id: 'thanks',
                    label: z > 35 || x > 98 ? 'The big arch. Thank you!' : 'East, then the big arch. Thank you!',
                    next: null
                }
            ]
        }
    }
});

export const TICKET_DIALOGUE: DialogueDefinition = {
    id: 'e1-beach-tickets',
    speaker: 'Ticket attendant',
    start: 'offer',
    nodes: {
        offer: {
            text: 'Two day passes? That is 10 credits for both. Your phone has exactly that set aside for the beach. One payment covers you and your friend.',
            choices: [
                { id: 'buy', label: 'Pay 10 credits · buy both passes', next: 'receipt' },
                { id: 'later', label: 'Not just yet.', next: null }
            ]
        },
        receipt: {
            text: 'All paid. Here are your two passes. Join the marked queue on the right, and keep them together.',
            choices: [{ id: 'thanks', label: 'Got them. Thank you.', next: null }]
        }
    }
};

export const entryReply = (id: string, speaker: string, text: string): DialogueDefinition => ({
    id,
    speaker,
    start: 'reply',
    nodes: { reply: { text, choices: [{ id: 'continue', label: 'All right.', next: null }] } }
});
