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
The forest entrance starts automatically in the single Engine, initially loading two shared rigs and forest assets. In-scene sound activation handles browser autoplay policy; Continue locally loads the remaining game assets before café construction. Play story gates café media, including unplayed checkpoints. Background/focus loss pauses media, gameplay and rendering while preserving modal/developer pause state. Browser verification must run muted and close its isolated browser afterward.
Tideline has 28 prepared prop GLBs, nine rigged character variants, four table-centered fans, music, and Halloween branding. The open street has shops/houses, pedestrians, suited commuters, carried umbrellas/briefcases, moving cars and drivers. Runtime assets and credits live in `public/assets/`; preserved originals, source records, calibration and hashes live in `asset-library/`.
LW-S002 continues through successful-input lessons, pedestrian directions, a solid accompanying friend, the beach entrance, cinematic officer directions, two protected passes, and a visible queue. A black loading handoff stages and validates a safe boardwalk/white-sand arrival before committing it; failure retains paid admission with retry/back recovery.
LW-S003 extends that arrival with umbrellas, loungers, four calibrated swimwear rigs, beachgoers/walkers/swimmers, calm procedural water and surf/gull ambience. Friend conversation, included chilled drinks and shoreline observation are three free-order discoveries. The solid friend routes around scenery and passing walkers; ambience supports shared mute, pause and retry.
LW-S004 continues automatically three unpaused seconds after all three discoveries: retreating water, fleeing birds, pointing crowds, wave reveal, playable evacuation, separation, rigged fall, blinking blackout and recoverable black ending. The city is 320×240 m with 39 buildings, 20 pedestrians and eight licensed Porsche cars; the beach is 96×48 m with open access/shoreline, 18 umbrellas, 31 loungers and 34 ambient characters. All 13 rigs use baked relaxed, speed-matched locomotion.
Version-5 checkpoints retain all four quests, inventory, area and before-wave/after-blackout boundaries, migrating versions 1–4 against historical geometry on read. Mid-wave/offshore saves project to safe beach ground. Replay/calm-beach recovery and reset/reload retain the manual checkpoint for explicit loading.
LW-C004, LW-S001, LW-A002, LW-A003, LW-S002, LW-S003 and LW-S004 have automated browser acceptance using supported Node 22.23.4. Physical-device acceptance remains under LW-F002. The current story ends at the blackout; hospital awakening requires its own task.
Use `docs/TASKS.md` for the checked roadmap, acceptance evidence, and next concrete task.

Do not implement future scenes yet.

## Task handoff

After each task, update `docs/TASKS.md` with completed work, exact checks/results, limitations, and the next action.
Update `docs/ARCHITECTURE.md` when ownership or contracts change, and keep `docs/AGENT_CONTEXT.md` current.

LW-A004 updates: beach 240 x 48 m with 561 additional people (about 600 total); street has 45 walkers, 10 crossers, 14 moving vehicles and six kiosks. Supplied models add 37 GLBs / 41,764,596 bytes. Commercial builds (`VITE_ASSET_POLICY=commercial`) substitute and exclude five NC models from output. Intro skip preference is `last-wave.intro-skip.v1`, with explicit Always skip / Just this time choices. See the LW-A004 continuation evidence in TASKS and the handoff; runtime calibration, target-device performance and version-5 saves displaced by new solids must not be represented as fully accepted until verified.

LW-A005 adds four open restaurant interiors to the existing city and raises supplied building placements to 24 (all nine house assets/two shops). Restaurant shell/furniture solids and rendering share restaurantLayout.ts; do not restore the old whole-block colliders over their doors. Umbrella holders use UmbrellaCarry.ts for a masked right-arm grip and finger attachment. The forest sign-in has 34 desktop pumpkins, four skeletons and extra webs/mist; mobile uses a smaller pumpkin set. Immediate local entry sequences optional forest and game loading. GitHub preparation and exclusions are documented in docs/GITHUB_PUSH.md; keep prepared public assets versioned.

## LW-S005 - Continuous evacuation and beach activities (2026-11-13)

The warning starts automatically three unpaused seconds after the three beach discoveries. Warning and fall/blackout shots have no Next/Skip controls. The player retains control of evacuation running; focus/background and explicit pause safeguards remain.

Calm beach water now combines smooth swells, smaller ripples, traveling foam and a gentle three-minute cosmetic tide. Swimmers and boats share its height sampler. Strollers use continuous curved circuits with acceleration and yielding; moving visible characters retain locomotion animation. Two animated horses with riders, two wheeled quad bikes with riders and two fast boats patrol separate shore/offshore routes and leave during the warning. Horse, boat, wheels and prepared riding animation add four CC0 assets (570,880 bytes), supported in both asset policies.

See `LW-S005-HANDOFF.md` for ownership, source links, reproduction, verification and remaining limits. No hospital scene, checkpoint version change or Git push is included.
