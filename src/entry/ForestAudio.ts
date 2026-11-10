import { FOREST_DURATION } from './ForestTimeline';

export type ForestAudioState = 'loading' | 'blocked' | 'playing' | 'muted' | 'failed';

export class ForestAudio {
    readonly ambience = new Audio(`${import.meta.env.BASE_URL}assets/forest/forest.wav`);
    readonly dialogue = new Audio(`${import.meta.env.BASE_URL}assets/forest/forest-story.mp3`);
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private sources: MediaElementAudioSourceNode[] = [];
    private generation = 0;
    private disposed = false;
    private paused = false;
    private settled = false;
    private wantsSound = false;
    private requestedTime = 0;
    private cancelPending: (() => void) | null = null;
    private readonly events = new AbortController();
    state: ForestAudioState = 'loading';
    onStateChange: ((state: ForestAudioState, message: string) => void) | null = null;

    constructor() {
        this.ambience.loop = true;
        this.ambience.id = 'forest-ambient-track';
        this.dialogue.id = 'forest-dialogue-track';
        this.ambience.hidden = this.dialogue.hidden = true;
        this.ambience.preload = this.dialogue.preload = 'auto';
        this.ambience.volume = 0.22;
        this.dialogue.volume = 0.95;
        this.dialogue.addEventListener(
            'loadedmetadata',
            () => {
                if (!this.disposed) this.dialogue.currentTime = this.requestedTime;
            },
            { signal: this.events.signal }
        );
        for (const media of [this.ambience, this.dialogue]) {
            media.addEventListener(
                'error',
                () => {
                    if (!this.disposed) this.fail('Intro audio could not load. Retry sound or watch muted.');
                },
                { signal: this.events.signal }
            );
        }
    }

    get enabled() {
        return this.state === 'playing';
    }
    get clock() {
        return this.dialogue.currentTime;
    }
    get waitingForSound() {
        return this.state === 'loading' || this.state === 'blocked';
    }

    private publish(state: ForestAudioState, message: string) {
        if (this.disposed) return;
        this.state = state;
        this.onStateChange?.(state, message);
    }

    private fail(message: string) {
        this.wantsSound = false;
        this.generation++;
        this.cancelPending?.();
        this.cancelPending = null;
        this.ambience.pause();
        this.dialogue.pause();
        this.publish('failed', message);
    }

    async start(time = this.requestedTime) {
        if (this.disposed) return;
        this.wantsSound = true;
        const token = ++this.generation;
        this.cancelPending?.();
        this.requestedTime = time;
        this.settled = time >= FOREST_DURATION;
        try {
            for (const media of [this.ambience, this.dialogue]) if (media.error) media.load();
            if (this.dialogue.readyState >= 1) this.dialogue.currentTime = time;
            if (navigator.userActivation?.isActive && !this.context) {
                this.context = new AudioContext();
                this.analyser = this.context.createAnalyser();
                this.analyser.fftSize = 512;
                for (const media of [this.ambience, this.dialogue]) {
                    const source = this.context.createMediaElementSource(media);
                    source.connect(this.analyser);
                    this.sources.push(source);
                }
                this.analyser.connect(this.context.destination);
            }
            const resume = this.context?.resume();
            const playback = Promise.all([
                resume,
                this.ambience.play(),
                ...(this.settled ? [] : [this.dialogue.play()])
            ]);
            let timer: ReturnType<typeof setTimeout> | undefined;
            const deadline = new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error('Audio loading timed out')), 10000);
                this.cancelPending = () => reject(new Error('Audio request retired'));
            });
            try {
                await Promise.race([playback, deadline]);
            } finally {
                clearTimeout(timer);
                if (token === this.generation) this.cancelPending = null;
            }
            if (this.disposed || token !== this.generation) return;
            if (this.paused) {
                this.ambience.pause();
                this.dialogue.pause();
            }
            this.publish('playing', 'Sound and voices on');
        } catch (error) {
            if (this.disposed || token !== this.generation) return;
            this.ambience.pause();
            this.dialogue.pause();
            if (error instanceof DOMException && error.name === 'NotAllowedError')
                this.publish('blocked', 'Tap to enable the intro sound and voices.');
            else this.fail('Intro audio could not start. Retry sound or watch muted.');
        }
    }

    toggle(time: number) {
        if (this.enabled) this.mute();
        else void this.start(time);
    }

    mute() {
        this.wantsSound = false;
        this.generation++;
        this.cancelPending?.();
        this.cancelPending = null;
        this.ambience.pause();
        this.dialogue.pause();
        void this.context?.suspend().catch(() => undefined);
        this.publish('muted', 'Watching muted. Enable sound for voices.');
    }

    seek(time: number) {
        this.requestedTime = time;
        this.settled = time >= FOREST_DURATION;
        if (this.dialogue.readyState >= 1) this.dialogue.currentTime = time;
        if (this.settled) this.dialogue.pause();
        else if (this.enabled && !this.paused) void this.start(time);
    }

    setPaused(paused: boolean) {
        if (this.disposed || paused === this.paused) return;
        this.paused = paused;
        if (paused) {
            this.generation++;
            this.cancelPending?.();
            this.cancelPending = null;
            this.ambience.pause();
            this.dialogue.pause();
            void this.context?.suspend().catch(() => undefined);
        } else if (this.wantsSound) void this.start(this.requestedTime);
    }

    update(time: number) {
        this.requestedTime = time;
        this.ambience.volume = time < 4 ? 0.08 + time * 0.035 : time >= 38 ? 0.27 : 0.16;
    }

    settle() {
        this.settled = true;
        this.requestedTime = FOREST_DURATION;
        this.dialogue.pause();
    }

    destroy() {
        this.disposed = true;
        this.generation++;
        this.cancelPending?.();
        this.cancelPending = null;
        this.onStateChange = null;
        this.events.abort();
        for (const media of [this.ambience, this.dialogue]) {
            media.pause();
            media.removeAttribute('src');
            media.load();
        }
        this.sources.forEach((source) => source.disconnect());
        this.analyser?.disconnect();
        void this.context?.close().catch(() => undefined);
    }
}
