import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5180/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/forest-scare/', import.meta.url);
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
    await evaluate(
        `(async()=>{const e=document.querySelector(${JSON.stringify(selector)});const dialog=e.closest('dialog');if(dialog)await Promise.all(dialog.getAnimations().map(a=>a.finished));})()`
    );
    const r = await evaluate(
        `(()=>{const e=document.querySelector(${JSON.stringify(selector)}); e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`
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
    await send('Page.bringToFront');
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
    await send('Page.addScriptToEvaluateOnNewDocument', { source: hook });
    await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `(() => {
        const original = AudioContext.prototype.createAnalyser;
        AudioContext.prototype.createAnalyser = function(...args) {
            const node=original.apply(this,args); (globalThis.__forestAnalysers??=[]).push(node); return node;
        };
    })()`
    });
    const clearSeen = await send('Page.addScriptToEvaluateOnNewDocument', {
        source: `localStorage.removeItem('last-wave.intro-skip.v1');sessionStorage.setItem('forest-checkpoint-before',localStorage.getItem('last-wave.checkpoint')??'');`
    });
    await send('Page.navigate', { url });
    await wait(`document.querySelector('#startup-status')?.hidden && document.querySelector('#forest-entry')`);
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: clearSeen.identifier });
    assert.equal(await evaluate('!!document.querySelector("#launch-game")'), false);
    assert.equal(await evaluate('globalThis.__playcanvasApps.size'), 1);
    assert.equal(await evaluate(`!!${app}.root.findByName('foundation-scene')`), false);
    assert.equal(
        await evaluate(`${app}.assets.list().filter(a=>a.type==='container'&&a.name.startsWith('character-')).length`),
        2
    );
    assert.equal(
        await evaluate(`${app}.assets.list().filter(a=>a.type==='container'&&a.name.startsWith('vehicle-')).length`),
        0
    );
    record('Forest opens automatically in one Engine; city/beach assets are deferred');
    await wait(`document.querySelector('#forest-entry').dataset.audio !== 'loading'`);
    await shot('00-starting-screen');
    if (await evaluate(`document.querySelector('#forest-entry').dataset.audio==='playing'`)) {
        await click('[data-forest-sound]');
        await click('[data-forest-sound]');
    } else await click('[data-forest-sound]');
    await wait(`document.querySelector('#forest-entry').dataset.audio==='playing'`);
    await evaluate(
        `document.querySelector('#forest-ambient-track').muted=true;document.querySelector('#forest-dialogue-track').currentTime=4.2;true`
    );
    await wait(
        `document.querySelector('#forest-dialogue-track').currentTime>4.4 && document.querySelector('[data-forest-caption]').textContent.includes('Woman:')`
    );
    const outputEnergy = await evaluate(
        `(async()=>{const analyser=globalThis.__forestAnalysers?.[0];if(!analyser)return 0;const data=new Float32Array(analyser.fftSize);let peak=0;for(let i=0;i<8;i++){await new Promise(r=>requestAnimationFrame(r));analyser.getFloatTimeDomainData(data);peak=Math.max(peak,Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length));}return peak;})()`
    );
    assert.ok(outputEnergy > 0.015, 'Real dialogue output is silent: ' + outputEnergy);
    assert.equal(await evaluate(`document.querySelector('#forest-dialogue-track').muted`), false);
    record('Bundled female speech decodes, advances with captions and produces nonzero audio output');
    await evaluate(`document.querySelector('#forest-dialogue-track').currentTime=7.3;true`);
    await wait(`document.querySelector('[data-forest-caption]').textContent.includes('Man:')`);
    record('Male speech uses the same synchronized media clock');
    await evaluate(`document.querySelector('#forest-dialogue-track').currentTime=24.01;true`);
    await wait(`document.querySelector('#forest-dialogue-track').currentTime>24.08`);
    const impact = await evaluate(
        `(async()=>{const a=globalThis.__forestAnalysers[0],d=new Float32Array(a.fftSize);let peak=0;for(let i=0;i<12;i++){await new Promise(r=>requestAnimationFrame(r));a.getFloatTimeDomainData(d);peak=Math.max(peak,Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length));}return peak;})()`
    );
    assert.ok(impact > 0.025, 'Scare soundtrack is silent: ' + impact);
    record('The bat burst produces a synchronized nonzero scare impact');
    await evaluate(`document.querySelector('#forest-ambient-track').muted=false;true`);
    await evaluate(
        `Object.defineProperty(document,'hasFocus',{value:()=>false,configurable:true});window.dispatchEvent(new Event('blur'));true`
    );
    assert.equal(await evaluate(`document.querySelector('#forest-dialogue-track').paused`), true);
    const pausedTime = await evaluate(`document.querySelector('#forest-dialogue-track').currentTime`);
    await evaluate('new Promise(resolve=>setTimeout(resolve,180))');
    assert.ok(
        Math.abs((await evaluate(`document.querySelector('#forest-dialogue-track').currentTime`)) - pausedTime) < 0.03
    );
    await evaluate(`delete document.hasFocus;window.dispatchEvent(new Event('focus'));true`);
    await wait(`!document.querySelector('#forest-dialogue-track').paused`);
    record('Focus recovery resumes the previously enabled soundtrack');
    await click('[data-forest-sound]');
    assert.equal(await evaluate(`document.querySelector('#forest-dialogue-track').paused`), true);
    await click('[data-forest-skip]');
    await click('[data-forest-skip-once]');
    assert.equal(await evaluate("localStorage.getItem('last-wave.intro-skip.v1')"), null);
    await click('[data-forest-replay]');
    await evaluate(`${app}.timeScale=0;true`);
    await shot('01-dark-opening');
    record('Muted replay returns to the dark opening');
    await advance(3);
    await shot('02-flashlight');
    await advance(3);
    await shot('03-walking');
    const motion = await evaluate(
        `(async()=>{const a=${app}; const hand=a.root.findByName('forest-unidentified-man').findByName('calf_l'); const before=hand.getLocalRotation().toArray(); a.timeScale=1; await new Promise(r=>setTimeout(r,220)); a.timeScale=0; return {before,after:hand.getLocalRotation().toArray()};})()`
    );
    assert.notDeepEqual(motion.before, motion.after);
    record('Walking rig joints move across rendered frames');
    const hand = await evaluate(
        `(()=>{const r=${app}.root;const p=r.findByName('forest-phone');return {parent:p.parent.name,light:r.findByName('forest-phone-flashlight').parent.name};})()`
    );
    assert.deepEqual(hand, { parent: 'hand_l', light: 'hand_l' });
    record('Phone and spotlight follow the actual rig hand');
    await advance(15.3);
    await shot('04-eyes');
    await advance(3.1);
    await shot('05-bats');
    await advance(1.4);
    await shot('05b-near-bats');

    const red = await evaluate(
        `(()=>{const a=${app},eyes=a.root.findByName('forest-flying-eyes-0'),m=eyes.children[0].render.meshInstances[0].material;return {visible:eyes.enabled,color:m.emissive.toArray(),position:eyes.getPosition().toArray()};})()`
    );
    assert.equal(red.visible, true);
    assert.ok(red.color[0] > 2 && red.color[1] < 0.02 && red.color[2] < 0.02);
    assert.ok(red.position[2] > 0, 'Flying eyes did not reach the figures');
    record('Red emissive eye pairs remain visible on the flock flying toward and past the figures');
    await evaluate(`document.querySelector('#forest-dialogue-track').currentTime=25.9;true`);
    await click('[data-forest-sound]');
    await wait(`document.querySelector('[data-forest-caption]').textContent.includes("They're just bats!")`);
    assert.equal(await evaluate(`/jesus/i.test(document.querySelector('[data-forest-caption]').textContent)`), false);
    record('Regenerated spoken line has the synchronized caption: They are just bats, without the removed word');
    assert.equal(issues.length, 0, JSON.stringify(issues));
} catch (error) {
    failure = error;
    console.error(error);
    try {
        await shot('failure');
    } catch {
        console.error('Failure capture unavailable');
    }
} finally {
    await writeFile(
        new URL('report.json', output),
        JSON.stringify({ url, results, issues, failure: failure?.stack, at: new Date().toISOString() }, null, 2)
    );
    try {
        await send('Browser.close');
    } catch {
        /* Browser can close before acknowledging. */
    }
    socket.close();
}
if (failure) process.exitCode = 1;
