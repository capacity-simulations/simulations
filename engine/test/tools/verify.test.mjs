// verify.mjs end-to-end tests (plan M7a).
//
// Runs the checker as a child process, exactly as build.py --check and
// check_all.py do. The three green-path tests launch headless Chrome (the
// harvest-goldens recipe); on CI boxes WITHOUT Chrome set SKIP_BROWSER_TESTS=1
// and they are skipped — the broken-fixture tests fail in the static pass
// before any browser launch, so they always run.
//
// Temp fixtures live in the OS tmpdir (never under engine/test/).

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));   // engine/test/tools
const ENGINE_ROOT = resolve(HERE, '../..');
const VERIFY = join(ENGINE_ROOT, 'tools', 'verify.mjs');

const SKIP_BROWSER = process.env.SKIP_BROWSER_TESTS === '1'
  ? 'SKIP_BROWSER_TESTS=1 (CI without Chrome)' : false;

const TMP = mkdtempSync(join(tmpdir(), 'verify-test-'));
after(() => rmSync(TMP, { recursive: true, force: true }));

/* Run verify.mjs; resolves {code, stdout, stderr, verdict} (never rejects on
 * nonzero exit). */
function runVerify(simPath, extra = []) {
  const jsonPath = join(TMP, `verdict-${Math.random().toString(36).slice(2)}.json`);
  const args = [VERIFY, simPath, '--json', jsonPath, '--shots-dir', join(TMP, 'shots'), ...extra];
  return new Promise((res) => {
    execFile(process.execPath, args, { timeout: 120000 }, (err, stdout, stderr) => {
      let verdict = null;
      try { verdict = JSON.parse(readFileSync(jsonPath, 'utf8')); } catch { /* static-abort paths still write it, but stay safe */ }
      res({ code: err ? err.code ?? 1 : 0, stdout, stderr, verdict });
    });
  });
}

function assertAllOk(section, label) {
  for (const [name, check] of Object.entries(section)) {
    assert.equal(check.ok, true, `${label}.${name} should pass: ${JSON.stringify(check.errors)}`);
  }
}

/* ---- (a) rel-fixture: full chain must PASS ---- */
test('rel-fixture.html passes verify end-to-end (static + dynamic + screenshot)',
  { skip: SKIP_BROWSER }, async () => {
    const r = await runVerify(join(ENGINE_ROOT, 'test', 'rel-fixture.html'));
    assert.equal(r.code, 0, `verify exit 0, got ${r.code}\n${r.stdout}\n${r.stderr}`);
    assert.ok(r.verdict, 'verdict JSON written');
    assert.equal(r.verdict.pass, true);
    assert.equal(r.verdict.sim, 'test/rel-fixture');
    assertAllOk(r.verdict.static, 'static');
    assertAllOk(r.verdict.dynamic, 'dynamic');
    // the param sweep actually swept beta at min/default/max
    const sweeps = r.verdict.dynamic.paramSweep.sweeps;
    assert.deepEqual(sweeps.map((s) => s.which), ['min', 'default', 'max']);
    assert.ok(sweeps.every((s) => s.pass));
    assert.ok(existsSync(join(TMP, 'shots', 'rel-fixture.png')), 'screenshot written');
  });

/* ---- (b) shell fixture: must PASS ---- */
test('shell/fixture.html passes verify end-to-end',
  { skip: SKIP_BROWSER }, async () => {
    const r = await runVerify(join(ENGINE_ROOT, 'test', 'shell', 'fixture.html'));
    assert.equal(r.code, 0, `verify exit 0, got ${r.code}\n${r.stdout}\n${r.stderr}`);
    assert.equal(r.verdict.pass, true);
    assertAllOk(r.verdict.static, 'static');
    assertAllOk(r.verdict.dynamic, 'dynamic');
    assert.ok(existsSync(join(TMP, 'shots', 'fixture.png')), 'screenshot written');
  });

/* ---- (d) hello-world (has audit): must PASS ---- */
test('hello-world.html passes verify end-to-end',
  { skip: SKIP_BROWSER }, async () => {
    const r = await runVerify(join(ENGINE_ROOT, 'test', 'hello-world.html'));
    assert.equal(r.code, 0, `verify exit 0, got ${r.code}\n${r.stdout}\n${r.stderr}`);
    assert.equal(r.verdict.pass, true);
    assert.equal(r.verdict.dynamic.audit.ok, true);
    assert.equal(r.verdict.dynamic.initialRun.ok, true);
  });

