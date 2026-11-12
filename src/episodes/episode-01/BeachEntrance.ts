import { Entity } from 'playcanvas';
import type { AppBase } from 'playcanvas';

import type { ModelAssets } from '../../core/AssetManager';
import { createPreparedModel } from '../../scenes/createPreparedModel';
import { createTextSign } from '../../scenes/createTextSign';
import { createBoxVisual as box, createMaterial, createStaticBody, createStaticBox } from '../../scenes/primitives';

import { ENTRY_SOLIDS, QUEUE_MARK, TICKET_COUNTER } from './entryLayout';
import { ENTRANCE_POLICE_CAR } from './streetLayout';

export const createBeachEntrance = (parent: Entity, app: AppBase, models: ModelAssets = {}) => {
    const root = new Entity('beach-entrance');
    parent.addChild(root);
    const materials = {
        cream: createMaterial('entrance-limestone', 0.87, 0.79, 0.62),
        teal: createMaterial('entrance-sea-green', 0.12, 0.38, 0.35),
        wood: createMaterial('entrance-timber', 0.43, 0.29, 0.17),
        brass: createMaterial('entrance-brass', 0.87, 0.62, 0.27),
        sand: createMaterial('entrance-sand', 0.89, 0.85, 0.72)
    };
    root.once('destroy', () => Object.values(materials).forEach((material) => material.destroy()));
    box(root, 'beach-plaza-paving', [83, 0.015, -7.5], [28, 0.03, 31], materials.cream);
    box(root, 'beach-entry-sand', [83, 0.016, -25], [46, 0.032, 20], materials.sand);
    for (let z = -12.5; z > -32; z -= 0.5)
        box(root, `beach-entry-board-${z}`, [86.3, 0.04, z], [5, 0.03, 0.46], materials.wood);
    const imported: Entity[] = [];
    const booth = models.ticketBooth;
    for (const definition of ENTRY_SOLIDS) {
        if (booth && (definition.name.startsWith('ticket-booth-') || definition.name === TICKET_COUNTER.name)) {
            // The supplied booth replaces the procedural kiosk; its collision volumes stay as authored.
            createStaticBody(root, definition);
            continue;
        }
        if (definition.name.includes('fence') || definition.name.includes('gate') || definition.name.includes('rail')) {
            const body = createStaticBody(root, definition);
            const [width, height, depth] = definition.size;
            const horizontal = width > depth;
            for (const y of [-height * 0.2, height * 0.38]) {
                box(body, `rail-${y}`, [0, y, 0], horizontal ? [width, 0.08, 0.1] : [0.1, 0.08, depth], materials.wood);
            }
            const length = Math.max(width, depth);
            const count = Math.ceil(length / 1.4);
            for (let i = 0; i <= count; i++) {
                const p = -length / 2 + (length * i) / count;
                box(body, `post-${i}`, horizontal ? [p, 0, 0] : [0, 0, p], [0.12, height, 0.12], materials.teal);
            }
        } else {
            const paint =
                definition.name.includes('arch') || definition.name.includes('roof') ? materials.teal : materials.cream;
            createStaticBox(root, definition, paint);
        }
    }
    if (booth) {
        // Authored with its serving window on +X; turn it to face the street (+Z).
        const model = createPreparedModel(booth, 'ticketBooth', 'beach-ticket-booth-model', { footprint: [3.2, 3.6] });
        root.addChild(model.root);
        model.root.setLocalPosition(75.3, 0, -4.5);
        model.root.setLocalEulerAngles(0, -90, 0);
        imported.push(model.root);
    }
    if (models.policeCar) {
        const car = createStaticBody(root, ENTRANCE_POLICE_CAR);
        const model = createPreparedModel(models.policeCar, 'policeCar', 'entrance-police-car-model');
        car.addChild(model.root);
        model.root.setLocalPosition(0, -ENTRANCE_POLICE_CAR.position[1], 0);
        imported.push(model.root);
    }
    box(root, 'arch-crown', [82.75, 5.72, -11.8], [22.7, 0.18, 2.2], materials.brass);
    box(root, 'arch-lintel-trim', [82.75, 4.58, -10.91], [21.6, 0.12, 0.1], materials.brass);
    const sign = (
        name: string,
        lines: string[],
        width: number,
        x: number,
        y: number,
        z: number,
        yaw = 0,
        height?: number
    ) => {
        const panel = createTextSign(root, app.graphicsDevice, name, lines, '#254f49', width, height);
        root.addChild(panel);
        panel.setLocalPosition(x, y, z);
        panel.setLocalEulerAngles(90, yaw, 0);
        return panel;
    };
    sign('beach-arch-sign', ['SEAFRONT BEACH', 'SEA AIR · SLOW AFTERNOONS'], 10, 82.75, 5.17, -10.93, 0, 0.84);
    sign('beach-ticket-sign', ['DAY PASSES', '2 PEOPLE · 10 CREDITS'], 3.7, 75.3, 2.55, -2.88, 0, 1);
    sign('beach-queue-sign', ['QUEUE HERE', 'HAVE BOTH PASSES READY'], 2.6, 92.4, 1.8, -3.8);
    box(root, 'queue-sign-post', [92.4, 0.8, -3.84], [0.09, 1.6, 0.09], materials.wood);
    box(root, 'queue-waiting-mark', [QUEUE_MARK[0], 0.033, QUEUE_MARK[2]], [2.5, 0.004, 0.9], materials.brass);
    for (const [x, z, yaw, lines] of [
        [29, 8.75, 180, ['BEACH · EAST', 'PAST LEMON MARKET']],
        [54.6, 6.8, -90, ['BEACH ENTRANCE', 'ACROSS THE SIDE STREET']],
        [70.5, 4.4, 0, ['SEAFRONT BEACH', 'TICKETS & ENTRY AHEAD']]
    ] as const) {
        sign(`beach-wayfinding-${x}`, [...lines], 2.5, x, 2.6, z, yaw);
        box(root, `beach-wayfinding-post-${x}`, [x, 1.2, z], [0.07, 2.4, 0.07], materials.teal);
    }
    for (let x = 59.5; x < 67; x += 0.95)
        box(root, `side-street-crosswalk-${x}`, [x, 0.014, 6.9], [0.48, 0.008, 2.8], materials.cream);
    for (const x of [25, 39, 50, 57, 69, 76]) {
        for (const side of [-1, 1]) {
            const arrow = box(
                root,
                `beach-route-arrow-${x}-${side}`,
                [x, 0.029, 6.8 + side * 0.18],
                [0.62, 0.006, 0.09],
                materials.teal
            );
            arrow.setLocalEulerAngles(0, side * 35, 0);
        }
    }
    const group = app.batcher!.addGroup('beach-entrance-static', false, 24);
    root.once('destroy', () => app.batcher?.removeGroup(group.id));
    root.findComponents('render').forEach((render) => {
        if (!imported.some((model) => render.entity === model || render.entity.isDescendantOf(model)))
            render.batchGroupId = group.id;
    });
    return root;
};
