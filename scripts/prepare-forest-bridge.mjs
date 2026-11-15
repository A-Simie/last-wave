import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const source = path.join(root, 'asset-library/original-downloads/forest-bridge');
const output = path.join(root, 'public/assets/forest');
await mkdir(output, { recursive: true });
const records = [];
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (const [input, file] of [
    ['wooden_bridge_-_lowpoly_gameready.glb', 'wooden-bridge.glb'],
    ['stylized_wood_signs.glb', 'wood-signs.glb']
]) {
    const bytes = await readFile(path.join(source, input));
    const doc = await io.read(path.join(source, input));
    const attribution = doc.getRoot().getAsset().extras;
    await doc.transform(
        flatten(),
        prune(),
        textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 85 })
    );
    const scene = doc.getRoot().getDefaultScene();
    const bounds = getBounds(scene);
    let deck = [];
    if (file === 'wooden-bridge.glb') {
        const mesh = doc
            .getRoot()
            .listNodes()
            .find((node) => node.getName() === 'Planks_low__0');
        const primitive = mesh.getMesh().listPrimitives()[0];
        const positions = primitive.getAttribute('POSITION');
        const matrix = mesh.getWorldMatrix();
        const points = [];
        for (let i = 0; i < positions.getCount(); i++) {
            const [x, y, z] = positions.getElement(i, []);
            points.push([
                matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
                matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]
            ]);
        }
        const center = (bounds.min[0] + bounds.max[0]) / 2;
        deck = Array.from({ length: 41 }, (_, i) => {
            const x = -5.35 + (i * 10.7) / 40;
            const nearby = points
                .toSorted((a, b) => Math.abs(a[0] - center - x) - Math.abs(b[0] - center - x))
                .slice(0, 12);
            return [Number(x.toFixed(4)), Number((Math.max(...nearby.map(([, y]) => y)) - 1.11).toFixed(4))];
        });
        if (deck.some(([, y]) => !Number.isFinite(y))) throw new Error('Incomplete bridge deck profile');
    }
    await io.write(path.join(output, file), doc);
    const prepared = await readFile(path.join(output, file));
    records.push({
        file,
        source: input,
        attribution,
        sourceSha256: hash(bytes),
        outputSha256: hash(prepared),
        sourceBytes: bytes.length,
        outputBytes: prepared.length,
        bounds,
        deck,
        changes:
            'Flattened static hierarchy; textures capped at 1024px and encoded as WebP. Scene scales and reuses sign wood for the login board.',
        verification:
            'Creator pages returned HTTP 403; attribution/license verified from supplied GLB asset.extras. CC BY 4.0 terms checked 2026-11-15.'
    });
}
await writeFile(path.join(root, 'scripts/forest-bridge.prepared.json'), `${JSON.stringify(records, null, 2)}\n`);
await writeFile(path.join(root, 'src/entry/forestBridgeProfile.json'), `${JSON.stringify(records[0].deck)}\n`);
