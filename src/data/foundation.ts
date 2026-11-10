export type Vector3Tuple = [number, number, number];

export type BoxDefinition = {
    name: string;
    position: Vector3Tuple;
    size: Vector3Tuple;
    yaw?: number;
};

export const PLAYER_SPAWN: Vector3Tuple = [6.15, 1.05, 0];
export const CHARACTER_COLLISION = {
    halfExtents: [0.4, 1.2, 0.4] as Vector3Tuple,
    offset: [0, 0.2, 0] as Vector3Tuple
};
export const NPC_POSITION: Vector3Tuple = [-1.1, 1, -5.5];
export const GUIDE_INTERACTION = { label: 'Guide', radius: 2.3 };

export const TIDELINE_V4_GROUND: BoxDefinition = {
    name: 'ground',
    position: [5, -0.1, 14],
    size: [200, 0.2, 180]
};

export const TIDELINE_V4_BUILDINGS: readonly BoxDefinition[] = [
    { name: 'terracotta-townhouse', position: [-6.8, 2.75, -4.4], size: [4.3, 5.5, 6.3] },
    { name: 'blue-corner-shop', position: [-5.8, 2.4, 2.7], size: [6.4, 4.8, 5.8] },
    { name: 'tideline-neighbor', position: [5.3, 3.3, -9.4], size: [10.1, 6.6, 6.9] },
    { name: 'palm-apartments', position: [-44, 3.5, 0.5], size: [12, 7, 10] },
    { name: 'market-terrace', position: [-30, 4.5, 0], size: [13, 9, 11] },
    { name: 'sunrise-bakery', position: [-16, 3.4, 0.6], size: [10, 6.8, 10] },
    { name: 'coast-pharmacy', position: [17, 3.2, 0.1], size: [12, 6.4, 11] },
    { name: 'seabreeze-homes', position: [31, 4.8, -0.4], size: [13, 9.6, 12] },
    { name: 'lemon-grocer', position: [46, 3.6, 0.1], size: [14, 7.2, 11] },
    { name: 'south-townhouses', position: [-43, 4, 27.6], size: [14, 8, 12], yaw: 180 },
    { name: 'tram-house', position: [-26, 5.5, 27.6], size: [15, 11, 12], yaw: 180 },
    { name: 'paper-and-post', position: [-8, 3.9, 27.6], size: [17, 7.8, 12], yaw: 180 },
    { name: 'citrus-corner', position: [11, 4.6, 27.6], size: [16, 9.2, 12], yaw: 180 },
    { name: 'harbor-outfitters', position: [30, 3.5, 27.6], size: [17, 7, 12], yaw: 180 },
    { name: 'east-residences', position: [49, 4.8, 27.6], size: [17, 9.6, 12], yaw: 180 }
];

export const TIDELINE_V4_PLANTERS: readonly BoxDefinition[] = [-34, -13, 20, 44].map((x, index) => ({
    name: `street-planter-${index}`,
    position: [x, 0.24, index % 2 ? 18.5 : 6.35],
    size: [1.7, 0.48, 0.8]
}));

export const GROUND: BoxDefinition = { ...TIDELINE_V4_GROUND, size: [320, 0.2, 240] };
export const STREET_EXTENTS = { west: -146, east: 156, marketZ: 47 } as const;
export const NEIGHBOR_BUILDINGS: readonly BoxDefinition[] = [
    ...TIDELINE_V4_BUILDINGS,
    ...[-70, -88, -106, -124].flatMap((x, index): BoxDefinition[] => [
        {
            name: `west-seafront-shop-${index}`,
            position: [x, 3.2 + (index % 2) * 1.2, 0],
            size: [14, 6.4 + (index % 2) * 2.4, 11]
        },
        {
            name: `west-seafront-homes-${index}`,
            position: [x, 4.2 + (index % 2) * 0.8, 27.6],
            size: [14, 8.4 + (index % 2) * 1.6, 12],
            yaw: 180
        }
    ]),
    { name: 'ocean-bicycle-shop', position: [109, 3.1, 0.1], size: [14, 6.2, 11] },
    { name: 'shell-house', position: [129, 4.5, 0.1], size: [16, 9, 11] },
    { name: 'east-flower-shop', position: [148, 3.2, 0.1], size: [14, 6.4, 11] },
    { name: 'marina-homes', position: [82, 4.6, 27.6], size: [18, 9.2, 12], yaw: 180 },
    { name: 'coastal-market', position: [106, 3.4, 27.6], size: [20, 6.8, 12], yaw: 180 },
    { name: 'sailmakers-court', position: [132, 4.4, 27.6], size: [22, 8.8, 12], yaw: 180 },
    ...[-124, -98, -74, -40, -12, 16, 43, 86, 118, 146].map((x, index): BoxDefinition => ({
        name: `market-street-building-${index}`,
        position: [x, 3.6 + (index % 3) * 0.8, 62.6],
        size: [index === 6 ? 16 : 19, 7.2 + (index % 3) * 1.6, 14],
        yaw: 180
    }))
];
export const STREET_PLANTERS: readonly BoxDefinition[] = [
    ...TIDELINE_V4_PLANTERS,
    ...[-132, -113, -84, -65, 101, 123, 146].map((x, index): BoxDefinition => ({
        name: `seafront-extension-planter-${index}`,
        position: [x, 0.24, index % 2 ? 18.5 : 6.35],
        size: [1.7, 0.48, 0.8]
    })),
    ...[-116, -86, -20, 30, 90, 135].map((x, index): BoxDefinition => ({
        name: `market-street-planter-${index}`,
        position: [x, 0.24, 52.1],
        size: [1.7, 0.48, 0.8]
    }))
];

export const SIGNAL_BOX = {
    name: 'signal-box',
    position: [-1.1, 0.6, -3.5],
    size: [0.9, 1.2, 0.9],
    label: 'Signal box',
    radius: 2.3,
    message: 'Signal box checked. The interaction is working.'
} satisfies BoxDefinition & { label: string; radius: number; message: string };
