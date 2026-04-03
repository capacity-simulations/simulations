# Simulation audit plan for quantum mechanics
_Exported on 4/2/2026 at 19:03:14 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/general_specs.md @Sims-QM-lectures/QM_intro.tex  @Sims-v2/Transmission_probability_plot_updated_v1.html are given instructions in the general specs file to audit this simulation for correct physics, visualization, and adherence to the notes. It is from lecture 9, the 9th section in the QM_intro docs, on scattering. Produce a plan as specified in the "general specs" document for my review. 

Additionally, some simulation-specific changes: 
-Check the barrier diagram plot for correctness with the notes. Should it be 2a? Check the diagram for physical correctness, there seem to be numerical "beating" artifacts at high energy. 
-Display the E=U marker on the x axis, instead of as a line with a legend. @Sims-QM-lectures/L02_Single_Gaussian_plot.html:214 

---

**Cursor**

Now let me read the lecture notes to find the scattering section (Lecture 9).

Let me check if the notes cover the E > U (above barrier) case explicitly.

Now let me also check if there's an earlier version for comparison, and verify some specific details about the barrier diagram physics.

I now have a thorough understanding of the simulation code, the lecture notes, and the issues. Let me produce the audit plan.

---

**User**

Implement the plan for the file @Sims-QM-lectures/L09_Transmission_probability_plot_updated.html 

---

**Cursor**

The L09 file is identical to the Sims-v2 version. I'll now implement all the fixes from the plan. Let me work through them systematically.

I'll work through all edits from top to bottom of the file. Starting with the about panel, legend, barrier disclaimer, and current values HTML, then the JavaScript changes.

**Edit 1: About panel -- add hbar to formulas, scope note, and update descriptions (Issues 4, 6)**

**Edit 2: Remove E=U legend entry (Issue 3)**

**Edit 3: Generalize barrier disclaimer (Issue 8)**

**Edit 4: Add R row to Current Values panel (Issue 7)**

**Edit 5: Add R checkbox to Display panel (Issue 7)**

Now for the JavaScript changes. **Edit 6: Replace E=U vertical line with x-axis marker (Issue 3)**

**Edit 7: Adaptive sampling for main plot (Issue 9)**

**Edit 8: Add R curve drawing after T curve (Issue 7)**

**Edit 9: Add R to stats display (Issue 7)**

Now for the barrier diagram fixes. **Edit 10: Unify E and U vertical scales + fix wave aliasing + adjust wave positioning (Issues 1, 2)**

Now let me update the todos and verify the file is correct by reading the key sections.

HTML looks good. Let me verify the JavaScript changes for the E=U marker, R curve, and barrier diagram.

Good. Now let me verify the barrier diagram section.

I notice the E=U marker is drawn before the x-axis ticks, which means regular tick labels could overwrite it. Let me move it to draw after the axes so it's always visible. I also need to adjust its y-position to avoid overlapping with regular tick numbers.

Now add the E=U marker after the axis tick drawing, right before the T=1 line.

Now let me do a final validation read of the complete file to make sure everything is consistent.

Let me verify `bPx` is still defined where it needs to be, since I moved the E=U marker.

Good -- `bPx` is defined at line 575 as a `const` in function scope, well before the E=U marker code uses it at line 827. No scoping issue.

Now let me also check there's no leftover `rawDecayAtExit` unused variable warning in the barrier diagram code.

The `rawDecayAtExit` variable on line 1011 is unused. Let me clean it up while I'm here.

Now let me do a final check on the complete file structure to make sure everything is well-formed.

File structure is intact. Let me update the plan and todos to reflect completion.

All implementable fixes are complete. Here's a summary of what changed in `L09_Transmission_probability_plot_updated.html`:

---

**Issue 1 -- Barrier diagram E/U scale unification**: Replaced the nonlinear `barrierH` formula with `vScale * (U / maxE)`, using the same linear mapping as the energy level line. Now when E = U, the energy line exactly coincides with the barrier top. Wave amplitude reduced from `0.18` to `0.13` of plotH with clamping to prevent clipping at extreme energies.

