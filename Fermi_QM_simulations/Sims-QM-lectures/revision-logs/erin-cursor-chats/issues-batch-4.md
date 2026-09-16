# Issues Batch 4

---

### cursor_plot_simplification_requirements.md

**Sim file:** L06_A(k)-vs-k-plot.html
**User requests in session:** 5

**Issues:**
1. **Issue:** Simulation displayed "nm" units throughout (slider labels, KaTeX snippets, canvas annotations), which should be dimensionless.
   **Why it matters:** These are pedagogical sims using natural/dimensionless units; showing nm implies a specific physical scale that isn't intended.
   **Flag:** clear

2. **Issue:** Plot legend and annotation overlays (peak line, ±σ/±2σ dashes, k₀ label) cluttered the visualization.
   **Why it matters:** Excess visual chrome competes with the core Gaussian shape the student should be focused on. The lecturer requested a cleaner interface. 
   **Flag:** clear

3. **Issue:** k₀ and σ numerical values were displayed below the live formula in a separate row.
   **Why it matters:** Likely redundant with slider readouts; removing streamlines the interface.
   **Flag:** clear

4. **Issue:** The probe feature drew a vertical line across the plot, which was visually distracting; only the click-to-read-value functionality was wanted.
   **Why it matters:** A full vertical line dominates the plot area/may distract from the plot, and is not needed when the user only needs a point readout.
   **Flag:** clear

5. **Issue:** Minimum σ slider value was too low (0.25), allowing unrealistically narrow Gaussians.
   **Why it matters:** Very narrow Gaussians were blowing up very high in the y-direction, and not using much of the x-space. We don't want to dynamically scale axes since that can obscure how the sliders change the shape of the Gaussian; 0.6 is a more pedagogically useful lower bound in this case.
   **Flag:** clear

6. **Issue:** Y-axis maximum was too high (1.40), leaving wasted whitespace above the curve.
   **Why it matters:** A max of 1.0 makes the Gaussian peak fill more of the plot area, giving a clearer visual of the shape.
   **Flag:** clear

7. **Issue:** A glowing/pulsing animated dot sat at the Gaussian peak, along with sparkle particles along the curve.
   **Why it matters:** Decorative animations distract from the physics and add unnecessary CPU load; the sim should look clean and scientific.
   **Flag:** clear

8. **Issue:** The interactive readout feature was labeled "probe," which is jargon-heavy/possibly inappropriate for a student audience; reviewer requested renaming to "marker."
   **Why it matters:** "Marker" is more intuitive for students than "probe" as a label for a movable readout point.
   **Flag:** clear

---

### cursor_removal_of_nm_units_in_html_file.md

**Sim file:** L02_Two_Gaussian_superposition.html
**User requests in session:** 7

**Issues:**
1. **Issue:** Simulation displayed "nm" units on sliders, axis labels, and readouts, which should be dimensionless.
   **Why it matters:** Same as L06 — these sims use natural/dimensionless units; explicit nm units imply an unintended physical scale. The user requested this be done to have a cleaner interface to show the main plot and sliders.
   **Flag:** clear

2. **Issue:** Positive slider readout values (X₁, X₂) displayed with an explicit "+" prefix (e.g., "+2.00").
   **Why it matters:** The leading "+" is unconventional for position readouts and adds visual noise; standard convention shows positive numbers without a sign.
   **Flag:** clear

3. **Issue:** Small min/mid/max tick labels below each slider added visual clutter.
   **Why it matters:** The slider position and the readout value already communicate the setting; the tick marks are redundant and crowd the controls panel. The user requested this be done to have a cleaner interface to show the main plot and sliders.
   **Flag:** clear

4. **Issue:** Bottom plot y-axis auto-scaling let the data peak fill the entire vertical extent, leaving no headroom.
   **Why it matters:** When the peak touches the top of the plot, it's hard to see the shape near the maximum; placing the peak at ~75% height preserves context and makes the curve shape clearer.
   **Flag:** clear

