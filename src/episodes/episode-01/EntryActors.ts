import { Script, Vec3 } from 'playcanvas';
import type { Entity, GraphNode } from 'playcanvas';

import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import type { CompanionController } from '../../player/CompanionController';
import type { CutsceneState } from '../../systems/CutsceneSystem';

import { QUEUE_CUTSCENE } from './entry';

export class EntryActors extends Script {
    static scriptName = 'entryActors';
    officer!: AnimatedCharacter;
    attendant!: AnimatedCharacter;
    queue!: AnimatedCharacter[];
    player!: AnimatedCharacter;
    companion!: CompanionController;
    cap!: Entity;
    head!: GraphNode;
    private state: CutsceneState | null = null;
    private suspended = false;
    private queueTravel = 0;
    private readonly position = new Vec3();

    set paused(value: boolean) {
        this.suspended = value;
        this.syncPlayback();
    }

    present(state: CutsceneState | null) {
        this.state = state;
        if (state) {
            this.player.root.setLocalEulerAngles(0, 180, 0);
            this.player.play('idle');
            this.player.anim.speed = 1;
        }
        this.officer.play(state?.beat.speaker === 'Beach officer' ? 'talk' : 'idle');
        this.companion.present(state ? state.beat.speaker === 'Friend' : null);
        this.syncPlayback();
    }

    private syncPlayback() {
        this.player.anim.playing = !this.suspended || !!this.state;
        this.officer.anim.playing = !this.suspended || !!this.state;
        this.attendant.anim.playing = !this.suspended;
        for (const character of this.queue)
            character.anim.playing = !this.suspended || this.state?.cutsceneId === QUEUE_CUTSCENE.id;
    }

    update(dt: number) {
        if (dt <= 0 || this.state?.cutsceneId !== QUEUE_CUTSCENE.id) return;
        const step = Math.min(dt, 0.1);
        const distance = Math.min(0.6 - this.queueTravel, step * 0.35);
        this.queueTravel += distance;
        for (const character of this.queue) {
            character.move(distance / step);
            this.position.copy(character.root.getPosition());
            this.position.z -= distance;
            character.root.setPosition(this.position);
        }
    }

    postUpdate() {
        this.position.copy(this.head.getPosition());
        this.position.y += 0.15;
        this.cap.setPosition(this.position);
    }
}