/* ---- (c1) corrupted build hash -> static stamp fail, dynamic skipped ---- */
test('corrupted build hash fails the static stamp check (no browser launched)', async () => {
  const src = readFileSync(join(ENGINE_ROOT, 'test', 'hello-world.html'), 'utf8');
  const hash = /"hash": "([0-9a-f]{12})"/.exec(src)[1];
  const broken = join(TMP, 'broken-hash.html');
  writeFileSync(broken, src.replace(`"hash": "${hash}"`, '"hash": "000000000000"'));

  const r = await runVerify(broken);
  assert.notEqual(r.code, 0, 'verify must exit nonzero');
  assert.equal(r.verdict.pass, false);
  assert.equal(r.verdict.static.stamp.ok, false);
  assert.match(r.verdict.static.stamp.errors.join(' '), /hash mismatch/);
  // recomputed hash still names the true value (the hash-boundary recompute works)
  assert.equal(r.verdict.static.stamp.recomputedHash, hash);
  assert.equal(r.verdict.dynamic.skipped, true, 'dynamic pass skipped on static failure');
});

/* ---- (c2) unmanifested Engine namespace -> reference-check fail ---- */
test('sim script referencing Engine.quantum (not manifested) fails the reference check', async () => {
  const src = readFileSync(join(ENGINE_ROOT, 'test', 'hello-world.html'), 'utf8');
  const bad = join(TMP, 'bad-ref.html');
  writeFileSync(bad, src.replace(
    '</body>',
    '<script>var _leak = function () { return Engine.quantum.makeGrid(64, 1); };</script>\n</body>'));

  const r = await runVerify(bad);
  assert.notEqual(r.code, 0, 'verify must exit nonzero');
  assert.equal(r.verdict.pass, false);
  assert.equal(r.verdict.static.references.ok, false);
  assert.match(r.verdict.static.references.errors.join(' '),
    /Engine\.quantum.*domain\.quantum.*not in the manifest/);
  // the other static checks are unaffected
  assert.equal(r.verdict.static.stamp.ok, true);
  assert.equal(r.verdict.dynamic.skipped, true);
});

/* ---- namespace unknown to the registry entirely ---- */
test('sim script referencing a namespace no module provides fails with the hand-rolled hint', async () => {
  const src = readFileSync(join(ENGINE_ROOT, 'test', 'hello-world.html'), 'utf8');
  const bad = join(TMP, 'bad-ns.html');
  writeFileSync(bad, src.replace(
    '</body>',
    '<script>var _x = function () { return Engine.wormholes.open(); };</script>\n</body>'));

  const r = await runVerify(bad);
  assert.notEqual(r.code, 0);
  assert.equal(r.verdict.static.references.ok, false);
  assert.match(r.verdict.static.references.errors.join(' '),
    /Engine\.wormholes.*no engine module provides/);
});

/* ---- alias globals (window.Shell) count as engine usage ---- */
test('bare Shell. usage without the shell module manifested fails the reference check', async () => {
  const src = readFileSync(join(ENGINE_ROOT, 'test', 'hello-world.html'), 'utf8');
  const bad = join(TMP, 'bad-alias.html');
  writeFileSync(bad, src.replace(
    '</body>',
    '<script>var _s = function () { Shell.init({}); };</script>\n</body>'));

  const r = await runVerify(bad);
  assert.notEqual(r.code, 0);
  assert.equal(r.verdict.static.references.ok, false);
  assert.match(r.verdict.static.references.errors.join(' '), /"Shell\."\s.*shell.*not manifested/);
});

/* ---- broken JS syntax in a sim script block ---- */
test('a syntax error in any script block fails the static syntax check', async () => {
  const src = readFileSync(join(ENGINE_ROOT, 'test', 'hello-world.html'), 'utf8');
  const bad = join(TMP, 'bad-syntax.html');
  writeFileSync(bad, src.replace('</body>', '<script>function ( { broken</script>\n</body>'));

  const r = await runVerify(bad);
  assert.notEqual(r.code, 0);
  assert.equal(r.verdict.static.syntax.ok, false);
  assert.equal(r.verdict.dynamic.skipped, true);
});
