import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeScale, clamp, lerp, fmt } from '../../core/scale.js';

test('makeScale maps and inverts (round-trip)', () => {
  const s = makeScale([0, 10], [40, 760]);
  assert.equal(s(0), 40);
  assert.equal(s(10), 760);
  assert.equal(s(5), 400);
  for (const x of [-3, 0, 2.5, 7.1, 10, 42]) {
    assert.ok(Math.abs(s.invert(s(x)) - x) < 1e-12, `round-trip at ${x}`);
  }
  assert.deepEqual(s.domain, [0, 10]);
  assert.deepEqual(s.range, [40, 760]);
});

test('makeScale handles inverted ranges (screen y-axis)', () => {
  const y = makeScale([0, 1], [500, 0]);
  assert.equal(y(0), 500);
  assert.equal(y(1), 0);
  assert.ok(Math.abs(y.invert(250) - 0.5) < 1e-12);
});

test('clamp and lerp', () => {
  assert.equal(clamp(5, 0, 3), 3);
  assert.equal(clamp(-1, 0, 3), 0);
  assert.equal(clamp(2, 0, 3), 2);
  assert.equal(lerp(0, 10, 0.25), 2.5);
});

test('fmt scrubs -0, trims zeros, uses true minus', () => {
  assert.equal(fmt(-0.0001, 2), '0');
  assert.equal(fmt(1.5, 3), '1.5');
  assert.equal(fmt(-2.25, 2), '−2.25');
  assert.equal(fmt(3, 0), '3');
  assert.equal(fmt(NaN), 'NaN');
});
