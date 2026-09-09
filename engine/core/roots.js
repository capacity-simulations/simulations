// core.roots — scalar root finding on caller-supplied functions.
// Semantics-free: function, interval, bracket, root vocabulary only.
// Harvest sources (Sim_lab_sims/):
//   bisect      CM_sims/L7-Motion in a potential.html bisect() (~L884) —
//               fixed 64 halvings generalized to tol/maxIter + bracket
//               validation (the source assumed a valid bracket).
//   newton      CM_sims/L36-The Energy of the Orbit-new.html advance() (~L867)
//               Newton iteration pattern x -= f/f' — the equation the source
//               solves stays in its domain module; only the generic loop with
//               convergence/derivative guards lives here.
//   bracketScan QM_sims/Bound_states.html calculateBoundStates() (~L1214) —
//               its per-branch sign-change bracketing generalized to a uniform
//               n-interval scan of any function.

/**
 * Bisection on [a, b]. Requires f(a), f(b) finite with opposite signs
 * (an exact zero at either end is returned immediately); otherwise null.
 * Halves until the interval half-width <= tol or maxIter; returns the
 * midpoint. Never throws on a bad bracket — returns null.
 */
export function bisect(f, a, b, { tol = 1e-12, maxIter = 200 } = {}) {
  let fa = f(a);
  const fb = f(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if ((fa < 0) === (fb < 0)) return null;
  for (let i = 0; i < maxIter; i++) {
    const m = 0.5 * (a + b);
    const fm = f(m);
    if (!Number.isFinite(fm)) return null;
    if (fm === 0) return m;
    if ((fa < 0) === (fm < 0)) { a = m; fa = fm; } else { b = m; }
    if (0.5 * Math.abs(b - a) <= tol) return 0.5 * (a + b);
  }
  return 0.5 * (a + b);
}

/**
 * Newton iteration from x0. dfdx is the analytic derivative of f.
 * Converged when the update |dx| <= tol * (1 + |x|); returns null on a zero
 * or non-finite derivative, a non-finite iterate, or maxIter exhausted
 * without convergence.
 */
export function newton(f, dfdx, x0, { tol = 1e-12, maxIter = 50 } = {}) {
  let x = x0;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    const d = dfdx(x);
    if (!Number.isFinite(fx) || !Number.isFinite(d) || d === 0) return null;
    const dx = fx / d;
    x -= dx;
    if (!Number.isFinite(x)) return null;
    if (Math.abs(dx) <= tol * (1 + Math.abs(x))) return x;
  }
  return null;
}

/**
 * Scan [a, b] in n uniform intervals for sign changes of f.
 * Returns an array of brackets [lo, hi] with f(lo) and f(hi) of opposite
 * sign — each suitable for bisect. An exact zero AT a grid point is reported
 * as a degenerate bracket [x, x] (once). Intervals with a non-finite endpoint
 * value are skipped (source behaviour at tan-branch poles).
 */
export function bracketScan(f, a, b, n) {
  const out = [];
  let x0 = a;
  let f0 = f(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n;
    const f1 = f(x1);
    if (Number.isFinite(f0)) {
      if (f0 === 0) out.push([x0, x0]);
      else if (Number.isFinite(f1) && f1 !== 0 && (f0 < 0) !== (f1 < 0)) out.push([x0, x1]);
    }
    x0 = x1;
    f0 = f1;
  }
  if (Number.isFinite(f0) && f0 === 0) out.push([x0, x0]);
  return out;
}
