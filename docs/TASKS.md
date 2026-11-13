# Last Wave — Task tracker

Last updated: **2026-11-13**. Latest continuation: **LW-S005**, documented below. Historical acceptance records follow. Latest completed task: **LW-S004 — Wave, panic, and blackout**, including the playable evacuation/recovery, expanded city/beach, licensed Porsche traffic, relaxed rigged locomotion and version-5 checkpoints. Automated browser acceptance passed **116/116 core checks**, plus two supporting calibration/view checks; repository tests passed **100/100**. Closeout refreshed repository checks, the **13/13** production flow and the asset/deployment audit. Hardware acceptance remains under **LW-F002**. The story continuation point is **after-blackout**; hospital awakening requires a separate task. Earlier task records retain their original verification environments.

Current UI task: **LW-UI001 — Cinematic Forest Login Experience**. Implementation and verification are recorded below. The supplied brief's S003/S004 assumptions are historical: S004 remains complete and no hospital scene is added.

## Repository hygiene — 2026-11-10

- [x] Expanded `.gitignore` to exclude the entire root `asset-library/`, case variants of `New Files/`, `Sign-login/`, coverage, tool caches, pnpm store, TypeScript build metadata and Windows desktop metadata. Existing dependency/build/log/environment/local-evidence exclusions remain.
- [x] Removed 51 previously tracked library files from Git's index using `git rm -r --cached -- asset-library`. All local library files remain on disk. This stages their removal from future repository snapshots; it does not erase earlier Git history.
- [x] Removed forest unit-test dependencies on local library PCM and preparation records. A small checked-in soundtrack metadata fixture verifies deployed MP3 bytes/hash, complete cue timings, explicit voices and shared scare timing. Actual decoded audio output remains covered by the existing browser runner; offline PCM energy checks are historical evidence, not fresh-clone requirements.
- [x] Verified ignore rules for all requested directories, no tracked library files remain, local library files still exist, and runtime assets plus the lockfile remain included. Reviewed the configuration diff. No gameplay/runtime logic changed.
- [x] Verification: `pnpm test` **109/109 passed**, `pnpm lint`, `pnpm typecheck` and `npm run build` passed using Node 22.23.4. Scoped Prettier and staged/unstaged `git diff --check` passed. Browser checks were not repeated because runtime behavior did not change.

Next action: commit the ignore rules and staged library removals together when ready. If removing already-pushed large files from Git history is wanted, scope that separately; this change affects future snapshots only. Continue LW-UI001 manual acceptance as recorded below.

## Documentation consistency review — 2026-11-10

- [x] Cross-checked the current fixes and implemented story against EPISODE_01, GAME_DESIGN, ARCHITECTURE, AGENT_CONTEXT and this tracker. Added the forest presentation's narrative beats and explicit noncanonical-identity/checkpoint boundaries to the story guide, plus the verified café doorway correction.
- [x] Corrected stale Launch-button, full-preload-before-forest and 100-test descriptions in current design/architecture sections. Earlier dated acceptance records remain historical. The implemented canonical route still ends at recoverable blackout; hospital and Kiroween continuation remain planned.
- [x] Documentation-only validation: scoped Prettier and `git diff --check` passed; no runtime checks were repeated. Existing 109-test/22-browser evidence and outstanding audible/acting/physical-device checks remain clearly distinguished.

Next action: perform the outstanding manual LW-UI001/LW-F002 review; no additional story scene is authorized by this documentation review.

## Project checklist

Checked items have working implementations and verification recorded below. Physical-device acceptance is tracked separately in LW-F002.

### Project foundation

- [x] Install Node.js and pnpm — verified with supported Node **22.23.4** / pnpm **10.32.1** in LW-A003.
- [x] Generate the PlayCanvas third-person starter.
- [x] Verify build and browser preview.
- [x] Set up Git and `AGENTS.md`.
- [x] Create basic test environment.

### Core game systems

- [x] Player movement and camera.
- [x] Interactions.
- [x] NPC dialogue — reusable branching guide conversation, verified in LW-C001.
- [x] Quest tracking — data-driven guide/signal-box quest, verified in LW-C002.
- [x] Inventory and clue journal — unique signal-box note and readable journal, verified in LW-C003.
- [x] Scene transition and save system — validated foundation checkpoints and scene replacement, verified in LW-C004.

### Episode 1 — Story

- [ ] Coffee shop and TV broadcast — opening flow prototyped in the foundation under LW-S001; dedicated scene/transition remain.
    - [x] Opening prototype acceptance — source dialogue, belongings, optional conversations, friend/exit objective, checkpoint migration.
    - [x] Imported café dressing — ten supplied models, calibrated furniture, warm lighting, asset catalog, and shipped credits under LW-A002.
    - [x] Cinematic café and animated cast — 28 prepared props, nine rig variants, four table-centered fans, reporter playback, music, and reader-paced camera/dialogue under LW-A003.
    - [x] Open street — shops/houses, walking pedestrians, suited commuters, sun umbrellas, traffic, drivers, and native batching under LW-A003.
    - [x] Halloween identity — pumpkin/bat/web wordmark, pumpkin favicon, and black branded startup screen.
- [x] Guided street and beach entry — lessons, pedestrian directions, solid companion, entrance, officer, passes, queue, and recoverable arrival verified under LW-S002.
- [x] Beach exploration — both characters, white sand, umbrellas, loungers, swimwear-clad beachgoers/swimmers, chilled drinks, free-order discoveries and ambience verified under LW-S003.
- [x] Wave and evacuation — retreat, fleeing birds, pointing crowds, wave reveal, playable evacuation, separation, fall, blinking blackout, and recoverable black ending under LW-S004.
- [x] Expanded city/beach and relaxed locomotion — open beach access/shoreline, larger populations, licensed Porsche traffic and speed-matched rigged movement under LW-S004.
- [ ] Hospital awakening and investigation.
- [ ] Hospital escape puzzle.
- [ ] Kiroween City quests.
- [ ] Episode-ending transmission.

### Entry experience

- [ ] LW-UI001 — Cinematic forest login: automatic voiced entrance, richer scene, synchronized bat scare and doorway fix passed automated acceptance; audible/acting review and physical-device checks remain.

### Social game foundation

- [ ] Two-player Colyseus prototype.
- [ ] Matchmaking and reconnect.
- [ ] Shared cooperative mission.
- [ ] Chat, report and block controls.
- [ ] Preference-driven event proof.

### Persistent backend

- [ ] NestJS API.
- [ ] PostgreSQL database.
- [ ] Player accounts and saved characters.
- [ ] Inventory and quest persistence.
- [ ] Approved preference storage.
- [ ] Deployment and monitoring.

## LW-F001 — Establish the gameplay foundation

| Field      | Value                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| Owner      | Lead game engineering                                                        |
| Priority   | P0                                                                           |
| Dependency | Official PlayCanvas third-person starter                                     |
| Status     | Complete; automated browser acceptance passed                                |
| Scope      | One local test area, player, camera, collisions, stationary NPC, interaction |

### Completed implementation

- [x] Inspected all source/configuration files, installed PlayCanvas 2.23.3 controller and declarations, project rules, and design documents.
- [x] Confirmed starter build, lint, type-check, and desktop walking/sprinting/stopping baseline.
- [x] Established `core/`, `player/`, `systems/`, `scenes/`, `ui/`, `data/`, and reserved episode/networking directories.
- [x] Reserved all six `public/assets/` categories; documented asset provenance requirements.
- [x] Extracted native AppBase bootstrap, Ammo loading, single-scene ownership, camera configuration, character geometry, and procedural animation.
- [x] Preserved the stock controller, jump, zoom, input mappings, and the starter's nine-point ledge grounding correction.
- [x] Added four perimeter walls around the starter's ground, rotated blocks, trees, log, and stump.
- [x] Added a stationary purple guide with a static collider.
- [x] Added an amber signal box with distance/line-of-sight interaction selection.
- [x] Added **Press E to Interact**, a four-second confirmation message, a touch/click action, and reset control.
- [x] Added resource/listener cleanup for scene reset and application teardown.
- [x] Added loading/failure feedback and Last Wave page/HUD labels.
- [x] Recorded architecture and continuation instructions.

### Verification record

Baseline (before restructuring): `pnpm build`, `pnpm lint`, and `pnpm typecheck` passed. Chrome with actual keyboard input measured approximately 5 m/s walking and 7.6 m/s sprinting, then stopped on release.

Final checks on **2026-11-04**, including a fresh build after the physics startup-order correction:

- `pnpm build` — passed; deployable output generated in `dist/`.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm exec prettier --check src docs README.md index.html public/assets` — passed for the foundation implementation and documentation.
- `pnpm fmt` — remaining failures are pre-existing formatting in `AGENTS.md` and `pnpm-lock.yaml`.
- `git -c core.safecrlf=false diff --check -- . ':!AGENTS.md'` — passed. The full `git diff --check` reports only pre-existing trailing whitespace/end-of-file spacing in `AGENTS.md`. Reviewed the tracked diff and all new source/documentation files.

**Browser acceptance:** 32 development checks and **34 production checks passed**, using headless Chrome **156.0.8078.79** on Windows through CDP. Input checks dispatch browser keyboard, mouse, and touch events; controlled teleports place the player for ledge/collision cases. Runtime inspection uses the Engine devtools hook.

- Startup loaded the local Ammo runtime, created the physics world, and grounded the player at Y≈1. All 19 rigid-body roots have unit scale.
- All WASD directions stop on release; diagonals are normalized. Production walking speed was **4.98 m/s**, sprint **7.64 m/s**, and **5.04 m/s** after releasing Shift. Procedural limb animation ran while moving.
- Ground jumping, landing, and jumping with the player's center beyond a block ledge passed.
- Sprint collision passed against all four walls, a block, a tree trunk, the log, stump, signal box, and NPC.
- Mouse orbit/pitch, camera-relative movement, wheel zoom, camera wall avoidance, and recovery passed.
- Walking into range displayed **Press E to Interact**; E displayed **Signal box checked. The interaction is working.** The message expired after four seconds. Out-of-range input, key repeat, solid occlusion, disabled targets, and leaving range behaved correctly.
- Repeated reset retained one scene root, 19 bodies, one stationary NPC, and one HUD while clearing interaction state.
- Resize from 1280×800 to 900×500 updated canvas resolution. Emulated 390×844 touch layout, left-drag movement, and tap interaction passed.
- Direct `app.destroy()` removed the scene, HUD, interaction callbacks/targets, keyboard, pointer lock, graphics device, and devtools registration. Subsequent resize/key input produced no errors.
- Desktop and mobile console/network checks were recorded separately: **no warnings, exceptions, shader errors, failed requests, or HTTP errors**. Desktop, prompt, confirmation, and mobile screenshots were visually inspected.

Production was served with:

```powershell
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

The local verification command, with an isolated Chrome CDP session on port 9223, was:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-production'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
```

Workspace-local evidence is in `C:\Users\HP\AppData\Local\Temp\opencode\`: `last-wave-verification.json` (development), `last-wave-production-verification.json`, and `last-wave-production-{desktop,prompt,interaction,mobile}.png`. The CDP helper and verification script are also there. The manual route below is the portable acceptance procedure for a fresh clone.

### Files and decisions

- Bootstrap and lifecycle: `index.html`, `src/main.ts`, `src/core/{Game,SceneManager,AssetManager}.ts`.
- Player foundation: `src/player/{PlayerController,CameraController,PlayerAnimation,CharacterModel}.ts` and `src/scripts.d.ts`. These replace the responsibilities of `src/controller.ts`.
- Gameplay and presentation: `src/scenes/FoundationScene.ts`, `src/data/foundation.ts`, `src/systems/InteractionSystem.ts`, `src/ui/GameHud.ts`, and `src/ui/game.css` (replaces `src/starter.css`).
- Structure and handoff: six `public/assets/` category placeholders and asset notes; scope READMEs under `src/systems/`, `src/networking/`, and `src/episodes/episode-01/`; `README.md` and the five Markdown documents under `docs/`. The previously empty `docs/TASKS.MD` became this task tracker.
- Key decisions: retain the shipped controller and ledge shim, configure its camera through a player adapter, keep physical roots unscaled, own scene resources under one resettable root, and publish typed interaction state to a DOM HUD. `app.start()` precedes scene construction because it installs the Ammo world. Full rationale and extension points are in [ARCHITECTURE.md](ARCHITECTURE.md).
- Existing worktree items on entry included the project-specific `AGENTS.md`, React additions in `package.json`/`pnpm-lock.yaml`, and both original design DOCX files. This task added no dependencies.

### Limitations

- Physical mobile devices, physical gamepads, and Firefox/Safari have not been tested. Touch automation covered movement and interaction; right-drag look, farther-drag sprint, and double-tap jump still need hardware acceptance. Hardware performance budgets are unmeasured.
- Application teardown was invoked directly; the Vite HMR trigger and startup-error display were code-reviewed rather than fault-injected.
- Commands ran with Node **22.20.0** and pnpm **10.32.1**. pnpm warns because the project declares Node **≥22.23.2**; build/lint/type-check nevertheless passed. Use the declared Node version for the next verification run.
- Foundation verification recorded pre-existing `AGENTS.md` and lockfile formatting findings; LW-C001 resolves the `AGENTS.md` findings.

### Manual acceptance route

1. Run `pnpm install`, then `pnpm dev`; click the scene to capture the mouse.
2. Try all WASD directions, diagonals, Shift press/release, mouse orbit, scroll zoom, and Space jump. Movement follows camera yaw.
3. Walk/sprint into the blocks, perimeter walls, tree trunks, NPC, and signal box. Jump onto the stump/log/blocks and jump again near a ledge.
4. Orbit near a wall or tree; check the camera contracts and recovers without losing the player.
5. Approach the amber box at `(1.8, 0.6, -3.5)`. The purple guide stands behind it at `(1.8, 1, -5.5)`.
6. Within 2.3 m of the box's center, with a clear solid-geometry sightline, confirm **Press E to Interact**. Press E; expect **Signal box checked. The interaction is working.**
7. Leave range: prompt disappears. The message expires after four seconds of game time. E outside range has no effect; holding E must not continuously refresh the message.
8. Press Esc, click **Reset test area**, and repeat. Confirm one player, one NPC, one box, and one HUD remain.
9. Resize the window. On a touch device, use the starter's left/right drag gestures and **Tap to Interact**.
10. Check the browser console for errors and missing assets. Backquote opens the dev-only PlayCanvas Inspector; F9 pauses, F10 steps.

## Handoff

- Start with [ARCHITECTURE.md](ARCHITECTURE.md) and the acceptance route above.
- Scene positions and interaction copy/radius: `src/data/foundation.ts`.
- Scene geometry/materials: `src/scenes/FoundationScene.ts`.
- Movement and ledge fix: `src/player/PlayerController.ts`; camera tuning: `src/player/CameraController.ts`.
- Interaction rules: `src/systems/InteractionSystem.ts`; conversations: `src/systems/DialogueSystem.ts` and `src/data/dialogues.ts`; quest rules/data: `src/systems/QuestSystem.ts` and `src/data/quests.ts`; inventory rules/data: `src/systems/InventorySystem.ts` and `src/data/items.ts`; DOM presentation: `src/ui/`.
- A scene reset is the reference teardown path. Recheck it whenever adding scripts, callbacks, materials, or assets.
- LW-C004 adds manual local checkpoints and validated scene replacement in the foundation area; its acceptance record is below. Physical-device acceptance continues under LW-F002; record OS/browser, gesture results, persistence behavior, and frame-time observations there.

## LW-F002 — Hardware acceptance

Status: **Supported-Node verification complete; hardware checks pending**. Owner: **Next contributor**. Dependency: **LW-F001**.

- [x] Repeat build, lint, and type-check using Node ≥22.23.2 — all passed on **2026-11-06** with portable Node **22.23.4** / pnpm **10.32.1**, including the final LW-A003 shop-sign correction. All **62 tests** also passed; the full acceptance record is under LW-A003.
- [ ] Run the acceptance route on physical desktop/mobile browsers; verify touch look, sprint, jump, and interaction.
- [ ] Check the preserved gamepad mappings, low-frame-rate movement, and representative-device performance.
- [ ] Record device/browser versions, outcomes, and any concrete follow-up fixes here.

Use the LW-S004 manual route below, including earlier launch/media gates, lessons, admission and discoveries. Record physical-device audio, controls and performance for the expanded world and evacuation. Prepend the portable Node directory documented there to PATH; the workspace's default Node installation has not been upgraded.

## LW-C001 — Reusable NPC dialogue

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-F001**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Reconciled the supplied project checklist with the existing implementation and foundation evidence.
- [x] Added typed, authored dialogue nodes and choices, with stable IDs, branching, return paths, and explicit endings.
- [x] Added an engine-independent `DialogueSystem` with one active conversation, stale-choice rejection, graph validation, and cleanup.
- [x] Made the existing purple guide an interaction target using the same distance, nearest-target, and solid-sightline rules as the signal box.
- [x] Extended interaction outcomes to support a timed message or a callback; scene composition connects the guide callback to dialogue.
- [x] Added a native modal dialogue panel with speaker text, response buttons, keyboard focus, Escape/end controls, and touch layout.
- [x] Suspended movement/camera and additional interactions during dialogue, stopped horizontal momentum, and released pointer lock. Closing returns focus to the canvas; clicking the scene resumes desktop input.
- [x] Added scene-reset and application-teardown handling for active conversations.
- [x] Added seven dependency-free Node tests and the `pnpm test` command.

### Files and decisions

- State and authored content: `src/systems/DialogueSystem.ts`, `src/data/dialogues.ts`, and `src/data/foundation.ts`.
- Integration: `src/systems/InteractionSystem.ts`, `src/scenes/FoundationScene.ts`, `src/player/PlayerController.ts`, and `src/core/Game.ts`.
- Presentation: `src/ui/DialoguePanel.ts`, `src/ui/GameHud.ts`, and `src/ui/game.css`.
- Tests/tooling: `tests/dialogue.test.mjs` and the `test` script in `package.json`.
- Documentation: this checklist/task record, `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/AGENT_CONTEXT.md`, `docs/GAME_DESIGN.md`, and `src/systems/README.md`.
- The installed Engine has no authored dialogue runner. The new state model is plain TypeScript because it needs neither entities nor frame updates; the scene owns it, and the application coordinates input and UI. The shipped controller uses its public `enabled` property for modal suspension. Detailed contracts are in [ARCHITECTURE.md](ARCHITECTURE.md).

### Verification record

- `pnpm test` — **7/7 passed**: branching/return paths, exclusive opening, stale/unknown choices, endings/cancellation/reopening, missing start nodes, broken links/duplicate choice IDs, and teardown.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets` — passed for the implementation and updated documentation.
- Production foundation regression — **34/34 browser checks passed** against the new build, including movement/sprint, collision, ledge jumping, camera, signal-box interaction, reset, teardown, and emulated touch.
- Dialogue acceptance — **14/14 browser checks passed** in headless Chrome **156.0.8078.79**: nearest-target selection and E-to-talk, keyboard/mouse branches, return/end paths, Escape and explicit close, focus and pointer-lock handoff, suspended controls/repeated E, and movement resumption.
- Three reset-callback invocations during open conversations retained one scene, 19 bodies, one HUD, and one closed dialogue panel. Application teardown while dialogue was open also passed.
- Emulated touch at 390×844 verified tap-to-talk, choices, ≥44 px targets, closing, and resumed movement. The 844×390 landscape panel stayed within the viewport and scrolled. Desktop, branch, mobile, and landscape screenshots were visually inspected.
- Desktop and mobile console/network results were captured separately: **no warnings, exceptions, shader failures, missing assets, or HTTP errors**.
- `git -c core.safecrlf=false diff --check` — passed. Reviewed the changed code, documentation, and worktree diff.
- `pnpm fmt` — the remaining finding is pre-existing formatting in `pnpm-lock.yaml`. `AGENTS.md` was formatted while updating its milestone/handoff instructions.

