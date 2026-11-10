import { modelTuning } from './modelTuning.ts';

export const VEHICLE_MODELS = {
    porsche: modelTuning('porsche-911-traffic.glb', [1.9756, 1.2549, 4.3792], [-0.0151, -0.005, 0.0774], 0.6325, 1.3)
};
export type VehicleModelId = keyof typeof VEHICLE_MODELS;

export const PORSCHE_WHEELS = ['wheel-front-left', 'wheel-front-right', 'wheel-rear-left', 'wheel-rear-right'] as const;
export const PORSCHE_WHEEL_RADIUS = 0.32826 * VEHICLE_MODELS.porsche.scale;
export const PORSCHE_DRIVER_SEATS = {
    patronBuzz: { position: [0.37, 0.11, 0.44], scale: 0.92, pitch: -24, wheel: [0.37, 0.88, 0.15] },
    patronShort: { position: [0.37, 0.145, 0.44], scale: 0.92, pitch: -24, wheel: [0.37, 0.85, 0.145] }
} as const;
export const TRAFFIC_PAINT = [
    [0.66, 0.24, 0.14],
    [0.22, 0.39, 0.49],
    [0.86, 0.8, 0.63],
    [0.12, 0.43, 0.36]
] as const;
