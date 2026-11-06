import type { Entity, GraphicsDevice } from 'playcanvas';

import { createCanvasPanel } from '../../scenes/createCanvasPanel';

import broadcast from './openingBroadcast.json';
import type { OpeningMedia } from './OpeningMedia';

export const createTelevisionScreen = (owner: Entity, device: GraphicsDevice, media: OpeningMedia) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 576;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('The café TV requires a canvas context.');
    const { panel, redraw } = createCanvasPanel(owner, device, 'news-screen', canvas, 1.84, 1.035);
    const poster = new Image();
    let destroyed = false;
    let lastFrame = -1;
    let lastCaption = '';
    let lastVideo: HTMLVideoElement | null = null;
    let dirty = true;
    poster.onload = () => {
        dirty = true;
    };
    poster.src = `${import.meta.env.BASE_URL}assets/video/${broadcast.poster}`;
    owner.once('destroy', () => {
        destroyed = true;
        poster.onload = null;
        poster.removeAttribute('src');
    });

    const update = () => {
        if (destroyed) return;
        const video = media.video;
        const state = media.state;
        const ready = !!video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        const frame = ready
            ? (video.getVideoPlaybackQuality?.().totalVideoFrames ?? Math.floor(video.currentTime * 24))
            : -1;
        const failed = state.phase === 'blocked' || state.phase === 'unavailable';
        const caption = failed ? 'Broadcast unavailable · Retry or read the subtitles.' : state.caption;
        if (!dirty && video === lastVideo && frame === lastFrame && caption === lastCaption) return;
        dirty = false;
        lastVideo = video;
        lastFrame = frame;
        lastCaption = caption;
        context.fillStyle = '#14282d';
        context.fillRect(0, 0, 1024, 576);
        if (ready) context.drawImage(video, 0, 0, 1024, 576);
        else if (poster.complete && poster.naturalWidth) context.drawImage(poster, 0, 0, 1024, 576);
        context.fillStyle = '#133239ed';
        context.fillRect(0, 0, 1024, 52);
        context.fillStyle = '#fff3d5';
        context.textAlign = 'left';
        context.font = 'bold 26px system-ui, sans-serif';
        context.fillText('COASTAL NEWS', 22, 35);
        context.textAlign = 'right';
        context.font = '20px system-ui, sans-serif';
        context.fillText(broadcast.label, 1002, 33);
        if (caption) {
            context.font = '28px system-ui, sans-serif';
            const lines = [''];
            for (const word of caption.split(' ')) {
                const line = lines.length - 1;
                const next = lines[line] ? `${lines[line]} ${word}` : word;
                if (context.measureText(next).width > 950) lines.push(word);
                else lines[line] = next;
            }
            const height = lines.length * 34 + 22;
            context.fillStyle = '#071114e8';
            context.fillRect(0, 538 - height, 1024, height);
            context.fillStyle = '#ffffff';
            context.textAlign = 'center';
            lines.forEach((line, index) => context.fillText(line, 512, 538 - height + 34 + index * 34));
        }
        context.fillStyle = '#a23c31';
        context.fillRect(0, 538, 1024, 38);
        context.fillStyle = '#fff4dd';
        context.textAlign = 'left';
        context.font = '20px system-ui, sans-serif';
        context.fillText('LOCAL BULLETIN  /  Unusual conditions reported offshore', 22, 564);
        redraw();
    };
    update();
    return { panel, update };
};
