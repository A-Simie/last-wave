import audio from './beachAudio.json';

export type BeachAudioState = {
    readonly phase: 'idle' | 'loading' | 'playing' | 'blocked' | 'unavailable';
    readonly muted: boolean;
};

export class BeachAudio {
    onStateChange: ((state: BeachAudioState) => void) | null = null;
    private readonly sound = new Audio();
    private readonly events = new AbortController();
    private started = false;
    private paused = true;
    private frozen = false;
    private destroyed = false;
    private pending = false;
    private generation = 0;
    private watchdog: ReturnType<typeof setTimeout> | undefined;
    private readonly baseUrl: string;
    private phase: BeachAudioState['phase'] = 'idle';

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.sound.preload = 'none';
        this.sound.loop = true;
        this.sound.volume = 0.4;
        const options = { signal: this.events.signal };
        this.sound.addEventListener('error', () => this.fail('unavailable'), options);
        this.sound.addEventListener('waiting', () => this.watch(), options);
        this.sound.addEventListener('stalled', () => this.watch(), options);
        this.sound.addEventListener('playing', () => this.playing(), options);
        document.addEventListener('visibilitychange', () => this.sync(), options);
        window.addEventListener('blur', () => this.sync(), options);
        window.addEventListener('focus', () => this.sync(), options);
    }

    get state(): BeachAudioState {
        return { phase: this.phase, muted: this.sound.muted };
    }

    start() {
        if (this.destroyed) return;
        this.started = true;
        this.cancelPlay();
        if (this.sound.error || this.phase === 'unavailable') this.sound.load();
        this.phase = 'idle';
        this.sync();
    }

    setMuted(muted: boolean) {
        if (this.destroyed) return;
        this.sound.muted = muted;
        this.publish(this.phase);
    }

    setLevel(level: number) {
        if (!this.destroyed) this.sound.volume = Math.max(0, Math.min(1, level));
    }

    setPaused(paused: boolean) {
        if (this.destroyed || this.paused === paused) return;
        this.paused = paused;
        this.sync();
    }

    update(dt: number) {
        const frozen = dt <= 0;
        if (this.destroyed || this.frozen === frozen) return;
        this.frozen = frozen;
        this.sync();
    }

    private get suspended() {
        return this.paused || this.frozen || document.hidden || !document.hasFocus();
    }

    private publish(phase: BeachAudioState['phase']) {
        if (this.destroyed) return;
        this.phase = phase;
        this.onStateChange?.(this.state);
    }

    private cancelPlay() {
        this.generation++;
        this.pending = false;
        clearTimeout(this.watchdog);
        this.watchdog = undefined;
        this.sound.pause();
    }

    private fail(phase: 'blocked' | 'unavailable') {
        if (this.destroyed || !this.started) return;
        this.cancelPlay();
        this.publish(phase);
    }

    private playing() {
        if (this.destroyed || this.suspended || this.phase === 'blocked' || this.phase === 'unavailable') {
            this.sound.pause();
            return;
        }
        clearTimeout(this.watchdog);
        this.watchdog = undefined;
        this.publish('playing');
    }

    private watch() {
        if (
            this.destroyed ||
            !this.started ||
            this.suspended ||
            this.phase === 'blocked' ||
            this.phase === 'unavailable'
        )
            return;
        this.publish('loading');
        if (this.watchdog !== undefined) return;
        const generation = this.generation;
        this.watchdog = setTimeout(() => {
            this.watchdog = undefined;
            if (generation === this.generation) this.fail('unavailable');
        }, 8000);
    }

    private sync() {
        if (this.destroyed) return;
        if (this.suspended) {
            this.cancelPlay();
            return;
        }
        if (!this.started || this.pending || this.phase === 'blocked' || this.phase === 'unavailable') return;
        if (!this.sound.getAttribute('src')) this.sound.src = `${this.baseUrl}audio/${audio.file}`;
        if (!this.sound.paused) return;
        this.pending = true;
        const generation = this.generation;
        this.watch();
        void this.sound
            .play()
            .then(() => {
                if (this.destroyed || this.suspended) this.sound.pause();
                else if (generation === this.generation) this.playing();
            })
            .catch((error: unknown) => {
                if (this.destroyed || this.suspended || generation !== this.generation) return;
                this.fail(
                    error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'unavailable'
                );
            })
            .finally(() => {
                if (generation === this.generation) this.pending = false;
            });
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.events.abort();
        this.onStateChange = null;
        this.cancelPlay();
        this.sound.removeAttribute('src');
        this.sound.load();
    }
}
