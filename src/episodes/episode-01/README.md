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

The active level is `src/scenes/FoundationScene.ts`. **Play story** starts the 15.4-second Elizabeth Lee / VOA report; the **Head outside** doorway interaction completes the opening objectives after belongings are collected. The surrounding street remains freely explorable. Valid checkpoints always include café/building/planter collision checks and restore the friend outside after the intro; newly spawned traffic/pedestrians clear the saved player. Guided street interactions, officer/tickets/queue, the beach transition, populated beach, and wave/blackout progression are pending. Read `docs/TASKS.md` for acceptance and continuation tasks and `docs/EPISODE_01.md` for narrative sources.
