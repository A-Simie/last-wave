# LW-A004 — Supplied "New FIles" integration · Handoff

Status: **implemented, not yet fully verified.** Original handoff 2026-11-10; continuation evidence below. Read this before continuing.
Licences, credits and the commercial swap list are in [`ASSET_LICENSES.md`](ASSET_LICENSES.md).

## 1. The original request (checklist)

| #   | Request                                                                             | Status                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Real flying bat in the login scene                                                  | Done in code: animated `vampireBat` replaces the procedural flock, plus circling bats. **Facing and scale not checked in the browser.** |
| 2   | Houses added to the street                                                          | Done: 11 supplied buildings across 18 street blocks                                                                                     |
| 3   | Police officer and police car replace the current officer                           | Done: `police.glb` replaces the entrance officer's visual, patrol car parked by the entrance, second officer on the beach               |
| 4   | Headstone on the sign-in page                                                       | Done: `grave.glb` beneath the board                                                                                                     |
| 5   | New booth replaces the ticket booth                                                 | Done: `ticketBooth.glb` at the pass counter                                                                                             |
| 6   | Sushi shop on the beach; longer, wider beach                                        | Done: sushi & ramen booth; beach widened from 96 m to 240 m                                                                             |
| 7   | More umbrellas and beach scenes; 500+ people lying, sitting, playing                | Done: 561 new people (about 600 in total)                                                                                               |
| 8   | New car and buses in traffic                                                        | Done: 2 buses, 2 pickups, 2 patrol cars added to the 8 Porsches                                                                         |
| 9   | More pedestrians; people crossing the road                                          | Done: 20 → 45 walkers, plus 10 crossers at 5 zebras; cars stop for them                                                                 |
| 10  | People buying water, soft drinks, juice and fruit at kiosks                         | Done: 6 kiosks with vendors and queuing customers                                                                                       |
| 11  | Fancy umbrellas for people walking in the sun                                       | Done: carried umbrellas use the 4 supplied designs                                                                                      |
| 12  | Shops used                                                                          | Done: corner shop, fish shop and street store on the street                                                                             |
| 13  | Every file used; licensing documented                                               | Done: all 37 unique files used (one file is a duplicate). See `ASSET_LICENSES.md` and `credits.html`.                                   |
| 14  | Login button reads "Sign In"                                                        | Done                                                                                                                                    |
| 15  | Intro always plays; skip asks "Always skip / Just this time"; saved in localStorage | Done: key `last-wave.intro-skip.v1`                                                                                                     |
| 16  | Same-named files are not the same; use all of them                                  | Done: documented in `ASSET_LICENSES.md` §2                                                                                              |
| 17  | Beach free flow after the three tasks, no pressing Next                             | Done: wave auto-starts after 6 s; warning beats auto-advance                                                                            |
| 18  | Kiroween: list NC files for swapping, or replace them                               | Done: swap list plus `VITE_ASSET_POLICY=commercial`; replacements still to be sourced (§4)                                              |

## 2. What was done (by file)

### Asset pipeline

The tooling lives outside the repository in `%TEMP%\lw-tools`: glTF-Transform 4.5.1, draco3dgltf 1.5.9, meshoptimizer 1.3.0, sharp 0.35.5, all pinned.

To reinstall:

```powershell
mkdir $env:TEMP\lw-tools; cd $env:TEMP\lw-tools
'{"name":"lw-tools","private":true,"type":"module"}' | Set-Content package.json
npm install --save-exact @gltf-transform/core@4.5.1 @gltf-transform/extensions@4.5.1 @gltf-transform/functions@4.5.1 draco3dgltf@1.5.9 meshoptimizer@1.3.0 sharp@0.35.5
```

- `scripts/prepare-new-assets.mjs`
    - Reads `New FIles/` and writes `public/assets/models/*.glb` (37 files, about 40 MB). The supplied set was about 900 MB, including a 308 MB country house.
    - Per-model options: `ground` strips Sketchfab display planes, `cull` drops tiny or dense fittings, `mask` and `lit` fix materials, and `verbatim` handles ND files.
    - Run it with `node scripts/prepare-new-assets.mjs $env:TEMP\lw-tools`. Use `$env:NODE_OPTIONS="--max-old-space-size=14336"` for the big houses.
- `scripts/new-assets.prepared.json` records the preparation manifest: hashes, sizes, triangles, licence and author.
- `scripts/generate-model-catalog.mjs` generates `src/data/newModels.ts`.
- `scripts/generate-credits-section.mjs` regenerates the credits section in `public/assets/credits.html` between `supplied-models` markers.

### Runtime code (new)

