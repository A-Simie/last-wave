import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

import { BEACH_ARRIVAL_SOLIDS, BEACH_SHORE_Z, BEACH_V3_SOLIDS } from './entryLayout.ts';

export const BEACH_DRINK_CART: BoxDefinition = {
    name: 'beach-citrus-cart',
    position: [-8.5, 0.58, 3.8],
    size: [3.6, 1.16, 1.3]
};
export const BEACH_SHORE_MARK: Vector3Tuple = [0, 1.2, BEACH_SHORE_Z + 1.8];
export const BEACH_VENDOR_MARK: Vector3Tuple = [-8.5, 1.04, 2.15];
export const BEACH_LOCAL_MARK: Vector3Tuple = [5.1, 1.04, 1.4];

const ORIGINAL_UMBRELLAS: readonly Vector3Tuple[] = [
    [-7.1, 0, -2.7],
    [-11.7, 0, -6.6],
    [7.5, 0, -4.1],
    [12, 0, 0.1],
    [10.5, 0, 7.8],
    [-10.7, 0, 3.8]
];
const ORIGINAL_LOUNGERS: readonly BoxDefinition[] = [
    { name: 'beach-lounger-0', position: [-6, 0.625, -4.4], size: [1, 1.25, 2.1], yaw: 12 },
    { name: 'beach-lounger-1', position: [-8.2, 0.625, -4], size: [1, 1.25, 2.1], yaw: 12 },
    { name: 'beach-lounger-2', position: [-11.7, 0.625, -8.4], size: [1, 1.25, 2.1], yaw: -15 },
    { name: 'beach-lounger-3', position: [6.4, 0.625, -6], size: [1, 1.25, 2.1], yaw: -12 },
    { name: 'beach-lounger-4', position: [8.6, 0.625, -5.6], size: [1, 1.25, 2.1], yaw: -12 },
    { name: 'beach-lounger-5', position: [12.2, 0.625, -1.6], size: [1, 1.25, 2.1], yaw: 20 },
    { name: 'beach-lounger-6', position: [10, 0.625, 6], size: [1, 1.25, 2.1], yaw: 20 }
];

const SHADE_CLUSTERS: readonly Vector3Tuple[] = [
    [-22, 0, 4],
    [-34, 0, 5],
    [-42, 0, -6],
    [-29, 0, -10],
    [-20, 0, -21],
    [-39, 0, -23],
    [22, 0, 5],
    [36, 0, 5],
    [44, 0, -8],
    [28, 0, -12],
    [18, 0, -20],
    [40, 0, -23]
];
export const BEACH_UMBRELLAS = [...ORIGINAL_UMBRELLAS, ...SHADE_CLUSTERS];
export const BEACH_LOUNGERS: readonly BoxDefinition[] = [
    ...ORIGINAL_LOUNGERS,
    ...SHADE_CLUSTERS.flatMap(([x, , z], index) =>
        [-1.1, 1.1].map((offset, side): BoxDefinition => ({
            name: `beach-lounger-${ORIGINAL_LOUNGERS.length + index * 2 + side}`,
            position: [x + offset, 0.625, z - 1.9],
            size: [1, 1.25, 2.1],
            yaw: x < 0 ? 12 : -12
        }))
    )
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
    { name: 'beach-shore-watcher', position: [11.5, 1.04, -11.8], yaw: 180, model: 'beachTeal' },
    { name: 'beach-west-friends-0', position: [-19, 1.04, 6], yaw: -60, model: 'beachGold' },
    { name: 'beach-west-friends-1', position: [-20.6, 1.04, 6.8], yaw: 120, model: 'beachBlue' },
    { name: 'beach-west-friends-2', position: [-34, 1.04, -3], yaw: -65, model: 'beachCoral' },
    { name: 'beach-west-friends-3', position: [-35.8, 1.04, -2.2], yaw: 115, model: 'beachTeal' },
    { name: 'beach-west-friends-4', position: [-24, 1.04, -17], yaw: -70, model: 'beachBlue' },
    { name: 'beach-west-friends-5', position: [-25.7, 1.04, -16.5], yaw: 110, model: 'beachGold' },
    { name: 'beach-west-shore-watcher', position: [-38, 1.04, -28], yaw: 180, model: 'beachCoral' },
    { name: 'beach-east-friends-0', position: [19, 1.04, 7], yaw: 60, model: 'beachTeal' },
    { name: 'beach-east-friends-1', position: [20.6, 1.04, 7.8], yaw: -120, model: 'beachCoral' },
    { name: 'beach-east-friends-2', position: [35, 1.04, -4], yaw: -65, model: 'beachGold' },
    { name: 'beach-east-friends-3', position: [33.4, 1.04, -3.2], yaw: 115, model: 'beachBlue' },
    { name: 'beach-east-shore-watcher', position: [28, 1.04, -23], yaw: 180, model: 'beachTeal' }
];

