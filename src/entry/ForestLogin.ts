import type { ForestAudioState } from './ForestAudio';
import type { ForestTimeline } from './ForestTimeline';

export type ForestAuthentication = {
    login: (credentials: { username: string; password: string }) => Promise<void>;
    createAccount?: () => void;
};

export class ForestLogin {
    readonly root = document.createElement('section');
    private readonly events = new AbortController();
    private readonly board: HTMLElement;
    private readonly form: HTMLFormElement;
    private readonly feedback: HTMLElement;
    private readonly caption: HTMLElement;
    private readonly skip: HTMLButtonElement;
    private readonly replay: HTMLButtonElement;
    private readonly sound: HTMLButtonElement;
    private ready = false;
    private busy = false;
    private disposed = false;
    private audioState: ForestAudioState = 'loading';
    private readonly invitation: HTMLElement;
    private readonly timeline: ForestTimeline;
    private readonly onEnter: () => void;
    private readonly authentication?: ForestAuthentication;

    private readonly skipDialog: HTMLDialogElement;
    private readonly autoplay: HTMLButtonElement;
    private readonly onDialog: (open: boolean) => void;

    constructor(
        timeline: ForestTimeline,
        onEnter: () => void,
        onSound: () => void,
        onMuted: () => void,
        intro: { alwaysSkip: boolean; onChoose: (always: boolean) => void; onDialog: (open: boolean) => void },
        authentication?: ForestAuthentication
    ) {
        this.onDialog = intro.onDialog;
        this.timeline = timeline;
        this.onEnter = onEnter;
        this.authentication = authentication;
        this.root.id = 'forest-entry';
        this.root.setAttribute('aria-label', 'The forest entrance');
        this.root.innerHTML = `
            <div class="forest-vignette" aria-hidden="true"></div>
            <header class="forest-topline"><span>LAST WAVE <i> / </i> THE FOREST ENTRANCE</span>
                <div><button type="button" data-forest-sound aria-pressed="false">Enable sound</button>
                <button type="button" data-forest-skip>Skip intro <span aria-hidden="true">↗</span></button></div></header>
            <div class="forest-darkness" aria-hidden="true"></div>
            <div class="forest-sound-invite" data-forest-audio-invite>
                <p class="forest-eyebrow">THE FOREST IS LISTENING</p>
                <h1>A wrong turn.<br>A light in the trees.</h1>
                <p data-forest-audio-message>Preparing the forest sound and voices…</p>
                <button type="button" class="forest-enter" data-forest-play-sound>PLAY WITH SOUND <span aria-hidden="true">↗</span></button>
                <button type="button" class="forest-watch-muted" data-forest-watch-muted>Watch muted</button>
            </div>
            <div class="forest-board" data-forest-board inert aria-hidden="true">
                <div class="forest-chain forest-chain-left" aria-hidden="true"></div>
                <div class="forest-chain forest-chain-right" aria-hidden="true"></div>
                <div class="forest-wood">
                    <span class="forest-nail forest-nail-left" aria-hidden="true"></span>
                    <span class="forest-nail forest-nail-right" aria-hidden="true"></span>
                    <p class="forest-eyebrow">A LIGHT IN THE DARK</p>
                    <img class="forest-logo" src="${import.meta.env.BASE_URL}assets/last-wave-logo.svg" width="300" height="86" alt="Last Wave" />
                    <p class="forest-tagline">Some stories should stay buried.</p>
                    <div class="forest-divider" aria-hidden="true"><span>✦</span></div>
                    <h1>Welcome back, wanderer.</h1>
                    <p class="forest-intro">The forest remembers. Do you?</p>
                    <form data-forest-form>
                        <label for="forest-username">Username or email</label>
                        <input id="forest-username" name="username" autocomplete="username" required maxlength="254" placeholder="Your name in the dark" />
                        <label for="forest-password">Password</label>
                        <div class="forest-password"><input id="forest-password" name="password" type="password" autocomplete="current-password" required placeholder="Keep it close" />
                            <button type="button" data-forest-password aria-controls="forest-password" aria-pressed="false" aria-label="Show password">Show</button></div>
                        <p class="forest-feedback" data-forest-feedback role="status" aria-live="polite">${authentication ? 'Sign in to continue your story.' : 'Accounts are not connected yet. Continue locally to play.'}</p>
                        <button class="forest-enter" type="submit">SIGN IN <span aria-hidden="true">→</span></button>
                    </form>
                    <button class="forest-local" type="button" data-forest-local>Continue locally <span aria-hidden="true">↗</span></button>
                    <p class="forest-account">New to the unknown? <button type="button" data-forest-account>Create an account</button></p>
                    <button class="forest-replay" type="button" data-forest-replay>↻ Replay the entrance</button>
                    <button class="forest-replay" type="button" data-forest-autoplay hidden>▶ Play the intro on every visit</button>
                </div>
            </div>
            <dialog class="forest-skip-dialog" data-forest-skip-dialog aria-labelledby="forest-skip-title" aria-describedby="forest-skip-text">
                <div class="forest-wood">
                    <span class="forest-nail forest-nail-left" aria-hidden="true"></span>
                    <span class="forest-nail forest-nail-right" aria-hidden="true"></span>
                    <p class="forest-eyebrow">LEAVE THE DARK BEHIND?</p>
                    <h2 id="forest-skip-title">Skip the intro</h2>
                    <p id="forest-skip-text" class="forest-intro">Skip it just this once, or every time you return. You can turn the intro back on from the sign-in board.</p>
                    <div class="forest-skip-choices">
                        <button type="button" class="forest-enter" data-forest-skip-always>ALWAYS SKIP</button>
                        <button type="button" class="forest-local" data-forest-skip-once>Just this time</button>
                        <button type="button" class="forest-replay" data-forest-skip-cancel>Keep watching</button>
                    </div>
                </div>
            </dialog>
            <p class="forest-caption" data-forest-caption role="status" aria-live="polite" aria-atomic="true"></p>
            <footer class="forest-footer"><span>STAY CLOSE. KEEP THE LIGHT ON.</span><a href="${import.meta.env.BASE_URL}assets/credits.html" target="_blank" rel="noopener">Asset credits ↗</a></footer>`;
        this.board = this.root.querySelector('[data-forest-board]')!;
        this.form = this.root.querySelector('form')!;
        this.feedback = this.root.querySelector('[data-forest-feedback]')!;
        this.caption = this.root.querySelector('[data-forest-caption]')!;
        this.skip = this.root.querySelector('[data-forest-skip]')!;
        this.replay = this.root.querySelector('[data-forest-replay]')!;
        this.sound = this.root.querySelector('[data-forest-sound]')!;
        this.invitation = this.root.querySelector('[data-forest-audio-invite]')!;
        const listen = (selector: string, action: () => void) =>
            this.root.querySelector(selector)!.addEventListener('click', action, { signal: this.events.signal });
        this.skipDialog = this.root.querySelector<HTMLDialogElement>('[data-forest-skip-dialog]')!;
        this.autoplay = this.root.querySelector<HTMLButtonElement>('[data-forest-autoplay]')!;
        this.autoplay.hidden = !intro.alwaysSkip;
        listen('[data-forest-skip]', () => this.askToSkip());
        const skipNow = (always: boolean) => {
            this.skipDialog.close();
            intro.onChoose(always);
            this.autoplay.hidden = !always;
            timeline.skip();
            this.render();
        };
        listen('[data-forest-skip-always]', () => skipNow(true));
        listen('[data-forest-skip-once]', () => skipNow(false));
        listen('[data-forest-skip-cancel]', () => this.skipDialog.close());
        this.skipDialog.addEventListener(
            'close',
            () => {
                intro.onDialog(false);
                if (!this.timeline.state.ready) this.skip.focus({ preventScroll: true });
            },
            { signal: this.events.signal }
        );
        listen('[data-forest-autoplay]', () => {
            intro.onChoose(false);
            this.autoplay.hidden = true;
            this.setFeedback('The intro will play every time you open Last Wave.');
        });
        listen('[data-forest-replay]', () => {
            if (this.busy) return;
            timeline.replay();
            this.form.reset();
            this.render();
            this.skip.focus({ preventScroll: true });
        });
        listen('[data-forest-sound]', onSound);
        listen('[data-forest-play-sound]', onSound);
        listen('[data-forest-watch-muted]', onMuted);
        this.root.addEventListener(
            'pointerdown',
            (event) => {
                const target = event.target;
                if (
                    this.audioState === 'blocked' &&
                    target instanceof HTMLElement &&
                    !target.closest('button, a, input, label')
                )
                    onSound();
            },
            { signal: this.events.signal }
        );
        listen('[data-forest-password]', () => {
            const input = this.form.elements.namedItem('password') as HTMLInputElement;
            const button = this.root.querySelector('[data-forest-password]')!;
            const showing = input.type === 'password';
            input.type = showing ? 'text' : 'password';
            button.textContent = showing ? 'Hide' : 'Show';
            button.setAttribute('aria-pressed', String(showing));
            button.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
        });
        listen('[data-forest-local]', () => {
            if (!this.busy) this.onEnter();
        });
        listen('[data-forest-account]', () => {
            if (this.busy) return;
            if (authentication?.createAccount) authentication.createAccount();
            else this.setFeedback('Account creation is not connected yet. You can continue locally.');
        });
        this.form.addEventListener(
            'submit',
            (event) => {
                event.preventDefault();
                void this.login();
            },
            { signal: this.events.signal }
        );
        this.root.addEventListener(
            'keydown',
            (event) => {
                if (event.key === 'Escape' && !this.timeline.state.ready && !this.skipDialog.open) {
                    event.preventDefault();
                    this.askToSkip();
                }
            },
            { signal: this.events.signal }
        );
        document.body.append(this.root);
        document.body.classList.add('forest-active');
        this.render();
    }

