import { Script, Vec3 } from 'playcanvas';

import type { CutsceneState } from '../../systems/CutsceneSystem';

import { ENTRY_SHOTS } from './entryLayout';

export class EntryCamera extends Script {
    static scriptName = 'entryCamera';
    private shot = '';
    private steady = false;
    private time = 0;
    private readonly from = new Vec3();
    private readonly position = new Vec3();
    private readonly fromTarget = new Vec3();
    private readonly target = new Vec3();
    private readonly to = new Vec3();
    private readonly toTarget = new Vec3();

    present(state: CutsceneState | null, steady: boolean) {
        const key = state?.beat.shot ?? '';
        this.entity.camera!.enabled = !!key;
        if (!key) {
            this.shot = '';
            return;
        }
        if (key === this.shot && this.steady === steady) return;
        const shot = ENTRY_SHOTS[key];
        if (!shot) throw new Error(`Unknown entry camera shot: ${key}`);
        const first = !this.shot;
        this.shot = key;
        this.steady = steady;
        this.time = first || steady ? 1 : 0;
        this.from.copy(this.position);
        this.fromTarget.copy(this.target);
        this.to.set(...shot.position);
        this.toTarget.set(...shot.target);
        this.update(0);
    }

    update(dt: number) {
        if (!this.shot) return;
        const shot = ENTRY_SHOTS[this.shot];
        this.time = Math.min(1, this.time + dt / 1.2);
        const t = this.time * this.time * (3 - 2 * this.time);
        this.position.lerp(this.from, this.to, t);
        this.target.lerp(this.fromTarget, this.toTarget, t);
        this.entity.setPosition(this.position);
        this.entity.lookAt(this.target);
        const aspect = this.app.graphicsDevice.width / this.app.graphicsDevice.height;
        this.entity.camera!.fov = aspect < 1 ? Math.min(85, shot.fov + (1 - aspect) * 36) : shot.fov;
    }
}
