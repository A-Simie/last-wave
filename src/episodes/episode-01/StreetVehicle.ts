import { Entity, Mesh, MeshInstance, TorusGeometry, Vec3 } from 'playcanvas';
import type { AppBase, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { Vector3Tuple } from '../../data/foundation';
import { PORSCHE_DRIVER_SEATS, PORSCHE_WHEELS, PORSCHE_WHEEL_RADIUS, VEHICLE_MODELS } from '../../data/vehicleModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createBoxVisual, createMaterial } from '../../scenes/primitives';

export const createStreetVehicle = (
    app: AppBase,
    parent: Entity,
    assets: GameAssets,
    name: string,
    color: Readonly<Vector3Tuple>,
    driverModel?: 'patronBuzz' | 'patronShort'
) => {
    const tuning = VEHICLE_MODELS.porsche;
    const { root, hierarchy } = createModelInstance(assets.vehicles.porsche, tuning, name);
    parent.addChild(root);
    try {
        const instances = hierarchy.findComponents('render').flatMap((render) => render.meshInstances);
        const original = instances.find(({ material }) => material?.name === 'traffic-paint')?.material;
        if (!original) throw new Error('The traffic model is missing its paint material.');
        const paint = (original as StandardMaterial).clone();
        root.once('destroy', () => paint.destroy());
        paint.name = `${name}-paint`;
        paint.diffuse.set(...color);
        paint.diffuseMap = null;
        paint.useMetalness = true;
        paint.metalness = 0.25;
        paint.gloss = 0.72;
        paint.clearCoat = 0.8;
        paint.clearCoatGloss = 0.8;
        paint.update();
        for (const instance of instances) if (instance.material === original) instance.material = paint;
        const wheels = PORSCHE_WHEELS.map((name) => {
            const wheel = hierarchy.findByName(name);
            if (!wheel) throw new Error(`The traffic model is missing ${name}.`);
            return wheel;
        });
        root.addComponent('collision', {
            type: 'box',
            halfExtents: new Vec3(...tuning.dims.map((size) => (size * tuning.scale) / 2)),
            linearOffset: new Vec3(0, tuning.height / 2, 0)
        });
        root.addComponent('rigidbody', { type: 'kinematic' });
        let driver: AnimatedCharacter | null = null;
        if (driverModel) {
            const fit = PORSCHE_DRIVER_SEATS[driverModel];
            const seat = new Entity(`${name}-driver-seat`);
            root.addChild(seat);
            seat.setLocalPosition(fit.position[0], fit.position[1], fit.position[2]);
            seat.setLocalScale(fit.scale, fit.scale, fit.scale);
            seat.setLocalEulerAngles(fit.pitch, 0, 0);
            driver = createAnimatedCharacter(
                assets.characters[driverModel],
                driverModel,
                name.replace('car', 'driver')
            );
            seat.addChild(driver.root);
            driver.play('driving', 0);
            const steering = new Entity(`${name}-steering-wheel`);
            root.addChild(steering);
            steering.setLocalPosition(fit.wheel[0], fit.wheel[1], fit.wheel[2]);
            steering.setLocalEulerAngles(-70, 0, 0);
            const material = createMaterial(`${name}-steering-trim`, 0.045, 0.05, 0.055);
            const mesh = Mesh.fromGeometry(
                app.graphicsDevice,
                new TorusGeometry({ ringRadius: 0.18, tubeRadius: 0.014, segments: 24, sides: 8 })
            );
            steering.addComponent('render', { meshInstances: [new MeshInstance(mesh, material)] });
            createBoxVisual(steering, `${name}-steering-spokes`, [0, 0, 0], [0.33, 0.025, 0.032], material);
            createBoxVisual(steering, `${name}-steering-lower-spoke`, [0, 0, -0.075], [0.03, 0.025, 0.15], material);
            for (const [part, y, size] of [
                ['hub', 0, [0.095, 0.055, 0.095]],
                ['column', -0.12, [0.035, 0.24, 0.035]]
            ] as const) {
                const entity = new Entity(`${name}-steering-${part}`);
                steering.addChild(entity);
                entity.setLocalPosition(0, y, 0);
                entity.setLocalScale(size[0], size[1], size[2]);
                entity.addComponent('render', { type: 'cylinder', material });
            }
            root.once('destroy', () => {
                mesh.destroy();
                material.destroy();
            });
        }
        return { root, driver, wheels, wheelRadius: PORSCHE_WHEEL_RADIUS, wheelAngle: 0 };
    } catch (error) {
        root.destroy();
        throw error;
    }
};
