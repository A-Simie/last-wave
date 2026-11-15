import { Color, Entity, Vec3 } from 'playcanvas';
import type { ContainerResource, GraphicsDevice, StandardMaterial } from 'playcanvas';

import { createModelInstance } from '../scenes/createModelInstance';
import { createTextSign } from '../scenes/createTextSign';
import { createBoxVisual, createMaterial } from '../scenes/primitives';

import { forestBoardProjection } from './forestBoardProjection';
import { FOREST_FORM, FOREST_PIT, FOREST_SIGN, forestSignTurn } from './forestBridgeLayout';
import { FOREST_MODELS } from './forestModels';

export const createForestBridge = (
    parent: Entity,
    device: GraphicsDevice,
    bridge: ContainerResource,
    signs: ContainerResource
) => {
    const root = new Entity('forest-bridge-reveal');
    parent.addChild(root);
    const earth = createMaterial('forest-pit-earth', 0.1, 0.075, 0.055);
    const rock = createMaterial('forest-pit-rock', 0.12, 0.15, 0.16);
    const timber = createMaterial('forest-pit-support', 0.19, 0.105, 0.045);
    const span = FOREST_PIT.east - FOREST_PIT.west;
    createBoxVisual(root, 'forest-pit-floor', [5, FOREST_PIT.floor - 0.15, 6], [span, 0.3, 20], earth);
    for (const x of [FOREST_PIT.west - 0.3, FOREST_PIT.east + 0.3])
        createBoxVisual(root, 'forest-pit-side', [x, -6.6, 6], [0.6, 13.2, 20], rock);
    for (const z of [FOREST_PIT.back - 0.3, FOREST_PIT.front + 0.3])
        createBoxVisual(root, 'forest-pit-end', [5, -6.6, z], [span, 13.2, 0.6], rock);
    const crossing = createModelInstance(bridge, FOREST_MODELS.bridge, 'forest-wooden-bridge');
    root.addChild(crossing.root);
    crossing.root.setLocalPosition(5, -2.0657, 0.9);
    for (const side of [-1, 1]) {
        const height = side < 0 ? 0.4453 : 0.4527;
        const ramp = createBoxVisual(
            root,
            'forest-bridge-approach',
            [5 + side * 6.025, height / 2 - 0.04, 0.9],
            [Math.hypot(1.35, height), 0.08, 3],
            timber
        );
        ramp.setLocalEulerAngles(0, 0, (-side * Math.atan2(height, 1.35) * 180) / Math.PI);
    }
    const sign = new Entity('forest-login-sign');
    root.addChild(sign);
    sign.setLocalPosition(FOREST_SIGN.x, FOREST_SIGN.y, FOREST_SIGN.z);
    const marker = createModelInstance(signs, FOREST_MODELS.woodSigns, 'forest-wood-waymarkers');
    sign.addChild(marker.root);
    marker.root.setLocalPosition(0, -2.9, -0.25);
    const imported = marker.hierarchy.findComponents('render')[0].meshInstances[0].material as StandardMaterial;
    const wood = imported.clone();
    wood.name = 'forest-login-sourced-wood';
    wood.diffuse.set(0.35, 0.3, 0.25);
    wood.diffuseMapTiling.set(0.13, 0.08);
    wood.diffuseMapOffset.set(0.24, 0.08);
    wood.diffuseMapRotation = 90;
    wood.normalMap = null;
    wood.aoMap = null;
    wood.useMetalness = true;
    wood.metalness = 0;
    wood.metalnessMap = null;
    wood.update();
    createBoxVisual(sign, 'forest-login-backing', [0, 0, -0.05], [FOREST_SIGN.width, FOREST_SIGN.height, 0.12], timber);
    for (let i = 0; i < 8; i++)
        createBoxVisual(sign, 'forest-login-plank', [0, -2.45 + i * 0.7, 0], [3.8, 0.68, 0.2], wood);
    for (const x of [-1.5, 1.5]) createBoxVisual(sign, 'forest-login-post', [x, -1.7, -0.2], [0.16, 3.2, 0.2], timber);
    const pointer = createTextSign(
        sign,
        device,
        'forest-login-pointer',
        ['THE WAY OUT', 'FOLLOW THE LIGHT'],
        '#302017',
        2.6,
        0.8
    );
    sign.addChild(pointer);
    pointer.setLocalPosition(0, 0, -0.13);
    pointer.setLocalEulerAngles(90, 180, 0);
    for (const [x, z] of [
        [2.2, 2.6],
        [7.8, 2.6]
    ]) {
        const light = new Entity('forest-pit-lantern-light');
        root.addChild(light);
        light.setLocalPosition(x, -10.2, z);
        light.addComponent('light', {
            type: 'omni',
            color: new Color(1, 0.75, 0.45),
            range: 12,
            intensity: 2,
            castShadows: false
        });
    }
    root.once('destroy', () => [earth, rock, timber, wood].forEach((m) => m.destroy()));
    const point = new Vec3();
    return {
        update: (time: number) => sign.setLocalEulerAngles(0, forestSignTurn(time), 0),
        project: (camera: Entity) => {
            if (sign.forward.dot(camera.getPosition().clone().sub(sign.getPosition())) > -0.1) return null;
            const corners = [
                [-1, 1],
                [1, 1],
                [1, -1],
                [-1, -1]
            ].map(([x, y]) => {
                point.set((x * FOREST_FORM.worldWidth) / 2, (y * FOREST_FORM.worldHeight) / 2, 0.13);
                sign.getWorldTransform().transformPoint(point, point);
                const screen = camera.camera!.worldToScreen(point);
                return { x: screen.x, y: screen.y };
            });
            return forestBoardProjection(corners, FOREST_FORM.width, FOREST_FORM.height);
        }
    };
};
