// core.sample — random-variate samplers with injectable uniform sources.
// Harvest sources (Sim_lab_sims/QM_sims/):
//   makeGaussian   2d_wavefunction_collapse_measurement.html
//                  sampleStandardNormal L1098–1114 — Box–Muller with cached
//                  spare (both variates used) and the u1 <= EPSILON log guard.
//   sampleFromPDF  infinite-potential-well.html sampleParticlePosition
//                  L1097–1113 — rejection sampler generalized from the
//                  hard-coded (pdf, [0,1], bound 2) to caller-supplied
//                  pdf/interval/bound.
//                  CHANGED AT HARVEST: the source silently returned the
//                  midpoint (0.5) when the attempt cap was hit, which biases
//                  every downstream statistic invisibly; the engine copy
//                  throws RangeError instead — cap exhaustion means the
//                  caller's pdfMax or pdf is wrong. It also throws if
//                  pdf(x) is ever negative, non-finite, or above pdfMax
//                  (a too-small pdfMax clips the distribution silently).
// Layer 1: no physics vocabulary — draws, densities, intervals.
// All randomness flows through the injected rng() -> [0, 1); never call
// Math.random() directly in sim code — inject it (or a seeded generator,
// which is what makes sampling tests and audits reproducible).

/**
 * Seeded uniform source: returns rng() -> [0, 1). Linear congruential
 * generator with the Numerical Recipes u32 constants,
 * s = (1664525·s + 1013904223) mod 2^32, value s/2^32 — small, fast, and
 * deterministic: equal seeds yield identical sequences (what makes sim
 * sampling and __audit sweeps reproducible). Not cryptographic.
 */
export function makeRng(seed) {
  let s = seed >>> 0;
  return function rng() {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Returns a zero-argument sampler for the standard normal N(0, 1) using
 * Box–Muller with a cached spare (one log/sqrt per TWO draws). rng() must
 * return uniforms in [0, 1); defaults to Math.random. Each returned sampler
 * owns an independent spare cache.
 */
export function makeGaussian(rng = Math.random) {
  let spare = null;
  return function gaussian() {
    if (spare !== null) {
      const cached = spare;
      spare = null;
      return cached;
    }
    let u1 = 0;
    while (u1 <= Number.EPSILON) u1 = rng(); // avoid log(0)
    const u2 = rng();
    const mag = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    spare = mag * Math.sin(angle);
    return mag * Math.cos(angle);
  };
}

/**
 * Draw one x in [xMin, xMax] distributed as the (not necessarily normalized)
 * density pdf(x), by rejection against the uniform envelope pdfMax >= pdf(x).
 * Uses two rng() uniforms per attempt; acceptance rate = mean(pdf)/pdfMax,
 * so keep pdfMax a TIGHT upper bound.
 *
 * Throws RangeError if:
 *  - pdfMax is not a positive finite number, or xMax <= xMin;
 *  - pdf(x) evaluates negative, non-finite, or > pdfMax (wrong envelope —
 *    a low pdfMax would silently clip the distribution);
 *  - no sample is accepted within maxAttempts (default 1000) draws (the
 *    source sim returned the interval midpoint here, biasing statistics;
 *    the engine fails loudly instead).
 */
export function sampleFromPDF(pdf, xMin, xMax, pdfMax, rng = Math.random, maxAttempts = 1000) {
  if (!Number.isFinite(pdfMax) || !(pdfMax > 0)) {
    throw new RangeError(`sampleFromPDF: pdfMax must be a positive finite number, got ${pdfMax}`);
  }
  if (!(xMax > xMin) || !Number.isFinite(xMin) || !Number.isFinite(xMax)) {
    throw new RangeError(`sampleFromPDF: need finite xMin < xMax, got [${xMin}, ${xMax}]`);
  }
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = xMin + (xMax - xMin) * rng();
    const p = pdf(x);
    if (!Number.isFinite(p) || p < 0) {
      throw new RangeError(`sampleFromPDF: pdf(${x}) = ${p} is not a finite non-negative number`);
    }
    if (p > pdfMax) {
      throw new RangeError(`sampleFromPDF: pdf(${x}) = ${p} exceeds pdfMax = ${pdfMax} — envelope must bound pdf on the interval`);
    }
    if (rng() * pdfMax < p) return x;
  }
  throw new RangeError(`sampleFromPDF: no sample accepted in ${maxAttempts} attempts — check that pdfMax is a valid (and tight) bound and pdf is not ~0 on [${xMin}, ${xMax}]`);
}
