import { ADDRESS_CLAMP_TO_EDGE, Color, Entity, FILTER_LINEAR, StandardMaterial, Texture } from 'playcanvas';
import type { GraphicsDevice } from 'playcanvas';

export const createCanvasPanel = (
    owner: Entity,
    device: GraphicsDevice,
    name: string,
    canvas: HTMLCanvasElement,
    width: number,
    height: number
) => {
    const texture = new Texture(device, {
        name,
        mipmaps: false,
        minFilter: FILTER_LINEAR,
        magFilter: FILTER_LINEAR,
        addressU: ADDRESS_CLAMP_TO_EDGE,
        addressV: ADDRESS_CLAMP_TO_EDGE
    });
    owner.once('destroy', () => texture.destroy());
    texture.setSource(canvas);
    const material = new StandardMaterial();
    owner.once('destroy', () => material.destroy());
    material.name = name;
    material.useLighting = false;
    material.emissiveMap = texture;
    material.emissive = Color.WHITE;
    material.update();
    const panel = new Entity(name);
    panel.setLocalScale(width, 1, height);
    panel.setLocalEulerAngles(90, 0, 0);
    panel.addComponent('render', { type: 'plane', material, castShadows: false });
    return { panel, redraw: () => texture.upload() };
};
