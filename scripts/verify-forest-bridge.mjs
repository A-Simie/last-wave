import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5189/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/forest-bridge/', import.meta.url);
await mkdir(output, { recursive: true });
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = pages.find((p) => p.type === 'page');
assert.ok(page, 'Start an isolated Chrome with --headless=new --mute-audio --remote-debugging-port=9223');
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));
let id = 0;
const pending = new Map(),
    issues = [],
    results = [];
socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
        const request = pending.get(message.id);
        if (request) {
            clearTimeout(request.timer);
            pending.delete(message.id);
            if (message.error) request.reject(new Error(JSON.stringify(message.error)));
            else request.resolve(message.result);
        }
    } else if (
        message.method === 'Runtime.exceptionThrown' ||
        (message.method === 'Network.loadingFailed' && !message.params.canceled) ||
        (message.method === 'Network.responseReceived' && message.params.response.status >= 400) ||
        (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'warn'].includes(message.params.type))
    )
        issues.push(message);
});
const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
        const next = ++id;
        const timer = setTimeout(() => {
            pending.delete(next);
            reject(new Error(`Timeout: ${method}`));
        }, 60000);
        pending.set(next, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: next, method, params }));
    });
const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
};
const wait = (condition) =>
    evaluate(
        `new Promise((resolve,reject)=>{const start=performance.now();const step=()=>{if(${condition})return resolve(true);if(performance.now()-start>55000)return reject(new Error('Condition timed out'));setTimeout(step,40);};step();})`
    );
const click = async (selector) => {
    await wait(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&e.getBoundingClientRect().width>0&&!e.closest('[inert]');})()`
    );
    await evaluate(
        `(async()=>{const e=document.querySelector(${JSON.stringify(selector)});const dialog=e.closest('dialog');if(dialog)await Promise.all(dialog.getAnimations().map(a=>a.finished));})()`
    );
    const r = await evaluate(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e.closest('[data-forest-board]'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`
    );
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...r, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...r, button: 'left', clickCount: 1 });
};
const shot = async (name) => {
    const r = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(new URL(`${name}.png`, output), Buffer.from(r.data, 'base64'));
};
const record = (name) => {
    results.push(name);
    process.stdout.write(`PASS ${name}\n`);
};
const app = `[...globalThis.__playcanvasApps.keys()][0]`;
const advance = async (seconds) => {
    await evaluate(
        `(()=>{const a=${app};a.fire('update',${seconds});for(let i=0;i<3;i++)a.systems.fire('animationUpdate',0.1);return true;})()`
    );
    await evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
};

