import { Entity, Vec3 } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { CharacterModelId } from '../../data/characterModels';
import type { Vector3Tuple } from '../../data/foundation';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import { createCamera } from '../../player/CameraController';
import type { CompanionController } from '../../player/CompanionController';
import { createPreparedModel } from '../../scenes/createPreparedModel';
import { isFoundationPosition } from '../../scenes/FoundationState';
import { createBoxVisual as box, createMaterial } from '../../scenes/primitives';
import type { CutsceneState, CutsceneSystem } from '../../systems/CutsceneSystem';
import type { DialogueSystem } from '../../systems/DialogueSystem';
import type { InteractionSystem } from '../../systems/InteractionSystem';

import { createBeachEntrance } from './BeachEntrance';
import { OFFICER_CUTSCENE, QUEUE_CUTSCENE, TICKET_DIALOGUE, directionsDialogue, entryReply } from './entry';
import { EntryActors } from './EntryActors';
import { EntryCamera } from './EntryCamera';
import {
    ADMISSION_OFFICER_MARK,
    OFFICER_FRIEND_MARK,
    OFFICER_PLAYER_MARK,
    OFFICER_POSITION,
    QUEUE_FRIEND_MARK,
    QUEUE_MARK,
    STREET_FRIEND_ROUTE,
    TICKET_COUNTER
} from './entryLayout';
import type { StreetEntryProgress } from './StreetEntryProgress';
import type { StreetLife } from './StreetLife';

