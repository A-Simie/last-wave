import { NEIGHBOR_BUILDINGS } from '../../data/foundation.ts';
import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';

import { cafeModelBox } from './cafeLayout.ts';

const DEFINITIONS = [
    {
        block: 'sunrise-bakery',
        title: 'SUNRISE BAKEHOUSE',
        menu: 'BREAD - COFFEE - BREAKFAST',
        color: [0.73, 0.39, 0.24]
    },
    { block: 'citrus-corner', title: 'SALT & CITRUS', menu: 'COASTAL KITCHEN - FRESH JUICE', color: [0.23, 0.48, 0.4] },
    { block: 'harbor-outfitters', title: 'HARBOR NOODLES', menu: 'RAMEN - RICE BOWLS - TEA', color: [0.3, 0.41, 0.56] },
    {
        block: 'market-street-building-3',
        title: 'MARIGOLD KITCHEN',
        menu: 'LOCAL PLATES - DAILY SPECIALS',
        color: [0.69, 0.48, 0.2]
    }
] as const;

export const RESTAURANTS = DEFINITIONS.map((definition) => {
    const block = NEIGHBOR_BUILDINGS.find(({ name }) => name === definition.block);
    if (!block) throw new Error(`Missing restaurant block ${definition.block}`);
    const [width, , depth] = block.size;
    const doorWidth = 2.8;
    const panelWidth = (width - doorWidth) / 2;
    const wall = (name: string, position: Vector3Tuple, size: Vector3Tuple): BoxDefinition => ({
        name: `${definition.block}-${name}`,
        position,
        size
    });
    const tables: Vector3Tuple[] = [
        [0, 0.03, 0],
        [width * 0.28, 0.03, -depth * 0.2],
        [-width * 0.28, 0.03, depth * 0.16]
    ];
    const chairs = tables.flatMap(([x, y, z]) => [
        { position: [x, y, z - 1.08] as Vector3Tuple, yaw: 0 },
        { position: [x, y, z + 1.08] as Vector3Tuple, yaw: 180 }
    ]);
    const plants: Vector3Tuple[] = [
        [width / 2 - 0.65, 0.03, -depth / 2 + 0.7],
        [-width / 2 + 0.65, 0.03, depth / 2 - 0.7]
    ];
    const shell = [
        wall('west-wall', [-width / 2, 2, 0], [0.2, 4, depth]),
        wall('east-wall', [width / 2, 2, 0], [0.2, 4, depth]),
        wall('back-wall', [0, 2, -depth / 2], [width, 4, 0.2]),
        ...[-1, 1].map((side) =>
            wall(`front-${side}`, [(side * (doorWidth + panelWidth)) / 2, 2, depth / 2], [panelWidth, 4, 0.2])
        ),
        wall('lintel', [0, 3.45, depth / 2], [doorWidth, 1.1, 0.2]),
        wall('ceiling', [0, 4.1, 0], [width + 0.3, 0.2, depth + 0.3])
    ];
    const counter = wall('counter', [-width * 0.3, 0.55, -depth * 0.32], [2.8, 1.1, 0.8]);
    const solids = [
        ...shell,
        counter,
        ...tables.map((p, i) => cafeModelBox(`${definition.block}-table-${i}`, 'roundTable', p)),
        ...chairs.map(({ position, yaw }, i) => cafeModelBox(`${definition.block}-chair-${i}`, 'chair', position, yaw)),
        ...plants.map((position, i) => cafeModelBox(`${definition.block}-plant-${i}`, 'plant', position))
    ];
    const world = (position: readonly number[]): Vector3Tuple => {
        const angle = ((block.yaw ?? 0) * Math.PI) / 180;
        return [
            block.position[0] + position[0] * Math.cos(angle) + position[2] * Math.sin(angle),
            position[1],
            block.position[2] - position[0] * Math.sin(angle) + position[2] * Math.cos(angle)
        ];
    };
    return {
        ...definition,
        block,
        width,
        depth,
        shell,
        counter,
        tables,
        chairs,
        plants,
        world,
        solids: solids.map((solid) => ({
            ...solid,
            position: world(solid.position),
            yaw: (solid.yaw ?? 0) + (block.yaw ?? 0)
        }))
    };
});

export const RESTAURANT_BLOCKS = new Set(RESTAURANTS.map(({ block }) => block.name));
export const STREET_BUILDING_SOLIDS = [
    ...NEIGHBOR_BUILDINGS.filter(({ name }) => !RESTAURANT_BLOCKS.has(name)),
    ...RESTAURANTS.flatMap(({ solids }) => solids)
];
