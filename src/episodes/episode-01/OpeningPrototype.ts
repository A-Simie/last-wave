import { Entity, Vec3 } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { CAFE_MODELS } from '../../data/cafeModels';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import { createCamera, framePlayerCamera } from '../../player/CameraController';
import { createCompanion } from '../../player/CompanionController';
import { createModelInstance } from '../../scenes/createModelInstance';
import { isFoundationPosition } from '../../scenes/FoundationState';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';
import type { CutsceneState, CutsceneSystem } from '../../systems/CutsceneSystem';
import type { DialogueDefinition, DialogueSystem } from '../../systems/DialogueSystem';
import type { InteractionSystem } from '../../systems/InteractionSystem';
import type { InventorySystem } from '../../systems/InventorySystem';
import { QuestSystem } from '../../systems/QuestSystem';
import type { QuestSnapshot } from '../../systems/QuestSystem';

import { createCafeDressing } from './CafeDressing';
import { CAFE_TABLETOP_Y } from './cafeLayout';
import { createTelevisionScreen } from './CafeTelevision';
import { entryReply } from './entry';
import {
    ATTENDANT_DIALOGUE,
    FRIEND_READY,
    FRIEND_REMINDER,
    OPENING_COMPLETE_DIALOGUE,
    OPENING_CUTSCENE,
    OPENING_QUEST,
    STARTER_BAG,
    TV_DIALOGUE
} from './opening';
import { OpeningActors } from './OpeningActors';
import { OpeningCamera } from './OpeningCamera';
import { FRIEND_ROUTE, OPENING_EXIT, OPENING_SEATS, OPENING_SPAWN, OPENING_TABLE } from './openingLayout';
import { OpeningMedia } from './OpeningMedia';
import type { StreetEntryProgress } from './StreetEntryProgress';

