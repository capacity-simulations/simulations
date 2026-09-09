// controls.bind — clamp/NaN/fmt/set/refresh behaviors (PW wireSlider × L07 bind).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bindSlider, bindToggle, bindSelect } from '../../controls/bind.js';
import { mockDoc } from '../shell/mockdoc.mjs';

function slider(m, id, { min = '0', max = '10', value = '5' } = {}) {
  const el = m.byId(id);
  el.min = min; el.max = max; el.value = value;
  return el;
}

test('bindSlider seeds state from markup and formats the readout', () => {
  const m = mockDoc();
  slider(m, 's');
  const state = {};
  bindSlider(state, 's', 'x', { out: 'sVal', fmt: v => v.toFixed(1) });
  assert.equal(state.x, 5);
  assert.equal(m.byId('sVal').textContent, '5.0');
});

test('bindSlider pushes pre-set state into the UI at bind time', () => {
  const m = mockDoc();
  const el = slider(m, 's2');
  const state = { x: 3 };
  bindSlider(state, 's2', 'x', { out: 's2Val', fmt: v => v.toFixed(1) });
  assert.equal(el.value, '3');
  assert.equal(m.byId('s2Val').textContent, '3.0');
});

test('bindSlider input: clamps to the element min/max (PW guard)', () => {
  const m = mockDoc();
  const el = slider(m, 's3');
  const state = {};
  const changes = [];
  bindSlider(state, 's3', 'x', { out: 's3Val', fmt: v => String(v), onChange: v => changes.push(v) });
  el.value = '42'; el.fire('input');
  assert.equal(state.x, 10);
  assert.equal(m.byId('s3Val').textContent, '10');
  el.value = '-7'; el.fire('input');
  assert.equal(state.x, 0);
  assert.deepEqual(changes, [10, 0]);
});

test('bindSlider input: NaN falls back to min (PW guard)', () => {
  const m = mockDoc();
  const el = slider(m, 's4', { min: '2', max: '9', value: '5' });
  const state = {};
  bindSlider(state, 's4', 'x');
  el.value = 'bogus'; el.fire('input');
  assert.equal(state.x, 2);
});

test('bindSlider default fmt is Engine fmt (U+2212 minus, -0 scrubbed)', () => {
  const m = mockDoc();
  const el = slider(m, 's5', { min: '-10', max: '10', value: '-2.5' });
  bindSlider({}, 's5', 'x', { out: 's5Val' });
  assert.equal(m.byId('s5Val').textContent, '−2.5');
  el.value = '-0.001'; el.fire('input');
  assert.equal(m.byId('s5Val').textContent, '0');
});

test('bindSlider set(): sanitizes, syncs element + readout, fires onChange', () => {
  const m = mockDoc();
  const el = slider(m, 's6');
  const state = {};
  const changes = [];
  const b = bindSlider(state, 's6', 'x', { out: 's6Val', fmt: v => String(v), onChange: v => changes.push(v) });
  b.set(7);
  assert.equal(state.x, 7);
  assert.equal(el.value, '7');
  assert.equal(m.byId('s6Val').textContent, '7');
  b.set(99);
  assert.equal(state.x, 10);   // clamped
  assert.deepEqual(changes, [7, 10]);
});

test('bindSlider refresh(): syncs UI from state WITHOUT firing onChange', () => {
  const m = mockDoc();
  const el = slider(m, 's7');
  const state = {};
  const changes = [];
  const b = bindSlider(state, 's7', 'x', { out: 's7Val', fmt: v => String(v), onChange: v => changes.push(v) });
  state.x = 2;
  b.refresh();
  assert.equal(el.value, '2');
  assert.equal(m.byId('s7Val').textContent, '2');
  assert.deepEqual(changes, []);
});

test('binders throw a clear error for a missing element id', () => {
  mockDoc();
  const orig = globalThis.document.getElementById;
  globalThis.document.getElementById = () => null;
  try {
    assert.throws(() => bindSlider({}, 'nope', 'x'), /bindSlider: no element/);
    assert.throws(() => bindToggle({}, 'nope', 'x'), /bindToggle: no element/);
    assert.throws(() => bindSelect({}, 'nope', 'x'), /bindSelect: no element/);
  } finally {
    globalThis.document.getElementById = orig;
  }
});

test('bindToggle: seeds, tracks change, set/refresh round-trip', () => {
  const m = mockDoc();
  const el = m.byId('t'); el.checked = true;
  const state = {};
  const changes = [];
  const b = bindToggle(state, 't', 'on', { onChange: v => changes.push(v) });
  assert.equal(state.on, true);
  el.checked = false; el.fire('change');
  assert.equal(state.on, false);
  b.set(true);
  assert.equal(el.checked, true);
  assert.equal(state.on, true);
  state.on = false; b.refresh();
  assert.equal(el.checked, false);
  assert.deepEqual(changes, [false, true]);
});

test('bindSelect: parse maps option strings; set/refresh sync', () => {
  const m = mockDoc();
  const el = m.byId('sel'); el.value = '0.5';
  const state = {};
  const changes = [];
  const b = bindSelect(state, 'sel', 'speed', { parse: parseFloat, onChange: v => changes.push(v) });
  assert.equal(state.speed, 0.5);
  el.value = '2'; el.fire('change');
  assert.equal(state.speed, 2);
  b.set(1);
  assert.equal(el.value, '1');
  assert.equal(state.speed, 1);
  assert.deepEqual(changes, [2, 1]);
  const s2 = {};
  bindSelect(s2, 'sel', 'mode');   // identity parse default
  assert.equal(s2.mode, '1');
});
