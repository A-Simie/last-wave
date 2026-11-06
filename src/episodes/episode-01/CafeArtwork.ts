import type { Entity, GraphicsDevice } from 'playcanvas';

import { createCanvasPanel } from '../../scenes/createCanvasPanel';

const canvas2d = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Café artwork requires a canvas context.');
    return { canvas, context };
};

export const createCoastalView = (owner: Entity, device: GraphicsDevice) => {
    const { canvas, context: c } = canvas2d(1536, 640);
    const sky = c.createLinearGradient(0, 0, 0, 450);
    sky.addColorStop(0, '#efbc84');
    sky.addColorStop(1, '#ffe6b3');
    c.fillStyle = sky;
    c.fillRect(0, 0, 1536, 640);
    c.fillStyle = '#fff1c2';
    c.beginPath();
    c.arc(1050, 221, 80, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#628f93';
    c.fillRect(0, 370, 1536, 270);
    c.fillStyle = '#acb5a0';
    c.beginPath();
    c.moveTo(700, 370);
    c.lineTo(880, 292);
    c.lineTo(946, 312);
    c.lineTo(1025, 277);
    c.lineTo(1123, 318);
    c.lineTo(1390, 370);
    c.fill();
    c.fillStyle = '#f1e2be';
    c.fillRect(1000, 206, 24, 85);
    c.fillStyle = '#ad694c';
    c.fillRect(996, 215, 32, 10);
    c.fillRect(996, 201, 32, 8);
    c.beginPath();
    c.moveTo(993, 201);
    c.lineTo(1012, 184);
    c.lineTo(1031, 201);
    c.fill();
    c.strokeStyle = '#c3ceaf';
    c.lineWidth = 3;
    for (let i = 0; i < 26; i++) {
        const x = (i * 157) % 1536;
        const y = 388 + ((i * 31) % 153);
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + 70 + (i % 4) * 20, y);
        c.stroke();
    }
    c.fillStyle = '#d4b88b';
    c.fillRect(0, 552, 1536, 88);
    c.fillStyle = '#8c785b';
    c.fillRect(0, 552, 1536, 9);
    for (const x of [76, 239, 483, 735, 1245, 1440]) {
        c.fillStyle = '#72664b';
        c.fillRect(x, 521, 10, 83);
    }
    c.strokeStyle = '#72664b';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(0, 528);
    c.lineTo(1536, 528);
    c.stroke();
    for (const [x, top, lean] of [
        [170, 78, 60],
        [535, 142, -36],
        [1380, 63, -48]
    ]) {
        c.strokeStyle = '#795d3c';
        c.lineWidth = 22;
        c.beginPath();
        c.moveTo(x, 563);
        c.quadraticCurveTo(x - lean, 310, x + lean, top);
        c.stroke();
        c.strokeStyle = '#657047';
        c.lineWidth = 14;
        for (let j = 0; j < 9; j++) {
            const angle = (j / 8) * Math.PI * 2;
            c.beginPath();
            c.moveTo(x + lean, top);
            c.quadraticCurveTo(
                x + lean + Math.cos(angle) * 115,
                top + Math.sin(angle) * 35 - 46,
                x + lean + Math.cos(angle) * 152,
                top + Math.sin(angle) * 59 + 65
            );
            c.stroke();
        }
    }
    return createCanvasPanel(owner, device, 'cafe-coastal-window-view', canvas, 8.65, 2.55).panel;
};
