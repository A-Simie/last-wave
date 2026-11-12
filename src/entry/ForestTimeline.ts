import { FOREST_SPEECH } from './forestDialogue.ts';

export const FOREST_DURATION = 44;
export const FOREST_SEEN_KEY = 'last-wave.forest-seen.v2';
export const FOREST_PHASES = [
    { id: 'darkness', start: 0, end: 4 },
    { id: 'figures', start: 4, end: 18.6 },
    { id: 'eyes', start: 18.6, end: 24 },
    { id: 'bats', start: 24, end: 32 },
    { id: 'reveal', start: 32, end: 38 },
    { id: 'board', start: 38, end: FOREST_DURATION }
] as const;

const ATMOSPHERE = [
    { start: 22.3, end: 23.5, text: '[A branch snaps overhead]' },
    { start: 38, end: 40, text: '[A distant rumble. Chains creak.]' }
];

export class ForestTimeline {
    private elapsed = 0;
    private disposed = false;

    constructor(immediate = false) {
        if (immediate) this.elapsed = FOREST_DURATION;
    }

    get state() {
        const time = this.elapsed;
        return {
            time,
            phase: FOREST_PHASES.find(({ end }) => time < end)?.id ?? 'ready',
            ready: time === FOREST_DURATION,
            caption:
                [...FOREST_SPEECH, ...ATMOSPHERE].find(({ start, end }) => time >= start && time < end)?.text ?? '',
            board: Math.max(0, Math.min(1, (time - 38) / 6))
        };
    }

    update(dt: number) {
        if (this.disposed || !Number.isFinite(dt) || dt <= 0) return;
        this.elapsed = Math.min(FOREST_DURATION, this.elapsed + dt);
    }

    skip() {
        if (!this.disposed) this.elapsed = FOREST_DURATION;
    }

    seek(time: number) {
        if (!this.disposed && Number.isFinite(time)) this.elapsed = Math.max(0, Math.min(FOREST_DURATION, time));
    }

    replay() {
        if (!this.disposed) this.elapsed = 0;
    }

    destroy() {
        this.disposed = true;
    }
}

export const hasSeenForest = (storage: () => Pick<Storage, 'getItem'>) => {
    try {
        return storage().getItem(FOREST_SEEN_KEY) === 'seen';
    } catch {
        return false;
    }
};

export const rememberForest = (storage: () => Pick<Storage, 'setItem'>) => {
    try {
        storage().setItem(FOREST_SEEN_KEY, 'seen');
    } catch {
        // Presentation preferences must never block entry or touch the checkpoint slot.
    }
};

/** Non-sensitive presentation preference: `always` skips the intro on every load until cleared. */
export const INTRO_SKIP_KEY = 'last-wave.intro-skip.v1';

export const prefersSkippingIntro = (storage: () => Pick<Storage, 'getItem'>) => {
    try {
        return storage().getItem(INTRO_SKIP_KEY) === 'always';
    } catch {
        return false;
    }
};

export const rememberIntroSkip = (storage: () => Pick<Storage, 'setItem' | 'removeItem'>, always: boolean) => {
    try {
        if (always) storage().setItem(INTRO_SKIP_KEY, 'always');
        else storage().removeItem(INTRO_SKIP_KEY);
        return true;
    } catch {
        // Blocked storage only means the choice lasts for this visit.
        return false;
    }
};
