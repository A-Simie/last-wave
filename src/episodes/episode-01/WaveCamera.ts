import { Quat, Vec3 } from 'playcanvas';
import type { AppBase, Entity, Material, StandardMaterial } from 'playcanvas';

import type { GameAssets } from '../../core/AssetManager';
import { createAnimatedCharacter } from '../../player/AnimatedCharacter';
import { createCamera } from '../../player/CameraController';

import { WAVE_SHOTS, evacuationHeight } from './waveLayout';
import type { WaveState } from './WaveProgress';

export const createWaveCamera = (parent: Entity, app: AppBase, assets: GameAssets, player: Entity) => {
    const camera = createCamera(parent, player.getPosition());
    camera.name = 'wave-camera';
    camera.camera!.enabled = false;
    const figure = createAnimatedCharacter(assets.characters.commuterSuit, 'commuterSuit', 'wave-shadowed-figure');
    parent.addChild(figure.root);
    figure.root.enabled = false;
    figure.move(0.5);
    const silhouettes = new Map<Material, StandardMaterial>();
    parent.once('destroy', () => silhouettes.forEach((material) => material.destroy()));
    figure.root.findComponents('render').forEach((render) => {
        render.meshInstances.forEach((instance) => {
            let material = silhouettes.get(instance.material!);
            if (!material) {
                material = (instance.material as StandardMaterial).clone();
                material.name = 'wave-unidentified-silhouette';
                material.diffuse.set(0.025, 0.034, 0.035);
                material.diffuseMap = null;
                material.emissive.set(0, 0, 0);
                material.useLighting = false;
                material.update();
                silhouettes.set(instance.material!, material);
            }
            instance.material = material;
        });
    });
    const from = new Vec3();
    const fromTarget = new Vec3();
    const target = new Vec3();
    const position = new Vec3();
    const to = new Vec3();
    const toTarget = new Vec3();
    const roll = new Quat();
    let key = '';
    let tween = 1;
    const update = (dt: number, state: WaveState, beat: string, steady: boolean) => {
        const warning = state.phase === 'warning';
        const falling = state.phase === 'falling';
        const blinking = state.phase === 'blinking';
        const active = warning || falling || blinking;
        camera.camera!.enabled = active;
        figure.root.enabled = blinking;
        if (!active) {
            key = '';
            return;
        }
        const nextKey = warning ? beat || 'retreat' : state.phase;
        if (nextKey !== key) {
            tween = !key || steady ? 1 : 0;
            key = nextKey;
            from.copy(position);
            fromTarget.copy(target);
        }
        let fov = 58;
        if (warning) {
            const shot = WAVE_SHOTS[beat] ?? WAVE_SHOTS.retreat;
            to.set(...shot.position);
            toTarget.set(...shot.target);
            fov = shot.fov;
            tween = steady ? 1 : Math.min(1, tween + dt / 1.35);
            const t = tween * tween * (3 - 2 * tween);
            position.lerp(from, to, t);
            target.lerp(fromTarget, toTarget, t);
        } else {
            const p = player.getPosition();
            const ground = evacuationHeight(p.z);
            const t = blinking ? 1 : steady ? 0 : Math.max(0, Math.min(1, (state.elapsed - 0.55) / 1.65));
            const smooth = t * t * (3 - 2 * t);
            position.set(p.x + 4.1 * (1 - smooth), ground + 2.9 * (1 - smooth) + 0.24, p.z - 3.5 + smooth * 2.7);
            target.set(p.x + 0.2, ground + 0.7 + smooth * 2, p.z - 0.7 + smooth * 6.7);
            if (blinking) {
                const z = 29 - Math.min(3.2, state.elapsed * 0.5);
                figure.root.setPosition(0.4, evacuationHeight(z) + 0.016, z);
                figure.root.setEulerAngles(0, 180, 0);
            }
        }
        camera.setPosition(position);
        camera.lookAt(target);
        if (!steady && !warning) {
            roll.setFromEulerAngles(0, 0, blinking ? -7 : -7 * Math.min(1, state.elapsed / 2.2));
            camera.setRotation(camera.getRotation().clone().mul(roll));
        }
        const aspect = app.graphicsDevice.width / app.graphicsDevice.height;
        camera.camera!.fov = aspect < 1 ? Math.min(88, fov + (1 - aspect) * 40) : fov;
    };
    return {
        camera,
        update,
        setPaused: (paused: boolean) => {
            figure.anim.playing = !paused;
        }
    };
};
