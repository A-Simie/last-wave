import type { CutsceneDefinition } from '../../systems/CutsceneSystem.ts';

export const WAVE_WARNING: CutsceneDefinition = {
    id: 'e1-wave-warning',
    title: 'The changing tide',
    setting: 'Seafront Beach',
    finishLabel: 'Run for higher ground',
    skipLabel: 'Skip to evacuation',
    beats: [
        {
            id: 'retreat',
            speaker: 'Friend',
            text: 'The water… it’s pulling away. That isn’t a normal tide. Stay back from the shore.',
            shot: 'retreat',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'birds',
            speaker: 'Above the beach',
            text: 'The gulls lift all at once, wheeling inland. The soft wash of the sea gives way to a low, unfamiliar rumble.',
            shot: 'birds',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'crowd',
            speaker: 'A child in the crowd',
            text: '“Where did all the water go?”\n\nPeople turn and point. A lifeguard’s whistle cuts through the beach.',
            shot: 'crowd',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'wave',
            speaker: 'Lifeguard',
            text: 'MOVE AWAY FROM THE SHORE! GET TO HIGHER GROUND!\n\nTurn inland. Follow the green arrows along the boardwalk and up the dune path. Go now!',
            shot: 'wave',
            dialoguePlacement: 'top-left'
        }
    ]
};

export const WAVE_BLACKOUT: CutsceneDefinition = {
    id: 'e1-wave-blackout',
    title: 'The day the ocean disappeared',
    setting: 'The evacuation path',
    finishLabel: 'Fade to black',
    skipLabel: 'Skip to blackout',
    beats: [
        {
            id: 'fall',
            speaker: 'On the dune path',
            text: 'A loose sign swings across the path. You stumble. The boardwalk rushes up to meet you.',
            shot: 'fall',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'blink',
            speaker: 'At ground level',
            text: 'The shouting sounds far away. Your eyes close, then open a little. A shadow moves closer. You can’t make out a face.',
            shot: 'blink',
            dialoguePlacement: 'top-left'
        }
    ]
};

/** Seconds of calm after the third beach discovery before the sea starts to retreat on its own. */
export const WAVE_AUTOSTART_DELAY = 6;

/** Reading-paced hold for each warning beat (about 3.6 words per second, never rushed below 4.5 s). */
export const warningBeatDuration = (text: string) =>
    Math.min(10, Math.max(4.5, 2.2 + text.trim().split(/\s+/).length / 3.6));

export const EVACUATION_CALL = 'MOVE AWAY FROM THE SHORE! GET TO HIGHER GROUND!';
export const SEPARATION_CALL = 'Friend, distant: “HEY! WAIT! DON’T LEAVE ME!”';
