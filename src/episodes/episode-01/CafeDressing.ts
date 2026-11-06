import { Color, Entity, Texture } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { CAFE_MODELS } from '../../data/cafeModels';
import type { CafeModelId } from '../../data/cafeModels';
import type { BoxDefinition, Vector3Tuple } from '../../data/foundation';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody, createStaticBox } from '../../scenes/primitives';

import { createCoastalView } from './CafeArtwork';
import {
    CAFE_BACK_WALL,
    CAFE_BACKBAR,
    CAFE_CEILING,
    CAFE_CHAIR_A,
    CAFE_CHAIR_B,
    CAFE_EXTRA_CHAIRS,
    CAFE_EXTRA_TABLES,
    CAFE_FLOOR,
    CAFE_FLOOR_Y,
    CAFE_FRIDGE,
    CAFE_PATRONS,
    CAFE_SHELL,
    CAFE_STOOL,
    CAFE_TABLETOP_Y,
    CAFE_TV_SHELF,
    CAFE_WINDOW_CHAIR,
    CAFE_WINDOW_TABLE
} from './cafeLayout';
import { OPENING_COUNTER, OPENING_TABLE, OPENING_TV } from './openingLayout';

export const createCafeDressing = (stage: Entity, assets: GameAssets, device: GraphicsDevice) => {
    const root = new Entity('cafe-dressing');
    stage.addChild(root);
    const materials = {
        plaster: createMaterial('cafe-plaster', 0.83, 0.69, 0.51),
        teal: createMaterial('cafe-paneling', 0.17, 0.29, 0.27),
        wood: createMaterial('cafe-trim', 0.3, 0.16, 0.085),
        brass: createMaterial('cafe-brass', 0.74, 0.47, 0.2),
        floor: createMaterial('cafe-tiles', 1, 1, 1)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));

    const tile = document.createElement('canvas');
    tile.width = 128;
    tile.height = 128;
    const context = tile.getContext('2d');
    if (!context) throw new Error('Café tiles require a canvas context.');
    context.fillStyle = '#ac8e6f';
    context.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
            context.fillStyle = x === y ? '#d9bc95' : '#bca687';
            context.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        }
    }
    const texture = new Texture(device, { name: 'cafe-tiles', anisotropy: 4 });
    root.once('destroy', () => texture.destroy());
    texture.setSource(tile);
    materials.floor.diffuseMap = texture;
    materials.floor.diffuseMapTiling.set(8, 9);
    materials.floor.update();
    const floor = new Entity('cafe-tiled-floor');
    root.addChild(floor);
    floor.setLocalPosition(...CAFE_FLOOR.center);
    floor.setLocalScale(CAFE_FLOOR.width, 1, CAFE_FLOOR.depth);
    floor.addComponent('render', { type: 'plane', material: materials.floor, castShadows: false });

    createStaticBox(root, CAFE_BACK_WALL, materials.plaster);
    createStaticBox(root, CAFE_CEILING, materials.plaster);
    CAFE_SHELL.forEach((wall) => createStaticBox(root, wall, materials.plaster));
    createStaticBox(root, CAFE_TV_SHELF, materials.wood);
    for (const x of [6.84, 8.28]) {
        box(root, `cafe-tv-bracket-${x}`, [x, 1.78, -4.78], [0.055, 0.22, 0.18], materials.brass);
    }
    box(root, 'cafe-back-panel', [4.8, 0.47, -4.872], [9.36, 0.94, 0.015], materials.teal);
    box(root, 'cafe-west-panel', [0.208, 0.47, 0.4], [0.016, 0.94, 10.72], materials.teal);
    box(root, 'cafe-front-panel', [3.64, 0.47, 5.67], [6.96, 0.94, 0.016], materials.teal);
    for (const x of [7.13, 9.07]) {
        box(root, `cafe-door-frame-${x}`, [x, 1.34, 5.67], [0.08, 2.68, 0.18], materials.wood);
    }
    box(root, 'cafe-door-header', [8.1, 2.69, 5.67], [2.02, 0.12, 0.18], materials.wood);
    box(root, 'cafe-door-threshold', [8.1, 0.025, 5.76], [1.88, 0.03, 0.32], materials.wood);
    box(root, 'cafe-east-panel', [9.475, 0.47, -0.25], [0.04, 0.94, 9.4], materials.teal);
    box(root, 'cafe-east-plaster', [9.475, 2.27, -3.44], [0.04, 2.66, 2.86], materials.plaster);
    box(root, 'cafe-window-sill', [9.33, 0.97, 1.26], [0.3, 0.1, 6.32], materials.wood);
    box(root, 'cafe-east-cornice', [9.42, 3.51, -0.25], [0.16, 0.26, 9.4], materials.wood);
    for (const z of [-4.72, -2.5, 0.3, 1.4, 4.3]) {
        box(root, `cafe-ceiling-beam-${z}`, [4.8, 3.59, z], [9.36, 0.14, 0.16], materials.wood);
    }
    for (const z of [-1.85, -0.3, 1.25, 2.8, 4.35]) {
        box(root, `cafe-window-mullion-${z}`, [9.4, 2.16, z], [0.12, 2.48, 0.075], materials.wood);
    }
    box(root, 'cafe-window-crossbar', [9.4, 2.45, 1.25], [0.1, 0.06, 6.25], materials.wood);
    const view = createCoastalView(root, device);
    root.addChild(view);
    view.setLocalPosition(9.447, 2.19, 1.25);
    view.setLocalScale(6.25, 1, 2.45);
    view.setLocalEulerAngles(90, -90, 0);

    const attach = (parent: Entity, id: CafeModelId, name: string, position: Vector3Tuple, yaw = 0) => {
        const entity = createModelInstance(assets.cafe[id], CAFE_MODELS[id], name).root;
        parent.addChild(entity);
        entity.setLocalPosition(...position);
        entity.setLocalEulerAngles(0, yaw, 0);
        return entity;
    };
    const prop = (id: CafeModelId, name: string, position: Vector3Tuple, yaw = 0) =>
        attach(root, id, name, position, yaw);
    const solidProp = (id: CafeModelId, definition: BoxDefinition) => {
        const body = createStaticBody(root, definition);
        attach(body, id, `${definition.name}-model`, [0, -definition.size[1] / 2, 0]);
        return body;
    };
    const table = solidProp('table', OPENING_TABLE);
    const television = solidProp('television', OPENING_TV);
    solidProp('chair', CAFE_CHAIR_A);
    solidProp('chair', CAFE_CHAIR_B);
    solidProp('fridge', CAFE_FRIDGE);
    solidProp('roundTable', CAFE_WINDOW_TABLE);
    solidProp('chair', CAFE_WINDOW_CHAIR);
    solidProp('stool', CAFE_STOOL);
    CAFE_EXTRA_TABLES.forEach((definition) => solidProp('roundTable', definition));
    CAFE_EXTRA_CHAIRS.forEach((definition) => solidProp('chair', definition));
    const backbar = createStaticBody(root, CAFE_BACKBAR);
    for (const [i, x] of [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25].entries())
        attach(backbar, 'backCounter', `cafe-back-cabinet-${i}`, [x, -0.47, 0]);
    const counter = createStaticBody(root, OPENING_COUNTER);
    for (const [i, x] of [-2.21144, -1.10572, 0, 1.10572, 2.21144].entries())
        attach(counter, 'counter', `cafe-counter-module-${i}`, [x, -0.54, 0]);
    const leftEnd = attach(counter, 'counterEnd', 'cafe-counter-end-left', [-2.895, -0.54, 0]);
    leftEnd.setLocalScale(-1, 1, 1);
    attach(counter, 'counterEnd', 'cafe-counter-end-right', [2.895, -0.54, 0]);
    prop('coffeeMachine', 'cafe-coffee-machine', [7.08, CAFE_FLOOR_Y + 1.08, -2.83]);
    prop('shelf', 'cafe-stock-shelf', [9.13, 1.98, -3.37], -90);
    for (const [i, z] of [-4.18, -3.82, -3.46, -3.1, -2.74, -2.38].entries()) {
        prop(i % 2 ? 'jarSmall' : 'jar', `cafe-shelf-jar-${i}`, [9.09, 2.46, z], -90);
    }
    for (const [i, x] of [6.86, 7.09, 7.32, 7.55].entries()) {
        prop('bottle', `cafe-backbar-bottle-${i}`, [x, CAFE_FLOOR_Y + 0.94, -4.45]);
    }
    prop('books', 'cafe-counter-books', [8.04, CAFE_FLOOR_Y + 0.94, -4.45]);
    for (const [i, x] of [3.7, 4.2, 4.7, 5.2, 5.7].entries()) {
        prop(i % 2 ? 'jarSmall' : 'bottle', `cafe-west-backbar-stock-${i}`, [x, CAFE_FLOOR_Y + 0.94, -4.45]);
    }
    prop('plate', 'cafe-west-counter-plate', [4, CAFE_FLOOR_Y + 1.08, -2.83]);
    prop('croissant', 'cafe-west-counter-pastry', [4, CAFE_FLOOR_Y + 1.11, -2.83], -25);
    prop('cup', 'cafe-west-counter-cup', [5.12, CAFE_FLOOR_Y + 1.08, -2.83]);
    prop('menu', 'cafe-counter-menu', [5.55, CAFE_FLOOR_Y + 1.08, -2.83]);
    for (const [index, definition] of CAFE_EXTRA_TABLES.entries()) {
        const [x, , z] = definition.position;
        prop('smallPlant', `cafe-extra-table-plant-${index}`, [x, CAFE_FLOOR_Y + 0.76, z]);
        for (const side of [-1, 1]) {
            prop('cup', `cafe-extra-table-drink-${index}-${side}`, [
                x + side * 0.35,
                CAFE_FLOOR_Y + 0.76,
                z + side * 0.32
            ]);
        }
    }
    prop('menu', 'cafe-table-menu', [8.06, CAFE_TABLETOP_Y, 0.3], -35);
    prop('cup', 'cafe-counter-cup', [7.62, CAFE_FLOOR_Y + 1.08, -2.86]);
    prop('cup', 'cafe-window-cup', [8.2, CAFE_FLOOR_Y + 0.76, 2.65]);
    prop('plate', 'cafe-pastry-plate', [8.4, CAFE_FLOOR_Y + 1.08, -2.84]);
    prop('croissant', 'cafe-croissant', [8.4, CAFE_FLOOR_Y + 1.11, -2.84], 90);
    prop('muffin', 'cafe-muffin', [8.86, CAFE_FLOOR_Y + 1.08, -2.84]);
    prop('icedDrink', 'cafe-drink-a', [7.48, CAFE_TABLETOP_Y, -0.43], 20);
    prop('icedDrink', 'cafe-drink-b', [7.91, CAFE_TABLETOP_Y, 0.43], -20);
    prop('smallPlant', 'cafe-table-plant', [7.98, CAFE_TABLETOP_Y, -0.08]);
    prop('smallPlant', 'cafe-window-table-plant', [8.74, CAFE_FLOOR_Y + 0.76, 2.65]);
    prop('plant', 'cafe-door-plant', [9.15, CAFE_FLOOR_Y, 4.1]);
    prop('leafPlant', 'cafe-window-planter', [9.31, 1.02, 1.22]);
    prop('pictureFrame', 'cafe-wall-picture', [9.37, 1.32, -1.32], -90);
    const ceilingY = CAFE_CEILING.position[1] - CAFE_CEILING.size[1] / 2;
    const fanBlades = [OPENING_TABLE, CAFE_WINDOW_TABLE, ...CAFE_EXTRA_TABLES].map((definition, index) => {
        const [x, , z] = definition.position;
        const fan = prop('fan', `${definition.name}-fan`, [x, ceilingY - CAFE_MODELS.fan.height, z], index * 45);
        const blades = fan.findByName('ceiling_fan_blades');
        if (!blades) throw new Error(`The fan above ${definition.name} is missing its blade node.`);
        return blades;
    });

    for (const [index, [x, z]] of [
        [8.75, -2.2],
        [6.8, 2.65],
        [3.25, 0],
        [3.8, 4.5],
        [4.25, -2.2]
    ].entries()) {
        const pendantY = ceilingY - CAFE_MODELS.pendant.height;
        prop('pendant', `cafe-pendant-${index}`, [x, pendantY, z]);
        const light = new Entity(`cafe-pendant-glow-${index}`);
        root.addChild(light);
        light.setLocalPosition(x, pendantY - 0.03, z);
        light.addComponent('light', {
            type: 'omni',
            color: new Color(1, 0.77, 0.48),
            intensity: 1.8,
            range: 3.8,
            castShadows: false
        });
    }
    const fill = new Entity('cafe-window-light');
    root.addChild(fill);
    fill.setLocalPosition(8.8, 2.9, 0.1);
    fill.addComponent('light', {
        type: 'omni',
        color: new Color(0.88, 0.94, 1),
        intensity: 2.6,
        range: 6.5,
        castShadows: false
    });

    const sign = createTextSign(root, device, 'cafe-name', ['TIDELINE', 'COFFEE + COLD DRINKS'], '#174b48', 1.5);
    counter.addChild(sign);
    sign.setLocalPosition(0, 0.03, 0.279);
    const menu = createTextSign(
        root,
        device,
        'cafe-menu',
        ['TAKE A MOMENT', 'Coffee  /  Citrus soda', 'Shade. A slower day.'],
        '#174b48',
        1.08
    );
    root.addChild(menu);
    menu.setLocalPosition(9.291, 1.71, -1.32);
    menu.setLocalEulerAngles(90, -90, 0);
    const wallPrint = createTextSign(
        root,
        device,
        'cafe-west-print',
        ['SLOW AFTERNOONS', 'GOOD COMPANY'],
        '#b37a46',
        1.6
    );
    root.addChild(wallPrint);
    wallPrint.setLocalPosition(0.22, 1.95, 0.4);
    wallPrint.setLocalEulerAngles(90, 90, 0);
    const storefront = createTextSign(
        root,
        device,
        'cafe-storefront',
        ['TIDELINE', 'COFFEE + COLD DRINKS'],
        '#174b48',
        2.25
    );
    root.addChild(storefront);
    storefront.setLocalPosition(3.4, 2.22, 5.86);
    box(root, 'cafe-front-awning', [4.8, 3.05, 6.05], [9.45, 0.12, 0.85], materials.teal);
    box(root, 'cafe-awning-trim', [4.8, 2.96, 6.46], [9.45, 0.18, 0.07], materials.plaster);
    box(counter, 'cafe-counter-inlay', [0, 0.4, 0.279], [5.8, 0.025, 0.015], materials.brass);

    const patrons = CAFE_PATRONS.map(({ name, model, position, yaw, pose }, index) => {
        const character = createAnimatedCharacter(assets.characters[model], model, name);
        root.addChild(character.root);
        character.root.setLocalPosition(...position);
        character.root.setLocalEulerAngles(0, yaw, 0);
        character.play(pose, 0);
        character.anim.baseLayer!.activeStateCurrentTime = index * 0.23;
        return character;
    });
    return { table, counter, television, fanBlades, patrons };
};
