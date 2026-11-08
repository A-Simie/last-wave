import hashlib
import importlib.util
import json
from pathlib import Path

from beach_clothing import make_swimwear
from cafe_clothing import fit_body
from cafe_faces import shape_face

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / 'asset-library'
spec = importlib.util.spec_from_file_location('cafe_assets', Path(__file__).with_name('prepare-cafe-assets.py'))
assets = importlib.util.module_from_spec(spec)
spec.loader.exec_module(assets)


def clothe(model, outfit):
    source = model.source
    primitive = source[0]['meshes'][2]['primitives'][0]
    attributes = {name: assets.values(source, index) for name, index in primitive['attributes'].items()
                  if name in ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']}
    indices = [row[0] for row in assets.values(source, primitive['indices'])]
    body = next(node for node in source[0]['nodes'] if node.get('mesh') == 2)
    skin = source[0]['skins'][body['skin']]
    female = outfit['body'] == 'Female'
    attributes = fit_body(attributes, assets.values(source, skin['inverseBindMatrices']),
                          [source[0]['nodes'][i]['name'] for i in skin['joints']], female)
    attributes = shape_face(attributes, female, outfit.get('face'))
    groups = make_swimwear(attributes, indices, female)
    assets.apply_clothing(model, groups, model.material(source, primitive['material'], True),
                          {'fabric': outfit['color'], 'trim': [0.91, 0.86, 0.68, 1]}, 'beach')


def record(path):
    data = path.read_bytes()
    return {'file': path.relative_to(ROOT).as_posix(), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def main():
    selection = json.loads((LIBRARY / 'beach-selection.json').read_text(encoding='utf-8'))
    base = LIBRARY / 'source-packs/Universal Base Characters[Standard]/Universal Base Characters[Standard]'
    animation_path = LIBRARY / 'source-packs/Universal Animation Library[Standard]/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb'
    animation = assets.load(animation_path)
    report = {'author': 'Quaternius', 'license': 'CC0-1.0', 'selection': 'asset-library/beach-selection.json',
              'preparation': 'Last Wave fitted, skinned swimwear; 512px textures; path-checked in-place clips.',
              'archives': [record(LIBRARY / 'archives' / name) for name in
                           ['Universal Base Characters[Standard].zip', 'Universal Animation Library[Standard].zip']],
              'animationSource': record(animation_path), 'characters': []}
    for item in selection['characters']:
        source = base / 'Base Characters/Godot - UE' / ('Superhero_' + item['body'] + '_FullBody.gltf')
        hair = base / 'Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)' / ('Hair_' + item['hair'] + '.gltf')
        model = assets.Glb(assets.load(source), item)
        model.geometry(True)
        clothe(model, item)
        assets.add_hair(model, assets.load(hair))
        assets.add_animations(model, animation, selection['clips'])
        result = model.write(ROOT / 'public/assets/characters' / (item['id'] + '.glb'))
        report['characters'].append({'id': item['id'], 'source': record(source), 'hair': record(hair),
                                     'clips': selection['clips'], **result})
        print(item['id'], result['bytes'])
    (LIBRARY / 'beach-preparation.json').write_text(json.dumps(report, indent=4) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
