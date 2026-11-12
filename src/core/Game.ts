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

import { openForestEntrance } from '../entry/ForestEntrance';
import type { EntryLesson } from '../episodes/episode-01/entry';
import { WAVE_AUTOSTART_DELAY, WAVE_WARNING, warningBeatDuration } from '../episodes/episode-01/wave';
import { WAVE_PLAYER_MARK } from '../episodes/episode-01/waveLayout';
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
import { WaveEndPanel } from '../ui/WaveEndPanel';

import { loadForestCharacters, loadGameAssets, loadPhysics } from './AssetManager';
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
    // Free flow: the wave begins on its own once all three beach discoveries are made, and its warning
    // narration advances by itself until the player has to run.
    let waveCountdown = 0;
    let warningBeat = { id: '', elapsed: 0 };
    const needsLesson = () => !!scene?.entry.lesson && scene.entry.lesson.id !== practisedLesson;
    const syncControls = () => {
        const paused =
            background ||
            transitioning ||
            journalOpen ||
            checkpointOpen ||
            tutorialOpen ||
            needsLesson() ||
            !!scene?.dialogue.state;
        const active =
            paused ||
            !!scene?.opening?.waitingToStart ||
            !!scene?.beach?.wave.blocksControls ||
            !!scene?.cutscene.state;
        scene?.setControlsEnabled(!active, paused);
        scene?.interactions.setSuspended(active || (!!scene?.beach && !scene.beach.wave.calm));
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
            scene.beach?.wave.blocksControls ||
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
        renderWave();
        syncControls();
    };
    const renderBeachAudio = () => {
        const beach = scene?.beach;
        const sound = beach ? (beach.wave.calm ? beach.audio : beach.wave.audio) : null;
        hud.renderBeachAudio(sound?.state ?? null);
        cutscenePanel.renderEnvironment(beach && !beach.wave.calm ? sound!.state : null);
    };
    const renderWave = () => {
        const beach = scene?.beach;
        const state = beach?.wave.progress.state ?? null;
        const ending = state?.phase === 'loading' || state?.phase === 'complete' ? state.phase : null;
        hud.renderWave(
            state,
            beach?.quest.state.status === 'completed',
            cutscenePanel.captionsEnabled || cutscenePanel.muted || beach?.wave.audio.state.phase !== 'playing'
        );
        hud.setCutsceneActive(!!scene?.cutscene.state || !!ending);
        waveEndPanel.render(ending);
        renderBeachAudio();
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
            scene.beach.audio.onStateChange = renderBeachAudio;
            scene.beach.wave.audio.onStateChange = renderBeachAudio;
            scene.beach.wave.onStateChange = renderWave;
            scene.beach.audio.setMuted(cutscenePanel.muted);
            scene.beach.wave.audio.setMuted(cutscenePanel.muted);
        }
        renderBeachAudio();
        scene.entry.onArrivalRequested = beginArrival;
        if (scene.opening) scene.opening.quest.onStateChange = renderQuest;
        scene.cutscene.onStateChange = (state) => {
            scene?.present(state, cutscenePanel.reducedMotion);
            syncControls();
            cutscenePanel.render(state);
            renderWave();
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
        cutscenePanel.render(scene.cutscene.state);
        dialoguePanel.render(scene.dialogue.state);
        renderQuest();
        hud.renderInventory(scene.inventory.state);
    };
    const replaceScene = (snapshot?: FoundationSnapshot) => {
        if (destroyed || transitioning) return;
        transitioning = true;
        syncControls();
        try {
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
                ? scene.beach && !scene.beach.wave.calm && scene.beach.wave.progress.checkpoint === 'before-wave'
                    ? 'Safe beach checkpoint saved. Loading restarts before the warning.'
                    : 'Checkpoint saved.'
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
            checkpointPanel.render(
                result,
                result.save.state.wave === 'after-blackout'
                    ? 'Blackout checkpoint loaded. Close for replay and recovery options.'
                    : 'Checkpoint loaded. Close to resume exploring.'
            );
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
    const replayWave = (replay: boolean) => {
        if (
            !scene?.beach ||
            destroyed ||
            transitioning ||
            background ||
            checkpointOpen ||
            journalOpen ||
            scene.cutscene.state ||
            scene.dialogue.state
        )
            return;
        const snapshot = scene.getSnapshot();
        try {
            replaceScene({ ...snapshot, wave: 'before-wave', playerPosition: [...WAVE_PLAYER_MARK] });
            scene.beach?.audio.start();
            if (replay) scene.beach?.wave.start();
        } catch (error) {
            console.error('The beach replay could not be prepared.', error);
            if (scene.beach?.wave.progress.state.phase === 'complete')
                waveEndPanel.feedback(
                    'Replay could not be prepared. Your blackout and saved checkpoint are still available. Try again.'
                );
            else {
                checkpointOpen = true;
                syncControls();
                checkpointPanel.render(saves.load(), 'Replay failed. Close to resume, or load a saved checkpoint.');
            }
        }
    };
    const startStory = () => {
        if (!scene?.beach) {
            startOpening();
            return;
        }
        if (
            destroyed ||
            transitioning ||
            background ||
            checkpointOpen ||
            journalOpen ||
            scene.dialogue.state ||
            scene.cutscene.state
        )
            return;
        if (scene.beach.wave.progress.running) replayWave(true);
        else scene.beach.wave.start();
    };
    const hud = new GameHud(
        () => scene?.interactions.interact(),
        resetScene,
        toggleJournal,
        toggleCheckpoint,
        startStory,
        () => {
            if (!scene?.beach || destroyed || transitioning || background) return;
            const audio = scene.beach.wave.calm ? scene.beach.audio : scene.beach.wave.audio;
            const retry =
                audio.state.phase === 'blocked' || audio.state.phase === 'unavailable' || audio.state.phase === 'idle';
            cutscenePanel.muted = retry ? false : !audio.state.muted;
            audio.setMuted(cutscenePanel.muted);
            scene.beach.audio.setMuted(cutscenePanel.muted);
            scene.beach.wave.audio.setMuted(cutscenePanel.muted);
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
            if (background || destroyed || transitioning) return;
            scene?.cutscene.advance(cutsceneId, beatId);
        },
        (cutsceneId) => {
            if (background || destroyed || transitioning) return;
            scene?.cutscene.skip(cutsceneId);
        },
        () => scene?.present(scene.cutscene.state, cutscenePanel.reducedMotion),
        (muted) => {
            scene?.opening?.media.setMuted(muted);
            scene?.beach?.audio.setMuted(muted);
            scene?.beach?.wave.audio.setMuted(muted);
        },
        () => {
            if (scene?.beach) scene.beach.wave.audio.start();
            else scene?.opening?.media.retry();
        }
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
    const waveEndPanel = new WaveEndPanel(
        () => {
            if (!scene?.beach || destroyed || transitioning || scene.beach.wave.progress.state.phase !== 'complete')
                return;
            const result = saves.save(scene.getSnapshot());
            waveEndPanel.feedback(
                result.status === 'ready'
                    ? 'Blackout checkpoint saved.'
                    : 'Checkpoint could not be saved. The previous checkpoint is intact. Try again.'
            );
        },
        () => replayWave(true),
        () => replayWave(false),
        toggleCheckpoint
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
        const beach = scene.beach;
        const quiet = !journalOpen && !checkpointOpen && !tutorialOpen && !scene.dialogue.state;
        if (beach?.wave.calm && beach.quest.state.status === 'completed' && quiet && !scene.cutscene.state) {
            waveCountdown += Math.min(dt, 0.1);
            if (waveCountdown >= WAVE_AUTOSTART_DELAY) {
                waveCountdown = 0;
                beach.wave.start();
            }
        } else waveCountdown = 0;
        const playing = scene.cutscene.state;
        if (playing?.cutsceneId === WAVE_WARNING.id && quiet) {
            if (warningBeat.id !== playing.beat.id) warningBeat = { id: playing.beat.id, elapsed: 0 };
            warningBeat.elapsed += Math.min(dt, 0.1);
            if (warningBeat.elapsed >= warningBeatDuration(playing.beat.text))
                scene.cutscene.advance(playing.cutsceneId, playing.beat.id);
        } else if (!playing) warningBeat = { id: '', elapsed: 0 };
        const wave = scene.beach?.wave;
        cutscenePanel.renderWave(wave?.progress.state ?? null);
        if (wave)
            hud.renderWave(
                wave.progress.state,
                scene.beach!.quest.state.status === 'completed',
                cutscenePanel.captionsEnabled || cutscenePanel.muted || wave.audio.state.phase !== 'playing'
            );
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
        waveEndPanel.destroy();
        dialoguePanel.destroy();
        hud.destroy();
    });

    try {
        const characters = await loadForestCharacters(app);
        // AppBase.start installs the Ammo world before scene bodies are created.
        app.start();
        await openForestEntrance(
            app,
            characters,
            () => replaceScene(),
            async () => {
                assets = await loadGameAssets(app);
            }
        );
        return app;
    } catch (error) {
        app.destroy();
        throw error;
    }
};
