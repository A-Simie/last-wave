import { BLEND_NORMAL, Entity, Script, Vec3, math } from 'playcanvas';
import type { AnimComponent, AnimTrack } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { BEACH_ACTIVITY_MODELS } from '../../data/beachActivities';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createModelInstance } from '../../scenes/createModelInstance';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';

import { BEACH_BOAT_ROUTES, BEACH_RIDING_ROUTES } from './beachActivityLayout';
import { approachBeachSpeed, sampleBeachCircuit } from './beachMotion';
import type { createBeachWater } from './BeachWater';
import type { WavePhase } from './WaveProgress';

type Route = { from: number; to: number; z: number; radius: number };
type Activity = {
    kind: 'horse' | 'quad' | 'boat';
    root: Entity;
    rider: AnimatedCharacter;
    route: Route;
    distance: number;
    speed: number;
    pace: number;
    heading: number;
    wheels: Entity[];
    horse?: AnimComponent;
    wake?: Entity;
    wheelAngle: number;
};

export class BeachActivities extends Script {
    static scriptName = 'beachActivities';
    actors: Activity[] = [];
    grips: { visual: Entity; hand: Entity; anchor: Entity }[] = [];
    player!: Entity;
    obstacles: Entity[] = [];
    water!: ReturnType<typeof createBeachWater>;
    paused = true;
    phase: WavePhase = 'calm';
    private time = 0;
    private midpoint = new Vec3();

    postUpdate() {
        for (const { visual, hand, anchor } of this.grips) {
            const from = hand.getPosition(),
                to = anchor.getPosition();
            visual.setPosition(this.midpoint.add2(from, to).mulScalar(0.5));
            visual.lookAt(to);
            visual.setLocalScale(0.025, 0.025, from.distance(to));
        }
    }

    update(dt: number) {
        for (const actor of this.actors) {
            actor.rider.anim.playing = !this.paused;
            if (actor.horse) actor.horse.playing = !this.paused;
        }
        if (this.paused || dt <= 0) return;
        const step = Math.min(dt, 0.1);
        this.time += step;
        const player = this.player.getPosition();
        for (const actor of this.actors) {
            const p = actor.root.getPosition();
            const escaping = this.phase !== 'calm';
            const look = sampleBeachCircuit(
                actor.distance + 3,
                actor.route.from,
                actor.route.to,
                actor.route.z,
                actor.route.radius
            );
            const blocked =
                actor.kind !== 'boat' &&
                !escaping &&
                [
                    this.player,
                    ...this.obstacles,
                    ...this.actors.filter((a) => a !== actor && a.kind !== 'boat').map((a) => a.root)
                ].some((entity) => {
                    const q = entity.getPosition();
                    return Math.hypot(q.x - look.x, q.z - look.z) < 1.65;
                });
            actor.speed = approachBeachSpeed(
                actor.speed,
                blocked ? 0 : actor.pace * (escaping ? 1.35 : 1),
                step,
                actor.kind === 'boat' ? 1.6 : 1.1
            );
            actor.distance += actor.speed * step;
            const next = sampleBeachCircuit(
                actor.distance,
                actor.route.from,
                actor.route.to,
                actor.route.z,
                actor.route.radius
            );
            let x = next.x,
                z = next.z;
            if (escaping) {
                const side = actor.route.from < 0 ? -1 : 1;
                x = p.x + side * actor.speed * step;
                z = p.z;
                actor.heading = math.lerpAngle(actor.heading, side * 90, Math.min(1, step * 2));
                if (Math.abs(x) > (actor.kind === 'boat' ? 190 : 116) && Math.hypot(x - player.x, z - player.z) > 65)
                    actor.root.enabled = false;
            } else actor.heading = math.lerpAngle(actor.heading, next.heading, Math.min(1, step * 7));
            if (actor.kind === 'boat') {
                const sea = this.water.sampleAt(x, z),
                    angle = (actor.heading * Math.PI) / 180;
                actor.root.setPosition(x, this.water.heightAt(x, z) - 0.28, z);
                actor.root.setEulerAngles(
                    (-Math.atan(sea.dx * Math.sin(angle) + sea.dz * Math.cos(angle)) * 180) / Math.PI,
                    actor.heading,
                    (Math.atan(sea.dx * Math.cos(angle) - sea.dz * Math.sin(angle)) * 180) / Math.PI
                );
                if (actor.wake) actor.wake.setLocalScale(0.8 + actor.speed * 0.1, 0.016, 1.2 + actor.speed * 0.65);
            } else {
                actor.root.setPosition(x, 0, z);
                actor.root.setEulerAngles(0, actor.heading, 0);
                actor.wheelAngle = (actor.wheelAngle + (((actor.speed * step) / 0.35) * 180) / Math.PI) % 360;
                actor.wheels.forEach((wheel) => wheel.setLocalEulerAngles(actor.wheelAngle, 0, 0));
                if (actor.horse) {
                    const pose = actor.speed < 0.1 ? 'idle' : escaping ? 'trot' : 'walk';
                    if (actor.horse.baseLayer!.activeState !== pose) actor.horse.baseLayer!.transition(pose, 0.25);
                    actor.horse.speed = pose === 'idle' ? 1 : actor.speed / (escaping ? 2.2 : 1.3);
                    actor.rider.root.setLocalPosition(0, 0.55 + Math.sin(this.time * actor.speed * 4) * 0.025, -0.12);
                }
            }
        }
    }
}

