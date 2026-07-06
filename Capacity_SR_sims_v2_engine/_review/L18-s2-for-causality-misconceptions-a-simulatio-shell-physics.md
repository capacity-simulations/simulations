# Physics review — L18-s2-for-causality-misconceptions-a-simulatio-shell.html
**Concept (syllabus):** determine the invariant separation of event pairs and predict the frame-dependence (or invariance) of their time ordering, before observing — causality misconceptions (L18.0 Faster than Light).
**Models correctly:** yes
**Unit convention:** c = 1 (natural units), stated in title, banner ("Minkowski diagram (c = 1)"), lightcone label, and symbol key.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor γ | `gamma` L758 `1/Math.sqrt(1-v*v)` | 1/√(1−β²) | ✓ |
| Lorentz boost | `boost` L759 `{t:g*(t-v*x), x:g*(x-v*t)}` | t′=γ(t−vx), x′=γ(x−vt) | ✓ (c=1) |
| Inverse boost | `invBoost` L760 `{t:g*(tp+v*xp), x:g*(xp+v*tp)}` | +β sign | ✓ (used for drag→rest-frame) |
| Invariant interval | `s2` L761 `e2t²−e2x²` | ds²=(cΔt)²−(Δx)² | ✓ (timelike>0 convention; computed from **un-boosted** coords) |
| Classification | `classification` L762 thresholds ±0.02 | s²>0 timelike, <0 spacelike, =0 lightlike | ✓ |
| Simultaneity boost | `vSim` L763 `e2t/e2x` | Δt′=γ(Δt−vΔx)=0 ⇒ v=Δt/Δx | ✓ (|v_sim|<1 ⇔ spacelike) |
| Order flip locus (hyperbola) | `drawHyperbola` L851-859 sweeps `boost(e2t,e2x,vv)` | invariant hyperbola of one event across frames | ✓ (s² held) |
| Formal KaTeX | `renderFormal` L1122-1127 | γ, boost, s², classification, Δt′, v_sim | ✓ all match code |

**Numeric spot-check (`node`):** spacelike preset Δt=1,Δx=2.5 → s²=−5.25; boost at v_sim=0.40 gives Δt′=0.0000; boost 0.60 gives Δt′=−0.625 (order reversed); timelike preset Δt=3,Δx=1 → s²=+8, boost 0.95 keeps Δt′=+6.57 (no flip); γ(0.6)=1.25; s² after boost 0.70 = −5.2500 (invariant preserved). All consistent.

## Numerical methods
- **No integrator needed** — the model is a pure algebraic coordinate transform, not an ODE. `onFrame` (L1147) only drives (a) a 0.5 s cosmetic preset-tween (`animProg`, ease-smoothstep) and (b) a `pulse` decay for the order-flip glow. Physics quantities are recomputed each `render()` directly from state; nothing accumulates or drifts.
- **dt** correctly consumed once: shell scales+clamps dt (L574 `if(dt>0.1)dt=0.1`, speed-scaled at L575) and the sim reads only that dt — no double-scaling, no wall-clock read inside the sim.
- **Guards:** boost slider hard-limited to ±0.95 (L521), so γ stays finite (no β→1 blow-up). `drawGhostSim` guards `|v_sim|≥0.999` (L862) and is only invoked for spacelike pairs (L961), where |v_sim|<1 is guaranteed — so the unphysical v_sim>1 of a timelike pair is never drawn. Drag clamps to ±4.8 (L1107).
- **Precision:** fine across the ±0.95 range; no √(negative) reachable.
- **Determinism:** `onReset` (L1157) restores e2t/e2x/v/pulse/animProg/lastSign, zeroes the slider, clears the prediction, and re-applies the mapped step. Reset is exact.

