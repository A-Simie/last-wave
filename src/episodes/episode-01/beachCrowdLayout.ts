import type { BoxDefinition, Vector3Tuple } from '../../data/foundation.ts';
import type { PreparedModelId } from '../../data/newModels.ts';

import { BEACH_DRESSING_SOLIDS, BEACH_WALKER_ROUTES } from './beachLayout.ts';
import { BEACH_ARRIVAL_GROUND, BEACH_SHORE_Z } from './entryLayout.ts';

/**
 * Deterministic layout for the expanded beach crowd: umbrella camps with occupied loungers, sunbathers on mats,
 * chatting groups, ball games, supplied beach dioramas and a sushi & ramen booth. Pure data so checkpoint
 * validation and tests see exactly the solids the runtime builds.
 */
export type CrowdPose = 'seated' | 'lyingBack' | 'lyingFront' | 'talk' | 'idle' | 'player';
export type CrowdMember = {
    readonly position: Vector3Tuple;
    readonly yaw: number;
    readonly pose: CrowdPose;
    readonly model: 'beachTeal' | 'beachCoral' | 'beachGold' | 'beachBlue';
};
export type CrowdProp = {
    readonly kind: PreparedModelId | 'towel';
    readonly position: Vector3Tuple;
    readonly yaw: number;
    /** Uniform fit for prepared models: target footprint (x, z) in metres before yaw. */
    readonly footprint?: readonly [number, number];
    readonly height?: number;
    readonly color?: number;
};
export type CrowdSpot = {
    readonly name: string;
    readonly kind: 'umbrella' | 'mats' | 'group' | 'game' | 'set' | 'sushi';
    readonly center: Vector3Tuple;
    readonly members: readonly CrowdMember[];
    readonly props: readonly CrowdProp[];
    readonly solids: readonly BoxDefinition[];
};

const MODELS = ['beachTeal', 'beachCoral', 'beachGold', 'beachBlue'] as const;
const UMBRELLAS: readonly PreparedModelId[] = ['elegantUmbrella', 'yellowUmbrella', 'umbrellaA', 'umbrellaB'];

// Small deterministic generator so every build and test sees the same beach.
const random = (() => {
    let seed = 0x2f6b9d1;
    return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
})();
const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];

const HALF_WIDTH = BEACH_ARRIVAL_GROUND.size[0] / 2;
const REAR_Z = BEACH_ARRIVAL_GROUND.position[2] + BEACH_ARRIVAL_GROUND.size[2] / 2;
const SPOT_MIN_Z = BEACH_SHORE_Z + 3.5;
const SPOT_MAX_Z = REAR_Z - 3.2;

/** Points that must stay reachable: arrival, navigation probes, checkpoint migration targets and walk loops. */
const KEEP_CLEAR: readonly [number, number, number][] = [
    [0, 3.6, 4.6],
    [-8.5, 5.6, 3],
    [0, -13.8, 3],
    [4, 1.4, 3],
    [-13.5, -4, 3],
    [11, -5, 3],
    [11.7, 9.8, 3],
    [14.9, 10, 3],
    [-43, 9.8, 3.4],
    [43, 9.8, 3.4],
    [-44, -30, 3],
    [45, -30, 3]
];

const transform = (cx: number, cz: number, yaw: number, x: number, z: number): [number, number] => {
    const a = (yaw * Math.PI) / 180;
    return [cx + x * Math.cos(a) + z * Math.sin(a), cz - x * Math.sin(a) + z * Math.cos(a)];
};

// Fixed set pieces first: the supplied dioramas and the food booth claim their space before random camps.
const FIXED: readonly {
    kind: CrowdSpot['kind'];
    model?: PreparedModelId;
    x: number;
    z: number;
    yaw: number;
    footprint: readonly [number, number];
}[] = [
    { kind: 'sushi', model: 'sushiBooth', x: -58, z: 5.6, yaw: 180, footprint: [9, 8.7] },
    { kind: 'set', model: 'beachKit', x: 72, z: -5, yaw: 180, footprint: [10, 2.8] },
    { kind: 'set', model: 'beachScene', x: -76, z: -9, yaw: 180, footprint: [6, 4.5] },
    { kind: 'set', model: 'psxBeachPack', x: 93, z: 1.5, yaw: 180, footprint: [9, 6.7] },
    { kind: 'set', model: 'atABeach', x: -96, z: -3, yaw: 180, footprint: [9, 8.5] },
    { kind: 'set', model: 'beachTable', x: 60, z: 4, yaw: 0, footprint: [2.2, 2.2] },
    { kind: 'set', model: 'beachTable', x: -67, z: -20, yaw: 0, footprint: [2.2, 2.2] },
    { kind: 'set', model: 'beachTable', x: 106, z: -17, yaw: 0, footprint: [2.2, 2.2] },
    { kind: 'set', model: 'beachKit', x: -110, z: -14, yaw: 180, footprint: [10, 2.8] },
    { kind: 'set', model: 'beachScene', x: 112, z: 3, yaw: 180, footprint: [6, 4.5] }
];

