# Forest bridge and Halloween dungeon handoff

The entrance is one PlayCanvas scene followed by the existing local game. The login form is still semantic HTML, but its position comes from a physical timber face at the bottom of a dungeon shaft. That lets the camera reveal the form as scenery while the browser keeps normal text inputs, focus, validation and password behavior.

## Follow the control flow

`src/entry/ForestEntrance.ts` creates the timeline, audio, UI and forest scene. Each update chooses a clock: an enabled soundtrack supplies its media time; otherwise elapsed Engine time advances the story. A blocked autoplay request does not hold the opening. The existing sound button starts/retries audio at the current story time; focus loss, dialogs and zero Engine time retain the existing pause behavior. The opening invitation DOM and its unused controls/styles were removed. `ForestTimeline.ts` retains the 44-second story and dialogue timings, but no longer emits the chain/rumble stage direction.

The two performers use `forestBridgeLayout.ts` to lift their semantic roots along a profile measured from the prepared plank vertices. `ForestBridge.ts` seats the supplied crossing over a floor opening and owns the physical board. `ForestCamera.ts` moves from the figures toward the hole after the exit, accelerates down to the bottom, and brakes during the final part of the four-second descent. Between seconds 42 and 44 the board rotates to reveal its other face. Reduced motion uses the final view without a fall.

`ForestDungeon.ts` selects calibrated wall, arch, tile, bar and torch modules from one shared container. Every placement gets a semantic mount outside the calibration wrapper, so placing a module cannot erase the imported pivot compensation or scale. It builds the shaft lining and landing, owns pumpkin/candle clusters, lighting and low mist, and updates their subtle motion from the existing ambience clock. `ForestGoblin.ts` owns two original stylized sentries, including heads, pointed ears, noses, fangs, crooked hats, breathing and blinks. They stand on grounded pedestals. `ForestLoginDressing.ts` supplies licensed skeletons, cobwebs and bats; bats move to the upper dungeon space after the forest exit. Decoration stays beside and above the form face.

`ForestBridge.project()` transforms the four inset face corners into world coordinates and asks the active camera for screen coordinates. `forestBoardProjection.ts` solves the resulting planar homography and returns a CSS `matrix3d`. `ForestLogin.project()` applies that matrix to the transparent HTML form. The timber, grooves, posts, shadows and light are rendered by PlayCanvas; the HTML has no independent fake-wood card background or hanging chains. The face stays inert until the timeline is ready, then focus moves to the username field. The board is hidden when its back faces the camera or the projection is degenerate.

Continue locally waits for optional forest loading and deferred game assets, destroys the forest entities/UI/audio and constructs the existing game. Asset-load failure retains the HTML fallback and retry path. Login and account creation remain disconnected; feedback says so and no credentials are persisted. No hospital, checkpoint schema change, commit or push was performed by Codex.

## Assets and repository layout

Raw supplied files were moved from the repository root to ignored `asset-library/original-downloads/forest-bridge/`. Keep those originals backed up separately. Runtime bridge/sign GLBs total 993,492 bytes; the prepared dungeon kit is 3,303,636 bytes, extracted from the 34,613,008-byte supplied file. Five module variants share textures/materials in one GLB. Both asset policies include these CC BY 4.0 assets.

`scripts/prepare-forest-bridge.mjs` and `prepare-forest-dungeon.mjs` use the existing offline glTF tools; they add no app dependencies. Their versioned manifests preserve creator/source/license metadata, input/output SHA-256, scale/bounds, transformation notes and sizes. `forestBridgeProfile.json` is generated runtime data. The bridge and wood-sign creator pages returned 403, so their license identification is based on supplied embedded metadata. The indexed primary dungeon listing also identifies CC Attribution. Credits link all creators and CC BY 4.0 and describe adaptations. This is attribution evidence, not a guarantee against claims.

Keep `src/`, prepared `public/` assets, scripts/manifests, tests, DESIGN.md and docs in Git. Raw sources, browser profiles, inspection textures, captures, reports, dependencies, build output and secrets stay ignored. Existing beach/street and forest-scare work was preserved. See GITHUB_PUSH.md before staging.

## Verification and limits

The existing 126-test suite passed after the bridge/form changes. Final dungeon checks and browser evidence are recorded in TASKS.md; do not infer a pass from an image filename. `scripts/verify-forest-bridge.mjs` drives the production build in isolated muted Chrome, samples the camera/turn, checks live decoration without entity growth, exercises real HTML interactions, portrait layout, reduced-motion controls and local-entry cleanup, and closes Chrome in its finally block. The runner explicitly sets no-preference for the cinematic portion so a host OS reduced-motion setting cannot silently skip its measurements. Intermediate runs exposed a host-preference/harness assumption and a race between skip, projection visibility and Replay. The runner now waits for a visible, non-inert target and avoids scrolling the projected plane. Those failed runs are not final acceptance evidence.

The deck height uses nearby top vertices, not foot IK. Goblins are original procedural sentries, not a newly downloaded rig. Short landscape screens, physical-device performance and mobile Safari keyboard/autoplay behavior still need target-device checks. Browser audio policy can prevent audible autoplay; the film continues and the existing sound control recovers it. Authentication still requires its own backend integration.

## Dungeon continuation (2026-11-16)

The supplied Andrew Jepson kit replaces the plain backdrop with five shared modules. Vaulted wall sections need join covers; their ribs use a neutral stone finish to avoid stretching the source UV atlas. Pumpkins are tinted on cloned materials, preserving shared source materials. Skeletons sit outside the goblin pedestals, webs sit behind the input face, and the optional bats circle above the form. Candle/torch motion and original goblin sentry motion use the existing ambience clock and steady mode.

The final production browser run passes six groups with no console/network issues, including automatic startup, stable live decoration, sampled accelerating descent/turn, real HTML controls, reduced-motion form availability, portrait fit and local-entry cleanup. The final stone-rib material correction also passed the same six groups, and its desktop/portrait/bridge captures were inspected. Repository checks: 126/126 tests, lint, typecheck and production build passed; scoped formatting/diff and Git-ignore checks are recorded in TASKS. These are desktop/emulated-portrait checks, not physical-device acceptance.

## Exact code replacements

Before snapshots below use the captured baseline 626cf51 for the forest files that were clean at the start of the request. The user's intervening forest commit is preserved. Prior speech/scare edits are excluded. New files are shown as added. Generated GLB/JSON data is summarized by its preparation manifests rather than repeated here.

### src/entry/ForestAudio.ts

Current location: [src/entry/ForestAudio.ts:53](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestAudio.ts:53)

Before:

```
    get waitingForSound() {
        return this.state === 'loading' || this.state === 'blocked';
    }

```

After:

```
(Removed)
```

### src/entry/ForestCamera.ts

Current location: [src/entry/ForestCamera.ts:6](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestCamera.ts:6)

Before:

```
(Added)
```

After:

```
import { FOREST_SIGN } from './forestBridgeLayout';

```

Current location: [src/entry/ForestCamera.ts:17](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestCamera.ts:17)

Before:

```
    { time: 38, position: [0, 3.8, 15.3], target: [0, 1.7, -2], fov: 48 },
    { time: 44, position: [0, 3.8, 15.3], target: [0, 1.7, -2], fov: 48 }
```

After:

```
    { time: 38, position: [5, 3.2, 8], target: [5, 0, 0.9], fov: 50 },
    { time: 44, position: [5, -9.9, 8.4], target: [5, -9.9, 0.5], fov: 50 }
```

Current location: [src/entry/ForestCamera.ts:31](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestCamera.ts:31)

Before:

```
(Added)
```

After:

```
        entity: camera,
```

Current location: [src/entry/ForestCamera.ts:42](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestCamera.ts:42)

Before:

```
            position[2] += portrait * 5;
```

After:

