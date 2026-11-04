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
    private readonly interactButton: HTMLButtonElement;
    private readonly resetButton: HTMLButtonElement;
    private readonly journalButton: HTMLButtonElement;
    private readonly clueNotice: HTMLElement;
    private readonly onInteract: () => void;
    private readonly onReset: () => void;
    private readonly onJournal: () => void;

    constructor(onInteract: () => void, onReset: () => void, onJournal: () => void) {
        this.onInteract = onInteract;
        this.onReset = onReset;
        this.onJournal = onJournal;
        this.root.className = 'hud';
        this.root.innerHTML = `
            <div class="hud-summary">
                <section class="panel instructions" aria-label="Game controls">
                    <p class="eyebrow">Gameplay foundation</p>
                    <h1>LAST WAVE</h1>
                    <p class="desktop-controls">Click the scene to play. <kbd>Esc</kbd> releases the mouse.</p>
                    <p class="desktop-controls"><kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> jump</p>
                    <p class="desktop-controls">Mouse to orbit · Scroll to zoom · <kbd>E</kbd> interact · <kbd>J</kbd> journal</p>
                    <p class="touch-controls">Drag left to move, right to look. Drag farther to sprint. Double-tap right to jump.</p>
                    <div class="hud-actions">
                        <button type="button" data-reset>Reset test area</button>
                        <button type="button" data-journal aria-haspopup="dialog" aria-controls="clue-journal">Clue journal (0)</button>
                    </div>
                    <p class="clue-notice" data-clue-notice role="status" aria-live="polite" hidden></p>
                </section>
                <section class="panel quest-tracker" data-quest aria-labelledby="quest-title">
                    <h2 id="quest-title" data-quest-title></h2>
                    <div role="status" aria-live="polite" aria-atomic="true">
                        <p class="eyebrow" data-quest-status></p>
                        <p class="objective" data-quest-objective></p>
                        <p class="quest-progress" data-quest-progress></p>
                    </div>
                </section>
            </div>
            <div class="interaction" data-prompt hidden>
                <p data-target></p>
                <button type="button" data-interact>
                    <span class="desktop-controls">Press E to Interact</span>
                    <span class="touch-controls">Tap to Interact</span>
                </button>
            </div>
            <p class="interaction-message" data-message role="status" aria-live="polite" hidden></p>
        `;
        this.prompt = this.root.querySelector<HTMLElement>('[data-prompt]')!;
        this.target = this.root.querySelector<HTMLElement>('[data-target]')!;
        this.message = this.root.querySelector<HTMLElement>('[data-message]')!;
        this.quest = this.root.querySelector<HTMLElement>('[data-quest]')!;
        this.questTitle = this.root.querySelector<HTMLElement>('[data-quest-title]')!;
        this.questStatus = this.root.querySelector<HTMLElement>('[data-quest-status]')!;
        this.questObjective = this.root.querySelector<HTMLElement>('[data-quest-objective]')!;
        this.questProgress = this.root.querySelector<HTMLElement>('[data-quest-progress]')!;
        this.interactButton = this.root.querySelector<HTMLButtonElement>('[data-interact]')!;
        this.resetButton = this.root.querySelector<HTMLButtonElement>('[data-reset]')!;
        this.journalButton = this.root.querySelector<HTMLButtonElement>('[data-journal]')!;
        this.clueNotice = this.root.querySelector<HTMLElement>('[data-clue-notice]')!;
        this.interactButton.addEventListener('click', onInteract);
        this.resetButton.addEventListener('click', onReset);
        this.journalButton.addEventListener('click', onJournal);
        document.body.append(this.root);
    }

    render({ targetLabel, message }: InteractionState) {
        this.prompt.hidden = targetLabel === null;
        this.target.textContent = targetLabel ?? '';
        this.message.hidden = message === null;
        this.message.textContent = message ?? '';
    }

    renderQuest(state: QuestState) {
        this.quest.dataset.status = state.status;
        this.questTitle.textContent = state.title;
        this.questStatus.textContent = {
            inactive: 'Quest available',
            active: 'Quest active',
            completed: 'Quest complete'
        }[state.status];
        this.questObjective.textContent = state.status === 'completed' ? state.completionMessage : state.objective.text;
        this.questProgress.textContent = `${state.completedCount} / ${state.totalCount} objectives complete`;
    }

    renderInventory({ items }: InventoryState) {
        this.journalButton.textContent = `Clue journal (${items.length})`;
        const latest = items.at(-1);
        this.clueNotice.hidden = !latest;
        this.clueNotice.textContent = latest ? `Clue collected: ${latest.title}` : '';
    }

    destroy() {
        this.interactButton.removeEventListener('click', this.onInteract);
        this.resetButton.removeEventListener('click', this.onReset);
        this.journalButton.removeEventListener('click', this.onJournal);
        this.root.remove();
    }
}
