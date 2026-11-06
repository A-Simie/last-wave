import type { CutsceneState } from '../../systems/CutsceneSystem';

import audio from './openingAudio.json';
import broadcast from './openingBroadcast.json';

export type OpeningMediaState = {
    readonly phase: 'idle' | 'loading' | 'playing' | 'blocked' | 'unavailable';
    readonly caption: string;
    readonly muted: boolean;
    readonly musicFailed: boolean;
};

const transcript = broadcast.cues.map(({ text }) => text).join(' ');

export class OpeningMedia {
    onStateChange: ((state: OpeningMediaState) => void) | null = null;
    onBroadcastEnded: (() => void) | null = null;

    private readonly music: HTMLAudioElement;
    private readonly baseUrl: string;
    private readonly events = new AbortController();
    private clip: HTMLVideoElement | null = null;
    private clipEvents: AbortController | null = null;
    private watchdog: ReturnType<typeof setTimeout> | undefined;
    private phase: OpeningMediaState['phase'] = 'idle';
    private broadcast = false;
    private started = false;
    private muted = false;
    private paused = false;
    private destroyed = false;
    private musicFailed = false;
    private lastCaption = '';

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.music = new Audio(`${baseUrl}audio/${audio.music.file}`);
        this.music.loop = true;
        this.music.preload = 'none';
        this.music.volume = 0.18;
        this.music.addEventListener(
            'error',
            () => {
                this.musicFailed = true;
                this.publish();
            },
            { signal: this.events.signal }
        );
        document.addEventListener('visibilitychange', () => this.syncPause(), { signal: this.events.signal });
    }

    get video() {
        return this.clip;
    }

    get state(): OpeningMediaState {
        const fallback = this.phase === 'blocked' || this.phase === 'unavailable';
        const time = this.clip?.currentTime ?? 0;
        const cue = broadcast.cues.find(({ start, end }) => time >= start && time < end);
        return {
            phase: this.phase,
            caption: fallback ? transcript : this.clip ? (cue?.text ?? '') : '',
            muted: this.muted,
            musicFailed: this.musicFailed
        };
    }

    start(ambient = false) {
        if (this.destroyed) return;
        this.started = true;
        this.playMusic();
        if (ambient && !this.clip) this.createClip();
    }

    present(state: CutsceneState | null) {
        const active = state?.beat.id === 'broadcast';
        if (this.destroyed || this.broadcast === active) return;
        this.broadcast = active;
        if (active) {
            this.stopClip();
            this.createClip();
        } else if (this.clip) {
            this.clip.muted = true;
            this.clip.loop = true;
            if (this.clip.ended) this.clip.currentTime = 0;
            if (this.phase !== 'blocked' && this.phase !== 'unavailable') this.resumeClip(this.clip);
            this.publish();
        }
    }

    setMuted(muted: boolean) {
        if (this.destroyed) return;
        this.muted = muted;
        this.music.muted = muted;
        if (this.clip) this.clip.muted = muted || !this.broadcast;
        this.publish();
    }

    retry() {
        if (this.destroyed) return;
        if (this.music.error) this.music.load();
        this.playMusic();
        if (this.phase === 'blocked' || this.phase === 'unavailable') {
            this.stopClip();
            this.createClip();
        }
    }

    update(dt: number) {
        if (this.destroyed) return;
        if (this.paused !== (dt === 0)) {
            this.paused = dt === 0;
            this.syncPause();
        }
        const volume = this.broadcast ? 0.1 : 0.24;
        this.music.volume += (volume - this.music.volume) * Math.min(1, dt * 2);
        if (this.state.caption !== this.lastCaption) this.publish();
    }

    private publish() {
        const state = this.state;
        this.lastCaption = state.caption;
        this.onStateChange?.(state);
    }

    private playMusic() {
        if (!this.started || this.paused || document.hidden) return;
        void this.music
            .play()
            .then(() => {
                if (this.destroyed || !this.musicFailed) return;
                this.musicFailed = false;
                this.publish();
            })
            .catch(() => {
                if (this.destroyed || document.hidden || this.paused) return;
                this.musicFailed = true;
                this.publish();
            });
    }

    private createClip() {
        const video = document.createElement('video');
        this.clip = video;
        this.clipEvents = new AbortController();
        const options = { signal: this.clipEvents.signal };
        this.phase = 'loading';
        video.preload = 'auto';
        video.playsInline = true;
        video.muted = this.muted || !this.broadcast;
        video.loop = !this.broadcast;
        video.volume = 0.9;
        video.addEventListener(
            'playing',
            () => {
                if (this.clip !== video || this.destroyed) return;
                if (this.paused || document.hidden) {
                    video.pause();
                    return;
                }
                clearTimeout(this.watchdog);
                this.phase = 'playing';
                this.publish();
            },
            options
        );
        video.addEventListener('waiting', () => this.watchClip(video), options);
        video.addEventListener('error', () => this.failClip(video, 'unavailable'), options);
        video.addEventListener(
            'ended',
            () => {
                if (this.clip === video && this.broadcast && video.ended && !this.destroyed) this.onBroadcastEnded?.();
            },
            options
        );
        video.src = `${this.baseUrl}video/${broadcast.file}`;
        this.publish();
        this.resumeClip(video);
    }

    private failClip(video: HTMLVideoElement, phase: 'blocked' | 'unavailable') {
        if (this.clip !== video || this.destroyed) return;
        clearTimeout(this.watchdog);
        video.pause();
        this.phase = phase;
        this.publish();
    }

    private resumeClip(video: HTMLVideoElement) {
        if (this.destroyed || this.clip !== video || document.hidden || this.paused) return;
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            clearTimeout(this.watchdog);
            this.phase = 'playing';
            this.publish();
            return;
        }
        this.watchClip(video);
        void video.play().catch((error: unknown) => {
            if (document.hidden || this.paused) return;
            const blocked = error instanceof DOMException && error.name === 'NotAllowedError';
            this.failClip(video, blocked ? 'blocked' : 'unavailable');
        });
    }

    private watchClip(video: HTMLVideoElement) {
        if (this.clip !== video || this.destroyed || document.hidden || this.paused) return;
        clearTimeout(this.watchdog);
        this.phase = 'loading';
        this.publish();
        this.watchdog = setTimeout(() => this.failClip(video, 'unavailable'), 8000);
    }

    private syncPause() {
        if (this.destroyed) return;
        if (document.hidden || this.paused) {
            clearTimeout(this.watchdog);
            this.music.pause();
            this.clip?.pause();
            return;
        }
        this.playMusic();
        if (this.clip && this.phase !== 'unavailable' && this.phase !== 'blocked') this.resumeClip(this.clip);
    }

    private stopClip() {
        clearTimeout(this.watchdog);
        this.clipEvents?.abort();
        this.clipEvents = null;
        const video = this.clip;
        this.clip = null;
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }
        this.phase = 'idle';
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.events.abort();
        this.onStateChange = null;
        this.onBroadcastEnded = null;
        this.stopClip();
        this.music.pause();
        this.music.removeAttribute('src');
        this.music.load();
    }
}