```
            if (time >= 38 || reduced) {
                const fall = Math.max(0, Math.min(1, (time - 38) / 4));
                const accelerationEnd = 0.8;
                const distanceWeight = accelerationEnd ** 2 * (1.5 - 0.5 * accelerationEnd);
                const drop = reduced
                    ? 1
                    : fall <= accelerationEnd
                      ? fall ** 3 / distanceWeight
                      : 1 - (3 * accelerationEnd ** 2 * (1 - fall) ** 2) / (2 * (1 - accelerationEnd) * distanceWeight);
                const aspect = app.graphicsDevice.width / app.graphicsDevice.height;
                const fov = 50 + portrait * 20;
                const halfView = Math.tan((fov * Math.PI) / 360);
                const distance =
                    Math.max(FOREST_SIGN.height * 1.3, (FOREST_SIGN.width * 1.25) / aspect) / (2 * halfView);
                position[0] = 5;
                position[1] = 3.2 + (-9.9 - 3.2) * drop;
                position[2] = 8 + (0.5 + distance - 8) * drop;
                const look = reduced ? 1 : Math.min(1, fall * 1.4);
                target[0] = 5;
                target[1] = -2 + (-9.9 + 2) * look;
                target[2] = 0.5;
            } else position[2] += portrait * 5;
```

Current location: [src/entry/ForestCamera.ts:66](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestCamera.ts:66)

Before:

```
            camera.camera!.fov = Math.min(85, a.fov + (b.fov - a.fov) * t + portrait * 68);
```

After:

```
            camera.camera!.fov =
                time >= 38 || reduced ? 50 + portrait * 20 : Math.min(85, a.fov + (b.fov - a.fov) * t + portrait * 68);
```

### src/entry/ForestEntrance.ts

Current location: [src/entry/ForestEntrance.ts:41](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestEntrance.ts:41)

Before:

```
        () => audio.mute(),
```

After:

```
(Removed)
```

Current location: [src/entry/ForestEntrance.ts:77](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestEntrance.ts:77)

Before:

```
    audio.onStateChange = (state, feedback) => ui.setSound(state, feedback);
```

After:

```
    audio.onStateChange = (state, feedback) => {
        if (state === 'playing' && audio.clock < timeline.state.time - 0.15) audio.seek(timeline.state.time);
        ui.setSound(state, feedback);
    };
```

Current location: [src/entry/ForestEntrance.ts:89](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestEntrance.ts:89)

Before:

```
            else if (!audio.waitingForSound) timeline.update(dt);
```

After:

```
            else timeline.update(dt);
```

Current location: [src/entry/ForestEntrance.ts:96](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestEntrance.ts:96)

Before:

```
(Added)
```

After:

```
        ui.project(scene?.projectLogin() ?? null);
```

### src/entry/ForestLogin.ts

Current location: [src/entry/ForestLogin.ts:22](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:22)

Before:

```
    private readonly invitation: HTMLElement;
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:34](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:34)

Before:

```
        onMuted: () => void,
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:49](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:49)

Before:

```
            <div class="forest-sound-invite" data-forest-audio-invite>
                <p class="forest-eyebrow">THE FOREST IS LISTENING</p>
                <h1>A wrong turn.<br>A light in the trees.</h1>
                <p data-forest-audio-message>Preparing the forest sound and voices…</p>
                <button type="button" class="forest-enter" data-forest-play-sound>PLAY WITH SOUND <span aria-hidden="true">↗</span></button>
                <button type="button" class="forest-watch-muted" data-forest-watch-muted>Watch muted</button>
            </div>
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:50](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:50)

Before:

```
                <div class="forest-chain forest-chain-left" aria-hidden="true"></div>
                <div class="forest-chain forest-chain-right" aria-hidden="true"></div>
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:54](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:54)

Before:

```
                    <p class="forest-eyebrow">A LIGHT IN THE DARK</p>
```

After:

```
                    <p class="forest-eyebrow">YOU FOUND THE WAY</p>
```

Current location: [src/entry/ForestLogin.ts:97](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:97)

Before:

```
        this.invitation = this.root.querySelector('[data-forest-audio-invite]')!;
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:134](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:134)

Before:

```
        listen('[data-forest-play-sound]', onSound);
        listen('[data-forest-watch-muted]', onMuted);
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:142](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:142)

Before:

```
                    !target.closest('button, a, input, label')
```

After:

```
                    !target.closest('[data-forest-sound]')
```

Current location: [src/entry/ForestLogin.ts:237](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:237)

Before:

```
        this.root.querySelector<HTMLElement>('[data-forest-audio-message]')!.textContent = feedback;
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:239](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:239)

Before:

```
        this.invitation.hidden = this.timeline.state.ready || state === 'playing' || state === 'muted';
