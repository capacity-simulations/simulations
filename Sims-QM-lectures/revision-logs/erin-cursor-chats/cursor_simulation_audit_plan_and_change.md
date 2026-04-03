# Simulation audit plan and changes
_Exported on 4/2/2026 at 19:03:06 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/general_specs.md @Sims-QM-lectures/QM_intro.tex  @Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html You are given instructions in the general specs file to audit this simulation for correct physics, visualization, and adherence to the notes. It is from lecture 15, the 15th section in the QM_intro docs. Produce a plan as specified in the "general specs" document for my review. 

Additionally, some simulation-specific changes: 
-Check the uncertainty principle is being implemented correctly with the spreading time/speed. 
- Remove the "state" line in the "statistics" section
- change the "3d" slider to a "view as heatmap" button (and vice versa for a "view in 3d" button when in heatmap mode)
- in heatmap mode, the normalization seems wrong currently. The prob should always integrate to 1. Display a heatmap legend on the plot. 

---

**Cursor**

Let me start by reading all the relevant files to understand the requirements and current implementation.

Now let me read the lecture notes to find the relevant section (lecture 15).

Now let me also check if there are any formulas from earlier lectures (particularly the Gaussian wavepacket) that the simulation relies on.

I now have a thorough understanding of all three files. Let me also quickly verify the spreading formula derivation from the Gaussian wavepacket lecture.

I now have a complete picture. Let me produce the audit and plan.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I have the full file in context. Let me start implementing Phase 1 -- the UI changes. I'll batch non-overlapping HTML edits in parallel.

Now update the time units, peak label, and about tooltip.

Now I need to update all the JavaScript. Let me batch the JS changes. First, update `setViewMode` to work with the button instead of checkbox.

Now update `updateStatusUI` to not depend on `stateDisplay`, and remove `stateDisplay` references from `measureWavefunction`, `resetSimulation`, and the `startBtn` handler.

Now replace the toggle event listener with the button event listener.

Phase 1 and Phase 4 HTML/JS changes are done. Now let me move to Phase 2 -- fixing the heatmap normalization and adding a legend.

Now I need to add a `referenceMax` variable and fix the `drawHeatmap()` function to use a fixed color scale plus draw a legend. Let me also add `referenceMax` to the variable declarations and compute it.

Now update `referenceMax` whenever `initialWidth` changes (in the width slider handler and in `resetSimulation`).

Now the major change -- replace `drawHeatmap()` with one that uses a fixed color scale and draws a legend.

Phase 2 done. Now Phase 3 -- fix the 3D visualization: remove the soft-cap, use honest linear scale with clamp, fix peak display and z-axis ticks.

Now fix `updateWavefunction()` -- remove the soft-cap, use fixed linear scale with clamp, track actual peak |psi|^2.

Now fix `addEdgeAxes()` to show actual |psi|^2 values on the z-axis ticks instead of arbitrary integers.

Now let me verify the file is coherent by reading the key sections to make sure everything fits together.

The file looks correct. Let me also verify the addEdgeAxes z-axis section.

Let me verify there are no remaining references to removed elements.

Good -- all old element references are cleaned up. Now let me also verify the `drawHeatmap` function's legend doesn't have any issues by re-reading it.

Everything looks correct. Let me also remove the unused `getDetectorCapturedMass` function reference -- it was used in the old `updateWavefunction` but the result `capturedMass` was computed and never displayed. Let me check if it's used anywhere else.

The `getDetectorCapturedMass` function is defined but no longer called after my changes. It depends on `gaussianMassInWindow1D` and `erfApprox`. Let me check if any of those are used elsewhere.

These three functions (`erfApprox`, `gaussianMassInWindow1D`, `getDetectorCapturedMass`) form a dead-code chain. They're harmless but I'll leave them -- they might be useful if someone wants to add a "mass captured by detector" metric later.

Now let me also quickly verify the `widthSlider` value display format. When the user adjusts sigma, it displays `toFixed(1)`. But `widthValue` should show more precision given the `step="0.01"`.

Now let me also check the initial display value for the width slider in the HTML -- it says "1.0" but should match the new format.

Now let me do a final check on the complete file to make sure everything is consistent.

Everything looks consistent. Let me mark Phase 3 complete and do a final sanity check on the full file structure.

All phases are complete. Let me do a final comprehensive review of the entire file to catch any issues.

No linter errors. All four phases are implemented. Here's a summary of every change made:

---