Local browser commands (production preview on port 4178; isolated Chrome CDP on port 9223):

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-dialogue-regression'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-dialogue-verify.mjs"
```

Local evidence is under `C:\Users\HP\AppData\Local\Temp\opencode\`: `last-wave-dialogue-regression-verification.json`, `last-wave-dialogue-verification.json`, and `last-wave-dialogue-{desktop,branch,mobile,landscape}.png`. For a fresh clone, run `pnpm test` and the manual route below.

### Manual dialogue acceptance

1. Start `pnpm dev`. Walk beside the purple guide until the target label reads **Guide**, then press E.
2. Confirm the mouse is released, the conversation has focus, and movement/camera and the world-interaction prompt are suspended.
3. Use Tab/Enter or click **How do I move around?**. Read the response, go back, and choose **What should I investigate?**.
4. End via a goodbye response, **End conversation**, and Escape on separate attempts. Each new conversation begins at the greeting. Click the scene afterward and check movement/sprint/stop and the signal-box interaction.
5. Release movement keys while the conversation is open; confirm closing it does not leave movement stuck. Reset the test area and repeat.
6. On touch devices, tap to talk, choose a response, and end the conversation. Check portrait and short landscape layouts and resume left-drag movement.
7. Check the console and repeat in the production preview (`pnpm build`, then `pnpm start`).

### Remaining follow-up

- Physical devices, gamepads, other browser engines, and hardware performance remain under LW-F002.
- Guide content is a foundation tutorial. LW-C002 connects the stable dialogue/choice IDs to quest progress; the source story documents still own Episode 1 narrative.
- The local Node version remains below the declared minimum; see LW-F002. Dependency versions and the existing lockfile have not been changed.

## LW-C002 — Data-driven quest tracking

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-C001**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Added typed quest definitions and an engine-independent `QuestSystem` for ordered, one-shot objectives with inactive/active/completed progress.
- [x] Authored **Signal check**: accept the guide's request → inspect the signal box → explicitly report back.
- [x] Added validated dialogue-choice and interaction-ID notifications; scene composition routes them into the quest model.
- [x] Added guide offer, inspection reminder, report opportunity, and completed responses selected from quest progress. Movement help and conversation cancellation remain available.
- [x] Added a responsive quest tracker with title, status, current objective, progress counts, persistent completion feedback, and polite live announcements.
- [x] Ignored duplicate, early, unrelated, and post-completion events without buffering progress or publishing extra changes.
- [x] Added definition validation for empty objectives, duplicate IDs, and duplicate required events.
- [x] Reset quest progress with scene replacement and released event/UI subscribers on destruction. Destroyed models reject retained callbacks.
- [x] Added eleven quest/integration tests and one dialogue-event test; the full suite now has nineteen tests.
- [x] Completed quest acceptance and foundation/dialogue regression, reviewed screenshots, and recorded the LW-C003 handoff.

### Files and decisions

- Quest rules and authored data: `src/systems/QuestSystem.ts`, `src/data/quests.ts`.
- Event boundaries: `src/systems/DialogueSystem.ts` (`onChoice`) and `src/systems/InteractionSystem.ts` (`onInteract`). These systems publish validated IDs and do not import quest rules.
- Composition and lifetime: `src/scenes/FoundationScene.ts` owns dialogue/quest models, selects guide content, and binds events; `src/core/Game.ts` binds state to the HUD.
- Presentation/content: `src/ui/GameHud.ts`, `src/ui/game.css`, and `src/data/dialogues.ts`.
- Verification: `tests/quest.test.mjs` and `tests/dialogue.test.mjs`; existing `pnpm test` covers both without new dependencies.
- Documentation/handoff: `docs/TASKS.md`, `docs/ARCHITECTURE.md`, `docs/AGENT_CONTEXT.md`, `docs/GAME_DESIGN.md`, `README.md`, `AGENTS.md`, and `src/systems/README.md`.
- Definitions contain an ordered objective list. The first objective's event activates the quest; only the current objective can advance. The current feature needs one quest per instance and unique event requirements. [ARCHITECTURE.md](ARCHITECTURE.md) records the state/event contract and exact IDs.

### Verification record

Finalized on **2026-11-04**. The previous session completed the production browser suites below; this continuation reviewed their saved results and screenshots and reran the repository checks.

- `pnpm test` — **19/19 passed**: eight dialogue tests and eleven quest/integration tests. Coverage includes matching all event IDs, activation, ordering, duplicates, completion, reset, instance isolation, different authored data, invalid definitions, destroyed callbacks, declining/cancelling, and the authored guide/box flow.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed.
- Production foundation regression — **34/34 browser checks passed**, including movement, camera, collision, interactions, reset, teardown, and emulated touch.
- Quest acceptance — **18/18 browser checks passed** in headless Chrome **156.0.8078.79**. Verified available → accepted → inspected → explicitly reported progress, reminders, persistent completion feedback, early/duplicate actions, cancellation/declining, and range/occlusion/disabled/paused interaction gates.
- Dialogue regression — **14/14 browser checks passed**, including keyboard/mouse branching, focus and pointer-lock handoff, suspended controls, resumed movement, reset, teardown, and emulated touch.
- Quest resets after acceptance, inspection, and completion returned to 0/3. Reset during dialogue restored controls and one usable scene; retained old interaction callbacks could not affect the new quest. Application teardown released the UI/subscribers, and reload started fresh progress.
- Emulated **390×844 portrait** and **844×390 landscape** touch flows completed the quest with readable, non-overlapping HUD panels and ≥44 px dialogue controls. Available, accepted, return-objective, completed, portrait, and landscape screenshots were visually inspected.
- Desktop and mobile runs recorded **no console, shader, asset, or network errors**.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets` — passed after completing the README/architecture table formatting.
- `pnpm fmt` — the remaining finding is pre-existing formatting in `pnpm-lock.yaml`.
- `git -c core.safecrlf=false diff --check` — passed. Reviewed the implementation, new quest files/tests, and documentation diff.

Local browser commands (production preview on port 4178; isolated Chrome CDP on port 9223):

```powershell
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

In another terminal:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-quest-foundation'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-quest'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-quest-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-quest-dialogue'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-dialogue-verify.mjs"
```

Retained evidence is under `C:\Users\HP\AppData\Local\Temp\opencode\`: `last-wave-quest-foundation-verification.json`, `last-wave-quest-verification.json`, `last-wave-quest-dialogue-verification.json`, and their corresponding PNG screenshots. These are workspace-local artifacts; the manual route below is the portable acceptance procedure for a fresh clone.

### Manual quest acceptance

1. Start the game and confirm **Signal check**, **Quest available**, and **0 / 3 objectives complete**.
2. Check the signal box before accepting. The normal interaction message appears, but the quest remains 0/3.
3. Talk to the guide, choose **What should I investigate?**, then cancel or choose **Maybe later**. Progress remains 0/3.
4. Reopen the offer and choose **I will check the signal box.** Confirm active progress at 1/3 and **Check the amber signal box**. Close with **On my way.**
5. Revisit the guide before inspection. Confirm a reminder and no report choice. Move out of range and verify E cannot advance progress.
6. Inspect the signal box. Confirm 2/3 and **Return to the guide and report what you found**. Repeat the interaction and wait for its timed message to expire; progress stays 2/3.
7. Talk to the guide. Opening/cancelling alone must not finish the quest. Choose **I checked the signal box.** Confirm **Quest complete**, 3/3, acknowledgement dialogue, and persistent completion feedback.
8. Revisit both targets; completion must not restart or advance. Use **Reset test area** and confirm fresh 0/3 progress and working controls. Repeat after accepting and after inspecting.
9. Repeat using touch input in portrait and landscape. Confirm readable, non-overlapping HUD panels and resumed movement after each conversation.
10. Reload and confirm fresh progress. Check the console and repeat against `pnpm build` + `pnpm start`.

### Limitations and continuation

- This milestone initially kept progress scene-local. LW-C004 below adds manual checkpoint persistence and restoration.
- Physical devices, gamepads, Firefox/Safari, and hardware performance acceptance remain in LW-F002. Commands still use Node 22.20.0 against the declared ≥22.23.2 minimum; version alignment remains open.
- Follow-up LW-C003, inventory and clue journal in the existing test area, is complete below.

## LW-C003 — Inventory and clue journal

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-C002**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Added typed item definitions and a scene-owned, engine-independent inventory with unique IDs and copied snapshots.
- [x] Connected eligible signal-box interactions to one `signal-box-note`; acquisition works before or after quest acceptance and reporting retains the clue.
- [x] Rejected unknown/duplicate pickups without publishing changes; validated catalog IDs and isolated definitions/state from external mutation.
- [x] Added a HUD clue count and acquisition notice plus an empty/populated journal with readable titles, sources, and full note text.
- [x] Added J/HUD opening, J/Escape/button closing, native modal focus, and shared dialogue/journal control suspension with pointer-lock handoff.
- [x] Cleared inventory and journal state on reset/reload; released subscribers and rejected retained acquisition callbacks on destruction.
- [x] Added seven inventory tests and adjusted short-viewport prompt spacing to prevent a 640×360 HUD overlap while retaining ≥44 px buttons.
- [x] Verified pickup, duplicate events, journal opening/closing, reset, desktop/touch behavior, and existing gameplay; updated architecture and handoff.

### Files and decisions

- Item rules/content: `src/systems/InventorySystem.ts`, `src/data/items.ts`.
- Scene acquisition/lifetime: `src/scenes/FoundationScene.ts`; the scene routes the already-validated interaction ID to both quest progress and inventory acquisition.
- Application coordination: `src/core/Game.ts`; journal visibility is UI state, and `syncControls()` coordinates both modal surfaces.
- Presentation: `src/ui/JournalPanel.ts`, `src/ui/GameHud.ts`, `src/ui/game.css`.
- Tests: `tests/inventory.test.mjs`, using the existing dependency-free `pnpm test` command.
- Documentation: `AGENTS.md`, `README.md`, `docs/{TASKS,ARCHITECTURE,AGENT_CONTEXT,GAME_DESIGN}.md`, and `src/systems/README.md`.
- Inventory acquisition is independent of quest ordering: early inspection collects the note but still requires inspection after acceptance to advance the quest. Closing the journal preserves items; reporting does not consume them. The maintenance note is foundation tutorial content. Detailed contracts are in [ARCHITECTURE.md](ARCHITECTURE.md).

### Verification record

Completed on **2026-11-04** against the production preview at `http://127.0.0.1:4178/`, using headless Chrome **156.0.8078.79** on Windows through CDP.

- `pnpm test` — **26/26 passed**: eight dialogue, eleven quest/integration, and seven inventory tests. Inventory coverage includes unknown IDs, duplicate pickups, acquisition order, same-title/different-ID items, snapshot/catalog isolation, reset/reacquisition, catalog validation, and teardown.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed, including a fresh run after the compact-layout correction.
- Feature regressions — foundation **34/34**, quest **18/18**, and dialogue **14/14 browser checks passed**. Movement, camera, collision, interactions, quest ordering, branching dialogue, reset, teardown, and emulated touch remained usable.
- Inventory/journal acceptance — **23/23 browser checks passed** after rebuilding the compact-layout correction; **89 browser checks** passed across the four suites.
- Verified empty/populated journal state, J/HUD opening, J/Escape/Enter/button closing, native focus, pointer-lock release/resumption, stopped momentum, and suspended movement/sprint/camera/zoom/interactions. Dialogue and journal could not overlap or release each other's controls.
- Verified range, occlusion, disabled-target, pause, and suspension gates; one eligible pickup; repeated/held input; persistent clue feedback; complete authored text; acquisition before/after quest acceptance; and retention after reporting. A DOM mutation observer confirmed duplicates did not repeat the acquisition announcement.
- Three reset-callback invocations with a populated journal open retained one scene, 19 bodies, one HUD, and one journal/dialogue panel. Old interaction callbacks were released and could not acquire into the new scene; each reset allowed one fresh pickup. The open-modal reset check invokes the existing HUD callback programmatically because native modal UI makes the background inert. Normal click/tap reset was also verified.
- Reload returned fresh inventory/quest state. Direct application teardown with the populated journal open removed UI, scene state, input, and retained callbacks without errors.
- Emulated touch passed at **390×844**, **844×390**, **360×640**, **320×568**, and **640×360**. Checked ≥44 px controls, readable non-overlapping HUD panels, contained journal text, touch scrolling in short viewports, tap acquisition, and resumed/stopped movement. Desktop empty/populated journals and portrait/landscape HUD/journal screenshots were visually inspected.
- Desktop and mobile inventory runs independently recorded **no console, shader, asset, or network warnings/errors**. The regression suites also passed their browser-error checks.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets` — passed.
- `pnpm fmt` — the remaining finding is pre-existing formatting in `pnpm-lock.yaml`.
- `git -c core.safecrlf=false diff --check` — passed. Reviewed the implementation, new item/model/panel/tests, and documentation diff.

Local commands (production preview on port 4178; isolated Chrome CDP on port 9223). Run browser scripts sequentially because they share a page:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-inventory-foundation'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-inventory-quest'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-quest-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-inventory-dialogue'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-dialogue-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-inventory'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-inventory-verify.mjs"
```

