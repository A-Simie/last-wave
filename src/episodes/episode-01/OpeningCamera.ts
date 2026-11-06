import { Script, Vec3 } from 'playcanvas';
import type { Entity } from 'playcanvas';

import type { CutsceneState } from '../../systems/CutsceneSystem';

import { OPENING_SHOTS } from './openingLayout';

export class OpeningCamera extends Script {
    static scriptName = 'openingCamera';

    playerCamera!: Entity;
    private shot = '';
    private time = 0;
    private duration = 1;
    private steady = false;
    private fromFov = 50;
    private toFov = 50;
    private fov = 50;
    private readonly from = new Vec3();
    private readonly to = new Vec3();
    private readonly fromTarget = new Vec3();
    private readonly toTarget = new Vec3();
    private readonly position = new Vec3();
    private readonly target = new Vec3();

    present(state: CutsceneState | null, steady: boolean, preview = false) {
        const key = preview ? 'preview' : (state?.beat.shot ?? '');
        this.entity.camera!.enabled = !!key;
        this.playerCamera.camera!.enabled = !key;
        if (!key) {
            this.shot = '';
            return;
        }
        if (key === this.shot && steady === this.steady) return;
        const shot = OPENING_SHOTS[key];
        if (!shot) throw new Error(`Unknown opening camera shot: ${key}`);
        const first = !this.shot || this.shot === 'preview';
        this.steady = steady;
        this.shot = key;
        this.time = 0;
        this.duration = key === 'television' ? 16 : first ? 1 : 1.65;
        this.to.set(...shot.position);
        this.toTarget.set(...shot.target);
        this.toFov = shot.fov;
        if (key === 'television' && first) {
            const start = OPENING_SHOTS.broadcastWide;
            this.position.set(...start.position);
            this.target.set(...start.target);
            this.fov = start.fov;
        }
        this.from.copy(this.position);
        this.fromTarget.copy(this.target);
        this.fromFov = this.fov;
        if (steady || preview) this.time = this.duration;
        this.update(0);
    }

    update(dt: number) {
        if (!this.shot) return;
        this.time = Math.min(this.duration, this.time + dt);
        const t = this.time / this.duration;
        const blend = t * t * (3 - 2 * t);
        this.position.lerp(this.from, this.to, blend);
        this.target.lerp(this.fromTarget, this.toTarget, blend);
        this.entity.setPosition(this.position);
        this.entity.lookAt(this.target);
        const aspect = this.app.graphicsDevice.width / this.app.graphicsDevice.height;
        const fov = this.fromFov + (this.toFov - this.fromFov) * blend;
        this.fov = fov;
        // Keep both seats in portrait without changing the authored desktop framing.
        this.entity.camera!.fov = aspect < 1 ? Math.min(85, fov + (1 - aspect) * 40) : fov;
    }
}
