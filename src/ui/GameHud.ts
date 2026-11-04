import type { InteractionState } from '../systems/InteractionSystem';

export class GameHud {
    private readonly root = document.createElement('div');
    private readonly prompt: HTMLElement;
    private readonly target: HTMLElement;
    private readonly message: HTMLElement;
    private readonly interactButton: HTMLButtonElement;
    private readonly resetButton: HTMLButtonElement;
    private readonly onInteract: () => void;
    private readonly onReset: () => void;

    constructor(onInteract: () => void, onReset: () => void) {
        this.onInteract = onInteract;
        this.onReset = onReset;
        this.root.className = 'hud';
        this.root.innerHTML = `
            <section class="panel instructions" aria-label="Game controls">
                <p class="eyebrow">Gameplay foundation</p>
                <h1>LAST WAVE</h1>
                <p class="desktop-controls">Click the scene to play. <kbd>Esc</kbd> releases the mouse.</p>
                <p class="desktop-controls"><kbd>WASD</kbd> move · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> jump</p>
                <p class="desktop-controls">Mouse to orbit · Scroll to zoom · <kbd>E</kbd> interact</p>
                <p class="touch-controls">Drag left to move, right to look. Drag farther to sprint. Double-tap right to jump.</p>
                <p class="objective">Check the amber signal box, or talk to the purple guide.</p>
                <button type="button" data-reset>Reset test area</button>
            </section>
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
        this.interactButton = this.root.querySelector<HTMLButtonElement>('[data-interact]')!;
        this.resetButton = this.root.querySelector<HTMLButtonElement>('[data-reset]')!;
        this.interactButton.addEventListener('click', onInteract);
        this.resetButton.addEventListener('click', onReset);
        document.body.append(this.root);
    }

    render({ targetLabel, message }: InteractionState) {
        this.prompt.hidden = targetLabel === null;
        this.target.textContent = targetLabel ?? '';
        this.message.hidden = message === null;
        this.message.textContent = message ?? '';
    }

    destroy() {
        this.interactButton.removeEventListener('click', this.onInteract);
        this.resetButton.removeEventListener('click', this.onReset);
        this.root.remove();
    }
}
