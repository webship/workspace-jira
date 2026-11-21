/**
 * The install check says twg is signed in only when twg ran and answered (webship/workspace-jira#43).
 *
 * It called twg "signed in" unless the output carried a login error, whatever its exit status. The dashboard image's
 * twg is a wrapper that prints "twg is not installed on the host" and exits 127 when the host has none: no login error
 * in that, so the install said "✓ twg — signed in" and every Jira action failed after it. This runs
 * scripts/host-install.sh --check (which installs nothing) against three stand-in twgs.
 */
import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

// Compiled, this test runs from dist/tests, so the package root is one folder further up.
const PKG = fs.existsSync(path.join(__dirname, '..', 'package.json')) ? path.join(__dirname, '..') : path.join(__dirname, '..', '..');
const SCRIPT = path.join(PKG, 'scripts', 'host-install.sh');

/** The check's output with a twg on PATH whose body is `body`. */
function check(body: string): string {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-host-check-'));
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'twg'), `#!/usr/bin/env bash\n${body}\n`, { mode: 0o755 });
  const r = spawnSync('bash', [SCRIPT, '--check'], { encoding: 'utf8', env: { ...process.env, HOME: home, PATH: `${bin}:/usr/bin:/bin` } });
  fs.rmSync(home, { recursive: true, force: true });
  return r.stdout + r.stderr;
}

test('a twg that does not run (a wrapper that exits 127) is not called signed in, and its words are shown', () => {
  const out = check('echo "twg is not installed on the host" >&2; exit 127');
  assert.doesNotMatch(out, /— signed in$/m);
  assert.match(out, /✗ twg +.*\/twg — twg did not answer \(exit 127\): twg is not installed on the host$/m);
});

test('a twg that answers with no login error is signed in', () => {
  const out = check(`echo '{"projects": [{"key": "WJS"}]}'`);
  assert.match(out, /✓ twg +.*\/twg — signed in$/m);
});

test('a twg that needs a login says so, with the command to run, whatever its exit status', () => {
  for (const rc of [1, 0]) {
    const out = check(`echo '{"ok": false, "code": "AUTH_REQUIRED"}'; exit ${rc}`);
    assert.match(out, /✗ twg +.*\/twg — NOT signed in: run .*\/twg login --force$/m, `exit ${rc}`);
    assert.doesNotMatch(out, /— signed in$/m);
  }
});
