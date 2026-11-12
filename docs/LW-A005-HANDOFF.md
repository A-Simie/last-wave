# LW-A005 - Neighborhood, umbrellas, Halloween and GitHub

Requested 2026-11-12. This continues the existing uncommitted LW-A004 integration. No new story scene, hospital continuation, backend or dependency was introduced.

## Delivered behavior

- Umbrella carriers use a masked, held right-arm/finger pose from the already shipped CC0 driving clip. The existing walking/idle layer still drives the legs and body. The prop follows `middle_01_r` in postUpdate, stays upright at the pedestrian heading, uses a 1.5 m canopy and a calibrated -0.08 m visual offset. Briefcases retain their existing wrist attachment. All four supplied umbrella designs remain available; commercial substitutions are unchanged.
- Added six supplied-house placements near the main route, raising mapped building placements from 18 to **24**, covering all nine house assets and both shop assets. Modern House at X=17 and American House at X=31 immediately follow Tideline to the east; Low-Poly Street House is across the road at X=-8; Small House is at X=49 across the beach approach. House is also behind Tideline and Country House/Old House are west-side neighbors. Lemon Market and the existing beach-direction landmarks remain.
- Added **four walk-in restaurants**: Sunrise Bakehouse at (-16, 0.6), Salt & Citrus at (11, 27.6), Harbor Noodles at (30, 27.6), and Marigold Kitchen on Market Street at (-40, 62.6). Each has a 2.8 m open doorway, solid walls/furniture, three tables/six chairs, cups, plants, a serving counter/coffee machine, warm pendant lighting and distinct signs. There are no loading doors, payment transactions or new quest requirements. Interiors use the existing licensed cafe kit and procedural architecture.
- The existing 320 x 240 m city has enough space for this arrangement; no beach relocation or route-length change was necessary. The beach remains 240 x 48 m. Restaurant conversion replaces existing solid facade blocks with shared wall/furniture solids; it does not move the story admission checkpoint.
- The user confirmed the **forest sign-in entrance** for the Halloween enhancement. Desktop dressing now has **34 pumpkins**, **four skeleton instances**, **seven imported cobweb instances plus six procedural webs**, two additional shadow-free warm glow pools and denser low mist. Mobile uses fewer extra pumpkins. The sign-in form and center cinematic path remain clear; existing reduced-motion behavior keeps animated effects steady.
- Git ignores now explicitly cover local evidence, temporary build variants and reserved raw incoming/download/temp folders. Prepared runtime assets remain versioned. See GITHUB_PUSH for size/history audit and push commands.

## Ownership and exact changes

`src/player/UmbrellaCarry.ts` adds a second animation layer, masked only to the right clavicle and descendants, playing the existing grip track at speed zero. It does not edit skinned bones or shared clips at runtime. Track presence is checked rather than silently omitting the pose.

StreetLife before:

```ts
type CarriedProp = { root: Entity; hand: GraphNode; walker: Walker };
root.setPosition(hand.getPosition());
```

After:

```ts
type CarriedProp = { root: Entity; hand: GraphNode; grip?: GraphNode; walker: Walker };
root.setPosition(grip ? grip.getPosition() : hand.getPosition());
```

The supplied-model footprint changed from `[1.15, 1.15]` to `[1.5, 1.5]`; the visual offset changed from `(0, -0.12, 0)` to `(0, -0.08, 0)`. Umbrella carriers receive the held layer and a finger grip anchor; other carried props retain their previous behavior.

`restaurantLayout.ts` is the source of truth for locations, local furniture/shell geometry and rotated world solids. `StreetRestaurants.ts` renders those same placements and owns local lights, materials, signs and static batching. `CafeSurroundings.ts` skips the four old solid facades, `FoundationScene.ts` assembles the interiors, and `FoundationState.ts` uses `STREET_BUILDING_SOLIDS` instead of the previous whole-building boxes. Historical save geometry remains unchanged. Existing v5 A004 camp/kiosk conflicts remain a separate limitation.

The building catalogue mapping gained six near-route blocks; the east-residences visual changed from Modern House to Small House. Imported model files/hashes were not changed. Every unique supplied street asset remains placed.

`ForestScene.ts` adds calibrated pumpkin clusters and warm glow pools; `ForestLoginDressing.ts` adds two closer skeletons and four closer imported webs; `ForestEffects.ts` adds four procedural web placements and changes low-mist opacity from 0.055 to 0.08. Existing model resources are reused without new downloads.

