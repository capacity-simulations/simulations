// domain.em-fields tests — all analytic and deterministic (no Math.random;
// the module itself draws no randomness).
//
// Tolerances (do NOT loosen silently — renegotiate in the plan):
//   superposition        field/potential of a set == sum of singles, 1e-15 rel
//                        (same summation order — bitwise-equal in practice)
//   dipole 1/r^3         on-axis |E| vs 2p/r^3 at r = 1000a within 4e-6 rel
//                        (finite-size correction 2a^2/r^2 = 2e-6);
//                        |E(r)|/|E(2r)| vs 8 within 4e-6 rel
//   radial departure     single charge: every traced point sits on the seed
//                        ray to |cross|/|r| < 1e-12 (RK4 of a constant unit
//                        direction is exact)
//   termination          dipole seeds around +q: the on-axis outward seed
//                        exits bounds; all 7 others stop 'charge' on the -q
//                        within stopRadius + stepSize
//   equipotential level  refined vertices satisfy |V - level| < 1e-9 and
//                        (single charge) radius |q|/level to 1e-6
//   orthogonality        |t_hat . E_hat| < 1e-3 at EVERY contour-segment
//                        midpoint (dipole, 512x512 grid, refine 2)
//   cyclotron            uniform B only: |v| drift < 2e-12 (float rounding
//                        accumulates ~ n*eps over 25,600 rotation steps;
//                        measured worst 7.4e-13), radius mv/(qB) within
//                        1e-10 at every sampled step, closure after 100
//                        periods (t = 100 * 2 pi m / (qB)) within 1e-10,
//                        analytic position match within 1e-10
//   E x B drift          mean velocity over 20 periods vs (Ey/B, -Ex/B)
//                        within 1e-6 (abs)
//   free flight          no charges, B = 0: exact straight line, 1e-15

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeCharges, fieldAt, potentialAt, traceFieldLine, fieldLineSeeds,
  equipotentialAt, lorentzForce, makeChargedParticle, stepParticle,
} from '../../domains/em-fields/index.js';

const hyp = Math.hypot;

/* ================= construction & validation ================= */

test('makeCharges: validates and copies; rejects bad input', () => {
  const src = [{ q: 1, x: 0, y: 0 }, { q: -2.5, x: 3, y: -4 }];
  const cs = makeCharges(src);
  assert.deepEqual(cs, src);
  assert.notEqual(cs[0], src[0], 'returns copies, not the caller objects');
  assert.throws(() => makeCharges('nope'), RangeError);
  assert.throws(() => makeCharges([{ q: NaN, x: 0, y: 0 }]), RangeError);
  assert.throws(() => makeCharges([{ q: 1, x: Infinity, y: 0 }]), RangeError);
  assert.throws(() => makeCharges([null]), RangeError);
});

test('makeChargedParticle: validates m > 0 and finite state', () => {
  const p = makeChargedParticle({ q: -1, m: 2, x: 1, y: 2, vx: 3, vy: 4 });
  assert.deepEqual(p, { q: -1, m: 2, x: 1, y: 2, vx: 3, vy: 4 });
  assert.deepEqual(makeChargedParticle({ q: 1, m: 1, x: 0, y: 0 }),
    { q: 1, m: 1, x: 0, y: 0, vx: 0, vy: 0 });
  assert.throws(() => makeChargedParticle({ q: 1, m: 0, x: 0, y: 0 }), RangeError);
  assert.throws(() => makeChargedParticle({ q: 1, m: -1, x: 0, y: 0 }), RangeError);
  assert.throws(() => makeChargedParticle({ q: 1, m: 1, x: NaN, y: 0 }), RangeError);
});

/* ================= field & potential ================= */

test('single charge: E = q/r^2 radial and V = q/r (k = 1) to 1e-12 rel', () => {
  const cs = makeCharges([{ q: 2, x: 1, y: -1 }]);
  const [Ex, Ey] = fieldAt(cs, 4, 3);           // r = 5 from the charge
  const r = 5, mag = 2 / (r * r);
  assert.ok(Math.abs(Ex - mag * (3 / 5)) < 1e-12 * mag);
  assert.ok(Math.abs(Ey - mag * (4 / 5)) < 1e-12 * mag);
  assert.ok(Math.abs(potentialAt(cs, 4, 3) - 2 / 5) < 1e-12);
});

