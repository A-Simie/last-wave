import type { AnimTrack, ContainerResource } from 'playcanvas';

import { DRIVER_CLIPS } from '../data/characterModels';

import type { AnimatedCharacter } from './AnimatedCharacter';

export const applyUmbrellaCarryPose = (character: AnimatedCharacter, driving: ContainerResource) => {
    const track = driving.animations
        .map((asset) => asset.resource as AnimTrack)
        .find((track) => track.name === DRIVER_CLIPS.driving);
    if (!track) throw new Error('Umbrella carrying requires the shared driving grip clip.');
    const layer = character.anim.addLayer('umbrella-grip');
    layer.mask = {
        'Armature/root/pelvis/spine_01/spine_02/spine_03/clavicle_r': { children: true }
    };
    layer.assignAnimation('hold', track, 0, true);
    layer.play('hold');
};
