# Last Wave — Game design reference

Last Wave is a browser-based, stylized third-person social-discovery game. Two strangers get to know one another through cooperative activities framed by a Halloween mystery. Social connection is the primary experience.

## Source of truth

The full working design is [Last_Wave_Game_Design_Bible_and_Build_Tracker.docx](Last_Wave_Game_Design_Bible_and_Build_Tracker.docx), version 1.0, dated 2026-11-02. Preserve this source; this Markdown file is an entry point, not a replacement narrative/design specification.

The selected implementation stack is PlayCanvas Engine, TypeScript, Vite, and pnpm. React is reserved for future game UI; Colyseus and NestJS/PostgreSQL are later realtime/persistence work. These choices supersede the draft document's earlier engine-evaluation wording.

## Active milestone

Core game systems in one test environment: movement, sprint, jump, camera follow, obstacle collisions, branching guide dialogue, and a data-driven quest to accept the guide's request, check the signal box, and report back. Inspecting the box also collects one unique maintenance note, readable in the clue journal. The HUD tracks objectives, completion, and collected clues; reset or reload starts fresh progress. All visuals, guide content, and the note are foundation placeholders; Episode 1 narrative remains owned by the story source. Scene transition and save/load are the next core-system milestone. See [TASKS.md](TASKS.md) for the checked roadmap and acceptance evidence, and [ARCHITECTURE.md](ARCHITECTURE.md) for code ownership.

Future story scope is indexed in [EPISODE_01.md](EPISODE_01.md). Validate this foundation before implementing those scenes.
