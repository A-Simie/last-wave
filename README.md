# Last Wave

A browser-based, stylized third-person social-discovery game built with **PlayCanvas Engine, TypeScript, Vite, and pnpm**, starting from the official PlayCanvas Third-Person Controller starter.

## Current playable milestone

A playable **cinematic Tideline café and open Seafront Avenue** inside the resettable foundation area: a furnished room, nine animated character variants, a TV reporter, music, dialogue, belongings pickup, and a lively street. Pumpkin-and-bat branding introduces the Halloween setting. Third-person movement, collision, reusable quests, inventory/journal, and local checkpoints support the experience. [Project checklist and verification](docs/TASKS.md) · [Architecture and project structure](docs/ARCHITECTURE.md) · [Contributor handoff](docs/AGENT_CONTEXT.md).

### Play the story opening

1. Wait for the furnished café, then click or tap **Play story**. This gesture starts the music and television playback.
2. Watch the 15.4-second climate report presented by **Elizabeth Lee / Voice of America**. It advances to the conversation automatically; **Skip bulletin** advances immediately. Read the four friend replies using **Next**, then **Let’s go**. **Skip intro** or Esc also hands over to gameplay.
3. **CC** starts enabled. **Sound** mutes both tracks and keeps subtitles readable; **Retry playback** recovers failed media. **Steady camera** removes camera motion and defaults to your system's reduced-motion preference.
4. Your friend stands and walks outside. Approach the table until **Collect belongings** appears, then press E or tap it to take your bag and phone. Press J to read the protected item in **Bag / journal**.
5. Optionally read the TV bulletin or talk to the attendant. Follow your friend through the café door and use **Head outside** to finish the opening objectives. Explore the shops, houses, sidewalks, crosswalk, moving cars, suited commuters, and umbrella-carrying pedestrians outside.
6. Use **P → Save checkpoint** to retain progress. **Replay intro** preserves objectives, items, player position, and an in-progress departure.

The environment uses **28 prop GLBs and nine rigged character GLBs**. Each of the café's four tables has a rotating ceiling fan. Outside are 15 neighboring buildings, eight walking pedestrians, three sun umbrellas, two briefcases, four moving cars, and two animated drivers. Runtime models live in `public/assets/props/tideline/` and `public/assets/characters/`; preparation records and supplied originals live in `asset-library/`. **Save / load → Art & audio credits** lists the creators and licenses.

