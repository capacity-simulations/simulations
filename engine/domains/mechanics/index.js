// domain.mechanics — classical point-mechanics closed forms (namespace
// Engine.mech). Physics results only — no canvas, no DOM, no time stepping:
// state ADVANCES exclusively through core.integrate steppers in sim code;
// this module supplies the analytic relations those sims read out.
// Harvest sources (Sim_lab_sims/CM_sims/), provenance per plan M6b:
//   solveKepler        L36-The Energy of the Orbit-new.html advance() L867–910
//                      — BOTH branches: elliptic E − e·sinE = M and hyperbolic
//                      e·sinhF − F = M. The source's fixed 8/12 Newton sweeps
//                      become core.roots newton (tol 1e-15) with a bisect
//                      fallback; hyperbolic initial guess upgraded from F0 = M
//                      to F0 = asinh(M/e) (equivalent near 0, robust for
//                      large |M|). e = 1 throws — Barker's closed form stays
//                      sim-side (L36 L907–921).
//   orbitFromPeriapsis L37-Kepler's Laws.html initAtPerihelion L583–587 +
//                      sampleOrbit L620–630 (focus at origin, periapsis on +x)
//                      + T = 2π·sqrt(a³/mu) (L37 units GM = 4π² make T = √a³).
//   pendulumPeriodRatio L9-The pendulum.html agmRatio L854–858 verbatim —
//                      T/T0 = (2/π)K(sin θ0/2) = 1/agm(1, cos θ0/2); this IS
//                      the sim's __audit formula (deferred out of core at M3).
//   dragForceLinear/dragForceQuadratic/terminalVelocity
//                      L16-Friction-in-3d.html dragFlight L867–886 (F = −b·v,
//                      v_T = m·g/b, τ = m/b) and quadFlight deriv L897–900
//                      (F = −c·|v|·v, v_T = sqrt(m·g/c)).
//   restitutionCollision1D / explosionOutcome
//                      Collisions.html computePhysics L942–973: restitution
//                      formulas v1' = ((m1 − e·m2)u1 + (1+e)·m2·u2)/M (e = 1
//                      reproduces the source's elastic branch, e = 0 its
//                      perfectly-inelastic branch) and the explosion
//                      p* = sqrt(2·mu·Q) momentum split. Both conserve
//                      momentum BY CONSTRUCTION; ΔKE = −½·mu·(1−e²)·u_rel²
//                      (source L1141–1142).
//   effectivePotential / classifyOrbitByEnergy
//                      L36-Energy Veff() L764–766 (per unit mass) and
//                      regimeName/deriveConic L820–852 (±1e-4 thresholds kept
//                      as the default eps; sub-minimum E throws instead of the
//                      source's silent clamp).

import { newton, bisect } from '../../core/roots.js';

/**
 * Solve the Kepler equation for the anomaly at mean anomaly M (radians):
 *   e < 1 (elliptic):    E − e·sin E = M  -> eccentric anomaly E
 *   e > 1 (hyperbolic):  e·sinh F − F = M -> hyperbolic anomaly F
 * Residual |lhs − M| converges to ~1e-13 or better. Throws RangeError for
 * e < 0, e = 1 (parabolic — use Barker's closed form in sim code), or
 * non-finite inputs.
 */
export function solveKepler(M, e) {
  if (!Number.isFinite(M) || !Number.isFinite(e) || e < 0) {
    throw new RangeError(`solveKepler: need finite M and e >= 0, got M=${M}, e=${e}`);
  }
  if (e === 1) {
    throw new RangeError('solveKepler: e = 1 is parabolic — solve Barker\'s equation instead');
  }
  const opts = { tol: 1e-15, maxIter: 80 };
  if (e < 1) {
    const f = (E) => E - e * Math.sin(E) - M;
    const df = (E) => 1 - e * Math.cos(E);
    let E = newton(f, df, M + e * Math.sin(M), opts);
    if (E === null) E = bisect(f, M - e, M + e, { tol: 1e-15, maxIter: 200 });
    if (E === null) throw new RangeError(`solveKepler: no convergence at M=${M}, e=${e}`);
    return E;
  }
  const f = (F) => e * Math.sinh(F) - F - M;
  const df = (F) => e * Math.cosh(F) - 1;
  let F = newton(f, df, Math.asinh(M / e), opts);
  if (F === null) {
    // Bracket outward from 0 in the direction of M, then bisect.
    let hi = Math.sign(M) || 1;
    let n = 0;
    while (f(0) * f(hi) > 0 && n++ < 200) hi *= 1.5;
    F = bisect(f, Math.min(0, hi), Math.max(0, hi), { tol: 1e-15, maxIter: 200 });
  }
  if (F === null) throw new RangeError(`solveKepler: no convergence at M=${M}, e=${e}`);
  return F;
}

