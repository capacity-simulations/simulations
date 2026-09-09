// domain.quantum — 1D wave mechanics on uniform grids (namespace
// Engine.quantum). A state is {re, im} split Float64Arrays sampled on a
// makeGrid grid; evolution is unitary (split-operator / eigenphases) and
// measurement outcomes are SAMPLED from |psi|^2 — nothing in this module has
// a trajectory. Natural units hbar = m = 1 by default; pass {hbar, m} to use
// physical units. No canvas, no DOM.
// Harvest sources (Sim_lab_sims/QM_sims/), provenance per plan M6b:
//   makeSplitOperator  Quantum_Tunneling_Gaussian_Wave.html
//                      computePhaseFactors L1259–1280 (half-V and kinetic
//                      phase arrays, precomputed and cached, recomputed on dt
//                      change; k-grid via core.fft freqGrid — same k^2 as the
//                      source's i<=NX/2 branch), timeStep L1335–1388 (Strang
//                      V/2 -> FFT -> T -> iFFT -> V/2 with core.complex
//                      arrMulPhase, in place on psi — the source's fft-array
//                      copy dropped), applyAbsorbingBoundary L1396–1444
//                      (hard-cutoff zone + quadratic-ramp exp damping with
//                      absorbed-probability accounting so leftover norm +
//                      absorbedLeft + absorbedRight stays exactly 1; source
//                      constants strength 0.15, hard cutoff 50 of width 850
//                      kept as defaults, width now caller-chosen).
//   gaussianPacket     QTGW initializeWavepacket L1285–1311 (envelope
//                      (2πσ²)^(−1/4)·e^{−(x−x0)²/4σ²}·e^{ik0x}) +
//                      normalizeWavefunction L1316–1330 (numeric norm).
//   findBoundStates    Bound_states.html calculateBoundStates/findIntersection
//                      L1214–1297 — branch windows (nπ, (n+½)π) even and
//                      ((n−½)π, nπ) odd with the source's 0.001 margins and
//                      z0 = a·sqrt(2mV0)/hbar; the inline bisection becomes
//                      core.roots bracketScan + bisect (non-finite tan poles
//                      skipped by bracketScan).
//   transferMatrix     Quantum_tunneling_Plane_Wave.html computeTransferMatrix
//                      L1417–1625: backward A/B propagation over piecewise-
//                      constant regions with propagating / evanescent / E≈V
//                      degenerate-LINEAR branches (thresholds: |E−V| eps now
//                      input-relative instead of the source's 1e-6 eV; the
//                      kappa·L > 20 overflow guards kept). T, R from the lead
//                      coefficients: R = |B0/A0|², T = (kN/k0)·|1/A0|².
//   transmissionRect   Transmission_probability_plot.html computeT L676–700
//                      (sinh branch E<V0, sin branch E>V0, E→V0 limit
//                      1/(1 + m·V0·w²/2ħ²)); source half-width a rewritten in
//                      the FULL width w = 2a.
//   radialRnl          Hydrogen_atom_wavefunctions.html radialExplicit/
//                      computeRadialNorm/R_nl L279–302 via core.special
//                      assocLaguerre. CHANGED AT HARVEST: the source's
//                      numeric-quadrature normalization is replaced by the
//                      closed-form norm sqrt((2/na0)³·(n−l−1)!/(2n·(n+l)!))
//                      (factorial ratio as a running product — no overflow);
//                      orthonormality is test-verified.
//   sampleDetection    rejection over the discrete |psi|² via core.sample
//                      sampleFromPDF (infinite-potential-well.html pattern);
//                      all randomness through the injected rng.

import { arrMulPhase, arrAbs2, arrNormSq } from '../../core/complex.js';
import { fft, freqGrid } from '../../core/fft.js';
import { bisect, bracketScan } from '../../core/roots.js';
import { assocLaguerre } from '../../core/special.js';
import { sampleFromPDF } from '../../core/sample.js';

/**
 * Uniform periodic grid for FFT evolution: n samples (POWER OF 2 — enforced
 * by core.fft freqGrid), x[i] = xMin + i·dx with dx = (xMax − xMin)/n
 * (xMax is the periodic wrap point, not a sample). k is the FFT-ordered
 * angular-frequency grid matching core.fft bin order.
 * Returns {n, xMin, xMax, dx, x, k}.
 */
