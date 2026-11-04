import { createGame } from './core/Game';
import './ui/game.css';

const canvas = document.querySelector<HTMLCanvasElement>('#application-canvas');
const status = document.querySelector<HTMLDivElement>('#startup-status');

if (!canvas) throw new Error('The game canvas is missing.');

try {
    const app = await createGame(canvas);
    status?.remove();
    import.meta.hot?.dispose(() => app.destroy());
} catch (error) {
    console.error('Last Wave could not start.', error);
    if (status) {
        status.setAttribute('role', 'alert');
        status.textContent = 'Last Wave could not start. Reload the page to try again. See the console for details.';
    }
}
