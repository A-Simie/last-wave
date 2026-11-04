import type { Entity } from 'playcanvas';
import { Script, Vec3 } from 'playcanvas';

export type Interactable = {
    readonly id: string;
    readonly label: string;
    readonly entity: Entity;
    readonly radius: number;
    readonly message: string;
};

export type InteractionState = {
    readonly targetLabel: string | null;
    readonly message: string | null;
};

export class InteractionSystem extends Script {
    static scriptName = 'interactionSystem';

    player!: Entity;
    targets: readonly Interactable[] = [];
    onStateChange: ((state: InteractionState) => void) | null = null;

    private target: Interactable | null = null;
    private message: string | null = null;
    private messageTime = 0;
    private readonly distance = new Vec3();
    private readonly rayOptions = {
        filterCallback: (entity: Entity) => entity !== this.player && !!entity.rigidbody
    };

    get state(): InteractionState {
        return { targetLabel: this.target?.label ?? null, message: this.message };
    }

    initialize() {
        this.on('destroy', () => {
            this.onStateChange = null;
            this.targets = [];
        });
    }

    postUpdate(dt: number) {
        if (dt === 0) return;
        const target = this.findTarget();
        let changed = target !== this.target;
        this.target = target;

        if (this.messageTime > 0) {
            this.messageTime = Math.max(0, this.messageTime - dt);
            if (this.messageTime === 0) {
                this.message = null;
                changed = true;
            }
        }

        if (changed) this.onStateChange?.(this.state);
    }

    interact() {
        if (!this.enabled || this.app.timeScale === 0) return;
        this.target = this.findTarget();
        if (this.target) {
            this.message = this.target.message;
            this.messageTime = 4;
        }
        this.onStateChange?.(this.state);
    }

    private findTarget(): Interactable | null {
        if (!this.player.enabled) return null;
        const position = this.player.getPosition();
        let closest: Interactable | null = null;
        let closestDistance = Infinity;

        for (const target of this.targets) {
            if (!target.entity.enabled) continue;
            const distance = this.distance.sub2(target.entity.getPosition(), position).lengthSq();
            if (distance > target.radius * target.radius || distance >= closestDistance) continue;

            const hit = this.app.systems.rigidbody!.raycastFirst(
                position,
                target.entity.getPosition(),
                this.rayOptions
            );
            if (hit && hit.entity !== target.entity) continue;
            closest = target;
            closestDistance = distance;
        }

        return closest;
    }
}
