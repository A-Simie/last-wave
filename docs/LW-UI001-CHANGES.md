# LW-UI001 code changes

The forest is an entry presentation inside the existing AppBase. Continue locally constructs the existing café; account actions remain an explicit, honest integration boundary. Existing S004 work was already present and was preserved.

## Current revision: automatic, voiced and active entrance

The sections below this revision retain the original first-pass snapshots. This revision supersedes their 35-second, caption-only and launcher descriptions.

### Automatic startup and deferred game assets

Previously, `main.ts` started only from the Launch game click listener. It now also executes:

```ts
void launch();
```

`index.html` replaces that launch control with a loading indicator and a hidden failure-only `retry-startup` button. The forest is the first screen after automatic loading. A sound invitation lives inside the forest because browser autoplay policy can still require a gesture.

Previously, `Game.ts` loaded the entire game set before opening the forest:

```ts
assets = await loadGameAssets(app);
app.start();
await openForestEntrance(app, assets.characters, () => replaceScene());
```

It now loads only two rigs and passes an explicit preparation callback:

```ts
const characters = await loadForestCharacters(app);
app.start();
await openForestEntrance(
    app,
    characters,
    () => replaceScene(),
    async () => {
        assets = await loadGameAssets(app);
    }
);
```

`AssetManager.ts` reuses registered assets by name when local entry loads the remaining game containers. `ForestEntrance` disables duplicate entry requests and preserves the visible forest/retry feedback while preparation runs.

### Speech and scare behavior

The first pass displayed dialogue captions over opt-in ambience/generated cues. `ForestAudio.ts` now owns an ambient WAV element and a bundled story MP3 element, with explicit playback failure/blocked/muted states, media-clock synchronization, focus pause/resume, seeking and resource cleanup. `forestDialogue.ts` is generated from the same offline speech timings. The timeline changes from 35 to 44 seconds; the seen preference changes from v1 to v2.

`prepare-forest-audio.py` uses explicit Kokoro **am_michael** and **af_bella** voices, preserving model/license/hash provenance and PCM source. The browser receives compressed audio, without depending on installed system voices. The shared 24-second scare includes an original impact, wings and cry.

`forestScare.ts` supplies both eye anchors and curved bat takeoff paths. `ForestCamera.ts` adds authored travel/close-up/recoil; `ForestGround.ts` adds leaf-litter texture. `ForestPerformers.ts` adds conversational gestures, look-up, startle/duck and turning/look-back. Prepared scenery expands from nine to 32 models, with measured calibration in `forestDetails.ts`. `ForestScene.ts` uses the actual left-hand light and correct spotlight direction.

### Café doorway

Previously, `openingLayout.ts` ended the friend's route in the exit lane, and `entryLayout.ts` started the street route there:

```ts
[8.1, 1.014, 6.65]; // final café waypoint
[8.1, 1.04, 6.65]; // first street waypoint
```

The route now passes through the door and waits beside it:

```ts
export const CAFE_OUTSIDE_WAIT: Vector3Tuple = [10.2, 1.014, 6.65];
// Final café route entries:
([8.1, 1.014, 6.65], CAFE_OUTSIDE_WAIT);
// First street route entry:
CAFE_OUTSIDE_WAIT;
```

This keeps the solid companion out of the passage and avoids walking back into it on departure. The player still crosses through the normal controller/physics. A production browser check loads the departure state, selects Head outside and drives native keyboard movement past the doorway; a unit regression checks route continuity and obstacle clearance.

### Tool scope and verification

`eslint.config.mjs` previously ignored only `.claude`, `.agents` and `public/ammo`; it now also ignores `asset-library/source-packs/**`, where offline model/tool dependencies live. No runtime dependency was added. Current evidence: 109/109 repository tests, 22/22 muted production-browser groups, passing lint/typecheck/build. Browser checks prove decoded speech/scare signal and actual doorway traversal. Audible mix, subjective voice naturalness and physical-device performance remain manual acceptance items. See TASKS for commands and results.

## Existing integration changes

### `src/core/Game.ts`: defer gameplay until entry

Before:

```ts
app.start();
replaceScene();
```