The TV uses credited VOA newsroom footage with the reporter's original voice and six matching caption cues. The source story's fictional coastal bulletin remains available through the optional TV interaction. After the bulletin, the screen loops silently beneath the music. The guided street tutorial, pedestrian directions, beach entrance/officer/tickets/queue, populated beach, and wave-disaster sequence remain pending in the [story roadmap](docs/TASKS.md#lw-s002--guided-street-and-beach-entry). The friend is a fictional NPC; the design introduces the real-player meeting in Episode 2.

### Controls

Click the scene to capture the mouse. Press **Esc** to release it.

| Input                     | Action                                       |
| ------------------------- | -------------------------------------------- |
| WASD / arrow keys         | Move relative to camera direction            |
| Shift                     | Sprint                                       |
| Space                     | Jump                                         |
| Mouse                     | Orbit camera                                 |
| Mouse wheel               | Zoom                                         |
| E                         | Interact while the prompt is visible         |
| J / Journal               | Open or close the inventory and clue journal |
| P / Save / load           | Open or close checkpoint controls            |
| Tab / Enter               | Navigate and activate modal controls         |
| Esc                       | Close the active modal or release the mouse  |
| Controls → Restart café   | Start fresh and retain the checkpoint        |
| Play story / Replay intro | Read or replay the opening story sequence    |

After the opening, click the scene to resume desktop input. Interactions appear near their objects when you are in range. On touch devices, the starter uses left drag to move, right drag to look, a farther left drag to sprint, and a right-side double-tap to jump; tap the interaction button when it appears.

The optional foundation guide and amber signal box remain in the courtyard west of the café, near X=-1.1, Z=-5.5/-3.5. Approach **Guide** to talk. Choose responses with Tab/Enter, click, or touch. Conversations pause player controls and release the mouse. Use a goodbye response, **End conversation**, or Esc to close; click the scene to resume desktop play.

### Signal check quest

1. Talk to the guide. Choose **What should I investigate?**, then **I will check the signal box.**
2. Close the acknowledgement with **On my way.** and inspect the amber signal box using E or the touch button.
3. Return to the guide and choose **I checked the signal box.** to finish.

The HUD prioritizes the opening objectives, then shows the tutorial quest once the opening is complete and the tutorial has been accepted. Early or repeated actions do not skip objectives. The guide offers reminders while its quest is active and acknowledges completion afterward. **Restart café** or reloading starts fresh progress; **Load checkpoint** restores an explicit save.

### Inventory and clue journal

Inspect the amber signal box to collect the **Signal box note**. The HUD shows the new clue and updates the journal's item count. Press **J** or click/tap **Journal** / **Bag / journal** to read its title, source, and full text. Close with **J**, **Esc**, or **Close journal**; click the scene to resume desktop play. The journal pauses player controls while open and is available after closing any conversation.

The note can be collected before accepting the quest. Repeated inspections keep one copy, and reporting to the guide keeps the note in your journal. The story bag is a protected quest item, displayed separately from the clue count. Checkpoint saves include both.

### Checkpoint save/load

Press **P** or click/tap **Save / load** after closing any conversation or journal. The menu suspends player controls and releases the mouse.

- **Save checkpoint** records the foundation scene, player position, foundation/story objectives, and collected item IDs. Each save replaces the one local checkpoint.
- **Load checkpoint** rebuilds the area at the saved position and restores progress. Close the menu to resume; desktop players click the scene to capture the mouse.
- **Controls → Restart café** and page reload start fresh gameplay while keeping the checkpoint available for explicit loading.
- **Delete checkpoint** removes the stored checkpoint while retaining the current playable progress.

The checkpoint belongs to this browser and site origin, including its port. Save manually before leaving. The menu reports missing, damaged, unsupported, or unavailable storage; failed reads or writes retain the current game and any existing checkpoint. Positions must be inside the foundation area and clear of solid geometry. Camera orientation returns to its default and movement starts at rest after loading.

Valid version-1 foundation saves migrate to version 2 in memory, with an unstarted opening; only an explicit save rewrites the slot. Every saved position must clear the current café and neighborhood geometry, including older saves. Once the opening has been watched or skipped, loads place the friend outside; the bag remains on the table until its pickup objective is complete. Animation and media playback time are not saved.

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

| Script      | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `dev`       | Start the Vite development server and open the app                     |
| `build`     | Build for production                                                   |
| `start`     | Preview the production build and open the app                          |
| `lint`      | Run ESLint                                                             |
| `fmt`       | Check formatting                                                       |
| `typecheck` | Run TypeScript checks                                                  |
| `test`      | Run gameplay, checkpoint validation/storage, and scene-lifecycle tests |

Run `pnpm run build` to generate a deployable static site in `dist/`. Its paths are relative, so it runs from any folder, such as a GitHub Pages project site or an itch.io upload.

## Coding agents

`AGENTS.md` gives coding agents this project's rules and milestone. `CLAUDE.md` imports it for Claude Code. Every completed task must update `docs/TASKS.md` with changes, verification, limitations, and the next action so another contributor can continue immediately.

## Design and assets

- [Game design](docs/GAME_DESIGN.md) and [Episode 01 reference](docs/EPISODE_01.md) index the original design documents.
- `public/assets/` holds runtime models, audio, video, captions, and credits. See its [asset notes](public/assets/README.md).
- The foundation combines imported props and animated characters with project-created architecture/artwork and the starter's licensed Ammo runtime. The [source library](asset-library/README.md) tracks originals, licenses, preparation, and hashes. Episode transitions and backend/multiplayer systems are reserved for future milestones.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas Engine manual](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas examples](https://playcanvas.github.io/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
