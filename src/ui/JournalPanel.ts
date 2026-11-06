import type { InventoryState } from '../systems/InventorySystem';

export class JournalPanel {
    private readonly root = document.createElement('dialog');
    private readonly summary: HTMLElement;
    private readonly title: HTMLElement;
    private readonly empty: HTMLElement;
    private readonly entries: HTMLElement;
    private readonly closeButton: HTMLButtonElement;
    private readonly onClose: () => void;

    private readonly onCancel = (event: Event) => {
        event.preventDefault();
        this.onClose();
    };

    constructor(onClose: () => void) {
        this.onClose = onClose;
        this.root.id = 'clue-journal';
        this.root.className = 'journal-panel';
        this.root.setAttribute('aria-labelledby', 'journal-title');
        this.root.setAttribute('aria-describedby', 'journal-summary');
        this.root.innerHTML = `
            <div class="journal-heading">
                <p class="eyebrow">Inventory</p>
                <button type="button" data-journal-close>Close journal</button>
            </div>
            <h2 id="journal-title">Clue journal</h2>
            <p id="journal-summary"></p>
            <p data-journal-empty>No clues collected yet. Inspect the amber signal box to find one.</p>
            <div class="journal-entries" data-journal-entries></div>
            <p class="journal-hint desktop-controls">J or Esc closes. Click the scene to resume play.</p>
            <p class="journal-hint touch-controls">Close the journal to resume exploring.</p>
        `;
        this.summary = this.root.querySelector<HTMLElement>('#journal-summary')!;
        this.title = this.root.querySelector<HTMLElement>('#journal-title')!;
        this.empty = this.root.querySelector<HTMLElement>('[data-journal-empty]')!;
        this.entries = this.root.querySelector<HTMLElement>('[data-journal-entries]')!;
        this.closeButton = this.root.querySelector<HTMLButtonElement>('[data-journal-close]')!;
        this.root.addEventListener('cancel', this.onCancel);
        this.closeButton.addEventListener('click', onClose);
        document.body.append(this.root);
    }

    render(state: InventoryState | null) {
        if (!state) {
            this.root.close();
            this.entries.replaceChildren();
            return;
        }

        const { items } = state;
        const belongings = items.filter((item) => item.kind === 'quest').length;
        const clues = items.length - belongings;
        this.title.textContent = belongings ? 'Bag & clue journal' : 'Clue journal';
        this.summary.textContent = `${clues} ${clues === 1 ? 'clue' : 'clues'} collected.${belongings ? ` ${belongings} protected story item.` : ''}`;
        this.empty.hidden = items.length !== 0;
        this.entries.hidden = items.length === 0;
        this.entries.replaceChildren(
            ...items.map((item) => {
                const entry = document.createElement('article');
                entry.className = 'journal-entry';
                entry.dataset.itemId = item.id;
                const title = document.createElement('h3');
                title.textContent = item.title;
                const source = document.createElement('p');
                source.textContent = `${item.kind === 'quest' ? 'Story item · ' : ''}Found at: ${item.source}`;
                const description = document.createElement('p');
                description.className = 'journal-description';
                description.textContent = item.description;
                entry.append(title, source, description);
                return entry;
            })
        );
        if (!this.root.open) {
            this.root.showModal();
            this.root.scrollTop = 0;
            this.closeButton.focus({ preventScroll: true });
        }
    }

    destroy() {
        this.root.close();
        this.root.removeEventListener('cancel', this.onCancel);
        this.closeButton.removeEventListener('click', this.onClose);
        this.root.remove();
    }
}
