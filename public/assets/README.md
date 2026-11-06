# Game assets

Place licensed runtime assets in `characters/`, `animations/`, `environments/`, `props/`, `audio/`, `video/`, and `textures/`.
Vite copies this directory into the build; use URLs relative to `import.meta.env.BASE_URL`.

The foundation combines procedural geometry with the imported café set below. Record source, author, license, and attribution alongside each external asset. Inspect GLB bounds and animation clips before placement.

The starter's Ammo runtime and its license remain in `public/ammo/`.

## Runtime café set — LW-A003

The furnished **Tideline** room and open street are built at startup. **Play story** begins the cinematic sequence. Imported furniture, plants, food, four table-centered fans, and animated people accompany project-created architecture, vehicles, carried umbrellas/briefcases, illustrations, signs, and Halloween branding. Creators, licenses, and media edits are listed in [art and media credits](credits.html), linked from **Save / load → Art & audio credits**.

| Runtime location                          | Contents                                                       |      Bytes | Source/license                                                           |
| ----------------------------------------- | -------------------------------------------------------------- | ---------: | ------------------------------------------------------------------------ |
| `props/tideline/`                         | 28 self-contained prop GLBs                                    |  1,741,332 | KayKit, Kenney, Quaternius, Poly Haven; CC0                              |
| `characters/`                             | Nine rigged GLBs, ten clips each; includes the suited commuter | 19,022,704 | Quaternius Universal Base Characters / Animation Library; CC0            |
| `audio/tideline-afternoon.wav`            | Original 25.263-second music loop                              |  2,228,256 | Project-created synthesis, no external samples                           |
| `video/climate-reporter.mp4`              | 15.4-second H.264/AAC clip, 960×540                            |    699,100 | Elizabeth Lee / VOA newsroom presentation; public domain, original voice |
| `video/climate-reporter.jpg` / `.vtt`     | Poster and six synchronized caption cues                       |     53,499 | Derived from the credited footage/transcript                             |
| `last-wave-logo.svg` / `pumpkin-icon.svg` | Pumpkin, bat and web wordmark; favicon                         |          — | Project-created vector artwork                                           |

`cafeModels.ts` and `characterModels.ts` record decoded bounds, scale, grounding, and facing using `modelTuning.ts`. `createModelInstance.ts` preserves authored hierarchy transforms under calibration wrappers. Every GLB embeds its buffers/textures; no Draco/Meshopt decoder is required. Character textures are reduced for browser delivery, with prepared civilian clothing, facial variants, and compatible joint paths.

`AnimatedCharacter.ts` binds the ten named clips to the modern Engine `anim` component. `PlayerAnimation.ts` selects idle/walk/jog/sprint/jump from velocity. `OpeningActors.ts` selects seated listening/talking and stand-up/walk poses and rotates all four independent fan blade nodes at 540°/second. `StreetLife.ts` reuses the rigs for pedestrians and seated drivers; procedural carried props follow the right-hand joints. Physical roots retain unit scale. Static footprints are shared with checkpoint validation, and ambient actors clear the restored player when spawning.

The TV's original footage/voice uses `openingBroadcast.json` cues and a canvas-backed screen. The excerpt is programme **00:55.25–01:10.65** of _The Inside Story — Confronting the Climate Crisis_, Episode 89. The fictional coastal bulletin remains separate story content in `opening.ts`. The older Navy footage/source specification and synthetic `coastal-bulletin.wav` are archived outside this runtime tree. Model assets preload once; media starts from Play story or an explicit checkpoint load and is released on scene replacement.

All **30 originally supplied files** remain byte-preserved under `asset-library/`, including the former ten-model café set. `catalog.json` records their original filenames, current archive paths, and SHA-256 hashes. `cafe-selection.json`, `cafe-preparation.json`, and the audio/video manifests document the current runtime preparation. Source packs, unused files, and tooling are not deployed by Vite.

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

See [the source-library notes](../../asset-library/README.md) for offline preparation commands. Hardware performance and physical-device acceptance remain under LW-F002; the dedicated café-to-beach transition remains under LW-S002.