export function makeGrid({ n, xMin, xMax }) {
  if (!(xMax > xMin) || !Number.isFinite(xMin) || !Number.isFinite(xMax)) {
    throw new RangeError(`makeGrid: need finite xMin < xMax, got [${xMin}, ${xMax}]`);
  }
  const dx = (xMax - xMin) / n;
  const k = freqGrid(n, dx); // throws unless n is a positive power of 2
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) x[i] = xMin + i * dx;
  return { n, xMin, xMax, dx, x, k };
}

/**
 * Normalized Gaussian wave packet {re, im} on grid: envelope
 * (2πσ²)^(−1/4)·e^{−(x−x0)²/(4σ²)} times plane-wave phase e^{i·k0·x},
 * then normalized numerically so normSq(psi, grid.dx) = 1 (QTGW L1285–1330).
 * x0 is the mean position, k0 the mean wavenumber (mean momentum = hbar·k0),
 * sigma > 0 the position-space standard deviation.
 */
export function gaussianPacket(grid, { x0 = 0, k0 = 0, sigma }) {
  if (!(sigma > 0)) throw new RangeError(`gaussianPacket: need sigma > 0, got ${sigma}`);
  const n = grid.n;
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  const norm = Math.pow(2 * Math.PI * sigma * sigma, -0.25);
  for (let i = 0; i < n; i++) {
    const d = grid.x[i] - x0;
    const env = norm * Math.exp((-d * d) / (4 * sigma * sigma));
    const phase = k0 * grid.x[i];
    re[i] = env * Math.cos(phase);
    im[i] = env * Math.sin(phase);
  }
  const s = Math.sqrt(arrNormSq(re, im, grid.dx));
  if (s > 1e-30) {
    for (let i = 0; i < n; i++) { re[i] /= s; im[i] /= s; }
  }
  return { re, im };
}

/**
 * Split-operator (Strang) propagator for i·hbar·∂psi/∂t = (T + V)psi on a
 * makeGrid grid. V is an array of length grid.n sampled at grid.x.
 * Phase arrays e^{−iV·dt/2ħ} and e^{−iħk²dt/2m} are precomputed and CACHED,
 * recomputed automatically when dt changes (QTGW computePhaseFactors).
 *
 * absorber (optional): { width, strength = 0.15, hardWidth } — per-side
 * absorbing zone of `width` grid points; the outermost hardWidth points
 * (default min(50, width/4)) are zeroed outright, the rest damped by
 * e^{−strength·xi²}. Probability removed is accounted per side so
 * normSq(psi) + absorbedLeft + absorbedRight is conserved exactly.
 *
 * Returns { step(psi, dt, substeps = 1), absorbedLeft, absorbedRight
 * (accumulating getters), resetAbsorbed() }. step evolves psi IN PLACE by
 * substeps applications of the dt splitting (norm-preserving without an
 * absorber). Evolution is splitStep only — there is no force-based update on
 * psi anywhere.
 */
