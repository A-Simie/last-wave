# Last Wave — Game design reference

Last Wave is a browser-based, stylized third-person social-discovery game. Two strangers get to know one another through cooperative activities framed by a Halloween mystery. Social connection is the primary experience.

## Source of truth

The full working design is [Last_Wave_Game_Design_Bible_and_Build_Tracker.docx](Last_Wave_Game_Design_Bible_and_Build_Tracker.docx), version 1.0, dated 2026-11-02. Preserve this source; this Markdown file is an entry point, not a replacement narrative/design specification.

The selected implementation stack is PlayCanvas Engine, TypeScript, Vite, and pnpm. React is reserved for future game UI; Colyseus and NestJS/PostgreSQL are later realtime/persistence work. These choices supersede the draft document's earlier engine-evaluation wording.

## Active milestone

The existing foundation area hosts **The Last Normal Day** in a furnished cinematic café: animated seated friends and patrons, four table-centered fans, a voiced Elizabeth Lee / VOA report, music, reader-paced friend dialogue, protected bag/phone acquisition, optional conversations, and a friend walking outside before pickup. An open avenue adds shops/houses, pedestrians, suited commuters, sun umbrellas, moving cars and drivers. Pumpkin/bat/web branding introduces the Halloween identity. The source bulletin and four friend lines remain authored in `opening.ts`; the TV footage has its own credited, matching transcript. Optional reminder/attendant/handoff copy is implementation draft content. Imported GLBs and project-created artwork/geometry supply the visuals.

The foundation's movement, camera, collision, guide tutorial, signal-check quest, and clue journal remain available. Manual version-4 checkpoints include all four quests, collected items, and the Tideline/beach-arrival area; loading validates and rebuilds the destination. Version-1/version-2/version-3 saves migrate in memory. Reset/reload starts fresh gameplay while retaining the checkpoint for explicit loading. **Launch game** gates 3D loading; **Play story** gates café media, including unplayed checkpoints. Beach ambience starts on committed entry or explicit beach loading. Background/focus loss pauses gameplay, rendering and media. See [TASKS.md](TASKS.md) for acceptance evidence and [ARCHITECTURE.md](ARCHITECTURE.md) for ownership.

The implemented LW-S002 continuation runs through successful movement/look/interaction lessons → pedestrian directions → large beach entrance → cinematic officer directions → protected passes/queue → recoverable black loading → both characters at the white-sand/boardwalk arrival. LW-S003 supplies the populated beach: umbrellas, loungers, people in swimwear, swimmers, calm water and surf/gull ambience. Three free-order moments—friend conversation, included citrus waters and shoreline observation—preserve the ordinary social interval. The solid friend accompanies exploration around furniture and walkers. Completing the moments leaves the beach playable with a clear chapter-end message. LW-S004 is next: retreat/birds/crowd/wave warning → panic/fall/blinking blackout → black loading. Narrative continuity is in [EPISODE_01.md](EPISODE_01.md); the checked roadmap is in [TASKS.md](TASKS.md).
