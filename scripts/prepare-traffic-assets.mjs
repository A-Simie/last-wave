import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.resolve(process.argv[2] ?? '.', 'package.json'));
const { NodeIO, getBounds } = require('@gltf-transform/core');
const { ALL_EXTENSIONS } = require('@gltf-transform/extensions');
const {
    clearNodeParent,
    clearNodeTransform,
    compactPrimitive,
    dedup,
    joinPrimitives,
    prune,
    simplify,
    textureCompress,
    transformPrimitive,
    weld
} = require('@gltf-transform/functions');
const draco = require('draco3dgltf');
const { MeshoptSimplifier } = require('meshoptimizer');
const sharp = require('sharp');
const source = 'asset-library/source/porsche-911-carrera-4s-original.glb';
const output = 'public/assets/vehicles/porsche-911-traffic.glb';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco.createDecoderModule()
});
await MeshoptSimplifier.ready;
const document = await io.read(path.join(root, source));
const model = document.getRoot();
model
    .listExtensionsUsed()
    .find((extension) => extension.extensionName === 'KHR_draco_mesh_compression')
    ?.dispose();
const scene = model.getDefaultScene();
const buffer = model.listBuffers()[0];
const originals = model.listNodes().filter((node) => node.getMesh());
const triangles = () =>
    model
        .listMeshes()
        .reduce(
            (total, mesh) =>
                total +
                mesh
                    .listPrimitives()
                    .reduce(
                        (count, primitive) =>
                            count +
                            (primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION').getCount()) / 3,
                        0
                    ),
            0
        );
const sourceTriangles = triangles();
for (const node of originals) {
    clearNodeParent(node);
    clearNodeTransform(node);
}
for (const node of scene.listChildren()) scene.removeChild(node);
const car = document.createNode('traffic-car');
scene.addChild(car);
const body = document.createNode('car-body');
car.addChild(body);
const bodyMaterials = new Map();
const wheelParts = new Map();
for (const node of originals) {
    for (const primitive of node.getMesh().listPrimitives()) {
        const material = primitive.getMaterial();
        // Replace the duplicate transparent lacquer shell with a single clear-coated paint material.
        if (node.getName() === 'Plane_0' || material.getName() === 'coat') continue;
        const wheel = /^(Cylinder\.00[01])_[0-3]$/.exec(node.getName());
        const groups = wheel ? wheelParts : bodyMaterials;
        const key = wheel ? wheel[1] : material;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(primitive);
    }
}
const wheels = [];
for (const [axle, primitives] of wheelParts) {
    const axleWheels = [];
    for (const side of [-1, 1]) {
        const parts = primitives.map((original) => {
            const position = original.getAttribute('POSITION');
            const indices = original.getIndices().getArray();
            const selected = [];
            for (let i = 0; i < indices.length; i += 3) {
                if (side * position.getScalar(indices[i]) > 0) selected.push(...indices.slice(i, i + 3));
            }
            const primitive = original
                .clone()
                .setIndices(
                    document.createAccessor().setType('SCALAR').setArray(new Uint32Array(selected)).setBuffer(buffer)
                );
            compactPrimitive(primitive);
            return primitive;
        });
        const tire = parts.find((primitive) => primitive.getMaterial().getName() === 'rubber').getAttribute('POSITION');
        const min = tire.getMin([]),
            max = tire.getMax([]);
        const center = min.map((value, index) => (value + max[index]) / 2);
        assert.ok(side * center[0] > 0.6 && side * center[0] < 0.9, 'Wheel must stay on its side of the car.');
        assert.ok(max[1] - min[1] > 0.6 && max[1] - min[1] < 0.7, 'Unexpected tire diameter.');
        let xx = 0,
            zz = 0,
            xz = 0;
        const point = [];
        for (let i = 0; i < tire.getCount(); i++) {
            tire.getElement(i, point);
            const x = point[0] - center[0],
                z = point[2] - center[2];
            xx += x * x;
            zz += z * z;
            xz += x * z;
        }
        let angle = Math.atan2(2 * xz, xx - zz) / 2 + Math.PI / 2;
        if (angle > Math.PI / 2) angle -= Math.PI;
        const c = Math.cos(angle),
            s = Math.sin(angle);
        const matrix = [
            c,
            0,
            -s,
            0,
            0,
            1,
            0,
            0,
            s,
            0,
            c,
            0,
            -c * center[0] - s * center[2],
            -center[1],
            s * center[0] - c * center[2],
            1
        ];
        parts.forEach((primitive) => transformPrimitive(primitive, matrix));
        const name = `wheel-${axle.endsWith('1') ? 'front' : 'rear'}-${side < 0 ? 'left' : 'right'}`;
        axleWheels.push({ name, center, parts, angle, radius: (max[1] - min[1]) / 2 });
    }
    const axleZ = axleWheels.reduce((sum, wheel) => sum + wheel.center[2], 0) / 2;
    for (const { name, center: sourceCenter, parts, angle, radius } of axleWheels) {
        const center = [sourceCenter[0], sourceCenter[1], axleZ];
        const mesh = document.createMesh(name);
        for (const primitive of parts) {
            const material = primitive.getMaterial();
            if (material.getName() !== 'Material.001') {
                mesh.addPrimitive(primitive);
                continue;
            }
            // Calipers face straight ahead but stay fixed while tires and rims roll.
            transformPrimitive(primitive, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, ...center, 1]);
            if (!bodyMaterials.has(material)) bodyMaterials.set(material, []);
            bodyMaterials.get(material).push(primitive);
        }
        car.addChild(document.createNode(name).setTranslation(center).setMesh(mesh));
        wheels.push({ name, sourceCenter, center, removedSteeringDegrees: (angle * 180) / Math.PI, radius });
    }
}
for (const [material, primitives] of bodyMaterials) {
    const mesh = document.createMesh(`body-${material.getName()}`).addPrimitive(joinPrimitives(primitives));
    body.addChild(document.createNode(mesh.getName()).setMesh(mesh));
}
for (const node of originals) node.dispose();
await document.transform(
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.08, error: 0.003 }),
    dedup(),
    prune()
);