**Issue 2 -- Wave aliasing fix**: Added a Nyquist-based cap on `kVisScaled`. The cap is computed dynamically from the actual pixel pitch: `kVisCap = (pi * 0.8) / (25 / plotW)`. This prevents the phase change per pixel from exceeding pi, eliminating the beating artifacts at high energy.

**Issue 3 -- E=U x-axis marker**: Removed the full-height dashed vertical line and its legend entry. Replaced it with a small upward-pointing triangle on the x-axis and a bold "E=U" label at y = `pa.y + pa.h + 32` (between tick labels and axis title). Drawn after the axes so it renders on top.

**Issue 4 -- Notation hbar**: Updated the about panel definitions to match the lecture:
- `eta = sqrt(2m(U-E)/hbar^2)`, `kappa = sqrt(2m(E-U)/hbar^2)`, `E = hbar^2 k^2 / (2m)`
- Added note: "The simulation sets hbar = 1 in the computation."

**Issue 5 -- Units**: Deferred -- marked REQUIRES REVIEW. Needs instructor decision between dimensionless labels vs physical unit conversion factors.

**Issue 6 -- E > U scope disclosure**: Added note in the about panel: the E < U formula is labeled "derived in Lecture 9" and the E > U formula is labeled "obtained by substituting eta -> i*kappa", with an explicit note that this extends the lecture derivation.

**Issue 7 -- Reflection coefficient R**: Added a "Reflection R = 1 - T" checkbox in the Display panel (off by default). When enabled, draws R = 1 - T as a pink curve with glow, and shows a legend entry. Added an `R = 1 - T` row in the Current Values panel (always visible).

**Issue 8 -- Barrier disclaimer**: Generalized to cover both E < U ("superposition of growing and decaying exponentials") and E > U ("different wavenumber inside the barrier with both forward and reflected components").

**Issue 9 -- Adaptive sampling**: The sample count N now depends on `params.a` via the estimated number of above-barrier oscillations: `oscillations = 2a * kappa_max / pi`, with at least 12 samples per oscillation. Cap raised from 12000 to 30000 to accommodate large barrier widths.

---

**User**

The resolution for the waves is quite low (looks jagged). Can you fix this to make it more smooth?

---

**Cursor**

The jaggedness is because all three wave drawing loops step in 1-pixel increments. On high-DPI displays especially, this produces visible angular segments. I'll switch all wave paths to sub-pixel sampling (0.5px steps) for smooth curves.

All three wave paths (incident, transmitted, and inside-barrier for both E < U and E >= U) now sample at 0.5 CSS-pixel increments instead of 1px. This doubles the path resolution, producing noticeably smoother curves -- especially visible on high-DPI/Retina displays where the old 1px steps created visible angles at wave peaks and troughs.

---

**User**

make the barrier diagram automatically show below the main plot, instead of in the sidebar. remove the text and just say "Barrier diagram (schematic)"

---

**Cursor**

I'll move the barrier diagram from the sidebar to a strip below the main plot. This involves restructuring the HTML layout, updating CSS, and adjusting the `resizeBarrier()` function.

Now move the barrier canvas from the sidebar into the main area, and wrap the plot canvas in a container.

Now remove the old barrier-related CSS that's no longer needed and update `resizeCanvas` and `resizeBarrier` since the parent elements changed.

Now update `resizeCanvas` to use `.plot-container` as the parent for the plot canvas, and update `resizeBarrier` for the new parent.

Now update the mobile responsive layout since the barrier is no longer in the sidebar.

Now remove the `.barrier-note` CSS class since the disclaimer text has been removed from the HTML.

Also remove the light-theme `.barrier-note` rule.

Now I need to update the `resizeCanvas` call for the plot canvas, since its parent is now `.plot-container` instead of `.main-area` directly. The `resizeCanvas` function uses `canvas.parentElement.getBoundingClientRect()` which will now correctly pick up `.plot-container`. Let me verify this is working correctly by checking the function.

Good -- `resizeCanvas` uses `canvas.parentElement` which will be `.plot-container` for the plot canvas. That's correct.