5. **Issue:** σ_x was displayed as a derived readout alongside the "a (localization)" slider.
   **Why it matters:** Showing σ_x alongside the localization parameter adds a secondary quantity the student doesn't need/know at this stage; keeping the display minimal focuses attention.
   **Flag:** clear

6. **Issue:** The "Lecture 02 Model" section and equations occupied permanent space in the right-hand sidebar panel.
   **Why it matters:** Equations that are reference material, not interactive controls, belong behind an info button so the main interface stays uncluttered and the student can focus on the visualization.
   **Flag:** clear

7. **Issue:** On initial load and after reset, the three-plot layout showed all plots equally sized instead of defaulting to the bottom (superposition) plot maximized.
   **Why it matters:** The superposition plot is the key pedagogical output — the student should see it prominently by default rather than having to manually maximize it.
   **Flag:** clear

---

### cursor_simulation_accuracy_and_content.md

**Sim file:** L04_double-slit-experiment.html
**User requests in session:** 2

**Issues:**
1. **Issue:** The simulation's physics model had not been rigorously verified; the classical comparison used an ad hoc Gaussian rather than a physically motivated model.
   **Why it matters:** Students seeing an incorrect or unmotivated classical comparison will form wrong intuitions about what distinguishes quantum from classical behavior.
   **Flag:** clear

2. **Issue:** The simulation content did not match the lecture notes — it was a quantitative far-field fringe demo missing the lecture's three-part narrative (classical particles, classical waves, quantum behavior) and the measurement/collapse story.
   **Why it matters:** The sim is meant to accompany specific lecture material; if it doesn't cover the same modes and conceptual progression, students can't use it to reinforce what they learned in lecture.
   **Flag:** clear

3. **Issue:** The simulation lacked explicit lecture modes (classical particles, classical wave, quantum unobserved, quantum which-path measured) and slit configuration options (both slits, left only, right only).
   **Why it matters:** Without these modes, the sim can't demonstrate the key conceptual contrasts the lecture builds on — especially the transition from I ∝ |ψ₁ + ψ₂|² (interference) to I ∝ |ψ₁|² + |ψ₂|² (which-path measurement).
   **Flag:** clear

---

### cursor_simulation_audit_and_adjustments.md

**Sim file:** L08_Bound_states.html
**User requests in session:** 6

**Issues:**
1. **Issue:** Maximum well depth slider went too high; reviewer requested reducing it to ~32.
   **Why it matters:** Excessively deep wells produce many bound states that clutter the display and go beyond what's pedagogically useful at this stage.
   **Flag:** clear

2. **Issue:** Left panel was labeled "Physical space," which is vague; reviewer wanted "Potential and wavefunctions."
   **Why it matters:** A descriptive panel title tells the student exactly what they're looking at.
   **Flag:** clear

3. **Issue:** Right panel was labeled "Energy level solutions" instead of "η(k) vs k plot."
   **Why it matters:** The specific mathematical label matches the lecture notation and tells the student what the axes represent.
   **Flag:** clear

4. **Issue:** The potential was drawn with V = 0 inside the well and V = V₀ outside, which is the opposite of the lecture convention (V = −V₀ inside, V = 0 outside).
   **Why it matters:** If the sim uses a different energy reference than the lecture, students will be confused when comparing energy expressions and level diagrams between the two.
   **Flag:** clear

5. **Issue:** Wavefunctions were being normalized or scaled per-state rather than using a single global scaling factor across all displayed wavefunctions.
   **Why it matters:** Per-state normalization makes every state look the same height, destroying the visual information about relative amplitudes. A single global scale preserves the proportional relationships between states, which is physically meaningful.
   **Flag:** clear

6. **Issue:** No option to toggle between Re(ψ) and |ψ|² display modes for the wavefunctions.
   **Why it matters:** Students need to see both representations: the real wavefunction shows nodes and parity, while |ψ|² shows the probability density — different physics questions require different views.
   **Flag:** clear