Workspace-local evidence is under `C:\Users\HP\AppData\Local\Temp\opencode\`: `last-wave-inventory-verification.json`, `last-wave-inventory-{foundation,quest,dialogue}-verification.json`, and the screenshots listed in each report. The helper and scripts are local artifacts; use the manual route below on a fresh clone.

### Manual inventory/journal acceptance

1. Start `pnpm dev`. Open **Clue journal** or press J; confirm **0 clues collected** and the empty-state hint.
2. Close using J, Escape, and **Close journal** on separate attempts. Confirm canvas focus returns and clicking the scene resumes movement/camera input.
3. Approach the amber signal box and press E or tap the interaction button. Confirm **Clue collected: Signal box note** and **Clue journal (1)**.
4. Open the journal and read the title, **Found at: Amber signal box**, and complete maintenance note. Reopen it and confirm the same single entry.
5. Repeat the box interaction and hold E. The clue count remains one; the timed interaction message can expire while the collected clue remains available.
6. Collect before accepting the guide's quest, then accept. Quest progress starts at 1/3; inspect again to reach 2/3 and report to reach 3/3. The journal retains one clue throughout.
7. Open the journal while moving and release movement keys. Confirm movement/camera/world actions are suspended and resume cleanly after closing. While talking to the guide, J must not open a second modal.
8. Close the journal and use **Reset test area**. Confirm zero clues and a fresh quest, then reacquire the note once. Reload and confirm fresh state again.
9. Repeat with touch in portrait and short landscape layouts. Check readable text, scrolling when needed, ≥44 px controls, and no HUD/prompt overlap.
10. Check the console and repeat against `pnpm build` + `pnpm start`.

### Limitations and continuation

- This milestone initially kept inventory and quest progress scene-local. LW-C004 below adds manual checkpoint persistence and restoration.
- Physical devices, gamepads, Firefox/Safari, and hardware performance remain under LW-F002. Touch acceptance used browser emulation.
- Commands used Node **22.20.0** and pnpm **10.32.1**; the declared Node **≥22.23.2** requirement still needs alignment under LW-F002.
- Follow-up **LW-C004 — scene transition and save system** is complete below, using the existing foundation test area.

## LW-C004 — Scene transition and save system

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-C003**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Defined a version-1 checkpoint with timestamp, scene identity, player position, completed objective IDs, and acquired clue IDs.
- [x] Added validation/copying for envelopes, ordered quest prefixes, catalog IDs, cross-model consistency, and safe positions against authored foundation solids.
- [x] Added atomic model restoration boundaries, copied persistence snapshots, definition isolation, and rejection of invalid or destroyed restores.
- [x] Added one manual localStorage slot with fresh reads, explicit overwrite/delete, and missing/invalid/incompatible/unavailable outcomes. Failed validation and storage operations preserve existing data.
- [x] Changed `SceneManager` to stage disabled scene roots, commit successful construction, roll back failures, reject nested transitions, and clean up on destruction.
- [x] Connected saved position/model restoration through the foundation builder, with a resting body and a default camera aimed at the restored player.
- [x] Added P/HUD checkpoint controls with save/load/delete feedback, native focus, shared modal/input suspension, pointer-lock handoff, and scrollable touch layouts.
- [x] Verified reset/reload checkpoint retention, restored dialogue/quest/journal behavior, stale callbacks, partial-construction failure/retry, and application teardown.
- [x] Corrected a 320×568 HUD/prompt overlap introduced by the save control; compact portrait/landscape layouts retain ≥44 px buttons.
- [x] Completed existing gameplay regressions and the architecture, controls, and contributor handoff; checked off the final core-system milestone.

### Files and decisions

- Checkpoint contract and storage: `src/scenes/FoundationState.ts`, `src/systems/SaveSystem.ts`.
- Model snapshots/restoration: `src/systems/QuestSystem.ts`, `src/systems/InventorySystem.ts`.
- Scene transition and composition: `src/core/SceneManager.ts`, `src/core/Game.ts`, `src/scenes/FoundationScene.ts`.
- Shared geometry and initial camera: `src/data/foundation.ts`, `src/player/CharacterModel.ts`, `src/player/CameraController.ts`.
- Presentation: `src/ui/CheckpointPanel.ts`, `src/ui/GameHud.ts`, `src/ui/game.css`.
- Tests: `tests/save.test.mjs`, `tests/scene-manager.test.mjs`, and restoration cases in `tests/{quest,inventory}.test.mjs`. Added no dependencies.
- Documentation: `README.md`, `AGENTS.md`, `docs/{TASKS,ARCHITECTURE,AGENT_CONTEXT,GAME_DESIGN}.md`, and `src/systems/README.md`.
- Policy: **Save checkpoint** replaces `last-wave.checkpoint` for the current browser/site origin. **Reset test area** and page reload start fresh gameplay while retaining the checkpoint; **Load checkpoint** explicitly restores it. **Delete checkpoint** preserves current playable progress. Loads rebuild the existing foundation area through the same lifecycle as startup/reset. The detailed envelope and validation rules are in [ARCHITECTURE.md](ARCHITECTURE.md).

### Verification record

Verification on **2026-11-04**, against production preview `http://127.0.0.1:4178/`, using headless Chrome **156.0.8078.79** on Windows through CDP.

- `pnpm test` — **50/50 passed**: eight dialogue, fourteen quest/integration, nine inventory, twelve save/validation/storage, and seven scene-lifecycle tests. New cases cover every reachable quest/clue combination, full validation, safe/unsafe positions including rotated boxes, copied snapshots, atomic restoration, storage failures, overwrite/delete, stale reads, disabled staging, rollback, nested transitions, and destruction.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed after the compact-layout correction and test lint fix.
- Save/load acceptance — **36/36 browser checks passed**. Verified fresh, early-clue, accepted, inspected, and completed saves; restored objective/dialogue choices; full journal text; repeated checkpoint rollback; elevated obstacle-top restoration; and correctly aimed cameras with stopped bodies.
- Keyboard/mouse acceptance covered P/HUD opening, P/Escape/Enter/button closing, ignored repeat/modified shortcuts, native focus, pointer-lock release/resumption, stopped momentum, suspended movement/sprint/orbit/zoom/interactions, and exclusive dialogue/journal/checkpoint state.
- Invalid/stale reads covered malformed JSON, unknown version/scene/objective, duplicate/missing-required clues, out-of-bounds positions, solid penetration, and checkpoint deletion after menu opening. The scene and stored data were preserved on rejection. Reload with malformed storage started normally.
- Injected quota, removeItem, and localStorage-access failures produced usable feedback. Blocked storage at startup still allowed play; later unblocked access recovered the original save.
- Injected a scene-builder exception after creating the candidate player rigid body. The partial hierarchy was destroyed, current scene and checkpoint survived, and body/render/collision stores remained **19/45/34**. Retrying loaded successfully. One expected, caught error log records this deliberate fault; normal desktop/mobile runs had no unexpected console, shader, asset, or network errors.
- Three repeated loads and three reset-callback invocations with the checkpoint menu open retained one scene, 19 bodies, one HUD, and one of each modal panel. Retained old interaction callbacks were released and could not change restored state. Direct app destruction while the save menu was open removed UI/input/scene state and preserved storage.
- Emulated touch passed full save/reset/load/report flow, suspended/resumed movement and look, ≥44 px controls, contained text, and short-viewport scrolling at **390×844**, **844×390**, **360×640**, **320×568**, and **640×360**. Desktop restored/error states, mobile restoration, and compact HUD/menu screenshots were visually reviewed.
- Supplemental **640×360 desktop** acceptance with touch emulation disabled passed: HUD, quest, interaction prompt, and feedback remained inside the viewport without overlap; the checkpoint menu fit the viewport with scrolling and four 44 px-high buttons. No browser errors were recorded, and both HUD/menu screenshots were visually reviewed.
- Existing gameplay regressions — foundation **34/34**, quest **18/18**, dialogue **14/14**, and inventory/journal **23/23 browser checks passed** against the final build. All five suites passed **125/125 checks**, covering movement/camera/collision, dialogue, quest order, clue acquisition, reset, teardown, input, touch, and scene save/load.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets` and `git -c core.safecrlf=false diff --check` — passed. Reviewed the runtime, test, and documentation diff and all new files.
- `pnpm fmt` — reports only the pre-existing `pnpm-lock.yaml` formatting finding.

Local browser commands (preview on port 4178; isolated Chrome CDP on port 9223). Run sequentially because the scripts share a page:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-save'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-save-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-save-foundation'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-save-quest'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-quest-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-save-dialogue'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-dialogue-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-save-inventory'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-inventory-verify.mjs"
```

Workspace-local evidence is under `C:\Users\HP\AppData\Local\Temp\opencode\`: `last-wave-save-verification.json`, the `last-wave-save-{foundation,quest,dialogue,inventory}-verification.json` reports, `last-wave-save-compact-desktop-verification.json`, and the screenshots listed in each report. The CDP helper/scripts are local artifacts; use `pnpm test` and the manual route below on a fresh clone.

### Manual checkpoint acceptance

1. Start the game. Press **P** or click/tap **Save / load**. Confirm the local-checkpoint policy, missing-state feedback if the slot is empty, focused controls, and suspended gameplay. Close with P, Escape, and **Close** on separate attempts.
2. Move to a clear spot and save. Confirm **Checkpoint saved**, the timestamp, objective count, and clue count. Close and confirm clicking the scene resumes desktop movement/camera controls.
3. Collect the signal-box note before accepting the quest, save, reset, and load. Confirm the saved position, 0/3 quest progress, and one readable journal entry. Repeat after accepting, after inspecting, and after completing the report.
4. Advance beyond a checkpoint and load it again. Confirm the exact earlier objective and matching guide choices. Complete the next objective once; repeated pickups/reporting must not duplicate state.
5. Save while standing on a block or stump. Reset and load; confirm the player remains grounded on its top and movement/camera input resumes normally after closing the menu.
6. Reload the page. Confirm fresh gameplay and an available saved checkpoint; explicitly load it. Delete the checkpoint and confirm current gameplay remains intact. Save again.
7. In browser storage tools, replace this game's `last-wave.checkpoint` value with malformed JSON or change its `version` to 99. Open the menu and confirm invalid/incompatible feedback. Restore the original value or explicitly save a replacement. Change the slot while the menu is open and verify Load reads the current value.
8. Restrict site storage if your browser supports it. Confirm playable startup and save/load failure feedback rather than a crash; restore the permission and retry.
9. Repeat save/reset/load with touch in portrait and short landscape. Check readable HUD/prompt separation, scrolling when needed, ≥44 px buttons, closed-dialogue/journal handoff, and resumed movement.
10. Repeat against `pnpm build` + `pnpm start` and check the console for unexpected errors.

### Limitations and continuation

- Transitions currently exercise the existing foundation area through fresh and restored construction. The scene builder is synchronous; asynchronous asset/scene-loading behavior needs its own contract when introduced. LW-S001 below adds version-1 checkpoint migration.
- Saves use one browser/site-origin slot. Backend/account persistence belongs to the later NestJS/PostgreSQL roadmap.
- Physical devices, gamepads, Firefox/Safari, and hardware performance remain under LW-F002. Touch checks used browser emulation.
- Commands used Node **22.20.0** and pnpm **10.32.1**; verification on the declared Node **≥22.23.2** version remains in LW-F002. The existing lockfile formatting finding is tracked separately.
- Continuation: **LW-S001** below adds the Episode 1 opening prototype. **LW-F002 hardware acceptance** remains open, including the checkpoint route and Node version alignment.

## LW-S001 — Episode 1 opening story prototype

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-C004**. Status: **Complete; automated browser acceptance passed**.

### Source and scope

- Read both original DOCX documents in full: the design bible (v1.0, 2026-11-02) and Episode 1 story/level design (same version/date).
- Implemented the §1A/M1 opening **story flow inside the existing foundation area**, consistent with the current scene boundary. This is a playable prototype, not completion of the full coffee-shop scene.
- Preserved the authored bulletin and four friend lines. The player is Friend A (**You**); the fictional NPC is Friend B (**Friend**). Optional attendant, reminder, bag description, and prototype-handoff copy are draft implementation text.

### Completed implementation

- [x] Added **Play story / Replay intro**, a reader-paced sequence, per-beat speakers, Continue, Skip/Escape, stale-input protection, and a reduced-motion camera option initialized from OS preference.
- [x] Added lazy, procedural story stations: a table with two drinks and bag/phone, a readable TV screen, an attendant/counter, a fictional friend, and a turquoise BEACH handoff marker.
- [x] Reused proximity/line-of-sight interactions and branching dialogue for optional TV and attendant conversations. Collected belongings become unavailable to interaction while the table stays solid.
- [x] Authored opening → belongings → follow-friend objectives. Skipping only completes the opening beat; leaving early prompts a reminder; replay does not advance or reset later objectives.
- [x] Added a protected quest-item category and readable bag entry, distinct from clue counts. Pickup starts the friend's simple, pausable authored route.
- [x] Coordinated four exclusive modals, player/actor suspension, pointer lock, focus, active camera, reset, and app teardown.
- [x] Extended manual checkpoints to version 2 with independent opening progress, bag/prerequisite consistency, and position checks against active story solids. Version-1 saves migrate in memory without being rewritten by a read.
- [x] Added rollback for partial story-prop construction and scene-owned material/texture/callback cleanup.
- [x] Added seven cutscene/authored-story tests and four save/migration tests. Updated narrative continuity, architecture, controls, and contributor handoff.
- [x] Corrected compact-portrait confirmation-message padding after checkpoint regression exposed a 9 px overlap at 320×568.
- [x] Passed final story, checkpoint, and foundation browser suites after the spacing correction; reviewed screenshots and finalized acceptance evidence.

### Files and decisions

- Authored story and layout: `src/episodes/episode-01/{opening,openingLayout}.ts`.
- Foundation-owned composition and actor route: `src/episodes/episode-01/{OpeningPrototype,OpeningActors}.ts`, `src/scenes/FoundationScene.ts`.
- Shared rendering helpers: `src/scenes/{primitives,createTextSign}.ts`; default framing: `src/player/CameraController.ts`.
- Sequence and model contracts: `src/systems/{CutsceneSystem,QuestSystem,InventorySystem,InteractionSystem,SaveSystem}.ts`, `src/scenes/FoundationState.ts`.
- App/UI: `src/core/Game.ts`, `src/ui/{CutscenePanel,GameHud,JournalPanel,CheckpointPanel}.ts`, `src/ui/game.css`.
- Tests: `tests/cutscene.test.mjs`, `tests/save.test.mjs`.
- No dependencies or imported third-party assets were added. The installed Engine scripts contain no authored narrative runner or NPC waypoint routine. The sequence is plain TypeScript; the small per-frame actor routine is an Engine Script. Canvas-texture materials follow the version-matched official video-texture recipe.

### Verification record

- `pnpm test` — **61/61 passed**: seven cutscene/opening, eight dialogue, fourteen quest, nine inventory, sixteen save/validation/storage/migration, and seven scene-lifecycle tests.
- `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed after the compact-portrait spacing correction. Earlier import-order findings were corrected.
- Final production browser suites on **2026-11-04** — **94/94 checks passed**: story **24/24**, checkpoint **36/36**, and foundation **34/34**, all against the rebuilt spacing correction at `http://127.0.0.1:4178/`.
- Production story acceptance — **24/24 browser checks passed** in headless Chrome **156.0.8078.80** on Windows. Verified all five source lines, manual pacing, Continue/Skip/Escape/replay, OS reduced-motion preference, modal focus and exclusive input/camera handoff, optional conversations, ordered objectives, unique bag pickup, friend movement/pause, and completion.
- Story persistence checks passed for save/reset/load, completed-save reload, version-1 migration without storage rewriting, invalid prerequisites, retired callbacks, partial-stage rollback/retry, reset during playback, and application teardown. Foundation-only state has 19 bodies / 2 targets; the built opening has 22 bodies / 7 targets.
- Story touch checks passed at **390×844**, **844×390**, **360×640**, **320×568**, and **640×360**, including contained captions/journal, ≥44 px controls, pickup, save/load, and completion. Broadcast, friend exchange, TV transcript, bag journal, completion, and all five HUD/caption screenshot pairs were visually reviewed. Normal story runs recorded no unexpected console, shader, asset, or network errors.
- Checkpoint regression — **36/36 browser checks passed** with version-2 saves. Covered fresh/early-clue/accepted/inspected/completed restoration, modal input/focus, invalid and stale reads, storage failures, scene-construction rollback/retry, reset, teardown, and all five touch viewports. The corrected **320×568** layout has a **7 px gap** between prompt and confirmation. Normal runs recorded no unexpected errors; deliberate scene-construction fault injection produced one expected, caught error log.
- Foundation regression — **34/34 browser checks passed**, including movement/sprint/stop, ledge jumping, all collision cases, camera, interactions, reset, teardown, and touch. Walking measured **4.98 m/s**, sprint **7.64 m/s**, and **5.04 m/s** after releasing Shift.
- The first foundation attempt used forced SwiftShader at roughly 4 FPS (frame deltas clamped to 0.1 s), yielding 2.75 m/s and failing the existing speed assertion. Repeating with Chrome's normal Intel UHD 620 / D3D11 renderer passed all 34 checks. Low-frame-rate movement remains part of LW-F002 hardware acceptance.
- Initial visual review found the bag waypoint obstructing the TV shot; the shot was reframed and the waypoint hidden during playback. The story runner now waits for actual NPC arrival. Checkpoint regression subsequently found a 9 px prompt/message overlap at 320×568; compact message padding was reduced before rebuilding.
- Final broadcast, friend exchange, completion, compact story, restored-checkpoint, and corrected compact-layout screenshots were visually reviewed after the rebuild.
- `pnpm fmt` — reports only the pre-existing `pnpm-lock.yaml` formatting finding after README/architecture table alignment.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets` and `git -c core.safecrlf=false diff --check` — passed. Reviewed the tracked runtime changes, new source/tests, and final documentation diff. Changes remain uncommitted.

Local production preview:

```powershell
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