```

After:

```
    }

    project(transform: string | null) {
        this.board.style.transform = transform ?? '';
        this.board.hidden = !transform && !this.root.classList.contains('forest-fallback');
```

Current location: [src/entry/ForestLogin.ts:249](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:249)

Before:

```
        this.invitation.hidden = state.ready || this.audioState === 'playing' || this.audioState === 'muted';
        const progress = state.board;
        const settling = progress >= 1 ? 0 : Math.sin(progress * 13) * Math.exp(-progress * 5) * 3;
        const arrival = Math.max(0, (progress - 0.6) / 0.4);
        const bounce = progress < 1 && !reducedMotion ? Math.sin(arrival * 9) * Math.exp(-arrival * 4) * 20 : 0;
        this.board.style.transform = `translateY(calc(${-(1 - Math.min(1, progress * 1.65)) * 140}vh + ${bounce}px)) rotate(${reducedMotion ? 0 : settling}deg)`;
```

After:

```
(Removed)
```

Current location: [src/entry/ForestLogin.ts:253](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLogin.ts:253)

Before:

```
        this.board.style.opacity = progress > 0 ? '1' : '0';
```

After:

```
        this.board.style.opacity = state.time >= 43.2 ? '1' : '0';
```

### src/entry/ForestLoginDressing.ts

Current location: [src/entry/ForestLoginDressing.ts:8](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLoginDressing.ts:8)

Before:

```
(Added)
```

After:

```
import { FOREST_PIT } from './forestBridgeLayout';
```

Current location: [src/entry/ForestLoginDressing.ts:35](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLoginDressing.ts:35)

Before:

```
        model.root.setLocalPosition(...position);
```

After:

```
        const [x, y, z] = position;
        const besidePit =
            y > -1 &&
            x > FOREST_PIT.west - 1.5 &&
            x < FOREST_PIT.east + 1.5 &&
            z > FOREST_PIT.back - 1 &&
            z < FOREST_PIT.front;
        model.root.setLocalPosition(besidePit ? FOREST_PIT.east + 2.5 + x * 0.3 : x, y, z);
```

Current location: [src/entry/ForestLoginDressing.ts:55](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLoginDressing.ts:55)

Before:

```
(Added)
```

After:

```
    place('skeletonA', [0.65, -13.2, 1], 15, { height: 2 });
    place('skeletonA', [9.35, -13.2, 1], -20, { height: 2 });
    place('cobwebs', [0.5, -6.5, -2], 0, { scale: 0.7 });
    place('cobwebs', [9.5, -6.5, -2], 0, { scale: 0.7 });
```

Current location: [src/entry/ForestLoginDressing.ts:107](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestLoginDressing.ts:107)

Before:

```
                    Math.cos(angle) * radius,
                    5.2 + i * 0.6 + Math.sin(ambienceTime * 1.3 + i) * 0.4,
                    -6 + Math.sin(angle) * radius * 0.45
```

After:

```
                    time >= 38 ? 5 + Math.cos(angle) * 4 : Math.cos(angle) * radius,
                    time >= 38
                        ? -6.1 + Math.sin(ambienceTime * 1.3 + i) * 0.25
                        : 5.2 + i * 0.6 + Math.sin(ambienceTime * 1.3 + i) * 0.4,
                    time >= 38 ? -1 + Math.sin(angle) * 0.8 : -6 + Math.sin(angle) * radius * 0.45
```

### src/entry/ForestPerformers.ts

Current location: [src/entry/ForestPerformers.ts:8](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestPerformers.ts:8)

Before:

```
(Added)
```

After:

```
import { forestBridgeHeight } from './forestBridgeLayout';
```

Current location: [src/entry/ForestPerformers.ts:82](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestPerformers.ts:82)

Before:

```
            man.root.setLocalPosition(x, 0.04, 0.6 - cautious + flinch);
            woman.root.setLocalPosition(x - 1.2, 0.04, 1.25 + flinch * 0.5);
```

After:

```
            man.root.setLocalPosition(x, forestBridgeHeight(x), 0.6 - cautious + flinch);
            woman.root.setLocalPosition(x - 1.2, forestBridgeHeight(x - 1.2), 1.25 + flinch * 0.5);
```

### src/entry/ForestScene.ts

Current location: [src/entry/ForestScene.ts:9](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:9)

Before:

```
(Added)
```

After:

```
import { createForestBridge } from './ForestBridge';
import { FOREST_PIT } from './forestBridgeLayout';
```

Current location: [src/entry/ForestScene.ts:12](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:12)

Before:

```
(Added)
```

After:

```
import { createForestDungeon } from './ForestDungeon';
```

Current location: [src/entry/ForestScene.ts:71](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:71)

Before:

```
        createBoxVisual(root, 'forest-floor', [0, -0.15, -5], [55, 0.3, 48], soil);
```

After:

```
        createBoxVisual(root, 'forest-floor-west', [-14.05, -0.15, -5], [26.9, 0.3, 48], soil);
        createBoxVisual(root, 'forest-floor-east', [19.15, -0.15, -5], [16.7, 0.3, 48], soil);
        createBoxVisual(root, 'forest-floor-back', [5.1, -0.15, -16.5], [11.4, 0.3, 25], soil);
        createBoxVisual(root, 'forest-floor-front', [5.1, -0.15, 17.5], [11.4, 0.3, 3], soil);
```

Current location: [src/entry/ForestScene.ts:78](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:78)

Before:

```
            mound.setLocalPosition(-14 + i * 2.5, -0.15, -4 - (i % 3) * 3);
```

After:

```
            mound.setLocalPosition(-14 + i * 2.5, -0.15, -9 - (i % 3) * 3);
```

Current location: [src/entry/ForestScene.ts:84](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:84)

Before:

```
        createBoxVisual(root, 'forest-path', [0, -0.01, 1], [45, 0.025, 2.8], path);
```

After:

```
        createBoxVisual(root, 'forest-path-west', [-11.55, -0.01, 1], [21.9, 0.025, 2.8], path);
        createBoxVisual(root, 'forest-path-east', [16.65, -0.01, 1], [11.7, 0.025, 2.8], path);
        const bridge = createForestBridge(root, app.graphicsDevice, assets.models.bridge, assets.models.woodSigns);
        const dungeon = createForestDungeon(root, assets.models, bridge.sign, mobile);
```

Current location: [src/entry/ForestScene.ts:89](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:89)

Before:

```
(Added)
```

After:

```
            if (
                y > -1 &&
                x > FOREST_PIT.west - 1.5 &&
                x < FOREST_PIT.east + 1.5 &&
                z > FOREST_PIT.back - 1 &&
                z < FOREST_PIT.front
            )
                x = FOREST_PIT.east + 2.5 + x * 0.3;
```

Current location: [src/entry/ForestScene.ts:252](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:252)

Before:

```
        const signWood = material('abandoned-sign-wood', 0.23, 0.16, 0.09);
        createBoxVisual(root, 'abandoned-sign-post', [6, 0.85, -1.8], [0.12, 1.7, 0.12], signWood);
        const sign = createBoxVisual(root, 'abandoned-sign', [6, 1.5, -1.8], [1.5, 0.35, 0.12], signWood);
        sign.setLocalEulerAngles(0, -12, -9);
```

After:

```
        place('grave', 8.6, -1.4, -18, 1.3, FOREST_PIT.floor);
```

Current location: [src/entry/ForestScene.ts:295](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:295)

Before:

```
(Added)
```

After:

```
            bridge.update(time);
            dungeon.update(time, reduced, ambienceTime);
```

Current location: [src/entry/ForestScene.ts:341](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestScene.ts:341)

Before:

```
        return { root, update, addLoginModels, destroy: () => root.destroy() };
```

After:

```
        return {
            root,
            update,
            addLoginModels,
            projectLogin: () => bridge.project(camera.entity),
            destroy: () => root.destroy()
        };
```

### src/entry/ForestTimeline.ts

Current location: [src/entry/ForestTimeline.ts:14](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestTimeline.ts:14)

Before:

```
const ATMOSPHERE = [
    { start: 22.3, end: 23.5, text: '[A branch snaps overhead]' },
    { start: 38, end: 40, text: '[A distant rumble. Chains creak.]' }
];
```

After:

```
const ATMOSPHERE = [{ start: 22.3, end: 23.5, text: '[A branch snaps overhead]' }];
```

### src/entry/forest.css

Current location: [src/entry/forest.css:3](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:3)

Before:

```
.forest-sound-invite {
    position: absolute;
    z-index: 4;
    left: 50%;
    top: 45%;
    transform: translate(-50%, -50%);
    width: min(360px, calc(100% - 48px));
    text-align: center;
    padding: 28px 24px;
    border: 1px solid #8d806350;
    background: #061017d9;
    box-shadow: 0 20px 90px #0008;
    backdrop-filter: blur(4px);
}
.forest-sound-invite h1 {
    font:
        normal 37px/1.15 Georgia,
        serif;
    margin: 17px 0;
    color: #f0dfbf;
}
.forest-sound-invite > p:not(.forest-eyebrow) {
    font:
        12px/1.7 Arial,
        sans-serif;
    color: #c9c9b7;
    min-height: 40px;
}
.forest-watch-muted {
    background: none;
    border: 0;
    min-height: 44px;
    color: #c9bea4;
    font-size: 12px !important;
}
#forest-entry[data-audio='blocked'][data-phase='darkness'] .forest-darkness,
#forest-entry[data-audio='loading'][data-phase='darkness'] .forest-darkness,
#forest-entry[data-audio='failed'][data-phase='darkness'] .forest-darkness {
    opacity: 0.1;
}
.forest-sound-invite[hidden] {
    display: none;
}
```

After:

```
(Removed)
```

Current location: [src/entry/forest.css:11](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:11)

Before:

```
    overflow: auto;
```

After:

```
    overflow: hidden;
    pointer-events: none;
```

Current location: [src/entry/forest.css:99](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:99)

Before:

```
    position: relative;
    width: min(430px, calc(100% - 36px));
    margin: max(87px, calc((100svh - 620px) / 2)) auto 76px;
    transform-origin: 50% -130px;
```

After:

```
    position: absolute;
    width: 420px;
    height: 620px;
    left: 0;
    top: 0;
    margin: 0;
    transform-origin: 0 0;
    transition: opacity 0.25s;
```

Current location: [src/entry/forest.css:130](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:130)

Before:

```
.forest-chain {
    position: absolute;
    z-index: -1;
    bottom: calc(100% - 15px);
    height: max(170px, 40vh);
    width: 12px;
    background: repeating-linear-gradient(
        0deg,
        transparent 0 2px,
        #8d7953 3px 5px,
        #1e211f 6px 12px,
        #75664d 13px 15px,
        transparent 16px 19px
    );
    border-left: 2px solid #413d32;
    border-right: 2px solid #3e3d33;
    box-shadow: 3px 0 6px #0009;
    border-radius: 5px;
}
.forest-chain-left {
    left: 37px;
}
.forest-chain-right {
    right: 37px;
}
```

After:

```
(Removed)
```

Current location: [src/entry/forest.css:342](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:342)

Before:

```
    .forest-board {
        margin-top: 92px;
    }
```

After:

```
(Removed)
```

Current location: [src/entry/forest.css:360](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:360)

Before:

```
    .forest-board {
        margin-top: 82px;
    }
```

After:

```
(Removed)
```

Current location: [src/entry/forest.css:386](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:386)

Before:

```
@media (prefers-reduced-motion: reduce) {
    .forest-board {
        transform: none !important;
    }
}
```

After:

```
(Removed)
```

Current location: [src/entry/forest.css:428](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forest.css:428)

Before:

```
(Added)
```

After:

```

