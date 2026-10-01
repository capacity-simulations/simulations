# Waves & acoustics — polished sims

Polish pass started 26 Sep 2026 (subscription agents only, no API). Every sim goes through 3 critics (physics, pedagogy, visuals) → orchestrator rulings → fixer → 9 gates + sealed-deck check + structure check → filed here. Per-sim detail: `sim-foundry/sims-eval-law/<id>.polish/fixer-report.md`; gate rows in `POLISH-LOG.md`.

## The structure fix (owner directive, 26 Sep)
The prebuilds put readouts, buttons and notes under the canvas (a craft rule of ours overrode the shell contract). Every polished sim now has:
- **Hero = pictures only** (main canvas + companion chart band).
- **All readouts in one sidebar Readouts panel directly below the controls**; sim buttons (Release, Reset to t = 0, Step…) are sidebar control boxes.
- **Controls + readouts docked** (sticky at the bottom of the sidebar), so a student can move a slider and read the result while a card is open; the card text scrolls above.
- Model/scale notes as one short muted line under the readouts (long text → Info modal).
Checked independently on every sim: no readout/button/text in the hero; readouts inside the controls column.

## Owner rules added 26 Sep (applied to every sim, batch 1 re-polished)
- **Guided inquiry is editable**: cards were improved for flow, answer leaks (incl. read-ahead leaks via the ‹ › pager), and every explanation is now ≤ 60 words — the gi gate is GREEN (no more documented exception). Each sim's card edits are listed before → after in `sims-eval-law/<id>.polish/fixer-report.md` or `gi-pass-report.md`.
- **Only the header ↻ Reset is called "Reset"**: sim buttons are named by what they do — "⏮ Back to t = 0", "↺ Restart run", "Restore defaults", "↺ Air meets water". Cards that said "press reset" name the button; sims that needed one got a "↺ Restart run" box first in the sidebar.
- vibration-isolation cards 1–2: the curve now reveals only up to the highest ω the student has swept (owner-approved).

## Batch 1 (10 sims) — done, re-polished under the new rules
| Sim | Gates before → after (latest) |
|---|---|
| wv-passing-source-pitch | 8/9 → 9/9 |
| wv-antiresonance-coupled | 8/9 → 9/9 |
| wv-vibration-isolation | 8/9 → 9/9 |
| wv-fluid-boundary-sound | 8/9 → 9/9 |
| wv-square-wave-drive | 9/9 → 9/9 |
| wv-damped-phase-plane | 7/9 → 9/9 |
| wv-moving-source-wavefronts | 8/9 → 9/9 |
| wv-phase-group-velocity | 8/9 → 9/9 |
| wv-helmholtz-resonator | 7/9 → 9/9 |
| wv-u-tube-column | 7/9 → 9/9 |

## Batch 2 (10 sims) — done
| Sim | Gates before → after (latest) |
|---|---|
| wv-pipe-modes | 8/9 → 9/9 |
| wv-plucked-string | 7/9 → 8/9 |
| wv-string-velocity | 8/9 → 9/9 |
| wv-fluid-layers-sound | 8/9 → 9/9 |
| wv-loaded-string | 8/9 → 9/9 |
| wv-tone-burst | 8/9 → 9/9 |
| wv-packet-spreading | 8/9 → 9/9 |
| wv-launched-pulse | 8/9 → 9/9 |
| wv-log-decrement | 8/9 → 9/9 |
| wv-sound-speed-slopes | 8/9 → 9/9 |

Deck changes are deliberate (owner rule); every gate else green. plucked-string keeps one documented exception: param-stability — moving the pluck point sets time back to 0 (the fresh pluck card 6 is about).

## Batch 3 (10 sims) — done
| Sim | Gates before → after |
|---|---|
| wv-wave-energy | 8/9 → 9/9 |
| wv-adding-sound-levels | 8/9 → 9/9 |
| wv-pulse-junction | 7/9 → 9/9 |
| wv-duct-modes | 8/9 → 9/9 |
| wv-lissajous | 8/9 → 9/9 |
| wv-quarter-wave-match | 7/9 → 9/9 |
| wv-sound-heat-flow | 8/9 → 9/9 |
| wv-slit-polariser | 7/9 → 9/9 |
| wv-beats-phasor | 7/9 → 9/9 |
| wv-transverse-longitudinal | 8/9 → 9/9 |

Four batch-3 sims had a failing layout gate before polish (pulse-junction, beats-phasor, slit-polariser, quarter-wave-match) — all fixed. adding-sound-levels' readouts had never been visible (clipped off the plot) — now in the sidebar.

## Documented exceptions
- `Engine.` count = 3 in every sim: all inside the frozen shell runtime (same as every prebuild).
- plucked-string param-stability (above).

## Open items for the owner
0. **course.mjs is out of sync with the polished cards**: fixers may edit only the sim file, so the edited card text lives in the polished HTML only. A prebuild rebuild from course.mjs would bring back the old cards. A one-off sync pass (copy each sim's final card text back into its course.mjs entry) is needed — awaiting your go-ahead.
1. **Sidebar space at 1280×800**: controls + readouts are docked at the bottom of the sidebar; the open card scrolls in the window above (≈ 280–400 px). Everything is reachable.
2. **Frozen welcome narration** says "with predictions to make and then observe" in every sim (template text) — conflicts with the no-"predict" rule; needs a template change.
3. **The ‹ › pager is ungated** (frozen shell): card stems were rewritten so paging ahead leaks less, but a shell-level gate (stop at furthest answered + 1) would close it fully.
