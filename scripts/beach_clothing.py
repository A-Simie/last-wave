from cafe_clothing import Geometry, Vertex, clip


def make_swimwear(attributes, indices, female):
    vertices = [Vertex(position, attributes['NORMAL'][i], attributes['TEXCOORD_0'][i],
                       {joint: weight for joint, weight in zip(attributes['JOINTS_0'][i], attributes['WEIGHTS_0'][i]) if weight})
                for i, position in enumerate(attributes['POSITION'])]
    groups = {name: Geometry() for name in ['skin', 'fabric', 'trim']}
    hem = 0.8 if female else 0.68
    planes = [lambda p: p[1] - hem]
    if female:
        planes.extend([lambda p: 0.235 - abs(p[0]),
                       lambda p: 1.415 + 0.13 * min(1, abs(p[0]) / 0.135) - p[1]])
    else:
        planes.append(lambda p: 1.03 - p[1])

    def fabric(vertex):
        offset = 0.008 if female else 0.018
        return Vertex(tuple(p + n * offset for p, n in zip(vertex.position, vertex.normal)),
                      vertex.normal, vertex.uv, vertex.weights)

    for i in range(0, len(indices), 3):
        remaining = [vertices[index] for index in indices[i:i + 3]]
        for plane in planes:
            groups['skin'].polygon(clip(remaining, lambda p: -plane(p)))
            remaining = clip(remaining, plane)
        band = remaining
        for plane in [lambda p: p[1] - 0.99, lambda p: 1.025 - p[1]]:
            groups['fabric'].polygon(clip(band, lambda p: -plane(p)), fabric)
            band = clip(band, plane)
        groups['trim'].polygon(band, fabric)
    return groups
