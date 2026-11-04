# Last Wave

A browser-based, stylized third-person social-discovery game built with **PlayCanvas Engine, TypeScript, Vite, and pnpm**, starting from the official PlayCanvas Third-Person Controller starter.

## Current playable milestone

A resettable test environment with an animated humanoid, a follow camera, solid walls/obstacles, a stationary purple NPC, and an amber signal box. [Task status and verification](docs/TASKS.md) · [Architecture and project structure](docs/ARCHITECTURE.md) · [Contributor handoff](docs/AGENT_CONTEXT.md).

### Controls

Click the scene to capture the mouse. Press **Esc** to release it.

| Input             | Action                                             |
| ----------------- | -------------------------------------------------- |
| WASD / arrow keys | Move relative to camera direction                  |
| Shift             | Sprint                                             |
| Space             | Jump                                               |
| Mouse             | Orbit camera                                       |
| Mouse wheel       | Zoom                                               |
| E                 | Interact while the prompt is visible               |
| Reset test area   | Rebuild the test scene and reset interaction state |

Find the amber signal box near the purple guide. Approach until **Press E to Interact** appears, then press E for a confirmation message. On touch devices, the starter uses left drag to move, right drag to look, a farther left drag to sprint, and a right-side double-tap to jump; tap the interaction button when it appears.

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

| Script      | Description                                        |
| ----------- | -------------------------------------------------- |
| `dev`       | Start the Vite development server and open the app |
| `build`     | Build for production                               |
| `start`     | Preview the production build and open the app      |
| `lint`      | Run ESLint                                         |
| `fmt`       | Check formatting                                   |
| `typecheck` | Run TypeScript checks                              |

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
