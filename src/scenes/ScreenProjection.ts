import { Vec3 } from 'playcanvas';
import type { CameraComponent } from 'playcanvas';

export type ScreenPoint = { readonly x: number; readonly y: number };

export class ScreenProjection {
    private readonly view = new Vec3();
    private readonly screen = new Vec3();

    project(camera: CameraComponent, position: Vec3): ScreenPoint | null {
        camera.viewMatrix.transformPoint(position, this.view);
        if (this.view.z >= -camera.nearClip) return null;
        camera.worldToScreen(position, this.screen);
        return { x: this.screen.x, y: this.screen.y };
    }
}
