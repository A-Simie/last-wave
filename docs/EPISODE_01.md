# Episode 01 — Design reference

**The Day the Ocean Disappeared** is specified in [Last_Wave_Episode_01_Story_and_Level_Design.docx](Last_Wave_Episode_01_Story_and_Level_Design.docx), version 1.0, dated 2026-11-02.

The planned sequence is coffee shop → beach/evacuation → hospital → Kiroween City. The source document owns dialogue, narrative guardrails, objectives, item placement, and proposed checkpoints. It remains a working draft requiring playtesting.

## Implemented opening — LW-S001 / LW-A003

**Play story** starts §1A, **The Last Normal Day**, inside `src/scenes/FoundationScene.ts`:

- The complete fictional bulletin and four friend-exchange lines are authored in `src/episodes/episode-01/opening.ts`. Friend A is **You** and Friend B is **Friend**.
- The cinematic TV plays a 15.4-second report presented by **Elizabeth Lee / Voice of America**, with her original voice and six synchronized caption cues. It advances once on completion; the canonical fictional offshore bulletin remains in the optional TV conversation and on the screen's fictional ticker. The reporter's credited excerpt is from _The Inside Story — Confronting the Climate Crisis_.
- A moving TV shot and alternating, reader-paced speaker shots support **Next**, **Skip bulletin**, **Skip intro** / Escape, **Sound**, **CC**, **Steady camera**, and playback recovery. Captions default on and the motion option honors the OS preference.
- The furnished room includes seated friends/patrons, a barista, a rotating fan over each of four tables, artwork, and an imported bag. Outside, an open avenue has shops, houses, walking pedestrians, suited commuters, carried umbrellas/briefcases, moving cars, and seated drivers. The friend stands and walks through the door immediately after the opening exchange, before the player collects belongings.
- Proximity-only bag/phone pickup, a readable protected inventory item, optional TV/attendant conversations, and a guarded **Head outside** interaction complete the flow.
- Ordered opening → belongings → exit progress; early departure prompts a reminder. Replay never resets progress. Version-2 manual checkpoints restore story state and accept legacy foundation saves.
- The doorway completes the opening objectives in the foundation scene; the surrounding avenue remains explorable. Beach entry and the subsequent story progression are pending.

`OpeningPrototype.ts` builds the stage with the foundation scene; `OpeningActors.ts` owns the seated/standing handoff and pausable route. `OpeningCamera.ts` owns framing, `OpeningMedia.ts` owns playback, and `CafeTelevision.ts` renders the footage. `openingLayout.ts` and `cafeLayout.ts` share colliders with checkpoint validation. Optional attendant/reminder text is draft flavor; the original DOCX files remain the narrative source.

The room, animated cast, four fans, street population, cinematic UI, music, reporter playback, and pumpkin/bat/web branding are implemented. Later `CoffeeShop.ts`, `Beach.ts`, `Hospital.ts`, and `KiroweenCity.ts` scene modules are not implemented.

## Requested continuation — 2026-11-06

The requested flow is retained in full under **LW-S002–LW-S004** in [TASKS.md](TASKS.md):

1. **Learn after collecting belongings:** short instructional modals teach movement, looking, and interaction, with keyboard/touch instructions and successful-input handoff. Ask pedestrians for beach directions while the friend accompanies the player along the lively street.
2. **Beach entrance:** reveal a large, recognizable entrance. An officer gives cinematic directions to the ticket booth and queue. Buy admission, then join the entrance queue. This extends the draft's direct café-to-beach route and replaces its earlier no-mandatory-purchase assumption for the admission beat; the purchase must remain achievable without grind or a softlock.
3. **Arrival:** transition through a black loading screen, then place both characters together on a populated white-sand beach. Include umbrellas, loungers, people in swimwear, swimmers, and chilled drinks, with an ordinary relaxed social interval.
4. **Warning:** guide attention through retreating water, fleeing birds, pointing crowds, and the distant large wave. Build a readable escalation through environmental sound, crowd reactions, and camera movement. Preserve the source's clear evacuation-to-higher-ground direction.
5. **Disaster and blackout:** escalate to panic and fleeing crowds, separation, the player's fall, a lowered viewpoint, blinking eyelids closing, and another black loading screen. Coordinate sound and camera movement for believable tension; the existing steady-camera/caption preferences carry through.

These story beats are pending implementation and acceptance. The current black branded screen covers startup only. The supplied DOCX files remain preserved; this section records the user's continuation request against their working draft.

## Continuity for subsequent story tasks

1. **Café → guided street → ordinary beach:** preserve a brief social opening and optional café conversations. The requested tutorial, directions, officer, ticket, and queue beats lead into the beach arrival.
2. **Retreat → evacuation:** the ocean retreat is a danger cue; the mandatory route leads to higher ground. The fictional anomaly is not scientifically attributed to El Niño. The friend is separated before the blackout.
3. **Hospital:** Subject 017's wristband, flashlight, procedure tray, patient file, maintenance note, circuit puzzle, keycard, and recording contradiction build the mystery. Hospital documents are unreliable evidence, not confirmed answers.
4. **Kiroween City:** the town's ordinary Halloween routines contrast with the incident. The four quests introduce the map, safe room, Subject 018 lead, and invitation. The finale depends on the mandatory clues/invitation.
5. **Episode 2:** the first intended real-player meeting follows independent Episode 1 completion. Fictional character history is a mystery, not proof of romance or a relationship between real strangers. Optional conversation and social connection remain the product's focus.

Before taking an episode task, review foundation verification in [TASKS.md](TASKS.md) and the ownership/extension points in [ARCHITECTURE.md](ARCHITECTURE.md).
