# Game assets

Place licensed runtime assets in `characters/`, `animations/`, `environments/`, `props/`, `vehicles/`, `audio/`, `video/`, and `textures/`.
Vite copies this directory into the build; use URLs relative to `import.meta.env.BASE_URL`.

The foundation combines procedural geometry with the imported café and beach sets below. Record source, author, license, and attribution alongside each external asset. Inspect GLB bounds and animation clips before placement.

The starter's Ammo runtime and its license remain in `public/ammo/`.

## Forest entrance — LW-UI001

`forest/` contains 32 prepared scenery GLBs from the supplied CC0 KayKit/Asset Quest packs, one eight-clip Quaternius animation container, TuneSeeker's CC0 ambience WAV and a synchronized neural-dialogue/scare MP3. These 35 files total 8,106,010 bytes. Sources, licenses, hashes, explicit male/female voice assignments and preparation instructions are in `asset-library/forest/README.md`. The forest starts automatically and reuses two existing rigs and the Halloween wordmark. The supplied wind MP3 remains preserved without deployed use because no license record accompanied it. Remaining game assets load and the café is constructed after **Continue locally**.

## Runtime café set — LW-A003

The furnished **Tideline** room and open street are built after **Continue locally**. **Play story** begins the café cinematic sequence. Imported furniture, plants, food, four table-centered fans, animated people and Porsche traffic accompany project-created architecture, carried umbrellas/briefcases, illustrations, signs and Halloween branding. Creators, licenses, and media edits are listed in [art and media credits](credits.html), linked from **Save / load → Art & audio credits**.

| Runtime location                          | Contents                                                                           |      Bytes | Source/license                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------- | ---------: | ------------------------------------------------------------------------ |
| `props/tideline/`                         | 28 self-contained prop GLBs                                                        |  1,741,332 | KayKit, Kenney, Quaternius, Poly Haven; CC0                              |
| `characters/` (café variants)             | Nine rigs, ten shared clips; player fall and two driver variants add one clip each | 19,147,644 | Quaternius Universal Base Characters / Animation Library; CC0            |
| `audio/tideline-afternoon.wav`            | Original 25.263-second music loop                                                  |  2,228,256 | Project-created synthesis, no external samples                           |
| `video/climate-reporter.mp4`              | 15.4-second H.264/AAC clip, 960×540                                                |    699,100 | Elizabeth Lee / VOA newsroom presentation; public domain, original voice |
| `video/climate-reporter.jpg` / `.vtt`     | Poster and six synchronized caption cues                                           |     53,499 | Derived from the credited footage/transcript                             |
| `last-wave-logo.svg` / `pumpkin-icon.svg` | Pumpkin, bat and web wordmark; favicon                                             |          — | Project-created vector artwork                                           |

`cafeModels.ts` and `characterModels.ts` record decoded bounds, scale, grounding, and facing using `modelTuning.ts`. `createModelInstance.ts` preserves authored hierarchy transforms under calibration wrappers. Every GLB embeds its buffers/textures; no Draco/Meshopt decoder is required. Character textures are reduced for browser delivery, with prepared civilian clothing, facial variants, and compatible joint paths.

`AnimatedCharacter.ts` binds the named clips to the modern Engine `anim` component. `move(speed)` chooses a gait with hysteresis, preserves phase between moving clips and matches playback to measured travel and model scale. `PlayerAnimation.ts` reads completed physics in `postUpdate`, retains jump through its apex, and smoothly adjusts sole clearance. The baked casual idle/formal-walk clips have upright posture and relaxed fingers; jog/sprint also relax the hands. `OpeningActors.ts` selects seated listening/talking and stand-up/walk poses and rotates all four fan blade nodes at 540°/second. `StreetLife.ts` reuses the rigs for 20 pedestrians and four drivers; carried props follow right-hand joints. Physical roots retain unit scale. Static footprints are shared with checkpoint validation, and ambient actors clear the restored player when spawning.

