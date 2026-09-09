import { test } from 'node:test';
import assert from 'node:assert/strict';
import { roundRect, dashLine, cssVar, diamond } from '../../canvas/primitives.js';
import { makeCtx } from './mockctx.mjs';

test('roundRect builds a 4-corner arcTo path; fill/stroke per opts', () => {
  const ctx = makeCtx();
  roundRect(ctx, 10, 20, 100, 50, 8);
  assert.equal(ctx.count('arcTo'), 4);
  assert.equal(ctx.count('closePath'), 1);
  assert.equal(ctx.count('fill'), 0, 'path only by default');
  assert.equal(ctx.count('stroke'), 0);

  const ctx2 = makeCtx();
  roundRect(ctx2, 0, 0, 100, 50, 6, { fill: '#38bdf8', stroke: true });
  assert.equal(ctx2.count('fill'), 1);
  assert.equal(ctx2.count('stroke'), 1);
  assert.equal(ctx2.fillStyle, '#38bdf8', 'string opt sets the style');
});

test('roundRect clamps the radius to fit thin boxes', () => {
  const ctx = makeCtx();
  roundRect(ctx, 0, 0, 100, 6, 8, { fill: true });
  const r = ctx.argsOf('arcTo')[0][4];
  assert.equal(r, 3, 'radius clamped to h/2');
});

test('dashLine sets the dash inside save/restore and strokes once', () => {
  const ctx = makeCtx();
  dashLine(ctx, 0, 0, 100, 100, { color: '#f00', dash: [4, 3] });
  assert.deepEqual(ctx.argsOf('setLineDash')[0], [[4, 3]]);
  assert.equal(ctx.count('stroke'), 1);
  assert.equal(ctx.count('save'), 1);
  assert.equal(ctx.count('restore'), 1);
  const ctx2 = makeCtx();
  dashLine(ctx2, 0, 0, 1, 1);
  assert.deepEqual(ctx2.argsOf('setLineDash')[0], [[5, 4]], 'default dash pattern');
});

test('cssVar returns the fallback when no DOM exists', () => {
  assert.equal(cssVar('--accent', '#38bdf8'), '#38bdf8');
});

test('diamond builds a closed 4-point path; fill/stroke per opts', () => {
  const ctx = makeCtx();
  diamond(ctx, 50, 50, 5, { fill: '#fbbf24' });
  assert.deepEqual(ctx.argsOf('moveTo')[0], [50, 45]);
  assert.equal(ctx.count('lineTo'), 3);
  assert.equal(ctx.count('closePath'), 1);
  assert.equal(ctx.count('fill'), 1);
  assert.equal(ctx.fillStyle, '#fbbf24');
});
