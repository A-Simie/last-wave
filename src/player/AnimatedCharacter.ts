import type { AnimTrack, ContainerResource } from 'playcanvas';

import {
    BEACH_CHARACTER_CLIPS,
    BEACH_CHARACTER_MODELS,
    CHARACTER_CLIPS,
    CHARACTER_MODELS,
    DRIVER_CLIPS,
    PLAYER_STORY_CLIPS
} from '../data/characterModels';
import type { CharacterModelId, CharacterPose } from '../data/characterModels';
import { LOCOMOTION_SPEEDS, locomotionPose } from '../data/locomotion';
import { createModelInstance } from '../scenes/createModelInstance';

export const createAnimatedCharacter = (resource: ContainerResource, id: CharacterModelId, name: string) => {
    const { root, hierarchy } = createModelInstance(resource, CHARACTER_MODELS[id], name);
    try {
        const clips =
            id in BEACH_CHARACTER_MODELS
                ? BEACH_CHARACTER_CLIPS
                : id === 'friendA'
                  ? { ...CHARACTER_CLIPS, ...PLAYER_STORY_CLIPS }
                  : id === 'patronBuzz' || id === 'patronShort'
                    ? { ...CHARACTER_CLIPS, ...DRIVER_CLIPS }
                    : CHARACTER_CLIPS;
        const anim = hierarchy.addComponent('anim', { activate: true })!;
        anim.loadStateGraph({
            layers: [
                {
                    name: 'character',
                    states: [{ name: 'START' }, ...Object.keys(clips).map((name) => ({ name }))],
                    transitions: [{ from: 'START', to: 'idle', time: 0 }]
                }
            ],
            parameters: {}
        });
        const layer = anim.baseLayer!;
        for (const [pose, name] of Object.entries(clips)) {
            const track = resource.animations
                .map((asset) => asset.resource as AnimTrack)
                .find((track) => track.name === name);
            if (!track) throw new Error(`${id} is missing animation ${name}.`);
            layer.assignAnimation(pose, track, 1, !['sitDown', 'standUp', 'fall', 'point'].includes(pose));
        }
        layer.play('idle');
        let destroyed = false;
        root.once('destroy', () => {
            destroyed = true;
        });
        const play = (pose: CharacterPose, blend = 0.22) => {
            if (!(pose in clips)) throw new Error(`${id} does not support pose ${pose}.`);
            if (destroyed) return;
            anim.speed = 1;
            if (layer.activeState !== pose) {
                const phase =
                    pose in LOCOMOTION_SPEEDS && layer.activeState in LOCOMOTION_SPEEDS
                        ? layer.activeStateProgress % 1
                        : undefined;
                layer.transition(pose, blend, phase);
            }
        };
        return {
            root,
            anim,
            play,
            move: (speed: number) => {
                const pace = Number.isFinite(speed) ? Math.max(0, speed) : 0;
                const pose = locomotionPose(pace, layer.activeState, 'jog' in clips);
                play(pose);
                if (pose !== 'idle' && !destroyed)
                    anim.speed = Math.min(2, pace / (LOCOMOTION_SPEEDS[pose] * CHARACTER_MODELS[id].scale));
                return pose;
            }
        };
    } catch (error) {
        root.destroy();
        throw error;
    }
};

export type AnimatedCharacter = ReturnType<typeof createAnimatedCharacter>;
