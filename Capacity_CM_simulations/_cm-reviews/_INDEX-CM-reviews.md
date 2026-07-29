# Classical-Mechanics sims — review index

Batch review of all 10 CM sims via the `review-CM-sims` skill: expert CM-canon code review + real-browser probe (system Chrome / puppeteer) with screenshots and a slider sweep validating physics across parameter values. Read-only; fixes go to Cursor. Per-sim reports are the `*-review.md` files in this folder. Probe artifacts + screenshots in `/tmp/cm-review/<key>/`.

**Headline:** No P0 anywhere. **No physics P0/P1 in any sim** — the physics is correct and canon-faithful across all 10, verified numerically and on-screen at slider extremes. All console-error checks clean (`errors: []`). Remaining items are non-physics: 4 P1s (one real dead-code/label issue each) + cosmetic P2 polish.

## Triage table

| Lecture · Sim | Verdict | Phys P0/P1 | Non-phys P0/P1 | Probe | Top item |
|---|---|---|---|---|---|
| **L2** · Newton's Three Laws | ✅ correct | 0 / 0 | 0 / 0 | clean, 14+2 states | — (Σp=0, a=F/m, counterfactuals labelled) |
| **L4** · Forces on Objects Explorer | ✅ correct | 0 / 0 | 0 / **1** | clean, 16 states | P1: force-arrow/component **label crowding** at steep θ / canvas corner (values fine) |
| **L4** · Projectile Motion | ✅ correct | 0 / 0 | 0 / **1** | clean, 8 states | P1: 📈 Range-vs-angle panel (45° lesson) ships **collapsed**, not auto-revealed at step 4 |
| **L6** · The Harmonic Oscillator | ✅ correct | 0 / 0 | 0 / 0 | clean, 14+1 states | — (T=2π√(m/k), amplitude-independent) |
| **L7** · Motion in a Potential | ✅ correct | 0 / 0 | 0 / 0 | clean, 11 states | P2: regime chip **overlaps plot title**; E-label wraps |
| **L9** · The Pendulum | ✅ correct | 0 / 0 | 0 / 0 | clean, 8 states | — (RK4 nonlinear ODE + AGM period; large-angle growth correct) |
| **L16** · *Projectile w/ Air Drag* | ✅ correct | 0 / 0 | 0 / **1** | clean, 14+3 states | P1: **filename/content mismatch** — file says "Friction-in-3d", sim is drag-projectile |
| **L17** · The Damped Harmonic Oscillator | ✅ correct | 0 / 0 | 0 / **1** | clean, 5+2 states | P1: **dead code** `updateInquirySteps()` (no-op, stale DOM ids) |
| **L29** · The Centrifugal Force | ✅ correct | 0 / 0 | 0 / 0 | clean, 8 states | — (F=mω²r fictitious; ground-frame tangent straight) |
| **L30** · The Coriolis Force | ✅ correct | 0 / 0 | 0 / 0 | clean, 16 states | — (F=−2mΩ×v; sign flips with Ω; lab path straight) |

## Non-physics P1s (the only actionable defects)
- **L4 Forces explorer** — at steep incline angles / when the body sits in a canvas corner, the multiple force arrows and their component labels overlap despite the down-only collision-avoidance. Readability only; numeric values stay correct. → improve label placement / add sideways avoidance.
- **L4 Projectile motion** — the **📈 Range vs angle** panel that carries the 45°-peak lesson (referenced by inquiry step 4) is collapsed on load and not auto-expanded at that step. → auto-expand on step 4.
- **L16** — the file is named `L16-Friction-in-3d.html` but contains *"Projectile Motion with Air Drag — Testing the 45° Rule"*; there is no friction/3-D content. → rename the file or confirm the correct L16 sim.
- **L17** — `updateInquirySteps()` is confirmed dead (references non-existent `inq-step1..4` ids; guard skips every iteration; all 4 call sites are no-ops). → remove it.

## Cross-cutting cosmetic P2 (label/overlap polish)
Several sims crowd/overlap labels at parameter extremes (L4-Forces corner labels, L7 regime chip over title, L9 lap-label crowding + readout truncation at badge edge, L6 amplitude slider max just past axis label). None affect physics or values — batch these as a visual-polish pass.

## Fixes applied (implementation pass)
All chrome/content/CSS only — physics untouched; every modified file re-parsed clean (`node --check`) and the two with canvas-draw changes re-probed with **0 JS errors**.
- **L4 Forces explorer** — P1 label overlap fixed: `label()` now uses multi-direction placement (down/up/sideways-away-from-arrow, clamped in-canvas) so force/component labels no longer stack; +2 P2 (prose F₃=2.24 N to match canvas; `mg·cosθ` label nudged off the floor hatch). Re-probed, 0 errors, verified on screen.
- **L4 Projectile motion** — P1 fixed: `📈 Range vs angle` panel now auto-expands at the 45°-peak inquiry step (`onStep` toggles `.collapsed`, redraws); +1 P2 comment. Verified statically (panel opens at that step only).
- **L6 Harmonic oscillator** — P2 fixed: position-axis ticks/label extended to ±0.7 m to cover the amplitude slider's reach (cosmetic; slider range & physics unchanged).
- **L7 Motion in a potential** — P2 fixed: regime chip moved below the plot title (no more overlap, verified on screen); "Total energy E" label CSS set to `nowrap` so it no longer wraps per-character.
- **L9 Pendulum** — P2 fixed: readout badge reflows instead of clipping "T₀"; uninformative "lap 0" chips no longer draw (gated on count ≥ 1).
- **L17 Damped HO** — P1 fixed: dead `updateInquirySteps()` + all 4 no-op call sites removed (0 remaining refs, re-parsed clean).
- **L29 Centrifugal** — moving arrow relabelled `F_cf at current r =` to distinguish it from the hold-radius badge/audit value.
- **L30 Coriolis** — two tooltips extended (launcher carry-velocity; naive model shows Coriolis only). Interaction-timing/default P2s deliberately left (design tradeoffs).
- **L16** — filename kept as-is per user decision (content is the drag-projectile sim; name is legacy).

## Method notes
- Physics validated both by `node` closed-form checks and the sim's own `window.__audit` hook across the slider sweep (e.g. L2 double-mass→half-a and Σp=0; L6 amplitude-independent T; L9 AGM period growth; L17 λ(α) peak at critical; L16 optimum<45° falling with drag; L29 F∝ω²r; L30 2Ωv sign flip).
- A few relations needed a one-off puppeteer drive because the generic sweep calls `window.__audit.at(0)` (L2 scenes, L9 period ratio, L29/L30 driven full runs) — done and confirmed.
- Panels that ship collapsed (L4-Projectile Range-vs-angle) were code-read; worth an eyeball confirmation — noted per-file under "To verify (human)".
