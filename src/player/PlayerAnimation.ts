import type { Entity, GraphNode } from 'playcanvas';
import { Script } from 'playcanvas';

export class PlayerAnimation extends Script {
    static scriptName = 'playerAnimation';

    private time = 0;
    private y = 0;
    private limbs: (GraphNode | null)[] = [];

    initialize() {
        this.y = this.entity.getLocalPosition().y;
        this.limbs = ['left-arm', 'right-arm', 'left-leg', 'right-leg'].map((name) => this.entity.findByName(name));
    }

    update(dt: number) {
        const body = this.entity.parent as Entity | null;
        const velocity = body?.rigidbody?.linearVelocity;
        const speed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        this.time += dt * Math.min(speed * 2, 14);

        const swing = Math.sin(this.time) * Math.min(speed * 5, 45);
        this.limbs[0]?.setLocalEulerAngles(swing, 0, 0);
        this.limbs[1]?.setLocalEulerAngles(-swing, 0, 0);
        this.limbs[2]?.setLocalEulerAngles(-swing, 0, 0);
        this.limbs[3]?.setLocalEulerAngles(swing, 0, 0);
        this.entity.setLocalPosition(0, this.y + Math.abs(Math.sin(this.time)) * Math.min(speed * 0.01, 0.04), 0);
    }
}
