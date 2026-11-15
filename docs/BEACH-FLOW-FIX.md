# Street circulation and beach flow fixes (2026-11-15)

Exact before/after code is recorded below. Existing forest edits were preserved.

## Code changes

### src/episodes/episode-01/BeachDressing.ts

Grounded bases enclose handheld hooks; a post supports each canopy.

Current location: [src/episodes/episode-01/BeachDressing.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/BeachDressing.ts:138)

Before:
```ts
        // The original shade posts now carry the supplied umbrella designs where available.
```

After:
```ts
        const base = new Entity('umbrella-weighted-base');
        umbrella.addChild(base);
        base.setLocalPosition(0, 0.24 - definition.position[1], 0);
        base.setLocalScale(0.9, 0.5, 0.9);
        base.addComponent('render', { type: 'cylinder', material: materials.cream });
```

Current location: [src/episodes/episode-01/BeachDressing.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/BeachDressing.ts:154)

Before:
```ts
(Added)
```

After:
```ts
            const supportHeight = model.dims[1] * 0.78;
            box(
                umbrella,
                'umbrella-support-pole',
                [0, supportHeight / 2 - definition.position[1], 0],
                [0.12, supportHeight, 0.12],
                materials.wood
            );
```

### src/episodes/episode-01/wave.ts

Short captions keep the warning action moving.

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:14)

Before:
```ts
            text: 'The water… it’s pulling away. That isn’t a normal tide. Stay back from the shore.',
```

After:
```ts
            text: 'The water’s pulling away. Stay back!',
```

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:21)

Before:
```ts
            text: 'The gulls lift all at once, wheeling inland. The soft wash of the sea gives way to a low, unfamiliar rumble.',
```

After:
```ts
            text: 'Gulls scatter inland. A deep rumble rises.',
```

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:28)

Before:
```ts
            text: '“Where did all the water go?”\n\nPeople turn and point. A lifeguard’s whistle cuts through the beach.',
```

After:
```ts
            text: '“Where did the sea go?” A whistle sounds.',
```

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:35)

Before:
```ts
            text: 'MOVE AWAY FROM THE SHORE! GET TO HIGHER GROUND!\n\nTurn inland. Follow the green arrows along the boardwalk and up the dune path. Go now!',
```

After:
```ts
            text: 'GET TO HIGHER GROUND! Follow the green arrows inland. RUN!',
```

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:70)

Before:
```ts
/** Reading-paced hold for each warning beat (about 3.6 words per second, never rushed below 4.5 s). */
```

After:
```ts
/** Short captions overlap the continuous warning action. */
```

Current location: [src/episodes/episode-01/wave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/wave.ts:72)

Before:
```ts
    Math.min(10, Math.max(4.5, 2.2 + text.trim().split(/\s+/).length / 3.6));
```

After:
```ts
    Math.min(4, Math.max(2.4, 0.8 + text.trim().split(/\s+/).length / 3.6));
```

### src/episodes/episode-01/WaveCamera.ts

Moving dolly targets replace settled holds; the fall blends immediately from gameplay.

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:45)

Before:
```ts
    let tween = 1;
```

After:
```ts
    let shotTime = 0;
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:59)

Before:
```ts
            tween = !key || steady ? 1 : 0;
```

After:
```ts
            shotTime = 0;
            if (!key) {
                const gameplayCamera = app.root.findByName('camera');
                if (gameplayCamera) {
                    position.copy(gameplayCamera.getPosition());
                    target.copy(position).add(gameplayCamera.forward.clone().mulScalar(5));
                }
            }
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:72)

Before:
```ts
(Added)
```

After:
```ts
        shotTime += dt;
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:77)

Before:
```ts
(Added)
```

After:
```ts
            if (!steady) {
                to.x -= shotTime * 0.45;
                to.z -= shotTime * 0.3;
                toTarget.x -= shotTime * 0.15;
            }
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:83)

Before:
```ts
            tween = steady ? 1 : Math.min(1, tween + dt / 1.35);
            const t = tween * tween * (3 - 2 * tween);
            position.lerp(from, to, t);
            target.lerp(fromTarget, toTarget, t);
```

After:
```ts
            const blend = steady ? 1 : 1 - Math.exp(-dt * 2.8);
            position.lerp(position, to, blend);
            target.lerp(target, toTarget, blend);
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:89)

Before:
```ts
            const t = blinking ? 1 : steady ? 0 : Math.max(0, Math.min(1, (state.elapsed - 0.55) / 1.65));