The TV's original footage/voice uses `openingBroadcast.json` cues and a canvas-backed screen. The excerpt is programme **00:55.25–01:10.65** of _The Inside Story — Confronting the Climate Crisis_, Episode 89. The fictional coastal bulletin remains separate story content in `opening.ts`. The older Navy footage/source specification and synthetic `coastal-bulletin.wav` are archived outside this runtime tree. Model assets preload once; media starts from Play story or an explicit checkpoint load and is released on scene replacement.

All **30 originally supplied files** remain byte-preserved under `asset-library/`, including the former ten-model café set. `catalog.json` records their original filenames, current archive paths, and SHA-256 hashes. `cafe-selection.json`, `cafe-preparation.json`, and the audio/video manifests document the current runtime preparation. Source packs, unused files, and tooling are not deployed by Vite.

## Runtime beach set — LW-S003

| Runtime location                             | Contents                                                        |     Bytes | Source/license                                                |
| -------------------------------------------- | --------------------------------------------------------------- | --------: | ------------------------------------------------------------- |
| `characters/beach{Teal,Coral,Gold,Blue}.glb` | Four swimwear rigs, nine compatible clips each, 512 px textures | 7,170,752 | Quaternius Universal Base Characters / Animation Library; CC0 |
| `audio/seafront-afternoon.wav`               | Original 24-second surf/gull loop, mono 22,050 Hz PCM           | 1,058,444 | Project-created synthesis, no external samples                |

The expanded **96×48 m** beach reuses the barista as its attendant and both principal character rigs. `BeachDressing.ts` creates the white-sand boardwalk, 18 striped umbrellas, 31 loungers and citrus cart; five displayed drinks reuse the calibrated café `bottle` and `icedDrink` containers. The population is 17 stationary beachgoers, the attendant, eight walkers and eight swimmers, plus the two friends. Loungers are currently unoccupied. The open shoreline leads into supported shallows.

`beach-selection.json`, `beach-preparation.json` and `beach-inspection.json` preserve appearance choices, source/archive and runtime hashes, decoded geometry and clip/joint paths. The rigs include idle, talk, walk, sprint, point, seated, seated-talk, forward-swim and treading-water clips. `characterModels.ts` records uniform calibration and per-model animated sand/waterline support heights. Full-cycle posed-vertex and live joint-motion checks verify grounding and binding; the same height function drives the calm water and swimmers.

`BeachWater.ts` owns dynamic, reusable surface/foam buffers. `BeachAudio.ts` owns source-free ambience until committed entry or explicit beach Load, shares the café sound preference, pauses with beach modals/background/developer pause, and exposes retry after an eight-second loading/stall watchdog. Runtime audio settings and hashes are in `asset-library/audio/beach-preparation.json`.

## Porsche traffic and wave continuation — LW-S004

| Runtime location                   | Contents                                                        |     Bytes | Source/license                                           |
| ---------------------------------- | --------------------------------------------------------------- | --------: | -------------------------------------------------------- |
| `vehicles/porsche-911-traffic.glb` | 52,568 triangles, independent wheels, embedded ≤512 px textures | 2,656,804 | Lionsharp Studios, via PlayCanvas examples; CC BY-SA 4.0 |

The **320×240 m** city has two avenues, 39 buildings and eight cars sharing this container. The preserved original has 652,660 triangles. `prepare-traffic-assets.mjs` removes the display ground/duplicate lacquer shell, merges/simplifies the body, straightens wheels and keeps calipers fixed. `traffic-preparation.json`, `traffic-inspection.json` and the original attribution record preserve provenance and measured wheel pivots. `vehicleModels.ts` owns uniform calibration and the two driver-seat/steering-wheel fits; runtime instances clone their clear-coated paint. The source and traffic adaptation retain **CC BY-SA 4.0**; see the [credits](credits.html).

The wave uses procedural surface/foam, gull, evacuation-route and falling-sign geometry. `WaveAudio.ts` synthesizes rumble/wind, whistle and heartbeat on explicit **Continue story**, sharing mute, pause and retry. Surf/gull sound comes from the existing beach ambience; the wave requires no additional audio download. Beach point/sprint clips and the player's non-looping fall support warning, evacuation and blackout. The 33 evacuees reuse the current beach rigs; the obscured ground-level figure reuses the suited commuter.

