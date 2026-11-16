import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv[2]) throw new Error('Pass the existing offline glTF tools directory.');
const require = createRequire(path.resolve(process.argv[2], 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const { flatten, prune, textureCompress } = require('@gltf-transform/functions');
const sharp = require('sharp');
const source = path.join(
    root,
    'asset-library/original-downloads/forest-bridge/medieval_underground_dungeon_-_modular_asset_kit.glb'
);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(source);
const attribution = doc.getRoot().getAsset().extras;
await doc.transform(flatten());
const scene = doc.getRoot().getDefaultScene();
const selections = [
    ['dungeon-wall', 'Brick_wall_BRICKWALLS_0', 'height', 4.8],
    ['dungeon-arch', 'Brick_wall_doorway_BRICKWALLS_0', 'height', 4.8],
    ['dungeon-floor', 'Tile_floor_Tile_Floor_0', 'width', 4],
    ['dungeon-torch', 'Wall_Torch_TORCHCHEST_0', 'height', 0.9],
    ['dungeon-bars', 'Bars_Trim_Sheet_0', 'height', 3.5]
];
const selected = new Set(selections.map(([, name]) => name));
for (const node of doc.getRoot().listNodes()) if (!selected.has(node.getName())) node.dispose();
const calibration = [];
for (const [id, name, dimension, size] of selections) {
    const node = doc
        .getRoot()
        .listNodes()
        .find((n) => n.getName() === name);
    const bounds = getBounds(node);
    const axis = dimension === 'height' ? 1 : 0;
    const scale = size / (bounds.max[axis] - bounds.min[axis]);
    const wrapper = doc
        .createNode(id)
        .setScale([scale, scale, scale])
        .setTranslation([
            (-(bounds.min[0] + bounds.max[0]) * scale) / 2,
            -bounds.min[1] * scale,
            (-(bounds.min[2] + bounds.max[2]) * scale) / 2
        ]);
    scene.removeChild(node);
    wrapper.addChild(node);
    scene.addChild(wrapper);
    calibration.push({ id, original: bounds, scale, bounds: getBounds(wrapper) });
}
await doc.transform(
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 })
);
const file = 'dungeon-kit.glb';
await io.write(path.join(root, 'public/assets/forest', file), doc);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const raw = await readFile(source),
    output = await readFile(path.join(root, 'public/assets/forest', file));
await writeFile(
    path.join(root, 'scripts/forest-dungeon.prepared.json'),
    JSON.stringify(
        {
            file,
            attribution,
            sourceBytes: raw.length,
            outputBytes: output.length,
            sourceSha256: hash(raw),
            outputSha256: hash(output),
            calibration,
            changes:
                'Extracted five reusable modules; retained authored geometry/materials, flattened hierarchy, calibrated metre-scale wrappers; textures resized to 1024px WebP.',
            verification:
                'CC Attribution on indexed primary Sketchfab page; supplied asset.extras identifies CC BY 4.0. Checked 2026-11-16.'
        },
        null,
        2
    ) + '\n'
);
