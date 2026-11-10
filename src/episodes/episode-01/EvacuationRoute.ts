import { Entity, Mesh, MeshInstance, Quat, Vec3, calculateNormals } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBox } from '../../scenes/primitives';

import { BEACH_SHORE_Z } from './entryLayout';
import { EVACUATION_RAMP, evacuationHeight } from './waveLayout';

export const createEvacuationRoute = (parent: Entity, app: AppBase) => {
    const root = new Entity('beach-evacuation-route');
    parent.addChild(root);
    const materials = {
        wood: createMaterial('evacuation-timber', 0.48, 0.34, 0.22),
        sand: createMaterial('exposed-wet-sand', 0.63, 0.65, 0.51),
        dune: createMaterial('evacuation-dune-sand', 0.83, 0.8, 0.63),
        green: createMaterial('evacuation-green', 0.22, 0.83, 0.49),
        pale: createMaterial('evacuation-rope', 0.89, 0.82, 0.62),
        dark: createMaterial('evacuation-posts', 0.15, 0.32, 0.29)
    };
    materials.green.emissive.set(0.12, 0.38, 0.17);
    materials.green.update();
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    box(root, 'exposed-seabed', [0, -0.4, BEACH_SHORE_Z - 17], [180, 0.18, 36], materials.sand);
    const { start, end, rise, width } = EVACUATION_RAMP;
    const positions: number[] = [];
    const indices: number[] = [];
    for (let row = 0; row <= 24; row++) {
        const z = start - 0.2 + row * 2.5;
        for (let column = 0; column <= 40; column++) {
            const x = -60 + column * 3;
            const edge = Math.min(1, Math.max(0, (Math.abs(x) - 4) / 12));
            const hill = edge * Math.min(1, (z - start) / 10) * (0.5 + Math.sin(x * 0.14 + z * 0.09) * 0.7);
            positions.push(x, evacuationHeight(z) - 0.22 + hill, z);
            if (row < 24 && column < 40) {
                const i = row * 41 + column;
                indices.push(i, i + 41, i + 1, i + 1, i + 41, i + 42);
            }
        }
    }
    const dunes = new Entity('evacuation-dunes');
    root.addChild(dunes);
    const duneMesh = new Mesh(app.graphicsDevice);
    root.once('destroy', () => duneMesh.destroy());
    duneMesh.setPositions(positions);
    duneMesh.setNormals(calculateNormals(positions, indices));
    duneMesh.setIndices(indices);
    duneMesh.update();
    dunes.addComponent('render', { meshInstances: [new MeshInstance(duneMesh, materials.dune)], castShadows: false });
    const angle = Math.atan2(rise, end - start);
    const length = Math.hypot(rise, end - start);
    const ramp = createStaticBox(
        root,
        {
            name: 'evacuation-dune-ramp',
            position: [0, rise / 2 - Math.cos(angle) * 0.15, (start + end) / 2 + Math.sin(angle) * 0.15],
            size: [width, 0.3, length]
        },
        materials.wood
    );
    ramp.rigidbody!.teleport(ramp.getPosition(), new Vec3((-angle * 180) / Math.PI, 0, 0));
    createStaticBox(
        root,
        { name: 'evacuation-upper-landing', position: [0, rise - 0.15, 31], size: [width, 0.3, 6] },
        materials.wood
    );
    createStaticBox(
        root,
        { name: 'evacuation-landing-end-rail', position: [0, rise + 0.65, 34], size: [width, 1.3, 0.16] },
        materials.dark
    );
    for (const x of [-width / 2, width / 2]) {
        const rail = createStaticBox(
            root,
            {
                name: `evacuation-railing-${x}`,
                position: [x, rise / 2 + 0.66, (start + end) / 2],
                size: [0.12, 1.35, length]
            },
            materials.dark
        );
        rail.rigidbody!.teleport(rail.getPosition(), new Vec3((-angle * 180) / Math.PI, 0, 0));
        for (let z = start; z <= end; z += 2)
            box(
                root,
                `evacuation-post-${x}-${z}`,
                [x, evacuationHeight(z) + 0.8, z],
                [0.19, 1.6, 0.19],
                materials.pale
            );
    }
    for (let z = start; z <= end; z += 0.65) {
        const plank = box(
            root,
            `dune-board-${z}`,
            [0, evacuationHeight(z) + 0.012, z],
            [width - 0.1, 0.018, 0.6],
            materials.pale
        );
        plank.setLocalEulerAngles((-angle * 180) / Math.PI, 0, 0);
    }
    for (const z of [-23, -17, -11, -7, -1, 5, 10, 15, 20, 27]) {
        const arrow = new Entity(`evacuation-arrow-${z}`);
        root.addChild(arrow);
        arrow.setPosition(0, evacuationHeight(z) + 0.045, z);
        arrow.setEulerAngles(z > start && z < end ? (-angle * 180) / Math.PI : 0, 0, 0);
        box(arrow, 'arrow-stem', [0, 0, -0.23], [0.25, 0.035, 1.2], materials.green);
        for (const sign of [-1, 1]) {
            const arm = box(arrow, `arrow-arm-${sign}`, [sign * 0.25, 0, 0.36], [0.22, 0.035, 0.86], materials.green);
            arm.setLocalEulerAngles(0, sign * -40, 0);
        }
    }
    for (const z of [11.5, 28.5]) {
        const sign = createTextSign(
            root,
            app.graphicsDevice,
            `higher-ground-${z}`,
            ['HIGHER GROUND', 'EVACUATION ROUTE  ↑'],
            '#155441',
            4.6,
            0.9
        );
        root.addChild(sign);
        sign.setPosition(0, evacuationHeight(z) + 3.6, z);
        sign.setEulerAngles(90, 180, 0);
        for (const x of [-3.3, 3.3])
            box(root, `sign-post-${z}-${x}`, [x, evacuationHeight(z) + 1.8, z], [0.16, 3.6, 0.16], materials.dark);
    }
    const group = app.batcher!.addGroup('evacuation-static', false, 32);
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    root.findComponents('render').forEach((render) => {
        render.batchGroupId = group.id;
    });
    const fallingSign = new Entity('wave-falling-sign');
    root.addChild(fallingSign);
    fallingSign.setPosition(3.15, evacuationHeight(25.3) + 0.05, 25.3);
    box(fallingSign, 'loose-sign-pole', [0, 1.5, 0], [0.11, 3, 0.11], materials.dark);
    box(fallingSign, 'loose-sign-board', [0, 3, 0], [1.6, 0.72, 0.12], materials.dark);
    box(fallingSign, 'loose-sign-stripe', [0, 3, -0.065], [1.25, 0.12, 0.018], materials.pale);
    const resting = new Quat().mul2(
        new Quat().setFromEulerAngles(90 - (angle * 180) / Math.PI, 0, 0),
        new Quat().setFromEulerAngles(0, 0, 90)
    );
    const rotation = new Quat();
    return {
        update: (fallTime: number | null, steady: boolean) => {
            const time = fallTime === null ? 0 : Math.min(1, fallTime / 0.95);
            const t = steady ? time : time * time;
            fallingSign.setRotation(rotation.slerp(Quat.IDENTITY, resting, t));
            fallingSign.setPosition(3.15, evacuationHeight(25.3) + 0.05 + t * 0.06, 25.3);
        }
    };
};
