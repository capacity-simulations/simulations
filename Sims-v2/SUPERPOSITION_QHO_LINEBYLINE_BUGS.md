# Superposition_QHO.html — Line-by-Line Review & Bugs

## Scope

Full pass over [Superposition_QHO.html](Superposition_QHO.html): HTML structure, CSS, constants, state, physics, numerics, rendering, event handlers, and initialization. Only actual bugs and clear robustness improvements are listed, with suggested fixes.

---

## 1. HTML & structure (lines 1–436)

- **Lines 358, 368, 378**  
  `onclick="toggleMaximize('plot1')"` (and plot2, plot3) — `toggleMaximize` is defined in the same script and runs in global scope; OK.

- **Lines 363, 373, 383**  
  SVG uses `stroke-width="2"`. Valid in SVG; no change needed.

- **Lines 414–416**  
  `const DX = (X_MAX - X_MIN) / NUM_POINTS` → 0.02. Correct.

- **Line 417**  
  Sigma slider: `min="30" max="150"` → σ ∈ [0.30, 1.50]. No division by zero.

No bugs in this section.

---

## 2. Physics & state (lines 418–443)

- **419–422** `psi1Func(x, sig)`  
  Formula and normalization correct. No guard on `sig`: if `sig === 0` we’d get division by zero; in this file σ always comes from the slider (≥ 0.3), so not a current bug.

- **426–429** `psi2Func(x, sig)`  
  Same: `sig` in denominator and in exponent. Theoretically unsafe for `sig === 0`; in practice σ ≥ 0.3.

- **435–443** `getNormalizedCoeffs()`  
  When `rawNormSq < 1e-12` we return `{ nc1: 0, nc2: 0 }` and never divide; when ≥ 1e-12 we divide by `sqrt(rawNormSq)`. Safe.

No bugs; optional hardening: in `psi1Func`/`psi2Func`, add `if (sig <= 0) return 0;` at the top if you ever allow σ = 0 elsewhere.

---

## 3. Data generation & numerics (lines 455–475)

- **458–461**  
  `omega = 1 / (sigma * sigma)`; with σ ≥ 0.3, ω is finite. E1, E2, trig: correct.

- **464–471**  
  Re(Ψ), Im(Ψ), and |Ψ|² match the documented formulas. No issues.

- **456–458, 472**  
  Trapezoidal rule: weight 0.5 at `i === 0` and `i === NUM_POINTS - 1`, else 1.0. Correct.

No bugs in this section.

---

## 4. Y-range & rendering (lines 478–947)

- **481–521** `computeYRanges()`  
  When `maxProb === 0` or `maxAmp === 0`, `yMax3 = 0.5` is used; ranges stay valid.

- **861**  
  `const yScale = (yRange[1] - yRange[0]) || 1e-10` — avoids division by zero when range is flat. Good.

- **886**  
  `zeroY = pT + plotH * (yRange[1] / yScale)` — corresponds to data value 0; algebra checked, correct.

- **538–547** `resizeCanvases()`  
  When a plot is maximized, the other two `.canvas-wrapper` elements are inside hidden `.plot-container` nodes. `getBoundingClientRect()` on hidden elements can give 0×0, so those two canvases become 0×0 and later `drawPlot` runs with `plotW`/`plotH` zero or negative. Drawing is then meaningless for those canvases but the visible (maximized) plot is correct. So: **minor robustness / efficiency issue**, not a functional bug.

**Suggested fix (optional):** In `drawPlot`, after computing `plotW` and `plotH`, add:

```js
if (plotW <= 0 || plotH <= 0) return;
```

so we skip drawing when the plot area has no size (e.g. hidden maximized state).

---

## 5. Animation & status (lines 639–677)

- **641–642**  
  First frame: `lastTimestamp` set, `dt = Math.min(0, 0.1) = 0`, so no time jump. Good.

- **642**  
  `dt` cap at 0.1 s avoids large jumps when the tab is in the background. Good.

- **1008**  
  `(2 * Math.PI / OMEGA_21).toFixed(3)` — OMEGA_21 = ω = 1/σ² > 0 for σ ∈ [0.3, 1.5]. No division by zero.