7. **Issue:** About section didn't explain the pedagogical unit convention (ħ²/(2m) = 1).
   **Why it matters:** Without this note, students may wonder why the numbers don't match physical units they're used to.
   **Flag:** clear

8. **Issue:** "Regions" sidebar section with Region I/II/III labels added clutter without clear pedagogical benefit at this point.
   **Why it matters:** Region labels weren't mentioned in the lecture notes. As is, they are cluttering the interface and not providing any pedagogical benefit.
   **Flag:** clear

9. **Issue:** No option to hide wavefunctions and view just the potential well and energy levels.
   **Why it matters:** Being able to see the bare potential helps students understand the well geometry before adding the complexity of wavefunctions on top.
   **Flag:** clear

10. **Issue:** The two curves on the right-hand η(k) vs k plot (transcendental curve and circle) lacked labels or a legend.
    **Why it matters:** Without labels, a student looking at the plot can't tell which curve is which or connect them to the equations.
    **Flag:** clear

11. **Issue:** Dynamic axis rescaling was too aggressive — the axes constantly resized as parameters changed, making the plot feel unstable.
    **Why it matters:** Constant rescaling is disorienting; the student should be able to increase a parameter until the data reaches the edges, then have the axes expand — a calmer, more predictable interaction.
    **Flag:** clear

12. **Issue:** E_n level labels overlapped with the plotted level lines, making them hard to read.
    **Why it matters:** Labels sitting on top of the lines they annotate are visually cluttered; nudging them above keeps both readable.
    **Flag:** clear

13. **Issue:** The conditional display logic for energy levels vs. geometric annotations (2a width, V₀ depth arrows) needed to be tied to the wavefunction toggle — energy levels shown *with* wavefunctions, geometric arrows shown *without*.
    **Why it matters:** When wavefunctions are visible, the student needs energy levels to see where each state sits. When they're hidden, the geometric annotations help the student focus on the well's shape parameters instead.
    **Flag:** clear

14. **Issue:** User initially specified the display logic backwards (E-levels hidden when wavefunctions shown) and had to correct themselves in a follow-up message.
    **Why it matters:** This is a self-correction by the reviewer, not an agent error — but it shows the logic coupling between display elements can be non-obvious even to the person designing the sim.
    **Flag:** clear

15. **Issue:** The circle's label on the right-hand plot was hidden/obscured and needed to use the full lecture-note form: k² + η² = 2mV₀/ħ².
    **Why it matters:** The label must match the lecture notation exactly so students can connect what they see in the sim to what's in their notes.
    **Flag:** clear

16. **Issue:** Direct text labels on the right-hand plot were redundant with the legend; reviewer wanted only the legend kept.
    **Why it matters:** Having both direct labels and a legend is visual duplication; one consistent labeling method is cleaner.
    **Flag:** clear

---

### cursor_simulation_audit_and_display_cha.md

**Sim file:** L05_particle-on-a-circle.html
**User requests in session:** 10

**Issues:**
1. **Issue:** L_z (angular momentum) calculation and display was prominent in the sidebar and tooltip, but this isn't covered in the lecture notes and is not the pedagogical focus of Lecture 5.
   **Why it matters:** Foregrounding L_z distracts from the lecture's emphasis on energy quantization, wavefunctions, and probability density on the ring.
   **Flag:** clear

2. **Issue:** The sidebar did not display the energy equation (E_n), the wavefunction equation (ψ_n), or the probability density equation (|ψ_n|²).
   **Why it matters:** These are the core lecture equations the student is meant to connect to the visualization; omitting them from the sidebar forces the student to look elsewhere.
   **Flag:** clear

3. **Issue:** The energy ladder visualization was not drawn with true E_n ∝ n² spacing — levels were visually stretched/equalized.
   **Why it matters:** The quadratic energy spacing is a key physical feature of the particle-on-a-circle problem; if the ladder doesn't reflect it, students get a wrong visual intuition about the energy spectrum.
   **Flag:** clear

