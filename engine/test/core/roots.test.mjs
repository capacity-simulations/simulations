// core.roots tests — analytic roots, guard behaviour, and l7 golden fidelity.
//
// Tolerances agreed for M3 (do NOT loosen silently — renegotiate in the plan):
//   bisect/newton known roots   abs error < 1e-9 (both run to tol = 1e-12;
//                               1e-9 leaves headroom for the interval midpoint).
//   bracketScan + bisect on sin abs error < 1e-9 at each k*pi.
//   Golden l7 equilibria        newton lands stableEq/unstableEq to 1e-9;
//                               V at the unstable equilibrium matches golden
//                               barrierHeight to 1e-12 (identical formula).
//   Golden l7 turning points    V(root) - E == 0 to 1e-12 after bisect.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bisect, newton, bracketScan } from '../../core/roots.js';

const golden = (slug) =>
  JSON.parse(readFileSync(new URL(`../golden/${slug}.json`, import.meta.url), 'utf8'));

/* ================= analytic ================= */

test('bisect: finds known roots to tol', () => {
  const r1 = bisect((x) => x * x - 2, 1, 2);
  assert.ok(Math.abs(r1 - Math.SQRT2) < 1e-9, `sqrt(2): ${r1}`);
  const r2 = bisect(Math.cos, 1, 2);
  assert.ok(Math.abs(r2 - Math.PI / 2) < 1e-9, `pi/2: ${r2}`);
});

test('bisect: bracket validation returns null, exact endpoint zeros returned', () => {
  assert.equal(bisect((x) => x * x + 1, -1, 1), null, 'no sign change -> null');
  assert.equal(bisect((x) => (x < 0.5 ? NaN : 1), 0, 1), null, 'non-finite endpoint -> null');
  assert.equal(bisect((x) => x, 0, 1), 0, 'exact zero at left endpoint');
  assert.equal(bisect((x) => x - 1, 0, 1), 1, 'exact zero at right endpoint');
});

test('newton: converges on known roots', () => {
  const r1 = newton((x) => x * x - 2, (x) => 2 * x, 1);
  assert.ok(Math.abs(r1 - Math.SQRT2) < 1e-9, `sqrt(2): ${r1}`);
  const r2 = newton(Math.cos, (x) => -Math.sin(x), 1.2);
  assert.ok(Math.abs(r2 - Math.PI / 2) < 1e-9, `pi/2: ${r2}`);
});

test('newton: null on zero derivative, cycling, and non-finite iterates', () => {
  assert.equal(newton((x) => x * x, (x) => 2 * x, 0), null, 'zero derivative at x0');
  // Classic Newton 2-cycle: x^3 - 2x + 2 from x0 = 0 oscillates 0 <-> 1 forever.
  assert.equal(newton((x) => x * x * x - 2 * x + 2, (x) => 3 * x * x - 2, 0), null, '2-cycle exhausts maxIter');
  assert.equal(newton((x) => Math.sqrt(x) - 2, (x) => 0.5 / Math.sqrt(x), -1), null, 'NaN value -> null');
});

test('bracketScan: finds every sign change of sin on [0, 10*pi]', () => {
  const brackets = bracketScan(Math.sin, 0, 10 * Math.PI, 1000);
  // sin(0) === 0 exactly -> degenerate [0, 0]; the 9 interior zeros k*pi
  // (k = 1..9) are genuine sign changes; sin(10*pi) evaluates to ~ -1.2e-15
  // (not an exact zero, no sign change in the last interval).
  assert.equal(brackets.length, 10, `got ${brackets.length} brackets`);
  assert.deepEqual(brackets[0], [0, 0], 'exact grid zero reported as degenerate bracket');
  for (let k = 1; k <= 9; k++) {
    const [lo, hi] = brackets[k];
    // Grid points at i = 100k coincide with float k*pi, so containment is inclusive.
    assert.ok(lo <= k * Math.PI && k * Math.PI <= hi, `bracket ${k} contains ${k}*pi`);
    const root = bisect(Math.sin, lo, hi);
    assert.ok(Math.abs(root - k * Math.PI) < 1e-9, `refined root ${root} vs ${k}*pi`);
  }
});

test('bracketScan: skips intervals with non-finite endpoint values', () => {
  // 1/x flips sign across its pole at 0; the pole grid point evaluates to
  // Infinity and both adjacent intervals are skipped — no phantom bracket.
  assert.deepEqual(bracketScan((x) => 1 / x, -1, 1, 2), []);
});

/* ================= golden fidelity — l7 double-well ================= */

test('golden l7-potential: newton equilibria and bisect turning points match the sim', () => {
  const g = golden('l7-motion-in-a-potential');
  const out0 = g.sweep[0].output;
  const V = (x) => x * x * x / 3 - x;              // source potential, s = 1
  const Vp = (x) => x * x - 1;
  const Vpp = (x) => 2 * x;
  const E = 0.30;                                  // default E slider at capture

  const stable = newton(Vp, Vpp, 2);
  const unstable = newton(Vp, Vpp, -2);
  assert.ok(Math.abs(stable - out0.stableEq) < 1e-9, `stable equilibrium ${stable}`);
  assert.ok(Math.abs(unstable - out0.unstableEq) < 1e-9, `unstable equilibrium ${unstable}`);
  assert.ok(Math.abs(V(unstable) - out0.barrierHeight) < 1e-12,
    `V(unstable) = ${V(unstable)} vs golden barrierHeight ${out0.barrierHeight}`);

  // E = 0.30 crosses V exactly three times inside the sim's world window.
  const brackets = bracketScan((x) => V(x) - E, -2.6, 3.0, 56);
  assert.equal(brackets.length, 3, `turning-point brackets: ${JSON.stringify(brackets)}`);
  for (const [lo, hi] of brackets) {
    const root = bisect((x) => V(x) - E, lo, hi, { tol: 1e-14 });
    assert.ok(root != null && Math.abs(V(root) - E) < 1e-12, `V(root) = E at ${root}`);
  }

  // Same formula as the sim: golden V values reproduce exactly (to round-off).
  for (const s of [g.sweep[0], g.sweep[Math.floor(g.sweep.length / 2)], g.sweep[g.sweep.length - 1]]) {
    assert.ok(Math.abs(V(s.input.x) - s.output.V) < 1e-12, `V(${s.input.x})`);
  }
});
