# Last Wave

A browser-based, stylized third-person social-discovery game built with **PlayCanvas Engine, TypeScript, Vite, and pnpm**, starting from the official PlayCanvas Third-Person Controller starter.

## Current playable milestone

A playable **Tideline café → guided Seafront Avenue → beach exploration** story route: cinematic reporter, music, dialogue, belongings, control lessons, a solid accompanying friend, pedestrian directions, tickets, a queue, and a black loading handoff to a populated white-sand beach. Share a conversation, chilled drinks and a quiet shoreline moment in any order among umbrellas, loungers, beachgoers and swimmers. Pumpkin-and-bat branding introduces the Halloween setting. Third-person movement, collision, reusable quests, inventory/journal, and local checkpoints support the experience. [Project checklist and verification](docs/TASKS.md) · [Architecture and project structure](docs/ARCHITECTURE.md) · [Contributor handoff](docs/AGENT_CONTEXT.md).

### Play from the café to the beach

1. Click or tap **Launch game** to load the furnished café, then **Play story** to start music and television playback. The initial launcher loads no 3D scene, audio, or video.
2. Watch the 15.4-second climate report presented by **Elizabeth Lee / Voice of America**. It advances to the conversation automatically; **Skip bulletin** advances immediately. Read the four friend replies using **Next**, then **Let’s go**. **Skip intro** or Esc also hands over to gameplay.
3. **CC** starts enabled. **Sound** mutes both tracks and keeps subtitles readable; **Retry playback** recovers failed media. **Steady camera** removes camera motion and defaults to your system's reduced-motion preference.
4. Your friend stands and walks outside. Approach the table until **Collect belongings** appears, then press E or tap it to take your bag and phone.
5. Follow the short **move**, **look**, and **interact** lessons. Dismissing a hint releases controls; you must actually walk, turn the camera, and choose **Head outside** at the doorway to progress. Optional TV and attendant conversations remain available.
6. Ask a pedestrian for beach directions and acknowledge the route: **east past Lemon Market, across the quiet side street, then left into the entrance plaza**. Follow the green signs with your friend, who waits and catches up when you run.
7. Talk to the officer at the large arch. The cinematic points out the ticket booth and queue. At the booth on the left, pay the **10 story credits already reserved on your phone** for two protected passes.
8. Join the marked queue on the right. Continue the friend/officer exchange, then **Enter together**. A black Last Wave loading screen leads to the boardwalk and white sand with your friend. A failed handoff offers **Retry entry** or **Back to the queue**.
9. Explore at your own pace. Talk with your friend, accept two included citrus waters from the cart, and look out at the shoreline in any order. The HUD lists the remaining moments and the nearest stop; your friend follows around furniture and passing walkers. **Sound: On / Off** controls the surf/gull ambience; **Enable beach sound** retries unavailable playback.
10. Use **J → Bag / journal** to read your belongings, passes, and clues. **P → Save checkpoint** retains the current area and progress, including each beach discovery. In Tideline, **Replay intro** preserves objectives, items, position, and companion route progress.

The environment uses **28 prop GLBs and 13 rigged character GLBs**, including four fitted swimwear variants. Each of the café's four tables has a rotating ceiling fan. Outside are 15 neighboring buildings, eight walking pedestrians, three sun umbrellas, two briefcases, four moving cars, and two animated drivers. The beach adds six striped umbrellas, seven loungers, five standing beachgoers, an attendant, two walkers and four swimmers around the two friends. Runtime models live in `public/assets/props/tideline/` and `public/assets/characters/`; preparation records and supplied originals live in `asset-library/`. **Save / load → Art & audio credits** lists the creators and licenses.

