# Fix prompt — L36-Scattering Extension.html

> Paste into Cursor with `Capacity_CM_simulations/L36-Scattering Extension.html` open.
> Companion review: `_cm-reviews/L36-Scattering-Extension-review.md`.

---

You are fixing `Capacity_CM_simulations/L36-Scattering Extension.html`, a Rutherford-scattering
teaching sim (repulsive Coulomb `V(r) = k/r`, natural units `k = m = 1`). A physics review found
three P0 model errors, several P1s and a set of P2 polish items. Fix all of them.

**Do not change:** the force law `accelAt` (L780–786 — it is correct: `a = +k r̂/r²`), the RK4
integrator arithmetic, the shell/inquiry framework, the visual style, or the four-step guided-inquiry
structure. Everything below is a correction to the *model conventions*, the *animation*, and the *UI* —
the physics that is right must stay right.

## The one convention decision (everything follows from it)

The sim currently launches a particle at `x = WORLD.xMin + 0.5 = −7.5` with speed exactly `v`, but
every on-screen formula (`tan(ψ/2) = k/(mbv²)`, `r_min = 2k/(mv²)`), the results table, and all three
prediction-feedback texts are the **asymptotic** relations. At r = 7.5 the potential energy `k/r = 0.133`
is not negligible, so the launch speed is *not* `v∞`. That single mismatch is the root of P0-1 and P0-2.

**Decision: `b` and `v` mean the asymptotic impact parameter and asymptotic speed** — the values a
scattering experiment actually quotes, and the ones every formula in the file already assumes. So the
launch state must be built to *have* those asymptotic values, rather than being declared to have them.

---

# FIX 1 — [P0] Launch on the true incoming asymptote (replaces `simulateFull` + `fireShot` setup)

Currently `fireShot` (L731–756) and `simulateFull` (L788–845) duplicate the RK4 loop and both launch at
`x = −7.5, y = b, vx = v, vy = 0`. Replace both with **one** trajectory function that is the single
source of truth for a shot, and give it an exact analytic launch state.

For a repulsive `k/r` orbit with `m = 1`, asymptotic impact parameter `b ≥ 0` and asymptotic speed `v`:

```
E   = v²/2                      L_z = −b·v          (negative for b > 0: motion is clockwise)
e   = √(1 + (b v²/k)²)          p   = (b v)²/k
r_min = k(1 + e)/(m v²)         ← algebraically identical to p/(e−1) but stable at b = 0,
                                  where it reduces to the familiar 2k/(mv²)
tan(ψ/2) = k/(m b v²)
```

Add these, replacing `safeDt` (L774–778) and `simulateFull` (L788–845) entirely:

