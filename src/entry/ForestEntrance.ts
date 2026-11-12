import type { AppBase } from 'playcanvas';

import type { ForestCharacters } from '../core/AssetManager';

import { loadForestAssets, loadLoginModels } from './ForestAssets';
import { ForestAudio } from './ForestAudio';
import { ForestLogin } from './ForestLogin';
import { createForestScene } from './ForestScene';
import { ForestTimeline, prefersSkippingIntro, rememberIntroSkip } from './ForestTimeline';

import './forest.css';

export const openForestEntrance = async (
    app: AppBase,
    characters: ForestCharacters,
    enter: () => void,
    prepare: () => Promise<void>
) => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // The intro plays on every load unless the visitor chose Always skip (or the OS requests reduced motion).
    const alwaysSkip = prefersSkippingIntro(() => localStorage);
    const timeline = new ForestTimeline(motion.matches || alwaysSkip);
    let dialogOpen = false;
    const events = new AbortController();
    const audio = new ForestAudio();
    let assets: Awaited<ReturnType<typeof loadForestAssets>> | undefined;
    let loginModels: Awaited<ReturnType<typeof loadLoginModels>> | undefined;
    let loginLoading: Promise<void> | undefined;
    let scene: ReturnType<typeof createForestScene> | undefined;
    let destroyed = false;
    let entering = false;
    let wasReady = false;
    let ambienceTime = 0;
    const ui = new ForestLogin(
        timeline,
        () => {
            void beginEntry();
        },
        () => {
            audio.toggle(timeline.state.time);
        },
        () => audio.mute(),
        {
            alwaysSkip,
            onChoose: (always) => {
                rememberIntroSkip(() => localStorage, always);
            },
            onDialog: (open) => {
                dialogOpen = open;
                audio.setPaused(open);
            }
        }
    );
    ui.root.append(audio.ambience, audio.dialogue);
    const beginEntry = async () => {
        if (destroyed || entering) return;
        entering = true;
        ui.setEntering(true);
        try {
            // AssetListLoader.destroy removes shared registry listeners; do not overlap the two loaders.
            await loginLoading;
            await prepare();
            if (destroyed) return;
            scene?.destroy();
            scene = undefined;
            enter();
            destroy();
        } catch (error) {
            if (destroyed) return;
            console.error('The story could not be entered.', error);
            if (!scene) ui.root.classList.add('forest-fallback');
            ui.setFeedback('The game could not open. Select Continue locally to retry. Your checkpoint is unchanged.');
        } finally {
            entering = false;
            if (!destroyed) ui.setEntering(false);
        }
    };
    audio.onStateChange = (state, feedback) => ui.setSound(state, feedback);
    const update = (dt: number) => {
        if (destroyed || document.hidden || !document.hasFocus()) return;
        audio.setPaused(dt <= 0 || dialogOpen);
        if (dialogOpen) dt = 0;
        if (motion.matches && !timeline.state.ready) timeline.skip();
        if (!timeline.state.ready) {
            if (wasReady) audio.seek(0);
            if (audio.enabled) timeline.seek(audio.clock);
            else if (!audio.waitingForSound) timeline.update(dt);
        }
        if (Number.isFinite(dt) && dt > 0) ambienceTime += dt;
        const state = timeline.state;
        scene?.update(state.time, motion.matches, ambienceTime);
        if (state.ready && !wasReady) audio.settle();
        audio.update(state.time);
        ui.render(motion.matches);
        wasReady = state.ready;
    };
    const syncActivity = () =>
        audio.setPaused(document.hidden || !document.hasFocus() || app.timeScale === 0 || dialogOpen);
    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        app.off('update', update);
        app.off('destroy', destroy);
        events.abort();
        scene?.destroy();
        assets?.release();
        loginModels?.release();
        timeline.destroy();
        audio.destroy();
        ui.destroy();
    };
    app.once('destroy', destroy);
    window.addEventListener('blur', syncActivity, { signal: events.signal });
    window.addEventListener('focus', syncActivity, { signal: events.signal });
    document.addEventListener('visibilitychange', syncActivity, { signal: events.signal });
    motion.addEventListener(
        'change',
        () => {
            if (motion.matches) {
                timeline.skip();
                update(0);
            }
        },
        { signal: events.signal }
    );
    try {
        assets = await loadForestAssets(app);
        if (destroyed) {
            assets.release();
            return;
        }
        scene = createForestScene(app, assets, characters);
        // The supplied bat, headstone and graveyard extras stream in without delaying the intro.
        loginLoading = loadLoginModels(app)
            .then((loaded) => {
                if (destroyed) {
                    loaded.release();
                    return;
                }
                loginModels = loaded;
                scene?.addLoginModels(loaded.models);
            })
            .catch((error: unknown) => console.warn('Optional login scenery unavailable.', error));
    } catch (error) {
        if (destroyed) return;
        console.warn('Forest scenery unavailable; local entry remains available.', error);
        timeline.skip();
        ui.root.classList.add('forest-fallback');
        ui.setFeedback('The forest scenery could not load. You can still continue locally.');
    }
    if (destroyed) return;
    update(0);
    app.on('update', update);
    void audio.start(timeline.state.time);
};