export function makeSplitOperator({ grid, V, hbar = 1, m = 1, absorber = null }) {
  const n = grid.n;
  if (!V || V.length !== n) {
    throw new RangeError(`makeSplitOperator: V must have grid.n = ${n} samples`);
  }
  if (!(hbar > 0) || !(m > 0)) {
    throw new RangeError(`makeSplitOperator: need hbar > 0 and m > 0, got hbar=${hbar}, m=${m}`);
  }
  const expVr = new Float64Array(n);
  const expVi = new Float64Array(n);
  const expTr = new Float64Array(n);
  const expTi = new Float64Array(n);
  let cachedDt = null;

  function computePhases(dt) {
    for (let i = 0; i < n; i++) {
      const ph = (-V[i] * dt) / (2 * hbar);
      expVr[i] = Math.cos(ph);
      expVi[i] = Math.sin(ph);
    }
    for (let i = 0; i < n; i++) {
      const k = grid.k[i];
      const ph = (-hbar * k * k * dt) / (2 * m);
      expTr[i] = Math.cos(ph);
      expTi[i] = Math.sin(ph);
    }
    cachedDt = dt;
  }

  let abs = null;
  if (absorber) {
    const width = absorber.width | 0;
    const strength = absorber.strength != null ? absorber.strength : 0.15;
    const hardWidth = absorber.hardWidth != null
      ? absorber.hardWidth | 0
      : Math.min(50, Math.floor(width / 4));
    if (!(width > 0) || 2 * width >= n || !(hardWidth >= 0) || hardWidth >= width || !(strength > 0)) {
      throw new RangeError(`makeSplitOperator: bad absorber {width=${width}, strength=${strength}, hardWidth=${hardWidth}} for n=${n}`);
    }
    abs = { width, strength, hardWidth };
  }
  let absorbedL = 0;
  let absorbedR = 0;

  function applyAbsorber(re, im) {
    const { width, strength, hardWidth } = abs;
    const dx = grid.dx;
    for (let i = 0; i < hardWidth; i++) {
      const j = n - 1 - i;
      absorbedL += (re[i] * re[i] + im[i] * im[i]) * dx;
      absorbedR += (re[j] * re[j] + im[j] * im[j]) * dx;
      re[i] = 0; im[i] = 0;
      re[j] = 0; im[j] = 0;
    }
    for (let i = hardWidth; i < width; i++) {
      const xi = (width - i) / (width - hardWidth);
      const factor = Math.exp(-strength * xi * xi);
      const j = n - 1 - i;
      const beforeL = (re[i] * re[i] + im[i] * im[i]) * dx;
      re[i] *= factor; im[i] *= factor;
      absorbedL += beforeL - (re[i] * re[i] + im[i] * im[i]) * dx;
      const beforeR = (re[j] * re[j] + im[j] * im[j]) * dx;
      re[j] *= factor; im[j] *= factor;
      absorbedR += beforeR - (re[j] * re[j] + im[j] * im[j]) * dx;
    }
  }

  function step(psi, dt, substeps = 1) {
    const { re, im } = psi;
    if (re.length !== n || im.length !== n) {
      throw new RangeError(`step: psi must have grid.n = ${n} samples`);
    }
    if (dt !== cachedDt) computePhases(dt);
    for (let s = 0; s < substeps; s++) {
      arrMulPhase(re, im, expVr, expVi);   // half potential step
      fft(re, im, false);
      arrMulPhase(re, im, expTr, expTi);   // full kinetic step in k-space
      fft(re, im, true);
      arrMulPhase(re, im, expVr, expVi);   // half potential step
      if (abs) applyAbsorber(re, im);
    }
  }

  return {
    step,
    get absorbedLeft() { return absorbedL; },
    get absorbedRight() { return absorbedR; },
    resetAbsorbed() { absorbedL = 0; absorbedR = 0; },
  };
}

/** Probability density |psi|² per sample -> Float64Array (out reused when
 * given). Detection statistics come from THIS array — never from a path. */
export function prob(psi, out) {
  return arrAbs2(psi.re, psi.im, out);
}

/** Squared norm sum |psi_i|²·dx (1 for a normalized state). */
export function normSq(psi, dx) {
  return arrNormSq(psi.re, psi.im, dx);
}

/**
 * Expectation value over the state: which = 'x' -> mean position
 * sum x·|psi|²/sum |psi|²; which = 'p' -> mean momentum hbar·k weighted by
 * the FFT power spectrum (psi is copied — not mutated).
 */
export function expectation(psi, grid, which, { hbar = 1 } = {}) {
  const n = grid.n;
  if (which === 'x') {
    let s0 = 0;
    let s1 = 0;
    for (let i = 0; i < n; i++) {
      const p = psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
      s0 += p;
      s1 += grid.x[i] * p;
    }
    return s1 / s0;
  }
  if (which === 'p') {
    const re = Float64Array.from(psi.re);
    const im = Float64Array.from(psi.im);
    fft(re, im, false);
    let s0 = 0;
    let s1 = 0;
    for (let i = 0; i < n; i++) {
      const p = re[i] * re[i] + im[i] * im[i];
      s0 += p;
      s1 += hbar * grid.k[i] * p;
    }
    return s1 / s0;
  }
  throw new RangeError(`expectation: which must be 'x' or 'p', got ${which}`);
}

/**
 * Bound states of the finite square well of depth V0 > 0 (V = −V0 for
 * |x| < a, 0 outside; a is the HALF-width). Solves the transcendental
 * conditions eta = xi·tan(xi) (even) and eta = −xi·cot(xi) (odd) on the
 * circle xi² + eta² = z0², z0 = a·sqrt(2·m·V0)/hbar, branch by branch
 * (Bound_states.html). Returns states sorted by energy:
 * [{E, parity, k, kappa}] with E in (−V0, 0) measured from the well top,
 * k = xi/a (inside), kappa = eta/a (decay outside). Source 0.001-margin
 * caveat kept: a state within 0.001 of a branch edge or of z0 is skipped
 * (physically, wells with z0 > ~0.002 report every state).
 */
