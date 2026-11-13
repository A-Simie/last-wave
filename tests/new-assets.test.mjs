import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { test } from 'node:test';

import { COMMERCIAL_SUBSTITUTES, allowedModels, isCommercialSafe, isModelAllowed } from '../src/data/assetPolicy.ts';
import { NEIGHBOR_BUILDINGS } from '../src/data/foundation.ts';
import { PREPARED_MODELS } from '../src/data/newModels.ts';
import { INTRO_SKIP_KEY, prefersSkippingIntro, rememberIntroSkip } from '../src/entry/ForestTimeline.ts';
import {
    BEACH_CROWD_COUNT,
    BEACH_CROWD_SOLIDS,
    BEACH_CROWD_SPOTS,
    BEACH_CROWD_STROLLERS,
    BEACH_CROWD_SWIMMERS
} from '../src/episodes/episode-01/beachCrowdLayout.ts';
import { BEACH_STANDING_PEOPLE, BEACH_WALKER_ROUTES } from '../src/episodes/episode-01/beachLayout.ts';
import { BEACH_ARRIVAL_GROUND, BEACH_ARRIVAL_SPAWN, BEACH_SHORE_Z } from '../src/episodes/episode-01/entryLayout.ts';
import { RESTAURANTS } from '../src/episodes/episode-01/restaurantLayout.ts';
import {
    STREET_BUILDING_MODELS,
    STREET_CROSSINGS,
    STREET_KIOSKS,
    kioskQueue
} from '../src/episodes/episode-01/streetLayout.ts';
import { WAVE_AUTOSTART_DELAY, WAVE_WARNING, warningBeatDuration } from '../src/episodes/episode-01/wave.ts';
import { isBeachArrivalPosition, isFoundationPosition } from '../src/scenes/FoundationState.ts';

const root = new URL('../', import.meta.url);
const prepared = JSON.parse(readFileSync(new URL('scripts/new-assets.prepared.json', root), 'utf8'));