test('superposition: field and potential of a set equal the sum of singles (1e-15 rel)', () => {
  const list = [{ q: 1.5, x: 0.3, y: 0.7 }, { q: -2, x: -1, y: 0.2 }, { q: 0.7, x: 2, y: -1.4 }];
  const all = makeCharges(list);
  const probes = [[0, 0], [1.1, -0.4], [-2.3, 1.9], [0.5, 3]];
  for (const [x, y] of probes) {
    let Ex = 0, Ey = 0, V = 0;
    for (const c of list) {
      const [ex, ey] = fieldAt(makeCharges([c]), x, y);
      Ex += ex; Ey += ey;
      V += potentialAt(makeCharges([c]), x, y);
    }
    const [EX, EY] = fieldAt(all, x, y);
    const VV = potentialAt(all, x, y);
    const scale = Math.max(1, hyp(Ex, Ey));
    assert.ok(Math.abs(EX - Ex) < 1e-15 * scale, `Ex at (${x},${y})`);
    assert.ok(Math.abs(EY - Ey) < 1e-15 * scale, `Ey at (${x},${y})`);
    assert.ok(Math.abs(VV - V) < 1e-15 * Math.max(1, Math.abs(V)), `V at (${x},${y})`);
  }
});

test('dipole: on-axis |E| falls as 1/r^3 (4e-6 rel at r = 1000a)', () => {
  const a = 0.5;                                  // half-separation
  const cs = makeCharges([{ q: 1, x: a, y: 0 }, { q: -1, x: -a, y: 0 }]);
  const p = 1 * 2 * a;                            // dipole moment q*d = 1
  const r1 = 1000 * a, r2 = 2000 * a;
  const E1 = hyp(...fieldAt(cs, r1, 0));
  const E2 = hyp(...fieldAt(cs, r2, 0));
  // asymptotic on-axis field 2p/r^3
  assert.ok(Math.abs(E1 / (2 * p / (r1 ** 3)) - 1) < 4e-6, `|E(r1)| vs 2p/r1^3: ${E1}`);
  assert.ok(Math.abs(E2 / (2 * p / (r2 ** 3)) - 1) < 4e-6, `|E(r2)| vs 2p/r2^3: ${E2}`);
  // doubling r divides E by 8
  assert.ok(Math.abs(E1 / E2 / 8 - 1) < 4e-6, `ratio ${E1 / E2}`);
});

test('lorentzForce: F = q(E + v x Bz zhat) on hand-computed values', () => {
  // q = 2, E = (3, -1), Bz = 4, v = (5, 6): F = 2*(3 + 6*4, -1 - 5*4) = (54, -42)
  assert.deepEqual(lorentzForce(2, [3, -1], 4, [5, 6]), [54, -42]);
  assert.deepEqual(lorentzForce(-1, [0, 0], 2, [1, 0]), [-0, 2]);
  assert.throws(() => lorentzForce(1, [1], 0, [0, 0]), RangeError);
  assert.throws(() => lorentzForce(1, [1, 0], 0, [0]), RangeError);
});

/* ================= field lines ================= */

test('field lines leave a + charge radially: traced points stay on the seed ray (1e-12)', () => {
  const c = { q: 1, x: 0.3, y: -0.2 };
  const cs = makeCharges([c]);
  const seeds = fieldLineSeeds(cs, { perCharge: 8, seedRadius: 0.1 });
  assert.equal(seeds.length, 8);
  for (const s of seeds) {
    assert.equal(s.dir, 1);
    const ux = (s.x - c.x) / 0.1, uy = (s.y - c.y) / 0.1;
    const pts = traceFieldLine(cs, s.x, s.y, {
      dir: s.dir, stepSize: 0.02, maxSteps: 2000,
      bounds: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
    });
    assert.equal(pts.stop, 'bounds', 'a lone + charge sends every line out of bounds');
    for (const [x, y] of pts) {
      const vx = x - c.x, vy = y - c.y;
      const r = hyp(vx, vy);
      assert.ok(Math.abs(vx * uy - vy * ux) / r < 1e-12, `off-ray at (${x}, ${y})`);
      assert.ok(vx * ux + vy * uy > 0, 'moves outward along the ray');
    }
  }
});