/**
 * Elliptic orbit about a focus at the origin, periapsis on +x, given
 * semi-major axis a > 0, eccentricity 0 <= e < 1 and gravitational parameter
 * mu = G·M > 0. All returned quantities are PER UNIT MASS (specific):
 *   r(theta)          conic radius p/(1 + e·cos theta), p = a(1 − e²)
 *   position(E)       {x, y} from eccentric anomaly: x = a(cos E − e),
 *                     y = a·sqrt(1 − e²)·sin E   (L37 sampleOrbit convention)
 *   period            2π·sqrt(a³/mu)    (Kepler's third law)
 *   energy            −mu/(2a)          (specific orbital energy)
 *   angularMomentum   sqrt(mu·a·(1 − e²)) = r_peri · v_peri
 *   periapsis/apoapsis a(1 − e), a(1 + e)
 */
export function orbitFromPeriapsis(a, e, mu) {
  if (!(a > 0) || !(mu > 0) || !(e >= 0 && e < 1)) {
    throw new RangeError(`orbitFromPeriapsis: need a > 0, mu > 0, 0 <= e < 1, got a=${a}, e=${e}, mu=${mu}`);
  }
  const p = a * (1 - e * e);
  const b = a * Math.sqrt(1 - e * e);
  return {
    r: (theta) => p / (1 + e * Math.cos(theta)),
    position: (E) => ({ x: a * (Math.cos(E) - e), y: b * Math.sin(E) }),
    period: 2 * Math.PI * Math.sqrt((a * a * a) / mu),
    energy: -mu / (2 * a),
    angularMomentum: Math.sqrt(mu * a * (1 - e * e)),
    periapsis: a * (1 - e),
    apoapsis: a * (1 + e),
  };
}

/**
 * Exact pendulum period ratio T(theta0)/T0 = (2/π)·K(sin theta0/2)
 * = 1/agm(1, cos theta0/2), by AGM iteration to machine precision
 * (L9 agmRatio verbatim). theta0 in radians, |theta0| < π.
 */
export function pendulumPeriodRatio(theta0) {
  if (!(Math.abs(theta0) < Math.PI)) {
    throw new RangeError(`pendulumPeriodRatio: need |theta0| < pi, got ${theta0}`);
  }
  let a = 1;
  let b = Math.cos(theta0 / 2);
  while (Math.abs(a - b) > 1e-12) {
    const an = (a + b) / 2;
    b = Math.sqrt(a * b);
    a = an;
  }
  return 1 / a;
}

/** Linear (Stokes) drag force F = −b·v. v may be a number or an array of
 * velocity components (returns the same kind). */
export function dragForceLinear(v, b) {
  if (typeof v === 'number') return -b * v;
  const out = Array.isArray(v) ? new Array(v.length) : new v.constructor(v.length);
  for (let i = 0; i < v.length; i++) out[i] = -b * v[i];
  return out;
}

/** Quadratic drag force F = −c·|v|·v (opposes motion, magnitude c·|v|²).
 * v may be a number or an array of components (|v| is the Euclidean speed). */
export function dragForceQuadratic(v, c) {
  if (typeof v === 'number') return -c * Math.abs(v) * v;
  let s = 0;
  for (let i = 0; i < v.length; i++) s += v[i] * v[i];
  const speed = Math.sqrt(s);
  const out = Array.isArray(v) ? new Array(v.length) : new v.constructor(v.length);
  for (let i = 0; i < v.length; i++) out[i] = -c * speed * v[i];
  return out;
}

