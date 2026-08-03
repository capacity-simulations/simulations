# Follow-up fix prompt (round 2) — Free-Body Diagram Builder

> Paste into Cursor with `Capacity_CM_simulations/Free-Body Diagram Builder.html` open.
> Round 1 (`Free-Body-Diagram-Builder-fix-prompt.md`) is verified good: 0 console errors,
> loop running, all 13 fixes present, incline/orbit/grader all correct. Two defects remain,
> both introduced or carried over by round 1.

**DO NOT CHANGE anything else.** In particular leave alone: `solutionFor` (verified correct —
incline normal at `90−θ`, orbit `Fc = mω²r`), `gradeDiagram` (all three previously-passing bad
diagrams now correctly rejected, all 7 correct diagrams still accepted), the `state.gradeOk`
gating, `closeEditor`, and the `atan2(n.fy, n.fx)` readout.

---

## FIX A — [P0] `#shell-reset` hides the whole builder and there is no way back

Round 1's `closeEditor()` fix made `resetAll()` run to completion for the first time — which
newly executes the two lines that re-arm the guided inquiry:

```js
state.inquiryActive = (Shell.totalSteps>0);   // L1772
state.inquiryStep = 0;                        // L1773
```

`syncPanels()` then calls `panelVis(0)`, which hides the scenario select, the parameters panel,
the Forces panel and Commit. But the Shell's reset handler (L618) only calls
`onReset(); setPlaying(true);` — it never calls `inqShow(0)`, so `Shell.step` stays where it was
(4, in the default lecture mode) while `state.inquiryStep` is forced to 0. The two disagree.

Measured after clicking `#shell-reset`: `#scenario` 0×0, `#panel-params` `display:none`,
`#panel-forces` `display:none`, `#btn-commit` `display:none`, `#inq-cards` 0×0 (still
`inquiry-collapsed`). Only the Frame Declaration panel survives. Moving a slider restores
nothing. In the default lecture mode the inquiry cards are collapsed too, so **there is no
recovery short of a page reload**.

Reset should reproduce the state a fresh boot produces at the current stepper position. Replace
those two lines with:

```js
const lecture = document.getElementById('shell').classList.contains('lecture-mode');
state.inquiryStep  = Shell.step;
state.inquiryActive = (Shell.totalSteps>0) && !lecture && Shell.step < 4;
```

This mirrors exactly what `onStep(i)` would set for the current step (it sets
`inquiryActive=false` for `i>=4`, and lecture mode jumps to the last card), so the panels stay
revealed in lecture mode and follow the stepper otherwise. `Shell.step` and `Shell.totalSteps`
are both already exposed getters — no Shell change needed.

---

## FIX B — [P1] `pxPerN()`'s 5 N floor makes low-force diagrams draw as stubs

Round 1 rewrote `pxPerN()` to scale to the largest force in play, but kept the original 5 N
floor as the seed:

```js
let ref = 5;
```

Any diagram whose largest force is under 5 N therefore cannot fill the 90 px budget. Measured:

| scenario | largest force | drawn length |
|---|---|---|
| orbit, m=10, ω=3 | 180 N | 90.0 px ✓ |
| block, m=10 | 98 N | 90.0 px ✓ |
| block, m=0.5 | 4.9 N | 88.2 px ✓ |
| orbit, m=2, ω=0.2 | 0.16 N | 2.9 px → clamped to 6 px ✗ |
| **orbit, m=0.5, ω=0.2** | **0.04 N** | **0.72 px → clamped to 6 px ✗** |

The `Math.max(6, …)` clamp in `drawArrow` L1009 stops it going sub-pixel, but the arrow is a
stub rather than the intended ~90 px. The floor only exists to avoid dividing by zero when
every magnitude is 0, so shrink it to an epsilon:

```js
function pxPerN(){
  let ref = 0;
  for(const f of state.arrows) ref = Math.max(ref, f.mag);
  const sol = solutionFor(state.scenario, state.frame);
  if(sol) for(const r of sol.required) ref = Math.max(ref, r.mag||0);
  return 90/Math.max(ref, 1e-3);
}
```

---

## ACCEPTANCE

1. **Reset in lecture mode (default):** build 2 arrows, commit, click `#shell-reset`. Arrows
   clear, readouts blank to "—", and `#scenario`, `#panel-params`, `#panel-forces`,
   `#btn-commit` all remain **visible and usable**. Building and committing a fresh diagram
   works immediately, with no page reload.
2. **Reset with lecture mode off:** the builder follows the stepper — panels visible at the
   step the inquiry is actually on, and `state.inquiryStep === Shell.step`.
3. **Scaling:** the largest arrow measures ~90 px in every case, including orbit at m=0.5,
   ω=0.2 (0.04 N) and orbit at m=2, ω=0.2 (0.16 N). Nothing sub-pixel.
4. **Regression — all must still hold:** zero console errors; `state.time` grows; 4 KaTeX
   equations render; 5 inquiry dots; incline θ=30 → normal dir 60°, `a = 4.90 m/s²`
   mass-independent, `F_net` dir −30°; orbit magnitudes 0.16/4.00/36.00 N at ω=0.2/1.0/3.0
   (m=2) with inertial `a = ω²r` (**2.00 m/s²** at ω=1, r=2); the three bad diagrams (wrong
   agents / duplicate gravity / 200 N friction) still rejected; all 7 correct diagrams still
   accepted; gravity-only commit still leaves readouts at "—" with `simAnim === null`; banner
   still clears on a slider change; no NaN or Infinity at any slider extreme.

---

### Correction to round 1's acceptance list

Item 4 of the round-1 prompt said the orbit's inertial acceleration should be "4.00 m/s² at
ω=1". That number was wrong — 4.00 N is the *force* (`m ω² r = 2·1·2`); the acceleration is
`a = ω² r = 2.00 m/s²`. The sim prints 2.00 and is correct. No code change needed.