export const createBeachActivities = (
    parent: Entity,
    assets: GameAssets,
    player: Entity,
    water: ReturnType<typeof createBeachWater>
) => {
    const root = new Entity('beach-activities');
    parent.addChild(root);
    const paint = createMaterial('quad-coral', 0.68, 0.19, 0.1),
        rubber = createMaterial('quad-rubber', 0.065, 0.075, 0.08),
        metal = createMaterial('quad-metal', 0.38, 0.42, 0.43);
    const wakeMaterial = createMaterial('boat-wake', 0.8, 0.94, 0.91);
    wakeMaterial.blendType = BLEND_NORMAL;
    wakeMaterial.opacity = 0.42;
    wakeMaterial.depthWrite = false;
    wakeMaterial.update();
    root.once('destroy', () => [paint, rubber, metal, wakeMaterial].forEach((material) => material.destroy()));
    const actors: Activity[] = [];
    const grips: BeachActivities['grips'] = [];
    const ridingTrack = assets.activities.riderPose.animations
        .map((asset) => asset.resource as AnimTrack)
        .find((track) => track.name === 'Beach_Riding_Loop');
    if (!ridingTrack) throw new Error('Missing baked horseback riding pose.');
    const rider = (owner: Entity, name: string, horse: boolean, index: number) => {
        const id = index % 2 ? 'patronShort' : 'patronBuzz';
        const character = createAnimatedCharacter(assets.characters[id], id, name);
        owner.addChild(character.root);
        if (horse) character.anim.baseLayer!.assignAnimation('driving', ridingTrack, 1, true);
        character.play('driving', 0);
        return character;
    };
    for (const [index, route] of BEACH_RIDING_ROUTES.entries())
        for (const kind of ['horse', 'quad'] as const) {
            const actor = new Entity(`beach-${kind}-rider-${index}`);
            root.addChild(actor);
            const wheels: Entity[] = [];
            let horse: AnimComponent | undefined;
            const character = rider(actor, `${actor.name}-character`, kind === 'horse', index);
            if (kind === 'horse') {
                const model = createModelInstance(
                    assets.activities.horse,
                    BEACH_ACTIVITY_MODELS.horse,
                    `${actor.name}-mount`
                );
                actor.addChild(model.root);
                horse = model.hierarchy.addComponent('anim', { activate: true })!;
                for (const [state, name] of Object.entries({ idle: 'Idle', walk: 'WalkSlow', trot: 'Walk' })) {
                    const track = assets.activities.horse.animations
                        .map((asset) => asset.resource as AnimTrack)
                        .find((track) => track.name === name);
                    if (!track) throw new Error(`Horse is missing ${name}`);
                    horse.assignAnimation(state, track);
                }
                horse.baseLayer!.play('walk');
                character.root.setLocalPosition(0, 0.55, -0.12);
                const anchor = box(actor, 'bridle', [0, 1.37, 0.85], [0.32, 0.035, 0.035], rubber);
                box(actor, 'saddle', [0, 1.2, -0.12], [0.65, 0.12, 0.55], rubber);
                for (const side of ['l', 'r']) {
                    const hand = character.root.findByName(`middle_01_${side}`) as Entity;
                    grips.push({
                        visual: box(actor, `rein-${side}`, [0, 0, 0], [0.025, 0.025, 1], rubber),
                        hand,
                        anchor
                    });
                }
            } else {
                box(actor, 'quad-chassis', [0, 0.58, 0], [0.85, 0.28, 1.65], metal);
                box(actor, 'quad-front-cowling', [0, 0.82, 0.55], [1.05, 0.23, 0.6], paint);
                box(actor, 'quad-seat', [0, 0.85, -0.3], [0.52, 0.17, 0.8], rubber);
                box(actor, 'quad-rear-rack', [0, 0.87, -0.85], [0.9, 0.08, 0.4], metal);
                const anchor = box(actor, 'quad-handle-stem', [0, 0.96, 0.38], [0.045, 0.2, 0.045], metal);
                for (const side of ['l', 'r']) {
                    const hand = character.root.findByName(`middle_01_${side}`) as Entity;
                    grips.push({
                        visual: box(actor, `handlebar-${side}`, [0, 0, 0], [0.025, 0.025, 1], rubber),
                        hand,
                        anchor
                    });
                }
                for (const side of [-1, 1])
                    for (const z of [-0.6, 0.6]) {
                        const rotor = new Entity(`quad-wheel-${side}-${z}`);
                        actor.addChild(rotor);
                        rotor.setLocalPosition(side * 0.6, 0.35, z);
                        const wheel = createModelInstance(
                            assets.activities.quadWheel,
                            BEACH_ACTIVITY_MODELS.quadWheel,
                            `${rotor.name}-model`
                        );
                        rotor.addChild(wheel.root);
                        wheel.root.setLocalPosition(0, -0.35, 0);
                        wheel.root.setLocalEulerAngles(0, side < 0 ? 180 : 0, 0);
                        wheels.push(rotor);
                        box(actor, 'quad-fender', [side * 0.56, 0.76, z], [0.43, 0.1, 0.63], paint);
                    }
                character.root.setLocalPosition(0, 0.05, -0.22);
            }
            actor.addComponent('collision', {
                type: 'box',
                halfExtents: new Vec3(0.65, 1.3, 1.2),
                linearOffset: new Vec3(0, 1.3, 0)
            });
            actor.addComponent('rigidbody', { type: 'kinematic' });
            const distance = index * 24 + (kind === 'quad' ? 38 : 0),
                point = sampleBeachCircuit(distance, route.from, route.to, route.z, route.radius);
            actor.setPosition(point.x, 0, point.z);
            actor.setEulerAngles(0, point.heading, 0);
            actors.push({
                kind,
                root: actor,
                rider: character,
                route,
                distance,
                speed: 0,
                pace: kind === 'horse' ? 1.25 : 2.4,
                heading: point.heading,
                wheels,
                horse,
                wheelAngle: 0
            });
        }
    for (const [index, route] of BEACH_BOAT_ROUTES.entries()) {
        const actor = new Entity(`beach-speedboat-${index}`);
        root.addChild(actor);
        const model = createModelInstance(
            assets.activities.speedboat,
            BEACH_ACTIVITY_MODELS.speedboat,
            `${actor.name}-hull`
        );
        actor.addChild(model.root);
        const character = rider(actor, `${actor.name}-driver`, false, index);
        character.root.setLocalPosition(0, 0.65, -0.65);
        const wake = box(actor, 'boat-wake', [0, 0.36, -3.2], [1, 0.016, 3], wakeMaterial);
        wake.render!.castShadows = false;
        const distance = index * 180 + 40,
            point = sampleBeachCircuit(distance, route.from, route.to, route.z, route.radius);
        actor.setPosition(point.x, water.heightAt(point.x, point.z) - 0.28, point.z);
        actor.setEulerAngles(0, point.heading, 0);
        actors.push({
            kind: 'boat',
            root: actor,
            rider: character,
            route,
            distance,
            speed: 0,
            pace: 5 + index,
            heading: point.heading,
            wheels: [],
            wake,
            wheelAngle: 0
        });
    }
    return root.addComponent('script')!.create(BeachActivities, { properties: { actors, grips, player, water } })!;
};
