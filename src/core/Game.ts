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

import type { EntryLesson } from '../episodes/episode-01/entry';
import { createFoundationScene } from '../scenes/FoundationScene';
import type { FoundationScene } from '../scenes/FoundationScene';
import type { FoundationSnapshot } from '../scenes/FoundationState';
import { createBeachArrivalSnapshot } from '../scenes/FoundationState';
import { SaveSystem } from '../systems/SaveSystem';
import { CheckpointPanel } from '../ui/CheckpointPanel';
import { CutscenePanel } from '../ui/CutscenePanel';
import { DialoguePanel } from '../ui/DialoguePanel';
import { GameHud } from '../ui/GameHud';
import { JournalPanel } from '../ui/JournalPanel';
import { TransitionPanel } from '../ui/TransitionPanel';
import { TutorialPanel } from '../ui/TutorialPanel';

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
    let background = false;
    let resumeState: { timeScale: number; autoRender: boolean; renderNextFrame: boolean } | null = null;
    let tutorialOpen = false;
    let practisedLesson: EntryLesson['id'] | null = null;
    let arrival: { elapsed: number; ready: boolean; failed: boolean } | null = null;
    const needsLesson = () => !!scene?.entry.lesson && scene.entry.lesson.id !== practisedLesson;
    const syncControls = () => {
        const active =
            background ||
            transitioning ||
            journalOpen ||
            checkpointOpen ||
            tutorialOpen ||
            needsLesson() ||
            !!scene?.opening?.waitingToStart ||
            !!scene?.dialogue.state ||
            !!scene?.cutscene.state;
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
            tutorialOpen ||
            needsLesson() ||
            scene.dialogue.state ||
            scene.cutscene.state
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
        if (
            !scene ||
            destroyed ||
            transitioning ||
            journalOpen ||
            tutorialOpen ||
            needsLesson() ||
            scene.dialogue.state ||
            scene.cutscene.state
        )
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
        const opening = scene.opening?.quest.state ?? null;
        hud.renderQuest(
            scene.beach?.quest.state ?? (opening && opening.completedCount < 2 ? opening : scene.entry.quest.state),
            opening?.status === 'inactive'
        );
        hud.renderOptionalQuest(scene.area === 'tideline' ? scene.quest.state : null);
        hud.renderStory(opening, scene.area);
        syncControls();
    };
    const bindScene = () => {
        if (!scene) return;
        practisedLesson = null;
        tutorialOpen = false;
        tutorialPanel.render(null);
        scene.interactions.onStateChange = (state) => hud.render(state);
        scene.quest.onStateChange = renderQuest;
        scene.entry.quest.onStateChange = renderQuest;
        if (scene.beach) {
            scene.beach.quest.onStateChange = renderQuest;
            scene.beach.audio.onStateChange = (state) => hud.renderBeachAudio(state);
            scene.beach.audio.setMuted(cutscenePanel.muted);
        }
        hud.renderBeachAudio(scene.beach?.audio.state ?? null);
        scene.entry.onArrivalRequested = beginArrival;
        if (scene.opening) scene.opening.quest.onStateChange = renderQuest;
        scene.cutscene.onStateChange = (state) => {
            scene?.present(state, cutscenePanel.reducedMotion);
            syncControls();
            hud.setCutsceneActive(!!state);
            cutscenePanel.render(state);
            if (!state && !transitioning) canvas.focus({ preventScroll: true });
        };
        if (scene.opening) {
            scene.opening.media.onStateChange = (state) => cutscenePanel.renderMedia(state);
            scene.opening.media.setMuted(cutscenePanel.muted);
        }
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
            scene?.cutscene.cancel();
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
            if (scene?.opening && !scene.opening.waitingToStart) scene.opening.media.start(true);
            scene?.beach?.audio.start();
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
            tutorialOpen ||
            needsLesson() ||
            scene.dialogue.state ||
            scene.cutscene.state ||
            !scene.opening
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
        startOpening,
        () => {
            if (!scene?.beach || destroyed || transitioning || background) return;
            const audio = scene.beach.audio;
            const retry =
                audio.state.phase === 'blocked' || audio.state.phase === 'unavailable' || audio.state.phase === 'idle';
            cutscenePanel.muted = retry ? false : !audio.state.muted;
            audio.setMuted(cutscenePanel.muted);
            if (retry) audio.start();
        }
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
            scene?.cutscene.advance(cutsceneId, beatId);
        },
        (cutsceneId) => {
            scene?.cutscene.skip(cutsceneId);
        },
        () => scene?.present(scene.cutscene.state, cutscenePanel.reducedMotion),
        (muted) => {
            scene?.opening?.media.setMuted(muted);
            scene?.beach?.audio.setMuted(muted);
        },
        () => scene?.opening?.media.retry()
    );
    const tutorialPanel = new TutorialPanel((id) => {
        if (!tutorialOpen || scene?.entry.lesson?.id !== id) return;
        practisedLesson = id;
        tutorialOpen = false;
        tutorialPanel.render(null);
        syncControls();
        canvas.focus({ preventScroll: true });
    });
    const beginArrival = () => {
        if (
            !scene ||
            destroyed ||
            transitioning ||
            !scene.entry.canQueue ||
            scene.entry.quest.state.completedCount !== 7
        )
            return;
        transitioning = true;
        arrival = { elapsed: 0, ready: false, failed: false };
        syncControls();
        transitionPanel.render('loading');
    };
    const transitionPanel = new TransitionPanel(
        () => {
            if (!arrival?.failed || destroyed) return;
            arrival = { elapsed: 0, ready: false, failed: false };
            transitionPanel.render('loading');
        },
        () => {
            if (!arrival?.failed || destroyed) return;
            arrival = null;
            transitioning = false;
            transitionPanel.render(null);
            syncControls();
            canvas.focus({ preventScroll: true });
        }
    );

    const onKeyDown = ({ key, event }: KeyboardEvent) => {
        if (
            !event ||
            destroyed ||
            background ||
            transitioning ||
            event.repeat ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        )
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
    const syncActivity = () => {
        const inactive = document.hidden || !document.hasFocus();
        if (destroyed || inactive === background) return;
        background = inactive;
        if (background) {
            resumeState = {
                timeScale: app.timeScale,
                autoRender: app.autoRender,
                renderNextFrame: app.renderNextFrame
            };
            app.timeScale = 0;
            app.autoRender = false;
            app.renderNextFrame = false;
        } else if (resumeState) {
            app.timeScale = resumeState.timeScale;
            app.autoRender = resumeState.autoRender;
            app.renderNextFrame = resumeState.renderNextFrame;
            resumeState = null;
        }
        syncControls();
    };
    const resize = () => app.resizeCanvas();
    const updatePresentation = (dt: number) => {
        if (!scene || destroyed || background) return;
        if (arrival) {
            if (arrival.failed || document.hidden || dt <= 0) return;
            arrival.elapsed += Math.min(dt, 0.1);
            if (!arrival.ready && arrival.elapsed >= 0.35) {
                try {
                    const snapshot = createBeachArrivalSnapshot(scene.getSnapshot());
                    scene = scenes.load('foundation-scene', (root) => createFoundationScene(root, assets, snapshot));
                    bindScene();
                    arrival.ready = true;
                } catch (error) {
                    console.error('The beach could not be entered.', error);
                    arrival.failed = true;
                    transitionPanel.render('error');
                    return;
                }
            }
            if (arrival.ready && arrival.elapsed >= 0.9) {
                arrival = null;
                transitioning = false;
                transitionPanel.render(null);
                syncControls();
                scene.beach?.audio.start();
                canvas.focus({ preventScroll: true });
            }
            return;
        }
        if (transitioning) return;
        if (
            needsLesson() &&
            !tutorialOpen &&
            !journalOpen &&
            !checkpointOpen &&
            !scene.dialogue.state &&
            !scene.cutscene.state
        ) {
            tutorialOpen = true;
            syncControls();
            tutorialPanel.render(scene.entry.lesson);
        }
        scene.update(dt);
        hud.renderNavigation(scene.getNavigation());
        const anchors = scene.getScreenAnchors();
        cutscenePanel.setSpeakerAnchor(anchors.speaker);
        hud.setPromptAnchor(anchors.interaction);
    };
    app.on('update', updatePresentation);
    app.keyboard!.on(EVENT_KEYDOWN, onKeyDown);
    window.addEventListener('resize', resize);
    window.addEventListener('focus', syncActivity);
    window.addEventListener('blur', syncActivity);
    document.addEventListener('visibilitychange', syncActivity);
    syncActivity();
    app.once('destroy', () => {
        destroyed = true;
        app.off('update', updatePresentation);
        window.removeEventListener('resize', resize);
        window.removeEventListener('focus', syncActivity);
        window.removeEventListener('blur', syncActivity);
        document.removeEventListener('visibilitychange', syncActivity);
        app.keyboard?.off(EVENT_KEYDOWN, onKeyDown);
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        if (scene) {
            scene.dialogue.onStateChange = null;
            scene.cutscene.onStateChange = null;
        }
        journalOpen = false;
        checkpointOpen = false;
        arrival = null;
        scenes.destroy();
        scene = undefined;
        journalPanel.destroy();
        checkpointPanel.destroy();
        cutscenePanel.destroy();
        tutorialPanel.destroy();
        transitionPanel.destroy();
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
