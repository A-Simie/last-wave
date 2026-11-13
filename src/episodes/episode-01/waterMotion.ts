import { BEACH_SHORE_Z } from './entryLayout.ts';

export const calmTideHeight = (time: number) => 0.08 * Math.sin((time * Math.PI * 2) / 180);
export const calmShoreAdvance = (time: number) =>
    0.65 * Math.sin((time * Math.PI * 2) / 7.5) + calmTideHeight(time) * 3;

export const sampleBeachWater = (x: number, z: number, time: number, result = { height: 0, dx: 0, dz: 0 }) => {
    const depth = BEACH_SHORE_Z - z;
    const envelope = 0.28 + 0.72 * Math.max(0, Math.min(1, depth / 15));
    const slope = depth > 0 && depth < 15 ? -0.72 / 15 : 0;
    const a = z * 0.32 + x * 0.055 - time * 0.9;
    const b = z * 0.67 - x * 0.09 - time * 1.45;
    const c = x * 0.82 + z * 0.74 + time * 1.7;
    const swell = 0.16 * Math.sin(a) + 0.055 * Math.sin(b);
    result.height = 0.14 + calmTideHeight(time) + envelope * swell + 0.012 * Math.sin(c);
    result.dx = envelope * (0.16 * 0.055 * Math.cos(a) - 0.055 * 0.09 * Math.cos(b)) + 0.012 * 0.82 * Math.cos(c);
    result.dz =
        slope * swell +
        envelope * (0.16 * 0.32 * Math.cos(a) + 0.055 * 0.67 * Math.cos(b)) +
        0.012 * 0.74 * Math.cos(c);
    return result;
};

export const beachWaterHeight = (x: number, z: number, time: number) => sampleBeachWater(x, z, time).height;
