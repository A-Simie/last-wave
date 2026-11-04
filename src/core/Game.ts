import type { KeyboardEvent } from 'playcanvas';
import {
    AppBase,
    AppOptions,
    CameraComponentSystem,
    CollisionComponentSystem,
    Color,
    EVENT_KEYDOWN,
    FILLMODE_FILL_WINDOW,
    KEY_E,
    KEY_J,
    Keyboard,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    RigidBodyComponentSystem,
    ScriptComponentSystem,
    createGraphicsDevice
} from 'playcanvas';

import { createFoundationScene } from '../scenes/FoundationScene';
import type { FoundationScene } from '../scenes/FoundationScene';
import { DialoguePanel } from '../ui/DialoguePanel';
import { GameHud } from '../ui/GameHud';
import { JournalPanel } from '../ui/JournalPanel';

import { loadPhysics } from './AssetManager';
import { SceneManager } from './SceneManager';

export const createGame = async (canvas: HTMLCanvasElement): Promise<AppBase> => {
    await loadPhysics();

    const device = await createGraphicsDevice(canvas);
    const options = new AppOptions();
    options.graphicsDevice = device;
    options.keyboard = new Keyboard(window);
    options.componentSystems = [
        RenderComponentSystem,
        CameraComponentSystem,
        LightComponentSystem,
        ScriptComponentSystem,
        CollisionComponentSystem,
        RigidBodyComponentSystem
    ];

    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
    app.scene.ambientLight = new Color(0.28, 0.32, 0.38);
    app.systems.rigidbody!.gravity.set(0, -18, 0);

    const scenes = new SceneManager(app);
    let scene: FoundationScene | undefined;
    let journalOpen = false;
    const syncControls = () => {
        const active = journalOpen || !!scene?.dialogue.state;
        scene?.setControlsEnabled(!active);
        scene?.interactions.setSuspended(active);
        if (active && document.pointerLockElement === canvas) document.exitPointerLock();
    };
    const closeJournal = () => {
        if (!journalOpen) return;
        journalOpen = false;
        journalPanel.render(null);
        syncControls();
        if (!scene?.dialogue.state) canvas.focus({ preventScroll: true });
    };
    const toggleJournal = () => {
        if (!scene || scene.dialogue.state) return;
        if (journalOpen) {
            closeJournal();
            return;
        }
        journalOpen = true;
        syncControls();
        journalPanel.render(scene.inventory.state);
    };
    const resetScene = () => {
        scene?.dialogue.close();
        closeJournal();
        scene = undefined;
        scene = scenes.load('foundation-scene', createFoundationScene);
        scene.interactions.onStateChange = (state) => hud.render(state);
        scene.quest.onStateChange = (state) => hud.renderQuest(state);
        scene.inventory.onStateChange = (state) => {
            hud.renderInventory(state);
            if (journalOpen) journalPanel.render(state);
        };
        scene.dialogue.onStateChange = (state) => {
            syncControls();
            dialoguePanel.render(state);
            if (!state && !journalOpen) canvas.focus({ preventScroll: true });
        };
        hud.render(scene.interactions.state);
        hud.renderQuest(scene.quest.state);
        hud.renderInventory(scene.inventory.state);
        canvas.focus({ preventScroll: true });
    };
    const hud = new GameHud(() => scene?.interactions.interact(), resetScene, toggleJournal);
    const dialoguePanel = new DialoguePanel(
        (nodeId, choiceId) => {
            scene?.dialogue.choose(nodeId, choiceId);
        },
        () => scene?.dialogue.close()
    );
    const journalPanel = new JournalPanel(closeJournal);

    const onKeyDown = ({ key, event }: KeyboardEvent) => {
        if (!event || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (key === KEY_J) {
            event.preventDefault();
            toggleJournal();
            return;
        }
        if (key !== KEY_E || document.pointerLockElement !== canvas) return;
        event.preventDefault();
        scene?.interactions.interact();
    };
    const resize = () => app.resizeCanvas();
    app.keyboard!.on(EVENT_KEYDOWN, onKeyDown);
    window.addEventListener('resize', resize);
    app.once('destroy', () => {
        window.removeEventListener('resize', resize);
        app.keyboard?.off(EVENT_KEYDOWN, onKeyDown);
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        if (scene) scene.dialogue.onStateChange = null;
        journalOpen = false;
        scenes.destroy();
        scene = undefined;
        journalPanel.destroy();
        dialoguePanel.destroy();
        hud.destroy();
    });

    try {
        // AppBase.start installs the Ammo world before scene bodies are created.
        app.start();
        resetScene();
        return app;
    } catch (error) {
        app.destroy();
        throw error;
    }
};
