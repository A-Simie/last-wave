import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

import { BEACH_ARRIVAL_SOLIDS } from './entryLayout.ts';

export const BEACH_DRINK_CART: BoxDefinition = {
    name: 'beach-citrus-cart',
    position: [-8.5, 0.58, 3.8],
    size: [3.6, 1.16, 1.3]
};
export const BEACH_SHORE_MARK: Vector3Tuple = [0, 1.2, -14.2];
export const BEACH_VENDOR_MARK: Vector3Tuple = [-8.5, 1.04, 2.15];
export const BEACH_LOCAL_MARK: Vector3Tuple = [5.1, 1.04, 1.4];

export const BEACH_UMBRELLAS: readonly Vector3Tuple[] = [
    [-7.1, 0, -2.7],
    [-11.7, 0, -6.6],
    [7.5, 0, -4.1],
    [12, 0, 0.1],
    [10.5, 0, 7.8],
    [-10.7, 0, 3.8]
];
export const BEACH_LOUNGERS: readonly BoxDefinition[] = [
    { name: 'beach-lounger-0', position: [-6, 0.625, -4.4], size: [1, 1.25, 2.1], yaw: 12 },
    { name: 'beach-lounger-1', position: [-8.2, 0.625, -4], size: [1, 1.25, 2.1], yaw: 12 },
    { name: 'beach-lounger-2', position: [-11.7, 0.625, -8.4], size: [1, 1.25, 2.1], yaw: -15 },
    { name: 'beach-lounger-3', position: [6.4, 0.625, -6], size: [1, 1.25, 2.1], yaw: -12 },
    { name: 'beach-lounger-4', position: [8.6, 0.625, -5.6], size: [1, 1.25, 2.1], yaw: -12 },
    { name: 'beach-lounger-5', position: [12.2, 0.625, -1.6], size: [1, 1.25, 2.1], yaw: 20 },
    { name: 'beach-lounger-6', position: [10, 0.625, 6], size: [1, 1.25, 2.1], yaw: 20 }
];

export const BEACH_STANDING_PEOPLE: readonly {
    name: string;
    position: Vector3Tuple;
    yaw: number;
    model: 'beachTeal' | 'beachCoral' | 'beachGold' | 'beachBlue';
}[] = [
    { name: 'beach-local', position: BEACH_LOCAL_MARK, yaw: 64, model: 'beachTeal' },
    { name: 'beach-local-friend', position: [6.5, 1.04, 2.1], yaw: -116, model: 'beachGold' },
    { name: 'beach-sunbather-0', position: [-9.8, 1.04, -2.1], yaw: -40, model: 'beachBlue' },
    { name: 'beach-sunbather-1', position: [-10.8, 1.04, -0.7], yaw: 140, model: 'beachCoral' },
    { name: 'beach-shore-watcher', position: [11.5, 1.04, -11.8], yaw: 180, model: 'beachTeal' }
];

export const BEACH_DRESSING_SOLIDS: readonly BoxDefinition[] = [
    BEACH_DRINK_CART,
    ...BEACH_LOUNGERS,
    ...BEACH_UMBRELLAS.map(([x, , z], i): BoxDefinition => ({
        name: `beach-umbrella-${i}`,
        position: [x, 1.5, z],
        size: [0.2, 3, 0.2]
    })),
    { name: 'beach-welcome-post', position: [-4.1, 1, 7.8], size: [0.16, 2, 0.16] },
    { name: 'beach-shore-sign-post', position: [3.35, 0.8, -13.1], size: [0.12, 1.6, 0.12] },
    { name: 'beach-vendor', position: [BEACH_VENDOR_MARK[0], 0.91, BEACH_VENDOR_MARK[2]], size: [0.64, 1.82, 0.64] },
    ...BEACH_STANDING_PEOPLE.map(({ name, position }): BoxDefinition => ({
        name,
        position: [position[0], 0.92, position[2]],
        size: [0.64, 1.84, 0.64]
    }))
];
export const BEACH_SOLIDS = [...BEACH_ARRIVAL_SOLIDS, ...BEACH_DRESSING_SOLIDS];
