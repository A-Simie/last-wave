import type { AppBase } from 'playcanvas';

import './ui/game.css';

const canvas = document.querySelector<HTMLCanvasElement>('#application-canvas');
const status = document.querySelector<HTMLDivElement>('#startup-status');
const message = document.querySelector<HTMLParagraphElement>('#startup-message');
const launchButton = document.querySelector<HTMLButtonElement>('#launch-game');
const loading = document.querySelector<HTMLSpanElement>('#startup-status .loading-ring');

if (!canvas || !status || !message || !launchButton || !loading) throw new Error('The game launcher is missing.');

const events = new AbortController();
let app: AppBase | undefined;
let launching = false;
let disposed = false;

const launch = async () => {
    if (launching || app || disposed) return;
    launching = true;
    launchButton.disabled = true;
    loading.hidden = false;
    message.setAttribute('role', 'status');
    message.textContent = 'Starting Last Wave…';
    try {
        if (import.meta.env.DEV) await import('./inspector');
        const { createGame } = await import('./core/Game');
        if (disposed) return;
        app = await createGame(canvas);
        if (disposed) {
            app.destroy();
            return;
        }
        status.hidden = true;
        canvas.inert = false;
        canvas.focus({ preventScroll: true });
    } catch (error) {
        if (disposed) return;
        console.error('Last Wave could not start.', error);
        message.setAttribute('role', 'alert');
        message.textContent = 'Last Wave could not start. Try again or reload the page.';
        launchButton.textContent = 'Retry launch';
        launchButton.disabled = false;
    } finally {
        launching = false;
        loading.hidden = true;
    }
};

launchButton.addEventListener('click', () => void launch(), { signal: events.signal });
import.meta.hot?.dispose(() => {
    disposed = true;
    events.abort();
    app?.destroy();
});
