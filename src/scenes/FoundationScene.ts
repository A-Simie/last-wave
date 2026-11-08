import { Entity, Vec3 } from 'playcanvas';

import type { GameAssets } from '../core/AssetManager';
import { selectGuideDialogue } from '../data/dialogues';
import { GUIDE_INTERACTION, NPC_POSITION, PLAYER_SPAWN, SIGNAL_BOX } from '../data/foundation';
import { SIGNAL_BOX_NOTE } from '../data/items';
import { SIGNAL_CHECK_QUEST } from '../data/quests';
import { BEACH_QUEST } from '../episodes/episode-01/beach';
import { createBeachArrival } from '../episodes/episode-01/BeachArrival';
import { createCafeSurroundings } from '../episodes/episode-01/CafeSurroundings';
import { BEACH_PASSES } from '../episodes/episode-01/entry';
import { OPENING_CUTSCENE, STARTER_BAG } from '../episodes/episode-01/opening';
import { createOpeningPrototype } from '../episodes/episode-01/OpeningPrototype';
import { createStreetEntry } from '../episodes/episode-01/StreetEntry';
import { StreetEntryProgress } from '../episodes/episode-01/StreetEntryProgress';
import { createStreetLife } from '../episodes/episode-01/StreetLife';
import { createAnimatedCharacter } from '../player/AnimatedCharacter';
import { createCamera } from '../player/CameraController';
import { addCharacterCollision } from '../player/CharacterModel';
import { ControlPractice } from '../player/ControlPractice';
import { PlayerAnimation } from '../player/PlayerAnimation';
import { addPlayerController, setPlayerControlsEnabled } from '../player/PlayerController';
import { CutsceneSystem } from '../systems/CutsceneSystem';
import type { CutsceneState } from '../systems/CutsceneSystem';
import { DialogueSystem } from '../systems/DialogueSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';

import { FOUNDATION_SCENE_ID, isFoundationSnapshot } from './FoundationState';
import type { FoundationSnapshot } from './FoundationState';
import { createMaterial as material, createStaticBox } from './primitives';
import { ScreenProjection } from './ScreenProjection';
import type { ScreenPoint } from './ScreenProjection';

export type FoundationScene = {
    interactions: InteractionSystem;
    dialogue: DialogueSystem;
    quest: QuestSystem;
    inventory: InventorySystem;
    area: FoundationSnapshot['area'];
    opening: ReturnType<typeof createOpeningPrototype> | null;
    beach: ReturnType<typeof createBeachArrival> | null;
    entry: StreetEntryProgress;
    cutscene: CutsceneSystem;
    present: (state: CutsceneState | null, steady: boolean) => void;
    update: (dt: number) => void;
    getNavigation: () => { label: string; distance: number } | null;
    setControlsEnabled: (enabled: boolean) => void;
    getSnapshot: () => FoundationSnapshot;
    getScreenAnchors: () => { speaker: ScreenPoint | null; interaction: ScreenPoint | null };
};

