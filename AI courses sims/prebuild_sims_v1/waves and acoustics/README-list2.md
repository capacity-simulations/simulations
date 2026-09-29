# Vol 6 waves, List 2: 20 prebuilds (pre-polish)

These were built on 25 Sep. **Polish has not been run**, as you asked, so these are the raw prebuilds for your quality check. Open any `.html` file directly in a browser.

- **API spend:** $30.06 for all 20, against the $70 cap. The watchdog never had to intervene, and every sim built on the first attempt (opus-5-5, effort high).
- **Everything else was on the subscription:** the specs, reviews, engine ops, pipeline entries, skill slots, assembly and gates.
- **Specs:** in `~/Downloads/waves-list2-specs/`. Each was independently evaluated ("ship with fixes") and the fixes were applied before the build.
- **Repo:** commit `0198a81` holds the specs, the 20 new engine ops with audits, and the pipeline entries. The prebuild files are in `sim-foundry/sims-eval-law/wv-*`.

| # | File | Spec | API $ | What failed |
|---|---|---|---|---|
| 1 | wv-log-decrement | Measuring the Quality Factor by Counting Cycles | 1.21 | gi budget only |
| 2 | wv-string-velocity | The Velocity of the String and the Speed of the Wave | 1.15 | gi budget only |
| 3 | wv-launched-pulse | Releasing and Launching a Pulse on a String | 1.53 | gi budget only |
| 4 | wv-beats-phasor | Beats and the Turning Phasor | 1.74 | gi budget; **layout** |
| 5 | wv-pulse-junction | A Pulse at the Junction of Two Strings | 1.80 | gi budget; **layout** |
| 6 | wv-pipe-modes | Displacement and Pressure in Open and Closed Pipes | 1.42 | gi budget only |
| 7 | wv-packet-spreading | Spreading of a Wave Packet | 1.63 | gi budget only |
| 8 | wv-fluid-layers-sound | Layers of Fluid in a Plane Sound Wave | 1.55 | gi budget only |
| 9 | wv-adding-sound-levels | Adding Two Sound Levels | 1.65 | gi budget only |
| 10 | wv-duct-modes | Modes of a Rectangular Duct | 1.95 | gi budget only |
| 11 | wv-plucked-string | A String Plucked at a Point | 1.07 | gi budget; **param-stability** |
| 12 | wv-quarter-wave-match | Joining Two Strings through a Third | 1.61 | gi budget; **layout** |
| 13 | wv-loaded-string | Driving One End of a Loaded String | 1.17 | gi budget only |
| 14 | wv-tone-burst | The Spectrum of a Tone Burst | 1.58 | gi budget only (card 5 is 151 words) |
| 15 | wv-transverse-longitudinal | Transverse and Longitudinal Waves | 2.03 | gi budget only |
| 16 | wv-wave-energy | Energy in a Travelling Wave | 1.33 | gi budget only |
| 17 | wv-lissajous | Lissajous Figures | 1.20 | gi budget only |
| 18 | wv-slit-polariser | Polarisation of Waves on a String | 1.68 | gi budget; **layout** |
| 19 | wv-sound-speed-slopes | The Slope That Sets the Speed of Sound | 1.14 | gi budget only |
| 20 | wv-sound-heat-flow | Heat Flow in a Sound Wave | 1.63 | gi budget only |

**Every sim passes all of these:** the physics audit (60–130 kernel checks, every invariant passing), the check that the template is unmodified, cg, wo, style and reset-oracle. Param-stability passes on 19 of the 20.

**The gi word budget:** this fails on all 20. It is the same open decision as on the QM sims and List 1: the SME explanations are sealed verbatim and run 62–151 words, against the gate's 60. It needs your ruling.

## Defects to hand to polish

- **Layout, drawing too small on its canvas:**
  - #18 slit polariser: 6% (the gate probably measured before the wave train arrived, but the board alone is too small);
  - #12 quarter-wave: 17%;
  - #5 pulse junction: 27%.
- **#4 beats:** the hero is under-filled. Its single near-square canvas uses 59% of the column height.
- **#11 plucked string (param-stability):** moving the pluck point resets the time slider (cross-talk). This is probably the intended restart, but the gate flags it.
- **#17 Lissajous:** the arrow keys step the fine tuning even when the coarse slider has focus.
- **#9 adding sound levels:** card set-ups pre-select the source type that cards 3 and 6 ask the student to choose.

## Things to look at when you review

- **Sim-owned "↺ Reset to t = 0" buttons** sit beside the header ↻ Reset in #7, #8, #16 and #15. The header Reset returns Guided Inquiry to card 1, while the spec's in-card resets keep settings.
- **Deliberate departures from the shell contract**, each chosen to follow its sealed spec's layout:
  - #4 beats: one near-square canvas holding both the diagram and the strip.
  - #18 slit: one 16:9 canvas with a built-in end-on inset.

  The contract prefers a separate companion canvas for sub-plots.
- **#20 heat flow:** reframed after review, so the log–log time plot is the main element and the model is greyed out below 2πλ_f ("air not a continuous fluid").
- **#13 loaded string:** the spec dropped the proposal's acoustic-filter cavities (the idea appears only in words). The Helmholtz sim already covers the cavity picture.
