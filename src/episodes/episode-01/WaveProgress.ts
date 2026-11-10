import type { Vector3Tuple } from '../../data/foundation.ts';

import { WAVE_BLACKOUT, WAVE_WARNING } from './wave.ts';
import { EVACUATION_GATES } from './waveLayout.ts';

export type WaveCheckpoint = 'before-wave' | 'after-blackout';
export type WavePhase =
    'calm' | 'warning' | 'evacuating' | 'separated' | 'falling' | 'blinking' | 'loading' | 'complete';
export type WaveState = { readonly phase: WavePhase; readonly elapsed: number; readonly gate: number };

export class WaveProgress {
    onStateChange: ((state: WaveState) => void) | null = null;
    private phase: WavePhase;
    private elapsed = 0;
    private gate = 0;
    private destroyed = false;

    constructor(checkpoint: WaveCheckpoint = 'before-wave') {
        if (checkpoint !== 'before-wave' && checkpoint !== 'after-blackout')
            throw new Error('Invalid wave checkpoint.');
        this.phase = checkpoint === 'after-blackout' ? 'complete' : 'calm';
    }

    get state(): WaveState {
        return { phase: this.phase, elapsed: this.elapsed, gate: this.gate };
    }

    get checkpoint(): WaveCheckpoint {
        return this.phase === 'loading' || this.phase === 'complete' ? 'after-blackout' : 'before-wave';
    }

    get running() {
        return this.phase === 'evacuating' || this.phase === 'separated';
    }

    start(discoveriesComplete: boolean): boolean {
        if (this.destroyed || !discoveriesComplete || this.phase !== 'calm') return false;
        this.enter('warning');
        return true;
    }

    finishCutscene(id: string): boolean {
        if (this.destroyed) return false;
        if (id === WAVE_WARNING.id && this.phase === 'warning') {
            this.enter('evacuating');
            return true;
        }
        if (id === WAVE_BLACKOUT.id && (this.phase === 'falling' || this.phase === 'blinking')) {
            this.enter('loading');
            return true;
        }
        return false;
    }

    beginBlink(): boolean {
        if (this.destroyed || this.phase !== 'falling') return false;
        this.enter('blinking');
        return true;
    }

    update(dt: number, position: Vector3Tuple) {
        if (this.destroyed || !Number.isFinite(dt) || dt <= 0 || this.phase === 'calm' || this.phase === 'complete')
            return;
        this.elapsed += Math.min(dt, 0.1);
        if (this.running) {
            const gate = EVACUATION_GATES[this.gate];
            if (
                position.every(Number.isFinite) &&
                Math.abs(position[0] - gate.position[0]) <= gate.halfWidth &&
                Math.abs(position[1] - gate.position[1]) < 1.5 &&
                Math.abs(position[2] - gate.position[2]) <= gate.halfDepth
            ) {
                this.gate++;
                if (this.gate === EVACUATION_GATES.length) this.enter('falling');
                else if (this.gate === 2) this.enter('separated');
                else this.onStateChange?.(this.state);
            }
        } else if (this.phase === 'falling' && this.elapsed >= 2.4) this.beginBlink();
        else if (this.phase === 'blinking' && this.elapsed >= 6.4) this.enter('loading');
        else if (this.phase === 'loading' && this.elapsed >= 1.2) this.enter('complete');
    }

    private enter(phase: WavePhase) {
        this.phase = phase;
        this.elapsed = 0;
        this.onStateChange?.(this.state);
    }

    destroy() {
        this.destroyed = true;
        this.onStateChange = null;
    }
}

export const eyelidClosure = (elapsed: number, steady: boolean) => {
    const t = Math.max(0, Math.min(6.4, elapsed));
    if (steady) return Math.min(1, t / 5.6);
    const keys = [
        [0, 0.15],
        [1.2, 1],
        [2.1, 0.38],
        [3.4, 1],
        [4.2, 0.7],
        [5.6, 1],
        [6.4, 1]
    ];
    const index = keys.findIndex(([time]) => time >= t);
    if (index <= 0) return keys[0][1];
    const [start, a] = keys[index - 1];
    const [end, b] = keys[index];
    const p = (t - start) / (end - start);
    return a + (b - a) * p * p * (3 - 2 * p);
};
