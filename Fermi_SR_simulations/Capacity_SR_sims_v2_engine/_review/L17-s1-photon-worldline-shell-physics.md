# Physics review — L17-s1-photon-worldline-shell.html
**Concept (syllabus):** Photon worldline on a Minkowski diagram — 45° null line, Δs²=0 ⇒ Δτ=0, contrasted with a massive particle whose Δτ shrinks toward 0 (but never reaches it) as β→1 (L17.0 Photon).
**Models correctly:** yes
**Unit convention:** c = 1, natural units; distances in light-seconds (ls), times in s, β = v/c. Stated in the readout header and Formal panel. **Interval sign: Δs² = −c²Δt² + Δx² (spacelike>0)** — matches this row's syllabus text verbatim (see note P2 below re: course-wide consistency).

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor γ | `gammaOf` L763 `1/√(1−b²)` | 1/√(1−β²) | ✓ |
| Massive coord time | `draw`/`updateReadout` L839/949 `Tend = DX/β` | Δt = Δx/v | ✓ |
| Invariant interval | L951 `ds2 = −(Tend²)+DX²` | Δs² = −c²Δt²+Δx² | ✓ (matches row spec exactly) |
| Proper time (massive) | L840/951 `dtau = Tend·√(1−β²)` | Δτ = Δt√(1−β²) = Δt/γ | ✓ |
| Photon worldline | L842 `xph=min(t,DX), ctph=xph` | Δx=cΔt (45°, null) | ✓ Δs²=0, Δτ=0 |
| Formal eq1–eq6 | `load` handler L1029-1034 | see below | ✓ all correct |

**Formal panel (KaTeX) — all verified:** eq1 `Δs²=−c²Δt²+Δx²`; eq2 `Δτ=√(−Δs²)/c=√(Δt²−Δx²/c²)`; eq3 `Δx=cΔt ⇒ Δs²=0 ⇒ Δτ=0`; eq4 `Δt=Δx/β, Δs²=−Δx²(1/β²−1)<0`; eq5 `Δτ=(Δx/β)√(1−β²)=Δx/(βγ)`; eq6 `β→1: Δτ→0⁺, slope=1/β→1 (45°)`. Internally consistent and dimensionally correct.

**Numeric spot-check (`node`, matches the live readouts):** β=0.5 → Δt=8, Δτ=6.93, Δs²=−48, γ=1.155, E₂′=(4,8); β=0.95 → Δτ=1.32, Δs²=−1.7, γ=3.20; β=0.995 → Δτ=0.40, γ=10.01. Photon: Δx=Δct=4 → Δs²=0, Δτ=0. Δτ monotonically → 0 as β→1 but never reaches it. ✓

## Numerical methods
- **No integrator** — all quantities are closed-form; `onFrame` (L1008) advances a single sweep parameter `p: 0→1` over `DUR` seconds, and positions are `t = p·Tend`, photon `(min(t,DX), min(t,DX))`, massive `(β·t, t)`. Pure parameterization of two straight worldlines by coordinate time. No drift possible.
- **dt:** shell-scaled/clamped dt consumed once (`p += dt/DUR`); no double-scaling, no wall-clock physics.
- **Guards:** β slider ∈ [0.05, 0.995] — **cannot reach 1**, so γ stays finite and √(1−β²) never hits 0 (this cap is also the structural encoding of the "catch a photon" misconception). Off-scale massive endpoint (β<0.4 ⇒ Tend>CTR=10) is detected (`mOff` L845-846) and drawn clamped with an arrow + "↑ off-scale (ct=…)" label — honest, no silent clipping.
- **Determinism:** `onReset` (L1015) restores β=0.5, p=0, finished, showCompare, slider, all choice/feedback/reveal state. Exact.

## Architecture & flow
- **State↔render separation:** module-local `beta, p, finished, showCompare`; `draw()` recomputes geometry each frame; `updateReadout()` writes the table from the same formulas. Clean.
- **Update path:** β slider / quick-buttons set `beta` → `updateReadout()`+`draw()`; `onFrame` only advances the sweep. Good.
- **Frame representation:** single frame S (no boost in this sim) — the photon stays at 45° by construction; the massive slope 1/β→1 as β→1 but never equals it. No fake motion; the animated markers trace genuine worldline positions in coordinate time.
- **Control coupling:** β, compare toggle, quick-speed buttons, friend-reveal all map to real state and re-render. No stale numbers.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity** — β is a static slider; the animation sweeps coordinate time `t`, not β. Pushing β→1 is a user action, not an automatic ramp.
- **[pass] Function-plot-is-not-a-particle** — the two markers trace real worldlines E₁→E₂ (photon) and E₁→E₂′ (massive), parameterized by coordinate time.
- **[pass — exemplary] No proper-time clock on a photon** — code comment L907 "a photon has NO proper time, so NO clock is shown on it"; only the massive marker carries a τ readout. Photon Δτ is a fixed 0. This is the central trap for this exact concept and it is handled correctly.
- **[pass] Infinitesimals are symbols** — Δs², Δτ are finite computed quantities; the null interval is exactly 0 on the 45° line.
- **[pass] Re-describing ≠ moving** — no frame change in this sim.
- **[pass] Faithful evolution / stable axes** — fixed axes (XR=5, CTR=10) computed in `draw`; sweep is one-pass (`finished` latch), no loop/reverse; off-scale handled.
- **[pass] Causality / light cone** — photon on the cone (45°); massive strictly inside (timelike, Δs²<0); the massive worldline approaches but never reaches the cone. Correct.

## Concerns for manual verification (prioritized)
- **P1 · [align, not a physics error] · The "Momentum" element and the "relate energy, momentum, and frequency of light" outcome are not modelled.** The sim is entirely worldline/Δs²/Δτ. There is no E=pc=hf, momentum, or frequency anywhere, yet the row lists element "Momentum" and that outcome, and the lecture checkpoint tests E=pc=hf. *Not a correctness problem* — the Sim description says nothing about momentum/energy, so the sim faithfully does what it's told. Flagged so the human can confirm those items are served by the lecture/other material rather than expected here.
- **P2 · [convention, candidate] · Interval sign vs the rest of the course.** This sim uses Δs²=−c²Δt²+Δx² (spacelike>0), which **matches its own syllabus row** — but L18-s2 uses s²=Δt²−Δx² (timelike>0), and the PHYSICS-RUBRIC names timelike>0 as "this course's convention." So the *syllabus itself* is not uniform across rows. Moot for the photon (Δs²=0 either way) but affects the sign a student sees for the massive (timelike) case across sims. Course-authoring consistency call for the human; this sim is not at fault.
- **P2 · [precision] · Off-scale massive endpoint at low β.** For β<0.4 (down to the 0.05 min) E₂′ is above the ct=10 window; handled honestly with a clamped arrow + numeric "ct=…" label, so the interval readout stays correct. Confirm the off-scale label is legible enough; no math issue.

**Overall:** physics is correct and the numerics match exactly; the proper-time-on-a-photon trap is handled exemplarily. No P0/P1 *physics* concerns. The only P1 is an alignment omission (momentum/energy/frequency), not a modelling error.
