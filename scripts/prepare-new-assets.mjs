// Prepares the supplied "New FIles" Sketchfab GLBs for browser delivery.
//
// Usage: node scripts/prepare-new-assets.mjs <directory containing the glTF-Transform tooling>
//
// Per model this script: bakes a metre-scale, ground-seated, x/z-centred wrapper node, merges static meshes,
// decimates and caps textures, replaces expensive transmission with plain alpha, and records the author/licence
// metadata that Sketchfab embedded in each file. Files whose licence forbids derivatives (ND) are copied
// byte-for-byte; they are never re-encoded, simplified, re-textured or otherwise modified.
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.resolve(process.argv[2] ?? '.', 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { dedup, flatten, join, prune, simplify, textureCompress, weld } = require('@gltf-transform/functions');
const draco = require('draco3dgltf');
const { MeshoptSimplifier } = require('meshoptimizer');
const sharp = require('sharp');

const sourceDirectory = path.join(root, 'New FIles');
const outputDirectory = path.join(root, 'public/assets/models');
const only = process.argv.slice(3);

// fit: [dimension, metres]. 'footprint' is the longer of width and depth.
// Models with `verbatim: true` are copied unchanged because their licence is ND.
const MODELS = [
    // Street buildings
    ['americanHouse', 'american_house.glb', 'street', 14000, 512, ['footprint', 15]],
    ['house', 'house.glb', 'street', 6000, 512, ['footprint', 13], { ground: true }],
    ['lowPolyStreetHouse', 'low-poly_street_house.glb', 'street', 1200, 512, ['footprint', 13]],
    ['countryHouse', 'lp_country_house.glb', 'street', 14000, 256, ['footprint', 14], { cull: 0.06, error: 0.2 }],
    ['modernHouse', 'modern_house.glb', 'street', 16000, 256, ['footprint', 17], { cull: 0.2, error: 0.2 }],
    ['smallHouse', 'small_house.glb', 'street', 3700, 512, ['footprint', 12], { ground: true }],
    ['oldHouse', 'free_small_old_house.glb', 'street', 12000, 512, ['footprint', 12], { ground: true }],
    ['suburbanHouse', 'suburban_house.glb', 'street', 14000, 512, ['footprint', 15], { cull: 0.02, error: 0.1 }],
    ['luginHouse', 'house_of_lugin_and_house_of_stoll.glb', 'street', 9000, 512, ['footprint', 26]],
    ['cornerShop', 'corner_shop.glb', 'street', 10000, 512, ['footprint', 12], { mask: true, lit: true }],
    ['fishShop', 'fish_shop.glb', 'street', 12000, 512, ['footprint', 11]],
    // Beach
    ['atABeach', 'at_a_beach.glb', 'beach', 4600, 256, ['footprint', 9], { ground: true }],
    ['beachBall', 'beach_ball.glb', 'beach', 900, 256, ['height', 0.45]],
    ['beachChairA', 'beach_chair (1).glb', 'beach', 3500, 512, ['length', 1.9]],
    ['beachChairB', 'beach_chair.glb', 'beach', 3500, 256, ['length', 1.9]],
    ['beachKit', 'beach_kit.glb', 'beach', 9000, 512, ['footprint', 10]],
    ['beachScene', 'beach_scene.glb', 'beach', 7000, 512, ['footprint', 6]],
    ['beachTable', 'beach_table.glb', 'beach', 3400, 512, ['height', 2.4]],
    ['psxBeachPack', 'psx_beach_pack.glb', 'beach', 1800, 256, ['footprint', 9]],
    ['sushiBooth', 'sushi__ramen_booth.glb', 'beach', 16000, 512, ['footprint', 9]],
    ['ticketBooth', 'ticket_booth.glb', 'beach', 400, 512, ['footprint', 3.6]],
    // Umbrellas
    ['umbrellaA', 'umbrella.glb', 'umbrella', 2500, 256, ['width', 2.3]],
    ['umbrellaB', 'umbrella (1).glb', 'umbrella', 2500, 256, ['width', 2.3]],
    ['elegantUmbrella', 'elegant_umbrella.glb', 'umbrella', 2300, 512, ['width', 2.2]],
    ['yellowUmbrella', 'yellow_umbrella.glb', 'umbrella', 5000, 256, ['width', 2.4]],
    // Vehicles and officer
    ['policeCar', 'police_car.glb', 'vehicle', 14000, 512, ['length', 4.7]],
    ['bus', 'japanese_bus_nagoya_city_bus_aichi.glb', 'vehicle', 4100, 1024, ['width', 10.5]],
    [
        'pickup',
        'dodge_b-series_pickup_1953_halloween_special.glb',
        'vehicle',
        0,
        0,
        ['length', 5.2],
        { verbatim: true }
    ],
    ['police', 'police.glb', 'character', 5000, 512, ['height', 1.82]],
    // Login / forest dressing
    ['vampireBat', 'vampire_bat.glb', 'login', 5000, 1024, ['width', 1.1]],
    ['grave', 'grave.glb', 'login', 3400, 512, ['height', 1.5], { mask: true, lit: true }],
    ['cobwebs', 'cobwebs.glb', 'login', 180, 512, ['footprint', 2.2]],
    ['cobwebPack', 'cobwebs_asset_pack.glb', 'login', 420, 512, ['footprint', 8]],
    ['skeletonA', 'skeleton.glb', 'login', 8000, 256, ['height', 1.75]],
    ['skeletonB', 'skeleton (1).glb', 'login', 8000, 512, ['height', 1.75]],
    ['goblet', 'goblet_of_life.glb', 'login', 1200, 512, ['height', 0.45], { lit: true }],
    ['skullPlanes', 'skull_planes.glb', 'login', 0, 0, ['height', 1.2], { verbatim: true }]
];

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco.createDecoderModule()
});
await MeshoptSimplifier.ready;

