# Physics review — L10-s2-lorentz-transformation-vs-euclidean-rota-shell.html
**Concept (syllabus):** Lorentz boost as a *hyperbolic rotation*, contrasted with Euclidean rotation — two side-by-side panels: rotation preserves the circle x²+y²=1 (axes stay ⟂), boost preserves the hyperbola (ct)²−x²=1 (axes scissor toward the 45° cone) (L10.0 Lorentz transformations).
**Models correctly:** yes (internally consistent and correct)
**Unit convention:** c = 1. **Metric signature declared (+, −): ds² = (ct)² − x² (timelike-positive).** ⚠ This is the *opposite* of the course convention used elsewhere (see the P1 below).

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gamma` L894 `1/√(1−b²)` | γ=1/√(1−β²) | ✓ |
| Boost | `lorentzTX` L895 `{γ(t−βx), γ(x−βt)}`, t=ct | ct′=γ(ct−βx), x′=γ(x−βct) | ✓ |
| Rotation basis | `drawEuclid` L1032 `e1=[cosθ,sinθ], e2=[−sinθ,cosθ]` | rotation matrix | ✓ |
| Timelike hyperbola | `hyperbolaTimelike` L958 `(n sinh p, n cosh p)` | (ct)²−x²=n² | ✓ |
| Spacelike hyperbola | `hyperbolaSpacelike` L968 `(n cosh p, n sinh p)` | x²−(ct)²=n² | ✓ |
| Boosted axes | `drawLorentz` L1082 `ct′=[β,1], x′=[1,β]` | worldline x=βct, simultaneity ct=βx | ✓ |
| Scissor angle | `updateFoot` L1115 `90−2·atan(β)` | ∠(ct′,x′)=90°−2arctanβ→0° | ✓ |
| Formal (KaTeX) | L569-583 | rotation & boost matrices, rapidity, invariants | ✓ all canonical |

**Formal panel — all correct:** Euclidean matrix [[cosθ,sinθ],[−sinθ,cosθ]], x′²+y′²=x²+y²; boost matrix [[coshφ,−sinhφ],[−sinhφ,coshφ]], ct′=γ(ct−βx), tanhφ=β, γ=coshφ; (ct′)²−x′²=(ct)²−x²; ∠(ct′,x′)=90°−2arctanβ→0°, ∠(x′,y′)=90° always. Rapidity treatment is exactly right.

**Numeric spot-checks (`node`):** (ct)²−x²=1 preserved under boosts β=0.3/0.6/0.9 (all →1.000); scissor angle 56.6°/28.1°/6.0°; rotation preserves x²+y²=1 with ∠ fixed at 90°. All match the readouts.

## Numerical methods
- **Closed-form** — transforms and invariants are exact; `onFrame` (L1142) sweeps a probe parameter `u=1.3·sin(0.9t)` to ride a point along the circle (cos u, sin u) and the timelike hyperbola (sinh u, cosh u), demonstrating the invariant curve is the transformation's orbit. No drift.
- **Guards:** β slider bounded < 1 (γ finite); hyperbola drawn over p∈[−1.75,1.75] (bounded); no √(negative).
- **Determinism:** `onReset` (L1144) restores theta, beta, calib, probe, predictions, sliders. Exact.

## Architecture & flow
- **State↔render separation:** `state{theta,beta,calib,u,...}`; `drawEuclid`/`drawLorentz` derive both panels; `updateFoot` writes the invariant readouts. Clean, symmetric two-panel design.
- **Frame transformation (honest):** boosted axes are drawn as tilted lines (ct′ along [β,1], x′ along [1,β]) that scissor toward 45°; the invariant hyperbola/circle stay fixed while the primed axes move — the correct "relabel/re-render, don't move the invariant set" behavior. The calibration grid + unit-tick placement (where each primed axis meets its hyperbola) is geometrically correct.
- **Control coupling:** θ/β sliders, calibration toggle, and the prediction all recompute live. No stale numbers, no dead controls.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping β** — θ and β are static sliders; `onFrame` only animates a probe point on the invariant curve.
- **[pass] A function plot is not a particle** — the probe is a point on the invariant set (circle/hyperbola), illustrating the orbit; not a fabricated trajectory.
- **[pass] Re-describing ≠ moving** — boosting tilts the primed axes and re-reads coordinates; the invariant curve and events don't move. Invariant readouts identical before/after.
- **[pass] Faithful evolution / stable axes** — fixed view; light cone at 45°; both invariant hyperbolas drawn and preserved.
- **[pass — exemplary] Hyperbolic-rotation analogy** — the parallel (rotation↔circle↔90° vs boost↔hyperbola↔scissor) is exactly the lecture's point and is rendered correctly, including ∠(ct′,x′)→0° as β→1 without crossing the cone.

## Concerns for manual verification (prioritized)
- **P1 · [physics/consistency, high] · The declared metric signature contradicts the course convention and this sim's own checkpoint.** The formal panel (L584) states **"Signature (+, −): ds² = (c dt)² − dx²"** (timelike-positive), and the invariant readout shows (ct)²−x². But the **course convention — stated verbatim in the syllabus for L5, L8, L10-s1, L17, and in THIS sim's own checkpoint (line 417) — is Δs² = −c²Δt² + Δx²** (spacelike-positive). So within lecture 10.0 the *sim* uses (+,−) while its *checkpoint* and *sibling L10-s1* use (−,+): the two differ by an overall sign. *Not a physics error* — the sim is internally self-consistent and faithfully draws the (ct)²−x²=1 hyperbola its Sim description specifies, and (ct)²−x² is the *natural* positive-definite invariant for the circle↔hyperbola analogy. But a student moving between the sim and the checkpoint sees ds²=+(ct)²−x² vs Δs²=−c²Δt²+Δx². *Recommended (candidate) fix:* keep the (ct)²−x² visual (it's the cleaner analogy), but add one bridging line to the formal note — e.g. "In this course's convention Δs² = −c²Δt² + Δx² = −[(ct)²−x²]; the boost preserves it either way." — so the sim reconciles with the checkpoint rather than contradicting it. Human owns the course-wide convention call. (Note: `_review/PHYSICS-RUBRIC.md` currently asserts timelike>0 is "this course's convention," which matches this sim but *contradicts the syllabus* — worth correcting so it stops endorsing the minority convention.)

**Overall:** every transformation, both invariant curves, the rapidity/hyperbolic-rotation treatment, and the scissoring axis angle are correct and match the numerics exactly — this is a model rendering of the boost-as-hyperbolic-rotation concept. The single substantive issue is the (+,−) signature declaration clashing with the course's (−,+) convention (and this sim's own checkpoint); it is internally consistent and candidate-only for the human to reconcile.