export const createOpeningPrototype = (
    root: Entity,
    player: Entity,
    playerModel: Entity,
    playerCamera: Entity,
    interactions: InteractionSystem,
    dialogue: DialogueSystem,
    inventory: InventorySystem,
    assets: GameAssets,
    cutscene: CutsceneSystem,
    entry: StreetEntryProgress,
    snapshot?: QuestSnapshot
) => {
    const quest = new QuestSystem(OPENING_QUEST);
    const media = new OpeningMedia(`${import.meta.env.BASE_URL}assets/`);
    let stage: Entity | null = null;
    let camera: Entity | null = null;
    let bag: Entity | null = null;
    let actors: OpeningActors | null = null;
    let cameraMotion: OpeningCamera | null = null;
    let screen: ReturnType<typeof createTelevisionScreen> | null = null;
    let destroyed = false;
    root.once('destroy', () => {
        destroyed = true;
        quest.destroy();
        media.destroy();
    });
    if (snapshot && !quest.restore(snapshot)) throw new Error('Invalid opening progress.');

    const talk = (definition: DialogueDefinition) => {
        if (!destroyed) dialogue.open(definition);
    };
    const populateStage = () => {
        if (stage) return;
        stage = new Entity('story-opening-prototype');
        root.addChild(stage);
        const materials = {
            dark: createMaterial('cafe-charcoal', 0.06, 0.09, 0.12)
        };
        stage.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
        const { table, television, fanBlades, patrons } = createCafeDressing(
            stage,
            assets,
            interactions.app.graphicsDevice
        );
        bag = new Entity('starter-bag-prop');
        table.addChild(bag);
        const tabletop = CAFE_TABLETOP_Y - OPENING_TABLE.position[1];
        const tote = createModelInstance(assets.cafe.bag, CAFE_MODELS.bag, 'bag-body').root;
        bag.addChild(tote);
        tote.setLocalPosition(-0.35, tabletop, 0.08);
        tote.setLocalEulerAngles(0, 60, 0);
        box(bag, 'phone', [0.13, tabletop + 0.012, -0.29], [0.09, 0.024, 0.18], materials.dark);
        screen = createTelevisionScreen(stage, interactions.app.graphicsDevice, media);
        television.addChild(screen.panel);
        screen.panel.setLocalPosition(0, 0.105, 0.2);

        const attendant = new Entity('cafe-attendant');
        stage.addChild(attendant);
        attendant.setPosition(7.92, 1.014, -3.52);
        const attendantModel = createAnimatedCharacter(
            assets.characters.barista,
            'barista',
            'cafe-attendant-character'
        );
        attendant.addChild(attendantModel.root);
        attendantModel.root.setLocalPosition(0, -1, 0);
        const attendantTalk = new Entity('cafe-attendant-talk');
        attendant.addChild(attendantTalk);
        attendantTalk.setLocalPosition(0, 0.7, 0);
        const companion = createCompanion(stage, assets, player, FRIEND_ROUTE[0], isFoundationPosition);
        const friend = companion.entity;
        const friendModel = companion.character;
        const seated = (['friendA', 'friendB'] as const).map((id, index) => {
            const character = createAnimatedCharacter(assets.characters[id], id, `cafe-seated-${id}`);
            stage!.addChild(character.root);
            character.root.setLocalPosition(...OPENING_SEATS[index].position);
            character.root.setLocalEulerAngles(0, OPENING_SEATS[index].yaw, 0);
            character.play('seated', 0);
            character.root.enabled = false;
            return character;
        });
        actors = stage.addComponent('script')!.create(OpeningActors, {
            properties: { friend, friendModel, companion, playerModel, seated, attendantModel, patrons, fanBlades }
        })!;

        const exit = new Entity('cafe-exit');
        stage.addChild(exit);
        exit.setPosition(...OPENING_EXIT);

        camera = createCamera(stage, player.getPosition());
        camera.name = 'opening-camera';
        cameraMotion = camera.addComponent('script')!.create(OpeningCamera, {
            properties: { playerCamera }
        })!;
        interactions.targets = [
            ...interactions.targets,
            {
                id: 'cafe-belongings',
                label: 'Collect belongings',
                entity: table,
                radius: 1.95,
                promptOffset: [0, 0.55, 0],
                isAvailable: () => !destroyed && quest.state.completedCount === 1,
                action: {
                    type: 'callback',
                    run: () => {
                        if (destroyed || quest.state.completedCount !== 1) return;
                        inventory.acquire(STARTER_BAG.id);
                        quest.handle({ type: 'interaction', targetId: 'cafe-belongings' });
                        bag!.enabled = false;
                    }
                }
            },
            {
                id: 'cafe-tv',
                label: 'Read bulletin',
                entity: television,
                radius: 3.3,
                action: { type: 'callback', run: () => talk(TV_DIALOGUE) }
            },
            {
                id: 'cafe-attendant',
                label: 'Talk',
                entity: attendantTalk,
                radius: 2.1,
                action: { type: 'callback', run: () => talk(ATTENDANT_DIALOGUE) }
            },
            {
                id: 'cafe-friend',
                label: 'Talk',
                entity: friend,
                radius: 1.8,
                action: {
                    type: 'callback',
                    run: () =>
                        talk(
                            quest.state.completedCount < 2
                                ? FRIEND_REMINDER
                                : quest.state.completedCount < 3
                                  ? FRIEND_READY
                                  : entryReply(
                                        'e1-friend-street',
                                        'Friend',
                                        entry.quest.state.objective?.text ?? 'We made it. Let’s enjoy the sea air.'
                                    )
                        )
                }
            },
            {
                id: 'cafe-exit',
                label: 'Head outside',
                entity: exit,
                radius: 1.2,
                isAvailable: () => !destroyed && quest.state.status !== 'completed',
                action: {
                    type: 'callback',
                    run: () => {
                        if (destroyed) return;
                        if (quest.state.completedCount < 2) {
                            talk(FRIEND_REMINDER);
                            return;
                        }
                        if (!entry.leaveCafe()) {
                            talk(
                                entryReply(
                                    'e1-controls-reminder',
                                    'Friend',
                                    'Take a moment to try moving and looking around. Then meet me at the doorway.'
                                )
                            );
                            return;
                        }
                        quest.handle({ type: 'interaction', targetId: 'cafe-exit' });
                        talk(OPENING_COMPLETE_DIALOGUE);
                    }
                }
            }
        ];
        if (quest.state.completedCount >= 2) {
            bag.enabled = false;
        }
        if (quest.state.completedCount >= 1) actors.depart(true);
    };

    const buildStage = () => {
        const targets = interactions.targets;
        try {
            populateStage();
        } catch (error) {
            stage?.destroy();
            stage = null;
            camera = null;
            bag = null;
            actors = null;
            cameraMotion = null;
            screen = null;
            interactions.targets = targets;
            throw error;
        }
    };

    media.onBroadcastEnded = () => cutscene.advance(OPENING_CUTSCENE.id, 'broadcast');
    buildStage();

    const present = (state: CutsceneState | null, reducedMotion: boolean) => {
        const preview = !state && quest.state.completedCount === 0;
        actors?.present(state, preview);
        cameraMotion?.present(state, reducedMotion, preview);
        media.present(state);
    };
    present(null, false);

    return {
        quest,
        media,
        companion: actors!.companion,
        finishCutscene: (cutsceneId: string) => {
            if (quest.handle({ type: 'cutscene-complete', cutsceneId })) actors?.depart();
        },
        update: (dt: number) => {
            media.update(dt);
            screen?.update();
        },
        get waitingToStart() {
            return quest.state.completedCount === 0 && !cutscene.state;
        },
        get activeCamera() {
            return camera?.camera?.enabled ? camera.camera : playerCamera.camera!;
        },
        start: () => {
            if (destroyed || cutscene.state) return;
            buildStage();
            if (quest.state.completedCount === 0) {
                player.rigidbody!.teleport(...OPENING_SPAWN);
                player.rigidbody!.linearVelocity = new Vec3();
                player.rigidbody!.angularVelocity = new Vec3();
                framePlayerCamera(playerCamera, new Vec3(...OPENING_SPAWN));
            }
            media.start();
            cutscene.play(OPENING_CUTSCENE);
        },
        present,
        getSpeakerPosition: (out: Vec3) =>
            cutscene.state?.cutsceneId === OPENING_CUTSCENE.id &&
            !!actors?.getSpeakerPosition(cutscene.state.beat.speaker, out),
        setControlsEnabled: (enabled: boolean) => {
            if (actors) actors.paused = !enabled;
        }
    };
};
