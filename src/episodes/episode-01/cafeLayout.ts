import { CAFE_MODELS } from '../../data/cafeModels.ts';
import type { CafeModelId } from '../../data/cafeModels.ts';
import type { CharacterModelId, CharacterPose } from '../../data/characterModels.ts';
import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

export const CAFE_FLOOR_Y = 0.014;
export const CAFE_TABLETOP_Y = CAFE_FLOOR_Y + CAFE_MODELS.table.height;
export const CAFE_FLOOR = { center: [4.8, CAFE_FLOOR_Y, 0.4] as Vector3Tuple, width: 9.36, depth: 10.72 };

export const cafeModelBox = (name: string, id: CafeModelId, position: Vector3Tuple, yaw = 0): BoxDefinition => {
    const { dims, scale, height } = CAFE_MODELS[id];
    return {
        name,
        position: [position[0], position[1] + height / 2, position[2]],
        size: [dims[0] * scale, height, dims[2] * scale],
        yaw
    };
};

export const CAFE_BACK_WALL: BoxDefinition = {
    name: 'cafe-back-wall',
    position: [4.8, 1.82, -4.96],
    size: [9.36, 3.64, 0.16]
};
export const CAFE_CEILING: BoxDefinition = {
    name: 'cafe-ceiling',
    position: [4.8, 3.74, 0.4],
    size: [9.36, 0.16, 10.72]
};
export const CAFE_SHELL: BoxDefinition[] = [
    { name: 'cafe-west-wall', position: [0.12, 1.82, 0.4], size: [0.16, 3.64, 10.72] },
    { name: 'cafe-east-wall', position: [9.53, 1.82, 0.4], size: [0.12, 3.64, 10.72] },
    { name: 'cafe-front-wall', position: [3.64, 1.82, 5.76], size: [6.96, 3.64, 0.16] },
    { name: 'cafe-door-right', position: [9.31, 1.82, 5.76], size: [0.42, 3.64, 0.16] },
    { name: 'cafe-door-lintel', position: [8.1, 3.17, 5.76], size: [2, 0.94, 0.16] }
];
export const CAFE_TV_SHELF: BoxDefinition = {
    name: 'cafe-tv-shelf',
    position: [7.56, 1.93, -4.52],
    size: [2.15, 0.08, 0.72]
};
export const CAFE_BACKBAR: BoxDefinition = {
    name: 'cafe-backbar',
    position: [5.53, CAFE_FLOOR_Y + 0.47, -4.32],
    size: [5.4, 0.94, 0.94]
};
export const CAFE_FRIDGE = cafeModelBox('cafe-fridge', 'fridge', [8.96, CAFE_FLOOR_Y, -4.31]);
export const CAFE_CHAIR_A = cafeModelBox('cafe-chair-a', 'chair', [7.7, CAFE_FLOOR_Y, -1.15]);
export const CAFE_CHAIR_B = cafeModelBox('cafe-chair-b', 'chair', [7.7, CAFE_FLOOR_Y, 1.15], 180);
export const CAFE_WINDOW_TABLE = cafeModelBox('cafe-window-table', 'roundTable', [8.55, CAFE_FLOOR_Y, 2.65]);
export const CAFE_WINDOW_CHAIR = cafeModelBox('cafe-window-chair', 'chair', [7.43, CAFE_FLOOR_Y, 2.65], 90);
export const CAFE_STOOL = cafeModelBox('cafe-stool', 'stool', [8.82, CAFE_FLOOR_Y, -1.59]);
export const CAFE_EXTRA_TABLES = [
    cafeModelBox('cafe-west-table', 'roundTable', [1.7, CAFE_FLOOR_Y, 0]),
    cafeModelBox('cafe-front-table', 'roundTable', [3.8, CAFE_FLOOR_Y, 3])
];
export const CAFE_EXTRA_CHAIRS = [
    cafeModelBox('cafe-west-chair-a', 'chair', [1.7, CAFE_FLOOR_Y, -1.12]),
    cafeModelBox('cafe-west-chair-b', 'chair', [1.7, CAFE_FLOOR_Y, 1.12], 180),
    cafeModelBox('cafe-front-chair-a', 'chair', [2.68, CAFE_FLOOR_Y, 3], 90),
    cafeModelBox('cafe-front-chair-b', 'chair', [4.92, CAFE_FLOOR_Y, 3], -90)
];
export const CAFE_PATRONS: {
    name: string;
    model: CharacterModelId;
    position: Vector3Tuple;
    yaw: number;
    pose: CharacterPose;
}[] = [
    { name: 'cafe-patron-window', model: 'patronLong', position: [7.737, 0.026, 2.65], yaw: 90, pose: 'seated' },
    { name: 'cafe-patron-west-a', model: 'patronBuzz', position: [1.7, 0.018, -0.813], yaw: 0, pose: 'seatedTalk' },
    { name: 'cafe-patron-west-b', model: 'patronShort', position: [1.7, 0.026, 0.813], yaw: 180, pose: 'seated' },
    { name: 'cafe-patron-front-a', model: 'patronBeard', position: [2.987, 0.018, 3], yaw: 90, pose: 'seated' },
    { name: 'cafe-patron-front-b', model: 'patronBuns', position: [4.613, 0.026, 3], yaw: -90, pose: 'seatedTalk' }
];
export const CAFE_SOLIDS = [
    CAFE_BACK_WALL,
    CAFE_CEILING,
    ...CAFE_SHELL,
    CAFE_TV_SHELF,
    CAFE_BACKBAR,
    CAFE_FRIDGE,
    CAFE_CHAIR_A,
    CAFE_CHAIR_B,
    CAFE_WINDOW_TABLE,
    CAFE_WINDOW_CHAIR,
    CAFE_STOOL,
    ...CAFE_EXTRA_TABLES,
    ...CAFE_EXTRA_CHAIRS
];
