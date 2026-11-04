import { Color, Entity, StandardMaterial, Vec3 } from 'playcanvas';

import { selectGuideDialogue } from '../data/dialogues';
import {
    BLOCKS,
    GROUND,
    GUIDE_INTERACTION,
    NPC_POSITION,
    PINE_LAYERS,
    PLAYER_SPAWN,
    SIGNAL_BOX,
    TREES,
    WALLS,
    WOOD_PROPS
} from '../data/foundation';
import type { BoxDefinition } from '../data/foundation';
import { SIGNAL_BOX_NOTE } from '../data/items';
import { SIGNAL_CHECK_QUEST } from '../data/quests';
import { createCamera } from '../player/CameraController';
import { addCharacterCollision, createCharacterModel } from '../player/CharacterModel';
import { PlayerAnimation } from '../player/PlayerAnimation';
import { addPlayerController, setPlayerControlsEnabled } from '../player/PlayerController';
import { DialogueSystem } from '../systems/DialogueSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';

export type FoundationScene = {
    interactions: InteractionSystem;
    dialogue: DialogueSystem;
    quest: QuestSystem;
    inventory: InventorySystem;
    setControlsEnabled: (enabled: boolean) => void;
};

const material = (name: string, r: number, g: number, b: number) => {
    const result = new StandardMaterial();
    result.name = name;
    result.diffuse = new Color(r, g, b);
    result.update();
    return result;
};

const createStaticBox = (parent: Entity, definition: BoxDefinition, material: StandardMaterial) => {
    const { name, position, size, yaw = 0 } = definition;
    const entity = new Entity(name);
    parent.addChild(entity);
    entity.setPosition(...position);
    entity.setEulerAngles(0, yaw, 0);
    entity.addComponent('collision', {
        type: 'box',
        halfExtents: new Vec3(size[0] / 2, size[1] / 2, size[2] / 2)
    });
    entity.addComponent('rigidbody', { type: 'static' });

    const visual = new Entity(`${name}-visual`);
    visual.setLocalScale(...size);
    visual.addComponent('render', { type: 'box', material });
    entity.addChild(visual);
    return entity;
};

export const createFoundationScene = (root: Entity): FoundationScene => {
    const materials = {
        ground: material('ground', 0.2, 0.4, 0.18),
        block: material('obstacles', 0.34, 0.35, 0.3),
        wall: material('walls', 0.3, 0.36, 0.42),
        wood: material('wood', 0.34, 0.18, 0.08),
        leaves: material('leaves', 0.08, 0.3, 0.12),
        tips: material('pine-tips', 0.12, 0.4, 0.16),
        shirt: material('player-shirt', 0.15, 0.55, 0.9),
        skin: material('skin', 0.78, 0.53, 0.35),
        pants: material('pants', 0.18, 0.29, 0.52),
        npc: material('guide-shirt', 0.6, 0.27, 0.65),
        signal: material('signal-box', 0.95, 0.62, 0.1)
    };
    root.once('destroy', () => Object.values(materials).forEach((entry) => entry.destroy()));

    createStaticBox(root, GROUND, materials.ground);
    WALLS.forEach((box) => createStaticBox(root, box, materials.wall));
    BLOCKS.forEach((box) => createStaticBox(root, box, materials.block));
    WOOD_PROPS.forEach((box) => createStaticBox(root, box, materials.wood));

    for (const [i, { x, z, size }] of TREES.entries()) {
        const tree = createStaticBox(
            root,
            {
                name: `tree-${i}`,
                position: [x, size * 0.9, z],
                size: [size * 0.38, size * 1.8, size * 0.38]
            },
            materials.wood
        );
        for (const [j, { y, width, height }] of PINE_LAYERS.entries()) {
            const crown = new Entity(`tree-${i}-crown-${j}`);
            crown.setLocalPosition(0, size * (y - 0.9), 0);
            tree.addChild(crown);
            // Foliage blocks camera rays but remains passable to the player.
            crown.addComponent('collision', { type: 'cone', radius: (size * width) / 2, height: size * height });
            const visual = new Entity('foliage');
            visual.setLocalScale(size * width, size * height, size * width);
            visual.addComponent('render', { type: 'cone', material: j === 1 ? materials.tips : materials.leaves });
            crown.addChild(visual);
        }
    }

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
    npc.addChild(createCharacterModel(materials.npc, materials.skin, materials.pants));

    const player = new Entity('player');
    root.addChild(player);
    player.setPosition(...PLAYER_SPAWN);
    addCharacterCollision(player);
    player.addComponent('rigidbody', { type: 'dynamic', mass: 70, angularFactor: Vec3.ZERO });
    const model = createCharacterModel(materials.shirt, materials.skin, materials.pants);
    player.addChild(model);

    const camera = createCamera(root);
    const controller = addPlayerController(player, camera, model);
    model.addComponent('script')!.create(PlayerAnimation);

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
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
    dialogue.onChoice = (selection) => quest.handle({ type: 'dialogue-choice', ...selection });
    root.once('destroy', () => {
        dialogue.destroy();
        quest.destroy();
        inventory.destroy();
    });
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

    return {
        interactions,
        dialogue,
        quest,
        inventory,
        setControlsEnabled: (enabled) => setPlayerControlsEnabled(controller, enabled)
    };
};
