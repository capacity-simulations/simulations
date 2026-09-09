import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fit } from '../../canvas/fit.js';
import { makeCtx, makeCanvas } from './mockctx.mjs';

test('fit sizes backing store and returns CSS-pixel size', () => {
  const canvas = makeCanvas(300, 150);
  const ctx = makeCtx();
  const { w, h } = fit(canvas, ctx);
  assert.equal(w, 300);
  assert.equal(h, 150);
  assert.equal(canvas.width, 300);   // dpr = 1 under node
  assert.equal(canvas.height, 150);
});

test('fit is DPR-aware', () => {
  globalThis.devicePixelRatio = 2;
  try {
    const canvas = makeCanvas(300, 150);
    const ctx = makeCtx();
    const { w, h } = fit(canvas, ctx);
    assert.equal(canvas.width, 600);   // device px
    assert.equal(canvas.height, 300);
    assert.equal(w, 300);              // CSS px unchanged
    assert.equal(h, 150);
    assert.deepEqual(ctx.argsOf('scale').at(-1), [2, 2]);
  } finally {
    delete globalThis.devicePixelRatio;
  }
});

test('fit resets the transform before scaling (no cumulative DPR)', () => {
  const canvas = makeCanvas();
  const ctx = makeCtx();
  fit(canvas, ctx);
  fit(canvas, ctx);
  assert.equal(ctx.count('setTransform'), 2);
  assert.deepEqual(ctx.argsOf('setTransform')[0], [1, 0, 0, 1, 0, 0]);
  const iT = ctx.calls.findIndex((c) => c[0] === 'setTransform');
  const iS = ctx.calls.findIndex((c) => c[0] === 'scale');
  assert.ok(iT < iS, 'setTransform must precede scale');
});

test('fit guards zero-size layout (backing store never 0)', () => {
  const canvas = makeCanvas(0, 0);
  const ctx = makeCtx();
  fit(canvas, ctx);
  assert.equal(canvas.width, 1);
  assert.equal(canvas.height, 1);
});

test('fit leaves an already-correct backing store untouched', () => {
  const canvas = makeCanvas(300, 150);
  const ctx = makeCtx();
  fit(canvas, ctx);
  canvas.width = 300; canvas.height = 150;
  let resized = false;
  Object.defineProperty(canvas, 'width', {
    get: () => 300,
    set: () => { resized = true; },
  });
  fit(canvas, ctx);
  assert.equal(resized, false, 'no redundant resize (resizing clears the canvas)');
});