After:

```ts
app.start();
await openForestEntrance(app, assets.characters, () => replaceScene());
```

Added the `openForestEntrance` import. The callback retains existing scene construction, checkpoint ownership and the café starting point. Forest asset failure is handled inside the entry and does not remove local entry.

### `src/main.ts`: focus the appropriate entry control

Before:

```ts
canvas.focus({ preventScroll: true });
```

After:

```ts
const entrance = document.querySelector<HTMLElement>('#forest-entry');
if (entrance) {
    const target = entrance.dataset.phase === 'ready' ? '#forest-username' : '[data-forest-skip]';
    entrance.querySelector<HTMLElement>(target)?.focus({ preventScroll: true });
} else canvas.focus({ preventScroll: true });
```

This prevents launcher completion from stealing keyboard focus from a returning/reduced-motion visitor's form.

### `src/player/CameraController.ts`: provide the texture required by traffic lights

Added after camera component creation:

```ts
camera.camera!.requestSceneColorMap(true);
```

The existing Porsche transmission material warned when the café camera rendered without a scene color texture. The shared camera factory now requests the supported Engine resource; camera controls and framing remain intact.

### `index.html`: describe the actual entry route

Before:

```text
The 3D scene loads after launch. Choose Play story inside to start sound and video.
```

After:

```text
Launch to enter the forest. The intro is skippable. Continue locally, then choose Play story.
```

## Added modules

| File                                 | Responsibility and behavior                                                                                                                                             |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/entry/ForestEntrance.ts`        | Coordinates optional forest loading, preference, activity pause, local-entry callback, failure recovery and destruction. Restores rendering settings before gameplay.   |
| `ForestTimeline.ts`                  | Pure six-phase time/caption model; skip/completion converge at 35 seconds, replay resets, destroyed callbacks cannot advance. Seen preference is isolated from saves.   |
| `ForestAssets.ts`, `forestModels.ts` | Loads optional registry containers and applies vertex-measured scale/grounding; releases all entry-owned containers on handoff.                                         |
| `ForestScene.ts`                     | Real 3D scenery, camera, lighting, terrain, phone/flashlight, leaves and independent idle ambience; portrait framing adapts to the canvas.                              |
| `ForestPerformers.ts`                | Two existing rigs, path-matched animation tracks, speed-matched walk, phone holding, crouch and startle. The source torch pose holds the left hand.                     |
| `ForestEffects.ts`                   | Bounded spatial bats/eyes/webs/mist; generated vertex normals match shader requirements; skip removes transient effects.                                                |
| `ForestAudio.ts`                     | Opt-in ambience and generated positional footsteps/tension, mute, pause, stale async guards and resource cleanup.                                                       |
| `ForestLogin.ts`, `forest.css`       | Accessible DOM form, responsive wooden board/chain presentation, settling motion, focus, Escape/skip/replay and optional real-auth adapter. Passwords are never stored. |
| `scripts/prepare-forest-assets.py`   | Reproducible supplied-pack conversion, palette adjustment, compatible animation-only preparation and source/output hashes. Reuses existing Python asset tooling.        |
| `scripts/verify-forest.mjs`          | Muted CDP acceptance, 16 captures, rig/entry/checkpoint checks, explicit fault-injection report and browser closure.                                                    |
| `tests/forest.test.mjs`              | Timeline, skip/replay, pause/disposal and denied-storage/checkpoint-isolation regressions.                                                                              |

Representative added account behavior:

```ts
if (!this.authentication) {
    this.setFeedback('Sign-in is not connected to an account service yet. Choose Continue locally to play.');
    return;
}
```

The adapter must resolve a real login before the successful-entry callback runs. Local continuation uses its own explicit action and does not pretend to authenticate.

The supplied originals, licenses, hashes and inspections are organized in `asset-library/forest/`; 11 runtime outputs are in `public/assets/forest/`. Shipped credits and README/architecture/task/handoff documents describe these boundaries. Full checks, sources, performance considerations and remaining dialogue/device work are recorded in [TASKS.md](TASKS.md#lw-ui001--cinematic-forest-login-experience).
