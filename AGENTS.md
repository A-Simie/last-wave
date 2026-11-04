
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
Build and validate third-person movement,
camera follow, collision and one interaction.

Do not implement future scenes yet.
  