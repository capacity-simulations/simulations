# Projectile Motion with Air Drag — Testing the 45° Rule

**Lecture 16 · L16-Friction-in-3d.html**

**System:** Projectile with linear air drag (F = −k·v) vs. the vacuum idealization; a launch field with a drag arc + vacuum ghost, plus a Range-vs-angle curve marking the ★ optimum. Concept: "45° gives maximum range" is a vacuum-only theorem — with drag the optimum drops below 45° and the arc becomes asymmetric.

**Verdict:** Physics is correct and exact. The drag closed form, the numerically-solved flight time/range, the below-45° optimum, the asymmetric arc, and the k→0 ⇒ 45° limit all match the classical-mechanics canon and the sim's own documented anchors. No physics P0/P1. One NON-PHYSICS finding: the **filename ("Friction-in-3d") contradicts the actual content** (projectile + air drag). Sim is functional, no console errors.

**Browser-probe:** ran, **errors: []**, 14 states swept + 3 extra curve-panel states driven manually. Every audit readout tracks the physics correctly across all four sliders.

## PHYSICS

### P0
- none

### P1
- none

### P2
- [low] `__audit.at()` always returns `optimalDragAngleDeg` computed from the **drag** model (fn `window.__audit`, ~line 1274), even when the sim is in ✓/⚠ Vacuum mode. Harmless because the key is explicitly named "Drag," and the on-screen ★ optimum in `recompute` (line 893–896) correctly follows the *active* model. → **Fix:** optional — expose both `optimalVacuumAngleDeg` (=45) and `optimalDragAngleDeg`, or key the audit optimum to `P.mode`. Not a correctness bug.

### Physics verified (code + node + browser)
- **Linear-drag closed form (fn `dragFlight`, lines 772–790).** vₓ(t)=vₓ₀e^(−t/τ), x(t)=vₓ₀τ(1−e^(−t/τ)), v_y(t)=(v_y0+v_T)e^(−t/τ)−v_T, y(t)=(v_y0+v_T)τ(1−e^(−t/τ))−v_T·t with τ=m/k, v_T=mg/k. All signs/factors match the exact solution of m·a = −k·v − mg. ✓
- **Flight time by bisection on exact y(t) (lines 778–783)** with an expanding upper bracket (×1.5, guarded to 80 iters) then 80 bisection steps — stable, correct, no closed-form fudging. No integrator drift issue (analytic, not stepped).
- **k→0 limit exact (line 773):** `if(k<1e-9) return vacuumFlight(...)` — hands back the pure parabola; ghost is hidden (`ghostOn = P.k>1e-9`, line 882). Matches canon.
- **Anchors reproduced exactly** (node): vacuum v₀=20, θ=45° ⇒ R=40.77 m, T=2.88 s; drag k=0.3, m=1 ⇒ R=25.26 m, T=2.56 s, v_T=32.7 m/s; drag optimum = 39°; vacuum optimum = 45°.
- **Optimum below 45° and monotone in drag (node + audit):** k = 0.1/0.3/0.6/1.0 ⇒ θ\* = 42°/39°/34°/30° and R falls 34.2/25.8/18.9/13.9 m. Stronger drag lowers both the optimum and the range. ✓
- **k/m grouping:** flight depends on k and m only through k/m (τ=m/k, v_T=mg/k). Lighter m ⇒ optimum drops (m=0.1 ⇒ 20°); heavier m ⇒ optimum rises toward 45° (m=5 ⇒ 43°). ✓
- **Optimum search (lines 888–895)** scans integer degrees 5–85 and takes argmax — matches the documented `arg max over [5°,85°]` at 1° resolution.

## NON-PHYSICS

### P0
- none

### P1
- [functional][high] **Filename/content mismatch.** The file is `L16-Friction-in-3d.html` but the sim is *Projectile Motion with Air Drag* (`<title>` line 6; spec block lines 349–353; all UI). There is no friction / 3-D content anywhere. This will misroute the sim in any lecture index keyed on filename and confuses maintenance. → **Fix:** rename to e.g. `L16-Projectile-Air-Drag.html` (and update any manifest/link that references the old name).

### P2
- [pedagogy][low] Guided-inquiry step 1 asserts "descent is steeper than the ascent" — true, but the effect is subtle at the k=0.3 default (see `initial.png`). Consider defaulting to a slightly higher k or adding a "make it obvious" nudge, since the asymmetry is the whole point of the ground step. Purely presentational.
- [ux][low] The "Best so far" HUD persists its value across an env change only for θ sweeps (line 900 vs 901: env changes reset `best` to the current shot). Behaviour is intentional and reasonable, but a student rapidly nudging k then θ may see "best" jump; a one-line tooltip would remove the surprise.

## Browser-test evidence
- **initial / after-play** (`…__initial.png`): drag arc (orange, asymmetric, lands ≈25 m) vs symmetric vacuum ghost (cyan, ≈40.8 m); HUD "Range (with drag) 25.26 m". Matches audit. No overlaps, no NaN.
- **Range-vs-angle curve, default** (`L16__curve-default.png`): vacuum curve peaks at the dotted 45° line; drag curve peaks LEFT of it with ★ "best 39°" and "you: 45°" — drag optimum visibly below 45°. Labels do not collide.
- **k = 0** (`L16__curve-k0.png`): drag curve merges into the vacuum parabola, ★ snaps to "best 45°", ghost disappears, legend reads "with drag (k = 0 → vacuum)". Exact 45° restoration confirmed. audit: dragRange=vacuumRange=40.77, optDeg=45, v_T=null.
- **k = 1 (max)** (`…__sl-k-max-1.png` / `L16__curve-k1.png`): drag arc near-vertical descent, lands ≈12.5 m; audit optDeg=30, dragRange=12.51, v_T=9.81. Stronger drag ⇒ lower optimum and shorter range. ✓
- **θ = 85°** (`…__sl-theta-max-85.png`): near-vertical shot, drag apex below vacuum apex, R≈3.76 m; helpful "very short range" hint; no off-canvas.
- **θ = 5°** (`…__sl-theta-min-5.png`): flat grazing arc, R=6.61 m; no NaN, no clipping.
- **m = 0.1 kg** (`…__sl-m-min-0.1.png`): light ball, drag dominates (v_T=3.3), tiny asymmetric arc R≈4.7 m vs 40.8 m ghost; audit optDeg=20.
- **Slider sweep audit table** (probe JSON): dragRange < vacuumRange in every drag state; optDeg moves 45→39→35→30 as k rises, and toward 45 as m rises — all monotone and canon-correct.
- **Probe:** `errors: []` across all 14 states; 4 live sliders; no dead controls.

## To verify (human)
- Confirm the rename target and update any lecture manifest / navigation that indexes by `L16-Friction-in-3d.html`.
- Confirm the "⚠ Vacuum" mode is intended as the labelled counterfactual (it is labelled ⚠ and is itself physically the correct vacuum theorem, so it does not leak a wrong model — no action needed unless the course wants a different framing).
- Eyeball the guided-inquiry pacing on a real screen (steps 1–5) at the default k to confirm the ascent/descent asymmetry reads clearly enough for the "ground" step.
