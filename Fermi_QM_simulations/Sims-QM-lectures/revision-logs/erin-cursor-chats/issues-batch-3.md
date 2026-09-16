# Issues Batch 3

---

### cursor_jagged_wavepacket_appearance.md

**Sim file:** L06_Time_evolution_Gaussian_wavepacket_v2.html
**User requests in session:** 3

**Issues:**
1. **Issue:** Wavepacket oscillations look visibly jagged due to insufficient grid points per wavelength for the canvas polyline rendering.
   **Why it matters:** Students may mistake a rendering artifact for real physics (e.g., thinking the wavefunction is discontinuous), undermining trust in the simulation. Also, it looks sloppy and unprofessional.
   **Flag:** clear

2. **Issue:** Normalization prefactor in the wavefunction computation was incorrect, causing the displayed norm to read ~0.5 instead of 1.0 and wrong peak |ψ|² values.
   **Why it matters:** A wavefunction that isn't normalized to 1 gives wrong probability densities — the most fundamental observable in QM.
   **Flag:** clear

3. **Issue:** The α(t) formula in the "About This Simulation" section used the wrong first term for the σ convention used by the code. 
   **Why it matters:** Students reading the About section would see a formula inconsistent with the code's actual computation; the user was concerned this error might have propagated into the solver itself. The agent argued that the About section was actually correct for the code's convention; however, this presents a different problem -- the sim is not aligned with the lecture note's conventions. 
   **Flag:** clear

---

### cursor_lecture_03_simulation_developmen.md

**Sim file:** L03_classical-vs-schrodinger.html
**User requests in session:** 7

**Issues:**
1. **Issue:** The simulation describes probability tails beyond classical turning points as "quantum tunneling," which is inaccurate for a bound harmonic oscillator.
   **Why it matters:** Tunneling implies escape through/across a barrier; here the particle is still trapped. Using the wrong term teaches students an incorrect definition of tunneling.
   **Flag:** clear

2. **Issue:** The equations of motion for both classical and quantum cases were not visibly displayed in the simulation.
   **Why it matters:** The whole point of Lecture 03 is comparing F=ma to the Schrödinger equation — hiding the equations undermines the central pedagogical comparison.
   **Flag:** clear

3. **Issue:** No hover tooltips to distinguish classical position x(t) from quantum expectation value ⟨x⟩(t).
   **Why it matters:** Students need to understand that "position" means fundamentally different things in each column — one is a definite trajectory, the other is an expectation value of a probability distribution.
   **Flag:** clear

4. **Issue:** The shared "Energy (E)" slider was physically ambiguous — it mixed classical and quantum meanings of energy, and the coherent state is not an energy eigenstate.
   **Why it matters:** Using energy as the shared control parameter obscures the clean comparison; amplitude A is the physically meaningful shared quantity since both the classical trajectory and the coherent-state center follow x(t) = A cos(ωt).
   **Flag:** clear

5. **Issue:** Coherent-state wavefunction appeared squared/flat at the top at large mass values due to nonlinear peak compression in the renderer.
   **Why it matters:** Distorting a Gaussian into a flat-topped shape is a physics misrepresentation — the coherent state must remain Gaussian at all parameter values.
   **Flag:** clear

6. **Issue:** KaTeX integration broke the simulation entirely — raw LaTeX was displayed and plots disappeared.
   **Why it matters:** A broken simulation is unusable for teaching; the integration approach (auto-render) was incompatible with the page's runtime.
   **Flag:** clear

7. **Issue:** The potential and plot canvases on the classical and quantum sides were not at the same vertical height.
   **Why it matters:** Aligning the plots vertically lets students directly compare turning points and wavefunction extent against the potential — the visual alignment is the mechanism for building intuition about classical vs. quantum motion in the same potential. Also, it looks sloppy and unprofessional.
   **Flag:** clear

---

**Sim file:** L03_classical-vs-schrodinger-ANHARMONIC.html
**User requests in session:** 7

**Issues:**
1. **Issue:** Anharmonic sim used different slider parameters (speed, epsilon, x₀, sigma) than the harmonic sim, making the two Lecture 03 sims inconsistent.
   **Why it matters:** Students switching between the two sims would face different control schemes for what is conceptually the same comparison (classical vs. quantum in a potential); consistency reduces cognitive load.
   **Flag:** clear

2. **Issue:** Numerical solver had no diagnostics or automatic stop criteria — the simulation could continue running even when numerical artifacts (norm drift, energy drift, wrap-around) dominated the physics.
   **Why it matters:** Students would see numerical garbage and potentially interpret it as real anharmonic dynamics, which is worse than showing nothing.
   **Flag:** clear

3. **Issue:** Wavefunction rendering looked very jagged due to insufficient spatial mesh resolution.
   **Why it matters:** Same as the wavepacket sim — jagged rendering can be mistaken for real physics and looks unprofessional.
   **Flag:** clear

4. **Issue:** Y-axis had no numeric labels, so the energy scale was unreadable.
   **Why it matters:** Without axis numbers, students cannot read off quantitative values or verify that energy levels and potential heights are physically reasonable.
   **Flag:** clear

5. **Issue:** Axis labels overlapped badly, making the plot unreadable.
   **Why it matters:** Overlapping text makes the simulation look broken and prevents students from reading the axes at all.
   **Flag:** clear

