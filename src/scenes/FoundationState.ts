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
import { BEACH_QUEST } from '../episodes/episode-01/beach.ts';
import { BEACH_SOLIDS } from '../episodes/episode-01/beachLayout.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../episodes/episode-01/entry.ts';
import {
    BEACH_ARRIVAL_GROUND,
    BEACH_ARRIVAL_SOLIDS,
    BEACH_ARRIVAL_SPAWN,
    ENTRY_SOLIDS
} from '../episodes/episode-01/entryLayout.ts';
import { OPENING_QUEST, STARTER_BAG } from '../episodes/episode-01/opening.ts';
import { OPENING_SOLIDS } from '../episodes/episode-01/openingLayout.ts';
import { isInventorySnapshot } from '../systems/InventorySystem.ts';
import type { InventorySnapshot } from '../systems/InventorySystem.ts';
import { isQuestSnapshot } from '../systems/QuestSystem.ts';
import type { QuestSnapshot } from '../systems/QuestSystem.ts';

export const FOUNDATION_SCENE_ID = 'foundation';

export type FoundationSnapshot = {
    readonly sceneId: typeof FOUNDATION_SCENE_ID;
    readonly area: 'tideline' | 'beach-arrival';
    readonly playerPosition: readonly [number, number, number];
    readonly quest: QuestSnapshot;
    readonly inventory: InventorySnapshot;
    readonly opening: QuestSnapshot;
    readonly entry: QuestSnapshot;
    readonly beach: QuestSnapshot;
};

const LEGACY_SOLIDS: readonly BoxDefinition[] = [
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
const SOLIDS = [...LEGACY_SOLIDS, ...ENTRY_SOLIDS];

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

const isAreaPosition = (
    value: unknown,
    ground: BoxDefinition,
    solids: readonly BoxDefinition[]
): value is FoundationSnapshot['playerPosition'] => {
    if (
        !Array.isArray(value) ||
        value.length !== 3 ||
        !Array.from(value).every((n) => typeof n === 'number' && Number.isFinite(n))
    ) {
        return false;
    }
    const [x, y, z] = value;
    return (
        Math.abs(x - ground.position[0]) <= ground.size[0] / 2 - CHARACTER_COLLISION.halfExtents[0] &&
        Math.abs(z - ground.position[2]) <= ground.size[2] / 2 - CHARACTER_COLLISION.halfExtents[2] &&
        y >= 0.95 &&
        y <= 8 &&
        !solids.some((box) => overlapsSolid(value, box))
    );
};

export const isFoundationPosition = (value: unknown): value is FoundationSnapshot['playerPosition'] =>
    isAreaPosition(value, GROUND, SOLIDS);
export const isLegacyFoundationPosition = (value: unknown): value is FoundationSnapshot['playerPosition'] =>
    isAreaPosition(value, GROUND, LEGACY_SOLIDS);
export const isBeachArrivalPosition = (value: unknown): value is FoundationSnapshot['playerPosition'] =>
    isAreaPosition(value, BEACH_ARRIVAL_GROUND, BEACH_SOLIDS);
export const isLegacyBeachArrivalPosition = (value: unknown): value is FoundationSnapshot['playerPosition'] =>
    isAreaPosition(value, BEACH_ARRIVAL_GROUND, BEACH_ARRIVAL_SOLIDS);

export const isFoundationSnapshot = (value: unknown): value is FoundationSnapshot => {
    if (!value || typeof value !== 'object') return false;
    const snapshot = value as Partial<FoundationSnapshot>;
    if (
        snapshot.sceneId !== FOUNDATION_SCENE_ID ||
        !(snapshot.area === 'tideline'
            ? isFoundationPosition(snapshot.playerPosition)
            : snapshot.area === 'beach-arrival' && isBeachArrivalPosition(snapshot.playerPosition)) ||
        !isQuestSnapshot(snapshot.quest, SIGNAL_CHECK_QUEST) ||
        !isInventorySnapshot(snapshot.inventory, [SIGNAL_BOX_NOTE.id, STARTER_BAG.id, BEACH_PASSES.id]) ||
        !isQuestSnapshot(snapshot.opening, OPENING_QUEST) ||
        !isQuestSnapshot(snapshot.entry, ENTRY_QUEST) ||
        !isQuestSnapshot(snapshot.beach, BEACH_QUEST)
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
    const entryCount = snapshot.entry.completedObjectiveIds.length;
    if (count < 2 && entryCount !== 0) return false;
    if ((count === 3) !== entryCount >= 3) return false;
    if (snapshot.inventory.itemIds.includes(BEACH_PASSES.id) !== entryCount >= 6) return false;
    if ((snapshot.area === 'beach-arrival') !== (entryCount === ENTRY_QUEST.objectives.length)) return false;
    if (snapshot.area !== 'beach-arrival' && snapshot.beach.completedObjectiveIds.length !== 0) return false;
    return true;
};

export const copyFoundationSnapshot = (snapshot: FoundationSnapshot): FoundationSnapshot => ({
    sceneId: snapshot.sceneId,
    area: snapshot.area,
    playerPosition: [...snapshot.playerPosition],
    quest: { questId: snapshot.quest.questId, completedObjectiveIds: [...snapshot.quest.completedObjectiveIds] },
    inventory: { itemIds: [...snapshot.inventory.itemIds] },
    opening: { questId: snapshot.opening.questId, completedObjectiveIds: [...snapshot.opening.completedObjectiveIds] },
    entry: { questId: snapshot.entry.questId, completedObjectiveIds: [...snapshot.entry.completedObjectiveIds] },
    beach: { questId: snapshot.beach.questId, completedObjectiveIds: [...snapshot.beach.completedObjectiveIds] }
});

export const createBeachArrivalSnapshot = (current: FoundationSnapshot): FoundationSnapshot => {
    if (
        !isFoundationSnapshot(current) ||
        current.area !== 'tideline' ||
        current.entry.completedObjectiveIds.length !== 7
    ) {
        throw new Error('Beach admission is not ready.');
    }
    const candidate: FoundationSnapshot = {
        ...copyFoundationSnapshot(current),
        area: 'beach-arrival',
        playerPosition: [...BEACH_ARRIVAL_SPAWN],
        entry: { questId: ENTRY_QUEST.id, completedObjectiveIds: ENTRY_QUEST.objectives.map(({ id }) => id) }
    };
    if (!isFoundationSnapshot(candidate)) throw new Error('The beach arrival is not safe.');
    return candidate;
};
