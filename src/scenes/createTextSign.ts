import type { Entity, GraphicsDevice } from 'playcanvas';

import { createCanvasPanel } from './createCanvasPanel';

export const createTextSign = (
    owner: Entity,
    device: GraphicsDevice,
    name: string,
    lines: readonly string[],
    background: string,
    width = 1.8
) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Story signs require a canvas context.');
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff7e6';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    lines.forEach((line, index) => {
        context.font = `${index === 0 ? 'bold 44' : '30'}px system-ui, sans-serif`;
        context.fillText(line, 256, (256 / (lines.length + 1)) * (index + 1), 470);
    });
    return createCanvasPanel(owner, device, name, canvas, width, width / 2).panel;
};