export const createStreetEntry = (
    parent: Entity,
    assets: GameAssets,
    player: Entity,
    playerCharacter: AnimatedCharacter,
    companion: CompanionController,
    street: StreetLife,
    interactions: InteractionSystem,
    dialogue: DialogueSystem,
    cutscene: CutsceneSystem,
    progress: StreetEntryProgress,
    restoring: boolean
) => {
    const root = createBeachEntrance(parent, interactions.app, assets.models);
    const npc = (id: CharacterModelId, name: string, position: Vector3Tuple, yaw = 0) => {
        const character = createAnimatedCharacter(assets.characters[id], id, name);
        root.addChild(character.root);
        let point = position;
        if (Math.hypot(player.getPosition().x - position[0], player.getPosition().z - position[2]) < 1.1) {
            const clear = [
                [1.5, 0],
                [-1.5, 0],
                [0, 1.5],
                [0, -1.5]
            ]
                .map(([x, z]): Vector3Tuple => [position[0] + x, position[1], position[2] + z])
                .find(
                    (candidate) =>
                        isFoundationPosition(candidate) &&
                        Math.hypot(player.getPosition().x - candidate[0], player.getPosition().z - candidate[2]) >= 1.1
                );
            if (!clear) throw new Error(`No clear placement for ${name}.`);
            point = clear;
        }
        character.root.setPosition(point[0], point[1] - 1, point[2]);
        character.root.setEulerAngles(0, yaw, 0);
        character.root.addComponent('collision', {
            type: 'capsule',
            radius: 0.28,
            height: 1.8,
            linearOffset: new Vec3(0, 0.9, 0)
        });
        character.root.addComponent('rigidbody', { type: 'kinematic' });
        return character;
    };
    const officer = npc(
        'commuterSuit',
        'beach-officer',
        progress.quest.state.completedCount === 7 ? ADMISSION_OFFICER_MARK : OFFICER_POSITION
    );
    const attendant = npc('barista', 'beach-ticket-attendant', [75.3, 1.04, -4.8]);
    const queue = (['patronLong', 'patronBuzz', 'patronShort'] as const).map((id, index) =>
        npc(id, `beach-queue-person-${index}`, [86.2, 1.04, -6 - index * 2.4], 180)
    );
    const navy = createMaterial('officer-cap-navy', 0.08, 0.14, 0.21);
    const gold = createMaterial('officer-badge-gold', 0.93, 0.67, 0.24);
    root.once('destroy', () => {
        navy.destroy();
        gold.destroy();
    });
    const cap = new Entity('beach-officer-cap');
    root.addChild(cap);
    const crown = new Entity('cap-crown');
    cap.addChild(crown);
    crown.addComponent('render', { type: 'cylinder', material: navy });
    crown.setLocalScale(0.26, 0.09, 0.26);
    box(cap, 'cap-visor', [0, -0.045, 0.12], [0.23, 0.026, 0.19], navy);
    box(cap, 'officer-cap-badge', [0, 0, 0.135], [0.055, 0.045, 0.013], gold);
    if (assets.models.police) {
        // The supplied uniformed officer replaces the suited rig's visuals. The hidden rig keeps the head anchor,
        // collision and speech position, so cutscenes and checkpoints are unchanged.
        officer.root.findComponents('render').forEach((render) => {
            render.enabled = false;
        });
        const uniform = createPreparedModel(assets.models.police, 'police', 'beach-officer-uniform', { height: 1.84 });
        officer.root.addChild(uniform.root);
        cap.enabled = false;
    }
    const head = officer.root.findByName('Head');
    if (!head) throw new Error('The beach officer has no head joint.');
    const actors = root.addComponent('script')!.create(EntryActors, {
        properties: { officer, attendant, queue, companion, cap, head, player: playerCharacter }
    })!;
    const camera = createCamera(root, player.getPosition());
    camera.name = 'beach-entry-camera';
    camera.camera!.enabled = false;
    const motion = camera.addComponent('script')!.create(EntryCamera)!;
    const marker = new Entity('beach-queue');
    root.addChild(marker);
    marker.setPosition(...QUEUE_MARK);
    const counter = root.findByName(TICKET_COUNTER.name) as Entity;
    let destroyed = false;
    root.once('destroy', () => {
        destroyed = true;
    });
    let phase = '';

    const syncProgress = (restore = false) => {
        const count = progress.quest.state.completedCount;
        const next = count < 3 ? 'cafe' : count < 5 ? 'street' : count === 5 ? 'booth' : 'queue';
        if (phase === next) return;
        phase = next;
        if (next === 'street') {
            if (restore) companion.follow(STREET_FRIEND_ROUTE, true);
            else companion.continueWith(STREET_FRIEND_ROUTE);
        } else if (next === 'booth') {
            companion.follow([OFFICER_FRIEND_MARK, [78.5, 1.04, 1.5], [78.5, 1.04, -1.5]], restore);
        } else if (next === 'queue') {
            companion.follow([[78.5, 1.04, -1.5], [82, 1.04, -1.6], QUEUE_FRIEND_MARK], restore);
        }
    };
    syncProgress(restoring);
    companion.obstacles = [
        ...street.walkers.map(({ character }) => character.root),
        officer.root,
        ...queue.map((character) => character.root)
    ];
    street.obstacles = [companion.entity];

    const stagePlayer = (point: Vector3Tuple) => {
        player.rigidbody!.teleport(...point);
        player.rigidbody!.linearVelocity = new Vec3();
        player.rigidbody!.angularVelocity = new Vec3();
    };
    const hint = (speaker: string, text?: string) =>
        dialogue.open(
            entryReply('e1-entry-reminder', speaker, text ?? progress.quest.state.objective?.text ?? 'Enjoy the beach.')
        );
    interactions.targets = [
        ...interactions.targets,
        ...street.walkers.map(({ character, model }, index) => ({
            id: `beach-directions-${index}`,
            label: 'Ask beach directions',
            entity: character.root,
            radius: 2.8,
            promptOffset: [0, 1.85, 0] as const,
            isAvailable: () => !destroyed && progress.quest.state.completedCount >= 3,
            action: {
                type: 'callback' as const,
                run: () => {
                    if (destroyed) return;
                    dialogue.open(
                        directionsDialogue(
                            model === 'commuterSuit' ? 'Suited commuter' : 'Seafront pedestrian',
                            character.root.getPosition().x,
                            character.root.getPosition().z
                        )
                    );
                }
            }
        })),
        {
            id: 'beach-officer',
            label: 'Talk to beach officer',
            entity: officer.root,
            radius: 3.1,
            promptOffset: [0, 1.9, 0],
            isAvailable: () => !destroyed && progress.quest.state.completedCount >= 3,
            action: {
                type: 'callback',
                run: () => {
                    if (destroyed) return;
                    if (progress.quest.state.completedCount !== 4) {
                        hint('Beach officer');
                        return;
                    }
                    stagePlayer(OFFICER_PLAYER_MARK);
                    companion.place(OFFICER_FRIEND_MARK, 125);
                    cutscene.play(OFFICER_CUTSCENE);
                }
            }
        },
        {
            id: 'beach-ticket-booth',
            label: 'Buy beach passes',
            entity: counter,
            radius: 2.6,
            promptOffset: [0, 1, 0],
            isAvailable: () => !destroyed && progress.quest.state.completedCount >= 3,
            action: {
                type: 'callback',
                run: () => {
                    if (destroyed) return;
                    const count = progress.quest.state.completedCount;
                    if (count === 5) dialogue.open(TICKET_DIALOGUE);
                    else
                        hint(
                            'Ticket attendant',
                            count >= 6
                                ? 'You have already paid. Both passes are in your bag. Join the marked queue on the right.'
                                : 'Speak to the beach officer first. They will explain admission and where to line up.'
                        );
                }
            }
        },
        {
            id: 'beach-queue',
            label: 'Join entrance queue',
            entity: marker,
            radius: 1.7,
            promptOffset: [0, 0.65, 0],
            isAvailable: () => !destroyed && progress.quest.state.completedCount >= 3,
            action: {
                type: 'callback',
                run: () => {
                    if (destroyed) return;
                    if (!progress.canQueue) {
                        hint(
                            'Beach officer',
                            'You need both day passes before joining the line. Speak to the officer, then visit the ticket booth on the left.'
                        );
                        return;
                    }
                    if (progress.quest.state.completedCount === 7) {
                        progress.requestArrival();
                        return;
                    }
                    stagePlayer(QUEUE_MARK);
                    companion.place(QUEUE_FRIEND_MARK, 180);
                    officer.root.rigidbody!.teleport(
                        ADMISSION_OFFICER_MARK[0],
                        ADMISSION_OFFICER_MARK[1] - 1,
                        ADMISSION_OFFICER_MARK[2]
                    );
                    cutscene.play(QUEUE_CUTSCENE);
                }
            }
        }
    ];
    return {
        camera,
        update: () => syncProgress(),
        present: (state: CutsceneState | null, steady: boolean) => {
            const active =
                state?.cutsceneId === OFFICER_CUTSCENE.id || state?.cutsceneId === QUEUE_CUTSCENE.id ? state : null;
            motion.present(active, steady);
            actors.present(active);
        },
        setControlsEnabled: (enabled: boolean) => {
            actors.paused = !enabled;
        },
        getSpeakerPosition: (speaker: string, out: Vec3) => {
            const head = (speaker === 'Friend' ? companion.character.root : officer.root).findByName('Head');
            if (!head) return false;
            out.copy(head.getPosition());
            out.y += 0.24;
            return true;
        },
        getNavigation: () => {
            const count = progress.quest.state.completedCount;
            if (count < 3) return null;
            const position = player.getPosition();
            let target = officer.root;
            let label = 'Beach arch · east past Lemon Market';
            if (count === 3) {
                target = street.walkers.reduce(
                    (nearest, walker) =>
                        walker.character.root.getPosition().distance(position) <
                        nearest.getPosition().distance(position)
                            ? walker.character.root
                            : nearest,
                    street.walkers[0].character.root
                );
                label = 'Pedestrian · ask directions';
            } else if (count === 5) {
                target = counter;
                label = 'Ticket booth · 2 passes / 10 credits';
            } else if (count >= 6) {
                target = marker;
                label = 'Entrance queue · both passes ready';
            }
            return { label, distance: Math.round(target.getPosition().distance(position)) };
        }
    };
};