#forest-entry button,
#forest-entry input,
#forest-entry a,
#forest-entry dialog {
    pointer-events: auto;
}
#forest-entry .forest-board .forest-wood {
    box-sizing: border-box;
    height: 620px;
    padding: 12px 22px;
    border: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
}
.forest-board .forest-nail,
.forest-board .forest-tagline,
.forest-board .forest-divider {
    display: none;
}
.forest-board .forest-logo {
    width: 230px;
}
.forest-board .forest-eyebrow {
    margin: 0 0 8px;
}
.forest-board .forest-wood h1 {
    font-size: 25px;
    margin: 12px 0 6px;
}
.forest-board .forest-intro {
    margin-bottom: 12px;
}
.forest-board .forest-wood label {
    font-size: 12px;
    margin-top: 14px;
}
.forest-board .forest-wood input {
    height: 47px;
    font-size: 15px !important;
    background: #120c08cb;
}
.forest-board .forest-feedback {
    font-size: 12px;
    min-height: 33px;
}
.forest-board .forest-enter {
    height: 48px;
    font-size: 12px !important;
}
.forest-board .forest-account {
    font-size: 12px;
}
.forest-fallback .forest-board {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) scale(min(1, 0.8)) !important;
    background: #21170f;
}
@media (prefers-reduced-motion: reduce) {
    #forest-entry .forest-board {
        transition: none;
    }
}
```

### src/entry/forestModels.ts

Current location: [src/entry/forestModels.ts:7](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forestModels.ts:7)

Before:

```
(Added)
```

After:

```
    dungeonKit: modelTuning('dungeon-kit.glb', [4, 4.8, 4.1305], [0, 2.4, 0], 0, 4.8),
    bridge: modelTuning(
        'wooden-bridge.glb',
        [11.7337, 3.4226, 3.1799],
        [0.3488, 0.7155, 0.0032],
        0.9957,
        11.7337,
        'width'
    ),
    woodSigns: modelTuning('wood-signs.glb', [4.0621, 1.7161, 0.1344], [0.0007, 0.833, 0.0126], 0.0251, 3.2, 'width'),
```

### src/entry/ForestBridge.ts

Added at [src/entry/ForestBridge.ts:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestBridge.ts:1):

```ts
import { Color, Entity, Vec3 } from 'playcanvas';
import type { ContainerResource, GraphicsDevice, StandardMaterial } from 'playcanvas';

import { createModelInstance } from '../scenes/createModelInstance';
import { createTextSign } from '../scenes/createTextSign';
import { createBoxVisual, createMaterial } from '../scenes/primitives';

import { forestBoardProjection } from './forestBoardProjection';
import { FOREST_FORM, FOREST_PIT, FOREST_SIGN, forestSignTurn } from './forestBridgeLayout';
import { FOREST_MODELS } from './forestModels';

export const createForestBridge = (
    parent: Entity,
    device: GraphicsDevice,
    bridge: ContainerResource,
    signs: ContainerResource
) => {
    const root = new Entity('forest-bridge-reveal');
    parent.addChild(root);
    const earth = createMaterial('forest-pit-earth', 0.1, 0.075, 0.055);
    const rock = createMaterial('forest-pit-rock', 0.12, 0.15, 0.16);
    const timber = createMaterial('forest-pit-support', 0.19, 0.105, 0.045);
    const span = FOREST_PIT.east - FOREST_PIT.west;
    createBoxVisual(root, 'forest-pit-floor', [5, FOREST_PIT.floor - 0.6, 6], [span, 0.3, 20], earth);
    for (const x of [FOREST_PIT.west - 0.3, FOREST_PIT.east + 0.3])
        createBoxVisual(root, 'forest-pit-side', [x, -6.6, 6], [0.6, 13.2, 20], rock);
    for (const z of [FOREST_PIT.back - 0.3, FOREST_PIT.front + 0.3])
        createBoxVisual(root, 'forest-pit-end', [5, -6.6, z], [span, 13.2, 0.6], rock);
    const crossing = createModelInstance(bridge, FOREST_MODELS.bridge, 'forest-wooden-bridge');
    root.addChild(crossing.root);
    crossing.root.setLocalPosition(5, -2.0657, 0.9);
    for (const side of [-1, 1]) {
        const height = side < 0 ? 0.4453 : 0.4527;
        const ramp = createBoxVisual(
            root,
            'forest-bridge-approach',
            [5 + side * 6.025, height / 2 - 0.04, 0.9],
            [Math.hypot(1.35, height), 0.08, 3],
            timber
        );
        ramp.setLocalEulerAngles(0, 0, (-side * Math.atan2(height, 1.35) * 180) / Math.PI);
    }
    const sign = new Entity('forest-login-sign');
    root.addChild(sign);
    sign.setLocalPosition(FOREST_SIGN.x, FOREST_SIGN.y, FOREST_SIGN.z);
    const marker = createModelInstance(signs, FOREST_MODELS.woodSigns, 'forest-wood-waymarkers');
    sign.addChild(marker.root);
    marker.root.setLocalPosition(0, -2.9, -0.25);
    const imported = marker.hierarchy.findComponents('render')[0].meshInstances[0].material as StandardMaterial;
    const wood = imported.clone();
    wood.name = 'forest-login-sourced-wood';
    wood.diffuse.set(0.35, 0.3, 0.25);
    wood.diffuseMapTiling.set(0.13, 0.08);
    wood.diffuseMapOffset.set(0.24, 0.08);
    wood.diffuseMapRotation = 90;
    wood.normalMap = null;
    wood.aoMap = null;
    wood.useMetalness = true;
    wood.metalness = 0;
    wood.metalnessMap = null;
    wood.update();
    createBoxVisual(sign, 'forest-login-backing', [0, 0, -0.05], [FOREST_SIGN.width, FOREST_SIGN.height, 0.12], timber);
    for (let i = 0; i < 8; i++)
        createBoxVisual(sign, 'forest-login-plank', [0, -2.45 + i * 0.7, 0], [3.8, 0.68, 0.2], wood);
    for (const x of [-1.5, 1.5]) createBoxVisual(sign, 'forest-login-post', [x, -1.7, -0.2], [0.16, 3.2, 0.2], timber);
    const pointer = createTextSign(
        sign,
        device,
        'forest-login-pointer',
        ['THE WAY OUT', 'FOLLOW THE LIGHT'],
        '#302017',
        2.6,
        0.8
    );
    sign.addChild(pointer);
    pointer.setLocalPosition(0, 0, -0.13);
    pointer.setLocalEulerAngles(90, 180, 0);
    for (const [x, z] of [
        [2.2, 2.6],
        [7.8, 2.6]
    ]) {
        const light = new Entity('forest-pit-lantern-light');
        root.addChild(light);
        light.setLocalPosition(x, -10.2, z);
        light.addComponent('light', {
            type: 'omni',
            color: new Color(1, 0.75, 0.45),
            range: 12,
            intensity: 2,
            castShadows: false
        });
    }
    root.once('destroy', () => [earth, rock, timber, wood].forEach((m) => m.destroy()));
    const point = new Vec3();
    return {
        sign,
        update: (time: number) => sign.setLocalEulerAngles(0, forestSignTurn(time), 0),
        project: (camera: Entity) => {
            if (sign.forward.dot(camera.getPosition().clone().sub(sign.getPosition())) > -0.1) return null;
            const corners = [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1]
            ].map(([x, y]) => {
                point.set((x * FOREST_FORM.worldWidth) / 2, (y * FOREST_FORM.worldHeight) / 2, 0.13);
                sign.getWorldTransform().transformPoint(point, point);
                const screen = camera.camera!.worldToScreen(point);
                return { x: screen.x, y: screen.y };
            });
            return forestBoardProjection(corners, FOREST_FORM.width, FOREST_FORM.height);
        }
    };
};

```

### src/entry/ForestDungeon.ts

Added at [src/entry/ForestDungeon.ts:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestDungeon.ts:1):

```ts
import { BLEND_NORMAL, Color, Entity } from 'playcanvas';
import type { ContainerResource, Material, StandardMaterial } from 'playcanvas';

import { createModelInstance } from '../scenes/createModelInstance';
import { createBoxVisual, createMaterial } from '../scenes/primitives';

import { FOREST_PIT } from './forestBridgeLayout';
import { createForestGoblin } from './ForestGoblin';
import { FOREST_MODELS } from './forestModels';
import type { ForestModelId } from './forestModels';

