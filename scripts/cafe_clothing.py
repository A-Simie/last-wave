"""Build simple skinned café outfits from the supplied base-body geometry."""

import math
from dataclasses import dataclass

import numpy as np


def fit_body(attributes, inverse_bind_matrices, bone_names, female):
    factors = {"pelvis": 0.92 if female else 0.86, "spine": 0.92 if female else 0.84,
               "upperarm": 0.86 if female else 0.76, "lowerarm": 0.92 if female else 0.85,
               "thigh": 0.92 if female else 0.88, "calf": 0.94 if female else 0.9}
    transforms = []
    for name, values in zip(bone_names, inverse_bind_matrices):
        factor = next((value for prefix, value in factors.items() if name.startswith(prefix)), 1)
        inverse = np.asarray(values).reshape(4, 4).T
        transforms.append(np.linalg.inv(inverse) @ np.diag([factor, 1, factor, 1]) @ inverse)
    fitted = {**attributes, 'POSITION': [], 'NORMAL': []}
    for position, normal, joints, weights in zip(attributes['POSITION'], attributes['NORMAL'],
                                                attributes['JOINTS_0'], attributes['WEIGHTS_0']):
        transform = sum(transforms[joint] * weight for joint, weight in zip(joints, weights))
        fitted['POSITION'].append(tuple((transform @ [*position, 1])[:3]))
        fitted['NORMAL'].append(normalize(np.linalg.inv(transform[:3, :3]).T @ normal))
    return fitted


@dataclass
class Vertex:
    position: tuple
    normal: tuple
    uv: tuple
    weights: dict


def mix(a, b, amount):
    return tuple(x + (y - x) * amount for x, y in zip(a, b))


def normalize(vector):
    length = math.sqrt(sum(value * value for value in vector))
    return tuple(value / length for value in vector) if length else (0, 1, 0)


def interpolate(a, b, amount):
    weights = {joint: a.weights.get(joint, 0) * (1 - amount) + b.weights.get(joint, 0) * amount
               for joint in a.weights.keys() | b.weights.keys()}
    return Vertex(mix(a.position, b.position, amount), mix(a.normal, b.normal, amount),
                  mix(a.uv, b.uv, amount), weights)


def clip(polygon, distance):
    result = []
    for a, b in zip(polygon, polygon[1:] + polygon[:1]):
        da, db = distance(a.position), distance(b.position)
        if da >= 0:
            result.append(a)
        if (da < 0) != (db < 0):
            result.append(interpolate(a, b, da / (da - db)))
    return result


def smoothstep(start, end, value):
    t = max(0, min(1, (value - start) / (end - start)))
    return t * t * (3 - 2 * t)


def section(height, rows):
    for a, b in zip(rows, rows[1:]):
        if height <= b[0]:
            return mix(a[1:], b[1:], max(0, (height - a[0]) / (b[0] - a[0])))
    return rows[-1][1:]