Browser commands (isolated Chrome CDP on port 9223). Run sequentially because the scripts share a page:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-story-final'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-story-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-story-save-final'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-story-save-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-story-foundation-final'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
```

The checkpoint regression script is a copy of the LW-C004 runner, updated to expect saved version **2** and to use **99** as the unsupported-version fixture. Final reports are `last-wave-story-final-verification.json`, `last-wave-story-save-final-verification.json`, and `last-wave-story-foundation-final-verification.json`, with their listed PNG screenshots under `C:\Users\HP\AppData\Local\Temp\opencode\`. These scripts/evidence are local artifacts; use `pnpm test` and the manual routes on a fresh clone.

### Manual story acceptance

1. Run `pnpm dev` and choose **Play story**. Read the broadcast and all four friend lines with Continue. Check speaker changes, readable captions, and paused movement/camera/world actions.
2. Replay and use **Skip opening** and Escape. Toggle **Keep gameplay camera**. Confirm control/focus handoff and that holding Enter does not fast-forward.
3. Approach the BEACH marker before collecting belongings. Interact; the reminder must leave the quest at 1/3.
4. Inspect the TV transcript and talk to the attendant, including the news branch. These conversations must not change progress or require a purchase.
5. Move beside the amber-marked table and interact. Confirm one **Bag & phone**, 2/3 objectives, a hidden bag/waypoint, and the friend walking toward the marker.
6. Press J. Read the protected story item, check the separate clue count, and close. Actor/player controls resume. Replay the opening and verify progress and inventory are retained.
7. Save with P, reset, and explicitly load. Check the bag remains collected and the friend waits at the exit. Interact with the marker to reach 3/3 and read the prototype handoff.
8. Save completion, reload, and load again. Check source text, collected items, and progress. Try a legacy version-1 checkpoint; use version **99** to test the unsupported-version message in the current build.
9. Repeat on touch in portrait and landscape. Check readable non-overlapping HUD/prompt, ≥44 px controls, scrollable captions/journal, movement, pickup, and save/load.
10. Check the console and repeat against `pnpm build` + `pnpm start`.

### Limitations and next action

- The prototype ends at a handoff marker within the foundation scene. The full café room, seated/standing character staging, patrons/fan, voiced/video broadcast, and actual beach transition/checkpoint remain for the dedicated scene milestone. The café roadmap checkbox remains open.
- Only the story's opening is playable. Beach/evacuation, hospital, city quests, finale, and real-player pairing remain later milestones; the original story/bible own their continuity.
- Story saves are manual, local, and site-origin scoped. The friend restores at the route destination after pickup; transient cinematic/animation time is not saved.
- Physical devices, gamepads, Firefox/Safari, and target-hardware performance remain in **LW-F002**. Verification uses Node **22.20.0**, below the declared **≥22.23.2** minimum; alignment remains open.
- Next concrete action: complete **LW-F002** with the new opening/checkpoint route and declared Node version, then scope the dedicated café scene and beach-arrival transition as **LW-S002**.

## LW-A001 — Visual asset sourcing and import guidance

Owner: **Lead game engineering**. Dependency: **LW-S001**. Status: **Guidance complete; first import delivered in LW-A002**.

- Inspected the current character/station builders, minimal AppBase bootstrap, physics-only asset loader, and empty runtime-asset categories to explain the visible blockout.
- Added asset sources, format guidance, a café/character starting set, and the repository-specific import workflow to `public/assets/README.md`; updated the contributor handoff.
- Checked official KayKit, Kenney, Quaternius, and Poly Haven provider pages and the Fab marketplace on **2026-11-04**. These are candidates; downloaded geometry, rigs, materials, and runtime performance have not been evaluated.
- Verification: `pnpm exec prettier --check public/assets/README.md docs/TASKS.md docs/AGENT_CONTEXT.md` and `git -c core.safecrlf=false diff --check` — passed. This task changes documentation only; LW-S001 records the latest runtime acceptance.
- Next action: choose café/character visual references and a free/paid asset budget, then select one environment kit and one rigged character/animation set for import evaluation. Art preparation can proceed alongside LW-F002; dedicated café implementation remains scoped under LW-S002.

## LW-A002 — Imported Tideline café dressing

Owner: **Lead game engineering**. Priority: **P1**. Dependency: **LW-S001 and the supplied `items/` assets**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Organized all **30 supplied files**, preserving original bytes and recording original filenames, destinations, sizes, sources, and SHA-256 hashes in `asset-library/catalog.json`.
- [x] Selected ten static, self-contained GLBs totaling **383,300 bytes** for `public/assets/props/cafe/`. Archived twenty reserve/source files by category in `asset-library/`, including the original fan FBX and byte-identical duplicate table.
- [x] Inspected decoded vertex bounds and authored transforms; recorded uniform scale, pivot compensation, grounding, and facing once per model. Shared-container instances retain imported hierarchies and unscaled physical roots.
- [x] Dressed the opening as **Tideline**: dining table/chairs and drinks, stocked trestle backbar, coffee machine, fridge, vending machine, pendant/desk lights, tile floor, teal paneling, timber/brass trim, and brand/menu signs. Added three warm unshadowed lights.
- [x] Integrated the furniture with the existing bag/phone, TV, attendant, friend, and exit interactions. Shared the seven story solids with checkpoint validation, reframed the two opening shots, and routed the friend clear of the furniture.
- [x] Registered container/texture handlers and preloaded the selected set once before scene creation. Resets/loads reuse registry resources; stage destruction releases instances and procedural textures. Reset waits for the initial scene while assets load.
- [x] Checked the ten runtime source licenses: dining set and vending machine are **CC BY 3.0**; the other eight are **CC0**. Shipped `public/assets/credits.html` and linked **3D art credits** from the checkpoint menu.

### Files and decisions

- Asset selection/calibration: `src/data/cafeModels.ts`, `public/assets/props/cafe/`, `asset-library/{README.md,catalog.json}` and its categorized source directories.
- Loading and instance ownership: `src/core/{AssetManager,Game}.ts`, `src/scenes/{FoundationScene,createModelInstance,primitives}.ts`.
- Visual/story composition: `src/episodes/episode-01/{CafeDressing,cafeLayout,OpeningPrototype,openingLayout}.ts`.
- Credits/presentation: `public/assets/{README.md,credits.html}`, `src/ui/{CheckpointPanel.ts,game.css}`.
- Handoff: `README.md`, `AGENTS.md`, `docs/{TASKS,ARCHITECTURE,AGENT_CONTEXT}.md`, and the episode README. Added no dependencies or future scenes.
- Imported meshes/materials belong to the app registry; scene roots own instances. Visual calibration, furniture collision data, and story rules remain independently owned. Older story checkpoints inside newly furnished footprints are rejected without rewriting storage; foundation-only saves retain their existing position rules.

### Verification record

Completed on **2026-11-05**, using the production preview at `http://127.0.0.1:4178/` and headless Chrome **156.0.8078.80** on Windows through CDP.

- `pnpm test` — **61/61 passed**, including the existing save tests that iterate all seven story solids. `pnpm build`, `pnpm lint`, and `pnpm typecheck` — passed, with fresh runs after the final preload/reset guard.
- Browser acceptance — **104/104 checks passed**: furnished story **24/24**, checkpoint **36/36**, foundation **34/34**, asset lifecycle **8/8**, and delayed startup **2/2**. The first four suites ran after the final furniture/route corrections; the final reset-during-preload guard received targeted delayed-loading, reset, and story-start acceptance.
- Story acceptance covered reader-paced source dialogue, camera/reduced-motion handoff, optional conversations, actual keyboard/touch movement into the solid table, unique bag pickup, friend departure, completion, replay, checkpoint restoration, legacy migration, rollback, and teardown. All five emulated touch viewports passed: **390×844**, **844×390**, **360×640**, **320×568**, and **640×360**.
- Three reset/rebuild/load cycles retained the same **10 container resources / 73 registry assets**, one scene root, and five UI surfaces. Body/render/collision stores returned to **19/45/34** with **9 textures** after reset, and **26/107/41** with **17 textures** when furnished. With HTTP caching disabled, only the ten startup GLB requests occurred; scene operations made no additional model requests. All rigid-body roots retained unit scale.
- Application destruction unloaded the shared containers and released the scene, asset registry, graphics device, keyboard, UI, and devtools registration. Blocking the coffee-machine download produced retry feedback and the same clean disposal; unblocking and reloading restored play. Its caught startup error and blocked requests are expected fault-injection evidence. Normal runs recorded **no unexpected console, shader, asset, or network errors**.
- Holding one model download left startup at nine loaded containers, zero scene roots/bodies, and no open modal. Reset, story, journal, and checkpoint actions left that state intact. Releasing the download enabled the 19-body foundation, normal reset, and 26-body story.
- Unsafe story saves inside the back wall, backbar, fridge, vending machine, and expanded seating footprint were rejected without changing the current scene or stored bytes. A foundation-only save at the appliance footprint loaded normally.
- Initial visual measurement found sinking drinks and floating tabletop props. Final sampled contacts have **<0.04 mm** absolute surface deviation, with both glasses exactly on the table; furniture is grounded at the **0.014 m** tile finish. Screenshots of the two camera shots, overview, counter/backbar/appliances, pickup/completion, compact captions, checkpoint menu, and startup failure were visually inspected.
- The first movement regression found that the wider dining collider caused the nearby friend to win target selection over the bag. Adjusted the friend's starting point and exit route; keyboard/touch pickup passed afterward, and per-frame rendered bounds confirmed the departure clears all café furniture.
- One inspected 1280×800 café view reported **195 draw calls**, **17 textures**, and approximately **60 FPS / 16.7 ms**. This is a local observation; target-device performance remains under LW-F002.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets asset-library` and `git -c core.safecrlf=false diff --check` — passed. Reviewed the task's source, new files, catalog, credits, and documentation diff. Changes remain uncommitted alongside the pre-existing gameplay/story work.
- `pnpm fmt` — reports only the pre-existing `pnpm-lock.yaml` formatting finding. Commands used Node **22.20.0** / pnpm **10.32.1**; pnpm reports the existing Node **≥22.23.2** version mismatch.

Local commands, with the production preview on port 4178 and isolated Chrome CDP on port 9223. Run browser scripts sequentially:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cafe-preview.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cafe-regression.mjs"
$env:VERIFY_PREFIX = 'last-wave-cafe-save'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-story-save-verify.mjs"
$env:VERIFY_PREFIX = 'last-wave-cafe-foundation'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cafe-assets-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cafe-loading-verify.mjs"
```

The café story wrapper updates only the prior story runner's furnished body count and friend destination expectations. Reports are `last-wave-cafe-{story,save,foundation,assets,loading}-verification.json`, placement data is `last-wave-cafe-measurements.json`, and screenshots use the corresponding `last-wave-cafe-*` prefixes under `C:\Users\HP\AppData\Local\Temp\opencode\`. These are workspace-local artifacts. For a fresh clone, run repository checks and the manual route below.

### Manual review and next action

1. Run `pnpm dev`, wait for startup, and choose **Play story**. Inspect the TV shot, friend exchange, seating, coffee counter, stocked backbar, appliances, and lighting. Check **Keep gameplay camera** as well.
2. Walk toward the marked table, collect the bag/phone, inspect optional conversations, and follow the friend to the BEACH marker. Repeat with touch.
3. Save, reset, and explicitly load several times. Confirm the furnished stage and progress return without duplicate props. Open **Save / load → 3D art credits**.
4. In browser network tools, delay or block one café GLB and reload. Startup actions should remain inert during loading; a failed load should show retry feedback. Unblock and reload to recover.
5. Next concrete action: complete **LW-F002 hardware acceptance and Node alignment** with the furnished opening and retained-checkpoint route. Physical mobile devices, gamepads, Firefox/Safari, and representative performance budgets remain unverified.
6. Next art action: evaluate a licensed rigged character and compatible movement clips, then identify/export the fan source to GLB. Characters, bag/phone, TV, and counter still use procedural geometry. The dedicated café scene and actual beach transition remain scoped under **LW-S002**.

## LW-A003 — Cinematic Tideline café and animated cast

Owner: **Lead game engineering**. Priority: **P1**. Dependencies: **LW-S001 / LW-A002**. Status: **Complete; automated browser and visual acceptance passed**.

### Completed implementation

- [x] Prepared **28 CC0 prop GLBs** and **nine rigged character variants**, with textured civilian clothing/appearance, a suited commuter, and ten compatible animation clips each. Preserved all 30 supplied originals and recorded archive/output hashes, calibration, credits, and preparation commands.
- [x] Rebuilt Tideline with furnished tables, seated patrons, counter service, illustrated windows/walls, signage, warm local lights, imported bag/TV, and an eager seated launch preview. Gameplay, camera and ledge-controller foundations remain integrated.
- [x] Added a separately animated, centered ceiling fan above **each of four tables**, sharing one calibrated asset and rotating at **540°/second**. Measured ceiling contact and swept-blade clearance against furniture, walls, beams and pendant lights.
- [x] Added animated seated listening/talking, a continuous friend stand-up and departure before pickup, imported player locomotion, reader-paced speaker bubbles, moving TV/speaker cameras, and a steady-camera option initialized from reduced-motion preference.
- [x] Replaced the Navy TV presentation with **Elizabeth Lee / Voice of America**, _The Inside Story — Confronting the Climate Crisis_, Episode 89. The **15.4-second** excerpt uses programme **00:55.25–01:10.65**, original voice, poster, and six synchronized captions. Runtime video/poster/VTT total **752,599 bytes**. Retired Navy source/specification remain archived.
- [x] Added original café music, bulletin ducking, muted ambient TV looping, user-gesture playback, readable fallback transcript, retry, stalled-playback recovery, visibility/time-scale pause, and stale-event/teardown guards.
- [x] Replaced the enclosure with **200×180 m** open ground, **15 neighboring buildings**, shops/houses, sidewalks, crosswalk, side street, palms/planters, lamps, and beach-direction signage.
- [x] Added **eight walking pedestrians**, including **two suited commuters**, **three carried sun umbrellas**, **two briefcases**, **four moving cars**, and **two animated seated drivers**. Corrected wheel axes/hubs/spokes, cabin and seat geometry, steering/dashboard placement, character grounding, head clearance, and ambient lighting.
- [x] Added kinematic actor collision, pedestrian yielding, traffic queuing, occupied-destination wrap prevention, long-frame movement limits, modal pause/resume, and restored-player spawn clearance.
- [x] Enabled native static/dynamic batching with scene-owned groups. Transparent windows and non-uniform cones retain their normal render path for sorting and shading.
- [x] Added the pumpkin/bat/web wordmark, pumpkin favicon, and black branded startup screen with reduced-motion loading indicator.
- [x] Updated static checkpoint validation for the enlarged ground, buildings, planters, and furnished café. Existing v1/v2 migration, both quests, unique inventory, reset/load rollback, and application cleanup remain supported.

### Files and decisions

- Composition/behavior: `src/episodes/episode-01/{CafeDressing,CafeArtwork,CafeSurroundings,StreetLife,OpeningPrototype,OpeningActors,OpeningCamera,OpeningMedia,CafeTelevision}.ts`, `cafeLayout.ts`, `openingLayout.ts`, `opening.ts`, and the media JSON files.
- Integration: `src/core/{Game,AssetManager,SceneManager}.ts`, `src/scenes/`, `src/player/`, shared definitions in `src/data/`, and the existing quest/inventory/interaction systems.
- Presentation: `src/ui/`, `index.html`, `public/assets/{last-wave-logo,pumpkin-icon}.svg`.
- Asset pipeline: `scripts/`, `asset-library/`, prepared runtime GLBs/media, runtime inventory and credits. No new runtime dependency was added.
- Imported registry resources are app-owned; instances, procedural resources, media, and batch groups are scene-owned. All 37 stored model inspections match the independently audited fields, including `commuterSuit`.
- At LW-A003 acceptance, the opening quest finished at the doorway and street population was ambient. LW-S002 below adds the requested instructional, pedestrian-direction and admission progression; populated beach and disaster remain in LW-S003–LW-S004.

### Verification record

Completed on **2026-11-06**. Environment: Windows, portable **Node 22.23.4**, pnpm **10.32.1**, PlayCanvas **2.23.3**, production preview **`http://127.0.0.1:4178/`**, headless Chrome **156.0.8078.80** through CDP **9223**. Browser runners share a page and run sequentially.

- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — **passed**; `pnpm test` — **62/62 passed**. All four checks were repeated after the final shop-sign correction.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets asset-library scripts` — **passed**. `pnpm fmt` reports only the pre-existing **`pnpm-lock.yaml`** formatting finding.
- `git -c core.safecrlf=false diff --check` — **passed**. Reviewed the tracked diff and new source, scripts, tests, documentation, calibration/provenance records, and runtime asset inventory. Changes remain uncommitted alongside the earlier core/story work.
- Cinematic gameplay: **22/22 passed** — seated/locomotion joint motion, stand-up/departure, optional dialogue, real movement/collision pickup, doorway completion, replay, checkpoints, v1 migration, unsafe-position rejection, construction rollback, reuse and teardown.
- Reporter/media: **15/15 passed** — real gesture and decoded frames, original voiced video, captions/mute, camera motion, natural one-shot completion, reader-paced replies, replay, blocked/missing/stalled media, retry, visibility/time-scale pause and cleanup.
- Touch/responsive: **26/26 passed** — **390×844, 844×390, 360×640, 320×568, 640×360**, plus compact desktop. Covered caption fallback/retry, contained ≥44 px controls, speaker framing, reduced motion, bag pickup, scrollable journal/checkpoint, reset/load, real drag movement/look and doorway completion.
- Supplemental startup/tutorial: **8/8 passed** — held/blocked/released character loading, inert startup actions, partial-app disposal, reload recovery, credits, independent early clue collection, tutorial HUD switching, report prerequisite, and both completed quests/items after reload.
- Four-fan acceptance: **8/8 passed** — four distinct centered instances, 540°/second motion, ceiling/swept-blade clearance, zero-time/modal pause, cinematic animation, resource-stable reset, and two room/four individual table captures. The eight suites above/below total **105/105 passing browser checks**, with no unexpected console, network, asset or shader issues; injected failures were explicitly classified.
- Street behavior: **16/16 passed** — actor counts and animation, hand-locked props, pause/time scale, all wheel axes/contacts, yielding, traffic queue/wrap clearance, long frames, real physical car collision, following colliders, restored-player clearance, and three resource-stable scene replacements.
- Skinned-pose/contact audit: **4/4 passed**, with **24 samples** spanning complete walking/seated cycles. Animated sole support gaps: **0.47–18.01 mm**; umbrella head clearance: **13.56–14.45 cm**; driver seat gaps: **2.15–2.34 mm**, head clearance: **2.14–5.09 cm**; all cabin/backrest/sole bounds clear. All 16 tyre support gaps are **3.12–5.33 mm** above the rendered road.
- Batching capture/measurement after the sign correction: **6/6 passed**, all six refreshed image pairs visually reviewed with no visible regression. Unbatched → batched draws: **1252→602, 1618→857, 943→476, 828→464, 1198→770, 983→490** (36–52% reduction), in `avenue-east`, `avenue-west`, `moving-car`, `umbrella`, `car-mid-roll`, `umbrella-mid-stride` order. Differing pixels per **1,024,000**: **1, 0, 0, 524, 1, 2**. Repeat captures are byte-identical; cross-path comparison is **not byte-gateable** because transformed-vertex precision/execution changes. The harness binds the resolved default read framebuffer and samples completed-frame draw counts.
- Asset audit: all hashes/calibration matched for **28 props, nine characters, 30 preserved originals, and seven source archives**; all **37 stored inspections** match the independently audited fields. Every rig has ten clips and **67 compatible animation target paths**. Props total **1,741,332 bytes**, characters **19,022,704 bytes**, deployed music **2,228,256 bytes**. The suited commuter is **1,750,900 bytes**. The audit's **3,068,942 audio bytes** include the archived synthetic bulletin.
- Stable runtime/replacement counts: **37 containers / 421 registry assets / 122 textures / 954 render components / 59 rigid bodies / 59 collisions / 21 animation components / seven targets**. All physical roots retain unit scale; old media/callbacks/groups are released.
- Harness corrections: media assertions now await decoded frames and measurable camera movement. The first landscape-touch pickup tapped the departing friend after nearest-target selection changed during screenshot capture; the final touch route waits for the friend to clear the table before tapping the bag. The complete five-layout rerun passed.
- Visual review covered the initial **16 placement views** and **six café/fan views**. Shop-sign subtitles were partially obscured by window sills; moved their local front offset from **`depth / 2 + 0.13`** to **`depth / 2 + 0.3`** in `CafeSurroundings.ts`. Regenerated all **16 production placement views** and inspected refreshed avenue, commuter, and vehicle views to confirm clear subtitles. Resource counts remained stable and the placement report recorded no issues.
- Verification chronology: the complete **105-check browser acceptance** preceded that sign-only correction. Type-check, lint, all **62 tests**, production build, **16 placement captures**, and **six-pair batching acceptance** were repeated afterward. The suite totals above use the latest result for each suite.
- Final production models and reporter files are byte-identical to their `public/assets/` sources. Both `public/assets/video/` and `dist/assets/video/` contain only **`climate-reporter.jpg`**, **`climate-reporter.mp4`**, and **`climate-reporter.vtt`**; retired media remains outside the deployed assets.

Local commands (browser suites sequential; source audit is independent):

```powershell
$env:PATH = "$env:LOCALAPPDATA\Temp\opencode\node-v22.23.4-win-x64;$env:PATH"
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-street'
pnpm fmt
pnpm exec prettier --check src tests docs README.md AGENTS.md index.html package.json public/assets asset-library scripts
pnpm typecheck
pnpm lint
pnpm test
pnpm build
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cinematic-gameplay-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cinematic-audio-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-resume-touch-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-resume-supplemental-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-table-fans-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-street-behavior-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-street-pose-audit.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-street-batching-verify.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-street-inspect.mjs"
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-cinematic-assets-audit.mjs"
git -c core.safecrlf=false diff --check
```

Workspace-local reports/screenshots are under **`C:\Users\HP\AppData\Local\Temp\opencode\`**. Reports use `last-wave-street-{gameplay,media,touch,supplemental,fans,street-behavior,street-poses,batching,assets}-verification.json`. Pose/placement records are `last-wave-street-{pose-measurements,placement}.json`; model audits are `last-wave-street-asset-inspections.json`. The runners/evidence are local acceptance artifacts; the manual route below is portable to a fresh clone.

### Manual review, limitations, and next action

1. Start the app and inspect the black Halloween loader, café launch, four ceiling fans, reporter playback/captions, speaker shots, sound and steady-camera controls. Try skipping and retrying blocked media.
2. Finish the exchange, collect the bag/phone, open the journal, try optional conversations, and use **Head outside**. Explore both sidewalks/crosswalk, shop façades, suited commuters, umbrellas, drivers and rotating wheels. Stand in front of pedestrians/traffic, then move aside.
3. Open/close journal and checkpoint menus during street movement. Save at the café and along the street; restart, reload, and explicitly load. Verify progress and actor clearance, no duplicate objects, and the credits link.
4. Repeat on physical phones/tablets and a gamepad; record devices, browser versions, touch sprint/jump, audio behavior, frame time, and low-frame-rate movement under **LW-F002**. Emulated touch and headless draw counts do not establish device performance or hardware input acceptance. Firefox/Safari and representative-device budgets remain unverified.
5. **Next concrete work:** complete LW-F002 device acceptance; continue the requested story flow in LW-S002, followed by LW-S003 and LW-S004. The current startup loader is not a beach/disaster transition. The scene milestone restriction in `AGENTS.md` remains in force.

## LW-S002 — Guided street and beach entry

Owner: **Game/story engineering**. Priority: **P1**. Dependency: **LW-A003**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Added three short, exclusive movement/look/interaction lessons after belongings pickup. Keyboard, mouse and touch instructions match the preserved starter controls. Progress requires **1.3 m of actual movement**, **20° of input-driven camera rotation**, then the eligible doorway interaction; acknowledgement alone grants nothing.
- [x] Authored eight ordered entry objectives, reusable pedestrian directions and live distance guidance. The signed route runs east past **Lemon Market**, across the quiet side street, then left into the beach plaza. The independent signal-box quest/clue remain playable and tracked.
- [x] Gave the friend a solid, unit-scale kinematic capsule with continuous stand-up, accompanying routes, adaptive catch-up, waiting and player/actor yielding. Cumulative route projection handles both short planter corners; sideways contact tolerance prevents a player beside the friend blocking its doorway departure.
- [x] Built the broad sea-green entrance arch, ticket booth, signs, queue rails and animated patrons. Reader-paced officer shots show the booth on the left and queue on the right. Authored dialogue placement keeps those destinations visible on compact screens.
- [x] Added one attainable **10-credit purchase for two protected day passes**, funded by reserved money on the collected phone. Declining, repeated input and stale callbacks cannot duplicate payment or passes. Officer and queue cinematics share one guarded cutscene system, skip and steady-camera preferences.
- [x] Added a black branded loading handoff. A disabled candidate is constructed and validated before committing the safe white-sand/boardwalk arrival with both characters. Construction/activation failures retain the original area and paid admission with **Retry entry / Back to the queue**. Successful arrival does not automatically overwrite the manual checkpoint.
- [x] Extended checkpoints to **version 3**: all three quests, inventory and `tideline` / `beach-arrival` area. Version-1/version-2 reads migrate in memory without rewriting stored bytes; previously completed departures retain the three lessons, and only newly obstructed entrance positions relocate. Restore clears the player body and places nearby actors safely.
- [x] Added **Launch game** before importing the Engine, development Inspector, physics and models. The initial inert canvas has no graphics context; the loader handles duplicate launch, startup retry and module disposal. **Play story** gates media sources/playback, including unplayed checkpoints. Reload returns to the lightweight launcher.
- [x] Added immediate visibility/focus media pause and application suspension using the native Engine's time scale/render policy. Returning restores the exact previous settings and existing modal locks. Retired media, scene resources, input listeners and UI are disposed through their owners.
- [x] Updated architecture, controls, narrative continuity and contributor handoff. Added no dependencies or asset replacements.
- [x] Closed all eight browser suites, reviewed their 98 captures, reran supported-Node repository checks, and finalized acceptance and hardware follow-up.

This user-requested admission/tutorial sequence extends the source draft's direct café-to-beach handoff and supersedes its earlier no-mandatory-purchase wording for the entry beat. `docs/EPISODE_01.md` records the amendment. The existing signal-box tutorial is independent and does not satisfy these requested street instructions.

### Files and decisions

- Progress/content/layout: `src/episodes/episode-01/{entry,entryLayout,StreetEntryProgress}.ts` and the existing opening definitions.
- Scene composition/presentation: `src/episodes/episode-01/{StreetEntry,BeachEntrance,BeachArrival,EntryActors,EntryCamera}.ts`, `OpeningPrototype.ts`, `OpeningActors.ts`, `StreetLife.ts` and `src/scenes/FoundationScene.ts`.
- Companion/input: `src/player/{CompanionController,CompanionRoute,ControlPractice}.ts`. The generated third-person controller and ledge correction remain the input/movement foundation.
- Persistence/lifecycle: `src/scenes/FoundationState.ts`, `src/systems/{SaveSystem,QuestSystem,CutsceneSystem}.ts`, `src/core/Game.ts` and the existing staged `SceneManager` contract.
- UI/launch: `src/ui/{TutorialPanel,TransitionPanel,CheckpointPanel,CutscenePanel,GameHud}.ts`, `game.css`, `index.html`, `src/main.ts`, `src/inspector.ts` and `vite.config.ts`.
- Verification: `tests/{street-entry,companion-route,save,scene-manager}.test.mjs` and workspace-local muted CDP runners. Shared sign generation accepts an optional height for the wide entrance signs.
- The area discriminator stays inside `sceneId: 'foundation'`. Imported registry resources remain app-owned; each area owns its entities, procedural materials/textures, batches, media and interactions. Phone funds are derived from bag/pass ownership rather than a second mutable wallet.

### Verification record

Finalized on **2026-11-08**. The preceding session completed the browser suites below; this continuation reviewed their retained reports/screenshots and reran repository checks.

Environment: Windows, portable **Node 22.23.4**, pnpm **10.32.1**, PlayCanvas **2.23.3**, headless Chrome **156.0.8078.80**, production preview **`http://127.0.0.1:4178/`** and development **`http://127.0.0.1:5178/`**. Suites ran sequentially in one isolated browser on CDP **9223**, with **`--mute-audio`** and browser closure in the runner's `finally` block.

- `pnpm test` — **76/76 passed**, including ordered input/directions/admission, duplicate/stale actions, queue cancellation/retry, every checkpoint stage, migration, area/ownership invariants, arrival candidates, route corner/static-clearance checks and scene rollback.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` — **passed**. SHA-256 comparison before/after rebuilding matched all **59 production files**, including `Game-BXyRo9Tc.js`, `index-Dh-j4eZL.js`, and `index-CUgBb-zf.css`. The retained browser evidence covers this byte-identical output.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html vite.config.ts package.json public/assets asset-library scripts` — **passed**, including the finalized documentation. `pnpm fmt` reports only the previously recorded `pnpm-lock.yaml` formatting finding.
- Launch/resource acceptance — **11/11 passed**: production/development lazy loading, four compact launcher layouts, keyboard launch, one live app, silent unplayed save/load, explicit decoded reporter/music playback, real background-tab pause/resume, preserved developer time/render settings and modal locks, reset/reload, and blocked-model startup retry.
- Gameplay — **15/15 passed**: animated café cast and continuous friend stand-up, real WASD/pointer-lock lessons and doorway input, solid companion contact and modal/replay suspension, acknowledged pedestrian directions, keyboard traversal of the signed route, reader-paced officer shots, one protected purchase, visible queue, black loading and safe arrival with friend dialogue/save support.
- Checkpoints — **16/16 passed**: all nine entry stages, independent clue/pass state, reset/reload retention, dynamic actor clearance, v1 and all four v2 opening stages, newly occupied-position migration, invalid/incompatible state rejection, paid replay, and three resource-stable Tideline/arrival round trips.
- Recovery — **6/6 passed**: construction/activation rollback, paid-admission retention through Back and Retry, successful entry without automatic saving or duplicate purchase, failed checkpoint construction and retry, reset during officer dialogue, and destruction during black loading with inert retained actions.
- Touch/responsive acceptance — **28/28 passed** at **390×844**, **844×390**, **360×640**, **320×568**, and **640×360**, plus compact **640×360 desktop**. Actual left/right gestures and doorway taps completed lessons; directions, officer/booth/queue framing, steady mode, purchase, loading, arrival, journal and reset/load remained usable. Compact error/retry/back controls were contained and returned to paid admission.
- Companion — **5/5 passed**: doorway clearance beside a player, yielding/resumption when directly blocked, waiting within six metres, real sprint traversal through both planter corners and the full street, and sustained sprint-speed arrival collision from all four sides.
- Independent guide/clue — **7/7 passed**: early clue collection, acceptance, reinspection and one-shot reporting alongside entry progress; reset/load and arrival retention; and readable combined quest/navigation feedback at **320×568 touch** and **640×360 touch/desktop**.
- Cinematic media — **15/15 passed**: gesture-gated decoded reporter/music playback, captions/mute, time-scale and visibility pause/resume, natural bulletin end, all four reader-paced source replies, replay/skip and stale-event protection, blocked/missing video and music retry, the stalled-playback watchdog, and application cleanup.
- All eight suites passed **103/103 checks** with **no unexpected console, shader, asset or network issues**. Logged faults were limited to deliberately blocked startup/media requests and injected arrival/checkpoint failures.
- Visually reviewed all **98 report-listed screenshots** through **15 contact sheets** and selected full-size originals, including desktop/mobile arrival and officer framing. Confirmed the isolated verification browser was closed.
- `git -c core.safecrlf=false diff --check` — **passed**. Reviewed the pending runtime/test diff, new LW-S002 modules/tests, and finalized documentation diff.

### Reproduction commands

Use the supported portable Node in this workspace, or install a supported version on a fresh clone:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Temp\opencode\node-v22.23.4-win-x64;$env:PATH"
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm exec prettier --check src tests docs README.md AGENTS.md index.html vite.config.ts package.json public/assets asset-library scripts
git -c core.safecrlf=false diff --check
```

Serve production and development in separate terminals:

```powershell
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

```powershell
pnpm exec vite --host 127.0.0.1 --port 5178 --strictPort
```

Run browser suites sequentially through the muted owner/cleanup wrapper:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:DEV_URL = 'http://127.0.0.1:5178/'
$env:VERIFY_PREFIX = 'last-wave-entry-final'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-run-muted.mjs" last-wave-launch-verify.mjs last-wave-entry-gameplay-verify.mjs last-wave-entry-checkpoints-verify.mjs last-wave-entry-recovery-verify.mjs last-wave-entry-touch-verify.mjs last-wave-entry-companion-verify.mjs last-wave-entry-guide-verify.mjs last-wave-cinematic-audio-verify.mjs
```

Reports are **`last-wave-entry-final-{launch,gameplay,checkpoints,recovery,touch,companion,guide,media}-verification.json`** with corresponding PNG captures under **`C:\Users\HP\AppData\Local\Temp\opencode\`**. The 15 visual-review sheets are `last-wave-entry-review-*.jpg`, generated by `last-wave-entry-review-captures.py` in the same directory. The CDP loader activates Launch game for gameplay suites; launcher checks explicitly opt out. These runners/evidence are workspace-local; repository checks and the manual route below are portable to a fresh clone.

### Manual acceptance, limitations, and next action

1. Open the page and leave it idle. Confirm no game sound/video or 3D asset/GPU startup. Activate **Launch game** with mouse, keyboard or touch; the café loads and waits silently for **Play story**. Verify startup retry if a model request fails.
2. Play the reporter and friend exchange, collect the bag/phone, and acknowledge each lesson. Confirm actual movement/look is required and **Head outside** completes interaction practice. The solid friend departs, waits and accompanies the route.
3. Ask a pedestrian for directions; leaving early grants nothing. Acknowledge the route, walk around pedestrians and the planter, follow the signs past Lemon Market and cross the side street to the arch. Stop/run and inspect companion spacing/collision.
4. Read the four officer beats; inspect the booth and queue shots and steady-camera mode. Visit the booth, decline once, buy both passes, check the receipt/journal, and revisit to confirm there is no second charge.
5. Join the visible queue. Confirm exclusive black loading followed by both characters on the boardwalk/white-sand arrival, completed entry progress and optional friend dialogue. On a loading failure, inspect **Retry entry** and **Back to the queue**; both retain paid admission.
6. Save during lessons, street progression, paid admission and arrival. Reset/reload and explicitly load. Confirm the next objective, safe actor placement, all inventory and independent signal quest. Delete the slot without changing current gameplay. Unplayed saves must still wait for Play story.
7. Switch tabs/focus during media, a modal and loading; return to the same suspended state. Check developer pause/slow-motion/render settings survive. Repeat on compact portrait/landscape layouts and check readable text, visible destinations and ≥44 px controls.
8. Record physical desktop/mobile devices, gamepads, Firefox/Safari, low-frame-rate movement and representative performance under **LW-F002**. Headless Chrome and touch emulation do not establish hardware/audio-output or cross-engine acceptance. Hot-module replacement was code-reviewed; its live trigger was not exercised.

**Handoff at completion:** complete **LW-F002** hardware acceptance using this route, then extend the arrival composition under **LW-S003**. Subsequent beach and wave implementations are recorded below.

## LW-S003 — Beach exploration

Owner: **Environment/story engineering**. Priority: **P1**. Dependency: **LW-S002**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Extended the existing black loading handoff into a populated **32×28 m** white-sand/boardwalk area with both friends, preserving the `[0, 1.08, 3.6]` default spawn and paid-admission rollback/retry.
- [x] Added six striped umbrellas, seven supported loungers, towels, signs, swim markers and a citrus cart with five displayed drinks. Furniture, poles, rails, sign posts and stationary people share authored footprints with checkpoint validation and navigation.
- [x] Prepared four fitted swimwear variants from preserved **Quaternius CC0** bodies and compatible clips. Each has seven in-place clips and embedded 512 px textures; source records, hashes, bind calibration and animated support offsets are retained. Five stationary beachgoers, an attendant, two yielding walkers and four swimmers provide the relaxed social interval.
- [x] Added reader-paced friend conversation, two included chilled citrus waters and shoreline observation as three **free-order discoveries**. Both friend replies lead to the same acknowledged social moment; declining/leaving/revisiting cannot grant early or duplicate progress. Optional beachgoer dialogue supplies directions. The HUD lists remaining moments, the nearest stop and a playable chapter-end/save message.
- [x] Reused the solid companion with clear-ground following around scenery and moving walkers. Routes refresh at most every 0.75 seconds, use **1.15 m walker clearance**, allow outward escape from already-close encounters, and stop/retry when no route is available. Regression coverage includes head-on and already-yielding encounters.
- [x] Added a reusable **65×65-vertex** calm-water surface, analytic normals and three animated foam bands. Swimmer height follows the same surface function; per-rig idle/walk/swim/float offsets keep feet grounded and heads visible. Beach lighting is tuned separately from Tideline.
- [x] Generated original **24-second mono surf/gull ambience** without third-party samples. Playback starts after committed arrival or explicit beach Load, shares mute, pauses with beach modals/background/developer time, and exposes retry after blocked/missing/stalled playback. An eight-second watchdog and generation guards protect pending playback and teardown.
- [x] Added **version-4 checkpoints** for all four quests, inventory and either area. V1–v3 migrate on read without rewriting stored bytes; v3 retains admission and earlier progress, relocating only formerly clear beach positions now occupied by dressing. Every discovery subset restores independently.
- [x] Kept beach controls readable from **320×568 portrait** through compact landscape/desktop. The wrapping Controls popover stays contained; narrow portrait interaction prompts dock below the objective card.
- [x] Updated architecture, narrative continuity, asset preparation/credits, controls and contributor handoff. Added no dependencies.

### Files and decisions

- Composition/content: `src/episodes/episode-01/{BeachArrival,BeachDressing,BeachLife,BeachNavigation,BeachWater,BeachAudio}.ts`, `beach.ts`, `beachLayout.ts` and `beachAudio.json`.
- Integration/persistence: `src/core/Game.ts`, `src/scenes/{FoundationScene,FoundationState}.ts`, `src/systems/{QuestSystem,SaveSystem}.ts`, `src/player/{AnimatedCharacter,CompanionController}.ts`, `src/data/characterModels.ts` and the beach HUD/checkpoint UI.
- Preparation/provenance: `scripts/{prepare-beach-assets.py,beach_clothing.py,prepare-beach-audio.py}`, shared helpers in `prepare-cafe-assets.py`, `asset-library/beach-{selection,preparation,inspection}.json`, `asset-library/audio/beach-preparation.json` and the prepared files/credits in `public/assets/`.
- Rules remain engine-independent: `QuestSystem` defaults to ordered objectives and adds validated unique subsets for `order: 'any'`; snapshots use canonical authored order. `FoundationState` owns admission/area/discovery invariants. `tests/beach.test.mjs` covers these contracts and static/dynamic navigation.
- Imported containers remain app-owned; each area owns its instances, procedural meshes/materials/textures, batch groups, interactions and media. The existing controller and ledge correction remain the movement foundation.
- The two drinks are included in the paid passes and count as one shared discovery. Loungers are unoccupied; swimming is ambient beyond the rail. Completion leaves exploration/save available at the LW-S004 continuation point.

### Verification record

Finalized on **2026-11-08** using Windows, portable **Node 22.23.4**, pnpm **10.32.1**, PlayCanvas **2.23.3** and headless Chrome **156.0.8078.80** at **`http://127.0.0.1:4178/`**. Isolated CDP browsers used **`--mute-audio`** and closed in the runner's `finally` block.

