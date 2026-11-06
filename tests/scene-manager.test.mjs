import assert from 'node:assert/strict';
import { test } from 'node:test';

import { Entity } from 'playcanvas';

import { SceneManager } from '../src/core/SceneManager.ts';

const setup = () => {
    const app = { systems: {}, _entityIndex: {} };
    app.root = new Entity('application', app);
    // AppBase enables its root this way; no renderer or physics is needed for hierarchy tests.
    app.root._enabledInHierarchy = true;
    return { app, scenes: new SceneManager(app) };
};

test('a scene is built disabled, activated on success, and returned without changing unrelated roots', () => {
    const { app, scenes } = setup();
    const unrelated = new Entity('application-service', app);
    app.root.addChild(unrelated);
    let root;
    const result = scenes.load('foundation-scene', (candidate) => {
        root = candidate;
        assert.equal(root.parent, app.root);
        assert.equal(root.enabled, false);
        return { ready: true };
    });
    assert.deepEqual(result, { ready: true });
    assert.equal(root.enabled, true);
    scenes.destroy();
    assert.deepEqual(app.root.children, [unrelated]);
});

test('replacement retains the current scene until construction succeeds and then destroys it once', () => {
    const { app, scenes } = setup();
    const old = scenes.load('foundation-scene', (root) => root);
    let destroyed = 0;
    old.once('destroy', () => destroyed++);
    const next = scenes.load('foundation-scene', (root) => {
        assert.equal(old.enabled, true);
        assert.equal(old.parent, app.root);
        assert.equal(root.enabled, false);
        assert.equal(destroyed, 0);
        return root;
    });
    assert.deepEqual(app.root.children, [next]);
    assert.equal(next.enabled, true);
    assert.equal(old.parent, null);
    assert.equal(destroyed, 1);
    scenes.destroy();
    scenes.destroy();
    assert.equal(app.root.children.length, 0);
    assert.equal(destroyed, 1);
});

test('failed scene construction disposes partial entities and resources while preserving the current scene', () => {
    const { app, scenes } = setup();
    const old = scenes.load('foundation-scene', (root) => root);
    let rootCleanup = 0;
    let childCleanup = 0;
    assert.throws(
        () =>
            scenes.load('foundation-scene', (root) => {
                root.once('destroy', () => rootCleanup++);
                const child = new Entity('partial-player', app);
                child.once('destroy', () => childCleanup++);
                root.addChild(child);
                throw new Error('asset construction failed');
            }),
        /asset construction failed/
    );

    assert.deepEqual(app.root.children, [old]);
    assert.equal(old.enabled, true);
    assert.equal(rootCleanup, 1);
    assert.equal(childCleanup, 1);
    const next = scenes.load('foundation-scene', (root) => root);
    assert.deepEqual(app.root.children, [next]);
    scenes.destroy();
});

test('a failed replacement preserves an already-disabled scene', () => {
    const { app, scenes } = setup();
    const old = scenes.load('foundation-scene', (root) => root);
    old.enabled = false;
    assert.throws(
        () =>
            scenes.load('foundation-scene', () => {
                throw new Error('failed');
            }),
        /failed/
    );
    assert.equal(old.enabled, false);
    assert.deepEqual(app.root.children, [old]);
    scenes.destroy();
});

test('nested transitions are rejected and do not displace the scene being constructed', () => {
    const { app, scenes } = setup();
    const current = scenes.load('foundation-scene', (root) => {
        assert.throws(() => scenes.load('nested', () => assert.fail('Nested builder ran.')), /already in progress/);
        return root;
    });
    assert.deepEqual(app.root.children, [current]);
    assert.equal(current.enabled, true);
    scenes.destroy();
    assert.throws(() => scenes.load('late', () => assert.fail('Destroyed manager ran a builder.')), /destroyed/);
});

test('failed initial construction leaves no scene and permits a later retry', () => {
    const { app, scenes } = setup();
    assert.throws(
        () =>
            scenes.load('foundation-scene', () => {
                throw new Error('startup failed');
            }),
        /startup failed/
    );
    assert.equal(app.root.children.length, 0);
    scenes.load('foundation-scene', (root) => root);
    assert.equal(app.root.children.length, 1);
    scenes.destroy();
});

test('destruction during construction cleans both roots and permanently prevents reactivation', () => {
    const { app, scenes } = setup();
    scenes.load('foundation-scene', (root) => root);
    let partialCleanup = 0;
    assert.throws(
        () =>
            scenes.load('foundation-scene', (root) => {
                root.once('destroy', () => partialCleanup++);
                scenes.destroy();
                return root;
            }),
        /destroyed during a transition/
    );
    assert.equal(app.root.children.length, 0);
    assert.equal(partialCleanup, 1);
    assert.throws(() => scenes.load('late', () => assert.fail('Destroyed manager ran a builder.')), /destroyed/);
});
