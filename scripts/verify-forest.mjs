import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import { BEACH_PASSES, ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5180/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/forest/', import.meta.url);
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
let faultInjectionStart = null;
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
        source: `localStorage.removeItem('last-wave.forest-seen.v2');sessionStorage.setItem('forest-checkpoint-before',localStorage.getItem('last-wave.checkpoint')??'');`
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
    } else await click('[data-forest-play-sound]');
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
        `(()=>{const a=globalThis.__forestAnalysers[0],d=new Float32Array(a.fftSize);a.getFloatTimeDomainData(d);return Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length);})()`
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
    await advance(10);
    await shot('06-exit');
    await advance(5.5);
    await shot('07-board-descending');
    await advance(5);
    await shot('08-final');
    assert.equal(await evaluate('document.querySelector("#forest-entry").dataset.phase'), 'ready');
    assert.equal(await evaluate('document.activeElement.id'), 'forest-username');
    assert.equal(
        await evaluate(`localStorage.getItem('last-wave.checkpoint')??''`),
        await evaluate(`sessionStorage.getItem('forest-checkpoint-before')`)
    );
    record('Full timeline, captions, final form focus and untouched checkpoint');
    await evaluate(
        `document.querySelector('#forest-username').value='wanderer';document.querySelector('#forest-password').value='not-a-real-password';true`
    );
    await click('[data-forest-password]');
    assert.equal(await evaluate('document.querySelector("#forest-password").type'), 'text');
    await click('.forest-enter');
    assert.match(await evaluate('document.querySelector("[data-forest-feedback]").textContent'), /not connected/);
    assert.ok(await evaluate('!!document.querySelector("#forest-entry")'));
    await click('[data-forest-account]');
    assert.match(await evaluate('document.querySelector("[data-forest-feedback]").textContent'), /Account creation/);
    record('Password toggle and honest account boundary; no simulated authentication');
    await evaluate(`${app}.timeScale=1;true`);
    await click('[data-forest-sound]');
    await wait(`document.querySelector('[data-forest-sound]').getAttribute('aria-pressed')==='true'`);
    await click('[data-forest-sound]');
    await evaluate(`${app}.timeScale=0;true`);
    record('Explicit sound activation and mute work in a muted browser');
    await click('[data-forest-replay]');
    assert.equal(await evaluate('document.querySelector("#forest-entry").dataset.phase'), 'darkness');
    await advance(24.5);
    await click('[data-forest-skip]');
    await advance(0);
    assert.equal(await evaluate(`!!${app}.root.findByName('forest-bat-flock').enabled`), false);
    assert.equal(await evaluate(`!!${app}.root.findByName('forest-unidentified-man').enabled`), false);
    await shot('09-skipped');
    record('Replay then mid-scare skip settles actors, flock, camera and form');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await shot('10-mobile');
    assert.equal(await evaluate('document.querySelector("#forest-entry").scrollWidth<=innerWidth'), true);
    await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 1, mobile: true });
    await evaluate('document.querySelector("[data-forest-local]").scrollIntoView({block:"center"})');
    await shot('11-landscape');
    assert.equal(
        await evaluate('document.querySelector("[data-forest-local]").getBoundingClientRect().height>=44'),
        true
    );
    record('Portrait and short landscape are scrollable with touch-sized local entry');
    await evaluate(`${app}.timeScale=1;true`);
    await click('[data-forest-local]');
    await wait(`!!${app}.root.findByName('foundation-scene')`);
    await evaluate('new Promise(resolve=>setTimeout(resolve,300))');
    assert.equal(await evaluate('!!document.querySelector("#forest-entry")'), false);
    assert.equal(await evaluate(`!!${app}.root.findByName('forest-entrance')`), false);
    assert.equal(
        await evaluate(`${app}.assets.list().filter(a=>a.type==='container'&&a.name.startsWith('forest-')).length`),
        0
    );
    assert.equal(await evaluate(`!!document.querySelector('[data-story]')`), true);
    assert.equal(await evaluate(`${app}.assets.list().filter(a=>a.type==='container').length`), 42);
    await shot('12-cafe-handoff');
    record('Local entry constructs cafe; forest entities, UI and containers released');
    const progress = (definition, count = definition.objectives.length) => ({
        questId: definition.id,
        completedObjectiveIds: definition.objectives.slice(0, count).map((o) => o.id)
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    const doorFixture = {
        version: 5,
        savedAt: 1794301200000,
        state: {
            sceneId: 'foundation',
            area: 'tideline',
            playerPosition: [8.1, 1.04, 4.8],
            quest: progress(SIGNAL_CHECK_QUEST, 0),
            opening: progress(OPENING_QUEST, 2),
            entry: progress(ENTRY_QUEST, 2),
            beach: progress(BEACH_QUEST, 0),
            inventory: { itemIds: [STARTER_BAG.id] },
            wave: 'before-wave'
        }
    };
    await evaluate(`localStorage.setItem('last-wave.checkpoint',${JSON.stringify(JSON.stringify(doorFixture))});true`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
    await click('[data-load]');
    await wait(`document.querySelector('[data-checkpoint-feedback]').textContent.includes('loaded')`);
    await click('[data-checkpoint-close]');
    await wait(`document.querySelector('#street-instructions').open`);
    await click('[data-lesson-practise]');
    await wait(`!document.querySelector('[data-interact]').hidden`);
    await click('[data-interact]');
    await wait(`document.querySelector('[data-dialogue-choice]')`);
    await click('[data-dialogue-choice]');
    await evaluate(`document.querySelector('#application-canvas').focus();true`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 1080, y: 540, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1080, y: 540, button: 'left', clickCount: 1 });
    await wait(`document.pointerLockElement===document.querySelector('#application-canvas')`);
    await evaluate(`${app}.root.findByName('player').script.get('thirdPersonController')._yaw=180;true`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
    await wait(`${app}.root.findByName('player').getPosition().z>7.1`);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
    const doorway = await evaluate(
        `(()=>{const r=${app}.root;return {player:r.findByName('player').getPosition().toArray(),friend:r.findByName('cafe-friend').getPosition().toArray(),enabled:r.findByName('player').script.get('thirdPersonController').enabled};})()`
    );
    assert.ok(doorway.player[2] > 6.5, 'Player remains stuck at the café door: ' + JSON.stringify(doorway));
    assert.ok(doorway.friend[0] > 9.3, 'Friend did not clear the doorway: ' + JSON.stringify(doorway));
    await shot('17-cafe-door-clear');
    record('Head outside hands off to real keyboard walking through the clear café doorway');
    for (const area of ['tideline', 'beach-arrival']) {
        const beach = area === 'beach-arrival';
        const fixture = {
            version: 5,
            savedAt: 1794301200000,
            state: {
                sceneId: 'foundation',
                area,
                playerPosition: beach ? [0, 1.08, 3.6] : [70.5, 1.04, 6.4],
                quest: progress(SIGNAL_CHECK_QUEST, 0),
                opening: progress(OPENING_QUEST),
                entry: progress(ENTRY_QUEST, beach ? 8 : 3),
                beach: progress(BEACH_QUEST, beach ? 3 : 0),
                inventory: { itemIds: [STARTER_BAG.id, ...(beach ? [BEACH_PASSES.id] : [])] },
                wave: 'before-wave'
            }
        };
        await evaluate(`localStorage.setItem('last-wave.checkpoint',${JSON.stringify(JSON.stringify(fixture))});true`);
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
        await click('[data-load]');
        await wait(`document.querySelector('[data-checkpoint-feedback]').textContent.includes('loaded')`);
        await click('[data-checkpoint-close]');
        await evaluate('new Promise(resolve=>setTimeout(resolve,300))');
        assert.equal(await evaluate(`!!${app}.root.findByName('beach-arrival')`), beach);
        await shot(beach ? '16-beach-checkpoint' : '15-street-checkpoint');
        record(`Existing ${area} checkpoint loads after forest entry`);
    }
    await evaluate(
        `(()=>{const value=sessionStorage.getItem('forest-checkpoint-before');if(value)localStorage.setItem('last-wave.checkpoint',value);else localStorage.removeItem('last-wave.checkpoint');return true;})()`
    );
    assert.equal(issues.length, 0, JSON.stringify(issues));
    record('No unexpected console, shader or network issues through cafe/street/beach entry');
    await evaluate(`${app}.destroy();true`);
    assert.equal(await evaluate('globalThis.__playcanvasApps.size'), 0);
    record('Application teardown unregisters Engine');
    await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 1,
        mobile: false
    });
    await send('Page.navigate', { url });
    await wait(`document.querySelector('#startup-status')?.hidden`);
    assert.equal(await evaluate('document.querySelector("#forest-entry").dataset.phase'), 'ready');
    record('Returning visit bypasses cinematic');
    await evaluate(`${app}.destroy();localStorage.removeItem('last-wave.forest-seen.v2');true`);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await send('Page.navigate', { url });
    await wait(`document.querySelector('#startup-status')?.hidden`);
    assert.equal(await evaluate('document.querySelector("#forest-entry").dataset.phase'), 'ready');
    assert.equal(await evaluate('document.querySelector("[data-forest-replay]").hidden'), true);
    await shot('13-reduced-motion');
    record('Reduced motion goes directly to static final form');
    assert.equal(issues.length, 0, JSON.stringify(issues));
    await evaluate(`${app}.destroy();true`);
    faultInjectionStart = issues.length;
    await send('Network.setBlockedURLs', { urls: ['*assets/forest/*.glb'] });
    await send('Page.navigate', { url });
    await wait(`document.querySelector('#startup-status')?.hidden`);
    assert.equal(await evaluate('document.querySelector("#forest-entry").classList.contains("forest-fallback")'), true);
    await shot('14-fallback');
    await click('[data-forest-local]');
    await wait(`!!${app}.root.findByName('foundation-scene')`);
    record('Failed scenery loading retains a working local entry');
} catch (error) {
    failure = error;
    console.error(error);
    await shot('failure');
    console.error(
        await evaluate(
            '({ready:document.readyState,text:document.body.innerText,apps:globalThis.__playcanvasApps?.size})'
        )
    );
} finally {
    await writeFile(
        new URL('report.json', output),
        JSON.stringify(
            {
                url,
                results,
                issues: faultInjectionStart === null ? issues : issues.slice(0, faultInjectionStart),
                injectedFailureIssues: faultInjectionStart === null ? [] : issues.slice(faultInjectionStart),
                failure: failure?.stack,
                at: new Date().toISOString()
            },
            null,
            2
        )
    );
    try {
        await send('Browser.close');
    } catch {
        /* Chrome can close before acknowledging. */
    }
    socket.close();
}
if (failure) process.exitCode = 1;
