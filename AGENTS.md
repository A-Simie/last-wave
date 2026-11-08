# LAST WAVE — DEVELOPMENT RULES

## Project

Last Wave is a browser-based, stylized third-person 3D social-discovery game with a Halloween mystery storyline.

The primary experience is two strangers getting to know each other through cooperative gameplay.

## Technology

- PlayCanvas Engine
- TypeScript and Vite
- pnpm
- React for future game UI
- Colyseus for real-time multiplayer
- NestJS and PostgreSQL for persistence

## Engineering

1. Inspect existing files and dependencies first.
2. Use modern, documented PlayCanvas APIs.
3. Keep systems modular and strongly typed.
4. Separate rendering, game state and UI.
5. Use reusable interactions and data-driven quests.
6. Preserve the generated third-person starter.
7. Avoid unnecessary dependencies.
8. Use licensed assets or placeholder geometry.
9. Optimize for desktop and mobile browsers.
10. Never expose secrets in browser code.

## Verification

After changes:

- Run available lint and build scripts.
- Check TypeScript errors.
- Test gameplay in the browser where possible.
- Report any unverified behavior.
- Review the diff before committing.

## Current Milestone

Core game systems in the existing foundation test area.
Movement, camera, collision, interactions, reusable NPC dialogue, quest tracking, inventory, clue journal, and versioned local checkpoint save/load are implemented.
The foundation also hosts the cinematic Episode 1 opening: Play story, a voiced Elizabeth Lee / VOA report, reader-paced friend exchange, bag/phone pickup, optional café conversations, and the doorway handoff.
Launch game gates Engine/asset loading; Play story gates media, including unplayed checkpoints. Background/focus loss pauses media, gameplay and rendering while preserving modal/developer pause state. Browser verification must run muted and close its isolated browser afterward.
Tideline has 28 prepared prop GLBs, nine rigged character variants, four table-centered fans, music, and Halloween branding. The open street has shops/houses, pedestrians, suited commuters, carried umbrellas/briefcases, moving cars and drivers. Runtime assets and credits live in `public/assets/`; preserved originals, source records, calibration and hashes live in `asset-library/`.
LW-S002 continues through successful-input lessons, pedestrian directions, a solid accompanying friend, the beach entrance, cinematic officer directions, two protected passes, and a visible queue. A black loading handoff stages and validates a safe boardwalk/white-sand arrival before committing it; failure retains paid admission with retry/back recovery.
LW-S003 extends that arrival with umbrellas, loungers, four calibrated swimwear rigs, beachgoers/walkers/swimmers, calm procedural water and surf/gull ambience. Friend conversation, included chilled drinks and shoreline observation are three free-order discoveries. The solid friend routes around scenery and passing walkers; ambience supports shared mute, pause and retry.
Version-4 checkpoints retain all four quests, inventory and the Tideline/beach-arrival area, migrating version-1/version-2/version-3 saves on read. Reset/reload starts fresh gameplay while retaining the manual checkpoint for explicit loading.
LW-C004, LW-S001, LW-A002, LW-A003, LW-S002 and LW-S003 have automated browser acceptance using supported Node 22.23.4. Physical-device acceptance remains under LW-F002. The wave/blackout continuation remains pending under LW-S004.
Use `docs/TASKS.md` for the checked roadmap, acceptance evidence, and next concrete task.

Do not implement future scenes yet.

## Task handoff

After each task, update `docs/TASKS.md` with completed work, exact checks/results, limitations, and the next action.
Update `docs/ARCHITECTURE.md` when ownership or contracts change, and keep `docs/AGENT_CONTEXT.md` current.
