// core.integrate — time steppers for array state. Semantics-free: state,
// derivative, position-rate, event vocabulary only.
// Harvest sources (Sim_lab_sims/):
//   stepRK4          CM_sims/L16-Friction-in-3d.html rk4() (~L904), generalized
//                    from fixed 4-component state to any array length/type.
//   stepVerlet       CM_sims/L37-Kepler's Laws.html stepVerlet() (~L574),
//                    generalized from {x,y,vx,vy} fields to arrays.
//   stepSemiImplicit CM_sims/L4-Forces on objects explorer.html physics()
//                    (~L1234) idiom: rate += a*dt THEN pos += rate*dt.
//   stepRotate       CM_sims/L30-Coriolis on a Rotating Sphere.html stepParcel()
//                    (~L1111) exact planar rotation.
//   stepAdaptive     CM_sims/L36-Scattering Extension.html computeTrack/safeDt
//                    (~L825) — its radius-based dt heuristic generalized to a
//                    problem-agnostic step-doubling error estimate.
//   makeEventStepper CM_sims/Galperins_Billiard.html nextEvent/advance/
//                    resolveWall/resolveBB/step (~L796–885), generalized to
//                    caller-supplied detect/resolve pairs.

/* Allocate a fresh array of the same kind (number[] or Float64Array) as y. */
function alloc(y, n) {
  return Array.isArray(y) ? new Array(n) : new y.constructor(n);
}

/**
 * One classical RK4 step. deriv(y, t) -> array of dy/dt.
 * Returns a NEW array of the same kind as y; never mutates y.
 */
export function stepRK4(deriv, y, t, h) {
  const n = y.length;
  const tmp = alloc(y, n);
  const k1 = deriv(y, t);
  for (let i = 0; i < n; i++) tmp[i] = y[i] + 0.5 * h * k1[i];
  const k2 = deriv(tmp, t + 0.5 * h);
  const tmp2 = alloc(y, n);
  for (let i = 0; i < n; i++) tmp2[i] = y[i] + 0.5 * h * k2[i];
  const k3 = deriv(tmp2, t + 0.5 * h);
  const tmp3 = alloc(y, n);
  for (let i = 0; i < n; i++) tmp3[i] = y[i] + h * k3[i];
  const k4 = deriv(tmp3, t + h);
  const out = alloc(y, n);
  for (let i = 0; i < n; i++) {
    out[i] = y[i] + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }
  return out;
}

/**
 * One velocity-Verlet step, IN PLACE on pos and rate arrays.
 * accel(pos) -> array (must depend on pos only for the method's
 * time-reversibility/energy behaviour to hold). The first accel result is
 * copied before pos moves, so accel may reuse an internal buffer.
 */
export function stepVerlet(accel, pos, vel, h) {
  const n = pos.length;
  const a0 = alloc(pos, n);
  const aRaw = accel(pos);
  for (let i = 0; i < n; i++) a0[i] = aRaw[i];
  for (let i = 0; i < n; i++) pos[i] += vel[i] * h + 0.5 * a0[i] * h * h;
  const a1 = accel(pos);
  for (let i = 0; i < n; i++) vel[i] += 0.5 * (a0[i] + a1[i]) * h;
}

/**
 * One semi-implicit (symplectic) Euler step, IN PLACE:
 * rate is updated first, then position moves with the NEW rate.
 * accel(pos, vel) -> array (may depend on vel, e.g. damping terms).
 */
export function stepSemiImplicit(accel, pos, vel, h) {
  const n = pos.length;
  const a = accel(pos, vel);
  for (let i = 0; i < n; i++) vel[i] += a[i] * h;
  for (let i = 0; i < n; i++) pos[i] += vel[i] * h;
}

/**
 * Exact planar rotation of vec = [x, y] by angle (radians, counter-clockwise).
 * Returns a NEW 2-array of the same kind as vec.
 *
 * Why a dedicated stepper (rationale from the L30 source comment): advancing a
 * pure rotation with forward Euler multiplies the norm by sqrt(1 + (w*dt)^2)
 * EVERY step — a systematic injection of magnitude. Applying the closed-form
 * rotation matrix instead preserves the norm to machine precision for any
 * step size.
 *
 * v1 supports planar rotation only: pass axis = null (or call with
 * (vec, angle)). A non-null axis throws until 3D rotation lands.
 */
