import { Color, Entity, FOG_LINEAR } from 'playcanvas';
import type { AppBase, StandardMaterial } from 'playcanvas';

import type { ForestCharacters } from '../core/AssetManager';
import { createModelInstance } from '../scenes/createModelInstance';
import { createBoxVisual, createMaterial } from '../scenes/primitives';

import type { loadForestAssets } from './ForestAssets';
import { createForestCamera } from './ForestCamera';
import { createForestEffects } from './ForestEffects';
import { textureForestGround } from './ForestGround';
import { FOREST_MODELS } from './forestModels';
import type { ForestModelId } from './forestModels';
import { createForestPerformers } from './ForestPerformers';
import { FOREST_WATCHER_ORIGIN } from './forestScare';

export const createForestScene = (
    app: AppBase,
    assets: Awaited<ReturnType<typeof loadForestAssets>>,
    characters: ForestCharacters
) => {
    const root = new Entity('forest-entrance', app);
    app.root.addChild(root);
    const previous = {
        ambient: app.scene.ambientLight.clone(),
        fog: app.scene.fog.color.clone(),
        type: app.scene.fog.type,
        start: app.scene.fog.start,
        end: app.scene.fog.end
    };
    root.once('destroy', () => {
        app.scene.ambientLight = previous.ambient;
        app.scene.fog.color = previous.fog;
        app.scene.fog.type = previous.type;
        app.scene.fog.start = previous.start;
        app.scene.fog.end = previous.end;
    });
    const owned: StandardMaterial[] = [];
    const trees: { root: Entity; yaw: number; seed: number }[] = [];
    const material = (name: string, r: number, g: number, b: number) => {
        const result = createMaterial(name, r, g, b);
        owned.push(result);
        return result;
    };
    root.once('destroy', () => owned.forEach((m) => m.destroy()));
    try {
        app.scene.ambientLight = new Color(0.1, 0.15, 0.19);
        app.scene.fog.type = FOG_LINEAR;
        app.scene.fog.color = new Color(0.018, 0.035, 0.052);
        app.scene.fog.start = 8;
        app.scene.fog.end = 34;
        const camera = createForestCamera(root, app);
        const moon = new Entity('forest-moonlight');
        root.addChild(moon);
        moon.setLocalEulerAngles(42, -28, 0);
        const mobile = window.matchMedia('(max-width: 600px)').matches;
        moon.addComponent('light', {
            type: 'directional',
            color: new Color(0.43, 0.62, 0.84),
            intensity: 1.6,
            castShadows: !mobile,
            shadowResolution: 1024,
            shadowDistance: 25,
            normalOffsetBias: 0.08
        });
        const soil = material('forest-earth', 0.09, 0.11, 0.09);
        createBoxVisual(root, 'forest-floor', [0, -0.15, -5], [55, 0.3, 48], soil);
        for (let i = 0; i < 12; i++) {
            const mound = new Entity('forest-earth-mound');
            root.addChild(mound);
            mound.setLocalPosition(-14 + i * 2.5, -0.15, -4 - (i % 3) * 3);
            mound.setLocalScale(5, 0.6 + (i % 3) * 0.2, 3);
            mound.addComponent('render', { type: 'sphere', material: soil });
        }
        const path = material('forest-path-earth', 0.18, 0.16, 0.12);
        textureForestGround(root, app.graphicsDevice, soil, path);
        createBoxVisual(root, 'forest-path', [0, -0.01, 1], [45, 0.025, 2.8], path);
        const place = (id: ForestModelId, x: number, z: number, yaw = 0, scale = 1, y = 0) => {
            const object = createModelInstance(assets.models[id], FOREST_MODELS[id], `forest-${id}`);
            root.addChild(object.root);
            object.root.setLocalPosition(x, y, z);
            object.root.setLocalEulerAngles(0, yaw, 0);
            object.root.setLocalScale(scale, scale, scale);
            object.root.tags.add('forest-scenery', `forest-model-${id}`);
            if (['bare', 'twisted', 'leafy', 'pine', 'canopy', 'fir', 'crooked', 'sapling'].includes(id))
                trees.push({ root: object.root, yaw, seed: trees.length });
            return object.root;
        };
        for (let i = 0; i < (mobile ? 26 : 42); i++) {
            const row = Math.floor(i / 9);
            let x = ((i % 9) - 4) * 4.1 + Math.sin(i * 4.2) * 0.7;
            const z = -3.6 - row * 4.6 - Math.cos(i) * 0.5;
            if (z > -9 && x > -3.2 && x < 1.2) x += x < -1.1 ? -3 : 3.8;
            const species: ForestModelId[] = [
                'fir',
                'crooked',
                'pine',
                'sapling',
                'bare',
                'canopy',
                'twisted',
                'leafy'
            ];
            place(species[i % species.length]!, x, z, i * 137.5, 0.8 + (i % 3) * 0.13);
        }
        for (const [x, z] of [
            [-8, 5],
            [7.5, 4],
            [-11, 1],
            [11, 0]
        ])
            place(x! > 0 ? 'crooked' : 'fir', x!, z!, x! * 21, 1.1);
        for (let i = 0; i < 20; i++) {
            const x = Math.sin(i * 14.3) * 14,
                z = -3.4 - (i % 4) * 2.4;
            place(i % 3 ? 'bush' : 'rock', x, z, i * 63, 0.7 + (i % 3) * 0.25);
        }
        place('grave', -5.7, -2.8, 18, 1, -0.14);
        place('grave', 6.4, -6, -28, 0.8, -0.1);
        place('skull', -3.7, -1.8, -25, 1, -0.08);
        place('skull', 7.2, -2, 35, 0.8, -0.08);
        for (let i = 0; i < 6; i++) {
            const x = i < 3 ? -8.5 + i * 1.5 : 3.6 + (i - 3) * 1.9;
            place(
                i % 2 ? 'crossGrave' : 'roundGrave',
                x,
                -3.4 - (i % 2) * 1.3,
                i * 19 - 28,
                0.85 + (i % 2) * 0.1,
                -0.08
            );
            place('slab', x, -2.5 - (i % 2) * 1.3, 90, 0.8);
        }
        place('coffin', -8, -4.1, -22, 1, -0.18);
        place('birdSkull', -6.2, -2.2, -15);
        place('wolfSkull', 5.2, -2.4, 40, 1, -0.04);
        for (let i = 0; i < 8; i++) {
            const x = i < 4 ? -11.5 + i * 2.1 : 5.7 + (i - 4) * 2.1;
            place(i % 2 ? 'fence' : 'brokenFence', x, -2.6 - Math.abs(x) * 0.06, i % 2 ? -7 : 12, 1, -0.05);
        }
        for (let i = 0; i < (mobile ? 36 : 72); i++) {
            const x = Math.sin(i * 3.91) * 17;
            const z = i % 3 === 0 ? 3.3 + (i % 5) * 0.45 : -1.7 - (i % 6) * 1.2;
            place(i % 5 === 0 ? 'reeds' : 'grass', x, z, i * 47, 0.65 + (i % 4) * 0.15);
        }
        for (const [x, z] of [
            [-8.5, 3.5],
            [8.5, 3.3],
            [-5.1, -5.9],
            [5.7, -5.1]
        ]) {
            place('bramble', x!, z!, x! * 11);
            place('boulder', x! + 0.7, z! + 0.3, 27, 0.75);
        }
        const embers: Entity[] = [];
        for (const [x, z] of [
            [-4.5, 2.8],
            [4.8, 1.8],
            [-7.5, -3]
        ]) {
            place(x! < -6 ? 'leanPumpkin' : x! > 0 ? 'tallPumpkin' : 'pumpkin', x!, z!, 0);
            place('plainPumpkin', x! + 0.5, z! + 0.2, 35, 0.85);
            const lamp = new Entity('forest-pumpkin-glow');
            root.addChild(lamp);
            lamp.setLocalPosition(x!, 0.3, z! + 0.25);
            lamp.addComponent('light', {
                type: 'omni',
                color: new Color(1, 0.36, 0.07),
                intensity: 2,
                range: 4.5,
                castShadows: false
            });
            embers.push(lamp);
        }
        place('lantern', -6.3, 0.4, 15);
        for (const [x, z] of [
            [-9.2, -1.1],
            [7.8, -1.4]
        ]) {
            place('lampPost', x!, z!, 0);
            place('hangingLantern', x! + 0.35, z!, 0, 0.8, 2.3);
            const glow = material('forest-lantern-ember', 1, 0.55, 0.16);
            glow.emissive.set(1, 0.42, 0.09);
            glow.update();
            const bulb = new Entity('forest-lantern-flame');
            root.addChild(bulb);
            bulb.setLocalPosition(x! + 0.35, 2.54, z!);
            bulb.setLocalScale(0.12, 0.18, 0.12);
            bulb.addComponent('render', { type: 'sphere', material: glow, castShadows: false });
            const lamp = new Entity('forest-lantern-light');
            root.addChild(lamp);
            lamp.setLocalPosition(x! + 0.35, 2.54, z!);
            lamp.addComponent('light', {
                type: 'omni',
                color: new Color(1, 0.42, 0.12),
                range: 3.5,
                intensity: 0.8,
                castShadows: false
            });
            embers.push(lamp);
        }
        for (const [x, z] of [
            [-5.2, -2.6],
            [-6.7, -3.4],
            [4.2, -2.9],
            [6.1, -3.5]
        ]) {
            const candle = place('candle', x!, z!, 0);
            const flame = new Entity('forest-candle-flame');
            candle.addChild(flame);
            const glow = material('forest-candle-ember', 1, 0.53, 0.15);
            glow.emissive.set(1, 0.42, 0.08);
            glow.update();
            flame.setLocalPosition(0, 0.36, 0);
            flame.setLocalScale(0.035, 0.08, 0.035);
            flame.addComponent('render', { type: 'sphere', material: glow, castShadows: false });
        }
        const signWood = material('abandoned-sign-wood', 0.23, 0.16, 0.09);
        createBoxVisual(root, 'abandoned-sign-post', [6, 0.85, -1.8], [0.12, 1.7, 0.12], signWood);
        const sign = createBoxVisual(root, 'abandoned-sign', [6, 1.5, -1.8], [1.5, 0.35, 0.12], signWood);
        sign.setLocalEulerAngles(0, -12, -9);
        const leaf = material('forest-fallen-leaves', 0.3, 0.19, 0.075);
        const driftingLeaves: Entity[] = [];
        for (let i = 0; i < 50; i++) {
            const x = Math.sin(i * 3.24) * 15,
                z = Math.cos(i * 4.25) * 8;
            const entity = createBoxVisual(root, 'forest-fallen-leaf', [x, 0.025, z], [0.09, 0.012, 0.18], leaf);
            entity.setLocalEulerAngles(0, i * 72, 0);
            if (i < 8) driftingLeaves.push(entity);
        }
        const performers = createForestPerformers(root, characters, assets.models.performances);
        const hand = performers.hand;
        const phoneMaterial = material('forest-phone-case', 0.035, 0.04, 0.045);
        const phone = createBoxVisual(
            hand as Entity,
            'forest-phone',
            [0, 0.035, 0.035],
            [0.075, 0.14, 0.012],
            phoneMaterial
        );
        const screen = material('forest-phone-screen', 0.2, 0.35, 0.4);
        screen.emissive.set(0.45, 0.65, 0.7);
        screen.update();
        createBoxVisual(phone, 'forest-phone-display', [0, 0, -0.6], [0.8, 0.85, 0.05], screen);
        const flashlight = new Entity('forest-phone-flashlight');
        // A sibling mount follows the hand without inheriting the phone visual's nonuniform scale.
        (hand as Entity).addChild(flashlight);
        flashlight.setLocalPosition(0, 0.08, 0.04);
        flashlight.setLocalEulerAngles(80, 0, 0);
        flashlight.addComponent('light', {
            type: 'spot',
            color: new Color(0.82, 0.91, 1),
            intensity: 7,
            range: 15,
            innerConeAngle: 13,
            outerConeAngle: 29,
            castShadows: false
        });
        const effects = createForestEffects(root, app.graphicsDevice, mobile);
        const update = (time: number, reduced: boolean, ambienceTime: number) => {
            const steady = reduced;
            camera.update(time, reduced);
            const { x, scared } = performers.update(time);
            flashlight.light!.intensity =
                time >= 2 && time < 38 ? 7 * Math.min(1, time - 2) * Math.min(1, 38 - time) : 0;
            const looking = time >= 18.6 && time < 24;
            const mount = flashlight.getPosition();
            const dx =
                (looking ? FOREST_WATCHER_ORIGIN[0] + (time >= 20.2 && time < 21.1 ? 3.5 : 0) : x + 3.2) - mount.x;
            const dy = (scared ? 6.8 : looking ? FOREST_WATCHER_ORIGIN[1] : 0.08) - mount.y;
            const dz = (looking || scared ? FOREST_WATCHER_ORIGIN[2] : -0.5) - mount.z;
            const length = Math.max(0.001, Math.hypot(dx, dy, dz));
            flashlight.setEulerAngles(
                (Math.acos(Math.max(-1, Math.min(1, -dy / length))) * 180) / Math.PI,
                (Math.atan2(-dx, -dz) * 180) / Math.PI,
                0
            );
            embers.forEach((light, i) => {
                light.light!.intensity = steady
                    ? 1.9
                    : 1.9 + Math.sin(ambienceTime * 7 + i) * 0.22 + Math.sin(ambienceTime * 13 + i) * 0.08;
            });
            effects.update(time, steady, ambienceTime);
            for (const tree of trees)
                tree.root.setLocalEulerAngles(
                    steady ? 0 : Math.sin(ambienceTime * 0.25 + tree.seed) * 0.12,
                    tree.yaw,
                    steady ? 0 : Math.sin(ambienceTime * 0.32 + tree.seed * 1.7) * 0.28
                );
            driftingLeaves.forEach((entity, i) => {
                const moving = !steady && ((time >= 24 && time < 27) || (time >= 38 && time < 41));
                const progress = time < 38 ? time - 24 : time - 38;
                entity.setLocalPosition(
                    Math.sin(i * 3.24) * 15 + (moving ? progress : 0),
                    moving ? Math.sin(Math.min(1, progress / 3) * Math.PI) * (1 + i * 0.15) + 0.025 : 0.025,
                    Math.cos(i * 4.25) * 8
                );
                entity.setLocalEulerAngles(moving ? progress * 90 : 0, i * 72, moving ? progress * 50 : 0);
            });
        };
        return { root, update, destroy: () => root.destroy() };
    } catch (error) {
        root.destroy();
        throw error;
    }
};
