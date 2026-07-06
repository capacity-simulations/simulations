# Physics review — L14-s1-momentum-vs-velocity-shell.html
**Concept (syllabus):** Relativistic momentum p = γm₀v vs velocity — linear (≈m₀v) at low v, diverges as v→c because γ→∞; rest mass m₀ is the invariant scale factor; p is the spatial part of the four-momentum (L14.0 Mass).
**Models correctly:** yes
**Unit convention:** c = 1 (v passed as β = v/c); m₀ in arbitrary units; p in units of m₀c. Stated in the Formal intro and axis labels.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gamma` L759 `1/√(1−v²)` | γ=1/√(1−β²) | ✓ |
| Relativistic momentum | `pRel` L760 `γ·m·v` | p=γm₀v | ✓ |
| Classical momentum | `pClass` L761 `m·v` | p=m₀v | ✓ |
| Formal eq1–eq6 | `renderFormal` L1068-1074 | see below | ✓ all correct |

**Formal panel (KaTeX) — all verified:** eq1 `p=γm₀v`; eq2 `γ=1/√(1−v²/c²)=1/√(1−β²)`; eq3 `p_class=m₀v`; eq4 `γ(0)=1⇒p≈m₀v; γ→∞ (v→c)⇒p→∞`; eq5 **`pᵘ=(E/c, p⃗), p⃗=γm₀v⃗`** (four-momentum — directly serves the "construct the four-momentum" outcome); eq6 `E²=(pc)²+(m₀c²)²`. All canonical and consistent.

**Numeric spot-checks:** γ(0.6)=1.25 → p=0.750 m₀c (matches the default readout); at v=0.9c the relativistic/classical ratio = γ(0.9)=2.294× (matches the ratio call-out); v→c ⇒ p→∞ (curve exits top with a "p → ∞" arrow); doubling m₀ doubles every p (multiplicative factor). All correct.

## Numerical methods
- **Closed-form, no integrator** — the curve is `pRel(v,m₀)` sampled over v∈[0, VMAX]; static diagram (`onFrame` is a no-op, L1108). No time evolution, no drift.
- **Singularity guard:** `VMAX = 0.9995` caps sampling below v=1, so γ never hits ∞/NaN; the v-slider maxes at 0.999; the true divergence is shown honestly as a "p → ∞" arrow where the curve exits the fixed y-range, not a fake plateau.
- **Determinism:** `onReset` (L1096) restores m₀=1, vSel=0.6, ratio off, hover cleared, sliders, predictions. Exact.

## Architecture & flow
- **State↔render separation:** `state{m0,vSel,showRatio,hoverV,ymax}` is the model; `draw()` derives the whole plot from it; `updateReadouts()` writes the header. Clean.
- **Update path:** m₀/v sliders, ratio toggle, hover mutate `state` then `draw()`. No physics hidden in handlers.
- **Frame/param handling:** single frame; the m₀ slider is a parameter, not a second concept; γ depends only on v. The plot is absolute (γm₀v), so doubling m₀ visibly scales the curve — which is exactly what prediction q3 asks about.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity/β** — v and m₀ are static sliders; nothing ramps automatically (`onFrame` no-op). The x-axis IS velocity, explored by slider/hover — correct.
- **[pass] A function plot is not a particle** — this sim *is* a function plot (p vs v) and is presented as such; the "your point" marker and hover read-off are samples on the curve, not a moving particle.
- **[pass] No proper-time-on-a-photon** — massive particle; v<c enforced.
- **[pass] Infinitesimals are symbols** — momentum values finite; divergence marked "→ ∞".
- **[pass] Re-describing ≠ moving** — single frame, no relabel.
- **[pass] Faithful evolution / stable axes** — fixed axes (v 0–1, p 0–ymax); `J2` note confirms "curve plots γm₀v exactly … no hidden normalisation"; classical vs relativistic distinguished by solid/dashed + labels.
- **[pass — notable] "Relativistic mass" trap avoided** — the sim never calls γm₀ a "mass." Step 5 explicitly states rest mass m₀ is Lorentz-invariant and that "what runs away is γ, multiplying m₀v." This directly serves the lecture checkpoint (rest mass is a Lorentz scalar; γm is momentum/energy, not mass).

## Concerns for manual verification (prioritized)
- **P2 · [align, low] · "Inertial mass" (a listed Element / outcome) is only implicit.** The row lists element "Inertial Mass" and outcome "Understand the concept of inertial mass." The sim addresses it only indirectly — the momentum divergence and the q2 feedback ("no finite force can accelerate a massive particle to c") gesture at growing inertia, but "inertial mass" is never named or developed. The Sim description asks only for the p-vs-v plot with a rest-mass slider, which is fully delivered. Confirm inertial mass is covered in the lecture, or add a one-line note tying the p→∞ divergence to diverging inertia.
- **P2 · [ux/notation, low] · The unit label "units of m₀c" reuses the slider symbol m₀.** The y-axis and hover read-off label p in "m₀c", but m₀ is also the live slider (0.5–5). Because the plot is absolute (so doubling m₀ doubles p), the unit's "m₀" must denote a *fixed* reference mass (=1), not the current slider value — otherwise "1.15 m₀c" at m₀=2 is ambiguous. Consider labeling the unit as a fixed reference (or noting m₀=1 defines the unit) to avoid a double-counting reading when m₀≠1.

**Overall:** the physics is correct and cleanly presented, the four-momentum and rest-mass-invariance concepts are served, and the "relativistic mass" misconception is explicitly avoided. No P0/P1 physics concerns — the only notes are a lightly-served "inertial mass" element and a minor unit-label ambiguity.
