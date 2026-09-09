# MODULE verify.audit  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.audit

## API
- defineAudit({probes, invariants, state, setParam}, target) -> audit
  // installs target.__audit = {version: 1, manifest, probes, invariants,
  //                            state, setParam, run()}  (target defaults to
  // window/globalThis; manifest parsed from the #engine-manifest block)
  // probes:     pure numeric fns, exposed as-is (e.g. at(beta), meanX())
  // invariants: each fn returns {ok, value, expected, tol};
  //             run() -> {pass, results: [{name, ok, value, expected, tol}]}
  // state:      optional live-state accessor object (or null)
  // setParam(id, v): defaults to setting the control's value and dispatching
  //             'input' — the SAME code path controls.bind listens on

## VOCABULARY
audit, probe, invariant, manifest, parameter sweep, pass/fail. (No physics
vocabulary — the surface reports named numbers against tolerances.)

## USAGE
    Engine.audit.defineAudit({
      probes: { meanX: () => computeMeanX() },
      invariants: {
        norm: () => { const n = computeNorm();
          return { ok: Math.abs(n - 1) < 1e-6, value: n, expected: 1, tol: 1e-6 }; },
      },
      state: sim,
    });
    // verify.mjs then drives: __audit.run(), __audit.setParam('amp', 2), ...

## NEGATIVE CONSTRAINTS — read before writing any code
- The __audit surface is the machine-verification contract: EVERY sim must
  call defineAudit (build.py refuses a manifest without verify.audit).
- Invariant fns must return the full {ok, value, expected, tol} record —
  never a bare boolean; verify.mjs reports all four fields.
- Probes and invariants must be pure reads: never mutate sim state, never
  advance time. Parameter changes go through setParam only.
- Never override setParam to write state directly while the control is a DOM
  input — bypassing the 'input' event skips the sanitize/clamp path the user
  exercises, and the sweep stops testing the real UI wiring.
