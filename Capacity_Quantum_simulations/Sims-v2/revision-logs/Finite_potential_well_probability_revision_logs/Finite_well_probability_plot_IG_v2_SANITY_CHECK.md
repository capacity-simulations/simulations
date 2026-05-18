# Finite Well Simulation — Final Sanity Check

## 1. Physics equations and concepts

| Item | Status | Notes |
|------|--------|------|
| Well definition | OK | V(x)=0 for \|x\|<a, V₀ outside; a=L/2. |
| ℏ²/(2m) | OK | 0.03810 eV·nm² for electron mass; consistent with (ℏc)²/(2m_ec²). |
| z₀ = a√(V₀/(ℏ²/2m)) | OK | Line 675. |
| Even parity: z tan z = √(z₀²−z²) | OK | Lines 682–684, 702–703. |
| Odd parity: −z cot z = √(z₀²−z²) | OK | Lines 714–715, 730–731. |
| E = z²(ℏ²/2m)/a² | OK | Lines 703, 737. |
| k = √(E/(ℏ²/2m)), κ = √((V₀−E)/(ℏ²/2m)) | OK | Lines 770–771. |
| Even ψ: cos(kx) inside; cos(ka)e^(∓κ(x∓a)) outside | OK | Lines 781–788. |
| Odd ψ: sin(kx) inside; ±sin(ka)e^(∓κ(x∓a)) outside | OK | Lines 791–797. |
| Normalization: trapezoidal + ψ²/(2κ) tails | OK | Lines 802–815. |
| Tunneling: trapezoidal outside well + tail terms | OK | Lines 829–847. |

No physics equation errors found.

---

## 2. Numerical methods

| Item | Status | Notes |
|------|--------|------|
| Root finding | OK | Scan z in steps 0.0005; on sign change, bisect 50×. |
| Singularity handling | OK | Odd branch skips \|sin z\| < 1e-10; bounds prevent blow-up. |
| Deduplication | OK | Parity-aware: same parity and \|ΔE\| ≤ 0.001 eV merged. |
| Trapezoidal rule | OK | Used for ∫ψ² dx and tunnel probability. |
| Tail integrals | OK | ψ(x_min)²/(2κ) and ψ(x_max)²/(2κ) correct for exponential tails. |

No numerical method errors found.

---

## 3. Architecture and physics engine flow

| Item | Status | Notes |
|------|--------|------|
| Parameter flow | OK | Sliders → targetV0/targetL → lerp → displayV0/displayL → solveFiniteWell when changed. |
| solveFiniteWell | OK | Uses displayV0, displayL; sets boundEnergies, clamps selectedState, calls computeWavefunctions. |
| computeWavefunctions | OK | Builds xs/ψ per state, normalizes, tunnel prob, pushes to boundStates. |
| Rendering | OK | Reads displayV0, displayL, boundStates[selectedState]; no recompute in draw path. |
| Sidebar throttle | OK | needsSidebarUpdate + SIDEBAR_UPDATE_INTERVAL. |
| Zero bound states | OK | selectedState clamped to 0; draw skips state (idx ≥ boundStates.length); stats show "—". |

No architecture or flow bugs found.

---

## 4. Animation and time

| Item | Status | Notes |
|------|--------|------|
| Delta time | OK | lastFrameTime, (now − lastFrameTime)×0.001×speed×REF_ANIM_RATE. |
| Phase | OK | phase = animTime×omega, omega = st.E (display convention). |
| Reset | OK | animTime and lastFrameTime set to 0 on Reset. |

No animation bugs found.

---

## 5. Rendering and layout

| Item | Status | Notes |
|------|--------|------|
| Canvas region | OK | #canvas-container has right: var(--sidebar-width); plot uses full W. |
| plotLeft / plotRight | OK | 60×dpr and W−30×dpr. |
| Early return (tiny plot) | OK | Canvas cleared and filled before requestAnimationFrame(draw); return. |
| xToPixel / eToPixel | OK | Linear map; E axis inverted (higher E at top). |
| fillRect (well) | OK | Correct sign for width/height. |
| ctx state | OK | globalAlpha and setLineDash restored. |
| Legend overlay | OK | .sim-legend-overlay in #canvas-container; top: 32px; pointer-events: none. |

No rendering bugs found.

---

## 6. Event handling and UX

| Item | Status | Notes |
|------|--------|------|
| Top bar | OK | Reset, Start, Pause, Menu (⋮); IDs btnReset, btnPlay, btnPause, btnMenu. |
| Keyboard | OK | Arrow Up/Down and Space ignored when focus in input/select/textarea. |
| Playback buttons | OK | updatePlaybackButtons toggles .active on btnPlay/btnPause. |

No event-handling bugs found.

---

## 7. Additional bug (minor) and suggested fix

**Dead code — `legendPsiSwatch`**

- **Where:** `updateEnergyList()` (lines 873–876) gets `document.getElementById('legendPsiSwatch')` and, if present, sets its background to the selected state color.
- **Issue:** The legend was moved to the in-canvas overlay; the sidebar no longer contains an element with id `legendPsiSwatch`, so `swatch` is always null and the block never runs.
- **Fix (optional):** Remove the block to avoid dead code:

```javascript
// Remove these lines from updateEnergyList():
const swatch = document.getElementById('legendPsiSwatch');
if (swatch) {
    swatch.style.background = stateColors[selectedState % stateColors.length];
}
```

If you later add a state-colored swatch (e.g. in the overlay or sidebar), give it id `legendPsiSwatch` and keep or restore this logic.

---

## 8. Summary

- **Physics:** Equations and concepts match the intended finite square well formulation.
- **Numerics:** Root finding, normalization, and tunneling use correct methods and formulas.
- **Architecture:** Parameter flow, physics entry point, and rendering pipeline are consistent; zero-state case is handled.
- **Animation:** Delta-time phase advance and reset behave correctly.
- **Rendering:** Layout, coordinates, early return, and legend overlay are correct; no canvas state leaks.
- **Bugs:** No physics or rendering bugs. One optional cleanup: remove the unused `legendPsiSwatch` block in `updateEnergyList()` (or reuse it if you add a matching element).
