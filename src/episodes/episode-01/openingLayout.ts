import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

import { CAFE_FLOOR_Y, CAFE_SOLIDS, cafeModelBox } from './cafeLayout.ts';

export const OPENING_SPAWN: Vector3Tuple = [6.15, 1.05, 0];
export const OPENING_TABLE = cafeModelBox('cafe-belongings', 'table', [7.7, CAFE_FLOOR_Y, 0]);
export const OPENING_TV = cafeModelBox('cafe-tv', 'television', [7.56, 1.97, -4.38]);
export const OPENING_COUNTER: BoxDefinition = {
    name: 'cafe-counter',
    position: [6.18, CAFE_FLOOR_Y + 0.54, -2.83],
    size: [6.05, 1.08, 0.54]
};
export const OPENING_SOLIDS = [OPENING_TABLE, OPENING_TV, OPENING_COUNTER, ...CAFE_SOLIDS];
export const FRIEND_ROUTE: Vector3Tuple[] = [
    [7.7, 1.026, 0.843],
    [6.25, 1.014, 1.85],
    [6.25, 1.014, 4.6],
    [8.1, 1.014, 4.6],
    [8.1, 1.014, 6.65]
];
export const OPENING_EXIT: Vector3Tuple = [8.1, 1, 5.7];
export const OPENING_SEATS: { position: Vector3Tuple; yaw: number }[] = [
    { position: [7.7, 0.018, -0.843], yaw: 0 },
    { position: [7.7, 0.026, 0.843], yaw: 180 }
];
export const OPENING_SHOTS: Record<string, { position: Vector3Tuple; target: Vector3Tuple; fov: number }> = {
    preview: { position: [0.65, 2.9, 5.15], target: [5.8, 1.45, -0.4], fov: 59 },
    broadcastWide: { position: [6.85, 2.5, -0.25], target: [7.56, 2.44, -4.38], fov: 54 },
    television: { position: [7.56, 2.65, -1.95], target: [7.56, 2.48, -4.38], fov: 39 },
    you: { position: [4.8, 1.95, 1.75], target: [7.7, 1.2, -0.03], fov: 49 },
    friend: { position: [4.8, 1.95, -1.75], target: [7.7, 1.2, 0.13], fov: 49 }
};
