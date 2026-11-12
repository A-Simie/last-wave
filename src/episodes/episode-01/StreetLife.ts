import { Entity, Script, Vec3, math } from 'playcanvas';
import type { AppBase, GraphNode, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { COMMERCIAL_SUBSTITUTES, isModelAllowed } from '../../data/assetPolicy';
import type { CharacterModelId } from '../../data/characterModels';
import { STREET_EXTENTS } from '../../data/foundation';
import type { Vector3Tuple } from '../../data/foundation';
import type { PreparedModelId } from '../../data/newModels';
import { TRAFFIC_PAINT } from '../../data/vehicleModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { applyUmbrellaCarryPose } from '../../player/UmbrellaCarry';
import { createPreparedModel } from '../../scenes/createPreparedModel';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';

import { createStreetKiosks } from './StreetKiosks';
import type { StreetKiosks } from './StreetKiosks';
import { STREET_CROSSINGS } from './streetLayout';
import { createModelVehicle, createStreetVehicle } from './StreetVehicle';
import type { StreetModelVehicle } from './StreetVehicle';

type Walker = {
    model: CharacterModelId;
    character: AnimatedCharacter;
    route: Vec3[];
    waypoint: number;
    speed: number;
    heading: number;
    /** Crossing pedestrians wait at curb waypoints until the lanes either side are clear. */
    crossing?: { x: number; road: number; curbs: Set<number>; wait: number };
};
type Car = ReturnType<typeof createStreetVehicle> & { direction: number; speed: number };
type CarriedProp = { root: Entity; hand: GraphNode; grip?: GraphNode; walker: Walker };

const WALKER_Y = 0.048;
/** Animation is evaluated only for characters this close to the player; the rest hold their pose. */
const ANIMATION_RANGE = 48;

type Pedestrian = {
    model: CharacterModelId;
    x: number;
    district?: 'west' | 'east' | 'market';
    south?: boolean;
    returning?: boolean;
    umbrella?: boolean;
};

const ORIGINAL_PEDESTRIANS: readonly Pedestrian[] = [
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

// A busier afternoon: extra walkers spread across every sidewalk loop, many shading themselves from the sun.
const EXTRA_MODELS: readonly CharacterModelId[] = [
    'patronLong',
    'patronShort',
    'patronBuns',
    'commuterSuit',
    'patronBeard',
    'patronBuzz'
];
const EXTRA_PEDESTRIANS: readonly Pedestrian[] = [
    ...[-40, -27, 2, 27, 45].map((x, i) => ({ x, south: i % 2 === 1, returning: i % 3 === 0 })),
    ...[-30, -2, 12, 46].map((x, i) => ({ x, south: i % 2 === 0, returning: i % 2 === 1 })),
    ...[-132, -116, -98, -77, -66].map((x, i) => ({
        x,
        district: 'west' as const,
        south: i % 2 === 0,
        returning: i % 3 === 1
    })),
    ...[78, 92, 110, 126, 141].map((x, i) => ({
        x,
        district: 'east' as const,
        south: i % 2 === 1,
        returning: i % 2 === 0
    })),
    ...[-128, -100, -88, 80, 112, 146].map((x, i) => ({
        x,
        district: 'market' as const,
        south: true,
        returning: i % 2 === 0
    }))
].map((definition, i) => ({ ...definition, model: EXTRA_MODELS[i % EXTRA_MODELS.length], umbrella: i % 3 !== 2 }));

const PEDESTRIANS: readonly Pedestrian[] = [...ORIGINAL_PEDESTRIANS, ...EXTRA_PEDESTRIANS];

const CROSSER_MODELS: readonly CharacterModelId[] = ['patronShort', 'patronBuzz', 'patronBuns', 'patronBeard'];

/** Carried sun umbrellas cycle through the supplied designs; excluded designs fall back to their substitute. */
const UMBRELLA_DESIGNS: readonly PreparedModelId[] = ['elegantUmbrella', 'yellowUmbrella', 'umbrellaB', 'umbrellaA'];

/** Seafront lanes: z 11.2 eastbound and 15.2 westbound; market street lanes 2 m either side of its centre. */
const TRAFFIC: readonly {
    start: number;
    lane: number;
    direction: 1 | -1;
    vehicle: 'porsche' | StreetModelVehicle;
}[] = [
    { start: -6, lane: 11.2, direction: 1, vehicle: 'porsche' },
    { start: 27, lane: 15.2, direction: -1, vehicle: 'porsche' },
    { start: -49, lane: 11.2, direction: 1, vehicle: 'porsche' },
    { start: 65, lane: 15.2, direction: -1, vehicle: 'porsche' },
    { start: -116, lane: 15.2, direction: -1, vehicle: 'porsche' },
    { start: 129, lane: 11.2, direction: 1, vehicle: 'porsche' },
    { start: -94, lane: STREET_EXTENTS.marketZ - 2, direction: 1, vehicle: 'porsche' },
    { start: 108, lane: STREET_EXTENTS.marketZ + 2, direction: -1, vehicle: 'porsche' },
    { start: 44, lane: 11.2, direction: 1, vehicle: 'bus' },
    { start: -100, lane: 11.2, direction: 1, vehicle: 'pickup' },
    { start: 100, lane: 15.2, direction: -1, vehicle: 'policeCar' },
    { start: -34, lane: 15.2, direction: -1, vehicle: 'pickup' },
    { start: 24, lane: STREET_EXTENTS.marketZ - 2, direction: 1, vehicle: 'bus' },
    { start: -20, lane: STREET_EXTENTS.marketZ + 2, direction: -1, vehicle: 'policeCar' }
];

export class StreetLife extends Script {
    static scriptName = 'streetLife';

    player!: Entity;
    walkers!: Walker[];
    cars!: Car[];
    carried!: CarriedProp[];
    drivers!: AnimatedCharacter[];
    kiosks!: StreetKiosks;
    obstacles: Entity[] = [];
    private suspended = false;
    private lodTime = 0;
    private readonly direction = new Vec3();

    set paused(value: boolean) {
        this.suspended = value;
        this.kiosks.paused = value;
        this.syncAnimation();
    }

    get paused() {
        return this.suspended;
    }

    private syncAnimation() {
        const player = this.player.getPosition();
        const near = (entity: Entity) => {
            const p = entity.getPosition();
            return Math.abs(p.x - player.x) + Math.abs(p.z - player.z) < ANIMATION_RANGE;
        };
        for (const { character } of this.walkers) character.anim.playing = !this.suspended && near(character.root);
        for (const driver of this.drivers) driver.anim.playing = !this.suspended && near(driver.root);
        this.kiosks.syncAnimation(player, ANIMATION_RANGE);
    }

    private carBlocks(car: Car, x: number, z: number, point: Vec3, front: number) {
        const gap = (point.x - x) * car.direction;
        return point.y < 3 && Math.abs(point.z - z) < 1.6 && gap > -(car.length / 2 + 0.6) && gap < front;
    }

    private laneClear(crossing: { x: number }, road: number) {
        return this.cars.every((car) => {
            const p = car.root.getPosition();
            if (Math.abs(p.z - road) > 4.2) return true;
            const approach = (crossing.x - p.x) * car.direction;
            return approach < -car.length / 2 - 1 || approach > car.length / 2 + 11;
        });
    }

    update(dt: number) {
        if (this.suspended || dt <= 0) return;
        const step = Math.min(dt, 0.1);
        const player = this.player.getPosition();
        this.lodTime -= step;
        if (this.lodTime <= 0) {
            this.lodTime = 0.4;
            this.syncAnimation();
        }
        this.kiosks.step(step, player);
        for (const walker of this.walkers) {
            const position = walker.character.root.getPosition();
            if (walker.crossing && walker.crossing.wait > 0) {
                walker.crossing.wait -= step;
                walker.character.move(0);
                continue;
            }
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
                const arrived = walker.waypoint;
                walker.waypoint = (walker.waypoint + 1) % walker.route.length;
                const crossing = walker.crossing;
                if (crossing?.curbs.has(arrived)) {
                    // Pause at the curb, then wait until traffic either side of the crossing has passed.
                    const clear = this.laneClear(crossing, crossing.road);
                    crossing.wait = clear ? 0.8 + Math.random() * 2.2 : 1.2;
                    if (!clear) walker.waypoint = arrived;
                }
            } else {
                walker.character.root.setPosition(this.direction.mulScalar(walker.speed * step).add(position));
            }
        }
        // Pedestrians on the carriageway stop traffic just like the player does.
        const onRoad = this.walkers
            .map(({ character }) => character.root.getPosition())
            .filter((p) => STREET_CROSSINGS.some(({ road }) => Math.abs(p.z - road) < 4.1));
        for (const car of this.cars) {
            const position = car.root.getPosition();
            const front = car.length / 2 + 2.3;
            const stopped = (point: Vec3) => this.carBlocks(car, position.x, position.z, point, front);
            if (stopped(player)) continue;
            if (this.obstacles.some((other) => other.enabled && stopped(other.getPosition()))) continue;
            if (onRoad.some((point) => stopped(point))) continue;
            if (
                this.cars.some((other) => {
                    const gap = (other.root.getPosition().x - position.x) * car.direction;
                    return (
                        other !== car &&
                        other.direction === car.direction &&
                        Math.abs(other.root.getPosition().z - position.z) < 1.6 &&
                        gap > 0 &&
                        gap < (car.length + other.length) / 2 + 2
                    );
                })
            )
                continue;
            const margin = car.length / 2 + 1;
            let x = position.x + car.direction * car.speed * step;
            const wrapped = x > STREET_EXTENTS.east - margin || x < STREET_EXTENTS.west + margin;
            if (x > STREET_EXTENTS.east - margin) x = STREET_EXTENTS.west + margin;
            if (x < STREET_EXTENTS.west + margin) x = STREET_EXTENTS.east - margin;
            const clearAt = (point: Vec3) =>
                !(point.y < 3 && Math.abs(x - point.x) < car.length / 2 + 0.7 && Math.abs(position.z - point.z) < 1.6);
            if (!clearAt(player)) continue;
            if (this.obstacles.some((other) => other.enabled && !clearAt(other.getPosition()))) continue;
            if (
                this.cars.some(
                    (other) =>
                        other !== car &&
                        other.direction === car.direction &&
                        (wrapped || (other.root.getPosition().x - position.x) * car.direction > 0) &&
                        Math.abs(other.root.getPosition().z - position.z) < 1.6 &&
                        Math.abs(other.root.getPosition().x - x) < (car.length + other.length) / 2 + 2
                )
            )
                continue;
            car.root.setPosition(x, position.y, position.z);
            if (!car.wheels.length) continue;
            car.wheelAngle = (car.wheelAngle + (((car.speed * step) / car.wheelRadius) * 180) / Math.PI) % 360;
            for (const wheel of car.wheels) wheel.setLocalEulerAngles(car.wheelAngle, 0, 0);
        }
    }

    postUpdate() {
        for (const { root, hand, grip, walker } of this.carried) {
            root.setPosition(grip ? grip.getPosition() : hand.getPosition());
            root.setEulerAngles(0, walker.heading, 0);
        }
        this.kiosks.postUpdate();
    }
}

const designFor = (index: number, assets: GameAssets): PreparedModelId | null => {
    for (let attempt = 0; attempt < UMBRELLA_DESIGNS.length; attempt++) {
        let id: PreparedModelId | null | undefined = UMBRELLA_DESIGNS[(index + attempt) % UMBRELLA_DESIGNS.length];
        if (!isModelAllowed(id)) {
            const substitute = COMMERCIAL_SUBSTITUTES[id];
            id = substitute && substitute !== 'procedural' ? substitute : null;
        }
        if (id && assets.models[id]) return id;
    }
    return null;
};

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
    const clearOfPlayer = (x: number, z: number) =>
        Math.hypot(x - player.getPosition().x, z - player.getPosition().z) >= 1.3;
    const spawn = (model: CharacterModelId, name: string, position: Vector3Tuple, yaw: number, index: number) => {
        const character = createAnimatedCharacter(assets.characters[model], model, name);
        root.addChild(character.root);
        character.root.setPosition(...position);
        character.root.setEulerAngles(0, yaw, 0);
        character.root.addComponent('collision', {
            type: 'box',
            halfExtents: new Vec3(0.26, 0.9, 0.26),
            linearOffset: new Vec3(0, 0.9, 0)
        });
        character.root.addComponent('rigidbody', { type: 'kinematic' });
        character.play('walk', 0);
        character.anim.baseLayer!.activeStateCurrentTime = index * 0.19;
        return character;
    };
    let umbrellaIndex = 0;
    const carry = (walker: Walker, index: number, umbrella: boolean) => {
        const hand = walker.character.root.findByName('hand_r');
        if (!hand) throw new Error(`${walker.model} has no carrying hand.`);
        const prop = new Entity(umbrella ? `street-sun-umbrella-${index}` : `street-briefcase-${index}`);
        root.addChild(prop);
        if (umbrella) applyUmbrellaCarryPose(walker.character, assets.characters.patronBuzz);
        const design = umbrella ? designFor(umbrellaIndex++, assets) : null;
        if (umbrella && design) {
            const model = createPreparedModel(assets.models[design]!, design, `${prop.name}-${design}`, {
                footprint: [1.5, 1.5]
            });
            prop.addChild(model.root);
            model.root.setLocalPosition(0, -0.08, 0);
        } else if (umbrella) {
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
        const grip = umbrella ? hand.findByName('middle_01_r') : undefined;
        carried.push({ root: prop, hand, grip: grip ?? undefined, walker });
    };
    for (const [index, definition] of PEDESTRIANS.entries()) {
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
        if (!clearOfPlayer(x, z)) x += 2;
        const character = spawn(
            definition.model,
            `street-pedestrian-${index}`,
            [x, WALKER_Y, z],
            definition.returning ? -90 : 90,
            index
        );
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
        if (definition.umbrella || definition.model === 'commuterSuit') carry(walker, index, !!definition.umbrella);
    }
    // Two people per zebra crossing share one-way loop: across on the west stripe, back on the east stripe.
    let crosserIndex = 0;
    for (const crossing of STREET_CROSSINGS) {
        for (const phase of [0, 2]) {
            const index = PEDESTRIANS.length + crosserIndex;
            const model = CROSSER_MODELS[crosserIndex % CROSSER_MODELS.length];
            const a = crossing.x - 0.8;
            const b = crossing.x + 0.8;
            const route = [
                new Vec3(a, WALKER_Y, crossing.near),
                new Vec3(a, WALKER_Y, crossing.far),
                new Vec3(b, WALKER_Y, crossing.far),
                new Vec3(b, WALKER_Y, crossing.near)
            ];
            const start = phase;
            const point = route[start];
            const position: Vector3Tuple = [point.x, WALKER_Y, point.z];
            if (!clearOfPlayer(position[0], position[2])) position[0] += 1.6;
            const character = spawn(model, `street-crosser-${crosserIndex}`, position, start ? 180 : 0, index);
            const walker: Walker = {
                model,
                character,
                route,
                waypoint: (start + 1) % route.length,
                speed: 1.25,
                heading: start ? 180 : 0,
                crossing: { x: crossing.x, road: crossing.road, curbs: new Set([0, 2]), wait: 1 + crosserIndex * 0.7 }
            };
            walkers.push(walker);
            if (crosserIndex % 2 === 0) carry(walker, index, true);
            crosserIndex++;
        }
    }

    const cars: Car[] = [];
    const drivers: AnimatedCharacter[] = [];
    let porsche = 0;
    for (const [index, { start, lane, direction, vehicle }] of TRAFFIC.entries()) {
        let car: ReturnType<typeof createStreetVehicle>;
        let kind = vehicle;
        if (kind !== 'porsche' && !isModelAllowed(kind)) {
            const substitute = COMMERCIAL_SUBSTITUTES[kind];
            kind = substitute === 'policeCar' ? 'policeCar' : 'porsche';
        }
        const resource = kind === 'porsche' ? undefined : assets.models[kind];
        if (kind !== 'porsche' && resource) car = createModelVehicle(root, resource, kind, `street-${kind}-${index}`);
        else {
            car = createStreetVehicle(
                app,
                root,
                assets,
                `street-car-${index}`,
                TRAFFIC_PAINT[porsche % TRAFFIC_PAINT.length],
                index < 2 || index === 6 || index === 7 ? (index % 2 === 0 ? 'patronBuzz' : 'patronShort') : undefined
            );
            porsche++;
        }
        const x =
            Math.abs(start - player.getPosition().x) < car.length / 2 + 1 &&
            Math.abs(lane - player.getPosition().z) < 1.55
                ? start - direction * (car.length + 4)
                : start;
        car.root.setPosition(x, 0.009, lane);
        car.root.setEulerAngles(0, direction * 90, 0);
        if (car.driver) drivers.push(car.driver);
        cars.push({ ...car, direction, speed: kind === 'bus' ? 4.2 : direction === 1 ? 4.8 : 5.2 });
    }
    const kiosks = createStreetKiosks(root, app, assets, player);
    const life = root
        .addComponent('script')!
        .create(StreetLife, { properties: { player, walkers, cars, carried, drivers, kiosks } })!;
    const group = life.app.batcher!.addGroup('seafront-moving-props', true, 32);
    root.once('destroy', () => life.app.batcher?.removeGroup(group.id));
    // Keep non-uniform canopy normals and imported car transparency on the regular render path.
    root.findComponents('render')
        .filter((render) => render.type === 'box' || render.type === 'cylinder')
        .filter((render) => !kiosks.root || !render.entity.isDescendantOf(kiosks.root))
        .forEach((render) => {
            render.batchGroupId = group.id;
        });
    return life;
};
