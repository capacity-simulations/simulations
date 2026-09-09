// core.integrate tests — three tiers: analytic, golden fidelity, event stepper.
//
// Tolerances agreed for M3 (do NOT loosen silently — renegotiate in the plan):
//   RK4 exp decay        abs error < 1e-6 at h = 0.1; halving h shrinks error
//                        by 14–18x (4th order => 16, +-12% slack for the
//                        higher-order terms of the exponential).
//   Verlet energy        |dE/E| < 1e-6 over 1e5 steps of a circular orbit at
//                        h = 5e-4 (velocity Verlet oscillates at O(h^2) ~ 1e-7
//                        here; no secular drift).
//   stepRotate norm      relative norm change < 1e-14 after 1000 composed
//                        rotations (pure round-off random walk, ~3e-15).
//   Semi-implicit SHM    |dE/E| < 2e-2 over 1e4 steps at h = 0.01 (symplectic
//                        Euler oscillates at ~ omega*h/2 = 5e-3, never grows).
//   stepAdaptive         abs error < 1e-7 integrating y' = -y to t = 5 at
//                        tol = 1e-10 (per-step tolerance, ~50 accepted steps).
//   Golden l9 pendulum   periodRatio within 1e-6 RELATIVE of the sim's AGM
//                        value (RK4 h = 1e-3 + bisect-refined zero crossing:
//                        integration error ~ h^4, crossing error ~ h^3 * tol).
//   Golden l17 damped HO alpha fit within 1e-4 RELATIVE of golden decayRate
//                        (peak-ratio fit over one damped period; RK4 h = 1e-3).
//   Golden l36 scatter   |psi - 2*atan(invBV2)| < 1e-6 rad (launch on the
//                        asymptote at r = 1e7 keeps truncation ~1e-7; stepAdaptive
//                        tol = 1e-12 keeps integration error ~1e-7);
//                        rmin within 1e-4 relative of rminExact (rmin is sampled
//                        at accepted steps, offset <= h/2 near closest approach).
//   Golden l7 potential  energy invariant |E(t) - E| < 1e-9 along the whole
//                        track; speed at the minimum within 1e-6 relative of
//                        golden speedAtMin; speed at x = 1.5 within 1e-6
//                        relative of golden vAtX.
//   Galperin             collision counts are EXACT integers: 3 at mass ratio
//                        100^0, 31 at 100^1 (the pi-digit signature).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  stepRK4, stepVerlet, stepSemiImplicit, stepRotate, stepAdaptive, makeEventStepper,
} from '../../core/integrate.js';
import { bisect } from '../../core/roots.js';

const golden = (slug) =>
  JSON.parse(readFileSync(new URL(`../golden/${slug}.json`, import.meta.url), 'utf8'));

/* ================= Tier 1 — analytic ================= */

test('stepRK4: y\' = -y matches exp(-t) with 4th-order convergence', () => {
  const deriv = (y) => [-y[0]];
  const errAt = (h) => {
    let y = [1];
    let t = 0;
    const steps = Math.round(1 / h);
    for (let i = 0; i < steps; i++) { y = stepRK4(deriv, y, t, h); t += h; }
    return Math.abs(y[0] - Math.exp(-1));
  };
  const e1 = errAt(0.1);
  const e2 = errAt(0.05);
  assert.ok(e1 > 0 && e1 < 1e-6, `error at h=0.1 is ${e1}`);
  const ratio = e1 / e2;
  assert.ok(ratio > 14 && ratio < 18, `4th-order convergence: e(h)/e(h/2) = ${ratio}, expected ~16`);
});

test('stepRK4: works on Float64Array and never mutates the input', () => {
  const deriv = (y) => [y[1], -y[0]];
  const yTyped = new Float64Array([1, 0]);
  const outTyped = stepRK4(deriv, yTyped, 0, 0.1);
  assert.ok(outTyped instanceof Float64Array, 'Float64Array in -> Float64Array out');
  assert.deepEqual(Array.from(yTyped), [1, 0], 'input untouched');

  const yArr = [1, 0];
  const outArr = stepRK4(deriv, yArr, 0, 0.1);
  assert.ok(Array.isArray(outArr), 'Array in -> Array out');
  assert.deepEqual(yArr, [1, 0], 'input untouched');
  assert.ok(Math.abs(outTyped[0] - outArr[0]) === 0, 'identical arithmetic for both kinds');
});

