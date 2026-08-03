# Orbits — the four conic sections
**Lecture 35 · L35-Orbits.html**

**System:** Single-parameter conic family at fixed angular momentum — semi-latus rectum `p = 1.5` held constant, eccentricity `e` (0 → 2.2) drives the shape through circle → ellipse → parabola → hyperbola, with specific energy `ε = GM(e²−1)/(2p)` changing sign at `e = 1`. Newly upgraded from a 2-D canvas to a three.js 3-D scene.
**Verdict:** **The physics is exact.** Energy, angular momentum, periapsis distance and Kepler III all verified numerically against closed form to ≤0.03%, at every eccentricity tested. All three inquiry answers are correct. One genuine physics defect remains — a hard `r > 60` cutoff that labels high-e *bound* ellipses as escaping to infinity — plus a newly introduced CDN dependency.
**Browser-probe:** Ran (5 states, 1 slider, `errors: []`). Bundled sweep can't validate this sim (no `window.__audit`, readouts not in the shell's selectors), so four custom probes were written: a per-animation-frame trajectory sampler hooked into the three.js body mesh, a conserved-quantity analysis, a true period-to-period Kepler III measurement, and a long-run escape-flag test. Reviewed against md5 `f768be55…`, confirmed unchanged start to finish.

## PHYSICS
### P0
none

### P1
- [high] **Bound orbits are declared to escape to infinity.** `step()` L697 sets `state.escaped = true` at a hard `r > 60`, after which `draw()` L1082 prints **"→ ∞"** and `render3d()` L920 hides the body (`bodyMesh.visible = !state.escaped`). But `r > 60` is not an escape criterion — `ε > 0` is. At **e = 0.98**, a reachable slider value (the snap zone is only `|e−1| < 0.02`), the orbit is a bound ellipse: `ε = −0.0132`, `a = 37.9`, `r_apo = p/(1−e) = 75`. Confirmed live: at t = 82.9 s the body vanished at exactly r = 60.00 while the panel still read **ε = −0.013, sign negative, conic ellipse** and the badge read **"ellipse"**. The sim contradicts itself on its own central claim — the e↔ε↔boundedness correspondence. → **Fix:** gate the escape indicator on `state.eps > 0` (optionally `&& r > 60`), never on `r` alone. For bound-but-huge ellipses either let them run off-screen or auto-rescale the view. [evidence: `e098_escaped.png`, `e098.log`]

### P2
- [med] **The `r > 60` cutoff also silently truncates legitimate bound orbits.** Independently of the mislabel, integration *stops* (`if (state.escaped) return;`, L668), so a bound orbit at e = 0.98 freezes forever and never returns to periapsis. Any e in (0.975, 0.98] is affected. → **Fix:** same as above — don't stop integrating a negative-energy orbit.
- [low] **The snap zone hides the most interesting regime.** `SNAP_e = 0.02` snaps any `e ∈ (0.98, 1.02)` to exactly 1, which is what makes the parabola reachable (good), but it also makes the near-parabolic cases — `e = 0.99` (very long-period ellipse) and `e = 1.01` (barely unbound hyperbola) — unreachable. That is precisely where the ε sign change is most instructive. → **Fix:** narrow the snap window, or add explicit "e = 0.99 / 1.01" presets alongside the existing four.

## NON-PHYSICS
### P0
none

