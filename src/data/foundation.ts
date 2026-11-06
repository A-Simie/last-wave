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

export const GROUND: BoxDefinition = {
    name: 'ground',
    position: [5, -0.1, 14],
    size: [200, 0.2, 180]
};

export const NEIGHBOR_BUILDINGS: BoxDefinition[] = [
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

export const STREET_PLANTERS: BoxDefinition[] = [-34, -13, 20, 44].map((x, index) => ({
    name: `street-planter-${index}`,
    position: [x, 0.24, index % 2 ? 18.5 : 6.35],
    size: [1.7, 0.48, 0.8]
}));

export const SIGNAL_BOX = {
    name: 'signal-box',
    position: [-1.1, 0.6, -3.5],
    size: [0.9, 1.2, 0.9],
    label: 'Signal box',
    radius: 2.3,
    message: 'Signal box checked. The interaction is working.'
} satisfies BoxDefinition & { label: string; radius: number; message: string };
