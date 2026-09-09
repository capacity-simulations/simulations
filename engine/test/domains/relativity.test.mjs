// domain.relativity tests — two tiers: golden fidelity vs the SR __audit
// captures, and analytic identities.
//
// Tolerances agreed for M6 (do NOT loosen silently — renegotiate in the plan):
//   Golden gamma          abs error < 1e-12 on EVERY sweep point of all four
//                         goldens (sr-l09, sr-l13, sr-l14, sr-l17); the sims
//                         compute 1/sqrt(1-b^2) in the same double arithmetic.
//   Golden deltaTPrime    abs error < 1e-12: boost2(0, 1, beta)[0] must equal
//                         the captured -gamma*beta (l09 + l13 sweeps).
//   Golden p, E           abs error < 1e-12: p = gamma*beta, E = gamma (l14);
//                         also cross-checked via boost4 of the rest
//                         four-momentum [1, 0, 0, 0] with -beta.
//   boost4 invariance     |mdot(V') - mdot(V)| < 1e-12 * max(1, |mdot|) on 200
//                         seeded-random vectors (components in [-5, 5]) and
//                         betas in (-0.99, 0.99).
//   addVelocities         exact formula match (u+v)/(1+uv) to 1e-15 abs;
//                         |w| <= 1 always, including |u| = 1 endpoints.
//   rapidity round-trip   |betaFromRapidity(rapidity(b)) - b| < 1e-12;
//                         additivity |rapidity(u (+) v) - (phi_u + phi_v)| < 1e-12.
//   properTimeAlong       exact analytic values (3-4-5 style segments) to
//                         1e-12; straight > bent strictly.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  gamma, boost2, unboost2, boost4, minkowskiNormSq, interval,
  rapidity, betaFromRapidity, addVelocities, properTimeAlong,
} from '../../domains/relativity/index.js';

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

/* ================= Tier 1 — golden fidelity ================= */

test('golden sr-l09/l13/l14/l17: gamma matches every sweep point at 1e-12', () => {
  for (const slug of ['sr-l09-worldline-proper-time', 'sr-l13-lorentz-transformations',
    'sr-l14-momentum-vs-velocity', 'sr-l17-photon-worldline']) {
    const g = golden(slug);
    assert.ok(g.sweep.length >= 30, `${slug}: sweep has ${g.sweep.length} points`);
    for (const pt of g.sweep) {
      const err = Math.abs(gamma(pt.input.beta) - pt.output.gamma);
      assert.ok(err < 1e-12, `${slug} beta=${pt.input.beta}: |dgamma| = ${err}`);
    }
  }
});

test('golden sr-l09 + sr-l13: deltaTPrime = boost2(0, 1, beta)[0] at 1e-12', () => {
  for (const slug of ['sr-l09-worldline-proper-time', 'sr-l13-lorentz-transformations']) {
    const g = golden(slug);
    for (const pt of g.sweep) {
      const [ctP] = boost2(0, 1, pt.input.beta);   // unit spatial separation, dt = 0
      const err = Math.abs(ctP - pt.output.deltaTPrime);
      assert.ok(err < 1e-12, `${slug} beta=${pt.input.beta}: |dctPrime| = ${err}`);
    }
  }
});

test('golden sr-l14: p = gamma*beta and E = gamma at 1e-12, cross-checked via boost4', () => {
  const g = golden('sr-l14-momentum-vs-velocity');
  for (const pt of g.sweep) {
    const b = pt.input.beta;
    const gm = gamma(b);
    assert.ok(Math.abs(gm * b - pt.output.momentum) < 1e-12, `p at beta=${b}`);
    assert.ok(Math.abs(gm - pt.output.totalEnergy) < 1e-12, `E at beta=${b}`);
    // Rest four-momentum [E, p, 0, 0] = [1, 0, 0, 0] boosted INTO the lab
    // frame (boost by -beta) must reproduce the sim's (E, p).
    const P = boost4([1, 0, 0, 0], -b);
    assert.ok(Math.abs(P[0] - pt.output.totalEnergy) < 1e-12, `boost4 E at beta=${b}`);
    assert.ok(Math.abs(P[1] - pt.output.momentum) < 1e-12, `boost4 p at beta=${b}`);
  }
});

/* ================= Tier 2 — analytic ================= */

test('gamma: exact values and the |beta| >= 1 RangeError guard', () => {
  assert.equal(gamma(0), 1);
  assert.ok(Math.abs(gamma(0.8) - 5 / 3) < 1e-15);
  assert.ok(Math.abs(gamma(-0.6) - 1.25) < 1e-15);
  for (const bad of [1, -1, 1.5, -2, NaN, Infinity]) {
    assert.throws(() => gamma(bad), RangeError, `gamma(${bad}) must throw`);
  }
});

test('boost2/unboost2: round trip identity at 1e-12', () => {
  const rng = mulberry32(0xB005);
  for (let i = 0; i < 100; i++) {
    const ct = 10 * (rng() - 0.5), x = 10 * (rng() - 0.5);
    const b = 1.9 * (rng() - 0.5);   // in (-0.95, 0.95)
    const [ctP, xP] = boost2(ct, x, b);
    const [ct2, x2] = unboost2(ctP, xP, b);
    assert.ok(Math.abs(ct2 - ct) < 1e-12 && Math.abs(x2 - x) < 1e-12,
      `round trip at beta=${b}: (${ct2 - ct}, ${x2 - x})`);
  }
});

