import { CULLFACE_NONE, Entity, Mesh, MeshInstance } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

import { createMaterial } from '../../scenes/primitives';

import { BEACH_SHORE_Z } from './entryLayout';

export const createWaveBirds = (parent: Entity, device: GraphicsDevice) => {
    const root = new Entity('wave-gull-flock');
    parent.addChild(root);
    const material = createMaterial('wave-gull-ivory', 0.85, 0.86, 0.78);
    material.cull = CULLFACE_NONE;
    material.update();
    root.once('destroy', () => material.destroy());
    const count = 12;
    const positions = new Float32Array(count * 9 * 3);
    const normals = new Float32Array(positions.length);
    for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
    const mesh = new Mesh(device);
    root.once('destroy', () => mesh.destroy());
    mesh.clear(true, false);
    mesh.setNormals(normals);
    let time = 0;
    let flight = 0;
    const update = (dt: number, fleeing: boolean) => {
        time += dt;
        if (fleeing) flight = Math.min(12, flight + dt);
        for (let i = 0; i < count; i++) {
            const x = -10 + i * 1.8 + Math.sin(time * 0.45 + i) * 0.6 + flight * (i % 2 ? 0.7 : -0.45);
            const y = 4 + (i % 3) + flight * 2.1;
            const z = BEACH_SHORE_Z - 8 - (i % 4) * 1.5 + flight * 9;
            const flap = Math.sin(time * (fleeing ? 9 : 4) + i) * 0.36;
            positions.set(
                [
                    x,
                    y,
                    z + 0.32,
                    x - 0.11,
                    y,
                    z - 0.25,
                    x + 0.11,
                    y,
                    z - 0.25,
                    x,
                    y,
                    z + 0.1,
                    x - 0.72,
                    y + flap,
                    z - 0.2,
                    x - 0.14,
                    y,
                    z - 0.22,
                    x,
                    y,
                    z + 0.1,
                    x + 0.14,
                    y,
                    z - 0.22,
                    x + 0.72,
                    y + flap,
                    z - 0.2
                ],
                i * 27
            );
        }
        mesh.setPositions(positions);
        mesh.update();
    };
    update(0, false);
    root.addComponent('render', { meshInstances: [new MeshInstance(mesh, material)], castShadows: false });
    return { update };
};
