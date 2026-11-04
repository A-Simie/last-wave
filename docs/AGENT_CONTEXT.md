# Contributor handoff

Read these in order:

1. `AGENTS.md` — project rules and current milestone.
2. `docs/TASKS.md` — implementation status, checks, known limitations, and next actions.
3. `docs/ARCHITECTURE.md` — module ownership, lifecycle, tuning, and upgrade constraints.
4. `README.md` — setup and controls.

The active entry point is `src/main.ts`; the playable level is `src/scenes/FoundationScene.ts`. Runtime layout and interaction definitions live in `src/data/foundation.ts`. Authored conversations live in `src/data/dialogues.ts`; `src/systems/DialogueSystem.ts` owns conversation state and `src/ui/DialoguePanel.ts` presents it. The original design DOCX files are indexed by `docs/GAME_DESIGN.md` and `docs/EPISODE_01.md`.

The project-wide checklist is at the top of `docs/TASKS.md`. LW-F001 (foundation) and LW-C001 (NPC dialogue) are complete with automated acceptance. The next implementation is LW-C002: one data-driven guide/signal-box quest. Physical-device acceptance remains a separate follow-up in LW-F002. Run `pnpm test` alongside lint, type-check, and build when changing dialogue.

After finishing a task, update `docs/TASKS.md` with exact checks/results and a concrete continuation point. Update architecture when changing boundaries or ownership. Keep unverified behavior visible in the handoff.