test('every supplied file is prepared, shipped and catalogued with its embedded licence', () => {
    const supplied = prepared.map(({ sourceFile }) => sourceFile);
    // beach_chair (2).glb is byte-identical to beach_chair (1).glb, so one prepared model serves both.
    const duplicates = { 'beach_chair (2).glb': 'beach_chair (1).glb' };
    for (const [copy, original] of Object.entries(duplicates)) assert.ok(supplied.includes(original), copy);
    assert.equal(prepared.length, 37);
    for (const entry of prepared) {
        const model = PREPARED_MODELS[entry.id];
        assert.ok(model, entry.id);
        assert.equal(model.license, entry.license);
        assert.equal(statSync(new URL(`public/assets/models/${model.file}`, root)).size, entry.bytes, entry.id);
        assert.match(model.source, /^https:\/\/sketchfab\.com\/3d-models\//);
        assert.ok(model.author.length > 1);
        // ND licences forbid derivatives: those files must ship exactly as downloaded.
        if (model.license.includes('-ND')) {
            assert.equal(model.modified, false, entry.id);
            assert.equal(entry.sha256, entry.sourceSha256, entry.id);
        }
    }
});

test('the commercial policy drops every non-commercial model and names a substitute for each', () => {
    const nonCommercial = Object.keys(PREPARED_MODELS).filter((id) => !isCommercialSafe(id));
    assert.deepEqual(nonCommercial.sort(), ['bus', 'goblet', 'pickup', 'vampireBat', 'yellowUmbrella']);
    for (const id of nonCommercial) {
        assert.equal(isModelAllowed(id, 'commercial'), false);
        assert.equal(isModelAllowed(id, 'full'), true);
        assert.ok(id in COMMERCIAL_SUBSTITUTES, id);
        const substitute = COMMERCIAL_SUBSTITUTES[id];
        if (substitute && substitute !== 'procedural') assert.equal(isCommercialSafe(substitute), true);
    }
    assert.equal(allowedModels(['login'], 'commercial').includes('vampireBat'), false);
    assert.equal(allowedModels(['login'], 'full').includes('vampireBat'), true);
    assert.equal(isModelAllowed('skullPlanes', 'commercial'), true, 'ND allows commercial use when unmodified');
});

test('every street model maps onto an existing block and every catalogue model is placed somewhere', () => {
    const names = new Set(NEIGHBOR_BUILDINGS.map(({ name }) => name));
    for (const block of Object.keys(STREET_BUILDING_MODELS)) assert.ok(names.has(block), block);
    const used = new Set(Object.values(STREET_BUILDING_MODELS));
    for (const spot of BEACH_CROWD_SPOTS) for (const prop of spot.props) used.add(prop.kind);
    for (const id of ['policeCar', 'bus', 'pickup', 'police', 'ticketBooth', 'beachBall'])
        assert.ok(Object.hasOwn(PREPARED_MODELS, id), id);
    for (const id of ['umbrellaA', 'umbrellaB', 'elegantUmbrella', 'yellowUmbrella', 'beachChairA', 'beachChairB'])
        assert.ok(used.has(id), id);
    for (const id of ['sushiBooth', 'beachKit', 'beachScene', 'psxBeachPack', 'atABeach', 'beachTable'])
        assert.ok(used.has(id), id);
    for (const id of Object.keys(PREPARED_MODELS).filter((id) => PREPARED_MODELS[id].group === 'street'))
        assert.ok(used.has(id), `${id} is not placed on the street`);
});

test('the widened beach holds a crowd of more than 500 clear of routes, rails and the arrival', () => {
    assert.equal(BEACH_ARRIVAL_GROUND.size[0], 240);
    const original = BEACH_STANDING_PEOPLE.length + BEACH_WALKER_ROUTES.length * 2 + 8 + 1;
    assert.ok(BEACH_CROWD_COUNT + original > 500, `${BEACH_CROWD_COUNT + original} people`);
    const kinds = new Set(BEACH_CROWD_SPOTS.map(({ kind }) => kind));
    for (const kind of ['umbrella', 'mats', 'group', 'game', 'set', 'sushi']) assert.ok(kinds.has(kind), kind);
    const poses = new Set(BEACH_CROWD_SPOTS.flatMap(({ members }) => members.map(({ pose }) => pose)));
    for (const pose of ['seated', 'lyingBack', 'lyingFront', 'talk', 'player']) assert.ok(poses.has(pose), pose);
    for (const solid of BEACH_CROWD_SOLIDS) {
        assert.ok(Math.abs(solid.position[0]) < BEACH_ARRIVAL_GROUND.size[0] / 2 - 1, solid.name);
        assert.ok(solid.position[2] > BEACH_SHORE_Z + 2, solid.name);
    }
    for (const { x, z } of BEACH_CROWD_SWIMMERS) assert.ok(z < BEACH_SHORE_Z && Math.abs(x) < 120);
    for (const { from, to } of BEACH_CROWD_STROLLERS) assert.ok(Math.min(Math.abs(from), Math.abs(to)) > 48);
    assert.equal(isBeachArrivalPosition(BEACH_ARRIVAL_SPAWN), true);
    // The open shoreline and the far wings are walkable.
    for (let x = -110; x <= 110; x += 0.5) assert.equal(isBeachArrivalPosition([x, 1.04, -30]), true, `shore ${x}`);
    for (let z = 3.6; z >= -34; z -= 0.5) assert.equal(isBeachArrivalPosition([0, 1.04, z]), true, `boardwalk ${z}`);
});

test('kiosk queues, crossings and the entrance stay on clear pavement', () => {
    for (const kiosk of STREET_KIOSKS) {
        assert.equal(isFoundationPosition([kiosk.position[0], 1.04, kiosk.position[2]]), false, kiosk.name);
        for (const [x, , z] of kioskQueue(kiosk, 3)) assert.equal(isFoundationPosition([x, 1.04, z]), true, kiosk.name);
    }
    for (const { x, near, far } of STREET_CROSSINGS)
        for (let z = near; z <= far; z += 0.5) assert.equal(isFoundationPosition([x, 1.04, z]), true, `${x},${z}`);
    assert.equal(isFoundationPosition([70.5, 1.04, 6.4]), true);
});

test('each restaurant has a walkable doorway and dining aisle but solid walls and furniture', () => {
    assert.equal(RESTAURANTS.length, 4);
    for (const room of RESTAURANTS) {
        for (let z = room.depth / 2 + 1.2; z >= 2.2; z -= 0.2)
            assert.equal(isFoundationPosition(room.world([0, 1.04, z])), true, `${room.title} doorway ${z}`);
        for (let z = 2.2; z >= -room.depth / 2 + 1.2; z -= 0.2)
            assert.equal(isFoundationPosition(room.world([1.65, 1.04, z])), true, `${room.title} aisle ${z}`);
        for (const point of [
            [0, 1.04, 0],
            [-room.width / 2, 1.04, 0],
            [0, 1.04, -room.depth / 2]
        ])
            assert.equal(isFoundationPosition(room.world(point)), false, `${room.title} solid ${point}`);
    }
});

test('the wave starts by itself after the discoveries and paces every warning beat for reading', () => {
    assert.equal(WAVE_AUTOSTART_DELAY, 3);
    for (const beat of WAVE_WARNING.beats) {
        const seconds = warningBeatDuration(beat.text);
        assert.ok(seconds >= 4.5 && seconds <= 10, beat.id);
    }
});

test('the intro-skip preference is opt-in, clearable and never throws on blocked storage', () => {
    const values = new Map([['last-wave.checkpoint', 'kept']]);
    const storage = () => ({
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key)
    });
    assert.equal(prefersSkippingIntro(storage), false);
    assert.equal(rememberIntroSkip(storage, true), true);
    assert.equal(values.get(INTRO_SKIP_KEY), 'always');
    assert.equal(prefersSkippingIntro(storage), true);
    assert.equal(rememberIntroSkip(storage, false), true);
    assert.equal(prefersSkippingIntro(storage), false);
    assert.equal(values.get('last-wave.checkpoint'), 'kept');
    const denied = () => {
        throw new Error('SecurityError');
    };
    assert.equal(prefersSkippingIntro(denied), false);
    assert.equal(rememberIntroSkip(denied, true), false);
});
