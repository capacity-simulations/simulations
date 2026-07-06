# Review — L13-s1-lorentz-transformations-on-vectors-shell.html
**Verdict:** PASS (0 P0, 0 P1)
**Syllabus match:** Yes, and it exceeds the base description — students set a four-vector V (V⁰/V¹ sliders or drag) and a Lorentz transformation (β), predict V′ in the "Check your calculation" panel, and Check against the computed boost (with the full worked multiplication shown on a miss). That is exactly the Sim description ("input a four-vector and Lorentz transformation, predict the output vector, and check against their prediction"). It also implements the syllabus **Additional-notes suggestion** (a "Worldline context" layer where the displacement E₂−E₁ is the four-vector), plus a four-velocity mode with velocity addition.

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, all 4 sliders fire, 6 steps advance, gate unlocks via `.choice`, full top bar). Physics verified exactly: V·V=−3 invariant under boost; four-velocity U·U=−1; u′ = velocity addition (−0.1429); null vector V·V=0 preserved. All five Formal equations canonical.

### P1
- _None._

### P2
- **[align] "Construct four-velocity from a worldline" (Uᵘ=dxᵘ/dτ) and the τ-vs-t point are only partially foregrounded.** The row's outcome "Construct the four-velocity from a particle's worldline" (L502) and lecture checkpoint 2 (why differentiate w.r.t. proper time τ, a Lorentz scalar, not coordinate time t) are not explicit: the four-velocity mode builds U=γ_u(1,u) from ordinary velocity and shows the worldline, but never shows the dxᵘ/dτ differentiation or the τ-vs-t reasoning. The Sim description asks only for the four-vector transform + predict/check, which is fully delivered. → **Fix (confirm intent):** verify the dxᵘ/dτ construction is taught in the lecture, or add a one-line Formal/notes statement `Uᵘ = dxᵘ/dτ` with a clause on why τ (invariant) is the right parameter. Text only.
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[physics/consistency] Metric signature differs from L16/L18-s2 (candidate).** This sim uses η=diag(−1,+1), V·V=−(V⁰)²+(V¹)² (spacelike>0), matching L17/L18-s1 and the checkpoint's four-vector framing — but L16/L18-s2 use timelike-positive. Internally consistent and correct here. → **Fix:** none in this sim (faithful to its lecture); flagged for a course-wide convention decision.

## Suggested fixes for Cursor (paste-ready)
1. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
2. **(Alignment — confirm intent.)** If the four-velocity-from-worldline construction should be explicit here, add one line to the ∑ Formal "Four-velocity" tile stating `Uᵘ = dxᵘ/dτ` and noting τ is a Lorentz scalar (so dxᵘ/dτ transforms as a four-vector, unlike dxᵘ/dt). Formal-panel text only — do not change `boost`, `curV`, or the plot.

## Physics to verify (human)
- **Four-velocity-from-worldline scope [align].** Confirm whether Uᵘ=dxᵘ/dτ and the τ-vs-t distinction are meant to be explicit in this sim or the lecture; the sim currently constructs U from ordinary velocity u and shows the worldline, without the proper-time differentiation.
- **Metric signature [consistency].** This sim's (−,+) convention matches its lecture/checkpoint but differs from L16/L18-s2's timelike-positive convention. Decide the course-wide standard; no change needed within L13-s1.
- No physics-correctness concerns: the boost, Minkowski-magnitude invariance (timelike/spacelike/null), four-velocity U·U=−1, velocity addition, and the skewed-S′-axis decomposition all match canonical forms and the numeric spot-checks were exact (see `L13-s1-...-physics.md`).
