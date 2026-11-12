import { Entity } from 'playcanvas';
import type { AppBase, StandardMaterial } from 'playcanvas';

import type { ModelAssets } from '../../core/AssetManager';
import { GROUND, NEIGHBOR_BUILDINGS, STREET_EXTENTS, STREET_PLANTERS } from '../../data/foundation';
import { createPreparedModel } from '../../scenes/createPreparedModel';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody, createStaticBox } from '../../scenes/primitives';

import { RESTAURANT_BLOCKS } from './restaurantLayout';
import { STREET_BUILDING_MODELS } from './streetLayout';

const SHOP_SIGNS: Record<string, readonly string[]> = {
    'blue-corner-shop': ['SALT & SUN', 'NEIGHBORHOOD STORE'],
    'sunrise-bakery': ['SUNRISE', 'BAKERY · OPEN DAILY'],
    'coast-pharmacy': ['COAST PHARMACY', 'WATER · SUN CARE'],
    'lemon-grocer': ['LEMON MARKET', 'FRESH FRUIT & COLD DRINKS'],
    'paper-and-post': ['PAPER & POST', 'BOOKS · STATIONERY'],
    'citrus-corner': ['CITRUS CORNER', 'JUICE · ICE · TAKEAWAY'],
    'harbor-outfitters': ['HARBOR OUTFITTERS', 'A DAY BY THE SEA'],
    'west-seafront-shop-0': ['SEA SALT', 'ICE CREAM & SORBET'],
    'west-seafront-shop-2': ['THE LITTLE LANTERN', 'GIFTS · BOOKS · ODDITIES'],
    'ocean-bicycle-shop': ['OCEAN CYCLES', 'RENTALS · REPAIRS'],
    'east-flower-shop': ['PETALS BY THE SEA', 'FLOWERS · PLANTS'],
    'coastal-market': ['COASTAL MARKET', 'FRUIT · BREAD · LOCAL GOODS'],
    'market-street-building-3': ['MARIGOLD', 'NEIGHBORHOOD KITCHEN'],
    'market-street-building-8': ['HARBOR COFFEE', 'MARKET STREET']
};