let failure;
try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
    });
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false
    });
    const hook = await readFile(
        new URL('../.agents/skills/inspect-runtime/scripts/devtools-hook.js', import.meta.url),
        'utf8'
    );
    await send('Page.addScriptToEvaluateOnNewDocument', {
        source: hook + "\nlocalStorage.removeItem('last-wave.intro-skip.v1');"
    });
    const loaded = new Promise((resolve) => {
        const listener = ({ data }) => {
            if (JSON.parse(data).method === 'Page.loadEventFired') {
                socket.removeEventListener('message', listener);
                resolve();
            }
        };
        socket.addEventListener('message', listener);
    });
    await send('Page.navigate', { url });
    await loaded;
    await wait(`!!document.querySelector('#forest-entry') && !!${app}.root.findByName('forest-login-sign')`);
    assert.equal(await evaluate(`!!document.querySelector('[data-forest-audio-invite]')`), false);
    await wait(`Number(document.querySelector('#forest-entry').dataset.elapsed)>1`);
    await shot('00-automatic-opening');
    record('Intro advances automatically with no sound invitation');
    if (await evaluate(`document.querySelector('#forest-entry').dataset.audio!=='playing'`)) {
        await click('[data-forest-sound]');
        await wait(`document.querySelector('#forest-entry').dataset.audio==='playing'`);
    }
    await click('[data-forest-sound]');
    await click('[data-forest-skip]');
    await click('[data-forest-skip-once]');
    await click('[data-forest-replay]');
    await wait(`document.querySelector('#forest-entry').dataset.phase!=='ready'`);
    await evaluate(`${app}.timeScale=0;true`);
    const samples = [];
    for (const t of [32, 35, 37.8, 38, 39, 40, 41, 42, 43, 44]) {
        const now = await evaluate(`Number(document.querySelector('#forest-entry').dataset.elapsed)`);
        await advance(Math.max(0, t - now));
        samples.push(
            await evaluate(
                `(()=>{const a=${app},c=a.root.findByName('forest-camera'),s=a.root.findByName('forest-login-sign');return {time:Number(document.querySelector('#forest-entry').dataset.elapsed),camera:c.getPosition().toArray(),sign:s.getRotation().toArray(),caption:document.querySelector('[data-forest-caption]').textContent,formHidden:document.querySelector('[data-forest-board]').hidden};})()`
            )
        );
        await shot('time-' + t);
    }
    await writeFile(new URL('camera-samples.json', output), JSON.stringify(samples, null, 2));
    assert.ok(samples[5].camera[1] - samples[6].camera[1] > samples[4].camera[1] - samples[5].camera[1]);
    assert.ok(samples.at(-1).camera[1] < -9);
    assert.equal(samples.at(-1).formHidden, false);
    assert.equal(samples.at(-1).caption, '');
    const decoration = await evaluate(
        `(()=>{const a=${app},d=a.root.findByName('forest-dungeon');return {walls:d.findComponents('render').length,goblins:d.findByName('forest-goblin-left')&&d.findByName('forest-goblin-right')?2:0,torches:d.findComponents('light').length,head:d.findByName('goblin-head').getLocalRotation().toArray(),entities:d.findComponents('render').length};})()`
    );
    assert.ok(decoration.walls > 60);
    assert.equal(decoration.goblins, 2);
    assert.ok(decoration.torches >= 9);
    await advance(0.7);
    const moving = await evaluate(
        `(()=>{const d=${app}.root.findByName('forest-dungeon');return {head:d.findByName('goblin-head').getLocalRotation().toArray(),entities:d.findComponents('render').length};})()`
    );
    assert.notDeepEqual(decoration.head, moving.head);
    assert.equal(decoration.entities, moving.entities);
    record('Calibrated dungeon modules, two animated goblins and live torch/candle dressing remain stable at the form');
    record('Camera accelerates into the pit, settles at the bottom, and the sign turns to reveal the form');
    const form = await evaluate(
        `(()=>{const f=document.querySelector('[data-forest-board]'),r=f.getBoundingClientRect();return {inert:f.inert,transform:f.style.transform,rect:[r.x,r.y,r.width,r.height],focus:document.activeElement.id};})()`
    );
    assert.equal(form.inert, false);
    assert.ok(form.transform.startsWith('matrix3d('));
    assert.equal(form.focus, 'forest-username');
    await click('[data-forest-password]');
    assert.equal(await evaluate(`document.querySelector('#forest-password').type`), 'text');
    await click('[data-forest-account]');
    assert.ok(await evaluate(`document.querySelector('[data-forest-feedback]').textContent.includes('not connected')`));
    record('Projected HTML form retains focus, password toggle and truthful account feedback');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await advance(0);
    await shot('portrait-login');
    const mobile = await evaluate(
        `(()=>{const r=document.querySelector('[data-forest-board]').getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};})()`
    );
    assert.ok(mobile.x >= 0 && mobile.right <= 391 && mobile.y >= 0 && mobile.bottom <= 845, JSON.stringify(mobile));
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await advance(0);
    assert.equal(await evaluate(`document.querySelector('[data-forest-replay]').hidden`), true);
    assert.equal(await evaluate(`document.querySelector('[data-forest-board]').inert`), false);
    await shot('reduced-motion-login');
    record('Reduced motion keeps the grounded form available without the descent');
    await click('[data-forest-local]');
    await wait(`!document.querySelector('#forest-entry') && !!${app}.root.findByName('foundation-scene')`);
    assert.equal(await evaluate(`!!${app}.root.findByName('forest-login-sign')`), false);
    record('Portrait form fits; Continue locally opens the game and removes bridge/forest UI');
    assert.equal(issues.length, 0, JSON.stringify(issues));
} catch (error) {
    failure = error;
    console.error(error);
    try {
        await shot('failure');
    } catch {
        console.error('Failure capture unavailable.');
    }
} finally {
    await writeFile(
        new URL('report.json', output),
        JSON.stringify({ url, results, issues, failure: failure?.stack, at: new Date().toISOString() }, null, 2)
    );
    try {
        await send('Browser.close');
    } catch {
        // Chrome can close before acknowledging the command.
    }
    socket.close();
}
if (failure) process.exitCode = 1;
