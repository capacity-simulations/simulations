// core.complex — scalar {re, im} arithmetic plus split-array complex ops.
// Harvest sources (Sim_lab_sims/QM_sims/):
//   cMul, cDiv, cExp, cSqrt  Time_evolution_Gaussian_wavepacket.html L947–974
//                            (complexMultiply/Divide/Exp/Sqrt) — math verbatim.
//   arrMulPhase, arrAbs2, arrNormSq  factor the split re/im Float64Array
//                            elementwise-rotation idiom inlined 6+ times in
//                            Quantum_Tunneling_Gaussian_Wave.html and
//                            Classical-vs-schrodinger-ANHARMONIC.html.
// Layer 1: no physics vocabulary — values, arrays, phases, magnitudes.
//
// Scalar ops allocate one {re, im} object per call; inside per-element loops
// use the arr* split-array ops instead (zero allocation, in place).

/** Complex sum a + b -> {re, im}. */
export function cAdd(a, b) {
  return { re: a.re + b.re, im: a.im + b.im };
}

/** Complex difference a - b -> {re, im}. */
export function cSub(a, b) {
  return { re: a.re - b.re, im: a.im - b.im };
}

/** Complex product a * b -> {re, im}. */
export function cMul(a, b) {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

/** Complex quotient a / b -> {re, im}. */
export function cDiv(a, b) {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

/** Real scaling s * z -> {re, im}. */
export function cScale(z, s) {
  return { re: z.re * s, im: z.im * s };
}

/** Squared magnitude |z|^2 -> number. */
export function cAbs2(z) {
  return z.re * z.re + z.im * z.im;
}

/** Complex exponential e^z -> {re, im}. */
export function cExp(z) {
  const mag = Math.exp(z.re);
  return {
    re: mag * Math.cos(z.im),
    im: mag * Math.sin(z.im),
  };
}

/**
 * Principal square root of z -> {re, im} (result re >= 0; branch cut on the
 * negative real axis, sign of im follows sign of z.im).
 */
export function cSqrt(z) {
  const r = Math.hypot(z.re, z.im);
  const re = Math.sqrt(Math.max(0, (r + z.re) / 2));
  const imMag = Math.sqrt(Math.max(0, (r - z.re) / 2));
  return { re, im: z.im < 0 ? -imMag : imMag };
}

/**
 * Elementwise complex multiply, IN PLACE on (re, im):
 *   (re[i] + i*im[i]) *= (phaseRe[i] + i*phaseIm[i])
 * The factor arrays are typically precomputed unit phases e^{i*phi} but any
 * complex factor array works. All four arrays must share one length.
 */
export function arrMulPhase(re, im, phaseRe, phaseIm) {
  const n = re.length;
  if (im.length !== n || phaseRe.length !== n || phaseIm.length !== n) {
    throw new RangeError('arrMulPhase: all four arrays must have the same length');
  }
  for (let i = 0; i < n; i++) {
    const a = re[i], b = im[i];
    re[i] = a * phaseRe[i] - b * phaseIm[i];
    im[i] = a * phaseIm[i] + b * phaseRe[i];
  }
}

/**
 * Elementwise squared magnitude: out[i] = re[i]^2 + im[i]^2.
 * out is allocated (Float64Array) when omitted; returns out.
 */
export function arrAbs2(re, im, out) {
  const n = re.length;
  if (im.length !== n) throw new RangeError('arrAbs2: re and im must have the same length');
  if (out === undefined) out = new Float64Array(n);
  else if (out.length !== n) throw new RangeError('arrAbs2: out must have the same length as re');
  for (let i = 0; i < n; i++) out[i] = re[i] * re[i] + im[i] * im[i];
  return out;
}

/**
 * Squared norm of a sampled complex array: sum_i (re[i]^2 + im[i]^2) * dx.
 * (Riemann sum on a uniform grid; dx defaults to 1 for a plain vector norm.)
 */
export function arrNormSq(re, im, dx = 1) {
  const n = re.length;
  if (im.length !== n) throw new RangeError('arrNormSq: re and im must have the same length');
  let s = 0;
  for (let i = 0; i < n; i++) s += re[i] * re[i] + im[i] * im[i];
  return s * dx;
}
