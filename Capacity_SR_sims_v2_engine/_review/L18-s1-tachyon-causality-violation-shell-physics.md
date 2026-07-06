# Physics review — L18-s1-tachyon-causality-violation-shell.html
**Concept (syllabus):** Tachyon causality violation — place two events, connect with a superluminal signal + a return signal, boost frames, show a FTL round-trip can close a causal loop (L18.0 Faster than Light).
**Models correctly:** partial (boost/interval/order-reversal correct; the return-signal→causal-loop model is a single-frame heuristic that needs human scrutiny; interval sign convention is inverted vs the course).
**Unit convention:** c = 1, natural units, β ≡ v_boost/c; distances in light-seconds. Stated in Formal panel + labels.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor γ | `gammaOf` L779 `1/√(1−b²)` | 1/√(1−β²) | ✓ |
| Lorentz boost | `toFrame` L780 `{x:g*(x−b*ct), ct:g*(ct−b*x)}` | x′=γ(x−βct), ct′=γ(ct−βx) | ✓ |
| Inverse boost | `fromFrame` L781 (+β) | ✓ | ✓ |
| **Invariant interval** | `derive` L789 `ds2 = dxL²−dtL²` = **(Δx)²−(cΔt)²** | course convention is **(cΔt)²−(Δx)²** (timelike>0) | ⚠ **sign inverted** — see P1 below |
| Classification | L792 `ds2>0 spacelike, <0 timelike` | consistent with *this file's* sign, but opposite to L18-s2 | ⚠ consistency |
| Order flip | `eq-flip` L1081 `Δt′=γ(Δt−βΔx/c)`; flips when β>c²Δt/Δx | ✓ (matches L546 note) | ✓ |
| Outgoing signal speed | `derive` L791 `v1=|Δx′/Δt′|` in displayed frame | frame-dependent speed | ✓ (correctly recomputed per frame) |
| **Return arrival** | `derive` L793 `ct3 = E2.ct − |E2.x|/v2` | — (heuristic, see below) | ⚠ verify |
| Causal-loop test | L795 `loop = ct3 < E1.ct` | E1,E3 both on x=0 ⇒ frame-invariant order | ✓ *as a statement*, but boost-independent (see below) |

**Numeric spot-checks (`node`, all consistent with the code):** default E2=(2,1) ⇒ ds²=+3 (this file → "spacelike"; L18-s2 would render the same pair as s²=−3 "spacelike" under its inverted sign); outgoing v1=2c; interval invariant under boost (boosted ds²=3.0000); E1/E2 order flips at β=Δct/Δx=0.5. Return: ct3 = 1−2/v2, so loop (ct3<0) requires v2<2c; v2=1.2c→ct3=−0.67, v2=0.8c→ct3=−1.5 (**slower return ⇒ deeper past**).

## Numerical methods
- **No ODE integrator** — all quantities are closed-form algebra recomputed in `derive()` each `render()`. `onFrame` (L1086) only advances a cosmetic tracer `phase` (0→0.9) along the worldlines. Nothing accumulates/drifts.
- **dt:** shell-scaled/clamped dt consumed once (tracer only); no double-scale, no wall-clock physics. (A `performance.now()` at L861 drives pulse/flash animation only — cosmetic, not state.)
- **Guards:** boost slider ∈ [−0.99, 0.99] so γ finite; v2 ∈ [1.01c, 5c] (always superluminal — return is a tachyon by construction); `1e-6` epsilons guard the v1/v2disp `Δt→0` divides (returns Infinity, rendered "∞"); drag clamped to ±RANGE.
- **Determinism:** `onReset` (L1092) restores E1,E2,beta,v2,returnOn,step,prediction,phase and the slider DOM values. Exact.