test('stepVerlet: circular-orbit energy drift bounded (|dE/E| < 1e-6 over 1e5 steps)', () => {
  const accel = (p) => {
    const r2 = p[0] * p[0] + p[1] * p[1];
    const r3 = r2 * Math.sqrt(r2);
    return [-p[0] / r3, -p[1] / r3];
  };
  const pos = [1, 0];
  const vel = [0, 1];
  const energy = () =>
    0.5 * (vel[0] * vel[0] + vel[1] * vel[1]) - 1 / Math.hypot(pos[0], pos[1]);
  const E0 = energy();
  const h = 5e-4;
  let maxDrift = 0;
  for (let i = 0; i < 100000; i++) {
    stepVerlet(accel, pos, vel, h);
    const d = Math.abs((energy() - E0) / E0);
    if (d > maxDrift) maxDrift = d;
  }
  assert.ok(maxDrift < 1e-6, `max |dE/E| = ${maxDrift}`);
});

test('stepVerlet: safe against an accel that reuses its output buffer', () => {
  const buf = [0];
  const accelReuse = (p) => { buf[0] = -p[0]; return buf; };   // shared buffer
  const accelFresh = (p) => [-p[0]];
  const h = 0.05;
  const p1 = [1], v1 = [0];
  const p2 = [1], v2 = [0];
  for (let i = 0; i < 200; i++) {
    stepVerlet(accelReuse, p1, v1, h);
    stepVerlet(accelFresh, p2, v2, h);
  }
  assert.equal(p1[0], p2[0], 'positions identical (a0 copied before pos moves)');
  assert.equal(v1[0], v2[0], 'rates identical');
});

test('stepRotate: norm preserved to 1e-14 per application, no secular growth', () => {
  let v = [0.3, -1.7];
  const n0 = Math.hypot(v[0], v[1]);
  let nPrev = n0;
  for (let i = 0; i < 1000; i++) {
    v = stepRotate(v, null, 0.1 + 0.001 * (i % 7));
    const n = Math.hypot(v[0], v[1]);
    assert.ok(Math.abs(n - nPrev) / nPrev < 1e-14, `step ${i}: per-application norm change`);
    nPrev = n;
  }
  // Round-off random walk only (~sqrt(1000)*eps), no forward-Euler-style growth.
  assert.ok(Math.abs(nPrev - n0) / n0 < 1e-13, `total drift ${Math.abs(nPrev - n0) / n0}`);
});

test('stepRotate: correct sense, 2-arg form, and v1 axis guard', () => {
  const r = stepRotate([1, 0], null, Math.PI / 2);
  assert.ok(Math.abs(r[0]) < 1e-15 && Math.abs(r[1] - 1) < 1e-15, '+90 deg is CCW: [1,0] -> [0,1]');
  const r2 = stepRotate([1, 0], Math.PI / 2);            // (vec, angle) shorthand
  assert.deepEqual(r2, r);
  const t = stepRotate(new Float64Array([2, 0]), null, Math.PI);
  assert.ok(t instanceof Float64Array, 'kind preserved');
  assert.throws(() => stepRotate([1, 0], [0, 0, 1], 0.1), RangeError, '3D axis rejected in v1');
});

test('stepSemiImplicit: SHM stays bounded over 1e4 steps (no forward-Euler blow-up)', () => {
  const accel = (p) => [-p[0]];
  const pos = [1];
  const vel = [0];
  const h = 0.01;
  const E0 = 0.5;
  let maxDrift = 0;
  for (let i = 0; i < 10000; i++) {
    stepSemiImplicit(accel, pos, vel, h);
    const E = 0.5 * (vel[0] * vel[0] + pos[0] * pos[0]);
    const d = Math.abs((E - E0) / E0);
    if (d > maxDrift) maxDrift = d;
  }
  assert.ok(maxDrift < 2e-2, `max |dE/E| = ${maxDrift} (symplectic oscillation ~ omega*h/2)`);
});

test('stepSemiImplicit: accel receives the rate array (damping decays the state)', () => {
  const accel = (p, v) => [-p[0] - 0.5 * v[0]];
  const pos = [1];
  const vel = [0];
  for (let i = 0; i < 5000; i++) stepSemiImplicit(accel, pos, vel, 0.01);
  const E = 0.5 * (vel[0] * vel[0] + pos[0] * pos[0]);
  assert.ok(E < 1e-3, `damped state decayed (E = ${E})`);
});