### P1
- [functional][high] **The 3-D upgrade re-introduced a CDN dependency that was just removed elsewhere.** L9 now loads `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. A vendored copy of the identical version already exists in this folder at `vendor/three.r128.min.js` (added when fixing the same defect in L30-Coriolis on a Rotating Sphere). Offline or behind a school firewall the 3-D scene cannot load. → **Fix:** one line — `<script src="vendor/three.r128.min.js"></script>`. Also bound the KaTeX guard so the Formal panel degrades to plain text rather than retrying forever.

### P2
- [ux][low] **Opens in Lecture mode**, collapsing the guided inquiry to a header strip — consistent with the other CM sims, but this sim's teaching content is the 3-step inquiry. Product decision; flagged, not a bug.
- [ux][low] **No indication when the orbit exceeds the viewport.** The view is fixed at ~±13 world units (`maxExtent = 12`), so every orbit with `e ≳ 0.88` has its apoapsis off-screen with no cue. → **Fix:** auto-fit the view to `r_apo` for bound orbits, or show an "orbit extends beyond view" hint.

## Browser-test evidence
- **Conserved quantities, sampled per animation frame from the 3-D body mesh** (`bodyMesh.position = (x, 0, −y)`), velocities by central difference:

  | e | ε measured | ε exact | err | h measured | h exact | err |
  |---|---|---|---|---|---|---|
  | 0 | −0.3334 | −0.3333 | −0.01% | 1.22468 | 1.22474 | −0.005% |
  | 0.3 | −0.3033 | −0.3033 | 0.00% | 1.22471 | 1.22474 | −0.003% |
  | 0.6 | −0.2133 | −0.2133 | 0.00% | 1.22474 | 1.22474 | −0.001% |
  | 0.9 | −0.0633 | −0.0633 | 0.02% | 1.22474 | 1.22474 | 0.000% |
  | 1.0 | 0.0000 | 0.0000 | — | 1.22474 | 1.22474 | 0.000% |
  | 1.5 | +0.4167 | +0.4167 | 0.01% | 1.22474 | 1.22474 | 0.000% |
  | 2.0 | +1.0001 | +1.0000 | 0.01% | 1.22474 | 1.22474 | 0.000% |

  `h` is constant at `√(GM·p) = 1.22474` across the *entire* family — the sim's central design premise (fixed angular momentum, varying e) holds numerically to 5 significant figures. `ε` is exactly `GM(e²−1)/(2p)` and passes through zero at e = 1.
- **Kepler III**, measured between successive 2π angle crossings (true integer orbits, not a time-average): e=0 → 11.5430 vs 11.5429 (0.000%); e=0.3 → 13.2972 vs 13.2970 (0.001%); e=0.6 → 22.5454 vs 22.5448 (0.003%). Per-orbit repeatability better than 0.01%.
- **Analytic cross-check of the seeding.** `v₀ = √(GM/p)(1+e)` at `r₀ = p/(1+e)` gives `v₀²/2 − GM/r₀ = (GM/p)(1+e)[(1+e)/2 − 1] = GM(e²−1)/(2p)` — exactly the `derive()` expression at L636. Measured `r_min` matched `p/(1+e)` at every e (e.g. 0.9380 vs 0.9375 at e=0.6).
- **Integrator.** Velocity Verlet, `onFrame` sub-steps 6×. Because `p` is fixed, `r_peri ≥ p/3.2 = 0.47` and `v_peri ≤ 2.61` at the slider maximum — no periapsis singularity anywhere in range, and ~4000 steps per orbit at 1×. No energy drift observed.
- **Escape mislabel**, e = 0.98 at 4×: body hidden at t = 82.9 s, r = 60.00, while readouts held at ε = −0.013 / negative / ellipse throughout. Predicted 83 s from Kepler's equation (`M = E − e sin E` at r = 60) before running. (`e098_escaped.png`)
- **Inquiry answers all correct**: "orbit stretches out, then eventually stops closing" / "ε = 0 exactly" at the parabola / "No — ε > 0 is always unbound".
- **No console errors** in any run, including the new 3-D scene, slider sweeps, presets and speed changes.
- **Physics untouched by the 3-D upgrade**: `accel`, `step`, `seed`, `derive`, `classifyConic`, `onFrame` are byte-identical to HEAD. The stale-ε readout that existed at HEAD (`applyParams` called `updateReadouts()` before `seed()`) is already fixed in the working tree.

## To verify (human)
- Confirm the 3-D camera controls (drag-to-orbit, scroll-to-zoom) behave across the conic range — I validated the trajectory numerically but did not exercise the new camera interaction.
- Decide whether the `r > 60` cutoff should auto-rescale the view instead of freezing: at e = 0.98 the apoapsis (75) is ~6× the visible half-extent (~13), so even fixing the label leaves the orbit invisible.
- Whether reaching the escape state should take 83 s at maximum speed — that is a long time for a lecture, and it is the only way to see the e→1 limit behave.
