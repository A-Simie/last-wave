# Last Wave — Task tracker

Last updated: **2026-11-04**. Latest completed milestone: **LW-C002 — quest tracking**. Next implementation: **LW-C003 — inventory and clue journal**.

## Project checklist

Checked items have working implementations and verification recorded below. Physical-device acceptance is tracked separately in LW-F002.

### Project foundation

- [x] Install Node.js and pnpm — installed; Node version alignment remains in LW-F002.
- [x] Generate the PlayCanvas third-person starter.
- [x] Verify build and browser preview.
- [x] Set up Git and `AGENTS.md`.
- [x] Create basic test environment.

### Core game systems

- [x] Player movement and camera.
- [x] Interactions.
- [x] NPC dialogue — reusable branching guide conversation, verified in LW-C001.
- [x] Quest tracking — data-driven guide/signal-box quest, verified in LW-C002.
- [ ] Inventory and clue journal — follows quest tracking, LW-C003.
- [ ] Scene transition and save system.

### Episode 1 — Story

- [ ] Coffee shop and TV broadcast.
- [ ] Beach exploration.
- [ ] Wave and evacuation.
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
- Interaction rules: `src/systems/InteractionSystem.ts`; conversations: `src/systems/DialogueSystem.ts` and `src/data/dialogues.ts`; quest rules/data: `src/systems/QuestSystem.ts` and `src/data/quests.ts`; DOM presentation: `src/ui/`.
- A scene reset is the reference teardown path. Recheck it whenever adding scripts, callbacks, materials, or assets.
- LW-C002 is complete: a data-driven quest using the guide and signal box. Next implementation: LW-C003, inventory and clue journal. Physical touch-device acceptance can proceed under LW-F002; record OS/browser, gesture results, and frame-time observations there.

## LW-F002 — Hardware acceptance

Status: **Ready**. Owner: **Next contributor**. Dependency: **LW-F001**.

- [ ] Repeat build, lint, and type-check using Node ≥22.23.2.
- [ ] Run the acceptance route on physical desktop/mobile browsers; verify touch look, sprint, jump, and interaction.
- [ ] Check the preserved gamepad mappings and representative-device performance.
- [ ] Record device/browser versions, outcomes, and any concrete follow-up fixes here.

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

- Progress is scene-local and resets on reset/reload. Persistent saves remain the scene-transition/save roadmap task.
- Physical devices, gamepads, Firefox/Safari, and hardware performance acceptance remain in LW-F002. Commands still use Node 22.20.0 against the declared ≥22.23.2 minimum; version alignment remains open.
- Next implementation: LW-C003, inventory and clue journal in the existing test area.

## LW-C003 — Inventory and clue journal

Status: **Ready — next implementation**. Owner: **Next contributor**. Priority: **P1**. Dependency: **LW-C002 (complete)**.

Next concrete action: add one collectible clue associated with the existing signal box, with a journal view and duplicate-pickup protection.

- [ ] Define typed item/clue data and scene-owned inventory/journal state.
- [ ] Connect a validated interaction to one unique clue acquisition.
- [ ] Present acquired clues and their readable details through the UI boundary.
- [ ] Preserve movement/dialogue input handoff and clear inventory/journal state on scene reset.
- [ ] Verify pickup, duplicate events, journal opening/closing, reset, and desktop/touch behavior; update task evidence and architecture.

## Deferred backlog

The unchecked roadmap items remain future work. Their module boundaries are recorded in [ARCHITECTURE.md](ARCHITECTURE.md). Inventory and clue journal follow quest tracking; the current playable scene remains the foundation test area.

## Completion protocol

After each task, record its ID, owner, status, files/decisions, exact verification commands and outcomes, outstanding limitations, and the next concrete action here. Update architecture for changed ownership/contracts. Keep narrative changes in the design references. Mark unchecked behavior explicitly so the next contributor can continue immediately.