export function findBoundStates(V0, a, { hbar = 1, m = 1 } = {}) {
  if (!(V0 > 0) || !(a > 0) || !(hbar > 0) || !(m > 0)) {
    throw new RangeError(`findBoundStates: need V0, a, hbar, m > 0, got V0=${V0}, a=${a}, hbar=${hbar}, m=${m}`);
  }
  const h22m = (hbar * hbar) / (2 * m);
  const z0 = a * Math.sqrt(V0 / h22m);
  const out = [];
  const maxBranches = Math.ceil(z0 / (Math.PI / 2)) + 2;
  for (const parity of ['even', 'odd']) {
    const even = parity === 'even';
    const f = even
      ? (xi) => { const t = Math.tan(xi); return xi * xi * (1 + t * t) - z0 * z0; }
      : (xi) => { const c = 1 / Math.tan(xi); return xi * xi * (1 + c * c) - z0 * z0; };
    for (let b = 0; b < maxBranches; b++) {
      let xiMin;
      let xiMax;
      if (even) {
        xiMin = b * Math.PI + 0.001;
        xiMax = (b + 0.5) * Math.PI - 0.001;
      } else {
        if (b === 0) continue;
        xiMin = (b - 0.5) * Math.PI + 0.001;
        xiMax = b * Math.PI - 0.001;
      }
      if (xiMin >= z0) break;
      xiMax = Math.min(xiMax, z0 - 0.001);
      if (xiMax <= xiMin) continue;
      for (const [lo, hi] of bracketScan(f, xiMin, xiMax, 64)) {
        const xi = lo === hi ? lo : bisect(f, lo, hi, { tol: 1e-14, maxIter: 200 });
        if (xi === null || !(xi > 0) || !(xi < z0)) continue;
        const eta = even ? xi * Math.tan(xi) : -xi / Math.tan(xi);
        if (!(eta > 0)) continue;
        const k = xi / a;
        const kappa = eta / a;
        out.push({ E: h22m * k * k - V0, parity, k, kappa });
      }
    }
  }
  out.sort((p, q) => p.E - q.E);
  return out;
}

const LARGE_KAPPA = 20;   // kappa·L overflow-guard threshold (Plane_Wave)

/**
 * Stationary scattering off piecewise-constant segments [{V, width}] between
 * V = 0 leads, at energy E > 0 -> {T, R} (probability transmission /
 * reflection; T + R = 1). Backward A/B coefficient propagation with
 * propagating, evanescent and E≈V degenerate-LINEAR branches
 * (Plane_Wave computeTransferMatrix, incl. its kappa·L overflow guards);
 * degenerateEps defaults input-relative (the source hard-coded 1e-6 eV).
 * E <= 0 returns {T: 0, R: 1}.
 */
