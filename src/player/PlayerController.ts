import type { Entity, RigidBodyComponentSystem } from 'playcanvas';
import { Vec3 } from 'playcanvas';
import { ThirdPersonController } from 'playcanvas/scripts/esm/third-person-controller.mjs';

import { CAMERA_SETTINGS } from './CameraController';

const FEET = [-0.38, 0, 0.38].flatMap((x) => [-0.38, 0, 0.38].map((z) => [x, z]));

export const setPlayerControlsEnabled = (controller: ThirdPersonController, enabled: boolean) => {
    controller.enabled = enabled;
    const body = controller.entity.rigidbody;
    if (!enabled && body) {
        body.linearVelocity = new Vec3(0, body.linearVelocity.y, 0);
    }
};

export const addPlayerController = (player: Entity, camera: Entity, model: Entity) => {
    const physics = player.rigidbody!.system as RigidBodyComponentSystem;
    const scripts = player.script ?? player.addComponent('script')!;
    const controller = scripts.create(ThirdPersonController, {
        properties: {
            ...CAMERA_SETTINGS,
            camera,
            characterModel: model,
            jumpForce: 520,
            speedGround: 60,
            sprintMult: 1.5
        } satisfies Partial<ThirdPersonController>
    })!;

    // Preserve the starter's ledge fix; 2.23.3 exposes no public ground-probe hook.
    const from = new Vec3();
    const to = new Vec3();
    const solid = { filterCallback: (entity: Entity) => entity !== player && !!entity.rigidbody };
    let grounded = false;
    Object.defineProperty(controller, '_grounded', {
        get: () => grounded,
        set: () => {
            const position = player.getPosition();
            grounded = FEET.some(([x, z]) => {
                from.set(position.x + x, position.y, position.z + z);
                to.set(from.x, position.y - 1.1, from.z);
                return !!physics.raycastFirst(from, to, solid);
            });
        }
    });

    return controller;
};
