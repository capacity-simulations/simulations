# The Pendulum
**Lecture 9 · L9-The pendulum.html**

**System:** Nonlinear pendulum "ghost race" — RK4 of θ̈ = −(g/L)sin θ (solid) vs the amplitude-blind textbook formula T₀ = 2π√(L/g) (dashed ghost), plus a T(θ₀)/T₀ elliptic curve.
**Verdict:** Physics is correct and canon-faithful — small-angle T=2π√(L/g), T∝√L, m-independent, large-amplitude period grows with θ₀ via the AGM/elliptic correction and diverges toward 180°. Works cleanly. No physics P0/P1.
**Browser-probe:** ran, 8 states, `errors: []`; readouts move correctly with both sliders; T(θ₀) curve and √L scaling verified visually and with `node`/`__audit`.

## PHYSICS

### P0
none.

### P1
none.

### P2
- [functional][high] Probe `audit.periodRatio` reads `1` in every state only because the probe harness calls `window.__audit.at(0)` (agmRatio(0)=1). The hook itself is correct: `at(θ)` with a real angle returns 1.0019/1.0732/1.1803/2.4394 at 10/60/90/170° (`at(x)`, line 1187–1192), matching the displayed numbers. Not a sim bug — noted so the constant `1` in the probe JSON isn't misread. **Fix (optional):** none required; if audit-sweep coverage is desired, have `at()` default a 0 argument to `state.theta0Deg` rather than treating 0 as a literal angle.
- [pedagogy][low] Small-angle "period independent of amplitude" is a deliberate, clearly-labelled ⚠ counterfactual (mode button ⚠, dashed amber ghost, prediction choice B with rebuttal, curve's "small-angle claim: flat at ×1" line). Correctly quarantined — not a bug; flagged only to confirm it does not leak into the ✓ Exact model. Verified it does not: the solid bob always integrates the true ODE (`rk4`, lines 805–813).

## NON-PHYSICS

### P0
none.

### P1
none.

### P2
- [ux][low] After play, near the bottom of the swing the two on-scene lap labels ("✓ lap 0" / "⚠ lap 0") crowd together when the exact and ghost bobs are close (small θ₀ or early in the run); still legible but tight (labels drawn at `exPos±16`, lines 910–913, [evidence: after-play.png, thetaSlider-min-5.png]). **Fix:** nudge vertical offset or hide the lap chips until laps ≥ 1.
- [ux][low] Period readout is truncated at the badge edge ("+7.3% vs T…", "×188% vs T…") in the probe viewport (`periodReadout`, line 1029). Cosmetic clipping of "T₀" [evidence: after-play.png, lenSlider-max-3.png]. **Fix:** allow the badge to wrap or widen its max-width.

## Browser-test evidence
- θ₀ sweep (fixed L=1): 5°→T=2.007s +0.0%; 90°→2.368s +18.0%; 175°→5.773s +188%. Period grows monotonically with amplitude; matches `node` AGM values exactly (initial/after-play/thetaSlider-*.png).
- θ₀=175° → exact bob hangs near the top moving slowly while the ghost has already swung to the bottom — correct divergence-toward-180° lag (thetaSlider-max-175.png).
- θ₀=5° → exact and ghost bobs coincide at the bottom, +0.0% — small-angle SHM limit recovered (thetaSlider-min-5.png).
- L sweep (fixed θ₀=60°): 0.25m→1.076s, 1.63m→2.765s, 3m→3.729s. T(3)/T(0.25)=3.465≈√12=3.464 → T∝√L; the +7.3% ratio is L-independent as required. Rod length scales honestly against the fixed 1 m scale bar (lenSlider-min/mid/max.png).
- T(θ₀) curve: flat ×1 at small θ₀, +7.3% at 60°, +18% at 90°, steep rise to "T→∞ at 180°", dashed ⚠ "flat at ×1" reference; slider marker bound at 60° (curve-open.png).
- `window.__audit.at(θ)` returns 1.0019/1.0732/1.1803/2.4394 at 10/60/90/170° — identical to the analytic AGM ratios and to the displayed T values.
- Console `errors: []` across all 8 probe states.

## To verify (human)
- Watch a long free run at θ₀≈170° for many periods to confirm RK4 energy stays bounded (no drift/blow-up) over minutes; the per-frame substepping `n=ceil(dt/0.002)` (line 821) should keep h≈2 ms, but only a sustained run confirms no slow amplitude creep.
- Confirm the on-scene lap counter increments correctly on the +θ₀ turning-point crossing (`po>0 && om<=0`, line 826) across a multi-lap run and that it stays in step with the badge lap count.
