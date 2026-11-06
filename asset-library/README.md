# Source asset library

Updated **2026-11-06**. All **30 files originally supplied in `items/`** are byte-preserved here; [catalog.json](catalog.json) records original filenames, destinations, authors/source links, sizes, and SHA-256 hashes. The former ten-model runtime café set now lives in this archive too.

- **Current runtime:** 28 calibrated props in `public/assets/props/tideline/`, nine rigged characters including a suited commuter, an original music loop, and Elizabeth Lee / VOA reporter footage. See the shipped [art and media credits](../public/assets/credits.html) and [runtime inventory](../public/assets/README.md).
- **`cafe/`:** all supplied café originals, including the retired dining set/appliances, drinks, lighting, glassware, air conditioner, and wine/cheese arrangement.
- **`medical/`:** chair, wheelchair, instruments, first-aid items, and the hotel ID card, reserved for later art evaluation.
- **`furniture/`:** desk and standing desk.
- **`environments/`:** complete bar scene.
- **`source/`:** original fan FBX and evaluated Poly Haven source assets. The runtime fan uses the prepared Poly Haven GLB, not the supplied FBX.
- **`unclassified/`:** the supplied model named “15”; its role is not yet evaluated.
- **`duplicates/`:** the second Table Big download, confirmed byte-identical to the café trestle table and retained here.

- **`audio/`:** music/voice preparation metadata and the retired synthetic coastal bulletin.
- **`video/`:** the preserved VOA reporter excerpt, provenance/caption specification, and current runtime media hashes. The retired Navy heat-safety source and specification remain here for provenance.
- **`archives/`, `source-packs/`, `original-downloads/`:** local downloads and extracted preparation inputs, excluded from Git and deployment. A fresh clone needs the matching source downloads before regenerating assets.

This directory is outside Vite's public tree. A null license in the original catalog means that source's individual terms have not been verified; it does not authorize runtime use. The selected runtime models are CC0, with source pages and media terms recorded in the credits.

## Preparation records

- `cafe-selection.json`: visual reference, selected source files, character appearance, ten clip names, and reserve decisions.
- `cafe-preparation.json`: hashes/sizes for seven downloaded archives, 28 runtime props, and nine runtime characters.
- `cafe-inspection.json`: offline decoded bounds, skins, clips, joints, and animation target paths. Reinspect after changing a GLB; skinned bounds also need runtime confirmation.
- `audio/preparation.json` and `video/preparation.json`: media provenance, processing, duration/cues, and output hashes. `video/climate-reporter.json` selects programme 00:55.25–01:10.65 from the preserved 00:54–01:11.2 source excerpt.
- `organization.json` / `catalog.json`: the original supplied-file organization and preservation record.

## Offline regeneration

The normal `pnpm build` uses the prepared runtime files and needs none of this tooling. To regenerate assets, restore the source files specified by the manifests, then use Python 3 with Pillow/NumPy for the model and music scripts, and FFmpeg for video:

```powershell
python scripts/prepare-cafe-assets.py
python scripts/prepare-opening-audio.py
python scripts/prepare-broadcast.py --ffmpeg <path-to-ffmpeg>
```

The first script imports `cafe_clothing.py` and `cafe_faces.py`; it preserves rig bone lengths and binds selected non-root-motion clips by matching hierarchy paths. The suit variant adds a shirt, lapels and tie to the prepared civilian clothing. The music script optionally accepts `--piper` and `--model` together to regenerate the archived synthetic bulletin. The current TV retains the VOA presenter's original voice. These commands overwrite their generated outputs; LW-A003 prepared the suited commuter and replacement reporter assets before final acceptance.

After regeneration, inspect the GLBs and update `src/data/{cafeModels,characterModels}.ts` calibration if bounds changed. Verify animation motion, seating/ground contact, loading/reset cleanup, hashes, and credits. `cafeLayout.ts` owns the room's support heights and solid footprints; the story stops at the foundation café doorway.