/** Terminal speed under linear drag: v_T = m·g/b (L16: 32.7 m/s at
 * m = 1, g = 9.81, b = 0.3). For quadratic drag use sqrt(m·g/c). */
export function terminalVelocity(m, g, b) {
  if (!(m > 0) || !(b > 0)) {
    throw new RangeError(`terminalVelocity: need m > 0 and b > 0, got m=${m}, b=${b}`);
  }
  return (m * g) / b;
}

/**
 * 1D collision with coefficient of restitution e in [0, 1] -> [v1', v2'].
 *   v1' = ((m1 − e·m2)·v1 + (1+e)·m2·v2)/(m1+m2)   (and symmetrically v2')
 * Momentum is conserved BY CONSTRUCTION; e = 1 is elastic, e = 0 perfectly
 * inelastic (both leave with v_cm). ΔKE = −½·mu·(1−e²)·(v1−v2)².
 */
export function restitutionCollision1D(m1, v1, m2, v2, e) {
  if (!(m1 > 0) || !(m2 > 0) || !(e >= 0 && e <= 1)) {
    throw new RangeError(`restitutionCollision1D: need m1, m2 > 0 and 0 <= e <= 1, got m1=${m1}, m2=${m2}, e=${e}`);
  }
  const M = m1 + m2;
  return [
    ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / M,
    ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / M,
  ];
}

/**
 * Two-body explosion at rest releasing energy Q >= 0 -> [v1, v2].
 * Each fragment carries momentum pStar = sqrt(2·mu·Q), mu = m1·m2/(m1+m2):
 * v1 = +pStar/m1, v2 = −pStar/m2 (total momentum stays exactly zero; KE
 * sums to Q).
 */
export function explosionOutcome(m1, m2, Q) {
  if (!(m1 > 0) || !(m2 > 0) || !(Q >= 0)) {
    throw new RangeError(`explosionOutcome: need m1, m2 > 0 and Q >= 0, got m1=${m1}, m2=${m2}, Q=${Q}`);
  }
  const mu = (m1 * m2) / (m1 + m2);
  const pStar = Math.sqrt(2 * mu * Q);
  return [pStar / m1, -pStar / m2];
}

/**
 * Effective radial potential PER UNIT MASS for motion about mu = G·M with
 * specific angular momentum L: returns Veff(r) = −mu/r + L²/(2r²).
 * Minimum sits at r_c = L²/mu with Veff(r_c) = −mu²/(2L²) (circular orbit).
 */
export function effectivePotential(L, mu) {
  if (!(mu > 0) || !Number.isFinite(L)) {
    throw new RangeError(`effectivePotential: need mu > 0 and finite L, got L=${L}, mu=${mu}`);
  }
  return (r) => -mu / r + (L * L) / (2 * r * r);
}

/**
 * Classify an orbit by specific energy E against the effective-potential
 * minimum veffMin (both per unit mass):
 *   'circular'  |E − veffMin| <= eps      'bound'    veffMin < E < 0
 *   'parabolic' |E| <= eps                'unbound'  E > 0
 * eps defaults to the source's 1e-4 band (L36 regimeName). E below
 * veffMin − eps is unphysical for this L and THROWS (the source silently
 * clamped to the well floor).
 */
export function classifyOrbitByEnergy(E, veffMin, { eps = 1e-4 } = {}) {
  if (!Number.isFinite(E) || !Number.isFinite(veffMin)) {
    throw new RangeError(`classifyOrbitByEnergy: need finite E and veffMin, got E=${E}, veffMin=${veffMin}`);
  }
  if (E < veffMin - eps) {
    throw new RangeError(`classifyOrbitByEnergy: E=${E} below the effective-potential minimum ${veffMin} — no orbit exists at this angular momentum`);
  }
  if (Math.abs(E - veffMin) <= eps) return 'circular';
  if (E > eps) return 'unbound';
  if (Math.abs(E) <= eps) return 'parabolic';
  return 'bound';
}
