import type { BeachAudioState } from '../episodes/episode-01/BeachAudio';
import { EVACUATION_CALL, SEPARATION_CALL } from '../episodes/episode-01/wave';
import type { WaveState } from '../episodes/episode-01/WaveProgress';
import type { ScreenPoint } from '../scenes/ScreenProjection';
import type { InteractionState } from '../systems/InteractionSystem';
import type { InventoryState } from '../systems/InventorySystem';
import type { QuestState } from '../systems/QuestSystem';

export class GameHud {
    private readonly root = document.createElement('div');
    private readonly prompt: HTMLElement;
    private readonly target: HTMLElement;
    private readonly message: HTMLElement;
    private readonly quest: HTMLElement;
    private readonly questTitle: HTMLElement;
    private readonly questStatus: HTMLElement;
    private readonly questObjective: HTMLElement;
    private readonly questProgress: HTMLElement;
    private readonly optionalQuest: HTMLElement;
    private readonly interactButton: HTMLButtonElement;
    private readonly resetButton: HTMLButtonElement;
    private readonly journalButton: HTMLButtonElement;
    private readonly checkpointButton: HTMLButtonElement;
    private readonly storyButton: HTMLButtonElement;
    private readonly beachAudioButton: HTMLButtonElement;
    private readonly eyebrow: HTMLElement;
    private readonly clueNotice: HTMLElement;
    private readonly navigation: HTMLElement;
    private readonly waveCaption: HTMLElement;
    private waveKey = '';
    private hasTarget = false;
    private readonly onInteract: () => void;
    private readonly onReset: () => void;
    private readonly onJournal: () => void;
    private readonly onCheckpoint: () => void;
    private readonly onStory: () => void;
    private readonly onBeachAudio: () => void;

    constructor(
        onInteract: () => void,
        onReset: () => void,
        onJournal: () => void,
        onCheckpoint: () => void,
        onStory: () => void,
        onBeachAudio: () => void
    ) {
        this.onInteract = onInteract;
        this.onReset = onReset;
        this.onJournal = onJournal;
        this.onCheckpoint = onCheckpoint;
        this.onStory = onStory;
        this.onBeachAudio = onBeachAudio;
        this.root.className = 'hud';
        this.root.innerHTML = `
            <div class="hud-summary">
                <section class="instructions" aria-label="Game controls">
                    <p class="eyebrow" data-mode>Tideline café</p>
                    <div class="hud-title">
                        <h1 class="game-logo"><img src="${import.meta.env.BASE_URL}assets/last-wave-logo.svg" alt="Last Wave" width="300" height="86" /></h1>
                        <button type="button" data-checkpoint aria-haspopup="dialog" aria-controls="checkpoint-menu" aria-keyshortcuts="P"><span class="desktop-controls"><kbd>P</kbd> · </span>Save / load</button>
                    </div>
                    <div class="hud-actions">
                        <button type="button" data-journal aria-haspopup="dialog" aria-controls="clue-journal">Journal</button>
                        <button type="button" data-beach-audio hidden>Beach sound</button>
                        <details class="controls-help">
                            <summary>Controls</summary>
                            <div class="controls-popover">
                                <p class="desktop-controls">Click to play · <kbd>Esc</kbd> releases the mouse</p>
                                <p class="desktop-controls"><kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> jump</p>
                                <p class="desktop-controls">Mouse to look · Scroll to zoom · <kbd>E</kbd> interact · <kbd>J</kbd> journal</p>
                                <p class="touch-controls">Drag left to move, right to look. Drag farther to sprint. Double-tap right to jump.</p>
                                <button type="button" data-reset>Restart café</button>
                            </div>
                        </details>
                    </div>
                    <p class="clue-notice" data-clue-notice role="status" aria-live="polite" hidden></p>
                </section>
                <section class="quest-tracker" data-quest aria-labelledby="quest-title">
                    <div class="quest-heading">
                        <h2 id="quest-title" data-quest-title></h2>
                        <button type="button" data-story aria-haspopup="dialog" aria-controls="story-opening">Play story</button>
                    </div>
                    <div role="status" aria-live="polite" aria-atomic="true">
                        <p class="eyebrow" data-quest-status></p>
                        <p class="objective" data-quest-objective></p>
                        <p class="quest-progress" data-quest-progress></p>
                        <p class="navigation-hint" data-navigation hidden></p>
                        <p class="optional-quest" data-optional-quest hidden></p>
                    </div>
                </section>
            </div>
            <div class="interaction" data-prompt hidden>
                <button type="button" data-interact>
                    <kbd class="desktop-controls">E</kbd>
                    <span data-target></span>
                </button>
            </div>
            <p class="interaction-message" data-message role="status" aria-live="polite" hidden></p>
            <p class="wave-caption" data-wave-caption role="status" aria-live="polite" hidden></p>
        `;
        this.prompt = this.root.querySelector<HTMLElement>('[data-prompt]')!;
        this.target = this.root.querySelector<HTMLElement>('[data-target]')!;
        this.message = this.root.querySelector<HTMLElement>('[data-message]')!;
        this.quest = this.root.querySelector<HTMLElement>('[data-quest]')!;
        this.questTitle = this.root.querySelector<HTMLElement>('[data-quest-title]')!;
        this.questStatus = this.root.querySelector<HTMLElement>('[data-quest-status]')!;
        this.questObjective = this.root.querySelector<HTMLElement>('[data-quest-objective]')!;
        this.questProgress = this.root.querySelector<HTMLElement>('[data-quest-progress]')!;
        this.optionalQuest = this.root.querySelector<HTMLElement>('[data-optional-quest]')!;
        this.interactButton = this.root.querySelector<HTMLButtonElement>('[data-interact]')!;
        this.resetButton = this.root.querySelector<HTMLButtonElement>('[data-reset]')!;
        this.journalButton = this.root.querySelector<HTMLButtonElement>('[data-journal]')!;
        this.checkpointButton = this.root.querySelector<HTMLButtonElement>('[data-checkpoint]')!;
        this.storyButton = this.root.querySelector<HTMLButtonElement>('[data-story]')!;
        this.beachAudioButton = this.root.querySelector<HTMLButtonElement>('[data-beach-audio]')!;
        this.eyebrow = this.root.querySelector<HTMLElement>('[data-mode]')!;
        this.clueNotice = this.root.querySelector<HTMLElement>('[data-clue-notice]')!;
        this.navigation = this.root.querySelector<HTMLElement>('[data-navigation]')!;
        this.waveCaption = this.root.querySelector<HTMLElement>('[data-wave-caption]')!;
        this.interactButton.addEventListener('click', onInteract);
        this.resetButton.addEventListener('click', onReset);
        this.journalButton.addEventListener('click', onJournal);
        this.checkpointButton.addEventListener('click', onCheckpoint);
        this.storyButton.addEventListener('click', onStory);
        this.beachAudioButton.addEventListener('click', onBeachAudio);
        document.body.append(this.root);
    }