export const createForestDungeon = (
    parent: Entity,
    models: Record<ForestModelId | 'performances', ContainerResource>,
    sign: Entity,
    mobile: boolean
) => {
    const root = new Entity('forest-dungeon');
    parent.addChild(root);
    const module = (
        id: 'dungeon-wall' | 'dungeon-arch' | 'dungeon-floor' | 'dungeon-torch' | 'dungeon-bars',
        x: number,
        y: number,
        z: number,
        yaw = 0
    ) => {
        const instance = models.dungeonKit.instantiateRenderEntity({ castShadows: false });
        const part = instance.findByName(id) as Entity;
        if (!part) throw new Error(`Missing prepared dungeon module ${id}`);
        const mount = new Entity(`${id}-mount`);
        root.addChild(mount);
        part.reparent(mount);
        instance.destroy();
        mount.setLocalPosition(x, y, z);
        mount.setLocalEulerAngles(0, yaw, 0);
        return mount;
    };
    for (const x of [FOREST_PIT.west - 0.6, FOREST_PIT.east + 0.6])
        for (const y of [FOREST_PIT.floor, FOREST_PIT.floor + 4.8, FOREST_PIT.floor + 9.6])
            for (const z of [-2, 2, 6, 10, 14]) module('dungeon-wall', x, y, z, x < 5 ? 0 : 180);
    for (const y of [FOREST_PIT.floor, FOREST_PIT.floor + 4.8])
        for (const x of [1, 5, 9]) module('dungeon-arch', x, y, -3.6, 90);
    for (const x of [1, 5, 9])
        for (const z of [-2, 2, 6, 10, 14]) module('dungeon-floor', x, FOREST_PIT.floor - 0.1387, z);
    for (const x of [1, 9]) module('dungeon-bars', x, FOREST_PIT.floor, -2.8, 90);
    const stone = (
        (root.findByName('dungeon-wall') as Entity).findComponents('render')[0].meshInstances[0]
            .material as StandardMaterial
    ).clone();
    stone.name = 'dungeon-stone-cornice';
    stone.diffuseMap = null;
    stone.diffuse.set(0.24, 0.23, 0.2);
    stone.update();
    for (const y of [-8.5, -3.7]) {
        for (const x of [-0.5, 10.7])
            for (const z of [-2, 2, 6, 10, 14])
                createBoxVisual(root, 'dungeon-stone-course', [x, y, z], [1, 0.9, 4.02], stone);
        createBoxVisual(root, 'dungeon-back-cornice', [5, y, -2.65], [11.4, 0.9, 0.7], stone);
    }
    const pumpkinMaterials = new Map<Material, StandardMaterial>();
    root.once('destroy', () => {
        stone.destroy();
        pumpkinMaterials.forEach((material) => material.destroy());
    });
    const place = (id: ForestModelId, x: number, y: number, z: number, scale = 1, owner = root) => {
        const model = createModelInstance(models[id], FOREST_MODELS[id], `dungeon-${id}`);
        owner.addChild(model.root);
        model.root.setLocalPosition(x, y, z);
        model.root.setLocalScale(scale, scale, scale);
        model.root.setLocalEulerAngles(0, x * 31, 0);
        if (id === 'pumpkin' || id === 'tallPumpkin' || id === 'leanPumpkin')
            for (const render of model.root.findComponents('render'))
                for (const instance of render.meshInstances) {
                    const source = instance.material!;
                    let material = pumpkinMaterials.get(source);
                    if (!material) {
                        material = (source as StandardMaterial).clone();
                        material.diffuse.set(0.95, 0.3, 0.04);
                        material.update();
                        pumpkinMaterials.set(source, material);
                    }
                    instance.material = material;
                }
        return model.root;
    };
    for (const side of [-1, 1])
        for (let i = 0; i < (mobile ? 7 : 11); i++) {
            const x = 5 + side * (2.55 + (i % 3) * 0.72),
                z = 1.8 + Math.floor(i / 3) * 0.72;
            place(
                i % 3 === 0 ? 'tallPumpkin' : i % 3 === 1 ? 'pumpkin' : 'leanPumpkin',
                x,
                FOREST_PIT.floor,
                z,
                0.75 + (i % 4) * 0.24
            );
            if (i % 3 === 0) place('skull', x - side * 0.25, FOREST_PIT.floor, z + 0.4, 1.1);
        }
    for (const x of [-1.35, 0, 1.35]) place('pumpkin', x, 2.8, 0, 0.56, sign);
    const goblins = [-1, 1].map((side) => {
        const goblin = createForestGoblin(root, side);
        goblin.root.setLocalPosition(5 + side * 3.25, FOREST_PIT.floor, 0.1);
        return goblin;
    });
    const flameMaterial = createMaterial('dungeon-candle-flame', 1, 0.55, 0.12);
    flameMaterial.useLighting = false;
    flameMaterial.emissive.set(2, 0.65, 0.1);
    flameMaterial.update();
    const flames: { entity: Entity; light: Entity; seed: number }[] = [];
    const fire = (x: number, y: number, z: number, seed: number, range = 6) => {
        const flame = new Entity('dungeon-live-flame');
        root.addChild(flame);
        flame.setLocalPosition(x, y, z);
        flame.setLocalScale(0.085, 0.22, 0.085);
        flame.addComponent('render', { type: 'sphere', material: flameMaterial, castShadows: false });
        const light = new Entity('dungeon-firelight');
        root.addChild(light);
        light.setLocalPosition(x, y + 0.1, z);
        light.addComponent('light', {
            type: 'omni',
            color: new Color(1, 0.62, 0.27),
            intensity: 1.9,
            range,
            castShadows: false
        });
        flames.push({ entity: flame, light, seed });
    };
    for (const side of [-1, 1])
        for (const z of [1.8, 7.5]) {
            const x = side < 0 ? -0.08 : 10.28;
            module('dungeon-torch', x, -10.6, z, side < 0 ? 0 : 180);
            fire(x - side * 0.3, -9.8, z, flames.length, 8);
        }
    for (const x of [2.6, 7.4]) {
        module('dungeon-torch', x, -7.8, -2.35, -90);
        fire(x, -6.98, -2.05, flames.length, 7);
    }
    for (const side of [-1, 1])
        for (let i = 0; i < 3; i++) {
            const x = 5 + side * (2.4 + i * 0.22),
                z = 2.1 + (i % 2) * 0.22;
            place('candle', x, FOREST_PIT.floor, z, 1.3);
            fire(x, FOREST_PIT.floor + 0.47, z, flames.length, 3.2);
        }
    const fill = new Entity('dungeon-cool-fill');
    root.addChild(fill);
    fill.setLocalPosition(5, -8, 5.5);
    fill.addComponent('light', {
        type: 'omni',
        color: new Color(0.37, 0.56, 0.78),
        range: 15,
        intensity: 1.4,
        castShadows: false
    });
    const mistMaterial = createMaterial('dungeon-floor-mist', 0.25, 0.32, 0.35);
    mistMaterial.blendType = BLEND_NORMAL;
    mistMaterial.opacity = 0.055;
    mistMaterial.depthWrite = false;
    mistMaterial.update();
    const mists = Array.from({ length: mobile ? 2 : 4 }, (_, i) => {
        const mist = new Entity('dungeon-floor-mist');
        root.addChild(mist);
        mist.setLocalPosition(3 + i * 1.4, FOREST_PIT.floor + 0.18, 2 + i * 0.7);
        mist.setLocalScale(5, 0.28, 1.6);
        mist.addComponent('render', { type: 'sphere', material: mistMaterial, castShadows: false });
        return mist;
    });
    root.once('destroy', () => {
        flameMaterial.destroy();
        mistMaterial.destroy();
    });
    return {
        update: (time: number, steady: boolean, clock: number) => {
            goblins.forEach((goblin) => goblin.update(clock, steady || time < 38));
            for (const { entity, light, seed } of flames) {
                const wave = steady ? 0 : Math.sin(clock * 7 + seed * 2) * 0.1 + Math.sin(clock * 11 + seed) * 0.04;
                entity.setLocalScale(0.085, 0.22 + wave * 0.2, 0.085);
                light.light!.intensity = 1.9 + wave * 2;
            }
            mists.forEach((mist, i) =>
                mist.setLocalPosition(
                    3 + i * 1.4 + (steady ? 0 : Math.sin(clock * 0.16 + i) * 0.5),
                    FOREST_PIT.floor + 0.18,
                    2 + i * 0.7
                )
            );
        }
    };
};

