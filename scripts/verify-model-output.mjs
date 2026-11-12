import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.argv[2] ?? 'dist', 'assets/models');
const policy = process.argv[3] ?? 'full';
assert.ok(['full', 'commercial'].includes(policy), 'Expected full or commercial policy');
const manifest = JSON.parse(await readFile(new URL('./new-assets.prepared.json', import.meta.url), 'utf8'));
const expected = manifest.filter((model) => policy === 'full' || !model.license.includes('-NC'));
assert.deepEqual((await readdir(output)).sort(), expected.map((model) => model.file).sort());
for (const model of expected) {
    const bytes = await readFile(resolve(output, model.file));
    assert.equal(bytes.length, model.bytes, model.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), model.sha256, model.file);
}
console.log(`PASS ${policy}: ${expected.length} output models match manifest sizes and SHA-256; no extra files`);
