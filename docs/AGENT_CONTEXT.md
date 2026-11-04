# Contributor handoff

Read these in order:

1. `AGENTS.md` — project rules and current milestone.
2. `docs/TASKS.md` — implementation status, checks, known limitations, and next actions.
3. `docs/ARCHITECTURE.md` — module ownership, lifecycle, tuning, and upgrade constraints.
4. `README.md` — setup and controls.

The active entry point is `src/main.ts`; the playable level is `src/scenes/FoundationScene.ts`. Runtime layout and interaction definitions live in `src/data/foundation.ts`. The original design DOCX files are indexed by `docs/GAME_DESIGN.md` and `docs/EPISODE_01.md`.

After finishing a task, update `docs/TASKS.md` with exact checks/results and a concrete continuation point. Update architecture when changing boundaries or ownership. Keep unverified behavior visible in the handoff.