export function transferMatrix(E, segments, { hbar = 1, m = 1, degenerateEps = null } = {}) {
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new RangeError('transferMatrix: segments must be a non-empty [{V, width}] array');
  }
  if (!Number.isFinite(E)) throw new RangeError(`transferMatrix: E must be finite, got ${E}`);
  if (E <= 0) return { T: 0, R: 1 };

  // Regions: left lead (V = 0, right edge at x = 0), segments, right lead.
  const regions = [{ V: 0, x0: 0 }];
  let xCursor = 0;
  for (const seg of segments) {
    if (!(seg.width > 0) || !Number.isFinite(seg.V)) {
      throw new RangeError(`transferMatrix: each segment needs width > 0 and finite V, got ${JSON.stringify(seg)}`);
    }
    regions.push({ V: seg.V, x0: xCursor });
    xCursor += seg.width;
  }
  regions.push({ V: 0, x0: xCursor });
  const nR = regions.length;

  const kVals = new Float64Array(nR);
  const type = new Array(nR);
  for (let i = 0; i < nR; i++) {
    const dE = E - regions[i].V;
    const eps = degenerateEps != null
      ? degenerateEps
      : 1e-9 * Math.max(1, Math.abs(E), Math.abs(regions[i].V));
    if (Math.abs(dE) < eps) {
      kVals[i] = 0;
      type[i] = 'linear';
    } else if (dE > 0) {
      kVals[i] = Math.sqrt(2 * m * dE) / hbar;
      type[i] = 'propagating';
    } else {
      kVals[i] = Math.sqrt(-2 * m * dE) / hbar;
      type[i] = 'evanescent';
    }
  }

  const A = new Float64Array(nR * 2);
  const B = new Float64Array(nR * 2);
  A[(nR - 1) * 2] = 1; // outgoing wave only in the right lead

  for (let j = nR - 2; j >= 0; j--) {
    const boundary = regions[j + 1].x0;
    const Ar = A[(j + 1) * 2];
    const Ai = A[(j + 1) * 2 + 1];
    const Br = B[(j + 1) * 2];
    const Bi = B[(j + 1) * 2 + 1];

    // psi and dpsi/dx at the boundary from the (j+1)-side representation
    // (coefficients of region j+1 are anchored at its own x0 = boundary).
    let pr;
    let pi;
    let dr;
    let di;
    if (type[j + 1] === 'linear') {
      pr = Ar; pi = Ai; dr = Br; di = Bi;
    } else if (type[j + 1] === 'propagating') {
      const k = kVals[j + 1];
      pr = Ar + Br; pi = Ai + Bi;
      dr = -k * Ai + k * Bi;
      di = k * Ar - k * Br;
    } else {
      const kp = kVals[j + 1];
      pr = Ar + Br; pi = Ai + Bi;
      dr = -kp * Ar + kp * Br;
      di = -kp * Ai + kp * Bi;
    }

    const L = boundary - regions[j].x0; // 0 for the left lead

    if (type[j] === 'linear') {
      B[j * 2] = dr;
      B[j * 2 + 1] = di;
      A[j * 2] = pr - dr * L;
      A[j * 2 + 1] = pi - di * L;
    } else if (type[j] === 'propagating') {
      const k = kVals[j];
      const phi = k * L;
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const hpr = 0.5 * pr;
      const hpi = 0.5 * pi;
      const hdr = (0.5 * di) / k;   // (dpsi / (i k)) / 2
      const hdi = (-0.5 * dr) / k;
      const AeR = hpr + hdr;
      const AeI = hpi + hdi;
      const BeR = hpr - hdr;
      const BeI = hpi - hdi;
      A[j * 2] = AeR * cp + AeI * sp;
      A[j * 2 + 1] = AeI * cp - AeR * sp;
      B[j * 2] = BeR * cp - BeI * sp;
      B[j * 2 + 1] = BeI * cp + BeR * sp;
    } else {
      const kp = kVals[j];
      const kL = kp * L;
      let ex;
      let emx;
      if (kL > LARGE_KAPPA) {
        ex = Math.exp(Math.min(kL, 700));
        emx = 0;
      } else if (kL < -LARGE_KAPPA) {
        ex = 0;
        emx = Math.exp(Math.min(-kL, 700));
      } else {
        ex = Math.exp(kL);
        emx = Math.exp(-kL);
      }
      const AmR = 0.5 * (pr - dr / kp);
      const AmI = 0.5 * (pi - di / kp);
      const BkR = 0.5 * (pr + dr / kp);
      const BkI = 0.5 * (pi + di / kp);
      A[j * 2] = AmR * ex;
      A[j * 2 + 1] = AmI * ex;
      B[j * 2] = BkR * emx;
      B[j * 2 + 1] = BkI * emx;
    }
  }

  const a0m2 = A[0] * A[0] + A[1] * A[1];
  if (!(a0m2 > 0) || !Number.isFinite(a0m2)) return { T: 0, R: 1 };
  const R = (B[0] * B[0] + B[1] * B[1]) / a0m2;
  const T = (kVals[nR - 1] / kVals[0]) / a0m2; // |A_last|² = 1 before normalization
  return { T, R };
}

/**
 * Closed-form transmission probability through ONE rectangular barrier of
 * height V0 and FULL width w (Transmission_probability_plot computeT,
 * half-width rewritten as w = 2a):
 *   E < V0: T = 4k²η² / (4k²η² + (k²+η²)²·sinh²(η·w)),  η² = 2m(V0−E)/ħ²
 *   E > V0: T = 4k²κ² / (4k²κ² + (k²−κ²)²·sin²(κ·w)),   κ² = 2m(E−V0)/ħ²
 *   E ≈ V0: T = 1 / (1 + m·V0·w²/(2ħ²))  (the continuous limit of both)
 * E <= 0 -> 0. T = 1 at the E > V0 resonances sin(κ·w) = 0.
 */
