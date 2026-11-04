# Last Wave — Task tracker

Last updated: **2026-11-04**. Current milestone: **gameplay foundation**.

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
- Existing worktree items on entry included the project-specific `AGENTS.md`, React additions in `package.json`/`pnpm-lock.yaml`, and both original design DOCX files. This task added no dependencies. Foundation changes are uncommitted.

### Limitations

- Physical mobile devices, physical gamepads, and Firefox/Safari have not been tested. Touch automation covered movement and interaction; right-drag look, farther-drag sprint, and double-tap jump still need hardware acceptance. Hardware performance budgets are unmeasured.
- Application teardown was invoked directly; the Vite HMR trigger and startup-error display were code-reviewed rather than fault-injected.
- Commands ran with Node **22.20.0** and pnpm **10.32.1**. pnpm warns because the project declares Node **≥22.23.2**; build/lint/type-check nevertheless passed. Use the declared Node version for the next verification run.
- Repository-wide formatting/whitespace checks retain the pre-existing `AGENTS.md` and lockfile findings recorded above.

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
- Interaction rules: `src/systems/InteractionSystem.ts`; DOM presentation: `src/ui/GameHud.ts` and `src/ui/game.css`.
- A scene reset is the reference teardown path. Recheck it whenever adding scripts, callbacks, materials, or assets.
- Next concrete action: run the acceptance route on a physical touch device and record its OS/browser, gesture results, and frame-time observations under LW-F002.

## LW-F002 — Hardware acceptance

Status: **Ready**. Owner: **Next contributor**. Dependency: **LW-F001**.

- [ ] Repeat build, lint, and type-check using Node ≥22.23.2.
- [ ] Run the acceptance route on physical desktop/mobile browsers; verify touch look, sprint, jump, and interaction.
- [ ] Check the preserved gamepad mappings and representative-device performance.
- [ ] Record device/browser versions, outcomes, and any concrete follow-up fixes here.

## Deferred backlog

Episode scenes, dialogue, quests, inventory, cutscenes, save/load, Colyseus, and persistence are future tasks. Their folders/expected filenames are recorded in [ARCHITECTURE.md](ARCHITECTURE.md); they have no runtime implementation yet.

## Completion protocol

After each task, record its ID, owner, status, files/decisions, exact verification commands and outcomes, outstanding limitations, and the next concrete action here. Update architecture for changed ownership/contracts. Keep narrative changes in the design references. Mark unchecked behavior explicitly so the next contributor can continue immediately.
