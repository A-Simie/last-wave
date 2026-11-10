import { SIGNAL_BOX_NOTE } from '../data/items';
import { SIGNAL_CHECK_QUEST } from '../data/quests';
import { BEACH_QUEST } from '../episodes/episode-01/beach';
import { BEACH_PASSES, ENTRY_QUEST } from '../episodes/episode-01/entry';
import { OPENING_QUEST, STARTER_BAG } from '../episodes/episode-01/opening';
import type { SaveResult } from '../systems/SaveSystem';

const SLOT_MESSAGES = {
    missing: 'No checkpoint saved yet.',
    invalid: 'This checkpoint contains invalid or damaged game data. Save a new checkpoint to replace it.',
    incompatible: 'This checkpoint uses an unsupported version or scene. Save a new checkpoint to replace it.',
    unavailable: 'Browser storage is unavailable. Check your browser settings and try again.'
};

export class CheckpointPanel {
    private readonly root = document.createElement('dialog');
    private readonly summary: HTMLElement;
    private readonly feedback: HTMLElement;
    private readonly saveButton: HTMLButtonElement;
    private readonly loadButton: HTMLButtonElement;
    private readonly deleteButton: HTMLButtonElement;
    private readonly closeButton: HTMLButtonElement;
    private readonly onSave: () => void;
    private readonly onLoad: () => void;
    private readonly onDelete: () => void;
    private readonly onClose: () => void;

    private readonly onCancel = (event: Event) => {
        event.preventDefault();
        this.onClose();
    };

    constructor(onSave: () => void, onLoad: () => void, onDelete: () => void, onClose: () => void) {
        this.onSave = onSave;
        this.onLoad = onLoad;
        this.onDelete = onDelete;
        this.onClose = onClose;
        this.root.id = 'checkpoint-menu';
        this.root.className = 'checkpoint-panel';
        this.root.setAttribute('aria-labelledby', 'checkpoint-title');
        this.root.setAttribute('aria-describedby', 'checkpoint-policy');
        this.root.innerHTML = `
            <div class="checkpoint-heading">
                <p class="eyebrow">Local checkpoint</p>
                <button type="button" data-checkpoint-close>Close</button>
            </div>
            <h2 id="checkpoint-title">Save / load</h2>
            <p id="checkpoint-policy">One checkpoint for this site in this browser. Saving replaces it.
                Resetting or reloading starts a fresh area; load to restore your saved progress.</p>
            <section class="checkpoint-slot" aria-label="Saved checkpoint">
                <h3 data-checkpoint-area>Episode 01</h3>
                <p data-checkpoint-summary></p>
            </section>
            <p class="checkpoint-feedback" data-checkpoint-feedback role="status" aria-live="polite" aria-atomic="true"></p>
            <div class="checkpoint-actions">
                <button type="button" data-save>Save checkpoint</button>
                <button type="button" data-load>Load checkpoint</button>
                <button type="button" data-delete-checkpoint>Delete checkpoint</button>
            </div>
            <p class="checkpoint-hint desktop-controls">P or Esc closes. Click the scene to resume play.</p>
            <p class="checkpoint-hint touch-controls">Close to resume exploring.</p>
            <a class="asset-credits" href="${import.meta.env.BASE_URL}assets/credits.html" target="_blank" rel="noopener">Art & audio credits ↗</a>
        `;
        this.summary = this.root.querySelector<HTMLElement>('[data-checkpoint-summary]')!;
        this.feedback = this.root.querySelector<HTMLElement>('[data-checkpoint-feedback]')!;
        this.saveButton = this.root.querySelector<HTMLButtonElement>('[data-save]')!;
        this.loadButton = this.root.querySelector<HTMLButtonElement>('[data-load]')!;
        this.deleteButton = this.root.querySelector<HTMLButtonElement>('[data-delete-checkpoint]')!;
        this.closeButton = this.root.querySelector<HTMLButtonElement>('[data-checkpoint-close]')!;
        this.root.addEventListener('cancel', this.onCancel);
        this.saveButton.addEventListener('click', onSave);
        this.loadButton.addEventListener('click', onLoad);
        this.deleteButton.addEventListener('click', onDelete);
        this.closeButton.addEventListener('click', onClose);
        document.body.append(this.root);
    }

    render(slot: SaveResult | null, message = '') {
        if (!slot) {
            this.root.close();
            return;
        }

        this.root.dataset.status = slot.status;
        this.loadButton.disabled = slot.status !== 'ready';
        this.deleteButton.disabled = slot.status === 'missing' || slot.status === 'unavailable';
        if (slot.status === 'ready') {
            const { savedAt, state } = slot.save;
            const hasBag = state.inventory.itemIds.includes(STARTER_BAG.id);
            const clues = Number(state.inventory.itemIds.includes(SIGNAL_BOX_NOTE.id));
            const opening = state.opening.completedObjectiveIds.length;
            this.root.querySelector('[data-checkpoint-area]')!.textContent =
                state.wave === 'after-blackout'
                    ? 'Episode 01 · after blackout'
                    : state.area === 'beach-arrival'
                      ? 'Seafront Beach · before the wave'
                      : 'Tideline & Seafront Avenue';
            this.summary.textContent = `Saved ${new Date(savedAt).toLocaleString()}. ${state.quest.completedObjectiveIds.length} / ${SIGNAL_CHECK_QUEST.objectives.length} signal objectives · ${clues} ${clues === 1 ? 'clue' : 'clues'}.${opening ? ` Opening: ${opening} / ${OPENING_QUEST.objectives.length}.${hasBag ? ' Bag & phone packed.' : ''} Beach route: ${state.entry.completedObjectiveIds.length} / ${ENTRY_QUEST.objectives.length}.${state.inventory.itemIds.includes(BEACH_PASSES.id) ? ' Two passes paid.' : ''}` : ''}`;
            if (state.area === 'beach-arrival')
                this.summary.textContent += ` Beach moments: ${state.beach.completedObjectiveIds.length} / ${BEACH_QUEST.objectives.length}.`;
            if (state.wave === 'after-blackout')
                this.summary.textContent += ' Opens at the blackout ending, with replay available.';
        } else {
            this.root.querySelector('[data-checkpoint-area]')!.textContent = 'Episode 01';
            this.summary.textContent = SLOT_MESSAGES[slot.status];
        }
        this.feedback.textContent = message;
        if (!this.root.open) {
            this.root.showModal();
            this.root.scrollTop = 0;
            this.closeButton.focus({ preventScroll: true });
        }
    }

    destroy() {
        this.root.close();
        this.root.removeEventListener('cancel', this.onCancel);
        this.saveButton.removeEventListener('click', this.onSave);
        this.loadButton.removeEventListener('click', this.onLoad);
        this.deleteButton.removeEventListener('click', this.onDelete);
        this.closeButton.removeEventListener('click', this.onClose);
        this.root.remove();
    }
}
