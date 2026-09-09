// domain.em-fields — 2D electro/magnetostatics (namespace Engine.em).
// FIRST FRESH DOMAIN MODULE (plan M8): no harvest source exists — written
// directly against the core APIs (core.integrate stepRK4/stepRotate).
//
// Units convention: k = 1 (natural units), charge q in units of e. So a point
// charge contributes E = q r_hat / r^2 and V = q / r; force on a test charge
// is F = q E. B is a single out-of-plane number Bz (field along +z); the
// in-plane Lorentz force is F = q (E + v x Bz z_hat).
//
// Softening: every Coulomb sum uses r^2 -> r^2 + softening^2 (Plummer form)
// so field/potential stay finite exactly AT a charge; the default 1e-9 is
// far below any drawing or physics scale (perturbs r = 1 values at 1e-18).
//
// Field lines vs trajectories: traceFieldLine integrates the NORMALIZED field
// direction with fixed arc-length RK4 steps — a pure GEOMETRIC curve, tangent
// to E everywhere, parametrized by arc length. It is not a motion and nothing
// moves along it; charged-particle MOTION is stepParticle, which integrates
// the Lorentz force (and follows E only in the massless-overdamped limit,
// which this module does not model).
//
// Pure magnetic motion: with E ~ 0 the exact update is a rotation — advancing
// v with RK4 (or Euler) multiplies |v| by (1 + O((w dt)^k)) EVERY step, a
// systematic energy injection that spirals the orbit outward. stepParticle
// therefore switches to core.integrate stepRotate (norm-preserving closed
// form) whenever |E| at the particle is below pureBEps; the cyclotron
// radius mv/(qB) and period 2 pi m / (qB) are then exact to float rounding.

import { stepRK4, stepRotate } from '../../core/integrate.js';

/**
 * Validate a charge list: [{q, x, y}, ...] with finite numbers (q in units
 * of e, k = 1). Returns a NEW array of plain {q, x, y} objects — the
 * canonical input to every other function here. Throws RangeError otherwise.
 */
export function makeCharges(list) {
  if (!Array.isArray(list)) {
    throw new RangeError('makeCharges: expected an array of {q, x, y}');
  }
  return list.map((c, i) => {
    if (!c || typeof c !== 'object') {
      throw new RangeError(`makeCharges: charge ${i} is not an object`);
    }
    const { q, x, y } = c;
    if (!Number.isFinite(q) || !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new RangeError(
        `makeCharges: charge ${i} needs finite q, x, y — got {q: ${q}, x: ${x}, y: ${y}}`);
    }
    return { q, x, y };
  });
}

/**
 * Electric field [Ex, Ey] at (x, y): Coulomb superposition
 * E = sum_i q_i (r - r_i) / (|r - r_i|^2 + softening^2)^(3/2), k = 1.
 */
export function fieldAt(charges, x, y, { softening = 1e-9 } = {}) {
  const s2 = softening * softening;
  let Ex = 0, Ey = 0;
  for (let i = 0; i < charges.length; i++) {
    const dx = x - charges[i].x, dy = y - charges[i].y;
    const r2 = dx * dx + dy * dy + s2;
    const inv = charges[i].q / (r2 * Math.sqrt(r2));
    Ex += dx * inv;
    Ey += dy * inv;
  }
  return [Ex, Ey];
}

/**
 * Electric potential at (x, y): V = sum_i q_i / sqrt(|r - r_i|^2 +
 * softening^2), k = 1 (zero reference at infinity). grad V = -E exactly
 * (same softening in both).
 */
export function potentialAt(charges, x, y, { softening = 1e-9 } = {}) {
  const s2 = softening * softening;
  let V = 0;
  for (let i = 0; i < charges.length; i++) {
    const dx = x - charges[i].x, dy = y - charges[i].y;
    V += charges[i].q / Math.sqrt(dx * dx + dy * dy + s2);
  }
  return V;
}

/* Index of the first charge within stopRadius of (x, y), else -1. */
function chargeWithin(charges, x, y, stopRadius) {
  const r2 = stopRadius * stopRadius;
  for (let i = 0; i < charges.length; i++) {
    const dx = x - charges[i].x, dy = y - charges[i].y;
    if (dx * dx + dy * dy <= r2) return i;
  }
  return -1;
}

