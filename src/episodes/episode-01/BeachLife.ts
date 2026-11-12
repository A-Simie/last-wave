import { Entity, Script, Vec3, math } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { BEACH_POSE_HEIGHTS } from '../../data/characterModels';
import type { BeachCharacterId } from '../../data/characterModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createStaticBody } from '../../scenes/primitives';

import type { BeachCrowd } from './BeachCrowd';
import { BEACH_DRESSING_SOLIDS, BEACH_STANDING_PEOPLE, BEACH_WALKER_ROUTES } from './beachLayout';
import { beachWaterHeight } from './BeachWater';
import { BEACH_SHORE_Z } from './entryLayout';

type Walker = {
    entity: Entity;
    character: AnimatedCharacter;
    model: BeachCharacterId;
    route: Vec3[];
    waypoint: number;
    heading: number;
};
type Swimmer = {
    character: AnimatedCharacter;
    model: BeachCharacterId;
    x: number;
    z: number;
    phase: number;
    swimming: boolean;
    height: number;
};

export class BeachLife extends Script {
    static scriptName = 'beachLife';
    player!: Entity;
    characters: AnimatedCharacter[] = [];
    walkers: Walker[] = [];
    swimmers: Swimmer[] = [];
    standing: { entity: Entity; character: AnimatedCharacter; model: BeachCharacterId }[] = [];
    obstacles: Entity[] = [];
    /** The expanded 480-person crowd; created alongside the original cast. */
    crowd: BeachCrowd | null = null;
    private suspended = false;
    private time = 0;
    private readonly direction = new Vec3();

    set paused(value: boolean) {
        this.suspended = value;
        this.characters.forEach((character) => {
            character.anim.playing = !value;
        });
        this.crowd?.setPausedFor('calm', value);
    }

