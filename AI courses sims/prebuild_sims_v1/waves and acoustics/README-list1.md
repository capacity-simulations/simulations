# Vol 6 waves, List 1: 10 prebuilds (pre-polish)

These were built overnight on 25 Sep. **Polish has not been run**, as you asked, so these are the raw prebuilds for your quality check. Open any `.html` file directly in a browser.

- **API spend:** $16.21 for all 10, against the $40 cap. The watchdog never had to intervene, and every sim built on the first attempt (opus-5-5, effort high).
- **Everything else was on the subscription:** the skill slots, assembly and gates.
- **Specs:** in `~/Downloads/`, named by title. Each was independently evaluated ("ship with fixes") and the fixes were applied before the build.
- **Repo:** commit `61f3772` holds the specs and pipeline entries. The prebuild files are in `sim-foundry/sims-eval-law/wv-*`.

| # | File | Spec | API $ | Gates (of 9) | What failed |
|---|---|---|---|---|---|
| 1 | wv-phase-group-velocity | Phase and Group Velocity | 1.40 | 8 | gi word budget (card 6, 74 words) |
| 2 | wv-moving-source-wavefronts | Wavefronts from a Moving Source | 1.33 | 8 | gi word budget (card 4, 66) |
| 3 | wv-damped-phase-plane | Damped Oscillations in the Phase Plane | 2.20 | **7** | gi word budget (card 6, 111); **reset-oracle** |
| 4 | wv-u-tube-column | Oscillations of a Liquid Column | 1.90 | **7** | gi word budget (card 5, 74); **layout** |
| 5 | wv-fluid-boundary-sound | Sound at a Boundary between Two Fluids | 1.64 | 8 | gi word budget (card 6, 109) |
| 6 | wv-antiresonance-coupled | Antiresonance in Coupled Oscillators | 1.65 | 8 | gi word budget (card 5, 68) |
| 7 | wv-helmholtz-resonator | The Helmholtz Resonator | 1.46 | **7** | gi word budget (card 4, 99); **layout** |
| 8 | wv-vibration-isolation | Vibration Isolation | 1.57 | 8 | gi word budget (card 3, 63) |
| 9 | wv-square-wave-drive | Driving an Oscillator with a Square Wave | 1.51 | **9** | none |
| 10 | wv-passing-source-pitch | The Pitch of a Passing Source | 1.55 | 8 | gi word budget (card 4, 76) |

**Physics:** every sim passes its engine audit, with 60–130 kernel checks each and all invariants passing. The frozen template is intact in all 10.

**The gi word budget:** this fails on 9 of the 10. It is the same open decision as on the QM sims: the SME explanations are sealed verbatim, and many run past the gate's 60-word budget. It needs your ruling: either waive the budget for sealed explanations or allow them to be trimmed.

## Defects to hand to polish

- **#3 damped phase plane (reset-oracle):** in free mode, the header ↻ Reset does not put the damping slider back to its starting value. The entry's "Reset keeps the damping" rule was meant for the in-card reset, but the build applied it to the full reset as well. The hint also says "black dot", although the dot is near-white in the dark theme.
- **#4 U-tube (layout):** the apparatus fills only 17% of the scene canvas. It needs scaling up.
- **#7 Helmholtz (layout):** the drawing fills 26% of the canvas. The sim also boots playing, with no `autoplay:false`. That was chosen deliberately, because the spec flicks the plug on open, but the contract prefers paused-at-boot for time-evolving inquiry sims.

## Things to look at when you review

- **Two Reset buttons in #1, #5 and #8.** The sealed cards say "Press Reset", but the shell's ↻ Reset sends Guided Inquiry back to card 1. So each of these sims also has its own Reset:
  - #1: "↺ Reset to t = 0";
  - #5 and #8: a sidebar Reset that clears the record without leaving the card.
  The Controls Guide explains both.
- **#1 inset size.** It is square at the contract's 235 px maximum; the spec asked for at least 260 px, so the contract won.
- **#6 antiresonance:**
  - dashed ω₁/ω₂ lines are drawn, following the spec, while the standstill itself stays unmarked;
  - amplitudes show one decimal in mm, so the standstill reads 0.0 mm;
  - the ω slider has −/+ nudge buttons of ±0.01 rad/s.
- **#2 moving source.** It opens playing. The cone lines and θ_M unlock only after the inquiry is finished.
- **Engine comments.** In 6 cores, a code comment naming `Engine.…` was reworded because the assembler bans it. No code changed.
