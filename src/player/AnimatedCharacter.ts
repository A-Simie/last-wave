import type { AnimTrack, ContainerResource } from 'playcanvas';

import {
    BEACH_CHARACTER_CLIPS,
    BEACH_CHARACTER_MODELS,
    CHARACTER_CLIPS,
    CHARACTER_MODELS
} from '../data/characterModels';
import type { CharacterModelId, CharacterPose } from '../data/characterModels';
import { createModelInstance } from '../scenes/createModelInstance';

export const createAnimatedCharacter = (resource: ContainerResource, id: CharacterModelId, name: string) => {
    const { root, hierarchy } = createModelInstance(resource, CHARACTER_MODELS[id], name);
    try {
        const clips = id in BEACH_CHARACTER_MODELS ? BEACH_CHARACTER_CLIPS : CHARACTER_CLIPS;
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
            layer.assignAnimation(pose, track, 1, pose !== 'sitDown' && pose !== 'standUp');
        }
        layer.play('idle');
        let destroyed = false;
        root.once('destroy', () => {
            destroyed = true;
        });
        return {
            root,
            anim,
            play: (pose: CharacterPose, blend = 0.18) => {
                if (!(pose in clips)) throw new Error(`${id} does not support pose ${pose}.`);
                if (!destroyed && layer.activeState !== pose) layer.transition(pose, blend);
            }
        };
    } catch (error) {
        root.destroy();
        throw error;
    }
};

export type AnimatedCharacter = ReturnType<typeof createAnimatedCharacter>;