class Geometry:
    def __init__(self):
        self.vertices = []
        self.indices = []
        self.cache = {}

    def polygon(self, polygon, deform=lambda vertex: vertex):
        if len(polygon) < 3:
            return
        indices = []
        for vertex in polygon:
            vertex = deform(vertex)
            key = tuple(round(value, 7) for value in (*vertex.position, *vertex.normal, *vertex.uv))
            if key not in self.cache:
                self.cache[key] = len(self.vertices)
                self.vertices.append(vertex)
            indices.append(self.cache[key])
        for i in range(1, len(indices) - 1):
            self.indices.extend((indices[0], indices[i], indices[i + 1]))

    def attributes(self, smooth=False):
        normals = {}
        position_key = lambda vertex: tuple(round(value, 6) for value in vertex.position)
        if smooth:
            for i in range(0, len(self.indices), 3):
                vertices = [self.vertices[index] for index in self.indices[i:i + 3]]
                a, b, c = [v.position for v in vertices]
                u, v = [b[j] - a[j] for j in range(3)], [c[j] - a[j] for j in range(3)]
                normal = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
                for vertex in vertices:
                    total = normals.setdefault(position_key(vertex), [0, 0, 0])
                    for axis in range(3):
                        total[axis] += normal[axis]
        result = {name: [] for name in ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']}
        for vertex in self.vertices:
            weights = sorted(vertex.weights.items(), key=lambda pair: pair[1], reverse=True)[:4]
            weights += [(0, 0)] * (4 - len(weights))
            total = sum(weight for _, weight in weights)
            result['POSITION'].append(vertex.position)
            result['NORMAL'].append(normalize(normals[position_key(vertex)] if smooth else vertex.normal))
            result['TEXCOORD_0'].append(vertex.uv)
            result['JOINTS_0'].append(tuple(joint for joint, _ in weights))
            result['WEIGHTS_0'].append(tuple(weight / total for _, weight in weights))
        return result


def make_clothing(attributes, indices, female, suit=False):
    vertices = [Vertex(position, attributes['NORMAL'][i], attributes['TEXCOORD_0'][i],
                       {joint: weight for joint, weight in zip(attributes['JOINTS_0'][i], attributes['WEIGHTS_0'][i]) if weight})
                for i, position in enumerate(attributes['POSITION'])]
    groups = {name: Geometry() for name in ['skin', 'shirt', 'denim', 'shoes', 'soles']}
    if suit:
        groups.update({name: Geometry() for name in ['collar', 'tie']})
    neckline = 1.48 if female else 1.555
    cuff = (0.75 if female else 0.84) if suit else (0.435 if female else 0.5)
    shirt_planes = [lambda p: p[1] - 0.97, lambda p: cuff - abs(p[0]),
                    lambda p: neckline + 0.055 * min(1, abs(p[0]) / 0.13) - p[1]]

    def shirt(vertex):
        x, y, z = vertex.position
        inflated = tuple(p + n * 0.006 for p, n in zip(vertex.position, vertex.normal))
        rx, rz = section(y, [(0.97, 0.17 if female else 0.175, 0.122),
                             (1.23, 0.153 if female else 0.173, 0.13),
                             (1.4, 0.175 if female else 0.195, 0.137)])
        angle = math.atan2((z + 0.018) / rz, x / rx)
        drape = (rx * math.cos(angle), y, -0.018 + rz * math.sin(angle))
        blend = 1 - smoothstep(1.29 if female else 1.35, 1.42 if female else 1.49, y)
        blend *= 1 - smoothstep(0.23, 0.32, abs(x))
        position = mix(inflated, drape, blend)
        return Vertex(position, vertex.normal, vertex.uv, vertex.weights)

    def trousers(vertex):
        x, y, z = vertex.position
        center, depth, rx, rz = section(y, [
            (0.13, 0.132, -0.082, 0.054, 0.062),
            (0.45, 0.123, -0.07, 0.066, 0.075),
            (0.65, 0.115, -0.028, 0.079, 0.09),
            (0.85, 0.11, -0.032, 0.091, 0.108)
        ])
        center = math.copysign(center, x)
        angle = math.atan2((z - depth) / rz, (x - center) / rx)
        leg = (center + rx * math.cos(angle), y, depth + rz * math.sin(angle))
        inflated = tuple(p + n * 0.006 for p, n in zip(vertex.position, vertex.normal))
        position = mix(leg, inflated, smoothstep(0.72, 0.88, y))
        return Vertex(position, vertex.normal, vertex.uv, vertex.weights)

    for i in range(0, len(indices), 3):
        triangle = [vertices[index] for index in indices[i:i + 3]]
        dressed = triangle
        for plane in shirt_planes:
            dressed = clip(dressed, plane)
        if suit:
            inset = dressed
            for plane in [lambda p: p[2] - 0.04, lambda p: p[1] - 1.17,
                          lambda p: (p[1] - 1.12) * 0.25 - abs(p[0])]:
                groups['shirt'].polygon(clip(inset, lambda p: -plane(p)), shirt)
                inset = clip(inset, plane)
            tie = inset
            for plane in [lambda p: 0.023 - abs(p[0]), lambda p: 1.51 - p[1]]:
                groups['collar'].polygon(clip(tie, lambda p: -plane(p)), shirt)
                tie = clip(tie, plane)
            groups['tie'].polygon(tie, shirt)
        else:
            groups['shirt'].polygon(dressed, shirt)
        trousers_part = clip(clip(triangle, lambda p: p[1] - 0.13), lambda p: 1.005 - p[1])
        groups['denim'].polygon(trousers_part, trousers)
        remaining = clip(triangle, lambda p: p[1] - 0.995)
        # Subtract the garment volume while retaining clean interpolated skin boundaries.
        for plane in shirt_planes:
            groups['skin'].polygon(clip(remaining, lambda p: -plane(p)))
            remaining = clip(remaining, plane)

    for side in [-1, 1]:
        foot = [v for v in vertices if v.position[0] * side > 0 and v.position[1] < 0.2]

        def shoe_vertex(x, y, z):
            position = (side * 0.135 + x, y, z)
            nearest = min(foot, key=lambda vertex: sum((a - b) ** 2 for a, b in zip(position, vertex.position)))
            return Vertex(position, (0, 1, 0), (0, 0), nearest.weights)

        rings = []
        for y, width, back, front in [(-0.009, 0.057, -0.15, 0.135), (0.019, 0.06, -0.15, 0.14),
                                     (0.035, 0.059, -0.148, 0.137), (0.087, 0.056, -0.143, 0.126),
                                     (0.13, 0.049, -0.137, 0.025), (0.17, 0.045, -0.13, -0.028)]:
            ring = []
            for i in range(20):
                angle = i * math.tau / 20
                x = math.copysign(abs(math.cos(angle)) ** 0.65, math.cos(angle)) * width
                z = (front + back) / 2 + math.copysign(abs(math.sin(angle)) ** 0.65, math.sin(angle)) * (front - back) / 2
                ring.append(shoe_vertex(x, y, z))
            rings.append(ring)
        groups['soles'].polygon(rings[0])
        groups['shoes'].polygon(list(reversed(rings[-1])))
        for level, (lower, upper) in enumerate(zip(rings, rings[1:])):
            group = groups['soles' if level < 2 else 'shoes']
            for i in range(20):
                next_index = (i + 1) % 20
                group.polygon([lower[i], upper[i], upper[next_index], lower[next_index]])
    return groups