const reserved: { x: number; z: number; radius: number }[] = [];
const blockedBySolids = (x: number, z: number, radius: number) =>
    BEACH_DRESSING_SOLIDS.some(({ position, size }) => {
        const dx = Math.max(0, Math.abs(x - position[0]) - size[0] / 2);
        const dz = Math.max(0, Math.abs(z - position[2]) - size[2] / 2);
        return Math.hypot(dx, dz) < radius;
    });
const blockedByRoutes = (x: number, z: number, radius: number) =>
    BEACH_WALKER_ROUTES.some((route) => {
        const xs = route.map((p) => p[0]);
        const zs = route.map((p) => p[2]);
        const dx = Math.max(0, Math.min(...xs) - x, x - Math.max(...xs));
        const dz = Math.max(0, Math.min(...zs) - z, z - Math.max(...zs));
        return Math.hypot(dx, dz) < radius + 1.4;
    });
const isFree = (x: number, z: number, radius: number) =>
    Math.abs(x) > 4.6 + radius &&
    Math.abs(x) < HALF_WIDTH - 2.2 - radius &&
    z - radius > SPOT_MIN_Z &&
    z + radius < SPOT_MAX_Z + 1.5 &&
    !blockedBySolids(x, z, radius + 1.6) &&
    !blockedByRoutes(x, z, radius) &&
    KEEP_CLEAR.every(([px, pz, r]) => Math.hypot(px - x, pz - z) > r + radius) &&
    reserved.every((other) => Math.hypot(other.x - x, other.z - z) > other.radius + radius + 0.9);

const member = (
    cx: number,
    cz: number,
    spotYaw: number,
    x: number,
    z: number,
    yaw: number,
    pose: CrowdPose
): CrowdMember => {
    const [px, pz] = transform(cx, cz, spotYaw, x, z);
    return { position: [px, 0, pz], yaw: spotYaw + yaw, pose, model: pick(MODELS) };
};
const prop = (
    cx: number,
    cz: number,
    spotYaw: number,
    kind: CrowdProp['kind'],
    x: number,
    z: number,
    yaw: number,
    extra: Partial<CrowdProp> = {}
): CrowdProp => {
    const [px, pz] = transform(cx, cz, spotYaw, x, z);
    return { kind, position: [px, 0, pz], yaw: spotYaw + yaw, ...extra };
};
const solid = (
    name: string,
    cx: number,
    cz: number,
    spotYaw: number,
    x: number,
    z: number,
    size: Vector3Tuple
): BoxDefinition => {
    const [px, pz] = transform(cx, cz, spotYaw, x, z);
    return { name, position: [px, size[1] / 2, pz], size, yaw: spotYaw };
};

