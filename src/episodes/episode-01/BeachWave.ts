import { Entity, Script, Vec3 } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import type { AnimatedCharacter } from '../../player/AnimatedCharacter';
import type { CompanionController } from '../../player/CompanionController';
import type { CutsceneState, CutsceneSystem } from '../../systems/CutsceneSystem';
import type { QuestSystem } from '../../systems/QuestSystem';

import type { BeachAudio } from './BeachAudio';
import type { createBeachDressing } from './BeachDressing';
import type { BeachLife } from './BeachLife';
import type { createBeachWater } from './BeachWater';
import { BEACH_SHORE_Z } from './entryLayout';
import { createEvacuationRoute } from './EvacuationRoute';
import { WAVE_BLACKOUT, WAVE_WARNING } from './wave';
import { WaveAudio } from './WaveAudio';
import { createWaveBirds } from './WaveBirds';
import { createWaveCamera } from './WaveCamera';
import { WaveCrowd } from './WaveCrowd';
import { EVACUATION_GATES, WAVE_FRIEND_MARK, WAVE_PLAYER_MARK, evacuationHeight } from './waveLayout';
import { WaveProgress } from './WaveProgress';
import type { WaveCheckpoint, WaveState } from './WaveProgress';
import { createWaveSurge } from './WaveSurge';

export class BeachWave extends Script {
    static scriptName = 'beachWave';
    onStateChange: ((state: WaveState) => void) | null = null;
    player!: Entity;
    character!: AnimatedCharacter;
    companion!: CompanionController;
    quest!: QuestSystem;
    cutscene!: CutsceneSystem;
    progress!: WaveProgress;
    audio!: WaveAudio;
    ambient!: BeachAudio;
    dressing!: ReturnType<typeof createBeachDressing>;
    water!: ReturnType<typeof createBeachWater>;
    route!: ReturnType<typeof createEvacuationRoute>;
    surge!: ReturnType<typeof createWaveSurge>;
    birds!: ReturnType<typeof createWaveBirds>;
    motion!: ReturnType<typeof createWaveCamera>;
    crowd!: WaveCrowd;
    private suspended = true;
    private steady = false;
    private beat = '';
    private beatTime = 0;
    private previous = 'calm';
    private readonly direction = new Vec3();

    initialize() {
        this.progress.onStateChange = (state) => {
            this.changePhase(state);
            this.onStateChange?.(state);
        };
    }

    get camera() {
        return this.motion.camera;
    }
    get calm() {
        return this.progress.state.phase === 'calm';
    }
    get blocksControls() {
        return !this.calm && !this.progress.running;
    }

    start(): boolean {
        if (this.cutscene.state || !this.progress.start(this.quest.state.status === 'completed')) return false;
        this.cutscene.play(WAVE_WARNING);
        this.audio.start();
        return true;
    }

    private stagePlayer(position: readonly [number, number, number], frozen: boolean) {
        const body = this.player.rigidbody!;
        body.teleport(...position);
        body.linearVelocity = new Vec3();
        body.angularVelocity = new Vec3();
        body.enabled = !frozen;
    }

    private changePhase(state: WaveState) {
        if (state.phase === this.previous) return;
        this.previous = state.phase;
        if (state.phase === 'warning') {
            this.stagePlayer(WAVE_PLAYER_MARK, true);
            this.character.root.setLocalEulerAngles(0, 180, 0);
            this.character.play('idle', 0);
            this.companion.place(WAVE_FRIEND_MARK, 180);
            this.companion.present(null);
            this.companion.paused = true;
            this.crowd.watch();
        } else if (state.phase === 'evacuating') {
            this.stagePlayer(WAVE_PLAYER_MARK, false);
            this.dressing.openEvacuation();
            this.crowd.evacuate();
            this.companion.character.play('sprint', 0.15);
        } else if (state.phase === 'separated') {
            this.companion.character.play('talk');
        } else if (state.phase === 'falling') {
            this.stagePlayer([0, evacuationHeight(24) + 1.04, 24], true);
            this.character.root.setLocalPosition(0, -1, 0);
            this.character.root.setLocalEulerAngles(-14, 0, 0);
            this.character.anim.speed = 1;
            this.character.play('fall', 0.05);
            this.cutscene.play(WAVE_BLACKOUT);
        } else if (state.phase === 'blinking') {
            this.character.root.enabled = false;
            if (this.cutscene.state?.beat.id === 'fall') this.cutscene.advance(WAVE_BLACKOUT.id, 'fall');
        } else if (state.phase === 'loading') {
            this.cutscene.cancel();
        }
        this.setPaused(this.suspended);
    }

    present(state: CutsceneState | null, steady: boolean) {
        this.steady = steady;
        const beat =
            state?.cutsceneId === WAVE_WARNING.id || state?.cutsceneId === WAVE_BLACKOUT.id ? state.beat.id : '';
        if (beat !== this.beat) {
            this.beat = beat;
            this.beatTime = 0;
        }
        if (beat === 'crowd' || beat === 'wave') this.crowd.point();
        if (beat === 'blink') this.progress.beginBlink();
        this.motion.update(0, this.progress.state, beat, steady);
    }

