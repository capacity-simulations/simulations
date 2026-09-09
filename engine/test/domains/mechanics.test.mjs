// domain.mechanics tests — golden fidelity vs the CM __audit captures plus
// analytic identities.
//
// Tolerances agreed for M6b (do NOT loosen silently — renegotiate in the plan):
//   solveKepler residual   |E − e·sinE − M| < 1e-12 on the full (M, e) grid,
//                          elliptic AND hyperbolic (|e·sinhF − F − M| < 1e-12).
//   Kepler third law       |T²·mu − 4π²a³| relative < 1e-10 (closed form);
//                          T²/a³ ratio pairwise equal at 1e-10.
//   pendulumPeriodRatio    golden l9-pendulum periodRatio abs < 1e-12 at EVERY
//                          sweep point (the engine copy IS the audit AGM).
//   terminal velocity      golden l16-friction terminalVelocity abs < 1e-12
//                          (= m·g/b = 32.7 exactly at the capture sliders);
//                          quadratic terminal speed balances gravity at 1e-10.
//   restitution            momentum conserved at 1e-12; golden collisions
//                          keAfter/dKE abs < 1e-12 (e = 0 captures);
//                          dKE = −½μ(1−e²)u² at 1e-10 across an e-sweep;
//                          restitution relation v2'−v1' = −e(v2−v1) at 1e-12.
//   explosionOutcome       momentum exactly 0 (abs < 1e-15); KE = Q at 1e-12.
//   orbit consistency      e² = 1 + 2·E·L²/mu² at 1e-12; position/r(theta)
//                          agreement at 1e-12.
//   classifyOrbitByEnergy  exact regime strings on all four regimes + throw
//                          below the minimum.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  solveKepler, orbitFromPeriapsis, pendulumPeriodRatio,
  dragForceLinear, dragForceQuadratic, terminalVelocity,
  restitutionCollision1D, explosionOutcome,
  effectivePotential, classifyOrbitByEnergy,
} from '../../domains/mechanics/index.js';

const golden = (slug) =>
  JSON.parse(readFileSync(new URL(`../golden/${slug}.json`, import.meta.url), 'utf8'));

/* Deterministic seeded RNG (mulberry32) — no Math.random in tests. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= solveKepler ================= */

test('solveKepler elliptic: residual < 1e-12 across the (M, e) grid', () => {
  const es = [0, 0.05, 0.1, 0.3, 0.6, 0.9, 0.95, 0.99];
  for (const e of es) {
    for (let M = -3 * Math.PI; M <= 3 * Math.PI + 1e-9; M += Math.PI / 12) {
      const E = solveKepler(M, e);
      const res = Math.abs(E - e * Math.sin(E) - M);
      assert.ok(res < 1e-12, `e=${e}, M=${M}: residual ${res}`);
    }
  }
});

test('solveKepler hyperbolic: residual < 1e-12 across the (M, e) grid', () => {
  const es = [1.05, 1.2, 1.5, 2, 3, 5, 10];
  for (const e of es) {
    for (let M = -20; M <= 20 + 1e-9; M += 1.25) {
      const F = solveKepler(M, e);
      const res = Math.abs(e * Math.sinh(F) - F - M);
      assert.ok(res < 1e-12, `e=${e}, M=${M}: residual ${res}`);
    }
  }
});

test('solveKepler: e = 0 gives E = M exactly; e = 1 and bad inputs throw', () => {
  assert.equal(solveKepler(1.234, 0), 1.234);
  assert.throws(() => solveKepler(1, 1), RangeError);
  assert.throws(() => solveKepler(1, -0.5), RangeError);
  assert.throws(() => solveKepler(NaN, 0.5), RangeError);
});

/* ================= orbitFromPeriapsis ================= */

