import { Entity } from 'playcanvas';
import type { AppBase, StandardMaterial } from 'playcanvas';

import { GROUND, NEIGHBOR_BUILDINGS, STREET_PLANTERS } from '../../data/foundation';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBox } from '../../scenes/primitives';

const SHOP_SIGNS: Record<string, readonly string[]> = {
    'blue-corner-shop': ['SALT & SUN', 'NEIGHBORHOOD STORE'],
    'sunrise-bakery': ['SUNRISE', 'BAKERY · OPEN DAILY'],
    'coast-pharmacy': ['COAST PHARMACY', 'WATER · SUN CARE'],
    'lemon-grocer': ['LEMON MARKET', 'FRESH FRUIT & COLD DRINKS'],
    'paper-and-post': ['PAPER & POST', 'BOOKS · STATIONERY'],
    'citrus-corner': ['CITRUS CORNER', 'JUICE · ICE · TAKEAWAY'],
    'harbor-outfitters': ['HARBOR OUTFITTERS', 'A DAY BY THE SEA']
};

export const createCafeSurroundings = (parent: Entity, app: AppBase) => {
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
        white: createMaterial('street-markings', 0.9, 0.87, 0.74)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    createStaticBox(root, GROUND, materials.paving);
    box(root, 'seafront-road', [5, 0.003, 13.2], [200, 0.006, 8], materials.asphalt);
    box(root, 'east-side-street', [63, 0.004, 14], [8, 0.006, 180], materials.asphalt);
    for (const z of [7.4, 19.4]) {
        box(root, `sidewalk-${z}`, [3, 0.012, z], [112, 0.024, 3.6], materials.trim);
    }
    for (let x = -87; x < 100; x += 7) {
        if (x > 55 && x < 70) continue;
        box(root, `lane-divider-${x}`, [x, 0.008, 13.2], [3.4, 0.006, 0.12], materials.white);
    }
    for (const z of [9.15, 17.25]) {
        box(root, `street-gutter-${z}`, [3, 0.019, z], [112, 0.015, 0.18], materials.white);
    }
    for (let z = 9.7; z < 17; z += 0.94) {
        box(root, `crosswalk-${z}`, [10.3, 0.013, z], [3, 0.009, 0.48], materials.white);
    }
    const paints = [materials.coral, materials.blue, materials.cream];
    for (const [index, definition] of NEIGHBOR_BUILDINGS.entries()) {
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
    for (const x of [-39, -18, 1, 25, 48]) {
        const post = round(root, `street-lamp-${x}`, 'cylinder', materials.metal);
        post.setLocalPosition(x, 2.35, 18.1);
        post.setLocalScale(0.09, 4.7, 0.09);
        box(root, `lamp-arm-${x}`, [x, 4.63, 17.6], [0.08, 0.08, 1.05], materials.metal);
        box(root, `lamp-shade-${x}`, [x, 4.59, 17.1], [0.38, 0.09, 0.64], materials.trim);
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
        render.batchGroupId = group.id;
    });
    return root;
};
