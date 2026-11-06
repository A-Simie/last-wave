# Last Wave — Task tracker

Last updated: **2026-11-06**. Latest completed task: **LW-A003 — Cinematic Tideline café and animated cast**, including the open street, reporter, four fans, and Halloween branding. Final acceptance is recorded below. Hardware acceptance remains under **LW-F002**; the requested story continuation is retained in **LW-S002–LW-S004**. Earlier task records retain their original verification environments.

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
- [ ] Guided street and beach entry — instructional modals, pedestrian directions, large entrance, officer directions, tickets, queue, and black loading under LW-S002.
- [ ] Beach exploration — both characters, white sand, umbrellas, loungers, beachgoers/swimwear, swimmers, and chilled drinks under LW-S003.
- [ ] Wave and evacuation — retreat, fleeing birds, pointing crowds, wave reveal, panic, fall, blinking blackout, and black loading under LW-S004.
- [ ] Hospital awakening and investigation.
- [ ] Hospital escape puzzle.
- [ ] Kiroween City quests.
- [ ] Episode-ending transmission.

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

Use the current LW-A003 manual route for the furnished café, reporter, open street, and retained checkpoint. Prepend the portable Node directory documented there to PATH; the workspace's default Node installation has not been upgraded.

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
- The current opening quest still finishes at the doorway. The street population is ambient; the requested instructional, pedestrian-direction, admission, beach, and disaster progression remains pending below.

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

Owner: **Game/story engineering**. Priority: **P1**. Dependency: **LW-A003**. Status: **Pending; not implemented**.

- [ ] After collecting belongings, show short movement/look/interaction instructional modals with appropriate keyboard/touch instructions and successful-input handoff.
- [ ] Add reusable pedestrian conversations for asking beach directions; make the route legible and keep the friend accompanying the player.
- [ ] Build a large, recognizable beach entrance and a cinematic officer conversation pointing out the ticket booth and entrance queue.
- [ ] Add the requested ticket-purchase interaction and joining the queue. Prerequisites are ordered, purchases cannot duplicate on repeated input, and admission remains attainable without a grind/softlock.
- [ ] Transition through a black branded loading screen and stage/validate the replacement before committing it. Preserve belongings and progress, recover on load failure, and place both characters at a safe beach-arrival checkpoint.
- [ ] Extend versioned save validation/migration for the introduced state/scene boundary. Exercise early/repeated/stale actions, replay, every modal/input handoff, reset/load/rollback, and resource cleanup.

This user-requested admission/tutorial sequence extends the source draft's direct café-to-beach handoff and supersedes its earlier no-mandatory-purchase wording for the entry beat. `docs/EPISODE_01.md` records the amendment. The existing signal-box tutorial is independent and does not satisfy these requested street instructions.

**Next implementation step:** author the ordered tutorial/directions/admission state and stable interaction IDs, then integrate the first instructional handoff after belongings pickup using the existing quest/dialogue/modal boundaries.

## LW-S003 — Populated white-sand beach

Owner: **Environment/story engineering**. Priority: **P1**. Dependency: **LW-S002**. Status: **Pending; not implemented**.

- [ ] Bring both characters through the arrival fade onto a populated white-sand beach.
- [ ] Dress it with umbrellas, loungers, people in swimwear, swimmers, and chilled drinks. Use licensed assets or calibrated placeholders and preserve the ordinary relaxed social interval.
- [ ] Add ambient beach activity/sound and readable guidance for exploration and the next authored story beat.
- [ ] Verify arrival/save restoration, crowd/prop grounding and collision, mobile layout/performance, and scene/media cleanup.

**Next implementation step:** build the beach arrival composition and companion placement against the validated scene/checkpoint contract from LW-S002.

## LW-S004 — Wave, panic, and blackout

Owner: **Gameplay/cinematic engineering**. Priority: **P1**. Dependency: **LW-S003**. Status: **Pending; not implemented**.

- [ ] Guide attention through **retreating water → fleeing birds → pointing crowds → a large approaching wave**, using clear prompts and authored camera beats.
- [ ] Add escalating environmental sound, crowd reactions, camera movement, and a clear evacuation route to higher ground; keep the source's danger cue and fictional-anomaly continuity.
- [ ] Stage crowd panic, the friend's separation, the player's fall, a lowered viewpoint, blinking eyelids closing, and **another black loading screen** at the end of consciousness.
- [ ] Coordinate animation, wave/water effects, crowd movement, sound and camera timing for believable tension. Carry captions/mute and steady/reduced-motion preferences through every beat.
- [ ] Define recoverable pre-event/post-blackout checkpoints; test ordered triggers, retry/replay, pause/visibility changes, input restoration, and complete resource teardown. The hospital remains the next separate story scene.

**Next implementation step:** define and verify the warning/evacuation/blackout state sequence before layering the water, crowd, camera, eyelid, and audio presentation.

## Deferred backlog

The unchecked roadmap items remain future work. Their module boundaries are recorded in [ARCHITECTURE.md](ARCHITECTURE.md). The current playable scene and checkpoint destination are the foundation area, including the cinematic café and open street. The complete requested tutorial/admission/beach/disaster continuation is retained in LW-S002–LW-S004 above; hospital, Kiroween City, multiplayer, and backend work follow their own milestones.

## Completion protocol

After each task, record its ID, owner, status, files/decisions, exact verification commands and outcomes, outstanding limitations, and the next concrete action here. Update architecture for changed ownership/contracts. Keep narrative changes in the design references. Mark unchecked behavior explicitly so the next contributor can continue immediately.
