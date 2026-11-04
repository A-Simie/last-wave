# Contributor handoff

Read these in order:

1. `AGENTS.md` — project rules and current milestone.
2. `docs/TASKS.md` — implementation status, checks, known limitations, and next actions.
3. `docs/ARCHITECTURE.md` — module ownership, lifecycle, tuning, and upgrade constraints.
4. `README.md` — setup and controls.

The active entry point is `src/main.ts`; the playable level is `src/scenes/FoundationScene.ts`. Runtime layout and interaction definitions live in `src/data/foundation.ts`. Authored conversations live in `src/data/dialogues.ts`; `src/systems/DialogueSystem.ts` owns conversation state and `src/ui/DialoguePanel.ts` presents it. Quest definitions live in `src/data/quests.ts`; `src/systems/QuestSystem.ts` owns ordered progress. Item definitions live in `src/data/items.ts`; `src/systems/InventorySystem.ts` owns unique collected IDs and copied snapshots. The scene routes validated dialogue/interaction events into the models. `src/ui/GameHud.ts` renders their state, and `src/ui/JournalPanel.ts` presents readable clue details. `src/core/Game.ts` owns journal visibility and shared modal control handoff. The original design DOCX files are indexed by `docs/GAME_DESIGN.md` and `docs/EPISODE_01.md`.

The project-wide checklist is at the top of `docs/TASKS.md`. LW-F001 (foundation), LW-C001 (NPC dialogue), LW-C002 (quest tracking), and LW-C003 (inventory/journal) are complete with automated acceptance. The inventory milestone has **26 passing unit/integration tests** and **89 passing production browser checks** across inventory, quest, foundation, and dialogue suites. Build, lint, and TypeScript checks pass. Emulated touch includes 320×568 portrait and 640×360 landscape; the short-viewport interaction prompt was tightened after finding an overlap.

Inspecting the signal box collects one `signal-box-note`, independently of quest acceptance. Repeated inspections do not duplicate it, and reporting retains it. J or the HUD button opens the journal; J, Escape, or **Close journal** closes it. Dialogue and journal suspend movement/camera/interactions and release pointer lock. Inventory and quest progress reset with the scene or page reload.

Next implementation: **LW-C004 — scene transition and save system**. Start with a versioned save-state contract for the current foundation scene, player position, quest progress, and acquired clue IDs. Connect validated restoration through the existing scene lifecycle and verify reset/reload, input, and teardown. The concrete checklist is in `docs/TASKS.md`; Episode 1 scenes remain deferred.

Run `pnpm test` alongside lint, type-check, and build when changing gameplay systems. Physical-device/browser/gamepad acceptance and Node version alignment remain under LW-F002. The existing `pnpm-lock.yaml` formatting finding is recorded in the task tracker. Local CDP scripts and evidence are under `C:\Users\HP\AppData\Local\Temp\opencode\`; their commands and portable manual routes are in `docs/TASKS.md`.

After finishing a task, update `docs/TASKS.md` with exact checks/results and a concrete continuation point. Update architecture when changing boundaries or ownership. Keep unverified behavior visible in the handoff.
