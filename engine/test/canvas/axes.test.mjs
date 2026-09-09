import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawAxes, makeStripChart } from '../../canvas/axes.js';
import { makeView } from '../../canvas/scale.js';
import { niceTicks } from '../../canvas/ticks.js';
import { makeCtx } from './mockctx.mjs';

const view = () => makeView({
  world: { x0: 0, y0: -1, x1: 10, y1: 1 },
  screen: { w: 800, h: 600, pad: { l: 46, r: 16, t: 16, b: 34 } },
  aspect: 'stretch',
});

test('drawAxes runs and draws grid, tick labels, and frame', () => {
  const ctx = makeCtx();
  const v = view();
  drawAxes(ctx, v, { xLabel: 't', yLabel: 'x' });
  const nx = niceTicks(0, 10, 8).length;
  const ny = niceTicks(-1, 1, 5).length;
  assert.ok(ctx.count('stroke') >= nx + ny, 'one gridline per tick');
  assert.equal(ctx.count('strokeRect'), 1, 'frame');
  assert.equal(ctx.count('fillText'), nx + ny + 2, 'tick labels + 2 axis labels');
});

test('drawAxes honors grid:false and frame:false', () => {
  const ctx = makeCtx();
  drawAxes(ctx, view(), { grid: false, frame: false });
  assert.equal(ctx.count('strokeRect'), 0);
  assert.equal(ctx.count('stroke'), 0, 'no gridlines');
  assert.ok(ctx.count('fillText') > 0, 'tick labels still drawn');
});

test('makeStripChart retains at most maxPoints', () => {
  const chart = makeStripChart({ maxPoints: 5, series: [{ color: '#38bdf8' }] });
  for (let i = 0; i < 12; i++) chart.push(i, Math.sin(i));
  assert.equal(chart.length, 5);
  chart.clear();
  assert.equal(chart.length, 0);
});

test('makeStripChart draws one clipped polyline + tip dot per series', () => {
  const chart = makeStripChart({ maxPoints: 100, series: [{ color: '#38bdf8' }, { color: '#f59e0b' }] });
  for (let i = 0; i <= 20; i++) chart.push(i * 0.5, Math.sin(i * 0.5), Math.cos(i * 0.5));
  const ctx = makeCtx();
  chart.draw(ctx, view());
  assert.equal(ctx.count('clip'), 1, 'clipped to the plot rect');
  assert.equal(ctx.count('stroke'), 2, 'one polyline per series');
  assert.equal(ctx.count('arc'), 2, 'one tip dot per series');
  assert.equal(ctx.count('lineTo'), 2 * 20, '20 segments per series');
  assert.equal(ctx.count('save'), ctx.count('restore'), 'balanced save/restore');
});

test('makeStripChart with no samples draws nothing', () => {
  const chart = makeStripChart({ series: [{ color: '#fff' }] });
  const ctx = makeCtx();
  chart.draw(ctx, view());
  assert.equal(ctx.calls.length, 0);
});
