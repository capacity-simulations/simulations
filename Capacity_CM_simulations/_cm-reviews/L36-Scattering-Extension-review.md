# Review — L36-Scattering Extension

**System:** Rutherford scattering — a unit-mass particle fired past a fixed repulsive Coulomb centre `V(r)=k/r` (k=m=1); the student reads the deflection angle ψ off b and v and tests `tan(ψ/2)=k/(m b v²)`, then probes the b→0 limit.
**Verdict:** Force law, integrator and orbit equation are correct, but the sim's **central quantitative claim is systematically false** — it launches at a finite radius and treats the launch speed as the asymptotic speed, so `tan(ψ/2)` falls short of `1/(bv²)` by 12 % at v=1 and **43 % at v=0.4**. A redundant head-on special case adds a 21 % discontinuity in r_min and a physically dishonest animation. Works mechanically; no console errors.
**Browser-probe:** ran — `browser-probe.mjs` 8 states, **0 js-errors**, 2 sliders; plus a scripted driver session (7 experiments, 14 screenshots, 0 console errors) that fired spreads, bracketed the head-on branch boundary, and pixel-tracked the particle for a full flight.

---

## PHYSICS

### P0

- **[high] The slider `v` is the speed at r=7.5, but every formula, table column and prediction treats it as v∞ — the sim's headline relation is off by a v-dependent factor.** `fireShot`/`simulateFull` (L734, L789–790) launch at `x = WORLD.xMin+0.5 = −7.5`, `y=b`, `vx=v`, so `E = ½mv² + k/r₀` and the true asymptotic speed is `v∞ = √(v² + 2k/(m r₀))`, with `b∞ = bv/v∞`. Canonical Rutherford `tan(ψ/2) = k/(m b∞ v∞²)`; the table (L856–857) prints `1/(|b|v²)` against it. Measured ratio `|tan(ψ/2)| ÷ 1/(bv²)`: **0.57 at v=0.4, 0.88 at v=1.0, 0.94–0.98 at v=2.5** — and it is not even a constant slope, so the "plot one against the other, slope = k" exercise (L444, L461) fails. Step 3 asks the student to extract "what quantitative pattern the numbers follow" from exactly these numbers. → **Fix:** launch and terminate where the motion really is asymptotic — `r₀ = max(400, 400·k/(m v²))`, integrate from `x=−r₀`, terminate at `r>r₀`, and draw only the segment inside `WORLD`. Verified: ratio → 0.9950 (v=1) and 0.9992 (v=2.5). At v=0.4 even `r₀=200` only reaches 0.970, hence the `k/v²` scaling. Cheaper alternative if the launch point must stay at −7.5: compute `v∞`, `b∞` from the conserved `E=½mv₀²+k/r₀`, `L=m b v₀` and label the table columns with those, not with the raw slider values. [evidence: `drv-spread.png`, `drv-spread-v25.png`; independent RK4 reproduction in `check.mjs`/`check2.mjs`]

- **[high] r_min jumps 21 % at b = 0.02 — the two branches use contradictory definitions of v.** `fireShot` L747–751 and `simulateFull` L798–799 switch to an analytic branch for `|b|<0.02` with `rminAnalytic = 2k/(mv²) = 2.00`, which is `k/E` for `E=½mv²` (asymptotic v). The RK4 branch one slider notch away has `E = 0.6333` and gives **1.579**. Observed: b=0.01 → r_min 2.00, b=0.02 → r_min 1.58; ψ jumps 2.6°; flight time jumps 72 %. Canonically `r_min` is continuous in b (`E = k/r + L²/2mr²` ⇒ dr_min/db ~ 2×10⁻⁵ here). This lands squarely on the step-4 teaching point, whose feedback text names `r_min = 2k/(mv²)` (L1251). → **Fix:** **delete the head-on special case entirely** (L746–752, L797–817, and the `a.headOn` branch L1058–1097). There is no singularity to protect against: repulsive head-on motion turns around at `r_min = k/E > 0`, never at r=0. Verified plain RK4 at *exactly* b=0: ψ = 180.000°, r_min matches `k/E` to 5 d.p., relative energy drift 6×10⁻¹³. The "E1 animation honesty / head-on handled analytically" claims (L284, L1251) then become true rather than aspirational. [evidence: `drv-headon-b0.png` vs `drv-headon-b0.02.png`]

- **[high] The head-on animation shows constant speed, an instant reversal, and a departure 2.36× faster than the approach — the exact opposite of what step 4 teaches.** `stepActive` L1058–1097 interpolates `x` **linearly in time** (`frac = _t/totalTime`, L1064), splitting a fixed `totalTime` 50/50 between an approach of length 5.5 and a departure of length 13. It also asserts `a.vx = ±a.v0` (L1070, L1076) while the drawn motion is at 0.28·v₀. Pixel-tracking the particle over a full 34.8 s flight: inbound `dx/dt = 0.282` world-units/s and constant to 3 d.p. *including at closest approach*; outbound `−0.667`, ratio 2.36 = 13/5.5. Energy conservation requires `ṙ = ±√(2(E−k/r)/m)` → speed → **0** at r_min, and time-symmetry about it. Step 4's own answer text says the particle "runs out of kinetic energy at r_min and reverses" (L1252) — the animation contradicts the sentence. → **Fix:** same as above — drop the branch and let the adaptive RK4 run; it reproduces the deceleration for free. [evidence: `drv-headon-anim-1..4.png`, 136-sample position trace]