test('boost4: preserves minkowskiNormSq at 1e-12 on seeded-random vectors', () => {
  const rng = mulberry32(0x5EED);
  for (let i = 0; i < 200; i++) {
    const V = [0, 1, 2, 3].map(() => 10 * (rng() - 0.5));
    const b = 1.98 * (rng() - 0.5);   // in (-0.99, 0.99)
    const before = minkowskiNormSq(V);
    const after = minkowskiNormSq(boost4(V, b));
    const tol = 1e-12 * Math.max(1, Math.abs(before));
    assert.ok(Math.abs(after - before) < tol,
      `invariance at beta=${b}: |d| = ${Math.abs(after - before)}`);
  }
  // Transverse components pass through untouched.
  const Vp = boost4([1, 2, 3, 4], 0.5);
  assert.equal(Vp[2], 3);
  assert.equal(Vp[3], 4);
  assert.throws(() => boost4([1, 2, 3], 0.5), RangeError);
});

test('addVelocities: equals (u+v)/(1+uv), bounded by 1, light composes to c', () => {
  const rng = mulberry32(0xADD5);
  for (let i = 0; i < 200; i++) {
    const u = 1.98 * (rng() - 0.5), v = 1.98 * (rng() - 0.5);
    const w = addVelocities(u, v);
    assert.ok(Math.abs(w - (u + v) / (1 + u * v)) < 1e-15, `formula at (${u}, ${v})`);
    assert.ok(Math.abs(w) <= 1, `bounded at (${u}, ${v}): ${w}`);
  }
  assert.equal(addVelocities(1, 0.5), 1);        // light + anything = light
  assert.equal(addVelocities(-1, 0.99), -1);
  assert.ok(Math.abs(addVelocities(0.8, 0.7) - 1.5 / 1.56) < 1e-15);
  assert.throws(() => addVelocities(1.2, 0), RangeError);
  assert.throws(() => addVelocities(1, -1), RangeError);   // undefined composition
});

test('rapidity: round-trips beta at 1e-12 and adds under composition', () => {
  const rng = mulberry32(0x0F1);
  for (let i = 0; i < 100; i++) {
    const b = 1.9 * (rng() - 0.5);
    assert.ok(Math.abs(betaFromRapidity(rapidity(b)) - b) < 1e-12, `round trip at ${b}`);
  }
  for (const [u, v] of [[0.5, 0.5], [0.9, -0.3], [-0.8, -0.1]]) {
    const lhs = rapidity(addVelocities(u, v));
    const rhs = rapidity(u) + rapidity(v);
    assert.ok(Math.abs(lhs - rhs) < 1e-12, `additivity at (${u}, ${v}): ${lhs - rhs}`);
  }
  assert.throws(() => rapidity(1), RangeError);
});

test('interval: classification and eps behavior (default relative, caller override)', () => {
  assert.equal(interval(3, 1).kind, 'timelike');
  assert.equal(interval(1, 3).kind, 'spacelike');
  assert.equal(interval(2, 2).kind, 'lightlike');
  assert.equal(interval(-2, 2).kind, 'lightlike');        // sign of dct irrelevant
  assert.ok(Math.abs(interval(3, 1).ds2 - 8) < 1e-15);
  // Default eps is RELATIVE to the input scale: float noise on a null
  // separation stays lightlike, a genuinely different pair does not.
  assert.equal(interval(1e6, 1e6 * (1 + 1e-15)).kind, 'lightlike');
  assert.equal(interval(1, 1.001).kind, 'spacelike');
  // Caller override (the diagram passes a snap-grid-derived eps, fix #10).
  assert.equal(interval(2.0, 2.1, { lightlikeEps: 0.5 }).kind, 'lightlike');
  assert.equal(interval(2.0, 2.1, { lightlikeEps: 0.1 }).kind, 'spacelike');
});

test('properTimeAlong: exact segment sums; straight timelike path is maximal', () => {
  // Straight: (0,0) -> (5,0): tau = 5. Bent via (2.5, 1.5): 2*sqrt(2.5^2-1.5^2) = 4.
  const straight = properTimeAlong([{ ct: 0, x: 0 }, { ct: 5, x: 0 }]);
  const bent = properTimeAlong([{ ct: 0, x: 0 }, { ct: 2.5, x: 1.5 }, { ct: 5, x: 0 }]);
  assert.ok(Math.abs(straight - 5) < 1e-12);
  assert.ok(Math.abs(bent - 4) < 1e-12);
  assert.ok(straight > bent, 'straight worldline accumulates MORE proper time');
  // Lightlike segments contribute zero; spacelike segments poison to NaN.
  assert.ok(Math.abs(properTimeAlong([[0, 0], [2, 2], [5, 2]]) - 3) < 1e-12);
  assert.ok(Number.isNaN(properTimeAlong([{ ct: 0, x: 0 }, { ct: 1, x: 3 }])));
  // Array-pair and object forms agree.
  assert.equal(properTimeAlong([[0, 0], [5, 3]]),
    properTimeAlong([{ ct: 0, x: 0 }, { ct: 5, x: 3 }]));
});