const sha256 = async (file) =>
    createHash('sha256')
        .update(await readFile(file))
        .digest('hex');
const triangles = (doc) =>
    doc
        .getRoot()
        .listMeshes()
        .reduce(
            (total, mesh) =>
                total +
                mesh
                    .listPrimitives()
                    .reduce(
                        (count, p) => count + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3,
                        0
                    ),
            0
        );
const round = (value) => Math.round(value * 10000) / 10000;

const wrapAndFit = (doc, [dimension, metres]) => {
    const model = doc.getRoot();
    const scene = model.getDefaultScene() ?? model.listScenes()[0];
    const bounds = getBounds(scene);
    const size = bounds.max.map((v, i) => v - bounds.min[i]);
    const reference =
        dimension === 'height'
            ? size[1]
            : dimension === 'width'
              ? size[0]
              : dimension === 'length'
                ? size[2]
                : Math.max(size[0], size[2]);
    const scale = metres / reference;
    const wrapper = doc.createNode('model');
    for (const child of scene.listChildren()) {
        scene.removeChild(child);
        wrapper.addChild(child);
    }
    const centerX = (bounds.min[0] + bounds.max[0]) / 2;
    const centerZ = (bounds.min[2] + bounds.max[2]) / 2;
    wrapper.setScale([scale, scale, scale]);
    wrapper.setTranslation([-centerX * scale, -bounds.min[1] * scale, -centerZ * scale]);
    scene.addChild(wrapper);
    return {
        scale,
        original: size.map(round)
    };
};

