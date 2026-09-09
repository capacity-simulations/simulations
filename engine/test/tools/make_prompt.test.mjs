// tools/make_prompt.py — the leakage-firewall assembler, driven end-to-end
// via child_process. THE property under test: a single-domain prompt contains
// ONLY that domain's card — no other domain's vocabulary can leak in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TOOL = join(ENGINE_ROOT, 'tools', 'make_prompt.py');
const SCHEMA = JSON.parse(
  readFileSync(join(ENGINE_ROOT, 'tools', 'manifest.schema.json'), 'utf8'));

const tmp = mkdtempSync(join(tmpdir(), 'make-prompt-'));
const BRIEF = join(tmp, 'brief.md');
const BRIEF_TEXT = 'Build a sim about SPEC-MARKER-8817 showing barrier physics.';
writeFileSync(BRIEF, BRIEF_TEXT + '\n');

function run(extraArgs, { simId = 'qm/test-sim' } = {}) {
  const res = spawnSync('python3',
    [TOOL, '--spec', BRIEF, '--sim-id', simId, ...extraArgs],
    { encoding: 'utf8' });
  return { status: res.status, out: res.stdout, err: res.stderr };
}

function extractManifest(promptText) {
  const m = promptText.match(
    /<script type="application\/json" id="engine-manifest">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(m, 'prompt contains an engine-manifest script block');
  return JSON.parse(m[1]);
}

test('unknown module name is a hard error listing known names', () => {
  const r = run(['--modules', 'domain.quantum,domain.phlogiston']);
  assert.notEqual(r.status, 0);
  assert.match(r.err, /unknown module name/i);
  assert.match(r.err, /domain\.phlogiston/);
  assert.match(r.err, /known modules:.*domain\.mechanics/s);
  assert.match(r.err, /no\s+include-all flag/i);
});

test('FIREWALL: quantum-only prompt contains the quantum card and zero mechanics text', () => {
  const r = run(['--modules', 'domain.quantum']);
  assert.equal(r.status, 0, r.err);
  // quantum card is in
  assert.match(r.out, /## MODULE domain\.quantum/);
  assert.match(r.out, /NO trajectories/);
  assert.match(r.out, /sampleDetection/);
  // mechanics card text is OUT — distinctive phrases from domains/mechanics/CARD.md
  assert.ok(!r.out.includes('MODULE domain.mechanics'), 'mechanics card heading leaked');
  assert.ok(!r.out.includes('solveKepler'), 'mechanics API leaked');
  assert.ok(!r.out.includes('restitutionCollision1D'), 'mechanics API leaked');
  assert.ok(!r.out.includes('periapsis'), 'mechanics vocabulary leaked');
  // and no other domain either
  assert.ok(!r.out.includes('boost2'), 'relativity API leaked');
  // single domain family: no cross-domain bridge card
  assert.ok(!r.out.includes('CROSS-DOMAIN RULES'), 'cross-domain card in a single-domain prompt');
});

test('two-domain assembly includes both cards plus _cross-domain.md', () => {
  const r = run(['--modules', 'domain.mechanics,domain.quantum']);
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /## MODULE domain\.mechanics/);
  assert.match(r.out, /## MODULE domain\.quantum/);
  assert.match(r.out, /CROSS-DOMAIN RULES/);
  assert.match(r.out, /Classical state never feeds quantum updates/);
  assert.match(r.err, /appending cards\/_cross-domain\.md/);
});

test('same-family domain pair (relativity + diagram) does NOT trigger the bridge card', () => {
  const r = run(['--modules', 'domain.relativity,domain.relativity-diagram'],
    { simId: 'sr/test-sim' });
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /## MODULE domain\.relativity-diagram/);
  assert.ok(!r.out.includes('CROSS-DOMAIN RULES'),
    'one domain family must not get the cross-domain card');
});

test('verify.audit is auto-added with a warning', () => {
  const r = run(['--modules', 'domain.quantum']);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /verify\.audit is mandatory.*auto-added/);
  const manifest = extractManifest(r.out);
  assert.ok(manifest.modules.includes('verify.audit'));
  assert.match(r.out, /## MODULE verify\.audit/);
});

test('token estimate is printed', () => {
  const r = run(['--modules', 'domain.quantum']);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /assembled ~\d+ card tokens/);
});

test('card-token ceiling: over budget is a hard fail naming the biggest cards', () => {
  const r = run(['--modules', 'domain.quantum', '--max-card-tokens', '100']);
  assert.notEqual(r.status, 0);
  assert.match(r.err, /exceed the ceiling 100/);
  assert.match(r.err, /Biggest cards:/);
  assert.match(r.err, /CARD/); // at least one card file is named
});

test('embedded manifest is valid JSON satisfying the schema contract', () => {
  const r = run(['--modules', 'domain.quantum,shell,controls.bind']);
  assert.equal(r.status, 0, r.err);
  const manifest = extractManifest(r.out);
  // every schema-required key present, nothing outside schema properties
  for (const key of SCHEMA.required) {
    assert.ok(key in manifest, `manifest missing required key ${key}`);
  }
  const allowed = new Set(Object.keys(SCHEMA.properties));
  for (const key of Object.keys(manifest)) {
    assert.ok(allowed.has(key), `manifest key ${key} not in schema`);
  }
  assert.equal(manifest.manifestVersion, 1);
  assert.match(manifest.sim, new RegExp(SCHEMA.properties.sim.pattern));
  assert.ok(Array.isArray(manifest.modules) && manifest.modules.length >= 1);
  assert.equal(new Set(manifest.modules).size, manifest.modules.length, 'modules unique');
  const modPattern = new RegExp(SCHEMA.properties.modules.items.pattern);
  for (const m of manifest.modules) assert.match(m, modPattern);
  assert.equal(manifest.engine,
    JSON.parse(readFileSync(join(ENGINE_ROOT, 'registry.json'), 'utf8')).engineVersion);
  assert.equal(manifest.build, null);
  // transitive deps of domain.quantum were resolved into the closed set
  for (const dep of ['core.complex', 'core.fft', 'core.special', 'core.sample']) {
    assert.ok(manifest.modules.includes(dep), `resolved deps include ${dep}`);
  }
});

test('shell contract card only when shell is resolved; verify contract always', () => {
  const noShell = run(['--modules', 'domain.quantum']);
  assert.ok(!noShell.out.includes('SHELL CONTRACT'));
  assert.match(noShell.out, /VERIFY CONTRACT/);
  const withShell = run(['--modules', 'domain.quantum,shell']);
  assert.match(withShell.out, /SHELL CONTRACT/);
  assert.match(withShell.out, /VERIFY CONTRACT/);
});

test('prompt starts with the preamble and ends with YOUR TASK + spec verbatim', () => {
  const r = run(['--modules', 'domain.quantum']);
  assert.match(r.out, /^# ENGINE SIM — GENERATION RULES/);
  const taskAt = r.out.indexOf('## YOUR TASK');
  assert.ok(taskAt > 0);
  assert.ok(r.out.indexOf(BRIEF_TEXT) > taskAt, 'spec text follows YOUR TASK');
});

test('--params file lands in the manifest; params sweep stays schema-shaped', () => {
  const paramsFile = join(tmp, 'params.json');
  const params = [{ id: 'v0', label: 'barrier height', min: 0, max: 10, step: 0.1, default: 2 }];
  writeFileSync(paramsFile, JSON.stringify(params));
  const r = run(['--modules', 'domain.quantum', '--params', paramsFile]);
  assert.equal(r.status, 0, r.err);
  const manifest = extractManifest(r.out);
  assert.deepEqual(manifest.params, params);
});

test('--out writes the file instead of stdout', () => {
  const outFile = join(tmp, 'prompt.md');
  const r = run(['--modules', 'domain.quantum', '--out', outFile]);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.out, '');
  assert.ok(existsSync(outFile));
  assert.match(readFileSync(outFile, 'utf8'), /## MODULE domain\.quantum/);
});