/**
 * Trace one field line from (x0, y0): RK4 (core.integrate stepRK4) on the
 * NORMALIZED field direction, so each step advances a fixed arc length
 * stepSize. dir = +1 follows E (toward negative charges), -1 follows -E.
 * Stops when the line comes within stopRadius of a charge, leaves bounds,
 * meets a stagnation point (|E| < 1e-12), or after maxSteps.
 * Returns points = [[x, y], ...] with two annotations: points.stop =
 * 'charge' | 'bounds' | 'stagnation' | 'maxSteps' and points.charge =
 * index of the terminating charge (-1 otherwise).
 * Keep stopRadius >= stepSize or a step can jump across the stop disc.
 * A field line is a geometric curve — never a particle trajectory.
 */
export function traceFieldLine(charges, x0, y0, {
  dir = +1,
  maxSteps = 2000,
  stepSize = 0.02,
  stopRadius = 0.05,
  bounds = { xMin: -1e3, xMax: 1e3, yMin: -1e3, yMax: 1e3 },
  softening = 1e-9,
} = {}) {
  if (dir !== 1 && dir !== -1) {
    throw new RangeError(`traceFieldLine: dir must be +1 or -1, got ${dir}`);
  }
  const deriv = (p) => {
    const [Ex, Ey] = fieldAt(charges, p[0], p[1], { softening });
    const m = Math.hypot(Ex, Ey);
    if (m < 1e-30) return [0, 0];
    return [(dir * Ex) / m, (dir * Ey) / m];
  };
  let p = [x0, y0];
  const points = [[x0, y0]];
  let stop = 'maxSteps';
  let chargeIdx = -1;
  for (let i = 0; i < maxSteps; i++) {
    const [Ex, Ey] = fieldAt(charges, p[0], p[1], { softening });
    if (Math.hypot(Ex, Ey) < 1e-12) { stop = 'stagnation'; break; }
    p = stepRK4(deriv, p, i * stepSize, stepSize);
    points.push([p[0], p[1]]);
    const ci = chargeWithin(charges, p[0], p[1], stopRadius);
    if (ci >= 0) { stop = 'charge'; chargeIdx = ci; break; }
    if (p[0] < bounds.xMin || p[0] > bounds.xMax ||
        p[1] < bounds.yMin || p[1] > bounds.yMax) { stop = 'bounds'; break; }
  }
  points.stop = stop;
  points.charge = chargeIdx;
  return points;
}

/**
 * Standard field-line seeding: for each charge with q != 0, n points evenly
 * spaced on a circle of seedRadius around it, n = max(1, round(perCharge *
 * |q|)) — line count proportional to |q|. Positive charges seed dir = +1
 * (lines leave), negative dir = -1 (trace the arriving lines backward).
 * Returns [{x, y, dir}]. Keep seedRadius > traceFieldLine's stopRadius.
 */
export function fieldLineSeeds(charges, { perCharge = 8, seedRadius = 0.1 } = {}) {
  const seeds = [];
  for (let i = 0; i < charges.length; i++) {
    const c = charges[i];
    if (c.q === 0) continue;
    const n = Math.max(1, Math.round(perCharge * Math.abs(c.q)));
    const dir = c.q > 0 ? 1 : -1;
    for (let k = 0; k < n; k++) {
      const a = (2 * Math.PI * k) / n;
      seeds.push({ x: c.x + seedRadius * Math.cos(a), y: c.y + seedRadius * Math.sin(a), dir });
    }
  }
  return seeds;
}

/* Marching-squares case table: caseIndex -> list of [edgeA, edgeB] pairs.
 * Corners: c0 = (x0,y0), c1 = (x1,y0), c2 = (x1,y1), c3 = (x0,y1); bit set
 * when corner value > level. Edges: 0 bottom (c0-c1), 1 right (c1-c2),
 * 2 top (c3-c2), 3 left (c0-c3). Cases 5/10 are ambiguous — resolved by the
 * cell-center average at runtime. */