### P1

- **[high] ψ is read at r=12, not asymptotically, adding a second b-dependent bias on top of the P0 one.** `simulateFull` L839 / `stepActive` L1123 stop at `r>12` and take `psi = atan2(vy,vx)` (L843, L1125). Residual bending beyond r=12 is not negligible at low v: at v=0.4, b=2.5 the recorded 108.98° vs the true asymptotic 114.55° for that (E,L) — a 5.6° deficit, and it drifts with b (ratio 0.884→0.858 across the spread at v=1), which is what turns the P0 offset from a clean slope into a curved relation. → **Fix:** subsumed by the P0 fix (terminate at `r>r₀` with `r₀ = max(400, 400k/(mv²))`).

- **[med] The v slider bottom (0.4) is outside the physically displayable range.** With v as a true asymptotic speed, head-on `r_min = 2k/(mv²) = 12.5` at v=0.4 — nearly 4× the plot half-height and outside the ±8 x-range, so after the P0 fix the low-v trajectories would not fit `WORLD` at all. Already visible pre-fix: at v=0.4 the launch potential energy `V(7.5)=0.133` is **67 % larger than the launch kinetic energy** 0.08, so "Initial speed v" is badly misnamed there. → **Fix:** raise `min` on `#v-slider` (L408) to ~0.6 (`2k/(mv²) < 6`) and relabel it "asymptotic speed v∞" alongside the P0 fix.

- **[med] `state.dragging` (L672) is dead — a second module-level `dragging` (L1141) is the real flag.** Harmless today but the two will diverge on the next edit. → **Fix:** delete `state.dragging`.

### P2

- **[high] The `simulateFull` head-on branch (L798–817) is unreachable** — `fireSpread` only uses b ∈ [0.2 … 2.5] (L761). It also plots points at uniform Δr=0.05 spacing, i.e. the same constant-speed dishonesty as the animated branch, if it ever were reached. → **Fix:** removed by the P0 head-on fix.
- **[med] The aim line is drawn at the *current* `state.b` (L931), not the fired `b0`** — moving the slider mid-flight makes the blue line jump away from the yellow track it launched. → **Fix:** draw at `state.active ? state.active.b0 : state.b` while a shot is in flight.
- **[low] `eq-hyp` (L1262) `r = a(e²−1)/(−1+e cosθ)` is the correct repulsive far-branch form** — no change; recorded so it isn't re-flagged.

---

## NON-PHYSICS

### P0

- **[pedagogy][high] The sim boots into lecture mode, which jumps to inquiry card 4 and paints the grey `naive "contact" path (wrong)` overlay on load — with the card that explains it collapsed out of sight.** L1309 auto-clicks `#shell-lecture`; `setLectureMode` (L536) calls `inqShow(cards.length-1)` → `Shell.step === 3`, which is exactly the condition `drawAll` L916 uses to draw the overlay. A student's first view is a line labelled "(wrong)" with no counterpart and no explanation, and it persists behind every subsequent shot; at b=3 it is a long diagonal across the whole plot, and at b=0 it lies on top of the aim line and the x-axis, indistinguishable. → **Fix:** gate the overlay on the card being *visible*, not on the step index — `if(Shell.step===3 && !root.classList.contains('inquiry-collapsed'))` — or have `setLectureMode(true)` land on step 0. [evidence: `drv-initial.png`, `drv-slowshot.png`]

### P1

- **[ux][high] A single shot takes 20–35 s of real time with no way to speed it up.** `safeDt` caps `dt` at 0.02 (L777) ≈ one RK4 step per animation frame, so sim time ≈ wall time; the path is ~20 world units. Measured: 20.2 s at v=1, **33.3 s at v=0.4/b=3**, 34.7 s head-on. The Speed `<select>` is `aria-hidden` with a single `1×` option (L302–304) and the shell's `speed` multiplier is therefore pinned. Meanwhile `Fire spread of b` returns 7 shots instantly via `simulateFull`, so the two paths differ by ~30 s per shot. → **Fix:** restore 1×/2×/5× options on `#shell-speed`, or raise the `safeDt` far-field cap to ~0.1 (RK4 energy drift stays ≲1e-12 at these radii).
- **[ux][med] The last ~16 % of each flight happens off-canvas — the sim looks frozen before the answer appears.** Shots terminate at `r>12` / `x<−12` but the visible plot half-width is ≈8.7 world units, so the particle vanishes for ~5.5 s while readouts still show `—`. → **Fix:** finalize ψ as soon as the outgoing direction has converged (e.g. `Δψ < 0.1°` over a step) rather than at a fixed radius, and show a "resolving…" state.
- **[ux][med] The Results table is unreadable in the default right rail** — six columns in a ~250 px panel wrap values mid-number (`2.\n50`, `37.\n9`) and only ~2.5 of 7 rows are visible without scrolling, in the one panel the student is told to read the pattern from (L444). → **Fix:** drop the `#` column, right-align numerics with `font-variant-numeric: tabular-nums`, and give `.results-scroll` a taller `max-height`. [evidence: `drv-spread.png`]
- **[pedagogy][med] `onReset` auto-fires a shot (L1293), which calls `Shell.stepReady()` (L1093/L1133) and silently satisfies step 1's gate** — the card says "A shot must be completed before you can continue" (L340) but the student never fires one. → **Fix:** have the auto-fired demo shot skip `stepReady()` (pass a flag through `fireShot`).

