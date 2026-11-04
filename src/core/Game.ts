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
import type { InteractionSystem } from '../systems/InteractionSystem';
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
    let interactions: InteractionSystem | undefined;
    const resetScene = () => {
        interactions = scenes.load('foundation-scene', createFoundationScene);
        interactions.onStateChange = (state) => hud.render(state);
        hud.render(interactions.state);
        canvas.focus({ preventScroll: true });
    };
    const hud = new GameHud(() => interactions?.interact(), resetScene);

    const onKeyDown = ({ key, event }: KeyboardEvent) => {
        if (key !== KEY_E || !event || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
        if (document.pointerLockElement !== canvas) return;
        event.preventDefault();
        interactions?.interact();
    };
    const resize = () => app.resizeCanvas();
    app.keyboard!.on(EVENT_KEYDOWN, onKeyDown);
    window.addEventListener('resize', resize);
    app.once('destroy', () => {
        window.removeEventListener('resize', resize);
        app.keyboard?.off(EVENT_KEYDOWN, onKeyDown);
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        scenes.destroy();
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
