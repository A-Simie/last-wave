import type { Vector3Tuple } from './foundation.ts';

export const modelTuning = (
    file: string,
    dims: Vector3Tuple,
    center: Vector3Tuple,
    groundOffset: number,
    size: number,
    dimension: 'height' | 'width' = 'height',
    yaw = 0
) => {
    const scale = size / dims[dimension === 'height' ? 1 : 0];
    return {
        file,
        boundsSource: 'vertices' as const,
        dims,
        center,
        groundOffset,
        intended: { dimension, size },
        height: dims[1] * scale,
        scale,
        y: groundOffset * scale,
        yaw
    };
};

export type ModelTuning = ReturnType<typeof modelTuning>;