| File                                          | What it does                                                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/newModels.ts`                       | Generated catalogue: file, licence, author, source, metre dimensions                                                                                              |
| `src/data/assetPolicy.ts`                     | `full` / `commercial` policy and `COMMERCIAL_SUBSTITUTES`                                                                                                         |
| `src/scenes/createPreparedModel.ts`           | Instantiates a prepared model under wrapper entities with optional footprint or height fit. Never set transforms on the returned hierarchy root.                  |
| `src/entry/ForestLoginDressing.ts`            | Headstone, skull, goblet, two skeletons, cobwebs and animated bats                                                                                                |
| `src/episodes/episode-01/streetLayout.ts`     | Building-to-model map, kiosks, crossings, parked police car and their solids                                                                                      |
| `src/episodes/episode-01/StreetKiosks.ts`     | Kiosk build plus a queue → buy → step aside → return customer loop                                                                                                |
| `src/episodes/episode-01/beachCrowdLayout.ts` | Seeded deterministic crowd: 167 spots, 373 solids, 561 people                                                                                                     |
| `src/episodes/episode-01/BeachCrowd.ts`       | Progressive spawn (90 at once, then 36 per frame), distance culling (92 m) and animation range (34 m), ball games, swimmers, strollers, wave watch/point/evacuate |

### Runtime code (changed)

- `AssetManager.ts`: loads the street, beach, umbrella, vehicle and character models into `assets.models`.
- `ForestAssets.ts`: `loadLoginModels` streams the login models in without blocking.
- `ForestEntrance.ts`, `ForestTimeline.ts`, `ForestLogin.ts`, `forest.css`
    - The intro always plays, unless the visitor chose "Always skip" or the OS requests reduced motion.
    - **Skip intro** and Esc open a themed dialog with **Always skip**, **Just this time** and **Keep watching**. The intro and audio pause while it is open.
    - **▶ Play the intro on every visit** on the board clears the preference.
    - The submit button reads **SIGN IN**.
    - `hasSeenForest` / `rememberForest` remain exported but are no longer used.
- `ForestScene.ts` / `ForestEffects.ts`: `addLoginModels()`; the procedural bats now act only as a fallback.
- `CafeSurroundings.ts`: mapped blocks keep their collision box, gain a lawn, and the model is fitted inside facing the road.
- `StreetLife.ts` (rewritten)
    - 45 walkers and 10 crossers, with curb waiting
    - mixed traffic with per-vehicle length spacing; cars stop for pedestrians in the road
    - carried model umbrellas
    - animation range of 48 m
- `StreetVehicle.ts`: `createModelVehicle`. The bus is yawed 90° (**assumed nose at −X, unverified**).
- `BeachEntrance.ts` / `StreetEntry.ts`: ticket booth model, parked patrol car, and the `police` model over the hidden officer rig. The rig keeps the head anchor and collision.
- `entryLayout.ts`: beach ground 96 → 240 m wide, with rails at ±119.7.
- `BeachDressing.ts`: wider rails and sand, 23 buoys, the original 18 shade posts now carry the supplied umbrellas, and the beach officer.
- `BeachWater.ts` / `WaveSurge.ts`: water ±200 m (128 columns), foam ±128 m, surge ±150 m.
- `BeachNavigation.ts`: the companion's grid is limited to |x| ≤ 58 for performance.
- `beachLayout.ts`: `BEACH_POLICE_OFFICER` solid.
- `BeachLife.ts`, `WaveCrowd.ts`, `BeachArrival.ts`: create the crowd and connect it to calm/wave pause, watch, point and evacuate. Evacuees run inland and vanish at z > 9.4.
- `wave.ts` / `Game.ts`: `WAVE_AUTOSTART_DELAY` = 6 s and `warningBeatDuration()`. The game loop starts the wave and advances the `e1-wave-warning` beats when no menu or dialogue is open. **Next** and **Continue story** still work early.
- `FoundationState.ts`: checkpoint validation includes the kiosk, police car and crowd solids.

### Tests and docs

- `tests/new-assets.test.mjs` (7 tests): catalogue against files, ND files byte-identical, NC policy and substitutes, every model placed, 500+ crowd clear of shore and boardwalk, kiosk queues and crossings walkable, wave timing, intro-skip storage.
- `tests/street-entry.test.mjs`: the out-of-area probe moved 40 m east because the street queue mark's x now lies on beach sand.
- `docs/ASSET_LICENSES.md`, this file, and the `credits.html` section.

## 3. Verification so far

| Check                                       | Result                                                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx tsc --noEmit`                          | **Passed**                                                                                                                                                                                                                                   |
| `pnpm test`                                 | **116/116 passed** (Node 22.20.0; the repo asks for ≥ 22.23.2)                                                                                                                                                                               |
| `pnpm lint`                                 | **Not confirmed.** The last full run found 3 `import-x/order` errors, in `src/entry/ForestScene.ts` and `tests/new-assets.test.mjs`. `eslint --fix` and `prettier --write` were started but interrupted, so whether they applied is unknown. |
| `pnpm build`                                | **Not run**                                                                                                                                                                                                                                  |
| Browser / gameplay                          | **Not run.** Only offline model previews were rendered, which confirmed scale and the facing of houses, booth, chair, police, cars and bat.                                                                                                  |
| Performance with about 600 beach characters | **Not measured**                                                                                                                                                                                                                             |