### P2

- **[functional][high] No `window.__audit` hook and readouts don't use the shell's `.shell-readout` class** (they use `.stat-value`, L429–430), so the standard probe returns `readouts: []` and `audit: null` for all 8 states — the sim is untestable by the harness. → **Fix:** expose `window.__audit = () => ({b, v, psi, rmin, tanHalf, invBV2})`.
- **[ux][med] The plot is badly framed** — with `WORLD.xMin=−8` the incoming leg and the whole interaction sit left of centre and the outgoing legs exit the *top* of the canvas, leaving the entire right half empty. → **Fix:** shift the view so the centre sits at x≈−2, or widen `WORLD.yMax`.
- **[ux][low] Past tracks are all identical grey with no per-track b label**, so a fired spread is 7 indistinguishable curves the student must match to table rows by eye. → **Fix:** label each track with its b at the exit point, or shade by b.
- **[ux][low] `#b-slider` `step="0.01"` cannot express the interior of the `|b|<0.02` head-on window**, and canvas dragging is limited to ~0.014 in b by integer `clientY`. Moot once the head-on branch is deleted.
- **[pedagogy][low] The `b` slider and drag are clamped to `[0,3]` (`pickB`, L1144)** while the L257 polish note still describes "signed b" and the table headers still carry the `|·|` bars that only signed b needed. → **Fix:** drop the absolute-value bars from the headers (L440) now that b ≥ 0.

---

## Browser-test evidence

| state | observed | expected |
|---|---|---|
| load, lecture mode (`drv-initial.png`) | grey dashed `naive "contact" path (wrong)` drawn, inquiry collapsed | no unexplained "wrong" overlay on first view |
| spread, v=1 (`drv-spread.png`) | ψ=154.5/131.3/103.1/82.7/60.5/46.9/37.9° for b=0.2…2.5; tan(ψ/2)÷1/(bv²) = 0.884→0.858 | ratio ≡ k = 1.000 |
| spread, v=2.5 (`drv-spread-v25.png`) | ratio 0.979→0.938 | 1.000 |
| spread, v=0.4 (`drv-spread-v04.png`) | ratio 0.569→0.560 | 1.000 |
| b=0.01, v=1 (`drv-headon-b0.01.png`) | ψ=180.0°, r_min=**2.00**, 34.7 s | continuous with neighbours |
| b=0.02, v=1 (`drv-headon-b0.02.png`) | ψ=177.4°, r_min=**1.58**, 20.2 s | r_min ≈ 2.00 ± 2e-5 |
| head-on flight, 136 samples (`drv-headon-anim-1..4.png`) | inbound speed 0.282 const *through* closest approach; instant reversal; outbound 0.667 | speed → 0 at r_min, symmetric in/out |
| v=0.4, b=3 (`drv-slowshot.png`) | 33.3 s to first readout; particle 1/13 across plot at t=5 s | interactive timescale |
| all sessions | **0 console errors**, KaTeX renders, no NaN/blank canvas | — |

Independent verification: `check.mjs` / `check2.mjs` reimplement `accelAt`+`safeDt`+RK4 and reproduce every browser number to ≤0.01°, and confirm the integrator itself is sound (relative energy drift 1e-13 over a full flight; `r_min` matches the analytic root of `E=k/r+L²/2mr²` to 4 d.p.). The errors above are **model/convention errors, not integrator errors**.

## To verify (human)

- Confirm the intended reading of the `v` slider: asymptotic speed (my assumption, matching every on-screen formula) vs. launch speed. If the latter is intended, the fix is to relabel the formulas and table rather than to move the launch point — but then `r_min = 2k/(mv²)` in the Formal panel and step-4 feedback is also wrong and must change to `k/(½mv² + k/r₀)`.
- Whether `WORLD` should be rescaled per-shot once v is asymptotic (head-on `r_min = 2k/(mv²)` spans 0.32 → 12.5 over the current slider range — a factor of 39 in the natural plot scale).
- Whether "Fire spread of b" should animate rather than resolve instantly, once single-shot timing is fixed.