```

After:
```ts
            const t = blinking ? 1 : steady ? 0 : Math.max(0, Math.min(1, state.elapsed / 2.4));
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:91)

Before:
```ts
            position.set(p.x + 4.1 * (1 - smooth), ground + 2.9 * (1 - smooth) + 0.24, p.z - 3.5 + smooth * 2.7);
            target.set(p.x + 0.2, ground + 0.7 + smooth * 2, p.z - 0.7 + smooth * 6.7);
```

After:
```ts
            to.set(p.x, ground + 0.24, p.z - 0.8);
            toTarget.set(p.x + 0.2, ground + 2.7, p.z + 6);
            position.lerp(from, to, smooth);
            target.lerp(fromTarget, toTarget, smooth);
```

Current location: [src/episodes/episode-01/WaveCamera.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCamera.ts:108)

Before:
```ts
        camera.camera!.fov = aspect < 1 ? Math.min(88, fov + (1 - aspect) * 40) : fov;
```

After:
```ts
        const desiredFov = aspect < 1 ? Math.min(88, fov + (1 - aspect) * 40) : fov;
        camera.camera!.fov += (desiredFov - camera.camera!.fov) * (steady ? 1 : 1 - Math.exp(-dt * 4));
```

### src/episodes/episode-01/BeachWave.ts

Crowd evacuation overlaps the reveal.

Current location: [src/episodes/episode-01/BeachWave.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/BeachWave.ts:126)

Before:
```ts
(Added)
```

After:
```ts
        if (beat === 'wave') this.crowd.evacuate();
```

### src/episodes/episode-01/WaveCrowd.ts

Pointing blends into a moving reaction.

Current location: [src/episodes/episode-01/WaveCrowd.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/WaveCrowd.ts:147)

Before:
```ts
                if (character.anim.baseLayer!.activeStateCurrentTime >= 0.85) character.anim.speed = 0;
```

After:
```ts
                const layer = character.anim.baseLayer!;
                if (layer.activeState === 'point' && layer.activeStateCurrentTime >= 0.85) character.play('talk', 0.25);
```

### src/episodes/episode-01/BeachCrowd.ts

The expanded crowd also blends out of pointing.

Current location: [src/episodes/episode-01/BeachCrowd.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/BeachCrowd.ts:224)

Before:
```ts
                    person.character!.anim.speed = 0;
```

After:
```ts
                    person.character!.play('talk', 0.25);
```

### src/episodes/episode-01/StreetLife.ts

Walkers steer around people within pavement/crossing bounds and avoid solid geometry.

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:15)

Before:
```ts
(Added)
```

After:
```ts
import { isFoundationPosition } from '../../scenes/FoundationState';
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:21)

Before:
```ts
(Added)
```

After:
```ts
import { stepStreetWalker } from './streetMotion';
import type { StreetCorridor, StreetObstacle } from './streetMotion';
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:33)

Before:
```ts
(Added)
```

After:
```ts
    corridor: StreetCorridor;
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:149)

Before:
```ts
    private readonly direction = new Vec3();
```

After:
```ts
(Removed)
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:203)

Before:
```ts
            this.direction.sub2(walker.route[walker.waypoint], position);
            const distance = this.direction.length();
            this.direction.normalize();
            const blockedBy = (other: Vec3, radius: number) => {
                const x = other.x - position.x;
                const z = other.z - position.z;
                return Math.hypot(x, z) < radius && x * this.direction.x + z * this.direction.z > -0.1;
            };
            const blocked =
                (player.y < 3 && blockedBy(player, 1.1)) ||
                this.walkers.some((other) => other !== walker && blockedBy(other.character.root.getPosition(), 0.65)) ||
                this.obstacles.some((other) => other.enabled && blockedBy(other.getPosition(), 0.7));
            walker.character.move(blocked ? 0 : Math.min(distance / step, walker.speed));
            if (blocked) continue;
```

