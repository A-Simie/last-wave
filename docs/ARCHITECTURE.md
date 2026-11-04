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
│   │   └── InteractionSystem.ts      # Proximity, sightline, action, timed message state
│   ├── scenes/
│   │   └── FoundationScene.ts        # The current test environment
│   ├── episodes/episode-01/          # Reserved, with a scope README
│   ├── ui/
│   │   ├── GameHud.ts
│   │   └── game.css
│   ├── data/
│   │   └── foundation.ts             # Layout and interaction definitions
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
├── package.json / pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

## Lifecycle and ownership

`index.html → main.ts → createGame(canvas) → loadPhysics() → AppBase.init() → app.start() → SceneManager.load()`.

- `createGame` returns the actual `AppBase`; there is no second game loop or wrapper application lifecycle.
- The original minimal render/camera/light/script/collision/rigid-body component systems are registered. `Keyboard` is opt-in for E; the shipped controller owns its own keyboard/mouse, touch, and gamepad sources.
- `SceneManager.load(name, build)` destroys the previous root, attaches one unscaled root, and invokes a synchronous scene builder. It also cleans up a partially built scene if construction fails. Reset uses the same builder as startup.
- Scene roots own all entities. The foundation root releases its shared procedural materials on destruction. Engine Script destruction releases the stock controller's input sources.
- The application owns HUD actions, E-key handling, and the resize listener. `app.destroy()` releases them and the scene; `main.ts` invokes that path on Vite module disposal.
- Physics uses the starter's local Ammo runtime and loads before app/rigid-body creation. In this AppBase setup, `app.start()` installs the Ammo physics world, so it must run before building scene colliders/bodies. Loading failures reach the startup error display. URLs respect Vite's relative base path.

## Player, animation, and camera

**Decision: adapt the official controller rather than fork its algorithms.** `PlayerController.ts` imports `ThirdPersonController` from `playcanvas/scripts/esm/third-person-controller.mjs`. It retains WASD/arrow movement, Shift sprinting, Space jump, mouse orbit, wheel zoom, and the original touch/gamepad mappings.

The upstream script integrates camera-relative movement and camera positioning in one update. Our camera entity and tuning live in `CameraController.ts`; the player adapter applies those settings to the upstream script. This separates project configuration without duplicating its coupled input/physics/orbit implementation.

- Ground speed parameter: 60; sprint multiplier: 1.5; jump impulse: 520; body mass: 70; gravity: `(0, -18, 0)`. `speedGround` is the controller's acceleration-style parameter, not a direct m/s cap.
- Camera distance: 5 m; target height: 0.5 m above the player's pivot; initial pitch: 15°; FOV: 55°. Position/look-at damping is 0.97 (fraction retained per millisecond) for smooth follow. Upstream orbit sensitivity, collision padding/damping, pitch limits, and zoom behavior remain in the shipped implementation.
- `PlayerAnimation` retains velocity-driven arm/leg swings and body bob. Limb nodes are looked up once. There are no GLB clips, animation assets, or retargeting in this milestone.
- `CharacterModel` builds the original six-part humanoid. Player and stationary NPC share geometry/materials as appropriate; only the player has a movement/animation script.

**Compatibility constraint:** the starter corrects ledge grounding by replacing the controller's internal `_grounded` property with nine downward probes. There is no public ground-query hook in 2.23.3. That one existing compatibility shim is isolated in `PlayerController.ts`. On any PlayCanvas upgrade, inspect the shipped script and re-test jumps on a ledge and above foliage before accepting the upgrade. `src/scripts.d.ts` declares only public fields this project configures.

## Physics and scene composition

