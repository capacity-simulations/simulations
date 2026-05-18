# Issues Batch 1

---

### cursor_3d_wavefunction_visualization_on.md

**Sim file:** `L05_particle-on-a-circle.html`
**User requests in session:** 3

**Issues:**

1. **Issue:** The "Show on Ring" visualization was rendered in 2D instead of a 3D perspective with the ring in the x-y plane and wavefunction magnitude in the z direction.
   **Why it matters:** A 3D view lets students see the complex wavefunction's real and imaginary parts as height oscillations on a physical ring, giving better intuition than a 2D circle, with the wavefunctions shown as radial deformations off of the circle -- the latter distorts the shape/intuition of the wavefunction.
   **Flag:** clear

2. **Issue:** The default 3D camera was too zoomed out, making the ring visualization too small on screen.
   **Why it matters:** Students can't see detail in the wavefunction shape if the default view is too far away.
   **Flag:** clear

3. **Issue:** Perspective projection made equal-amplitude regions of the wavefunction appear to have different amplitudes depending on depth relative to the viewer.
   **Why it matters:** This is physically misleading — it makes a constant-amplitude eigenstate look like it has varying amplitude, which directly contradicts the physics. The user flagged this as "physically wrong."
   **Flag:** clear

4. **Issue:** The ring was visually displaying as very zoomed out. 
   **Why it matters:** It is very zoomed out/hard to see, and the user has to manually zoom in before they can meaningfully interact with the sim.
   **Flag:** clear

---

### cursor_a_k_plot_mismatch_with_lecture_n.md

**Sim file:** `L06_A(k)-vs-k-plot.html`
**User requests in session:** 1

**Issues:**

1. **Issue:** The plotted A(k) function did not match the definition given in the lecture notes (QM_intro.tex, line 888–889); the simulation used a different Gaussian prefactor and exponent denominator.
   **Why it matters:** The simulation is supposed to visualize the exact expression from class. Plotting a different function means students studying the sim are looking at a formula that contradicts what's on the board.
   **Flag:** clear

---

### cursor_double_slit_experiment_line_disp.md

**Sim file:** `L04_double-slit-experiment.html`
**User requests in session:** 2

**Issues:**

1. **Issue:** Mode-specific explanatory text in the "About" info tooltip was visible in both quantum and classical modes instead of only appearing in the relevant mode.
   **Why it matters:** Showing both descriptions simultaneously is confusing — students see a quantum explanation while in classical mode (and vice versa), which undermines the conceptual separation the toggle is meant to teach.
   **Flag:** clear

2. **Issue:** The chart description text below the plot also did not switch when toggling between quantum and classical mode.
   **Why it matters:** Same as above — the sidebar text should track the active mode so the written explanation matches what the student is seeing in the visualization. The user flagged this as "confusing".
   **Flag:** clear

---

### cursor_double_slit_experiment_simulatio.md

**Sim file:** `L04_double-slit-experiment.html`
**User requests in session:** 7

**Issues:**

1. **Issue:** The histogram and theoretical curves were peak-normalized (divided by their max value) rather than density-normalized (count / total / bin_width).
   **Why it matters:** Peak normalization can make the overlay look visually aligned while having the wrong integrated probability — the general specs explicitly require density normalization so the chart can be read as a probability density comparison.
   **Flag:** clear

2. **Issue:** The classical visual sampler fell back to a uniform random screen position after 28 failed rejection attempts, injecting off-model hits into regions where the classical density should be zero.
   **Why it matters:** At default settings ~18% of classical hits came from this fallback (up to ~37% at slider extremes), directly causing the reported symptom of orange dots appearing where the density plot says they shouldn't.
   **Flag:** clear

3. **Issue:** Classical particles did not retain which slit they passed through — a pellet entering the left slit could land on the right hump because the landing position was sampled from the combined P₁+P₂ distribution instead of the single-slit branch.
   **Why it matters:** The lecture explicitly states "classical balls obviously only go through one slit or the other." Sampling from the joint distribution makes the classical mode behave non-classically.
   **Flag:** clear

5. **Issue:** The orange "classical" theoretical curve used a heuristic Gaussian model (σ ∝ a + cL) that was not grounded in the lecture notes, and the reasoning for the fact that this model was chosen was obscured from the user. It risks being presented as if it were the lecture's theoretical prediction, which is not correct.
   **Why it matters:** Students could mistake an ad hoc visualization model for an actual derivation from the course material.
   **Flag:** clear

6. **Issue:** The user directed that the classical distribution should be the incoherent sum of two single-slit distributions with no interference (P₁ + P₂), referencing Feynman Lectures III, sec. 1-2.
   **Why it matters:** The user wanted the orange mode to match the Feynman pedagogical framing — classical bullets where probabilities add directly, not a wave-based model with the interference term removed.
   **Flag:** clear

7. **Issue:** Slit separation (d) had no effect on the classical pattern — even setting d = 16,000 nm produced an unchanged curve, when the user expected two separated lobes at large separation.
   **Why it matters:** If d doesn't affect the classical pattern, the sim can't demonstrate the key visual contrast between "two lumps that move apart" (classical) and "interference fringes" (quantum). This was a direct consequence of the implemented model ignoring d.
   **Flag:** clear

8. **Issue:** After the geometric bullets model was implemented, the classical lobes had a boxy/trapezoidal shape (from uniform-convolution math) instead of smooth curves.
   **Why it matters:** The user called this "absolutely terrible" — the harsh square shape looked unphysical and ugly, undermining credibility. A smooth Gaussian-like shape is both more physically plausible for a realistic particle beam and visually clearer.
   **Flag:** clear

---

### cursor_dynamic_y_axis_scaling_removal1.md

**Sim file:** `Sims-v2/gaussian-distribution.html`
**User requests in session:** 2

**Issues:**

1. **Issue:** The y-axis dynamically rescaled as histogram samples accumulated, causing the axis to jump around during the simulation.
   **Why it matters:** A shifting y-axis is visually distracting and makes it hard for students to build intuition about the convergence of the empirical histogram to the theoretical curve, because the "target" keeps moving.
   **Flag:** clear

2. **Issue:** The histogram was not properly normalized as a probability density: the denominator included out-of-range samples, a 3-point smoothing filter artificially flattened the peak, and a forced renormalization step masked both errors.
   **Why it matters:** The whole point of the simulation is to show empirical convergence to a theoretical Gaussian PDF. If the histogram isn't a valid probability density estimator, the visual "agreement" with the curve is an artifact of the forced renormalization, not genuine convergence — students would be watching a lie.
   **Flag:** clear