export const createFoundationScene = (
    root: Entity,
    assets: GameAssets,
    snapshot?: FoundationSnapshot
): FoundationScene => {
    if (snapshot && !isFoundationSnapshot(snapshot)) throw new Error('Invalid foundation checkpoint.');
    const area = snapshot?.area ?? 'tideline';

    const player = new Entity('player');
    root.addChild(player);
    player.setPosition(...(snapshot?.playerPosition ?? PLAYER_SPAWN));
    addCharacterCollision(player);
    player.addComponent('rigidbody', { type: 'dynamic', mass: 70, angularFactor: Vec3.ZERO });
    const character = createAnimatedCharacter(assets.characters.friendA, 'friendA', 'character');
    const model = character.root;
    model.setLocalPosition(0, -1, 0);
    player.addChild(model);

    const camera = createCamera(root, player.getPosition());
    const controller = addPlayerController(player, camera, model);
    const animation = model.addComponent('script')!.create(PlayerAnimation, { properties: { character } })!;

    const light = new Entity('sun');
    light.addComponent('light', {
        type: 'directional',
        intensity: area === 'beach-arrival' ? 1.7 : 2.5,
        castShadows: true,
        shadowDistance: 35,
        shadowResolution: 1024,
        shadowBias: 0.2,
        normalOffsetBias: 0.05
    });
    light.setEulerAngles(45, 30, 0);
    root.addChild(light);

    const dialogue = new DialogueSystem();
    const cutscene = new CutsceneSystem();
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const beachQuest = new QuestSystem(BEACH_QUEST);
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE, STARTER_BAG, BEACH_PASSES]);
    const entry = new StreetEntryProgress(inventory, snapshot?.entry);
    dialogue.onChoice = (selection) => {
        quest.handle({ type: 'dialogue-choice', ...selection });
        entry.choose(selection);
        if (area === 'beach-arrival') beachQuest.handle({ type: 'dialogue-choice', ...selection });
    };
    root.once('destroy', () => {
        dialogue.destroy();
        quest.destroy();
        beachQuest.destroy();
        inventory.destroy();
        entry.destroy();
        cutscene.destroy();
    });
    if (
        snapshot &&
        (!quest.restore(snapshot.quest) ||
            !inventory.restore(snapshot.inventory) ||
            !beachQuest.restore(snapshot.beach))
    ) {
        throw new Error('The foundation checkpoint could not be restored.');
    }
    const interactions = root.addComponent('script')!.create(InteractionSystem, {
        properties: {
            player,
            onInteract: (targetId) => {
                quest.handle({ type: 'interaction', targetId });
                if (targetId === SIGNAL_BOX.name) inventory.acquire(SIGNAL_BOX_NOTE.id);
            }
        } satisfies Partial<InteractionSystem>
    })!;
    let opening: FoundationScene['opening'] = null;
    let street: ReturnType<typeof createStreetLife> | null = null;
    let streetEntry: ReturnType<typeof createStreetEntry> | null = null;
    let beach: FoundationScene['beach'] = null;
    if (area === 'tideline') {
        const materials = {
            pants: material('pants', 0.18, 0.29, 0.52),
            signal: material('signal-box', 0.95, 0.62, 0.1)
        };
        root.once('destroy', () => Object.values(materials).forEach((entry) => entry.destroy()));
        const signalBox = createStaticBox(root, SIGNAL_BOX, materials.signal);
        const panel = new Entity('signal-panel');
        panel.setLocalPosition(0, 0.1, 0.46);
        panel.setLocalScale(0.65, 0.45, 0.03);
        panel.addComponent('render', { type: 'box', material: materials.pants });
        signalBox.addChild(panel);
        const npc = new Entity('npc-guide');
        root.addChild(npc);
        npc.setPosition(...NPC_POSITION);
        addCharacterCollision(npc);
        npc.addComponent('rigidbody', { type: 'static' });
        const guide = createAnimatedCharacter(assets.characters.friendB, 'friendB', 'guide-character');
        npc.addChild(guide.root);
        guide.root.setLocalPosition(0, -1, 0);
        interactions.targets = [
            {
                id: SIGNAL_BOX.name,
                label: SIGNAL_BOX.label,
                entity: signalBox,
                radius: SIGNAL_BOX.radius,
                action: { type: 'message', message: SIGNAL_BOX.message }
            },
            {
                id: npc.name,
                label: GUIDE_INTERACTION.label,
                entity: npc,
                radius: GUIDE_INTERACTION.radius,
                action: {
                    type: 'callback',
                    run: () => {
                        dialogue.open(selectGuideDialogue(quest.state));
                    }
                }
            }
        ];
        const surroundings = createCafeSurroundings(root, interactions.app);
        street = createStreetLife(surroundings, assets, player);
        opening = createOpeningPrototype(
            root,
            player,
            model,
            camera,
            interactions,
            dialogue,
            inventory,
            assets,
            cutscene,
            entry,
            snapshot?.opening
        );
        streetEntry = createStreetEntry(
            root,
            assets,
            player,
            character,
            opening.companion,
            street,
            interactions,
            dialogue,
            cutscene,
            entry,
            !!snapshot
        );
    } else {
        beach = createBeachArrival(root, interactions.app, assets, player, interactions, dialogue, beachQuest);
    }
    cutscene.onFinished = (id) => {
        opening?.finishCutscene(id);
        entry.finishCutscene(id);
    };
    const practice = player.script!.create(ControlPractice, {
        properties: { camera, onPractised: (control) => entry.practise(control) } satisfies Partial<ControlPractice>
    })!;
    const projection = new ScreenProjection();
    const anchor = new Vec3();
    const activeCamera = () =>
        streetEntry?.camera.camera?.enabled ? streetEntry.camera.camera : (opening?.activeCamera ?? camera.camera!);

    return {
        interactions,
        dialogue,
        quest,
        inventory,
        opening,
        beach,
        area,
        entry,
        cutscene,
        present: (state, steady) => {
            opening?.present(state?.cutsceneId === OPENING_CUTSCENE.id ? state : null, steady);
            streetEntry?.present(state, steady);
            camera.camera!.enabled =
                !streetEntry?.camera.camera?.enabled && (!opening || opening.activeCamera === camera.camera);
        },
        update: (dt) => {
            opening?.update(dt);
            streetEntry?.update();
            beach?.update(dt);
        },
        getNavigation: () => beach?.getNavigation() ?? streetEntry?.getNavigation() ?? null,
        getScreenAnchors: () => ({
            speaker:
                cutscene.state &&
                (cutscene.state.cutsceneId === OPENING_CUTSCENE.id
                    ? opening?.getSpeakerPosition(anchor)
                    : streetEntry?.getSpeakerPosition(cutscene.state.beat.speaker, anchor))
                    ? projection.project(activeCamera(), anchor)
                    : null,
            interaction: interactions.getTargetPosition(anchor) ? projection.project(activeCamera(), anchor) : null
        }),
        setControlsEnabled: (enabled) => {
            setPlayerControlsEnabled(controller, enabled);
            animation.paused = !enabled;
            character.anim.playing = enabled;
            opening?.setControlsEnabled(enabled);
            beach?.setControlsEnabled(enabled);
            streetEntry?.setControlsEnabled(enabled);
            if (street)
                street.paused =
                    !enabled && !opening?.waitingToStart && cutscene.state?.cutsceneId !== OPENING_CUTSCENE.id;
            const lesson = entry.lesson?.id;
            practice.setMode(enabled && (lesson === 'move' || lesson === 'look') ? lesson : null);
        },
        getSnapshot: () => {
            const position = player.getPosition();
            return {
                sceneId: FOUNDATION_SCENE_ID,
                area,
                playerPosition: [position.x, position.y, position.z],
                quest: quest.snapshot,
                inventory: inventory.snapshot,
                opening: opening?.quest.snapshot ?? snapshot!.opening,
                entry: entry.quest.snapshot,
                beach: beachQuest.snapshot
            };
        }
    };
};
