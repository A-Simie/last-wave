import { Entity, Script, Vec3, math } from 'playcanvas';
import type { AppBase, GraphNode, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { CharacterModelId } from '../../data/characterModels';
import { STREET_EXTENTS } from '../../data/foundation';
import type { Vector3Tuple } from '../../data/foundation';
import { TRAFFIC_PAINT } from '../../data/vehicleModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';

import { createStreetVehicle } from './StreetVehicle';

type Walker = {
    model: CharacterModelId;
    character: AnimatedCharacter;
    route: Vec3[];
    waypoint: number;
    speed: number;
    heading: number;
};
type Car = ReturnType<typeof createStreetVehicle> & { direction: number; speed: number };
type CarriedProp = { root: Entity; hand: GraphNode; walker: Walker };

const WALKER_Y = 0.048;

const PEDESTRIANS: {
    model: CharacterModelId;
    x: number;
    district?: 'west' | 'east' | 'market';
    south?: boolean;
    returning?: boolean;
    umbrella?: boolean;
}[] = [
    { model: 'commuterSuit', x: -9 },
    { model: 'patronLong', x: 16, returning: true, umbrella: true },
    { model: 'patronBuzz', x: 32 },
    { model: 'patronShort', x: 4, south: true, umbrella: true },
    { model: 'commuterSuit', x: 20, south: true, returning: true },
    { model: 'patronBeard', x: -18, south: true },
    { model: 'patronBuns', x: 38, south: true, returning: true, umbrella: true },
    { model: 'barista', x: -35, returning: true },
    { model: 'patronBeard', x: -70, district: 'west', umbrella: true },
    { model: 'patronBuns', x: -106, district: 'west', returning: true },
    { model: 'commuterSuit', x: -84, district: 'west', south: true },
    { model: 'patronLong', x: -123, district: 'west', south: true, returning: true },
    { model: 'patronShort', x: 101, district: 'east' },
    { model: 'patronBuzz', x: 133, district: 'east', returning: true, umbrella: true },
    { model: 'patronBeard', x: 118, district: 'east', south: true },
    { model: 'commuterSuit', x: 148, district: 'east', south: true, returning: true },
    { model: 'patronBuns', x: -110, district: 'market', south: true },
    { model: 'patronBuzz', x: -70, district: 'market', south: true, returning: true },
    { model: 'patronLong', x: 94, district: 'market', south: true, umbrella: true },
    { model: 'barista', x: 130, district: 'market', south: true, returning: true }
];

export class StreetLife extends Script {
    static scriptName = 'streetLife';

    player!: Entity;
    walkers!: Walker[];
    cars!: Car[];
    carried!: CarriedProp[];
    drivers!: AnimatedCharacter[];
    obstacles: Entity[] = [];
    private suspended = false;
    private readonly direction = new Vec3();

    set paused(value: boolean) {
        this.suspended = value;
        for (const { character } of this.walkers) character.anim.playing = !value;
        for (const driver of this.drivers) driver.anim.playing = !value;
    }

    get paused() {
        return this.suspended;
    }

    update(dt: number) {
        if (this.suspended || dt <= 0) return;
        const step = Math.min(dt, 0.1);
        const player = this.player.getPosition();
        for (const walker of this.walkers) {
            const position = walker.character.root.getPosition();
            this.direction.sub2(walker.route[walker.waypoint], position);
            const distance = this.direction.length();
            this.direction.normalize();
            const blockedBy = (other: Vec3, radius: number) => {
                const x = other.x - position.x;
                const z = other.z - position.z;
                return Math.hypot(x, z) < radius && x * this.direction.x + z * this.direction.z > -0.1;
            };
            const blocked =
                (player.y < 3 && blockedBy(player, 1.1)) ||
                this.walkers.some((other) => other !== walker && blockedBy(other.character.root.getPosition(), 0.65)) ||
                this.obstacles.some((other) => other.enabled && blockedBy(other.getPosition(), 0.7));
            walker.character.move(blocked ? 0 : Math.min(distance / step, walker.speed));
            if (blocked) continue;
            walker.heading = math.lerpAngle(
                walker.heading,
                (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
                Math.min(1, step * 8)
            );
            walker.character.root.setEulerAngles(0, walker.heading, 0);
            if (distance <= walker.speed * step) {
                walker.character.root.setPosition(walker.route[walker.waypoint]);
                walker.waypoint = (walker.waypoint + 1) % walker.route.length;
            } else {
                walker.character.root.setPosition(this.direction.mulScalar(walker.speed * step).add(position));
            }
        }
        for (const car of this.cars) {
            const position = car.root.getPosition();
            const ahead = (player.x - position.x) * car.direction;
            if (player.y < 3 && Math.abs(player.z - position.z) < 1.6 && ahead > -2.9 && ahead < 4.5) continue;
            if (
                this.obstacles.some((other) => {
                    const point = other.getPosition();
                    const gap = (point.x - position.x) * car.direction;
                    return (
                        other.enabled && point.y < 3 && Math.abs(point.z - position.z) < 1.6 && gap > -2.9 && gap < 4.5
                    );
                })
            )
                continue;
            if (
                this.cars.some((other) => {
                    const gap = (other.root.getPosition().x - position.x) * car.direction;
                    return (
                        other !== car &&
                        other.direction === car.direction &&
                        Math.abs(other.root.getPosition().z - position.z) < 1.6 &&
                        gap > 0 &&
                        gap < 6.4
                    );
                })
            )
                continue;
            let x = position.x + car.direction * car.speed * step;
            const wrapped = x > STREET_EXTENTS.east - 3 || x < STREET_EXTENTS.west + 3;
            if (x > STREET_EXTENTS.east - 3) x = STREET_EXTENTS.west + 3;
            if (x < STREET_EXTENTS.west + 3) x = STREET_EXTENTS.east - 3;
            if (player.y < 3 && Math.abs(x - player.x) < 3 && Math.abs(position.z - player.z) < 1.6) continue;
            if (
                this.obstacles.some((other) => {
                    const point = other.getPosition();
                    return (
                        other.enabled &&
                        point.y < 3 &&
                        Math.abs(point.x - x) < 3 &&
                        Math.abs(point.z - position.z) < 1.6
                    );
                })
            )
                continue;
            if (
                this.cars.some(
                    (other) =>
                        other !== car &&
                        other.direction === car.direction &&
                        (wrapped || (other.root.getPosition().x - position.x) * car.direction > 0) &&
                        Math.abs(other.root.getPosition().z - position.z) < 1.6 &&
                        Math.abs(other.root.getPosition().x - x) < 6.4
                )
            )
                continue;
            car.root.setPosition(x, position.y, position.z);
            car.wheelAngle = (car.wheelAngle + (((car.speed * step) / car.wheelRadius) * 180) / Math.PI) % 360;
            for (const wheel of car.wheels) wheel.setLocalEulerAngles(car.wheelAngle, 0, 0);
        }
    }

    postUpdate() {
        for (const { root, hand, walker } of this.carried) {
            root.setPosition(hand.getPosition());
            root.setEulerAngles(0, walker.heading, 0);
        }
    }
}

export const createStreetLife = (app: AppBase, parent: Entity, assets: GameAssets, player: Entity) => {
    const root = new Entity('seafront-life');
    parent.addChild(root);
    const materials = {
        metal: createMaterial('traffic-trim', 0.68, 0.69, 0.65),
        dark: createMaterial('traffic-rubber', 0.07, 0.08, 0.08),
        seats: createMaterial('car-interior', 0.21, 0.17, 0.13),
        teal: createMaterial('sun-umbrella-teal', 0.15, 0.5, 0.46),
        gold: createMaterial('sun-umbrella-gold', 0.92, 0.61, 0.22),
        lilac: createMaterial('sun-umbrella-lilac', 0.55, 0.41, 0.59)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));

    const primitive = (
        owner: Entity,
        name: string,
        type: 'cone' | 'cylinder',
        position: Vector3Tuple,
        size: Vector3Tuple,
        material: StandardMaterial
    ) => {
        const entity = new Entity(name);
        owner.addChild(entity);
        entity.setLocalPosition(...position);
        entity.setLocalScale(...size);
        entity.addComponent('render', { type, material });
        return entity;
    };
    const walkers: Walker[] = [];
    const carried: CarriedProp[] = [];
    for (const [index, definition] of PEDESTRIANS.entries()) {
        const character = createAnimatedCharacter(
            assets.characters[definition.model],
            definition.model,
            `street-pedestrian-${index}`
        );
        root.addChild(character.root);
        const market = definition.district === 'market';
        const near = market ? STREET_EXTENTS.marketZ + 6.3 : definition.south ? 19.3 : 7.25;
        const far = market ? near + 1.05 : definition.south ? 20.35 : 8.2;
        const west =
            definition.district === 'west' || (market && definition.x < 0)
                ? -136
                : definition.district === 'east' || market
                  ? 72
                  : -46;
        const east =
            definition.district === 'west' || (market && definition.x < 0)
                ? -63
                : definition.district === 'east' || market
                  ? 150
                  : 52;
        let x = definition.x;
        const z = definition.returning ? far : near;
        if (Math.hypot(x - player.getPosition().x, z - player.getPosition().z) < 1.3) x += 2;
        character.root.setPosition(x, WALKER_Y, z);
        character.root.setEulerAngles(0, definition.returning ? -90 : 90, 0);
        character.root.addComponent('collision', {
            type: 'box',
            halfExtents: new Vec3(0.26, 0.9, 0.26),
            linearOffset: new Vec3(0, 0.9, 0)
        });
        character.root.addComponent('rigidbody', { type: 'kinematic' });
        character.play('walk', 0);
        character.anim.baseLayer!.activeStateCurrentTime = index * 0.19;
        const walker: Walker = {
            model: definition.model,
            character,
            route: [
                new Vec3(west, WALKER_Y, near),
                new Vec3(east, WALKER_Y, near),
                new Vec3(east, WALKER_Y, far),
                new Vec3(west, WALKER_Y, far)
            ],
            waypoint: definition.returning ? 3 : 1,
            speed: 1.1 + (index % 3) * 0.12,
            heading: definition.returning ? -90 : 90
        };
        walkers.push(walker);
        if (definition.umbrella || definition.model === 'commuterSuit') {
            const hand = character.root.findByName('hand_r');
            if (!hand) throw new Error(`${definition.model} has no carrying hand.`);
            const prop = new Entity(definition.umbrella ? `street-sun-umbrella-${index}` : `street-briefcase-${index}`);
            root.addChild(prop);
            if (definition.umbrella) {
                primitive(prop, 'umbrella-shaft', 'cylinder', [0, 0.55, 0], [0.018, 1.1, 0.018], materials.metal);
                primitive(
                    prop,
                    'umbrella-canopy',
                    'cone',
                    [0, 1.1, 0],
                    [1.7, 0.3, 1.7],
                    [materials.teal, materials.gold, materials.lilac][index % 3]
                );
                primitive(prop, 'umbrella-tip', 'cone', [0, 1.29, 0], [0.045, 0.08, 0.045], materials.metal);
            } else {
                box(prop, 'briefcase-body', [0, -0.19, 0], [0.13, 0.28, 0.4], materials.seats);
                for (const z of [-0.05, 0.05])
                    box(prop, `briefcase-handle-${z}`, [0, -0.025, z], [0.022, 0.075, 0.02], materials.dark);
                box(prop, 'briefcase-handle', [0, 0.01, 0], [0.022, 0.02, 0.12], materials.dark);
            }
            carried.push({ root: prop, hand, walker });
        }
    }

    const cars: Car[] = [];
    const drivers: AnimatedCharacter[] = [];
    for (const [index, [start, lane, direction]] of [
        [-6, 11.2, 1],
        [27, 15.2, -1],
        [-49, 11.2, 1],
        [65, 15.2, -1],
        [-116, 15.2, -1],
        [129, 11.2, 1],
        [-94, STREET_EXTENTS.marketZ - 2, 1],
        [108, STREET_EXTENTS.marketZ + 2, -1]
    ].entries()) {
        const car = createStreetVehicle(
            app,
            root,
            assets,
            `street-car-${index}`,
            TRAFFIC_PAINT[index % TRAFFIC_PAINT.length],
            index < 2 || index >= 6 ? (index % 2 === 0 ? 'patronBuzz' : 'patronShort') : undefined
        );
        const x =
            Math.abs(start - player.getPosition().x) < 3 && Math.abs(lane - player.getPosition().z) < 1.55
                ? start - direction * 8
                : start;
        car.root.setPosition(x, 0.009, lane);
        car.root.setEulerAngles(0, direction * 90, 0);
        if (car.driver) drivers.push(car.driver);
        cars.push({ ...car, direction, speed: direction === 1 ? 4.8 : 5.2 });
    }
    const life = root
        .addComponent('script')!
        .create(StreetLife, { properties: { player, walkers, cars, carried, drivers } })!;
    const group = life.app.batcher!.addGroup('seafront-moving-props', true, 32);
    root.once('destroy', () => life.app.batcher?.removeGroup(group.id));
    // Keep non-uniform canopy normals and imported car transparency on the regular render path.
    root.findComponents('render')
        .filter((render) => render.type === 'box' || render.type === 'cylinder')
        .forEach((render) => {
            render.batchGroupId = group.id;
        });
    return life;
};
