# Precedents — the 34 finished sims (case law) and what remains

Commit message pattern: `<sim>: mode-local Reset [+ qualifier]` with body
naming the shape, boot parity, any hazard fixes, and the oracle result.

## Done (do NOT re-patch; open these as references)

### Condensed_matter_sims — 11/11 (Shape A)
| sim | notes |
|---|---|
| sc-ising-order | first pilot; `resumeOnReset:'pause'` |
| qs-rabi-bloch-sphere | 'pause' |
| mc-random-walker.eval-newcontract.polished | 'pause' |
| cm-bloch-oscillations | H3 v2-shell reorder; H7 sliders read |
| cm-crystal-diffraction-2d-polished | timeless → 'pause' |
| cm-kronig-penney-bands-polished | timeless → 'pause'; H6 free restage |
| cm-phonon-diatomic-chain-polished | H7 sliders read (readParams) |
| sm-energy-sharing | 'pause'; H7 (readControlsFromDOM) |
| sm-heat-capacity-steps.eval-newcontract.polished | timeless → 'pause' |
| sm-identical-counting | timeless → 'pause' |
| sm-rubber-band | 'pause' |

### PP_sims — 15/15 (Shape C; uv layer has cgShow)
| sim | notes |
|---|---|
| build-a-baryon | H4 library: clear-after-replay + re-admit staged + `__libReset` in GI branch |
| wu-experiment-and-the-death-of-parity | boots paused → listener `setPlaying(false)`; old 0ms re-pause raced (H2) |
| dirac-s-sea-of-electrons | H5 both branches (`__freeExplore` in free AND cg) |
| exploring-the-standard-model | H5 both branches |
| feynman-diagram-sandbox | boots paused → false; H8 dead `window.Shell` guard removed |
| geiger-marsden-gold-foil-experiment | plain C |
| how-to-make-a-particle | plain C |
| ma-perturbation-breakdown.opus-5 | DEVIANT wiring, mapped from scratch; accepted hidden done-dot diff |
| navigating-the-eight-fold-way | speed select persists (accepted) |
| particle-detector-headquarters | plain C; oracle validated against pre-patch copy |
| scale-of-the-universe | plain C |
| spin-and-helicity | plain C |
| the-wine-bottle-potential-continuous-symmetr | plain C |
| virtual-cloud-chamber | plain C; ghost tags verified clean |
| virtual-particle-collider | accepted intra-cycle clock (`__vc.S.cy`) diff |

### QM_sims — 5/30 (Shape D)
| sim | notes |
|---|---|
| infinite-potential-well | H3 `inqStep=0` before setGi |
| Double-slit-experiment | H3 same fix |
| 2d_wavefunction_collapse_measurement | plain D |
| A(k)-vs-k-plot | static plot; accepted closed-popup mirror-slider diff |
| Quantum_Tunneling_Gaussian_Wave | button id `btnReset` (pass it to the oracle); H7 accepted: sliderV0 persists — resetSimulation() reads controls, caption says "Relaunches the wavepacket from its starting position" |

### SR_sims — 2/35 (Shape B)
| sim | notes |
|---|---|
| L11-s2-light-clock... | asymmetric boot (GI paused, free/CG playing) — no play change |
| L12-s2-Twin_Paradox_v2 | boots paused everywhere → listener false; H7 beta/tc sliders |

### CM_sims — 2/20 (Shape B) + Galperin
| sim | notes |
|---|---|
| Galperins_Billiard | boots paused (already false); H7 ruling origin ("applies on next Reset") |
| L17-The damped HO | plain B, boots playing |

## Remaining (76)
- QM_sims: 25 (Shape D; ALWAYS check H3 — both hand-done QM sims had it)
- SR_sims: 33 (Shape B; watch asymmetric boot play states)
- CM_sims: 17 tracked shell sims (Shape A or B — check cfg presence per sim)
  plus any new arrivals (e.g. cm-phase-plane.polished if/when tracked).
Batch sizes that worked: 3 → 5 → 8 → 15 with parallel agents; always run the
shipped oracle per sim and report accepted diffs for human review.
