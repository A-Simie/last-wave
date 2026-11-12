import { Vec3, math } from 'playcanvas';
import type { Entity } from 'playcanvas';

import { BEACH_POSE_HEIGHTS, CHARACTER_MODELS } from '../../data/characterModels';
import type { BeachCharacterId } from '../../data/characterModels';
import { LOCOMOTION_SPEEDS } from '../../data/locomotion';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import type { CompanionController } from '../../player/CompanionController';

import type { BeachLife } from './BeachLife';
import type { createBeachWater } from './BeachWater';
import { BEACH_ARRIVAL_GROUND, BEACH_SHORE_Z } from './entryLayout';
import { EVACUATION_RAMP, evacuationHeight } from './waveLayout';

type Runner = {
    entity: Entity;
    character: AnimatedCharacter;
    model: BeachCharacterId;
    height: number;
    fromWater: boolean;
    route: Vec3[];
    next: number;
    delay: number;
    speed: number;
    heading: number;
};

const shoreHeight = (z: number) =>
    z < BEACH_ARRIVAL_GROUND.position[2] - BEACH_ARRIVAL_GROUND.size[2] / 2 ? -0.31 : 0;
const rampPitch = (-Math.atan2(EVACUATION_RAMP.rise, EVACUATION_RAMP.end - EVACUATION_RAMP.start) * 180) / Math.PI;

export class WaveCrowd {
    private readonly runners: Runner[] = [];
    private readonly life: BeachLife;
    private readonly player: Entity;
    private readonly friend: Entity;
    private readonly water: ReturnType<typeof createBeachWater>;
    private mode: 'calm' | 'watching' | 'pointing' | 'running' = 'calm';
    private readonly direction = new Vec3();

    constructor(
        life: BeachLife,
        player: Entity,
        companion: CompanionController,
        water: ReturnType<typeof createBeachWater>
    ) {
        this.life = life;
        this.player = player;
        this.friend = companion.entity;
        this.water = water;
        if (life.crowd) life.crowd.retreat = () => water.retreat;
    }

    watch() {
        if (this.mode !== 'calm') return;
        this.mode = 'watching';
        this.life.paused = true;
        this.life.crowd?.watch();
        [...this.life.standing, ...this.life.walkers].forEach(({ entity, character, model }, i) => {
            const x = (i % 2 ? -1 : 1) * (4.5 + Math.floor(i / 2) * 3.1);
            const height = entity.getPosition().y;
            entity.rigidbody!.type = 'kinematic';
            entity.rigidbody!.teleport(x, height, BEACH_SHORE_Z + 1.8 + (i % 3) * 0.2, 0, 180, 0);
            character.root.setLocalPosition(0, BEACH_POSE_HEIGHTS[model].idle - height, 0);
            character.root.setLocalEulerAngles(0, 0, 0);
            character.play('idle', 0);
        });
    }

    point() {
        if (this.mode !== 'watching') return;
        this.mode = 'pointing';
        this.life.crowd?.point();
        for (const { character } of [...this.life.standing, ...this.life.walkers]) character.play('point', 0.15);
    }

    evacuate() {
        if (this.mode === 'running') return;
        this.watch();
        this.mode = 'running';
        this.life.crowd?.evacuate();
        const people = [...this.life.standing, ...this.life.walkers];
        people.forEach(({ entity, character, model }, i) => {
            const p = entity.getPosition();
            const lane = p.x < 0 ? -2.7 : 2.7;
            const height = p.y;
            character.anim.speed = 1;
            character.play('idle', 0.15);
            this.runners.push({
                entity,
                character,
                model,
                height,
                fromWater: false,
                route: [
                    new Vec3(lane, height, BEACH_SHORE_Z + 2.6),
                    new Vec3(lane, height, 11),
                    new Vec3(lane, height + 4, 31)
                ],
                next: 0,
                delay: i * 0.32,
                speed: 5.2 + (i % 3) * 0.45,
                heading: 180
            });
        });
        this.life.swimmers.forEach(({ character, model }, i) => {
            const p = character.root.getPosition();
            const lane = p.x < 0 ? -2.7 : 2.7;
            character.anim.speed = 1;
            this.runners.push({
                entity: character.root,
                character,
                model,
                height: 0,
                fromWater: true,
                route: [new Vec3(lane, 0, BEACH_SHORE_Z - 3.2), new Vec3(lane, 0, 11), new Vec3(lane, 4, 31)],
                next: 0,
                delay: i * 0.18,
                speed: 5,
                heading: 0
            });
        });
    }

