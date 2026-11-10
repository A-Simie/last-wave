"""Prepare supplied CC0 forest assets without additional build dependencies."""
import base64
import copy
import hashlib
import io
import importlib.util
import json
import math
import struct
import zipfile
import zlib
from pathlib import Path

from PIL import Image, ImageEnhance
from casual_animation import multiply

spec = importlib.util.spec_from_file_location('cafe_preparation', Path(__file__).with_name('prepare-cafe-assets.py'))
cafe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cafe)
Glb, add_animations, load = cafe.Glb, cafe.add_animations, cafe.load

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/forest'
LIB = ROOT / 'asset-library/forest'
OUT.mkdir(parents=True, exist_ok=True)
LIB.mkdir(parents=True, exist_ok=True)
ORIGINALS = LIB / 'originals'


def glb(doc, data, target):
    while len(data) % 4:
        data += b'\0'
    doc['buffers'] = [{'byteLength': len(data)}]
    encoded = json.dumps(doc, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    target.write_bytes(struct.pack('<III', 0x46546c67, 2, 28 + len(encoded) + len(data)) +
                       struct.pack('<II', len(encoded), 0x4e4f534a) + encoded +
                       struct.pack('<II', len(data), 0x004e4942) + data)


def read_uri(archive, folder, uri):
    return base64.b64decode(uri.split(',')[1]) if uri.startswith('data:') else archive.read(folder + uri)


def pack_gltf(archive, name, target):
    folder = name.rsplit('/', 1)[0] + '/'
    doc = json.loads(archive.read(name))
    data = b''
    offsets = []
    for buffer in doc['buffers']:
        offsets.append(len(data))
        block = read_uri(archive, folder, buffer['uri'])
        data += block + b'\0' * (-len(block) % 4)
    for view in doc['bufferViews']:
        view['byteOffset'] = view.get('byteOffset', 0) + offsets[view.get('buffer', 0)]
        view['buffer'] = 0
    for image in doc.get('images', []):
        if 'uri' not in image:
            continue
        block = read_uri(archive, folder, image.pop('uri'))
        picture = Image.open(io.BytesIO(block)).convert('RGBA')
        picture = ImageEnhance.Color(picture).enhance(0.25)
        output = io.BytesIO()
        picture.save(output, format='PNG', optimize=True)
        block = output.getvalue()
        image.update(bufferView=len(doc['bufferViews']), mimeType='image/png')
        doc['bufferViews'].append({'buffer': 0, 'byteOffset': len(data), 'byteLength': len(block)})
        data += block + b'\0' * (-len(block) % 4)
    glb(doc, data, target)


def fbx_nodes(data):
    version = struct.unpack_from('<I', data, 23)[0]
    wide = version >= 7500
    header = 25 if wide else 13

    def node(pos):
        end, count, _, length = struct.unpack_from('<QQQB' if wide else '<IIIB', data, pos)
        if not end:
            return None, pos + header
        pos += header
        name = data[pos:pos + length].decode()
        pos += length
        props = []
        for _ in range(count):
            kind = chr(data[pos])
            pos += 1
            if kind in 'fdilbc':
                size, encoding, byte_count = struct.unpack_from('<III', data, pos)
                pos += 12
                block = data[pos:pos + byte_count]
                pos += byte_count
                if encoding:
                    block = zlib.decompress(block)
                fmt = {'f': 'f', 'd': 'd', 'i': 'i', 'l': 'q', 'b': 'b', 'c': 'b'}[kind]
                props.append(struct.unpack('<' + fmt * size, block))
            elif kind in 'SR':
                size = struct.unpack_from('<I', data, pos)[0]
                pos += 4
                block = data[pos:pos + size]
                pos += size
                props.append(block.decode(errors='replace') if kind == 'S' else block)
            else:
                fmt = {'Y': 'h', 'C': '?', 'I': 'i', 'F': 'f', 'D': 'd', 'L': 'q'}[kind]
                props.append(struct.unpack_from('<' + fmt, data, pos)[0])
                pos += struct.calcsize(fmt)
        children = []
        while pos < end - header:
            child, pos = node(pos)
            if child:
                children.append(child)
        return (name, props, children), end

    result, pos = [], 27
    while pos < len(data) - header:
        value, pos = node(pos)
        if not value:
            break
        result.append(value)
    return result


def pack_fbx(raw, texture, target):
    nodes = fbx_nodes(raw)
    objects = next(n for n in nodes if n[0] == 'Objects')[2]
    positions, normals, uv = [], [], []
    for geometry in (n for n in objects if n[0] == 'Geometry' and n[1][-1] == 'Mesh'):
        fields = {n[0]: n for n in geometry[2]}
        vertices = fields['Vertices'][1][0]
        polygons = fields['PolygonVertexIndex'][1][0]
        layer = fields.get('LayerElementUV')
        uv_fields = {n[0]: n[1] for n in layer[2]} if layer else {}
        coords, indices = uv_fields.get('UV', [()])[0], uv_fields.get('UVIndex', [()])[0]
        polygon = []
        for corner, index in enumerate(polygons):
            vertex = -index - 1 if index < 0 else index
            tex = indices[corner] if indices else corner
            polygon.append((vertices[vertex * 3:vertex * 3 + 3],
                            coords[tex * 2:tex * 2 + 2] if coords else (0, 0)))
            if index >= 0:
                continue
            for k in range(1, len(polygon) - 1):
                triangle = [polygon[0], polygon[k], polygon[k + 1]]
                a, b, c = [p[0] for p in triangle]
                u, v = [b[j] - a[j] for j in range(3)], [c[j] - a[j] for j in range(3)]
                normal = [u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]]
                length = math.sqrt(sum(n*n for n in normal)) or 1
                for position, texcoord in triangle:
                    positions.extend(position)
                    normals.extend(n / length for n in normal)
                    uv.extend((texcoord[0], 1 - texcoord[1]))
            polygon = []
    doc = {'asset': {'version': '2.0'}, 'scene': 0, 'scenes': [{'nodes': [0]}],
           'nodes': [{'mesh': 0}], 'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2}, 'material': 0}]}],
           'materials': [{'doubleSided': True, 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 0.9}}],
           'textures': [{'source': 0}], 'images': [{'bufferView': 3, 'mimeType': 'image/png'}],
           'accessors': [], 'bufferViews': []}
    data = b''
    for values, dimension in [(positions, 3), (normals, 3), (uv, 2)]:
        block = struct.pack('<' + 'f' * len(values), *values)
        doc['bufferViews'].append({'buffer': 0, 'byteOffset': len(data), 'byteLength': len(block)})
        accessor = {'bufferView': len(doc['bufferViews']) - 1, 'componentType': 5126,
                    'count': len(values) // dimension, 'type': f'VEC{dimension}'}
        if values is positions:
            accessor['min'] = [min(positions[j::3]) for j in range(3)]
            accessor['max'] = [max(positions[j::3]) for j in range(3)]
        doc['accessors'].append(accessor)
        data += block
    doc['bufferViews'].append({'buffer': 0, 'byteOffset': len(data), 'byteLength': len(texture)})
    glb(doc, data + texture, target)


with zipfile.ZipFile(ORIGINALS / 'KayKit_Forest_Nature_Pack_1.0_FREE.zip') as archive:
    folder = 'KayKit_Forest_Nature_Pack_1.0_FREE/Assets/gltf/'
    for name in ['Tree_Bare_1_A', 'Tree_Bare_2_B', 'Tree_1_A', 'Rock_1_A', 'Bush_1_A',
                 'Tree_2_D', 'Tree_3_B', 'Tree_4_C', 'Tree_Bare_1_C', 'Tree_Bare_2_A',
                 'Grass_1_A', 'Grass_2_B', 'Rock_2_C', 'Bush_2_D']:
        pack_gltf(archive, folder + name + '_Color1.gltf', OUT / (name + '.glb'))
    license_name = next(n for n in archive.namelist() if 'license' in n.lower())
    (LIB / 'kaykit-license.txt').write_bytes(archive.read(license_name))
with zipfile.ZipFile(ORIGINALS / 'Halloween_Kit_AssetQuest.zip') as archive:
    for name in ['Pumpkin_Lantern_1', 'Gravestone_1', 'Lantern_1', 'Big_Cat_Skull',
                 'Fence_1', 'Fence_3', 'Coffin_1', 'Gravestone_2', 'Gravestone_3',
                 'Pumpkin_Lantern_2', 'Pumpkin_Lantern_3', 'Pumpkin_2', 'Lantern_2',
                 'Lantern_Pole', 'Candle_1', 'Stone_Slab', 'Bird_Skull', 'Wolf_Skull']:
        pack_fbx(archive.read('Meshes/' + name + '.fbx'), archive.read('Textures/BaseColor.png'), OUT / (name + '.glb'))
    (LIB / 'assetquest-license.txt').write_bytes(archive.read('License.txt'))
with zipfile.ZipFile(ORIGINALS / '43344__tuneseeker__forest-pack-01.zip') as archive:
    (LIB / 'tuneseeker-license.txt').write_bytes(archive.read('_readme_and_license.txt'))
    (OUT / 'forest.wav').write_bytes(archive.read('802063__tuneseeker__forest-ambience-05.wav'))

animation_source = load(ROOT / 'asset-library/source-packs/Universal Animation Library[Standard]/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb')
actor = Glb(load(ROOT / 'public/assets/characters/patronBeard.glb'))
for node in actor.doc['nodes']:
    node.pop('mesh', None)
    node.pop('skin', None)
actor.doc.pop('skins', None)
add_animations(actor, animation_source, ['Casual_Walk_Loop', 'Idle_Torch_Loop', 'Crouch_Idle_Loop', 'Hit_Head', 'Interact', 'Casual_Idle_Loop'])
walk, torch = actor.doc['animations'][:2]
walk['name'] = 'Forest_Phone_Walk'
prepared = (actor.doc, [actor.binary], None, None)
walk_duration = max(cafe.values(prepared, sampler['input'])[-1][0] for sampler in walk['samplers'])
holding_arm = {i for i, node in enumerate(actor.doc['nodes']) if node.get('name', '').endswith('_l') and any(part in node['name'] for part in ['clavicle', 'upperarm', 'lowerarm', 'hand'])}
walk['channels'] = [channel for channel in walk['channels'] if channel['target']['node'] not in holding_arm]
for channel in torch['channels']:
    if channel['target']['node'] not in holding_arm:
        continue
    sampler = torch['samplers'][channel['sampler']].copy()
    times = cafe.values(prepared, sampler['input'])
    sampler['input'] = actor.array([(time[0] * walk_duration / times[-1][0],) for time in times], 'SCALAR')
    walk['channels'].append({'sampler': len(walk['samplers']), 'target': channel['target'].copy()})
    walk['samplers'].append(sampler.copy())
for base, name in [(torch, 'Forest_Phone_Look_Up'), (actor.doc['animations'][5], 'Forest_Look_Up')]:
    clip = copy.deepcopy(base)
    clip['name'] = name
    angle = math.radians(-20) / 2
    correction = [math.sin(angle), 0, 0, math.cos(angle)]
    for channel in clip['channels']:
        node = actor.doc['nodes'][channel['target']['node']]
        if channel['target']['path'] == 'rotation' and node['name'] == 'neck_01':
            sampler = clip['samplers'][channel['sampler']]
            rows = cafe.values(prepared, sampler['output'])
            sampler['output'] = actor.array([multiply(row, correction).tolist() for row in rows], 'VEC4')
    actor.doc['animations'].append(clip)
actor.write(OUT / 'forest-performances.glb')

records = []
for path in sorted(OUT.iterdir()):
    records.append({'file': path.relative_to(ROOT).as_posix(), 'bytes': path.stat().st_size,
                    'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
sources = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(ORIGINALS.iterdir())]
(LIB / 'preparation.json').write_text(json.dumps({'sources': sources, 'outputs': records,
    'note': 'FBX static geometry triangulated with per-corner UVs and flat normals; calibrated after conversion. KayKit palette saturation reduced to 25%. Originals retained in asset-library/forest/originals; unlicensed wind MP3 is preserved but not deployed.'}, indent=2) + '\n')
print(f'Prepared {len(records)} forest assets, {sum(r["bytes"] for r in records)} bytes')
