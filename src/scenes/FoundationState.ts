import {
    CHARACTER_COLLISION,
    GROUND,
    NPC_POSITION,
    SIGNAL_BOX,
    NEIGHBOR_BUILDINGS,
    STREET_PLANTERS
} from '../data/foundation.ts';
import type { BoxDefinition } from '../data/foundation.ts';
import { SIGNAL_BOX_NOTE } from '../data/items.ts';
import { SIGNAL_CHECK_QUEST } from '../data/quests.ts';
import { OPENING_QUEST, STARTER_BAG } from '../episodes/episode-01/opening.ts';
import { OPENING_SOLIDS } from '../episodes/episode-01/openingLayout.ts';
import { isInventorySnapshot } from '../systems/InventorySystem.ts';
import type { InventorySnapshot } from '../systems/InventorySystem.ts';
import { isQuestSnapshot } from '../systems/QuestSystem.ts';
import type { QuestSnapshot } from '../systems/QuestSystem.ts';

export const FOUNDATION_SCENE_ID = 'foundation';

export type FoundationSnapshot = {
    readonly sceneId: typeof FOUNDATION_SCENE_ID;
    readonly playerPosition: readonly [number, number, number];
    readonly quest: QuestSnapshot;
    readonly inventory: InventorySnapshot;
    readonly opening: QuestSnapshot;
};

const SOLIDS: readonly BoxDefinition[] = [
    GROUND,
    ...NEIGHBOR_BUILDINGS,
    ...STREET_PLANTERS,
    ...OPENING_SOLIDS,
    SIGNAL_BOX,
    {
        name: 'npc-guide',
        position: [NPC_POSITION[0], NPC_POSITION[1] + CHARACTER_COLLISION.offset[1], NPC_POSITION[2]],
        size: [
            CHARACTER_COLLISION.halfExtents[0] * 2,
            CHARACTER_COLLISION.halfExtents[1] * 2,
            CHARACTER_COLLISION.halfExtents[2] * 2
        ]
    }
];

const overlapsSolid = ([x, y, z]: readonly number[], box: BoxDefinition): boolean => {
    // Allow the small contact penetration produced by Ammo while standing against geometry.
    const tolerance = 0.05;
    const [hx, hy, hz] = CHARACTER_COLLISION.halfExtents;
    if (Math.abs(y + CHARACTER_COLLISION.offset[1] - box.position[1]) >= hy + box.size[1] / 2 - tolerance) {
        return false;
    }

    const angle = ((box.yaw ?? 0) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const absCos = Math.abs(cos);
    const absSin = Math.abs(sin);
    const dx = x - box.position[0];
    const dz = z - box.position[2];
    const bx = box.size[0] / 2;
    const bz = box.size[2] / 2;

    // Separating axes for the unrotated character box and an authored yaw-rotated solid.
    return (
        Math.abs(dx) < hx + bx * absCos + bz * absSin - tolerance &&
        Math.abs(dz) < hz + bx * absSin + bz * absCos - tolerance &&
        Math.abs(dx * cos - dz * sin) < bx + hx * absCos + hz * absSin - tolerance &&
        Math.abs(dx * sin + dz * cos) < bz + hx * absSin + hz * absCos - tolerance
    );
};

export const isFoundationPosition = (value: unknown): value is FoundationSnapshot['playerPosition'] => {
    if (
        !Array.isArray(value) ||
        value.length !== 3 ||
        !Array.from(value).every((n) => typeof n === 'number' && Number.isFinite(n))
    ) {
        return false;
    }
    const [x, y, z] = value;
    return (
        Math.abs(x - GROUND.position[0]) <= GROUND.size[0] / 2 - CHARACTER_COLLISION.halfExtents[0] &&
        Math.abs(z - GROUND.position[2]) <= GROUND.size[2] / 2 - CHARACTER_COLLISION.halfExtents[2] &&
        y >= 0.95 &&
        y <= 8 &&
        !SOLIDS.some((box) => overlapsSolid(value, box))
    );
};

export const isFoundationSnapshot = (value: unknown): value is FoundationSnapshot => {
    if (!value || typeof value !== 'object') return false;
    const snapshot = value as Partial<FoundationSnapshot>;
    if (
        snapshot.sceneId !== FOUNDATION_SCENE_ID ||
        !isFoundationPosition(snapshot.playerPosition) ||
        !isQuestSnapshot(snapshot.quest, SIGNAL_CHECK_QUEST) ||
        !isInventorySnapshot(snapshot.inventory, [SIGNAL_BOX_NOTE.id, STARTER_BAG.id]) ||
        !isQuestSnapshot(snapshot.opening, OPENING_QUEST)
    ) {
        return false;
    }

    // The clue may precede acceptance, but completing inspection always acquires it.
    if (
        snapshot.quest.completedObjectiveIds.includes('check-signal-box') &&
        !snapshot.inventory.itemIds.includes(SIGNAL_BOX_NOTE.id)
    )
        return false;
    const count = snapshot.opening.completedObjectiveIds.length;
    if (snapshot.inventory.itemIds.includes(STARTER_BAG.id) !== count >= 2) return false;
    return true;
};

export const copyFoundationSnapshot = (snapshot: FoundationSnapshot): FoundationSnapshot => ({
    sceneId: snapshot.sceneId,
    playerPosition: [...snapshot.playerPosition],
    quest: { questId: snapshot.quest.questId, completedObjectiveIds: [...snapshot.quest.completedObjectiveIds] },
    inventory: { itemIds: [...snapshot.inventory.itemIds] },
    opening: { questId: snapshot.opening.questId, completedObjectiveIds: [...snapshot.opening.completedObjectiveIds] }
});
