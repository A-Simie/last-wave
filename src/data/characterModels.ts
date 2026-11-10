import { modelTuning } from './modelTuning.ts';

export const BEACH_CHARACTER_MODELS = {
    beachTeal: modelTuning('beachTeal.glb', [1.6689, 1.7876, 0.2982], [0, 0.8854, -0.0124], 0.0084, 1.76),
    beachCoral: modelTuning('beachCoral.glb', [1.6689, 1.7793, 0.2982], [0, 0.8813, -0.0124], 0.0084, 1.75),
    beachGold: modelTuning('beachGold.glb', [1.8589, 1.823, 0.2794], [0, 0.902, -0.0116], 0.0095, 1.814),
    beachBlue: modelTuning('beachBlue.glb', [1.8589, 1.8492, 0.2794], [0, 0.9151, -0.0116], 0.0095, 1.84)
};
export type BeachCharacterId = keyof typeof BEACH_CHARACTER_MODELS;

// Sole clearance across the ground's thin paving/boardwalk overlays, measured through each gait cycle.
export const PLAYER_POSE_HEIGHTS = { idle: 0.033, walk: 0.04, jog: 0.029, sprint: 0.064, jump: 0.04 } as const;
export const COMPANION_SPRINT_HEIGHT = 0.028;

// Animated support heights relative to sand or the calm water surface.
export const BEACH_POSE_HEIGHTS = {
    beachTeal: { idle: 0.025, walk: 0.018, sprint: 0.065, swim: 0.07, float: -0.035 },
    beachCoral: { idle: 0.025, walk: 0.018, sprint: 0.065, swim: 0.07, float: -0.035 },
    beachGold: { idle: 0.015, walk: 0.011, sprint: 0.069, swim: 0.035, float: -0.085 },
    beachBlue: { idle: 0.015, walk: 0.011, sprint: 0.069, swim: 0.035, float: -0.085 }
} as const;

export const CHARACTER_MODELS = {
    ...BEACH_CHARACTER_MODELS,
    friendA: modelTuning('friendA.glb', [1.8589, 1.8487, 0.2931], [0, 0.9154, -0.0065], 0.009, 1.84),
    friendB: modelTuning('friendB.glb', [1.6689, 1.7882, 0.2995], [0, 0.8851, -0.0097], 0.009, 1.76),
    barista: modelTuning('barista.glb', [1.8589, 1.8225, 0.2931], [0, 0.9023, -0.0065], 0.009, 1.814),
    patronBuzz: modelTuning('patronBuzz.glb', [1.8589, 1.8225, 0.2931], [0, 0.9023, -0.0065], 0.009, 1.814),
    patronLong: modelTuning('patronLong.glb', [1.6689, 1.7862, 0.3016], [0, 0.8841, -0.0108], 0.009, 1.758),
    patronShort: modelTuning('patronShort.glb', [1.6689, 1.7799, 0.2995], [0, 0.881, -0.0097], 0.009, 1.752),
    patronBeard: modelTuning('patronBeard.glb', [1.8589, 1.8487, 0.2931], [0, 0.9154, -0.0065], 0.009, 1.84),
    patronBuns: modelTuning('patronBuns.glb', [1.6689, 1.7882, 0.2995], [0, 0.8851, -0.0097], 0.009, 1.76),
    commuterSuit: modelTuning('commuterSuit.glb', [1.8589, 1.8487, 0.2931], [0, 0.9154, -0.0065], 0.009, 1.84)
};

export type CharacterModelId = keyof typeof CHARACTER_MODELS;

export const CHARACTER_CLIPS = {
    idle: 'Casual_Idle_Loop',
    talk: 'Idle_Talking_Loop',
    walk: 'Casual_Walk_Loop',
    jog: 'Relaxed_Jog_Loop',
    sprint: 'Relaxed_Sprint_Loop',
    jump: 'Jump_Loop',
    sitDown: 'Sitting_Enter',
    seated: 'Sitting_Idle_Loop',
    seatedTalk: 'Sitting_Talking_Loop',
    standUp: 'Sitting_Exit'
} as const;

export const BEACH_CHARACTER_CLIPS = {
    idle: 'Casual_Idle_Loop',
    talk: 'Idle_Talking_Loop',
    walk: 'Casual_Walk_Loop',
    sprint: 'Relaxed_Sprint_Loop',
    point: 'Interact',
    seated: 'Sitting_Idle_Loop',
    seatedTalk: 'Sitting_Talking_Loop',
    swim: 'Swim_Fwd_Loop',
    float: 'Swim_Idle_Loop'
} as const;

export const PLAYER_STORY_CLIPS = { fall: 'Death01' } as const;
export const DRIVER_CLIPS = { driving: 'Traffic_Driving_Loop' } as const;

export type CharacterPose =
    | keyof typeof CHARACTER_CLIPS
    | keyof typeof BEACH_CHARACTER_CLIPS
    | keyof typeof PLAYER_STORY_CLIPS
    | keyof typeof DRIVER_CLIPS;