const spots: CrowdSpot[] = [];
for (const fixed of FIXED) {
    const radius = Math.hypot(...fixed.footprint) / 2;
    reserved.push({ x: fixed.x, z: fixed.z, radius });
    const name = `beach-${fixed.kind}-${spots.length}`;
    const { x, z, yaw } = fixed;
    if (fixed.kind === 'sushi') {
        // Counter faces the sea (local +Z after yaw); diners stand at the counter, the cook works behind it.
        spots.push({
            name,
            kind: 'sushi',
            center: [x, 0, z],
            props: [{ kind: 'sushiBooth', position: [x, 0, z], yaw, footprint: fixed.footprint }],
            members: [
                member(x, z, yaw, 0, -0.6, 0, 'talk'),
                member(x, z, yaw, -2.2, 5.6, 180, 'talk'),
                member(x, z, yaw, -0.6, 5.7, 180, 'idle'),
                member(x, z, yaw, 1.2, 5.6, 180, 'talk'),
                member(x, z, yaw, 2.9, 5.9, 160, 'idle'),
                member(x, z, yaw, 3.6, 7, -150, 'talk')
            ],
            solids: [
                solid(`${name}-booth`, x, z, yaw, 0, -1.2, [8.6, 4.8, 5.8]),
                ...[-2.2, -0.6, 1.2, 2.9].map((px, i) =>
                    solid(`${name}-diner-${i}`, x, z, yaw, px, 5.65, [0.6, 1.84, 0.6])
                ),
                solid(`${name}-diner-4`, x, z, yaw, 3.6, 7, [0.6, 1.84, 0.6])
            ]
        });
        continue;
    }
    const [w, d] = fixed.footprint;
    const lying = Math.max(1, Math.round((w * d) / 25));
    spots.push({
        name,
        kind: 'set',
        center: [x, 0, z],
        props: [{ kind: fixed.model!, position: [x, 0, z], yaw, footprint: fixed.footprint }],
        members: Array.from({ length: lying }, (_, i) =>
            member(x, z, yaw, -w / 2 + (w * (i + 0.5)) / lying, d / 2 + 1.75, 0, i % 2 ? 'lyingFront' : 'lyingBack')
        ),
        solids: [solid(`${name}-set`, x, z, yaw, 0, 0, [w * 0.9, 1.6, d * 0.9])]
    });
    for (let i = 0; i < lying; i++)
        spots[spots.length - 1] = {
            ...spots[spots.length - 1],
            props: [
                ...spots[spots.length - 1].props,
                prop(x, z, yaw, 'towel', -w / 2 + (w * (i + 0.5)) / lying, d / 2 + 0.75, 0, { color: i })
            ]
        };
}

// Random camps across a jittered grid spanning both wings and the gaps in the original beach.
const kinds: readonly { kind: CrowdSpot['kind']; weight: number; radius: number }[] = [
    { kind: 'umbrella', weight: 0.4, radius: 2.2 },
    { kind: 'mats', weight: 0.26, radius: 2.1 },
    { kind: 'group', weight: 0.1, radius: 1.4 },
    { kind: 'game', weight: 0.24, radius: 3 }
];
const chooseKind = () => {
    let roll = random();
    for (const entry of kinds) {
        roll -= entry.weight;
        if (roll <= 0) return entry;
    }
    return kinds[0];
};
let umbrellaIndex = 0;
for (let gz = SPOT_MIN_Z + 2.4; gz < SPOT_MAX_Z; gz += 5.4) {
    for (let gx = -HALF_WIDTH + 6; gx < HALF_WIDTH - 5; gx += 5.9) {
        const x = gx + (random() - 0.5) * 2.4;
        const z = gz + (random() - 0.5) * 1.8;
        // Fall back to progressively smaller camps where the preferred one does not fit.
        const preferred = chooseKind();
        const entry = [preferred, kinds[0], kinds[1], kinds[2]].find(({ radius }) => isFree(x, z, radius));
        if (!entry) continue;
        reserved.push({ x, z, radius: entry.radius });
        const yaw = 180 + (random() - 0.5) * 50;
        const name = `beach-${entry.kind}-${spots.length}`;
        if (entry.kind === 'umbrella') {
            const umbrella = UMBRELLAS[umbrellaIndex++ % UMBRELLAS.length];
            const chairB = random() < 0.3;
            const chair = chairB ? 'beachChairB' : 'beachChairA';
            // Supplied loungers are authored facing +X; -90 turns them to face the spot's front (the sea).
            spots.push({
                name,
                kind: 'umbrella',
                center: [x, 0, z],
                props: [
                    prop(x, z, yaw, umbrella, 0, -0.3, random() * 360, { footprint: [2.6, 2.6] }),
                    prop(x, z, yaw, chair, -0.85, 0.35, -90, { footprint: chairB ? [0.9, 1.9] : [1.55, 0.95] }),
                    prop(x, z, yaw, chair, 0.85, 0.35, -90, { footprint: chairB ? [0.9, 1.9] : [1.55, 0.95] }),
                    prop(x, z, yaw, 'towel', 0, -1.75, 0, { color: spots.length })
                ],
                members: [
                    member(x, z, yaw, -0.85, 0.2, 0, 'seated'),
                    member(x, z, yaw, 0.85, 0.2, 0, random() < 0.5 ? 'seated' : 'talk'),
                    member(x, z, yaw, 0, -0.85, 0, random() < 0.5 ? 'lyingBack' : 'lyingFront')
                ],
                solids: [solid(`${name}-camp`, x, z, yaw, 0, -0.45, [2.7, 1.3, 3.5])]
            });
        } else if (entry.kind === 'mats') {
            const count = random() < 0.5 ? 3 : 2;
            const props: CrowdProp[] = [];
            const members: CrowdMember[] = [];
            for (let i = 0; i < count; i++) {
                const px = (i - (count - 1) / 2) * 1.15;
                props.push(prop(x, z, yaw, 'towel', px, 0, 0, { color: spots.length + i }));
                members.push(member(x, z, yaw, px, 0.9, 0, random() < 0.55 ? 'lyingBack' : 'lyingFront'));
            }
            if (random() < 0.45) props.push(prop(x, z, yaw, 'beachBall', count * 0.62, 0.6, 0, { height: 0.42 }));
            spots.push({
                name,
                kind: 'mats',
                center: [x, 0, z],
                props,
                members,
                solids: [solid(`${name}-mats`, x, z, yaw, 0, 0, [count * 1.15 + 0.2, 0.5, 2.2])]
            });
        } else if (entry.kind === 'group') {
            const count = random() < 0.5 ? 3 : 4;
            const members: CrowdMember[] = [];
            const solids: BoxDefinition[] = [];
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + random() * 0.4;
                const px = Math.sin(angle) * 0.85;
                const pz = Math.cos(angle) * 0.85;
                // Each person faces the circle's centre.
                members.push(member(x, z, 0, px, pz, (Math.atan2(-px, -pz) * 180) / Math.PI, i % 2 ? 'talk' : 'idle'));
                solids.push(solid(`${name}-person-${i}`, x, z, 0, px, pz, [0.6, 1.84, 0.6]));
            }
            spots.push({ name, kind: 'group', center: [x, 0, z], props: [], members, solids });
        } else {
            // Ball game: four players on the corners of a court, facing inwards; the ball is animated at runtime.
            const corners: [number, number][] = [
                [-2.4, -1.4],
                [2.4, -1.4],
                [2.4, 1.4],
                [-2.4, 1.4]
            ];
            spots.push({
                name,
                kind: 'game',
                center: [x, 0, z],
                props: [prop(x, z, 0, 'beachBall', 0, 0, 0, { height: 0.42 })],
                members: corners.map(([px, pz]) =>
                    member(x, z, 0, px, pz, (Math.atan2(-px, -pz) * 180) / Math.PI, 'player')
                ),
                solids: corners.map(([px, pz], i) => solid(`${name}-player-${i}`, x, z, 0, px, pz, [0.6, 1.84, 0.6]))
            });
        }
    }
}