    private async login() {
        if (this.busy || !this.ready || !this.form.reportValidity()) return;
        if (!this.authentication) {
            this.setFeedback('Sign-in is not connected to an account service yet. Choose Continue locally to play.');
            return;
        }
        this.busy = true;
        this.root.setAttribute('aria-busy', 'true');
        this.form.querySelector<HTMLButtonElement>('[type=submit]')!.disabled = true;
        this.setFeedback('Signing in…');
        try {
            await this.authentication.login({
                username: (this.form.elements.namedItem('username') as HTMLInputElement).value.trim(),
                password: (this.form.elements.namedItem('password') as HTMLInputElement).value
            });
            if (!this.disposed) this.onEnter();
        } catch {
            if (!this.disposed) this.setFeedback('Unable to sign in. Check your details and try again.');
        } finally {
            if (!this.disposed) {
                this.busy = false;
                this.root.removeAttribute('aria-busy');
                this.form.querySelector<HTMLButtonElement>('[type=submit]')!.disabled = false;
                (this.form.elements.namedItem('password') as HTMLInputElement).value = '';
            }
        }
    }

    get skipDialogOpen() {
        return this.skipDialog.open;
    }

    private askToSkip() {
        if (this.timeline.state.ready || this.skipDialog.open || this.disposed) return;
        this.onDialog(true);
        this.skipDialog.showModal();
        this.skipDialog.querySelector<HTMLButtonElement>('[data-forest-skip-once]')!.focus({ preventScroll: true });
    }

