import { BLEND_NORMAL, Color, Entity } from 'playcanvas';
import type { ContainerResource, Material, StandardMaterial } from 'playcanvas';

import { createModelInstance } from '../scenes/createModelInstance';
import { createBoxVisual, createMaterial } from '../scenes/primitives';

import { FOREST_PIT } from './forestBridgeLayout';
import { createForestGoblin } from './ForestGoblin';
import { FOREST_MODELS } from './forestModels';
import type { ForestModelId } from './forestModels';

export const createForestDungeon = (
    parent: Entity,
    models: Record<ForestModelId | 'performances', ContainerResource>,
    sign: Entity,
    mobile: boolean
) => {
    const root = new Entity('forest-dungeon');
    parent.addChild(root);
    const module = (
        id: 'dungeon-wall' | 'dungeon-arch' | 'dungeon-floor' | 'dungeon-torch' | 'dungeon-bars',
        x: number,
        y: number,
        z: number,
        yaw = 0
    ) => {
        const instance = models.dungeonKit.instantiateRenderEntity({ castShadows: false });
        const part = instance.findByName(id) as Entity;
        if (!part) throw new Error(`Missing prepared dungeon module ${id}`);
        const mount = new Entity(`${id}-mount`);
        root.addChild(mount);
        part.reparent(mount);
        instance.destroy();
        mount.setLocalPosition(x, y, z);
        mount.setLocalEulerAngles(0, yaw, 0);
        return mount;
    };
    // Each calibrated wall is 4.8 m tall and ends in a 1.2 m vault spring that leans away from the shaft.
    // Three courses stacked from the pit floor would raise that spring 1.2 m above the forest floor,
    // across both bridge approaches. The top course overlaps the middle one and stops just below the ground.
    const wallHeight = 4.8;
    const rim = -0.02;
    for (const x of [FOREST_PIT.west - 0.6, FOREST_PIT.east + 0.6])
        for (const y of [FOREST_PIT.floor, FOREST_PIT.floor + wallHeight, rim - wallHeight])
            for (const z of [-2, 2, 6, 10, 14]) module('dungeon-wall', x, y, z, x < 5 ? 0 : 180);
    for (const y of [FOREST_PIT.floor, FOREST_PIT.floor + 4.8])
        for (const x of [1, 5, 9]) module('dungeon-arch', x, y, -3.6, 90);
    for (const x of [1, 5, 9])
        for (const z of [-2, 2, 6, 10, 14]) module('dungeon-floor', x, FOREST_PIT.floor - 0.1387, z);
    for (const x of [1, 9]) module('dungeon-bars', x, FOREST_PIT.floor, -2.8, 90);
    const stone = (
        (root.findByName('dungeon-wall') as Entity).findComponents('render')[0].meshInstances[0]
            .material as StandardMaterial
    ).clone();
    stone.name = 'dungeon-stone-cornice';
    stone.diffuseMap = null;
    stone.diffuse.set(0.24, 0.23, 0.2);
    stone.update();
    for (const y of [-8.5, -3.7]) {
        for (const x of [-0.5, 10.7])
            for (const z of [-2, 2, 6, 10, 14])
                createBoxVisual(root, 'dungeon-stone-course', [x, y, z], [1, 0.9, 4.02], stone);
        createBoxVisual(root, 'dungeon-back-cornice', [5, y, -2.65], [11.4, 0.9, 0.7], stone);
    }
    // A coping flush with the ground covers the buried spring, leaving a level walk onto both approaches.
    for (const x of [-0.5, 10.7])
        createBoxVisual(root, 'dungeon-stone-coping', [x, rim - 0.45, 6], [1, 0.9, 20.02], stone);
    const pumpkinMaterials = new Map<Material, StandardMaterial>();
    root.once('destroy', () => {
        stone.destroy();
        pumpkinMaterials.forEach((material) => material.destroy());
    });
    const place = (id: ForestModelId, x: number, y: number, z: number, scale = 1, owner = root) => {
        const model = createModelInstance(models[id], FOREST_MODELS[id], `dungeon-${id}`);
        owner.addChild(model.root);
        model.root.setLocalPosition(x, y, z);
        model.root.setLocalScale(scale, scale, scale);
        model.root.setLocalEulerAngles(0, x * 31, 0);
        if (id === 'pumpkin' || id === 'tallPumpkin' || id === 'leanPumpkin')
            for (const render of model.root.findComponents('render'))
                for (const instance of render.meshInstances) {
                    const source = instance.material!;
                    let material = pumpkinMaterials.get(source);
                    if (!material) {
                        material = (source as StandardMaterial).clone();
                        material.diffuse.set(0.95, 0.3, 0.04);
                        material.update();
                        pumpkinMaterials.set(source, material);
                    }
                    instance.material = material;
                }
        return model.root;
    };
    for (const side of [-1, 1])
        for (let i = 0; i < (mobile ? 7 : 11); i++) {
            const x = 5 + side * (2.55 + (i % 3) * 0.72),
                z = 1.8 + Math.floor(i / 3) * 0.72;
            place(
                i % 3 === 0 ? 'tallPumpkin' : i % 3 === 1 ? 'pumpkin' : 'leanPumpkin',
                x,
                FOREST_PIT.floor,
                z,
                0.75 + (i % 4) * 0.24
            );
            if (i % 3 === 0) place('skull', x - side * 0.25, FOREST_PIT.floor, z + 0.4, 1.1);
        }
    for (const x of [-1.35, 0, 1.35]) place('pumpkin', x, 2.8, 0, 0.56, sign);
    const goblins = [-1, 1].map((side) => {
        const goblin = createForestGoblin(root, side);
        goblin.root.setLocalPosition(5 + side * 3.25, FOREST_PIT.floor, 0.1);
        return goblin;
    });
    const flameMaterial = createMaterial('dungeon-candle-flame', 1, 0.55, 0.12);
    flameMaterial.useLighting = false;
    flameMaterial.emissive.set(2, 0.65, 0.1);
    flameMaterial.update();
    const flames: { entity: Entity; light: Entity; seed: number }[] = [];
    const fire = (x: number, y: number, z: number, seed: number, range = 6) => {
        const flame = new Entity('dungeon-live-flame');
        root.addChild(flame);
        flame.setLocalPosition(x, y, z);
        flame.setLocalScale(0.085, 0.22, 0.085);
        flame.addComponent('render', { type: 'sphere', material: flameMaterial, castShadows: false });
        const light = new Entity('dungeon-firelight');
        root.addChild(light);
        light.setLocalPosition(x, y + 0.1, z);
        light.addComponent('light', {
            type: 'omni',
            color: new Color(1, 0.62, 0.27),
            intensity: 1.9,
            range,
            castShadows: false
        });
        flames.push({ entity: flame, light, seed });
    };
    for (const side of [-1, 1])
        for (const z of [1.8, 7.5]) {
            const x = side < 0 ? -0.08 : 10.28;
            module('dungeon-torch', x, -10.6, z, side < 0 ? 0 : 180);
            fire(x - side * 0.3, -9.8, z, flames.length, 8);
        }
    for (const x of [2.6, 7.4]) {
        module('dungeon-torch', x, -7.8, -2.35, -90);
        fire(x, -6.98, -2.05, flames.length, 7);
    }
    for (const side of [-1, 1])
        for (let i = 0; i < 3; i++) {
            const x = 5 + side * (2.4 + i * 0.22),
                z = 2.1 + (i % 2) * 0.22;
            place('candle', x, FOREST_PIT.floor, z, 1.3);
            fire(x, FOREST_PIT.floor + 0.47, z, flames.length, 3.2);
        }
    const fill = new Entity('dungeon-cool-fill');
    root.addChild(fill);
    fill.setLocalPosition(5, -8, 5.5);
    fill.addComponent('light', {
        type: 'omni',
        color: new Color(0.37, 0.56, 0.78),
        range: 15,
        intensity: 1.4,
        castShadows: false
    });
    const mistMaterial = createMaterial('dungeon-floor-mist', 0.25, 0.32, 0.35);
    mistMaterial.blendType = BLEND_NORMAL;
    mistMaterial.opacity = 0.055;
    mistMaterial.depthWrite = false;
    mistMaterial.update();
    const mists = Array.from({ length: mobile ? 2 : 4 }, (_, i) => {
        const mist = new Entity('dungeon-floor-mist');
        root.addChild(mist);
        mist.setLocalPosition(3 + i * 1.4, FOREST_PIT.floor + 0.18, 2 + i * 0.7);
        mist.setLocalScale(5, 0.28, 1.6);
        mist.addComponent('render', { type: 'sphere', material: mistMaterial, castShadows: false });
        return mist;
    });
    root.once('destroy', () => {
        flameMaterial.destroy();
        mistMaterial.destroy();
    });
    return {
        update: (time: number, steady: boolean, clock: number) => {
            goblins.forEach((goblin) => goblin.update(clock, steady || time < 38));
            for (const { entity, light, seed } of flames) {
                const wave = steady ? 0 : Math.sin(clock * 7 + seed * 2) * 0.1 + Math.sin(clock * 11 + seed) * 0.04;
                entity.setLocalScale(0.085, 0.22 + wave * 0.2, 0.085);
                light.light!.intensity = 1.9 + wave * 2;
            }
            mists.forEach((mist, i) =>
                mist.setLocalPosition(
                    3 + i * 1.4 + (steady ? 0 : Math.sin(clock * 0.16 + i) * 0.5),
                    FOREST_PIT.floor + 0.18,
                    2 + i * 0.7
                )
            );
        }
    };
};