## 4. What still needs to be done

### Must do before committing

1. Run `npx eslint --fix src tests scripts` and `npx prettier --write src tests scripts public/assets/credits.html docs`, then `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.
2. Run the game (`pnpm dev`) and check each item in §1 in the browser:
    - Bat facing: `BAT_YAW_OFFSET` in `ForestLoginDressing.ts`. Wingspan is `BAT_WINGSPAN`.
    - Headstone, skeleton, goblet, skull and cobweb placement in front of the camera.
    - Seated people on deck chairs: `SEAT` in `BeachCrowd.ts`. Lying people: `LYING_LIFT`.
    - Bus direction: `VEHICLE_YAW` in `StreetVehicle.ts`. Pickup and police car were confirmed as nose +Z.
    - Carried umbrella height (`-0.12` and `footprint` in `StreetLife.ts`), kiosk vendor and customer facing, ticket booth window facing the street.
    - Street houses facing the road and lawns not z-fighting.
    - The wave: the crowd stands, points and runs inland, the free flow reaches running, then the blackout.
3. Measure the frame rate on the beach. If it is too slow, lower `ANIMATED_RANGE` and `VISIBLE_RANGE`, or reduce spots by changing the grid steps in `beachCrowdLayout.ts`. Also measure the arrival handoff time with 90 rigs spawned up front.
4. Update `scripts/verify-forest.mjs`:
    - It clears `last-wave.forest-seen.v2`; use `last-wave.intro-skip.v1` instead.
    - It clicks `[data-forest-skip]` and expects an immediate skip. It must now click `[data-forest-skip-once]` in the dialog.
    - Check other browser runners for "ENTER THE FOREST" or the manual **Continue story** step.

### Licensing follow-ups

5. **Commercial build exclusion.** Add a build step, such as a Vite plugin or a post-build script, that deletes the five NC files from `dist/assets/models/` when `VITE_ASSET_POLICY=commercial`. The code already never loads them.
6. Before the Kiroween submission, either submit the commercial build or get written permission from the five NC authors (`ASSET_LICENSES.md` §3). Read the contest rules on third-party assets.
7. Optionally source CC0 replacements for the bat, bus and pickup (Kenney Car Kit, Quaternius or Gobkit), then change the `COMMERCIAL_SUBSTITUTES` targets.
8. Optionally archive the original downloads into `asset-library/new-files/`, since `New FIles/` is git-ignored. Hashes are recorded in `scripts/new-assets.prepared.json`.

### Documentation follow-ups

9. Add an **LW-A004** entry to `docs/TASKS.md` with the checks from step 1 and the browser results.
10. Update `docs/ARCHITECTURE.md` with the new modules and contracts in §2, and `docs/AGENT_CONTEXT.md` and `AGENTS.md` with the new counts: beach 240×48 m, about 600 beach people, 45 + 10 street pedestrians, 14 vehicles, 6 kiosks, and free flow.
11. Update `public/assets/README.md` totals to add the `models/` folder (37 GLBs, about 40 MB) and its link to `ASSET_LICENSES.md`.

### Known limitations and decisions to review

- The uniformed officer is a static model; the hidden rig still plays talk and idle, but no gestures are visible.
- The supplied vehicles have no separable wheels, so they don't spin. The new vehicles have no visible drivers.
- Seated beachgoers use the café sitting clip on deck chairs. No dedicated lying clip exists; lying is the idle pose rotated flat.
- Saves from before this change that stood where a new kiosk or crowd solid now sits will be rejected as invalid; no migration was added. The wider beach only makes more positions valid.
- Evacuating crowd members run straight inland and can pass through camp props.
- The pickup (8.4 MB) and skull (6 MB) are large because ND forbids optimisation.

## 5. Continuation review - 2026-11-12

The initial handoff described implemented intent, not complete acceptance. Review found the sign-in submit text still said ENTER THE FOREST; it is now SIGN IN. Existing source changes were retained; nothing was committed.

Completed: supported portable Node 22.23.4, pnpm 10.32.1; initial and refreshed lint/typecheck pass; all 116 tests pass; full and commercial builds pass. Commercial packaging now removes the five NC models automatically. `node scripts/verify-model-output.mjs dist commercial` checks all 32 remaining files against manifest size/SHA-256 and rejects extras; the full variant checks 37. This is packaging verification against recorded metadata, not a new legal/contest review.

The browser runner now clears `last-wave.intro-skip.v1`, exercises Just this time and Always skip, verifies persistence, and derives the game-container count from the catalogue (71 full / 68 commercial). The scare analyser now measures peak RMS over 12 frames rather than asserting one arbitrarily timed sample. It retains the original threshold. The beach fixture leaves discoveries incomplete so performance capture cannot be interrupted by the new wave timer. It waits for every crowd rig, samples 180 rendered frames, records counts/frame time/draw calls, and captures the populated beach. Every run closes its isolated muted browser in finally. ESLint excludes generated `verification.local/` output, matching its existing Git exclusion.

Baseline full-build browser pass: **23/23 groups**, zero unexpected issues. It covers forest media/focus/replay, skip preferences, responsive UI, forest teardown, real keyboard passage through the cafe doorway, street/beach checkpoint loads, reduced motion and injected missing-scenery recovery. The expected blocked scenery requests are recorded separately. Baseline evidence: `verification.local/forest/baseline-report.json` and `baseline-beach-performance.json`.

Baseline beach: 561 additional rigs fully spawned; 350 visible / 54 animated; mean 132.16 ms, p95 156.20 ms (about 7.6 FPS), 1,954 draw calls at the boardwalk, 1440 x 1000 headless Chrome. These are host observations, not physical-device acceptance. Visibility/animation Manhattan ranges were reduced from 92/34 m to 60/24 m without reducing the total population. Repeat evidence is recorded in TASKS when complete. No claim of a target-device frame-rate pass is made.

Reviewed actual in-game screenshots: sign-in board and beach arrival/crowd. They establish scene integration, not complete calibration of bus facing, bat flight direction, chair pelvis contact or carried umbrellas. Those still need close-up moving views. The automated forest runner does not execute the full expanded-crowd evacuation through blackout; previous S004 evidence cannot certify the new crowd.

Remaining acceptance: physical-device performance; close-up pose/facing/umbrella calibration; expanded-crowd wave/evacuation through blackout; safe relocation/migration of older version-5 saves newly blocked by camps/kiosks; review companion following beyond |x| = 58. Static officer gestures, wheel/driver limitations and straight-line extra-crowd evacuation remain as in section 4. Hospital continuation remains out of scope.

Reproduction (PowerShell):

```powershell
$env:PATH = "$env:LOCALAPPDATA/Temp/opencode/node-v22.23.4-win-x64;$env:PATH"
pnpm lint
pnpm typecheck
pnpm test
# Full build, keep this separate from any actively served output
pnpm build --outDir verification.local/build-full
node scripts/verify-model-output.mjs verification.local/build-full full
$env:VITE_ASSET_POLICY = 'commercial'
pnpm build
node scripts/verify-model-output.mjs dist commercial
Remove-Item Env:VITE_ASSET_POLICY
# Serve an immutable full build; launch isolated Chrome with --mute-audio and CDP 9223
$env:GAME_URL = 'http://127.0.0.1:5182/'
node scripts/verify-forest.mjs
```

Set `VITE_ASSET_POLICY=commercial` for the Node browser runner too when testing a commercial output so expected container counts agree. Do not rebuild a directory while a browser suite is reading it. Offline preparation was not repeated; source originals remain ignored and must be backed up separately.

Tuned first complete pass: 561 spawned, 165 visible, 15 animated; mean 87.67 ms, p95 117.40 ms, 1,791 draw calls (about 11.4 FPS). A later wave-smoke pass measured mean 78.80 ms / p95 89.90 ms and 1,801 draw calls. All three additional wave-state checks passed through the recoverable ending; gates were teleported, so physical evacuation remains open. Optional loading is drained before normal Engine teardown; an interrupted-load destruction race was observed and is not certified. Detailed code changes are in `LW-A004-CONTINUATION.md`.

Final continuation acceptance: **26/26 full-build browser groups**, zero unexpected issues, muted isolated Chrome closed. Automatic warning/evacuation/blackout state smoke passed with teleported gates. Latest beach sample: 561 spawned / 165 visible / 15 animated, 100.63 ms mean / 115.70 ms p95, 1,781 draw calls; earlier tuned samples were 78.80 and 87.67 ms mean. Performance is not accepted. Full/commercial model audits passed 37/32 files. See TASKS for remaining calibration, physical traversal, interrupted-load teardown and version-5 geometry limits; code walkthrough and before/after details are in LW-A004-CONTINUATION.md.
