/**
 * The prompts a Jira session starts with say what holds for every project of the workspace (#13).
 *
 * They told every session the project was "a DDEV Drupal site" ("use ddev drush / ddev composer via Bash"), which is
 * false for the other platforms the workspace builds and the other runtimes it runs; and the limit message named
 * `jira.max_agents` in settings.yml, where the key no longer is.
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

import { RUNS_IN_CONTAINERS } from '../src/lib/task';

const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const read = (f: string) => fs.readFileSync(path.join(PKG, f), 'utf8');

test('no prompt says the project is a Drupal site, or names one assistant\'s tool', () => {
  for (const f of ['src/lib/task.ts', 'src/index.ts']) {
    const text = read(f);
    assert.doesNotMatch(text, /DDEV Drupal site/, f);
    assert.doesNotMatch(text, /via Bash/, f);
  }
});

test('the analyze and work prompts say how any project runs its tools: in containers, DDEV by default, never on the host', () => {
  assert.match(RUNS_IN_CONTAINERS, /containers: DDEV by default \(ddev drush, ddev composer, ddev exec\), or the runtime its own files and AGENTS\.md name/);
  assert.match(RUNS_IN_CONTAINERS, /never raw on the host/);
  const task = read('src/lib/task.ts');
  assert.strictEqual(task.match(/\$\{RUNS_IN_CONTAINERS\}/g)?.length, 2, 'analyze and work');
  assert.match(read('src/index.ts'), /# it runs in containers: DDEV by default \(ddev drush, ddev composer\), or the runtime its files and AGENTS\.md name; never raw on the host/);
});

test('the limit of agents at once is named where it is: max_agents in plugin.jira.settings.yml', () => {
  const task = read('src/lib/task.ts');
  assert.doesNotMatch(task, /jira\.max_agents/);
  assert.match(task, /raise <code>max_agents<\/code> in <code>core\/config\/plugin\.jira\.settings\.yml<\/code>/);
  assert.match(read('config/plugin.jira.settings.yml'), /^max_agents:/m, 'and the key is in that file');
});
