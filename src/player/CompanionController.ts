import { Entity, Script, Vec3, math } from 'playcanvas';

import type { GameAssets } from '../core/AssetManager';
import { CHARACTER_COLLISION } from '../data/foundation';
import type { Vector3Tuple } from '../data/foundation';

import { createAnimatedCharacter } from './AnimatedCharacter';
import type { AnimatedCharacter } from './AnimatedCharacter';
import { projectCompanionRoute } from './CompanionRoute';

const COMPANION_RADIUS = 0.29;

export class CompanionController extends Script {
    static scriptName = 'companionController';

    player!: Entity;
    character!: AnimatedCharacter;
    canStand!: (position: Vector3Tuple) => boolean;
    obstacles: Entity[] = [];
    private suspended = false;
    private cinematic = false;
    private rising = false;
    private route: Vec3[] = [];
    private waypoint = 0;
    private heading = 180;
    private readonly direction = new Vec3();

    set paused(value: boolean) {
        this.suspended = value;
        this.character.anim.playing = !value || this.cinematic;
    }

    get paused() {
        return this.suspended;
    }

    present(talking: boolean | null) {
        this.cinematic = talking !== null;
        if (this.cinematic) this.character.play(talking ? 'talk' : 'idle');
        this.character.anim.playing = !this.suspended || this.cinematic;
    }

    place(position: Vector3Tuple, heading = 180) {
        this.route = [];
        this.rising = false;
        const player = this.player.getPosition();
        let target = position;
        if (Math.abs(player.y - position[1]) < 2 && Math.hypot(player.x - position[0], player.z - position[2]) < 1.15) {
            const clear = [
                [1.5, 0],
                [-1.5, 0],
                [0, 1.5],
                [0, -1.5]
            ]
                .map(([x, z]): Vector3Tuple => [position[0] + x, position[1], position[2] + z])
                .find((point) => Math.hypot(player.x - point[0], player.z - point[2]) >= 1.15 && this.canStand(point));
            if (!clear) throw new Error('No clear companion placement.');
            target = clear;
        }
        this.heading = heading;
        this.entity.rigidbody!.teleport(...target, 0, heading, 0);
        this.character.play('idle', 0);
        this.character.anim.speed = 1;
    }

    follow(points: readonly Vector3Tuple[], restoreNearPlayer = false) {
        if (points.length === 0) return;
        const route = points.map((point) => new Vec3(...point));
        let start = 0;
        if (restoreNearPlayer) {
            const projection = projectCompanionRoute(route, this.player.getPosition());
            if (!this.canStand(projection.position)) throw new Error('The companion route is obstructed.');
            this.place(projection.position);
            start = projection.next;
        }
        this.route = [this.entity.getPosition().clone(), ...route.slice(start)];
        this.waypoint = 1;
    }

    continueWith(points: readonly Vector3Tuple[]) {
        const remaining = this.route.slice(this.waypoint).map((point): Vector3Tuple => [point.x, point.y, point.z]);
        this.follow([...remaining, ...points]);
    }

    stop() {
        this.route = [];
        this.rising = false;
        this.character.play('idle');
        this.character.anim.speed = 1;
    }

    standUp(points: readonly Vector3Tuple[]) {
        this.follow(points);
        this.rising = true;
        this.character.play('standUp', 0);
    }

