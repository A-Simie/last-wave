"""Prepare the selected café GLBs from archived downloads (Python 3, Pillow and NumPy)."""

import copy
import hashlib
import io
import json
import struct
import zipfile
from pathlib import Path

from PIL import Image

from cafe_clothing import fit_body, make_clothing
from cafe_faces import shape_face

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "asset-library"
SELECTION = json.loads((LIBRARY / "cafe-selection.json").read_text(encoding="utf-8"))
COUNTS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}
FORMATS = {5120: "b", 5121: "B", 5122: "h", 5123: "H", 5125: "I", 5126: "f"}


def load(path):
    data = path.read_bytes()
    if path.suffix == ".glb":
        size = struct.unpack_from("<I", data, 12)[0]
        document = json.loads(data[20:20 + size])
        buffers = [data[28 + size:]]
    else:
        document = json.loads(data)
        buffers = [(path.parent / b["uri"]).read_bytes() for b in document["buffers"]]
    return document, buffers, path.parent, path.resolve()


def values(source, index):
    doc, buffers, _, _ = source
    accessor = doc["accessors"][index]
    view = doc["bufferViews"][accessor["bufferView"]]
    fmt = "<" + FORMATS[accessor["componentType"]] * COUNTS[accessor["type"]]
    stride = view.get("byteStride", struct.calcsize(fmt))
    offset = view.get("byteOffset", 0) + accessor.get("byteOffset", 0)
    return [struct.unpack_from(fmt, buffers[view.get("buffer", 0)], offset + i * stride)
            for i in range(accessor["count"])]


def paths(doc):
    result = {}

    def visit(index, prefix):
        node = doc["nodes"][index]
        path = prefix + node["name"]
        result[path] = index
        for child in node.get("children", []):
            visit(child, path + "/")

    for index in doc["scenes"][doc.get("scene", 0)]["nodes"]:
        visit(index, "")
    return result


