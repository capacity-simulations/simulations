# Projectile Motion
**Lecture 4 · L4-Projectile motion.html**

**System:** 2-D projectile with independent x/y motion under gravity — teaches x⊥y independence, R=v₀²sin2θ/g peaking at 45°, complementary-angle equal range, plus a *labelled* runnable ⚠ "coupled" counterfactual (a_y = −g·sinθ).
**Verdict:** Models the classical-mechanics canon correctly; exact closed-form kinematics, no integrator, all anchors reproduce. No physics P0/P1. Works cleanly in-browser.
**Browser-probe:** Ran — `errors:[]`, 8 states, 2 sliders; audit tracks θ/v₀ exactly (peak at 45°, monotone in v₀, θ→0/90° ⇒ R→0).

## PHYSICS
### P0
- none.
### P1
- none.
### P2
- [low] `rangeNaive(v0,th)=2v₀²cosθ/g` (L800) is the *coupled-model* range, tagged in comment as "limit form; exact for θ>0" — slightly confusing wording since it is the exact coupled-model range for all θ>0 (only θ=0 is the degenerate glide handled separately). Canonically R_coupled = v_x·T_coupled = v₀cosθ·(2v₀/g). → **Fix:** reword comment to "exact coupled-model range for θ>0; θ=0 glides." Cosmetic only. [med]
- [low] `read-R` badge stays "R — m" until a *real*-model landing completes; in ⚠ Coupled mode it never updates from a coupled landing (only `S.realRef` overlay shows a ✓ real number). This is intentional readout discipline (R = last ✓ landing) and matches the label "range (last ✓ landing)", so not a bug — flagged only so a reviewer doesn't mistake it for a dead readout. [high]

## NON-PHYSICS
### P0
- none.
### P1
- [functional][med] The **📈 Range vs angle** plot — the panel that most directly shows the 45° peak — ships **collapsed** by default (L507 `class="shell-panel collapsed"`), and inquiry step 4 tells students to "open 📈 Range vs angle." The plot code (`drawPlot`, L1194–1204) is correct (green R(θ) curve + ◇ marker at X(45),Y(v₀²/g)), but it is never auto-revealed at the step whose lesson it carries. → **Fix:** auto-expand that panel when reaching inquiry step 4, or leave it expanded by default. [med]
### P2
- [pedagogy][low] Step-4 card says "R ≈ 63.7 m" while Data/audit give 63.71 m and Info lists 63.71 — consistent rounding, harmless. [high]
- [ux][low] Speed selector is deliberately hidden (L1322) per readout discipline; the shell `Speed` label is also hidden. Fine, noted for completeness. [high]
- [ux][low] At v₀=50, θ=45 the arc reaches ~255 m and the view auto-grows to ~280 m (verified in `v0-max-50.png`); trajectory stays on-canvas. No off-canvas at any extreme. [high]

## Browser-test evidence
- initial (θ40, v₀25, playing) → clean rising parabola, amber v_x arrow horizontal at ball A, v₀ decomposition at launcher; audit range=62.74, T=3.28, H=13.16 — matches node anchors. (screenshot: `L4-Projectile motion__initial.png`)
- v₀ 5 → 27.5 → 50 (θ45 context) → audit range 2.51 → 75.9 → 251.0, monotone increasing; no NaN. (screenshots: `__v0-min-5.png`, `__v0-mid-27.5.png`, `__v0-max-50.png`)
- θ min 0 → launcher flat, R readout 0.00 m, audit range=0, T=0 (real model lands instantly). (screenshot: `__theta-min-0.png`)
- θ max 90 → launcher vertical, ball rises at x=0, R 0.00 m, audit range≈7.8e-15, T=5.10 s, H=31.9 m. (screenshot: `__theta-max-90.png`)
- θ mid 45 → audit range=63.71 = v₀²/g peak, launcher at 45°. (screenshot: `__theta-mid-45.png`)
- Console/JS errors: none across all 8 probe states.

## To verify (human)
- **Range-vs-angle plot visuals**: the panel is collapsed in every probe screenshot, so the ◇ 45°-peak marker, the slider-bound ● marker, and the ⚠-coupled off-scale-clip overlay were validated by code-read only (`drawPlot` L1164–1245), not by eye. Expand the panel and confirm the green curve peaks at 45° and the ● tracks the θ slider.
- **Twin race lockstep**: `makeBall('B')` uses `tofReal` identical to A-real (L864) so tie-line stays level — confirm on screen that the dashed tie-line reads "same height" green (not red Δy) through a full flight with Twin on.
- **Complementary-angle equal-range callout** (L1106–1114): confirm 30°+⧉60° render two arcs landing at the same x with the "equal range" chord.
- **⚠ Coupled mode**: confirm the thin ✓-real overlay arc + "✓ real: … m" flag appear alongside the coupled arc, and that θ=0 in coupled mode shows the "⚠ never falls → ∞" glide label (L1101–1103).
