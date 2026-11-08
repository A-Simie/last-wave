import type { Entity, GraphicsDevice } from 'playcanvas';

import { createCanvasPanel } from './createCanvasPanel';

export const createTextSign = (
    owner: Entity,
    device: GraphicsDevice,
    name: string,
    lines: readonly string[],
    background: string,
    width = 1.8,
    height?: number
) => {
    const canvas = document.createElement('canvas');
    const panelHeight = height ?? width / 2;
    canvas.width = Math.min(2048, Math.round((256 * width) / panelHeight));
    canvas.height = Math.round((canvas.width * panelHeight) / width);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Story signs require a canvas context.');
    context.fillStyle = background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#fff7e6';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    lines.forEach((line, index) => {
        const size = height ? canvas.height * (index === 0 ? 0.32 : 0.2) : index === 0 ? 44 : 30;
        context.font = `${index === 0 ? 'bold ' : ''}${size}px system-ui, sans-serif`;
        context.fillText(
            line,
            canvas.width / 2,
            (canvas.height / (lines.length + 1)) * (index + 1),
            canvas.width * 0.92
        );
    });
    return createCanvasPanel(owner, device, name, canvas, width, panelHeight).panel;
};
