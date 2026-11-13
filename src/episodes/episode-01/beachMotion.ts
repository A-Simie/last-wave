export const beachCircuitLength = (from: number, to: number, radius: number) =>
    Math.abs(to - from) * 2 + Math.PI * radius * 2;

export const sampleBeachCircuit = (distance: number, from: number, to: number, z: number, radius: number) => {
    const west = Math.min(from, to),
        east = Math.max(from, to);
    const straight = east - west,
        bend = Math.PI * radius;
    const length = beachCircuitLength(from, to, radius);
    const d = ((distance % length) + length) % length;
    if (d < straight) return { x: west + d, z: z - radius, heading: 90 };
    if (d < straight + bend) {
        const angle = -Math.PI / 2 + (d - straight) / radius;
        return {
            x: east + Math.cos(angle) * radius,
            z: z + Math.sin(angle) * radius,
            heading: (-angle * 180) / Math.PI
        };
    }
    if (d < straight * 2 + bend) return { x: east - (d - straight - bend), z: z + radius, heading: -90 };
    const angle = Math.PI / 2 + (d - straight * 2 - bend) / radius;
    return { x: west + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius, heading: (-angle * 180) / Math.PI };
};

export const approachBeachSpeed = (speed: number, target: number, dt: number, acceleration = 1.3) =>
    speed + Math.max(-acceleration * dt, Math.min(acceleration * dt, target - speed));