4. **Issue:** The energy ladder's vertical scale was fixed, so higher-n levels could crowd or overflow; reviewer wanted dynamic scaling so the selected |n| is always at the top.
   **Why it matters:** A dynamic scale ensures the currently relevant energy level is always visible and prominent regardless of which n the student selects.
   **Flag:** clear

5. **Issue:** The flat φ-plot of the wavefunction looked jagged at large n, and increasing "numPoints" didn't help because that variable only controlled the ring view's sampling, not the flat plot.
   **Why it matters:** A jagged wavefunction looks wrong and undermines student confidence in the simulation; the sampling resolution must track the oscillation frequency of the mode.
   **Flag:** clear

6. **Issue:** The ring-mode 3D view had π/2, π, 3π/2 angular labels on the axes that cluttered the display.
   **Why it matters:** These angular markers add detail that isn't needed for the visual intuition the ring view is meant to build; removing them simplifies the 3D scene. The lecture notes do not use phases explicitly, so it introduces unnecessary notation for the student.
   **Flag:** clear

7. **Issue:** The z-axis label was drawn at negative z (bottom) instead of positive z (top).
   **Why it matters:** Standard convention and visual expectation place axis labels at the positive end; having it at the bottom is confusing. The probability is positive in the +z direction, so it was essentially plotting it upside down as a default.
   **Flag:** clear

8. **Issue:** The R = 1 annotation was missing from next to the ring's radius on screen.
   **Why it matters:** Without a radius label, students have less intuition of the circle on screen being the circle in the problem. 
   **Flag:** clear

9. **Issue:** x, y, z axis labels in ring mode were dim and hard to read against the dark background.
   **Why it matters:** If students can't read the axis labels, the 3D orientation is ambiguous. Also, it is unprofessional/not visually clear and appealing. 
   **Flag:** clear

10. **Issue:** z axis was too short, causing label clutter with other elements.
    **Why it matters:** A taller z axis provides more visual separation between the axis label and the ring/wavefunction rendering.
    **Flag:** clear

11. **Issue:** The 3D ring view rendered upside down by default — positive z was at the bottom of the screen instead of the top.
    **Why it matters:** An inverted default orientation is physically incorrect and confusing; students expect z-up in a standard coordinate system.
    **Flag:** clear

12. **Issue:** After fixing the default orientation, the click-to-drag interaction was inverted — dragging down moved the view up and vice versa.
    **Why it matters:** Inverted drag controls are immediately disorienting and make the 3D view unusable for exploration. (Root cause: flipping the default elevation sign without also flipping the drag handler's vertical sign convention.)
    **Flag:** clear

13. **Issue:** A "θ" angular marker remained on the ring view after the other π labels were removed.
    **Why it matters:** Leftover annotation from a previous version; inconsistent with the cleaned-up display.
    **Flag:** clear

14. **Issue:** The agent applied purple dashed styling to the radius line (center to edge) instead of the R = 1 circumference ring, misunderstanding the user's request.
    **Why it matters:** The student needs to see the *circle* at R = 1 highlighted, not the radius — the circle is the domain of the problem. User had to explicitly correct the agent.
    **Flag:** clear

15. **Issue:** Code contained misleadingly named leftover artifacts from removed features (e.g., `xLabels` array that was actually the φ-plot tick labels, unused DOM references).
    **Why it matters:** Stale or misleadingly named code makes future maintenance harder and signals incomplete cleanup from iterative edits.
    **Flag:** clear

16. **Issue:** The "drag to rotate / scroll to zoom" help text inherited purple color from the R = 1 annotation instead of matching the axis color.
    **Why it matters:** Inconsistent text coloring looks like a bug and reduces visual coherence.
    **Flag:** clear

17. **Issue:** The help text instructions ("drag to rotate, scroll to zoom, double-click to reset") were all on a single line instead of separate lines. Also, the single line was too long for the plot, so was cut off. 
    **Why it matters:** It was cut off and not readable. Additionally, stacking the instructions may make each one easier to scan. 
    **Flag:** clear
