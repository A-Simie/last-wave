export class TransitionPanel {
    private readonly root = document.createElement('dialog');
    private readonly events = new AbortController();
    private failed = false;

    constructor(onRetry: () => void, onBack: () => void) {
        this.root.id = 'beach-transition';
        this.root.className = 'transition-panel';
        this.root.tabIndex = -1;
        this.root.setAttribute('aria-labelledby', 'transition-title');
        this.root.innerHTML = `
            <img class="startup-brand" src="${import.meta.env.BASE_URL}assets/last-wave-logo.svg" width="360" height="103" alt="Last Wave" />
            <div class="loading-ring" data-transition-spinner aria-hidden="true"></div>
            <h2 id="transition-title">Walking down to the beach</h2>
            <p data-transition-message role="status" aria-live="polite"></p>
            <div class="transition-actions" data-transition-actions hidden>
                <button type="button" data-transition-retry>Retry entry</button>
                <button type="button" data-transition-back>Back to the queue</button>
            </div>
        `;
        const options = { signal: this.events.signal };
        this.root.querySelector('[data-transition-retry]')!.addEventListener('click', onRetry, options);
        this.root.querySelector('[data-transition-back]')!.addEventListener('click', onBack, options);
        this.root.addEventListener(
            'cancel',
            (event) => {
                event.preventDefault();
                if (this.failed) onBack();
            },
            options
        );
        document.body.append(this.root);
    }

    render(phase: 'loading' | 'error' | null) {
        if (!phase) {
            this.root.close();
            return;
        }
        this.failed = phase === 'error';
        this.root.dataset.phase = phase;
        this.root.setAttribute('aria-busy', String(!this.failed));
        this.root.querySelector<HTMLElement>('[data-transition-spinner]')!.hidden = this.failed;
        this.root.querySelector<HTMLElement>('[data-transition-actions]')!.hidden = !this.failed;
        this.root.querySelector('#transition-title')!.textContent = this.failed
            ? 'The beach could not be loaded'
            : 'Walking down to the beach';
        this.root.querySelector('[data-transition-message]')!.textContent = this.failed
            ? 'Your passes and current area are still available. Try again or return to the queue.'
            : 'You and your friend · Seafront Beach';
        if (!this.root.open) this.root.showModal();
        if (this.failed)
            this.root.querySelector<HTMLButtonElement>('[data-transition-retry]')!.focus({ preventScroll: true });
        else this.root.focus({ preventScroll: true });
    }

    destroy() {
        this.events.abort();
        this.root.close();
        this.root.remove();
    }
}
