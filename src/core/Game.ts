import type { KeyboardEvent } from 'playcanvas';
import {
    AnimComponentSystem,
    AppBase,
    AppOptions,
    BatchManager,
    CameraComponentSystem,
    CollisionComponentSystem,
    Color,
    ContainerHandler,
    EVENT_KEYDOWN,
    FILLMODE_FILL_WINDOW,
    FOG_LINEAR,
    KEY_E,
    KEY_J,
    KEY_P,
    Keyboard,
    LightComponentSystem,
    RenderComponentSystem,
    RESOLUTION_AUTO,
    RigidBodyComponentSystem,
    ScriptComponentSystem,
    TextureHandler,
    createGraphicsDevice
} from 'playcanvas';

import { createFoundationScene } from '../scenes/FoundationScene';
import type { FoundationScene } from '../scenes/FoundationScene';
import type { FoundationSnapshot } from '../scenes/FoundationState';
import { SaveSystem } from '../systems/SaveSystem';
import { CheckpointPanel } from '../ui/CheckpointPanel';
import { CutscenePanel } from '../ui/CutscenePanel';
import { DialoguePanel } from '../ui/DialoguePanel';
import { GameHud } from '../ui/GameHud';
import { JournalPanel } from '../ui/JournalPanel';

import { loadGameAssets, loadPhysics } from './AssetManager';
import type { GameAssets } from './AssetManager';
import { SceneManager } from './SceneManager';