```js
const R_FAR_MIN = 80;    // launch/terminate radius: far enough that v,b are asymptotic
const SHOT_SECONDS = 7;  // wall-clock seconds to play the visible part of one shot at 1x

// Closed-form orbit parameters for the repulsive hyperbola (m = MASS, k = K).
function orbitParams(b, v){
  const l = Math.abs(b) * v;                          // |L_z|
  const e = Math.sqrt(1 + (b*b*v*v*v*v)/(K*K));       // eccentricity
  const p = l*l/K;                                    // semi-latus rectum
  const rmin = K*(1 + e)/(MASS*v*v);                  // == p/(e-1); finite and correct at b = 0
  const psi = 2*Math.atan(K/(MASS*Math.max(l,1e-12)*v)); // analytic ψ — for __audit cross-check ONLY,
  return { l, e, p, rmin, psi };                         // never displayed (the sim must MEASURE ψ)
}

// Exact state on the INCOMING branch at radius rL, for asymptotic (b, v).
function launchState(b, v, rL){
  const { l, e, p } = orbitParams(b, v);
  if(l < 1e-9){                                        // head-on: straight down the x-axis
    return { x:-rL, y:0, vx:Math.sqrt(Math.max(0, v*v - 2*K/(MASS*rL))), vy:0 };
  }
  const thInf = Math.acos(1/e);                        // true anomaly of the asymptote
  const thL   = Math.acos(Math.min(1, (p/rL + 1)/e));  // +ve root = incoming branch
  const a     = (Math.PI - thInf) + thL;               // world polar angle, so the incoming
                                                       // asymptote is exactly the +x direction
  const rdot  = -Math.sqrt(Math.max(0, v*v - 2*K/(MASS*rL) - l*l/(rL*rL)));
  const thdot = -l/(rL*rL);
  return {
    x: rL*Math.cos(a), y: rL*Math.sin(a),
    vx: rdot*Math.cos(a) - rL*thdot*Math.sin(a),
    vy: rdot*Math.sin(a) + rL*thdot*Math.cos(a)
  };
}

function safeDt(r){ return Math.min(0.25, 0.01*Math.max(r, 0.05)); }

// THE single trajectory routine. Integrates the whole shot up front and records time per point,
// so the animation can replay it (Fix 3) instead of re-integrating in the frame loop.
function computeTrack(b, v){
  const { rmin: rminExact } = orbitParams(b, v);
  const rL = Math.max(R_FAR_MIN, 15*rminExact);
  let { x, y, vx, vy } = launchState(b, v, rL);
  const pts = [[x,y]], ts = [0];
  let t = 0, rmin = Math.hypot(x,y), steps = 0;
  while(steps < 200000){
    const r = Math.hypot(x,y);
    rmin = Math.min(rmin, r);
    const dt = safeDt(r);
    const [a1x,a1y] = accelAt(x,y);
    const k1x=vx, k1y=vy, k1vx=a1x, k1vy=a1y;
    const [a2x,a2y] = accelAt(x+0.5*dt*k1x, y+0.5*dt*k1y);
    const k2x=vx+0.5*dt*k1vx, k2y=vy+0.5*dt*k1vy, k2vx=a2x, k2vy=a2y;
    const [a3x,a3y] = accelAt(x+0.5*dt*k2x, y+0.5*dt*k2y);
    const k3x=vx+0.5*dt*k2vx, k3y=vy+0.5*dt*k2vy, k3vx=a3x, k3vy=a3y;
    const [a4x,a4y] = accelAt(x+dt*k3x, y+dt*k3y);
    const k4x=vx+dt*k3vx, k4y=vy+dt*k3vy, k4vx=a4x, k4vy=a4y;
    x  += dt*(k1x +2*k2x +2*k3x +k4x )/6;
    y  += dt*(k1y +2*k2y +2*k3y +k4y )/6;
    vx += dt*(k1vx+2*k2vx+2*k3vx+k4vx)/6;
    vy += dt*(k1vy+2*k2vy+2*k3vy+k4vy)/6;
    t += dt; steps++;
    const thresh = (Math.hypot(x,y) < 20) ? 0.03 : 1.0;  // dense near the centre, sparse far out
    const last = pts[pts.length-1];
    if(Math.hypot(x-last[0], y-last[1]) > thresh){ pts.push([x,y]); ts.push(t); }
    if(Math.hypot(x,y) > rL) break;
  }
  pts.push([x,y]); ts.push(t);
  return { pts, ts, b, v, psi: Math.abs(Math.atan2(vy,vx)), rmin, rminExact };
}
```

Then rewrite `fireShot` to build the animated shot from `computeTrack` (see Fix 3), and rewrite
`fireSpread` (L758–772) to call `computeTrack(b, v)` instead of `simulateFull(b, v)`.

**Why this and not "just launch from further away":** launching at `y = b` with velocity `+x` at *any*
finite radius still gets `E` and `L` wrong, so it only converges as `r₀ → ∞` (and needs `r₀ ≈ 1250` at
v = 0.4 to reach 0.5 %). The analytic launch sets `E` and `L` **exactly**, so `r_min` is exact at any
`r_L`; `r_L` then only has to be large enough that the *measured* outgoing direction has converged to
its asymptote. `R_FAR_MIN = 80` gives ≤ 0.033° for ~1200 RK4 steps — instantaneous.

---

# FIX 2 — [P0] Delete the head-on special case entirely

Remove:
- `p.headOn` / `p.rminAnalytic` setup in `fireShot` (L746–752)
- the `if(Math.abs(b) < 0.02)` block in `simulateFull` (L797–817) — gone with `simulateFull` itself
- the whole `if(a.headOn){ … }` branch in `stepActive` (L1058–1097)
- the `headOn` / `reversed` / `rminAnalytic` fields

**There is no singularity to protect against.** Repulsive head-on motion turns around at
`r_min = 2k/(mv²) > 0` and never reaches the origin. Plain RK4 at *exactly* b = 0 has been verified to
give `ψ = 180.000°` and `r_min` matching `2k/(mv²)` to 5 decimal places with relative energy drift
~6×10⁻¹³. The special case was the sole cause of:

- the **21 % discontinuity in r_min** at b = 0.02 (2.00 → 1.58), because the two branches disagreed
  about whether `v` was asymptotic;
- the **dishonest animation** — linear-in-time interpolation with a 50/50 time split meant the particle
  crossed closest approach at *constant* speed, reversed instantly, and departed 2.36× faster than it
  arrived, directly contradicting step 4's own answer text ("runs out of kinetic energy at r_min and
  reverses") and the Info modal's "E1 Animation honesty" claim.

Once deleted, both claims become true rather than aspirational, and `ψ = 180.000°` at b = 0 falls out of
the integrator instead of being asserted.

---

