import { Entity } from 'playcanvas';
import type { AnimTrack, ContainerResource } from 'playcanvas';

import { PREPARED_MODELS } from '../data/newModels';
import type { PreparedModelId } from '../data/newModels';

export type ModelFit = {
    /** Uniformly scale so the model fits inside this x/z footprint (metres). */
    footprint?: readonly [number, number];
    /** Uniformly scale to this height (metres). Applied after footprint when both are given (smaller wins). */
    height?: number;
    /** Extra uniform multiplier. */
    scale?: number;
};

/**
 * Instantiates a prepared model below a calibration wrapper. The returned hierarchy root keeps its authored
 * transform (PlayCanvas returns the single glTF root node as the instance root), so all placement and scale is
 * applied to the wrapper entities only.
 */
export const createPreparedModel = (
    resource: ContainerResource,
    id: PreparedModelId,
    name: string,
    fit: ModelFit = {},
    options: { castShadows?: boolean; animate?: boolean } = {}
) => {
    const model = PREPARED_MODELS[id];
    const [width, height, depth] = model.dims;
    const limits: number[] = [];
    if (fit.footprint) limits.push(fit.footprint[0] / width, fit.footprint[1] / depth);
    if (fit.height) limits.push(fit.height / height);
    const factor = (fit.scale ?? 1) * (limits.length ? Math.min(...limits) : 1);
    const root = new Entity(name);
    const visual = new Entity(`${name}-calibration`);
    root.addChild(visual);
    const scale = model.scale * factor;
    visual.setLocalScale(scale, scale, scale);
    visual.setLocalPosition(model.offset[0] * factor, model.offset[1] * factor, model.offset[2] * factor);
    const hierarchy = resource.instantiateRenderEntity({ castShadows: options.castShadows ?? true });
    visual.addChild(hierarchy);
    if (options.animate && resource.animations.length) {
        const anim = hierarchy.addComponent('anim', { activate: true })!;
        anim.assignAnimation('clip', resource.animations[0].resource as AnimTrack);
    }
    return {
        root,
        hierarchy,
        factor,
        dims: [width * factor, height * factor, depth * factor] as [number, number, number]
    };
};