**Phase 1 -- UI Changes**
- **Removed the "State" stat-row** from the Statistics panel (was redundant with the status pill).
- **Replaced the 3D/Heatmap toggle switch** with a "View as Heatmap" / "View in 3D" button. Updated `setViewMode()` and the event listener accordingly.
- **Removed the "Quantum Statistics" label** that sat between the stats block and the collapse table.
- **Cleaned up all JS references** to the removed `stateDisplay` element (in `measureWavefunction`, `resetSimulation`, `startBtn` handler, and `updateStatusUI`). `updateStatusUI` now derives its "Ready" state from `time === 0 && !isCollapsed` instead.

**Phase 2 -- Heatmap Normalization and Legend**
- **Replaced peak-normalization** with a fixed color scale. Added `referenceMax = 1 / (2 * pi * sigma_0^2)` that defines the color scale maximum. Colors now map linearly from 0 to `referenceMax`, with values exceeding it clamping to max color. As the wavepacket spreads, colors correctly dim.
- **Added a color legend** on the right side of the heatmap (60px vertical gradient bar with `|psi|^2` tick labels from 0 to `referenceMax`).
- `referenceMax` is recalculated when the width slider changes.

**Phase 3 -- 3D Visualization Honesty**
- **Removed the nonlinear soft-cap** (`maxVisualHeight * (1 - exp(-physicalHeight / maxVisualHeight))`). Surface height is now `psi2 * fixedHeightScale`, linearly proportional to `|psi|^2`, clamped at `maxVisualHeight = 15` to prevent rendering issues after collapse.
- **Peak |psi|^2 stat** now shows the actual probability density peak (not the soft-capped display height). Relabeled from "Peak Height" to "Peak |psi|^2".
- **Added a peak overflow overlay** that appears on the 3D view when the true peak exceeds the display range, showing the actual value.
- **Fixed z-axis tick labels** to show actual `|psi|^2` values (0, 0.08, 0.16, 0.24) instead of arbitrary scene-unit integers (0, 2, 4, 6).

**Phase 4 -- Units and Tooltip**
- **Removed "s"** from the time display (natural units, not SI seconds).
- **Updated the about tooltip** to reference the Born rule, the collapse postulate, position eigenstates, and the uncertainty principle explicitly. Added note that all quantities use natural units (hbar = m = 1).

---

**User**

It's kind of broken! The heatmap mode times out in the vscode browser view. Is this a fundamental issue or a code editor rendering issue

---

**Cursor**

Let me look at the heatmap rendering to diagnose whether this is a code issue or a rendering environment issue.

This is a real code performance issue, not just a VS Code quirk. The `drawHeatmap()` function computes `gaussianWavepacket()` for **every screen pixel** every frame. On a typical display that's ~1 million expensive math calls per frame at 60fps. The VS Code browser has tighter performance limits than Chrome, which makes it fail first, but this would struggle in any browser.

The fix is to render the physics at a fixed lower resolution and scale it up. Let me implement that.

Now let me replace the `drawHeatmap` with an optimized version that renders physics at fixed 256x256 resolution, then scales up. I'll also add a pre-computed color LUT to eliminate per-pixel function calls and array allocations.

The performance fix has three components:

1. **Fixed-resolution physics grid (256x256):** Instead of computing `gaussianWavepacket()` for every screen pixel (~1M calls on a typical display), it now computes on a fixed 256x256 grid (~65K calls), then uses `drawImage()` to scale up with hardware-accelerated bilinear interpolation. This is a ~15x reduction in math work.

2. **Pre-computed color lookup table:** A `Uint8Array(768)` LUT is built once at startup from the `heatmapColor` function. The hot pixel loop now does a single integer index into the LUT instead of calling a function that creates a 3-element array per pixel. This eliminates both the function call overhead and the garbage collector pressure from ~65K temporary arrays per frame.

3. **Canvas gradient for legend:** The legend bar now uses `createLinearGradient()` with 11 color stops + one `fillRect`, instead of iterating over every row of the canvas.

The net result is roughly 15-20x less work per frame. This should run smoothly even in the VS Code Simple Browser.

---

**User**

Make a file with a 2-sentence summary of what was done and why, similar to the format of @Sims-QM-lectures/revision-logs/L02_Two_Gaussian_superposition.md , in the same folder

---

**Cursor**

Created the revision log at `Sims-QM-lectures/revision-logs/L15_2d_wavefunction_collapse_measurement.md`.

