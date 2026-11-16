import { Entity } from 'playcanvas';
import type { StandardMaterial } from 'playcanvas';

import { createBoxVisual, createMaterial } from '../scenes/primitives';

export const createForestGoblin = (parent: Entity, side: number) => {
    const root = new Entity(`forest-goblin-${side < 0 ? 'left' : 'right'}`);
    parent.addChild(root);
    const materials = {
        skin: createMaterial('goblin-moss-skin', 0.22, 0.4, 0.16),
        dark: createMaterial('goblin-dark-leather', 0.075, 0.045, 0.028),
        coat: createMaterial('goblin-aubergine-cloth', 0.17, 0.065, 0.18),
        eyes: createMaterial('goblin-amber-eyes', 0.95, 0.72, 0.18),
        teeth: createMaterial('goblin-small-fangs', 0.86, 0.8, 0.57),
        stone: createMaterial('goblin-carved-pedestal', 0.25, 0.28, 0.25)
    };
    materials.eyes.emissive.set(0.2, 0.1, 0.01);
    materials.eyes.update();
    root.once('destroy', () => Object.values(materials).forEach((m) => m.destroy()));
    const shape = (
        owner: Entity,
        name: string,
        type: 'sphere' | 'cone' | 'cylinder',
        position: readonly [number, number, number],
        size: readonly [number, number, number],
        material: StandardMaterial
    ) => {
        const part = new Entity(name);
        owner.addChild(part);
        part.setLocalPosition(...position);
        part.setLocalScale(...size);
        part.addComponent('render', { type, material, castShadows: false });
        return part;
    };
    createBoxVisual(root, 'goblin-pedestal', [0, 1.05, 0], [0.85, 2.1, 0.85], materials.stone);
    for (const y of [0.12, 1.65, 2.1])
        createBoxVisual(root, 'goblin-pedestal-cap', [0, y, 0], [1.05, 0.16, 1.05], materials.stone);
    const body = new Entity('goblin-sentry');
    root.addChild(body);
    body.setLocalPosition(0, 2.18, 0);
    for (const x of [-0.18, 0.18])
        shape(body, 'goblin-boot', 'sphere', [x, 0.13, 0.1], [0.26, 0.25, 0.4], materials.dark);
    shape(body, 'goblin-coat', 'cone', [0, 0.64, 0], [0.8, 0.96, 0.58], materials.coat);
    createBoxVisual(body, 'goblin-belt', [0, 0.52, 0.28], [0.58, 0.09, 0.07], materials.dark);
    shape(body, 'goblin-buckle', 'sphere', [0, 0.52, 0.33], [0.12, 0.13, 0.04], materials.teeth);
    for (const side of [-1, 1]) {
        const sleeve = shape(
            body,
            'goblin-sleeve',
            'cylinder',
            [side * 0.29, 0.895, 0],
            [0.22, 0.35, 0.24],
            materials.coat
        );
        sleeve.setLocalEulerAngles(0, 0, side * 53);
    }
    const hands = [-0.43, 0.43].map((x) =>
        shape(body, 'goblin-hand', 'sphere', [x, 0.79, 0.07], [0.18, 0.26, 0.18], materials.skin)
    );
    const head = new Entity('goblin-head');
    body.addChild(head);
    head.setLocalPosition(0, 1.24, 0);
    shape(head, 'goblin-face', 'sphere', [0, 0, 0], [0.64, 0.61, 0.58], materials.skin);
    for (const earSide of [-1, 1]) {
        const ear = shape(
            head,
            'goblin-pointed-ear',
            'cone',
            [earSide * 0.43, 0.08, -0.01],
            [0.3, 0.5, 0.16],
            materials.skin
        );
        ear.setLocalEulerAngles(0, 0, -earSide * 70);
        shape(head, 'goblin-ear-inner', 'sphere', [earSide * 0.4, 0.08, 0.07], [0.19, 0.11, 0.04], materials.coat);
    }
    const eyes = [-0.14, 0.14].map((x) => {
        const eye = shape(head, 'goblin-eye', 'sphere', [x, 0.065, 0.265], [0.18, 0.105, 0.06], materials.eyes);
        shape(head, 'goblin-pupil', 'sphere', [x, 0.065, 0.303], [0.045, 0.075, 0.018], materials.dark);
        const brow = createBoxVisual(head, 'goblin-brow', [x, 0.15, 0.265], [0.2, 0.055, 0.08], materials.skin);
        brow.setLocalEulerAngles(0, 0, x < 0 ? -12 : 12);
        return eye;
    });
    shape(head, 'goblin-long-nose', 'sphere', [0, -0.02, 0.32], [0.16, 0.25, 0.28], materials.skin);
    createBoxVisual(head, 'goblin-smile', [0, -0.16, 0.25], [0.28, 0.035, 0.055], materials.dark);
    for (const x of [-0.09, 0.09]) {
        const fang = shape(head, 'goblin-fang', 'cone', [x, -0.2, 0.29], [0.045, 0.1, 0.04], materials.teeth);
        fang.setLocalEulerAngles(0, 0, 180);
    }
    shape(head, 'goblin-hat-brim', 'cylinder', [0, 0.31, -0.02], [0.84, 0.07, 0.68], materials.coat);
    const hat = shape(
        head,
        'goblin-crooked-hat',
        'cone',
        [-side * 0.09, 0.58, -0.03],
        [0.65, 0.58, 0.55],
        materials.coat
    );
    hat.setLocalEulerAngles(0, 0, side * 17);
    return {
        root,
        update: (time: number, steady: boolean) => {
            head.setLocalEulerAngles(
                steady ? 0 : Math.sin(time * 0.7 + side) * 3,
                side * -10 + (steady ? 0 : Math.sin(time * 0.4) * 7),
                steady ? 0 : Math.sin(time * 0.6) * 2
            );
            body.setLocalScale(1, steady ? 1 : 1 + Math.sin(time * 1.6 + side) * 0.012, 1);
            hands[side < 0 ? 1 : 0].setLocalEulerAngles(0, 0, steady ? 0 : Math.sin(time * 0.9) * 9);
            const blink = steady ? 1 : Math.cos(time * 0.73 + side) > 0.996 ? 0.1 : 1;
            eyes.forEach((eye) => eye.setLocalScale(0.18, 0.105 * blink, 0.06));
        }
    };
};
