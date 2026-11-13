# LW-S005 - Continuous evacuation and living beach

Implemented 2026-11-13. User confirmed player-controlled escape running and fast boats/jet skis as the intended water activity; this implementation uses fast boats.

## Behavior and ownership

- `wave.ts`: automatic-start delay changed from 6 to exactly 3 unpaused seconds after all three discoveries. Quiet UI and existing focus/modal pause checks still apply. `Game.ts` no longer permits an early beach Continue-story start; its existing running Retry behavior remains. Manual checkpoint storage is unchanged.
- `CutsceneSystem.ts` carries an optional immutable `automatic` presentation flag. Warning and blackout definitions opt in. `CutscenePanel.ts` hides Next/Skip, guards click/cancel handlers and uses nonmodal automatic presentation, preserving pointer lock. Earlier cafe and officer dialogue stays reader-paced. `GameHud.ts` shows Retry only during the running stage. Game control suspension preserves pointer lock during wave shots and restores the controller for actual player escape.
- `waterMotion.ts` owns deterministic height/slope math: gentle 0.08 m tide amplitude over 180 seconds, crossing swells and small ripples. `BeachWater.ts` uses analytic normals, rolling shore advance and traveling fading foam. Its shared height/slope callbacks drive swimmer and boat buoyancy. This is stylized cosmetic water, with unchanged navigation/collision bounds; no fluid simulation or changing tidal gameplay barriers.
- `beachMotion.ts` owns continuous stadium circuits and bounded speed approach. `BeachCrowd.ts` moves strollers through curved turns with gradual speed changes and yielding, retains animation for visible moving characters, and releases thrown balls on the paused simulation clock instead of a browser timer. Resting animation remains distance-limited.
- `beachActivityLayout.ts` owns two shore riding corridors outside the central boardwalk and two offshore boat lanes beyond swimmers. `BeachActivities.ts` creates two animated mounted horses, two original quad bodies with rotating licensed wheels and two licensed speedboats. Riders use prepared animation tracks, with a baked straddling pose for horses. Hand-connected reins and quad bars follow animation after update; no runtime bone transforms are written. Boats follow shared wave height/slope and have wakes. Actors accelerate, yield to nearby people, pause with the game and leave during the warning. Land actors are kinematic solids and companion obstacles. Boats remain ambient, inaccessible offshore scenery.
- `BeachArrival.ts` owns activity creation, shared water sampling, companion obstacles and pause/phase propagation. `AssetManager.ts` preloads four activity containers, keeping forest optional-loading sequencing intact. `beachActivities.ts` centralizes model dimensions/grounding.

## Assets, reproduction and Git

Four CC0 GLBs total **570,880 bytes**: horse 289,080; speedboat 20,412; quadWheel 32,756; riderPose 228,632. All remain in full and commercial outputs. Sources are Quaternius Farm Animals, Kenney Watercraft Kit and Car Kit, and existing Quaternius character/animation clips. See ASSET_LICENSES and in-game credits for primary creator links and adaptations.

Run `node scripts/prepare-beach-activities.mjs <offline-tools-directory>` using @gltf-transform/core/extensions/functions 4.5.1 (currently under `%TEMP%/lw-tools`). Valid raw horse source is `Horse-source.gltf` plus `Horse.bin`; Kenney sources are extracted creator archives. The manifest records download URLs, source/output hashes, external-buffer hash, sizes and clips. Do not depend on failed HTML downloads elsewhere in the ignored source folder. New runtime assets, source code, scripts and manifest belong in Git; raw archives, external tools, production builds and screenshots/reports remain ignored. No dependencies or secrets were added. Nothing was committed or pushed.

## Verification

- Node 22.23.4, pnpm 10.32.1: **120/120 tests passed**, including three-second timing/automatic-state snapshots, bounded tide/analytic slopes and continuous safe circuits.
- `pnpm lint` and `pnpm typecheck` passed after rider corrections.
- Full production build and commercial production build passed. Output audits verify **37 full / 32 commercial supplied models**, exclude the five NC files in commercial output, and verify **4/4 activity files** in each by byte size and SHA-256.
- `scripts/verify-beach-life.mjs` exercises immediate local entry, six moving actors/animated horse joints/rotating wheels/buoyancy, paused positions, six close-up rider views, advancing water, exact automatic trigger, hidden/guarded Next/Skip, all four warning shots, preserved pointer lock, real W-key running, and automatic fall/blackout. Uses an isolated muted browser and closes it in finally. Final production run: **7/7 check groups passed**, with **zero runtime/network issues**. Six rider close-ups were inspected; reins and quad grips connect to animated fingers and the boat driver is visible above the cockpit. Final production results and captures are under ignored `verification.local/beach-life/`.
- `verify-forest.mjs` expectations include four new containers and the three-second trigger. Its full acceptance suite has not been repeated for this task; the focused production runner covers changed behavior.

- Scoped source formatting, repository-wide `pnpm fmt` and `git diff --check` are checked during closeout. The full forest runner remains unexecuted as stated above.
- Headless rendering-only sample with the whole beach instantiated, simulation frozen at `timeScale=0`: **60 frames, 196.765 ms mean (~5.08 fps), 466.7 ms maximum, 1,718 draw calls**. This includes the roughly 600 beach people and six new riders. It is not an active-play frame-rate benchmark and does not establish a regression against a matched baseline. Smooth target-device play remains unresolved; performance.json preserves the measurement.

## Representative before/after

`wave.ts` previously used `WAVE_AUTOSTART_DELAY = 6`; it now uses `WAVE_AUTOSTART_DELAY = 3`. Warning and blackout definitions add `automatic: true`.

The panel previously called `this.root.showModal()` and always focused `this.nextButton`. It now uses:

```ts
if (automatic) this.root.show();
else this.root.showModal();
```

Next/Skip visibility and their event handlers both honor the automatic flag. This prevents hidden-control activation and preserves pointer lock through the movie-to-running handoff. Other cutscenes retain modal reader pacing.

## Limits and next action

Ambient routes use local yielding, not a full crowd navigation solver; dense crossing congestion and expanded-crowd evacuation through props remain limitations. Quad bodies/reins/wakes are stylized geometry. Riders do not dismount and these vehicles are not player-drivable. Existing police gestures and imported car-wheel limitations remain. Tide movement does not alter checkpoint validity. Full physical-device, mobile, long-session and target frame-rate acceptance remains open under LW-F002; a headless rendering sample is evidence only, not a 60 fps claim. The story still ends at recoverable blackout; no future hospital scene was added.

Next action: review the final screenshot/report and test on target hardware, then commit/push the reviewed changes using GITHUB_PUSH instructions when desired. Suggested commit: `feat: animate beach activities and automate evacuation cinematics`.
