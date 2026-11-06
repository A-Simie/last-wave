"""Shape the supplied faces in bind space without changing the rig or UVs."""

import numpy as np


def shape_face(attributes, female, profile):
    if not profile:
        return attributes
    chin = 1.55 if female else 1.595

    def deform(points):
        x, y, z = points.T
        jaw = np.exp(-((y - chin) / 0.06) ** 2)
        cheek = np.exp(-((y - chin - 0.075) / 0.045) ** 2)
        head = np.exp(-(x / 0.16) ** 8)
        width = 1 + head * ((profile['jaw'] - 1) * jaw + (profile['cheek'] - 1) * cheek)
        nose = np.exp(-((x / 0.025) ** 2 + ((y - chin - 0.077) / 0.033) ** 2))
        nose *= np.clip((z - 0.055) / 0.04, 0, 1)
        return np.column_stack((x * width, y, z + profile['nose'] * nose))

    positions = np.asarray(attributes['POSITION'])
    epsilon = 0.0001
    jacobian = np.stack([
        (deform(positions + axis * epsilon) - deform(positions - axis * epsilon)) / (2 * epsilon)
        for axis in np.eye(3)
    ], axis=2)
    normals = np.linalg.solve(jacobian.transpose(0, 2, 1), np.asarray(attributes['NORMAL'])[..., None])[..., 0]
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-8)
    return {**attributes, 'POSITION': deform(positions).tolist(), 'NORMAL': normals.tolist()}