const MS_TABLE = {
  1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 6: [[0, 2]],
  7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 11: [[1, 2]], 12: [[3, 1]],
  13: [[0, 1]], 14: [[3, 0]],
};

/**
 * Equipotential contour V(x, y) = level by marching squares on a grid.nx x
 * grid.ny cell grid over bounds. Each crossing vertex is then corrected onto
 * the exact level with `refine` Newton steps along grad V (= -E), so vertices
 * satisfy V = level far beyond linear interpolation. Returns segments =
 * [[[xA, yA], [xB, yB]], ...] (unordered; ambiguous saddle cells resolved by
 * the cell-center value). Equipotentials cross field lines at right angles.
 * NOTE: generic scalar-field contouring — a future core/contour module could
 * absorb the marching-squares core; only the refine step is EM-specific.
 */
export function equipotentialAt(charges, level, {
  bounds = { xMin: -5, xMax: 5, yMin: -5, yMax: 5 },
  grid = {},
  softening = 1e-9,
  refine = 2,
} = {}) {
  const nx = grid.nx || 96, ny = grid.ny || 96;
  if (!(nx >= 2) || !(ny >= 2)) {
    throw new RangeError(`equipotentialAt: grid must be at least 2x2, got ${nx}x${ny}`);
  }
  if (!(bounds.xMax > bounds.xMin) || !(bounds.yMax > bounds.yMin)) {
    throw new RangeError('equipotentialAt: bounds must satisfy xMin < xMax and yMin < yMax');
  }
  const dx = (bounds.xMax - bounds.xMin) / nx;
  const dy = (bounds.yMax - bounds.yMin) / ny;
  const vals = new Float64Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) {
    const y = bounds.yMin + j * dy;
    for (let i = 0; i <= nx; i++) {
      vals[j * (nx + 1) + i] = potentialAt(charges, bounds.xMin + i * dx, y, { softening });
    }
  }

  const refineVertex = (p) => {
    for (let k = 0; k < refine; k++) {
      const V = potentialAt(charges, p[0], p[1], { softening });
      const [Ex, Ey] = fieldAt(charges, p[0], p[1], { softening });
      const e2 = Ex * Ex + Ey * Ey;
      if (!(e2 > 1e-30) || !Number.isFinite(V)) break;
      // grad V = -E, so the Newton correction -(V - level) grad V / |grad V|^2
      // is +(V - level) E / |E|^2.
      p[0] += ((V - level) * Ex) / e2;
      p[1] += ((V - level) * Ey) / e2;
    }
    return p;
  };

  const segments = [];
  for (let j = 0; j < ny; j++) {
    const y0 = bounds.yMin + j * dy, y1 = y0 + dy;
    for (let i = 0; i < nx; i++) {
      const x0 = bounds.xMin + i * dx, x1 = x0 + dx;
      const v00 = vals[j * (nx + 1) + i], v10 = vals[j * (nx + 1) + i + 1];
      const v01 = vals[(j + 1) * (nx + 1) + i], v11 = vals[(j + 1) * (nx + 1) + i + 1];
      if (!Number.isFinite(v00) || !Number.isFinite(v10) ||
          !Number.isFinite(v01) || !Number.isFinite(v11)) continue;
      const idx = (v00 > level ? 1 : 0) | (v10 > level ? 2 : 0) |
                  (v11 > level ? 4 : 0) | (v01 > level ? 8 : 0);
      if (idx === 0 || idx === 15) continue;
      let pairs;
      if (idx === 5 || idx === 10) {
        const centerAbove = (v00 + v10 + v11 + v01) / 4 > level;
        if (idx === 5) pairs = centerAbove ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
        else pairs = centerAbove ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]];
      } else {
        pairs = MS_TABLE[idx];
      }
      const edgePoint = (e) => {
        let t;
        switch (e) {
          case 0: t = (level - v00) / (v10 - v00); return [x0 + t * dx, y0];
          case 1: t = (level - v10) / (v11 - v10); return [x1, y0 + t * dy];
          case 2: t = (level - v01) / (v11 - v01); return [x0 + t * dx, y1];
          default: t = (level - v00) / (v01 - v00); return [x0, y0 + t * dy];
        }
      };
      for (const [a, b] of pairs) {
        segments.push([refineVertex(edgePoint(a)), refineVertex(edgePoint(b))]);
      }
    }
  }
  return segments;
}