test('stepAdaptive: hits tolerance on y\' = -y, grows h when smooth, shrinks when stiff', () => {
  const deriv = (y) => [-y[0]];
  let y = [1];
  let t = 0;
  let h = 1e-3;
  let hMaxSeen = 0;
  while (t < 5) {
    const r = stepAdaptive(deriv, y, t, Math.min(h, 5 - t), { tol: 1e-10, hMin: 1e-12, hMax: 0.5 });
    y = r.y; t += r.hUsed; h = r.hNext;
    if (r.hUsed > hMaxSeen) hMaxSeen = r.hUsed;
  }
  assert.ok(Math.abs(y[0] - Math.exp(-5)) < 1e-7, `|error| = ${Math.abs(y[0] - Math.exp(-5))}`);
  assert.ok(hMaxSeen > 1e-2, `h grew from 1e-3 to ${hMaxSeen} on a smooth problem`);

  const stiff = (z) => [-1000 * z[0]];
  const r = stepAdaptive(stiff, [1], 0, 1, { tol: 1e-8, hMin: 1e-12 });
  assert.ok(r.hUsed < 0.05, `stiff step shrank to ${r.hUsed}`);
  assert.ok(Number.isFinite(r.y[0]), 'accepted step is finite');
});

test('makeEventStepper: exact bounce timing, tie-break, and per-step event cap', () => {
  const make = (cap) => makeEventStepper({
    state: { x: 0.5, v: 1, bounces: 0 },
    advance: (s, dt) => { s.x += s.v * dt; },
    events: [
      { detect: (s) => (s.v > 0 ? (1 - s.x) / s.v : null),
        resolve: (s) => { s.v = -s.v; s.x = 1; s.bounces++; } },
      { detect: (s) => (s.v < 0 ? -s.x / s.v : null),
        resolve: (s) => { s.v = -s.v; s.x = 0; s.bounces++; } },
    ],
    maxEventsPerStep: cap,
  });

  const es = make(1000);
  const r = es.step(10.25);                       // bounces at t = 0.5, 1.5, ..., 9.5
  assert.equal(es.state.bounces, 10);
  assert.equal(r.events, 10);
  assert.equal(r.spent, 10.25);
  // 10th bounce (t = 9.5) is at the x = 0 wall, then +0.75 of free flight.
  assert.ok(Math.abs(es.state.x - 0.75) < 1e-12, `triangle-wave position, got ${es.state.x}`);

  const capped = make(3);
  const rc = capped.step(10.25);                  // cap hits after the 3rd bounce at t = 2.5
  assert.equal(rc.events, 3);
  assert.equal(rc.spent, 2.5);
  assert.equal(capped.state.x, 1);                // state consistent at the last event
});

/* ================= Tier 2 — golden fidelity (source reimplementation) ================= */

test('golden l9-pendulum: RK4 period of theta\'\' = -sin(theta) matches AGM periodRatio (1e-6 rel)', () => {
  const g = golden('l9-pendulum');
  const deriv = (y) => [y[1], -Math.sin(y[0])];   // g/L = 1 => T0 = 2*pi
  const h = 1e-3;
  const quarterPeriod = (theta0) => {
    let y = [theta0, 0];
    let t = 0;
    for (let i = 0; i < 1e6; i++) {
      const yn = stepRK4(deriv, y, t, h);
      if (yn[0] <= 0) {                            // release from rest: theta = 0 at exactly T/4
        const dtC = bisect((dt) => stepRK4(deriv, y, t, dt)[0], 0, h, { tol: 1e-14 });
        assert.ok(dtC != null, 'crossing refined');
        return t + dtC;
      }
      y = yn; t += h;
    }
    assert.fail('no zero crossing found');
  };
  for (const deg of [5, 10, 20, 30, 45, 60, 75, 90]) {
    const entry = g.sweep.find((s) => s.input.theta0Deg === deg);
    assert.ok(entry, `golden entry at ${deg} deg`);
    const ratio = (4 * quarterPeriod(entry.input.theta0Rad)) / (2 * Math.PI);
    const rel = Math.abs(ratio - entry.output.periodRatio) / entry.output.periodRatio;
    assert.ok(rel < 1e-6, `theta0 = ${deg} deg: periodRatio ${ratio} vs golden ${entry.output.periodRatio} (rel ${rel})`);
  }
});

