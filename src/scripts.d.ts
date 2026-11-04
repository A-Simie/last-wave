declare module 'playcanvas/scripts/esm/third-person-controller.mjs' {
    import type { Entity } from 'playcanvas';
    import { Script } from 'playcanvas';

    export class ThirdPersonController extends Script {
        camera: Entity;
        characterModel: Entity;
        cameraDistance: number;
        cameraHeight: number;
        initialPitch: number;
        invertLookY: boolean;
        cameraPositionDamping: number;
        cameraLookAtDamping: number;
        jumpForce: number;
        speedGround: number;
        sprintMult: number;
    }
}
