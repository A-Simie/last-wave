import { CULLFACE_NONE, Entity, Mesh, MeshInstance, calculateNormals } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { CAFE_MODELS } from '../../data/cafeModels';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody, createStaticBox } from '../../scenes/primitives';

import { BEACH_DRINK_CART, BEACH_DRESSING_SOLIDS, BEACH_LOUNGERS, BEACH_UMBRELLAS } from './beachLayout';
import { BEACH_ARRIVAL_GROUND, BEACH_ARRIVAL_SOLIDS } from './entryLayout';

export const createBeachDressing = (parent: Entity, app: AppBase, assets: GameAssets) => {
    const root = new Entity('beach-dressing');
    parent.addChild(root);
    const materials = {
        sand: createMaterial('beach-white-sand', 0.94, 0.91, 0.8),
        wood: createMaterial('beach-boardwalk-timber', 0.54, 0.37, 0.23),
        rope: createMaterial('beach-rope', 0.85, 0.76, 0.53),
        teal: createMaterial('beach-seaglass', 0.1, 0.43, 0.41),
        coral: createMaterial('beach-coral', 0.86, 0.32, 0.16),
        gold: createMaterial('beach-marigold', 0.9, 0.63, 0.21),
        cream: createMaterial('beach-canvas', 0.94, 0.88, 0.69),
        blue: createMaterial('beach-ocean-blue', 0.14, 0.33, 0.5),
        dark: createMaterial('beach-cart-rubber', 0.1, 0.14, 0.13)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    for (const material of [materials.teal, materials.coral, materials.gold, materials.cream]) {
        material.cull = CULLFACE_NONE;
        material.update();
    }
    createStaticBox(root, BEACH_ARRIVAL_GROUND, materials.sand);
    box(root, 'beach-distant-sand', [0, -0.12, -1.6], [180, 0.2, 28.8], materials.sand);
    for (let z = -10; z < 11.5; z += 0.45)
        box(root, `arrival-board-${z}`, [0, 0.014, z], [5.5, 0.028, 0.42], materials.wood);
    for (const definition of BEACH_ARRIVAL_SOLIDS.slice(1)) {
        const fence = createStaticBody(root, definition);
        const [width, height, depth] = definition.size;
        const horizontal = width > depth;
        for (const y of [-0.15, 0.55])
            box(
                fence,
                `rope-${y}`,
                [0, y, 0],
                horizontal ? [width, 0.035, 0.04] : [0.04, 0.035, depth],
                materials.rope
            );
        const length = Math.max(width, depth);
        for (let i = 0; i <= 10; i++) {
            const p = -length / 2 + (length * i) / 10;
            box(fence, `post-${i}`, horizontal ? [p, 0, 0] : [0, 0, p], [0.12, height, 0.12], materials.teal);
        }
    }

    const canopyMeshes = [0, 1].map((parity) => {
        const positions: number[] = [];
        const indices: number[] = [];
        for (let side = parity; side < 12; side += 2) {
            const a = (side * Math.PI) / 6;
            const b = ((side + 1) * Math.PI) / 6;
            const start = positions.length / 3;
            positions.push(
                0,
                1.58,
                0,
                Math.cos(b) * 0.65,
                1.3,
                Math.sin(b) * 0.65,
                Math.cos(a) * 0.65,
                1.3,
                Math.sin(a) * 0.65,
                Math.cos(b) * 1.9,
                1,
                Math.sin(b) * 1.9,
                Math.cos(a) * 1.9,
                1,
                Math.sin(a) * 1.9
            );
            indices.push(start, start + 1, start + 2, start + 2, start + 1, start + 3, start + 2, start + 3, start + 4);
        }
        const mesh = new Mesh(app.graphicsDevice);
        mesh.setPositions(positions);
        mesh.setNormals(calculateNormals(positions, indices));
        mesh.setIndices(indices);
        mesh.update();
        return mesh;
    });
    const colors = [materials.teal, materials.coral, materials.gold];
    BEACH_UMBRELLAS.forEach((_, index) => {
        const definition = BEACH_DRESSING_SOLIDS.find(({ name }) => name === `beach-umbrella-${index}`)!;
        const umbrella = createStaticBody(root, definition);
        box(umbrella, 'umbrella-pole', [0, 0, 0], [0.1, 3, 0.1], materials.wood);
        const canopy = new Entity('striped-canopy');
        umbrella.addChild(canopy);
        canopy.addComponent('render', {
            meshInstances: [
                new MeshInstance(canopyMeshes[0], colors[index % colors.length]),
                new MeshInstance(canopyMeshes[1], materials.cream)
            ]
        });
    });
    for (const [index, definition] of BEACH_LOUNGERS.entries()) {
        const lounger = createStaticBody(root, definition);
        const fabric = colors[index % colors.length];
        box(lounger, 'lounger-seat', [0, -0.19, -0.37], [0.76, 0.08, 1.28], fabric);
        const back = box(lounger, 'lounger-back', [0, 0.22, 0.55], [0.76, 0.08, 1], fabric);
        back.setLocalEulerAngles(-55, 0, 0);
        for (const x of [-0.44, 0.44]) {
            box(lounger, `seat-frame-${x}`, [x, -0.22, -0.1], [0.07, 0.1, 1.94], materials.cream);
            const frame = box(lounger, `back-frame-${x}`, [x, 0.22, 0.55], [0.07, 0.1, 1.02], materials.cream);
            frame.setLocalEulerAngles(-55, 0, 0);
            for (const z of [-0.78, 0.73])
                box(lounger, `leg-${x}-${z}`, [x, -0.42, z], [0.075, 0.41, 0.08], materials.wood);
        }
        box(lounger, 'folded-towel', [0, -0.128, -0.6], [0.63, 0.045, 0.44], materials.cream);
    }

    const cart = createStaticBody(root, BEACH_DRINK_CART);
    box(cart, 'cart-body', [0, -0.02, 0], [3.4, 0.85, 1.16], materials.teal);
    box(cart, 'cart-countertop', [0, 0.52, 0], [3.6, 0.12, 1.3], materials.cream);
    for (const x of [-1.28, 1.28]) {
        const wheel = new Entity(`cart-wheel-${x}`);
        cart.addChild(wheel);
        wheel.setLocalPosition(x, -0.38, 0);
        wheel.setLocalScale(0.16, 0.4, 0.4);
        wheel.addComponent('render', { type: 'sphere', material: materials.dark });
    }
    for (const [index, x] of [-1.1, -0.55, 0.15, 0.72, 1.25].entries()) {
        const id = index === 0 ? 'bottle' : 'icedDrink';
        const drink = createModelInstance(assets.cafe[id], CAFE_MODELS[id], `beach-chilled-drink-${index}`).root;
        cart.addChild(drink);
        drink.setLocalPosition(x, 0.58, 0.1);
    }
    const cartSign = createTextSign(
        cart,
        app.graphicsDevice,
        'beach-citrus-menu',
        ['CITRUS & ICE', 'DAY-PASS REFILLS'],
        '#235e55',
        2.7,
        0.56
    );
    cart.addChild(cartSign);
    cartSign.setLocalPosition(0, 0.08, 0.59);
    for (const [name, lines, width] of [
        ['beach-welcome-post', ['SEAFRONT BEACH', 'SLOW DOWN. STAY AWHILE.'], 3.2],
        ['beach-shore-sign-post', ['SEA AIR', 'WATCH THE SWIMMERS'], 2]
    ] as const) {
        const definition = BEACH_DRESSING_SOLIDS.find((entry) => entry.name === name)!;
        const post = createStaticBox(root, definition, materials.teal);
        const sign = createTextSign(post, app.graphicsDevice, `${name}-sign`, [...lines], '#315854', width, 0.76);
        post.addChild(sign);
        sign.setLocalPosition(0, definition.size[1] / 2, 0.07);
    }
    for (const [index, x] of [-13, -6.5, 0, 6.5, 13].entries()) {
        const buoy = new Entity(`beach-swim-marker-${index}`);
        root.addChild(buoy);
        buoy.setLocalPosition(x, 0.05, -32);
        buoy.setLocalScale(0.44, 0.44, 0.44);
        buoy.addComponent('render', {
            type: 'sphere',
            material: index % 2 ? materials.cream : materials.coral,
            castShadows: false
        });
    }
    for (const [index, x, z] of [
        [0, -12.3, 6.4],
        [1, 7.8, 7.4],
        [2, -12, -4.1]
    ]) {
        box(root, `beach-towel-${index}`, [x, 0.015, z], [1.2, 0.025, 2], colors[index]);
        box(root, `beach-towel-stripe-${index}`, [x, 0.031, z + 0.65], [1.2, 0.012, 0.15], materials.cream);
    }
    const group = app.batcher!.addGroup('beach-static', false, 28);
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    root.findComponents('render').forEach((render) => {
        render.batchGroupId = group.id;
    });
    return { cart };
};
