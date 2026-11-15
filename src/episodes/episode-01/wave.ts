import type { CutsceneDefinition } from '../../systems/CutsceneSystem.ts';

export const WAVE_WARNING: CutsceneDefinition = {
    id: 'e1-wave-warning',
    title: 'The changing tide',
    setting: 'Seafront Beach',
    automatic: true,
    finishLabel: 'Run for higher ground',
    skipLabel: 'Skip to evacuation',
    beats: [
        {
            id: 'retreat',
            speaker: 'Friend',
            text: 'The water’s pulling away. Stay back!',
            shot: 'retreat',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'birds',
            speaker: 'Above the beach',
            text: 'Gulls scatter inland. A deep rumble rises.',
            shot: 'birds',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'crowd',
            speaker: 'A child in the crowd',
            text: '“Where did the sea go?” A whistle sounds.',
            shot: 'crowd',
            dialoguePlacement: 'top-left'
        },
        {
            id: 'wave',
            speaker: 'Lifeguard',
            text: 'GET TO HIGHER GROUND! Follow the green arrows inland. RUN!',
            shot: 'wave',
            dialoguePlacement: 'top-left'
        }
    ]
};

export const WAVE_BLACKOUT: CutsceneDefinition = {
    id: 'e1-wave-blackout',
    title: 'The day the ocean disappeared',
    setting: 'The evacuation path',
    automatic: true,
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
export const WAVE_AUTOSTART_DELAY = 3;

/** Short captions overlap the continuous warning action. */
export const warningBeatDuration = (text: string) =>
    Math.min(4, Math.max(2.4, 0.8 + text.trim().split(/\s+/).length / 3.6));

export const EVACUATION_CALL = 'MOVE AWAY FROM THE SHORE! GET TO HIGHER GROUND!';
export const SEPARATION_CALL = 'Friend, distant: “HEY! WAIT! DON’T LEAVE ME!”';
