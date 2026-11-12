import { Entity } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { Vector3Tuple } from '../../data/foundation';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createCompanion } from '../../player/CompanionController';
import { isBeachArrivalPosition } from '../../scenes/FoundationState';
import type { CutsceneSystem } from '../../systems/CutsceneSystem';
import type { DialogueDefinition, DialogueSystem } from '../../systems/DialogueSystem';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import type { QuestSystem } from '../../systems/QuestSystem';

import { BEACH_DRINKS_DIALOGUE, BEACH_FRIEND_DIALOGUE, BEACH_LOCAL_DIALOGUE, BEACH_SHORE_DIALOGUE } from './beach';
import { BeachAudio } from './BeachAudio';
import { createBeachCrowd } from './BeachCrowd';
import { createBeachDressing } from './BeachDressing';
import { BEACH_SHORE_MARK } from './beachLayout';
import { createBeachLife } from './BeachLife';
import { BeachNavigation } from './BeachNavigation';
import { createBeachWater } from './BeachWater';
import { createBeachWave } from './BeachWave';
import { entryReply } from './entry';
import { BEACH_FRIEND_SPAWN } from './entryLayout';
import type { WaveCheckpoint } from './WaveProgress';

export const createBeachArrival = (
    parent: Entity,
    app: AppBase,
    assets: GameAssets,
    player: Entity,
    interactions: InteractionSystem,
    dialogue: DialogueSystem,
    quest: QuestSystem,
    character: AnimatedCharacter,
    cutscene: CutsceneSystem,
    checkpoint: WaveCheckpoint
) => {
    const root = new Entity('beach-arrival');
    parent.addChild(root);
    const audio = new BeachAudio(`${import.meta.env.BASE_URL}assets/`);
    let destroyed = false;
    root.once('destroy', () => {
        destroyed = true;
        audio.destroy();
    });
    const dressing = createBeachDressing(root, app, assets);
    const water = createBeachWater(root, app.graphicsDevice);
    const life = createBeachLife(root, assets, player);
    life.crowd = createBeachCrowd(app, root, assets, player);
    life.crowd.setPausedFor('calm', true);
    const navigation = new BeachNavigation(isBeachArrivalPosition);
    const tuple = (entity: Entity): Vector3Tuple => {
        const p = entity.getPosition();
        return [p.x, p.y, p.z];
    };
    const near = navigation.near(
        tuple(player),
        BEACH_FRIEND_SPAWN,
        life.walkers.map(({ entity }) => tuple(entity))
    );
    if (!near) throw new Error('No clear place for the beach companion.');
    const companion = createCompanion(root, assets, player, near, isBeachArrivalPosition);
    companion.obstacles = life.walkers.map(({ entity }) => entity);
    life.obstacles = [companion.entity];
    const wave = createBeachWave(
        root,
        app,
        assets,
        player,
        character,
        companion,
        life,
        water,
        dressing,
        audio,
        cutscene,
        quest,
        checkpoint
    );
    const shoreline = new Entity('beach-shoreline-look');
    root.addChild(shoreline);
    shoreline.setPosition(...BEACH_SHORE_MARK);
    const open = (definition: DialogueDefinition) => {
        if (!destroyed && wave.calm) dialogue.open(definition);
    };
    interactions.targets = [
        {
            id: 'beach-arrival-friend',
            label: 'Talk with your friend',
            entity: companion.entity,
            radius: 2.6,
            promptOffset: [0, 0.85, 0],
            action: { type: 'callback', run: () => open(BEACH_FRIEND_DIALOGUE) }
        },
        {
            id: 'beach-chilled-drinks',
            label: 'Chilled drinks',
            entity: dressing.cart,
            radius: 3.1,
            promptOffset: [0, 1.15, 0],
            action: {
                type: 'callback',
                run: () =>
                    open(
                        quest.snapshot.completedObjectiveIds.includes('drinks')
                            ? entryReply(
                                  'e1-beach-drinks-served',
                                  'Citrus cart attendant',
                                  'Hope the citrus waters hit the spot. Take your time in the shade—there’s no hurry today.'
                              )
                            : BEACH_DRINKS_DIALOGUE
                    )
            }
        },
        {
            id: 'beach-shoreline',
            label: 'Look out at the sea',
            entity: shoreline,
            radius: 3,
            action: { type: 'callback', run: () => open(BEACH_SHORE_DIALOGUE) }
        },
        {
            id: 'beach-local',
            label: 'Talk to the beachgoer',
            entity: life.entity.findByName('beach-local') as Entity,
            radius: 2.4,
            promptOffset: [0, 1, 0],
            action: { type: 'callback', run: () => open(BEACH_LOCAL_DIALOGUE) }
        }
    ];
    const stops = [
        { id: 'friend', label: 'Your friend', entity: companion.entity },
        { id: 'drinks', label: 'Citrus cart', entity: dressing.cart },
        { id: 'shore', label: 'Shoreline · end of the boardwalk', entity: shoreline }
    ];
    let paused = true;
    let routeTime = 0;
    return {
        quest,
        audio,
        wave,
        setControlsEnabled: (enabled: boolean, presentationPaused: boolean) => {
            paused = !enabled || !wave.calm;
            companion.paused = paused;
            life.paused = paused;
            audio.setPaused(wave.calm ? paused : presentationPaused || wave.progress.checkpoint === 'after-blackout');
            wave.setPaused(wave.calm ? paused : presentationPaused);
        },
        update: (dt: number) => {
            audio.update(dt);
            if (paused || dt <= 0) return;
            water.update(dt);
            const point = tuple(player);
            const friend = tuple(companion.entity);
            const distance = Math.hypot(point[0] - friend[0], point[2] - friend[2]);
            routeTime -= dt;
            if (distance < 1.65) companion.stop();
            if (distance < 3.3 || routeTime > 0) return;
            routeTime = 0.75;
            const occupied = life.walkers.map(({ entity }) => tuple(entity));
            const destination = navigation.near(point, friend, occupied);
            const route = destination && navigation.route(friend, destination, occupied);
            if (route) companion.follow(route);
            else companion.stop();
        },
        getNavigation: () => {
            if (!wave.calm) return wave.getNavigation();
            const completed = quest.snapshot.completedObjectiveIds;
            const point = player.getPosition();
            const next = stops
                .filter(({ id }) => !completed.includes(id))
                .map(({ label, entity }) => {
                    const target = entity.getPosition();
                    return { label, distance: Math.round(Math.hypot(point.x - target.x, point.z - target.z)) };
                })
                .sort((a, b) => a.distance - b.distance)[0];
            return next ?? null;
        }
    };
};
