// domain.quantum tests — analytic references computed in-test (no QM goldens
// exist; per M6b spec, references are analytic, never headless-Chrome).
//
// Tolerances agreed for M6b (do NOT loosen silently — renegotiate in the plan):
//   free-packet dispersion  sigma(t) = sigma0*sqrt(1 + (hbar*t/(2*m*sigma0^2))^2)
//                           abs < 1e-6 over one dispersion time (splitting is
//                           EXACT for V = 0, so this bounds grid/FFT error);
//                           <x> drift and <p> = hbar*k0 at 1e-6.
//   norm (no absorber)      |normSq - 1| < 1e-10 after the full run (unitary).
//   absorber accounting     left + barrier + right + absorbedLeft +
//                           absorbedRight = 1 at 1e-8 (exact bookkeeping).
//   packet T vs closed form |T_packet - transmissionRect(E_mean)| < 10% of T.
//                           WHY NOT TIGHTER: the packet has finite energy
//                           spread sigma_E = hbar*k0*sigma_k ~ 8% of E_mean
//                           here, so the measured T is T(E) averaged over the
//                           spectrum, plus O(dt^2) splitting and absorber-ramp
//                           reflection residue; the closed form is a single-
//                           energy statement. 10% brackets all three.
//   findBoundStates         vs an independent in-test bisection of
//                           eta = xi*tan(xi) / eta = -xi*cot(xi) on the circle:
//                           state count exact, |dE| < 1e-8, parity sequence
//                           alternates from even ground state.
//   transferMatrix          vs transmissionRect on one rectangular barrier:
//                           |dT| < 1e-10 across the sweep incl. E = V0 exactly;
//                           |T + R - 1| < 1e-12; resonance T = 1 at 1e-10;
//                           segment-splitting invariance at 1e-12.
//   radialRnl               orthonormality integral(R_nl R_n'l r^2 dr) =
//                           delta_nn' at 1e-6 for n <= 4 (Simpson, rMax 150).
//   sampleDetection         KS < 0.02 vs the discrete |psi|^2 CDF at n = 1e4,
//                           seeded mulberry32 (critical 5% value is ~0.0136).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  makeGrid, gaussianPacket, makeSplitOperator, prob, normSq, expectation,
  findBoundStates, transferMatrix, transmissionRect, radialRnl, sampleDetection,
} from '../../domains/quantum/index.js';

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

function sigmaOf(psi, grid) {
  const p = prob(psi);
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < grid.n; i++) {
    s0 += p[i];
    s1 += grid.x[i] * p[i];
    s2 += grid.x[i] * grid.x[i] * p[i];
  }
  const mean = s1 / s0;
  return Math.sqrt(s2 / s0 - mean * mean);
}

/* ================= grid & packet basics ================= */

test('makeGrid: spacing, FFT k-grid, power-of-2 enforcement', () => {
  const g = makeGrid({ n: 256, xMin: -10, xMax: 10 });
  assert.equal(g.dx, 20 / 256);
  assert.equal(g.x[0], -10);
  assert.ok(Math.abs(g.x[255] - (10 - g.dx)) < 1e-12); // xMax is the wrap point
  assert.equal(g.k[0], 0);
  assert.ok(Math.abs(g.k[1] - (2 * Math.PI) / 20) < 1e-15);
  assert.ok(g.k[255] < 0); // FFT ordering: negative frequencies in the top half
  assert.throws(() => makeGrid({ n: 300, xMin: -10, xMax: 10 }), RangeError);
  assert.throws(() => makeGrid({ n: 256, xMin: 10, xMax: -10 }), RangeError);
});