After:
```ts
            const target = walker.route[walker.waypoint];
            const obstacles: StreetObstacle[] = [];
            if (player.y < 3) obstacles.push({ x: player.x, z: player.z, radius: 1.1 });
            for (const other of this.walkers) {
                if (other === walker) continue;
                const p = other.character.root.getPosition();
                if (Math.hypot(p.x - position.x, p.z - position.z) < 2)
                    obstacles.push({ x: p.x, z: p.z, radius: 0.75 });
            }
            for (const other of this.obstacles) {
                if (!other.enabled) continue;
                const p = other.getPosition();
                obstacles.push({ x: p.x, z: p.z, radius: 0.85 });
            }
            const [x, z] = stepStreetWalker(
                position,
                target,
                walker.speed * step,
                obstacles,
                walker.corridor,
                (px, pz) => isFoundationPosition([px, 1.04, pz])
            );
            const dx = x - position.x;
            const dz = z - position.z;
            const moved = Math.hypot(dx, dz);
            walker.character.move(moved / step);
            if (moved < 0.00001 && Math.hypot(target.x - x, target.z - z) > 0.001) continue;
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:232)

Before:
```ts
                (Math.atan2(this.direction.x, this.direction.z) * 180) / Math.PI,
```

After:
```ts
                moved > 0.00001 ? (Math.atan2(dx, dz) * 180) / Math.PI : walker.heading,
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:236)

Before:
```ts
            if (distance <= walker.speed * step) {
                walker.character.root.setPosition(walker.route[walker.waypoint]);
```

After:
```ts
            walker.character.root.setPosition(x, position.y, z);
            if (Math.hypot(target.x - x, target.z - z) < 0.001) {
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:246)

Before:
```ts
            } else {
                walker.character.root.setPosition(this.direction.mulScalar(walker.speed * step).add(position));
```

After:
```ts
(Removed)
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:439)

Before:
```ts
            heading: definition.returning ? -90 : 90
```

After:
```ts
            heading: definition.returning ? -90 : 90,
            corridor: { minX: west - 0.45, maxX: east + 0.45, minZ: near - 0.45, maxZ: far + 0.45 }
```

Current location: [src/episodes/episode-01/StreetLife.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/StreetLife.ts:471)

Before:
```ts
(Added)
```

After:
```ts
                corridor: { minX: a - 0.3, maxX: b + 0.3, minZ: crossing.near, maxZ: crossing.far },
```

### src/episodes/episode-01/streetMotion.ts

Local steering selects a clear step and can escape an existing overlap.

Current location: [src/episodes/episode-01/streetMotion.ts](C:/Users/HP/OneDrive/Documents/projects/last-wave/src/episodes/episode-01/streetMotion.ts:1)

Added:
```ts
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

```

### tests/new-assets.test.mjs

Bounds the caption duration and total warning length.

Current location: [tests/new-assets.test.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/tests/new-assets.test.mjs:128)

Before:
```ts
test('the wave starts by itself after the discoveries and paces every warning beat for reading', () => {
```

After:
```ts
test('the warning uses short readable captions within a continuous 14-second sequence', () => {
```

Current location: [tests/new-assets.test.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/tests/new-assets.test.mjs:132)

Before:
```ts
        assert.ok(seconds >= 4.5 && seconds <= 10, beat.id);
```

After:
```ts
        assert.ok(seconds >= 2.4 && seconds <= 4, beat.id);
```

Current location: [tests/new-assets.test.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/tests/new-assets.test.mjs:134)

Before:
```ts
(Added)
```

After:
```ts
    assert.ok(WAVE_WARNING.beats.reduce((sum, beat) => sum + warningBeatDuration(beat.text), 0) <= 14);
```

### tests/street-entry.test.mjs

Exercises queues, head-on passing, overlap recovery and pavement/solid limits.

Current location: [tests/street-entry.test.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/tests/street-entry.test.mjs:25)

Before:
```ts
(Added)
```

After:
```ts
import { stepStreetWalker } from '../src/episodes/episode-01/streetMotion.ts';
```

Current location: [tests/street-entry.test.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/tests/street-entry.test.mjs:37)

Before:
```ts
(Added)
```

