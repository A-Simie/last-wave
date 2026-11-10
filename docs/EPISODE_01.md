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
- Ordered opening → belongings → exit progress; early departure prompts a reminder. Replay never resets progress. Version-5 manual checkpoints retain opening, guided-entry, beach discoveries, area and before-wave/after-blackout progress, migrating versions 1–4 on read.
- After belongings pickup, movement/look lessons lead to the doorway interaction. The doorway completes the opening objectives and hands off to pedestrian directions along the surrounding avenue.

`OpeningPrototype.ts` builds the stage with the Tideline area; `OpeningActors.ts` owns seated presentation and the handoff to the solid `CompanionController`. `OpeningCamera.ts` owns framing, `OpeningMedia.ts` owns playback, and `CafeTelevision.ts` renders the footage. `openingLayout.ts` and `cafeLayout.ts` share colliders with checkpoint validation. Optional attendant/reminder text is draft flavor; the original DOCX files remain the narrative source.

The room, animated cast, four fans, street population, cinematic UI, music, reporter playback, and pumpkin/bat/web branding are implemented. Later `CoffeeShop.ts`, `Beach.ts`, `Hospital.ts`, and `KiroweenCity.ts` scene modules are not implemented.

## Implemented guided street and admission — LW-S002

The story continues immediately after bag pickup. Three short lessons ask the player to **move**, **look**, then use **Head outside**; acknowledging a lesson alone does not complete it. The friend waits, accompanies the player and catches up when they run. A pedestrian directs the friends **east along Seafront Avenue, past Lemon Market, across the quiet side street, then left into the beach entrance plaza**. Green signs repeat the route; pedestrian conversations remain reusable.

At the large sea-green arch, the beach officer introduces the **ticket booth on the left** and the **marked queue on the right** through reader-paced cinematic shots. Two day passes cost **10 story credits**, already reserved on the collected phone. This is a single, attainable purchase for both fictional friends. The receipt and protected passes persist through checkpoints; retries cannot charge again.

The friends join the visible line. Friend says, **“Two passes, two of us. I can already feel the breeze from here.”** The officer accepts both passes and points them down the boardwalk. A **black Last Wave loading handoff** places both characters at the white-sand/boardwalk arrival. LW-S003 extends this destination into the populated beach and relaxed social interval below.

Dialogue, lesson copy and stable objective IDs are authored in `src/episodes/episode-01/entry.ts`. The friend has a solid, pausable moving body with player clearance and an accompanying street route. Officer and queue cinematics share the opening's reader-paced, skip and steady-camera controls. Failed arrival construction retains paid admission and offers retry or return to the queue. Manual saves preserve belongings, passes and the next objective; reset/reload starts the café fresh while retaining the saved slot. Exact acceptance and remaining device checks are recorded under LW-S002 in [TASKS.md](TASKS.md).

## Implemented beach exploration — LW-S003

Both friends arrive on a populated white-sand beach. LW-S004 expands it to 96×48 m with 18 striped umbrellas, 31 loungers, 17 stationary beachgoers, eight strolling walkers, an attendant and eight swimmers. Small waves and foam, distant gulls and soft surf preserve an ordinary afternoon. The companion follows through clear sand and furniture aisles, yielding to the player and routing around passing walkers. The shoreline fence and entrance cross-barriers are removed; supported shallows extend the open shore.

`src/episodes/episode-01/beach.ts` authors **A little sea air**, with three reader-paced discoveries available in any order:

1. **Talk with your friend.** The exchange begins with the source line **“See? I told you we needed to come out.”** Choose quiet by the water or good company, then acknowledge **“A breeze, a cold drink, and a little time together. Let’s enjoy it.”** Leaving early remains possible.
2. **Share chilled drinks.** The attendant offers a citrus water for each friend, included with their day passes. Accepting records the stop once; declining is reversible. This adds no further charge or inventory prerequisite.
3. **Look out at the shoreline.** Read the calm-water/swimmer observation and choose **“Take in the sea air.”** Walking away first grants no discovery. A nearby beachgoer's optional conversation offers local flavor and directions.

The HUD lists the remaining moments and nearest stop. Completed discoveries survive version-5 checkpoints in any subset, alongside earlier quests, belongings and paid admission. Completing all three leaves the beach freely playable and displays **“A moment shared. Save your beach checkpoint, or continue the story.”** The additional conversation and citrus-water copy is implementation draft content, preserving the supplied narrative's ordinary social opening.