    setFeedback(message: string) {
        this.feedback.textContent = message;
    }

    setSound(state: ForestAudioState, feedback: string) {
        this.audioState = state;
        this.root.dataset.audio = state;
        const enabled = state === 'playing';
        this.sound.textContent = enabled ? 'Mute sound' : 'Enable sound';
        this.sound.setAttribute('aria-pressed', String(enabled));
        this.sound.title = feedback;
        this.root.querySelector<HTMLElement>('[data-forest-audio-message]')!.textContent = feedback;
        if (state === 'failed') this.setFeedback(feedback);
        this.invitation.hidden = this.timeline.state.ready || state === 'playing' || state === 'muted';
    }

    render(reducedMotion = false) {
        const state = this.timeline.state;
        this.root.dataset.phase = state.phase;
        this.root.dataset.elapsed = state.time.toFixed(3);
        this.invitation.hidden = state.ready || this.audioState === 'playing' || this.audioState === 'muted';
        const progress = state.board;
        const settling = progress >= 1 ? 0 : Math.sin(progress * 13) * Math.exp(-progress * 5) * 3;
        const arrival = Math.max(0, (progress - 0.6) / 0.4);
        const bounce = progress < 1 && !reducedMotion ? Math.sin(arrival * 9) * Math.exp(-arrival * 4) * 20 : 0;
        this.board.style.transform = `translateY(calc(${-(1 - Math.min(1, progress * 1.65)) * 140}vh + ${bounce}px)) rotate(${reducedMotion ? 0 : settling}deg)`;
        this.root.style.setProperty('--forest-darkness', String(1 - Math.min(1, state.time / 6)));
        this.board.inert = !state.ready;
        this.board.setAttribute('aria-hidden', String(!state.ready));
        this.board.style.opacity = progress > 0 ? '1' : '0';
        this.skip.hidden = state.ready;
        this.replay.hidden = reducedMotion;
        if (this.caption.textContent !== state.caption) this.caption.textContent = state.caption;
        if (state.ready && !this.ready) {
            this.ready = true;
            this.root.querySelector<HTMLInputElement>('#forest-username')!.focus({ preventScroll: true });
        } else if (!state.ready) this.ready = false;
    }

    destroy() {
        this.disposed = true;
        if (this.skipDialog.open) this.skipDialog.close();
        this.form.reset();
        this.events.abort();
        this.root.remove();
        document.body.classList.remove('forest-active');
    }

    setEntering(entering: boolean) {
        this.busy = entering;
        this.root.querySelectorAll<HTMLButtonElement>('.forest-wood button').forEach((button) => {
            button.disabled = entering;
        });
        if (entering) this.setFeedback('Opening your story…');
    }
}
