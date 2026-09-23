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

## Fermi_testprep_jee_sims — 98/104 (2026-09-22) — a SECOND fleet, new Shape

The JEE testprep fleet is **not** one of the uni-lab shapes. It is a hybrid:
Shape A's `function cgShow` uv layer, on a shell that is sometimes the newer
`CFG_DEFAULTS` tri-state and sometimes an older inline listener with a
hardcoded `setPlaying(...)`. Patch 1 is Shape A's template verbatim; the exact
anchor matched exactly once in 98 of 104 files. All 104 define
`cgOn, cgAuto, setCgAuto, cgVoice, cgStep, cgMax, __cgPrepare, cgShow, giBtn`,
and `cgVoice`'s API includes `.stop()`.

Done by module: M01 5, M02 8, M03 6, M04 8, M05 6, M06 7, M07 5, M08 10,
M09 9, M10 5, M11 5, M12 8, M13 10, M14 5, plus C030 (the pilot). Verified:
98 carry the mode-local hook, 0 old hooks remain, 708/708 script blocks parse.

### What predicts Patch 2 on this fleet

**Nothing in the cfg predicts it except `timeless`.** Two cfg-based pre-screens
were tried and both produced false positives AND false negatives:
 * `autoplay:false` without `resumeOnReset` is NOT a reliable signal —
   C190, C197, C132 have it and needed nothing; adding `'pause'` would have
   INTRODUCED an H2 failure (boot parity here is set by `__freeExplore` /
   `__giResume`, not by `autoplay`).
 * An explicit `resumeOnReset: true` is NOT "already safe" — C209, C210 both
   needed `true` -> `'pause'` (a change, not an addition).
 * **`timeless: true` DOES always need `resumeOnReset:'pause'` — 13/13.** The
   reason is structural: the shell does `if (cfg.timeless) { ...; playing =
   false; }` while the reset listener's default `resumeOnReset:true` turns play
   back on into a transport that `no-transport` has hidden.
 * Reliable structural pre-screen for the rest:
   `Shell.init(...)` immediately followed by `Shell.setPlaying(false)`
   (C143, C152 boot paused this way with nothing in cfg).
 * A gated card 0 also boots a sim paused with nothing greppable (C113, C173).

### New hazard sub-cases found here (all fixed, oracle-verified)

 * **Spent-run false positive.** The welcome overlay dwells ~1.6 s; a sim whose
   run finishes in under ~2.5 s has ALREADY COMPLETED behind it on fresh entry,
   so `playing:(False,True)` is animation phase, not boot parity. Discriminate
   with a ~4000 ms post-reset settle: phase converges, real H2 does not.
   Forcing `'pause'` here is actively wrong — Reset stops replaying the
   phenomenon. Precedent **C055-collisions-in-2d** (cf. virtual-particle-collider).
 * **`__fullReset` ending in an unconditional `Shell.setPlaying(false)`** gives
   an inquiry-only `playing:(True,False)` that NEITHER Patch 2 direction can
   reach (the shell listener runs before the uv `setTimeout`). Fix = delete the
   line under H8. Precedents **C127-forced-oscillations**, **C148-relation-between-field-and-potential-gradient**.
 * **Mis-nested cfg keys.** Keys passed at the TOP LEVEL of `Shell.init` are
   silently discarded by `Object.assign({}, CFG_DEFAULTS, opts.cfg || {})`.
   Nest the author's existing key rather than adding a second. Precedent
   **C166-rc-circuits**. NOTE: grep screens for this are unreliable — they match
   the shell's own `CFG_DEFAULTS` block and in-body comments. Only a
   paren-balanced extractor at the sim's own (LAST) `Shell.init(` call site is
   trustworthy; the true count fleet-wide was 1, not the 79 a naive grep gave.
 * **Third hardcoded sub-variant:** listener `()=>{ onReset(); last=...; }` with
   NO `setPlaying` at all. Nothing to flip; a `playing` diff there is H5
   downstream in `onReset`. Precedent **C054-...--momentum-and-energy**.
 * **`playing` drags a phantom `s1`.** When both differ, fix `playing` first and
   re-run before writing any H7 justification. Precedents **C173**, **C208**, **C143**.
 * **H3 presents as an `s1` diff with `card: 0`**, not as "needs two clicks",
   when `__fullReset` calls `setGi(true)` before `Shell.inqShow(0)` and the
   departed card's `onStep` writes a control. Precedent **C204-total-internal-reflection**.
 * **Answer-dependent play state.** C219's `onStep` ends
   `Shell.setPlaying(!holdForPredict)` where `holdForPredict` depends on
   `data-answered`. Inquiry-only `playing` diff, untouchable by Patch 2;
   discriminator is re-running the GI dirty WITHOUT answering, not a settle.
   Accepted under H7. Unique to C219 fleet-wide.
 * **H7 vestigial hidden slider.** The `s1` probe often lands on leftover
   template markup for scenes a sim never shows — check `offsetParent === null`
   before ruling. Precedent **C032-newtons-third-law-pairs**.
 * **Fleet-specific H7 generator:** `const i = giOff ? 99 : Shell.step` in
   `onReset` — when the `i >= 3` free/CG branch omits slider writes the GI
   branch performs, free/CG legitimately preserve settings. Precedents
   **C072-toppling**, **C037-static-and-kinetic-friction**, **C230-radioactive-decay**.

