# Physics review — L11-s2-light-clock-and-geometric-derivation-of--shell.html
**Concept (syllabus):** Light clock + geometric derivation of time dilation — rest clock t₀=2h/c; moving clock's pulse traces a diagonal; Pythagoras on the light triangle (legs h and vt/2, hypotenuse ct/2) gives t=γt₀ (L11.0 Relative length and time).
**Models correctly:** yes
**Unit convention:** c = 1 (pixel-speed); γ=1/√(1−v²/c²); t in units of t₀. No interval Δs² is labelled (no sign-convention exposure).

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gammaOf` L749 `1/√(1−b²)` / `f3` | γ=1/√(1−v²/c²) ≥ 1 | ✓ |
| Rest round-trip | `drawRest` label `t₀=2h/c` | t₀=2h/c (proper time) | ✓ |
| Pythagoras | `f1`/`eq-pyth` L755 `(ct/2)²=h²+(vt/2)²` | light triangle, one half-trip | ✓ |
| Result | `f2`/`eq-res` L756 `t=(2h/c)/√(1−v²/c²)=γt₀` | t=γt₀ | ✓ |
| Side labels | `drawMove` L915-919 | h (vert), vt/2 (base), ct/2 (hyp) | ✓ (matches syllabus) |
| Live | `updateLive` L765 `v→γ→t=γt₀` | — | ✓ |

**Geometry realizes the physics exactly (`node` check).** Taking h=1: base = βγ, hypotenuse = the drawn diagonal = √((βγ)²+1). For every v this equals **γ** (since γ²=(βγ)²+1), and base=βγ=vt/2, hyp=γ=ct/2·(1/h)… i.e. (ct/2)²=h²+(vt/2)² holds identically → t=γt₀. Verified at v=0.3/0.6/0.9c: hyp=γ, base=βγ, and γ²=(βγ)²+1 all true.

**Second-postulate honesty (critical for this sim):** both pulses move at the **same pixel-speed c**. Rest pulse: h_px per T0/2. Moving pulse (`movePos` L808): covers a diagonal of length γ·h_px in a half-trip time of γ·T0/2 → speed 2h_px/T0, identical to the rest pulse. So the moving pulse genuinely travels at c along the longer diagonal, and *that* longer path (not a faster clock) is why it takes γ× longer. Exactly the intended lesson.

## Numerical methods
- **Closed-form / kinematic** — γ recomputed from v each frame; `onFrame` (L937) advances `tAnim`; pulse positions are analytic (`restY`/`movePos`). No integrator, no drift.
- **dt:** shell-scaled dt consumed once (`tAnim += dt`).
- **Guards:** v ∈ [0, 0.95] (γ finite); layout clamps `h_px` so a full round-trip never clips (`maxTravel/bg2`); `Math.max(8,…)` floors the height.
- **Determinism:** `onReset` (L938) restores tAnim, beta=0.6, stage=1, slider, predictions, rebuttal. Exact.

## Architecture & flow
- **State↔render separation:** `state{beta, tAnim, stage}`; `draw()` derives the rest panel, moving panel, triangle, and labels from `layout()`. Clean.
- **Update path:** v slider (live at every stage) and the inquiry stepper (`onStep` maps steps→stages 1/2/4/5) mutate state then `draw()`; `onFrame` only advances the animation clock.
- **Staged build (matches the Sim description):** stage 1 rest clock; stage ≥2 rest view fades to grey and is held (`drawRest` faded); stage 2 accumulates the diagonal one leg at a time; stage ≥3 completes the tent + right-triangle; stage ≥4 labels h / vt/2 / ct/2 + right-angle marker; stage 5 shows the Pythagoras overlay → t=γt₀. Every element the syllabus lists is present in the stated order.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity** — v is a static slider; `onFrame` animates the pulse bounce, not v.
- **[pass — exemplary] Light speed is c in both frames** — the moving pulse traverses the longer diagonal at the same pixel-speed as the rest pulse; time dilation emerges from path length, not a changed speed. This is the exact trap a light-clock sim must avoid, handled correctly.
- **[pass] A function plot is not a particle** — the pulse is a genuine light signal bouncing; the triangle is its real path.
- **[pass] No proper-time-on-a-photon confusion** — t₀ is the proper time of the *clock* (present at both events), explicitly stated in the rebuttal; the photon isn't given a clock.
- **[pass] Re-describing ≠ moving** — two panels (rest vs lab) shown side by side; the rest view is greyed and held for comparison, not morphed.
- **[pass] Faithful evolution / stable axes** — staged additive build; layout rescales only on v change; no mid-animation jump.
- **[pass] Reciprocity not mis-stated** — the rebuttal explicitly says neither frame is uniquely "moving" and no frame is privileged (first postulate), and defines proper time operationally (clock present at both events).

## Concerns for manual verification (prioritized)
- **P2 · [align, low] · Scope vs the lecture's broader element list.** The row lists elements "Length Contractions" and "Spacetime distance" and outcomes "Compute spacetime intervals" / "Distinguish invariant spacetime distance" / "Derive … from Lorentz transformations." This sim covers **only time dilation via the geometric (light-clock/Pythagoras) route** — which is exactly what its Sim description asks for. Length contraction, spacetime intervals, and the algebraic Lorentz-transformation derivation are not here (presumably L11-s1 / lecture). Confirm those are covered elsewhere.
- **P2 · [pedagogy, low] · Reciprocity shown only in text.** The symmetry misconception (each frame sees the other's clock slow) is addressed in the rebuttal prose, not demonstrated visually (that would need two light clocks). Acceptable for a lecture aid, but if the reciprocity point is central, a visual of the reciprocal case would strengthen it.

**Overall:** the geometric derivation is exact — the drawn triangle literally satisfies (ct/2)²=h²+(vt/2)² for every v, both light pulses move at c, and every formal equation is canonical. No P0/P1 physics concerns. The sim faithfully realizes the Sim description stage-for-stage and correctly frames proper time and reciprocity.