## Architecture & flow
- **State↔render separation:** clean. `S` (L744) is the model; `derive()` (L785) is a pure function returning all displayed quantities; `render()` draws from it; `updateReadouts(D)` writes the strip. No physics stored in draw calls.
- **Update path:** controls mutate `S` then `render()`; `onFrame` only advances the cosmetic tracer. Good.
- **Frame transformation:** honest full re-render — every event, worldline, light cone and the observer worldline are pushed through `toFrame(...,b)` and axes relabel x→x′, ct→ct′ (L941-944); interval held invariant. This is the "relabel + recompute, don't fake-move" behavior the rubric wants. ✓
- **Control coupling:** boost→S.beta, v2→S.v2, return toggle→S.returnOn, drag→E1(constrained to x=0)/E2. All readouts recompute together. ✓
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity** — beta and v2 are static sliders; `onFrame` never touches them.
- **[pass] Function-plot-is-not-a-particle** — the white tracer runs along genuine signal worldlines (`drawTracer` L839), tied to real E1→E2→E3 geometry, not a fabricated curve.
- **[pass] No proper-time-on-a-photon** — no clocks; signals are spacelike worldlines, correctly drawn steeper-than-45° (v>c).
- **[pass] Infinitesimals are symbols** — Δs², Δt, Δx are finite coordinate quantities; light cone drawn at exactly 45°.
- **[pass] Re-describing ≠ moving** — boost relabels axes + recomputes; events don't translate within one frame.
- **[pass] Faithful evolution / stable axes** — fixed ±RANGE, axes computed in `fit()`, no rescale jump; tracer phase is bounded, not looping physics.
- **[⚠ verify] Causality** — the light-cone structure and spacelike order-reversal are correct and are the explicit point; but the *causal-loop* is produced by a single-frame return formula (below), not by transforming a forward-in-time return from a boosted emitter. Confirm the construction is faithful.

## Concerns for manual verification (prioritized)
- **P1 · [high] · Interval sign convention is inverted vs the course and vs the sibling sim.** `derive` L789 `ds2 = (Δx)²−(cΔt)²` with L792 `ds2>0 ⇒ spacelike`, and `eq-interval` L1080 prints `Δs²=(Δx)²−(cΔt)²`. The PHYSICS-RUBRIC names the course convention as `ds²=(cΔt)²−(Δx)²` (timelike>0), and **L18-s2 (same lecture 18.0) uses exactly that** (`s²=Δt²−Δx²`, spacelike<0). Internally self-consistent here, so not "wrong physics," but a student toggling between the two L18 sims sees "spacelike ⇒ Δs²>0" in s1 and "spacelike ⇒ s²<0" in s2. *Why it matters:* cross-sim sign flips are a classic source of confusion and the rubric asks for one sign rule everywhere. Human owns the convention call.
- **P1 · [med] · Return-arrival model `ct3 = ct2 − |x2|/v2` is a single-frame heuristic; verify it faithfully represents the tachyonic anti-telephone.** `derive` L793. Two things to scrutinize: (a) it hard-codes the return as travelling *backward* in coordinate time in S at speed v2, rather than deriving it from a return that is forward-in-time in a boosted emitter's frame; (b) it yields the counter-intuitive "**slower v2 ⇒ deeper into the past**" (v2=1.2c→ct3=−0.67 but v2=5c→ct3=+0.6). In the textbook two-observer anti-telephone the two legs usually share the same speed and the loop closes as the *relative boost* grows. *Why it matters:* the sim may teach the right conclusion (FTL reply → sender's past) via a relationship whose v2-dependence is unphysical. Confirm the intended pedagogy accepts this proxy.
- **P1 · [med] · The causal-loop verdict is independent of the boost slider, which fights the narrative.** `loop = ct3 < E1.ct` (L795) uses only rest-frame S quantities (E1, E2, v2) — no `beta`. Physically this is *correct* (E1 and E3 both sit on x=0, so their ordering is frame-invariant — design note L551 says so). But the guided arc and the predict-A feedback (L1028) say "any v>c **plus the right viewing frame**" closes the loop, implying the boost is causally necessary; in the model the ⚠ CAUSAL LOOP banner fires at v_boost=0 as soon as v2<|x2|/ct2. *Why it matters:* students may conclude the boost is irrelevant to the paradox. Consider clarifying that the boost demonstrates the order-reversal that *justifies* the backward return, while the loop's existence is the frame-invariant payoff. (Pedagogical framing, not a math error.)
- **P2 · [high] · v₂ label ambiguity.** The slider `v2` (L501, 1.01–5c) is the return speed *as set*, but the readout/canvas show `v2disp` — its value in the displayed frame — while Step 4 says "lower v₂." At nonzero boost the number the student reads (v2disp) differs from the slider they move. Confirm this is intended and not confusing.

**Overall:** transforms, γ, order-flip and the honest full re-render are all correct (P0-clean on the core SR machinery). The physics judgement calls for the human are the inverted interval sign (vs course + sibling) and whether the `ct3` return model is a faithful anti-telephone or a qualitative proxy. No P0 physics errors asserted.
