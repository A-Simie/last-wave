type Point = { readonly x: number; readonly z: number };
export type StreetObstacle = Point & { readonly radius: number };
export type StreetCorridor = {
    readonly minX: number;
    readonly maxX: number;
    readonly minZ: number;
    readonly maxZ: number;
};

export const stepStreetWalker = (
    position: Point,
    target: Point,
    travel: number,
    obstacles: readonly StreetObstacle[],
    corridor: StreetCorridor,
    walkable: (x: number, z: number) => boolean
): readonly [number, number] => {
    const dx = target.x - position.x;
    const dz = target.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.0001 || travel <= 0) return [position.x, position.z];
    const length = Math.min(distance, travel);
    const heading = Math.atan2(dz, dx);
    const room = (angle: number) => {
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        const width =
            Math.abs(x) < 0.001
                ? Infinity
                : (x > 0 ? corridor.maxX - position.x : position.x - corridor.minX) / Math.abs(x);
        const depth =
            Math.abs(z) < 0.001
                ? Infinity
                : (z > 0 ? corridor.maxZ - position.z : position.z - corridor.minZ) / Math.abs(z);
        return Math.min(width, depth);
    };
    const side = room(heading + Math.PI / 2) >= room(heading - Math.PI / 2) ? 1 : -1;
    for (const angle of [
        0,
        side * 0.6,
        -side * 0.6,
        side * 1.2,
        -side * 1.2,
        (side * Math.PI) / 2,
        (-side * Math.PI) / 2,
        side * 2.1,
        -side * 2.1
    ]) {
        const x = position.x + Math.cos(heading + angle) * length;
        const z = position.z + Math.sin(heading + angle) * length;
        if (x < corridor.minX || x > corridor.maxX || z < corridor.minZ || z > corridor.maxZ) continue;
        if (
            obstacles.some((other) => {
                const next = Math.hypot(x - other.x, z - other.z);
                const current = Math.hypot(position.x - other.x, position.z - other.z);
                return next < other.radius && next < current + 0.00001;
            })
        )
            continue;
        if (walkable(x, z)) return [x, z];
    }
    return [position.x, position.z];
};