const results = [];
await mkdir(outputDirectory, { recursive: true });
for (const [id, file, group, budget, textureSize, fit, options = {}] of MODELS) {
    const { verbatim = false, cull = 0, error = 0.02, ground = false, mask = false, lit = false } = options;
    if (only.length && !only.includes(id)) continue;
    const input = path.join(sourceDirectory, file);
    const output = path.join(outputDirectory, `${id}.glb`);
    const started = Date.now();
    const sourceDoc = await io.read(input);
    const source = sourceDoc.getRoot().getAsset().extras ?? {};
    const sourceTriangles = triangles(sourceDoc);
    const nodeCount = sourceDoc.getRoot().listNodes().length;
    let record;
    if (verbatim) {
        // ND licence: no re-encoding, simplification, texture changes or node edits. Scale/seat happens at runtime.
        await copyFile(input, output);
        const scene = sourceDoc.getRoot().getDefaultScene() ?? sourceDoc.getRoot().listScenes()[0];
        const bounds = getBounds(scene);
        const size = bounds.max.map((v, i) => v - bounds.min[i]);
        const [dimension, metres] = fit;
        const reference =
            dimension === 'height'
                ? size[1]
                : dimension === 'width'
                  ? size[0]
                  : dimension === 'length'
                    ? size[2]
                    : Math.max(size[0], size[2]);
        const scale = metres / reference;
        record = {
            bakedFit: false,
            runtimeScale: round(scale),
            runtimeOffset: [
                round((-(bounds.min[0] + bounds.max[0]) / 2) * scale),
                round(-bounds.min[1] * scale),
                round((-(bounds.min[2] + bounds.max[2]) / 2) * scale)
            ],
            dims: size.map((v) => round(v * scale)),
            triangles: sourceTriangles
        };
    } else {
        const doc = sourceDoc;
        const model = doc.getRoot();
        const animated = model.listAnimations().length > 0 || model.listSkins().length > 0;
        // Plain alpha is far cheaper than scene-colour refraction and avoids a second camera pass.
        for (const material of model.listMaterials()) {
            const transmission = material.getExtension('KHR_materials_transmission');
            if (transmission) {
                material.setAlphaMode('BLEND');
                const base = material.getBaseColorFactor();
                material.setBaseColorFactor([base[0], base[1], base[2], 0.35]);
                material.setExtension('KHR_materials_transmission', null);
            }
        }
        for (const extension of model.listExtensionsUsed()) {
            if (extension.extensionName === 'KHR_materials_transmission') extension.dispose();
        }
        if (mask)
            for (const material of model.listMaterials())
                if (material.getAlphaMode() === 'BLEND') material.setAlphaMode('MASK').setAlphaCutoff(0.4);
        if (lit) {
            // Unlit materials glow in the night forest and ignore street shadows; light them like the rest of the set.
            for (const material of model.listMaterials()) material.setExtension('KHR_materials_unlit', null);
            for (const extension of model.listExtensionsUsed())
                if (extension.extensionName === 'KHR_materials_unlit') extension.dispose();
        }
        await doc.transform(dedup());
        if (!animated) {
            await doc.transform(flatten());
            if (ground) {
                // Sketchfab presentation ground planes would otherwise dominate the bounds and the fitted scale.
                const all = getBounds(model.getDefaultScene() ?? model.listScenes()[0]);
                const area = (all.max[0] - all.min[0]) * (all.max[2] - all.min[2]);
                for (const node of model.listNodes()) {
                    if (!node.getMesh()) continue;
                    const b = getBounds(node);
                    const w = b.max[0] - b.min[0],
                        h = b.max[1] - b.min[1],
                        d = b.max[2] - b.min[2];
                    if (w * d > 0.45 * area && h < 0.08 * Math.max(w, d)) node.setMesh(null);
                }
                await doc.transform(prune());
            }
            if (cull) {
                const sceneBounds = getBounds(model.getDefaultScene() ?? model.listScenes()[0]);
                const reference = Math.max(
                    sceneBounds.max[0] - sceneBounds.min[0],
                    sceneBounds.max[2] - sceneBounds.min[2]
                );
                for (const node of model.listNodes()) {
                    if (!node.getMesh()) continue;
                    const b = getBounds(node);
                    const extent = Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]);
                    let meshTriangles = 0;
                    for (const p of node.getMesh().listPrimitives())
                        meshTriangles += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
                    // Drop tiny meshes, and dense small fittings (doors, bells, fixtures) that cost far more than they show.
                    if (extent < cull * reference || (meshTriangles > 1500 && extent < cull * 3 * reference))
                        node.setMesh(null);
                }
            }
            await doc.transform(prune(), join({ keepMeshes: false, keepNamed: false }));
        }
        await doc.transform(prune(), weld());
        const now = triangles(doc);
        if (budget && now > budget) {
            await doc.transform(
                simplify({ simplifier: MeshoptSimplifier, ratio: Math.max(0.01, budget / now), error })
            );
        }
        await doc.transform(prune());
        if (model.listTextures().length)
            await doc.transform(
                textureCompress({
                    encoder: sharp,
                    targetFormat: 'webp',
                    resize: [textureSize, textureSize],
                    quality: 78
                })
            );
        const fitted = wrapAndFit(doc, fit);
        const scene = model.getDefaultScene() ?? model.listScenes()[0];
        const bounds = getBounds(scene);
        model.getAsset().generator = 'Last Wave asset preparation (glTF-Transform 4.5.1)';
        model.setExtras({ ...source, adapted: true });
        await io.write(output, doc);
        record = {
            bakedFit: true,
            runtimeScale: 1,
            runtimeOffset: [0, 0, 0],
            dims: bounds.max.map((v, i) => round(v - bounds.min[i])),
            triangles: triangles(doc),
            fit: fitted
        };
    }
    const bytes = (await stat(output)).size;
    const entry = {
        id,
        file: `${id}.glb`,
        group,
        sourceFile: file,
        sourceBytes: (await stat(input)).size,
        sourceSha256: await sha256(input),
        bytes,
        sha256: await sha256(output),
        sourceTriangles,
        sourceNodes: nodeCount,
        verbatim: !!verbatim,
        ...record,
        title: source.title ?? null,
        author: source.author ?? null,
        license: source.license?.split(' ')[0] ?? null,
        url: source.source ?? null
    };
    results.push(entry);
    console.log(
        `${id.padEnd(20)} ${(entry.sourceBytes / 1048576).toFixed(1).padStart(7)} MB -> ${(bytes / 1048576).toFixed(2).padStart(6)} MB  ${String(Math.round(sourceTriangles)).padStart(8)} -> ${String(Math.round(entry.triangles)).padStart(6)} tris  ${((Date.now() - started) / 1000).toFixed(0)}s`
    );
}
if (!only.length) {
    await mkdir(path.join(root, 'asset-library'), { recursive: true });
    await writeFile(
        path.join(root, 'asset-library/new-assets-preparation.json'),
        JSON.stringify(results, null, 2) + '\n'
    );
    await writeFile(path.join(root, 'scripts/new-assets.prepared.json'), JSON.stringify(results, null, 2) + '\n');
}
