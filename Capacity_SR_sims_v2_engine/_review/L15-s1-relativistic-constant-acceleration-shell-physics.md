# Physics review — L15-s1-relativistic-constant-acceleration-shell.html
**Concept (syllabus):** Relativistic constant force — a particle under constant F obeys F=dp/dt with p=γmv; velocity asymptotes to c (never exceeds it) while energy grows without bound. Plots build over time: v-vs-t (with v=c asymptote) and E-vs-t (L15.0 Relativistic dynamics).
**Models correctly:** yes
**Unit convention:** c = 1, m = 1 (natural units); a₀ = F/m in c/s; time in s (lab frame). Stated in the canvas footnote and force readout.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| Lorentz factor | `gammaFromBeta` L737 / eq2 L993 | γ=1/√(1−v²/c²) | ✓ |
| Newton's law (Lorentz-inv.) | Formal eq1 L992 `F=dp/dt, p=γmv` | F=dp/dt, p=γmv | ✓ |
| Velocity under const F | `vOfT` L738 `x/√(1+x²)`, x=a₀t | v/c=(Ft/mc)/√(1+(Ft/mc)²) | ✓ (hyperbolic motion) |
| Lorentz factor vs t | `gammaOfT` L739 `√(1+(a₀t)²)` | γ=√(1+(Ft/mc)²) | ✓ |
| Energy vs t | `eOfT` L740 `γ(t)` / eq4 L995 | E=γmc²=mc²√(1+(Ft/mc)²) | ✓ |
| Newtonian velocity | `vNewtonOfT` L741 `a₀t` / eq5 L996 | v=Ft/m (unbounded) | ✓ |
| Long-time limits | eq6 L997 | v→c, E→∞ | ✓ |

**Numeric spot-checks (`node`, a₀=0.5):** t=2s → v=0.7071c (exactly 1/√2 at a₀t=1), γ=E=1.414; t=10s → v=0.9806c, E=5.099; t=30s → v=0.9978c, E=15.03; Newtonian line exits v=1.2 at t=2.4s. All match the drawn curves. `v→c`, `E→∞` confirmed.

**Proper- vs coordinate-acceleration check:** the readout calls a₀=F/m the "proper, frame-invariant" acceleration. For 1D constant force, F=dp/dt=d(γmv)/dt=mγ³(dv/dt)=mα, so **α=F/m is the (constant) proper acceleration** and is the invariant magnitude of the four-acceleration — the label is correct. Confirmed numerically: coordinate acceleration dv/dt falls from 0.5 at t=0 to ≈0.0038 at t=10 (proper acceleration stays 0.5). So a₀ is the slope of the v-t curve only at t=0; the curve's bending IS the signature of constant proper / decreasing coordinate acceleration.

## Numerical methods
- **Exact closed-form** — no integrator; `vOfT`/`gammaOfT`/`eOfT` are analytic. `onFrame` (L1001) advances only the display time `S.t` (one-pass, freezes at Tmax); the curves are re-evaluated analytically each frame, so no drift/round-off accumulation.
- **dt:** shell-scaled/clamped dt consumed once (`S.t += dt*S.rate`); no double-scaling, no wall-clock physics.
- **Guards:** a₀ slider ∈ [0.2, 1.0] (finite, >0); √(1+x²) never negative → no NaN; energy axis fixed once per force (`recomputeAxis`, L742) so no per-frame rescale; unbounded E honestly truncated with an "E → ∞ (unbounded)" marker (L903) rather than a fake plateau.
- **Determinism:** `onReset` (L1018) restores a₀, t, layers, prediction, slider, axis. Changing the force resets t=0 and the axis. Exact.

## Architecture & flow
- **State↔render separation:** `S` holds a0/t/layers/prediction; `draw()` derives both plots analytically from it. No physics state in draw calls.
- **Update path:** force slider / layer toggles mutate `S` then redraw; `onFrame` only advances `S.t`. No auto-sweep of the physical parameter.
- **"Plots build over time" done honestly:** the animation parameterizes the curve from 0 to `S.t` — it is a graph being drawn against coordinate time, exactly as the Sim description asks ("plots of some quantities build up over time"); the leading dot is the current (t, v(t)) sample on the plot, not a particle moving in space.
- **Control coupling:** a₀ recomputes both curves and the energy axis; layer1/layer2 add the Δv-gap shading and the energy annotation; prediction A auto-enables the divergence highlight. No stale numbers.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity/β** — a₀ (∝F) is a static slider; the animation sweeps *time*, not the force/velocity parameter. Changing a₀ restarts cleanly.
- **[pass] A function plot is not a particle** — but here a *plot building over time* is exactly the deliverable; the moving marker is the current value on the v-t / E-t graph, correctly tied to t. No spatial-particle deception.
- **[pass] No proper-time-on-a-photon** — massive particle throughout; v<c always.
- **[pass] Infinitesimals are symbols** — F=dp/dt shown symbolically; quantities finite and correct.
- **[pass] Re-describing ≠ moving** — single lab frame; no frame relabel.
- **[pass] Faithful evolution / stable axes** — one-pass with a freeze latch; axes fixed per force; unbounded E marked "→ ∞", Newtonian line diverges and exits (honest), relativistic curve asymptotes to the dashed v=c line without crossing.
- **[pass] Causality / speed limit** — v→c asymptotically, never reaches or exceeds it; the limit *emerges* from F=dp/dt rather than being imposed.

## Concerns for manual verification (prioritized)
- **P1 · [align, not a physics error] · "Four-acceleration" and "Four-force" (2 of the 3 listed Elements) and the outcome "Define four-acceleration and four-force" are not explicitly modelled.** The sim delivers F=dp/dt with p=γmv (serving "Newton's 2nd law in Lorentz-invariant form" and "relate force to changes in four-momentum") but never introduces the four-vectors Aᵘ=duᵘ/dτ or Fᵘ=dpᵘ/dτ, nor the "geometric structure." *Not a correctness issue* — the binding Sim description asks only for the constant-force v-t and E-t plots, which are fully and correctly delivered. Flagged so the human can confirm the 4-vector formalism is served by the lecture/notes, or add a short Formal-panel line defining Fᵘ/Aᵘ.
- **P2 · [pedagogy, candidate] · a₀ "proper acceleration" vs the coordinate-time plot.** The label a₀=F/m "(proper, frame-invariant)" is correct, but the v-t curve is plotted against lab time, so a₀ equals the curve's slope only at t=0. A student could read a₀ as "the acceleration" of a curve whose (coordinate) slope is visibly decreasing. Consider a one-line note that the coordinate acceleration falls even though the proper acceleration (and force) is constant — that's *why* v bends toward c. Confirm the intended framing.

**Overall:** the dynamics are exact and correct, the numerics match, and the speed-limit-emerges-from-F=dp/dt story is handled cleanly and honestly. No P0/P1 *physics* errors; the one P1 is an alignment omission of the four-force / four-acceleration elements, which the Sim description itself does not request.
