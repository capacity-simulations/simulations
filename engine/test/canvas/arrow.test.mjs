import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawArrow } from '../../canvas/arrow.js';
import { makeCtx } from './mockctx.mjs';

test('drawArrow draws shaft + filled head and returns the tip', () => {
  const ctx = makeCtx();
  const tip = drawArrow(ctx, 100, 100, 200, 100, { color: '#34d399' });
  assert.deepEqual(tip, { ex: 200, ey: 100, clipped: false });
  assert.ok(ctx.count('stroke') >= 1, 'shaft stroked');
  assert.equal(ctx.count('fill'), 1, 'head filled');
  assert.equal(ctx.count('closePath'), 1, 'head is a closed triangle');
  assert.equal(ctx.count('save'), ctx.count('restore'));
});

test('drawArrow head geometry: barbs sit behind the tip at ±0.42 rad', () => {
  const ctx = makeCtx();
  drawArrow(ctx, 0, 0, 100, 0, { head: 8 });
  const pts = ctx.argsOf('lineTo');
  const barbs = pts.slice(-2);
  for (const [bx, by] of barbs) {
    assert.ok(Math.abs(Math.hypot(bx - 100, by - 0) - 8) < 1e-9, 'barb 8 px from tip');
    assert.ok(bx < 100, 'barb behind tip');
  }
  assert.ok(barbs[0][1] < 0 !== barbs[1][1] < 0, 'barbs on opposite sides');
});

test('drawArrow clips into bounds and marks truncation', () => {
  const ctx = makeCtx();
  const tip = drawArrow(ctx, 50, 50, 900, 50, { clip: { w: 400, h: 300 } });
  assert.equal(tip.clipped, true);
  assert.ok(tip.ex <= 400 - 6 + 1e-9, 'tip pulled inside the 6 px margin');
  assert.equal(tip.ey, 50);
  assert.ok(ctx.count('stroke') >= 3, 'shaft + two truncation ticks');
});

test('drawArrow inside clip bounds is not truncated', () => {
  const ctx = makeCtx();
  const tip = drawArrow(ctx, 50, 50, 200, 120, { clip: { w: 400, h: 300 } });
  assert.deepEqual(tip, { ex: 200, ey: 120, clipped: false });
});

test('drawArrow returns null and draws nothing when shorter than 1 px', () => {
  const ctx = makeCtx();
  assert.equal(drawArrow(ctx, 10, 10, 10.5, 10), null);
  assert.equal(ctx.calls.length, 0);
});

test('drawArrow dash applies to the shaft only and is reset', () => {
  const ctx = makeCtx();
  drawArrow(ctx, 0, 0, 100, 0, { dash: [5, 4] });
  const dashes = ctx.argsOf('setLineDash');
  assert.deepEqual(dashes[0], [[5, 4]]);
  assert.deepEqual(dashes[1], [[]]);
});