class Glb:
    def __init__(self, source, appearance=None):
        self.source = source
        self.appearance = appearance or {}
        self.doc = copy.deepcopy(source[0])
        self.binary = bytearray()
        for key in ["accessors", "bufferViews", "images", "textures", "materials"]:
            self.doc[key] = []
        self.doc.pop("animations", None)
        self.doc.pop("samplers", None)
        self.cache = {}

    def view(self, data):
        self.binary.extend(b"\0" * (-len(self.binary) % 4))
        index = len(self.doc["bufferViews"])
        self.doc["bufferViews"].append({"buffer": 0, "byteOffset": len(self.binary), "byteLength": len(data)})
        self.binary.extend(data)
        return index

    def accessor(self, source, index, replacement=None):
        key = (source[3], "accessor", index)
        if replacement is None and key in self.cache:
            return self.cache[key]
        original = source[0]["accessors"][index]
        rows = replacement if replacement is not None else values(source, index)
        return self.array(rows, original["type"], original["componentType"],
                          original.get("normalized", False), key if replacement is None else None)

    def array(self, rows, kind, component=5126, normalized=False, key=None):
        fmt = "<" + FORMATS[component] * COUNTS[kind]
        data = b"".join(struct.pack(fmt, *row) for row in rows)
        content_key = (kind, component, normalized, hashlib.sha256(data).digest())
        if content_key in self.cache:
            return self.cache[content_key]
        accessor = {"bufferView": self.view(data), "componentType": component, "count": len(rows), "type": kind}
        if normalized:
            accessor["normalized"] = True
        if component == 5126:
            accessor["min"] = [min(v) for v in zip(*rows)]
            accessor["max"] = [max(v) for v in zip(*rows)]
        index = len(self.doc["accessors"])
        self.doc["accessors"].append(accessor)
        self.cache[content_key] = index
        if key:
            self.cache[key] = index
        return index

    def material(self, source, index, character=False):
        key = (source[3], "material", index)
        if key in self.cache:
            return self.cache[key]
        material = copy.deepcopy(source[0]["materials"][index])
        if not any(material.get("emissiveFactor", [0, 0, 0])):
            material.pop("emissiveTexture", None)
        if character:
            material.pop("normalTexture", None)
            material["pbrMetallicRoughness"].pop("metallicRoughnessTexture", None)
            material["pbrMetallicRoughness"]["roughnessFactor"] = 0.88
            if material.get("name", "").startswith("MI_Hair"):
                material["pbrMetallicRoughness"]["baseColorFactor"] = self.appearance["hairColor"]
        for container in [material, material.get("pbrMetallicRoughness", {})]:
            for name, info in container.items():
                if not name.endswith("Texture") or not isinstance(info, dict):
                    continue
                texture_key = (source[3], "texture", info["index"])
                if texture_key not in self.cache:
                    texture = source[0]["textures"][info["index"]]
                    image = source[0]["images"][texture["source"]]
                    if "uri" in image:
                        path = source[2] / image["uri"]
                        if character and "Superhero" in image["uri"]:
                            female = self.appearance["body"] == "Female"
                            tone = self.appearance["skin"]
                            texture_name = (f"T_Superhero_Female_{tone}_BaseColor.png" if female else
                                            "T_Superhero_Male_" + ("Ligh" if tone == "Light" else tone) + ".png")
                            path = source[2].parent / "Textures" / texture_name
                        image_data = path.read_bytes()
                    else:
                        view = source[0]["bufferViews"][image["bufferView"]]
                        start = view.get("byteOffset", 0)
                        image_data = source[1][view.get("buffer", 0)][start:start + view["byteLength"]]
                    picture = Image.open(io.BytesIO(image_data))
                    size = self.appearance.get("textureSize", 1024) if character else 512
                    picture.thumbnail((size, size), Image.Resampling.LANCZOS)
                    output = io.BytesIO()
                    picture.save(output, format="PNG", optimize=True)
                    image_index = len(self.doc["images"])
                    self.doc["images"].append({"name": image.get("name", name), "mimeType": "image/png", "bufferView": self.view(output.getvalue())})
                    self.cache[texture_key] = len(self.doc["textures"])
                    self.doc["textures"].append({"source": image_index})
                info["index"] = self.cache[texture_key]
                info.pop("texCoord", None)
        result = len(self.doc["materials"])
        self.doc["materials"].append(material)
        self.cache[key] = result
        return result

    def mesh(self, source, mesh, character=False):
        result = copy.deepcopy(mesh)
        for primitive in result["primitives"]:
            face = {}
            if character:
                face = shape_face({name: values(source, primitive["attributes"][name])
                                   for name in ["POSITION", "NORMAL"]},
                                  self.appearance["body"] == "Female", self.appearance.get("face"))
            primitive["attributes"] = {
                name: self.accessor(source, index, face.get(name))
                for name, index in primitive["attributes"].items()
                if name in ("POSITION", "NORMAL", "TEXCOORD_0", "JOINTS_0", "WEIGHTS_0") or (name == "COLOR_0" and not character)
            }
            if "indices" in primitive:
                primitive["indices"] = self.accessor(source, primitive["indices"])
            if "material" in primitive:
                primitive["material"] = self.material(source, primitive["material"], character)
        return result

    def geometry(self, character=False):
        self.doc["meshes"] = [
            {"primitives": []} if character and index == 2 else self.mesh(self.source, mesh, character)
            for index, mesh in enumerate(self.source[0].get("meshes", []))
        ]
        for skin in self.doc.get("skins", []):
            skin["inverseBindMatrices"] = self.accessor(self.source, skin["inverseBindMatrices"])

    def write(self, path):
        self.binary.extend(b"\0" * (-len(self.binary) % 4))
        self.doc["buffers"] = [{"byteLength": len(self.binary)}]
        self.doc["asset"]["generator"] = "Last Wave selected-asset preparation"
        for key in ["images", "textures", "materials", "meshes"]:
            if not self.doc.get(key):
                self.doc.pop(key, None)
        text = json.dumps(self.doc, separators=(",", ":")).encode()
        text += b" " * (-len(text) % 4)
        data = struct.pack("<III", 0x46546C67, 2, 28 + len(text) + len(self.binary))
        data += struct.pack("<II", len(text), 0x4E4F534A) + text
        data += struct.pack("<II", len(self.binary), 0x004E4942) + self.binary
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return {"file": path.relative_to(ROOT).as_posix(), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def clothe(model, outfit):
    source = model.source
    primitive = source[0]["meshes"][2]["primitives"][0]
    attributes = {name: values(source, primitive["attributes"][name])
                  for name in ["POSITION", "NORMAL", "TEXCOORD_0", "JOINTS_0", "WEIGHTS_0"]}
    indices = [v[0] for v in values(source, primitive["indices"])]
    body_node = next(node for node in source[0]["nodes"] if node.get("mesh") == 2)
    skin = source[0]["skins"][body_node["skin"]]
    attributes = fit_body(attributes, values(source, skin["inverseBindMatrices"]),
                          [source[0]["nodes"][i]["name"] for i in skin["joints"]], outfit["body"] == "Female")
    attributes = shape_face(attributes, outfit["body"] == "Female", outfit.get("face"))
    groups = make_clothing(attributes, indices, outfit["body"] == "Female", outfit.get("suit", False))
    skin_material = model.material(source, primitive["material"], True)
    primitives = []
    for region, group in groups.items():
        part = {"attributes": {}, "indices": model.array([(i,) for i in group.indices], "SCALAR", 5123), "material": skin_material}
        for name, rows in group.attributes(smooth=region != "skin").items():
            part["attributes"][name] = model.array(rows, "VEC" + str(len(rows[0])), 5123 if name == "JOINTS_0" else 5126)
        if region != "skin":
            part["material"] = len(model.doc["materials"])
            color = {"shirt": outfit["shirt"], "denim": outfit.get("trousers", [0.028, 0.055, 0.087, 1]),
                     "shoes": [0.065, 0.045, 0.032, 1], "soles": [0.57, 0.52, 0.43, 1],
                     "collar": [0.91, 0.88, 0.81, 1], "tie": [0.3, 0.055, 0.025, 1]}[region]
            model.doc["materials"].append({"name": "cafe-" + region, "doubleSided": True,
                                           "pbrMetallicRoughness": {"baseColorFactor": color, "metallicFactor": 0, "roughnessFactor": 0.95}})
        primitives.append(part)
    # Single-primitive skinned nodes avoid duplicate skin-cache references in Engine 2.23.3.
    model.doc["meshes"][2]["primitives"] = primitives[:1]
    body_index = next(i for i, node in enumerate(model.doc["nodes"]) if node.get("mesh") == 2)
    parent = next(node for node in model.doc["nodes"] if body_index in node.get("children", []))
    for region, primitive in zip(list(groups)[1:], primitives[1:]):
        node = copy.deepcopy(model.doc["nodes"][body_index])
        node["name"] = "cafe-" + region
        node["mesh"] = len(model.doc["meshes"])
        model.doc["meshes"].append({"name": node["name"], "primitives": [primitive]})
        parent["children"].append(len(model.doc["nodes"]))
        model.doc["nodes"].append(node)


def add_hair(model, source):
    target_paths = paths(model.doc)
    source_paths = {index: name for name, index in paths(source[0]).items()}
    skin_offset = len(model.doc["skins"])
    for original in source[0]["skins"]:
        skin = copy.deepcopy(original)
        skin["joints"] = [target_paths[source_paths[index]] for index in skin["joints"]]
        skin["inverseBindMatrices"] = model.accessor(source, original["inverseBindMatrices"])
        model.doc["skins"].append(skin)
    for node in source[0]["nodes"]:
        if "mesh" not in node:
            continue
        child = copy.deepcopy(node)
        child["mesh"] = len(model.doc["meshes"])
        child["skin"] += skin_offset
        model.doc["meshes"].append(model.mesh(source, source[0]["meshes"][node["mesh"]], True))
        model.doc["nodes"][target_paths["Armature"]]["children"].append(len(model.doc["nodes"]))
        model.doc["nodes"].append(child)


def add_animations(model, source):
    target_paths = paths(model.doc)
    source_paths = {index: name for name, index in paths(source[0]).items()}
    model.doc["animations"] = []
    for clip in source[0]["animations"]:
        if clip["name"] not in SELECTION["clips"]:
            continue
        result = {"name": clip["name"], "channels": [], "samplers": []}
        for channel in clip["channels"]:
            old_index = channel["target"]["node"]
            path = source_paths[old_index]
            if path not in target_paths:
                raise ValueError("Unmatched animation target: " + path)
            index = target_paths[path]
            sampler = copy.deepcopy(clip["samplers"][channel["sampler"]])
            property_name = channel["target"]["path"]
            if property_name == "scale":
                continue
            output = values(source, sampler["output"])
            if property_name == "translation":
                source_rest = source[0]["nodes"][old_index].get("translation", [0, 0, 0])
                target_rest = model.doc["nodes"][index].get("translation", [0, 0, 0])
                # Preserve destination bone lengths; only root/hip displacement is locomotion.
                moving = path.endswith("/pelvis") or path.endswith("/root")
                if not moving:
                    continue
                output = [[target_rest[j] + v[j] - source_rest[j] for j in range(3)] for v in output]
            times = values(source, sampler["input"])
            constant = all(abs(a - b) < 0.00001 for row in output for a, b in zip(row, output[0]))
            retained = [0, len(times) - 1] if constant else sorted(set(range(0, len(times), 2)) | {len(times) - 1})
            sampler["input"] = model.array([times[i] for i in retained], "SCALAR")
            sampler["output"] = model.array([output[i] for i in retained], "VEC4" if property_name == "rotation" else "VEC3")
            result["channels"].append({"sampler": len(result["samplers"]), "target": {"node": index, "path": channel["target"]["path"]}})
            result["samplers"].append(sampler)
        model.doc["animations"].append(result)


def main():
    archives = []
    for archive in sorted((LIBRARY / "archives").glob("*.zip")):
        destination = LIBRARY / "source-packs" / archive.stem
        with zipfile.ZipFile(archive) as content:
            if not destination.exists():
                for name in content.namelist():
                    if not (destination / name).resolve().is_relative_to(destination.resolve()):
                        raise ValueError("Archive path leaves extraction directory")
                content.extractall(destination)
            archives.append({"file": archive.relative_to(ROOT).as_posix(), "entries": len(content.infolist()), "bytes": archive.stat().st_size,
                             "sha256": hashlib.sha256(archive.read_bytes()).hexdigest()})
    report = {"archives": archives, "models": [], "characters": [], "missing": SELECTION["missing"], "reserve": SELECTION["reserve"]}
    for item in SELECTION["models"]:
        if "pack" in item:
            pack = SELECTION["packs"][item["pack"]]
            source = LIBRARY / "source-packs" / Path(pack["archive"]).stem / pack["directory"] / item["file"]
        else:
            source = ROOT / item["file"]
        model = Glb(load(source))
        model.geometry()
        result = model.write(ROOT / "public/assets/props/tideline" / (item["id"] + ".glb"))
        report["models"].append({"id": item["id"], "source": source.relative_to(ROOT).as_posix(), **result})
        print(item["id"], result["bytes"])
    base = LIBRARY / "source-packs/Universal Base Characters[Standard]/Universal Base Characters[Standard]"
    animation = load(LIBRARY / "source-packs/Universal Animation Library[Standard]/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb")
    for item in SELECTION["characters"]:
        source = base / "Base Characters/Godot - UE" / ("Superhero_" + item["body"] + "_FullBody.gltf")
        model = Glb(load(source), item)
        model.geometry(True)
        clothe(model, item)
        for hair in [item["hair"], *(["Beard"] if item.get("beard") else [])]:
            add_hair(model, load(base / "Hairstyles/Rigged to Head Bone/glTF (Godot -Unreal)" / ("Hair_" + hair + ".gltf")))
        add_animations(model, animation)
        result = model.write(ROOT / "public/assets/characters" / (item["id"] + ".glb"))
        report["characters"].append({"id": item["id"], "source": source.relative_to(ROOT).as_posix(), "clips": SELECTION["clips"], **result})
        print(item["id"], result["bytes"])
    (LIBRARY / "cafe-preparation.json").write_text(json.dumps(report, indent=4) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
