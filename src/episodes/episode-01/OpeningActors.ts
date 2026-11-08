import { Quat, Script } from 'playcanvas';
import type { Entity, GraphNode, Vec3 } from 'playcanvas';

import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import type { CompanionController } from '../../player/CompanionController';
import type { CutsceneState } from '../../systems/CutsceneSystem';

import { FRIEND_ROUTE, OPENING_SEATS } from './openingLayout';

export class OpeningActors extends Script {
    static scriptName = 'openingActors';

    friend!: Entity;
    friendModel!: AnimatedCharacter;
    companion!: CompanionController;
    playerModel!: Entity;
    seated!: AnimatedCharacter[];
    attendantModel!: AnimatedCharacter;
    patrons!: AnimatedCharacter[];
    fanBlades!: GraphNode[];
    private suspended = false;
    private cinematic = false;
    private fanAngle = 0;
    private fanRest: Quat[] = [];
    private readonly fanRotation = new Quat();

    initialize() {
        this.fanRest = this.fanBlades.map((blades) => blades.getLocalRotation().clone());
    }

    set paused(value: boolean) {
        this.suspended = value;
        this.syncPlayback();
    }

    get paused() {
        return this.suspended;
    }

    present(state: CutsceneState | null, preview = false) {
        this.cinematic = !!state || preview;
        this.playerModel.enabled = !this.cinematic;
        this.friend.enabled = !this.cinematic;
        this.seated.forEach((character, index) => {
            character.root.enabled = this.cinematic;
            const speaking = state?.beat.speaker === (index === 0 ? 'You' : 'Friend');
            character.play(speaking ? 'seatedTalk' : 'seated');
        });
        this.syncPlayback();
    }

    private syncPlayback() {
        this.companion.paused = this.suspended;
        this.attendantModel.anim.playing = !this.suspended || this.cinematic;
        this.patrons.forEach((character) => {
            character.anim.playing = !this.suspended || this.cinematic;
        });
        this.seated.forEach((character) => {
            character.anim.playing = this.cinematic;
        });
    }

    depart(restoring = false) {
        if (restoring) {
            this.companion.place(FRIEND_ROUTE[FRIEND_ROUTE.length - 1]);
        } else {
            const seat = OPENING_SEATS[1];
            this.companion.place([seat.position[0], seat.position[1] + 1, seat.position[2]], seat.yaw);
            this.companion.standUp(FRIEND_ROUTE.slice(1));
        }
    }

    getSpeakerPosition(speaker: string, out: Vec3): boolean {
        const index = speaker === 'You' ? 0 : speaker === 'Friend' ? 1 : -1;
        if (index < 0) return false;
        const head = this.seated[index].root.findByName('Head');
        if (!head) return false;
        out.copy(head.getPosition());
        out.y += 0.24;
        return true;
    }

    update(dt: number) {
        if (dt === 0) return;
        if (!this.suspended || this.cinematic) {
            this.fanAngle = (this.fanAngle + dt * 540) % 360;
            this.fanBlades.forEach((blades, index) => {
                this.fanRotation.setFromEulerAngles(0, this.fanAngle, 0).mul(this.fanRest[index]);
                blades.setLocalRotation(this.fanRotation);
            });
        }
    }
}
