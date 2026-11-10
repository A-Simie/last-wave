import type { AppBase } from 'playcanvas';

import type { ForestCharacters } from '../core/AssetManager';

import { loadForestAssets } from './ForestAssets';
import { ForestAudio } from './ForestAudio';
import { ForestLogin } from './ForestLogin';
import { createForestScene } from './ForestScene';
import { ForestTimeline, hasSeenForest, rememberForest } from './ForestTimeline';

import './forest.css';

export const openForestEntrance = async (
    app: AppBase,
    characters: ForestCharacters,
    enter: () => void,
    prepare: () => Promise<void>
) => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timeline = new ForestTimeline(motion.matches || hasSeenForest(() => localStorage));
    const events = new AbortController();
    const audio = new ForestAudio();
    let assets: Awaited<ReturnType<typeof loadForestAssets>> | undefined;
    let scene: ReturnType<typeof createForestScene> | undefined;
    let destroyed = false;
    let entering = false;
    let remembered = false;
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
        () => audio.mute()
    );
    ui.root.append(audio.ambience, audio.dialogue);
    const beginEntry = async () => {
        if (destroyed || entering) return;
        entering = true;
        ui.setEntering(true);
        try {
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
        audio.setPaused(dt <= 0);
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
        if (state.ready && !remembered) {
            remembered = true;
            rememberForest(() => localStorage);
        }
        wasReady = state.ready;
    };
    const syncActivity = () => audio.setPaused(document.hidden || !document.hasFocus() || app.timeScale === 0);
    const destroy = () => {
        if (destroyed) return;
        destroyed = true;
        app.off('update', update);
        app.off('destroy', destroy);
        events.abort();
        scene?.destroy();
        assets?.release();
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
