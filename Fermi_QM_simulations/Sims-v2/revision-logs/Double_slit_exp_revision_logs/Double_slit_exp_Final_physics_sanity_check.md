# Double-Slit Experiment: Final Physics Sanity Check

## 1. Equations and Concepts (Verified Correct)

### Quantum intensity (Fraunhofer double-slit)
- **Formula**: \( I(\theta) \propto \cos^2(\pi d \sin\theta / \lambda) \cdot \operatorname{sinc}^2(\pi a \sin\theta / \lambda) \)
- **Code**: `phi = (π * sep * sinTheta) / lambda`, `interference = cos²(phi)`; `beta = (π * slitWidth * sinTheta) / lambda`, `diffraction = sinc²(beta)` (with `sinc(beta) = sin(beta)/beta`). Matches standard optics (path-difference phase and single-slit envelope).
- **Angle**: `theta = atan(x / L)` with exact `sin(theta)` (no small-angle approximation). Correct for all L.

### Scaling (sim units)
- **UNIFORM_SCALE** = 30/6000 applied to sep, slitWidth, lambda, screenDistance. Physical ratios d/λ, a/λ, L/λ preserved in sim-space. No bugs.

### Monte Carlo sampling
- **Quantum**: Proposal uniform on `[-W/2, W/2]`; acceptance = `interference * diffraction` ∈ [0, 1]. Valid.
- **Classical**: Acceptance = `(p1 + p2) / 2` with Gaussian p1, p2; peak < 1, so valid. Division by 2 is fixed normalization.

### Theoretical curves vs histogram
- **Bin centers**: `x = (((i + 0.5) / numBins) - 0.5) * CONFIG.sceneWidth` in both `generateTheoreticalData()` and `generateClassicalData()`. Aligns with Chart.js bar centers. Correct.

### Classical Gaussian model
- **σ** = λL/(2·W·a) in sim units. Dependencies: σ ∝ λ, ∝ L, ∝ 1/a. Hump centers at ±d/2. Consistent with single-slit diffraction scale and used consistently in `generateClassicalData()`, `recordInterferenceHits()` classical branch.

### Barrier geometry
- Slit centers at ±sep/2; center block width = sep − slitWidth; side blocks close the gap to sceneWidth. Sliders enforce sep > slitWidth, so center width > 0. Geometry correct.

### Huygens arcs
- Semicircles: angle ∈ [-π/2, π/2], `x = slitX + r*sin(angle)`, `z = barrierZ - r*cos(angle)`. Expand toward negative z (screen). Correct.

### Wavelength → color
- Piecewise linear 380–700 nm → RGB with brightness boost. Standard visible spectrum mapping.

---

## 2. Architecture and Flow (Verified Correct)

- **Entry**: `animate(time)` → `updatePhysics(dt, time)` → `updateWaveMode(dt, time)`.
- **Incident waves**: Move in z; at barrier spawn one S1 and one S2 secondary; then fade and remove.
- **Secondary waves**: S1 and S2 grow at same speed; **only S1** calls `recordInterferenceHits()` when `wave.radius > L - 2` and `!wave.recordedHit`. One trigger per wavefront pair; no double-counting.
- **Charts / overlays**: Quantum vs classical mode toggle chart datasets and screen/overlay visibility correctly.

---

## 3. Numerical Methods (Verified Correct)

- **Time step**: `dt = min((time - lastTime)/1000, 0.1) || 0` (seconds). Clamp avoids large steps; Euler for z and radius is adequate for this visualization.
- **No integration error**: Angles and intensities are closed-form (atan, sin, cos, sinc). No ODE/PDE solver.

---

## 4. Front-End / Animations / Rendering

- **Fog**: Far plane set to 220 so screen remains visible at max L (8000 nm). Fixed.
- **Hit trigger**: Fires when wavefront is 2 sim units before screen; hit position is from formula, so physics unchanged (timing only).
- **S2 wave object**: Does not set `recordedHit`; only S1 triggers recording, so behavior is correct. For consistency and robustness (avoid relying on `!undefined`), S2 should also initialize `recordedHit: false`.

---

## 5. Bugs and Suggested Fixes

### Bug (cosmetic/robustness): S2 secondary wave missing `recordedHit`

- **Location**: `createSecondaryWaveS2()` (lines 998–1004).
- **Issue**: The object pushed to `secondaryWavesS2` has no `recordedHit` property. Code never reads it for S2, but S1 explicitly sets `recordedHit: false`; omitting it for S2 is inconsistent and relies on `!undefined` if any future code checks it.
- **Fix**: Add `recordedHit: false` to the S2 wave object, e.g.:
  ```javascript
  secondaryWavesS2.push({
      mesh: arc,
      slitX: slitX,
      radius: initialRadius,
      opacity: 0.7,
      recordedHit: false
  });
  ```

---

## 6. Summary

- **Physics**: All equations, scaling, and sampling are correct and consistent.
- **Architecture**: Single physics path, one hit record per wavefront pair, correct mode toggling.
- **Numerics**: Time stepping and use of closed-form expressions are appropriate.
- **Rendering**: Fog fix applied; one optional robustness fix recommended (S2 `recordedHit`).

No further physics or rendering bugs identified.