Now let me also update the about panel text to remove the reference to "sidebar barrier sketch".

Let me verify the final HTML structure is correct.

The layout is clean. The barrier panel is gone from the sidebar, and the main area has the plot container + barrier strip. Let me also verify the CSS is well-formed by checking the barrier-strip and light-theme rules.

Everything looks good. The barrier diagram now sits in a 120px-tall strip below the main plot, with a subtle "BARRIER DIAGRAM (SCHEMATIC)" label overlay, and no descriptive text. The sidebar is freed up for just controls and values.

---

**User**

Make the U barrier height show on the side instead of the top (similar to how the 2a is labelled)

---

**Cursor**

Now let me also look at how the 2a annotation is done, so I can match the style.

I can see the 2a annotation uses horizontal end-caps with a connecting line and a centered label. I'll replace the "U" label above the barrier with a vertical dimension annotation on the right side of the barrier, using the same style: vertical end-caps at the top and bottom of the barrier, a connecting vertical line, and "U" centered beside it.

The "U" label is now a vertical dimension annotation on the right side of the barrier rectangle, matching the style of the "2a" horizontal annotation below -- with end-cap ticks at the top and bottom of the barrier, a connecting vertical line, and "U" labeled to the right.

---

**User**

For each of the plot view modes, display the relevant equation after the parameters section (T(k) or T(E)):

@QM_intro.tex (1690-1709) 

---

**Cursor**

I'll add an equation panel between the Parameters and Current Values panels that switches content based on the view mode, displaying the T(E) or T(k) formulas from the lecture notes.

Now I need to add CSS for the equation block and update the KaTeX rendering to include this new panel. Let me also update the `setMode()` function to toggle the equation blocks.

Good. Now let me make the three remaining changes: CSS for the equation block, KaTeX rendering scope, and `setMode()` toggling.

Now update the KaTeX auto-render to also cover the equation panel:

Now update `setMode()` to toggle the equation blocks:

Now let me also check if the light theme CSS needs an update for the equation panel text colors:

The inline text colors (#94a3b8 and #64748b) work reasonably in both themes since they're neutral slates. Let me add a light-theme override for better contrast on the equation helper text:

Actually, let me use a cleaner approach with proper class names instead of attribute selectors on inline styles:

Now update the HTML to use those class names:

Let me verify the final result by reading the relevant sections:

Everything looks good. Here's a summary of the changes:

**New "Equation" panel** added to the sidebar between "Parameters" and "Current Values":

- **T vs E mode**: Shows the exact transmission formula \(T(E)\) from the lecture notes, with definitions \(k^2 = 2mE/\hbar^2\) and \(\eta^2 = 2m(U-E)/\hbar^2\), plus the low-energy approximation \(T \approx f(E)\,e^{-\frac{4a}{\hbar}\sqrt{2m(U-E)}}\) for \(\eta a \gg 1\).

- **T vs k mode**: Shows the same core formula as \(T(k)\), with definitions \(E = \hbar^2 k^2/2m\) and \(\eta = \sqrt{2m(U-E)/\hbar^2}\).

The panel automatically switches content when the user toggles between "T vs E" and "T vs k" view modes. KaTeX renders the math in both blocks at page load, and light-theme overrides ensure readable contrast in both themes.

---

**User**

Make the display font for both lines of the "equation" display the same

---

**Cursor**

The definitions line is currently set to 11px while the main formula container is 13px. I'll make them match by removing the smaller font-size from the `eq-def` divs.

Both lines now use the same `math-block` class with display math (`\[ \]`), so they render at the same size and style. I also switched the definitions from inline notation (e.g. `k² = 2mE/ℏ²`) to proper fractions to match the formatting of the main formula.

---

**User**

Make a file with a 2-sentence summary of what was done and why, similar to the format of @Sims-QM-lectures/revision-logs/L02_Two_Gaussian_superposition.md , in the same folder

---

**Cursor**

Created `revision-logs/L09_Transmission_probability_plot.md` with a two-sentence summary covering the physics audit fixes and the UI/layout changes.

