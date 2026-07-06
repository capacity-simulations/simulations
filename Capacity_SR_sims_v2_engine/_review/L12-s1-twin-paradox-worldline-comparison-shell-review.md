# Review — L12-s1-twin-paradox-worldline-comparison-shell.html
**Verdict:** PASS (0 P0, 0 P1)
**Syllabus match:** Yes, fully — a Minkowski diagram with two worldlines from a common E₁ to E₂: Twin A straight/vertical (inertial), Twin B two-segment (out at v, return at −v) meeting at a turnaround Eₜ; proper time computed and displayed for each; and a frame selector for S (A's rest), S′ (B outbound), S″ (B return). That is the Sim description line-for-line. The inquiry arc (predict who's older → compare across frames → find the asymmetry) matches the syllabus's three steps, and the lecture's symmetry misconception is targeted both as prediction option C and in the Step-3 "friend" exercise.

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, slider fires, 4 steps advance, gate unlocks via `.choice`, full top bar). Physics verified exactly: τ_A=T=10 yr, τ_B=T√(1−v²)=8.00 yr at v=0.6 (Δτ=2.00), B's outbound leg becomes vertical in S′ (x=0, t=T/2γ), and B's other-frame speed w=2v/(1+v²) is correct velocity addition. Totals invariant across all three frames.

### P1
- _None._

### P2
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[pedagogy] Animated intermediate proper-time counters are frame-dependent (by design).** During a sweep in S′/S″ the on-canvas τ_A/τ_B counters accumulate at frame-dependent rates and only match the invariant totals at E₂ — physically correct (relativity of simultaneity) and arguably the deepest teaching point, but a student could momentarily read a partial counter as the final proper time. The Readings panel always shows the invariant totals, which mitigates it. → **Fix (optional):** none required; optionally tag the on-canvas counters "so far" / "accumulating" to distinguish them from the invariant totals in the Readings panel. Label only.

## Suggested fixes for Cursor (paste-ready)
1. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
2. *(Optional, clarity)* On the canvas τ_A/τ_B counters that update during the now-line sweep, append a small "(so far)" qualifier so they read as accumulating-to-date rather than the invariant totals shown in the Readings panel. Label only — no physics/logic change.

## Physics to verify (human)
- **Intermediate frame-dependent counters [pedagogy].** Confirm the animated on-canvas τ counters (which are frame-dependent mid-sweep, converging to invariant totals at E₂) don't get conflated with the invariant totals in the Readings panel.
- No physics-correctness concerns: proper times (τ_A=T, τ_B=T√(1−v²)), the three-frame Lorentz transforms, velocity addition (w=2v/(1+v²)), and the triangle-inequality resolution all match canonical forms and the numeric spot-checks were exact (see `L12-s1-...-physics.md`). The sim also correctly frames acceleration as *breaking the symmetry* without making it the *direct cause* of the age gap. It never labels an interval Δs², so it is unaffected by the course-wide sign-convention question.