export const createGame = async (canvas: HTMLCanvasElement): Promise<AppBase> => {
    await loadPhysics();

    const device = await createGraphicsDevice(canvas);
    const options = new AppOptions();
    options.graphicsDevice = device;
    options.batchManager = BatchManager;
    options.keyboard = new Keyboard(window);
    options.componentSystems = [
        RenderComponentSystem,
        CameraComponentSystem,
        LightComponentSystem,
        ScriptComponentSystem,
        AnimComponentSystem,
        CollisionComponentSystem,
        RigidBodyComponentSystem
    ];
    options.resourceHandlers = [TextureHandler, ContainerHandler];

    const app = new AppBase(canvas);
    app.init(options);
    app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(RESOLUTION_AUTO);
    app.scene.ambientLight = new Color(0.42, 0.47, 0.53);
    app.scene.fog.type = FOG_LINEAR;
    app.scene.fog.color = new Color(0.67, 0.78, 0.83);
    app.scene.fog.start = 45;
    app.scene.fog.end = 85;
    app.systems.rigidbody!.gravity.set(0, -18, 0);

    const scenes = new SceneManager(app);
    const saves = new SaveSystem(() => window.localStorage);
    let assets: GameAssets;
    let scene: FoundationScene | undefined;
    let journalOpen = false;
    let checkpointOpen = false;
    let transitioning = false;
    let destroyed = false;
    const syncControls = () => {
        const active =
            transitioning ||
            journalOpen ||
            checkpointOpen ||
            !!scene?.opening.waitingToStart ||
            !!scene?.dialogue.state ||
            !!scene?.opening.cutscene.state;
        scene?.setControlsEnabled(!active);
        scene?.interactions.setSuspended(active);
        if (active && document.pointerLockElement === canvas) document.exitPointerLock();
    };
    const closeJournal = () => {
        if (!journalOpen) return;
        journalOpen = false;
        journalPanel.render(null);
        syncControls();
        if (!scene?.dialogue.state && !checkpointOpen && !transitioning) canvas.focus({ preventScroll: true });
    };
    const toggleJournal = () => {
        if (
            !scene ||
            destroyed ||
            transitioning ||
            checkpointOpen ||
            scene.dialogue.state ||
            scene.opening.cutscene.state
        )
            return;
        if (journalOpen) {
            closeJournal();
            return;
        }
        journalOpen = true;
        syncControls();
        journalPanel.render(scene.inventory.state);
    };
    const closeCheckpoint = () => {
        if (!checkpointOpen || transitioning) return;
        checkpointOpen = false;
        checkpointPanel.render(null);
        syncControls();
        if (!scene?.dialogue.state && !journalOpen) canvas.focus({ preventScroll: true });
    };
    const toggleCheckpoint = () => {
        if (!scene || destroyed || transitioning || journalOpen || scene.dialogue.state || scene.opening.cutscene.state)
            return;
        if (checkpointOpen) {
            closeCheckpoint();
            return;
        }
        checkpointOpen = true;
        syncControls();
        checkpointPanel.render(saves.load());
    };
    const renderQuest = () => {
        if (!scene) return;
        const opening = scene.opening.quest.state;
        const tutorial = scene.quest.state;
        hud.renderQuest(opening.status === 'completed' && tutorial.status !== 'inactive' ? tutorial : opening);
        hud.renderStory(opening);
    };
    const bindScene = () => {
        if (!scene) return;
        scene.interactions.onStateChange = (state) => hud.render(state);
        scene.quest.onStateChange = renderQuest;
        scene.opening.quest.onStateChange = renderQuest;
        scene.opening.cutscene.onStateChange = (state) => {
            scene?.opening.present(state, cutscenePanel.reducedMotion);
            syncControls();
            hud.setCutsceneActive(!!state);
            cutscenePanel.render(state);
            if (!state && !transitioning) canvas.focus({ preventScroll: true });
        };
        scene.opening.media.onStateChange = (state) => cutscenePanel.renderMedia(state);
        scene.opening.media.setMuted(cutscenePanel.muted);
        scene.inventory.onStateChange = (state) => {
            hud.renderInventory(state);
            if (journalOpen) journalPanel.render(state);
        };
        scene.dialogue.onStateChange = (state) => {
            syncControls();
            dialoguePanel.render(state);
            if (!state && !journalOpen && !checkpointOpen && !transitioning) canvas.focus({ preventScroll: true });
        };
        hud.render(scene.interactions.state);
        renderQuest();
        hud.setCutsceneActive(false);
        hud.renderInventory(scene.inventory.state);
    };
    const replaceScene = (snapshot?: FoundationSnapshot) => {
        if (destroyed || transitioning) return;
        transitioning = true;
        syncControls();
        try {
            scene?.dialogue.close();
            scene?.opening.cutscene.cancel();
            closeJournal();
            scene = scenes.load('foundation-scene', (root) => createFoundationScene(root, assets, snapshot));
            bindScene();
        } finally {
            transitioning = false;
            syncControls();
            if (!checkpointOpen) canvas.focus({ preventScroll: true });
        }
    };
    const resetScene = () => {
        if (!scene || destroyed || transitioning) return;
        closeCheckpoint();
        try {
            replaceScene();
        } catch (error) {
            console.error('The café could not be reset.', error);
            checkpointOpen = true;
            syncControls();
            checkpointPanel.render(saves.load(), 'Reset failed. Your current area is still available.');
        }
    };
    const saveCheckpoint = () => {
        if (!scene || destroyed || transitioning || !checkpointOpen) return;
        const result = saves.save(scene.getSnapshot());
        const message =
            result.status === 'ready'
                ? 'Checkpoint saved.'
                : result.status === 'unavailable'
                  ? 'Checkpoint could not be saved. Browser storage may be blocked or full.'
                  : 'Current state could not be saved. Move to a clear spot and try again.';
        checkpointPanel.render(result.status === 'ready' ? result : saves.load(), message);
    };
    const loadCheckpoint = () => {
        if (destroyed || transitioning || !checkpointOpen) return;
        const result = saves.load();
        if (result.status !== 'ready') {
            checkpointPanel.render(result);
            return;
        }
        try {
            replaceScene(result.save.state);
            scene?.opening.media.start(true);
            checkpointPanel.render(result, 'Checkpoint loaded. Close to resume exploring.');
        } catch (error) {
            console.error('The checkpoint could not be loaded.', error);
            checkpointPanel.render(result, 'Load failed. Your current area is still available.');
        }
    };
    const deleteCheckpoint = () => {
        if (destroyed || transitioning || !checkpointOpen) return;
        const deleted = saves.clear();
        checkpointPanel.render(
            saves.load(),
            deleted
                ? 'Checkpoint deleted. Your current progress is still available.'
                : 'Checkpoint could not be deleted.'
        );
    };
    const startOpening = () => {
        if (
            !scene ||
            destroyed ||
            transitioning ||
            journalOpen ||
            checkpointOpen ||
            scene.dialogue.state ||
            scene.opening.cutscene.state
        )
            return;
        try {
            scene.opening.start();
        } catch (error) {
            console.error('The story opening could not be started.', error);
            checkpointOpen = true;
            syncControls();
            checkpointPanel.render(saves.load(), 'The opening could not be started. Close this menu and try again.');
        }
    };
    const hud = new GameHud(
        () => scene?.interactions.interact(),
        resetScene,
        toggleJournal,
        toggleCheckpoint,
        startOpening
    );
    const dialoguePanel = new DialoguePanel(
        (nodeId, choiceId) => {
            scene?.dialogue.choose(nodeId, choiceId);
        },
        () => scene?.dialogue.close()
    );
    const journalPanel = new JournalPanel(closeJournal);
    const checkpointPanel = new CheckpointPanel(saveCheckpoint, loadCheckpoint, deleteCheckpoint, closeCheckpoint);
    const cutscenePanel = new CutscenePanel(
        (cutsceneId, beatId) => {
            scene?.opening.cutscene.advance(cutsceneId, beatId);
        },
        (cutsceneId) => {
            scene?.opening.cutscene.skip(cutsceneId);
        },
        () => scene?.opening.present(scene.opening.cutscene.state, cutscenePanel.reducedMotion),
        (muted) => scene?.opening.media.setMuted(muted),
        () => scene?.opening.media.retry()
    );

    const onKeyDown = ({ key, event }: KeyboardEvent) => {
        if (!event || destroyed || transitioning || event.repeat || event.ctrlKey || event.altKey || event.metaKey)
            return;
        if (key === KEY_P) {
            event.preventDefault();
            toggleCheckpoint();
            return;
        }
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
    const updatePresentation = (dt: number) => {
        if (!scene || transitioning || destroyed) return;
        scene.opening.update(dt);
        const anchors = scene.getScreenAnchors();
        cutscenePanel.setSpeakerAnchor(anchors.speaker);
        hud.setPromptAnchor(anchors.interaction);
    };
    app.on('update', updatePresentation);
    app.keyboard!.on(EVENT_KEYDOWN, onKeyDown);
    window.addEventListener('resize', resize);
    app.once('destroy', () => {
        destroyed = true;
        app.off('update', updatePresentation);
        window.removeEventListener('resize', resize);
        app.keyboard?.off(EVENT_KEYDOWN, onKeyDown);
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        if (scene) {
            scene.dialogue.onStateChange = null;
            scene.opening.cutscene.onStateChange = null;
        }
        journalOpen = false;
        checkpointOpen = false;
        scenes.destroy();
        scene = undefined;
        journalPanel.destroy();
        checkpointPanel.destroy();
        cutscenePanel.destroy();
        dialoguePanel.destroy();
        hud.destroy();
    });

    try {
        assets = await loadGameAssets(app);
        // AppBase.start installs the Ammo world before scene bodies are created.
        app.start();
        replaceScene();
        return app;
    } catch (error) {
        app.destroy();
        throw error;
    }
};
