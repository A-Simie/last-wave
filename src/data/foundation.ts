export type Vector3Tuple = [number, number, number];

export type BoxDefinition = {
    name: string;
    position: Vector3Tuple;
    size: Vector3Tuple;
    yaw?: number;
};

export const PLAYER_SPAWN: Vector3Tuple = [0, 1.1, 0];
export const NPC_POSITION: Vector3Tuple = [1.8, 1, -5.5];
export const GUIDE_INTERACTION = { label: 'Guide', radius: 2.3 };

export const GROUND: BoxDefinition = {
    name: 'ground',
    position: [0, -0.1, 0],
    size: [20, 0.2, 20]
};

export const WALLS: BoxDefinition[] = [
    { name: 'wall-north', position: [0, 1.6, -9.75], size: [20, 3.2, 0.5] },
    { name: 'wall-south', position: [0, 1.6, 9.75], size: [20, 3.2, 0.5] },
    { name: 'wall-west', position: [-9.75, 1.6, 0], size: [0.5, 3.2, 19] },
    { name: 'wall-east', position: [9.75, 1.6, 0], size: [0.5, 3.2, 19] }
];

export const BLOCKS: BoxDefinition[] = [
    { name: 'block-0', position: [-4.5, 0.5, -3.5], size: [2.4, 1, 2.4], yaw: 0 },
    { name: 'block-1', position: [4.2, 0.5, -2.8], size: [2.4, 1, 2.4], yaw: 25 },
    { name: 'block-2', position: [-3.7, 0.5, 3.2], size: [2.4, 1, 2.4], yaw: 50 },
    { name: 'block-3', position: [3.8, 0.5, 3.6], size: [2.4, 1, 2.4], yaw: 75 }
];

export const WOOD_PROPS: BoxDefinition[] = [
    { name: 'fallen-log', position: [0, 0.35, 6], size: [3.8, 0.7, 0.7] },
    { name: 'stump', position: [-1.8, 0.4, -2.2], size: [0.9, 0.8, 0.9] }
];

export const TREES: { x: number; z: number; size: number }[] = [
    { x: -7, z: -6, size: 1.1 },
    { x: 6.5, z: -6.5, size: 1.25 },
    { x: -7.5, z: 5, size: 0.9 },
    { x: 7, z: 5.5, size: 1.15 },
    { x: -2.2, z: -8, size: 0.85 }
];

export const PINE_LAYERS = [
    { y: 1.9, width: 2.1, height: 1.8 },
    { y: 2.65, width: 1.6, height: 1.55 },
    { y: 3.3, width: 1.1, height: 1.4 }
];

export const SIGNAL_BOX = {
    name: 'signal-box',
    position: [1.8, 0.6, -3.5],
    size: [0.9, 1.2, 0.9],
    label: 'Signal box',
    radius: 2.3,
    message: 'Signal box checked. The interaction is working.'
} satisfies BoxDefinition & { label: string; radius: number; message: string };
