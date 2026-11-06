# Last Wave — Game design reference

Last Wave is a browser-based, stylized third-person social-discovery game. Two strangers get to know one another through cooperative activities framed by a Halloween mystery. Social connection is the primary experience.

## Source of truth

The full working design is [Last_Wave_Game_Design_Bible_and_Build_Tracker.docx](Last_Wave_Game_Design_Bible_and_Build_Tracker.docx), version 1.0, dated 2026-11-02. Preserve this source; this Markdown file is an entry point, not a replacement narrative/design specification.

The selected implementation stack is PlayCanvas Engine, TypeScript, Vite, and pnpm. React is reserved for future game UI; Colyseus and NestJS/PostgreSQL are later realtime/persistence work. These choices supersede the draft document's earlier engine-evaluation wording.

## Active milestone

The existing foundation area hosts **The Last Normal Day** in a furnished cinematic café: animated seated friends and patrons, four table-centered fans, a voiced Elizabeth Lee / VOA report, music, reader-paced friend dialogue, protected bag/phone acquisition, optional conversations, and a friend walking outside before pickup. An open avenue adds shops/houses, pedestrians, suited commuters, sun umbrellas, moving cars and drivers. Pumpkin/bat/web branding introduces the Halloween identity. The source bulletin and four friend lines remain authored in `opening.ts`; the TV footage has its own credited, matching transcript. Optional reminder/attendant/handoff copy is implementation draft content. Imported GLBs and project-created artwork/geometry supply the visuals.

The foundation's movement, camera, collision, guide tutorial, signal-check quest, and clue journal remain available. Manual version-2 checkpoints include both quests and collected items; loading validates and rebuilds the area. Legacy saves migrate in memory. Reset/reload starts fresh gameplay while retaining the checkpoint for explicit loading. See [TASKS.md](TASKS.md) for acceptance evidence and [ARCHITECTURE.md](ARCHITECTURE.md) for ownership.

The opening objectives finish at a guarded café-door interaction; the avenue remains explorable. The requested continuation is instructional movement/interaction modals → pedestrian directions → large beach entrance → officer directions → tickets/queue → black loading → both characters on a populated white-sand beach → retreat/birds/crowd/wave warning → panic/fall/blinking blackout → black loading. These pending beats are recorded in [EPISODE_01.md](EPISODE_01.md) and LW-S002–LW-S004 in [TASKS.md](TASKS.md).
