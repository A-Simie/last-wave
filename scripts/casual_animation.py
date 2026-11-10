"""Bake civilian pose corrections into the licensed full-body animation tracks."""

import numpy as np

PROFILES = {
    "Casual_Idle_Loop": {"source": "Idle_Loop", "handCurl": 0.22, "upright": 0.65},
    "Casual_Walk_Loop": {"source": "Walk_Formal_Loop", "handCurl": 0.22, "upright": 0.65},
    "Relaxed_Jog_Loop": {"source": "Jog_Fwd_Loop", "handCurl": 0.3},
    "Relaxed_Sprint_Loop": {"source": "Sprint_Loop", "handCurl": 0.3},
    "Traffic_Driving_Loop": {"source": "Driving_Loop", "neckPitch": 24},
}


def slerp(a, b, amount):
    a, b = np.asarray(a, dtype=float), np.asarray(b, dtype=float)
    a, b = a / np.linalg.norm(a), b / np.linalg.norm(b)
    dot = np.dot(a, b)
    if dot < 0:
        b, dot = -b, -dot
    if dot > 0.9995:
        result = a + (b - a) * amount
        return result / np.linalg.norm(result)
    angle = np.arccos(np.clip(dot, -1, 1))
    return (np.sin((1 - amount) * angle) * a + np.sin(amount * angle) * b) / np.sin(angle)


def multiply(a, b):
    av, bv = np.asarray(a[:3]), np.asarray(b[:3])
    return np.r_[a[3] * bv + b[3] * av + np.cross(av, bv), a[3] * b[3] - np.dot(av, bv)]


def rotations(name, rows, rest, profile):
    if name.startswith(("thumb_", "index_", "middle_", "ring_", "pinky_")) and "handCurl" in profile:
        return [slerp(rest, row, profile["handCurl"]).tolist() for row in rows]
    if name == "neck_01" and profile.get("neckPitch"):
        angle = np.radians(profile["neckPitch"]) / 2
        correction = [np.sin(angle), 0, 0, np.cos(angle)]
        return [multiply(correction, row).tolist() for row in rows]
    if name not in ("spine_02", "spine_03") or not profile.get("upright"):
        return rows
    # Remove the mean hunch while retaining the authored breathing and counter-rotation.
    samples = np.asarray(rows)
    samples[np.dot(samples, samples[0]) < 0] *= -1
    average = samples.mean(axis=0)
    average /= np.linalg.norm(average)
    correction = multiply(slerp(average, rest, profile["upright"]), np.r_[-average[:3], average[3]])
    return [multiply(correction, row).tolist() for row in rows]
