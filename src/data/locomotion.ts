// Metres per second from the licensed clips' root-motion siblings; runtime clips remain in-place.
export const LOCOMOTION_SPEEDS = { walk: 1.3 / (40 / 30), jog: 5 / (28 / 30), sprint: 5.5 / (20 / 30) } as const;
export type MovingPose = keyof typeof LOCOMOTION_SPEEDS;
export type LocomotionPose = 'idle' | MovingPose;

export const locomotionPose = (speed: number, previous: string, jogging = true): LocomotionPose => {
    if (speed < (previous === 'idle' ? 0.14 : 0.08)) return 'idle';
    if (speed > (previous === 'sprint' ? 5.6 : 6.1)) return 'sprint';
    if (speed > (previous === 'jog' ? 2 : 2.3)) return jogging ? 'jog' : 'sprint';
    return 'walk';
};
