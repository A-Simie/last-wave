import type { Vector3Tuple } from '../data/foundation.ts';

export const FOREST_SCARE_START = 24;
export const FOREST_WATCHER_ORIGIN: Vector3Tuple = [-1.1, 2.35, -4.8];
export const FOREST_EYE_ANCHORS: readonly Vector3Tuple[] = [
    FOREST_WATCHER_ORIGIN,
    [-1.9, 2.8, -5.5],
    [-0.3, 3.1, -5.7],
    [-1.5, 3.65, -6.4],
    [-0.15, 2.6, -6.2],
    [-2.3, 3.3, -6.6]
];

export const forestBatFlight = (index: number, time: number) => {
    const origin = FOREST_EYE_ANCHORS[index % FOREST_EYE_ANCHORS.length]!;
    const elapsed = time - FOREST_SCARE_START - index * 0.035;
    const t = Math.max(0, Math.min(1, elapsed / (3.1 + (index % 5) * 0.22)));
    const p = Math.pow(t, 0.7),
        inverse = 1 - p;
    const lane = index % 4;
    const end: Vector3Tuple =
        lane === 0
            ? [-4 - (index % 3), 2.8 + (index % 3) * 0.4, 14]
            : lane === 1
              ? [4 + (index % 3), 3 + (index % 4) * 0.5, 12]
              : lane === 2
                ? [-12, 5 + (index % 3), -8]
                : [12, 6 + (index % 2), -6];
    const control1: Vector3Tuple = [origin[0] + (index % 2 ? 0.9 : -0.8), origin[1] + 1.5, origin[2] + 2.2];
    const control2: Vector3Tuple = [end[0] * 0.6, end[1] + 1.7, end[2] * 0.5];
    const position = origin.map(
        (value, axis) =>
            inverse ** 3 * value +
            3 * inverse ** 2 * p * control1[axis]! +
            3 * inverse * p ** 2 * control2[axis]! +
            p ** 3 * end[axis]!
    ) as Vector3Tuple;
    const tangent = origin.map(
        (value, axis) =>
            3 * inverse ** 2 * (control1[axis]! - value) +
            6 * inverse * p * (control2[axis]! - control1[axis]!) +
            3 * p ** 2 * (end[axis]! - control2[axis]!)
    );
    return {
        position,
        visible: elapsed >= 0 && t < 1,
        phase: elapsed,
        origin,
        yaw: Math.atan2(tangent[0]!, tangent[2]!)
    };
};
