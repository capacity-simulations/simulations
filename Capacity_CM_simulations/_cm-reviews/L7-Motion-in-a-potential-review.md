# Motion in a Potential
**Lecture 7 · L7-Motion in a potential.html**

**System:** 1-D motion in a cubic potential `V(x)=s(x³/3−x)`; energy height E vs barrier top V_b decides fate (bound / separatrix / escape), speed set by `E−V(x)`, not by slope.
**Verdict:** Physics is correct across the canon and at extremes — no physics P0/P1. Sim loads and runs cleanly. Two minor NON-PHYSICS UX polish items (chip/title overlap; wrapping E-readout label).
**Browser-probe:** ran — `errors: []`, 11 states, 3 sliders; all `__audit` values match analytic checks.

## PHYSICS
### P0
- none

### P1
- none

### P2
- [high] Separatrix realized as a velocity-pinned creep, not a true ODE integration. In `physics()` (L858-871) `|v|` is re-pinned to `√(2(E−V)/m)` every substep, so on the edge `E=V_b` the ball approaches x=−1 as an exact exponential creep — `dt→0` in that pinning is what makes `t→∞`. Canonically correct (near x=−1, `ξ̇=−√(2s/m)ξ`, `λ=√(2s/m)`, `t½=ln2/λ`; node-verified `t½=0.490 s` at s=1, matching the on-canvas 0.49 s and `updateEdgeHalf` L1201). No drift because energy is enforced, not integrated — but note this is a kinematic reconstruction, not a dynamical integrator. → **Fix:** none required; if desired, add a code comment that this is intentionally an energy-exact (non-symplectic-ODE) scheme so the separatrix log-divergence is exact. [evidence: node t½=0.490; screenshot ctl-E-max shows KE/edge readouts sane]

## NON-PHYSICS
### P0
- none

### P1
- none

### P2
- [ux][high] Regime chip overlaps the plot title. `chip(rg.t, geo.L+8, geo.T+8, …)` (L1104) draws "READY — press ▶" / "UNBOUND — E > V_b: escapes" at the top-left, colliding with the HTML `.plot-title` "ENERGY DIAGRAM V(x) — height, not slope, sets fate". Visible in every probe screenshot (e.g. `__initial.png`, `__ctl-E-max-1.5.png`). → **Fix:** move the regime chip down (e.g. `geo.T+34`) or right, or hide the plot-title inline text while a chip is shown.
- [ux][med] The "Total energy E" control label wraps to one character per line when the E readout string is long. At E-floor the readout becomes `E = -0.667 J (floor V_min)`, which widens the readout and squeezes the label column so "Total energy E" stacks vertically (visible in `__ctl-E-min--1.35.png`). → **Fix:** give the label a `min-width`/`white-space:nowrap`, or shorten the floor readout to `E = -0.667 J (floor)`.
- [functional][low] Probe reports 0 console errors and all three sliders (E, s, x₀) plus mode/fate/snap buttons are live and re-release on change (`paramChange`→`release`, L1209/1216-1224). No dead controls found.

## Browser-test evidence
- initial (E=0.30, s=1) → V(x) cubic with max at x=−1 (red), min at x=+1 (green), E-line at 0.30, two `v=0` turning-point markers, ball on curve at x≈1.8, speed-map peak at x=+1. `__audit.speedAtMin=1.390` = √(2(0.30+0.667)) ✓. (screenshot: `__initial.png`)
- E slider max = 1.5 (> V_b=0.667) → regime "UNBOUND — E > V_b: escapes", left turning point gone, only right `v=0`, KE bar drawn. `speedAtMin=2.082`=√(2(1.5+0.667)) ✓. (screenshot: `__ctl-E-max-1.5.png`)
- E slider min = −1.35 → Eeff floors to V_min: readout "E = -0.667 J (floor V_min)", `v=0.00 m/s`, ball at rest at x=+1, regime "AT REST — E = V_min". `speedAtMin≈1.5e-8` ✓ (rest). No NaN/blow-up. (screenshot: `__ctl-E-min--1.35.png`)
- s slider max = 2 → barrier V_b=1.333 (=⅔·2) ✓, deeper well, E=0.30 still BOUND with two turning points; v and a arrows point toward the min. `speedAtMin=1.807`=√(2(0.3+1.333)) ✓. (screenshot: `__ctl-s-max-2.png`)
- x₀ slider min = −0.95 → requested start is outside the allowed region (V(−0.95)>E), so `startPos()` snaps the release to the left turning point; ball starts on the curve and oscillates. Auto-snap working, no tunnelling. (screenshot: `__ctl-x0-min--0.95.png`)
- Naive counterfactual mode → dashed amber ball with ⚠ marker (L1069-1074), `v_naive=(τ/m)|V′|`; stalls at x=+1 (V′=0) where the real ball is fastest. Properly labelled ⚠ and visually subordinate; does not leak into the real model. (code L879-886, L1108)

## To verify (human)
- Watch a full separatrix run (⚖ Snap E = V_b): confirm the stopwatch keeps counting and the ball never reaches x=−1 (visual creep) over a long play — probe only samples static states.
- Confirm the one-pass escape animation for E > V_b visibly exits past x=XESC=−2.45 and the "escaping → x → −∞" annotation renders (probe caught the UNBOUND state but not the escaped end-state).
- Sanity-check the naive-mode speed-map / arrow rendering during live play (probe swept sliders in real mode; naive dynamics is time-dependent).
