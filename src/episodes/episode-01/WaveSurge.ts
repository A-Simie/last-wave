import { CULLFACE_NONE, Entity, Mesh, MeshInstance, calculateNormals } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

import { createMaterial } from '../../scenes/primitives';

import { BEACH_SHORE_Z } from './entryLayout';

export const createWaveSurge = (parent: Entity, device: GraphicsDevice) => {
    const root = new Entity('wave-surge');
    parent.addChild(root);
    const material = createMaterial('wave-deep-seaglass', 1, 1, 1);
    material.diffuseVertexColor = true;
    material.cull = CULLFACE_NONE;
    material.gloss = 0.62;
    material.specular.set(0.24, 0.34, 0.35);
    material.update();
    root.once('destroy', () => material.destroy());
    const columns = 80;
    const rows = 28;
    const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
    const colors = new Float32Array((positions.length / 3) * 4);
    const indices: number[] = [];
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const i = row * (columns + 1) + column;
            indices.push(i, i + columns + 1, i + 1, i + 1, i + columns + 1, i + columns + 2);
        }
    }
    const mesh = new Mesh(device);
    root.once('destroy', () => mesh.destroy());
    mesh.clear(true, false);
    mesh.setIndices(indices);
    let time = 0;
    let height = 0;
    let front = BEACH_SHORE_Z - 40;
    const update = (dt: number, targetHeight: number, targetFront: number, steady: boolean) => {
        root.enabled = targetHeight > 0 || height > 0.05;
        time += dt;
        const ease = Math.min(1, dt * 0.85);
        height += (targetHeight - height) * ease;
        front += (targetFront - front) * ease;
        for (let row = 0; row <= rows; row++) {
            const v = row / rows;
            const curve = Math.pow(Math.sin(v * Math.PI), 1.25);
            for (let column = 0; column <= columns; column++) {
                const i = row * (columns + 1) + column;
                const x = -150 + (column * 300) / columns;
                const ripple =
                    (Math.sin(x * 0.3 + time * (steady ? 0.35 : 1.1)) * 0.26 + Math.sin(x * 0.91 - time) * 0.09) *
                    curve;
                positions.set([x, -0.13 + height * curve + ripple, front - 25 + v * 25 + curve * 2.1], i * 3);
                const cap = Math.max(0, 1 - Math.abs(v - 0.52 - Math.sin(x * 0.6 + time) * 0.025) / 0.1);
                const white = Math.min(1, cap * 1.5);
                colors.set(
                    [
                        0.07 + white * 0.77 + curve * 0.08,
                        0.3 + white * 0.57 + curve * 0.14,
                        0.36 + white * 0.52 + curve * 0.1,
                        1
                    ],
                    i * 4
                );
            }
        }
        mesh.setPositions(positions);
        mesh.setNormals(calculateNormals(positions, indices));
        mesh.setColors(colors);
        mesh.update();
    };
    update(0, 0, front, true);
    root.addComponent('render', { meshInstances: [new MeshInstance(mesh, material)], castShadows: false });
    return {
        root,
        update,
        get height() {
            return height;
        },
        get front() {
            return front;
        }
    };
};
