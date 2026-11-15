import { Color, Entity, TONEMAP_ACES2 } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { Vector3Tuple } from '../data/foundation';

import { FOREST_SIGN } from './forestBridgeLayout';

const SHOTS: { time: number; position: Vector3Tuple; target: Vector3Tuple; fov: number }[] = [
    { time: 0, position: [-5.2, 2.4, 12.7], target: [-4.5, 1.25, -1.5], fov: 52 },
    { time: 4, position: [-5.2, 2.4, 12.7], target: [-4.5, 1.25, -1.5], fov: 52 },
    { time: 10, position: [-2.6, 2.35, 11], target: [-2.1, 1.35, -1], fov: 48 },
    { time: 18.6, position: [-2.2, 2.2, 9.5], target: [-1.1, 1.9, -3.1], fov: 46 },
    { time: 23.7, position: [-2, 2.15, 8.6], target: [-1.1, 2.1, -4.6], fov: 45 },
    { time: 24.5, position: [-2, 2.3, 9.5], target: [-1.3, 1.9, -2.8], fov: 48 },
    { time: 28, position: [-2.3, 2.4, 11], target: [-1.9, 1.6, -1.4], fov: 48 },
    { time: 32, position: [-1, 2.8, 12.5], target: [-0.6, 1.55, -1], fov: 48 },
    { time: 38, position: [5, 3.2, 8], target: [5, 0, 0.9], fov: 50 },
    { time: 44, position: [5, -9.9, 8.4], target: [5, -9.9, 0.5], fov: 50 }
];

export const createForestCamera = (parent: Entity, app: AppBase) => {
    const camera = new Entity('forest-camera');
    parent.addChild(camera);
    camera.addComponent('camera', {
        clearColor: new Color(0.018, 0.035, 0.052),
        nearClip: 0.08,
        farClip: 65,
        toneMapping: TONEMAP_ACES2
    });
    return {
        entity: camera,
        update: (time: number, reduced: boolean) => {
            const after = SHOTS.findIndex((shot) => shot.time > time);
            const last = SHOTS.at(-1)!;
            const a = reduced || after < 0 ? last : SHOTS[Math.max(0, after - 1)]!;
            const b = reduced || after < 0 ? last : SHOTS[after]!;
            const progress = a === b ? 1 : Math.max(0, Math.min(1, (time - a.time) / (b.time - a.time)));
            const t = progress * progress * (3 - 2 * progress);
            const position = a.position.map((value, i) => value + (b.position[i]! - value) * t) as Vector3Tuple;
            const target = a.target.map((value, i) => value + (b.target[i]! - value) * t) as Vector3Tuple;
            const portrait = Math.max(0, 1 - app.graphicsDevice.width / app.graphicsDevice.height);
            if (time >= 38 || reduced) {
                const fall = Math.max(0, Math.min(1, (time - 38) / 4));
                const accelerationEnd = 0.8;
                const distanceWeight = accelerationEnd ** 2 * (1.5 - 0.5 * accelerationEnd);
                const drop = reduced
                    ? 1
                    : fall <= accelerationEnd
                      ? fall ** 3 / distanceWeight
                      : 1 - (3 * accelerationEnd ** 2 * (1 - fall) ** 2) / (2 * (1 - accelerationEnd) * distanceWeight);
                const aspect = app.graphicsDevice.width / app.graphicsDevice.height;
                const fov = 50 + portrait * 20;
                const halfView = Math.tan((fov * Math.PI) / 360);
                const distance =
                    Math.max(FOREST_SIGN.height * 1.3, (FOREST_SIGN.width * 1.25) / aspect) / (2 * halfView);
                position[0] = 5;
                position[1] = 3.2 + (-9.9 - 3.2) * drop;
                position[2] = 8 + (0.5 + distance - 8) * drop;
                const look = reduced ? 1 : Math.min(1, fall * 1.4);
                target[0] = 5;
                target[1] = -2 + (-9.9 + 2) * look;
                target[2] = 0.5;
            } else position[2] += portrait * 5;
            camera.setLocalPosition(...position);
            camera.lookAt(...target);
            camera.camera!.fov =
                time >= 38 || reduced ? 50 + portrait * 20 : Math.min(85, a.fov + (b.fov - a.fov) * t + portrait * 68);
            const scare = time - 24;
            if (!reduced && scare >= 0 && scare < 0.65) {
                const weight = Math.exp(-scare * 7) * 0.065;
                camera.translateLocal(Math.sin(scare * 59) * weight, Math.cos(scare * 47) * weight, 0);
            }
        }
    };
};
