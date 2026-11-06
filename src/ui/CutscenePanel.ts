import type { OpeningMediaState } from '../episodes/episode-01/OpeningMedia';
import type { ScreenPoint } from '../scenes/ScreenProjection';
import type { CutsceneState } from '../systems/CutsceneSystem';

export class CutscenePanel {
    private readonly root = document.createElement('dialog');
    private readonly speech: HTMLElement;
    private readonly speaker: HTMLElement;
    private readonly text: HTMLElement;
    private readonly subtitle: HTMLElement;
    private readonly audioStatus: HTMLElement;
    private readonly nextButton: HTMLButtonElement;
    private readonly retryButton: HTMLButtonElement;
    private readonly motionInput: HTMLInputElement;
    private readonly soundInput: HTMLInputElement;
    private readonly captionsInput: HTMLInputElement;
    private readonly events = new AbortController();
    private state: CutsceneState | null = null;
    private media: OpeningMediaState = { phase: 'idle', caption: '', muted: false, musicFailed: false };

    constructor(
        onAdvance: (cutsceneId: string, beatId: string) => void,
        onSkip: (cutsceneId: string) => void,
        onMotionChange: () => void,
        onMute: (muted: boolean) => void,
        onRetry: () => void
    ) {
        this.root.className = 'cutscene-panel';
        this.root.id = 'story-opening';
        this.root.setAttribute('aria-label', 'The Last Normal Day');
        this.root.innerHTML = `
            <div class="cinematic-heading">
                <p>LAST WAVE <span>THE LAST NORMAL DAY</span></p>
                <button type="button" data-cutscene-skip>Skip intro</button>
            </div>
            <div class="speech-bubble" data-speech aria-live="polite" aria-atomic="true" hidden>
                <span data-cutscene-speaker></span>
                <p id="cutscene-text"></p>
            </div>
            <p class="broadcast-subtitle" data-subtitle aria-live="polite" hidden></p>
            <div class="cinematic-footer">
                <div class="cinematic-options">
                    <label><input type="checkbox" data-sound checked> Sound</label>
                    <label><input type="checkbox" data-captions checked> CC</label>
                    <label><input type="checkbox" data-reduced-motion> Steady camera</label>
                </div>
                <span class="audio-status" data-audio-status role="status"></span>
                <button type="button" data-audio-retry hidden>Retry playback</button>
                <button type="button" data-cutscene-next>Next</button>
            </div>
        `;
        this.speech = this.root.querySelector<HTMLElement>('[data-speech]')!;
        this.speaker = this.root.querySelector<HTMLElement>('[data-cutscene-speaker]')!;
        this.text = this.root.querySelector<HTMLElement>('#cutscene-text')!;
        this.subtitle = this.root.querySelector<HTMLElement>('[data-subtitle]')!;
        this.audioStatus = this.root.querySelector<HTMLElement>('[data-audio-status]')!;
        this.nextButton = this.root.querySelector<HTMLButtonElement>('[data-cutscene-next]')!;
        this.retryButton = this.root.querySelector<HTMLButtonElement>('[data-audio-retry]')!;
        this.motionInput = this.root.querySelector<HTMLInputElement>('[data-reduced-motion]')!;
        this.soundInput = this.root.querySelector<HTMLInputElement>('[data-sound]')!;
        this.captionsInput = this.root.querySelector<HTMLInputElement>('[data-captions]')!;
        this.motionInput.checked = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const options = { signal: this.events.signal };
        this.nextButton.addEventListener(
            'click',
            () => {
                if (this.state) onAdvance(this.state.cutsceneId, this.state.beat.id);
            },
            options
        );
        const skip = () => {
            if (this.state) onSkip(this.state.cutsceneId);
        };
        this.root.querySelector('[data-cutscene-skip]')!.addEventListener('click', skip, options);
        this.root.addEventListener(
            'cancel',
            (event) => {
                event.preventDefault();
                skip();
            },
            options
        );
        this.root.addEventListener(
            'keydown',
            (event) => {
                if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
            },
            options
        );
        this.motionInput.addEventListener('change', onMotionChange, options);
        this.soundInput.addEventListener('change', () => onMute(this.muted), options);
        this.captionsInput.addEventListener('change', () => this.renderMedia(this.media), options);
        this.retryButton.addEventListener('click', onRetry, options);
        document.body.append(this.root);
    }

    get reducedMotion() {
        return this.motionInput.checked;
    }
    get muted() {
        return !this.soundInput.checked;
    }

    render(state: CutsceneState | null) {
        this.state = state;
        if (!state) {
            this.root.close();
            return;
        }
        const broadcast = state.beat.id === 'broadcast';
        this.root.dataset.beat = state.beat.id;
        this.speech.hidden = broadcast;
        this.speaker.textContent = state.beat.speaker;
        this.text.textContent = broadcast ? '' : state.beat.text;
        this.nextButton.textContent = broadcast
            ? 'Skip bulletin'
            : state.index + 1 === state.totalCount
              ? 'Let’s go'
              : 'Next';
        this.renderMedia(this.media);
        if (!this.root.open) this.root.showModal();
        this.nextButton.focus({ preventScroll: true });
    }

    renderMedia(media: OpeningMediaState) {
        this.media = media;
        const broadcast = this.state?.beat.id === 'broadcast';
        const failed = media.phase === 'blocked' || media.phase === 'unavailable';
        this.subtitle.hidden = !broadcast || !media.caption || (!failed && !media.muted && !this.captionsInput.checked);
        this.subtitle.textContent = media.caption;
        this.retryButton.hidden = (!broadcast || !failed) && !media.musicFailed;
        this.audioStatus.textContent =
            broadcast && failed
                ? 'Read the subtitles or retry playback'
                : media.musicFailed
                  ? 'Music unavailable'
                  : !broadcast
                    ? ''
                    : media.phase === 'loading'
                      ? 'Tuning in…'
                      : 'Coastal news';
    }

    setSpeakerAnchor(point: ScreenPoint | null) {
        if (this.speech.hidden || !this.state) return;
        this.speech.style.visibility = point ? 'visible' : 'hidden';
        if (!point) return;
        const { offsetWidth: width, offsetHeight: height } = this.speech;
        const left = Math.max(12, Math.min(window.innerWidth - width - 12, point.x - width / 2));
        const top = Math.max(
            window.innerHeight <= 500 ? 60 : 76,
            Math.min(window.innerHeight - height - 100, point.y - height - 28)
        );
        this.speech.style.left = `${left}px`;
        this.speech.style.top = `${top}px`;
        this.speech.style.setProperty('--tail-x', `${Math.max(16, Math.min(width - 16, point.x - left))}px`);
    }

    destroy() {
        this.state = null;
        this.events.abort();
        this.root.close();
        this.root.remove();
    }
}
