import { Entity } from 'playcanvas';
import type { ContainerResource } from 'playcanvas';

import type { PreparedModelId } from '../data/newModels';
import { createPreparedModel } from '../scenes/createPreparedModel';
import type { ModelFit } from '../scenes/createPreparedModel';

import { FOREST_SCARE_START, forestBatFlight } from './forestScare';

type LoginModels = Partial<Record<PreparedModelId, ContainerResource>>;

// The supplied bat's body lies along +X with its wings along Z; this turns its nose onto the flight heading.
const BAT_YAW_OFFSET = -90;
const BAT_WINGSPAN = 0.85;

/**
 * Adds the supplied login-scene models to the forest: the pumpkin headstone the sign-in board hangs above,
 * cobwebs, two skeletal figures, a goblet, a skull and the animated vampire bats that replace the fallback flock.
 */
export const createLoginDressing = (parent: Entity, models: LoginModels, mobile: boolean) => {
    const root = new Entity('forest-login-dressing');
    parent.addChild(root);
    const place = (
        id: PreparedModelId,
        position: readonly [number, number, number],
        yaw: number,
        fit: ModelFit = {},
        animate = false
    ) => {
        const resource = models[id];
        if (!resource) return null;
        const model = createPreparedModel(resource, id, `forest-${id}`, fit, { animate, castShadows: !mobile });
        root.addChild(model.root);
        model.root.setLocalPosition(...position);
        model.root.setLocalEulerAngles(0, yaw, 0);
        model.root.tags.add('forest-scenery', `forest-model-${id}`);
        return model;
    };
    // The headstone sits on the path's far verge, framed beneath the hanging sign-in board.
    place('grave', [0.9, -0.05, -3.4], -8, { height: 1.55 });
    place('skullPlanes', [2.75, -0.02, -2.55], -35, { height: 0.42 });
    place('goblet', [-0.55, 0, -2.75], 0, { height: 0.42 });
    place('skeletonA', [-3.1, -0.02, -3.6], 28, { height: 1.72 });
    place('skeletonB', [-2.5, -0.02, -8.2], 12, { height: 1.95 });
    place('skeletonA', [-4, 0, 3.2], 18, { height: 1.8 });
    place('skeletonB', [4.1, 0, 2.6], -24, { height: 1.85 });
    for (const [x, y, z, yaw, scale] of [
        [-9.2, 2.15, -1.1, 30, 0.55],
        [7.8, 2.1, -1.4, -40, 0.55],
        [-5.8, 1.1, -3, 70, 0.4],
        [-4.8, 2.4, 3.4, 22, 0.75],
        [5.2, 2.6, 2.8, -28, 0.8],
        [-7, 3.1, 0.8, 38, 0.65],
        [7.2, 3, 0.4, -38, 0.7]
    ] as const) {
        const web = place('cobwebs', [x, y, z], yaw, { scale });
        web?.root.setLocalEulerAngles(70, yaw, 0);
    }
    place('cobwebPack', [0.4, 2.7, -6.9], 0, { scale: 0.75 });

    const bats: { root: Entity; seed: number }[] = [];
    const ambient: { root: Entity; seed: number }[] = [];
    const resource = models.vampireBat;
    if (resource) {
        const spawn = (name: string, seed: number) => {
            const bat = createPreparedModel(resource, 'vampireBat', name, {}, { animate: true, castShadows: false });
            const factor = BAT_WINGSPAN / bat.dims[2];
            bat.root.setLocalScale(factor, factor, factor);
            root.addChild(bat.root);
            const anim = bat.hierarchy.anim;
            if (anim) anim.speed = 0.9 + (seed % 4) * 0.12;
            return { root: bat.root, seed };
        };
        for (let i = 0; i < (mobile ? 6 : 12); i++) bats.push(spawn(`forest-vampire-bat-${i}`, i));
        for (let i = 0; i < (mobile ? 2 : 4); i++) ambient.push(spawn(`forest-circling-bat-${i}`, i + 20));
    }
    return {
        hasBats: bats.length > 0,
        update: (time: number, reduced: boolean, ambienceTime: number) => {
            const flight = time - FOREST_SCARE_START;
            for (const bat of bats) {
                const path = forestBatFlight(bat.seed, time);
                bat.root.enabled = !reduced && flight >= 0 && flight < 5.5 && path.visible;
                if (!bat.root.enabled) continue;
                bat.root.setLocalPosition(...path.position);
                bat.root.setLocalEulerAngles(-12, (path.yaw * 180) / Math.PI + BAT_YAW_OFFSET, 0);
            }
            // A few bats keep circling high over the clearing once the flock has scattered.
            for (const [i, bat] of ambient.entries()) {
                bat.root.enabled = !reduced && time >= FOREST_SCARE_START + 3;
                if (!bat.root.enabled) continue;
                const angle = ambienceTime * (0.35 + i * 0.05) + i * 1.7;
                const radius = 6 + i * 1.6;
                bat.root.setLocalPosition(
                    Math.cos(angle) * radius,
                    5.2 + i * 0.6 + Math.sin(ambienceTime * 1.3 + i) * 0.4,
                    -6 + Math.sin(angle) * radius * 0.45
                );
                // Tangent heading for counter-clockwise travel around the circle.
                const heading = Math.atan2(-Math.sin(angle), Math.cos(angle) * 0.45);
                bat.root.setLocalEulerAngles(0, (heading * 180) / Math.PI + BAT_YAW_OFFSET, (i % 2 ? 1 : -1) * 18);
            }
        }
    };
};
