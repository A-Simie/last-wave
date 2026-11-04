import type { DialogueState } from '../systems/DialogueSystem';

export class DialoguePanel {
    private readonly root = document.createElement('dialog');
    private readonly speaker: HTMLElement;
    private readonly text: HTMLElement;
    private readonly choices: HTMLElement;
    private readonly closeButton: HTMLButtonElement;
    private readonly onChoose: (nodeId: string, choiceId: string) => void;
    private readonly onClose: () => void;

    private readonly onCancel = (event: Event) => {
        event.preventDefault();
        this.onClose();
    };

    private readonly onChoiceClick = (event: MouseEvent) => {
        const button =
            event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-dialogue-choice]') : null;
        if (!button || !this.choices.contains(button)) return;
        this.onChoose(button.dataset.node!, button.dataset.dialogueChoice!);
    };

    constructor(onChoose: (nodeId: string, choiceId: string) => void, onClose: () => void) {
        this.onChoose = onChoose;
        this.onClose = onClose;
        this.root.className = 'dialogue-panel';
        this.root.setAttribute('aria-labelledby', 'dialogue-speaker');
        this.root.setAttribute('aria-describedby', 'dialogue-text');
        this.root.innerHTML = `
            <div class="dialogue-heading">
                <p class="eyebrow">Conversation</p>
                <button type="button" data-dialogue-close>End conversation</button>
            </div>
            <h2 id="dialogue-speaker"></h2>
            <p id="dialogue-text" aria-live="polite"></p>
            <div class="dialogue-choices" data-dialogue-choices role="group" aria-label="Your response"></div>
            <p class="dialogue-hint desktop-controls">Choose with Tab and Enter, or click. Esc closes. Click the scene to resume play.</p>
            <p class="dialogue-hint touch-controls">Tap a response. End the conversation to resume exploring.</p>
        `;
        this.speaker = this.root.querySelector<HTMLElement>('#dialogue-speaker')!;
        this.text = this.root.querySelector<HTMLElement>('#dialogue-text')!;
        this.choices = this.root.querySelector<HTMLElement>('[data-dialogue-choices]')!;
        this.closeButton = this.root.querySelector<HTMLButtonElement>('[data-dialogue-close]')!;
        this.root.addEventListener('cancel', this.onCancel);
        this.choices.addEventListener('click', this.onChoiceClick);
        this.closeButton.addEventListener('click', onClose);
        document.body.append(this.root);
    }

    render(state: DialogueState | null) {
        if (!state) {
            this.root.close();
            this.choices.replaceChildren();
            return;
        }

        this.speaker.textContent = state.speaker;
        this.text.textContent = state.text;
        this.choices.replaceChildren(
            ...state.choices.map((choice) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.node = state.nodeId;
                button.dataset.dialogueChoice = choice.id;
                button.textContent = choice.label;
                return button;
            })
        );
        if (!this.root.open) this.root.showModal();
        (this.choices.querySelector('button') ?? this.closeButton).focus({ preventScroll: true });
    }

    destroy() {
        this.root.close();
        this.root.removeEventListener('cancel', this.onCancel);
        this.choices.removeEventListener('click', this.onChoiceClick);
        this.closeButton.removeEventListener('click', this.onClose);
        this.root.remove();
    }
}