export function transmissionRect(E, V0, width, { hbar = 1, m = 1 } = {}) {
  if (!(width > 0) || !Number.isFinite(V0)) {
    throw new RangeError(`transmissionRect: need width > 0 and finite V0, got width=${width}, V0=${V0}`);
  }
  if (!(E > 1e-12)) return 0;
  const h2 = hbar * hbar;
  const k2 = (2 * m * E) / h2;
  if (Math.abs(E - V0) < 1e-10 || Math.abs(E - V0) / Math.max(V0, 1e-10) < 1e-8) {
    return 1 / (1 + (m * V0 * width * width) / (2 * h2));
  }
  if (E < V0) {
    const eta2 = (2 * m * (V0 - E)) / h2;
    const arg = Math.sqrt(eta2) * width;
    if (arg > 500) return 0;
    const sh = Math.sinh(arg);
    const num = 4 * k2 * eta2;
    const denom = num + (k2 + eta2) * (k2 + eta2) * sh * sh;
    return denom > 0 ? num / denom : 0;
  }
  const kap2 = (2 * m * (E - V0)) / h2;
  const sv = Math.sin(Math.sqrt(kap2) * width);
  const num = 4 * k2 * kap2;
  const diff = k2 - kap2;
  const denom = num + diff * diff * sv * sv;
  return denom > 0 ? num / denom : 1;
}

/**
 * Hydrogen radial function R_nl(r) (length unit a0, default 1):
 *   R_nl = sqrt((2/na0)³·(n−l−1)!/(2n·(n+l)!)) · e^{−ρ/2}·ρ^l·
 *          L_{n−l−1}^{2l+1}(ρ),  ρ = 2r/(n·a0)
 * Orthonormal: ∫R_nl·R_n'l·r²dr = δ_nn'. Integer n >= 1, 0 <= l <= n−1,
 * r >= 0.
 */
export function radialRnl(n, l, r, { a0 = 1 } = {}) {
  if (!Number.isInteger(n) || n < 1 || !Number.isInteger(l) || l < 0 || l > n - 1) {
    throw new RangeError(`radialRnl: need integer n >= 1 and 0 <= l <= n-1, got n=${n}, l=${l}`);
  }
  if (!(r >= 0)) throw new RangeError(`radialRnl: need r >= 0, got ${r}`);
  const rho = (2 * r) / (n * a0);
  // (n−l−1)!/(n+l)! as a running product 1/((n−l)(n−l+1)...(n+l)) — no overflow.
  let ratio = 1;
  for (let i = n - l; i <= n + l; i++) ratio /= i;
  const norm = Math.sqrt((Math.pow(2 / (n * a0), 3) * ratio) / (2 * n));
  return norm * Math.exp(-rho / 2) * Math.pow(rho, l) * assocLaguerre(n - l - 1, 2 * l + 1, rho);
}

/**
 * Sample ONE detection position from a discrete probability-density array on
 * grid (e.g. prob(psi)) by rejection sampling (core.sample). The pdf is
 * piecewise constant per grid cell; rng() -> [0, 1) is injectable for
 * reproducible statistics (defaults to Math.random). Detection events come
 * from |psi|² only — they are points, never animated trajectories.
 */
export function sampleDetection(pdfArray, grid, rng = Math.random) {
  const n = grid.n;
  if (!pdfArray || pdfArray.length !== n) {
    throw new RangeError(`sampleDetection: pdfArray must have grid.n = ${n} samples`);
  }
  let pdfMax = 0;
  for (let i = 0; i < n; i++) {
    if (pdfArray[i] > pdfMax) pdfMax = pdfArray[i];
  }
  if (!(pdfMax > 0)) throw new RangeError('sampleDetection: pdfArray has no positive mass');
  const pdf = (x) => {
    let i = Math.floor((x - grid.xMin) / grid.dx);
    if (i < 0) i = 0;
    if (i >= n) i = n - 1;
    return pdfArray[i];
  };
  return sampleFromPDF(pdf, grid.xMin, grid.xMax, pdfMax, rng);
}
