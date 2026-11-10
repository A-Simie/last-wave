import { Texture } from 'playcanvas';
import type { Entity, GraphicsDevice, StandardMaterial } from 'playcanvas';

export const textureForestGround = (
    root: Entity,
    device: GraphicsDevice,
    soil: StandardMaterial,
    path: StandardMaterial
) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#554c38';
    context.fillRect(0, 0, 512, 512);
    let state = 10112026;
    const random = () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
    for (let i = 0; i < 4800; i++) {
        const x = random() * 512,
            y = random() * 512;
        context.fillStyle = ['#736449', '#433f31', '#85704b', '#61543e', '#353a2f'][i % 5]!;
        context.beginPath();
        context.ellipse(x, y, 1 + random() * 4, 0.5 + random() * 1.8, random() * Math.PI, 0, Math.PI * 2);
        context.fill();
    }
    const texture = new Texture(device, { name: 'forest-leaf-litter', mipmaps: true });
    texture.setSource(canvas);
    root.once('destroy', () => texture.destroy());
    for (const [material, x, y] of [
        [soil, 14, 12],
        [path, 12, 1]
    ] as const) {
        material.diffuseMap = texture;
        material.diffuseMapTiling.set(x, y);
        material.diffuse.set(0.65, 0.67, 0.56);
        material.gloss = 0.12;
        material.update();
    }
};
