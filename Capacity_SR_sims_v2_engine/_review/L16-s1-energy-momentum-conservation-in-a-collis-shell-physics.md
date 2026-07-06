# Physics review — L16-s1-energy-momentum-conservation-in-a-collis-shell.html
**Concept (syllabus):** Relativistic energy–momentum conservation in a two-body collision — four-momentum before/after, three modes (elastic / inelastic-merge / decay), total E & p conserved in every frame, invariant (system) mass, rest energy E₀=mc² (L16.0 E=mc²).
**Models correctly:** yes
**Unit convention:** c = 1, masses in multiples of m₀ (so E₀ = m numerically); β = v/c. Stated on the canvas ("Units: c = 1…") and Formal panel.

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| γ | `gammaOf` L814 `1/√(1−v²)` | 1/√(1−β²) | ✓ |
| Four-momentum | `computePhysics` L843-844 `E=γm, p=γmv` | E=γmc², p=γmv | ✓ |
| E–p relation | Formal `eq-rel` L1052 `E²=p²+m²` | E²=(pc)²+(mc²)² | ✓ |
| Lorentz boost of 4-mom | `boost` L815-821 `E′=γ_b(E−v_b p), p′=γ_b(p−v_b E)` | standard | ✓ |
| Invariant mass | L848/853/1024 `M=√((ΣE)²−(Σp)²)` | M²c⁴=(ΣE)²−(Σp c)² | ✓ |
| Inelastic merge | L847-851 `M=√(Etot²−Ptot²), V=Ptot/Etot` | invariant mass of system; carries Etot,Ptot | ✓ (conserves 4-mom exactly) |
| Elastic (1D) | L852-861 CM boost → reverse p → boost back | 1D elastic = momentum reversal in CM | ✓ |
| Two-body decay | L826-835 `EA=(M²+mA²−mB²)/2M, |p|=√(EA²−mA²)` | standard two-body decay | ✓ |

**Numeric spot-checks (`node`, all consistent with the sim):**
- Inelastic default (m=1 each, v=±0.8): γ=1.6667, ΣE=3.333, Σp=0 → **M=3.333 m₀ > 2 m₀** (answer B; the inquiry's point — KE→rest mass).
- Decay (M=3.33 → 1+1): EA=1.665, |p|=1.331, **v=0.800** (exact reverse of the merge).
- Elastic (m=1, ±0.8): product o1 has m=1.000 (rest mass preserved), **v=−0.80** (velocity exchange). ΣE, Σp conserved.
- Boost invariance (vb=0.5): ΣE′=3.849, Σp′=−1.925, but **M′=3.333** = M — invariant under boost. ✓

## Numerical methods
- **Closed-form, no integrator.** Every quantity is algebra recomputed in `computePhysics()`; `onFrame` (L1192) advances only a display parameter `progress: 0→2` (before→collision→after animation). No accumulation/drift.
- **dt:** shell-scaled/clamped dt consumed once (`progress += dt*RATE`); no double-scaling.
- **Guards:** γ uses v∈(−0.99,0.99) sliders; `Math.max(0, …)` under every √ prevents NaN from round-off (invariant mass, |p|); decay validity `mA+mB ≤ Mp` gated (L829) with an explicit "forbidden" warning and a failed-conservation flag when violated; composite/massless γ guarded (`m>1e-9 ? E/m : Infinity`, L820).
- **Determinism:** `onReset` (L1196) restores mode, masses, velocities, Mparent, boost, step, progress, prediction, and all slider/readout DOM. Exact.

## Architecture & flow
- **State↔render separation:** clean. `S` is the model; `computePhysics()` is a pure function returning `{before, after, valid}`; `render()`/`updateReadouts()` derive everything (canvas, four-momentum table, rest-energy panel, invariant panel, formal worked line) from it.
- **Update path:** sliders/mode/boost mutate `S` → `refresh()` (updateModeUI + updateReadouts + render); `onFrame` only animates `progress`. No physics in a handler Reset can't undo.
- **Frame transformation:** the boost slider applies `boost(part, vb)` to every before/after particle for display; conservation and invariant mass hold in S′ because 4-momentum conservation is Lorentz-covariant. Step 3 renders **dual canvases (S and S′)** to make invariance visible. Correct, honest re-render (recomputes E,p,v — not a relabel).
- **Control coupling:** mode switch applies presets and disables the v-sliders in decay / the Mparent slider in collisions (`updateModeUI`); the conservation badge (`ok` within 1e-6, L985) and the invariant panel recompute live.
- **Reset:** complete.

## SR trap checklist
- **[pass] No auto-sweeping velocity** — v₁,v₂,boost are static sliders; `onFrame` animates only the before→after `progress`, not any β.
- **[pass] Function-plot-is-not-a-particle** — the discs are the actual colliding particles; positions come from their real velocities.
- **[pass] No proper-time-on-a-photon** — N/A (massive particles); massless composite guarded.
- **[pass] Conservation uses 4-momentum, not classical p** — E=γm, p=γmv throughout; merge uses invariant mass, not Σm. This is the exact trap the rubric names for collisions, handled correctly.
- **[pass] Re-describing ≠ moving** — boost recomputes E,p,v and relabels the frame; it doesn't fake a translation.
- **[pass] Faithful evolution / stable axes** — one-pass progress with a latch; conservation badge honest; forbidden decays flagged rather than silently "conserved."
- **[pass] Causality/limits** — all speeds sub-c; composite V=Ptot/Etot<1; decay only when kinematically allowed.

## Concerns for manual verification (prioritized)
- **P1 · [ux/label, high] · Boost-frame velocity is rendered "v₂", colliding with particle 2's velocity.** `frameName` (L868) builds `'Frame S′  (v₂ = …)'` using `₂` (subscript 2), so the canvas header and the four-momentum frame label read **"v₂ = +0.50 c"** for a boost. But the slider is labelled `v_b` (L575) and the sim's own design note says the frame carries "(v_b = …)" (L439). In an energy–momentum sim where **v₂ is a defined physical input** (particle 2's velocity), reusing that exact glyph for the boost velocity is genuinely confusing. *Purely a label bug, not a physics error* — the transform itself uses the correct v_b. Fix: change `₂` → a "b" subscript in `frameName`.
- **P2 · [align, low] · Per-particle E₀=mc² is implicit rather than an explicit callout.** The Sim description asks for "a rest-energy panel [that] highlights E₀ = mc² for each particle in its rest frame." The "Rest energy & mass budget" panel shows Σ rest mass, ΣK, ΔM/Q — mass–energy equivalence — and a student can read each particle's E₀ by boosting to its rest frame (E→m, design note G4). So the concept is served, but there is no explicit per-particle "E₀ = m₁c²" label. Confirm this satisfies the intent or add a small per-particle E₀ line.

**Overall:** all three collision modes, the boost, invariant mass, and every formal equation are correct, and the numerics match exactly — the four-momentum-conservation trap is handled properly. No P0/P1 *physics* errors; the one P1 is a display-label collision (v₂ vs v_b).