    render({ targetLabel, message }: InteractionState) {
        this.hasTarget = targetLabel !== null;
        this.prompt.hidden = !this.hasTarget;
        this.target.textContent = targetLabel ?? '';
        this.message.hidden = message === null;
        this.message.textContent = message ?? '';
    }

    setPromptAnchor(point: ScreenPoint | null) {
        this.prompt.hidden = !this.hasTarget || !point;
        if (!point) return;
        this.prompt.style.setProperty('--prompt-x', `${Math.max(100, Math.min(window.innerWidth - 100, point.x))}px`);
        this.prompt.style.setProperty(
            '--prompt-y',
            `${Math.max(100, Math.min(window.innerHeight - 80, point.y + 22))}px`
        );
    }

    renderQuest(state: QuestState, openingPrompt = false) {
        this.quest.dataset.status = state.status;
        this.quest.dataset.order = state.order;
        this.questTitle.textContent = state.title;
        this.questStatus.textContent =
            state.order === 'any' && state.status !== 'completed'
                ? 'Explore at your pace · Any order'
                : {
                      inactive: 'Quest available',
                      active: 'Quest active',
                      completed: 'Quest complete'
                  }[state.status];
        this.questObjective.textContent =
            state.status === 'completed'
                ? state.completionMessage
                : openingPrompt
                  ? 'An afternoon at Tideline. Best enjoyed with sound.'
                  : state.order === 'any'
                    ? state.remainingObjectives.map(({ text }) => text).join(' · ')
                    : state.objective.text;
        this.questProgress.textContent = `${state.completedCount} / ${state.totalCount} ${state.order === 'any' ? 'beach moments shared' : 'objectives complete'}`;
    }

