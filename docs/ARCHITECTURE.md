# Last Wave — Architecture

Updated **2026-11-04**. Runtime: **PlayCanvas 2.23.3 + TypeScript + Vite + pnpm**.

## Current structure

```text
last-wave/
├── public/
│   ├── ammo/                         # Starter physics runtime, license, source hashes
│   └── assets/
│       ├── characters/
│       ├── animations/
│       ├── environments/
│       ├── props/
│       ├── audio/
│       └── textures/
├── src/
│   ├── core/
│   │   ├── Game.ts                   # Native AppBase bootstrap, input/UI wiring, teardown
│   │   ├── SceneManager.ts           # Owns one replaceable scene root
│   │   └── AssetManager.ts           # Ammo loading/error boundary
│   ├── player/
│   │   ├── PlayerController.ts       # Stock controller adapter and ledge probes
│   │   ├── PlayerAnimation.ts        # Starter's procedural limb animation
│   │   ├── CameraController.ts       # Camera creation and follow/orbit settings
│   │   └── CharacterModel.ts         # Shared placeholder humanoid and collider
│   ├── systems/
│   │   ├── InteractionSystem.ts      # Proximity, sightline, action, timed message state
│   │   ├── DialogueSystem.ts         # Authored conversation state and validated choices
│   │   └── QuestSystem.ts            # Ordered, event-driven quest progress
│   ├── scenes/
│   │   └── FoundationScene.ts        # The current test environment
│   ├── episodes/episode-01/          # Reserved, with a scope README
│   ├── ui/
│   │   ├── GameHud.ts
│   │   ├── DialoguePanel.ts
│   │   └── game.css
│   ├── data/
│   │   ├── foundation.ts             # Layout and interaction definitions
│   │   ├── dialogues.ts              # Progress-aware guide conversations
│   │   └── quests.ts                 # Authored objectives and completion events
│   ├── networking/                  # Reserved, with a scope README
│   ├── assets/playcanvas.png         # Starter favicon
│   ├── inspector.ts / inspector.css # Development-only inspector integration
│   ├── scripts.d.ts                 # Used public fields of the shipped ESM controller
│   ├── vite-env.d.ts
│   └── main.ts                      # Canvas, startup feedback, HMR disposal
├── docs/
│   ├── GAME_DESIGN.md
│   ├── EPISODE_01.md
│   ├── ARCHITECTURE.md
│   ├── TASKS.md
│   ├── AGENT_CONTEXT.md
│   └── *.docx                       # Original design sources
├── AGENTS.md / CLAUDE.md
├── tests/
│   ├── dialogue.test.mjs              # Dialogue transitions, events, and graph validation
│   └── quest.test.mjs                 # Quest rules and authored dialogue integration
├── package.json / pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

## Lifecycle and ownership

`index.html → main.ts → createGame(canvas) → loadPhysics() → AppBase.init() → app.start() → SceneManager.load()`.

- `createGame` returns the actual `AppBase`; there is no second game loop or wrapper application lifecycle.
- The original minimal render/camera/light/script/collision/rigid-body component systems are registered. `Keyboard` is opt-in for E; the shipped controller owns its own keyboard/mouse, touch, and gamepad sources.
- `SceneManager.load(name, build)` destroys the previous root, attaches one unscaled root, and invokes a synchronous scene builder. It also cleans up a partially built scene if construction fails. The foundation builder returns its interaction system, dialogue and quest models, and a control-enabling action. Reset closes any conversation before using the same builder as startup and creates fresh quest progress.
- Scene roots own all entities. The foundation root releases its shared procedural materials on destruction. Engine Script destruction releases the stock controller's input sources.
- The application owns HUD/dialogue actions, E-key handling, and the resize listener. It connects quest state to the HUD on load. `app.destroy()` disconnects dialogue callbacks, destroys scene-owned state, and removes both UI surfaces and external listeners; `main.ts` invokes that path on Vite module disposal.
- Physics uses the starter's local Ammo runtime and loads before app/rigid-body creation. In this AppBase setup, `app.start()` installs the Ammo physics world, so it must run before building scene colliders/bodies. Loading failures reach the startup error display. URLs respect Vite's relative base path.

## Player, animation, and camera

**Decision: adapt the official controller rather than fork its algorithms.** `PlayerController.ts` imports `ThirdPersonController` from `playcanvas/scripts/esm/third-person-controller.mjs`. It retains WASD/arrow movement, Shift sprinting, Space jump, mouse orbit, wheel zoom, and the original touch/gamepad mappings.

The upstream script integrates camera-relative movement and camera positioning in one update. Our camera entity and tuning live in `CameraController.ts`; the player adapter applies those settings to the upstream script. This separates project configuration without duplicating its coupled input/physics/orbit implementation.

- Ground speed parameter: 60; sprint multiplier: 1.5; jump impulse: 520; body mass: 70; gravity: `(0, -18, 0)`. `speedGround` is the controller's acceleration-style parameter, not a direct m/s cap.
- Camera distance: 5 m; target height: 0.5 m above the player's pivot; initial pitch: 15°; FOV: 55°. Position/look-at damping is 0.97 (fraction retained per millisecond) for smooth follow. Upstream orbit sensitivity, collision padding/damping, pitch limits, and zoom behavior remain in the shipped implementation.
- `PlayerAnimation` retains velocity-driven arm/leg swings and body bob. Limb nodes are looked up once. There are no GLB clips, animation assets, or retargeting in this milestone.
- `CharacterModel` builds the original six-part humanoid. Player and stationary NPC share geometry/materials as appropriate; only the player has a movement/animation script.
- `setPlayerControlsEnabled` toggles the stock controller's public `enabled` property. Dialogue disables both movement and orbit updates, zeroes horizontal velocity, and preserves vertical physics. Closing re-enables the controller. The application time scale is unaffected.

**Compatibility constraint:** the starter corrects ledge grounding by replacing the controller's internal `_grounded` property with nine downward probes. There is no public ground-query hook in 2.23.3. That one existing compatibility shim is isolated in `PlayerController.ts`. On any PlayCanvas upgrade, inspect the shipped script and re-test jumps on a ledge and above foliage before accepting the upgrade. `src/scripts.d.ts` declares only public fields this project configures.

## Physics and scene composition

- Coordinates use meters, +Y up, with camera forward along -Z. The ground surface is at Y=0.
- Physical roots keep unit scale. Collider dimensions are explicit; scaled primitive visuals are children. Positions/heading are applied before creating static rigid bodies.
- The player/NPC box has half extents `(0.4, 1.2, 0.4)` and local collision offset `(0, 0.2, 0)`. Its bottom is 1 m below its pivot, inside the 1.1 m ground probes. The box preserves stable ledge standing from the starter.
- Blocks, walls, trunks, log, stump, NPC, and signal box are solid static colliders. Tree crowns retain trigger-only colliders: they intercept camera rays but do not block the player or count as ground.
- The 20×20 m area has 3.2 m perimeter walls. Wall corners meet; the existing obstacle layout remains available for jump/collision checks. NPC and box coordinates are in `data/foundation.ts`.
- One directional shadow-casting light, shared StandardMaterials, explicit neutral tone mapping, and 1024-pixel shadow maps keep the prototype simple. Device pixel ratio remains at the starter's 1× default. Hardware frame budgets still require device testing.

## Interaction and UI boundary

`InteractionSystem` is an Engine Script with a player reference and an explicit list of `Interactable` definitions: stable ID, entity, label, radius, and an action. An action is either `{ type: 'message', message }` or `{ type: 'callback', run }`. The signal box uses a timed message; the guide callback opens its authored conversation.

1. In `postUpdate`, select the nearest enabled target within its **3D center-to-center radius**.
2. Raycast from player pivot to target pivot, excluding the player and non-solid triggers. A different solid hit blocks the interaction.
3. Publish `InteractionState` (target label and message) only when the visible state changes.
4. `interact()` rechecks the target immediately, then runs the callback or starts a four-second message timer. It is ignored while the app is paused or interactions are suspended.

`setSuspended(true)` clears the prompt/message and blocks selection/actions during dialogue. Both targets use a 2.3 m radius; the nearest unobstructed one wins. World actions remain owned by scene composition rather than DOM event handlers.

After an eligible action, `onInteract(targetId)` publishes its stable target ID. The target is captured before running the action because a callback may suspend interactions and clear selection. Range, occlusion, disabled-target, pause, and suspension checks all precede this event. Destruction clears both interaction subscribers and target references.

`Game.ts` forwards a fresh E press while pointer lock belongs to the game canvas. Repeated keydown events and modified shortcuts are ignored. The HUD button calls the same action for pointer/touch input. Range and visibility rules are enforced for both paths.

`GameHud.render` renders interaction state with `textContent`; `renderQuest` renders the quest title, status, current objective or completion message, and completed/total counts. Quest feedback uses a polite live region and persists independently of the four-second interaction message. Controls and the quest tracker sit side by side on desktop/landscape and stack on narrow screens. The DOM is not the game-state store. The current lightweight DOM overlay is sufficient; the existing React dependencies can support later UI work without moving state into components.

## NPC dialogue

`DialogueSystem` is an engine-independent TypeScript model owned by the current scene. There is one active conversation. It has no update loop, DOM access, global singleton, or persistence dependency.

- A `DialogueDefinition` has a stable ID, speaker, start-node ID, and keyed nodes. Nodes contain readable text and choices; each choice has an ID, label, and `next` node ID. `next: null` ends the conversation. Return links and cycles are supported.
- `open(definition)` validates the start node, destinations, and per-node choice-ID uniqueness before publishing state. It refuses to replace an active conversation.
- `choose(nodeId, choiceId)` accepts only a choice from the displayed node. Unknown/stale choices are ignored, preventing delayed clicks from advancing a different response.
- `onChoice({ dialogueId, nodeId, choiceId })` publishes the validated source IDs after a transition, including choices that end a conversation. Opening, cancellation, invalid/stale choices, and destruction emit no choice event. Destruction releases this subscriber too.
- `close()` is idempotent. Scene destruction closes the conversation and drops the UI subscriber; scene reset creates fresh dialogue state.
- `src/data/dialogues.ts` contains the guide's movement help and signal-check conversations. `selectGuideDialogue(quest.state)` selects an offer, inspection reminder, report opportunity, or completed response when the guide interaction opens a conversation. The report choice is available only after inspection. Accept/report choices lead to acknowledgement nodes; help, return, and goodbye choices remain reusable.

`DialoguePanel` is a native modal `<dialog>` with text-only content rendering, response buttons, native focus containment, keyboard Tab/Enter navigation, Escape cancellation, and touch controls. It sends node/choice IDs back to the model. Every response change focuses the first choice; closing restores focus to the canvas. Desktop players click the scene to regain pointer lock. The panel scrolls inside short viewports.

`Game.ts` coordinates dialogue state with player controls, pointer-lock release, and interaction suspension. It disconnects callbacks before destroying the app, so an open conversation cannot access a destroyed controller. Node tests cover state transitions, authoring errors, and validated choice events; browser acceptance covers input handoff, UI, reset, and teardown. See LW-C001 and LW-C002 in [TASKS.md](TASKS.md).

## Quest tracking

`QuestSystem` is an engine-independent TypeScript model. Each instance owns progress for one `QuestDefinition`: stable quest ID, title, ordered objectives, and completion copy. An objective has an ID, text, and a typed `QuestEvent` requirement. Definitions are authored in `src/data/quests.ts`; progress is private to the instance.

- `state` exposes `questId`, title, status, a text/ID projection of the current objective, completed/total counts, and completion copy. The initial status is `inactive`; the first objective's event accepts the quest and activates the next objective. Finishing the last objective produces `completed` with no current objective.
- `handle(event)` matches only the current requirement and advances at most one objective. Dialogue events match dialogue/node/choice IDs; interactions match target IDs. Unrelated, duplicate, early, and post-completion events return `false` without publishing changes. Early events are not buffered.
- Construction rejects empty objective lists, duplicate objective IDs, and duplicate event requirements. This tracker represents sequential, one-shot objectives; repeated-count objectives require a separate contract when introduced.
- `reset()` returns progress to inactive and publishes only if progress changed. `destroy()` clears progress/subscribers and disables further handling or resets, including callbacks retained from an old scene.

The authored foundation quest is **Signal check**:

| Progress      | Required event                                            | Next state/objective                    |
| ------------- | --------------------------------------------------------- | --------------------------------------- |
| Inactive, 0/3 | `dialogue-choice`: `foundation-guide / signal / accept`   | Active, 1/3: check the amber signal box |
| Active, 1/3   | `interaction`: `signal-box`                               | Active, 2/3: report back to the guide   |
| Active, 2/3   | `dialogue-choice`: `foundation-guide / greeting / report` | Completed, 3/3                          |

`FoundationScene.ts` owns the models and routes `DialogueSystem.onChoice` and `InteractionSystem.onInteract` into typed quest events. It selects guide content from current quest progress and destroys both models with the scene root. Neither the dialogue runner nor the interaction selector imports the quest system. `Game.ts` connects quest snapshots to `GameHud.renderQuest`; presentation never advances objectives.

Checking the box before accepting does not count. Reading or declining the offer, cancelling a conversation, and opening the guide after inspection do not complete objectives. A completed quest remains completed until scene reset or reload. Progress is session-local; save/load belongs to its later roadmap task.

`pnpm test` runs eight dialogue tests and eleven quest/integration tests, including alternative authored data, exact event matching, ordering, duplicates, reset, stale callbacks, and the actual guide/box IDs.

## Asset and content boundaries

`AssetManager.ts` currently contains the real prerequisite loader, `loadPhysics`. It does not introduce a speculative model cache. Add PlayCanvas resource handlers and registry-backed asset loading when the first external asset is used. Track source/license/attribution beside every imported asset, and preserve `public/ammo/LICENSE` and `SOURCE.md`.

All foundation content is procedural placeholder geometry. Episode content is documented separately. The `.gitkeep` files make the requested asset categories survive a fresh clone.

## Future structure

These are reserved responsibilities, not implemented systems:

| Location                                                          | First feature that should introduce it                |
| ----------------------------------------------------------------- | ----------------------------------------------------- |
| `systems/InventorySystem.ts`                                      | A usable item and protected quest-item behavior       |
| `systems/CutsceneSystem.ts`                                       | An authored sequence with input handoff/skip behavior |
| `systems/SaveSystem.ts`                                           | Versioned state and a verified checkpoint/load path   |
| `episodes/episode-01/{CoffeeShop,Beach,Hospital,KiroweenCity}.ts` | The corresponding approved scene milestone            |
| `networking/`                                                     | A Colyseus shared-session proof                       |

Future persistence uses NestJS/PostgreSQL outside browser rendering. No backend, multiplayer connection, complete coffee shop, or Episode 1 progression exists in this foundation. See [TASKS.md](TASKS.md) for its verification status before advancing scope.

## API sources consulted

- Installed `node_modules/playcanvas/build/playcanvas.d.ts`: AppBase/AppOptions, WasmModule, Script/ScriptComponent, Keyboard, raycast options, camera tone mapping.
- Installed `node_modules/playcanvas/scripts/esm/third-person-controller.mjs`: public settings, input mapping, damping, grounding, camera collision, and destroy behavior.
- [Official v2.23.3 third-person example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/gaussian-splatting/third-person.example.mjs).
- [Official v2.23.3 falling-shapes example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/falling-shapes.example.mjs).
- [Official v2.23.3 raycast example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/raycast.example.mjs).

The direct-Engine build-app, reuse-scripts, assemble-scene, apply-conventions, light-scene, find-examples, and inspect-runtime skill guidance informed the integration.