### Accepted diffs (pass with --allow, documented design)
C032 (s1, hidden vestigial slider) · C033 (s1, settings-survive) ·
C037 (s1, onReset READS sliders) · C055 (playing, spent run) ·
C072 (s1, `i>=3` branch) · C219 (playing, answer-dependent) ·
C230 (s1, card 3 asks the student to re-run at their own settings)

### PRE-EXISTING bugs found, NOT fixed (outside reset scope — need their own pass)
 * **C078-orbital-velocity** and **C202-spherical-mirrors** — a CG `mode:'hide'`
   step leaves the scene canvas at 0x0, so unclamped scale math yields a
   negative radius and `arc()` throws. In C202 the throw happens INSIDE the
   shell's reset listener, aborting it before `setPlaying(false)` — a real
   user-facing bug: Reset inside the Controls Guide leaves the shell "playing".
   Fix = clamp the radius, or stop the CG step hiding the canvas container.
   The oracle reports pageerrors on every run, so all 97 sims are already
   screened for this class; these two are the only instances.
 * **C136-beats** carries a duplicate `shell-reset` listener (harmless, idempotent).

### The 6 DEVIANTS — not patched, need per-file mapping
C025-projectile-motion-ground-to-ground (no cgShow; resetBtn listener) ·
C161-kirchhoffs-laws (no reset button id, no listener found) ·
C183-magnetic-flux-and-faradays-law · C213-interference-and-youngs-double-slit
(button id `reset-btn`) · C223-rutherfords-model-and-alpha-particle-scattering ·
C225-...--emission-and-absorption (button id `reset-btn`).

### Copy debt created by this rollout
23 of 101 Reset captions in `cgSteps` still promise "restores defaults AND
guided inquiry back at card 1" unconditionally — true only in GI now. C123 and
C127 already word it correctly ("Inquiry returns to card 1; free exploration
stays free"). Not touched; needs a copy pass.

## Remaining: NONE — the rollout is complete (2026-09-22)

All 112 uni-lab sims carry the mode-local Reset: CM 21, Condensed matter 11,
PP 15, QM 30, SR 35. Verified by an independent full-fleet oracle scan plus a
change-scope audit against the pre-rollout checkpoint 5643110 (only reset
wiring changed anywhere).

Scan result: 84 clean; 26 with an `s1`-only diff that is documented per-sim
design (H7 settings-survive or H9 fresh-entry-inherits) and passes with
`--allow=s1`. Two defects the scan caught AFTER the batches reported PASS:
 * particle-detector-headquarters — H2, reset left the scene playing where a
   fresh entry is paused (arm-to-fire design). Fixed.
 * Spin-X-measurement-probability — untestable: button id `rsB`. Oracle
   detection widened to match class and label. Fixed.

Use this skill for NEW sims added to the lab, or to re-verify after any change
to a sim's reset/mode wiring. Batch sizes that worked: 13-20 agents.