    update(dt: number) {
        if (this.suspended || dt <= 0) return;
        const step = Math.min(dt, 0.1);
        this.time += step;
        for (const walker of this.walkers) {
            const position = walker.entity.getPosition();
            this.direction.sub2(walker.route[walker.waypoint], position);
            const distance = this.direction.length();
            this.direction.normalize();
            const blocked = [this.player, ...this.obstacles, ...this.walkers.map(({ entity }) => entity)].some(
                (entity) => {
                    if (entity === walker.entity) return false;
                    const other = entity.getPosition();
                    const x = other.x - position.x;
                    const z = other.z - position.z;
                    return (
                        Math.abs(other.y - position.y) < 2 &&
                        Math.hypot(x, z) < 1.1 &&
                        x * this.direction.x + z * this.direction.z > -0.1
                    );
                }
            );
            walker.character.move(blocked ? 0 : Math.min(distance / step, 1));
            walker.character.root.setLocalPosition(
                0,
                -1.04 + BEACH_POSE_HEIGHTS[walker.model][blocked ? 'idle' : 'walk'],
                0
            );
            if (blocked) continue;
            walker.heading = math.lerpAngle(
                walker.heading,
                (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
                Math.min(1, step * 8)
            );
            walker.entity.setEulerAngles(0, walker.heading, 0);
            if (distance < step) {
                walker.entity.setPosition(walker.route[walker.waypoint]);
                walker.waypoint = (walker.waypoint + 1) % walker.route.length;
            } else walker.entity.setPosition(this.direction.mulScalar(step).add(position));
        }
        for (const swimmer of this.swimmers) {
            const angle = this.time * 0.14 + swimmer.phase;
            const x = swimmer.x + (swimmer.swimming ? Math.cos(angle) * 3.2 : 0);
            const z = swimmer.z + (swimmer.swimming ? Math.sin(angle) * 1.1 : 0);
            swimmer.character.root.setPosition(x, beachWaterHeight(x, z, this.time) + swimmer.height, z);
            if (swimmer.swimming)
                swimmer.character.root.setEulerAngles(
                    0,
                    (Math.atan2(-Math.sin(angle) * 3.2, Math.cos(angle) * 1.1) * 180) / Math.PI,
                    0
                );
        }
    }
}

export const createBeachLife = (parent: Entity, assets: GameAssets, player: Entity) => {
    const root = new Entity('beach-life');
    parent.addChild(root);
    const life = root.addComponent('script')!.create(BeachLife, { properties: { player } })!;
    for (const { name, yaw, model } of BEACH_STANDING_PEOPLE) {
        const definition = BEACH_DRESSING_SOLIDS.find((entry) => entry.name === name)!;
        const body = createStaticBody(root, definition);
        const character = createAnimatedCharacter(assets.characters[model], model, `${name}-character`);
        body.addChild(character.root);
        character.root.setLocalPosition(0, -definition.position[1] + BEACH_POSE_HEIGHTS[model].idle, 0);
        character.root.setLocalEulerAngles(0, yaw, 0);
        character.play(name.includes('shore-watcher') ? 'idle' : 'talk', 0);
        life.characters.push(character);
        life.standing.push({ entity: body, character, model });
    }
    const vendorDefinition = BEACH_DRESSING_SOLIDS.find(({ name }) => name === 'beach-vendor')!;
    const vendor = createStaticBody(root, vendorDefinition);
    const attendant = createAnimatedCharacter(assets.characters.barista, 'barista', 'beach-attendant-character');
    vendor.addChild(attendant.root);
    attendant.root.setLocalPosition(0, -vendorDefinition.position[1] + 0.016, 0);
    attendant.play('idle');
    life.characters.push(attendant);

    const walkerModels = ['beachCoral', 'beachGold', 'beachTeal', 'beachBlue'] as const;
    for (let index = 0; index < BEACH_WALKER_ROUTES.length * 2; index++) {
        const model = walkerModels[index % walkerModels.length];
        const route = BEACH_WALKER_ROUTES[Math.floor(index / 2)];
        const entity = new Entity(`beach-walker-${index}`);
        root.addChild(entity);
        let start = (index % 2) * 2;
        const point = player.getPosition();
        if (Math.hypot(point.x - route[start][0], point.z - route[start][2]) < 1.2) start = (start + 1) % route.length;
        entity.setPosition(...route[start]);
        entity.addComponent('collision', {
            type: 'capsule',
            radius: 0.29,
            height: 1.76,
            linearOffset: new Vec3(0, -0.12, 0)
        });
        entity.addComponent('rigidbody', { type: 'kinematic' });
        const character = createAnimatedCharacter(assets.characters[model], model, `beach-walker-${index}-character`);
        entity.addChild(character.root);
        character.root.setLocalPosition(0, -1.04 + BEACH_POSE_HEIGHTS[model].walk, 0);
        life.characters.push(character);
        life.walkers.push({
            entity,
            character,
            model,
            route: route.map((point) => new Vec3(...point)),
            waypoint: (start + 1) % route.length,
            heading: 90
        });
    }
    const swimmers: { model: BeachCharacterId; x: number; z: number; swimming: boolean }[] = [
        { model: 'beachBlue', x: -9, z: BEACH_SHORE_Z - 8, swimming: true },
        { model: 'beachTeal', x: 8, z: BEACH_SHORE_Z - 12, swimming: true },
        { model: 'beachCoral', x: -2.5, z: BEACH_SHORE_Z - 7, swimming: false },
        { model: 'beachGold', x: 1.5, z: BEACH_SHORE_Z - 7.5, swimming: false },
        { model: 'beachTeal', x: -29, z: BEACH_SHORE_Z - 10, swimming: true },
        { model: 'beachGold', x: 28, z: BEACH_SHORE_Z - 9, swimming: true },
        { model: 'beachBlue', x: -39, z: BEACH_SHORE_Z - 13, swimming: false },
        { model: 'beachCoral', x: 39, z: BEACH_SHORE_Z - 15, swimming: false }
    ];
    swimmers.forEach(({ model, x, z, swimming }, index) => {
        const character = createAnimatedCharacter(assets.characters[model], model, `beach-swimmer-${index}`);
        root.addChild(character.root);
        character.play(swimming ? 'swim' : 'float', 0);
        const height = BEACH_POSE_HEIGHTS[model][swimming ? 'swim' : 'float'];
        character.root.setPosition(x, beachWaterHeight(x, z, 0) + height, z);
        character.root.setEulerAngles(0, index % 2 ? -90 : 90, 0);
        life.characters.push(character);
        life.swimmers.push({ character, model, x, z, phase: index * 1.7, swimming, height });
    });
    return life;
};
