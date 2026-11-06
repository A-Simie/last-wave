import { modelTuning } from './modelTuning.ts';

export const CHARACTER_MODELS = {
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
    idle: 'Idle_Loop',
    talk: 'Idle_Talking_Loop',
    walk: 'Walk_Loop',
    jog: 'Jog_Fwd_Loop',
    sprint: 'Sprint_Loop',
    jump: 'Jump_Loop',
    sitDown: 'Sitting_Enter',
    seated: 'Sitting_Idle_Loop',
    seatedTalk: 'Sitting_Talking_Loop',
    standUp: 'Sitting_Exit'
} as const;

export type CharacterPose = keyof typeof CHARACTER_CLIPS;
