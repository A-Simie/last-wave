import { Color, Entity, TONEMAP_NEUTRAL } from 'playcanvas';
import type { Vec3 } from 'playcanvas';
import type { ThirdPersonController } from 'playcanvas/scripts/esm/third-person-controller.mjs';

export const CAMERA_SETTINGS = {
    cameraDistance: 5,
    cameraHeight: 0.5,
    initialPitch: 15,
    invertLookY: true,
    cameraPositionDamping: 0.97,
    cameraLookAtDamping: 0.97
} satisfies Partial<ThirdPersonController>;

export const framePlayerCamera = (camera: Entity, playerPosition: Vec3) => {
    const pivot = playerPosition.clone();
    pivot.y += CAMERA_SETTINGS.cameraHeight;
    const pitch = (CAMERA_SETTINGS.initialPitch * Math.PI) / 180;
    camera.setPosition(
        pivot.x,
        pivot.y + Math.sin(pitch) * CAMERA_SETTINGS.cameraDistance,
        pivot.z + Math.cos(pitch) * CAMERA_SETTINGS.cameraDistance
    );
    camera.lookAt(pivot);
};

export const createCamera = (parent: Entity, playerPosition: Vec3) => {
    const camera = new Entity('camera');
    camera.addComponent('camera', {
        clearColor: new Color(0.67, 0.78, 0.83),
        nearClip: 0.1,
        farClip: 150,
        fov: 55,
        toneMapping: TONEMAP_NEUTRAL
    });
    camera.camera!.requestSceneColorMap(true);
    parent.addChild(camera);
    framePlayerCamera(camera, playerPosition);
    return camera;
};