- Coordinates use meters, +Y up, with camera forward along -Z. The ground surface is at Y=0.
- Physical roots keep unit scale. Collider dimensions are explicit; scaled primitive visuals are children. Positions/heading are applied before creating static rigid bodies.
- The player/NPC box has half extents `(0.4, 1.2, 0.4)` and local collision offset `(0, 0.2, 0)`. Its bottom is 1 m below its pivot, inside the 1.1 m ground probes. The box preserves stable ledge standing from the starter.
- Blocks, walls, trunks, log, stump, NPC, and signal box are solid static colliders. Tree crowns retain trigger-only colliders: they intercept camera rays but do not block the player or count as ground.
- The 20×20 m area has 3.2 m perimeter walls. Wall corners meet; the existing obstacle layout remains available for jump/collision checks. NPC and box coordinates are in `data/foundation.ts`.
- One directional shadow-casting light, shared StandardMaterials, explicit neutral tone mapping, and 1024-pixel shadow maps keep the prototype simple. Device pixel ratio remains at the starter's 1× default. Hardware frame budgets still require device testing.

## Interaction and UI boundary

`InteractionSystem` is an Engine Script with a player reference and an explicit list of `Interactable` definitions: stable ID, entity, label, radius, and response message.

1. In `postUpdate`, select the nearest enabled target within its **3D center-to-center radius**.
2. Raycast from player pivot to target pivot, excluding the player and non-solid triggers. A different solid hit blocks the interaction.
3. Publish `InteractionState` (target label and message) only when the visible state changes.
4. `interact()` rechecks the target immediately, then starts a four-second message timer. It is ignored while the app is paused.

`Game.ts` forwards a fresh E press while pointer lock belongs to the game canvas. Repeated keydown events and modified shortcuts are ignored. The HUD button calls the same action for pointer/touch input. Range and visibility rules are enforced for both paths.

`GameHud` renders state with `textContent`; the DOM is not the game-state store. Input/actions, scene rendering, and interaction rules have distinct owners. The current lightweight DOM overlay is sufficient; the existing React dependencies can support later UI work without moving state into components. A future dialogue/quest feature should extend the interaction outcome contract when it actually needs richer actions.

## Asset and content boundaries

`AssetManager.ts` currently contains the real prerequisite loader, `loadPhysics`. It does not introduce a speculative model cache. Add PlayCanvas resource handlers and registry-backed asset loading when the first external asset is used. Track source/license/attribution beside every imported asset, and preserve `public/ammo/LICENSE` and `SOURCE.md`.

All foundation content is procedural placeholder geometry. Episode content is documented separately. The `.gitkeep` files make the requested asset categories survive a fresh clone.

## Future structure

These are reserved responsibilities, not implemented systems:

| Location                                                          | First feature that should introduce it                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| `systems/DialogueSystem.ts`                                       | An authored NPC conversation with a typed dialogue definition |
| `systems/QuestSystem.ts`                                          | A data-driven objective with prerequisite/completion tests    |
| `systems/InventorySystem.ts`                                      | A usable item and protected quest-item behavior               |
| `systems/CutsceneSystem.ts`                                       | An authored sequence with input handoff/skip behavior         |
| `systems/SaveSystem.ts`                                           | Versioned state and a verified checkpoint/load path           |
| `episodes/episode-01/{CoffeeShop,Beach,Hospital,KiroweenCity}.ts` | The corresponding approved scene milestone                    |
| `networking/`                                                     | A Colyseus shared-session proof                               |

Future persistence uses NestJS/PostgreSQL outside browser rendering. No backend, multiplayer connection, complete coffee shop, or Episode 1 progression exists in this foundation. See [TASKS.md](TASKS.md) for its verification status before advancing scope.

## API sources consulted

- Installed `node_modules/playcanvas/build/playcanvas.d.ts`: AppBase/AppOptions, WasmModule, Script/ScriptComponent, Keyboard, raycast options, camera tone mapping.
- Installed `node_modules/playcanvas/scripts/esm/third-person-controller.mjs`: public settings, input mapping, damping, grounding, camera collision, and destroy behavior.
- [Official v2.23.3 third-person example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/gaussian-splatting/third-person.example.mjs).
- [Official v2.23.3 falling-shapes example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/falling-shapes.example.mjs).
- [Official v2.23.3 raycast example](https://github.com/playcanvas/engine/blob/v2.23.3/examples/src/examples/physics/raycast.example.mjs).

The direct-Engine build-app, reuse-scripts, assemble-scene, apply-conventions, light-scene, find-examples, and inspect-runtime skill guidance informed the integration.
