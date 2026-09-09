# VERIFY CONTRACT (mandatory in every sim)

Call `Engine.audit.defineAudit({probes, invariants, state})` once, after the
sim state exists. It installs `window.__audit`, the surface the automated
verifier drives. Minimum: ONE probe and ONE invariant.

- **Probes** are pure, numeric, physics-meaningful reads: e.g.
  `norm: () => normSq(psi, grid.dx)`, `meanX: () => expectation(psi, grid,
  'x')`. Never mutate state, never advance time, never return DOM strings.
- **Invariants** each return the FULL record `{ok, value, expected, tol}` —
  never a bare boolean. Pick quantities the physics guarantees (norm = 1,
  energy constant, T + R = 1) with an honest tol. The verifier's initial
  `run()` is NOT at t = 0: the sim autoplays from page load, `__audit` may
  appear seconds later, and ~5 rAF settle frames precede run() (~10 per
  setParam sweep) — invariants must hold at ANY t.
- `setParam` defaults to setting the control's value and dispatching
  `'input'` — the same path `Engine.bind` listens on; the verifier sweeps
  every manifest param min/default/max through it and re-checks invariants.
  Don't override it to poke state directly.

**verify.guard** — add for ANY sim that steps a PDE or numerical integrator
(split-operator, RK4/Verlet loops): build a `makeGuard` with at least
`normDrift` or `invariantDrift('energy', ...)` plus `finite(...)`, call
`guard.check(t)` each frame and `guard.reset()` in onReset, and stop the loop
on halt (surface `report().reasons` verbatim). Don't hand-roll drift checks,
and never loosen thresholds without a source comment justifying the physics.