```

### src/entry/ForestGoblin.ts

Added at [src/entry/ForestGoblin.ts:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/ForestGoblin.ts:1):

```ts
import { Entity } from 'playcanvas';
import type { StandardMaterial } from 'playcanvas';

import { createBoxVisual, createMaterial } from '../scenes/primitives';

export const createForestGoblin = (parent: Entity, side: number) => {
    const root = new Entity(`forest-goblin-${side < 0 ? 'left' : 'right'}`);
    parent.addChild(root);
    const materials = {
        skin: createMaterial('goblin-moss-skin', 0.22, 0.4, 0.16),
        dark: createMaterial('goblin-dark-leather', 0.075, 0.045, 0.028),
        coat: createMaterial('goblin-aubergine-cloth', 0.17, 0.065, 0.18),
        eyes: createMaterial('goblin-amber-eyes', 0.95, 0.72, 0.18),
        teeth: createMaterial('goblin-small-fangs', 0.86, 0.8, 0.57),
        stone: createMaterial('goblin-carved-pedestal', 0.25, 0.28, 0.25)
    };
    materials.eyes.emissive.set(0.2, 0.1, 0.01);
    materials.eyes.update();
    root.once('destroy', () => Object.values(materials).forEach((m) => m.destroy()));
    const shape = (
        owner: Entity,
        name: string,
        type: 'sphere' | 'cone' | 'cylinder',
        position: readonly [number, number, number],
        size: readonly [number, number, number],
        material: StandardMaterial
    ) => {
        const part = new Entity(name);
        owner.addChild(part);
        part.setLocalPosition(...position);
        part.setLocalScale(...size);
        part.addComponent('render', { type, material, castShadows: false });
        return part;
    };
    createBoxVisual(root, 'goblin-pedestal', [0, 1.05, 0], [0.85, 2.1, 0.85], materials.stone);
    for (const y of [0.12, 1.65, 2.1])
        createBoxVisual(root, 'goblin-pedestal-cap', [0, y, 0], [1.05, 0.16, 1.05], materials.stone);
    const body = new Entity('goblin-sentry');
    root.addChild(body);
    body.setLocalPosition(0, 2.18, 0);
    for (const x of [-0.18, 0.18])
        shape(body, 'goblin-boot', 'sphere', [x, 0.13, 0.1], [0.26, 0.25, 0.4], materials.dark);
    shape(body, 'goblin-coat', 'cone', [0, 0.64, 0], [0.8, 0.96, 0.58], materials.coat);
    createBoxVisual(body, 'goblin-belt', [0, 0.52, 0.28], [0.58, 0.09, 0.07], materials.dark);
    shape(body, 'goblin-buckle', 'sphere', [0, 0.52, 0.33], [0.12, 0.13, 0.04], materials.teeth);
    for (const side of [-1, 1]) {
        const sleeve = shape(
            body,
            'goblin-sleeve',
            'cylinder',
            [side * 0.29, 0.895, 0],
            [0.22, 0.35, 0.24],
            materials.coat
        );
        sleeve.setLocalEulerAngles(0, 0, side * 53);
    }
    const hands = [-0.43, 0.43].map((x) =>
        shape(body, 'goblin-hand', 'sphere', [x, 0.79, 0.07], [0.18, 0.26, 0.18], materials.skin)
    );
    const head = new Entity('goblin-head');
    body.addChild(head);
    head.setLocalPosition(0, 1.24, 0);
    shape(head, 'goblin-face', 'sphere', [0, 0, 0], [0.64, 0.61, 0.58], materials.skin);
    for (const earSide of [-1, 1]) {
        const ear = shape(
            head,
            'goblin-pointed-ear',
            'cone',
            [earSide * 0.43, 0.08, -0.01],
            [0.3, 0.5, 0.16],
            materials.skin
        );
        ear.setLocalEulerAngles(0, 0, -earSide * 70);
        shape(head, 'goblin-ear-inner', 'sphere', [earSide * 0.4, 0.08, 0.07], [0.19, 0.11, 0.04], materials.coat);
    }
    const eyes = [-0.14, 0.14].map((x) => {
        const eye = shape(head, 'goblin-eye', 'sphere', [x, 0.065, 0.265], [0.18, 0.105, 0.06], materials.eyes);
        shape(head, 'goblin-pupil', 'sphere', [x, 0.065, 0.303], [0.045, 0.075, 0.018], materials.dark);
        const brow = createBoxVisual(head, 'goblin-brow', [x, 0.15, 0.265], [0.2, 0.055, 0.08], materials.skin);
        brow.setLocalEulerAngles(0, 0, x < 0 ? -12 : 12);
        return eye;
    });
    shape(head, 'goblin-long-nose', 'sphere', [0, -0.02, 0.32], [0.16, 0.25, 0.28], materials.skin);
    createBoxVisual(head, 'goblin-smile', [0, -0.16, 0.25], [0.28, 0.035, 0.055], materials.dark);
    for (const x of [-0.09, 0.09]) {
        const fang = shape(head, 'goblin-fang', 'cone', [x, -0.2, 0.29], [0.045, 0.1, 0.04], materials.teeth);
        fang.setLocalEulerAngles(0, 0, 180);
    }
    shape(head, 'goblin-hat-brim', 'cylinder', [0, 0.31, -0.02], [0.84, 0.07, 0.68], materials.coat);
    const hat = shape(
        head,
        'goblin-crooked-hat',
        'cone',
        [-side * 0.09, 0.58, -0.03],
        [0.65, 0.58, 0.55],
        materials.coat
    );
    hat.setLocalEulerAngles(0, 0, side * 17);
    return {
        root,
        update: (time: number, steady: boolean) => {
            head.setLocalEulerAngles(
                steady ? 0 : Math.sin(time * 0.7 + side) * 3,
                side * -10 + (steady ? 0 : Math.sin(time * 0.4) * 7),
                steady ? 0 : Math.sin(time * 0.6) * 2
            );
            body.setLocalScale(1, steady ? 1 : 1 + Math.sin(time * 1.6 + side) * 0.012, 1);
            hands[side < 0 ? 1 : 0].setLocalEulerAngles(0, 0, steady ? 0 : Math.sin(time * 0.9) * 9);
            const blink = steady ? 1 : Math.cos(time * 0.73 + side) > 0.996 ? 0.1 : 1;
            eyes.forEach((eye) => eye.setLocalScale(0.18, 0.105 * blink, 0.06));
        }
    };
};

```

### src/entry/forestBridgeLayout.ts

Added at [src/entry/forestBridgeLayout.ts:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forestBridgeLayout.ts:1):

```ts
import deck from './forestBridgeProfile.json';

export const FOREST_PIT = { west: -0.6, east: 10.8, back: -4, front: 16, floor: -13.2 } as const;
export const FOREST_SIGN = { x: 5, y: -9.9, z: 0.5, width: 3.8, height: 5.6 } as const;
export const FOREST_FORM = { width: 420, height: 620, worldWidth: 3.4, worldHeight: 5.02 } as const;
export const forestSignTurn = (time: number) => {
    const t = Math.max(0, Math.min(1, (time - 42) / 2));
    return 180 * (1 - t * t * (3 - 2 * t));
};
export const forestBridgeHeight = (worldX: number) => {
    const x = worldX - 5;
    if (x < deck[0][0]) return 0.04 + deck[0][1] * Math.max(0, Math.min(1, (x + 6.7) / 1.35));
    if (x > deck.at(-1)![0]) return 0.04 + deck.at(-1)![1] * Math.max(0, Math.min(1, (6.7 - x) / 1.35));
    const index = deck.findIndex(([px]) => px >= x);
    const a = deck[Math.max(0, index - 1)],
        b = deck[index];
    const t = a === b ? 0 : (x - a[0]) / (b[0] - a[0]);
    return 0.04 + a[1] + (b[1] - a[1]) * t;
};

```

### src/entry/forestBoardProjection.ts

Added at [src/entry/forestBoardProjection.ts:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/entry/forestBoardProjection.ts:1):

```ts
type Point = { readonly x: number; readonly y: number };

