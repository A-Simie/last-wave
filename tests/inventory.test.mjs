import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SIGNAL_BOX_NOTE } from '../src/data/items.ts';
import { InventorySystem } from '../src/systems/InventorySystem.ts';

test('inventory starts empty and unknown IDs cannot create items or publish changes', () => {
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
    let notifications = 0;
    inventory.onStateChange = () => notifications++;

    assert.deepEqual(inventory.state.items, []);
    assert.equal(inventory.acquire('unknown'), false);
    assert.equal(inventory.acquire(''), false);
    assert.equal(notifications, 0);
    assert.deepEqual(new InventorySystem([]).state.items, []);
});

test('a clue is acquired exactly once and publishes its authored readable details', () => {
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
    const states = [];
    inventory.onStateChange = (state) => states.push(state);

    assert.equal(inventory.acquire(SIGNAL_BOX_NOTE.id), true);
    assert.deepEqual(inventory.state.items, [SIGNAL_BOX_NOTE]);
    assert.equal(inventory.acquire(SIGNAL_BOX_NOTE.id), false);
    assert.equal(states.length, 1);
    assert.match(states[0].items[0].description, /return to the guide/);
    assert.equal(states[0].items[0].source, 'Amber signal box');
});

test('stable IDs distinguish items with the same title and retain acquisition order', () => {
    const other = { ...SIGNAL_BOX_NOTE, id: 'another-note', description: 'Another clue.' };
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE, other]);

    inventory.acquire(other.id);
    inventory.acquire(SIGNAL_BOX_NOTE.id);
    inventory.acquire(other.id);
    assert.deepEqual(inventory.state.items, [other, SIGNAL_BOX_NOTE]);
});

test('catalog inputs and published snapshots cannot mutate stored clues or other instances', () => {
    const definition = { ...SIGNAL_BOX_NOTE };
    const inventory = new InventorySystem([definition]);
    const other = new InventorySystem([definition]);
    definition.title = 'Changed after construction';
    inventory.acquire(SIGNAL_BOX_NOTE.id);
    const snapshot = inventory.state;
    snapshot.items[0].description = 'Changed by a consumer';
    snapshot.items.push({ ...SIGNAL_BOX_NOTE, id: 'fake' });

    assert.deepEqual(inventory.state.items, [SIGNAL_BOX_NOTE]);
    assert.deepEqual(other.state.items, []);
    other.acquire(SIGNAL_BOX_NOTE.id);
    assert.deepEqual(other.state.items, [SIGNAL_BOX_NOTE]);
});

test('reset publishes only changed state and permits one fresh acquisition', () => {
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
    const counts = [];
    inventory.onStateChange = (state) => counts.push(state.items.length);

    inventory.reset();
    inventory.acquire(SIGNAL_BOX_NOTE.id);
    inventory.reset();
    inventory.reset();
    assert.deepEqual(inventory.state.items, []);
    assert.equal(inventory.acquire(SIGNAL_BOX_NOTE.id), true);
    assert.equal(inventory.acquire(SIGNAL_BOX_NOTE.id), false);
    assert.deepEqual(counts, [1, 0, 1]);
});

test('destroy releases inventory and subscribers and rejects retained acquisition callbacks', () => {
    const inventory = new InventorySystem([SIGNAL_BOX_NOTE]);
    inventory.acquire(SIGNAL_BOX_NOTE.id);
    let notifications = 0;
    inventory.onStateChange = () => notifications++;
    const delayedPickup = () => inventory.acquire(SIGNAL_BOX_NOTE.id);

    inventory.destroy();
    assert.equal(inventory.onStateChange, null);
    assert.deepEqual(inventory.state.items, []);
    assert.equal(delayedPickup(), false);
    inventory.reset();
    inventory.destroy();
    assert.equal(notifications, 0);
});

test('blank and duplicate catalog IDs are rejected before an inventory can be used', () => {
    assert.throws(() => new InventorySystem([{ ...SIGNAL_BOX_NOTE, id: ' ' }]), /non-empty ID/);
    assert.throws(() => new InventorySystem([SIGNAL_BOX_NOTE, { ...SIGNAL_BOX_NOTE }]), /Duplicate inventory item/);
});
