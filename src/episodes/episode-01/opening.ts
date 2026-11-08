import type { CutsceneDefinition } from '../../systems/CutsceneSystem.ts';
import type { DialogueDefinition } from '../../systems/DialogueSystem.ts';
import type { InventoryItemDefinition } from '../../systems/InventorySystem.ts';
import type { QuestDefinition } from '../../systems/QuestSystem.ts';

export const NEWS_TRANSCRIPT =
    'The ongoing heatwave continues to affect coastal communities. Health officials advise residents to drink water regularly, seek shade, and avoid unnecessary exposure to the midday sun. Ocean monitoring teams have also reported unusual conditions offshore.';

export const OPENING_CUTSCENE: CutsceneDefinition = {
    id: 'e1-cafe-opening',
    title: 'The Last Normal Day',
    setting: 'Late afternoon. A coastal coffee shop. Two fictional friends sit with half-finished drinks.',
    finishLabel: 'Let’s go',
    skipLabel: 'Skip intro',
    beats: [
        { id: 'broadcast', speaker: 'Local news', text: NEWS_TRANSCRIPT, shot: 'television' },
        {
            id: 'tired-fan',
            speaker: 'You',
            text: 'This heat is actually ridiculous. Even the fan is tired.',
            shot: 'you'
        },
        {
            id: 'warm-drinks',
            speaker: 'Friend',
            text: 'And our drinks are getting warm faster than we can finish them.',
            shot: 'friend'
        },
        {
            id: 'a-breeze',
            speaker: 'You',
            text: 'What if we head to the beach? At least there might be a breeze.',
            shot: 'you'
        },
        {
            id: 'lets-go',
            speaker: 'Friend',
            text: 'The beach? In this heat? ...Fine. Anything is better than sitting here.',
            shot: 'friend'
        }
    ]
};

export const STARTER_BAG: InventoryItemDefinition = {
    id: 'e1-starter-bag',
    kind: 'quest',
    title: 'Bag & phone',
    source: 'Coffee shop table',
    description:
        'Your everyday bag, with your phone safely tucked inside. The phone has 10 credits reserved for two beach day passes.\n\nA protected story item: it stays with you when you save and load a checkpoint.'
};

export const OPENING_QUEST: QuestDefinition = {
    id: 'e1-last-normal-day',
    title: 'The Last Normal Day',
    objectives: [
        {
            id: 'watch-opening',
            text: 'Play the story opening.',
            event: { type: 'cutscene-complete', cutsceneId: OPENING_CUTSCENE.id }
        },
        {
            id: 'collect-belongings',
            text: 'Pick up your phone and bag from the table.',
            event: { type: 'interaction', targetId: 'cafe-belongings' }
        },
        {
            id: 'follow-friend',
            text: 'Follow your friend through the café door.',
            event: { type: 'interaction', targetId: 'cafe-exit' }
        }
    ],
    completionMessage: 'Out on Seafront Avenue. Ask someone for beach directions.'
};

export const TV_DIALOGUE: DialogueDefinition = {
    id: 'e1-cafe-tv',
    speaker: 'Local news · broadcast transcript',
    start: 'broadcast',
    nodes: {
        broadcast: { text: NEWS_TRANSCRIPT, choices: [{ id: 'close', label: 'Step away from the TV.', next: null }] }
    }
};

export const ATTENDANT_DIALOGUE: DialogueDefinition = {
    id: 'e1-cafe-attendant',
    speaker: 'Coffee shop attendant',
    start: 'greeting',
    nodes: {
        greeting: {
            text: 'Heading out? Take some water and find a little shade. It has been this hot all afternoon.',
            choices: [
                { id: 'news', label: 'What was that on the news?', next: 'news' },
                { id: 'goodbye', label: 'Thanks. See you around.', next: null }
            ]
        },
        news: {
            text: 'The usual heat advice, mostly. They mentioned unusual conditions offshore, but nothing more. The TV has the bulletin if you want to read it.',
            choices: [{ id: 'goodbye', label: 'I might take a look. Thanks.', next: null }]
        }
    }
};

export const FRIEND_REMINDER: DialogueDefinition = {
    id: 'e1-cafe-friend-reminder',
    speaker: 'Friend',
    start: 'bag',
    nodes: {
        bag: {
            text: 'Your bag and phone are still by our drinks. Grab them, then we can head out.',
            choices: [{ id: 'okay', label: 'I will get them.', next: null }]
        }
    }
};

export const FRIEND_READY: DialogueDefinition = {
    id: 'e1-cafe-friend-ready',
    speaker: 'Friend',
    start: 'ready',
    nodes: {
        ready: {
            text: 'Got everything? I will meet you just outside the door.',
            choices: [{ id: 'follow', label: 'Right behind you.', next: null }]
        }
    }
};

export const OPENING_COMPLETE_DIALOGUE: DialogueDefinition = {
    id: 'e1-cafe-handoff',
    speaker: 'To the beach',
    start: 'handoff',
    nodes: {
        handoff: {
            text: 'You step out onto Seafront Avenue, your friend beside you. Commuters hurry past in the afternoon heat.\n\n“Let’s ask someone which way the beach is. I could use that breeze.”',
            choices: [{ id: 'continue', label: 'Ask a pedestrian for directions', next: null }]
        }
    }
};
