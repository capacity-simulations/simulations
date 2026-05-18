# Issues Batch 2

---

### cursor_equations_section_removal_from_h.md

**Sim file:** `L02_Single_Gaussian_plot.html`
**User requests in session:** 2

**Issues:**

1. **Issue:** The sim displayed an "Equations" section that needed to be removed entirely (HTML, JS, and CSS).
   **Why it matters:** Likely a pedagogical simplification — removing the equations panel keeps the visual focus on the interactive plot rather than duplicating formulas students already see in the lecture notes. The lecturer requested this be done to have a cleaner interface to show the main plot and sliders.
   **Flag:** clear

2. **Issue:** Positive slider readout values were displayed with an explicit "+" prefix (e.g., "+2.00" for X₁ center position).
   **Why it matters:** The "+" sign is unconventional for displaying position values and could be visually confusing or suggest the value has special signed significance when it's just a coordinate.
   **Flag:** clear

---

### cursor_free_particle_wavefunction_modif.md

**Sim file:** `L05_plane_wave_plots.html`
**User requests in session:** 4

**Issues:**

1. **Issue:** The simulation showed "Particle on a Circle" content but needed to be completely converted to a free particle (V=0) wavefunction visualization, with k as the selectable parameter, equations for energy/wavelength/momentum, and the "Show on Circle" feature removed.
   **Why it matters:** The existing sim covered a different topic. The lecture needed a free-particle sim showing plane wave solutions ψ(x) = e^(ikx), the dispersion relation E = ℏ²k²/2m, the de Broglie wavelength, and the momentum relation — none of which were present in the original file.
   **Flag:** clear

2. **Issue:** The dispersion relation plot had a hardcoded x-axis range (kRange = 12) that didn't match the k slider's actual bounds after the user changed them.
   **Why it matters:** A dispersion plot whose axis range doesn't match the available k values is misleading — students would see a parabola that extends far beyond the accessible parameter space, or the current-k marker would be crammed into a tiny corner of the plot.
   **Flag:** clear

3. **Issue:** The energy label on the highlighted point in the dispersion relation plot was cut off on the right-hand side due to insufficient padding.
   **Why it matters:** If the "E = ..." annotation is clipped, students can't read the current energy value, which defeats the purpose of the interactive readout.
   **Flag:** clear

---

### cursor_gaussian_in_a_box_simulation_int.md

**Sim file:** `L13_Fourier-series.html`
**User requests in session:** 3

**Issues:**


1. **Issue:** The dashed target-wave overlay line was too thin (2px) to be visible behind the partial sum trace that was drawn on top of it.
   **Why it matters:** If students can't see the target function behind the approximation, they lose the key visual comparison — how well the partial sum is tracking the function it's supposed to converge to.
   **Flag:** clear

---

### cursor_histogram_implementation_verific.md

**Sim file:** `L04_double-slit-experiment.html`
**User requests in session:** 3

**Issues:**

1. **Issue:** The theory overlay curve was drawn with Chart.js Bézier smoothing (tension: 0.4), which created artificial overshoot between histogram bins and made the theory curve appear systematically higher than the histogram.
   **Why it matters:** Visual smoothing that pushes the theory line above the bars makes a correctly sampled histogram look like it's undershooting, creating a false impression that the simulation's sampling is wrong.
   **Flag:** clear

2. **Issue:** Both the histogram and theory curve used peak normalization (dividing by max value) instead of area normalization (dividing by total count), so they weren't representing comparable probability distributions — the user explicitly identified this as the core problem.
   **Why it matters:** With peak normalization, the histogram and theory can agree at their maxima but disagree everywhere else, especially at early times when the noisiest bin happens to set the scale. Area normalization ensures both curves integrate to the same value, which is the physically meaningful comparison for probability distributions.
   **Flag:** clear

3. **Issue:** After the normalization fix was applied, the user reported it was "still undershooting" — but the browser preview was rendering a stale cached version of the file, not the updated code.
   **Why it matters:** This is a workflow/tooling issue rather than a sim bug, but it caused a wasted debugging cycle. The agent correctly diagnosed that the y-axis label still read "Normalized Intensity" (old code) instead of "Probability Per Bin" (new code).
   **Flag:** clear

---

### cursor_html_file_modifications_for_gaus.md

**Sim file:** `L02_Single_Gaussian_plot.html`
**User requests in session:** 3

**Issues:**


1. **Issue:** Toggling to "Real part" view expanded the y-axis to include negative values, even though the real part of this single centered Gaussian is always positive.
   **Why it matters:** Expanding to a ±y range when the data never goes negative wastes half the plot area on empty space and visually shrinks the wavefunction, making it harder to see detail.
   **Flag:** clear

2. **Issue:** The y-axis rescaled when switching between "Probability" and "Real part" views, so the plot jumped visually on every toggle.
   **Why it matters:** A shifting y-axis makes it impossible to visually compare the two views — students can't tell whether the real part is taller or shorter than |ψ|² if the axis changes every time they switch. A fixed shared scale lets them see the shape difference directly.
   **Flag:** clear
