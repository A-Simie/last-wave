import { Entity, Vec3 } from 'playcanvas';

import type { GameAssets } from '../core/AssetManager';
import { selectGuideDialogue } from '../data/dialogues';
import { GUIDE_INTERACTION, NPC_POSITION, PLAYER_SPAWN, SIGNAL_BOX } from '../data/foundation';
import { SIGNAL_BOX_NOTE } from '../data/items';
import { SIGNAL_CHECK_QUEST } from '../data/quests';
import { createCafeSurroundings } from '../episodes/episode-01/CafeSurroundings';
import { STARTER_BAG } from '../episodes/episode-01/opening';
import { createOpeningPrototype } from '../episodes/episode-01/OpeningPrototype';
import { createStreetLife } from '../episodes/episode-01/StreetLife';
import { createAnimatedCharacter } from '../player/AnimatedCharacter';
import { createCamera } from '../player/CameraController';
import { addCharacterCollision } from '../player/CharacterModel';
import { PlayerAnimation } from '../player/PlayerAnimation';
import { addPlayerController, setPlayerControlsEnabled } from '../player/PlayerController';
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
    opening: ReturnType<typeof createOpeningPrototype>;
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
        intensity: 2.5,
        castShadows: true,
        shadowDistance: 35,
        shadowResolution: 1024,
        shadowBias: 0.2,
        normalOffsetBias: 0.05
    });
    light.setEulerAngles(45, 30, 0);
    root.addChild(light);

    const dialogue = new DialogueSystem();
    const quest = new QuestSystem(SIGNAL_CHECK_QUEST);
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE, STARTER_BAG]);
    dialogue.onChoice = (selection) => quest.handle({ type: 'dialogue-choice', ...selection });
    root.once('destroy', () => {
        dialogue.destroy();
        quest.destroy();
        inventory.destroy();
    });
    if (snapshot && (!quest.restore(snapshot.quest) || !inventory.restore(snapshot.inventory))) {
        throw new Error('The foundation checkpoint could not be restored.');
    }
    const interactions = root.addComponent('script')!.create(InteractionSystem, {
        properties: {
            player,
            onInteract: (targetId) => {
                quest.handle({ type: 'interaction', targetId });
                if (targetId === SIGNAL_BOX.name) inventory.acquire(SIGNAL_BOX_NOTE.id);
            },
            targets: [
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
            ]
        } satisfies Partial<InteractionSystem>
    })!;

    const surroundings = createCafeSurroundings(root, interactions.app);
    const street = createStreetLife(surroundings, assets, player);
    const opening = createOpeningPrototype(
        root,
        player,
        model,
        camera,
        interactions,
        dialogue,
        inventory,
        assets,
        snapshot?.opening
    );
    const projection = new ScreenProjection();
    const anchor = new Vec3();

    return {
        interactions,
        dialogue,
        quest,
        inventory,
        opening,
        getScreenAnchors: () => ({
            speaker: opening.getSpeakerPosition(anchor) ? projection.project(opening.activeCamera, anchor) : null,
            interaction: interactions.getTargetPosition(anchor)
                ? projection.project(opening.activeCamera, anchor)
                : null
        }),
        setControlsEnabled: (enabled) => {
            setPlayerControlsEnabled(controller, enabled);
            animation.paused = !enabled;
            character.anim.playing = enabled;
            opening.setControlsEnabled(enabled);
            street.paused = !enabled && !opening.waitingToStart && !opening.cutscene.state;
        },
        getSnapshot: () => {
            const position = player.getPosition();
            return {
                sceneId: FOUNDATION_SCENE_ID,
                playerPosition: [position.x, position.y, position.z],
                quest: quest.snapshot,
                inventory: inventory.snapshot,
                opening: opening.quest.snapshot
            };
        }
    };
};
