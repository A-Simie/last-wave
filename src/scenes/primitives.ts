import { Color, Entity, StandardMaterial, Vec3 } from 'playcanvas';

import type { BoxDefinition, Vector3Tuple } from '../data/foundation';

export const createMaterial = (name: string, r: number, g: number, b: number) => {
    const result = new StandardMaterial();
    result.name = name;
    result.diffuse = new Color(r, g, b);
    result.update();
    return result;
};

export const createStaticBody = (parent: Entity, definition: BoxDefinition) => {
    const { name, position, size, yaw = 0 } = definition;
    const entity = new Entity(name);
    parent.addChild(entity);
    entity.setPosition(...position);
    entity.setEulerAngles(0, yaw, 0);
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(size[0] / 2, size[1] / 2, size[2] / 2)
    });
    entity.addComponent('rigidbody', { type: 'static' });
    return entity;
};

export const createStaticBox = (parent: Entity, definition: BoxDefinition, material: StandardMaterial) => {
    const entity = createStaticBody(parent, definition);
    const { name, size } = definition;
    const visual = new Entity(`${name}-visual`);
    visual.setLocalScale(...size);
    visual.addComponent('render', { type: 'box', material });
    entity.addChild(visual);
    return entity;
};

export const createBoxVisual = (
    parent: Entity,
    name: string,
    position: Vector3Tuple,
    size: Vector3Tuple,
    material: StandardMaterial
) => {
    const entity = new Entity(name);
    parent.addChild(entity);
    entity.setLocalPosition(...position);
    entity.setLocalScale(...size);
    entity.addComponent('render', { type: 'box', material });
    return entity;
};