6. **Issue:** FFT-based solver used a periodic box that was too small, allowing unphysical wrap-around of the wavefunction.
   **Why it matters:** Wrap-around is a numerical artifact of the FFT method, not real physics; a larger box and absorbing boundary layer are needed to prevent the simulation from showing false interference from periodic images.
   **Flag:** clear

---

### cursor_lecture_04_simulation_update_and.md

**Sim file:** L04_Two_Gaussian_wavefunction_collapse.html
**User requests in session:** 4

**Issues:**
1. **Issue:** Simulation was not aligned with the updated Lecture 02 framing or the Lecture 04 notes — title, displayed equations, and explanatory text were generic rather than lecture-specific.
   **Why it matters:** A sim that doesn't match the lecture's notation and framing forces students to mentally translate between two presentations, reducing the sim's pedagogical value.
   **Flag:** clear

2. **Issue:** Post-measurement collapsed view used three plots with redundant/confusing information — the green "before measurement" curve appeared in different plot positions before and after collapse, and the bottom two plots showed nearly the same thing.
   **Why it matters:** Students seeing the same curve jump between plot positions and seeing two near-identical post-measurement plots would be confused about what measurement actually changed.
   **Flag:** clear

3. **Issue:** The post-measurement display implied the superposition survived measurement by showing component-based collapsed plots rather than a single localized state.
   **Why it matters:** The entire point of the collapse demonstration is that the superposition is destroyed by measurement; a display that still shows the original components contradicts the physics lesson.
   **Flag:** clear

4. **Issue:** Post-measurement state was previously shown as a delta-like spike rather than a localized Gaussian with the same localization parameter `a` used in the notes.
   **Why it matters:** A delta spike is an idealization that doesn't match the Lecture 04 formalism; using the same parameter `a` keeps the sim consistent with what students see in the notes.
   **Flag:** clear

---

### cursor_physics_check_for_lecture_02_sim.md

**Sim file:** L02_Two_Gaussian_wave_superposition.html
**User requests in session:** 5

**Issues:**
1. **Issue:** The wavefunction forms ψ₁(x), ψ₂(x), and Ψ(x) were not displayed anywhere, so users couldn't tell that α and β only affect the superposition and not the individual component shapes.
   **Why it matters:** Without seeing the equation, students adjusting α and β sliders have no way to understand what those parameters do — the sim becomes a black box instead of a teaching tool.
   **Flag:** clear

2. **Issue:** The displayed equation included a relative phase term that does not appear in the Lecture 02 notes.
   **Why it matters:** Lecture 02 uses a strictly in-phase superposition; showing a phase that doesn't exist in the notes introduces a concept students haven't been taught yet and creates a mismatch between sim and lecture.
   **Flag:** clear

3. **Issue:** The "State Properties" section was cluttering the interface with information the reviewer didn't want shown.
   **Why it matters:** Extraneous readouts distract from the core physics lesson and add visual noise to the control panel.
   **Flag:** clear

4. **Issue:** The equation display showed numeric substitutions (actual slider values plugged in) instead of purely symbolic forms.
   **Why it matters:** Showing numbers instead of symbols shifts focus from the mathematical structure to specific parameter values, which may not be the intended emphasis for Lecture 02. It is more useful to see the equations in their symbolic form so students can see the relationship between the parameters and the wavefunction.
   **Flag:** clear

---

### cursor_plot_axis_adjustments_for_harmon.md

**Sim file:** L07_harmonic-oscillator.html
**User requests in session:** 5

**Issues:**
1. **Issue:** All plots had excessive wasted x-axis space — the x-range was much wider than needed to show the wavefunctions.
   **Why it matters:** Wasted space compresses the interesting region of the wavefunction into a small part of the plot, making features harder to see and the simulation less useful for teaching.
   **Flag:** clear

2. **Issue:** The bottom two plots (wavefunction and probability density) had excessive wasted y-axis space.
   **Why it matters:** Same as above — compressing the signal into a fraction of the available plot area makes features hard to read.
   **Flag:** clear

3. **Issue:** X-tick labels overlapped at small mass values due to a wide x-range with fixed tick spacing.
   **Why it matters:** Overlapping labels make the axis unreadable and the simulation look broken.
   **Flag:** clear

4. **Issue:** ψ(x,t) and |ψ|² in the plot titles were rendered in all capital letters due to a CSS `text-transform: uppercase` rule applied to the whole title.
   **Why it matters:** Capitalizing Greek letters and mathematical notation is incorrect — Ψ (capital psi) and ψ (lowercase psi) are different symbols in physics.
   **Flag:** clear

5. **Issue:** The energy axis on the potential plot was scaled by ℏω (dimensionless units) instead of showing absolute energy values.
   **Why it matters:** Presenting the axis in natural units (ℏω) may be standard for some contexts, but the reviewer wanted students to see actual energy values so the levels and potential can be read directly. Since omega is a parameter slider, scaling the axis by ℏω made how the energy levels and potential scales with respect to omega confusing.
   **Flag:** clear
   
6. **Issue:** The potential plot y-axis was scaling dynamically with the current ω value, making the axis range change as students adjust sliders.
   **Why it matters:** A moving axis makes it hard to build intuition about how energy levels change with parameters — students can't tell if the levels moved or the axis moved.
   **Flag:** clear
