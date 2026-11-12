import { BLEND_NORMAL, Entity, Mesh, MeshInstance } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

import { createMaterial } from '../../scenes/primitives';

import { BEACH_SHORE_Z } from './entryLayout';

export const beachWaterHeight = (x: number, z: number, time: number) =>
    0.14 + 0.04 * Math.sin(z * 1.1 + x * 0.16 + time * 0.7) + 0.018 * Math.sin(x * 0.5 + z * 0.8 + time * 1.2);

export const createBeachWater = (parent: Entity, device: GraphicsDevice) => {
    const root = new Entity('beach-water');
    parent.addChild(root);
    const water = createMaterial('beach-water-turquoise', 1, 1, 1);
    water.diffuseVertexColor = true;
    water.gloss = 0.55;
    water.specular.set(0.3, 0.38, 0.4);
    water.update();
    const foam = createMaterial('beach-water-foam', 0.86, 0.96, 0.92);
    foam.blendType = BLEND_NORMAL;
    foam.opacity = 0.52;
    foam.depthWrite = false;
    foam.update();
    root.once('destroy', () => {
        water.destroy();
        foam.destroy();
    });

    const columns = 128;
    const rows = 64;
    const positions = new Float32Array((columns + 1) * (rows + 1) * 3);
    const normals = new Float32Array(positions.length);
    const colors = new Float32Array((positions.length / 3) * 4);
    const indices: number[] = [];
    for (let row = 0; row <= rows; row++) {
        for (let column = 0; column <= columns; column++) {
            const i = row * (columns + 1) + column;
            positions[i * 3] = -200 + (column * 400) / columns;
            positions[i * 3 + 2] = BEACH_SHORE_Z - row * 2;
            const deep = Math.min(1, row / 10);
            colors.set([0.26 - deep * 0.14, 0.68 - deep * 0.28, 0.67 - deep * 0.14, 1], i * 4);
            if (row < rows && column < columns)
                indices.push(i, i + 1, i + columns + 1, i + 1, i + columns + 2, i + columns + 1);
        }
    }
    const mesh = new Mesh(device);
    root.once('destroy', () => mesh.destroy());
    mesh.clear(true, false);
    mesh.setIndices(indices);
    mesh.setColors(colors);
    const sea = new Entity('beach-calm-surface');
    root.addChild(sea);

    const foamPositions = new Float32Array(3 * 65 * 2 * 3);
    const foamNormals = new Float32Array(foamPositions.length);
    const foamIndices: number[] = [];
    for (let band = 0; band < 3; band++) {
        for (let column = 0; column < 65; column++) {
            const i = (band * 65 + column) * 2;
            foamNormals[i * 3 + 1] = 1;
            foamNormals[(i + 1) * 3 + 1] = 1;
            if (column < 64) foamIndices.push(i, i + 2, i + 1, i + 2, i + 3, i + 1);
        }
    }
    const foamMesh = new Mesh(device);
    root.once('destroy', () => foamMesh.destroy());
    foamMesh.clear(true, false);
    foamMesh.setIndices(foamIndices);
    foamMesh.setNormals(foamNormals);
    const wash = new Entity('beach-gentle-wash');
    root.addChild(wash);
    let time = 0;
    let retreat = 0;
    const update = (dt: number, retreatTarget = 0) => {
        time += Math.min(dt, 0.1);
        retreat += Math.max(-dt * 2.6, Math.min(dt * 2.6, retreatTarget - retreat));
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const row = Math.floor(i / 3 / (columns + 1));
            const z = BEACH_SHORE_Z - retreat - row * 2;
            positions[i + 2] = z;
            positions[i + 1] = beachWaterHeight(x, z, time);
            const a = Math.cos(z * 1.1 + x * 0.16 + time * 0.7) * 0.04;
            const b = Math.cos(x * 0.5 + z * 0.8 + time * 1.2) * 0.018;
            const nx = -(a * 0.16 + b * 0.5);
            const nz = -(a * 1.1 + b * 0.8);
            const length = Math.hypot(nx, 1, nz);
            normals[i] = nx / length;
            normals[i + 1] = 1 / length;
            normals[i + 2] = nz / length;
        }
        mesh.setPositions(positions);
        mesh.setNormals(normals);
        mesh.update();
        for (let band = 0; band < 3; band++) {
            for (let column = 0; column < 65; column++) {
                const x = -128 + column * 4;
                const z = BEACH_SHORE_Z - 0.4 - retreat - band * 2.8 + Math.sin(time * 0.6 + band + x * 0.17) * 0.24;
                for (let edge = 0; edge < 2; edge++) {
                    const index = ((band * 65 + column) * 2 + edge) * 3;
                    const depth = z - edge * (0.1 + 0.04 * Math.sin(x * 0.8 + time));
                    foamPositions[index] = x;
                    foamPositions[index + 1] = beachWaterHeight(x, depth, time) + 0.06;
                    foamPositions[index + 2] = depth;
                }
            }
        }
        foamMesh.setPositions(foamPositions);
        foamMesh.update();
    };
    update(0);
    sea.addComponent('render', { meshInstances: [new MeshInstance(mesh, water)], castShadows: false });
    wash.addComponent('render', { meshInstances: [new MeshInstance(foamMesh, foam)], castShadows: false });
    return {
        update,
        heightAt: (x: number, z: number) => beachWaterHeight(x, z, time),
        get retreat() {
            return retreat;
        }
    };
};
