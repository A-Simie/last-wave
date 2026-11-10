import type { Entity } from 'playcanvas';
import { Script, math } from 'playcanvas';

import { PLAYER_POSE_HEIGHTS } from '../data/characterModels';

import type { AnimatedCharacter } from './AnimatedCharacter';

export class PlayerAnimation extends Script {
    static scriptName = 'playerAnimation';

    character!: AnimatedCharacter;
    isGrounded!: () => boolean;
    paused = false;

    postUpdate(dt: number) {
        if (this.paused || dt === 0) return;
        const body = this.entity.parent as Entity | null;
        const velocity = body?.rigidbody?.linearVelocity;
        const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        const airborne = !this.isGrounded() || Math.abs(velocity?.y ?? 0) > 1.5;
        const pose = airborne ? 'jump' : this.character.move(speed);
        if (airborne) this.character.play('jump');
        const height = math.lerp(
            this.entity.getLocalPosition().y,
            -1 + PLAYER_POSE_HEIGHTS[pose],
            1 - Math.exp(-dt * 14)
        );
        this.entity.setLocalPosition(0, height, 0);
    }
}
