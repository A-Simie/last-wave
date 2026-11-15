import { BLEND_NORMAL, CULLFACE_NONE, Entity, Mesh, MeshInstance, PRIMITIVE_LINES } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

import { createMaterial } from '../scenes/primitives';

import { FOREST_EYE_ANCHORS, FOREST_SCARE_START, forestBatFlight } from './forestScare';

export const createForestEffects = (root: Entity, device: GraphicsDevice, mobile: boolean) => {
    const batRoot = new Entity('forest-bat-flock');
    root.addChild(batRoot);
    const batMaterial = createMaterial('bat-charcoal', 0.045, 0.039, 0.052);
    batMaterial.cull = CULLFACE_NONE;
    batMaterial.update();
    const count = mobile ? 12 : 20;
    const positions = new Float32Array(count * 9 * 9);
    const mesh = new Mesh(device);
    mesh.clear(true, false);
    mesh.setPositions(positions);
    const normals = new Float32Array(positions.length);
    for (let i = 1; i < normals.length; i += 3) normals[i] = 1;
    mesh.setNormals(normals);
    mesh.update();
    batRoot.addComponent('render', { meshInstances: [new MeshInstance(mesh, batMaterial)], castShadows: false });
    const eyes = new Entity('forest-hidden-eyes');
    root.addChild(eyes);
    const glow = createMaterial('forest-eye-glint', 0.7, 0.005, 0.002);
    glow.useLighting = false;
    glow.emissive.set(3, 0.008, 0.003);
    glow.update();
    for (let i = 0; i < 6; i++) {
        const pair = new Entity(`forest-eyes-${i}`);
        eyes.addChild(pair);
        pair.setLocalPosition(...FOREST_EYE_ANCHORS[i]!);
        for (const x of [-0.07, 0.07]) {
            const eye = new Entity('eye-reflection');
            pair.addChild(eye);
            eye.setLocalPosition(x, 0, 0);
            eye.setLocalScale(0.075, 0.045, 0.055);
            eye.addComponent('render', { type: 'sphere', material: glow, castShadows: false });
        }
    }
    const flyingEyes = Array.from({ length: count }, (_, i) => {
        const pair = eyes.children[i % 6]!.clone();
        pair.name = `forest-flying-eyes-${i}`;
        root.addChild(pair);
        pair.enabled = false;
        return pair;
    });
    const mistMaterial = createMaterial('forest-low-mist', 0.13, 0.21, 0.24);
    mistMaterial.opacity = 0.08;
    mistMaterial.blendType = BLEND_NORMAL;
    mistMaterial.depthWrite = false;
    mistMaterial.update();
    const fog = Array.from({ length: mobile ? 4 : 7 }, (_, i) => {
        const entity = new Entity(`forest-mist-${i}`);
        root.addChild(entity);
        entity.setLocalScale(13, 0.5, 3.5);
        entity.addComponent('render', { type: 'sphere', material: mistMaterial, castShadows: false });
        return entity;
    });
    const webMaterial = createMaterial('forest-web-silk', 0.31, 0.38, 0.39);
    webMaterial.emissive.set(0.08, 0.11, 0.12);
    webMaterial.update();
    const webMesh = new Mesh(device);
    const webPositions: number[] = [];
    for (let spoke = 0; spoke < 7; spoke++) {
        const angle = (spoke / 6) * 1.6;
        webPositions.push(0, 0, 0, Math.cos(angle), -Math.sin(angle), 0);
        for (let ring = 1; ring < 5; ring++) {
            const next = ((spoke + 1) / 6) * 1.6;
            if (spoke < 6)
                webPositions.push(
                    (Math.cos(angle) * ring) / 5,
                    (-Math.sin(angle) * ring) / 5,
                    0,
                    (Math.cos(next) * ring) / 5,
                    (-Math.sin(next) * ring) / 5,
                    0
                );
        }
    }
    webMesh.setPositions(webPositions);
    const webNormals = new Float32Array(webPositions.length);
    for (let i = 2; i < webNormals.length; i += 3) webNormals[i] = 1;
    webMesh.setNormals(webNormals);
    webMesh.update(PRIMITIVE_LINES);
    for (const [x, y, z] of [
        [-4, 2, 0],
        [5, 1.3, -3],
        [-5.4, 3.4, 3.5],
        [4.2, 3.2, 3.4],
        [-7.6, 2.8, 0.4],
        [7.1, 3.6, -0.3]
    ]) {
        const web = new Entity('forest-cobweb');
        root.addChild(web);
        web.setLocalPosition(x!, y!, z!);
        web.addComponent('render', { meshInstances: [new MeshInstance(webMesh, webMaterial)], castShadows: false });
    }
    root.once('destroy', () => {
        mesh.destroy();
        webMesh.destroy();
        batMaterial.destroy();
        glow.destroy();
        mistMaterial.destroy();
        webMaterial.destroy();
    });
    // The low-poly flock is the fallback until the supplied animated bat model has loaded.
    let procedural = true;
    return {
        useModelBats: () => {
            procedural = false;
        },
        update: (time: number, reduced: boolean, ambienceTime: number) => {
            const flight = time - FOREST_SCARE_START;
            batRoot.enabled = procedural && flight >= 0 && flight < 5.5 && !reduced;
            eyes.children.forEach((eye, i) => {
                eye.enabled = time >= 18.6 && time < FOREST_SCARE_START && (time < 20.2 ? i === 0 : time > 21.1);
            });
            flyingEyes.forEach((pair, i) => {
                const path = forestBatFlight(i, time);
                pair.enabled = !reduced && path.visible && (procedural || i < (mobile ? 6 : 12));
                if (!pair.enabled) return;
                const [x, y, z] = path.position;
                pair.setLocalPosition(x + Math.sin(path.yaw) * 0.12, y + 0.05, z + Math.cos(path.yaw) * 0.12);
                pair.setLocalEulerAngles(0, (path.yaw * 180) / Math.PI, 0);
                pair.setLocalScale(0.65, 0.65, 0.65);
            });
            fog.forEach((entity, i) =>
                entity.setLocalPosition(
                    -10 + i * 3.5 + (reduced ? 0 : Math.sin(ambienceTime * 0.09 + i) * 2),
                    0.15 + (i % 2) * 0.15,
                    -7 + i * 2
                )
            );
            if (!batRoot.enabled) return;
            for (let i = 0; i < count; i++) {
                const path = forestBatFlight(i, time);
                const [x, y, z] = path.position;
                const size = path.visible ? 0.28 + (i % 3) * 0.07 : 0;
                const flap = Math.sin(path.phase * (19 + (i % 4)) + i * 2.1) * 0.8;
                const c = Math.cos(path.yaw),
                    s = Math.sin(path.yaw);
                const points = [
                    [0, 0.1, 0.2],
                    [-0.1, 0, -0.2],
                    [0.1, 0, -0.2],
                    [0, 0.08, 0.12],
                    [-1, flap, -0.08],
                    [-0.65, -0.12, -0.28],
                    [0, 0.08, 0.12],
                    [-0.65, -0.12, -0.28],
                    [-0.28, -0.15, -0.21],
                    [0, 0.08, 0.12],
                    [-0.28, -0.15, -0.21],
                    [-0.1, 0, -0.2],
                    [0, 0.08, 0.12],
                    [0.65, -0.12, -0.28],
                    [1, flap, -0.08],
                    [0, 0.08, 0.12],
                    [0.28, -0.15, -0.21],
                    [0.65, -0.12, -0.28],
                    [0, 0.08, 0.12],
                    [0.1, 0, -0.2],
                    [0.28, -0.15, -0.21],
                    [-0.07, 0.1, 0.1],
                    [-0.13, 0.28, 0.03],
                    [0, 0.14, 0.1],
                    [0, 0.14, 0.1],
                    [0.13, 0.28, 0.03],
                    [0.07, 0.1, 0.1]
                ];
                points.forEach(([px, py, pz], j) =>
                    positions.set(
                        [x + (px! * c + pz! * s) * size, y + py! * size, z + (-px! * s + pz! * c) * size],
                        i * 81 + j * 3
                    )
                );
            }
            mesh.setPositions(positions);
            mesh.update();
        }
    };
};