    setPaused(paused: boolean) {
        this.suspended = paused;
        const phase = this.progress.state.phase;
        const ended = phase === 'loading' || phase === 'complete';
        if (this.progress.running) this.player.rigidbody!.enabled = !paused;
        this.audio.setPaused(paused || this.calm || ended);
        this.motion.setPaused(paused || ended);
        if (this.calm) return;
        this.crowd.setPaused(paused || ended);
        this.companion.character.anim.playing = !paused && !ended;
        if (!this.progress.running) this.character.anim.playing = !paused && !ended;
    }

    update(dt: number) {
        this.audio.update(dt, this.progress.state, this.beat, this.beatTime);
        if (this.suspended || dt <= 0 || this.progress.state.phase === 'complete') return;
        const step = Math.min(dt, 0.1);
        this.birds.update(step, !this.calm && this.beat !== 'retreat');
        if (this.calm) return;
        this.beatTime += step;
        this.ambient.setLevel(
            this.progress.state.phase === 'warning' ? Math.max(0.04, 0.4 - this.progress.state.elapsed * 0.065) : 0.025
        );
        const p = this.player.getPosition();
        this.progress.update(step, [p.x, p.y, p.z]);
        const state = this.progress.state;
        this.motion.update(step, state, this.beat, this.steady);
        if (state.phase === 'loading' || state.phase === 'complete') return;
        this.water.update(step, state.phase === 'warning' ? 16 : 11);
        const revealed = state.phase !== 'warning' || this.beat === 'wave';
        this.surge.update(
            step,
            revealed ? 13 : 0,
            state.phase === 'warning'
                ? BEACH_SHORE_Z - 16
                : BEACH_SHORE_Z -
                      10 +
                      Math.min(1, Math.max(0, (p.z - WAVE_PLAYER_MARK[2]) / (24 - WAVE_PLAYER_MARK[2]))) * 22,
            this.steady
        );
        this.crowd.update(step);
        this.route.update(
            state.phase === 'falling' ? state.elapsed : state.phase === 'blinking' ? 2.4 : null,
            this.steady
        );
        if ((state.phase === 'falling' && state.elapsed > 1.9) || state.phase === 'blinking')
            this.character.root.enabled = false;
        if (!this.progress.running) return;
        const friend = this.companion.entity;
        const current = friend.getPosition();
        const separated = state.phase === 'separated';
        const targetZ = separated ? 6.6 : Math.min(6.6, Math.max(WAVE_PLAYER_MARK[2], p.z - 0.6));
        this.direction.set(1.5 - current.x, 0, targetZ - current.z);
        const distance = this.direction.length();
        const stepDistance = Math.min(distance, step * 6.8);
        const blocked = Math.hypot(p.x - current.x, p.z - current.z) < 1 && p.z > current.z;
        if (distance > 0.05 && !blocked) {
            this.direction.normalize();
            friend.setPosition(
                current.x + this.direction.x * stepDistance,
                1.04,
                current.z + this.direction.z * stepDistance
            );
            friend.setEulerAngles(0, (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI, 0);
        }
        if (separated) this.companion.character.play('talk');
        else this.companion.character.move(distance > 0.05 && !blocked ? stepDistance / step : 0);
        if (separated) friend.setEulerAngles(0, 0, 0);
    }

    getNavigation(camera?: Entity) {
        if (!this.progress.running) return null;
        const gate = EVACUATION_GATES[this.progress.state.gate];
        const p = this.player.getPosition();
        const dx = gate.position[0] - p.x;
        const dz = gate.position[2] - p.z;
        const behind = camera && dx * camera.forward.x + dz * camera.forward.z < 0;
        return { label: behind ? `Turn around · ${gate.label}` : gate.label, distance: Math.round(Math.hypot(dx, dz)) };
    }
}

export const createBeachWave = (
    parent: Entity,
    app: AppBase,
    assets: GameAssets,
    player: Entity,
    character: AnimatedCharacter,
    companion: CompanionController,
    life: BeachLife,
    water: ReturnType<typeof createBeachWater>,
    dressing: ReturnType<typeof createBeachDressing>,
    ambient: BeachAudio,
    cutscene: CutsceneSystem,
    quest: QuestSystem,
    checkpoint: WaveCheckpoint
) => {
    const root = new Entity('beach-wave');
    parent.addChild(root);
    const audio = new WaveAudio();
    const progress = new WaveProgress(checkpoint);
    root.once('destroy', () => {
        audio.destroy();
        progress.destroy();
    });
    const route = createEvacuationRoute(root, app);
    const surge = createWaveSurge(root, app.graphicsDevice);
    const birds = createWaveBirds(root, app.graphicsDevice);
    const motion = createWaveCamera(root, app, assets, player);
    const crowd = new WaveCrowd(life, player, companion, water);
    return root.addComponent('script')!.create(BeachWave, {
        properties: {
            player,
            character,
            companion,
            quest,
            cutscene,
            progress,
            audio,
            ambient,
            dressing,
            water,
            route,
            surge,
            birds,
            motion,
            crowd
        }
    })!;
};