`ForestEntrance.ts` now stores the optional loading promise and awaits it before game preparation. Immediate local entry previously allowed concurrent AssetListLoaders; the installed Engine's destroy method removes the shared registry handler without its instance scope, which could strand the other loader after all assets loaded. The loaders are now sequenced. Ordinary intro playback still begins while optional models load.

`.gitignore` gained `/dist-*/`, `/verification.local/`, `/items/`, `/downloads/`, `/tmp/`, `/temp/`. `.prettierignore` now excludes the raw source library/downloads and generated evidence/build variants. Files were not deleted or history-rewritten. Existing organization of runtime versus originals is retained.

`tests/new-assets.test.mjs` adds a physical-layout regression: each restaurant has continuous clear doorway/aisle probes while walls and central furniture remain occupied. `scripts/verify-neighborhood.mjs` checks rendered umbrella geometry across 18 gait samples, moving leg joints, grip tracking, Halloween counts, real W/S keyboard entry and exit through every restaurant, and near-route house instances/captures. It uses an isolated muted browser, synthetic checkpoints and scene calibration fixtures, then closes the browser in finally. Never run it against an active player profile.

## Licence verification

All eleven original house/shop files were re-read directly. Their embedded Sketchfab `asset.extras` author/title/source/licence records match CC BY 4.0, and every original SHA-256 matches the preparation manifest. Nine house assets plus two shops is the precise supplied count; Lugin/Stoll contains two houses in one asset. All remain in both full and commercial modes. Existing generated credits retain attribution and modification notes.

A fresh online check of Sketchfab model pages/API was blocked (403/inaccessible). The confirmation is therefore based on the preserved original download metadata/hashes, not a new online assertion of author ownership. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) permits reuse/adaptation including commercial use with attribution, licence links and change notices. Exact source links/authors are in ASSET_LICENSES; no extra house permissions were inferred from unrelated assets.

## Verification

Initial implementation: **117/117 repository tests**, ESLint, TypeScript and full build passed. First production neighborhood pass: **7/7 groups**, zero unexpected issues; four restaurant keyboard entry/exits and all four umbrella designs passed. Measured canopy clearance and hand/leg samples are in `verification.local/neighborhood/`. Actual entrance, umbrella and restaurant captures were inspected. Restaurant lighting/furnishings were improved following the first dark interior views; final rerun results are recorded in TASKS.

Remaining limits: target-device performance, audible review, screen-reader certification, carried-prop visual review on every NPC model/device, existing static officer/supplied vehicle limitations, and the prior A004 wave collision/version-5 migration work. No claim of a 30/60 FPS budget or full physical evacuation acceptance is made.

## Reproduce

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# Start a production preview and isolated Chrome with --headless=new --mute-audio --remote-debugging-port=9224
$env:GAME_URL = 'http://127.0.0.1:5185/'
$env:CDP_PORT = '9224'
node scripts/verify-neighborhood.mjs
```

Use the supported Node version described in the earlier handoff. The final browser build is kept separate under ignored verification.local output so rebuilds cannot alter a running suite's assets.

The authored Lugin/Stoll asset is a cutaway heritage pair, not a closed roofed facade. It remains at its original Marina Homes placement; the near-approach East Residences block uses Small House so the main walking route has a complete house silhouette.

Final furnished production pass: **8/8 groups**, zero unexpected issues; muted browser closed. Sampled canopy clearance was at least **0.192 m** across 72 samples, with zero finger-anchor tracking error and moving leg joints. Four restaurant keyboard entry/exits passed; actual lit interiors, house frontage and neighborhood route captures were reviewed. Full/commercial output audits passed 37/32 models. The generated pnpm lockfile remains unchanged and is now excluded from Prettier; raw/evidence folders are also excluded. Final formatting/diff results and release-build refresh are in TASKS.

Final release refresh completed: **8/8 browser groups**, zero unexpected issues; ESLint, TypeScript, repository-wide formatting and diff whitespace checks passed. Full/commercial builds and model output audits passed. Latest production test URL was `http://127.0.0.1:5187/`; evidence is in `verification.local/neighborhood/`. Browser closed; task-owned preview/development servers stopped. No commit or push was made.
