import assert from 'node:assert/strict';
import { test } from 'node:test';

import { STREET_FRIEND_ROUTE } from '../src/episodes/episode-01/entryLayout.ts';
import { CAFE_OUTSIDE_WAIT, FRIEND_ROUTE, OPENING_EXIT } from '../src/episodes/episode-01/openingLayout.ts';
import { projectCompanionRoute } from '../src/player/CompanionRoute.ts';
import { isFoundationPosition } from '../src/scenes/FoundationState.ts';

const point = ([x, y, z]) => ({ x, y, z });
const route = STREET_FRIEND_ROUTE.map(point);

test('the friend waits beside the café door and the street route never sends her back into its lane', () => {
    assert.deepEqual(FRIEND_ROUTE.at(-1), CAFE_OUTSIDE_WAIT);
    assert.deepEqual(STREET_FRIEND_ROUTE[0], CAFE_OUTSIDE_WAIT);
    assert.ok(Math.abs(CAFE_OUTSIDE_WAIT[0] - OPENING_EXIT[0]) > 1.2);
    assert.ok(CAFE_OUTSIDE_WAIT[2] > OPENING_EXIT[2] + 0.6);
    assert.ok(isFoundationPosition(CAFE_OUTSIDE_WAIT));
    for (let i = FRIEND_ROUTE.length - 2; i < FRIEND_ROUTE.length; i++) {
        const a = FRIEND_ROUTE[i - 1],
            b = FRIEND_ROUTE[i];
        for (let j = 0; j <= 20; j++) {
            const p = a.map((value, k) => value + ((b[k] - value) * j) / 20);
            assert.ok(isFoundationPosition(p), `Café egress route intersects a solid: ${p}`);
        }
    }
});

test('a player past the planter remains ahead during both short north/south route corners', () => {
    for (const friend of [
        [18, 1.04, 6.5],
        [22, 1.04, 7.15],
        [22, 1.04, 6.88]
    ]) {
        const projectedFriend = projectCompanionRoute(route, point(friend));
        const ahead = projectCompanionRoute(route, point([39, 1, 7.8]));
        const behind = projectCompanionRoute(route, point([12, 1, 7.8]));
        assert.ok(ahead.progress > projectedFriend.progress + 15);
        assert.ok(behind.progress < projectedFriend.progress - 5);
    }
});

test('route projection clamps endpoints and tolerates repeated or single waypoints', () => {
    const points = [
        [0, 1, 0],
        [0, 1, 0],
        [4, 1, 0],
        [4, 1, -3]
    ].map(point);
    assert.deepEqual(projectCompanionRoute(points, point([-10, 1, 0])).position, [0, 1, 0]);
    const end = projectCompanionRoute(points, point([4, 1, -20]));
    assert.deepEqual(end, { position: [4, 1, -3], progress: 7, next: 3 });
    assert.deepEqual(projectCompanionRoute([point([2, 1, 3])], point([4, 1, 8])).position, [2, 1, 3]);
    assert.throws(() => projectCompanionRoute([], point([0, 0, 0])), /needs a point/);
});

test('every street segment and projected restoration point clears the shared solid footprints', () => {
    for (let i = 1; i < route.length; i++) {
        const a = route[i - 1];
        const b = route[i];
        for (let step = 0; step <= 40; step++) {
            const t = step / 40;
            const position = [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t];
            assert.equal(isFoundationPosition(position), true, JSON.stringify(position));
            const projected = projectCompanionRoute(route, point([position[0], position[1], position[2] + 1]));
            assert.equal(isFoundationPosition(projected.position), true, JSON.stringify(projected));
        }
    }
});
