import { Entity, Script, math } from 'playcanvas';
import type { AppBase, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { COMMERCIAL_SUBSTITUTES, isModelAllowed } from '../../data/assetPolicy';
import { BEACH_POSE_HEIGHTS, CHARACTER_MODELS } from '../../data/characterModels';
import type { BeachCharacterId } from '../../data/characterModels';
import { LOCOMOTION_SPEEDS } from '../../data/locomotion';
import type { PreparedModelId } from '../../data/newModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createPreparedModel } from '../../scenes/createPreparedModel';
import { createBoxVisual as box, createMaterial, createStaticBody } from '../../scenes/primitives';

import { BEACH_CROWD_SPOTS, BEACH_CROWD_STROLLERS, BEACH_CROWD_SWIMMERS } from './beachCrowdLayout';
import type { CrowdMember, CrowdPose } from './beachCrowdLayout';
import { beachWaterHeight } from './BeachWater';
import { BEACH_SHORE_Z } from './entryLayout';

/** Seated rigs sit on the supplied loungers with their pelvis slightly forward of the frame. */
const SEAT = { y: -0.07, z: -0.12 };
/** Lying rigs are pivoted at the feet; this lifts the back/front of the body clear of the towel. */
const LYING_LIFT = 0.15;
const VISIBLE_RANGE = 60;
const ANIMATED_RANGE = 24;
const SPAWN_PER_FRAME = 36;

type Person = {
    readonly definition: CrowdMember | null;
    readonly model: BeachCharacterId;
    readonly holder: Entity;
    character: AnimatedCharacter | null;
    pose: CrowdPose | 'walk' | 'swim' | 'float' | 'run';
    run?: { delay: number; speed: number; heading: number };
};
type Game = { ball: Entity; players: Person[]; from: number; to: number; time: number; duration: number };
type Swimmer = { person: Person; x: number; z: number; phase: number; swimming: boolean };
type Stroller = { person: Person; from: number; to: number; z: number; forward: boolean; heading: number };

export class BeachCrowd extends Script {
    static scriptName = 'beachCrowd';
    assets!: GameAssets;
    player!: Entity;
    bodies!: Entity;
    people: Person[] = [];
    games: Game[] = [];
    swimmers: Swimmer[] = [];
    strollers: Stroller[] = [];
    calmPaused = true;
    wavePaused = false;
    mode: 'calm' | 'watching' | 'pointing' | 'running' = 'calm';
    retreat = () => 0;
    private pending: Person[] = [];
    private time = 0;
    private lodTime = 0;

    get paused() {
        return this.mode === 'calm' ? this.calmPaused : this.wavePaused;
    }

    get count() {
        return this.people.length;
    }

    get spawned() {
        return this.people.length - this.pending.length;
    }

    /** Builds the rig for a person and applies its pose. */
    private spawn(person: Person) {
        const character = createAnimatedCharacter(
            this.assets.characters[person.model],
            person.model,
            `${person.holder.name}-rig`
        );
        person.holder.addChild(character.root);
        person.character = character;
        this.applyPose(person, person.pose);
        character.anim.baseLayer!.activeStateCurrentTime = (this.people.indexOf(person) % 11) * 0.37;
        character.anim.playing = !this.paused;
    }

    private applyPose(person: Person, pose: Person['pose']) {
        const character = person.character;
        if (!character) return;
        const heights = BEACH_POSE_HEIGHTS[person.model];
        person.pose = pose;
        character.root.setLocalEulerAngles(0, 0, 0);
        character.root.setLocalPosition(0, 0, 0);
        if (pose === 'seated') {
            character.root.setLocalPosition(0, SEAT.y, SEAT.z);
            character.play('seated', 0);
        } else if (pose === 'lyingBack' || pose === 'lyingFront') {
            // Back: head toward local -Z, face up. Front: the holder is turned 180°, face down on the towel.
            character.root.setLocalEulerAngles(pose === 'lyingBack' ? -90 : 90, 0, 0);
            character.root.setLocalPosition(0, LYING_LIFT, 0);
            character.play('idle', 0);
        } else if (pose === 'talk') {
            character.root.setLocalPosition(0, heights.idle, 0);
            character.play('talk', 0);
        } else if (pose === 'swim' || pose === 'float') {
            character.play(pose, 0);
        } else {
            character.root.setLocalPosition(0, pose === 'walk' ? heights.walk : heights.idle, 0);
            character.play(pose === 'walk' ? 'walk' : 'idle', 0);
        }
    }

    /** Queues every rig for spawning, building the first immediate straight away. */
    prime(order: Person[], immediate: number) {
        this.pending = [...order];
        for (let i = 0; i < immediate && this.pending.length; i++) this.spawn(this.pending.shift()!);
    }

    private flush() {
        while (this.pending.length) this.spawn(this.pending.shift()!);
    }

    private syncLod() {
        const p = this.player.getPosition();
        const paused = this.paused;
        for (const person of this.people) {
            if (!person.character) continue;
            const q = person.holder.getPosition();
            const distance = Math.abs(q.x - p.x) + Math.abs(q.z - p.z);
            // Runners stay visible until they leave the beach; everyone else is culled beyond the haze.
            if (this.mode === 'running') person.holder.enabled = !!person.run;
            else person.holder.enabled = distance < VISIBLE_RANGE;
            person.character.anim.playing = !paused && distance < ANIMATED_RANGE * (this.mode === 'running' ? 2 : 1);
        }
    }

    setPausedFor(mode: 'calm' | 'wave', paused: boolean) {
        if (mode === 'calm') this.calmPaused = paused;
        else this.wavePaused = paused;
        this.syncLod();
    }

    watch() {
        if (this.mode !== 'calm') return;
        this.flush();
        this.mode = 'watching';
        // Everyone gets up and turns to face the strangely retreating sea.
        for (const person of this.people) {
            if (person.pose === 'swim' || person.pose === 'float') continue;
            const p = person.holder.getPosition();
            if (person.pose === 'lyingFront' || person.pose === 'lyingBack' || person.pose === 'seated') {
                const forward = person.pose === 'seated' ? 1.1 : 0.4;
                person.holder.setPosition(p.x, 0, p.z - forward);
            }
            person.holder.setEulerAngles(0, 180 + (Math.random() - 0.5) * 30, 0);
            this.applyPose(person, 'idle');
        }
        for (const game of this.games) game.ball.enabled = false;
    }

    point() {
        if (this.mode !== 'watching') return;
        this.mode = 'pointing';
        this.people.forEach((person, i) => {
            if (person.pose !== 'idle' || i % 3 === 2) return;
            person.character?.play('point', 0.15);
        });
    }

    evacuate() {
        if (this.mode === 'running') return;
        this.watch();
        this.mode = 'running';
        this.bodies.enabled = false;
        for (const person of this.people) {
            const p = person.holder.getPosition();
            person.character!.anim.speed = 1;
            person.run = {
                delay: Math.max(0, (p.z - BEACH_SHORE_Z) * 0.04) + Math.random() * 1.2,
                speed: 4.4 + Math.random() * 1.6,
                heading: 0
            };
            if (person.pose === 'swim' || person.pose === 'float') person.run.delay += 1.5;
            this.applyPose(person, 'idle');
            person.pose = 'run';
        }
    }

    update(dt: number) {
        // Rigs stream in nearest-first after arrival so the black loading handoff stays short.
        if (this.pending.length && this.mode === 'calm') {
            for (let i = 0; i < SPAWN_PER_FRAME && this.pending.length; i++) this.spawn(this.pending.shift()!);
        }
        this.lodTime -= Math.max(dt, 0);
        if (this.lodTime <= 0) {
            this.lodTime = 0.3;
            this.syncLod();
        }
        if (this.paused || dt <= 0) return;
        const step = Math.min(dt, 0.1);
        this.time += step;
        if (this.mode === 'calm') this.updateCalm(step);
        else if (this.mode === 'pointing') {
            for (const person of this.people) {
                const layer = person.character?.anim.baseLayer;
                if (layer?.activeState === 'point' && layer.activeStateCurrentTime >= 0.85)
                    person.character!.anim.speed = 0;
            }
        }
        if (this.mode === 'watching' || this.mode === 'pointing') {
            for (const swimmer of this.swimmers) {
                const p = swimmer.person.holder.getPosition();
                if (this.retreat() < BEACH_SHORE_Z - p.z + 0.5) continue;
                if (swimmer.person.pose !== 'idle') {
                    swimmer.person.holder.setEulerAngles(0, 180, 0);
                    this.applyPose(swimmer.person, 'idle');
                }
                swimmer.person.holder.setPosition(p.x, -0.31, p.z);
            }
        }
        if (this.mode === 'running') this.updateRunning(step);
    }

    private updateCalm(step: number) {
        for (const game of this.games) {
            game.time += step;
            const from = game.players[game.from].holder.getPosition();
            const to = game.players[game.to].holder.getPosition();
            const t = Math.min(1, game.time / game.duration);
            const x = from.x + (to.x - from.x) * t;
            const z = from.z + (to.z - from.z) * t;
            game.ball.setPosition(x, 1.35 + Math.sin(t * Math.PI) * 2.3, z);
            game.ball.setEulerAngles(this.time * 260, this.time * 90, 0);
            if (t < 1) continue;
            // Catch, then volley it on to somebody else; the thrower gestures as it leaves their hands.
            game.from = game.to;
            game.to = (game.from + 1 + Math.floor(Math.random() * (game.players.length - 1))) % game.players.length;
            game.time = 0;
            game.duration = 1.1 + Math.random() * 0.5;
            const thrower = game.players[game.from].character;
            if (thrower?.anim.playing) {
                thrower.play('point', 0.08);
                window.setTimeout(() => {
                    if (this.mode === 'calm') thrower.play('idle', 0.3);
                }, 650);
            }
        }
        for (const swimmer of this.swimmers) {
            const angle = this.time * 0.13 + swimmer.phase;
            const x = swimmer.x + (swimmer.swimming ? Math.cos(angle) * 3 : 0);
            const z = swimmer.z + (swimmer.swimming ? Math.sin(angle) * 1.2 : 0);
            const lift = BEACH_POSE_HEIGHTS[swimmer.person.model][swimmer.swimming ? 'swim' : 'float'];
            swimmer.person.holder.setPosition(x, beachWaterHeight(x, z, this.time) + lift, z);
            if (swimmer.swimming)
                swimmer.person.holder.setEulerAngles(
                    0,
                    (Math.atan2(-Math.sin(angle) * 3, Math.cos(angle) * 1.2) * 180) / Math.PI,
                    0
                );
        }
        const player = this.player.getPosition();
        for (const stroller of this.strollers) {
            const p = stroller.person.holder.getPosition();
            const target = stroller.forward ? stroller.to : stroller.from;
            const direction = Math.sign(target - p.x);
            const blocked = Math.hypot(player.x - p.x, player.z - p.z) < 1.2 && (player.x - p.x) * direction > 0;
            stroller.person.character?.move(blocked ? 0 : 1);
            if (blocked) continue;
            const x = Math.abs(target - p.x) < step ? target : p.x + direction * step;
            if (x === target) stroller.forward = !stroller.forward;
            stroller.heading = math.lerpAngle(stroller.heading, direction > 0 ? 90 : -90, Math.min(1, step * 6));
            stroller.person.holder.setPosition(x, 0, stroller.z);
            stroller.person.holder.setEulerAngles(0, stroller.heading, 0);
        }
    }

    private updateRunning(step: number) {
        for (const person of this.people) {
            const run = person.run;
            if (!run || !person.character) continue;
            run.delay -= step;
            if (run.delay > 0) continue;
            const p = person.holder.getPosition();
            if (p.z > 9.4) {
                // Out through the dunes behind the rail; the crowd leaves the beach.
                person.run = undefined;
                person.holder.enabled = false;
                continue;
            }
            const speed = run.speed;
            const z = p.z + speed * step;
            run.heading = math.lerpAngle(run.heading, 0, Math.min(1, step * 8));
            person.holder.setEulerAngles(0, run.heading, 0);
            person.holder.setPosition(p.x, z < BEACH_SHORE_Z ? -0.31 : 0, z);
            if (person.pose !== 'run' || person.character.anim.baseLayer!.activeState !== 'sprint') {
                person.character.play('sprint', 0.15);
                person.character.root.setLocalPosition(0, BEACH_POSE_HEIGHTS[person.model].sprint, 0);
            }
            person.character.anim.speed = speed / (LOCOMOTION_SPEEDS.sprint * CHARACTER_MODELS[person.model].scale);
        }
    }
}

const designFor = (id: PreparedModelId, assets: GameAssets): PreparedModelId | null => {
    let design: PreparedModelId | null = id;
    if (!isModelAllowed(design)) {
        const substitute = COMMERCIAL_SUBSTITUTES[design];
        design = substitute && substitute !== 'procedural' ? substitute : null;
    }
    return design && assets.models[design] ? design : null;
};

export const createBeachCrowd = (app: AppBase, parent: Entity, assets: GameAssets, player: Entity) => {
    const root = new Entity('beach-crowd');
    parent.addChild(root);
    const bodies = new Entity('beach-crowd-bodies');
    root.addChild(bodies);
    const towelColors = [
        [0.92, 0.36, 0.24],
        [0.16, 0.5, 0.62],
        [0.95, 0.75, 0.24],
        [0.42, 0.64, 0.36],
        [0.66, 0.38, 0.62],
        [0.94, 0.92, 0.84]
    ] as const;
    const towels: StandardMaterial[] = towelColors.map((color, i) =>
        createMaterial(`crowd-towel-${i}`, color[0], color[1], color[2])
    );
    const stripe = createMaterial('crowd-towel-stripe', 0.97, 0.95, 0.9);
    root.once('destroy', () => [...towels, stripe].forEach((material) => material.destroy()));
    const props = new Entity('beach-crowd-props');
    root.addChild(props);
    const imported: Entity[] = [];
    const people: Person[] = [];
    const games: Game[] = [];
    const add = (definition: CrowdMember | null, model: BeachCharacterId, name: string) => {
        const holder = new Entity(name);
        root.addChild(holder);
        const person: Person = { definition, model, holder, character: null, pose: definition?.pose ?? 'idle' };
        if (person.pose === 'player') person.pose = 'idle';
        people.push(person);
        return person;
    };
    for (const spot of BEACH_CROWD_SPOTS) {
        let ball: Entity | undefined;
        for (const definition of spot.solids) createStaticBody(bodies, definition);
        for (const [index, item] of spot.props.entries()) {
            if (item.kind === 'towel') {
                const towel = box(
                    props,
                    `${spot.name}-towel-${index}`,
                    [item.position[0], 0.016, item.position[2]],
                    [0.95, 0.025, 2.05],
                    towels[(item.color ?? index) % towels.length]
                );
                towel.setLocalEulerAngles(0, item.yaw, 0);
                box(towel, 'towel-stripe', [0, 0.6, 0.32], [1, 0.4, 0.07], stripe);
                continue;
            }
            const design = designFor(item.kind, assets);
            if (!design) continue;
            const model = createPreparedModel(
                assets.models[design]!,
                design,
                `${spot.name}-${design}-${index}`,
                { footprint: item.footprint, height: item.height },
                { animate: design === 'sushiBooth' }
            );
            props.addChild(model.root);
            model.root.setLocalPosition(item.position[0], 0, item.position[2]);
            model.root.setLocalEulerAngles(0, item.yaw, 0);
            imported.push(model.root);
            if (spot.kind === 'game') ball = model.root;
        }
        const game: Game | undefined = ball
            ? { ball, players: [], from: 0, to: 2, time: Math.random(), duration: 1.3 }
            : undefined;
        if (game) games.push(game);
        spot.members.forEach((definition, index) => {
            const person = add(definition, definition.model, `${spot.name}-person-${index}`);
            const lyingFront = definition.pose === 'lyingFront';
            person.holder.setPosition(definition.position[0], 0, definition.position[2]);
            person.holder.setEulerAngles(0, definition.yaw + (lyingFront ? 180 : 0), 0);
            if (game) game.players.push(person);
        });
    }
    const swimmers: Swimmer[] = BEACH_CROWD_SWIMMERS.map((definition, index) => {
        const person = add(null, definition.model, `beach-crowd-swimmer-${index}`);
        person.pose = definition.swimming ? 'swim' : 'float';
        person.holder.setPosition(definition.x, 0.14, definition.z);
        person.holder.setEulerAngles(0, index % 2 ? -90 : 90, 0);
        return { person, x: definition.x, z: definition.z, phase: index * 1.3, swimming: definition.swimming };
    });
    const strollers: Stroller[] = BEACH_CROWD_STROLLERS.map((definition, index) => {
        const person = add(null, definition.model, `beach-crowd-stroller-${index}`);
        person.pose = 'walk';
        const start = definition.from + (definition.to - definition.from) * ((index * 0.37) % 1);
        person.holder.setPosition(start, 0, definition.z);
        return {
            person,
            from: definition.from,
            to: definition.to,
            z: definition.z,
            forward: index % 2 === 0,
            heading: 90
        };
    });
    const crowd = root.addComponent('script')!.create(BeachCrowd, {
        properties: { assets, player, bodies, people, games, swimmers, strollers }
    })!;
    // Spawn nearest to the arrival point first so the visible crowd is in place immediately.
    const arrival = player.getPosition();
    const order = [...people].sort((a, b) => {
        const pa = a.holder.getPosition();
        const pb = b.holder.getPosition();
        return Math.hypot(pa.x - arrival.x, pa.z - arrival.z) - Math.hypot(pb.x - arrival.x, pb.z - arrival.z);
    });
    crowd.prime(order, 90);
    const group = app.batcher!.addGroup('beach-crowd-static', false, 40);
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    props.findComponents('render').forEach((render) => {
        if (!imported.some((model) => render.entity === model || render.entity.isDescendantOf(model)))
            render.batchGroupId = group.id;
    });
    return crowd;
};