test('orbitFromPeriapsis: Kepler third law T² mu = 4π²a³ at 1e-10, pairwise ratio equal', () => {
  const mu = 4 * Math.PI * Math.PI; // L37 units: T = sqrt(a^3)
  const cases = [];
  for (const a of [0.387, 0.723, 1.0, 1.524, 2.766, 5.203, 9.537]) {
    const orb = orbitFromPeriapsis(a, 0.3, mu);
    const lhs = orb.period * orb.period * mu;
    const rhs = 4 * Math.PI * Math.PI * a * a * a;
    assert.ok(Math.abs(lhs - rhs) / rhs < 1e-10, `a=${a}: third-law residual`);
    // In L37 units the period must be exactly sqrt(a^3).
    assert.ok(Math.abs(orb.period - Math.sqrt(a * a * a)) < 1e-10 * orb.period, `a=${a}: T = sqrt(a^3)`);
    cases.push({ a, T: orb.period });
  }
  for (let i = 1; i < cases.length; i++) {
    const r0 = (cases[0].T * cases[0].T) / (cases[0].a ** 3);
    const ri = (cases[i].T * cases[i].T) / (cases[i].a ** 3);
    assert.ok(Math.abs(ri - r0) / r0 < 1e-10, `T^2/a^3 constant (a=${cases[i].a})`);
  }
});

test('orbitFromPeriapsis: geometry, energy, angular momentum are mutually consistent', () => {
  const rng = mulberry32(20260805);
  for (let trial = 0; trial < 50; trial++) {
    const a = 0.2 + 5 * rng();
    const e = 0.95 * rng();
    const mu = 0.5 + 4 * rng();
    const orb = orbitFromPeriapsis(a, e, mu);
    // Apsides from both representations.
    assert.ok(Math.abs(orb.r(0) - a * (1 - e)) < 1e-12 * a, 'periapsis via r(0)');
    assert.ok(Math.abs(orb.r(Math.PI) - a * (1 + e)) < 1e-12 * a, 'apoapsis via r(pi)');
    assert.ok(Math.abs(orb.periapsis - a * (1 - e)) < 1e-15 * a);
    assert.ok(Math.abs(orb.apoapsis - a * (1 + e)) < 1e-15 * a);
    // position(E) matches r(theta) through the E <-> theta relation.
    for (const E of [0, 0.4, 1.3, Math.PI / 2, 2.5, Math.PI]) {
      const { x, y } = orb.position(E);
      const r = Math.hypot(x, y);
      assert.ok(Math.abs(r - a * (1 - e * Math.cos(E))) < 1e-12 * a, 'r from E');
      const theta = Math.atan2(y, x);
      assert.ok(Math.abs(orb.r(theta) - r) < 1e-11 * a, 'conic r(theta) agrees');
    }
    // Vis-viva bookkeeping: e^2 = 1 + 2 E L^2 / mu^2 (L36 eccentricityFromE).
    const lhs = 1 + (2 * orb.energy * orb.angularMomentum * orb.angularMomentum) / (mu * mu);
    assert.ok(Math.abs(lhs - e * e) < 1e-12, `e² identity, trial ${trial}`);
    // Specific energy is −mu/(2a).
    assert.ok(Math.abs(orb.energy + mu / (2 * a)) < 1e-15 * Math.abs(orb.energy) + 1e-15);
  }
  assert.throws(() => orbitFromPeriapsis(1, 1, 1), RangeError);
  assert.throws(() => orbitFromPeriapsis(-1, 0.5, 1), RangeError);
});

/* ================= pendulumPeriodRatio (golden l9) ================= */

test('golden l9-pendulum: pendulumPeriodRatio matches every sweep point at 1e-12', () => {
  const g = golden('l9-pendulum');
  assert.ok(g.sweep.length >= 10, `sweep has ${g.sweep.length} points`);
  for (const pt of g.sweep) {
    const err = Math.abs(pendulumPeriodRatio(pt.input.theta0Rad) - pt.output.periodRatio);
    assert.ok(err < 1e-12, `theta0=${pt.input.theta0Deg}deg: |dratio| = ${err}`);
  }
  // Small-angle expansion sanity: T/T0 -> 1 + theta0^2/16.
  const th = 0.02;
  assert.ok(Math.abs(pendulumPeriodRatio(th) - (1 + (th * th) / 16)) < 1e-8);
  assert.throws(() => pendulumPeriodRatio(Math.PI), RangeError);
});

/* ================= drag (golden l16) ================= */

