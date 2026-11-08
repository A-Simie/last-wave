import { BLEND_NORMAL, Entity, Script, Vec3, math } from 'playcanvas';
import type { GraphNode, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { CharacterModelId } from '../../data/characterModels';
import type { Vector3Tuple } from '../../data/foundation';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';

type Walker = {
    character: AnimatedCharacter;
    route: Vec3[];
    waypoint: number;
    speed: number;
    heading: number;
};
type Car = { root: Entity; direction: number; speed: number; wheels: Entity[]; wheelAngle: number };
type CarriedProp = { root: Entity; hand: GraphNode; walker: Walker };

const WALKER_Y = 0.048;
const WHEEL_RADIUS = 0.31;

const PEDESTRIANS: { model: CharacterModelId; x: number; south?: boolean; returning?: boolean; umbrella?: boolean }[] =
    [
        { model: 'commuterSuit', x: -9 },
        { model: 'patronLong', x: 16, returning: true, umbrella: true },
        { model: 'patronBuzz', x: 32 },
        { model: 'patronShort', x: 4, south: true, umbrella: true },
        { model: 'commuterSuit', x: 20, south: true, returning: true },
        { model: 'patronBeard', x: -18, south: true },
        { model: 'patronBuns', x: 38, south: true, returning: true, umbrella: true },
        { model: 'barista', x: -35, returning: true }
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
            walker.character.play(blocked ? 'idle' : 'walk');
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
            if (player.y < 3 && Math.abs(player.z - position.z) < 1.55 && ahead > -2.5 && ahead < 4.5) continue;
            if (
                this.obstacles.some((other) => {
                    const point = other.getPosition();
                    const gap = (point.x - position.x) * car.direction;
                    return (
                        other.enabled && point.y < 3 && Math.abs(point.z - position.z) < 1.55 && gap > -2.5 && gap < 4.5
                    );
                })
            )
                continue;
            if (
                this.cars.some((other) => {
                    const gap = (other.root.getPosition().x - position.x) * car.direction;
                    return other !== car && other.direction === car.direction && gap > 0 && gap < 5.3;
                })
            )
                continue;
            let x = position.x + car.direction * car.speed * step;
            if (x > 94) x = -84;
            if (x < -84) x = 94;
            if (Math.abs(x - player.x) < 3 && Math.abs(position.z - player.z) < 1.55) continue;
            if (
                this.cars.some(
                    (other) =>
                        other !== car &&
                        other.direction === car.direction &&
                        Math.abs(other.root.getPosition().x - x) < 5
                )
            )
                continue;
            car.root.setPosition(x, position.y, position.z);
            car.wheelAngle = (car.wheelAngle + (((car.speed * step) / WHEEL_RADIUS) * 180) / Math.PI) % 360;
            for (const wheel of car.wheels) wheel.setLocalEulerAngles(0, -car.wheelAngle, 90);
        }
    }

    postUpdate() {
        for (const { root, hand, walker } of this.carried) {
            root.setPosition(hand.getPosition());
            root.setEulerAngles(0, walker.heading, 0);
        }
    }
}