test('gaussianPacket: normalized, correct moments <x> = x0, <p> = hbar k0, sigma', () => {
  const grid = makeGrid({ n: 1024, xMin: -102.4, xMax: 102.4 });
  const psi = gaussianPacket(grid, { x0: -20, k0: 2, sigma: 4 });
  assert.ok(Math.abs(normSq(psi, grid.dx) - 1) < 1e-12, 'normalized');
  assert.ok(Math.abs(expectation(psi, grid, 'x') - (-20)) < 1e-6, '<x> = x0');
  assert.ok(Math.abs(expectation(psi, grid, 'p') - 2) < 1e-6, '<p> = k0 (hbar = 1)');
  assert.ok(Math.abs(sigmaOf(psi, grid) - 4) < 1e-6, 'position spread = sigma');
  assert.ok(Math.abs(expectation(psi, grid, 'p', { hbar: 2 }) - 4) < 1e-6, '<p> scales with hbar');
  assert.throws(() => gaussianPacket(grid, { x0: 0, k0: 0, sigma: 0 }), RangeError);
  assert.throws(() => expectation(psi, grid, 'E'), RangeError);
});

/* ================= free evolution: dispersion + unitarity ================= */

test('free Gaussian: sigma(t) matches analytic spreading at 1e-6; norm at 1e-10', () => {
  const grid = makeGrid({ n: 512, xMin: -51.2, xMax: 51.2 });
  const V = new Float64Array(grid.n);
  const op = makeSplitOperator({ grid, V });
  const sigma0 = 1;
  const psi = gaussianPacket(grid, { x0: 0, k0: 0, sigma: sigma0 });
  const dt = 0.01;
  let t = 0;
  for (let s = 0; s < 4; s++) {
    op.step(psi, dt, 50); // 4 checkpoints x 50 substeps -> t = 2 (one dispersion time)
    t += 50 * dt;
    const expected = sigma0 * Math.sqrt(1 + (t / (2 * sigma0 * sigma0)) ** 2); // hbar = m = 1
    const got = sigmaOf(psi, grid);
    assert.ok(Math.abs(got - expected) < 1e-6, `t=${t}: sigma ${got} vs ${expected}`);
  }
  assert.ok(Math.abs(normSq(psi, grid.dx) - 1) < 1e-10, 'norm conserved without absorber');
  assert.equal(op.absorbedLeft, 0);
  assert.equal(op.absorbedRight, 0);
});

test('free moving packet: <x> = x0 + (hbar k0/m) t and <p> constant at 1e-6', () => {
  const grid = makeGrid({ n: 1024, xMin: -102.4, xMax: 102.4 });
  const V = new Float64Array(grid.n);
  const op = makeSplitOperator({ grid, V });
  const psi = gaussianPacket(grid, { x0: -20, k0: 2, sigma: 3 });
  op.step(psi, 0.01, 1000); // t = 10
  assert.ok(Math.abs(expectation(psi, grid, 'x') - 0) < 1e-6, '<x> drifted to x0 + k0 t = 0');
  assert.ok(Math.abs(expectation(psi, grid, 'p') - 2) < 1e-6, '<p> conserved');
});

test('makeSplitOperator: dt-change recomputes phases (same sequence, same state)', () => {
  const grid = makeGrid({ n: 256, xMin: -25.6, xMax: 25.6 });
  const V = new Float64Array(grid.n);
  for (let i = 0; i < grid.n; i++) V[i] = 0.5 * 0.1 * grid.x[i] * grid.x[i];
  const opA = makeSplitOperator({ grid, V });
  const opB = makeSplitOperator({ grid, V });
  const psiA = gaussianPacket(grid, { x0: 2, k0: 0, sigma: 1.5 });
  const psiB = gaussianPacket(grid, { x0: 2, k0: 0, sigma: 1.5 });
  opA.step(psiA, 0.01, 10);
  opA.step(psiA, 0.02, 5);   // dt change mid-run
  opA.step(psiA, 0.01, 10);  // and back
  opB.step(psiB, 0.01, 10);
  opB.step(psiB, 0.02, 5);
  opB.step(psiB, 0.01, 10);
  for (let i = 0; i < grid.n; i++) {
    assert.ok(Math.abs(psiA.re[i] - psiB.re[i]) < 1e-15 && Math.abs(psiA.im[i] - psiB.im[i]) < 1e-15);
  }
  assert.ok(Math.abs(normSq(psiA, grid.dx) - 1) < 1e-10, 'unitary across dt changes');
});

/* ================= barrier run with absorber ================= */

