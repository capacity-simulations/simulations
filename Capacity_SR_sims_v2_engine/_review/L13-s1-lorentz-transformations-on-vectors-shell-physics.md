# Physics review — L13-s1-lorentz-transformations-on-vectors-shell.html
**Concept (syllabus):** Lorentz transformation of a four-vector — input V and a boost β, transform components, and see the Minkowski magnitude V·V stay invariant; four-velocity mode relates U to ordinary velocity via velocity addition (L13.0 Four-velocity Vector).
**Models correctly:** yes
**Unit convention:** c = 1; metric **η = diag(−1, +1)** (spacelike positive), V·V = −(V⁰)² + (V¹)². Stated in the Formal panel and Step 6.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gam` L816 `1/√(1−b²)` | γ=1/√(1−β²) | ✓ |
| Four-vector boost | `boost` L817 `[γ(V0−βV1), γ(V1−βV0)]` | V′⁰=γ(V⁰−βV¹), V′¹=γ(V¹−βV⁰) | ✓ |
| Minkowski magnitude | `mdot` L818 `−V0²+V1²` | V·V=η_μν V^μV^ν=−(V⁰)²+(V¹)² | ✓ |
| Four-velocity | `curV` L820 `U=(γ_u, γ_u·u)` | U^μ=γ_u(1,u) (c=1) | ✓ (U·U=−1) |
| Velocity addition | Step 4 / eqFour `u′=V′¹/V′⁰` | u′=(u−β)/(1−uβ) | ✓ |
| Formal eqBoost/eqComp/eqMetric/eqFour/eqAxes L1187-1191 | — | see below | ✓ all correct |

**Formal panel (KaTeX) — all verified:** boost matrix `[[γ,−γβ],[−γβ,γ]]`; component law `V′⁰=γ(V⁰−βV¹), V′¹=γ(V¹−βV⁰)`; metric `V·V=η_μν V^μV^ν=−(V⁰)²+(V¹)²`, η=diag(−1,+1); four-velocity `U^μ=γ_u(1,u), u′=(u−β)/(1−uβ)`; S′ axes `x=βt (t′-axis), t=βx (x′-axis)`. All canonical and mutually consistent.

**Numeric spot-checks (`node`):** V=(2,1), β=0.6 → V′=(1.750, −0.250); V·V=−3 in **both** frames (invariant ✓). Four-velocity u=0.5, β=0.6 → U=(1.1547, 0.5774), U·U=−1.0000, u′=U′¹/U′⁰=−0.1429 = (u−β)/(1−uβ) (velocity addition ✓). Null V=(1,1): V·V=0 preserved under boost ✓.

## Numerical methods
- **Closed-form** — boost/magnitude/velocity-addition are exact algebra recomputed in `render()`; `onFrame` (L1195) advances only a cosmetic `markerPhase` (a marker riding the worldline). No integrator, no drift.
- **dt:** shell-scaled/clamped dt consumed once (`markerPhase += dt*0.22`, capped at 1); no double-scaling.
- **Guards:** β slider bounded below 1 (γ finite); four-velocity drag clamps u∈[−0.95,0.95]; tip clamped to [−4,4]; no √(negative) reachable.
- **Determinism:** `onReset` (L1200) restores V0/V1/β/u, all layer toggles, markerPhase, predictions, the check inputs/result, and re-applies the inquiry step. Exact.

## Architecture & flow
- **State↔render separation:** `state` is the model; `curV()` returns the active four-vector (slider V, or the constructed four-velocity U); `render()` draws lightcone, S/S′ axes, the vector, decomposition, worldline, and markers from it; readouts/formal-numbers derive from the same. Clean.
- **Update path:** V/u/β sliders, drag, and layer toggles mutate `state` then `render()`; `onFrame` only animates the marker. No physics in handlers Reset can't undo.
- **Frame transformation — skewed-axis convention (correct):** the vector is a **fixed geometric object**; the S′ axes tilt (t′ slope 1/β, x′ slope β) and `drawDecomposition` projects V onto them obliquely. Verified the oblique feet close exactly: V′⁰·e_{t′} + V′¹·e_{x′} = V (tip). This is the standard Minkowski-diagram teaching convention and directly shows "components change, the vector/magnitude does not." (Note: this is the *opposite* representation to L18-s2's orthogonal re-render — both are valid.)
- **Control coupling:** four-velocity mode swaps the V sliders for a u slider and constrains V=U; the Check panel recomputes V′ live; magnitude/worldline/four-velocity layers are additive. No stale numbers.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity/β** — β and V are static sliders; `onFrame` animates only a worldline marker, not the boost.
- **[pass] A function plot is not a particle** — the arrow is a genuine four-vector; the riding marker traces the actual worldline; no fabricated motion.
- **[pass] No proper-time-on-a-photon** — null vectors handled as V·V=0; no photon clock.
- **[pass] Infinitesimals are symbols** — components/magnitude finite; light cone at 45°.
- **[pass — exemplary] Re-describing ≠ moving** — a boost tilts the S′ axes and re-reads components; the vector itself does not move. Magnitude readout marked "Lorentz invariant" with identical values in both frames. This is exactly the honest frame-change behavior.
- **[pass] Faithful evolution / stable axes** — fixed ±4 view; axes computed once; magnitude genuinely invariant (verified numerically for timelike/spacelike/null).
- **[pass] Causality / light cone** — cone drawn; timelike/spacelike/null classification correct via V·V sign.

## Concerns for manual verification (prioritized)
- **P2 · [align, low] · "Construct the four-velocity from a worldline" (U^μ=dx^μ/dτ) and the τ-vs-t point are only partially foregrounded.** The four-velocity mode builds U=γ_u(1,u) from *ordinary velocity* and the worldline layer shows the trajectory, but the sim never shows the proper-time differentiation U^μ=dx^μ/dτ or *why* τ (a Lorentz scalar) rather than coordinate time t — which is lecture checkpoint 2. The Sim description asks only for the four-vector transform + predict/check, which is fully delivered. Confirm the dx^μ/dτ construction is covered in the lecture, or add a short note.
- **P2 · [convention, candidate] · Signature (−,+) vs other sims.** This sim uses η=diag(−1,+1), V·V=−(V⁰)²+(V¹)² (spacelike>0), matching L17/L18-s1 and the checkpoint's four-vector framing — but L16/L18-s2 use the timelike-positive convention. Internally consistent and correct here; flagged only for the course-wide consistency decision.

**Overall:** every transformation, the Minkowski-magnitude invariance, the four-velocity construction, and velocity addition are correct and match the numerics exactly; the frame-change is handled with the honest skewed-axis convention and an invariant-magnitude readout. No P0/P1 physics concerns. The sim even implements the syllabus "additional notes" worldline-geometry feature.
