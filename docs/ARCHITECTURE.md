# Last Wave — Architecture

Updated **2026-11-08**. Runtime: **PlayCanvas 2.23.3 + TypeScript + Vite + pnpm**. Current milestone: **LW-S003 — Beach exploration**.

## Current structure

```text
last-wave/
├── asset-library/                   # Preserved originals, source manifests, calibration and media records
├── public/
│   ├── ammo/                         # Starter physics runtime, license, source hashes
│   └── assets/
│       ├── characters/              # Nine café rigs (ten clips) and four swimwear rigs (seven clips)
│       ├── animations/
│       ├── environments/
│       ├── props/tideline/          # 28 prepared, licensed prop GLBs
│       ├── credits.html             # Shipped art and media attribution
│       ├── audio/                   # Original café music and surf/gull ambience
│       ├── video/                   # Elizabeth Lee / VOA report, poster and captions
│       ├── last-wave-logo.svg / pumpkin-icon.svg # Halloween wordmark and favicon
│       └── textures/
├── src/
│   ├── core/
│   │   ├── Game.ts                   # Native AppBase bootstrap, background/input/UI coordination, teardown
│   │   ├── SceneManager.ts           # Stages and commits scene-root replacement
│   │   └── AssetManager.ts           # Ammo and registry-backed prop/character preload
│   ├── player/
│   │   ├── PlayerController.ts       # Stock controller adapter and ledge probes
│   │   ├── PlayerAnimation.ts        # Velocity-driven imported locomotion clips
│   │   ├── AnimatedCharacter.ts      # Path-compatible clips on the modern anim component
│   │   ├── CompanionController.ts    # Solid companion, departure, routing, waiting and yielding
│   │   ├── CompanionRoute.ts         # Engine-independent route projection and restoration
│   │   ├── ControlPractice.ts        # Actual movement/look input and successful lesson handoff
│   │   ├── CameraController.ts       # Camera creation and follow/orbit settings
│   │   └── CharacterModel.ts         # Shared unscaled character collider
│   ├── systems/
│   │   ├── InteractionSystem.ts      # Proximity, sightline, action, timed message state
│   │   ├── DialogueSystem.ts         # Authored conversation state and validated choices
│   │   ├── CutsceneSystem.ts         # Reader-paced beats, skip and completion boundary
│   │   ├── QuestSystem.ts            # Ordered quests and free-order discoveries
│   │   ├── InventorySystem.ts        # Unique collected items and copied snapshots
│   │   └── SaveSystem.ts             # Versioned checkpoint validation and storage I/O
│   ├── scenes/
│   │   ├── FoundationScene.ts        # Tideline or beach-arrival composition, systems and snapshots
│   │   ├── FoundationState.ts        # Engine-independent scene snapshot and validation
│   │   ├── primitives.ts             # Shared materials and unscaled static boxes
│   │   ├── createModelInstance.ts    # Calibrated, shared-container visual instances
│   │   ├── ScreenProjection.ts       # Active-camera world-to-screen anchors
│   │   ├── createCanvasPanel.ts      # Owned, redrawable canvas texture/material
│   │   └── createTextSign.ts          # Static canvas-texture signs
│   ├── episodes/episode-01/
│   │   ├── opening.ts                # Source-based opening, conversations, bag, quest
│   │   ├── openingLayout.ts          # Story station geometry, route and camera shots
│   │   ├── cafeLayout.ts             # Measured furniture solids and support heights
│   │   ├── CafeDressing.ts           # Imported props, patrons, four fans, tiles, signs and lighting
│   │   ├── CafeArtwork.ts            # Illustrated wall/window panels
│   │   ├── CafeSurroundings.ts       # Open avenue, shops/houses, shared solids and static batching
│   │   ├── StreetLife.ts             # Pedestrians, carried props, traffic, drivers and dynamic batching
│   │   ├── CafeTelevision.ts         # Canvas-backed TV footage and captions
│   │   ├── OpeningPrototype.ts       # Composition inside the foundation scene
│   │   ├── OpeningActors.ts          # Seated cast, companion handoff, fans and pause rules
│   │   ├── OpeningCamera.ts          # TV move, speaker shots and steady-camera option
│   │   ├── OpeningMedia.ts           # User-gesture playback, music, captions, retry and cleanup
│   │   ├── opening{Audio,Broadcast}.json # Runtime filenames, durations and cues
│   │   ├── entry.ts / entryLayout.ts # Lessons, directions, admission, route, shots and shared solids
│   │   ├── StreetEntryProgress.ts    # Ordered lessons/admission and protected-pass prerequisites
│   │   ├── StreetEntry.ts            # Pedestrian/officer/booth/queue interactions and navigation
│   │   ├── EntryActors.ts / EntryCamera.ts # Officer/queue presentation and shared cinematic rules
│   │   ├── BeachEntrance.ts          # Owned entrance plaza, booth and queue
│   │   ├── BeachArrival.ts           # Beach composition, interactions, following and pause coordination
│   │   ├── beach.ts / beachLayout.ts # Free-order discoveries and shared solid footprints
│   │   ├── BeachDressing.ts          # Sand, boardwalk, umbrellas, loungers and citrus cart
│   │   ├── BeachLife.ts              # Beachgoers, yielding walkers and animated swimmers
│   │   ├── BeachNavigation.ts        # Static-grid routes with moving-walker clearance
│   │   ├── BeachWater.ts             # Reusable calm-water/foam meshes and swimmer height function
│   │   └── BeachAudio.ts / beachAudio.json # Scene-owned surf/gull playback, pause and retry
│   ├── ui/
│   │   ├── GameHud.ts
│   │   ├── DialoguePanel.ts
│   │   ├── JournalPanel.ts
│   │   ├── CheckpointPanel.ts
│   │   ├── CutscenePanel.ts
│   │   ├── TutorialPanel.ts
│   │   ├── TransitionPanel.ts
│   │   └── game.css
│   ├── data/
│   │   ├── foundation.ts             # Layout and interaction definitions
│   │   ├── cafeModels.ts             # Per-asset vertex bounds, scale, pivot and facing
│   │   ├── characterModels.ts        # Rig calibration, clip catalogs and animated support heights
│   │   ├── modelTuning.ts            # Shared uniform calibration calculations
│   │   ├── dialogues.ts              # Progress-aware guide conversations
│   │   ├── quests.ts                 # Authored objectives and completion events
│   │   └── items.ts                  # Authored clue IDs, titles, sources, and text
│   ├── networking/                  # Reserved, with a scope README
│   ├── assets/playcanvas.png         # Starter favicon
│   ├── inspector.ts / inspector.css # Development-only inspector integration
│   ├── scripts.d.ts                 # Used public fields of the shipped ESM controller
│   ├── vite-env.d.ts
│   └── main.ts                      # Explicit lazy launch, startup retry, HMR disposal
├── docs/
│   ├── GAME_DESIGN.md
│   ├── EPISODE_01.md
│   ├── ARCHITECTURE.md
│   ├── TASKS.md
│   ├── AGENT_CONTEXT.md
│   └── *.docx                       # Original design sources
├── AGENTS.md / CLAUDE.md
├── scripts/                         # Offline model, clothing/face, audio and video preparation
├── tests/
│   ├── dialogue.test.mjs              # Dialogue transitions, events, and graph validation
│   ├── cutscene.test.mjs              # Source flow, skip/replay, stale input and cancellation
│   ├── quest.test.mjs                 # Quest rules and authored dialogue integration
│   ├── inventory.test.mjs             # Acquisition, snapshots, restoration, teardown
│   ├── save.test.mjs                  # Checkpoint schema, positions, storage failures
│   ├── street-entry.test.mjs          # Ordered lessons/admission, protected passes and migration
│   ├── companion-route.test.mjs       # Corner progress and continuous static-route clearance
│   ├── beach.test.mjs                 # Free-order progress, v4 migration and beach navigation
│   └── scene-manager.test.mjs         # Staging, rollback, reentrancy, destruction
├── package.json / pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

## Lifecycle and ownership

`index.html → main.ts → Launch game → import Game.ts → createGame(canvas) → loadPhysics() → AppBase.init() → loadGameAssets() → app.start() → SceneManager.load()`.

- `main.ts` initially loads only launcher code and CSS. The inert canvas has no graphics context, Engine, physics, scene assets or media until the launch button is activated. Duplicate launches are ignored; failed startup exposes **Retry launch**. Development imports the Inspector after launch and before app registration; Vite no longer injects its eager entry script. Production omits it. Module disposal unregisters the launcher and destroys a started app, including one that finishes loading after disposal.
- `createGame` returns the actual `AppBase`; there is no second game loop or wrapper application lifecycle.
- The original minimal render/camera/light/script/collision/rigid-body component systems plus `AnimComponentSystem` are registered. `AppOptions.batchManager = BatchManager` enables native Engine batching. `Keyboard` is opt-in for E, J, and P; the shipped controller owns its own keyboard/mouse, touch, and gamepad sources.
- `ContainerHandler` and `TextureHandler` load 28 props and 13 character containers through one `AssetListLoader` before the first scene is built. User actions, including restart, wait for the initial scene. Failed loads reach the startup error boundary and dispose the app; the loader releases its listeners on success/failure. The app registry owns shared imported meshes, materials, textures and animation tracks until `app.destroy()`; scene replacement destroys instances. Scene builders remain synchronous.
- `SceneManager.load(name, build)` attaches an unscaled, disabled candidate root and invokes a synchronous builder while retaining the current scene. Successful construction disables the old root, activates the candidate, and destroys the old root. Construction/activation failure destroys the candidate and restores the old root's enabled state. Nested transitions are rejected; destruction is idempotent and permanently prevents later loads. The builder must register owned cleanup as it allocates resources.
- The foundation builder receives preloaded `GameAssets` (`cafe` and `characters`) and an optional validated `FoundationSnapshot`. Its `area` selects the complete Tideline café/street/entrance or the populated beach. It returns interaction, dialogue, independent signal quest, inventory, entry progress, a shared cutscene model, optional opening/beach compositions, presentation/update/navigation, controls and snapshot/anchor accessors. All four quests and inventory restore before activation/UI binding; player position precedes rigid-body creation. Startup/restart use fresh Tideline defaults; Load uses the same builder with saved state. The beach quest exists in both areas but only admitted beach dialogue can advance it.
- Scene roots own all entities. The foundation root releases its shared procedural materials on destruction. Engine Script destruction releases the stock controller's input sources.
- The application owns HUD and six modal surfaces: dialogue, journal, checkpoint, cutscene, tutorial and transition. It coordinates their actions, E/J/P keys, resize and one presentation update callback. Scene replacement closes conversations/journal, cancels cinematics without completion and suspends input; the current reference changes only on success. Failed resets/loads retain the current area and show feedback. `syncControls()` also gates pending lessons before their modal opens. The companion pauses with gameplay; seated cast and street life animate during opening presentation, and entrance actors animate during their own cinematics. `app.destroy()` disconnects callbacks, destroys scene-owned state/media, and removes all seven UI surfaces/listeners; `main.ts` uses that path on Vite module disposal.
- `Game.ts` observes document visibility and window focus. On background entry it saves `timeScale`, `autoRender`, and `renderNextFrame`, sets zero time and disables rendering, suspends controls/interactions, and skips its presentation/arrival updates. Returning restores those exact Engine settings and recomputes the existing modal locks. This retains developer pause/slow-motion and scene resources for resumption. The Engine loop remains native; background suspension does not unload its asset registry. Destruction removes all activity listeners.
- Physics uses the starter's local Ammo runtime and loads before app/rigid-body creation. In this AppBase setup, `app.start()` installs the Ammo physics world, so it must run before building scene colliders/bodies. Loading failures reach the startup error display. URLs respect Vite's relative base path.

## Player, animation, and camera

**Decision: adapt the official controller rather than fork its algorithms.** `PlayerController.ts` imports `ThirdPersonController` from `playcanvas/scripts/esm/third-person-controller.mjs`. It retains WASD/arrow movement, Shift sprinting, Space jump, mouse orbit, wheel zoom, and the original touch/gamepad mappings.

The upstream script integrates camera-relative movement and camera positioning in one update. Our camera entity and tuning live in `CameraController.ts`; the player adapter applies those settings to the upstream script. This separates project configuration without duplicating its coupled input/physics/orbit implementation.

- Ground speed parameter: 60; sprint multiplier: 1.5; jump impulse: 520; body mass: 70; gravity: `(0, -18, 0)`. `speedGround` is the controller's acceleration-style parameter, not a direct m/s cap.
- Camera distance: 5 m; target height: 0.5 m above the player's pivot; initial pitch: 15°; FOV: 55°. Position/look-at damping is 0.97 (fraction retained per millisecond) for smooth follow. Upstream orbit sensitivity, collision padding/damping, pitch limits, and zoom behavior remain in the shipped implementation.
- Camera construction aims the default view at the current player position, including restored positions, so the backdrop is correct while the checkpoint menu suspends controller updates. Loads create a resting body and a fresh default camera; normal controller updates resume after closing the menu.
- `framePlayerCamera` shares default framing between scene creation and first play. `OpeningCamera` drives launch/TV/speaker shots; `EntryCamera` drives officer/booth/line/friend/admission shots. Both are input-free, ease authored framing and widen portrait FOV. **Steady camera** snaps to shots and initializes from reduced-motion preference. The scene's `present` method selects exactly one camera, and one scene-owned `CutsceneSystem` prevents overlapping sequences. The original third-person controller owns gameplay orbit, damping and zoom.
- `AnimatedCharacter` instantiates the calibrated hierarchy, adds the modern `anim` component on the imported root, and assigns the model's path-compatible clip catalog: ten café poses or seven beach poses. Typed `play(pose, blend)` rejects unsupported poses; construction rejects missing tracks and releases its partial hierarchy. Sit-down/stand-up clips are non-looping; other poses loop. Shared tracks belong to the registry, instance state belongs to the scene. Offline preparation preserves bone lengths and matches source animation paths; runtime does not retarget.
- `PlayerAnimation` selects jump when |vertical velocity| >1.5 m/s, sprint above 6 m/s, jog above 2 m/s, walk above 0.12 m/s, otherwise idle. Jog playback speed is clamped to 0.75–1.4×. `EntryActors` stages player facing and keeps its idle joints animated while cinematic controls are disabled. `CharacterModel` supplies only the shared collider. Tideline has 26 rig instances: the previous 21 café/street rigs plus officer, ticket attendant and three queue patrons. Beach exploration has 14: the two friends, five stationary beachgoers, an attendant, two walkers and four swimmers.
- `setPlayerControlsEnabled` toggles the stock controller's public `enabled` property. Modal UI and transitions disable movement and orbit updates, zero horizontal velocity, and preserve vertical physics. Closing the modal re-enables the controller. The application time scale is unaffected.

**Compatibility constraint:** the starter corrects ledge grounding by replacing the controller's internal `_grounded` property with nine downward probes. There is no public ground-query hook in 2.23.3. That one existing compatibility shim is isolated in `PlayerController.ts`. On any PlayCanvas upgrade, inspect the shipped script and re-test jumps on a ledge and above foliage before accepting the upgrade. `src/scripts.d.ts` declares only public fields this project configures.

## Physics and scene composition

- Coordinates use meters, +Y up, with camera forward along -Z. The ground surface is at Y=0.
- Physical roots keep unit scale. Collider dimensions are explicit; scaled primitive visuals are children. Positions/heading are applied before creating static rigid bodies.
- The player/NPC box has half extents `(0.4, 1.2, 0.4)` and local collision offset `(0, 0.2, 0)`. `CHARACTER_COLLISION` in `data/foundation.ts` shares these dimensions with checkpoint validation. Its bottom is 1 m below its pivot, inside the 1.1 m ground probes. The box preserves stable ledge standing from the starter.
- The **200×180 m** ground at `[5, -0.1, 14]` supports an open Seafront Avenue, a side street, sidewalks, crosswalk, 15 neighboring shops/houses, four palm planters, the café shell/furniture, guide, and signal box. The enclosure and test-course markers have been replaced by the neighborhood. The controller and isolated ledge compatibility shim remain preserved.
- `cafeLayout.ts` owns calibrated support heights and furniture/shell boxes; `openingLayout.ts` adds table, TV, and counter for **24 opening solids**. `data/foundation.ts` owns ground, buildings, planters, guide at `[-1.1, 1, -5.5]`, and box at `[-1.1, 0.6, -3.5]`. `entryLayout.ts` adds 14 entrance solids and a separate arrival ground/four rails. `beachLayout.ts` adds cart, loungers, umbrella poles, sign posts and stationary people. Tideline has **79 rigid bodies**: 60 static, one player and 18 kinematic actors. The beach has **31**: 27 static, one player and three kinematic actors. Physical roots have unit scale; the appropriate area's authored footprints validate its checkpoints.
- One directional shadow-casting light with 1024-pixel shadow maps illuminates both areas, at intensity **2.5 in Tideline / 1.7 on the beach**. Five unshadowed warm pendant lights and an unshadowed window fill supplement the café. Shared StandardMaterials use neutral tone mapping. Cool ambient light fills faces and vehicle cabins; linear fog blends the horizon from 45–85 m. Device pixel ratio remains at the starter's 1× default. Hardware frame budgets still require device testing.

### Street population and batching

- `CafeSurroundings` owns the static neighborhood, its procedural materials/sign textures, and the `seafront-static` batch group (28 m maximum AABB). Its root owns the `seafront-life` child created by `createStreetLife`.
- `StreetLife` owns eight walking rigs on rectangular sidewalk routes, including two `commuterSuit` instances. Three sun umbrellas and two briefcases follow right-hand world positions in `postUpdate`; their upright heading follows the walker. Animated soles, canopy/head clearance, and carry height are calibrated against decoded, skinned vertices.
- Four kinematic cars move in two lanes at 4.8/5.2 m/s. Their 0.31 m-radius wheels rotate around fixed local axles according to travelled distance. Two calibrated seated rigs ride inside the cabins. Transparent windows retain individual sorting and disable depth writes.
- Walkers pause for the player or another person ahead; cars yield to the player and queue behind same-lane traffic. Vehicle wrapping between X=-84 and X=94 checks destination occupancy. Motion caps a long-frame step at 0.1 seconds. Kinematic colliders follow actor roots; collision and route checks complement one another.
- Journal, checkpoint, and ordinary dialogue pause routes, wheels, and actor playback without resetting phase. Launch and cinematic presentation keep ambient street life moving. Zero engine time freezes animation and movement. New actors clear the restored player at initial placement; route and wheel time are not checkpoint data.
- Moving opaque box/cylinder props use the scene-owned `seafront-moving-props` dynamic group (32 m maximum AABB). Skinned rigs, transparent windows, and non-uniform cones use their normal render path. Cone exclusion preserves transformed normals; window exclusion preserves transparency sorting. Root destruction removes both batch groups as well as owned materials/entities.
- Six deterministic capture comparisons recorded **36–52% fewer draw calls**, with no visible regression on reviewed images. Tiny transform-precision differences prevent a byte-identical cross-path gate; repeated captures within each path are identical. Exact draw counts and pixel measurements are in LW-A003 in [TASKS.md](TASKS.md).

### Solid companion

- `CompanionController` owns the live friend's kinematic capsule: radius **0.29 m**, height **1.76 m**, local offset `[0, -0.12, 0]`. Its calibrated visual remains a child. `OpeningActors` controls seated/live visibility and asks it to stand/depart; `StreetEntry` supplies street, booth and queue routes. `BeachArrival` supplies free-exploration routes from `BeachNavigation` and can explicitly stop the companion.
- Normal route speed is **1.65 m/s**. Catch-up adapts to the player's planar velocity, capped at **9 m/s**; a trailing player makes the friend wait at approximately 5.5 m. `projectCompanionRoute` compares cumulative progress across the whole route, so short planter corners do not reverse the ahead/behind decision. Locomotion follows actual travel speed.
- Swept route clearance yields to the player's box footprint and nearby actor capsules. Small lateral contact tolerance lets a player beside the friend clear the doorway. Street pedestrians also yield to the friend. Discrete placement uses rigid-body teleport; continuous motion updates the kinematic root.
- Restoration projects onto the relevant route and moves the friend clear of the player's saved position using area-specific static checks. Officer/queue NPCs also clear saved player positions. Checkpoints preserve objectives, not route phase. Replay hides the live entity and its physics, freezes route progress, and restores it afterward. Modal pause preserves both body solidity and animation/route phase.
- Beach following refreshes at most every **0.75 seconds** once the friend is **3.3 m** away and stops within **1.65 m**. A clear destination is selected on a **2.1 m** ring around the player. `BeachNavigation` builds a 1 m static grid, checks connecting/simplified segments at 0.15 m intervals against the shared checkpoint geometry, and uses A* around furniture. Direct segments, grid connections, search and simplification avoid moving walkers with **1.15 m** clearance. A friend already inside that margin may move outward without approaching the walker. No route means stop and retry; the live controller still yields to actual player/actor positions between route refreshes.

## Interaction and UI boundary

`InteractionSystem` is an Engine Script with a player reference and an explicit list of `Interactable` definitions: stable ID, entity, label, radius, and an action. An action is either `{ type: 'message', message }` or `{ type: 'callback', run }`. The signal box uses a timed message; the guide callback opens its authored conversation.

1. In `postUpdate`, select the nearest enabled target within its **3D center-to-center radius**.
2. Raycast from player pivot to target pivot, excluding the player and non-solid triggers. A different solid hit blocks the interaction.
3. Publish `InteractionState` (target label and message) only when the visible state changes.
4. `interact()` rechecks the target immediately, then runs the callback or starts a four-second message timer. It is ignored while the app is paused or interactions are suspended.

`setSuspended(true)` clears the prompt/message and blocks selection/actions during modal use and scene transitions. Both foundation targets use a 2.3 m radius; story targets supply their own radii. The nearest unobstructed target wins. World actions remain owned by scene composition rather than DOM event handlers.

An optional pure `isAvailable()` predicate participates in both selection and immediate action revalidation. The collected café bag becomes unavailable while its table remains solid. Other targets keep the original behavior without a predicate.

After an eligible action, `onInteract(targetId)` publishes its stable target ID. The target is captured before running the action because a callback may suspend interactions and clear selection. Range, occlusion, disabled-target, pause, and suspension checks all precede this event. Destruction clears both interaction subscribers and target references.

`Game.ts` forwards a fresh E press while pointer lock belongs to the game canvas. Repeated keydown events and modified shortcuts are ignored. The HUD button calls the same action for pointer/touch input. Range and visibility rules are enforced for both paths.

`GameHud.render` renders interaction state with `textContent`; `renderQuest` renders the story objective/completion message. After belongings pickup it tracks entry progress, then the beach's remaining free-order moments and completion count. An accepted signal-box quest has its own secondary line in Tideline. `renderNavigation` adds the current destination and distance, choosing the nearest remaining beach stop. Ordered status/count projections stay visually hidden; beach guidance explicitly says any order. `renderInventory` updates the journal count and a polite acquisition notice. Controls and quest tracker sit side by side on desktop/landscape and stack on narrow screens; **Controls → Restart café** owns reset from either area. Beach sound shares the cinematic mute preference and exposes retry. Its wrapping action row keeps the help popover contained.

`index.html` and `GameHud` share a project-created pumpkin/bat/web SVG wordmark; the favicon is a pumpkin. The black startup overlay presents the logo, explanatory copy and **Launch game**. Its status and loading ring activate only during loading. Reduced-motion preference stops the ring and initializes steady cinematic framing.

`getTargetPosition(out)` includes an optional authored `promptOffset`. `ScreenProjection` projects it through the active camera, rejecting anchors behind the near plane. `Game.ts` passes the result to the HUD's clamped proximity prompt and the active speaker's head position to the speech bubble each update. On narrow portrait beach layouts, CSS docks the eligible interaction at the bottom to keep it clear of objective text; other layouts retain the projected anchor. A beat can author `dialoguePlacement: 'top-left' | 'top-right'` to keep its destination visible; the booth and queue directions use these unanchored panels. Other beats follow the speaker, with readable fallback when the anchor is offscreen. The DOM never selects targets or advances quests. Existing React dependencies are reserved for later UI work.

## NPC dialogue

`DialogueSystem` is an engine-independent TypeScript model owned by the current scene. There is one active conversation. It has no update loop, DOM access, global singleton, or persistence dependency.

- A `DialogueDefinition` has a stable ID, speaker, start-node ID, and keyed nodes. Nodes contain readable text and choices; each choice has an ID, label, and `next` node ID. `next: null` ends the conversation. Return links and cycles are supported.
- `open(definition)` validates the start node, destinations, and per-node choice-ID uniqueness before publishing state. It refuses to replace an active conversation.
- `choose(nodeId, choiceId)` accepts only a choice from the displayed node. Unknown/stale choices are ignored, preventing delayed clicks from advancing a different response.
- `onChoice({ dialogueId, nodeId, choiceId })` publishes the validated source IDs after a transition, including choices that end a conversation. Opening, cancellation, invalid/stale choices, and destruction emit no choice event. Destruction releases this subscriber too.
- `close()` is idempotent. Scene destruction closes the conversation and drops the UI subscriber; scene reset creates fresh dialogue state.
- `src/data/dialogues.ts` contains the guide's movement help and signal-check conversations. `selectGuideDialogue(quest.state)` selects an offer, inspection reminder, report opportunity, or completed response when the guide interaction opens a conversation. The report choice is available only after inspection. Accept/report choices lead to acknowledgement nodes; help, return, and goodbye choices remain reusable.

`DialoguePanel` is a native modal `<dialog>` with text-only content rendering, response buttons, native focus containment, keyboard Tab/Enter navigation, Escape cancellation, and touch controls. It sends node/choice IDs back to the model. Every response change focuses the first choice; closing restores focus to the canvas. Desktop players click the scene to regain pointer lock. The panel scrolls inside short viewports.

`Game.ts` coordinates all six modal surfaces with player controls, pointer-lock release and interaction suspension through `syncControls()`. Journal/checkpoint/replay actions cannot overlap dialogue, lessons, cinematics or loading. It disconnects callbacks before destroying the app. Node tests cover state transitions, authoring errors and validated events; browser acceptance covers input handoff, UI, reset, load and teardown. See [TASKS.md](TASKS.md).

## Episode 1 opening prototype

`createOpeningPrototype` is owned by the Tideline area. Its quest, media, furnished stage and camera are created during scene construction, including unstarted saves; the foundation supplies the shared cutscene model. Construction failure destroys the partial stage/resources and restores the original interaction list before rollback. Launch shows the seated preview with gameplay controls locked. First **Play story** places the player beside the table and starts media; replay retains position and progress.

- `opening.ts` contains the five §1A source lines, stable sequence/beat IDs, optional conversations, the protected `e1-starter-bag`, and **The Last Normal Day** quest. Presentation copy and actor movement do not supply canonical mystery answers.
- `CutsceneSystem.play` validates/copies the definition. `advance(cutsceneId, beatId)` rejects stale or foreign beats; `skip(cutsceneId)` finishes the active sequence once. `cancel` and `destroy` emit no completion. Destruction rejects retained playback/advance/skip actions. The model has no timer: the media adapter advances only the `broadcast` beat on natural video end; the four conversation replies remain reader-paced.
- `onFinished` emits `cutscene-complete / e1-cafe-opening`; the opening quest advances only its first objective. Reading every beat and skipping have the same gameplay result. Replaying cannot collect items or advance later objectives.
- Eligible `cafe-belongings` interaction at 1.95 m acquires the bag, completes the belongings objective and hides the bag/phone. It is available only at opening progress 1/3. The friend starts departure when the opening first finishes, before pickup. Eligible `cafe-exit` interaction at 1.2 m completes opening and interaction practice only after pickup plus movement/look practice; early attempts show reminders. Doorway dialogue hands off to pedestrian directions.
- TV and attendant conversations reuse `DialogueSystem`. They never gate progress or alter the story quest. Story callbacks reject calls after scene destruction.
- `OpeningActors` selects seated listening/talking clips and hands a continuous stand-up pose to the solid companion at the seated position. Once stand-up reaches 98%, the companion walks the departure route to `[8.1, 1.014, 6.65]`; street progression appends the accompanying route. Modal/replay suspension freezes departure; seated cast, patrons and fans animate during opening presentation. Restored started openings place the friend outside, then entry restoration selects its later route if applicable. Transient animation/route time is not saved.
- `CafeDressing.ts` owns environment instances, patrons, four table-centered fans, trim, tiles, brand/menu signs, and six unshadowed lights beneath a stage child. Each fan has a distinct imported blade node; `OpeningActors` composes a 540°/second yaw with its retained rest rotation. All four share one registry asset. `CafeArtwork.ts` supplies illustrated panels; `CafeSurroundings.ts` owns the external neighborhood. `createModelInstance.ts` nests semantic root → calibration yaw → uniform-scale/pivot wrapper → original imported hierarchy. Instances share registry materials without overwriting authored node transforms. The bag and procedural phone stay individually addressable.
- `createCanvasPanel` registers texture/material disposal on its owner and exposes explicit redraw. `createTextSign` supports an optional authored height and aspect-matched texture for wide entrance banners. The TV redraws only when the video frame, caption, poster or failure state changes.
- `Game.ts` routes sequence state into actors, camera, media and `CutscenePanel`. The HUD is hidden during playback; native modal focus and input suspension remain. **Skip bulletin**, **Next**, **Let’s go**, **Skip intro** and Escape support keyboard/touch; repeated Enter/Space do not fast-forward. Sound, captions and steady-camera preferences last for the application session.
- The HUD tracks the opening through belongings pickup, then the entry and beach phases of **A little sea air**. **Signal check** remains independently usable and visible as secondary feedback when accepted. All four quests receive their own validated events and are saved together.

The doorway completes the local opening and continues into guided street/admission and populated beach exploration. The wave/blackout continuation is LW-S004.

## Guided street and beach admission

- `StreetEntryProgress` is engine-independent. It owns the eight ordered entry objectives, the current lesson, reserved phone funds and admission prerequisites. `QuestSystem` adds a typed `control-practiced` event; opening and signal-box events keep their existing contracts. The protected bag enables practice; dismissing a lesson only releases controls.
- `ControlPractice` observes actual input and measured player/camera change through the preserved stock controller: **1.3 m** of movement or **20°** of camera rotation. Keyboard, pointer-lock mouse, touch joystick events and gamepad axes can supply practice. Default `DualGestureSource` emits no right-joystick event, so right-side canvas touch gestures are observed directly; pointer release/cancel/capture loss clears their tracking. Suspension resets measurement and gestures; modal/cinematic motion cannot complete lessons. Listeners are scene-owned. The third lesson completes only through the validated `cafe-exit` action.
- `entry.ts` owns lesson copy, reusable pedestrian dialogue, officer/queue sequences, ticket choices, passes and stable objective IDs. The route is east past Lemon Market, across the side street, then left into the entrance plaza. `StreetEntry` registers eight pedestrian targets, officer, ticket booth and queue, and provides objective-specific navigation hints.
- `BeachEntrance` builds the large arch, ticket booth, rails, direction signs and queue marker using shared geometry. `EntryActors` owns officer/attendant/queue presentation, a joint-following officer cap, staged player idle and companion talking/idle poses. `EntryCamera` frames the speaker and the referenced destination. Sequence finish/skip dispatches to the appropriate progress owner; cancellation gives no credit.
- The bag represents **10 reserved story credits** until passes are acquired. At entry count 5, a validated `offer / buy` choice atomically acquires unique `e1-beach-passes` and advances to 6. There is no separate mutable wallet. Declining is repeatable; duplicate/stale purchase attempts cannot charge or acquire again. The inventory has no consumption/discard operation.
- Queue playback requires both passes at count 6. Finishing advances to 7 and requests arrival. `Game.ts` displays the black branded `TransitionPanel`, suspends input, and stages a validated arrival snapshot after **0.35 game seconds**; it dismisses the loader no earlier than **0.9 seconds**. Hidden-document/zero-time updates pause the handoff. Loading performs no network asset fetch or automatic checkpoint write.
- The candidate preserves bag, passes, signal clue and all progress, sets area to `beach-arrival`, places the player at `[0, 1.08, 3.6]`, and completes entry only in that candidate. Build/activation failure retains paid Tideline count 7. **Retry entry** rebuilds; **Back to the queue** restores play and its marker can request arrival again.
- The destination retains the validated **32×28 m** white-sand/boardwalk footprint and `[0, 1.08, 3.6]` default spawn. `BeachArrival` composes the populated beach below. This boundary does not persist cutscene, queue, media or companion route time.

## Beach exploration

- `beach.ts` authors `e1-beach-exploration` with `order: 'any'`. Friend `together / enjoy`, drinks `offer / take`, and shoreline `look / notice` choices independently complete `friend`, `drinks` and `shore`. Reading, declining, leaving early and stale input grant nothing. The optional beachgoer conversation supplies flavor/directions. Both drinks are included with the already-owned passes; there is no additional charge, item prerequisite or carried-drink animation. Completion keeps the area playable with a chapter-end/save message.
- `BeachDressing` owns white sand, boardwalk, six striped umbrellas, seven supported loungers, signs, buoy markers, citrus cart and five displayed drinks reusing the café bottle/iced-drink assets. `beachLayout.ts` is the single source for furniture and stationary-person solids used by construction, pathfinding and checkpoint validation. The `beach-static` group batches suitable opaque dressing; its owner removes the group and procedural materials/textures on destruction. Loungers are currently unoccupied.
- `BeachLife` owns five stationary beachgoers, an attendant, two kinematic walkers and four non-colliding swimmers beyond the beach rail. Walkers move at 1 m/s on clear shoreline lanes, yield to the player/friend/other walkers, and spawn clear of restored players. Two swimmers follow slow elliptical paths; two tread water. `BEACH_POSE_HEIGHTS` records per-model idle/walk/swim/float support offsets measured from animated vertices. All 12 ambient rigs showed non-root joint motion; 21 samples per character verified ground contact or visible heads/submerged lower geometry.
- `BeachWater` owns a **65×65-vertex** calm surface, analytic unit normals and three foam ribbons. Water and foam reuse dynamic mesh/GPU buffers; the shared `beachWaterHeight(x, z, time)` also places swimmers. Water/population advance capped 0.1-second steps only during active gameplay. Render-component ownership releases the meshes; the root releases its materials.
- `BeachArrival.setControlsEnabled` pauses the companion, population, water and ambience for dialogue, journal, checkpoint, loading and background suspension. `Game.ts` owns scene binding and starts ambience only after a committed handoff or explicit beach Load. Failed candidates destroy their source-free audio, geometry and instances while preserving the live source area.

## Media ownership

- `OpeningMedia` owns one source-free music element, the current video element, media listeners, and an eight-second loading/stall watchdog. **Play story** assigns the music source and creates the video; explicit checkpoint Load starts ambient media only for a previously played opening. Unplayed and migrated version-1 saves retain the Play story gate. Launch, reset and reload do not autoplay. Reset/load destroys the previous scene's media. Retired video events cannot advance the current sequence.
- `openingBroadcast.json` describes a **15.4-second, 960×540 H.264/AAC** newsroom report by **Elizabeth Lee / Voice of America**, retaining her original voice and six synchronized caption cues. The excerpt is programme **00:55.25–01:10.65** of _The Inside Story — Confronting the Climate Crisis_, Episode 89. Fictional coastal story text remains in `opening.ts` and the optional TV conversation. `CafeTelevision` paints video/poster/captions and fictional news graphics onto a 1024×576 canvas panel.
- Music loops with target volume 0.10 during the bulletin and 0.24 afterward. On natural end or **Skip bulletin**, the video becomes a muted ambient loop while the conversation remains reader-paced. Replay creates a fresh bulletin element.
- `OpeningMediaState` publishes `idle/loading/playing/blocked/unavailable`, current cue or fallback transcript, mute, and music-failure state. Captions default on; mute or video failure forces readable subtitles. Retry uses a new video element, and a missing music track can reload. Text-only progression stays available on playback failure.
- Media pauses without rewinding when engine `dt` is zero, the document is hidden, or the window loses focus. Activity listeners pause it immediately, cancel stall timers and resume only previously started media; asynchronous playback also checks suspension. Ordinary dialogue/journal/checkpoint modals suspend gameplay, while music and ambient TV continue in the focused page. Teardown cancels the watchdog/listeners, pauses elements, clears sources, and releases presentation callbacks.
- `BeachAudio` owns one source-free, `preload: 'none'` element for the original **24-second mono surf/gull loop**, at volume 0.4. `start()` permits source assignment/playback only when the area is active; an explicitly loaded checkpoint waits for its modal to close. `Game.ts` shares the session mute preference with the café and binds `idle/loading/playing/blocked/unavailable` state to the beach sound button.
- Beach audio pauses without rewinding with ordinary beach modals as well as zero-time/background/focus suspension. Initial loading and waiting/stalled playback have an **eight-second watchdog**. Failure leaves exploration available with **Enable beach sound**; retry reloads a failed source. Generation tokens isolate pending attempts across pause/retry/destruction so late promises cannot clear a newer attempt or restart retired playback. Teardown aborts event listeners, cancels the watchdog, pauses, clears the source and removes state callbacks.

## Quest tracking

`QuestSystem` is an engine-independent TypeScript model. Each instance owns progress for one `QuestDefinition`: stable quest ID, title, objectives, optional `order: 'ordered' | 'any'`, and completion copy. Ordered behavior is the default. An objective has an ID, text, and a typed `QuestEvent` requirement. Definitions live in `src/data/quests.ts` and the episode's `opening.ts`, `entry.ts` and `beach.ts`; progress is a private completed-ID set.

- `state` exposes `questId`, title, status, order, remaining text/ID objectives, the first remaining objective, completed/total counts and completion copy. Ordered quests initially remain `inactive`; their first matching event accepts the quest. Free-order quests start `active`. Completing every objective produces `completed` with no current objective.
- `handle(event)` matches the next ordered requirement or any uncompleted free-order requirement and advances at most one objective. Dialogue events match dialogue/node/choice IDs; interactions match target IDs; cutscene completion matches the sequence ID; control practice matches move/look. Unrelated, duplicate and post-completion events return `false`. Early ordered events are not buffered.
- Construction rejects empty objective lists, duplicate objective IDs and duplicate event requirements. Objectives are one-shot; repeated-count objectives require a separate contract when introduced.
- `reset()` empties the set and publishes only if progress changed. `destroy()` clears progress/subscribers and disables further handling or resets, including callbacks retained from an old scene.
- `snapshot` returns copied stable IDs in authored order, independent of discovery order. `isQuestSnapshot` requires an exact prefix for ordered quests or any valid unique subset for free-order quests. `restore(unknown)` validates before mutation and publishes once when membership changes, including same-size rollbacks. It never replays completion events. Definitions, snapshots and state projections do not alias caller-owned data.

The authored foundation quest is **Signal check**:

| Progress      | Required event                                            | Next state/objective                    |
| ------------- | --------------------------------------------------------- | --------------------------------------- |
| Inactive, 0/3 | `dialogue-choice`: `foundation-guide / signal / accept`   | Active, 1/3: check the amber signal box |
| Active, 1/3   | `interaction`: `signal-box`                               | Active, 2/3: report back to the guide   |
| Active, 2/3   | `dialogue-choice`: `foundation-guide / greeting / report` | Completed, 3/3                          |

`FoundationScene.ts` owns the models and routes `DialogueSystem.onChoice` and `InteractionSystem.onInteract` into typed quest events. It selects guide content from current quest progress and destroys the models with the scene root. Neither the dialogue runner nor the interaction selector imports the quest system. `Game.ts` connects quest snapshots to `GameHud.renderQuest`; presentation never advances objectives.

Checking the box before accepting does not count. Reading or declining the offer, cancelling a conversation, and opening the guide after inspection do not complete objectives. Reset/reload starts fresh progress; explicit checkpoint loading restores the saved stage.

`pnpm test` includes eight dialogue tests and fourteen quest/integration tests, covering authored data, event matching, ordering, restoration, snapshot isolation, reset, stale callbacks, and the actual guide/box IDs.

## Inventory and clue journal

`InventorySystem` is an engine-independent TypeScript model owned by the scene. The installed Engine has no inventory runner; this model needs no entities or frame updates. `InventoryItemDefinition` contains a stable ID, title, source, readable description, and optional `kind: 'clue' | 'quest'` (omitted means clue). Definitions live in `src/data/items.ts` and the episode's `opening.ts`/`entry.ts`.

- Construction copies the catalog and rejects blank or duplicate IDs. Acquired IDs are private to each instance.
- `acquire(itemId)` returns `true` and publishes `onStateChange` only for the first acquisition of a known ID. Unknown, duplicate, and post-destruction acquisitions return `false` without publishing.
- `state.items` returns copies in acquisition order. Mutating catalog inputs or returned snapshots cannot modify stored items.
- `reset()` clears acquired IDs and publishes only if inventory changed. `destroy()` drops the catalog, collected IDs, and subscriber, and rejects later acquisition/reset calls.
- `snapshot` returns a copied `{ itemIds }`. `isInventorySnapshot` rejects unknown, duplicate, malformed, or sparse IDs. `restore(unknown)` validates the whole collection before replacing it, preserves acquisition order, publishes once only when IDs/order change, and rejects post-destruction calls.

The authored foundation clue is `signal-box-note` (**Signal box note**), found at the **Amber signal box**. After a validated `signal-box` interaction, `FoundationScene.ts` routes the event into the quest and independently calls `inventory.acquire(SIGNAL_BOX_NOTE.id)`. The clue can be collected before accepting the quest. An early pickup still requires reinspection after accepting to advance the quest, and reporting never consumes the clue. The note's maintenance text belongs to the foundation tutorial.

`GameHud` displays the total item count and latest acquisition notice. `JournalPanel` renders a native modal `<dialog>` with an empty-state hint or text-only item cards containing title, source, and full description. Native focus containment and the focused **Close journal** button support keyboard and touch use; short viewports scroll within the panel.

The HUD starts with **Journal** and becomes **Bag / journal** after acquiring the bag; the suffix counts all items. Acquisition names the latest packed story item or clue. Journal and checkpoint summaries count clues separately from protected story items. `InventorySystem` exposes no disposal or consumption operation, so the mandatory bag and two passes cannot be accidentally lost.

`Game.ts` owns journal visibility separately from the inventory. J or the HUD button toggles the journal; J, Escape, or **Close journal** closes it. J works with or without pointer lock, while repeated or Ctrl/Alt/Meta-modified keydowns are ignored. Opening suspends controls/interactions and releases pointer lock. Closing returns focus to the canvas; clicking the scene resumes desktop play. Closing clears rendered cards but preserves collected items. Scene replacement closes the panel and binds fresh or restored inventory; reload starts fresh gameplay while retaining saved checkpoints. Application teardown removes journal listeners and markup.

Nine inventory tests cover acquisition, catalog validation, same-title/different-ID items, ordering, snapshot isolation, restoration, reset/reacquisition, and retained callbacks after destruction. Inventory browser acceptance and the portable manual route are recorded in LW-C003 in [TASKS.md](TASKS.md).

## Scene checkpoints

`SaveSystem.ts` owns the versioned storage envelope and browser I/O boundary. The application injects `() => window.localStorage`, keeping restricted-storage access inside the operation's error boundary. An injected clock supports deterministic tests. `FoundationState.ts` owns the engine-independent scene payload and content/position validation; the scene owns capture and restoration.

The single localStorage key is **`last-wave.checkpoint`**. New saves use version 4:

```json
{
    "version": 4,
    "savedAt": 1793779200000,
    "state": {
        "sceneId": "foundation",
        "area": "tideline",
        "playerPosition": [6.15, 1.05, 0],
        "quest": {
            "questId": "foundation-signal-check",
            "completedObjectiveIds": []
        },
        "inventory": { "itemIds": [] },
        "opening": {
            "questId": "e1-last-normal-day",
            "completedObjectiveIds": []
        },
        "entry": {
            "questId": "e1-to-the-beach",
            "completedObjectiveIds": []
        },
        "beach": {
            "questId": "e1-beach-exploration",
            "completedObjectiveIds": []
        }
    }
}
```

- The envelope requires an integer version and a non-negative, valid millisecond timestamp. Reads are bounded to 16 KiB. Known-version data is normalized into copied fields; authored dialogue, quest copy, and clue text come from the current catalogs.
- Signal/opening/entry progress must match ordered objective prefixes; beach progress permits any unique subset of `friend`, `drinks`, `shore`. Inventory IDs must be known and unique. Early clue acquisition is valid at 0/3 or 1/3; saved inspection/report completion requires the signal-box note.
- Opening progress is an ordered prefix of `watch-opening`, `collect-belongings`, `follow-friend`. The bag is required exactly when opening count is at least 2. Entry progress is an ordered prefix of the eight `ENTRY_QUEST` IDs; it is empty before pickup. Opening count 3 is equivalent to entry count ≥3. Pass ownership is equivalent to entry count ≥6, and `beach-arrival` is equivalent to count 8. All four quest snapshots are required, and beach discoveries must be empty outside the admitted beach area.
- Version-1 envelopes receive empty opening/entry progress; version 2 retains its opening and grants the first three entry objectives only for a completed departure. Both migrate to Tideline in memory. A formerly valid position newly occupied by entrance solids relocates to `[70.5, 1.04, 6.4]`. Version 3 retains area/admission and earlier quests; formerly clear beach positions newly obstructed by dressing or stationary people relocate to `[0, 1.08, 3.6]`. Other invalid legacy positions/ownership remain rejected. All legacy versions receive empty beach discoveries and normalize to version 4 without changing stored bytes until a manual write.
- Player coordinates must be finite, inside the ground footprint with collider clearance (**X=-94.6–104.6 m; Z=-75.6–103.6 m**), and within Y=0.95–8 m. The saved character box must clear ground, neighboring buildings, planters, all café furniture/shell/overhead solids, signal box, and guide. Separating-axis checks use shared dimensions and authored boxes, with 0.05 m tolerance for Ammo contact penetration. Supported table-top and airborne positions are valid only with enough overhead clearance.
- Tideline checks include the café and entrance even before story start. Beach checks include its ground, rails, furniture, poles, sign posts and stationary people. Dynamic walkers and the companion clear the restored player during construction rather than becoming permanent forbidden checkpoint positions. Transient cinematic/animation/media time is never persisted; the checkpoint UI is unavailable during playback/loading.
- `load()` reads current storage every time and returns `ready`, `missing`, `invalid`, `incompatible` or `unavailable`. Unsupported integer versions, string scene identities and version-3/version-4 area identities are incompatible; malformed envelopes/content/positions are invalid. Reads retain stored data for explicit replacement/deletion.
- `save(snapshot)` validates and copies before a single `setItem`. A successful write replaces the slot. Validation or quota/access failure retains the prior slot. `clear()` removes only this key and reports access failure. The lifetime is local to this site origin/browser; reset, reload, and application destruction retain it. Every write/delete is a manual UI action.
- Loading constructs the saved area before committing it, including model validation and player/body setup. Failure preserves the previous area and releases the partial hierarchy/resources. Successful loads start with a resting body, closed dialogue/journal and fresh interaction state. Started openings restore the companion near its current route; unstarted openings retain the seated preview/control/media gate. Unfinished lessons reopen on closing the checkpoint menu; count 7 waits for explicit queue entry. Tideline Load starts music and muted ambient TV only for a played opening. Beach Load restores every discovery subset and permits surf/gull playback when the menu closes. Playback time is not restored.

`CheckpointPanel` is a native modal with slot timestamp/progress, missing/invalid/incompatible/storage feedback, and save/load/delete controls. P or the HUD opens it; P, Escape, or **Close** closes it. Load stays open to show the result and keep controls suspended. The menu follows the same exclusive input/focus policy as dialogue and journal, scrolls within short viewports, and retains ≥44 px buttons. `Game.ts` coordinates actions, binds restored HUD state, and handles scene-failure feedback.

`pnpm test` runs **88 tests**, including all six beach discovery orders/eight subsets, v1–v4 migration/invariants, candidate rollback, static navigation and two moving-walker regressions. Scene tests use real Engine entities with a minimal enabled application root; browser acceptance exercises rendering, joint animation, media, physics, input, restoration and teardown. Commands and evidence are in [TASKS.md](TASKS.md).

## Asset and content boundaries

`AssetManager.ts` owns `loadPhysics` and `loadGameAssets`. The latter returns typed maps of loaded `ContainerResource` objects backed by the app registry. Launch preloads **41 containers / 517 registry assets** before synchronous scene construction; reset, area transition and checkpoint loads reuse them. Tideline has **79 bodies/colliders / 1,145 renders / 26 animations / 18 targets**; the beach has **31 bodies/colliders / 317 renders / 14 animations / four targets**, with **97 textures** in the normal arrival capture. These are observations, not hard-coded limits.

Four alternating area reloads retained these stable cleanup measurements: **103 persistent textures / 535 geometry buffers / 9,212,020 vertex bytes / 1,610,760 index bytes** in Tideline; **83 persistent textures / 387 geometry buffers / 8,399,780 vertex bytes / 1,511,100 index bytes** on the beach. Engine skin palettes and dynamic batches can be recreated/repartitioned on root activation. Recovery checks therefore verify persistent texture identity, live palette ownership and geometry memory rather than requiring transient total buffer counts to match.

The 28 self-contained props total **1,741,332 bytes**; nine café characters total **19,022,704 bytes**, including the **1,750,900-byte** suited commuter. Four fitted swimwear variants add **6,896,708 bytes**, for **27,660,744 bytes** of prepared GLBs. `cafeModels.ts`, `characterModels.ts`, and `modelTuning.ts` record decoded bounds, intended heights, uniform scale, grounding/pivot compensation, facing and animated beach support offsets. Café rigs have ten clips; beach rigs have seven with 512 px textures. All buffers/textures are embedded and no Draco/Meshopt decoder is needed. Static calibration does not replace runtime skinned-pose/seating/waterline checks.

`public/assets/credits.html` is linked from the checkpoint menu. Current models are credited CC0 art; the TV uses attributed VOA public-domain footage. Café music (**2,228,256 bytes**) and surf/gull ambience (**1,058,444 bytes**) are original synthesis with no third-party samples; video/poster/VTT total **752,599 bytes**. The retired Navy source/specification and synthetic bulletin stay in the non-deployed archive. Preserve `public/ammo/LICENSE` and `SOURCE.md`.

All 30 originally supplied files, including the former ten-model runtime set, remain byte-preserved in `asset-library/catalog.json` destinations. Preparation scripts and manifests track seven source archives, calibrated models, authored appearance variants and media outputs. Beach selection/preparation/inspection reuse the preserved Quaternius body/animation archives; `prepare-beach-assets.py` shares café extraction/assembly helpers and `beach_clothing.py` fits skinned swimwear. `video/preparation.json` keeps `source` as the attribution URL and `sourceFile` as the original-file path/size/SHA-256 record. Downloaded packs are ignored and must be restored before offline regeneration. Normal Vite builds only need prepared runtime files. See `asset-library/README.md` and `public/assets/README.md`.

## Future structure

These are reserved responsibilities, not implemented systems:

| Location                                                          | First feature that should introduce it     |
| ----------------------------------------------------------------- | ------------------------------------------ |
| `episodes/episode-01/{CoffeeShop,Beach,Hospital,KiroweenCity}.ts` | The corresponding approved scene milestone |
| `networking/`                                                     | A Colyseus shared-session proof            |

Future persistence uses NestJS/PostgreSQL outside browser rendering. The foundation hosts the opening story prototype; complete episode scenes, backend persistence, and multiplayer remain subsequent work. See [TASKS.md](TASKS.md) for verification status.

## API sources consulted

- Installed `node_modules/playcanvas/build/playcanvas.d.ts`: AppBase/AppOptions, WasmModule, Script/ScriptComponent, Keyboard, raycast options, camera tone mapping.
- Installed `node_modules/playcanvas/scripts/esm/third-person-controller.mjs`: public settings, input mapping, damping, grounding, camera collision, and destroy behavior.
- [Official v2.23.3 third-person example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/gaussian-splatting/third-person.example.mjs).
- [Official v2.23.3 falling-shapes example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/falling-shapes.example.mjs).
- [Official v2.23.3 raycast example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/raycast.example.mjs).
- [Official v2.23.3 video-texture example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/graphics/video-texture.example.mjs): adapted its texture/emissive material setup to static canvas signs.
- [Official v2.23.3 GLB loader example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/loaders/glb.example.mjs): resource handlers, `AssetListLoader`, and `instantiateRenderEntity()`.

The direct-Engine build-app, reuse-scripts, assemble-scene, apply-conventions, light-scene, find-examples, and inspect-runtime skill guidance informed the integration.