test('golden l17-damped-ho: peak-ratio decay fit of RK4 track matches decayRate (1e-4 rel)', () => {
  const g = golden('l17-damped-ho');
  const W0 = 3;                                    // from the source sim (omega0)
  for (const alpha of [0.5, 1.5, 2.5]) {           // underdamped: decayRate = alpha
    const entry = g.sweep.find((s) => Math.abs(s.input.alpha - alpha) < 1e-12);
    assert.ok(entry, `golden entry at alpha = ${alpha}`);
    const deriv = (y) => [y[1], -2 * alpha * y[1] - W0 * W0 * y[0]];
    const h = 1e-3;
    let y = [1, 0];                                // t = 0 is itself a positive peak (v = 0)
    let t = 0;
    let fitted = null;
    for (let i = 0; i < 2e5; i++) {
      const yn = stepRK4(deriv, y, t, h);
      if (y[1] > 1e-12 && yn[1] <= 0) {            // v: + -> -, the next same-side peak (t = Td)
        const dtC = bisect((dt) => stepRK4(deriv, y, t, dt)[1], 0, h, { tol: 1e-14 });
        assert.ok(dtC != null, 'peak refined');
        const peak = stepRK4(deriv, y, t, dtC);
        const tPeak = t + dtC;
        fitted = Math.log(1 / peak[0]) / tPeak;    // x(0) = 1, x(Td) = exp(-alpha*Td)
        break;
      }
      y = yn; t += h;
    }
    assert.ok(fitted != null, 'peak found');
    const rel = Math.abs(fitted - entry.output.decayRate) / entry.output.decayRate;
    assert.ok(rel < 1e-4, `alpha = ${alpha}: fitted ${fitted} vs golden ${entry.output.decayRate} (rel ${rel})`);
  }
});

test('golden l36-scattering: stepAdaptive Coulomb track reproduces analytic deflection (1e-6 abs)', () => {
  const g = golden('l36-scattering-extension');
  // Repulsive 1/r potential, K = m = 1 (source constants): a = +r_hat / r^2.
  const deriv = (y) => {
    const r2 = y[0] * y[0] + y[1] * y[1];
    const r3 = r2 * Math.sqrt(r2);
    return [y[2], y[3], y[0] / r3, y[1] / r3];
  };
  const R_FAR = 1e7;                               // launch/exit on the asymptote (offset ~ b/(2*R_FAR))
  for (const b of [0.1, 0.5, 1.0, 2.0, 3.0]) {
    const entry = g.sweep.find((s) => Math.abs(s.input.b - b) < 1e-9);
    assert.ok(entry, `golden entry at b = ${b}`);
    // Sim audit relation: tan(psi/2) = K/(m*b*v^2) = invBV2  =>  psi = 2*atan(invBV2).
    const psiRef = 2 * Math.atan(entry.output.invBV2);
    const v = entry.input.v;
    let y = [-Math.sqrt(R_FAR * R_FAR - b * b), b, v, 0];
    let t = 0;
    let h = 1;
    let rmin = R_FAR;
    let guard = 0;
    for (;;) {
      const r = stepAdaptive(deriv, y, t, h, { tol: 1e-12, hMin: 1e-9, hMax: 1e5 });
      y = r.y; t += r.hUsed; h = r.hNext;
      const rr = Math.hypot(y[0], y[1]);
      if (rr < rmin) rmin = rr;
      if (rr > R_FAR) break;
      if (++guard > 2e6) assert.fail('step budget exceeded');
    }
    const psi = Math.abs(Math.atan2(y[3], y[2]));
    assert.ok(Math.abs(psi - psiRef) < 1e-6,
      `b = ${b}: psi ${psi} vs analytic ${psiRef} (|diff| ${Math.abs(psi - psiRef)})`);
    const relR = Math.abs(rmin - entry.output.rminExact) / entry.output.rminExact;
    assert.ok(relR < 1e-4, `b = ${b}: rmin ${rmin} vs golden rminExact ${entry.output.rminExact} (rel ${relR})`);
  }
});

