import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { SIGNAL_CHECK_QUEST } from '../src/data/quests.ts';
import { BEACH_QUEST } from '../src/episodes/episode-01/beach.ts';
import { ENTRY_QUEST } from '../src/episodes/episode-01/entry.ts';
import { OPENING_QUEST, STARTER_BAG } from '../src/episodes/episode-01/opening.ts';
import { RESTAURANTS } from '../src/episodes/episode-01/restaurantLayout.ts';

const url = process.env.GAME_URL ?? 'http://127.0.0.1:5183/';
const port = process.env.CDP_PORT ?? '9223';
const output = new URL('../verification.local/neighborhood/', import.meta.url);
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
    await wait(`!${app}.assets.list().some(asset=>asset.loading)`);
    const halloween = await evaluate(
        `(()=>{const r=${app}.root;return {pumpkins:['pumpkin','tallPumpkin','leanPumpkin','plainPumpkin'].reduce((n,id)=>n+r.findByTag('forest-model-'+id).length,0),skeletons:r.findByTag('forest-model-skeletonA').length+r.findByTag('forest-model-skeletonB').length,webs:r.findByName('forest-login-dressing').findByTag('forest-model-cobwebs').length};})()`
    );
    assert.ok(halloween.pumpkins >= 30);
    assert.equal(halloween.skeletons, 4);
    assert.ok(halloween.webs >= 7);
    await shot('00-halloween-entrance');
    record(
        `Forest dressing: ${halloween.pumpkins} pumpkins, ${halloween.skeletons} skeletons, ${halloween.webs} imported webs`
    );
    await click('[data-forest-local]');
    await wait(`!!${app}.root.findByName('foundation-scene')`);
    const progress = (quest, count = quest.objectives.length) => ({
        questId: quest.id,
        completedObjectiveIds: quest.objectives.slice(0, count).map((o) => o.id)
    });
    const fixture = {
        version: 5,
        savedAt: 1794470400000,
        state: {
            sceneId: 'foundation',
            area: 'tideline',
            playerPosition: [70.5, 1.04, 6.4],
            quest: progress(SIGNAL_CHECK_QUEST, 0),
            opening: progress(OPENING_QUEST),
            entry: progress(ENTRY_QUEST, 4),
            beach: progress(BEACH_QUEST, 0),
            inventory: { itemIds: [STARTER_BAG.id] },
            wave: 'before-wave'
        }
    };
    await evaluate(`localStorage.setItem('last-wave.checkpoint',${JSON.stringify(JSON.stringify(fixture))});true`);
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'p', code: 'KeyP', windowsVirtualKeyCode: 80 });
    await click('[data-load]');
    await wait(`document.querySelector('[data-checkpoint-feedback]').textContent.includes('loaded')`);
    await click('[data-checkpoint-close]');
    const setup =
        await evaluate(`(()=>{const a=${app},r=a.root,l=r.findByName('seafront-life').script.get('streetLife');a.timeScale=0;l.paused=true;r.findByName('player').script.get('thirdPersonController').enabled=false;document.querySelector('.hud').hidden=true;r.findByName('character').enabled=false;r.findByName('cafe-friend').enabled=false;
    const props=l.carried.filter(p=>p.root.name.includes('umbrella')).slice(0,4);l.walkers.forEach(w=>w.character.root.enabled=false);l.cars.forEach(c=>c.root.enabled=false);l.carried.forEach(p=>p.root.enabled=false);
    props.forEach((p,i)=>{p.walker.character.root.enabled=true;p.root.enabled=true;p.walker.character.root.setPosition(i*2.4,0.048,7.25);p.walker.character.root.setEulerAngles(0,0,0);p.walker.heading=0;p.walker.character.anim.playing=true;p.walker.character.play('walk',0);});
    globalThis.__umbrellaProps=props;a.systems.fire('animationUpdate',.1);l.postUpdate();const c=r.findByName('camera');c.setPosition(3.3,2.4,14);c.lookAt(3.3,1.35,7.25);return props.map(p=>({name:p.root.name,model:p.walker.model,hand:p.hand.getPosition().toArray(),grip:p.grip?.getPosition().toArray(),head:p.walker.character.root.findByName('Head').getPosition().toArray(),layers:p.walker.character.anim.layers.map(l=>({name:l.name,state:l.activeState}))}));})()`);
    await writeFile(new URL('measurements.json', output), JSON.stringify(setup, null, 2));
    await shot('front');
    await evaluate(
        `(()=>{const a=${app},c=a.root.findByName('camera');c.setPosition(1.2,1.7,10.4);c.lookAt(0,1.3,7.25);return true;})()`
    );
    await shot('grip');
    record('Four carried umbrella designs rendered with a masked right-arm grip');
    const motion = await evaluate(
        `(()=>{const a=${app},l=a.root.findByName('seafront-life').script.get('streetLife'),props=globalThis.__umbrellaProps,rows=[];for(let i=0;i<18;i++){a.systems.fire('animationUpdate',.1);l.postUpdate();for(const p of props){const h=p.walker.character.root.findByName('Head').getPosition(),v=h.clone();let overhead=Infinity;for(const render of p.root.findComponents('render'))for(const mesh of render.meshInstances){const pts=[];mesh.mesh.getPositions(pts);for(let j=0;j<pts.length;j+=3){v.set(pts[j],pts[j+1],pts[j+2]);mesh.node.getWorldTransform().transformPoint(v,v);if(Math.hypot(v.x-h.x,v.z-h.z)<.25)overhead=Math.min(overhead,v.y);}}rows.push({name:p.root.name,gripError:p.root.getPosition().distance(p.grip.getPosition()),headClearance:overhead-h.y-.22,calf:p.walker.character.root.findByName('calf_l').getLocalRotation().toArray()});}}return rows;})()`
    );
    for (const row of motion) {
        assert.ok(row.gripError < 0.001, JSON.stringify(row));
        assert.ok(row.headClearance > 0.05, JSON.stringify(row));
    }
    assert.notDeepEqual(motion[0].calf, motion[motion.length - 4].calf);
    await writeFile(new URL('walking-clearance.json', output), JSON.stringify(motion, null, 2));
    record('Grip follows the fingers and canopy clears the head through 18 walking samples; leg joints move');
    await evaluate(
        `(()=>{const a=${app},r=a.root,l=r.findByName('seafront-life').script.get('streetLife');l.walkers.forEach(w=>w.character.root.enabled=false);l.carried.forEach(p=>p.root.enabled=false);r.findByName('seafront-life').script.enabled=false;r.findByName('character').enabled=true;r.findByName('player').script.get('thirdPersonController').enabled=true;a.timeScale=1;document.querySelector('#application-canvas').focus();return true;})()`
    );
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 1200, y: 800, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 1200, y: 800, button: 'left', clickCount: 1 });
    await wait(`document.pointerLockElement===document.querySelector('#application-canvas')`);
    for (const restaurant of RESTAURANTS) {
        const spawn = restaurant.world([0, 1.04, restaurant.depth / 2 + 1.8]);
        await evaluate(
            `(()=>{const a=${app},p=a.root.findByName('player'),c=p.script.get('thirdPersonController');p.rigidbody.teleport(...${JSON.stringify(spawn)});p.rigidbody.linearVelocity=p.getPosition().clone().set(0,0,0);c._yaw=${restaurant.block.yaw ?? 0};return true;})()`
        );
        const inside = restaurant.world([0, 1.04, restaurant.depth / 2 - 1.2]);
        const direction = restaurant.block.yaw === 180 ? 1 : -1;
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
        try {
            await wait(`(${app}.root.findByName('player').getPosition().z-${inside[2]})*${direction}>0`);
        } finally {
            await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87 });
        }
        await shot(`${restaurant.block.name}-inside`);
        const roomView = restaurant.world([1.65, 2.2, restaurant.depth / 2 - 1.1]);
        const roomTarget = restaurant.world([-0.8, 1.4, -restaurant.depth / 2 + 1]);
        await evaluate(
            `(()=>{const a=${app},r=a.root;r.findByName('player').script.get('thirdPersonController').enabled=false;const c=r.findByName('camera');c.setPosition(...${JSON.stringify(roomView)});c.lookAt(...${JSON.stringify(roomTarget)});return true;})()`
        );
        await shot(`${restaurant.block.name}-interior-review`);
        await evaluate(`${app}.root.findByName('player').script.get('thirdPersonController').enabled=true;true`);
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
        try {
            await wait(`(${app}.root.findByName('player').getPosition().z-${spawn[2]})*${direction}<0`);
        } finally {
            await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 's', code: 'KeyS', windowsVirtualKeyCode: 83 });
        }
        record(`Real keyboard entry and exit: ${restaurant.title}`);
    }
    await evaluate(
        `(()=>{const a=${app};a.timeScale=0;a.root.findByName('player').script.get('thirdPersonController').enabled=false;const c=a.root.findByName('camera');c.setPosition(12,3.2,11);c.lookAt(30,2,0);return true;})()`
    );
    await shot('houses-after-tideline');
    await evaluate(
        `(()=>{const c=${app}.root.findByName('camera');c.setPosition(32,22,48);c.lookAt(34,0,8);return true;})()`
    );
    await shot('neighborhood-route');
    for (const name of [
        'coast-pharmacy-modernHouse',
        'seabreeze-homes-americanHouse',
        'paper-and-post-lowPolyStreetHouse',
        'east-residences-smallHouse'
    ])
        assert.equal(await evaluate(`!!${app}.root.findByName(${JSON.stringify(name)})`), true, name);
    record('Supplied homes are visible beside Tideline and along the beach approach');
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
        JSON.stringify({ results, issues, failure: failure?.stack }, null, 2)
    );
    try {
        await send('Browser.close');
    } catch {
        // Chrome can exit before acknowledging closure.
    }
    socket.close();
}
if (failure) process.exitCode = 1;