After:
```ts
test('street walkers pass a stationary person instead of forming a permanent queue', () => {
    const corridor = { minX: -10, maxX: 12, minZ: -0.45, maxZ: 1.4 };
    const walkers = Array.from({ length: 6 }, (_, i) => ({ x: -1.5 - i * 1.5, z: 0 }));
    for (let frame = 0; frame < 600; frame++) {
        for (const walker of walkers) {
            const blockers = [
                { x: 0, z: 0, radius: 1.1 },
                ...walkers.filter((p) => p !== walker).map((p) => ({ ...p, radius: 0.75 }))
            ];
            [walker.x, walker.z] = stepStreetWalker(walker, { x: 11, z: 0 }, 0.12, blockers, corridor, () => true);
        }
    }
    assert.ok(
        walkers.every((p) => p.x > 3),
        JSON.stringify(walkers)
    );
});

test('street steering separates head-on walkers and escapes an existing overlap', () => {
    const corridor = { minX: -6, maxX: 6, minZ: -0.45, maxZ: 1.4 };
    const a = { x: -3, z: 0 },
        b = { x: 3, z: 0 };
    for (let frame = 0; frame < 160; frame++) {
        [a.x, a.z] = stepStreetWalker(a, { x: 5, z: 0 }, 0.1, [{ ...b, radius: 0.75 }], corridor, () => true);
        [b.x, b.z] = stepStreetWalker(b, { x: -5, z: 0 }, 0.1, [{ ...a, radius: 0.75 }], corridor, () => true);
    }
    assert.ok(a.x > 3 && b.x < -3, JSON.stringify({ a, b }));
    const escaped = stepStreetWalker(
        { x: 0, z: 0 },
        { x: 2, z: 0 },
        0.1,
        [{ x: -0.1, z: 0, radius: 0.75 }],
        corridor,
        () => true
    );
    assert.ok(escaped[0] > 0);
});

test('a walker trapped between a blocker and the pavement edge backs out and passes', () => {
    const p = { x: -1.0246732234954834, z: 6.8497700691223145 };
    const corridor = { minX: -46.45, maxX: 52.45, minZ: 6.8, maxZ: 8.65 };
    for (let frame = 0; frame < 300; frame++) {
        [p.x, p.z] = stepStreetWalker(
            p,
            { x: 52, z: 7.25 },
            0.134,
            [{ x: 0, z: 7.25, radius: 1.1 }],
            corridor,
            () => true
        );
    }
    assert.ok(p.x > 2, JSON.stringify(p));
});

test('street detours stay within the pavement and respect solid geometry', () => {
    const p = { x: 0, z: 0 };
    const corridor = { minX: -2, maxX: 2, minZ: -0.4, maxZ: 0.4 };
    for (let frame = 0; frame < 120; frame++) {
        [p.x, p.z] = stepStreetWalker(
            p,
            { x: 2, z: 0 },
            0.1,
            [{ x: 0.7, z: 0, radius: 0.75 }],
            corridor,
            (x) => x < 0.5
        );
        assert.ok(p.x < 0.5 && p.z >= corridor.minZ && p.z <= corridor.maxZ);
    }
});

```

### scripts/verify-beach-life.mjs

Checks supports, street circulation, camera movement, reactions, control handoff and ending; waits for page load before evaluation.

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:99)

Before:
```ts
(Added)
```

After:
```ts
    const loaded = new Promise((resolve) => {
        const onLoad = ({ data }) => {
            if (JSON.parse(data).method !== 'Page.loadEventFired') return;
            socket.removeEventListener('message', onLoad);
            resolve();
        };
        socket.addEventListener('message', onLoad);
    });
```

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:108)

Before:
```ts
(Added)
```

After:
```ts
    await loaded;
```

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:143)

Before:
```ts
(Added)
```

After:
```ts
    const beachState = fixture.state;
    fixture.state = {
        ...beachState,
        area: 'tideline',
        playerPosition: [0, 1.04, 7.25],
        entry: progress(ENTRY_QUEST, 5),
        inventory: { itemIds: [STARTER_BAG.id] }
    };
```

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:152)

Before:
```ts
(Added)
```

