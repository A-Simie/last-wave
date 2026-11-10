import type { BeachAudioState } from './BeachAudio';
import type { WaveState } from './WaveProgress';

type SoundGraph = {
    context: AudioContext;
    master: GainNode;
    filter: BiquadFilterNode;
    rumble: GainNode;
    wind: GainNode;
    whistle: GainNode;
    pulse: GainNode;
    sources: (AudioBufferSourceNode | OscillatorNode)[];
};

export class WaveAudio {
    onStateChange: ((state: BeachAudioState) => void) | null = null;
    private graph: SoundGraph | null = null;
    private readonly events = new AbortController();
    private phase: BeachAudioState['phase'] = 'idle';
    private muted = false;
    private paused = true;
    private frozen = false;
    private destroyed = false;
    private generation = 0;
    private pending = false;
    private watchdog: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        const options = { signal: this.events.signal };
        document.addEventListener('visibilitychange', () => this.sync(), options);
        window.addEventListener('blur', () => this.sync(), options);
        window.addEventListener('focus', () => this.sync(), options);
    }

    get state(): BeachAudioState {
        return { phase: this.phase, muted: this.muted };
    }

    start() {
        if (this.destroyed) return;
        try {
            this.graph ??= this.createGraph();
            this.phase = 'idle';
            this.sync();
        } catch {
            this.publish('unavailable');
        }
    }

    private createGraph(): SoundGraph {
        const context = new AudioContext();
        try {
            const master = context.createGain();
            master.gain.value = 0;
            const filter = context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 3800;
            filter.connect(master).connect(context.destination);
            const noise = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
            const samples = noise.getChannelData(0);
            let seed = 17018;
            for (let i = 0; i < samples.length; i++) {
                seed = (seed * 1664525 + 1013904223) >>> 0;
                samples[i] = seed / 2147483648 - 1;
            }
            const sources: SoundGraph['sources'] = [];
            const noiseBand = (frequency: number, type: BiquadFilterType) => {
                const source = context.createBufferSource();
                source.buffer = noise;
                source.loop = true;
                const band = context.createBiquadFilter();
                band.type = type;
                band.frequency.value = frequency;
                const gain = context.createGain();
                gain.gain.value = 0;
                source.connect(band).connect(gain).connect(filter);
                source.start();
                sources.push(source);
                return gain;
            };
            const tone = (frequency: number) => {
                const source = context.createOscillator();
                source.frequency.value = frequency;
                const gain = context.createGain();
                gain.gain.value = 0;
                source.connect(gain).connect(filter);
                source.start();
                sources.push(source);
                return gain;
            };
            return {
                context,
                master,
                filter,
                rumble: noiseBand(190, 'lowpass'),
                wind: noiseBand(950, 'bandpass'),
                whistle: tone(1650),
                pulse: tone(57),
                sources
            };
        } catch (error) {
            void context.close();
            throw error;
        }
    }

    setMuted(muted: boolean) {
        if (this.destroyed) return;
        this.muted = muted;
        if (this.graph) this.graph.master.gain.value = muted ? 0 : 0.65;
        this.publish(this.phase);
    }

    setPaused(paused: boolean) {
        if (this.destroyed || this.paused === paused) return;
        this.paused = paused;
        this.sync();
    }

    update(dt: number, state: WaveState, beat: string, beatTime: number) {
        const frozen = dt <= 0;
        if (frozen !== this.frozen) {
            this.frozen = frozen;
            this.sync();
        }
        const graph = this.graph;
        if (!graph || this.destroyed || this.suspended) return;
        const { phase, elapsed } = state;
        const warning = phase === 'warning';
        const falling = phase === 'falling' || phase === 'blinking';
        const silent = phase === 'loading' || phase === 'complete' || phase === 'calm';
        const strength = warning
            ? beat === 'retreat'
                ? 0.14
                : beat === 'birds'
                  ? 0.3
                  : beat === 'crowd'
                    ? 0.55
                    : 0.82
            : 1;
        graph.master.gain.value = this.muted || silent ? 0 : 0.65;
        graph.rumble.gain.value = strength * (falling ? 0.28 : 0.75);
        graph.wind.gain.value = strength * (falling ? 0.035 : 0.2);
        graph.filter.frequency.value = falling ? 230 : 3800;
        graph.whistle.gain.value = warning && beat === 'crowd' && beatTime < 1.8 && beatTime % 0.8 < 0.4 ? 0.06 : 0;
        const heartbeat =
            Math.exp(-((elapsed % 1.1) / 0.085)) + 0.55 * Math.exp(-Math.abs((elapsed % 1.1) - 0.24) / 0.055);
        graph.pulse.gain.value = falling ? heartbeat * 0.1 : strength * 0.023;
    }

    private get suspended() {
        return this.paused || this.frozen || document.hidden || !document.hasFocus();
    }

    private publish(phase: BeachAudioState['phase']) {
        if (this.destroyed) return;
        this.phase = phase;
        this.onStateChange?.(this.state);
    }

    private sync() {
        const graph = this.graph;
        if (!graph || this.destroyed) return;
        if (this.suspended) {
            this.generation++;
            this.pending = false;
            clearTimeout(this.watchdog);
            void graph.context.suspend().catch(() => this.publish('unavailable'));
            return;
        }
        if (this.pending || this.phase === 'blocked' || this.phase === 'unavailable') return;
        if (graph.context.state === 'running') {
            this.publish('playing');
            return;
        }
        this.pending = true;
        const generation = ++this.generation;
        this.publish('loading');
        this.watchdog = setTimeout(() => {
            if (this.destroyed || generation !== this.generation) return;
            this.generation++;
            this.pending = false;
            void graph.context.suspend().catch(() => this.publish('unavailable'));
            this.publish('blocked');
        }, 8000);
        void graph.context
            .resume()
            .then(() => {
                if (this.destroyed) return;
                if (this.suspended || this.phase === 'blocked')
                    void graph.context.suspend().catch(() => this.publish('unavailable'));
                else if (generation === this.generation) this.publish('playing');
            })
            .catch(() => {
                if (!this.destroyed && generation === this.generation) this.publish('blocked');
            })
            .finally(() => {
                if (generation !== this.generation) return;
                clearTimeout(this.watchdog);
                this.pending = false;
            });
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.generation++;
        clearTimeout(this.watchdog);
        this.events.abort();
        this.onStateChange = null;
        if (this.graph) {
            this.graph.master.gain.value = 0;
            this.graph.sources.forEach((source) => {
                source.stop();
                source.disconnect();
            });
            void this.graph.context.close().catch(() => undefined);
            this.graph = null;
        }
    }
}