/**
 * In-plane Lorentz force for out-of-plane B: F = q (E + v x Bz z_hat) =
 * [q (Ex + vy Bz), q (Ey - vx Bz)]. E = [Ex, Ey], v = [vx, vy], B = Bz.
 */
export function lorentzForce(q, E, B, v) {
  if (!E || E.length !== 2 || !v || v.length !== 2) {
    throw new RangeError('lorentzForce: E and v must be 2-component [x, y] vectors');
  }
  return [q * (E[0] + v[1] * B), q * (E[1] - v[0] * B)];
}

/**
 * Validated particle state {q, m, x, y, vx, vy} (m > 0; velocities default
 * 0) — the state stepParticle advances IN PLACE.
 */
export function makeChargedParticle({ q, m, x, y, vx = 0, vy = 0 }) {
  if (!Number.isFinite(m) || !(m > 0)) {
    throw new RangeError(`makeChargedParticle: m must be a positive finite number, got ${m}`);
  }
  for (const [name, v] of [['q', q], ['x', x], ['y', y], ['vx', vx], ['vy', vy]]) {
    if (!Number.isFinite(v)) {
      throw new RangeError(`makeChargedParticle: ${name} must be a finite number, got ${v}`);
    }
  }
  return { q, m, x, y, vx, vy };
}

/**
 * Advance a particle by dt IN PLACE under the Lorentz force from the charge
 * superposition (fieldAt), a uniform out-of-plane Bz, and an optional
 * uniform applied field E0 = [Ex, Ey] (e.g. for E x B drift setups).
 *
 * Route (documented, test-relied-on):
 *  - |E| <= pureBEps at the particle: PURE MAGNETIC motion. RK4 is the wrong
 *    tool here — it inflates |v| every step and spirals the orbit outward —
 *    so the velocity is rotated with core.integrate stepRotate (exact,
 *    norm-preserving) by -omega dt, omega = q Bz / m, and the position moves
 *    along the exact circular chord. Cyclotron radius m|v|/(|q| Bz) and
 *    period 2 pi m / (q Bz) hold to float rounding for any dt.
 *  - otherwise: one core.integrate stepRK4 step on [x, y, vx, vy] with
 *    dv/dt = lorentzForce/m. Returns p.
 */
export function stepParticle(p, charges, Bz, dt, {
  softening = 1e-9, E0 = null, pureBEps = 1e-12,
} = {}) {
  const eAt = (x, y) => {
    const E = fieldAt(charges, x, y, { softening });
    if (E0) { E[0] += E0[0]; E[1] += E0[1]; }
    return E;
  };
  const Ehere = eAt(p.x, p.y);
  if (Math.hypot(Ehere[0], Ehere[1]) <= pureBEps) {
    const omega = (p.q * Bz) / p.m;         // signed cyclotron frequency
    if (omega === 0) {                       // no force at all: free flight
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p;
    }
    const theta = -omega * dt;               // velocity rotation angle (CCW)
    // Exact chord: displacement = (2 sin(omega dt / 2) / omega) * R(theta/2) v.
    const vHalf = stepRotate([p.vx, p.vy], null, 0.5 * theta);
    const f = (2 * Math.sin(0.5 * omega * dt)) / omega;
    p.x += f * vHalf[0];
    p.y += f * vHalf[1];
    const vNew = stepRotate([p.vx, p.vy], null, theta);
    p.vx = vNew[0];
    p.vy = vNew[1];
    return p;
  }
  const deriv = (s) => {
    const F = lorentzForce(p.q, eAt(s[0], s[1]), Bz, [s[2], s[3]]);
    return [s[2], s[3], F[0] / p.m, F[1] / p.m];
  };
  const out = stepRK4(deriv, [p.x, p.y, p.vx, p.vy], 0, dt);
  p.x = out[0]; p.y = out[1]; p.vx = out[2]; p.vy = out[3];
  return p;
}