- `pnpm test` — **88/88 passed**, including all six discovery orders/eight subsets, same-size progress rollback, acknowledged dialogue, v1–v4 migration/ownership/position invariants, static navigation and two moving-walker regressions.
- `pnpm typecheck`, `pnpm lint` and `pnpm build` — **passed** after the final portrait-layout change. Production chunks are `Game-DJpzqDj7.js`, `index-Bjb8ZjmZ.js` and `index-BejHlyc-.css`.
- `pnpm exec prettier --check src tests docs README.md AGENTS.md index.html vite.config.ts package.json public/assets asset-library scripts` — **passed** after formatting the root README and shipped asset README/credits. `pnpm fmt` reports only the previously recorded **`pnpm-lock.yaml`** formatting finding.
- Visual/animation — **3/3 passed**: complete arrival, furniture/swimwear captures, and movement in at least two non-root joints for every one of the 12 ambient rigs.
- Gameplay — **12/12 passed**: silent unplayed launch with all 41 containers, real queue-to-beach handoff, walking/sprinting to the cart/shore, acknowledged conversations, no duplicate charge/progress, all six discovery orders, traversable lounger/umbrella aisles, following friend and manual v4 save after completion.
- Checkpoint/recovery — **21/21 passed**: all eight discovery subsets, reset/reload retention, v1/v2/v3 migration, newly occupied legacy positions, malformed/unpaid/out-of-area saves, blocked/full storage, construction/activation rollback, paid retry, failed checkpoint activation, four alternating area reloads, deletion and app destruction with inert retained actions.
- Audio/pause — **14/14 passed**: decoded 24-second loop, shared mute across areas, modal/zero-time/tab/focus suspension, preserved developer pause, blocked autoplay/request recovery, eight-second loading/stall timeout, late promise isolation, and source/listener/watchdog teardown.
- Touch/responsive — **12/12 passed** at **390×844**, **844×390**, **360×640**, **320×568**, **640×360 touch** and **640×360 desktop**. Real left/right drags move/stop/look; arrival/retry/help/interaction remain contained without overlap. All three discoveries, completion, journal and checkpoint work with readable scrolling modals and ≥44 px controls.
- Environment/collision — **16/16 passed**: population/prop counts and unit-scale physical roots; finite animated water/foam with unit normals and stable buffers; sprint collision at four rails, cart, rotated lounger, umbrella pole, beachgoer and attendant; solid friend, player/walker yielding, and both approaching/already-yielding companion detours without overlap or deadlock.
- Posed-vertex measurement — **1/1 passed**, sampling **21 poses per ambient character** for land grounding, visible swimmer heads and submerged lower geometry.
- Total browser acceptance: **79/79 checks**, with **no unexpected console, shader, asset or network issues**. Expected logs were limited to injected candidate failures, a deliberately blocked ambience request and an aborted retired media request. Environment/pose suites were refreshed after the detour correction; touch/visual/gameplay were refreshed after the final portrait fix.
- Reviewed all **72 report-listed screenshots** using **14 contact sheets** and selected full-size originals, including lounger supports, swimmer waterlines, shoreline text and compact portrait/landscape controls. All isolated verification browsers are closed.
- Asset verification — **92 unique manifest-file size/SHA-256 checks passed**, covering all **30 supplied originals**, all **41 prepared GLBs**, source archives/files and media. Validated all four new GLB structures/clip catalogs and the WAV format. Four new rigs total **6,896,708 bytes**; all prepared GLBs total **27,660,744 bytes**; ambience is **1,058,444 bytes**.
- Post-format production reconciliation — rebuilt successfully, then matched all **60 public files** to their deployed copies. **62/64 build-file SHA-256 hashes** match the retained pre-format report, including JavaScript, CSS, entry HTML, models and media. The two changed files are the formatted `dist/assets/README.md` and `dist/assets/credits.html`. All manifest/GLB/WAV checks passed again.
- `git -c core.safecrlf=false diff --check` — **passed**. Reviewed the tracked runtime/test diff, new beach modules/tests/preparation scripts, manifests, credits and finalized documentation. LW-S002 and LW-S003 changes remain uncommitted.

Normal beach observations: **41 containers / 517 registry assets / 31 bodies and colliders / 317 renders / 14 animations / four interaction targets / 97 textures**. Alternating reloads retained **83 persistent textures / 387 geometry buffers / 8,399,780 vertex bytes / 1,511,100 index bytes** on the beach and **103 / 535 / 9,212,020 / 1,610,760** respectively in Tideline. Engine skin palettes and dynamic batch partitions may change transient totals; cleanup checks also verify ownership and stable persistent resources.

### Reproduction commands

Run repository checks with supported Node, then serve production in a separate terminal:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Temp\opencode\node-v22.23.4-win-x64;$env:PATH"
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm exec prettier --check src tests docs README.md AGENTS.md index.html vite.config.ts package.json public/assets asset-library scripts
pnpm fmt
git -c core.safecrlf=false diff --check
```

```powershell
pnpm exec vite preview --host 127.0.0.1 --port 4178 --strictPort
```

Workspace-local browser and artifact commands:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-beach-acceptance'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-run-muted.mjs" last-wave-beach-visual.mjs last-wave-beach-gameplay-verify.mjs last-wave-beach-recovery-verify.mjs last-wave-beach-audio-verify.mjs last-wave-beach-touch-verify.mjs last-wave-beach-environment-verify.mjs last-wave-beach-pose-measure.mjs
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-beach-artifact-check.mjs"
python "$env:LOCALAPPDATA\Temp\opencode\last-wave-beach-review-captures.py"
```

Evidence lives under **`C:\Users\HP\AppData\Local\Temp\opencode\`**: `last-wave-beach-acceptance-{visual,gameplay,recovery,audio,touch,environment,pose-measure}-verification.json`, their PNG captures, `last-wave-beach-review-*.jpg`, `last-wave-beach-capture-index.json` and `last-wave-beach-artifact-verification.json`. The preserved `last-wave-beach-artifact-verification-pre-format.json` and `last-wave-beach-artifact-reconciliation.json` record the final build comparison. Runners/evidence are workspace-local; repository checks and the manual route below are portable to a fresh clone.

### Manual acceptance, limitations, and next action

1. Follow LW-S002's launch/story/lessons/directions/officer/ticket/queue route. Confirm black loading reaches both characters on the populated beach, retains both passes and starts surf/gull ambience only after arrival.
2. Walk the boardwalk, umbrella/lounger aisles and beach perimeter. Inspect feet, lounger supports, swimwear, four animated swimmers and calm water/foam. Stop near the friend, cross a walker's path, then move away; check collision, waiting, detours and resumption.
3. In any order, finish the friend's exchange, accept the two included citrus waters and acknowledge the shoreline. Leave/decline once and revisit; incomplete choices must remain available and completed discoveries must count once. Read the optional beachgoer dialogue.
4. Save after zero, one, two and three discoveries. Restart/reload and explicitly Load; confirm exact discoveries, earlier quests, bag/passes/clue and safe nearby actors. Completion keeps walking/interactions/save available. Deleting the slot must preserve live progress.
5. Open dialogue, journal and checkpoint; switch tabs/focus and exercise developer pause. Beach motion/audio must pause without rewinding or losing progress. Toggle sound across a café restart and beach reload; block the ambience request once and verify **Enable beach sound** recovery.
6. Repeat in narrow portrait and compact landscape, including the expanded Controls menu and sound-retry label. Check readable scrollable dialogs, ≥44 px buttons and separation of interaction prompts from objectives/help.

Physical mobile/desktop devices, physical gamepads, Firefox/Safari, hardware audio quality/output, sustained frame-time/memory budgets and low-frame-rate collision acceptance remain under **LW-F002**. Headless Chrome and touch emulation establish functional/layout coverage, not representative device performance. Live HMR remains code-reviewed rather than exercised. The bounded placeholder-dressed beach has ambient swimming and empty loungers; player swimming/seating and carried-drink animations are outside this milestone.

**Handoff at completion:** complete **LW-F002** device/browser/performance acceptance using the route above, then implement the selected **LW-S004** continuation. Its completed warning/evacuation/blackout record follows. The hospital remains a separate later scene.

## LW-S004 — Wave, panic, and blackout

Owner: **Gameplay/cinematic engineering**. Priority: **P1**. Dependency: **LW-S003**. Status: **Complete; automated browser acceptance passed**.

### Completed implementation

- [x] Added explicit **Continue story** after all three beach discoveries. Reader-paced **retreating water → fleeing birds → pointing crowds → wave reveal** beats carry the source's higher-ground danger cue. Warning skip hands off to playable evacuation.
- [x] Added green-arrow navigation, three ordered route gates, an opened evacuation gate and a solid 4 m-high dune ramp. The crowd separates the friend at the dune approach; reaching the final gate stages a rigged fall, lowered viewpoint, blinking eyelids, an unidentified approaching figure and black loading.
- [x] Added reusable wave/foam and gull geometry, crowd point/run poses, swimmer-to-run transitions, and procedural rumble/wind, whistle and heartbeat. All **33 evacuees** can reach higher ground, yielding to the player/friend and one another. Captions, shared mute, steady/reduced-motion presentation, pause and retry span the sequence.
- [x] Added a recoverable ending with **Save blackout checkpoint**, **Replay wave & evacuation**, **Return to the calm beach** and **Save / load menu**. Mid-run **Retry wave** rebuilds the warning. Replay/recovery retain discoveries, passes and the manual slot; failed construction retains the current scene with usable recovery.
- [x] Added **version-5 checkpoints** with safe `before-wave` / `after-blackout` boundaries. Mid-wave/offshore capture projects onto clear beach ground. Versions 1–4 validate historical geometry before migrating, preserving valid old progress and relocating only newly obstructed positions. No automatic checkpoint write was added.
- [x] Expanded the city to **320×240 m**, two avenues, **39 neighboring buildings, 20 pedestrians, eight Porsche cars and four drivers**. Expanded the beach to **96×48 m**, **18 umbrellas, 31 loungers, 17 stationary beachgoers, eight walkers, eight swimmers and one attendant**. Removed the entrance cross-gate/rear fence and shoreline fence; the open shallows have ground support.
- [x] Adapted the supplied PlayCanvas Porsche reference with **Lionsharp Studios / CC BY-SA 4.0** attribution, preserved source, calibrated wheel nodes, fixed calipers, independent clear-coated paint and fitted rigged drivers. Offline reduction retains **52,568 of 652,660 source triangles**.
- [x] Rebuilt all **13 rig GLBs** with relaxed full-body locomotion: upright breathing posture, open hands, gentle alternating arm swings and authored strides. Shared speed matching, gait hysteresis, phase-preserving blends and post-physics grounding smooth idle/walk/jog/sprint. The stock controls, camera and ledge shim remain the movement foundation.
- [x] Corrected immediate fall-to-blink visibility and narrow-screen audio-failure layout after visual review. Refreshed the affected browser suites and corrected a supplemental camera fixture before accepting its front/side movement captures.
- [x] Updated architecture, task/context handoff, narrative continuity, play instructions, asset preparation and shipped credits. Added no runtime dependencies.

### Files and decisions

- State/content: `src/episodes/episode-01/{WaveProgress,wave,waveLayout}.ts`. `WaveProgress` owns `calm → warning → evacuating → separated → falling → blinking → loading → complete`; progression is independent of rendering. Warning beats are reader-paced; the run has no chase timeout. Fall/blink/loading use **2.4 / 6.4 / 1.2 game seconds**.
- Presentation: `BeachWave.ts`, `WaveSurge.ts`, `WaveBirds.ts`, `WaveCrowd.ts`, `WaveCamera.ts`, `WaveAudio.ts`, `EvacuationRoute.ts`, `src/ui/{WaveEndPanel,CutscenePanel,GameHud}.ts` and `game.css`. One shared `CutsceneSystem` retains cinematic exclusivity; gameplay locking is separate from presentation pause.
- Integration/recovery: `src/core/{Game,AssetManager}.ts`, `src/scenes/{FoundationScene,FoundationState}.ts`, `src/systems/SaveSystem.ts` and `CheckpointPanel.ts`. `Game.ts` rebuilds replay/recovery through the existing rollback-safe `SceneManager`. Stable beach recovery uses **`[0, 1.04, -25.8]`**; loading after-blackout returns to the ending panel.
- World/traffic: `src/data/{foundation,vehicleModels}.ts`, `CafeSurroundings.ts`, `StreetLife.ts`, `StreetVehicle.ts`, `BeachEntrance.ts`, `BeachDressing.ts`, `BeachLife.ts`, `BeachWater.ts`, `BeachNavigation.ts`, `beachLayout.ts` and `entryLayout.ts`. Historical geometry remains explicit for old checkpoints.
- Movement/preparation: `src/data/{locomotion,characterModels}.ts`, `src/player/{AnimatedCharacter,PlayerAnimation,PlayerController,CompanionController}.ts`, `EntryActors.ts`, `scripts/{casual_animation.py,prepare-cafe-assets.py,prepare-beach-assets.py,prepare-traffic-assets.mjs}` and their asset manifests/inspections.
- Quaternius UAL1 idle/formal-walk profiles retain **22% finger curl** and remove **65% mean spinal hunch**; jog/sprint retain **30% curl**. Runtime uses baked compatible tracks rather than individual-body-part rotation. `PlayerAnimation.postUpdate()` reads completed physics/grounding. Controller tuning is **`speedGround: 20`, `sprintMult: 4.5`**; all input/camera mappings remain stock.
- Driver seat recline is **−24°**, with **24° baked neck counter-rotation**. `PORSCHE_DRIVER_SEATS` and animated support tables own calibration. Grounding acceptance uses decoded skinned vertices with **bone-world × inverse-bind** matrices and exact collider-top/overlay heights.

### Verification record

Automated acceptance finalized on **2026-11-09**, with a closeout refresh on **2026-11-10**. Environment: Windows, portable **Node 22.23.4**, PlayCanvas **2.23.3**, headless Chrome **156.0.8078.80**, production preview **`http://127.0.0.1:4178/`**. Browser verification ran with **`--mute-audio`**; every isolated browser closed in the runner's `finally` block.

- Repository tests — **100/100 passed** after final runtime/UI corrections. Coverage includes wave prerequisites/order/timing/skip/destruction, v1–v5 migration and ownership, historical geometry conflicts, expanded routes and the existing dialogue/quest/inventory/scene contracts.
- TypeScript, ESLint and production build — **passed** using the supported Node binary. Current runtime chunks: **`Game-TjUHTAsk.js`**, **`index-C0OeniTa.js`**, **`index-BTLh_8cT.css`**.

| Browser suite            |      Checks | Coverage                                                                                                             |
| ------------------------ | ----------: | -------------------------------------------------------------------------------------------------------------------- |
| All rigs                 |       13/13 | Each rig's bound relaxed walk, upright torso, hands, stride and ground contact                                       |
| Locomotion               |         8/8 | Player idle/walk/jog/sprint, speed synchronization, blending and support                                             |
| Wave poses               |         3/3 | Grounded point/run/fall presentation and swimmer transitions                                                         |
| Real-input controls/gait |         7/7 | Walk/sprint/stop, camera-relative movement, jump/landing, zoom and modal handoff                                     |
| Companion                |         5/5 | Solid following, catch-up, waiting/yielding, route continuity and pause                                              |
| Porsche traffic          |       11/11 | Calibration, wheel-only rotation, paint isolation, drivers, yielding/wrapping and disposal                           |
| Expanded world           |         8/8 | Buildings/populations, both street extensions, open barriers/shore, admission, discoveries and saves                 |
| Wave flow                |       13/13 | Explicit start, four warning beats, actual gate/ramp movement, separation, fall, blink and saved ending              |
| Recovery/pause           |       15/15 | Skip/retry/replay, safe snapshots, mute/steady, modal/developer/background pause, failed reconstruction and teardown |
| Crowd                    |         3/3 | All 33 reach safety, eight swimmers become runners, blocking/resumption and clearance                                |
| Wave audio               |       12/12 | Lazy graph, escalation/filter/pulse, shared mute, pause, failed/late resume, retry/watchdog and cleanup              |
| Touch/layout             |       18/18 | Portrait/landscape captions, sound retry, actual drags/gates, ≥44 px controls, ending and save/recovery              |
| **Core total**           | **116/116** | **No unexpected console, shader, asset or network issues**                                                           |

