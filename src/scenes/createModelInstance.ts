import { Entity } from 'playcanvas';
import type { ContainerResource } from 'playcanvas';

import type { ModelTuning } from '../data/modelTuning';

export const createModelInstance = (resource: ContainerResource, tuning: ModelTuning, name: string) => {
    const root = new Entity(name);
    const orientation = new Entity(`${name}-orientation`);
    const visual = new Entity(`${name}-calibration`);
    root.addChild(orientation);
    orientation.addChild(visual);
    orientation.setLocalEulerAngles(0, tuning.yaw, 0);
    visual.setLocalScale(tuning.scale, tuning.scale, tuning.scale);
    visual.setLocalPosition(-tuning.center[0] * tuning.scale, tuning.y, -tuning.center[2] * tuning.scale);
    const hierarchy = resource.instantiateRenderEntity({ castShadows: true });
    visual.addChild(hierarchy);
    return { root, hierarchy };
};
