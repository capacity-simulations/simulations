// shell.hide-text — window.HT predicate + checkbox wiring (CM L6 harvest).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initHideText } from '../../shell/hide-text.js';
import { mockDoc } from './mockdoc.mjs';

test('checkbox drives #shell.hide-text and forces a resize redraw', () => {
  const m = mockDoc();
  const box = m.byId('ht-toggle');
  const HT = initHideText();
  assert.equal(typeof globalThis.window.HT, 'function');
  assert.equal(HT(), false);
  box.checked = true;
  box.fire('change');
  assert.equal(m.root.classList.contains('hide-text'), true);
  assert.equal(HT(), true);
  assert.ok(m.win.dispatched.includes('resize'));
  box.checked = false;
  box.fire('change');
  assert.equal(HT(), false);
});

test('boot default follows lecture mode, two rAFs later (auto-lecture race)', () => {
  const m = mockDoc();
  m.root.classList.add('lecture-mode');
  const box = m.byId('ht-toggle');
  initHideText();
  assert.equal(box.checked, false);   // not yet — waits two frames
  m.flushRaf();
  m.flushRaf();
  assert.equal(box.checked, true);
  assert.equal(m.root.classList.contains('hide-text'), true);
});

test('missing #ht-toggle: safe no-op predicate', () => {
  const m = mockDoc();
  const orig = globalThis.document.getElementById;
  globalThis.document.getElementById = id => (id === 'ht-toggle' ? null : orig(id));
  const HT = initHideText();
  assert.equal(HT(), false);
  m.root.classList.add('hide-text');
  assert.equal(HT(), true);   // predicate still reads the live class
});
