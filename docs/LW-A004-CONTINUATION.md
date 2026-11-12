# LW-A004 continuation changes - 2026-11-12

This report describes only changes made during the continuation review. The incoming integration was already uncommitted; it remains intact. No commit or submission was made.

## How the asset path works

The preparation manifest records the supplied model files, licences, dimensions, sizes and hashes. The catalogue generator turns that into typed runtime metadata. AssetManager chooses allowed groups and loads each GLB once; scenes instantiate calibrated wrappers from those resources. The commercial policy changes the loaded IDs and substitutions, while Vite separately copies public assets. That independent copy is why runtime filtering needed a packaging step as well.

The beach layout authors camp positions and collision solids. BeachCrowd creates 561 people, builds the nearest 90 rigs immediately, then streams the rest 36 per frame. It periodically enables holders and animation according to player distance. The full population remains present even when distant holders are disabled. WaveCrowd coordinates its watch/point/run transitions alongside the original beach cast.

Game owns the discovery-complete timer and automatic warning advancement. The beach wave controller owns the actual phases, staging, crowd transitions and ending. Checkpoint validation uses the shared solids; it currently rejects newly occupied version-5 positions rather than migrating them. That distinction remains an explicit acceptance issue.

## Code changes

### Commercial output exclusion - vite.config.ts

Before:

```ts
import { defineConfig } from 'vite';
export default defineConfig({
```

After (the existing base/build/optimization options are retained):

```ts
import { readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
export default defineConfig(({ mode }) => ({
```

Added plugin: `commercial-model-exclusion`, build only. `writeBundle` selects the policy using the process environment before Vite's mode environment, reads the preparation manifest, selects `license.includes('-NC')`, validates each simple GLB filename, and unlinks it beneath the selected output's `assets/models/`. Missing files and invalid filenames fail the build. Full output is unchanged. Source files are never removed.

### Correct sign-in text - src/entry/ForestLogin.ts

Before:

```html
<button class="forest-enter" type="submit">ENTER THE FOREST <span aria-hidden="true">→</span></button>
```

After:

```html
<button class="forest-enter" type="submit">SIGN IN <span aria-hidden="true">→</span></button>
```

This corrects the actual submit label to match the request and prior handoff claim; authentication behavior is unchanged.

### Crowd budget - src/episodes/episode-01/BeachCrowd.ts

Before:

```ts
const VISIBLE_RANGE = 92;
const ANIMATED_RANGE = 34;
```

After:

```ts
const VISIBLE_RANGE = 60;
const ANIMATED_RANGE = 24;
```

The Manhattan-distance thresholds reduce nearby drawing and animation work without deleting people. Wave animation still uses the existing range multiplier. Visibility changes can be noticed in far wings; target-device and moving-camera review remain necessary. Baseline boardwalk mean 132.16 ms became 87.67 ms on the first tuned sample; this is not a playable-performance certification.

### Browser verification - scripts/verify-forest.mjs

Before: initialization cleared `last-wave.forest-seen.v2`; a Skip click was expected to settle immediately; game containers were asserted as 42; scare RMS was read once; no populated-crowd timing capture existed.

After: initialization clears `last-wave.intro-skip.v1`; Just this time is verified absent from storage, Always skip is verified persisted; dialog animation completion is awaited before click coordinates are measured. `allowedModels` derives the extra container count from the selected policy. Peak scare RMS is sampled for 12 frames at the unchanged 0.025 threshold. The beach performance fixture leaves discoveries incomplete, waits for full spawning and records 180 frame intervals plus counts and draw calls to `beach-performance.json`. Added wave smoke loads a complete fixture, steps the real game/controller timing, checks automatic warning and crowd evacuation, then teleports through the three gates to check the recoverable ending. This validates state integration, not physical route traversal or every crowd collision.

### Artifact verification - scripts/verify-model-output.mjs (added)

Accepts output directory and full/commercial policy. It compares the entire model filename set against the filtered manifest, then verifies each remaining file's size and SHA-256. This detects extra restricted files, missing allowed files and accidental modification (including ND files). It does not fetch original sources or independently assess licensing.

### Generated-output lint exclusion - eslint.config.mjs

Before:

```js
{ ignores: ['.claude', '.agents', 'public/ammo', 'asset-library/source-packs/**'] },
```

After:

```js
{ ignores: ['.claude', '.agents', 'public/ammo', 'asset-library/source-packs/**', 'verification.local/**'] },
```

Separate immutable browser builds live in the already Git-ignored evidence directory. Excluding it prevents linting generated engine/Ammo bundles. All source, scripts and tests remain linted.

### Formatting and documentation

Prettier normalized the supplied catalogue, preparation manifest, licence/handoff tables, generated credits and touched verification source. Existing source behavior was otherwise preserved. AGENTS, TASKS, ARCHITECTURE, AGENT_CONTEXT and assets README now describe the integration, commercial exclusion, current counts and remaining acceptance. The original handoff is retained with continuation evidence in section 5.

## Evidence and remaining acceptance

See TASKS and handoff section 5 for commands, exact results, ignored local evidence paths, baseline/tuned measurements and remaining issues. Browser runs use isolated muted Chrome and close it in finally. No future story scenes were added.

Teardown follow-up: before each explicit test `app.destroy()`, the runner waits until the registry has no loading assets. A run that destroyed during optional login GLB parsing threw inside the Engine texture loader after its registry was cleared. Normal drained teardown is tested; cancellation/destruction during in-flight GLB parsing remains an open lifecycle limit. Wave smoke checks passed before that later teardown failure. Final clean rerun evidence is tracked in TASKS.