- Supporting checks — **1/1 seated/vehicle calibration** with seven captures and **1/1 supplemental gait views** with four captures. The corrected gait fixture disables the stock camera controller and asserts a stable inspection camera, replacing the earlier invalid sightlines.
- Measured walking is approximately **1.34 m/s**, sprint **7.55 m/s**, torso lean **7°**, arm/leg correlation **−0.856**, and finger extension **0.97**. Porsche steering grip gaps are approximately **0.0155 / 0.0248 m**. These are sampled acceptance observations, not device-performance claims.
- Final flow/recovery/touch refresh passed **46/46** after the synchronous player-hide and backed audio-status corrections. Other suites retain their accepted geometry/animation/runtime evidence; earlier vehicle acceptance used `Game-O0Z4UVU7.js`, and most preceding core suites used `Game-B_y6bsdt.js`. Reports retain exact timestamps. Expected issues are canceled retired media and the deliberately injected **`Error: wave builder injected`** rollback failure.
- Asset audit passed **94 unique file size/SHA-256 records**, including **30 supplied originals**, all **42 GLB structures/calibrations/animation target paths**, Porsche attribution and WAV format. GLB totals: props **1,741,332**, café rigs **19,147,644**, beach rigs **7,170,752**, Porsche **2,656,804** — **30,716,532 bytes**.

Normal city observations: **564 registry assets / 171 textures / 130 bodies and colliders / 2,144 renders / 40 animations**; repeated replacement retained **12,026,396 vertex bytes / 2,207,796 index bytes**. Beach replay/recovery retained **92 bodies/colliders / 944 renders / 37 animations / four targets / 93 persistent textures / 538 geometry buffers / 10,302,532 vertex bytes / 1,923,324 index bytes**. Transient skin palettes/dynamic batches can change on activation, so checks also verify persistent resource identity and live ownership.

#### 2026-11-10 closeout

- Re-ran repository tests (**100/100 passed**), TypeScript, ESLint and production build successfully with **Node 22.23.4** and the commands below. Rebuilt after formatting the shipped credits; runtime chunk names remain those recorded above.
- Fresh production wave flow passed **13/13 checks**, producing **14 captures**. Actual movement crossed the inland/separation gates and climbed the ramp; fall/blink/loading reached the recoverable ending and saved the version-5 **after-blackout** boundary. Reviewed representative wave, evacuation/separation, fall/blink and ending captures. No unexpected console, shader, asset or network issues; the one recorded issue is expected cancellation of retired beach ambience. The muted isolated browser closed successfully. Report timestamp: **`2026-11-10T07:38:18.433Z`**.
- Fresh asset/deployment audit passed **94 unique size/SHA-256 records**, **30 supplied originals**, **42 GLBs / 30,716,532 bytes**, and byte-for-byte deployment of **61 public files**. Report timestamp: **`2026-11-10T07:38:24.566Z`**.
- Closeout edits cover README/task-table formatting, shipped credits wrapping and this verification handoff. Scoped Prettier and `git -c core.safecrlf=false diff --check` passed. Full Prettier reports only the previously recorded **`pnpm-lock.yaml`** formatting finding.
- Changes remain **uncommitted**. Preserve the unrelated `Sign-login/` work. The next action and hardware/browser/audio/performance limitations remain recorded below under **LW-F002**.

### Reproduction commands

Repository script equivalents, executed with the supported Node binary:

```powershell
$env:PATH = "$env:LOCALAPPDATA\Temp\opencode\node-v22.23.4-win-x64;$env:PATH"
node --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
node node_modules/vite/bin/vite.js build
node node_modules/prettier/bin/prettier.cjs --check src tests docs README.md AGENTS.md index.html vite.config.ts package.json public/assets asset-library scripts
node node_modules/prettier/bin/prettier.cjs --check .
git -c core.safecrlf=false diff --check
```

Serve production in a separate terminal:

```powershell
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4178 --strictPort
```

Workspace-local browser suites run sequentially inside the muted runner:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4178/'
$env:VERIFY_PREFIX = 'last-wave-grounded'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-run-muted.mjs" last-wave-all-rigs.mjs last-wave-locomotion-verify.mjs last-wave-wave-poses.mjs last-wave-controls-gait.mjs last-wave-entry-companion-verify.mjs last-wave-vehicle-verify.mjs last-wave-gait-views.mjs
$env:VERIFY_PREFIX = 'last-wave-final'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-run-muted.mjs" last-wave-wave-world.mjs last-wave-wave-flow.mjs last-wave-wave-recovery.mjs last-wave-wave-crowd.mjs last-wave-wave-audio.mjs last-wave-wave-touch.mjs
$env:VERIFY_PREFIX = 'last-wave-closeout'
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-run-muted.mjs" last-wave-wave-flow.mjs
node "$env:LOCALAPPDATA\Temp\opencode\last-wave-artifact-check.mjs"
python "$env:LOCALAPPDATA\Temp\opencode\last-wave-review-final-captures.py" grounded
python "$env:LOCALAPPDATA\Temp\opencode\last-wave-review-final-captures.py" final
```

Evidence is under **`C:\Users\HP\AppData\Local\Temp\opencode\`**: `last-wave-grounded-wave-{all-rigs,locomotion,poses,controls-gait,gait-views}-verification.json`, `last-wave-grounded-{companion,vehicles}-verification.json`, `last-wave-seated-vehicle-calibration-verification.json`, `last-wave-final-wave-{world,flow,recovery,crowd,audio,touch}-verification.json`, their PNG/contact sheets and `last-wave-{grounded,final}-capture-index.json`. `last-wave-artifact-verification-pre-build.json` retains earlier deployment hashes for reconciliation. These harnesses/evidence are workspace-local; repository checks and the manual route are portable to a fresh clone.

The **2026-11-10** refresh is recorded in **`last-wave-closeout-wave-flow-verification.json`**, its **14 `last-wave-closeout-wave-flow-*.png` captures**, and **`last-wave-artifact-verification.json`** in the same directory.

### Manual acceptance, limitations, and next action

1. Launch and play the café through belongings, actual control practice, pedestrian directions, officer, two passes and queue. Inspect the expanded streets, cars/drivers and relaxed walking from front/side; try walking, sprinting, stopping, diagonal movement, orbit, zoom and jumping. Check traffic yielding and open entrance barriers.
2. Enter the populated beach. Walk both wings, boardwalk/furniture aisles and supported shallows; inspect feet, relaxed hands, swimmers and water. Complete friend, drinks and shoreline discoveries in any order. Confirm the warning waits for **Continue story**.
3. Save the calm beach, then read all four warning beats. Test sound/CC/steady controls and **Skip to evacuation**. Turn inland, follow green arrows through Z=0 and the dune approach, and climb the ramp. Check crowd clearance, swimmer transitions, friend separation and final-gate fall.
4. Watch the rigged fall, ground-level figure, eyelid closure and black loading. Try advancing directly to blink and skipping to the ending. Confirm no player body obscures the viewpoint and all ending buttons are usable.
5. Save after-blackout, restart/reload and explicitly Load. Close the menu to recover the ending. Replay the wave, return to the calm beach, save during evacuation, and load again; earlier quests/items/discoveries remain, mid-wave saves restart safely, and only explicit saving replaces the slot. Exercise failed storage/reconstruction and retry.
6. Open journal/checkpoint during evacuation; switch tabs/focus and exercise developer pause/slow motion. Motion, physics and sound must resume from the same state. Block audio resume once and recover through sound retry, with readable captions throughout.
7. Repeat on physical desktop/mobile and gamepad, including narrow portrait/landscape, ≥44 px controls, backed sound-failure text, right-look/left-move gestures and touch evacuation. Record frame-time/memory and hardware audio observations under **LW-F002**.

**Unverified:** physical devices/gamepads, Firefox/Safari, hardware audio output/quality, sustained representative frame-time/memory budgets, low-frame-rate collision and live HMR. Browser automation was muted and used headless Chrome/touch emulation. The beach has ambient swimming and empty loungers; player swimming/seating and carried-drink animation remain future work. The implemented story ends at blackout.

**Next concrete action:** complete **LW-F002** physical-device/browser/audio/performance acceptance with this route. The next selectable story work is a separate hospital-awakening/investigation task, starting from the version-5 **after-blackout** boundary and the preserved Episode 1 design source.

## Deferred backlog

The unchecked roadmap items remain future work. Their module boundaries are recorded in [ARCHITECTURE.md](ARCHITECTURE.md). The foundation includes the expanded Tideline/open street, populated beach and wave/evacuation through recoverable blackout, with version-5 checkpoints. LW-S002 supplies tutorials/admission; LW-S003 the relaxed beach interval; LW-S004 its explicit continuation. Hospital, Kiroween City, multiplayer and backend work follow their own milestones.

## Completion protocol

After each task, record its ID, owner, status, files/decisions, exact verification commands and outcomes, outstanding limitations, and the next concrete action here. Update architecture for changed ownership/contracts. Keep narrative changes in the design references. Mark unchecked behavior explicitly so the next contributor can continue immediately.

## LW-UI001 — Cinematic Forest Login Experience

Owner: **Lead game engineering**. Priority: **P1**. Dependency: existing LW-S004 foundation and supplied login brief/assets. Status: **Revised voiced entrance and doorway fix implemented; automated acceptance passed. Audible/acting review and physical-device acceptance remain open**. Speech is bundled neural synthesis; the TV retains its separate original human recording.

### Current revision — voice, action, automatic entry and café doorway

- [x] Removed the Launch game requirement. The forest opens automatically in the single AppBase; only its two shared rigs load initially. Continue locally prepares the rest of the game set, reusing those assets, before constructing Tideline. Startup and local-entry failures retain retry.
- [x] Replaced caption-only dialogue and unreliable browser voice choice with a synchronized 44-second MP3: explicit **am_michael male / af_bella female** Kokoro neural voices. Source script, individual PCM lines, model hashes, Apache-2.0 weights/license and MIT offline tool provenance are retained. No speech-generation package ships in the browser.
- [x] Added in-scene Play with sound / Watch muted recovery for browser autoplay policy. Dialogue, captions and animation follow actual media time when audible; skip, replay, mute, focus pause/resume and cleanup stay coordinated. Returning/reduced-motion visits reach the board; the new `last-wave.forest-seen.v2` lets earlier silent-intro viewers see the revision.
- [x] Expanded selected supplied scenery from nine to **32 calibrated models**: varied trees/bare trees, grass, rocks, bushes, fences, coffin, graves/slabs, pumpkins, lantern poles, candles and skulls. Added leaf-litter ground, gentle tree sway, lantern glow, authored camera travel/close-ups, speaking gestures, look-up, duck/startle and exit/look-back action. Phone/spotlight use the real left hand and correct local light direction.
- [x] Eye pairs and bats share measured anchors. Curved flights start at those exact positions, with near-camera and deeper paths. A dedicated impact, wings and cry coincide with the **24-second** burst; the camera recoils with the performers.
- [x] Fixed the solid friend's café route ending in the door lane. `CAFE_OUTSIDE_WAIT` is beside the exit; the street route continues from that same mark. Player movement remains physical. The browser loads the departure checkpoint, chooses Head outside and uses actual W input to walk beyond Z=7.1 while the friend clears the passage.
- [x] Organized originals, runtime assets, voice sources and generated evidence; updated architecture, credits and continuation notes. ESLint excludes ignored offline source-tool dependencies. Existing S004 changes remain intact and uncommitted.

Current runtime payload: **35 files / 8,106,010 bytes** (32 scenery GLBs, one eight-clip animation GLB, ambience WAV, story MP3). Desktop uses 42 background trees / 20 bats; mobile uses 26 / 12, plus four foreground trees. No runtime dependency was added. The unlicensed standalone wind MP3 remains preserved only. The full city/beach game set is deferred until local entry.

Current verification, supported **Node 22.23.4**, production preview on port **4180**, muted isolated Chrome:

- `pnpm test`: **109/109 passed**, including dialogue PCM/cue checks, explicit voice assignments, shared scare timing, eye-origin flight paths and doorway clearance/route continuity.
- `pnpm typecheck`, `pnpm lint`, `pnpm build`: passed. Windows sandbox subprocess/read limitations required supported-Node checks outside the sandbox; offline voice tools remain excluded from lint scope.
- `node scripts/verify-forest.mjs`: **22/22 groups passed**, **zero unexpected console/shader/network issues**. Covers automatic startup/deferred assets, real female/male media decoding and nonzero analyser output, scare impact, focus resume, animated joints/hand attachment, timeline/forms, mute/replay/skip, portrait/landscape, café handoff/resource cleanup, actual doorway traversal, street/beach checkpoints, teardown, returning/reduced-motion visits and deliberate missing-scenery recovery. Expected injected loader failures are recorded separately. The isolated browser closed in `finally`.
- Evidence: `verification.local/forest/report.json` and numbered PNGs. Forest walking/eyes/bat/foreground captures were visually reviewed. Browser sound was muted by project policy: analyser evidence proves decoded signal, not hardware listening or a subjective naturalness rating.
- Source/output audit: **39/39 SHA-256 records passed**; **35/35 deployed forest files match** the prepared runtime files. Scoped Prettier and `git diff --check` passed; the existing full-repository lockfile formatting limitation remains. The doorway capture shows the player beyond the clear exit.

**Next action:** review the audible voices/mix and acting with the user, then finish LW-F002 hardware audio, physical touch/gamepad, Firefox/Safari and representative frame-time/memory checks. Stylized supplied models remain stylized; no photorealistic or human-actor claim is made. Account integration and hospital continuation remain separate milestones.

### First-pass implementation record (superseded by the revision above)

### Original implemented work

- [x] Inspected bootstrap, scene replacement, controller/camera, rig calibration/animation, shared asset loading, local saves, tests and current story status. The brief's S003/S004 assumptions were outdated; S004 and its after-blackout ending remain intact.
- [x] Added an actual 3D forest to the existing AppBase, before gameplay construction. The initial Launch game gate remains; there is no second renderer/application and no new gameplay checkpoint or chapter.
- [x] Added a deterministic 35-second, six-phase timeline: darkness, unidentified figures, eyes, spatial bat scare, forest reveal, chain-hung signboard descent/settling. Visible Skip intro, Escape, replay, returning visits and reduced motion lead to the same interactive form.
- [x] Reused two calibrated Quaternius rigs and existing Halloween wordmark. Prepared compatible torch idle, crouch and startle clips plus speed-matched phone walking; the source torch uses the **left** arm. Phone and spotlight attach to that actual hand. Clips bind to existing paths without scaling bones or duplicating character geometry.
- [x] Added trees, rocks/bushes, uneven ground mounds, leaves, skulls, gravestones, lantern, pumpkins, webs, low mist, physical eye glints and bounded animated bats. Cold/desaturated moonlight contrasts with local orange light. Mist/lantern motion continues behind the settled form; reduced motion stays steady.
- [x] Added real HTML labels/inputs, autocomplete, password visibility, keyboard focus, status feedback, sign-in/account-creation boundary, touch-sized local entry and scrollable narrow/short layouts. No credentials, fake sessions, invented endpoints or browser secrets were added.
- [x] Kept **Continue locally** functional through the existing fresh café route; explicit checkpoint loading retains saved area/progress. No authentication backend exists: sign-in and account creation clearly report that accounts are not connected. A typed async adapter is ready for a real service.
- [x] Added opt-in TuneSeeker ambience, spatial synthesized footsteps and restrained generated tension cues. Muting, focus/background/zero-time pause and destruction release audio. Captions carry dialogue; blocked audio never prevents entry.
- [x] Added graceful scenery-load fallback, game-entry retry, resource/listener cleanup and restoration of ambient/fog settings. Fixed missing normals in procedural effects and enabled the shared gameplay camera's scene-color texture required by the existing Porsche lights.
- [x] Organized the supplied files under `asset-library/forest/originals/`, preserving their bytes and recording SHA-256 hashes. Added preparation, calibration/inspection, licenses and shipped credits. Runtime assets are separated under `public/assets/forest/`.
- [x] Updated architecture, README and continuation context. No pre-existing S004 work was reverted or committed.

### Assets and performance

| Item                                                           | Source/license                                           | Runtime use                                                          |
| -------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| Three tree variants, rock, bush                                | Supplied KayKit Forest Nature Pack; included CC0 license | Five self-contained GLBs; palette saturation reduced to 25%          |
| Pumpkin lantern, gravestone, lantern, cat skull                | Supplied Asset Quest Halloween Kit; included CC0 license | Four selected static FBX meshes converted to calibrated GLBs         |
| Forest ambience 05 (`802063`)                                  | Supplied TuneSeeker Freesound pack; included CC0 license | One looping WAV, loaded only after explicit sound activation         |
| Two unidentified figures                                       | Existing Quaternius patronBeard/patronLong rigs; CC0     | Shared existing geometry/materials                                   |
| Torch/crouch/startle/phone-walk tracks                         | Existing Quaternius Universal Animation Library; CC0     | One animation-only GLB; phone-arm tracks retimed to walking duration |
| Bats, webs, leaves, mounds, phone, signboard and cue synthesis | Project-created                                          | Bounded procedural meshes, DOM/CSS board and Web Audio               |
| Standalone fronbondi wind MP3                                  | No accompanying license record                           | Preserved only; not deployed                                         |

The **11 new runtime files total 5,603,376 bytes**. No runtime dependencies were added. Mobile uses 26 background trees, 12 bats and four mist volumes; desktop uses 42, 20 and seven respectively. Only desktop moonlight casts a 1024-pixel shadow map; pumpkin and phone lights do not cast shadows. Imported meshes/materials are reused between instances and entry-owned containers unload on handoff. Existing shared game preloading remains approximately 30.7 MB before entry; deferring unrelated city/beach assets is a later loading optimization. No representative-device frame budget is claimed.

References: supplied [PlayCanvas ESM scripts directory](https://github.com/playcanvas/engine/tree/main/scripts/esm), installed **2.23.3** script sources/declarations, existing project scene/animation/asset conventions. Main-branch APIs were not blindly copied into the installed version.

### Verification record — 2026-11-10

Environment: Windows, portable **Node 22.23.4**, pnpm **10.32.1**, PlayCanvas **2.23.3**, muted isolated headless **Chrome 156.0.8078.80**. Final production preview: `http://127.0.0.1:4180/`.

