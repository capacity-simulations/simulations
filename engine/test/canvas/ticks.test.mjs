import { test } from 'node:test';
import assert from 'node:assert/strict';
import { niceTicks, tickLabel } from '../../canvas/ticks.js';

test('niceTicks covers the range with round steps', () => {
  assert.deepEqual(niceTicks(0, 10, 8), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(niceTicks(0, 100, 4), [0, 20, 40, 60, 80, 100]);
  assert.deepEqual(niceTicks(-1, 1, 4), [-1, -0.5, 0, 0.5, 1]);
});

test('niceTicks steps are 1, 2, or 5 × 10ⁿ (property, random ranges)', () => {
  let seed = 12345;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let k = 0; k < 200; k++) {
    const mn = (rand() - 0.5) * Math.pow(10, Math.floor(rand() * 6) - 3);
    const range = (0.1 + rand() * 10) * Math.pow(10, Math.floor(rand() * 6) - 3);
    const mx = mn + range;
    const n = 2 + Math.floor(rand() * 10);
    const ticks = niceTicks(mn, mx, n);
    assert.ok(ticks.length >= 1, `at least one tick for [${mn}, ${mx}]`);
    for (const t of ticks) {
      assert.ok(t >= mn - range * 0.011 && t <= mx + range * 0.011, `tick ${t} inside [${mn}, ${mx}]`);
    }
    for (let i = 1; i < ticks.length; i++) {
      const step = ticks[i] - ticks[i - 1];
      assert.ok(step > 0, 'ascending');
      const mant = step / Math.pow(10, Math.floor(Math.log10(step) + 1e-9));
      const ok = [1, 2, 5, 10].some((m) => Math.abs(mant - m) < 1e-6);
      assert.ok(ok, `step ${step} (mantissa ${mant}) is 1/2/5×10ⁿ`);
      if (i > 1) {
        const prev = ticks[i - 1] - ticks[i - 2];
        assert.ok(Math.abs(step - prev) < step * 1e-6, 'uniform step');
      }
    }
  }
});

test('niceTicks dedupes and guards degenerate ranges', () => {
  assert.deepEqual(niceTicks(5, 5, 8), [5]);
  assert.deepEqual(niceTicks(3, 3 + 1e-13, 8), [3]);
  const ticks = niceTicks(-1.7, 1.7, 8);
  assert.equal(new Set(ticks).size, ticks.length, 'no duplicates');
  assert.ok(ticks.includes(0));
});

test('tickLabel: zero, wide ranges, narrow ranges, true minus', () => {
  assert.equal(tickLabel(0, 10), '0');
  assert.equal(tickLabel(1e-14, 10), '0');
  assert.equal(tickLabel(15, 90), '15');       // wide range, |v| ≥ 10 → integer
  assert.equal(tickLabel(5, 90), '5.0');       // wide range, small |v| → 1 decimal
  assert.equal(tickLabel(-15, 90), '−15');     // U+2212
  assert.equal(tickLabel(0.25, 1), '0.25');    // narrow range → 2 decimals
  assert.equal(tickLabel(-0.5, 2), '−0.50');
  assert.equal(tickLabel(0.012, 0.05), '0.0120'); // very narrow → more decimals
  assert.equal(tickLabel(NaN, 1), 'NaN');
});

test('tickLabel is uniform across one axis', () => {
  const range = 1.5;
  const labels = niceTicks(0, range, 5).filter((t) => t !== 0).map((t) => tickLabel(t, range));
  const decimals = labels.map((s) => (s.split('.')[1] || '').length);
  assert.ok(decimals.every((d) => d === decimals[0]), `uniform decimals: ${labels}`);
});
