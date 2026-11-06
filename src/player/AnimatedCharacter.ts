import type { AnimTrack, ContainerResource } from 'playcanvas';

import { CHARACTER_CLIPS, CHARACTER_MODELS } from '../data/characterModels';
import type { CharacterModelId, CharacterPose } from '../data/characterModels';
import { createModelInstance } from '../scenes/createModelInstance';

export const createAnimatedCharacter = (resource: ContainerResource, id: CharacterModelId, name: string) => {
    const { root, hierarchy } = createModelInstance(resource, CHARACTER_MODELS[id], name);
    try {
        const anim = hierarchy.addComponent('anim', { activate: true })!;
        anim.loadStateGraph({
            layers: [
                {
                    name: 'character',
                    states: [{ name: 'START' }, ...Object.keys(CHARACTER_CLIPS).map((name) => ({ name }))],
                    transitions: [{ from: 'START', to: 'idle', time: 0 }]
                }
            ],
            parameters: {}
        });
        const layer = anim.baseLayer!;
        for (const [pose, name] of Object.entries(CHARACTER_CLIPS)) {
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
                if (!destroyed && layer.activeState !== pose) layer.transition(pose, blend);
            }
        };
    } catch (error) {
        root.destroy();
        throw error;
    }
};

export type AnimatedCharacter = ReturnType<typeof createAnimatedCharacter>;
