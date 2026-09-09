// domain.relativity — special-relativity kinematics. c = 1 everywhere: beta is
// v/c, ct carries time. Physics only — no canvas, no DOM (diagram.js draws).
// Harvest sources (Sim_lab_sims/SR_sims/), provenance per plan M6:
//   gamma            one name retiring the 8 drifted spellings across 27 files
//                    (gam, gamma, gammaOf, g, ...); |beta| >= 1 guard added.
//   boost2/unboost2  L18-s1-tachyon-causality-violation-shell.html
//                    toFrame/fromFrame L827-828 (best of the 12 spellings of
//                    the 2D boost across 15 files) = the -new trio's boost
//                    (L18-s2-...-new.html L358), argument order (ct, x).
//   boost4/minkowskiNormSq  L13-s1-lorentz-transformations-on-vectors-shell
//                    .html boost/mdot L830-831, extended from (V0, V1) to a
//                    full [ct, x, y, z] boost along x.
//   interval         -new trio interval/classify (L18-s2-new L357-358) with
//                    DIAGRAM-HARVEST fix #10: the baked-in |ds2| < 0.035
//                    threshold becomes an input-relative / caller epsilon.
//   rapidity/betaFromRapidity  hyperbolic parametrization (L10-s2, L13-s1).
//   addVelocities    relativistic composition — the ONLY sanctioned way to
//                    combine velocities in this domain.
//   properTimeAlong  L09-s1-worldline-length-and-proper-time-shell.html
//                    seg/pathInfo L864-882: tau = sum sqrt(dct^2 - dx^2);
//                    a spacelike segment makes tau undefined -> NaN (the
//                    source zeroed the segment and raised a valid=false flag).

/** Lorentz factor 1/sqrt(1 - beta^2). Throws RangeError for |beta| >= 1
 * (also rejects NaN) — no tachyonic gamma ever leaves this module. */
export function gamma(beta) {
  if (!(Math.abs(beta) < 1)) {
    throw new RangeError('gamma: |beta| must be < 1, got ' + beta);
  }
  return 1 / Math.sqrt(1 - beta * beta);
}

/**
 * 2D Lorentz boost S -> S' (frame S' moving at +beta along x, as seen in S):
 *   ct' = g (ct - beta x),  x' = g (x - beta ct).
 * Returns [ctPrime, xPrime].
 */
export function boost2(ct, x, beta) {
  const g = gamma(beta);
  return [g * (ct - beta * x), g * (x - beta * ct)];
}

/** Inverse 2D boost S' -> S: exactly boost2 with -beta. Returns [ct, x]. */
export function unboost2(ct, x, beta) {
  return boost2(ct, x, -beta);
}

/**
 * 4-vector boost along x: V = [ct, x, y, z] -> V' (new array).
 * Transverse components pass through unchanged.
 */
export function boost4(V, beta) {
  if (!V || V.length !== 4) {
    throw new RangeError('boost4: V must be a 4-component [ct, x, y, z] vector');
  }
  const g = gamma(beta);
  return [g * (V[0] - beta * V[1]), g * (V[1] - beta * V[0]), V[2], V[3]];
}

/**
 * Minkowski norm squared with the (-,+,+,+) signature of the L13 source mdot:
 *   -ct^2 + x^2 + y^2 + z^2. Boost-invariant.
 * NOTE the diagram/interval convention is the OPPOSITE sign (ds2 = dct^2-dx^2,
 * timelike positive) — do not mix the two; interval() documents its own sign.
 */
export function minkowskiNormSq(V) {
  if (!V || V.length !== 4) {
    throw new RangeError('minkowskiNormSq: V must be a 4-component [ct, x, y, z] vector');
  }
  return -V[0] * V[0] + V[1] * V[1] + V[2] * V[2] + V[3] * V[3];
}

/**
 * Classify a separation (dct, dx): ds2 = dct^2 - dx^2 (timelike POSITIVE —
 * the diagram sims' convention, opposite of minkowskiNormSq).
 * kind: 'timelike' | 'spacelike' | 'lightlike' with |ds2| <= eps lightlike.
 * eps: opts.lightlikeEps when given (diagram code passes one derived from its
 * snap grid — fix #10); otherwise relative to the inputs' magnitude, so an
 * exactly-null separation survives float noise but nothing physical is eaten.
 */
export function interval(dct, dx, opts = {}) {
  const ds2 = dct * dct - dx * dx;
  const eps = opts.lightlikeEps != null
    ? opts.lightlikeEps
    : 1e-12 * Math.max(dct * dct + dx * dx, 1);
  const kind = Math.abs(ds2) <= eps ? 'lightlike' : ds2 > 0 ? 'timelike' : 'spacelike';
  return { ds2, kind };
}

/** Rapidity phi = atanh(beta). Throws RangeError for |beta| >= 1. */
export function rapidity(beta) {
  if (!(Math.abs(beta) < 1)) {
    throw new RangeError('rapidity: |beta| must be < 1, got ' + beta);
  }
  return Math.atanh(beta);
}

/** Inverse of rapidity: beta = tanh(phi). Rapidities ADD under composition. */
export function betaFromRapidity(phi) {
  return Math.tanh(phi);
}

/**
 * Relativistic velocity composition (u + v)/(1 + u v), u and v in units of c.
 * Accepts |u|, |v| <= 1 (light itself composes to c); |result| <= 1 always.
 * Throws RangeError beyond c or for the undefined u = -v = ±1 case.
 */
export function addVelocities(u, v) {
  if (!(Math.abs(u) <= 1) || !(Math.abs(v) <= 1)) {
    throw new RangeError('addVelocities: |u| and |v| must be <= 1 (units of c)');
  }
  const denom = 1 + u * v;
  if (denom === 0) {
    throw new RangeError('addVelocities: composition undefined for u = -v = ±1');
  }
  const w = (u + v) / denom;
  return w > 1 ? 1 : w < -1 ? -1 : w;
}

/* Accept {ct, x} objects or [ct, x] pairs for polyline points. */
function pointCtX(p) {
  if (Array.isArray(p) || ArrayBuffer.isView(p)) return [p[0], p[1]];
  return [p.ct, p.x];
}

/**
 * Proper time along a polyline worldline: sum of sqrt(dct^2 - dx^2) over
 * consecutive points ({ct, x} or [ct, x]). A lightlike segment contributes 0;
 * any spacelike segment (|dx| > |dct|) makes proper time undefined -> NaN.
 * The straight timelike path between fixed endpoints is MAXIMAL (L09 physics).
 */
export function properTimeAlong(points) {
  let tau = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const [ct0, x0] = pointCtX(points[i]);
    const [ct1, x1] = pointCtX(points[i + 1]);
    const dct = ct1 - ct0, dx = x1 - x0;
    const s2 = dct * dct - dx * dx;
    if (s2 < 0) return NaN;
    tau += Math.sqrt(s2);
  }
  return tau;
}
