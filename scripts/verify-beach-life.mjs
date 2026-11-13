import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5188/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/beach-life/', import.meta.url);
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
        }, 240000);
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
        `new Promise((resolve,reject)=>{const start=performance.now();const step=()=>{if(${condition})return resolve(true);if(performance.now()-start>180000)return reject(new Error('Condition timed out'));setTimeout(step,40);};step();})`
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
        source: "localStorage.setItem('last-wave.intro-skip.v1','always');"
    });
    await send('Page.navigate', { url });
    await wait(`document.querySelector('#startup-status')?.hidden`);
    await click('[data-forest-local]');
    await wait(`!!${app}.root.findByName('foundation-scene')`);
    record('Immediate local entry completes with activity assets preloaded');
    const progress = (quest, count = quest.objectives.length) => ({
        questId: quest.id,
        completedObjectiveIds: quest.objectives.slice(0, count).map((o) => o.id)
    });
    const fixture = {
        version: 5,
        savedAt: 1794470400000,
        state: {
            sceneId: 'foundation',
            area: 'beach-arrival',
            playerPosition: [0, 1.08, 3.6],
            quest: progress(SIGNAL_CHECK_QUEST, 0),
            opening: progress(OPENING_QUEST),
            entry: progress(ENTRY_QUEST),
            beach: progress(BEACH_QUEST, 0),
            inventory: { itemIds: [STARTER_BAG.id, BEACH_PASSES.id] },
            wave: 'before-wave'
        }
    };
    const key = async (key, code, value, type) =>
        send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: value });
    const load = async () => {
        await evaluate(`localStorage.setItem('last-wave.checkpoint',${JSON.stringify(JSON.stringify(fixture))});true`);
        await key('p', 'KeyP', 80, 'keyDown');
        await key('p', 'KeyP', 80, 'keyUp');
        await click('[data-load]');
        await wait(`document.querySelector('[data-checkpoint-feedback]').textContent.includes('loaded')`);
        await evaluate(`${app}.timeScale=0;true`);
        await click('[data-checkpoint-close]');
    };
    await load();
    const activity = `${app}.root.findByName('beach-activities').script.get('beachActivities')`;
    const wave = `${app}.root.findByName('beach-wave').script.get('beachWave')`;
    const movement = await evaluate(
        `(()=>{const a=${app},act=${activity},rows=[];for(let frame=0;frame<80;frame++){act.water.update(.1);act.update(.1);a.systems.fire('animationUpdate',.1);if(frame%10===0)rows.push(act.actors.map(p=>({kind:p.kind,position:p.root.getPosition().toArray(),speed:p.speed,leg:p.horse?p.root.findByName('FrontLeg.L').getLocalRotation().toArray():null,wheel:p.wheels[0]?.getLocalRotation().toArray(),rider:p.rider.anim.baseLayer.activeState})));}return rows;})()`
    );
    assert.equal(movement[0].length, 6);
    assert.notDeepEqual(movement[0][0].position, movement.at(-1)[0].position);
    assert.notDeepEqual(movement[0][0].leg, movement.at(-1)[0].leg);
    assert.notDeepEqual(movement[0][1].wheel, movement.at(-1)[1].wheel);
    assert.notEqual(movement[0][4].position[1], movement.at(-1)[4].position[1]);
    await writeFile(new URL('activity-motion.json', output), JSON.stringify(movement, null, 2));
    record(
        'Two horses, two quad bikes and two boats move; horse joints, wheels and water-following boat heights change'
    );
    const paused = await evaluate(
        `(()=>{const act=${activity};act.paused=true;const before=act.actors.map(p=>p.root.getPosition().toArray());act.update(1);const after=act.actors.map(p=>p.root.getPosition().toArray());act.paused=false;return {before,after};})()`
    );
    assert.deepEqual(paused.before, paused.after);
    record('Activity pause preserves positions');
    const performance = await evaluate(
        `new Promise(resolve=>{const a=${app},samples=[];let previous=performance.now();const tick=()=>{const now=performance.now();samples.push(now-previous);previous=now;if(samples.length<60)requestAnimationFrame(tick);else resolve({frames:samples.length,meanMs:samples.reduce((sum,n)=>sum+n,0)/samples.length,maxMs:Math.max(...samples),drawCalls:a.stats.drawCalls.total});};requestAnimationFrame(tick);})`
    );
    await writeFile(new URL('performance.json', output), JSON.stringify(performance, null, 2));
    await evaluate(
        `(()=>{const a=${app};a.root.findByName('player').script.get('thirdPersonController').enabled=false;document.querySelector('.hud').hidden=true;return true;})()`
    );
    for (const kind of ['horse', 'quad', 'boat'])
        for (const side of [1, -1]) {
            await evaluate(
                `(()=>{const a=${app},actor=${activity}.actors.find(p=>p.kind==='${kind}'),p=actor.root.getPosition(),c=a.root.findByName('camera');c.setPosition(p.x+${side}*4.5,p.y+2.2,p.z+4.6);c.lookAt(p.x,p.y+1.2,p.z);return true;})()`
            );
            await shot(`${kind}-${side}`);
        }
    await evaluate(
        `(()=>{const a=${app},c=a.root.findByName('camera');c.setPosition(8,3.4,-24);c.lookAt(0,.1,-50);return true;})()`
    );
    await shot('rolling-surf');
    const sea = await evaluate(
        `(()=>{const w=${activity}.water;const before=w.heightAt(20,-40);for(let i=0;i<45;i++)w.update(.1);return {before,after:w.heightAt(20,-40)};})()`
    );
    assert.ok(Math.abs(sea.before - sea.after) > 0.02);
    record('Rendered sea advances through rolling surf and slow tide');
    fixture.state.beach = progress(BEACH_QUEST);
    await load();
    await evaluate(`document.querySelector('#application-canvas').focus();true`);
    await click('#application-canvas');
    await wait(`document.pointerLockElement===document.querySelector('#application-canvas')`);
    assert.equal(await evaluate(`document.querySelector('[data-story]').hidden`), true);
    await evaluate(`(()=>{const a=${app};for(let i=0;i<29;i++)a.fire('update',.1);return true;})()`);
    assert.equal(await evaluate(`${wave}.progress.state.phase`), 'calm');
    await evaluate(`${app}.fire('update',.1);true`);
    assert.equal(await evaluate(`${wave}.progress.state.phase`), 'warning');
    assert.equal(await evaluate(`document.querySelector('[data-cutscene-next]').hidden`), true);
    assert.equal(await evaluate(`document.querySelector('[data-cutscene-skip]').hidden`), true);
    assert.equal(await evaluate(`document.querySelector('#story-opening').matches(':modal')`), false);
    const beat = await evaluate(`document.querySelector('#story-opening').dataset.beat`);
    await evaluate(
        `document.querySelector('[data-cutscene-next]').click();document.querySelector('[data-cutscene-skip]').click();true`
    );
    assert.equal(await evaluate(`document.querySelector('#story-opening').dataset.beat`), beat);
    await shot('automatic-warning');
    record('Warning starts at three seconds, has no manual controls and cannot be clicked forward');
    const beats = await evaluate(
        `(()=>{const a=${app},w=${wave},seen=[];for(let i=0;i<650&&w.progress.state.phase==='warning';i++){const id=document.querySelector('#story-opening').dataset.beat;if(seen.at(-1)!==id)seen.push(id);w.update(.1);a.fire('update',.1);}return seen;})()`
    );
    assert.deepEqual(beats, ['retreat', 'birds', 'crowd', 'wave']);
    assert.equal(await evaluate(`${wave}.progress.state.phase`), 'evacuating');
    assert.equal(await evaluate(`${app}.root.findByName('player').script.get('thirdPersonController').enabled`), true);
    assert.equal(await evaluate(`document.pointerLockElement===document.querySelector('#application-canvas')`), true);
    await evaluate(
        `${app}.root.findByName('player').script.get('thirdPersonController')._yaw=180;${app}.timeScale=1;true`
    );
    const initialZ = await evaluate(`${app}.root.findByName('player').getPosition().z`);
    await key('w', 'KeyW', 87, 'keyDown');
    try {
        await wait(`${app}.root.findByName('player').getPosition().z>${initialZ + 1}`);
    } finally {
        await key('w', 'KeyW', 87, 'keyUp');
    }
    record('All warning shots advance without clicks and player keyboard running works immediately afterward');
    await evaluate(`${app}.timeScale=0;true`);
    await evaluate(
        `(()=>{const a=${app},w=${wave};for(const p of [[0,1.04,0],[0,1.16,12.5],[0,4.04,24]]){w.player.rigidbody.teleport(...p);w.update(.1);a.fire('update',.1);}return true;})()`
    );
    assert.equal(await evaluate(`document.querySelector('[data-cutscene-next]').hidden`), true);
    await evaluate(
        `(()=>{const a=${app},w=${wave};for(let i=0;i<120;i++){w.update(.1);a.fire('update',.1);}return true;})()`
    );
    assert.equal(await evaluate(`${wave}.progress.state.phase`), 'complete');
    await shot('automatic-blackout');
    record('Fall and blackout also finish automatically; ending recovery remains available');
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