export const BEACH_WALKER_ROUTES: readonly (readonly Vector3Tuple[])[] = [
    [
        [-12.5, 1.04, -10.8],
        [8.5, 1.04, -10.8],
        [8.5, 1.04, -12.7],
        [-12.5, 1.04, -12.7]
    ],
    [
        [-44, 1.04, -30.4],
        [-16, 1.04, -30.4],
        [-16, 1.04, -32.4],
        [-44, 1.04, -32.4]
    ],
    [
        [16, 1.04, -30.4],
        [44, 1.04, -30.4],
        [44, 1.04, -32.4],
        [16, 1.04, -32.4]
    ],
    [
        [-13, 1.04, -29.6],
        [13, 1.04, -29.6],
        [13, 1.04, -31.8],
        [-13, 1.04, -31.8]
    ]
];

const umbrellaSolids = (points: readonly Vector3Tuple[]) =>
    points.map(([x, , z], i): BoxDefinition => ({
        name: `beach-umbrella-${i}`,
        position: [x, 1.5, z],
        size: [0.2, 3, 0.2]
    }));
const peopleSolids = (people: typeof BEACH_STANDING_PEOPLE) =>
    people.map(({ name, position }): BoxDefinition => ({
        name,
        position: [position[0], 0.92, position[2]],
        size: [0.64, 1.84, 0.64]
    }));
const WELCOME_POST: BoxDefinition = { name: 'beach-welcome-post', position: [-4.1, 1, 7.8], size: [0.16, 2, 0.16] };
const SHORE_POST: BoxDefinition = {
    name: 'beach-shore-sign-post',
    position: [5, 0.8, BEACH_SHORE_Z + 4],
    size: [0.12, 1.6, 0.12]
};
const VENDOR: BoxDefinition = {
    name: 'beach-vendor',
    position: [BEACH_VENDOR_MARK[0], 0.91, BEACH_VENDOR_MARK[2]],
    size: [0.64, 1.82, 0.64]
};

export const BEACH_V4_DRESSING_SOLIDS: readonly BoxDefinition[] = [
    BEACH_DRINK_CART,
    ...ORIGINAL_LOUNGERS,
    ...umbrellaSolids(ORIGINAL_UMBRELLAS),
    WELCOME_POST,
    { ...SHORE_POST, position: [3.35, 0.8, -13.1] },
    VENDOR,
    ...peopleSolids(BEACH_STANDING_PEOPLE.slice(0, 5))
];
export const BEACH_V4_SOLIDS = [...BEACH_V3_SOLIDS, ...BEACH_V4_DRESSING_SOLIDS];

export const BEACH_DRESSING_SOLIDS: readonly BoxDefinition[] = [
    BEACH_DRINK_CART,
    ...BEACH_LOUNGERS,
    ...umbrellaSolids(BEACH_UMBRELLAS),
    WELCOME_POST,
    SHORE_POST,
    VENDOR,
    ...peopleSolids(BEACH_STANDING_PEOPLE)
];
export const BEACH_SOLIDS = [...BEACH_ARRIVAL_SOLIDS, ...BEACH_DRESSING_SOLIDS];
