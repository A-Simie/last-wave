# Gameplay systems

`InteractionSystem.ts` selects the nearest enabled, visible target in range and publishes prompt/message state. It accepts an explicit interaction action from keyboard or UI input.

Future milestones may add `DialogueSystem.ts`, `QuestSystem.ts`, `InventorySystem.ts`, `CutsceneSystem.ts`, and `SaveSystem.ts`. Add implementations with their first usable feature and verification; current scope and handoff are in `docs/TASKS.md`.
