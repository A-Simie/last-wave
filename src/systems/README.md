# Gameplay systems

`InteractionSystem.ts` selects the nearest enabled, visible target in range and publishes prompt/message state. Eligible actions show a timed message or invoke a scene-owned callback, then publish the stable target ID through `onInteract`. Dialogue and journal use suspend selection and further interactions.

`DialogueSystem.ts` owns one authored conversation, validates node/choice links, and publishes speaker/text/choice state. Valid selections emit dialogue/node/choice IDs through `onChoice`. It is independent of rendering and browser input. Authored, progress-aware guide content lives in `src/data/dialogues.ts`.

`QuestSystem.ts` tracks one authored sequence of objectives with inactive/active/completed state. It consumes typed events, ignores duplicate/out-of-order actions, and releases progress/listeners on destruction. Definitions live in `src/data/quests.ts`; the scene routes validated interaction/dialogue events into the quest. The HUD only renders snapshots.

`InventorySystem.ts` owns unique collected item IDs from a validated catalog, publishes copied snapshots in acquisition order, and rejects duplicate/unknown pickups. The scene maps eligible signal-box interactions to the note in `src/data/items.ts`, independently of quest progress. `Game.ts` connects inventory snapshots to the HUD and journal; reset/destruction clears the model and callbacks.

Run `pnpm test` for dialogue, quest, inventory, and authored-flow integration tests. Current scope, checklist, and the scene-transition/save handoff are in `docs/TASKS.md`.
