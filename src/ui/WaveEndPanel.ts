export class WaveEndPanel {
    private readonly root = document.createElement('dialog');
    private readonly events = new AbortController();
    private phase: 'loading' | 'complete' | null = null;

    constructor(onSave: () => void, onReplay: () => void, onExplore: () => void, onCheckpoint: () => void) {
        this.root.id = 'wave-ending';
        this.root.className = 'transition-panel wave-ending';
        this.root.setAttribute('aria-labelledby', 'wave-ending-title');
        this.root.tabIndex = -1;
        this.root.innerHTML = `
            <img class="startup-brand" src="${import.meta.env.BASE_URL}assets/last-wave-logo.svg" width="360" height="103" alt="Last Wave" />
            <p class="eyebrow">Episode 01</p>
            <h2 id="wave-ending-title">The day the ocean disappeared</h2>
            <div class="loading-ring" data-wave-loading aria-hidden="true"></div>
            <p data-wave-ending-copy role="status" aria-live="polite"></p>
            <div class="wave-ending-actions" data-wave-ending-actions hidden>
                <button type="button" data-wave-save>Save blackout checkpoint</button>
                <button type="button" data-wave-replay>Replay wave & evacuation</button>
                <button type="button" data-wave-explore>Return to the calm beach</button>
                <button type="button" data-wave-checkpoint>Save / load menu</button>
            </div>
            <p data-wave-save-policy hidden>Saving replaces the local checkpoint. Replay keeps your discoveries and leaves the saved checkpoint intact.</p>
            <p data-wave-ending-feedback role="status" aria-live="polite"></p>
        `;
        const options = { signal: this.events.signal };
        this.root.querySelector('[data-wave-save]')!.addEventListener('click', onSave, options);
        this.root.querySelector('[data-wave-replay]')!.addEventListener('click', onReplay, options);
        this.root.querySelector('[data-wave-explore]')!.addEventListener('click', onExplore, options);
        this.root.querySelector('[data-wave-checkpoint]')!.addEventListener('click', onCheckpoint, options);
        this.root.addEventListener('cancel', (event) => event.preventDefault(), options);
        document.body.append(this.root);
    }

    render(phase: 'loading' | 'complete' | null) {
        if (this.phase === phase) return;
        this.phase = phase;
        this.feedback('');
        if (!phase) {
            this.root.close();
            return;
        }
        this.root.dataset.phase = phase;
        this.root.setAttribute('aria-busy', String(phase === 'loading'));
        this.root.querySelector<HTMLElement>('[data-wave-loading]')!.hidden = phase !== 'loading';
        this.root.querySelector<HTMLElement>('[data-wave-ending-actions]')!.hidden = phase !== 'complete';
        this.root.querySelector<HTMLElement>('[data-wave-save-policy]')!.hidden = phase !== 'complete';
        this.root.querySelector('[data-wave-ending-copy]')!.textContent =
            phase === 'loading'
                ? 'Everything goes quiet…'
                : 'To be continued. This story segment ends at the blackout.';
        if (!this.root.open) this.root.showModal();
        if (phase === 'complete')
            this.root.querySelector<HTMLButtonElement>('[data-wave-save]')!.focus({ preventScroll: true });
        else this.root.focus({ preventScroll: true });
    }

    feedback(message: string) {
        this.root.querySelector('[data-wave-ending-feedback]')!.textContent = message;
    }

    destroy() {
        this.events.abort();
        this.root.close();
        this.root.remove();
    }
}
