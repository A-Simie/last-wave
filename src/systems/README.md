# Gameplay systems

`InteractionSystem.ts` selects the nearest enabled, visible target in range and publishes prompt/message state. Eligible actions show a timed message or invoke a scene-owned callback, then publish the stable target ID through `onInteract`. Dialogue suspends selection and further interactions.

`DialogueSystem.ts` owns one authored conversation, validates node/choice links, and publishes speaker/text/choice state. Valid selections emit dialogue/node/choice IDs through `onChoice`. It is independent of rendering and browser input. Authored, progress-aware guide content lives in `src/data/dialogues.ts`.

`QuestSystem.ts` tracks one authored sequence of objectives with inactive/active/completed state. It consumes typed events, ignores duplicate/out-of-order actions, and releases progress/listeners on destruction. Definitions live in `src/data/quests.ts`; the scene routes validated interaction/dialogue events into the quest. The HUD only renders snapshots.

Run `pnpm test` for dialogue, quest, and authored-flow integration tests. Inventory and clue journal are the next implementation task. Current scope, checklist, and handoff are in `docs/TASKS.md`.