## Implemented wave, evacuation and blackout — LW-S004

**Continue story** explicitly begins the warning after all three discoveries:

1. The water retreats, gulls flee inland, and crowds turn and point. Reader-paced camera beats guide attention to the approaching wave. The lifeguard calls **“MOVE AWAY FROM THE SHORE! GET TO HIGHER GROUND!”**
2. **Run for higher ground** or **Skip to evacuation** restores movement. Green arrows lead inland along the boardwalk and up the dune ramp. All 33 evacuees route around scenery and one another; the eight swimmers change from swimming to running as the exposed shore reaches them.
3. The player passes three ordered route gates. At the dune approach, the crowd separates the friend, who calls **“HEY! WAIT! DON’T LEAVE ME!”** There is no chase timeout; route progress drives the sequence.
4. A loose sign falls across the path. The rigged player falls, the camera lowers to ground level, and blinking eyelids reveal an approaching unidentified silhouette. Muffled rumble/wind and heartbeat accompany the loss of consciousness, followed by a black loading screen.
5. The segment ends at a recoverable **after-blackout** boundary. The ending offers manual saving, wave replay, return to the calm beach and the save/load menu. Replay/recovery retain discoveries and paid admission; saves during evacuation restart safely before the warning. The hospital begins with a separate future story task.

`WaveProgress.ts` owns state and checkpoint boundaries; `BeachWave.ts` coordinates the authored `wave.ts` beats with water, crowd, camera, actors and sound. Captions, shared mute, steady/reduced-motion presentation, pause and retry span the sequence. The warning and connective presentation copy remain implementation draft content; the unidentified figure supplies no canonical answer to the mystery.

## Requested continuation — 2026-11-06

The requested flow is retained in full under **LW-S002–LW-S004** in [TASKS.md](TASKS.md):

1. **Learn after collecting belongings:** short instructional modals teach movement, looking, and interaction, with keyboard/touch instructions and successful-input handoff. Ask pedestrians for beach directions while the friend accompanies the player along the lively street.
2. **Beach entrance:** reveal a large, recognizable entrance. An officer gives cinematic directions to the ticket booth and queue. Buy admission, then join the entrance queue. This extends the draft's direct café-to-beach route and replaces its earlier no-mandatory-purchase assumption for the admission beat; the purchase must remain achievable without grind or a softlock.
3. **Arrival:** transition through a black loading screen, then place both characters together on a populated white-sand beach. Include umbrellas, loungers, people in swimwear, swimmers, and chilled drinks, with an ordinary relaxed social interval.
4. **Warning:** guide attention through retreating water, fleeing birds, pointing crowds, and the distant large wave. Build a readable escalation through environmental sound, crowd reactions, and camera movement. Preserve the source's clear evacuation-to-higher-ground direction.
5. **Disaster and blackout:** escalate to panic and fleeing crowds, separation, the player's fall, a lowered viewpoint, blinking eyelids closing, and another black loading screen. Coordinate sound and camera movement for believable tension; the existing steady-camera/caption preferences carry through.

LW-S002 implements lessons through the safe arrival handoff; LW-S003 implements relaxed exploration; LW-S004 implements the warning through recoverable blackout. The supplied DOCX files remain preserved; this section records the user's continuation request against their working draft.

## Continuity for subsequent story tasks

1. **Café → guided street → ordinary beach:** preserve a brief social opening and optional café conversations. The requested tutorial, directions, officer, ticket, and queue beats lead into the beach arrival.
2. **Retreat → evacuation:** the ocean retreat is a danger cue; the mandatory route leads to higher ground. The fictional anomaly is not scientifically attributed to El Niño. The friend is separated before the blackout.
3. **Hospital:** Subject 017's wristband, flashlight, procedure tray, patient file, maintenance note, circuit puzzle, keycard, and recording contradiction build the mystery. Hospital documents are unreliable evidence, not confirmed answers.
4. **Kiroween City:** the town's ordinary Halloween routines contrast with the incident. The four quests introduce the map, safe room, Subject 018 lead, and invitation. The finale depends on the mandatory clues/invitation.
5. **Episode 2:** the first intended real-player meeting follows independent Episode 1 completion. Fictional character history is a mystery, not proof of romance or a relationship between real strangers. Optional conversation and social connection remain the product's focus.

Before taking an episode task, review foundation verification in [TASKS.md](TASKS.md) and the ownership/extension points in [ARCHITECTURE.md](ARCHITECTURE.md).