export const createCafeSurroundings = (parent: Entity, app: AppBase, models: ModelAssets = {}) => {
    const root = new Entity('cafe-neighborhood');
    parent.addChild(root);
    const materials = {
        paving: createMaterial('warm-paving', 0.58, 0.52, 0.43),
        asphalt: createMaterial('street-asphalt', 0.24, 0.27, 0.28),
        cream: createMaterial('coastal-stucco', 0.8, 0.71, 0.55),
        coral: createMaterial('terracotta-stucco', 0.7, 0.38, 0.27),
        blue: createMaterial('blue-stucco', 0.36, 0.52, 0.53),
        trim: createMaterial('limestone-trim', 0.9, 0.8, 0.61),
        glass: createMaterial('shaded-windows', 0.13, 0.25, 0.27),
        wood: createMaterial('townhouse-doors', 0.24, 0.16, 0.1),
        metal: createMaterial('street-metal', 0.16, 0.23, 0.22),
        leaves: createMaterial('palm-leaves', 0.29, 0.43, 0.23),
        soil: createMaterial('planter-soil', 0.23, 0.17, 0.1),
        white: createMaterial('street-markings', 0.9, 0.87, 0.74),
        lawn: createMaterial('front-lawn', 0.33, 0.47, 0.25)
    };
    const imported: Entity[] = [];
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    createStaticBox(root, GROUND, materials.paving);
    const { west, east, marketZ } = STREET_EXTENTS;
    const middle = (west + east) / 2;
    const length = east - west;
    for (const [name, z] of [
        ['seafront-road', 13.2],
        ['market-street-road', marketZ]
    ] as const) {
        box(root, name, [middle, 0.003, z], [length, 0.006, 8], materials.asphalt);
        for (const side of [-1, 1]) {
            box(root, `sidewalk-${name}-${side}`, [middle, 0.012, z + side * 6], [length, 0.024, 3.6], materials.trim);
            box(
                root,
                `street-gutter-${name}-${side}`,
                [middle, 0.019, z + side * 4.05],
                [length, 0.015, 0.18],
                materials.white
            );
        }
        for (let x = west + 6; x < east; x += 7) {
            if (Math.abs(x - 63) < 8 || Math.abs(x + 55) < 8) continue;
            box(root, `lane-divider-${name}-${x}`, [x, 0.008, z], [3.4, 0.006, 0.12], materials.white);
        }
    }
    box(root, 'east-side-street', [63, 0.004, 14], [8, 0.006, 240], materials.asphalt);
    box(root, 'west-side-street', [-55, 0.004, 28], [8, 0.006, 84], materials.asphalt);
    for (const x of [-61, -49, 57, 69]) {
        box(root, `cross-street-walk-${x}`, [x, 0.012, 44], [3.6, 0.024, 20], materials.trim);
    }
    for (const [x, centerZ] of [
        [10.3, 13.2],
        [-96, 13.2],
        [116, 13.2],
        [-28, marketZ],
        [104, marketZ]
    ]) {
        for (let z = centerZ - 3.5; z < centerZ + 3.8; z += 0.94)
            box(root, `crosswalk-${x}-${z}`, [x, 0.013, z], [3, 0.009, 0.48], materials.white);
    }
    const paints = [materials.coral, materials.blue, materials.cream];
    for (const [index, definition] of NEIGHBOR_BUILDINGS.entries()) {
        if (RESTAURANT_BLOCKS.has(definition.name)) continue;
        const modelId = STREET_BUILDING_MODELS[definition.name];
        const resource = modelId ? models[modelId] : undefined;
        if (modelId && resource) {
            // Supplied building: keep the block's collision volume, fit the model inside it and face the road.
            const body = createStaticBody(root, definition);
            const [width, height, depth] = definition.size;
            box(body, 'front-lawn', [0, 0.012 - height / 2, 0], [width, 0.024, depth], materials.lawn);
            const model = createPreparedModel(resource, modelId, `${definition.name}-${modelId}`, {
                footprint: [width - 0.4, depth - 0.4]
            });
            body.addChild(model.root);
            model.root.setLocalPosition(0, 0.024 - height / 2, 0);
            imported.push(model.root);
            continue;
        }
        const building = createStaticBox(root, definition, paints[index % paints.length]);
        const [width, height, depth] = definition.size;
        box(building, 'roof-cornice', [0, height / 2 - 0.1, 0], [width + 0.25, 0.24, depth + 0.25], materials.trim);
        box(
            building,
            'floor-band',
            [0, 3.15 - height / 2, depth / 2 + 0.035],
            [width + 0.08, 0.14, 0.12],
            materials.trim
        );
        for (const x of [-width * 0.31, 0, width * 0.31]) {
            for (let level = 4.25; level < height - 0.55; level += 2.5) {
                const y = level - height / 2;
                box(building, `window-frame-${x}-${y}`, [x, y, depth / 2 + 0.04], [1.25, 1.5, 0.08], materials.trim);
                box(building, `window-${x}-${y}`, [x, y, depth / 2 + 0.09], [1.05, 1.3, 0.03], materials.glass);
                box(building, `sill-${x}-${y}`, [x, y - 0.8, depth / 2 + 0.1], [1.38, 0.1, 0.34], materials.trim);
            }
        }
        box(building, 'door', [0, -height / 2 + 1.1, depth / 2 + 0.06], [1.15, 2.2, 0.09], materials.wood);
        const signLines = SHOP_SIGNS[definition.name];
        for (const x of [-width * 0.29, width * 0.29]) {
            box(
                building,
                `shop-frame-${x}`,
                [x, 1.25 - height / 2, depth / 2 + 0.06],
                [width * 0.29, 2.35, 0.1],
                materials.trim
            );
            box(
                building,
                `shop-window-${x}`,
                [x, 1.25 - height / 2, depth / 2 + 0.12],
                [width * 0.29 - 0.2, 2.15, 0.03],
                materials.glass
            );
        }
        box(
            building,
            'entry-awning',
            [0, -height / 2 + 2.75, depth / 2 + 0.46],
            [width * 0.92, 0.12, 1.04],
            paints[(index + 1) % paints.length]
        );
        box(
            building,
            'awning-valance',
            [0, -height / 2 + 2.64, depth / 2 + 0.96],
            [width * 0.92, 0.2, 0.055],
            materials.trim
        );
        if (signLines) {
            const sign = createTextSign(
                root,
                app.graphicsDevice,
                `${definition.name}-sign`,
                signLines,
                '#28534d',
                Math.min(4.1, width * 0.7)
            );
            building.addChild(sign);
            sign.setLocalPosition(0, 3.58 - height / 2, depth / 2 + 0.3);
            sign.setLocalScale(sign.getLocalScale().x, 1, 0.9);
        }
    }

    const round = (owner: Entity, name: string, type: 'cylinder' | 'sphere', material: StandardMaterial) => {
        const entity = new Entity(name);
        owner.addChild(entity);
        entity.addComponent('render', { type, material });
        return entity;
    };
    for (const definition of STREET_PLANTERS) {
        const planter = createStaticBox(root, definition, materials.cream);
        box(planter, 'soil', [0, 0.244, 0], [1.55, 0.02, 0.67], materials.soil);
        const trunk = round(planter, 'palm-trunk', 'cylinder', materials.wood);
        trunk.setLocalPosition(0, 1.74, 0);
        trunk.setLocalScale(0.18, 3, 0.18);
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const frond = round(planter, `palm-frond-${i}`, 'sphere', materials.leaves);
            frond.setLocalPosition(Math.sin(angle) * 0.65, 3.13, Math.cos(angle) * 0.65);
            frond.setLocalScale(0.65, 0.2, 2.3);
            frond.setLocalEulerAngles(18, i * 60, 0);
        }
    }
    for (const [x, z] of [
        ...[-136, -110, -80, -39, -18, 1, 25, 48, 79, 104, 133, 151].map((x) => [x, 18.1]),
        ...[-132, -96, -38, 4, 41, 82, 123, 151].map((x) => [x, marketZ + 4.9])
    ]) {
        const post = round(root, `street-lamp-${x}-${z}`, 'cylinder', materials.metal);
        post.setLocalPosition(x, 2.35, z);
        post.setLocalScale(0.09, 4.7, 0.09);
        box(root, `lamp-arm-${x}-${z}`, [x, 4.63, z - 0.5], [0.08, 0.08, 1.05], materials.metal);
        box(root, `lamp-shade-${x}-${z}`, [x, 4.59, z - 1], [0.38, 0.09, 0.64], materials.trim);
    }
    const directions = createTextSign(
        root,
        app.graphicsDevice,
        'seafront-street-sign',
        ['SEAFRONT AVENUE', 'BEACH  →'],
        '#315854',
        2.2
    );
    root.addChild(directions);
    directions.setLocalPosition(11.6, 2.55, 8.7);
    directions.setLocalEulerAngles(90, 180, 0);
    box(root, 'directions-post', [11.6, 1.22, 8.74], [0.06, 2.44, 0.06], materials.metal);
    const group = app.batcher!.addGroup('seafront-static', false, 28);
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    root.findComponents('render').forEach((render) => {
        // Imported buildings keep their own materials/draws; only the procedural kit is batched.
        if (!imported.some((model) => render.entity.isDescendantOf(model) || render.entity === model))
            render.batchGroupId = group.id;
    });
    return root;
};
