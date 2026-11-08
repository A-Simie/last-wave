# Episode 01

The first story flow is prototyped in the existing foundation area:

- `opening.ts`: source-based opening lines, optional conversations, protected bag, and ordered quest.
- `openingLayout.ts`: positions, camera shots, and static geometry shared with save validation.
- `cafeLayout.ts`: measured furniture footprints, floor/tabletop support, and additional story solids.
- `CafeDressing.ts`: imported café props, patrons, four table-centered fans, floor/wall dressing, signage, and local lighting.
- `CafeArtwork.ts` / `CafeSurroundings.ts`: illustrated panels, street, neighborhood façades, and shared solid footprints.
- `StreetLife.ts`: eight animated pedestrians, hand-attached umbrellas/briefcases, four cars, seated drivers, yielding/queuing, and scene-owned dynamic batching.
- `OpeningPrototype.ts`: eagerly built, scene-owned stage, interactions, media, and event wiring.
- `OpeningActors.ts`: seated dialogue, stand-up handoff, independent fan-blade rotation, and the friend's pausable departure before bag pickup.
- `OpeningCamera.ts`: moving TV shot, alternating speaker shots, portrait framing, and steady-camera mode.
- `OpeningMedia.ts`: music/video lifecycle, timed captions, visibility/time-scale pause, fallback, retry, and one-shot bulletin completion.
- `CafeTelevision.ts`: canvas-backed TV footage, captions, and fictional coastal-news graphics.
- `openingAudio.json` / `openingBroadcast.json`: runtime media filenames, durations, and caption cues.
- `entry.ts` / `entryLayout.ts`: lessons, pedestrian directions, officer/queue sequences, protected passes, routes and shared geometry.
- `StreetEntryProgress.ts` / `StreetEntry.ts`: ordered admission rules, interaction wiring and navigation guidance.
- `BeachEntrance.ts`, `EntryActors.ts`, `EntryCamera.ts`: entrance plaza, visible queue, officer/companion presentation and reader-paced destination shots.
- `beach.ts` / `beachLayout.ts`: three free-order discoveries, reusable conversations and checkpoint-shared furniture/population footprints.
- `BeachArrival.ts`: populated destination composition, interaction wiring, companion following, navigation and pause coordination.
- `BeachDressing.ts` / `BeachLife.ts`: white sand, boardwalk, umbrellas/loungers/drinks, stationary beachgoers, yielding walkers and animated swimmers.
- `BeachNavigation.ts`: static-grid paths, swept furniture clearance and dynamic walker detours, including escape from a close yielding encounter.
- `BeachWater.ts`: reusable calm surface/foam meshes and shared swimmer height sampling.
- `BeachAudio.ts` / `beachAudio.json`: scene-owned surf/gull playback, shared mute, pause, bounded loading/stall recovery and cleanup.

The active level is `src/scenes/FoundationScene.ts`, with `tideline` and `beach-arrival` areas. **Launch game** gates assets; **Play story** starts the 15.4-second Elizabeth Lee / VOA report. After belongings and actual movement/look practice, **Head outside** leads to directions, officer, passes and queue. A recoverable black loading handoff enters the populated beach. Friend conversation, included chilled drinks and shoreline observation are player-paced and may be completed in any order. Version-4 checkpoints retain all progress and validate the saved area's static geometry; actors spawn clear of the player. Wave/blackout progression remains LW-S004. Read `docs/TASKS.md` for acceptance and continuation tasks and `docs/EPISODE_01.md` for narrative sources.
