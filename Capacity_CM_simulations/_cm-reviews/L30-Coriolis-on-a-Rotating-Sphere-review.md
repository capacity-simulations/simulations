# Coriolis on a Rotating Sphere
**Lecture 30 · L30-Coriolis on a Rotating Sphere.html**

**System:** 3-D rotating globe (three.js); click to release air parcels that are pulled toward a draggable low-pressure centre while feeling Coriolis `a = −f ẑ×v` with `f = 2ω sin φ` plus linear drag. Six-step guided inquiry: which way does inflow spiral in the NH, in the SH, and on the equator.
**Verdict:** The **direction** physics is correct throughout — sign chain, hemisphere flip, and equatorial null all verified, and all three inquiry answers are right. But the **magnitude** physics is broken in two independent ways: the integrator injects energy (parcels accelerate 6×–55× instead of settling into geostrophic balance), and three mutually inconsistent rotation rates are in play while the panel asserts they are consistent.
**Browser-probe:** Ran. Bundled sweep near-useless here (0 sliders, no `window.__audit` → 2 states); five custom probes written — a scene-graph hook measuring real parcel speeds, a circulation-sense test, a click-calibrated parcel driver, a CDN-blocked offline test, and a verbatim node replication of `stepParcel`. `errors: []` on every online run.

## PHYSICS
### P0
- [high] **Forward Euler on the Coriolis rotation injects energy without bound.** `stepParcel` L1001-1002 forms *both* new velocity components from the *old* ones (`aE` uses `vN`, `aN` uses `vE`, then `vE_new`/`vN_new` are computed together). For the rotation sub-system this gives `|v|² → |v|²(1 + f²dt²)` every step — an unconditional amplification, not a rounding effect. It beats the linear `DRAG` whenever `f_eff²·dt/2 > DRAG`, i.e. poleward of **|φ| > 26° at 1×** and **|φ| > 12.7° at 4×**. Measured live: parcels launch at 0.175 scene-units/s and peak at **1.11 (6.4×) at 1×** and **9.60 (55×) at 4×** — 1.5 sphere-circumferences per second on a unit sphere. Canonically, with bounded pressure-gradient forcing and linear drag the parcel must approach a quasi-geostrophic balance at roughly *constant* speed. → **Fix:** make the update semi-implicit — compute `vE_new` first, then use it when forming `aN` — or, cleaner, rotate the horizontal velocity vector exactly by `−f·dt` and add pg/drag separately. Either removes the amplification entirely. [evidence: `speed_1x.png`, `speed_4x.png`; node replication `repl.mjs`]

### P1
- [high] **Three mutually inconsistent ω, and the on-screen note claims they agree.** The Rotation panel and Formal block both state `ω_sim = 30 000 ω⊕ ≈ 2.19 rad/s`, and the note asserts *"Coriolis physics uses this ω consistently for f = 2ω sin φ."* Neither half holds: (a) the dynamics multiply by `CORIOLIS_GAIN = 1.4` (L632, L992-993), so the implemented `f` is `1.4·2ω sinφ` — an **effective ω of 3.06 rad/s**; (b) the globe you actually watch spins at `OMEGA_VIS = 30000 × 4.2e-6 = 0.126 rad/s` (L639, applied L1322) — a **49.9 s period**, not the 2.87 s implied by 2.19 rad/s. Note `4.2e-6` is not Earth's rate; the "30,000×" factor is applied to a fabricated base. Visible spin is **17.4× slower than stated** and **24.3× slower than effective**, so a student who times the globe and computes `f = 2ω sinφ` predicts an inertial period ~24× too long. → **Fix:** commit to one ω — either set `OMEGA_VIS = OMEGA_SIM_PHYS` so the spin you see is the spin that acts, or keep the slow visual spin and relabel the panel honestly ("visual spin rate, not the dynamical ω") while quoting the ω actually used. Fold `CORIOLIS_GAIN` into the quoted ω or drop it.

### P2
- [med] **Metric (curvature) terms omitted.** Only `a_E = f v_N`, `a_N = −f v_E` are integrated; exact motion on a sphere also carries `+uv tanφ/R` and `−u² tanφ/R`. Standard traditional-approximation practice and negligible for this pedagogy — but the neglected terms diverge as `tanφ → ∞`, exactly where the P0 blow-up drives parcels. → **Fix:** none needed for teaching; add a comment so the approximation is explicit.
- [low] **Two different `1/cos φ` floors for the same quantity.** `addParcel` L926 uses `Math.max(0.05, cos φ)`; `stepParcel` L1005 uses `Math.max(0.02, cos φ)`; latitude is clamped at `±(π/2 − 0.01)` where `cos φ = 0.0100`. At the clamp the 0.02 floor silently halves `vE` every step. → **Fix:** one shared constant.

