# Superposition QHO Simulation — Physics, Numerics & Rendering Review

## 1. Physics equations and concepts

### Verified correct

| Item | Location | Status |
|------|----------|--------|
| **QHO ground state** ψ₁(x) = (πσ²)^(-1/4) exp(-x²/(2σ²)) | `psi1Func`, lines 419–422 | Correct; normalization matches standard form. |
| **QHO first excited** ψ₂(x) = √2 (πσ²)^(-1/4) (x/σ) exp(-x²/(2σ²)) | `psi2Func`, lines 426–429 | Correct; odd parity, orthogonal to ψ₁. |
| **Natural units** ω = 1/σ² (ℏ = m = 1) | omega, E1, E2 throughout | Correct; α = 1/√ω ⇒ σ = α. |
| **Energies** E₁ = ½ω, E₂ = 1.5ω; beat ω₂₁ = ω | generateData, numericalNormCheck, updateStatus | Correct. |
| **Time evolution** Ψ = c₁ψ₁e^(-iE₁t) + c₂ψ₂e^(-iE₂t) | generateData, lines 447–449, 462–464, 469–471 | Re(Ψ) and Im(Ψ) implemented correctly. |
| **Probability density** \|Ψ\|² = Re² + Im² | Lines 466–469 | Correct; non-negative, conserved. |
| **Normalization** \|c₁\|² + \|c₂\|² = 1 | getNormalizedCoeffs, linked sliders | Enforced and re-normalized. |

No physics bugs found.

---

## 2. Numerical methods

### Verified correct

- **Trapezoidal rule** (norm and overlap): Endpoint weight 0.5, interior 1.0, step DX. Formula ∫f dx ≈ DX·(½f₀ + f₁ + … + ½f_{n-1}). Correct in `numericalNormCheck` (lines 456–458) and `numericalOverlapCheck` (lines 470–472).
- **Grid**: NUM_POINTS = 500, X_MIN = -5, X_MAX = 5, DX = 0.02. Adequate for σ ∈ [0.3, 1.5]; small-σ hint in UI.
- **Norm / overlap**: Same expressions as in plots; consistent.

### Note

- For σ &lt; 0.5, norm/overlap can show larger numerical error; the sigma-hint warns users. Optional: adaptive NUM_POINTS for small σ.

---

## 3. Architecture and flow

- **State**: c1Raw, c2Raw, sigma, time, showProbability, speed, isPlaying — single source of truth.
- **Data flow**: Sliders/playback → state → getNormalizedCoeffs() → generateData() → draw() and numerical checks. omega, E1, E2 derived from sigma where needed; no duplicated formulas.
- **Animation**: requestAnimationFrame → animate() → dt from timestamp diff, capped at 0.1 s (line 642) → time += dt * speed when playing → draw() + updateStatus(). Correct; robust to tab backgrounding.
- **Y-ranges**: Plots 1 and 2 use static scales (STATIC_Y_RE, STATIC_Y_PROB); plot 3 uses dynamic yMax3. Shape change with σ is visible on 1 and 2.

No architectural bugs found.

---

## 4. Front-end and rendering

### Verified correct

- **Zero line**: zeroY = pT + plotH·(yRange[1]/yScale) gives screen y for data value 0. Algebra checked; only drawn when zero is inside plot (lines 886–888).
- **Y-scale guard**: `const yScale = (yRange[1] - yRange[0]) || 1e-10` (line 861) prevents division by zero when range is flat.
- **Fill under curve**: Fill between curve and fillZeroY; correct for Re(ψ) and \|ψ\|².
- **Axis labels**: X/Y use X_MIN, X_MAX, yRange; no hardcoded axis bugs.
- **Canvas**: devicePixelRatio; resize on window resize and maximize; canvas order matches DOM.
- **Sigma slider**: min=30, max=150 → σ ∈ [0.30, 1.50]. Reset: sigma=0.7, slider=70. Consistent.

### Non-bug (cosmetic)

- In Re(ψ) mode, when the curve crosses zero, the fill is one polygon; mathematically correct, can look like two regions merged. Optional: split fill at zero for clarity.

---

## 5. Bugs found and suggested fixes

### No critical bugs

Review of [Superposition_QHO.html](Superposition_QHO.html) found **no physics, numerical, or rendering bugs**. Implementation matches the intended QHO superposition model.

### Optional / minor improvements

1. **Overlap tolerance**  
   - **Where**: Line 1013, overlap green condition `Math.abs(overlapVal) < 0.01`.  
   - **Suggestion**: Tighten to `0.001` for a stricter “OK” (numerical overlap is typically much smaller). Optional.

2. **Redundant sigmaValue in sigma slider handler**  
   - **Where**: Lines 1114–1116; handler sets `sigmaValue` then calls `updateDisplays()`, which also sets it.  
   - **Fix**: In the sigma slider handler, set only `sigma = e.target.value / 100` and call `updateDisplays()`; remove the direct `getElementById('sigmaValue').textContent = ...` assignment.

3. **Reset and first frame**  
   - **Where**: `resetAll()` (lines 1067–1091) does not call `draw()` or `updateStatus()`.  
   - **Note**: Next animation frame redraws; behavior is correct. Optional: call `draw()` and `updateStatus()` at the end of `resetAll()` so the first frame after reset is guaranteed to show reset state.

---

## 6. Summary

| Area | Result |
|------|--------|
| Physics equations and concepts | All correct |
| Numerical methods | Correct |
| Architecture and flow | Correct |
| Front-end / rendering | Correct; static Y for plots 1–2, dynamic for 3 |
| Critical bugs | None found |
| Optional tweaks | Overlap threshold, redundant sigmaValue, optional draw in reset |

The Superposition QHO simulation is physically and numerically sound; only optional, non-critical refinements are suggested.
