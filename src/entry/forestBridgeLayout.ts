import deck from './forestBridgeProfile.json';

export const FOREST_PIT = { west: -0.6, east: 10.8, back: -4, front: 16, floor: -13.2 } as const;
export const FOREST_SIGN = { x: 5, y: -9.9, z: 0.5, width: 3.8, height: 5.6 } as const;
export const FOREST_FORM = { width: 420, height: 620, worldWidth: 3.4, worldHeight: 5.02 } as const;
export const forestSignTurn = (time: number) => {
    const t = Math.max(0, Math.min(1, (time - 42) / 2));
    return 180 * (1 - t * t * (3 - 2 * t));
};
export const forestBridgeHeight = (worldX: number) => {
    const x = worldX - 5;
    if (x < deck[0][0]) return 0.04 + deck[0][1] * Math.max(0, Math.min(1, (x + 6.7) / 1.35));
    if (x > deck.at(-1)![0]) return 0.04 + deck.at(-1)![1] * Math.max(0, Math.min(1, (6.7 - x) / 1.35));
    const index = deck.findIndex(([px]) => px >= x);
    const a = deck[Math.max(0, index - 1)],
        b = deck[index];
    const t = a === b ? 0 : (x - a[0]) / (b[0] - a[0]);
    return 0.04 + a[1] + (b[1] - a[1]) * t;
};