test('dipole: field lines from +q terminate on -q (except the outward on-axis line)', () => {
  const cs = makeCharges([{ q: 1, x: 1, y: 0 }, { q: -1, x: -1, y: 0 }]);
  const seeds = fieldLineSeeds(cs, { perCharge: 8, seedRadius: 0.1 })
    .filter((s) => s.dir === 1);
  assert.equal(seeds.length, 8);
  const opts = {
    stepSize: 0.02, stopRadius: 0.05, maxSteps: 20000,
    bounds: { xMin: -20, xMax: 20, yMin: -20, yMax: 20 },
  };
  for (const s of seeds) {
    const pts = traceFieldLine(cs, s.x, s.y, { ...opts, dir: s.dir });
    const onAxisOutward = Math.abs(s.y) < 1e-12 && s.x > 1;  // seed at angle 0
    if (onAxisOutward) {
      assert.equal(pts.stop, 'bounds', 'the on-axis outward line runs to the boundary');
    } else {
      assert.equal(pts.stop, 'charge', `seed (${s.x}, ${s.y}) should reach -q, got ${pts.stop}`);
      assert.equal(pts.charge, 1, 'terminating charge is the negative one');
      const [xe, ye] = pts[pts.length - 1];
      assert.ok(hyp(xe + 1, ye) <= opts.stopRadius + opts.stepSize,
        `endpoint (${xe}, ${ye}) within stopRadius+step of (-1, 0)`);
    }
  }
});

test('fieldLineSeeds: count scales with |q|, direction with sign, radius honored', () => {
  const cs = makeCharges([
    { q: 2, x: 0, y: 0 },      // 16 seeds, dir +1
    { q: -0.5, x: 3, y: 0 },   // 4 seeds, dir -1
    { q: 1.4, x: 0, y: 3 },    // round(11.2) = 11 seeds, dir +1
    { q: 0, x: 9, y: 9 },      // skipped
  ]);
  const seeds = fieldLineSeeds(cs, { perCharge: 8, seedRadius: 0.25 });
  assert.equal(seeds.length, 16 + 4 + 11);
  assert.equal(seeds.filter((s) => s.dir === 1).length, 27);
  assert.equal(seeds.filter((s) => s.dir === -1).length, 4);
  for (const s of seeds.slice(16, 20)) {
    assert.ok(Math.abs(hyp(s.x - 3, s.y) - 0.25) < 1e-12, 'on the seed circle of -0.5');
  }
});

test('traceFieldLine: rejects a bad dir; stagnates immediately with no charges', () => {
  const cs = makeCharges([{ q: 1, x: 0, y: 0 }]);
  assert.throws(() => traceFieldLine(cs, 1, 1, { dir: 0 }), RangeError);
  const pts = traceFieldLine([], 1, 1, {});
  assert.equal(pts.stop, 'stagnation');
  assert.equal(pts.length, 1);
});

/* ================= equipotentials ================= */

test('equipotential of a single charge is the circle r = q/level (vertices 1e-9 on level, radius 1e-6)', () => {
  const cs = makeCharges([{ q: 1, x: 0, y: 0 }]);
  const level = 0.5;                              // circle r = 2
  const segs = equipotentialAt(cs, level, {
    bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
    grid: { nx: 128, ny: 128 },
  });
  assert.ok(segs.length > 40, `expected a full circle of segments, got ${segs.length}`);
  for (const [pA, pB] of segs) {
    for (const [x, y] of [pA, pB]) {
      assert.ok(Math.abs(potentialAt(cs, x, y) - level) < 1e-9,
        `refined vertex off level at (${x}, ${y})`);
      assert.ok(Math.abs(hyp(x, y) - 2) < 1e-6, `radius ${hyp(x, y)} != 2`);
    }
  }
});

test('equipotentials are orthogonal to the field: |t_hat . E_hat| < 1e-3 at every midpoint (dipole)', () => {
  const cs = makeCharges([{ q: 1, x: 0.5, y: 0 }, { q: -1, x: -0.5, y: 0 }]);
  const segs = equipotentialAt(cs, 0.3, {
    bounds: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
    grid: { nx: 512, ny: 512 },
  });
  assert.ok(segs.length > 100, `expected a closed contour, got ${segs.length} segments`);
  let worst = 0;
  for (const [pA, pB] of segs) {
    const tx = pB[0] - pA[0], ty = pB[1] - pA[1];
    const L = hyp(tx, ty);
    if (L < 1e-9) continue;                       // degenerate corner sliver
    const mx = (pA[0] + pB[0]) / 2, my = (pA[1] + pB[1]) / 2;
    const [Ex, Ey] = fieldAt(cs, mx, my);
    const dot = Math.abs(tx * Ex + ty * Ey) / (L * hyp(Ex, Ey));
    if (dot > worst) worst = dot;
    assert.ok(dot < 1e-3, `|t.E| = ${dot} at (${mx}, ${my})`);
  }
  assert.ok(worst > 0, 'sanity: at least one segment was measured');
});

