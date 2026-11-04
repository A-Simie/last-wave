import type { StandardMaterial } from 'playcanvas';
import { Entity, Vec3 } from 'playcanvas';

import type { Vector3Tuple } from '../data/foundation';

export const addCharacterCollision = (entity: Entity) => {
    // The box keeps feet on ledges; its bottom is 1 m below the body's pivot.
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(0.4, 1.2, 0.4),
        linearOffset: new Vec3(0, 0.2, 0)
    });
};

export const createCharacterModel = (shirt: StandardMaterial, skin: StandardMaterial, pants: StandardMaterial) => {
    const model = new Entity('character');
    model.setLocalPosition(0, 0.3, 0);

    const part = (
        parent: Entity,
        name: string,
        position: Vector3Tuple,
        scale: Vector3Tuple,
        material: StandardMaterial
    ) => {
        const entity = new Entity(name);
        entity.addComponent('render', { type: 'box', material });
        entity.setLocalPosition(...position);
        entity.setLocalScale(...scale);
        parent.addChild(entity);
    };
    const limb = (
        name: string,
        position: Vector3Tuple,
        offset: number,
        scale: Vector3Tuple,
        material: StandardMaterial
    ) => {
        const joint = new Entity(name);
        joint.setLocalPosition(...position);
        model.addChild(joint);
        part(joint, `${name}-mesh`, [0, offset, 0], scale, material);
    };

    part(model, 'body', [0, 0, 0], [0.56, 0.88, 0.38], shirt);
    part(model, 'head', [0, 0.76, 0], [0.52, 0.6, 0.52], skin);
    limb('left-arm', [-0.38, 0.44, 0], -0.44, [0.18, 0.88, 0.32], shirt);
    limb('right-arm', [0.38, 0.44, 0], -0.44, [0.18, 0.88, 0.32], shirt);
    limb('left-leg', [-0.15, -0.44, 0], -0.43, [0.24, 0.86, 0.34], pants);
    limb('right-leg', [0.15, -0.44, 0], -0.43, [0.24, 0.86, 0.34], pants);

    return model;
};
