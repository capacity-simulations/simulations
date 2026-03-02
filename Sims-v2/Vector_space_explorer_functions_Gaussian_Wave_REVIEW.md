# Vector Space Explorer – Gaussian Wave Simulation Review (Post-Fix)

Review of [Vector_space_explorer_functions_Gaussian_Wave_v1.html](Vector_space_explorer_functions_Gaussian_Wave_v1.html) after the previously planned fixes. Covers physics, equations, numerical methods, architecture, front-end/visuals, and remaining issues.

---

## 1. Physics concepts and equations

**Concept**: L² inner product space over ℝ: ⟨ψ|φ⟩ = ∫ ψ(x)φ(x) dx, ‖ψ‖² = ⟨ψ|ψ⟩, cos θ = ⟨ψ|φ⟩/(‖ψ‖‖φ‖).

**Gaussian functions**: ψ(x) = A₁ exp(−(x−μ₁)²/(2σ₁²)), φ(x) = A₂ exp(−(x−μ₂)²/(2σ₂²)).

| Item | Location | Status |
|------|----------|--------|
| Gaussian | Line 127: `A * Math.exp(-(x-mu)*(x-mu)/(2*sigma*sigma))` | Correct |
| Inner product ⟨ψ\|φ⟩ | Lines 132–136: closed form with √(2π σ₁²σ₂²/(σ₁²+σ₂²)) and exp(−(μ₁−μ₂)²/(2(σ₁²+σ₂²))) | Correct |
| ‖ψ‖², ‖φ‖² | Lines 137–138: A² σ√π | Correct |
| ‖f‖² = c₁²‖ψ‖² + 2c₁c₂⟨ψ\|φ⟩ + c₂²‖φ‖² | Line 422 | Correct |
| cos θ, θ with clamp to [−1,1] | Lines 420–421 | Correct |

**Summary**: Physics and formulas are correct. No issues found.

---

## 2. Numerical methods

- **Sampling**: x ∈ [−8, 8], N = 500 (line 124). Used only for plotting; metrics use closed forms.
- **Metrics**: Inner product, norms, cos θ, θ, ‖f‖² use analytic expressions only. No discretization error in displayed numbers.
- **Auto-scale**: Smooth follow with minimum range `Y_VIEW_MIN_RANGE = 0.01` (lines 199–221). Prevents zero range and division-by-zero in `mapY`.

**Conclusion**: Numerical approach is sound. One remaining issue is Y grid/axis step size for very small view ranges (see Bugs below).

---

## 3. Architecture and flow

- **State**: `P` (A1, μ1, σ1, A2, μ2, σ2, c1, c2), `show` (visibility), `yMinView`/`yMaxView`, `dispAngle`, `lastAngleDpr`.
- **Flow**: Input (sliders/checkboxes) → update state → each frame: `autoScale()` → clear → draw grid → fills → curves → axes → hover → `updateMetrics()` → `drawAngle()` → `requestAnimationFrame(render)`.
- **Resize**: `resize()` runs only on `window.addEventListener('resize', resize)` and once at init; it is no longer called from the render loop.

**Conclusion**: Architecture and data flow are clear and consistent with the intended design.

---

## 4. Front-end, animations, and visuals

- **Main canvas**: HiDPI via `dpr`, margins, x ∈ [−8, 8], y auto-scaled. Draw order: product fill → f fill → curves (with glow). Clipping to plot area is correct.
- **Hover**: Mouse in CSS pixels; `unmapX(mouseX)`; vertical line, curve dots, tooltip. Coordinates are consistent (no dpr mix-up).
- **Angle panel**: Resize only when `devicePixelRatio` changes (`resizeAngleCanvas()`, `lastAngleDpr`). `dispAngle` smoothed; reset to π/2 on RESET.
- **Legend**: Single `legendCheckboxId` map for checkbox sync (no redundant branches).
- **Product area fill**: Polygon between y = 0 and ψ·φ; same fill above/below axis (signed vs unsigned not distinguished; optional improvement only).

**Rendering**: No flicker from per-frame angle canvas resize; no per-frame main `resize()`. Zero Y-range and zero step bugs are addressed with safe range and fallbacks.

---

## 5. Bugs found and suggested fixes

### Bug: Very small Y step can cause huge loop counts (performance / hang risk)

**Where**: Grid: lines 233–234 (minor), 245–246 (major). Axes: lines 278–279 (Y labels).

**Issue**: For a very small `yRange` (e.g. after clamping or floating point), `yStep`, `yMajor`, or `yTick` can become extremely small (e.g. 1e−11). The loops `for (y = …; y <= yMaxView; y += step)` then run an enormous number of times (e.g. 10⁹+), which can hang the tab or make the UI very slow.

**Fix**: Enforce a minimum step so the number of iterations is bounded (e.g. at most ~15–20 ticks for axes, and proportionally for grid):

- **drawGrid**: After computing `yStep` and `yMajor`, clamp from below:
  - `yStep = Math.max(yStep, yRange/30);`
  - `yMajor = Math.max(yMajor, yRange/15);`
- **drawAxes**: After computing `yTick`:
  - `const yTick = Math.max(niceStep(yRangeAxes/5) || yRangeAxes/5, yRangeAxes/15);`

This keeps behavior unchanged for normal ranges while preventing runaway loops when the range is tiny.

---

## 6. Optional improvements (non-bugs)

- **Orthogonality badge**: Current rule is `|⟨ψ|φ⟩| < 0.01`, which is scale-dependent. A scale-invariant option is `|cos θ| < 0.01` (angle near 90°) for the “ORTHOGONAL” badge.
- **Product area sign**: Use different fill (e.g. tint) where ψ·φ < 0 to show signed contribution to ⟨ψ|φ⟩.
- **Container resize**: If the plot container can change size without a window resize (e.g. collapsible sidebar), consider a `ResizeObserver` on `wrap` and call `resize()` from it so the main canvas stays in sync.

---

## Summary table

| Item | Status |
|------|--------|
| Gaussian formula | Correct |
| Inner product (closed form) | Correct |
| ‖ψ‖², ‖φ‖² | Correct |
| ‖f‖² expansion | Correct |
| cos θ / θ | Correct, clamped |
| mapY / autoScale zero range | Fixed (guarded range, min range) |
| Grid/axis zero step | Fixed (safe yRange, fallbacks) |
| Angle canvas per-frame resize | Fixed (resize only on dpr change) |
| resize() in render loop | Fixed (removed) |
| dispAngle on RESET | Fixed (set to π/2) |
| Legend checkbox sync | Fixed (id map) |
| Very small Y step → huge loops | **Bug**: add minimum step (see above) |

All suggested code changes are local to `Vector_space_explorer_functions_Gaussian_Wave_v1.html`.
