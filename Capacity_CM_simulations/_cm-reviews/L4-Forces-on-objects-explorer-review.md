# Forces on Objects Explorer
**Lecture 4 · L4-Forces on objects explorer.html**

**System:** Draggable-force sandbox — block on a frictionless table (top view) and on an incline (side view); acceleration is set by the vector sum a = ΣF/m, with a labelled ⚠ "biggest-force" counterfactual ghost.
**Verdict:** Models correctly and works. Every canonical relation checked (flat ΣF, a‖F_net, incline a=g·sinθ mass-independence, static threshold tanθ>μ, kinetic a=g(sinθ−μcosθ)) matches on screen and in `window.__audit`. No physics defects found. Only non-physics polish (label crowding when the block sits in a canvas corner / at steep θ).
**Browser-probe:** Ran, `errors: []`, 8 sweep states + 8 hand-driven incline states (mass/θ/friction). All readouts and audit values correct.

## PHYSICS

### P0
none.

### P1
none.

### P2
- [low] Ghost "biggest-force" model on the incline (`biggestInc`, line 827) includes gravity `mg` and the (possibly zero) normal `N` among the candidates, so the ghost block's chosen "biggest force" is usually plain gravity `mg` straight down — it free-falls through the ramp rather than illustrating "follows the biggest *applied* force." It is clearly labelled ⚠ and confined to `state.mode==='naive'`, so it never leaks into the correct model; the flat-scene ghost (`biggestFlat`, applied-forces-only) is the cleaner teaching contrast. → **Fix (optional):** consider restricting the incline ghost's candidate set to applied forces + along-slope gravity component, so the counterfactual stays "biggest force wins" rather than degenerating to free-fall. Not a bug.

## NON-PHYSICS

### P0
none.

### P1
- [ux][med] **Force/readout label crowding at extremes.** When the block sits near the top-right corner of the incline canvas (steep θ, e.g. θ=40–60°, block placed at the top of the ramp), the labels `N=mg·cosθ`, `m=… kg`, `f=μN`, `mg·sinθ`, `F_net … ↓slope`, `a=… m/s²` and `mg` all stack in the same corner and overlap despite the `label()` collision-avoidance (which only shifts *down* up to 6 iterations, `label`, lines 872–881). Same clustering appears on the flat scene when the block wraps into a corner (mass-min screenshot). Physics values stay correct; it's a readability problem. → **Fix:** give `label()` an up/left fallback direction (not only "shift down"), or anchor the force-component labels to the arrow midpoints with a leader offset away from the block, and/or nudge the incline block's rest position away from the extreme corner. [evidence: inc-fric-theta40.png, inc-theta60.png, mass-min-0.5 screenshot]

### P2
- [ux][low] On the incline the `mg·cosθ = … N` label near the floor can slightly overlap the block's dashed mg-component / floor hatch at shallow θ. [evidence: inc-fric-theta10.png]
- [pedagogy][low] The default flat-scene third force is labelled `F₃ ≈ 2.2 N` in prose but the canvas reads `F₃ = 2.24 N`; the intro text rounds to 2.2 while the arrow shows 2.24 — harmless, but a student comparing the two may pause. [evidence: initial.png]

## Browser-test evidence
- Flat, mass sweep 0.5 / 2.75 / 5 kg → `|F_net|` constant 4.24 N; `|a|` = 8.485 / 1.543 / 0.849 m/s² = 4.24/m exactly. a‖F_net at 45°, not along the 5 N force. (screenshots: initial.png, after-play.png, mass-min-0.5.png; probe.json)
- Flat F_net construction: (5,0)+(0,4)+(−2,−1) → (3,3), |F_net|=4.24264 N at 45° — matches `node` check and on-screen violet arrow. (after-play.png)
- Incline θ=30°, mass 0.5 / 2 / 5 kg → `|a|` = 4.905 m/s² for **all three** = g·sin30°; `|F_net|` scales 2.45 / 9.81 / 24.53 N. Mass-independence of the slide rate confirmed on screen. (inc-theta30-m5.png; hand-driven probe)
- Incline θ=0° → a=0, mg·sinθ=0, N=mg=19.62 N (flat floor). θ=60° → a=8.496=g·sin60°, F_net=16.99 N. No blow-up at extremes. (inc-theta60.png)
- Friction θ=10° (< threshold 16.70°) → static hold: f=3.41 N up-slope = mg·sinθ, F_net=0, a=0, block sticks. (inc-fric-theta10.png)
- Friction θ=40° (> threshold) → slides: f=μN=4.51 N, F_net=8.10 N, a=4.051 m/s² = g(sin40°−0.30·cos40°). Matches `node` check. (inc-fric-theta40.png)
- `window.__audit.at()` returns netForceMag, accelMag, normalForce=mg·cosθ, gravityAlongSlope=mg·sinθ; every value matched the analytic figure across all states. Integrator is semi-implicit Euler (`v+=a·dt; x+=v·dt`, `physics`, lines 1072–1092) — fine for this bounded sandbox; ÷0 guarded by `Math.max(Math.sin(th),1e-4)` in `geo` and `N<0⇒N=0` lift guard in `incNetOn`.

## To verify (human)
- Drive the sim and drag a force by hand to confirm the live `formalLive` readout and the a‖F_net invariant hold for arbitrary user-added forces (probe only exercised the default force set).
- Confirm the "+ Force, drag up-slope to hold still" task lands on exactly mg·sinθ via the snap-assist (`updateDrag`, lines 963–965, snaps within 0.16 N of ±mg·sinθ) — the snap tolerance is a pedagogy choice worth a human eye.
- Judge whether the corner label-crowding (P1) is acceptable for the intended screen size or warrants the leader-line fix.
