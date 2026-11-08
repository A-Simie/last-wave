import type { Vector3Tuple } from '../data/foundation.ts';

type Point = { readonly x: number; readonly y: number; readonly z: number };

export const projectCompanionRoute = (route: readonly Point[], point: Point) => {
    if (route.length === 0) throw new Error('A companion route needs a point.');
    let nearest = Infinity;
    let travelled = 0;
    let progress = 0;
    let next = 1;
    let position: Vector3Tuple = [route[0].x, route[0].y, route[0].z];
    for (let i = 1; i < route.length; i++) {
        const a = route[i - 1];
        const b = route[i];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const length = Math.hypot(dx, dz);
        const t =
            length === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / length ** 2));
        const x = a.x + dx * t;
        const z = a.z + dz * t;
        const distance = Math.hypot(point.x - x, point.z - z);
        if (distance < nearest) {
            nearest = distance;
            progress = travelled + length * t;
            position = [x, a.y + (b.y - a.y) * t, z];
            next = i;
        }
        travelled += length;
    }
    return { position, progress, next };
};