The shared game set is **42 containers: 28 props, 13 rigs and one car**, totaling **30,716,532 GLB bytes**. Only two rigs preload for the forest; local entry loads the rest and reuses those registered resources. All models remain self-contained without decoder/runtime dependencies and remain app-owned across area changes.

## Choosing additional art

The design reference calls for stylized third-person 3D. A polished stylized café with human-shaped, animated characters is a suitable target; choose reference images and a consistent palette/proportion style before collecting packs. Photorealistic assets need their own browser-performance evaluation.

For player/friend/attendant characters, look for suitable clothing and compatible idle, walk, run, sitting, and conversation animations. A rig is the character's internal skeleton; animation clips supply its movements.

### Asset sources

Provider pages were reviewed on **2026-11-04–05**. The selected runtime packs are documented above; additional downloads still require their own evaluation.

- [KayKit Restaurant Bits](https://kaylousberg.itch.io/restaurant-bits): free CC0 tier with 140+ stylized kitchen/restaurant/food models; includes glTF, FBX, and OBJ. Extra/source tiers are available.
- [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit): free CC0 furniture/interior models for a simple stylized environment.
- [Quaternius](https://quaternius.com/): stylized environments and characters. Check each pack's clothing, rig, included animations, and free/paid tier contents.
- [Quaternius Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html): humanoid animation clips with free and expanded tiers; skeleton compatibility and any retargeting need verification before integration.
- [Fab](https://www.fab.com/): detailed café/interior and character packs. Search for game-ready assets and check that downloadable interchange formats are included.
- [Poly Haven](https://polyhaven.com/): free CC0 surface textures, models, and HDR environment lighting. Select appropriate resolutions for browser delivery.

[Mixamo](https://www.mixamo.com/) is another source of humanoid rigging and animation, typically exported as FBX. [Blender](https://www.blender.org/) is a free tool for arranging/editing models, preparing materials, and converting supported source formats to GLB.

Prefer one coherent environment kit and matching character proportions. Marketplace previews can include engine-specific shaders, lighting, and post-processing that need recreating in PlayCanvas. Check each chosen download's license and preserve its source/attribution record.

## Import workflow for this repository

1. Download a small candidate set: one café kit and one rigged character with movement clips. Prefer **GLB** or **glTF**. GLB can bundle meshes, textures, and animation in one file; glTF may depend on adjacent `.bin` and texture files.
2. For FBX or Blender sources, prepare them in Blender and export **glTF 2.0 → GLB**. Check scale, material textures, skeleton, and clips. Custom source-engine shaders may need standard materials or baked textures. A Unity/Unreal project by itself is not a directly loadable PlayCanvas asset.
3. Keep interactive objects such as the bag, phone, TV screen, and door separately addressable when assembling the room. Inspect bounds, grounding, pivots, and animation compatibility before placing models.
4. Put runtime files in the existing categories. Example filenames below are proposed, not existing downloads:

    ```text
    public/assets/
      environments/cafe/cafe.glb
      characters/player/player.glb
      props/bag.glb
      props/phone.glb
      animations/locomotion.glb
      textures/cafe/
    ```

5. Extend `loadGameAssets` in `src/core/AssetManager.ts` through the typed model catalogs. `Game.ts` registers `ContainerHandler`, `TextureHandler`, and the modern `AnimComponentSystem`, preloads the selected containers, and retains shared resources across resets/loads. Use **container** assets, `instantiateRenderEntity()`, and `import.meta.env.BASE_URL`.
6. Attach the visual character to its gameplay root, calibrate its feet/scale/facing, and use `AnimatedCharacter.ts` with inspected, path-compatible clips. Verify non-root joint motion in the browser. Keep physics roots unscaled and author colliders independently of visual detail.
7. Arrange the café, add materials and lighting, connect the existing interaction/quest IDs, and verify camera clearance, pickup visibility, animation, loading/reset cleanup, and browser performance. Preload assets before committing scene replacement; the current scene builder is synchronous.

See [the source-library notes](../../asset-library/README.md) for offline preparation commands. LW-S002 supplies the recoverable café/street-to-beach handoff, LW-S003 supplies exploration, and LW-S004 continues through evacuation to a recoverable blackout. Hardware performance and physical-device acceptance remain under LW-F002.
