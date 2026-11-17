/**
 * Every key of the settings file has a label (#33): `projects` was the one shown as its raw key.
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const read = (f: string) => fs.readFileSync(path.join(PKG, f), 'utf8');
const manifest = JSON.parse(read('package.json')).workspacePlugin;

test('every top-level key of the settings template has a label and a hint', () => {
  const keys = [...read(manifest.settingsTemplate).matchAll(/^([a-z_]+):/gm)].map((m) => m[1]);
  assert.ok(keys.includes('projects') && keys.length >= 6, `keys: ${keys.join(', ')}`);
  const labels = read(manifest.labels);
  for (const key of keys) {
    const at = labels.indexOf(`\n${key}:\n`);
    assert.ok(at >= 0, `${key} has a label`);
    const block = labels.slice(at + 1).split(/\n(?=[a-z_]+:\n)/)[0];
    assert.match(block, /^  label: \S/m, `${key}: a label`);
    assert.match(block, /^  info: \S/m, `${key}: a hint`);
  }
});