# FIX 3 — [P1] Replay the precomputed track; stop burning 20–35 s of wall-clock per shot

`stepActive` (L1054–1138) currently steps RK4 in the frame loop with `dt` capped at 0.02, so sim-time ≈
wall-time: a single shot takes 20.2 s at v = 1 and 33.3 s at v = 0.4, and the last ~16 % happens
*off-canvas* (shots terminate at r > 12; the visible half-width is ≈ 8.7) so the sim appears frozen for
~5 s before the readout appears. Meanwhile `Fire spread` returns 7 shots instantly.

Replace with playback along the precomputed `(ts, pts)`:

1. In `fireShot`, call `computeTrack(state.b, state.v)`, then find `tEnter` / `tExit` — the first and
   last sample times whose point lies inside `WORLD`. If the track never enters the box (possible only
   if `r_min` exceeds the frame), fall back to `tEnter = 0, tExit = ts[ts.length-1]`.
2. Store `a.rate = (tExit - tEnter)/SHOT_SECONDS` and start `a.tSim = tEnter`.
3. `stepActive(dtWall)` becomes `a.tSim += dtWall * a.rate`, then binary-search `ts` and **linearly
   interpolate** `pts` for the drawn position; the drawn trail is `pts` up to the current index.
4. Finish when `a.tSim >= tExit`: push the finished track, set `state.lastShotPsi = track.psi`,
   `state.lastShotRmin = track.rmin`, `updateReadouts()`, `autoRevealPanels()`, and keep the existing
   `if(Shell.step === 0) Shell.stepReady()` + 800 ms hold.

Because playback advances in *simulation* time, the physical speed profile is preserved exactly — the
particle visibly decelerates into closest approach and accelerates out, symmetrically. Only the overall
rate is scaled, which is precisely what a speed control means.

Also restore the speed control, which is currently pinned: `#shell-speed` (L302–304) has a single `1×`
option and `aria-hidden="true"`. Drop the `aria-hidden` and add `0.5×`, `1×`, `2×`, `4×` — the shell
already multiplies `onFrame`'s `dt` by `speed`, so this now works with no further wiring.

---

# FIX 4 — [P1] Raise the v-slider floor and say what b and v mean

With `v` now asymptotic, head-on `r_min = 2k/(mv²)` spans 12.5 (v = 0.4) down to 0.32 (v = 2.5) — at
v = 0.4 the turning point is far outside the ±8 plot, so the shot would be invisible.

- `#v-slider` (L408): `min="0.6"` (gives `r_min ≤ 5.56`, comfortably inside the frame); update the
  `.control-range` labels (L410) to `0.60` / `2.50`.
- Relabel the two controls to state the convention: **"Impact parameter b (far from the nucleus)"**
  (L393) and **"Incoming speed v (far from the nucleus)"** (L404).
- Info-modal *Units* row (L274): append *"b and v are the asymptotic values — measured far from the
  nucleus, where V = k/r is negligible."*

---

# FIX 5 — [P0 non-physics] Stop drawing the "wrong" overlay on load

L1309 auto-clicks `#shell-lecture` on load; `setLectureMode(true)` (L536) calls
`inqShow(cards.length-1)` → `Shell.step === 3`, which is exactly the condition `drawAll` L916 tests
before painting the grey dashed `naive "contact" path (wrong)`. So the **first thing a student sees** is
a line labelled "(wrong)" — with the step-4 card that explains it collapsed out of sight. It then
persists behind every shot; at b = 3 it is a long diagonal across the whole plot, and at b = 0 it lies
on top of the aim line and the x-axis, indistinguishable.

Gate the overlay on the explaining card actually being **visible**, not on the step index (L916):

```js
if(Shell.step === 3 && !document.getElementById('shell').classList.contains('inquiry-collapsed')){
```

---

# FIX 6 — [P1/P2] Readouts, table, and the missing test hook

- **Add `window.__audit`** (currently absent, so the review harness reads `readouts: []` / `audit: null`
  for every state and the sim is untestable). Expose, after each completed shot:
  ```js
  window.__audit = () => ({
    b: state.b, v: state.v,
    psi: state.lastShotPsi, psiDeg: state.lastShotPsi==null?null:state.lastShotPsi*180/Math.PI,
    rmin: state.lastShotRmin,
    rminExact: orbitParams(state.b, state.v).rmin,
    tanHalf: state.lastShotPsi==null?null:Math.tan(state.lastShotPsi/2),
    invBV2: state.b>0 ? 1/(state.b*state.v*state.v) : null,
    shots: state.tracks.length
  });
  ```
- **Results table is unreadable** in the default right rail: six columns in ~250 px wrap values
  mid-number (`2.` / `50`, `37.` / `9`) and only ~2.5 of 7 rows are visible — in the one panel the
  student is told to read the pattern from. Drop the `#` column (L440, L858), add
  `font-variant-numeric: tabular-nums` and right-alignment to `.results-table td`, and raise
  `.results-scroll` `max-height`.