export const forestBoardProjection = (corners: readonly Point[], width: number, height: number) => {
    const rows: number[][] = [];
    for (const [i, [x, y]] of [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height]
    ].entries()) {
        const p = corners[i];
        if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
        rows.push([x, y, 1, 0, 0, 0, -p.x * x, -p.x * y, p.x]);
        rows.push([0, 0, 0, x, y, 1, -p.y * x, -p.y * y, p.y]);
    }
    for (let col = 0; col < 8; col++) {
        let pivot = col;
        for (let row = col + 1; row < 8; row++) if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
        if (Math.abs(rows[pivot][col]) < 1e-8) return null;
        [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
        const divisor = rows[col][col];
        for (let i = col; i <= 8; i++) rows[col][i] /= divisor;
        for (let row = 0; row < 8; row++) {
            if (row === col) continue;
            const factor = rows[row][col];
            for (let i = col; i <= 8; i++) rows[row][i] -= factor * rows[col][i];
        }
    }
    const [a, b, c, d, e, f, g, h] = rows.map((row) => row[8]);
    return `matrix3d(${[a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1].join(',')})`;
};

```

### scripts/prepare-forest-bridge.mjs

Added at [scripts/prepare-forest-bridge.mjs:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/prepare-forest-bridge.mjs:1):

```js
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Pass the existing offline glTF tools directory.');
const require = createRequire(path.resolve(process.argv[2], 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { flatten, prune, textureCompress } = require('@gltf-transform/functions');
const sharp = require('sharp');
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const source = path.join(root, 'asset-library/original-downloads/forest-bridge');
const output = path.join(root, 'public/assets/forest');
await mkdir(output, { recursive: true });
const records = [];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const [input, file] of [
    ['wooden_bridge_-_lowpoly_gameready.glb', 'wooden-bridge.glb'],
    ['stylized_wood_signs.glb', 'wood-signs.glb']
]) {
    const bytes = await readFile(path.join(source, input));
    const doc = await io.read(path.join(source, input));
    const attribution = doc.getRoot().getAsset().extras;
    await doc.transform(
        flatten(),
        prune(),
        textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 })
    );
    const scene = doc.getRoot().getDefaultScene();
    const bounds = getBounds(scene);
    let deck = [];
    if (file === 'wooden-bridge.glb') {
        const mesh = doc
            .getRoot()
            .listNodes()
            .find((node) => node.getName() === 'Planks_low__0');
        const primitive = mesh.getMesh().listPrimitives()[0];
        const positions = primitive.getAttribute('POSITION');
        const matrix = mesh.getWorldMatrix();
        const points = [];
        for (let i = 0; i < positions.getCount(); i++) {
            const [x, y, z] = positions.getElement(i, []);
            points.push([
                matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
                matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]
            ]);
        }
        const center = (bounds.min[0] + bounds.max[0]) / 2;
        deck = Array.from({ length: 41 }, (_, i) => {
            const x = -5.35 + (i * 10.7) / 40;
            const nearby = points
                .toSorted((a, b) => Math.abs(a[0] - center - x) - Math.abs(b[0] - center - x))
                .slice(0, 12);
            return [Number(x.toFixed(4)), Number((Math.max(...nearby.map(([, y]) => y)) - 1.11).toFixed(4))];
        });
        if (deck.some(([, y]) => !Number.isFinite(y))) throw new Error('Incomplete bridge deck profile');
    }
    await io.write(path.join(output, file), doc);
    const prepared = await readFile(path.join(output, file));
    records.push({
        file,
        source: input,
        attribution,
        sourceSha256: hash(bytes),
        outputSha256: hash(prepared),
        sourceBytes: bytes.length,
        outputBytes: prepared.length,
        bounds,
        deck,
        changes:
            'Flattened static hierarchy; textures capped at 1024px and encoded as WebP. Scene scales and reuses sign wood for the login board.',
        verification:
            'Creator pages returned HTTP 403; attribution/license verified from supplied GLB asset.extras. CC BY 4.0 terms checked 2026-11-15.'
    });
}
await writeFile(path.join(root, 'scripts/forest-bridge.prepared.json'), `${JSON.stringify(records, null, 2)}\n`);
await writeFile(path.join(root, 'src/entry/forestBridgeProfile.json'), `${JSON.stringify(records[0].deck)}\n`);

```

### scripts/prepare-forest-dungeon.mjs

Added at [scripts/prepare-forest-dungeon.mjs:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/prepare-forest-dungeon.mjs:1):

```js
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Pass the existing offline glTF tools directory.');
const require = createRequire(path.resolve(process.argv[2], 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { flatten, prune, textureCompress } = require('@gltf-transform/functions');
const sharp = require('sharp');
const source = path.join(
    root,
    'asset-library/original-downloads/forest-bridge/medieval_underground_dungeon_-_modular_asset_kit.glb'
);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(source);
const attribution = doc.getRoot().getAsset().extras;
await doc.transform(flatten());
const scene = doc.getRoot().getDefaultScene();
const selections = [
    ['dungeon-wall', 'Brick_wall_BRICKWALLS_0', 'height', 4.8],
    ['dungeon-arch', 'Brick_wall_doorway_BRICKWALLS_0', 'height', 4.8],
    ['dungeon-floor', 'Tile_floor_Tile_Floor_0', 'width', 4],
    ['dungeon-torch', 'Wall_Torch_TORCHCHEST_0', 'height', 0.9],
    ['dungeon-bars', 'Bars_Trim_Sheet_0', 'height', 3.5]
];
const selected = new Set(selections.map(([, name]) => name));
for (const node of doc.getRoot().listNodes()) if (!selected.has(node.getName())) node.dispose();
const calibration = [];
for (const [id, name, dimension, size] of selections) {
    const node = doc
        .getRoot()
        .listNodes()
        .find((n) => n.getName() === name);
    const bounds = getBounds(node);
    const axis = dimension === 'height' ? 1 : 0;
    const scale = size / (bounds.max[axis] - bounds.min[axis]);
    const wrapper = doc
        .createNode(id)
        .setScale([scale, scale, scale])
        .setTranslation([
            (-(bounds.min[0] + bounds.max[0]) * scale) / 2,
            -bounds.min[1] * scale,
            (-(bounds.min[2] + bounds.max[2]) * scale) / 2
        ]);
    scene.removeChild(node);
    wrapper.addChild(node);
    scene.addChild(wrapper);
    calibration.push({ id, original: bounds, scale, bounds: getBounds(wrapper) });
}
await doc.transform(
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 })
);
const file = 'dungeon-kit.glb';
await io.write(path.join(root, 'public/assets/forest', file), doc);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const raw = await readFile(source),
    output = await readFile(path.join(root, 'public/assets/forest', file));
await writeFile(
    path.join(root, 'scripts/forest-dungeon.prepared.json'),
    JSON.stringify(
        {
            file,
            attribution,
            sourceBytes: raw.length,
            outputBytes: output.length,
            sourceSha256: hash(raw),
            outputSha256: hash(output),
            calibration,
            changes:
                'Extracted five reusable modules; retained authored geometry/materials, flattened hierarchy, calibrated metre-scale wrappers; textures resized to 1024px WebP.',
            verification:
                'CC Attribution on indexed primary Sketchfab page; supplied asset.extras identifies CC BY 4.0. Checked 2026-11-16.'
        },
        null,
        2
    ) + '\n'
);

```

### scripts/verify-forest-bridge.mjs

Added at [scripts/verify-forest-bridge.mjs:1](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-forest-bridge.mjs:1):

```js
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5189/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/forest-bridge/', import.meta.url);
await mkdir(output, { recursive: true });
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find((p) => p.type === 'page');
assert.ok(page, 'Start an isolated Chrome with --headless=new --mute-audio --remote-debugging-port=9223');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(),
    issues = [],
    results = [];
socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
        const request = pending.get(message.id);
        if (request) {
            clearTimeout(request.timer);
            pending.delete(message.id);
            if (message.error) request.reject(new Error(JSON.stringify(message.error)));
            else request.resolve(message.result);
        }
    } else if (
        message.method === 'Runtime.exceptionThrown' ||
        (message.method === 'Network.loadingFailed' && !message.params.canceled) ||
        (message.method === 'Network.responseReceived' && message.params.response.status >= 400) ||
        (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'warn'].includes(message.params.type))
    )
        issues.push(message);
});
const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
        const next = ++id;
        const timer = setTimeout(() => {
            pending.delete(next);
            reject(new Error(`Timeout: ${method}`));
        }, 60000);
        pending.set(next, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: next, method, params }));
    });
