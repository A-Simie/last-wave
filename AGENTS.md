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
Movement, camera, collision, interactions, reusable NPC dialogue, quest tracking, inventory, and clue journal are implemented and browser-verified.
The next implementation task is scene transition and save/load for the existing foundation area, starting with a versioned save-state contract.
Use `docs/TASKS.md` for the checked roadmap, acceptance evidence, and next concrete task.

Do not implement future scenes yet.

## Task handoff

After each task, update `docs/TASKS.md` with completed work, exact checks/results, limitations, and the next action.
Update `docs/ARCHITECTURE.md` when ownership or contracts change, and keep `docs/AGENT_CONTEXT.md` current.
