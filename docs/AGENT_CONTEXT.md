# Contributor handoff

Read these in order:

1. `AGENTS.md` — project rules and current milestone.
2. `docs/TASKS.md` — implementation status, checks, known limitations, and next actions.
3. `docs/ARCHITECTURE.md` — module ownership, lifecycle, tuning, and upgrade constraints.
4. `README.md` — setup and controls.

The active entry point is `src/main.ts`; the playable level is `src/scenes/FoundationScene.ts`. Runtime layout and interaction definitions live in `src/data/foundation.ts`. Authored conversations live in `src/data/dialogues.ts`; `src/systems/DialogueSystem.ts` owns conversation state and `src/ui/DialoguePanel.ts` presents it. Quest definitions live in `src/data/quests.ts`; `src/systems/QuestSystem.ts` owns ordered progress. The scene routes validated dialogue/interaction events into the quest, and `src/ui/GameHud.ts` renders its state. The original design DOCX files are indexed by `docs/GAME_DESIGN.md` and `docs/EPISODE_01.md`.

The project-wide checklist is at the top of `docs/TASKS.md`. LW-F001 (foundation), LW-C001 (NPC dialogue), and LW-C002 (quest tracking) are complete with automated acceptance. The quest milestone has 19 passing unit/integration tests and 66 passing production browser checks across quest, foundation, and dialogue suites. Progress resets with the scene or page reload.

Next implementation: **LW-C003 — inventory and clue journal**. Add one collectible clue associated with the existing signal box, duplicate-pickup protection, and a readable journal view. Keep state scene-owned, preserve dialogue/movement input handoff, and clear progress on reset. The concrete checklist is in `docs/TASKS.md`.

Run `pnpm test` alongside lint, type-check, and build when changing gameplay systems. Physical-device/browser/gamepad acceptance and Node version alignment remain under LW-F002. The existing `pnpm-lock.yaml` formatting finding remains documented in LW-C002.

After finishing a task, update `docs/TASKS.md` with exact checks/results and a concrete continuation point. Update architecture when changing boundaries or ownership. Keep unverified behavior visible in the handoff.
