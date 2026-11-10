import type { AnimTrack, ContainerResource, Entity } from 'playcanvas';

import type { ForestCharacters } from '../core/AssetManager';
import { CHARACTER_MODELS } from '../data/characterModels';
import { LOCOMOTION_SPEEDS } from '../data/locomotion';
import { createModelInstance } from '../scenes/createModelInstance';

import { FOREST_SPEECH } from './forestDialogue';

export const createForestPerformers = (
    parent: Entity,
    characters: ForestCharacters,
    performances: ContainerResource
) => {
    const actor = (id: 'patronBeard' | 'patronLong', name: string) => {
        const { root, hierarchy } = createModelInstance(characters[id], CHARACTER_MODELS[id], name);
        parent.addChild(root);
        const clips = {
            idle: 'Casual_Idle_Loop',
            walk: 'Casual_Walk_Loop',
            phoneWalk: 'Forest_Phone_Walk',
            phone: 'Idle_Torch_Loop',
            duck: 'Crouch_Idle_Loop',
            startle: 'Hit_Head',
            point: 'Interact',
            talk: 'Idle_Talking_Loop',
            phoneLook: 'Forest_Phone_Look_Up',
            look: 'Forest_Look_Up'
        };
        const anim = hierarchy.addComponent('anim', { activate: true })!;
        anim.loadStateGraph({
            layers: [
                {
                    name: 'forest-performance',
                    states: [{ name: 'START' }, ...Object.keys(clips).map((name) => ({ name }))],
                    transitions: [{ from: 'START', to: 'idle', time: 0 }]
                }
            ],
            parameters: {}
        });
        const layer = anim.baseLayer!;
        const available = [...characters[id].animations, ...performances.animations].map(
            (asset) => asset.resource as AnimTrack
        );
        for (const [state, name] of Object.entries(clips)) {
            const track = available.find((track) => track.name === name);
            if (!track) throw new Error(`Forest performance is missing ${name}.`);
            layer.assignAnimation(state, track, 1, !['startle', 'point'].includes(state));
        }
        layer.play('idle');
        return {
            root,
            play: (state: keyof typeof clips, speed = 1) => {
                if (layer.activeState !== state)
                    layer.transition(state, state === 'startle' || state === 'duck' ? 0.1 : 0.24);
                anim.speed = speed;
            }
        };
    };
    const man = actor('patronBeard', 'forest-unidentified-man');
    const woman = actor('patronLong', 'forest-unidentified-woman');
    const hand = man.root.findByName('hand_l');
    if (!hand) throw new Error('The forest phone requires the calibrated torch hand.');
    return {
        hand: hand as Entity,
        update: (time: number) => {
            const hesitant = time >= 12.8 && time < 15.4;
            const walking = (time >= 3 && time < 9.7) || hesitant || (time >= 32 && time < 38);
            const approach = Math.max(0, Math.min(2.6, time - 12.8)) * 0.45;
            const x =
                time < 9.7
                    ? -9 + Math.max(0, time - 3) * 1.05
                    : time < 32
                      ? -1.965 + approach
                      : -0.795 + (time - 32) * 2;
            const scared = time >= 24 && time < 25.7;
            man.root.enabled = time >= 2 && time < 38;
            woman.root.enabled = time >= 3.5 && time < 38;
            const flinch = scared ? Math.sin(Math.min(1, (time - 24) / 1.7) * Math.PI) * 0.25 : 0;
            const cautious = Math.max(0, Math.min(1, (time - 19.4) / 0.7)) * 0.3;
            man.root.setLocalPosition(x, 0.04, 0.6 - cautious + flinch);
            woman.root.setLocalPosition(x - 1.2, 0.04, 1.25 + flinch * 0.5);
            const turn = (from: number, to: number, start: number, end: number) => {
                const p = Math.max(0, Math.min(1, (time - start) / (end - start))),
                    t = p * p * (3 - 2 * p);
                return from + (to - from) * t;
            };
            const manYaw =
                time < 18.6
                    ? 90
                    : time < 26.5
                      ? turn(90, 170, 18.6, 19.4)
                      : time < 31.5
                        ? turn(170, 270, 26.5, 27.3)
                        : turn(270, 450, 31.5, 32.3);
            const womanYaw =
                time < 18.8
                    ? 90
                    : time < 28
                      ? turn(90, 160, 18.8, 19.5)
                      : time < 34
                        ? turn(160, 90, 28, 28.7)
                        : time < 35
                          ? turn(90, 170, 34, 34.5)
                          : turn(170, 90, 35, 35.6);
            man.root.setLocalEulerAngles(0, manYaw, 0);
            woman.root.setLocalEulerAngles(0, womanYaw, 0);
            const speed = hesitant ? 0.45 : time < 32 ? 1.05 : 2;
            const speaking = FOREST_SPEECH.find((cue) => time >= cue.start && time < cue.end)?.speaker;
            const lookUp = time >= 22.3 && time < 24;
            man.play(
                walking
                    ? 'phoneWalk'
                    : scared
                      ? 'startle'
                      : lookUp
                        ? 'phoneLook'
                        : speaking === 'Man'
                          ? 'talk'
                          : 'phone',
                walking ? speed / (LOCOMOTION_SPEEDS.walk * CHARACTER_MODELS.patronBeard.scale) : 1
            );
            woman.play(
                walking
                    ? 'walk'
                    : scared
                      ? 'duck'
                      : lookUp
                        ? 'look'
                        : time >= 15.5 && time < 16.4
                          ? 'point'
                          : speaking === 'Woman'
                            ? 'talk'
                            : 'idle',
                walking ? speed / (LOCOMOTION_SPEEDS.walk * CHARACTER_MODELS.patronLong.scale) : 1
            );
            return { x, scared };
        }
    };
};
