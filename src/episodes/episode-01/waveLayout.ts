import type { Vector3Tuple } from '../../data/foundation.ts';

import { BEACH_SHORE_Z } from './entryLayout.ts';

export const WAVE_PLAYER_MARK: Vector3Tuple = [0, 1.04, BEACH_SHORE_Z + 4.2];
export const WAVE_FRIEND_MARK: Vector3Tuple = [1.9, 1.04, BEACH_SHORE_Z + 4.2];
export const EVACUATION_RAMP = { start: 12, end: 28, rise: 4, width: 7 } as const;
export const evacuationHeight = (z: number) =>
    Math.max(0, Math.min(1, (z - EVACUATION_RAMP.start) / (EVACUATION_RAMP.end - EVACUATION_RAMP.start))) *
    EVACUATION_RAMP.rise;

export const EVACUATION_GATES: readonly {
    label: string;
    position: Vector3Tuple;
    halfWidth: number;
    halfDepth: number;
}[] = [
    { label: 'Green arrows · inland boardwalk', position: [0, 1.04, 0], halfWidth: 2.9, halfDepth: 2 },
    { label: 'Higher ground · dune path', position: [0, 1.16, 12.5], halfWidth: 3.25, halfDepth: 0.75 },
    { label: 'Keep climbing · higher ground ahead', position: [0, 4.04, 24], halfWidth: 3.25, halfDepth: 1 }
];

export const WAVE_SHOTS: Record<string, { position: Vector3Tuple; target: Vector3Tuple; fov: number }> = {
    retreat: { position: [9, 5.2, BEACH_SHORE_Z + 9], target: [0, -0.3, BEACH_SHORE_Z - 12], fov: 56 },
    birds: { position: [11, 4, BEACH_SHORE_Z + 13], target: [0, 7.5, BEACH_SHORE_Z - 5], fov: 62 },
    crowd: { position: [15, 3.8, BEACH_SHORE_Z + 9], target: [7, 1.4, BEACH_SHORE_Z + 3], fov: 60 },
    wave: { position: [0, 3.4, BEACH_SHORE_Z + 11], target: [0, 6.5, BEACH_SHORE_Z - 26], fov: 62 }
};
