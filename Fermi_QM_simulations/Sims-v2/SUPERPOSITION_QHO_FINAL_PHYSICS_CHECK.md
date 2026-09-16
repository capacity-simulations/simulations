# Superposition QHO — Final Physics Check

**File:** [Superposition_QHO.html](Superposition_QHO.html)

---

## 1. Physics concepts and equations

| Check | Status | Notes |
|-------|--------|--------|
| **QHO ground state** ψ₁(x) = (πσ²)^(-1/4) exp(-x²/(2σ²)) | OK | `psi1Func` (lines 641–644): norm and exponent match; σ is characteristic length. |
| **QHO first excited** ψ₂(x) = √2 (πσ²)^(-1/4) (x/σ) exp(-x²/(2σ²)) | OK | `psi2Func` (lines 650–653): odd parity, orthogonal to ψ₁. |
| **Natural units** ℏ = m = 1, ω = 1/σ² | OK | Used consistently; α = 1/√ω ⇒ σ = α. |
| **Energies** E_n = (n + ½)ω → E₁ = 0.5ω, E₂ = 1.5ω | OK | Lines 691–693, 739–741, 1000–1001. |
| **Beat frequency** ω₂₁ = (E₂ − E₁)/ℏ = ω | OK | OMEGA_21 = omega (line 1003). |
| **Time evolution** Ψ = c₁ψ₁e^(-iE₁t) + c₂ψ₂e^(-iE₂t) | OK | Re(Ψ) and Im(Ψ) implemented correctly (lines 674–676, 713–714). |
| **Probability density** \|Ψ\|² = Re² + Im² | OK | Lines 714–715; non-negative, conserved. |
| **Normalization** \|c₁\|² + \|c₂\|² = 1 | OK | Linked sliders + `getNormalizedCoeffs()` (lines 657–665, 1027–1039). |

**Verdict:** No physics equation or concept errors.

---

## 2. Numerical methods

| Check | Status | Notes |
|-------|--------|--------|
| **Grid** X_MIN = -5, X_MAX = 5, NUM_POINTS = 500, DX = 0.02 | OK | Adequate for σ ∈ [0.3, 1.5]. |
| **Trapezoidal rule** ∫f dx ≈ DX·(½f₀ + f₁ + … + ½f_{n-1}) | OK | Endpoint weight 0.5 in `numericalNormCheck` (757–758) and `numericalOverlapCheck` (772–773). |
| **Norm check** Same Re/Im and \|Ψ\|² as in `generateData` | OK | Formulas match (753–755 vs 713–715). |
| **Overlap check** ∫ ψ₁ψ₂ dx | OK | Correct integrand and weights. |

**Verdict:** No numerical method errors.

---

## 3. Architecture and flow of the physics engine

```
State (c1Raw, c2Raw, sigma, time, showProbability, speed, isPlaying)
    ↓
getNormalizedCoeffs() → (nc1, nc2)
    ↓
generateData(): omega = 1/σ², E1, E2, same time → data1, data2, data3
    ↓
computeYRanges(): static for plot 1–2, dynamic for plot 3
    ↓
draw() → drawPlot × 3
updateStatus() → numericalNormCheck(), numericalOverlapCheck()
```

- Single source of truth for state; omega, E1, E2 derived from sigma wherever needed.
- No duplicated or inconsistent physics formulas.
- Animation: `animate()` → dt from timestamp (capped 0.1 s) → `time += dt * speed` when playing → `draw()` + `updateStatus()`.

**Verdict:** Architecture and flow are correct.

---

## 4. Front-end animations and visuals

| Check | Status | Notes |
|-------|--------|--------|
| **Animation loop** requestAnimationFrame(animate) | OK | Line 651; dt cap (line 642) avoids time jumps when tab is backgrounded. |
| **Time advance** Only when isPlaying | OK | Line 645–646. |
| **Y-scale** yScale = (yRange[1] − yRange[0]) \|\| 1e-10 | OK | Line 861; avoids division by zero. |
| **Zero line** zeroY = pT + plotH·(yRange[1]/yScale) | OK | Corresponds to data value 0; only drawn when inside plot (886–888). |
| **Data → screen** ny = (data[i] − yRange[0])/yScale, y = h−pB−ny·plotH | OK | Consistent in fill and main curve (900–901, 915–917). |
| **Static Y (plots 1–2)** STATIC_Y_RE = 1.3, STATIC_Y_PROB = 2 | OK | Lines 781–782, 799–800, 817–818. |
| **Canvas resize** devicePixelRatio, wrapper order | OK | Lines 840–846; canvas order matches DOM. |

**Verdict:** No physics or rendering bugs in animation/visuals.

---

## 5. Bugs found and suggested fixes

### Bug 1: Reset does not refresh canvas or status (logic/UX)

- **Where:** `resetAll()` (lines 1069–1092).
- **Issue:** State and DOM (sliders, labels, view mode) are reset and `updateDisplays()` is called, but `draw()` and `updateStatus()` are not. The next animation frame redraws and updates status, so there can be a one-frame (or longer if the tab is throttled) delay before plots and ∫|Ψ|²dx / ⟨ψ₁|ψ₂⟩ show the reset state.
- **Fix:** At the end of `resetAll()`, after `updateDisplays();`, add:
  ```js
  draw();
  updateStatus();
  ```

### Bug 2: Redundant sigma display update (code quality)

- **Where:** Sigma slider handler (lines 1114–1118).
- **Issue:** The handler sets `document.getElementById('sigmaValue').textContent = sigma.toFixed(2)` and then calls `updateDisplays()`, which also sets `sigmaValue`. Redundant.
- **Fix:** In the sigma slider handler, remove the direct `sigmaValue` assignment and keep only:
  ```js
  sigmaSlider.addEventListener('input', (e) => {
      sigma = e.target.value / 100;
      updateDisplays();
  });
  ```

---

## 6. Summary

| Area | Result |
|------|--------|
| Physics concepts and equations | All correct |
| Numerical methods | Correct |
| Architecture and flow | Correct |
| Front-end animations and visuals | Correct |
| **Bugs** | **2** (reset not calling draw/updateStatus; redundant sigmaValue update) |

**Conclusion:** The simulation is physically and numerically correct. The two bugs above are non-physics (reset UX and redundant UI update). Applying the suggested fixes will complete the final physics and behavior check.