export const createStreetLife = (parent: Entity, assets: GameAssets, player: Entity) => {
    const root = new Entity('seafront-life');
    parent.addChild(root);
    const materials = {
        metal: createMaterial('traffic-trim', 0.68, 0.69, 0.65),
        dark: createMaterial('traffic-rubber', 0.07, 0.08, 0.08),
        seats: createMaterial('car-interior', 0.21, 0.17, 0.13),
        red: createMaterial('traffic-coral', 0.63, 0.24, 0.16),
        blue: createMaterial('traffic-blue', 0.21, 0.39, 0.47),
        cream: createMaterial('traffic-ivory', 0.86, 0.79, 0.59),
        glass: createMaterial('car-glass', 0.48, 0.66, 0.7),
        lamp: createMaterial('car-lights', 0.98, 0.89, 0.62),
        teal: createMaterial('sun-umbrella-teal', 0.15, 0.5, 0.46),
        gold: createMaterial('sun-umbrella-gold', 0.92, 0.61, 0.22),
        lilac: createMaterial('sun-umbrella-lilac', 0.55, 0.41, 0.59)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    materials.glass.opacity = 0.22;
    materials.glass.blendType = BLEND_NORMAL;
    materials.glass.depthWrite = false;
    materials.glass.update();

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
        const near = definition.south ? 19.3 : 7.25;
        const far = definition.south ? 20.35 : 8.2;
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
            character,
            route: [
                new Vec3(-46, WALKER_Y, near),
                new Vec3(52, WALKER_Y, near),
                new Vec3(52, WALKER_Y, far),
                new Vec3(-46, WALKER_Y, far)
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
        [65, 15.2, -1]
    ].entries()) {
        const car = new Entity(`street-car-${index}`);
        root.addChild(car);
        const x =
            Math.abs(start - player.getPosition().x) < 3 && Math.abs(lane - player.getPosition().z) < 1.55
                ? start - direction * 8
                : start;
        car.setPosition(x, 0.009, lane);
        car.setEulerAngles(0, direction * 90, 0);
        car.addComponent('collision', {
            type: 'box',
            halfExtents: new Vec3(0.94, 0.965, 1.94),
            linearOffset: new Vec3(0, 0.965, 0)
        });
        car.addComponent('rigidbody', { type: 'kinematic' });
        const paint = [materials.red, materials.blue, materials.cream, materials.teal][index];
        box(car, 'body', [0, 0.57, 0], [1.72, 0.52, 3.7], paint);
        box(car, 'hood', [0, 0.85, 1.23], [1.66, 0.16, 1.2], paint);
        box(car, 'boot', [0, 0.86, -1.48], [1.66, 0.22, 0.65], paint);
        box(car, 'roof', [0, 1.87, -0.15], [1.62, 0.12, 1.94], paint);
        for (const x of [-0.77, 0.77]) {
            for (const z of [-1.05, 0.76]) box(car, `pillar-${x}-${z}`, [x, 1.32, z], [0.085, 0.98, 0.085], paint);
            box(car, `door-glass-${x}`, [x, 1.32, -0.14], [0.02, 0.9, 1.7], materials.glass);
            box(car, `handle-${x}`, [x * 1.13, 0.79, -0.58], [0.04, 0.04, 0.22], materials.metal);
        }
        for (const z of [-1.05, 0.76]) box(car, `windscreen-${z}`, [0, 1.32, z], [1.47, 0.9, 0.025], materials.glass);
        for (const x of [-0.4, 0.4]) {
            box(car, `seat-${x}`, [x, 0.79, -0.2], [0.56, 0.13, 0.56], materials.seats);
            box(car, `seat-back-${x}`, [x, 1.1, -0.44], [0.55, 0.64, 0.13], materials.seats);
        }
        box(car, 'dashboard', [0, 0.96, 0.48], [1.45, 0.18, 0.4], materials.seats);
        const steering = primitive(
            car,
            'steering-wheel',
            'cylinder',
            [0.4, 1.06, 0.02],
            [0.36, 0.035, 0.36],
            materials.dark
        );
        steering.setLocalEulerAngles(65, 0, 0);
        const column = primitive(
            car,
            'steering-column',
            'cylinder',
            [0.4, 0.97, 0.22],
            [0.045, 0.4, 0.045],
            materials.metal
        );
        column.setLocalEulerAngles(65, 0, 0);
        for (const z of [-1.88, 1.88]) box(car, `bumper-${z}`, [0, 0.45, z], [1.68, 0.12, 0.1], materials.metal);
        for (const x of [-0.55, 0.55]) {
            box(car, `headlight-${x}`, [x, 0.73, 1.861], [0.34, 0.16, 0.024], materials.lamp);
            box(car, `taillight-${x}`, [x, 0.72, -1.861], [0.32, 0.15, 0.024], materials.red);
        }
        const wheels: Entity[] = [];
        for (const x of [-0.83, 0.83]) {
            for (const z of [-1.2, 1.2]) {
                const wheel = primitive(
                    car,
                    `wheel-${x}-${z}`,
                    'cylinder',
                    [x, WHEEL_RADIUS, z],
                    [WHEEL_RADIUS * 2, 0.18, WHEEL_RADIUS * 2],
                    materials.dark
                );
                wheel.setLocalEulerAngles(0, 0, 90);
                primitive(
                    wheel,
                    'wheel-hub',
                    'cylinder',
                    [0, -Math.sign(x) * 0.54, 0],
                    [0.58, 0.08, 0.58],
                    materials.metal
                );
                for (const [index, size] of (
                    [
                        [0.48, 0.015, 0.07],
                        [0.07, 0.015, 0.48]
                    ] satisfies Vector3Tuple[]
                ).entries()) {
                    box(wheel, `wheel-spoke-${index}`, [0, -Math.sign(x) * 0.59, 0], size, materials.dark);
                }
                wheels.push(wheel);
            }
        }
        if (index < 2) {
            const model = index === 0 ? 'patronBuzz' : 'patronShort';
            const driver = createAnimatedCharacter(assets.characters[model], model, `street-driver-${index}`);
            car.addChild(driver.root);
            driver.root.setLocalPosition(0.4, index === 0 ? 0.36 : 0.385, 0.06);
            driver.play('seated', 0);
            drivers.push(driver);
        }
        cars.push({ root: car, direction, speed: direction === 1 ? 4.8 : 5.2, wheels, wheelAngle: 0 });
    }
    const life = root
        .addComponent('script')!
        .create(StreetLife, { properties: { player, walkers, cars, carried, drivers } })!;
    const group = life.app.batcher!.addGroup('seafront-moving-props', true, 32);
    root.once('destroy', () => life.app.batcher?.removeGroup(group.id));
    // Keep non-uniform cone normals and per-window transparency sorting on the regular render path.
    root.findComponents('render')
        .filter(
            (render) => (render.type === 'box' || render.type === 'cylinder') && render.material !== materials.glass
        )
        .forEach((render) => {
            render.batchGroupId = group.id;
        });
    return life;
};
