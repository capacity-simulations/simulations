# Physics review — L12-s1-twin-paradox-worldline-comparison-shell.html
**Concept (syllabus):** Twin paradox — two worldlines from E₁ to E₂ (A straight/inertial, B out-and-back with a turnaround Eₜ); the straight worldline carries the most proper time; a frame selector (S, B-out, B-return) shows the asymmetry lives in B's kink (L12.0 Twin paradox).
**Models correctly:** yes
**Unit convention:** c = 1; proper time τ = √(dt²−dx²) (timelike, always positive — convention-independent); distances in light-years, times/τ in years. **No interval Δs² is labelled, so the course sign-convention question does not arise here.**

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gammaOf` / `eqGamma` L1046 | γ=1/√(1−v²) | ✓ |
| Segment proper time | `segPT` L779 `√(max(0,dt²−dx²))` | Δτ=√(Δt²−Δx²) | ✓ (convention-independent) |
| Twin A proper time | `eqA`/readings `τ_A=T=10` | τ_A=T (straight, at rest) | ✓ |
| Twin B proper time | `renderReadings` L979 `10√(1−v²)` / `eqB` | τ_B=T√(1−v²)=T/γ | ✓ |
| Frame S′ (B out) | `tf` L775 `{γ(x−vt), γ(t−vx)}` | boost +v | ✓ |
| Frame S″ (B return) | `tf` L776 `{γ(x+vt), γ(t+vx)}` | boost −v | ✓ |
| B's speed in B's other frame | `w=2v/(1+v²)` L940/`eqW` | velocity addition of v⊕v | ✓ |
| Resolution | `eqD` `τ_straight ≥ τ_kinked` | Minkowski triangle inequality | ✓ |

**Event geometry (`events` L778):** E₁=(0,0), Eₜ=(vT/2, T/2), E₂=(0,T) — B goes out to x=vT/2 at speed v, returns to x=0 at −v; A stays at x=0. Correct.

**Numeric spot-checks (`node`, T=10):** v=0.6 → γ=1.25, τ_A=10, τ_B=8.00, Δτ=2.00, w=0.882c; v=0.95 → τ_B=3.12, Δτ=6.88, w=0.999c. Frame check: Eₜ in S′ = (x=0, t=4=T/2γ) — B's outbound leg is **vertical (at rest) in its own frame** ✓. All consistent with the code.

## Numerical methods
- **Closed-form** — proper times and transforms are exact algebra; `onFrame` (L1076) advances a single sweep parameter `p: 0→1` (the "now" line). `properAtNow` accumulates full-segment invariant proper times plus a linear partial on the current segment — correct because proper time is linear in coordinate time along a constant-velocity segment in *any* frame.
- **dt:** shell-scaled/clamped dt consumed once (`p += dt/sweepDur`); no double-scaling.
- **Guards:** v slider ∈ [0.10, 0.95] (γ finite); `Math.max(0, …)` under the proper-time √ guards round-off; frame transforms are exact.
- **Determinism:** `onReset` (L1078) restores v, frame, prediction, p, step. Exact.

## Architecture & flow
- **State↔render separation:** module state (`v, frame, p, prediction`, const `T=10`); `render()` derives worldlines/dots/readouts from `events()` + `tf()`. Clean.
- **Update path:** v slider, frame buttons, prediction mutate state then `render()`/`renderReadings()`/`renderFormal()`; `onFrame` only advances the now-line. No physics in handlers Reset can't undo.
- **Frame transformation (honest re-render):** switching frames Lorentz-transforms **every** event and redraws the worldlines — B's active leg becomes vertical, A tilts, the light cone stays 45°. Proper-time **totals are invariant** across frames (τ_A=10, τ_B tagged "(invariant)"), while the *intermediate* now-line counters are frame-dependent (correct — relativity of simultaneity). This is the exact pedagogy the topic needs.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity** — v is a static slider; `onFrame` animates the now-line, not v or the frame.
- **[pass] A function plot is not a particle** — the dots are the twins at the current now-line, tracing genuine worldlines.
- **[pass] Proper time handled correctly** — τ=√(dt²−dx²) per segment; the straight worldline carries the max (triangle inequality); B's kinked path is shorter. No proper-time-on-a-photon (all timelike).
- **[pass] Re-describing ≠ moving** — frame switch recomputes coordinates and redraws (worldlines change shape), not a relabel; totals invariant.
- **[pass] Faithful evolution / stable axes** — one-pass now-line with a latch; axes rescale only on v/frame change, never mid-sweep; light cone fixed at 45°.
- **[pass — exemplary] Acceleration not mis-attributed** — Step 4 states the turnaround *breaks the symmetry* but the age gap comes from *path length through spacetime*, directly serving the outcome "explain the role of acceleration without attributing it as the direct cause."
- **[pass] Causality** — all worldline speeds < c; velocity addition keeps w<c.

## Concerns for manual verification (prioritized)
- **P2 · [pedagogy, low] · Intermediate now-line counters are frame-dependent (by design).** During a sweep in S′/S″, the on-canvas τ_A/τ_B counters accumulate at frame-dependent rates and only agree with the invariant totals (and each other's "final" values) at E₂. This is physically correct and is arguably the deepest teaching point, but a student could momentarily read a partial counter as "the" proper time. The Readings panel always shows the invariant totals, which mitigates it. Confirm the two readouts (animated partial vs invariant total) aren't conflated.

**Overall:** every proper time, frame transform, and velocity-addition value is correct and matches the numerics exactly; the frame re-render is honest and totals are invariant; and the sim nails the subtle "acceleration breaks symmetry but path length is the cause" point. No P0/P1 physics concerns. Notably, L12-s1 never labels an interval Δs², so it is untouched by the course's spacelike-vs-timelike sign-convention split.