test('barrier + absorber: accounting sums to 1 at 1e-8; T within 10% of transmissionRect(E_mean)', () => {
  const grid = makeGrid({ n: 1024, xMin: -102.4, xMax: 102.4 });
  const dx = grid.dx; // 0.2
  const V0 = 0.6;
  const w = 1.0;
  const i0 = Math.round((0 - grid.xMin) / dx); // barrier cells [i0, i0 + w/dx)
  const nw = Math.round(w / dx);
  const V = new Float64Array(grid.n);
  for (let i = i0; i < i0 + nw; i++) V[i] = V0;

  const op = makeSplitOperator({ grid, V, absorber: { width: 128 } });
  const psi = gaussianPacket(grid, { x0: -50, k0: 1, sigma: 6 });

  const before = normSq(psi, grid.dx);
  assert.ok(Math.abs(before - 1) < 1e-12);

  op.step(psi, 0.05, 4400); // t = 220: packet split, absorbed at both edges

  let left = 0;
  let mid = 0;
  let right = 0;
  const p = prob(psi);
  for (let i = 0; i < grid.n; i++) {
    const mass = p[i] * dx;
    if (i < i0) left += mass;
    else if (i < i0 + nw) mid += mass;
    else right += mass;
  }
  const total = left + mid + right + op.absorbedLeft + op.absorbedRight;
  assert.ok(Math.abs(total - 1) < 1e-8, `R + bound + T + absorbed = ${total}`);

  const T = right + op.absorbedRight;
  const R = left + op.absorbedLeft;
  assert.ok(mid < 1e-3, `no probability stuck in the barrier (${mid})`);

  // E_mean for a Gaussian packet: (k0^2 + 1/(4 sigma^2)) / 2, hbar = m = 1.
  const eMean = (1 * 1 + 1 / (4 * 6 * 6)) / 2;
  const tRect = transmissionRect(eMean, V0, w);
  assert.ok(Math.abs(T - tRect) < 0.10 * tRect,
    `packet T = ${T} vs closed form ${tRect} (10% — see header: energy spread)`);
  assert.ok(Math.abs(T + R - 1) < 1e-6, 'T + R accounts for everything left');
  assert.ok(op.absorbedLeft > 0 && op.absorbedRight > 0, 'both absorbers saw flux');

  op.resetAbsorbed();
  assert.equal(op.absorbedLeft, 0);
  assert.equal(op.absorbedRight, 0);
});

test('makeSplitOperator: absorber validation and V length guard', () => {
  const grid = makeGrid({ n: 256, xMin: -10, xMax: 10 });
  const V = new Float64Array(grid.n);
  assert.throws(() => makeSplitOperator({ grid, V: new Float64Array(100) }), RangeError);
  assert.throws(() => makeSplitOperator({ grid, V, absorber: { width: 128 } }), RangeError); // 2*width >= n
  assert.throws(() => makeSplitOperator({ grid, V, absorber: { width: 32, hardWidth: 32 } }), RangeError);
  assert.throws(() => makeSplitOperator({ grid, V, hbar: 0 }), RangeError);
});

/* ================= findBoundStates ================= */

/* Independent reference: bisection on g(xi) = eta_parity(xi) - sqrt(z0^2 - xi^2)
   per branch — a DIFFERENT equation form than the module's f. */
