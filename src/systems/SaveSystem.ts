import { OPENING_QUEST } from '../episodes/episode-01/opening.ts';
import { FOUNDATION_SCENE_ID, copyFoundationSnapshot, isFoundationSnapshot } from '../scenes/FoundationState.ts';
import type { FoundationSnapshot } from '../scenes/FoundationState.ts';

export const SAVE_STORAGE_KEY = 'last-wave.checkpoint';
export const SAVE_VERSION = 2;

export type SaveState = {
    readonly version: typeof SAVE_VERSION;
    readonly savedAt: number;
    readonly state: FoundationSnapshot;
};

export type SaveResult =
    | { readonly status: 'ready'; readonly save: SaveState }
    | { readonly status: 'missing' | 'invalid' | 'incompatible' | 'unavailable' };

type CheckpointStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const validateSaveState = (value: unknown): SaveResult => {
    if (!value || typeof value !== 'object') return { status: 'invalid' };
    const save = value as Partial<Omit<SaveState, 'version'>> & { version?: number };
    if (!Number.isInteger(save.version) || Number(save.version) < 1) return { status: 'invalid' };
    if (save.version !== 1 && save.version !== SAVE_VERSION) return { status: 'incompatible' };
    if (typeof save.state?.sceneId === 'string' && save.state.sceneId !== FOUNDATION_SCENE_ID) {
        return { status: 'incompatible' };
    }
    const state =
        save.version === 1 && save.state && typeof save.state === 'object'
            ? { ...save.state, opening: { questId: OPENING_QUEST.id, completedObjectiveIds: [] } }
            : save.state;
    if (
        typeof save.savedAt !== 'number' ||
        !Number.isSafeInteger(save.savedAt) ||
        save.savedAt < 0 ||
        save.savedAt > 8.64e15 ||
        !isFoundationSnapshot(state)
    ) {
        return { status: 'invalid' };
    }
    return {
        status: 'ready',
        save: { version: SAVE_VERSION, savedAt: save.savedAt, state: copyFoundationSnapshot(state) }
    };
};

export class SaveSystem {
    private readonly getStorage: () => CheckpointStorage;
    private readonly now: () => number;

    constructor(getStorage: () => CheckpointStorage, now: () => number = Date.now) {
        this.getStorage = getStorage;
        this.now = now;
    }

    load(): SaveResult {
        let raw: string | null;
        try {
            raw = this.getStorage().getItem(SAVE_STORAGE_KEY);
        } catch {
            return { status: 'unavailable' };
        }
        if (raw === null) return { status: 'missing' };
        if (raw.length > 16_384) return { status: 'invalid' };
        try {
            return validateSaveState(JSON.parse(raw));
        } catch {
            return { status: 'invalid' };
        }
    }

    save(state: FoundationSnapshot): SaveResult {
        const result = validateSaveState({ version: SAVE_VERSION, savedAt: this.now(), state });
        if (result.status !== 'ready') return result;
        try {
            this.getStorage().setItem(SAVE_STORAGE_KEY, JSON.stringify(result.save));
            return result;
        } catch {
            return { status: 'unavailable' };
        }
    }

    clear(): boolean {
        try {
            this.getStorage().removeItem(SAVE_STORAGE_KEY);
            return true;
        } catch {
            return false;
        }
    }
}