## NON-PHYSICS
### P0
none

### P1
- [functional][high] **Hard CDN dependency with a silent infinite-retry failure.** three.js r128 and KaTeX load from cdnjs/jsdelivr (L8-9). With those blocked, `initSim` L625 hits `if(typeof THREE==='undefined'){ setTimeout(initSim,50); return; }` and retries forever at 20 Hz: canvas stays at its default 300×150, every readout shows "—", and no message ever appears. The page looks alive — title, legend, panels, hint bar all render — with a dead black box where the globe should be. A firewalled classroom or an offline lecture gets exactly this. → **Fix:** vendor three.js locally, and after N failed retries render a visible "3-D library failed to load" notice instead of retrying silently. [evidence: `offline.png`]

### P2
- [ux][med] **Opens in Lecture mode**, which collapses the six-step guided inquiry to a header strip (same appended default-lecture script as the other CM sims). For a sim whose entire content is that inquiry, the default hides the content. → **Fix:** product decision — flag, don't silently change.
- [ux][low] **Parcel launch speed is hardcoded** (`speed0 = 0.35`, L910, commented "slider removed"). Since the Coriolis force is ∝ v and the inertial radius is `v/f`, a speed control is the natural second axis after latitude. → **Fix:** restore it, or record why it was dropped.

## Browser-test evidence
- **Parcel speed, measured in the live page** by hooking `THREE.Object3D.prototype.add` to capture the radius-0.012 parcel meshes and differencing their earth-local positions (i.e. rotating-frame speed): launch 0.175 → **peak 1.114** at 1× and **peak 9.602** at 4×. Independent verbatim node replication of `stepParcel` predicted peaks of 1.1–3.4 (1×) and 3.3–13.8 (4×) — close agreement, so the defect is in the sim, not the measurement. (`speed-probe.mjs`)
- **Circulation sense is correct.** Over 472 samples at 0.25× (the one setting numerically stable at these latitudes), the sign of `û·(r_low × v)` was positive in **91%** of samples, mean `+0.047` — anticlockwise, i.e. cyclonic in the NH, the answer step 2 marks correct. The 9% negative are parcels that overshot into the SH (sampled latitudes spanned −13.8° to +27.0°), where the sense genuinely flips. (`sense-probe.mjs`)
- **Sign chain verified analytically.** `latLonToVec` puts the pole on +y and increasing longitude eastward; `east`/`north` unit vectors at L973-974 are the correctly normalised ∂/∂λ, ∂/∂φ and form a right-handed triad with `up`. With `f = 2ω sinφ > 0` in the NH, `aE = +f·vN` deflects northward motion east — to the *right* of motion. Flips with `sinφ` in the SH; vanishes at φ = 0. Matches `a = −f ẑ×v` exactly.
- **All three inquiry answers are physically correct**: step 2 NH → anticlockwise (`_correct:'ccw'`), step 4 SH → clockwise (`_correct:'cw'`), step 6 equator → no deflection (`_correct:'zero'`). Distractor rebuttals are accurate.
- **Selection readout correct**: `f/f_max = sin φ` signed (L≈1185), hemisphere label with a ±0.5° equatorial dead band. Spot-checked live — φ 15.9° → sin φ 0.274 → f/fmax +0.27, "North".
- **Instability threshold**, from `f_eff²·dt/2 > DRAG` with `f_eff = 6.124 sin φ`: |φ| > 61.2° at 0.25×, > 26.0° at 1×, > 18.0° at 2×, > 12.7° at 4×. The sim's speed selector tops out at 4×.
- **Offline**: with cdnjs/jsdelivr request-intercepted, `typeof THREE === 'undefined'`, canvas never leaves 300×150, inquiry chrome still renders, no user-facing error.
- **No console errors** on any online run, including parcel creation, reset, speed changes and camera drag.

## To verify (human)
- **Southern hemisphere.** I confirmed the NH sense quantitatively but did not drive the shift-drag that moves the low south, so step 4's clockwise claim is verified only from the code's sign structure, not observed. Worth one manual drag.
- **Whether the blow-up is visible in normal use.** In my runs parcels raced poleward and clamped at `±(π/2 − 0.01)` within ~18 s at 1×, leaving no spiral. Confirm whether a lecturer would read this as "the sim is broken" or simply not notice.
- **Whether `CORIOLIS_GAIN = 1.4` was deliberate tuning** (to make deflection visible inside `PARCEL_LIFE`) or an accident. It changes the fix for the P1: fold it into the quoted ω, or remove it.
- **Whether the 30,000× figure or the 0.126 rad/s spin is the intended one** — that decides which direction the P1 fix goes.