function referenceBoundStates(V0, a, hbar, m) {
  const h22m = (hbar * hbar) / (2 * m);
  const z0 = a * Math.sqrt(V0 / h22m);
  const states = [];
  const solve = (g, lo, hi) => {
    let flo = g(lo);
    const fhi = g(hi);
    if (!Number.isFinite(flo) || !Number.isFinite(fhi) || flo * fhi > 0) return null;
    for (let i = 0; i < 200; i++) {
      const mid = 0.5 * (lo + hi);
      const fm = g(mid);
      if (fm === 0) return mid;
      if (flo * fm < 0) hi = mid;
      else { lo = mid; flo = fm; }
    }
    return 0.5 * (lo + hi);
  };
  for (let b = 0; b * Math.PI < z0; b++) {
    // even branch (b*pi, min((b+1/2)*pi, z0))
    const gEven = (xi) => xi * Math.tan(xi) - Math.sqrt(Math.max(0, z0 * z0 - xi * xi));
    const xiE = solve(gEven, b * Math.PI + 1e-9, Math.min((b + 0.5) * Math.PI - 1e-9, z0 - 1e-12));
    if (xiE !== null) states.push({ E: h22m * (xiE / a) ** 2 - V0, parity: 'even' });
    // odd branch ((b+1/2)*pi, min((b+1)*pi, z0))
    const gOdd = (xi) => -xi / Math.tan(xi) - Math.sqrt(Math.max(0, z0 * z0 - xi * xi));
    const lo = (b + 0.5) * Math.PI + 1e-9;
    if (lo < z0) {
      const xiO = solve(gOdd, lo, Math.min((b + 1) * Math.PI - 1e-9, z0 - 1e-12));
      if (xiO !== null) states.push({ E: h22m * (xiO / a) ** 2 - V0, parity: 'odd' });
    }
  }
  states.sort((p, q) => p.E - q.E);
  return states;
}

test('findBoundStates: count + energies at 1e-8 + parity vs independent reference', () => {
  const cases = [
    { V0: 10, a: 1, hbar: 1, m: 1 },     // z0 = sqrt(20): 3 states
    { V0: 50, a: 0.7, hbar: 1, m: 1 },   // z0 = 7: 5 states
    { V0: 2.2, a: 1.5, hbar: 1, m: 2 },  // non-default mass
    { V0: 0.9, a: 0.8, hbar: 1, m: 1 },  // shallow: single even state
  ];
  for (const c of cases) {
    const got = findBoundStates(c.V0, c.a, { hbar: c.hbar, m: c.m });
    const ref = referenceBoundStates(c.V0, c.a, c.hbar, c.m);
    assert.equal(got.length, ref.length, `state count for ${JSON.stringify(c)}`);
    for (let i = 0; i < ref.length; i++) {
      assert.ok(Math.abs(got[i].E - ref[i].E) < 1e-8,
        `E[${i}] = ${got[i].E} vs ref ${ref[i].E} for ${JSON.stringify(c)}`);
      assert.equal(got[i].parity, ref[i].parity, `parity[${i}]`);
      // Parity alternates starting even (ground state of a symmetric well).
      assert.equal(got[i].parity, i % 2 === 0 ? 'even' : 'odd', `alternation[${i}]`);
      assert.ok(got[i].E > -c.V0 && got[i].E < 0, 'E inside (-V0, 0)');
      // Internal consistency: xi^2 + eta^2 = z0^2 <-> k^2 + kappa^2 = 2mV0/hbar^2.
      const circ = got[i].k ** 2 + got[i].kappa ** 2;
      assert.ok(Math.abs(circ - (2 * c.m * c.V0) / (c.hbar * c.hbar)) < 1e-8 * circ, 'circle identity');
    }
  }
  assert.throws(() => findBoundStates(-1, 1), RangeError);
  assert.throws(() => findBoundStates(1, 0), RangeError);
});

/* ================= transferMatrix vs transmissionRect ================= */

test('transferMatrix vs transmissionRect: |dT| < 1e-10 across the sweep, T + R = 1 at 1e-12', () => {
  const V0 = 1;
  const w = 2;
  for (let E = 0.05; E <= 5.0001; E += 0.05) {
    const { T, R } = transferMatrix(E, [{ V: V0, width: w }]);
    const tRef = transmissionRect(E, V0, w);
    assert.ok(Math.abs(T - tRef) < 1e-10, `E=${E}: T=${T} vs closed form ${tRef}`);
    assert.ok(Math.abs(T + R - 1) < 1e-12, `E=${E}: T+R=${T + R}`);
  }
});

test('transferMatrix: E = V0 exactly takes the degenerate linear branch, matches the limit', () => {
  const V0 = 1;
  const w = 2;
  const { T, R } = transferMatrix(V0, [{ V: V0, width: w }]);
  const tLimit = 1 / (1 + (V0 * w * w) / 2); // m V0 w^2 / (2 hbar^2), hbar = m = 1
  assert.ok(Math.abs(T - tLimit) < 1e-10, `T=${T} vs E->V0 limit ${tLimit}`);
  assert.ok(Math.abs(T - transmissionRect(V0, V0, w)) < 1e-10, 'both sides use the limit');
  assert.ok(Math.abs(T + R - 1) < 1e-12);
});

