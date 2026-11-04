# Gameplay systems

`InteractionSystem.ts` selects the nearest enabled, visible target in range and publishes prompt/message state. Eligible actions show a timed message or invoke a scene-owned callback. Dialogue suspends selection and further interactions.

`DialogueSystem.ts` owns one authored conversation, validates node/choice links, and publishes speaker/text/choice state. It is independent of rendering and browser input. Authored content lives in `src/data/dialogues.ts`; verify it with `pnpm test`.

`QuestSystem.ts` is the next implementation task. Future milestones may add inventory/clue, cutscene, and save systems. Current scope, checklist, and handoff are in `docs/TASKS.md`.
