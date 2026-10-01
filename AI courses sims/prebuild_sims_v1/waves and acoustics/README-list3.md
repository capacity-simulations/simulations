# Vol 6 waves, List 3: 19 prebuilds (pre-polish)

These are the remaining List-2 proposals: 10 left over from List 2, plus the 9 that scored below 4.0. The near-duplicate p-a14-1 was skipped. They were built on 25 Sep. **Polish has not been run**, as you asked, so these are the raw prebuilds for your quality check. Open any `.html` file directly in a browser.

- **API spend:** $32.13 for all 19, against the $70 cap. The watchdog never had to intervene, and every sim built on the first attempt (opus-5-5, effort high). Today's total API spend across List 2 and List 3 is $62.19.
- **Everything else was on the subscription:** the specs, reviews, engine ops, pipeline entries, skill slots, assembly and gates.
- **Specs:** in `~/Downloads/waves-list3-specs/`. Each was independently evaluated ("ship with fixes") and the fixes were applied before the build.
- **Repo:** commit `44a696b` holds the 20 new engine ops with their audits (kernel 5,775/5,775) and the 19 pipeline entries. The prebuilds are commit `6a75cd0`, in `sim-foundry/sims-eval-law/wv-*`. Both commits are unpushed.

| # | File | Spec | API $ | Gates (of 9) | What failed |
|---|---|---|---|---|---|
| 1 | wv-beads-released | Beads Released from Rest | 1.78 | 8 | gi budget only |
| 2 | wv-loaded-modes | The Normal Modes of a Loaded String | 1.32 | **7** | gi budget; **layout** |
| 3 | wv-ring-masses | A Ring of Masses and Springs | 1.38 | **7** | gi budget; **layout** |
| 4 | wv-plucked-struck | Plucked and Struck Strings | 1.38 | 8 | gi budget only |
| 5 | wv-shaken-string | A String Shaken at One End | 1.37 | 8 | gi budget only |
| 6 | wv-spring-pulses | Two Pulses on a Stretched Spring | 1.67 | **7** | gi budget; **layout** |
| 7 | wv-string-end-dashpot | Pushing the End of a Long String | 2.04 | 8 | gi budget only |
| 8 | wv-bead-junction | A Bead at the Junction | 1.77 | 8 | gi budget only |
| 9 | wv-evanescent-stretch | A Wave Meeting a Stretch of String on Springs | 1.95 | 8 | gi budget only |
| 10 | wv-end-loads | Loads at the End of a String | 2.05 | 8 | gi budget only |
| 11 | wv-oblique-boundary | A Plane Wave Crossing a Boundary | 2.14 | 8 | gi budget only |
| 12 | wv-side-branch | A Resonator on the Side of a Pipe | 1.83 | 8 | gi budget only |
| 13 | wv-exponential-horn | The Exponential Horn | 1.69 | **7** | **gi + cg**: headless harness crash, not a budget issue (see below) |
| 14 | wv-pulsating-sphere | The Small Pulsating Sphere | 1.71 | 8 | gi budget only |
| 15 | wv-loudspeaker-row | A Row of Loudspeakers | 1.53 | **7** | gi budget; **physics audit 101/110** |
| 16 | wv-coupled-pendulums | Energy Exchange between Coupled Pendulums | 1.68 | 8 | gi budget only |
| 17 | wv-three-masses | Three Masses between Two Walls | 1.39 | 8 | gi budget only |
| 18 | wv-power-resonance | Power Absorbed by a Driven Oscillator | 1.81 | 8 | gi budget only |
| 19 | wv-delayed-copy | A Signal and Its Delayed Copy | 1.66 | 8 | gi budget only |

**Every sim passes all of these:** the check that the template is unmodified, wo, style, param-stability and reset-oracle. The physics audit (80–180 kernel checks, every invariant passing) passes on 18 of the 19.

**The gi word budget:** this fails on 18 of the 19, from card feedback of 64–97 words. It is the same open decision as on Lists 1 and 2: the sealed explanations run past the gate's 60 words. It needs your ruling. The horn is the 19th sim; it fails gi for a different reason, described below.

## Defects to hand to polish

- **#15 loudspeaker row, a physics-audit fail:** in the audit hook, `thetaDeg` is computed as k/(3·(d/λ)·60) = k/270 where it should be k/180. `__audit` therefore reports θ = 12.84° at k = 60, where it should be 19.47°, and all 9 θ probes fail. The skill-slot author reports that the on-screen readout is correct. Please confirm this when you review, since the angle is what card 4 reads.
- **#13 horn, gi and cg:** SIM_JS draws with `new Path2D()`, which the headless jsdom harness lacks. Boot throws, so gi sees no cards and cg sees a runtime error. The physics audit, which runs in a real browser, passes 100/100, and cg passes with a Path2D stub. The fix is to draw the paths directly on the context.
- **Layout, a drawing too small or off-centre on its canvas:**
  - #2 loaded modes: the frequency-ladder canvas is 15% filled, because thin rungs sit in a 220 px side band;
  - #6 spring pulses: the scene is 16% filled at the boot stretch, because the scale is fixed to fit the longest spring (1.5 m);
  - #3 ring: the inset plot sits right of centre in its band, leaving a 46% empty band on the left.
- **#17 three masses:** the info modal says "Sliders move the blocks, arrows and rungs at once". That hints that every rung moves, but rung 2 stays put, and that is card 3's answer.

## Fixes made before or during the build (not polish)

- **#16 coupled pendulums spec:** card 5 said the spring was "stretched by 40 mm" at release. Bob I is pulled right, towards II, so the spring is compressed. That one word was corrected in the spec and the entry before the build.
- **#6 spring pulses engine op:** `springPulseRace` still used the pre-revision amplitude, 0.4·vₗT/π, giving coils at 0.6/0.2. It was corrected to the final spec's 0.3·vₗT/π (coils at 0.7 in flight, 0.4 at a wall), and its audits were updated.
- **Two CSS fixes after assembly.** In each, only the selector changed, in the `sims-eval-law` copies; the API originals in `sims/` are untouched. The assembler drops any sim CSS rule whose last selector is a frozen class:
  - #2 loaded modes: `.lsm-row > .plot-box{…}` was dropped, which left the scene and ladder 0 px tall, so the hero was blank. It now targets the boxes' own classes, `.lsm-scene-box,.lsm-ladder-box`.
  - #10 end loads: `.ctrl-box.is-greyed` was dropped, so the slider box never visibly greyed for the fixed end or the free ring. It is now `#box-ratio.is-greyed`.

## Things to look at when you review

- **Deliberate departures from the shell contract:**
  - #12 side branch: the pressure strip stays inside the main canvas, lined up with the pipe, because the spec reads them as one picture.
  - #2 loaded modes and #15 loudspeaker row: the ladder and the phasor panel are fixed side bands (220 and 235 px) rather than bottom bands.
- **Sims that manage their own restarts** (`restartOnParamChange:false`): #3 ring and #7 dashpot. The shell's generic restart would undo their card set-ups.
- **#7 dashpot:** the spec says the ring height stays within 0.1 mm of I/√(τμ). The numerical scheme drifts about 0.013 mm per period, so the claim holds for about 8 periods, and the audit checks it over 5.
- **Many sims boot playing,** because no card tells the student to press Play: #2, #5 and others. Cards that ask what happens "when play is pressed" open paused (#3, cards 1 and 4).
- **Controls Guide tours:** most sims veil readout panels and insets that sit in the hero instead of hiding them, so the hero does not resize mid-tour.
