// verify.audit — defineAudit installs the __audit surface on an injected
// target; run() aggregates invariant results; probes pass through; setParam
// drives a mock element through the 'input' code path (same as controls.bind).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineAudit } from '../../verify/audit.js';

function mockEl(id) {
  const listeners = Object.create(null);
  return {
    id, value: '', textContent: '',
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    dispatchEvent(ev) { (listeners[ev.type] || []).slice().forEach((fn) => fn(ev)); return true; },
  };
}

function mockTarget(els = {}) {
  return {
    Event: globalThis.Event,
    document: { getElementById: (id) => els[id] || null },
  };
}

test('defineAudit installs the full surface on an injected target', () => {
  const target = mockTarget();
  const probes = { meanX: () => 0.5 };
  const state = { t: 0 };
  const audit = defineAudit({ probes, state }, target);
  assert.equal(target.__audit, audit);
  assert.equal(audit.version, 1);
  assert.equal(audit.manifest, null);            // no #engine-manifest block
  assert.equal(audit.probes, probes);            // probes pass through as-is
  assert.equal(audit.probes.meanX(), 0.5);
  assert.equal(audit.state, state);
  assert.equal(typeof audit.setParam, 'function');
  assert.equal(typeof audit.run, 'function');
});

test('defineAudit works with no window/document at all (node context)', () => {
  const target = {};
  const audit = defineAudit({}, target);
  assert.equal(audit.manifest, null);
  assert.equal(audit.run().pass, true);          // vacuous: no invariants
  assert.throws(() => audit.setParam('x', 1), /no document/);
});

test('manifest is parsed from the #engine-manifest script block', () => {
  const man = mockEl('engine-manifest');
  man.textContent = JSON.stringify({
    manifestVersion: 1, sim: 'test/audit', engine: '1.0.0-dev',
    modules: ['verify.audit'],
    params: [{ id: 'amp', label: 'A', min: 0, max: 2, step: 0.1, default: 1 }],
  });
  const audit = defineAudit({}, mockTarget({ 'engine-manifest': man }));
  assert.equal(audit.manifest.sim, 'test/audit');
  assert.equal(audit.manifest.params[0].id, 'amp');
});

test('invalid manifest JSON degrades to null, never throws', () => {
  const man = mockEl('engine-manifest');
  man.textContent = '{not json';
  const audit = defineAudit({}, mockTarget({ 'engine-manifest': man }));
  assert.equal(audit.manifest, null);
});

test('run() aggregates invariant results with names; one failure fails the pass', () => {
  const audit = defineAudit({
    invariants: {
      normOne: () => ({ ok: true, value: 1.0000002, expected: 1, tol: 1e-6 }),
      energyFlat: () => ({ ok: false, value: 0.02, expected: 0, tol: 1e-2 }),
    },
  }, {});
  const out = audit.run();
  assert.equal(out.pass, false);
  assert.deepEqual(out.results.map((r) => r.name), ['normOne', 'energyFlat']);
  assert.deepEqual(out.results.map((r) => r.ok), [true, false]);
  assert.equal(out.results[0].tol, 1e-6);
  assert.equal(out.results[1].expected, 0);
});

test('run(): all invariants ok -> pass true; a throwing invariant is ok:false', () => {
  const good = defineAudit({
    invariants: { a: () => ({ ok: true, value: 1, expected: 1, tol: 0 }) },
  }, {});
  assert.equal(good.run().pass, true);

  const bad = defineAudit({
    invariants: { boom: () => { throw new Error('probe exploded'); } },
  }, {});
  const out = bad.run();
  assert.equal(out.pass, false);
  assert.equal(out.results[0].ok, false);
  assert.match(String(out.results[0].value), /probe exploded/);
});

test('default setParam sets value and dispatches input (controls.bind code path)', () => {
  const amp = mockEl('amp');
  amp.value = '1';
  // Mimic controls.bind's bindSlider wiring: read el.value on 'input'.
  const state = {};
  const seen = [];
  amp.addEventListener('input', (ev) => {
    state.amp = parseFloat(amp.value);
    seen.push(ev.type);
  });
  const audit = defineAudit({}, mockTarget({ amp }));
  audit.setParam('amp', 1.5);
  assert.equal(amp.value, '1.5');
  assert.equal(state.amp, 1.5);
  assert.deepEqual(seen, ['input']);
});

test('default setParam rejects ids outside the manifest params schema', () => {
  const man = mockEl('engine-manifest');
  man.textContent = JSON.stringify({
    manifestVersion: 1, sim: 'test/audit', engine: '1.0.0-dev',
    modules: ['verify.audit'],
    params: [{ id: 'amp', label: 'A', min: 0, max: 2, step: 0.1, default: 1 }],
  });
  const amp = mockEl('amp');
  const rogue = mockEl('rogue');
  const audit = defineAudit({}, mockTarget({ 'engine-manifest': man, amp, rogue }));
  assert.throws(() => audit.setParam('rogue', 9), /not in the manifest params schema/);
  audit.setParam('amp', 2);                      // schema id passes
  assert.equal(amp.value, '2');
});

test('default setParam throws a clear error for a missing element', () => {
  const audit = defineAudit({}, mockTarget());
  assert.throws(() => audit.setParam('ghost', 1), /no control element "ghost"/);
});

test('a caller-supplied setParam overrides the default', () => {
  const calls = [];
  const audit = defineAudit({ setParam: (id, v) => calls.push([id, v]) }, {});
  audit.setParam('sigma', 0.3);
  assert.deepEqual(calls, [['sigma', 0.3]]);
});
