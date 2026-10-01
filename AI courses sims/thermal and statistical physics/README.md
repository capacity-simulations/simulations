# Thermal and statistical physics: 15 prebuilds (pre-polish)

This batch is from *Fermi Notes on Physics Vol 2: Thermal and Statistical Physics*. It is the top 15 of the sim-scout review sheet. The builds ran on 25–26 Sep 2026. **Polish has not been run.** Open any `.prebuild.html` directly in a browser.

- **API spend:** $24.12 for all 15 (opus-5-5, effort high). Every sim built on the first attempt, and both watchdog caps ($40 and $20) held.
- **Everything else was on the subscription:** the specs, engine ops, skill slots, assembly and gates.
- **Specs:** in `~/Downloads/thermal-stat-specs/`. At the owner's request there was **no independent evaluation**. Every number was computed in python, and every spec was checked against engine ops before its build.
- **Entries were lean:** the spec text went into the build as-is, with no kernel reference block and no audit spec. **Gate 2 (the physics audit) is therefore not applicable**, and the polish's physics critic has to check the numbers against each spec.
- **Repo (sim-foundry, unpushed):**
  - ops: b02891e and 6f2cb93
  - entries: 103fafb and 13b862e
  - cores: f658ce4
  - prebuild files: `sims-eval-law/th-*`

| # | File | Spec | API $ | Gates | What failed |
|---|---|---|---|---|---|
| 1 | th-demagnetisation | A Paramagnetic Salt in a Changing Field | 1.63 | 7/8 (audit N/A) | gi budget (card 3, 65 words) |
| 2 | th-debye-einstein | The Heat Capacity of a Cold Solid | 1.60 | 7/8 (audit N/A) | gi budget (card 5, 71 words) |
| 3 | th-free-expansion | Two Ways to Let a Gas Expand | 2.02 | 7/8 (audit N/A) | gi budget (card 5, 62 words) |
| 4 | th-equipartition-wells | Mean Energy and the Shape of a Well | 1.68 | 7/8 (audit N/A) | gi budget (card 5, 72 words) |
| 5 | th-negative-temperature | Adding Energy to Isolated Spins | 1.66 | 7/8 (audit N/A) | gi budget (card 6, 70 words) |
| 6 | th-partition-counting | Removing the Partition | 1.30 | 7/8 (audit N/A) | gi budget (card 4, 72 words) |
| 7 | th-carnot-cycle | The Carnot Cycle of an Ideal Gas | 1.79 | 8/8 (audit N/A) | none |
| 8 | th-diatomic-heat-capacity | Heat Capacity of a Diatomic Gas | 1.88 | 7/8 (audit N/A) | **layout** |
| 9 | th-isotherm-adiabat | Isotherm and Adiabat through the Same State | 1.46 | 8/8 (audit N/A) | none |
| 10 | th-two-paths | Routes from A to B | 1.91 | 6/8 (audit N/A) | gi budget (card 3, 68 words); **layout** |
| 11 | th-effusion | Effusion from a Small Slit | 1.51 | 7/8 (audit N/A) | gi budget (card 2, 66 words) |
| 12 | th-two-level-free-energy | The Free Energy of a Two-Level System | 1.24 | 8/8 (audit N/A) | none |
| 13 | th-mixing-free-energy | Two Species on a Lattice | 1.28 | 8/8 (audit N/A) | none |
| 14 | th-oscillator-reservoir | One Oscillator and a Reservoir | 1.36 | 7/8 (audit N/A) | gi budget (card 4, 61 words) |
| 15 | th-common-tangent | Tangents to the Gibbs Curve of a Mixture | 1.80 | 7/8 (audit N/A) | gi budget (card 5, 63 words) |

**Every sim passes all of these:** the check that the template is unmodified, cg, wo, param-stability, style and reset-oracle. **The gi word budget fails on 10:** the sealed explanations run 61–72 words, against the gate's 60. This is the same open ruling as on the other courses.

## Defects to hand to polish
- **Raw TeX shows in the cards:**
  - **#8 diatomic** and **#5 negative temperature** show literal `$T/\theta_r$`-style markup throughout their cards.
  - **#2, #3 and #14** each have 1–2 such fragments.
  - **Cause:** the lean entries passed the spec's LaTeX straight through.
  - **Fix:** typeset it or convert it to Unicode. The next batches will convert it before the build.
- **"prediction" wording in the Info modal** of #8, #5 and #10 breaks the SME's no-"predict" rule. It needs outcome-neutral rewording.
- **#10 two paths (layout):** 33% of the hero column below the last canvas is empty. Enlarge the hero canvas.
- **#8 diatomic (layout):** on the ladder canvas, the label "continue" is painted through "above".
- **#1 demagnetisation:** Q2's feedback refers to "(a)", but the choices show no letters.

## Things to look at when you review
- **#5 negative temperature:** the skill-slot author added `window.__cgPrepare`, so the tour shows all three readouts. The card-6 view had hidden the T readout.
- **Every spec has 5–6 cards** written by our spec writers. The SME has not reviewed them yet.

---

# Batch 3: 34 more prebuilds (26 Sep 2026)

This batch covers the remaining proposals on the Vol 2 sheet, ranks 16–50 except #46, the Planck spectrum, which duplicates the QM blackbody sim. **The folder now holds all 49 thermal and statistical physics sims.**

- **Specs:** plain-Unicode maths with no LaTeX (the raw-TeX problem of batch 1 is fixed at the source). There was no independent evaluation. Five engine agents covered every spec with about 27 new ops across statmech, thermo-laws, thermo-applications, thermo-kinetic and statmech-stochastic (kernel 6,008/6,008). They corrected 8 small spec slips, one of them with owner approval.
- **API spend:**

  | Part | Sims | Cost | Notes |
  |---|---|---|---|
  | Built at xhigh | 24 | $64.40 | |
  | Cut off at the 128K output cap at xhigh | 5 | $16.58 wasted | |
  | Stopped or failed | 5 | $0 recorded | 4 stopped in flight by the $90 watchdog, 1 AWS signing error |
  | Rebuilt at **high** | those 10 | $18.33 | all on the first attempt |
  | **Total** | 34 | **$99.31** | |

  The build default is back to `high`.
- **Gates:** these are still being run. As with the earlier batches, expect the physics audit to be not applicable (lean entries) and the gi word budget to fail on the sealed explanations.
- **Defects already known, to hand to polish:**
  - **Path2D:** th-brownian-motion-grains-water uses `Path2D`, which the headless cg gate lacks.
  - **Controls Guide leak:** in th-counting-molecules-half-vessel, the tour reveals staged elements.
  - **"predictions" in the Info modal** of th-which-way-reaction-runs.
  - **Reset:** in th-gibbs-function-near-start, the reset moves a marker that is marked `data-no-reset`.
  - **Spec range:** in th-two-einstein-solids-sharing, the spec's q_B range (0–60) contradicts card 5, which needs 90. The build correctly uses 90.
