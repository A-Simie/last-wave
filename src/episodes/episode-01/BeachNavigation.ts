import type { Vector3Tuple } from '../../data/foundation.ts';

import { BEACH_ARRIVAL_GROUND } from './entryLayout.ts';

type Point = readonly [number, number, number];
const gap = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[2] - b[2]);
const WALKER_CLEARANCE = 1.15;
const NAVIGATION_HALF_WIDTH = 58;

export class BeachNavigation {
    private readonly points: Vector3Tuple[] = [];
    private readonly neighbors: number[][] = [];
    private readonly edges = new Map<number, boolean>();
    private readonly canStand: (point: Vector3Tuple) => boolean;

    constructor(canStand: (point: Vector3Tuple) => boolean) {
        this.canStand = canStand;
        const grid = new Map<string, number>();
        const { position, size } = BEACH_ARRIVAL_GROUND;
        // The companion follows within the central beach; the far wings are open sand it walks straight across.
        const halfWidth = Math.min(size[0] / 2 - 2, NAVIGATION_HALF_WIDTH);
        for (let x = position[0] - halfWidth; x <= position[0] + halfWidth; x++) {
            for (let z = position[2] - size[2] / 2 + 2; z <= position[2] + size[2] / 2 - 2; z++) {
                const point: Vector3Tuple = [x, 1.04, z];
                if (!canStand(point)) continue;
                grid.set(`${x},${z}`, this.points.length);
                this.points.push(point);
            }
        }
        this.points.forEach((point) => {
            const neighbors: number[] = [];
            for (const [dx, dz] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1]
            ]) {
                const index = grid.get(`${point[0] + dx},${point[2] + dz}`);
                if (index !== undefined) neighbors.push(index);
            }
            this.neighbors.push(neighbors);
        });
    }

    private clearEdge(a: number, b: number) {
        const key = Math.min(a, b) * this.points.length + Math.max(a, b);
        let clear = this.edges.get(key);
        if (clear === undefined) {
            clear = this.clearSegment(this.points[a], this.points[b]);
            this.edges.set(key, clear);
        }
        return clear;
    }

    private avoidsWalkers(a: Point, b: Point, occupied: readonly Point[]) {
        const x = b[0] - a[0];
        const z = b[2] - a[2];
        const lengthSquared = x * x + z * z;
        return occupied.every((other) => {
            const dx = a[0] - other[0];
            const dz = a[2] - other[2];
            const t = lengthSquared ? Math.max(0, Math.min(1, -(dx * x + dz * z) / lengthSquared)) : 0;
            // A close encounter must be able to step out of the clearance margin.
            const clearance = Math.min(WALKER_CLEARANCE, Math.hypot(dx, dz));
            return Math.hypot(dx + x * t, dz + z * t) >= clearance - 0.000001;
        });
    }

    clearSegment(a: Point, b: Point, occupied: readonly Point[] = []) {
        if (!this.avoidsWalkers(a, b, occupied)) return false;
        const steps = Math.max(1, Math.ceil(gap(a, b) / 0.15));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            if (!this.canStand([a[0] + (b[0] - a[0]) * t, 1.04, a[2] + (b[2] - a[2]) * t])) return false;
        }
        return true;
    }

    near(player: Point, from: Point, occupied: readonly Point[] = []): Vector3Tuple | null {
        const candidates: Vector3Tuple[] = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const point: Vector3Tuple = [player[0] + Math.cos(angle) * 2.1, 1.04, player[2] + Math.sin(angle) * 2.1];
            if (this.canStand(point) && occupied.every((other) => gap(point, other) > WALKER_CLEARANCE))
                candidates.push(point);
        }
        candidates.sort((a, b) => gap(a, from) - gap(b, from));
        return candidates[0] ?? null;
    }

    route(from: Point, to: Point, occupied: readonly Point[] = []): Vector3Tuple[] | null {
        if (
            !this.canStand([from[0], 1.04, from[2]]) ||
            !this.canStand([to[0], 1.04, to[2]]) ||
            occupied.some((other) => gap(to, other) < WALKER_CLEARANCE)
        )
            return null;
        if (this.clearSegment(from, to, occupied)) return [[to[0], 1.04, to[2]]];
        const closest = (point: Point) =>
            this.points
                .map((node, index) => ({ index, distance: gap(point, node) }))
                .sort((a, b) => a.distance - b.distance)
                .find(({ index }) => this.clearSegment(point, this.points[index], occupied))?.index;
        const start = closest(from);
        const end = closest(to);
        if (start === undefined || end === undefined) return null;
        const open = new Set([start]);
        const cost = new Map([[start, 0]]);
        const previous = new Map<number, number>();
        while (open.size) {
            let current = -1;
            let best = Infinity;
            for (const index of open) {
                const score = cost.get(index)! + gap(this.points[index], this.points[end]);
                if (score < best) {
                    best = score;
                    current = index;
                }
            }
            if (current === end) {
                const route: Vector3Tuple[] = [[to[0], 1.04, to[2]], this.points[end]];
                while (previous.has(current)) {
                    current = previous.get(current)!;
                    route.push(this.points[current]);
                }
                route.reverse();
                const simplified: Vector3Tuple[] = [];
                let point = from;
                for (let i = 0; i < route.length;) {
                    let next = i;
                    while (next + 1 < route.length && this.clearSegment(point, route[next + 1], occupied)) next++;
                    point = route[next];
                    simplified.push([...point]);
                    i = next + 1;
                }
                return simplified;
            }
            open.delete(current);
            for (const index of this.neighbors[current]) {
                if (!this.clearEdge(current, index)) continue;
                if (!this.avoidsWalkers(this.points[current], this.points[index], occupied)) continue;
                const nextCost = cost.get(current)! + gap(this.points[current], this.points[index]);
                if (nextCost >= (cost.get(index) ?? Infinity)) continue;
                previous.set(index, current);
                cost.set(index, nextCost);
                open.add(index);
            }
        }
        return null;
    }
}