export function stepRotate(vec, axis, angle) {
  if (angle === undefined) { angle = axis; axis = null; }
  if (axis != null) {
    throw new RangeError('stepRotate v1 supports planar rotation only — pass axis = null');
  }
  const c = Math.cos(angle), s = Math.sin(angle);
  const out = alloc(vec, 2);
  out[0] = vec[0] * c - vec[1] * s;
  out[1] = vec[0] * s + vec[1] * c;
  return out;
}

/**
 * One adaptive RK4 step with step-doubling error control.
 * Compares a full step against two half steps; the classical step-doubling
 * estimate err = |y_two_halves - y_full| / (2^4 - 1) per component is tested
 * against tol * (1 + |y_i|) (mixed absolute/relative). On reject the step
 * shrinks and retries; at h <= hMin the step is accepted regardless (the
 * caller pins the floor). Returns { y, hUsed, hNext } — y is a NEW array
 * (two-half-steps result, no extrapolation); never mutates the input.
 */
export function stepAdaptive(deriv, y, t, h, { tol = 1e-8, hMin = 1e-12, hMax = Infinity } = {}) {
  const SAFETY = 0.9, SHRINK_MIN = 0.2, GROW_MAX = 5, EXP = 0.2; // 1/(order+1)
  const n = y.length;
  h = Math.min(Math.max(h, hMin), hMax);
  for (;;) {
    const yFull = stepRK4(deriv, y, t, h);
    const yMid = stepRK4(deriv, y, t, 0.5 * h);
    const y2 = stepRK4(deriv, yMid, t + 0.5 * h, 0.5 * h);
    let ratio = 0;
    for (let i = 0; i < n; i++) {
      if (!Number.isFinite(y2[i]) || !Number.isFinite(yFull[i])) { ratio = Infinity; break; }
      const err = Math.abs(y2[i] - yFull[i]) / 15;
      const scale = tol * (1 + Math.abs(y2[i]));
      const r = err / scale;
      if (r > ratio) ratio = r;
    }
    if (ratio <= 1 || h <= hMin * (1 + 1e-12)) {
      let grow = ratio > 0 ? SAFETY * Math.pow(ratio, -EXP) : GROW_MAX;
      if (grow > GROW_MAX) grow = GROW_MAX;
      if (grow < SHRINK_MIN) grow = SHRINK_MIN;
      const hNext = Math.min(Math.max(h * grow, hMin), hMax);
      return { y: y2, hUsed: h, hNext };
    }
    let shrink = SAFETY * Math.pow(ratio, -EXP);
    if (!(shrink >= SHRINK_MIN)) shrink = SHRINK_MIN; // also catches ratio = Infinity
    h = Math.max(hMin, h * shrink);
  }
}

/**
 * Event-driven stepper: exact free advance between discrete events.
 *   makeEventStepper({ state, advance, events, maxEventsPerStep }) -> { step, state }
 *   - advance(state, dt): move state forward dt with no event in between.
 *   - events: [{ detect(state) -> time-to-event | null, resolve(state) }].
 *     detect returns the time until that event under the CURRENT state, or
 *     null when the event cannot occur; resolve mutates state at the event.
 *   - Ties go to the earliest-listed event (source: wall beats block–block).
 *   - maxEventsPerStep caps resolutions per step() call (Zeno guard, from the
 *     source's per-frame event cap); when the cap hits, the remaining interval
 *     is dropped for this call — state stays consistent at the last event.
 * step(dt) -> { events, spent }: number of events resolved and time advanced.
 */
export function makeEventStepper({ state = {}, advance, events = [], maxEventsPerStep = 10000 }) {
  function step(dt) {
    let remaining = dt;
    let count = 0;
    while (remaining > 0) {
      let tMin = Infinity, hit = null;
      for (const ev of events) {
        const te = ev.detect(state);
        if (te != null && Number.isFinite(te) && te >= 0 && te < tMin) {
          tMin = te; hit = ev;
        }
      }
      if (!hit || tMin >= remaining) {
        advance(state, remaining);
        return { events: count, spent: dt };
      }
      if (count >= maxEventsPerStep) {
        return { events: count, spent: dt - remaining };
      }
      advance(state, tMin);
      remaining -= tMin;
      hit.resolve(state);
      count++;
    }
    return { events: count, spent: dt };
  }
  return { step, state };
}
