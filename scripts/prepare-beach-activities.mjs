import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { format } from 'prettier';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tools = process.argv[2];
if (!tools) throw new Error('Pass the offline glTF tools directory as the first argument.');
const { NodeIO } = await import(
    pathToFileURL(path.resolve(tools, 'node_modules/@gltf-transform/core/dist/index.js')).href
);
const { ALL_EXTENSIONS } = await import(
    pathToFileURL(path.resolve(tools, 'node_modules/@gltf-transform/extensions/dist/index.js')).href
);
const { prune, resample } = await import(
    pathToFileURL(path.resolve(tools, 'node_modules/@gltf-transform/functions/dist/index.js')).href
);
const source = path.join(root, 'asset-library/source-packs/beach-activities');
const output = path.join(root, 'public/assets/activities');
await mkdir(output, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const models = [
    {
        id: 'horse',
        file: 'Horse-source.gltf',
        author: 'Quaternius',
        source: 'https://quaternius.com/packs/farmanimal.html',
        download:
            'https://raw.githubusercontent.com/mrdoob/three.js/dev/manual/examples/resources/models/animals/Horse.gltf'
    },
    {
        id: 'speedboat',
        file: 'watercraft/Models/GLB format/boat-speed-a.glb',
        author: 'Kenney',
        source: 'https://kenney.nl/assets/watercraft-kit',
        download: 'https://opengameart.org/sites/default/files/kenney_watercraft_kit_0.zip'
    },
    {
        id: 'quadWheel',
        file: 'car-kit/Models/GLB format/wheel-tractor-front.glb',
        author: 'Kenney',
        source: 'https://kenney.nl/assets/car-kit',
        download: 'https://opengameart.org/sites/default/files/kenney_car-kit_3.1.zip'
    },
    {
        id: 'riderPose',
        file: 'public/assets/characters/patronBuzz.glb',
        author: 'Quaternius / Last Wave pose adaptation',
        source: 'https://quaternius.com/packs/universalanimationlibrary.html',
        download: 'Existing prepared CC0 character/animation source'
    }
];
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const manifest = [];
for (const model of models) {
    const input = path.join(model.id === 'riderPose' ? root : source, model.file);
    const document = await io.read(input);
    if (model.id === 'riderPose') {
        const animations = document.getRoot().listAnimations();
        const idle = animations.find((clip) => clip.getName() === 'Casual_Idle_Loop');
        const driving = animations.find((clip) => clip.getName() === 'Traffic_Driving_Loop');
        if (!idle || !driving) throw new Error('Prepared rider source clips are missing.');
        const rest = new Map(
            idle
                .listChannels()
                .filter((c) => c.getTargetPath() === 'rotation')
                .map((c) => [
                    c.getTargetNode().getName(),
                    Array.from(c.getSampler().getOutput().getArray().slice(0, 4))
                ])
        );
        const multiply = (a, b) => [
            a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
            a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
            a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
            a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
        ];
        for (const channel of driving.listChannels()) {
            const name = channel.getTargetNode().getName();
            const sampler = channel.getSampler(),
                original = sampler.getOutput();
            const width = original.getElementSize();
            let value = Array.from(original.getArray().slice(0, width));
            if (channel.getTargetPath() === 'rotation') {
                if (/^(thigh|calf|foot|ball)_/.test(name)) value = rest.get(name) ?? value;
                const angle = name.startsWith('thigh_')
                    ? name.endsWith('_l')
                        ? 24
                        : -24
                    : name.startsWith('calf_')
                      ? 15
                      : name === 'neck_01'
                        ? -24
                        : 0;
                if (angle) {
                    const radians = (angle * Math.PI) / 360;
                    value = multiply(
                        name.startsWith('thigh_')
                            ? [0, 0, Math.sin(radians), Math.cos(radians)]
                            : [Math.sin(radians), 0, 0, Math.cos(radians)],
                        value
                    );
                }
            }
            const array = new Float32Array(original.getArray().length);
            for (let i = 0; i < array.length; i += width) array.set(value, i);
            sampler.setOutput(
                document
                    .createAccessor()
                    .setType(original.getType())
                    .setArray(array)
                    .setBuffer(document.getRoot().listBuffers()[0])
            );
        }
        driving.setName('Beach_Riding_Loop');
        animations.filter((clip) => clip !== driving).forEach((clip) => clip.dispose());
        document
            .getRoot()
            .listNodes()
            .forEach((node) => {
                node.setMesh(null);
                node.setSkin(null);
            });
    }
    if (model.id === 'horse')
        for (const clip of document.getRoot().listAnimations())
            if (!['Idle', 'Walk', 'WalkSlow'].includes(clip.getName())) clip.dispose();
    document.getRoot().getAsset().copyright = `${model.author} - CC0 1.0`;
    await document.transform(resample(), prune());
    const destination = path.join(output, `${model.id}.glb`);
    await io.write(destination, document);
    const bytes = await readFile(destination);
    manifest.push({
        ...model,
        license: 'CC0-1.0',
        sourceSha256: sha(await readFile(input)),
        ...(model.id === 'horse'
            ? { externalResources: { 'Horse.bin': sha(await readFile(path.join(source, 'Horse.bin'))) } }
            : {}),
        bytes: bytes.length,
        sha256: sha(bytes),
        animations: document
            .getRoot()
            .listAnimations()
            .map((a) => a.getName())
    });
}
await writeFile(
    path.join(root, 'scripts/beach-activities.prepared.json'),
    await format(JSON.stringify(manifest), { parser: 'json', tabWidth: 4, printWidth: 120 })
);
console.log(JSON.stringify(manifest.map(({ id, bytes, animations }) => ({ id, bytes, animations }))));