for (const material of model.listMaterials()) {
    const name = material.getName();
    if (name === 'paint')
        material.setName('traffic-paint').setAlphaMode('OPAQUE').setMetallicFactor(0.25).setRoughnessFactor(0.25);
    if (name === 'full_black' || name === 'rubber') material.setMetallicFactor(0);
    if (name === 'window')
        material.setBaseColorFactor([0.09, 0.16, 0.19, 0.28]).setMetallicFactor(0.15).setRoughnessFactor(0.25);
}
await document.transform(textureCompress({ encoder: sharp, resize: [512, 512] }), prune());
model.getAsset().copyright = 'Lionsharp Studios, CC BY-SA 4.0. Traffic adaptation by Last Wave, CC BY-SA 4.0.';
model.setExtras({
    license: 'CC-BY-SA-4.0',
    source: 'https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf'
});
await mkdir(path.dirname(path.join(root, output)), { recursive: true });
await io.write(path.join(root, output), document);
const hash = async (file) => {
    const bytes = await readFile(path.join(root, file));
    return { file, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
};
const record = {
    prepared: '2026-11-09',
    license: 'CC-BY-SA-4.0',
    adaptation: "Last Wave traffic adaptation of Lionsharp Studios' Porsche 911 Carrera 4S",
    source: {
        ...(await hash(source)),
        url: 'https://raw.githubusercontent.com/playcanvas/web-components/main/examples/assets/models/porsche-911-carrera-4s.glb',
        author: 'Lionsharp Studios',
        license: 'CC-BY-SA-4.0'
    },
    output: await hash(output),
    changes: [
        'Removed caption/shadow ground plane and duplicate lacquer shell',
        'Baked node transforms; merged body meshes by material',
        'Split four wheels at measured tire centers and removed static front steering',
        'Simplified geometry with meshoptimizer; resized textures to at most 512 px',
        'Prepared single opaque clear-coat paint and transparent cabin glass'
    ],
    tooling: { gltfTransform: '4.5.1', draco3dgltf: '1.5.9', meshoptimizer: '1.3.0', sharp: '0.35.5' },
    sourceTriangles,
    triangles: triangles(),
    bounds: getBounds(scene),
    wheels,
    materials: model.listMaterials().map((material) => material.getName()),
    textures: model.listTextures().map((texture) => ({ name: texture.getName(), size: texture.getSize() }))
};
await writeFile(path.join(root, 'asset-library/traffic-preparation.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record, null, 2));
