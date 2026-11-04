import { Color, Entity, TONEMAP_NEUTRAL } from 'playcanvas';
import type { ThirdPersonController } from 'playcanvas/scripts/esm/third-person-controller.mjs';

export const CAMERA_SETTINGS = {
    cameraDistance: 5,
    cameraHeight: 0.5,
    initialPitch: 15,
    invertLookY: true,
    cameraPositionDamping: 0.97,
    cameraLookAtDamping: 0.97
} satisfies Partial<ThirdPersonController>;

export const createCamera = (parent: Entity) => {
    const camera = new Entity('camera');
    camera.addComponent('camera', {
        clearColor: new Color(0.48, 0.72, 0.9),
        nearClip: 0.1,
        farClip: 80,
        fov: 55,
        toneMapping: TONEMAP_NEUTRAL
    });
    camera.setPosition(0, 3, 6);
    parent.addChild(camera);
    return camera;
};