- **Drop the `|·|` bars** from the headers (L440): `b` is clamped to `[0, 3]` by `pickB` (L1144) and the
  slider, so `|tan(ψ/2)|` and `1/(|b|v²)` should read `tan(ψ/2)` and `1/(bv²)`.
- **Add `r_min` to the table** as a seventh — now sixth — column. It is already computed, it is the
  subject of step 4, and it is currently visible only for the single most recent shot.

---

# FIX 7 — [P2] Smaller items

- **Formal panel, `renderKatex` (L1261):** `r_min = k/E = 2k/(mv²)` is only the b = 0 case, but the
  readout shows `r_min` for every b. Render the general result, which the new `orbitParams` uses:
  `r_{\min} = \dfrac{k}{mv^{2}}\left(1 + e\right),\quad e = \sqrt{1 + \left(\dfrac{mbv^{2}}{k}\right)^{2}}`,
  and note it reduces to `2k/(mv²)` at b = 0. (`eq-hyp` at L1262 is already correct — leave it.)
- **Aim line follows the wrong b mid-flight** (L931): draw at
  `state.active ? state.active.b : state.b` so the blue line doesn't jump away from the yellow track it
  launched while the student moves the slider.
- **`onReset` auto-fire silently satisfies step 1's gate** (L1293 → `Shell.stepReady()` in the completion
  path): the card says "A shot must be completed before you can continue" but the student never fires
  one. Pass a flag (`fireShot({demo:true})`) that suppresses the `Shell.stepReady()` call.
- **Delete `state.dragging`** (L672) — dead; the live flag is the module-level `dragging` at L1141.
- **Label past tracks:** a fired spread is 7 identical grey curves the student must match to table rows
  by eye. Draw each track's `b` value at its exit point, or shade grey by `b`.
- **Reframe the plot** (L665): with `WORLD.xMin = −8` the entire interaction sits left of centre and the
  outgoing legs exit the *top*, leaving the right half of the canvas empty. Try
  `{xMin:-10, xMax:6, yMin:-3, yMax:9}` and check visually — the incoming beam runs along `y = b ∈ [0,3]`
  and deflects upward, so the useful region is up-and-left.
- **Update the `POLISH:` provenance comment at L257** to describe what the file now does. Its current
  claims "head-on impacts are handled analytically", "signed b" and "restricted b slider to 0..3" are
  respectively removed, already untrue, and unchanged.

---

# Acceptance tests

All figures below were produced by an independent reimplementation of the corrected model
(RK4 + `accelAt` + the analytic launch above) and should be reproduced by the fixed file.

**1. The headline relation now holds.** Fire a spread and check the last two table columns:
`tan(ψ/2) ÷ 1/(bv²)` must be **≥ 0.999 for every (b, v)** in range. Before the fix it was 0.88 at
v = 1 and **0.57 at v = 0.4** — and not even a constant slope, which is what broke the "plot one against
the other, slope = k" exercise.

| b | v | expected ψ |
|---|---|---|
| 0.2 | 1.0 | 157.38° |
| 1.0 | 1.0 | 90.00° |
| 2.5 | 1.0 | 43.60° |
| 0.2 | 2.5 | 77.32° |
| 1.0 | 2.5 | 18.18° |
| 2.5 | 2.5 | 7.32° |
| 1.0 | 0.6 | 140.40° |

Measured ψ should land within **0.05°** of these.

**2. `r_min` is continuous through b = 0.** Fire b = 0.00, 0.01, 0.02, 0.05 at v = 1: `r_min` must read
**2.00** for all four (varying only in the 4th decimal). Before the fix it jumped 2.00 → 1.58 across
b = 0.02. Spot values: `r_min(b=1, v=1) = 2.4142`, `r_min(b=2.5, v=1) = 3.6926`,
`r_min(b=0.2, v=2.5) = 0.4161`.

**3. Head-on is honest.** At b = 0, v = 1: ψ reads **180.0°**, and the particle visibly *decelerates* to
a stop at x = −2.00, then accelerates back out **at the same speed profile mirrored**. The old build
crossed closest approach at constant speed and left 2.36× faster than it arrived.

**4. Timing.** Every shot completes in ≈ 7 s at 1× regardless of b and v, and the particle stays on
canvas until the readout appears. `0.5×/1×/2×/4×` all work.

**5. Load state.** First paint shows no `naive "contact" path (wrong)` line; it appears only when
inquiry step 4 is open and expanded.

**6. Regression.** Zero console errors; `window.__audit()` returns finite numbers with
`|rmin - rminExact| < 1e-3` after any shot.
