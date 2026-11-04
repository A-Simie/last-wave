# Last Wave

A browser-based, stylized third-person social-discovery game built with **PlayCanvas Engine, TypeScript, Vite, and pnpm**, starting from the official PlayCanvas Third-Person Controller starter.

## Current playable milestone

A resettable test environment with an animated humanoid, a follow camera, solid walls/obstacles, a purple guide with branching dialogue, a tracked signal-box quest, and a collectible note with a clue journal. [Project checklist and verification](docs/TASKS.md) · [Architecture and project structure](docs/ARCHITECTURE.md) · [Contributor handoff](docs/AGENT_CONTEXT.md).

### Controls

Click the scene to capture the mouse. Press **Esc** to release it.

| Input             | Action                                          |
| ----------------- | ----------------------------------------------- |
| WASD / arrow keys | Move relative to camera direction               |
| Shift             | Sprint                                          |
| Space             | Jump                                            |
| Mouse             | Orbit camera                                    |
| Mouse wheel       | Zoom                                            |
| E                 | Interact while the prompt is visible            |
| J / Clue journal  | Open or close the clue journal                  |
| Tab / Enter       | Navigate and activate dialogue/journal controls |
| Esc               | Close dialogue/journal or release the mouse     |
| Reset test area   | Reset the scene, dialogue, quest, and inventory |

Find the amber signal box near the purple guide. Approach until **Press E to Interact** appears, then press E for a confirmation message. On touch devices, the starter uses left drag to move, right drag to look, a farther left drag to sprint, and a right-side double-tap to jump; tap the interaction button when it appears.

Walk beside the purple guide until the target label reads **Guide**, then interact to talk. Choose a response with Tab/Enter, click, or touch. Conversations pause player controls and release the mouse. Use a goodbye response, **End conversation**, or Esc to close; click the scene to resume desktop play.

### Signal check quest

1. Talk to the guide. Choose **What should I investigate?**, then **I will check the signal box.**
2. Close the acknowledgement with **On my way.** and inspect the amber signal box using E or the touch button.
3. Return to the guide and choose **I checked the signal box.** to finish.

The quest tracker shows the current objective and progress from 0/3 to 3/3. Early or repeated actions do not skip objectives. The guide offers reminders while the quest is active and acknowledges completion afterward. **Reset test area** or reloading the page starts fresh progress.

### Inventory and clue journal

Inspect the amber signal box to collect the **Signal box note**. The HUD shows the new clue and updates the journal count. Press **J** or click/tap **Clue journal** to read its title, source, and full text. Close with **J**, **Esc**, or **Close journal**; click the scene to resume desktop play. The journal pauses player controls while open and is available after closing any conversation.

The note can be collected before accepting the quest. Repeated inspections keep one copy, and reporting to the guide keeps the note in your journal. **Reset test area** or reloading clears collected clues.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
pnpm install
pnpm run dev
```

The app opens in your browser at <http://localhost:5173>. Edit the files under `src/` and save to see the scene update.

## Inspector

`pnpm run dev` loads the [PlayCanvas Inspector](https://github.com/playcanvas/inspector), a debug panel for the hierarchy, assets, materials, textures, frame graph and physics. Press the backquote key (<kbd>&#96;</kbd>) to show or hide it, <kbd>F9</kbd> to pause and <kbd>F10</kbd> to step a frame. It is wired up in `vite.config.ts` and `src/inspector.ts` and is left out of production builds.

## Scripts

Run these with `pnpm run <script>`:

| Script      | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `dev`       | Start the Vite development server and open the app             |
| `build`     | Build for production                                           |
| `start`     | Preview the production build and open the app                  |
| `lint`      | Run ESLint                                                     |
| `fmt`       | Check formatting                                               |
| `typecheck` | Run TypeScript checks                                          |
| `test`      | Run dialogue, quest, inventory, and authoring-validation tests |

Run `pnpm run build` to generate a deployable static site in `dist/`. Its paths are relative, so it runs from any folder, such as a GitHub Pages project site or an itch.io upload.

## Coding agents

`AGENTS.md` gives coding agents this project's rules and milestone. `CLAUDE.md` imports it for Claude Code. Every completed task must update `docs/TASKS.md` with changes, verification, limitations, and the next action so another contributor can continue immediately.

## Design and assets

- [Game design](docs/GAME_DESIGN.md) and [Episode 01 reference](docs/EPISODE_01.md) index the original design documents.
- `public/assets/` holds the requested character, animation, environment, prop, audio, and texture categories. See its [asset notes](public/assets/README.md).
- The foundation uses procedural geometry and the starter's licensed Ammo runtime. Episode scenes and backend/multiplayer systems are reserved for future milestones.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas Engine manual](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas examples](https://playcanvas.github.io/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