export const BEACH_CROWD_SPOTS: readonly CrowdSpot[] = spots;
export const BEACH_CROWD_SOLIDS: readonly BoxDefinition[] = spots.flatMap(({ solids }) => solids);

/** Swimmers and waders spread along the whole widened shoreline. */
export const BEACH_CROWD_SWIMMERS: readonly { x: number; z: number; swimming: boolean; model: CrowdMember['model'] }[] =
    Array.from({ length: 34 }, (_, i) => {
        const x = -HALF_WIDTH + 10 + ((i * 6.7) % (HALF_WIDTH * 2 - 20));
        return {
            x: Math.abs(x) < 8 ? x + 12 : x,
            z: BEACH_SHORE_Z - 5 - ((i * 3.7) % 11),
            swimming: i % 3 !== 0,
            model: MODELS[i % MODELS.length]
        };
    });

/** Shoreline strollers walk up and down the wet sand in the wings, clear of the original walker loops. */
export const BEACH_CROWD_STROLLERS: readonly { from: number; to: number; z: number; model: CrowdMember['model'] }[] = [
    ...[-1, 1].flatMap((side) =>
        Array.from({ length: 9 }, (_, i) => ({
            from: side * (52 + (i % 3) * 4),
            to: side * (HALF_WIDTH - 6 - (i % 4) * 3),
            z: BEACH_SHORE_Z + 2.1 + (i % 3) * 0.9,
            model: MODELS[(i + (side > 0 ? 1 : 0)) % MODELS.length]
        }))
    )
];

export const BEACH_CROWD_COUNT =
    spots.reduce((total, { members }) => total + members.length, 0) +
    BEACH_CROWD_SWIMMERS.length +
    BEACH_CROWD_STROLLERS.length;