    setPaused(paused: boolean) {
        this.life.characters.forEach(({ anim }) => {
            anim.playing = !paused;
        });
        this.life.crowd?.setPausedFor('wave', paused);
    }

    update(dt: number) {
        if (this.mode === 'watching' || this.mode === 'pointing') {
            this.life.swimmers.forEach(({ character, model, height }) => {
                const p = character.root.getPosition();
                if (this.water.retreat < BEACH_SHORE_Z - p.z + 0.5) {
                    character.root.setPosition(p.x, this.water.heightAt(p.x, p.z) + height, p.z);
                    return;
                }
                character.play('idle', 0.65);
                character.root.setPosition(p.x, shoreHeight(p.z) + BEACH_POSE_HEIGHTS[model].idle, p.z);
                character.root.setEulerAngles(0, 0, 0);
            });
        }
        if (this.mode === 'pointing') {
            for (const { character } of [...this.life.standing, ...this.life.walkers]) {
                if (character.anim.baseLayer!.activeStateCurrentTime >= 0.85) character.anim.speed = 0;
            }
        }
        if (this.mode !== 'running') return;
        const merging = this.runners.some((runner) => !runner.fromWater && runner.next === 0 && runner.entity.enabled);
        const obstacles = [this.player, this.friend, ...this.runners.map(({ entity }) => entity)];
        for (const runner of this.runners) {
            runner.delay -= dt;
            if (runner.delay > 0 || !runner.entity.enabled) continue;
            const position = runner.entity.getPosition();
            const target = runner.route[runner.next];
            this.direction.sub2(target, position);
            this.direction.y = 0;
            const distance = this.direction.length();
            if (distance < 0.12) {
                runner.next++;
                if (runner.next === runner.route.length) runner.entity.enabled = false;
                continue;
            }
            this.direction.normalize();
            const swimming = runner.fromWater && position.z < BEACH_SHORE_Z - this.water.retreat + 0.5;
            let travel = Math.min(distance, (swimming ? 2.6 : runner.speed) * dt);
            if (runner.fromWater && runner.next === 1 && merging)
                travel = Math.min(travel, Math.max(0, BEACH_SHORE_Z + 0.1 - position.z));
            for (const other of obstacles) {
                if (other === runner.entity || !other.enabled) continue;
                const p = other.getPosition();
                if (Math.abs(p.y - position.y) > 2) continue;
                const dx = p.x - position.x;
                const dz = p.z - position.z;
                const ahead = dx * this.direction.x + dz * this.direction.z;
                const side = Math.abs(dx * this.direction.z - dz * this.direction.x);
                const clearance = other === this.player || other === this.friend ? 1.15 : 1.4;
                if (ahead > 0 && side < clearance)
                    travel = Math.min(travel, Math.max(0, ahead - Math.sqrt(clearance ** 2 - side ** 2)));
            }
            const pose = swimming ? 'swim' : travel < 0.001 ? 'idle' : 'sprint';
            runner.character.play(pose);
            if (pose === 'sprint')
                runner.character.anim.speed =
                    travel / dt / (LOCOMOTION_SPEEDS.sprint * CHARACTER_MODELS[runner.model].scale);
            runner.heading = math.lerpAngle(
                runner.heading,
                (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
                Math.min(1, dt * 9)
            );
            const x = position.x + this.direction.x * travel;
            const z = position.z + this.direction.z * travel;
            const ground = evacuationHeight(z) + shoreHeight(z);
            const pitch = z > EVACUATION_RAMP.start && z < EVACUATION_RAMP.end ? rampPitch : 0;
            const boards = pitch ? 0.022 : Math.abs(x) < 2.75 && z >= BEACH_SHORE_Z + 1 && z < 11.5 ? 0.028 : 0;
            if (runner.fromWater) {
                runner.entity.setEulerAngles(pitch, runner.heading, 0);
                runner.entity.setPosition(
                    x,
                    (swimming ? this.water.heightAt(x, z) : ground + boards) + BEACH_POSE_HEIGHTS[runner.model][pose],
                    z
                );
            } else {
                runner.entity.setEulerAngles(0, runner.heading, 0);
                runner.entity.setPosition(x, runner.height + ground, z);
                runner.character.root.setLocalPosition(
                    0,
                    boards + BEACH_POSE_HEIGHTS[runner.model][pose] - runner.height,
                    0
                );
                runner.character.root.setLocalEulerAngles(pitch, 0, 0);
            }
        }
    }
}
