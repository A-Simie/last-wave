import type { Entity } from 'playcanvas';
import { Script } from 'playcanvas';

import type { AnimatedCharacter } from './AnimatedCharacter';

export class PlayerAnimation extends Script {
    static scriptName = 'playerAnimation';

    character!: AnimatedCharacter;
    paused = false;

    update(dt: number) {
        if (this.paused || dt === 0) return;
        const body = this.entity.parent as Entity | null;
        const velocity = body?.rigidbody?.linearVelocity;
        const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        const pose =
            Math.abs(velocity?.y ?? 0) > 1.5
                ? 'jump'
                : speed > 6
                  ? 'sprint'
                  : speed > 2
                    ? 'jog'
                    : speed > 0.12
                      ? 'walk'
                      : 'idle';
        this.character.play(pose);
        this.character.anim.speed = pose === 'jog' ? Math.max(0.75, Math.min(1.4, speed / 4)) : 1;
    }
}