test('transferMatrix: E > V0 resonances sin(kappa w) = 0 give T = 1 at 1e-10', () => {
  const V0 = 1;
  const w = 2;
  for (let j = 1; j <= 5; j++) {
    const kappa = (j * Math.PI) / w;
    const E = V0 + (kappa * kappa) / 2; // hbar = m = 1
    const { T } = transferMatrix(E, [{ V: V0, width: w }]);
    assert.ok(Math.abs(T - 1) < 1e-10, `resonance j=${j}: T=${T}`);
    assert.ok(Math.abs(transmissionRect(E, V0, w) - 1) < 1e-10, `closed form j=${j}`);
  }
});

test('transferMatrix: segment splitting is invariant; wells and edge cases behave', () => {
  for (const E of [0.3, 0.7, 1.0, 1.9, 3.3]) {
    const one = transferMatrix(E, [{ V: 1, width: 2 }]);
    const two = transferMatrix(E, [{ V: 1, width: 0.8 }, { V: 1, width: 1.2 }]);
    assert.ok(Math.abs(one.T - two.T) < 1e-12, `E=${E}: split invariance`);
  }
  // Square well: T + R = 1, resonances exist, all probabilities in [0, 1].
  for (let E = 0.1; E <= 3.0001; E += 0.1) {
    const { T, R } = transferMatrix(E, [{ V: -0.5, width: 2 }]);
    assert.ok(T >= 0 && T <= 1 + 1e-12 && R >= 0 && R <= 1 + 1e-12);
    assert.ok(Math.abs(T + R - 1) < 1e-12, `well E=${E}`);
  }
  // Double barrier: still unitary.
  const db = transferMatrix(0.8, [{ V: 1.2, width: 0.5 }, { V: 0, width: 1 }, { V: 1.2, width: 0.5 }]);
  assert.ok(Math.abs(db.T + db.R - 1) < 1e-10, 'double barrier T+R');
  // E <= 0 reflects totally; bad segments throw.
  assert.deepEqual(transferMatrix(-1, [{ V: 1, width: 1 }]), { T: 0, R: 1 });
  assert.throws(() => transferMatrix(1, []), RangeError);
  assert.throws(() => transferMatrix(1, [{ V: 1, width: 0 }]), RangeError);
});

test('transmissionRect: deep-tunneling branch and unit scaling {hbar, m}', () => {
  assert.equal(transmissionRect(-0.5, 1, 1), 0);
  assert.equal(transmissionRect(0, 1, 1), 0);
  const deep = transmissionRect(0.01, 5, 4);
  assert.ok(deep > 0 && deep < 1e-10, 'deep tunneling is tiny but positive');
  // Scaling: (E, V0, w, hbar=m=1) equals (s*E, s*V0, w/sqrt(s)) — same k*w products.
  const a = transmissionRect(0.5, 1, 2);
  const b = transmissionRect(2, 4, 1);
  assert.ok(Math.abs(a - b) < 1e-12, 'scale invariance of the dimensionless products');
  // hbar/m routed through: doubling m at fixed E halves the tunneling length scale.
  const c = transmissionRect(0.5, 1, 2, { m: 2 });
  const d = transmissionRect(0.5, 1, 2 * Math.SQRT2, { m: 1 });
  assert.ok(Math.abs(c - d) < 1e-12, 'm enters only through k*w, eta*w');
});

/* ================= radialRnl orthonormality ================= */

