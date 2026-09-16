# Review — L15-s1-relativistic-constant-acceleration-shell.html
**Verdict:** PASS (0 P0, 1 P1)
**Syllabus match:** Yes — a constant force on a slider (a₀=F/m), a velocity-vs-time plot with a dashed v=c asymptote, and an energy-vs-time plot, all building up over time under F=dp/dt with p=γmv, exactly as the Sim description requires. The inquiry's concept-cartoon is present verbatim ("My friend **Alex** says: 'a constant force means constant acceleration, so velocity keeps increasing forever…' Do you agree?"), encoded as gated prediction option (A) with the diverging dashed Newtonian curve. Correct answer B (approaches c, never exceeds).

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, slider fires, 6 steps advance, gate unlocks via `.choice`, full top bar). Physics verified exact: `v(t)=a₀t/√(1+(a₀t)²)`, `γ=E=√(1+(a₀t)²)`, Newtonian `a₀t` — v→c asymptotically (0.9978c at t=30), E→∞, all numerics matching the drawn curves. a₀=F/m is correctly the constant *proper* acceleration.

### P1
- **[align] "Four-acceleration" and "Four-force" (2 of the 3 listed Elements) and the outcome "Define four-acceleration and four-force" are not modelled.** The row lists elements **"Four-acceleration"** (L554) and **"Four-Force"** (L555) and the outcome **"Define four-acceleration and four-force"** (L550), plus "Understand the geometric structure of relativistic dynamics" (L553). The sim serves F=dp/dt / p=γmv strongly (covering "Newton's 2nd law in Lorentz-invariant form" and "relate force to changes in four-momentum"), but never introduces the four-vectors Fᵘ=dpᵘ/dτ or Aᵘ=duᵘ/dτ or the geometric structure. *Caveat:* the binding **Sim description** (L557) asks only for the constant-force v-t and E-t plots, which are fully delivered — so this is a row-vs-description scope gap, not a defect. → **Fix (confirm intent first):** verify whether four-force / four-acceleration are meant to be taught here or in the lecture. If wanted here, add a short ∑ Formal line defining `Fᵘ = dpᵘ/dτ` and `Aᵘ = duᵘ/dτ` (with the note that F=dp/dt is its spatial part) — Formal-panel text only, no change to the plots.

### P2
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[pedagogy] a₀ "proper acceleration" vs the coordinate-time plot (candidate).** The readout labels a₀=F/m "(proper, frame-invariant)" — correct — but the v-t curve is plotted against lab time, so a₀ equals the curve's slope only at t=0 (the coordinate acceleration visibly decreases). A student could conflate the two. → **Fix (optional):** add a one-line note that the *coordinate* acceleration falls while the proper acceleration (and force) stays constant — that's why v bends toward c. Text only.

## Suggested fixes for Cursor (paste-ready)
1. **(Alignment — confirm intent before applying.)** In `shell-versions/L15-s1-relativistic-constant-acceleration-shell.html`, if the four-force / four-acceleration outcome should be served here, add one non-interactive line to the ∑ Formal panel defining the four-force `Fᵘ = dpᵘ/dτ` and four-acceleration `Aᵘ = duᵘ/dτ`, noting that the sim's `F = dp/dt` is the spatial part. Formal-panel text only — do not alter `vOfT`, `eOfT`, or the plots. If covered elsewhere, leave unchanged.
2. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
3. *(Optional, pedagogy)* Add a short caption near the force readout or velocity plot stating that the coordinate acceleration decreases even though the proper acceleration a₀ = F/m (and the force) is constant — clarifying why the v-t slope flattens toward c. Text only; no physics change.

## Physics to verify (human)
- **Scope of the row vs the sim [align].** Confirm whether "Four-acceleration" / "Four-Force" / "Define four-acceleration and four-force" / "geometric structure" are intended for this sim or the surrounding lecture. The sim's own description asks only for the constant-force v-t and E-t plots.
- **a₀ proper-acceleration framing [pedagogy].** The "proper, frame-invariant" label is correct (α=F/m=constant for 1D constant force); just confirm the coordinate-vs-proper distinction is clear enough given the plot is against lab time.
- Core physics checks out exactly: `v(t)=a₀t/√(1+(a₀t)²)`, `E=γmc²=√(1+(a₀t)²)`, the v→c asymptote and E→∞ limit, and all six Formal equations match canonical forms (see `L15-s1-...-physics.md`). The speed limit correctly *emerges* from F=dp/dt.