The TV uses credited VOA newsroom footage with the reporter's original voice and six matching caption cues. The source story's fictional coastal bulletin remains available through the optional TV interaction. After the bulletin, the screen loops silently beneath the music. [LW-S003](docs/TASKS.md#lw-s003--beach-exploration) ends with a relaxed, freely explorable beach; completing all three moments keeps it playable. The wave/disaster continuation is the next story milestone, LW-S004. The friend is a fictional NPC; the design introduces the real-player meeting in Episode 2.

Switching tabs or focusing another window pauses sound, video, gameplay, and rendering. Returning resumes the same state, including any open menu or developer pause. Reload returns to the launcher; an unplayed checkpoint still waits for **Play story**.

### Controls

Click the scene to capture the mouse. Press **Esc** to release it.

| Input                     | Action                                        |
| ------------------------- | --------------------------------------------- |
| WASD / arrow keys         | Move relative to camera direction             |
| Shift                     | Sprint                                        |
| Space                     | Jump                                          |
| Mouse                     | Orbit camera                                  |
| Mouse wheel               | Zoom                                          |
| E                         | Interact while the prompt is visible          |
| J / Journal               | Open or close the inventory and clue journal  |
| P / Save / load           | Open or close checkpoint controls             |
| Tab / Enter               | Navigate and activate modal controls          |
| Esc                       | Close the active modal or release the mouse   |
| Controls → Restart café   | Start fresh and retain the checkpoint         |
| Play story / Replay intro | Read or replay the opening story sequence     |
| Sound: On / Off           | Toggle the shared café/beach sound preference |

After the opening, click the scene to resume desktop input. Interactions appear near their objects when you are in range. On touch devices, the starter uses left drag to move, right drag to look, a farther left drag to sprint, and a right-side double-tap to jump; tap the interaction button when it appears.

The optional foundation guide and amber signal box remain in the courtyard west of the café, near X=-1.1, Z=-5.5/-3.5. Approach **Guide** to talk. Choose responses with Tab/Enter, click, or touch. Conversations pause player controls and release the mouse. Use a goodbye response, **End conversation**, or Esc to close; click the scene to resume desktop play.

### Signal check quest

1. Talk to the guide. Choose **What should I investigate?**, then **I will check the signal box.**
2. Close the acknowledgement with **On my way.** and inspect the amber signal box using E or the touch button.
3. Return to the guide and choose **I checked the signal box.** to finish.

The HUD tracks the opening, beach-entry objectives, then three free-order beach moments. Once accepted, **Signal check** appears as a secondary objective in Tideline. Early or repeated actions do not skip ordered objectives. The guide offers reminders while its quest is active and acknowledges completion afterward. **Restart café** or reloading starts fresh progress; **Load checkpoint** restores an explicit save.

### Inventory and clue journal

Inspect the amber signal box to collect the **Signal box note**. The HUD shows the new clue and updates the journal's item count. Press **J** or click/tap **Journal** / **Bag / journal** to read its title, source, and full text. Close with **J**, **Esc**, or **Close journal**; click the scene to resume desktop play. The journal pauses player controls while open and is available after closing any conversation.

The note can be collected before accepting the quest. Repeated inspections keep one copy, and reporting to the guide keeps the note in your journal. The bag and beach passes are protected story items, displayed separately from the clue count. All items and the independent signal quest survive beach entry and checkpoints.

### Checkpoint save/load

Press **P** or click/tap **Save / load** after closing any conversation or journal. The menu suspends player controls and releases the mouse.

- **Save checkpoint** records the current area (Tideline or beach exploration), player position, all four quest states, and collected item IDs. Each save replaces the one local checkpoint.
- **Load checkpoint** rebuilds the area at the saved position and restores progress. Close the menu to resume; desktop players click the scene to capture the mouse.
- **Controls → Restart café** and page reload start fresh gameplay while keeping the checkpoint available for explicit loading.
- **Delete checkpoint** removes the stored checkpoint while retaining the current playable progress.

The checkpoint belongs to this browser and site origin, including its port. Save manually before leaving. The menu reports missing, damaged, unsupported, or unavailable storage; failed reads or writes retain the current game and any existing checkpoint. Positions must be inside the foundation area and clear of solid geometry. Camera orientation returns to its default and movement starts at rest after loading.

New checkpoints use **version 4**. Valid version-1/version-2/version-3 saves migrate in memory; only an explicit save rewrites the slot. Version 1 starts an unplayed opening; version 2 retains opening progress, and completed departures receive the three control objectives. Earlier saves begin with no beach discoveries. Older positions newly occupied by the entrance move safely beside the approach; version-3 beach positions occupied by new furniture or stationary people move to the clear boardwalk spawn. Other valid positions and paid admission are retained. The friend restores clear of the player near the relevant route, and unfinished lessons resume. Animation, cinematic, and media playback time are not saved. Beach entry never writes the manual checkpoint automatically.

## Prerequisites

Node.js 22.23.2 or later.

## Getting started

```bash
pnpm install
pnpm run dev
```

The app opens in your browser at <http://localhost:5173>. Edit the files under `src/` and save to see the scene update.

## Inspector

After **Launch game**, `pnpm run dev` loads the [PlayCanvas Inspector](https://github.com/playcanvas/inspector), a debug panel for the hierarchy, assets, materials, textures, frame graph and physics. Press the backquote key (<kbd>&#96;</kbd>) to show or hide it, <kbd>F9</kbd> to pause and <kbd>F10</kbd> to step a frame. `src/main.ts` imports `src/inspector.ts` before creating the app in development; production builds omit it.

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
- The foundation combines imported props and animated characters with project-created architecture/artwork and the starter's licensed Ammo runtime. The [source library](asset-library/README.md) tracks originals, licenses, preparation, and hashes. Later story areas and backend/multiplayer systems are reserved for future milestones.

## Agent skills

This project includes [`@playcanvas/skills`](https://github.com/playcanvas/skills) under `.claude/skills/` and `.agents/skills/`, so Claude Code, Codex and Cursor pick up PlayCanvas-specific workflows automatically.

## Further reading

- [PlayCanvas Engine manual](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas examples](https://playcanvas.github.io/)
- [Vite documentation](https://vite.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