/* ================= particle motion ================= */

test('cyclotron orbit in uniform B: radius mv/(qB) and 100-period closure to 1e-10, |v| to 1e-13', () => {
  // q = 1, m = 1, Bz = 2: omega = 2, T = 2 pi m/(qB) = pi, r_L = mv/(qB) = 0.5.
  // Start (0, 0), v = (1, 0): guiding center (0, -0.5).
  const p = makeChargedParticle({ q: 1, m: 1, x: 0, y: 0, vx: 1, vy: 0 });
  const B = 2, T = Math.PI, stepsPerPeriod = 256, periods = 100;
  const dt = T / stepsPerPeriod;
  for (let i = 1; i <= periods * stepsPerPeriod; i++) {
    stepParticle(p, [], B, dt);
    if (i % 64 === 0) {
      assert.ok(Math.abs(hyp(p.vx, p.vy) - 1) < 2e-12, `|v| drift at step ${i}`);
      assert.ok(Math.abs(hyp(p.x, p.y + 0.5) - 0.5) < 1e-10, `radius drift at step ${i}`);
    }
    if (i === stepsPerPeriod / 2) {
      // half period: opposite side of the circle, v reversed
      assert.ok(hyp(p.x - 0, p.y + 1) < 1e-12, `half-period position (${p.x}, ${p.y})`);
      assert.ok(hyp(p.vx + 1, p.vy - 0) < 1e-12, 'half-period velocity');
    }
    if (i === stepsPerPeriod) {
      // one full period 2 pi m/(qB): back to start
      assert.ok(hyp(p.x, p.y) < 1e-12, `one-period closure (${p.x}, ${p.y})`);
      assert.ok(hyp(p.vx - 1, p.vy) < 1e-12, 'one-period velocity closure');
    }
  }
  assert.ok(hyp(p.x, p.y) < 1e-10, `100-period closure: |dr| = ${hyp(p.x, p.y)}`);
  assert.ok(hyp(p.vx - 1, p.vy) < 1e-10, '100-period velocity closure');
});

test('cyclotron orbit matches the analytic circle at intermediate times (1e-10)', () => {
  // x(t) = sin(2t)/2, y(t) = -(1 - cos(2t))/2 for the setup above.
  const p = makeChargedParticle({ q: 1, m: 1, x: 0, y: 0, vx: 1, vy: 0 });
  const B = 2, dt = Math.PI / 512;
  for (let i = 1; i <= 2048; i++) {
    stepParticle(p, [], B, dt);
    const t = i * dt;
    const xa = Math.sin(2 * t) / 2, ya = -(1 - Math.cos(2 * t)) / 2;
    assert.ok(hyp(p.x - xa, p.y - ya) < 1e-10, `analytic mismatch at t = ${t}`);
  }
});

test('E x B drift: mean velocity over 20 periods equals (Ey/B, -Ex/B) to 1e-6', () => {
  // Uniform E0 = (0.4, 0), Bz = 2: v_drift = (0, -0.2). Start at rest (cycloid).
  const p = makeChargedParticle({ q: 1, m: 1, x: 0, y: 0, vx: 0, vy: 0 });
  const B = 2, E0 = [0.4, 0], T = Math.PI, periods = 20, stepsPerPeriod = 2048;
  const dt = T / stepsPerPeriod;
  for (let i = 0; i < periods * stepsPerPeriod; i++) {
    stepParticle(p, [], B, dt, { E0 });
  }
  const tTot = periods * T;
  const vxMean = p.x / tTot, vyMean = p.y / tTot;
  assert.ok(Math.abs(vxMean - 0) < 1e-6, `mean vx = ${vxMean}`);
  assert.ok(Math.abs(vyMean - (-0.2)) < 1e-6, `mean vy = ${vyMean} vs -0.2`);
});

test('stepParticle: free flight with no charges and B = 0 is an exact straight line', () => {
  const p = makeChargedParticle({ q: -3, m: 0.5, x: 1, y: -2, vx: 0.25, vy: -0.125 });
  for (let i = 0; i < 64; i++) stepParticle(p, [], 0, 0.25);
  assert.ok(Math.abs(p.x - (1 + 0.25 * 16)) < 1e-15);
  assert.ok(Math.abs(p.y - (-2 - 0.125 * 16)) < 1e-15);
  assert.equal(p.vx, 0.25);
  assert.equal(p.vy, -0.125);
});