test('golden l7-potential: RK4 track conserves E and lands golden speeds (1e-6 rel)', () => {
  const g = golden('l7-motion-in-a-potential');
  const V = (x) => x * x * x / 3 - x;              // source potential, s = 1
  const E = 0.30;                                  // golden captured at the default E slider
  const out0 = g.sweep[0].output;
  const xR = bisect((x) => V(x) - E, 1, 3.8, { tol: 1e-14 });  // source bracket for the right turning point
  assert.ok(xR != null && Math.abs(V(xR) - E) < 1e-12, 'right turning point');

  const deriv = (y) => [y[1], -(y[0] * y[0] - 1)]; // a = -V'(x)/m, m = 1
  const h = 1e-3;
  let y = [xR, 0];                                 // release from rest at the turning point
  let t = 0;
  let maxEnergyDev = 0;
  const speedAt = {};                              // leftward crossings of probe positions
  const probes = [1.5, 1.0];
  for (let i = 0; i < 1e5 && Object.keys(speedAt).length < probes.length; i++) {
    const yn = stepRK4(deriv, y, t, h);
    for (const c of probes) {
      if (!(c in speedAt) && y[0] > c && yn[0] <= c) {
        const dtC = bisect((dt) => stepRK4(deriv, y, t, dt)[0] - c, 0, h, { tol: 1e-14 });
        assert.ok(dtC != null, `crossing at x = ${c} refined`);
        speedAt[c] = Math.abs(stepRK4(deriv, y, t, dtC)[1]);
      }
    }
    y = yn; t += h;
    const dev = Math.abs(0.5 * y[1] * y[1] + V(y[0]) - E);
    if (dev > maxEnergyDev) maxEnergyDev = dev;
  }
  assert.ok(maxEnergyDev < 1e-9, `energy invariant: max |v^2/2 + V(x) - E| = ${maxEnergyDev}`);

  const relMin = Math.abs(speedAt[1.0] - out0.speedAtMin) / out0.speedAtMin;
  assert.ok(relMin < 1e-6, `speed at minimum ${speedAt[1.0]} vs golden ${out0.speedAtMin} (rel ${relMin})`);

  const e15 = g.sweep.find((s) => Math.abs(s.input.x - 1.5) < 1e-9);
  assert.ok(e15, 'golden entry at x = 1.5');
  const rel15 = Math.abs(speedAt[1.5] - e15.output.vAtX) / e15.output.vAtX;
  assert.ok(rel15 < 1e-6, `speed at x=1.5 ${speedAt[1.5]} vs golden vAtX ${e15.output.vAtX} (rel ${rel15})`);
});

/* ================= Tier 3 — event stepper signature test ================= */

test('makeEventStepper: Galperin collision counts — 3 at ratio 100^0, 31 at 100^1', () => {
  const countCollisions = (massRatio) => {
    const stepper = makeEventStepper({
      state: { x1: 1, v1: 0, x2: 2, v2: -1, m1: 1, m2: massRatio, count: 0 },
      advance: (s, dt) => { s.x1 += s.v1 * dt; s.x2 += s.v2 * dt; },
      events: [
        { // wall at x = 0 (listed first: ties go to the wall, as in the source)
          detect: (s) => (s.v1 < -1e-15 ? -s.x1 / s.v1 : null),
          resolve: (s) => { s.v1 = -s.v1; s.x1 = 0; s.count++; },
        },
        { // elastic block-block collision
          detect: (s) => {
            const closing = s.v1 - s.v2;
            if (closing <= 1e-15) return null;
            const dt = (s.x2 - s.x1) / closing;
            return dt > 0 ? dt : null;
          },
          resolve: (s) => {
            const { m1, m2, v1: u1, v2: u2 } = s;
            const M = m1 + m2;
            s.v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / M;
            s.v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / M;
            const mid = (s.x1 + s.x2) / 2;
            s.x1 = mid; s.x2 = mid;
            s.count++;
          },
        },
      ],
      maxEventsPerStep: 1e6,
    });
    for (let i = 0; i < 10; i++) stepper.step(1000);
    const s = stepper.state;
    assert.ok(s.v1 >= 0 && s.v2 >= s.v1, 'terminal: no further collision possible');
    return s.count;
  };
  assert.equal(countCollisions(1), 3, 'mass ratio 100^0');
  assert.equal(countCollisions(100), 31, 'mass ratio 100^1 — pi digits');
});