test('radialRnl: orthonormality int R_nl R_npl r^2 dr = delta at 1e-6 for n <= 4', () => {
  const rMax = 150;
  const N = 30000; // Simpson intervals (even)
  const h = rMax / N;
  const simpson = (f) => {
    let s = f(0) + f(rMax);
    for (let i = 1; i < N; i++) s += f(i * h) * (i % 2 === 1 ? 4 : 2);
    return (s * h) / 3;
  };
  for (let l = 0; l <= 3; l++) {
    for (let n1 = l + 1; n1 <= 4; n1++) {
      for (let n2 = n1; n2 <= 4; n2++) {
        const I = simpson((r) => radialRnl(n1, l, r) * radialRnl(n2, l, r) * r * r);
        const expected = n1 === n2 ? 1 : 0;
        assert.ok(Math.abs(I - expected) < 1e-6,
          `<R_${n1}${l}|R_${n2}${l}> = ${I}, expected ${expected}`);
      }
    }
  }
});

test('radialRnl: closed-form spot values and a0 scaling', () => {
  // R_10 = 2 e^{-r}, R_20 = (1/sqrt(2))(1 - r/2) e^{-r/2} (a0 = 1).
  assert.ok(Math.abs(radialRnl(1, 0, 0) - 2) < 1e-14);
  assert.ok(Math.abs(radialRnl(1, 0, 1) - 2 * Math.exp(-1)) < 1e-14);
  assert.ok(Math.abs(radialRnl(2, 0, 0) - Math.SQRT1_2) < 1e-14);
  assert.ok(Math.abs(radialRnl(2, 0, 2)) < 1e-14, 'R_20 node at r = 2 a0');
  // a0 scaling: R(r; a0) = a0^{-3/2} R(r/a0; 1).
  const a0 = 0.529;
  const val = radialRnl(3, 1, 2, { a0 });
  const ref = Math.pow(a0, -1.5) * radialRnl(3, 1, 2 / a0);
  assert.ok(Math.abs(val - ref) < 1e-12 * Math.abs(ref));
  assert.throws(() => radialRnl(2, 2, 1), RangeError);
  assert.throws(() => radialRnl(0, 0, 1), RangeError);
  assert.throws(() => radialRnl(2, 0, -1), RangeError);
});

/* ================= sampleDetection ================= */

test('sampleDetection: KS < 0.02 vs the discrete |psi|^2 CDF at n = 1e4 (seeded)', () => {
  const grid = makeGrid({ n: 256, xMin: -12.8, xMax: 12.8 });
  // Two-lobe density: superposition-like |psi|^2 built from two packets.
  const p1 = gaussianPacket(grid, { x0: -4, k0: 0, sigma: 1.5 });
  const p2 = gaussianPacket(grid, { x0: 5, k0: 0, sigma: 2.5 });
  const pdf = new Float64Array(grid.n);
  const d1 = prob(p1);
  const d2 = prob(p2);
  for (let i = 0; i < grid.n; i++) pdf[i] = 0.6 * d1[i] + 0.4 * d2[i];

  const rng = mulberry32(123456789);
  const nDraws = 10000;
  const draws = new Float64Array(nDraws);
  for (let i = 0; i < nDraws; i++) draws[i] = sampleDetection(pdf, grid, rng);
  draws.sort();

  // Model CDF (piecewise linear across each constant-density cell).
  let totalMass = 0;
  const cum = new Float64Array(grid.n + 1);
  for (let i = 0; i < grid.n; i++) {
    totalMass += pdf[i] * grid.dx;
    cum[i + 1] = totalMass;
  }
  const cdf = (x) => {
    let i = Math.floor((x - grid.xMin) / grid.dx);
    if (i < 0) return 0;
    if (i >= grid.n) return 1;
    const frac = (x - (grid.xMin + i * grid.dx)) / grid.dx;
    return (cum[i] + frac * (cum[i + 1] - cum[i])) / totalMass;
  };
  let ks = 0;
  for (let i = 0; i < nDraws; i++) {
    const F = cdf(draws[i]);
    ks = Math.max(ks, Math.abs(F - i / nDraws), Math.abs(F - (i + 1) / nDraws));
  }
  assert.ok(ks < 0.02, `KS = ${ks}`);
  // All draws inside the domain.
  assert.ok(draws[0] >= grid.xMin && draws[nDraws - 1] <= grid.xMax);
  assert.throws(() => sampleDetection(new Float64Array(grid.n), grid, rng), RangeError);
  assert.throws(() => sampleDetection(new Float64Array(7), grid, rng), RangeError);
});