- `pnpm test` — **104/104 passed**, including four new tests for timeline phases/completion, skip equivalence/replay, pause/disposed callbacks and denied/preference storage isolation. Existing save/migration, street, beach and wave tests remain passing. The sandbox initially blocked Node test subprocesses; the unrestricted supported-Node run passed.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` — passed. Vite build/server subprocesses required running outside the Windows sandbox after `spawn EPERM`.
- `scripts/verify-forest.mjs` — **17/17 production browser groups passed**: launch/single-Engine gate; real rig-joint motion; actual hand attachment; full timeline/focus/checkpoint isolation; password/account boundary; explicit sound/mute; replay/scare skip; portrait/landscape; café handoff/resource release; street checkpoint; beach checkpoint; clean console/network; teardown; returning visit; reduced motion; blocked-asset fallback/local entry.
- **Zero unexpected console, shader or network issues** through normal, returning and reduced-motion routes. The separate deliberate fault-injection stage blocks forest GLB requests and records its expected loader/network diagnostics. Intentional canceled media requests during scene replacement are excluded from failure counts.
- Captured **16 final views**: all cinematic phases plus skipped state, mobile/landscape, café, street/beach checkpoints, reduced motion and fallback. Inspected captures for framing, form readability and clipping, scene visibility, eyes/bats and crouch. The isolated browser closes in the runner's `finally` block.
- Scoped Prettier and diff whitespace checks passed. Full-repository formatting retains the previously recorded `pnpm-lock.yaml` limitation. Reviewed the task-owned source and integration diff against the pre-existing S004 worktree.

Evidence: `verification.local/forest/report.json` and numbered PNGs, intentionally ignored by Git. The committed runner reads the checked-in Engine devtools hook. Original/output hashes and decoded inspections are in `asset-library/forest/`.

Asset audit: **15/15 source/output SHA-256 records** passed; all **11 deployed runtime files** match the prepared originals byte-for-byte.

Portable browser command after starting a muted isolated Chrome on CDP 9223 and a production preview:

```powershell
$env:GAME_URL = 'http://127.0.0.1:4180/'
node scripts/verify-forest.mjs
```

The runner clears only the forest-seen preference for its first-visit case, temporarily loads checkpoint fixtures, then restores the original checkpoint before teardown. Use an isolated browser profile; never run this against an active player's session.

### Original remaining work and manual route (historical)

- [x] Superseded: bundled licensed-model neural dialogue, cry, wings and impact are implemented in the current revision above.
- [ ] Verify audible mix, real phone/foot contact through full gait cycles, startle acting, low-end device frame time/memory, physical touch/gamepad and Firefox/Safari under LW-F002. Screen-reader/password-manager behavior is structurally supported but has not been certified with assistive technology.
- [ ] Re-run earlier complete evacuation suites with the new entry handled by the harness; this task rechecked café entry and street/beach checkpoint loading, not every previous 116-check wave/browser case. All repository wave/save regressions passed.

Current manual route: automatic forest → Play with sound or Watch muted → watch/Skip intro (or Escape) → Tab through labels/password toggle → confirm unavailable account feedback → Continue locally → Play story. Test P/Load for an existing checkpoint; return/reload should show the settled board, Replay should restart the prologue. Try reduced motion, denied storage, offline/missing forest models, portrait and short landscape, and blur/refocus with sound enabled. After belongings and movement/look practice, choose Head outside and walk through the doorway; the friend waits beside it. The canonical story still starts at the café and ends at the S004 blackout.

**Next action:** complete the audible/acting review and physical-device acceptance described in the current revision above. Keep LW-UI001 open for those manual checks. Account/backend work remains a separate persistent-backend milestone; hospital continuation remains a separate story task.

## LW-A004 — Supplied "New FIles" models, crowds, free flow and sign-in changes — 2026-11-10 (in progress)

- [x] All 37 unique supplied GLBs prepared into `public/assets/models/` (~40 MB) and placed. Licences are in `docs/ASSET_LICENSES.md`; credits were regenerated in `public/assets/credits.html`.
- [x] Street: 11 house/shop models, 45 walkers plus 10 road crossers, 6 refreshment kiosks, buses, pickups and patrol cars, carried model umbrellas, uniformed officer, patrol car and new ticket booth.
- [x] Beach: 240 m wide, sushi booth, set pieces and 561 additional people. The wave starts by itself 6 s after the third discovery, and its warning beats auto-advance.
- [x] Sign-in: **SIGN IN** button; the intro plays on every load, and skipping offers "Always skip / Just this time". The animated bat, headstone and graveyard extras are added.
- [x] `npx tsc --noEmit` passed; `pnpm test` 116/116 passed (Node 22.20.0).
- [ ] Lint/format, `pnpm build`, browser acceptance, performance, `verify-forest.mjs` update, commercial-build file exclusion and doc refreshes are still open.

Next action: follow `docs/LW-A004-HANDOFF.md` §4, steps 1–11.

### LW-A004 continuation review - 2026-11-12

- [x] Reviewed handoff against actual code; corrected the submit button from ENTER THE FOREST to SIGN IN. Preserved all incoming worktree changes; no commit made.
- [x] Node **22.23.4** / pnpm **10.32.1**: **116/116 tests**, TypeScript and ESLint passed. The initial sandbox EPERM failures were environment restrictions; the approved process-capable rerun passed.
- [x] Full production and commercial production builds passed. Added manifest-driven NC output exclusion to Vite. Added `scripts/verify-model-output.mjs`; full **37/37** and commercial **32/32** sizes/SHA-256 passed, with no extra files. Final commercial build includes the sign-in and crowd changes. The source models remain intact.
- [x] Updated forest runner for skip choice/persistence and catalogue-derived container count. Scare RMS samples multiple frames at the unchanged threshold; dialog clicks wait for their entrance animation. Performance capture leaves beach discoveries incomplete to prevent auto-wave interruption.
- [x] Baseline full production browser acceptance: **23/23 groups**, zero unexpected issues; injected missing-scenery errors recorded separately. Real keyboard doorway movement, street/beach checkpoint loading, forest teardown and preferences passed. Browser ran muted and closed in finally. Baseline report and performance are under `verification.local/forest/baseline-*.json`.
- [x] Baseline: all **561** additional rigs spawn, **350 visible / 54 animated**, **132.16 ms mean / 156.20 ms p95**, about **7.6 FPS**, **1,954 draw calls** at 1440 x 1000. Reduced visibility/animation ranges **92/34 -> 60/24 m**, retaining the full population. Repeat result follows below.
- [x] Refreshed ARCHITECTURE, AGENT_CONTEXT, AGENTS, assets README and handoff section 5 with ownership, policy, counts, reproduction and limitations. Source/output metadata reports **41,764,596 bytes** for the 37 added GLBs.
- [ ] Close-up moving calibration: bat heading, bus heading, seated/lying contact, carried umbrellas, vendor facing and lawns. Reviewed actual sign-in/arrival screenshots, which do not establish every calibration.
- [ ] Expanded crowd automatic warning/evacuation through blackout, recovery and collision acceptance. The forest suite's incomplete beach fixture intentionally does not trigger danger. Older S004 results are historical.
- [ ] Physical-device performance and lower-end browser memory. Headless frame measurements are observations, not target-device acceptance.
- [ ] Older version-5 positions newly blocked by kiosks/camps remain rejected; versions 1-4 keep their existing migration. Far-wing companion navigation beyond |x|=58 remains unverified. Static officer/no new vehicle wheel spin or drivers/straight-line extra-crowd evacuation remain documented limitations.

Reproduce with `docs/LW-A004-HANDOFF.md` section 5. **Next action:** finish targeted moving calibration and expanded-crowd wave acceptance, then decide the version-5 geometry migration and target-device population budget. Do not implement hospital scenes.

Tuned population measurement (first complete tuned pass): **561 spawned / 165 visible / 15 animated**, **87.67 ms mean / 117.40 ms p95**, about **11.4 FPS**, **1,791 draw calls**. A subsequent wave-smoke run measured **78.80 ms mean / 89.90 ms p95**, about **12.7 FPS**, **1,801 draw calls**. The visibility reduction helps this host but does not meet a 30/60 FPS budget. Preserve both samples; do not interpret host variation as a guaranteed improvement.

The expanded-crowd smoke passed automatic discovery-complete warning, automatic warning-to-evacuation, running crowd mode, and the recoverable blackout ending using teleported route gates. This is state integration evidence, not physical traversal/collision acceptance. A later teardown error in that run came from destroying the Engine during optional login GLB loading; the runner now drains registered pending assets before normal teardown. Destruction during in-flight loading remains uncertified. Full final rerun status follows below.

Change explanations and the verified control/data flow are in `docs/LW-A004-CONTINUATION.md`.

Final tuned full-build rerun: **26/26 browser groups passed**, **zero unexpected issues**, injected missing-scenery failures separated, isolated muted browser closed. Added state smoke verifies auto-warning, auto-evacuation and the recoverable ending with teleported gates. Latest measurement: **561 spawned / 165 visible / 15 animated**, **100.63 ms mean / 115.70 ms p95**, about **9.9 FPS**, **1,781 draw calls**. Final evidence: `verification.local/forest/report.json`, `beach-performance.json`, captures 18-21; preserved pre-smoke tuned evidence: `tuned-report.json` and `tuned-beach-performance.json`. The 79-101 ms tuned range confirms host variability; physical-device performance remains open.

Final scoped Prettier passed across src/tests/scripts/docs, credits/assets README, AGENTS and both configuration files; ESLint and TypeScript passed. Repository-wide `pnpm fmt` initially hit sandbox EPERM in ignored source tools; the approved read-capable rerun found the edited docs plus the existing `pnpm-lock.yaml` formatting issue. Edited docs were formatted afterward; the lockfile is unchanged. `git diff --check` passed. No commit was made. LW-A004 remains in progress for the explicitly unchecked calibration, physical traversal, performance and save-position limitations above.

## LW-A005 - Neighborhood, umbrella grip, Halloween and GitHub readiness - 2026-11-12

- [x] Fixed carried umbrellas: masked right-arm/finger holding layer from the existing compatible driving clip, finger grip anchoring, upright heading, canopy footprint 1.15 -> 1.5 m and visual offset -0.12 -> -0.08 m. Briefcases retain wrist attachment. Actual four-design views were inspected.
- [x] Added six near-route supplied-building placements (18 -> **24**). Modern/American houses immediately east of Tideline, Low-Poly Street House across the road, Small House at East Residences, House behind Tideline and Country/Old houses west of it make the supplied set visible during exploration. All nine house assets/two shop assets remain used. Lugin/Stoll is an authored cutaway pair, retained at Marina Homes rather than promoted onto the main approach.
- [x] Added **four walk-in restaurants** with shared shell/furniture collision data, open 2.8 m doors, three tables/six chairs each, cups, plants, counters/coffee machines, pendant lights, exterior OPEN/title signs and interior menus. They replace existing solid facades; no new map loading, quest, transaction or story scene is introduced. The existing city footprint is sufficient; route/admission/beach coordinates are unchanged.
- [x] Confirmed with the user: Halloween enhancement targets the **forest sign-in entrance**. Desktop now has **34 pumpkins / four skeletons / seven imported and six procedural cobwebs**, plus warmer glow pools/denser mist. Fewer extra pumpkins on mobile; existing reduced-motion controls remain. Actual sign-in capture was inspected.
- [x] Fixed fast local entry: optional forest loading is sequenced before game asset loading, avoiding an installed Engine AssetListLoader shared-handler cleanup overlap observed during cold-entry verification. The cinematic remains non-blocking on optional scenery.
- [x] Re-read **11/11 original house/shop GLBs**, verified original SHA-256 against the manifest and embedded **CC BY 4.0** author/title/source records. Existing credits are retained. Live Sketchfab model/API access was 403/inaccessible, so this is a preserved-download metadata/hash verification, not a fresh online ownership certification. Exact sources remain in ASSET_LICENSES.
- [x] Expanded `.gitignore` for temporary builds, evidence and incoming/download/temp directories; kept prepared runtime public assets versioned. No currently tracked file matches the ignore list. Largest eligible file **8,768,292 bytes**; largest reachable historical blob **18,681,569 bytes**; none reach GitHub's 50 MiB warning or 100 MiB block threshold. Existing ignored originals remain on disk. No history rewrite/commit/push performed.
- [x] Expanded formatting exclusions for preserved offline libraries/generated evidence. The pnpm-generated lockfile is excluded from Prettier to prevent a roughly 8,700-line formatting-only rewrite; an attempted format was semantically compared with PyYAML, then restored byte-for-byte. Dependency data/lockfile are unchanged.
- [x] Supported **Node 22.23.4 / pnpm 10.32.1**: **117/117 tests passed**, including clear restaurant doorway/aisle and solid wall/furniture probes. ESLint and TypeScript passed. Full and commercial production builds passed; output filename/size/SHA-256 audits passed **37 full / 32 commercial** models.
- [x] Furnished production neighborhood browser pass: **8/8 groups**, zero unexpected issues, muted isolated Chrome closed. Real W/S keyboard entry AND exit passed for Sunrise Bakehouse, Salt & Citrus, Harbor Noodles and Marigold Kitchen. Across **72 samples / 18 walking phases / four umbrella designs**, grip tracking error was zero and sampled canopy clearance above the estimated head crown was at least **0.192 m**; non-root leg joints moved. Near-route home instances and rendered captures were checked. Final placement-only rebuild refresh is recorded below.

Evidence: `verification.local/neighborhood/report.json`, `measurements.json`, `walking-clearance.json`, entrance/grip/front/restaurant interior/house/route PNGs; `verification.local/house-license-audit.json`. Source walkthrough, changes and reproduction: `docs/LW-A005-HANDOFF.md`. GitHub staging/push instructions and size/history review: `docs/GITHUB_PUSH.md`. Architecture, agent context, root instructions, README and asset notes were refreshed.

Limits: targeted browser testing uses staged pedestrian positions and hides traffic for controlled doorway/umbrella measurements; it does not certify every live traffic/NPC encounter, device or screen size. Restaurant door traversal uses real input/physics, with teleport only to each test's exterior starting point. Restaurants are furnished exploration spaces, with no new serving/purchase/NPC dialogue system. Existing beach performance/expanded-wave physical collision, static officer/supplied wheel-driver limits and prior A004 version-5 camp/kiosk conflicts remain open. Destruction during in-flight GLB parsing is not certified. No hospital content was added.

Next action: review/stage the documented changes for GitHub, then continue LW-A004/LW-F002 performance and physical-device acceptance. Do not ignore required runtime GLBs or rewrite history merely to reduce local `.git` size.

LW-A005 final release refresh: final Small House approach placement/sign attachment build passed **8/8 neighborhood browser groups** again, with zero unexpected issues and browser closure. Full and commercial builds/output audits passed **37/32** models. Final ESLint, TypeScript and **repository-wide `pnpm fmt` passed** (read-capable execution; pnpm-generated lockfile is intentionally excluded). `git -c core.autocrlf=false diff --check` passed; the lockfile has no diff. No tracked ignored files were found. Reviewed final forest, lit restaurant/menu/sign, umbrella and house-route captures. All verification servers started for this task were stopped after checking; the working tree is ready for user staging/review on branch `main`, with no commit or push performed.

## LW-S005 - Continuous evacuation and living beach

- [x] Start warning automatically after three unpaused seconds once all three discoveries complete; remove Next/Skip from warning and fall/blackout. Preserve player-controlled running and existing focus/modal pause safeguards.
- [x] Add continuous curved stroller motion/acceleration, moving-character animation, game-clock ball release, shared wave/tide buoyancy and traveling foam.
- [x] Add two mounted animated horses, two quad bikes with riders/rotating wheels and two offshore fast boats, including game pause and warning escape behavior.
- [x] Record four CC0 prepared assets, source/output hashes, original adaptations, in-game credits and reproducible offline preparation. Keep runtime assets versioned and raw/evidence/build outputs ignored.
- [x] Verification: 120/120 tests, lint, typecheck, full/commercial production builds; model output audits 37/32 plus four CC0 activity assets each. Focused production browser: **7/7 groups passed, zero runtime/network issues**, with six rider views inspected. Report/captures: `verification.local/beach-life/`. Headless rendering sample: **196.765 ms mean (~5.08 fps), 1,718 draw calls**, simulation frozen; smooth target-device play remains unresolved.

See [LW-S005-HANDOFF](LW-S005-HANDOFF.md) for exact ownership, before/after behavior, reproduction and limitations. Full forest suite was updated but not repeated. Hardware performance and physical-device acceptance remain open; no hospital continuation or Git push is included.