    renderBeachAudio(state: BeachAudioState | null) {
        this.beachAudioButton.hidden = !state;
        if (!state) return;
        const retry = state.phase === 'blocked' || state.phase === 'unavailable' || state.phase === 'idle';
        this.beachAudioButton.textContent = retry
            ? 'Enable beach sound'
            : state.muted
              ? 'Sound: Off'
              : state.phase === 'loading'
                ? 'Loading sound…'
                : 'Sound: On';
        this.beachAudioButton.setAttribute('aria-pressed', String(!state.muted && !retry));
        this.beachAudioButton.title =
            state.phase === 'unavailable'
                ? 'Beach sound unavailable. Activate to retry.'
                : 'Gentle surf and distant gulls';
    }

    renderOptionalQuest(state: QuestState | null) {
        const visible = state && state.status !== 'inactive';
        this.optionalQuest.hidden = !visible;
        this.optionalQuest.textContent = visible
            ? `${state.title} · ${state.status === 'completed' ? state.completionMessage : state.objective.text}`
            : '';
    }

    renderInventory({ items }: InventoryState) {
        const hasBelongings = items.some((item) => item.kind === 'quest');
        this.journalButton.textContent = `${hasBelongings ? 'Bag / journal' : 'Journal'}${items.length ? ` (${items.length})` : ''}`;
        const latest = items.at(-1);
        this.clueNotice.hidden = !latest;
        this.clueNotice.textContent = latest
            ? `${latest.kind === 'quest' ? 'Packed' : 'Clue collected'}: ${latest.title}`
            : '';
    }

    renderStory(state: QuestState | null, area: 'tideline' | 'beach-arrival') {
        this.waveKey = '';
        const started = state?.status !== 'inactive';
        this.root.dataset.area = area;
        this.root.dataset.ready = String(!started);
        this.storyButton.hidden = !state;
        this.storyButton.textContent = started ? 'Replay intro' : 'Play story';
        this.eyebrow.textContent =
            area === 'beach-arrival'
                ? 'Episode 01 · Seafront Beach'
                : state && state.completedCount >= 3
                  ? 'Episode 01 · Seafront Avenue'
                  : started
                    ? 'Episode 01 · Tideline café'
                    : 'Tideline café · Late afternoon';
    }

    renderWave(state: WaveState | null, ready: boolean, captions: boolean) {
        const phase = state?.phase ?? '';
        const running = phase === 'evacuating' || phase === 'separated';
        const key = `${phase}:${state?.gate}:${ready}`;
        this.root.dataset.wave = phase;
        if (key !== this.waveKey) {
            this.waveKey = key;
            if (state) {
                this.storyButton.hidden = !ready || (!running && phase !== 'calm');
                this.storyButton.textContent = running ? 'Retry wave' : 'Continue story';
            }
            if (running) {
                this.quest.dataset.order = 'sequence';
                this.questTitle.textContent = 'Get to higher ground';
                this.questStatus.textContent = phase === 'separated' ? 'Separated · keep climbing' : 'Evacuate inland';
                this.questObjective.textContent = 'Follow the green arrows along the boardwalk and up the dune path.';
                this.questProgress.innerHTML =
                    '<span class="desktop-controls">Click to play · WASD to move · Shift to sprint</span><span class="touch-controls">Drag left to move. Drag farther to sprint.</span>';
            }
        }
        this.waveCaption.hidden = !running || !captions;
        const text =
            phase === 'separated'
                ? `${SEPARATION_CALL}\nThe crowd has come between you. Keep climbing!`
                : `Lifeguard: “${EVACUATION_CALL}”`;
        if (this.waveCaption.textContent !== text) this.waveCaption.textContent = text;
    }

    renderNavigation(hint: { label: string; distance: number } | null) {
        this.navigation.hidden = !hint;
        const text = hint ? `${hint.label} · ${hint.distance} m` : '';
        if (this.navigation.textContent !== text) this.navigation.textContent = text;
    }

    setCutsceneActive(active: boolean) {
        this.root.hidden = active;
    }

    destroy() {
        this.interactButton.removeEventListener('click', this.onInteract);
        this.resetButton.removeEventListener('click', this.onReset);
        this.journalButton.removeEventListener('click', this.onJournal);
        this.checkpointButton.removeEventListener('click', this.onCheckpoint);
        this.storyButton.removeEventListener('click', this.onStory);
        this.beachAudioButton.removeEventListener('click', this.onBeachAudio);
        this.root.remove();
    }
}