## Architecture & flow
- **State↔render separation:** clean. `S` (L747) is the single model (`e2t,e2x,v` + UI flags); `render()` (L991) calls `updateReadouts()` + `draw()`, both deriving everything from `S`. No physics state lives in draw calls.
- **Update path:** one source of truth. Controls (`boost` input L1131, presets, drag) mutate `S` then `render()`; `onFrame` only advances the cosmetic tween/pulse. No physics runs in a handler in a way Reset can't undo.
- **Frame transformation — representation note (the one thing to eyeball):** the sim uses the **orthogonal re-render** convention, not skewed axes. On a boost it keeps the axes rectangular, **relabels** them t→t′, x→x′ (`drawAxes` L846), redraws the banner "Frame S′ (moving at v)" (L901), and **plots E₂ at its Lorentz-transformed coordinates** `boost(e2t,e2x,v)` (L874). E₁ stays at the shared origin; the lightcone stays fixed at 45° (c invariant); s² is computed from the un-boosted coords so it holds constant. This is physically honest — E₂'s travel along the dashed hyperbola is exactly the locus of the *same* event's coordinates across frames, and it is labeled as a frame change, not motion. It is the *alternative* to the "fixed events + skewed t′/x′ axes" convention some SR courses use (e.g. the L10 Lorentz-rotation sims). Flagged below only for cross-sim consistency, not correctness.
- **Control coupling:** every control maps to a real parameter — boost slider→`S.v`, presets→(e2t,e2x), drag→inverse-boosted (e2t,e2x). All readouts (Δt/Δt′ label swap L975-976, Δx, s², classification, active-frame chip) recompute together; no stale numbers.
- **Reset:** complete (see Determinism).

## SR trap checklist
- **[pass] No auto-sweeping velocity:** `S.v` is a static slider; `onFrame` never touches it. No 0→1→0 ramp.
- **[pass] Function-plot-is-not-a-particle:** the moving dot is a genuine spacetime event; the hyperbola is its invariant coordinate locus, not a fabricated trajectory.
- **[pass] No proper-time clock on a photon:** no clocks/photon markers; lightlike case handled purely as s²=0 classification.
- **[pass] Infinitesimals are symbols:** s² and Δt/Δx are finite coordinate quantities, correctly numeric; no "ds=0.5" abuse.
- **[pass] Re-describing ≠ moving:** the boost relabels axes S→S′ and redraws (banner + t′/x′ + readout label swap). E₂'s reposition is the frame re-render of a fixed physical event, with s² invariant — honest, though see the representation note above.
- **[pass] Faithful evolution / stable axes:** fixed ±5 RANGE (L755), axes computed in `fit()` — no mid-run rescale; lightcone locked at 45°. No looping physics.
- **[pass] Causality:** lightcone structure is the explicit lesson; spacelike order-reversal is the point and is correctly gated on s²<0 (order only flips past |v|=|v_sim|, and v_sim<1 only for spacelike pairs).

## Concerns for manual verification (prioritized)
- **P2 · [med] · Representation convention (orthogonal re-render vs skewed axes).** `drawEvents` L874 / `drawAxes` L846 move E₂ to its transformed coordinates on rectangular relabeled axes. Physically correct and internally consistent, but if the course's other Minkowski sims (L05/L08 spacetime-diagram, L10 Lorentz rotation) show a boost as *skewed* t′/x′ axes over fixed events, a student may not connect the two pictures. Worth confirming the course deliberately mixes both representations. Not a correctness issue.
- **P2 · [high] · Classification dead-band ±0.02 (`classification` L762, `orderStr` L764).** A pair with 0<|s²|<0.02, or |Δt′|<0.02, is reported as lightlike / "Simultaneous." This is a sensible anti-jitter tolerance and matters only for hand-placed near-null drags; verify the band is tight enough not to mislabel a genuinely spacelike pair dragged very close to the cone. Cosmetic.
- **P2 · [high] · v_sim shown only for spacelike (L961).** Correct (v_sim≥1 is unphysical for timelike/lightlike), but the symbol-key entry defines v_sim=Δt/Δx unconditionally; a student reading the key on a timelike pair could compute v_sim=3 and wonder why no marker appears. Confirm the intended framing (the notes/eval do explain "would need v>c"). Not wrong.

**Overall:** the physics is correct and the numerics check out exactly. No P0/P1 physics concerns. The only judgement call for the human is the orthogonal-re-render representation choice, which is legitimate SR but a cross-sim consistency question.