After:
```ts
    const streetMotion = await evaluate(
        `(()=>{const a=${app},s=a.root.findByName('seafront-life').script.get('streetLife');s.paused=false;const ordinary=s.walkers.filter(w=>!w.crossing),windows=[],totals=ordinary.map(()=>0);for(let window=0;window<10;window++){const travel=ordinary.map(()=>0);for(let frame=0;frame<300;frame++){const before=ordinary.map(w=>w.character.root.getPosition().clone());s.update(.1);ordinary.forEach((w,i)=>{const p=w.character.root.getPosition();travel[i]+=Math.hypot(p.x-before[i].x,p.z-before[i].z);});}travel.forEach((n,i)=>totals[i]+=n);windows.push({travel,positions:ordinary.map(w=>({name:w.character.root.name,position:w.character.root.getPosition().toArray(),waypoint:w.waypoint}))});}s.paused=true;const before=ordinary.map(w=>w.character.root.getPosition().toArray());s.update(1);return {windows,totals,paused:JSON.stringify(before)===JSON.stringify(ordinary.map(w=>w.character.root.getPosition().toArray()))};})()`
    );
    await writeFile(new URL('street-motion.json', output), JSON.stringify(streetMotion, null, 2));
    assert.equal(streetMotion.totals.length, 45);
    assert.equal(streetMotion.paused, true);
    for (const [index, window] of streetMotion.windows.entries()) {
        if (index === 0) continue;
        for (const [i, travel] of window.travel.entries())
            assert.ok(travel > 4, `Street walker ${i} stuck in 30-second window ${index}: ${travel}m`);
    }
    await evaluate(
        `(()=>{const a=${app},c=a.root.findByName('camera');a.root.findByName('player').script.get('thirdPersonController').enabled=false;c.setPosition(3,7,16);c.lookAt(0,0,7.5);return true;})()`
    );
    await shot('street-passing');
    record('All 45 sidewalk walkers keep moving over five minutes with a stationary player; pause freezes motion');
    fixture.state = beachState;
    await load();
    const supports = await evaluate(
        `(()=>{const a=${app},root=a.root.findByName('beach-dressing');return root.findComponents('render').filter(r=>r.entity.name==='umbrella-weighted-base').map(r=>({position:r.entity.getPosition().toArray(),size:r.entity.getLocalScale().toArray(),pole:r.entity.parent.findByName('umbrella-support-pole')?.getPosition().toArray()}));})()`
    );
    assert.equal(supports.length, 18);
    for (const support of supports) {
        assert.ok(Math.abs(support.position[1] - support.size[1] / 2) <= 0.02);
        assert.ok(support.pole, 'Imported shade has a continuous support pole');
    }
    await writeFile(new URL('umbrella-supports.json', output), JSON.stringify(supports, null, 2));
    for (const side of [1, -1]) {
        await evaluate(
            `(()=>{const a=${app},c=a.root.findByName('camera');a.root.findByName('player').script.get('thirdPersonController').enabled=false;c.setPosition(-10.7+${side}*4,2.2,7.8);c.lookAt(-10.7,1.3,3.8);return true;})()`
        );
        await shot(`umbrella-support-${side}`);
    }
    record('All 18 imported beach shades have a grounded weighted base and support pole');
```

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:249)

Before:
```ts
        `(()=>{const a=${app},w=${wave},seen=[];for(let i=0;i<650&&w.progress.state.phase==='warning';i++){const id=document.querySelector('#story-opening').dataset.beat;if(seen.at(-1)!==id)seen.push(id);w.update(.1);a.fire('update',.1);}return seen;})()`
```

After:
```ts
        `(()=>{const a=${app},w=${wave},seen=[],motion=[];for(let i=0;i<650&&w.progress.state.phase==='warning';i++){const id=document.querySelector('#story-opening').dataset.beat;if(seen.at(-1)!==id)seen.push(id);w.update(.1);a.fire('update',.1);if(w.progress.state.phase==='warning'){motion.push(w.camera.getPosition().toArray());if(id==='crowd'&&w.crowd.life.standing.some(p=>p.character.anim.speed===0))throw new Error('Frozen pointing reaction');if(id==='wave'&&w.crowd.mode!=='running')throw new Error('Crowd waits until player control');}}globalThis.__warningMotion=motion;return seen;})()`
```

Current location: [scripts/verify-beach-life.mjs](C:/Users/HP/OneDrive/Documents/projects/last-wave/scripts/verify-beach-life.mjs:251)

Before:
```ts
(Added)
```

After:
```ts
    const motion = await evaluate('globalThis.__warningMotion');
    for (let i = 1; i < motion.length; i++)
        assert.ok(
            Math.hypot(...motion[i].map((n, axis) => n - motion[i - 1][axis])) > 0.00001,
            `Camera holds at warning frame ${i}`
        );
    await writeFile(new URL('warning-motion.json', output), JSON.stringify(motion, null, 2));
    record('Warning camera moves every sampled frame; pointing stays animated and evacuation overlaps the reveal');
```
