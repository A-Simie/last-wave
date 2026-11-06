import { Quat, Script, Vec3 } from 'playcanvas';
import type { Entity, GraphNode } from 'playcanvas';

import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import type { CutsceneState } from '../../systems/CutsceneSystem';

import { FRIEND_ROUTE, OPENING_SEATS } from './openingLayout';

export class OpeningActors extends Script {
    static scriptName = 'openingActors';

    friend!: Entity;
    friendModel!: AnimatedCharacter;
    playerModel!: Entity;
    seated!: AnimatedCharacter[];
    attendantModel!: AnimatedCharacter;
    patrons!: AnimatedCharacter[];
    fanBlades!: GraphNode[];
    private suspended = false;
    private cinematic = false;
    private waypoint = 1;
    private walking = false;
    private standing = false;
    private fanAngle = 0;
    private fanRest: Quat[] = [];
    private readonly fanRotation = new Quat();
    private readonly direction = new Vec3();

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
        this.friendModel.root.enabled = !this.cinematic;
        this.seated.forEach((character, index) => {
            character.root.enabled = this.cinematic;
            const speaking = state?.beat.speaker === (index === 0 ? 'You' : 'Friend');
            character.play(speaking ? 'seatedTalk' : 'seated');
        });
        this.syncPlayback();
    }

    private syncPlayback() {
        this.friendModel.anim.playing = !this.suspended;
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
            this.friend.setPosition(...FRIEND_ROUTE[FRIEND_ROUTE.length - 1]);
            this.walking = false;
            this.friend.setEulerAngles(0, 180, 0);
            this.friendModel.play('idle', 0);
        } else {
            const seat = OPENING_SEATS[1];
            this.friend.setPosition(seat.position[0], seat.position[1] + 1, seat.position[2]);
            this.friend.setEulerAngles(0, seat.yaw, 0);
            this.standing = true;
            this.friendModel.play('standUp', 0);
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
        if (this.suspended) return;
        if (this.standing) {
            const layer = this.friendModel.anim.baseLayer!;
            if (layer.activeStateProgress < 0.98) return;
            this.standing = false;
            this.walking = true;
            this.friendModel.play('walk');
        }
        if (!this.walking) return;
        const target = FRIEND_ROUTE[this.waypoint];
        const position = this.friend.getPosition();
        this.direction.set(...target).sub(position);
        const distance = this.direction.length();
        if (distance <= 1.25 * dt) {
            this.friend.setPosition(...target);
            this.waypoint++;
            if (this.waypoint === FRIEND_ROUTE.length) {
                this.walking = false;
                this.friendModel.play('idle');
                this.friend.setEulerAngles(0, 180, 0);
            }
            return;
        }
        this.friend.setEulerAngles(0, (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI, 0);
        this.friend.setPosition(this.direction.mulScalar((1.25 * dt) / distance).add(position));
    }
}
