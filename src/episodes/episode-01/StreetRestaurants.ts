import { Color, Entity } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { CafeAssets } from '../../core/AssetManager';
import { CAFE_MODELS } from '../../data/cafeModels';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody } from '../../scenes/primitives';

import { RESTAURANTS } from './restaurantLayout';

export const createStreetRestaurants = (parent: Entity, app: AppBase, assets: CafeAssets) => {
    const root = new Entity('walk-in-restaurants');
    parent.addChild(root);
    const materials = {
        plaster: createMaterial('restaurant-plaster', 0.89, 0.79, 0.61),
        floor: createMaterial('restaurant-floor', 0.61, 0.43, 0.29),
        wood: createMaterial('restaurant-wood', 0.29, 0.19, 0.13),
        glass: createMaterial('restaurant-window', 0.15, 0.32, 0.33)
    };
    const paints = RESTAURANTS.map(({ block, color }) =>
        createMaterial(`${block.name}-paint`, color[0], color[1], color[2])
    );
    root.once('destroy', () => [...Object.values(materials), ...paints].forEach((material) => material.destroy()));
    for (const [index, restaurant] of RESTAURANTS.entries()) {
        const { block, width, depth } = restaurant;
        const room = new Entity(`${block.name}-restaurant`);
        root.addChild(room);
        room.setPosition(block.position[0], 0, block.position[2]);
        room.setEulerAngles(0, block.yaw ?? 0, 0);
        for (const solid of restaurant.solids) createStaticBody(root, solid);
        for (const solid of restaurant.shell)
            box(room, `${solid.name}-visual`, solid.position, solid.size, materials.plaster);
        box(room, 'painted-front-fascia', [0, 3.52, depth / 2 + 0.12], [width, 0.9, 0.08], paints[index]);
        box(room, 'roof-trim', [0, 4.25, 0], [width + 0.6, 0.16, depth + 0.6], paints[index]);
        box(room, 'wooden-floor', [0, 0.012, 0], [width, 0.024, depth], materials.floor);
        box(room, 'serving-counter', restaurant.counter.position, restaurant.counter.size, materials.wood);
        box(
            room,
            'countertop',
            [restaurant.counter.position[0], 1.13, restaurant.counter.position[2]],
            [3, 0.08, 1],
            materials.plaster
        );
        for (const [i, position] of restaurant.tables.entries()) {
            const table = createModelInstance(
                assets.roundTable,
                CAFE_MODELS.roundTable,
                `${block.name}-dining-table-${i}`
            );
            room.addChild(table.root);
            table.root.setLocalPosition(...position);
            const cup = createModelInstance(assets.cup, CAFE_MODELS.cup, `${block.name}-cup-${i}`);
            room.addChild(cup.root);
            cup.root.setLocalPosition(position[0], position[1] + CAFE_MODELS.roundTable.height, position[2]);
        }
        for (const [i, chair] of restaurant.chairs.entries()) {
            const model = createModelInstance(assets.chair, CAFE_MODELS.chair, `${block.name}-dining-chair-${i}`);
            room.addChild(model.root);
            model.root.setLocalPosition(...chair.position);
            model.root.setLocalEulerAngles(0, chair.yaw, 0);
        }
        for (const [i, position] of restaurant.plants.entries()) {
            const plant = createModelInstance(assets.plant, CAFE_MODELS.plant, `${block.name}-dining-plant-${i}`);
            room.addChild(plant.root);
            plant.root.setLocalPosition(...position);
        }
        for (const side of [-1, 1]) {
            const fixture = createModelInstance(assets.pendant, CAFE_MODELS.pendant, `${block.name}-pendant-${side}`);
            room.addChild(fixture.root);
            fixture.root.setLocalPosition(side * width * 0.23, 2.75, 0);
            const light = new Entity(`${block.name}-warm-light-${side}`);
            room.addChild(light);
            light.setLocalPosition(side * width * 0.23, 2.8, 0);
            light.addComponent('light', {
                type: 'omni',
                color: new Color(1, 0.78, 0.54),
                intensity: 1.8,
                range: 7,
                castShadows: false
            });
        }
        const coffee = createModelInstance(
            assets.coffeeMachine,
            CAFE_MODELS.coffeeMachine,
            `${block.name}-coffee-machine`
        );
        room.addChild(coffee.root);
        coffee.root.setLocalPosition(restaurant.counter.position[0], 1.17, restaurant.counter.position[2]);
        for (const side of [-1, 1]) {
            box(
                room,
                `front-window-${side}`,
                [side * width * 0.31, 1.6, depth / 2 + 0.12],
                [width * 0.25, 1.8, 0.05],
                materials.glass
            );
            box(
                room,
                `window-sill-${side}`,
                [side * width * 0.31, 0.66, depth / 2 + 0.17],
                [width * 0.27, 0.12, 0.35],
                materials.plaster
            );
        }
        const sign = createTextSign(
            room,
            app.graphicsDevice,
            `${block.name}-restaurant-sign`,
            [restaurant.title, restaurant.menu],
            '#24473f',
            Math.min(width - 1, 6)
        );
        room.addChild(sign);
        sign.setLocalPosition(0, 3.55, depth / 2 + 0.2);
        const welcome = createTextSign(
            room,
            app.graphicsDevice,
            `${block.name}-open-sign`,
            ['OPEN', 'WALK IN - TAKE A LOOK'],
            '#5a3d29',
            1.5
        );
        room.addChild(welcome);
        welcome.setLocalPosition(-1.9, 1.3, depth / 2 + 0.22);
        const menu = createTextSign(
            room,
            app.graphicsDevice,
            `${block.name}-menu`,
            [restaurant.title, 'TODAY AT THE COAST', restaurant.menu],
            '#31534b',
            3
        );
        room.addChild(menu);
        menu.setLocalPosition(0, 2.4, -depth / 2 + 0.13);
    }
    const group = app.batcher!.addGroup('restaurants-static', false, 28);
    root.findComponents('render').forEach((render) => {
        render.batchGroupId = group.id;
    });
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    return root;
};
