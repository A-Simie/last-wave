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
    const resetScene = () => {
        scene?.dialogue.close();
        scene = undefined;
        scene = scenes.load('foundation-scene', createFoundationScene);
        scene.interactions.onStateChange = (state) => hud.render(state);
        scene.quest.onStateChange = (state) => hud.renderQuest(state);
        scene.dialogue.onStateChange = (state) => {
            const active = state !== null;
            scene?.setControlsEnabled(!active);
            scene?.interactions.setSuspended(active);
            if (active && document.pointerLockElement === canvas) document.exitPointerLock();
            dialoguePanel.render(state);
            if (!active) canvas.focus({ preventScroll: true });
        };
        hud.render(scene.interactions.state);
        hud.renderQuest(scene.quest.state);
        canvas.focus({ preventScroll: true });
    };
    const hud = new GameHud(() => scene?.interactions.interact(), resetScene);
    const dialoguePanel = new DialoguePanel(
        (nodeId, choiceId) => {
            scene?.dialogue.choose(nodeId, choiceId);
        },
        () => scene?.dialogue.close()
    );

    const onKeyDown = ({ key, event }: KeyboardEvent) => {
        if (key !== KEY_E || !event || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (document.pointerLockElement !== canvas) return;
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
        scenes.destroy();
        scene = undefined;
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