const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
};
const wait = (condition) =>
    evaluate(
        `new Promise((resolve,reject)=>{const start=performance.now();const step=()=>{if(${condition})return resolve(true);if(performance.now()-start>55000)return reject(new Error('Condition timed out'));setTimeout(step,40);};step();})`
    );
const click = async (selector) => {
    await wait(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&e.getBoundingClientRect().width>0&&!e.closest('[inert]');})()`
    );
    await evaluate(
        `(async()=>{const e=document.querySelector(${JSON.stringify(selector)});const dialog=e.closest('dialog');if(dialog)await Promise.all(dialog.getAnimations().map(a=>a.finished));})()`
    );
    const r = await evaluate(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e.closest('[data-forest-board]'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`
    );
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...r, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...r, button: 'left', clickCount: 1 });
};
const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(new URL(`${name}.png`, output), Buffer.from(r.data, 'base64'));
};
const record = (name) => {
    results.push(name);
    process.stdout.write(`PASS ${name}\n`);
};
const app = `[...globalThis.__playcanvasApps.keys()][0]`;
const advance = async (seconds) => {
    await evaluate(
        `(()=>{const a=${app};a.fire('update',${seconds});for(let i=0;i<3;i++)a.systems.fire('animationUpdate',0.1);return true;})()`
    );
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
};

let failure;
try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
    });
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false
    });
    const hook = await readFile(
        new URL('../.agents/skills/inspect-runtime/scripts/devtools-hook.js', import.meta.url),
        'utf8'
    );
    await send('Page.addScriptToEvaluateOnNewDocument', {
        source: hook + "\nlocalStorage.removeItem('last-wave.intro-skip.v1');"
    });
    const loaded = new Promise((resolve) => {
        const listener = ({ data }) => {
            if (JSON.parse(data).method === 'Page.loadEventFired') {
                socket.removeEventListener('message', listener);
                resolve();
            }
        };
        socket.addEventListener('message', listener);
    });
    await send('Page.navigate', { url });
    await loaded;
    await wait(`!!document.querySelector('#forest-entry') && !!${app}.root.findByName('forest-login-sign')`);
    assert.equal(await evaluate(`!!document.querySelector('[data-forest-audio-invite]')`), false);
    await wait(`Number(document.querySelector('#forest-entry').dataset.elapsed)>1`);
    await shot('00-automatic-opening');
    record('Intro advances automatically with no sound invitation');
    if (await evaluate(`document.querySelector('#forest-entry').dataset.audio!=='playing'`)) {
        await click('[data-forest-sound]');
        await wait(`document.querySelector('#forest-entry').dataset.audio==='playing'`);
    }
    await click('[data-forest-sound]');
    await click('[data-forest-skip]');
    await click('[data-forest-skip-once]');
    await click('[data-forest-replay]');
    await wait(`document.querySelector('#forest-entry').dataset.phase!=='ready'`);
    await evaluate(`${app}.timeScale=0;true`);
    const samples = [];
    for (const t of [32, 35, 37.8, 38, 39, 40, 41, 42, 43, 44]) {
        const now = await evaluate(`Number(document.querySelector('#forest-entry').dataset.elapsed)`);
        await advance(Math.max(0, t - now));
        samples.push(
            await evaluate(
                `(()=>{const a=${app},c=a.root.findByName('forest-camera'),s=a.root.findByName('forest-login-sign');return {time:Number(document.querySelector('#forest-entry').dataset.elapsed),camera:c.getPosition().toArray(),sign:s.getRotation().toArray(),caption:document.querySelector('[data-forest-caption]').textContent,formHidden:document.querySelector('[data-forest-board]').hidden};})()`
            )
        );
        await shot('time-' + t);
    }
    await writeFile(new URL('camera-samples.json', output), JSON.stringify(samples, null, 2));
    assert.ok(samples[5].camera[1] - samples[6].camera[1] > samples[4].camera[1] - samples[5].camera[1]);
    assert.ok(samples.at(-1).camera[1] < -9);
    assert.equal(samples.at(-1).formHidden, false);
    assert.equal(samples.at(-1).caption, '');
    const decoration = await evaluate(
        `(()=>{const a=${app},d=a.root.findByName('forest-dungeon');return {walls:d.findComponents('render').length,goblins:d.findByName('forest-goblin-left')&&d.findByName('forest-goblin-right')?2:0,torches:d.findComponents('light').length,head:d.findByName('goblin-head').getLocalRotation().toArray(),entities:d.findComponents('render').length};})()`
    );
    assert.ok(decoration.walls > 60);
    assert.equal(decoration.goblins, 2);
    assert.ok(decoration.torches >= 9);
    await advance(0.7);
    const moving = await evaluate(
        `(()=>{const d=${app}.root.findByName('forest-dungeon');return {head:d.findByName('goblin-head').getLocalRotation().toArray(),entities:d.findComponents('render').length};})()`
    );
    assert.notDeepEqual(decoration.head, moving.head);
    assert.equal(decoration.entities, moving.entities);
    record('Calibrated dungeon modules, two animated goblins and live torch/candle dressing remain stable at the form');
    record('Camera accelerates into the pit, settles at the bottom, and the sign turns to reveal the form');
    const form = await evaluate(
        `(()=>{const f=document.querySelector('[data-forest-board]'),r=f.getBoundingClientRect();return {inert:f.inert,transform:f.style.transform,rect:[r.x,r.y,r.width,r.height],focus:document.activeElement.id};})()`
    );
    assert.equal(form.inert, false);
    assert.ok(form.transform.startsWith('matrix3d('));
    assert.equal(form.focus, 'forest-username');
    await click('[data-forest-password]');
    assert.equal(await evaluate(`document.querySelector('#forest-password').type`), 'text');
    await click('[data-forest-account]');
    assert.ok(await evaluate(`document.querySelector('[data-forest-feedback]').textContent.includes('not connected')`));
    record('Projected HTML form retains focus, password toggle and truthful account feedback');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await advance(0);
    await shot('portrait-login');
    const mobile = await evaluate(
        `(()=>{const r=document.querySelector('[data-forest-board]').getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};})()`
    );
    assert.ok(mobile.x >= 0 && mobile.right <= 391 && mobile.y >= 0 && mobile.bottom <= 845, JSON.stringify(mobile));
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await advance(0);
    assert.equal(await evaluate(`document.querySelector('[data-forest-replay]').hidden`), true);
    assert.equal(await evaluate(`document.querySelector('[data-forest-board]').inert`), false);
    await shot('reduced-motion-login');
    record('Reduced motion keeps the grounded form available without the descent');
    await click('[data-forest-local]');
    await wait(`!document.querySelector('#forest-entry') && !!${app}.root.findByName('foundation-scene')`);
    assert.equal(await evaluate(`!!${app}.root.findByName('forest-login-sign')`), false);
    record('Portrait form fits; Continue locally opens the game and removes bridge/forest UI');
    assert.equal(issues.length, 0, JSON.stringify(issues));
} catch (error) {
    failure = error;
    console.error(error);
    try {
        await shot('failure');
    } catch {
        console.error('Failure capture unavailable.');
    }
} finally {
    await writeFile(
        new URL('report.json', output),
        JSON.stringify({ url, results, issues, failure: failure?.stack, at: new Date().toISOString() }, null, 2)
    );
    try {
        await send('Browser.close');
    } catch {
        // Chrome can close before acknowledging the command.
    }
    socket.close();
}
if (failure) process.exitCode = 1;

```

### Verification, credits and design sources

`tests/forest.test.mjs` adds no-chain-caption and perspective-quad/degenerate-surface regressions. `public/assets/credits.html` adds creator/license/source/adaptation notices for all three supplied models. DESIGN.md records the physical reveal and readable HTML face. ASSET_LICENSES.md and GITHUB_PUSH.md record evidence, raw/runtime separation and preparation scope. The existing scare runner replaces its retired play-sound selector with the existing sound button; its previous line was `} else await click('[data-forest-play-sound]');` and its current line is `} else await click('[data-forest-sound]');`.