test('golden l16-friction: terminalVelocity = m·g/b = 32.7 on every sweep point at 1e-12', () => {
  const g = golden('l16-friction-in-3d');
  assert.ok(g.sweep.length >= 10);
  for (const pt of g.sweep) {
    const { m, b } = pt.input;
    const vT = terminalVelocity(m, 9.81, b);
    assert.ok(Math.abs(vT - pt.output.terminalVelocity) < 1e-12,
      `theta=${pt.input.thetaDeg}: vT=${vT} vs golden ${pt.output.terminalVelocity}`);
    // Quadratic terminal speed from the golden balances gravity: −c|v|v = −m·g.
    const vTq = pt.output.terminalVelocityQuad;
    const F = dragForceQuadratic(-vTq, pt.input.c); // falling at terminal speed
    assert.ok(Math.abs(F - m * 9.81) < 1e-10, `quad terminal balance: F=${F}`);
  }
});

test('drag closed forms: F = −b·v and F = −c·|v|·v, scalar and vector', () => {
  assert.equal(dragForceLinear(3, 0.5), -1.5);
  assert.deepEqual(dragForceLinear([2, -4], 0.5), [-1, 2]);
  assert.ok(Math.abs(dragForceQuadratic(3, 0.1) - (-0.9)) < 1e-15);
  assert.ok(Math.abs(dragForceQuadratic(-3, 0.1) - 0.9) < 1e-15); // opposes motion both ways
  const F = dragForceQuadratic([3, 4], 0.1); // speed 5
  assert.ok(Math.abs(F[0] + 0.1 * 5 * 3) < 1e-15 && Math.abs(F[1] + 0.1 * 5 * 4) < 1e-15);
  const Ft = dragForceQuadratic(new Float64Array([3, 4]), 0.1);
  assert.ok(Ft instanceof Float64Array && Math.abs(Ft[1] + 2) < 1e-15);
  assert.throws(() => terminalVelocity(1, 9.81, 0), RangeError);
});

/* ================= collisions (golden) ================= */

test('golden collisions: e = 0 sweep — momentum 1e-12, keAfter/dKE 1e-12, dKE formula 1e-10', () => {
  const g = golden('collisions');
  assert.ok(g.sweep.length >= 10);
  for (const pt of g.sweep) {
    const { m1, m2, v1, v2 } = pt.input;
    const e = pt.output.e;
    const [v1p, v2p] = restitutionCollision1D(m1, v1, m2, v2, e);
    const pBefore = m1 * v1 + m2 * v2;
    const pAfter = m1 * v1p + m2 * v2p;
    assert.ok(Math.abs(pAfter - pBefore) < 1e-12, `momentum, m1=${m1}`);
    assert.ok(Math.abs(pBefore - pt.output.pBefore) < 1e-12);
    assert.ok(Math.abs(pAfter - pt.output.pAfter) < 1e-12);
    const keAfter = 0.5 * m1 * v1p * v1p + 0.5 * m2 * v2p * v2p;
    assert.ok(Math.abs(keAfter - pt.output.keAfter) < 1e-12, `keAfter, m1=${m1}`);
    const dKE = keAfter - (0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2);
    assert.ok(Math.abs(dKE - pt.output.dKE) < 1e-12, `dKE vs golden, m1=${m1}`);
    const mu = (m1 * m2) / (m1 + m2);
    const u = v1 - v2;
    assert.ok(Math.abs(dKE + 0.5 * mu * (1 - e * e) * u * u) < 1e-10, `dKE formula, m1=${m1}`);
    // e = 0: both leave at v_cm (the source's perfectly-inelastic branch).
    const vcm = pBefore / (m1 + m2);
    assert.ok(Math.abs(v1p - vcm) < 1e-12 && Math.abs(v2p - vcm) < 1e-12);
    assert.ok(Math.abs(vcm - pt.output.vcm) < 1e-12);
  }
});

