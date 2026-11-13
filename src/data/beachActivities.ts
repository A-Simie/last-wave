import { modelTuning } from './modelTuning.ts';

export const BEACH_ACTIVITY_MODELS = {
    horse: modelTuning('horse.glb', [2.5698, 6.9053, 9.2351], [0, 3.4711, 0.4994], -0.0185, 1.7),
    speedboat: modelTuning('speedboat.glb', [1.785, 1.5, 3.37], [0, 0.75, 0], 0, 1.85),
    quadWheel: modelTuning('quadWheel.glb', [0.3693, 0.5386, 0.5386], [0, 0, 0], 0.2693, 0.7)
};
export type BeachActivityModelId = keyof typeof BEACH_ACTIVITY_MODELS;
export const BEACH_ACTIVITY_ASSETS = { ...BEACH_ACTIVITY_MODELS, riderPose: { file: 'riderPose.glb' } };
export type BeachActivityAssetId = keyof typeof BEACH_ACTIVITY_ASSETS;