    update(dt: number) {
        if (this.suspended || this.cinematic || dt <= 0 || !this.route[this.waypoint]) return;
        if (this.rising) {
            if (this.character.anim.baseLayer!.activeStateProgress < 0.98) return;
            this.rising = false;
        }
        const step = Math.min(dt, 0.1);
        const position = this.entity.getPosition();
        const target = this.route[this.waypoint];
        this.direction.sub2(target, position);
        const distance = this.direction.length();
        if (distance < 0.001) {
            this.entity.setPosition(target);
            this.waypoint++;
            if (this.waypoint === this.route.length) this.character.play('idle');
            return;
        }
        this.direction.normalize();
        const player = this.player.getPosition();
        const gap = Math.hypot(player.x - position.x, player.z - position.z);
        // Compare distance along the route so short corners cannot mistake an ahead player for a lagging one.
        const ahead =
            projectCompanionRoute(this.route, player).progress - projectCompanionRoute(this.route, position).progress;
        const velocity = this.player.rigidbody?.linearVelocity;
        const playerSpeed = velocity ? Math.hypot(velocity.x, velocity.z) : 0;
        const speed = gap > 3 && ahead > 0.5 ? Math.min(9, Math.max(3.6, playerSpeed + (gap - 3) * 1.2)) : 1.65;
        let travel = gap > 5.5 && ahead < 0.5 ? 0 : Math.min(distance, speed * step);
        const yieldTo = (other: Vec3, radius: number) => {
            const x = other.x - position.x;
            const z = other.z - position.z;
            const forward = x * this.direction.x + z * this.direction.z;
            const sideways = x * x + z * z - forward * forward;
            if (forward > 0.05 && sideways < radius * radius) {
                travel = Math.min(travel, Math.max(0, forward - Math.sqrt(radius * radius - sideways)));
            }
        };
        if (Math.abs(player.y - position.y) < 2) {
            const x = player.x - position.x;
            const z = player.z - position.z;
            const forward = x * this.direction.x + z * this.direction.z;
            const sideways = Math.abs(x * this.direction.z - z * this.direction.x);
            const [hx, , hz] = CHARACTER_COLLISION.halfExtents;
            // Keep contact tolerance sideways so a player beside the friend cannot block the doorway.
            const width = hx * Math.abs(this.direction.z) + hz * Math.abs(this.direction.x) + COMPANION_RADIUS - 0.015;
            const depth = hx * Math.abs(this.direction.x) + hz * Math.abs(this.direction.z) + COMPANION_RADIUS + 0.12;
            if (forward > 0.05 && sideways < width) travel = Math.min(travel, Math.max(0, forward - depth));
        }
        for (const obstacle of this.obstacles) {
            if (obstacle.enabled) yieldTo(obstacle.getPosition(), 0.72);
        }
        const pace = travel / step;
        const pose = pace < 0.01 ? 'idle' : pace > 6 ? 'sprint' : pace > 2 ? 'jog' : 'walk';
        this.character.play(pose);
        this.character.anim.speed = pose === 'jog' ? Math.max(0.75, Math.min(1.4, pace / 4)) : 1;
        if (travel < 0.001) return;
        this.heading = math.lerpAngle(
            this.heading,
            (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
            Math.min(1, step * 8)
        );
        this.entity.setEulerAngles(0, this.heading, 0);
        if (distance <= travel) {
            this.entity.setPosition(target);
            this.waypoint++;
            if (this.waypoint === this.route.length) this.character.play('idle');
        } else {
            this.entity.setPosition(this.direction.mulScalar(travel).add(position));
        }
    }
}

export const createCompanion = (
    parent: Entity,
    assets: GameAssets,
    player: Entity,
    position: Vector3Tuple,
    canStand: CompanionController['canStand']
) => {
    const root = new Entity('cafe-friend');
    parent.addChild(root);
    const character = createAnimatedCharacter(assets.characters.friendB, 'friendB', 'cafe-friend-character');
    root.addChild(character.root);
    character.root.setLocalPosition(0, -1, 0);
    root.addComponent('collision', {
        type: 'capsule',
        radius: COMPANION_RADIUS,
        height: 1.76,
        linearOffset: new Vec3(0, -0.12, 0)
    });
    root.addComponent('rigidbody', { type: 'kinematic' });
    const companion = root
        .addComponent('script')!
        .create(CompanionController, { properties: { player, character, canStand } })!;
    companion.place(position);
    return companion;
};