test('restitution sweep 0 <= e <= 1: momentum 1e-12, dKE = −½μ(1−e²)u² 1e-10, relation 1e-12', () => {
  const rng = mulberry32(42424242);
  for (let trial = 0; trial < 200; trial++) {
    const m1 = 0.2 + 5 * rng();
    const m2 = 0.2 + 5 * rng();
    const v1 = -5 + 10 * rng();
    const v2 = -5 + 10 * rng();
    const e = rng();
    const [v1p, v2p] = restitutionCollision1D(m1, v1, m2, v2, e);
    assert.ok(Math.abs(m1 * v1p + m2 * v2p - (m1 * v1 + m2 * v2)) < 1e-12, `momentum, trial ${trial}`);
    assert.ok(Math.abs((v2p - v1p) - (-e * (v2 - v1))) < 1e-12, `restitution relation, trial ${trial}`);
    const mu = (m1 * m2) / (m1 + m2);
    const u = v1 - v2;
    const dKE = 0.5 * m1 * v1p * v1p + 0.5 * m2 * v2p * v2p
      - (0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2);
    assert.ok(Math.abs(dKE + 0.5 * mu * (1 - e * e) * u * u) < 1e-10, `dKE formula, trial ${trial}`);
  }
  // Elastic limit reproduces the source's dedicated elastic branch.
  const [ve1, ve2] = restitutionCollision1D(1, 2, 1, -2, 1);
  assert.ok(Math.abs(ve1 + 2) < 1e-15 && Math.abs(ve2 - 2) < 1e-15, 'equal-mass elastic swap');
  assert.throws(() => restitutionCollision1D(1, 0, 1, 0, 1.2), RangeError);
});

test('explosionOutcome: momentum exactly 0, KE released = Q at 1e-12 (golden defaults case)', () => {
  const rng = mulberry32(777);
  for (let trial = 0; trial < 100; trial++) {
    const m1 = 0.2 + 5 * rng();
    const m2 = 0.2 + 5 * rng();
    const Q = 8 * rng();
    const [v1, v2] = explosionOutcome(m1, m2, Q);
    assert.ok(Math.abs(m1 * v1 + m2 * v2) < 1e-15 * Math.max(1, m1 * Math.abs(v1)), 'momentum 0');
    const ke = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
    assert.ok(Math.abs(ke - Q) < 1e-12 * Math.max(1, Q), `KE = Q, trial ${trial}`);
    assert.ok(v1 >= 0 && v2 <= 0, 'fragment 1 goes +x, fragment 2 goes −x (source convention)');
  }
  // Collisions.html defaults: m1 = m2 = 1, Q = 4 -> p* = 2, v = ±2.
  const [va, vb] = explosionOutcome(1, 1, 4);
  assert.ok(Math.abs(va - 2) < 1e-15 && Math.abs(vb + 2) < 1e-15);
  assert.throws(() => explosionOutcome(1, 1, -1), RangeError);
});

/* ================= effective potential & orbit classification ================= */

test('effectivePotential: L36 values, minimum at r_c = L²/mu with Veff = −mu²/(2L²)', () => {
  // L36 units: GM = m = L = 1 -> Veff(r) = −1/r + 1/(2r²), min −0.5 at r = 1.
  const Veff = effectivePotential(1, 1);
  assert.ok(Math.abs(Veff(1) - (-0.5)) < 1e-15);
  assert.ok(Math.abs(Veff(2) - (-1 / 2 + 1 / 8)) < 1e-15);
  // Minimum location/depth for general L, mu.
  const L = 1.7;
  const mu = 2.3;
  const V = effectivePotential(L, mu);
  const rc = (L * L) / mu;
  const vmin = -(mu * mu) / (2 * L * L);
  assert.ok(Math.abs(V(rc) - vmin) < 1e-14);
  const h = 1e-5;
  const slope = (V(rc + h) - V(rc - h)) / (2 * h);
  assert.ok(Math.abs(slope) < 1e-8, `dVeff/dr at r_c = ${slope}`);
});

test('classifyOrbitByEnergy: all four regimes + throw below the minimum', () => {
  const vmin = -0.5; // L36 E_MIN at L = mu = 1
  assert.equal(classifyOrbitByEnergy(vmin, vmin), 'circular');
  assert.equal(classifyOrbitByEnergy(vmin + 5e-5, vmin), 'circular'); // inside eps band
  assert.equal(classifyOrbitByEnergy(-0.3, vmin), 'bound');
  assert.equal(classifyOrbitByEnergy(0, vmin), 'parabolic');
  assert.equal(classifyOrbitByEnergy(5e-5, vmin), 'parabolic'); // source ±1e-4 band
  assert.equal(classifyOrbitByEnergy(0.5, vmin), 'unbound');
  assert.throws(() => classifyOrbitByEnergy(-0.6, vmin), RangeError);
  // Tighter eps narrows the special bands.
  assert.equal(classifyOrbitByEnergy(5e-5, vmin, { eps: 1e-6 }), 'unbound');
  assert.equal(classifyOrbitByEnergy(vmin + 5e-5, vmin, { eps: 1e-6 }), 'bound');
});