No bugs in this section.

---

## 6. Sliders & display (lines 681–651, 1093–1144)

- **683–697** `updateFromC1` / `updateFromC2`  
  Clamp and `c1Raw² + c2Raw² = 1` logic are correct. Slider values 0–1000 map to 0–1. The `c1Dragging`/`c2Dragging` guards prevent cross-triggering when one slider’s update changes the other’s `.value`. No bug.

- **1114–1118** Sigma slider handler  
  **Bug (redundancy):** The handler sets `sigma = e.target.value / 100` and then sets `document.getElementById('sigmaValue').textContent = sigma.toFixed(2)` and then calls `updateDisplays()`, which also sets `sigmaValue`. Duplicate update.

**Fix:** In the sigma slider handler, remove the direct `sigmaValue` assignment and rely on `updateDisplays()` only:

```js
sigmaSlider.addEventListener('input', (e) => {
    sigma = e.target.value / 100;
    updateDisplays();
});
```

- **1067–1091** `resetAll()`  
  **Bug (incomplete reset):** `resetAll()` updates state and DOM (sliders, play/pause label, speed label, view mode) and calls `updateDisplays()`, but does **not** call `draw()` or `updateStatus()`. The next `requestAnimationFrame(animate)` will redraw and update status, so after one frame the UI is correct. If the tab is in the background and rAF is throttled, the user can see a brief inconsistency (e.g. time or σ reset but plots/status not yet updated).

**Fix:** At the end of `resetAll()`, after `updateDisplays();`, add:

```js
draw();
updateStatus();
```

so the first frame after reset already shows the reset state.

---

## 7. Reset & duplicate speed label (lines 1087–1089)

- **1087–1089**  
  `resetAll()` sets `playIcon`, `playText`, and `speedValue` explicitly, then calls `updateDisplays()`, which also sets `speedValue`. Redundant but consistent; no bug. Optional cleanup: remove the explicit `speedValue` assignment in `resetAll()` and rely on `updateDisplays()`.

---

## 8. Summary of bugs and suggested fixes

| # | Location | Issue | Suggested fix |
|---|----------|--------|----------------|
| 1 | **1115–1118** | Sigma slider handler sets `sigmaValue` and then `updateDisplays()` sets it again | Remove `document.getElementById('sigmaValue').textContent = sigma.toFixed(2);` from the sigma slider handler; keep only `sigma = e.target.value / 100; updateDisplays();`. |
| 2 | **1067–1091** | `resetAll()` does not call `draw()` or `updateStatus()` | At the end of `resetAll()`, after `updateDisplays();`, add `draw(); updateStatus();`. |
| 3 | **850–862** (optional) | When a plot is maximized, the other two canvases are resized to 0×0; `drawPlot` still runs and can use non-positive `plotW`/`plotH` | At the start of `drawPlot`, after computing `plotW` and `plotH`, add: `if (plotW <= 0 \|\| plotH <= 0) return;`. |
| 4 | **419, 426** (optional) | `psi1Func`/`psi2Func` do not guard against `sig <= 0` | Add at top of each: `if (sig <= 0) return 0;` if you ever allow σ = 0 from UI or future code. |

---

## 9. What was checked and is correct

- All `getElementById` ids exist in the HTML.
- Canvas order: `querySelectorAll('.canvas-wrapper')` order matches `[canvas1, canvas2, canvas3]`.
- Physics: ψ₁, ψ₂, ω, E₁, E₂, Re(Ψ), Im(Ψ), |Ψ|², normalization, trapezoidal norm/overlap.
- Zero-line formula and yScale guard in `drawPlot`.
- Linked sliders and normalization (c₁² + c₂² = 1).
- Event handler order and drag flags for c1/c2.
- Sigma and speed slider ranges and scaling (σ = value/100, speed = value/10).
- Static vs dynamic Y-ranges for the three plots.
- No other logic or typo bugs found in the scanned lines.

---

**Conclusion:** Two clear fixes recommended: (1) remove the redundant `sigmaValue` update in the sigma slider handler, and (2) call `draw()` and `updateStatus()` at the end of `resetAll()`. The other two items are optional robustness improvements.
