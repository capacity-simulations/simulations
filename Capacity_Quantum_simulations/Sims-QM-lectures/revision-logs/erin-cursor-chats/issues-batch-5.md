# Issues Batch 5

---

### cursor_simulation_audit_and_interface_c.md

**Sim file:** `L07_harmonic-oscillator.html`
**User requests in session:** 7

**Issues:**

1. **Issue:** The `t` counter (time readout) was displayed on screen, adding visual clutter with no pedagogical value.
   **Why it matters:** The time variable in the phase animation is not a physically meaningful observable here — displaying it foregrounds implementation detail over physics.
   **Flag:** clear

2. **Issue:** "Energy, freq, spring const" readout block at the bottom of the right-hand sidebar was unnecessary.
   **Why it matters:** These are derived/internal quantities that duplicate information already implicit in the slider settings; showing them clutters the interface.
   **Flag:** clear

3. **Issue:** The animation-rate control was labeled "Override omega," implying it changed the physical angular frequency.
   **Why it matters:** Students could believe they're tuning a physical parameter when it's really just a display speed multiplier. The user asked it be renamed "Animation speed" with a 0.1x–1.0x display to make its non-physical nature obvious.
   **Flag:** clear

4. **Issue:** The potential plot drew faint, unlabeled wavefunction and probability-density overlays on the selected energy level, scaled by an arbitrary display factor.
   **Why it matters:** The overlays sat on an energy axis but represented non-energy quantities with no physical scale, mixing decorative and quantitative content without disclosure. (User initially couldn't even see them — they were so faint as to be functionally invisible, making them useless as pedagogy and misleading in principle.)
   **Flag:** clear

5. **Issue:** The physics control exposed the spring constant `k` as the adjustable parameter, but the lecture formulation uses mass `m` and angular frequency `ω`.
   **Why it matters:** Students should see the same parameterization as in the lecture notes so the sim reinforces — rather than contradicts — the notation they learned. The user explicitly asked for the slider to be `m` instead of `k`.
   **Flag:** clear

6. **Issue:** Only one of `m`, `ω`, or `k` was adjustable, with the others hard-coded at `m = 1`. The user asked whether both `m` and `ω` should be independently settable.
   **Why it matters:** Changing `ω` at fixed `m` changes both level spacing and wavefunction width; changing `m` at fixed `ω` changes only the width. Exposing both lets students see these distinct effects, which is a richer illustration of the physics. The user explicitly chose this dual-control design.
   **Flag:** clear

7. **Issue:** The wavefunction and probability-density plots used hidden state-dependent vertical rescaling (auto-scaled to the current peak), so the y-axis had no fixed physical meaning across states.
   **Why it matters:** If the vertical scale silently changes when switching quantum number or slider values, students can't visually compare amplitudes across states — the plots look the same height for every `n`, hiding the real narrowing/broadening behavior. (Agent-identified in audit; user approved and directed implementation.)
   **Flag:** clear

---

### cursor_simulation_audit_and_visualizati.md

**Sim file:** `L07_Harmonic_Oscillator_High_Energies.html`
**User requests in session:** 14

**Issues:**

1. **Issue:** The wavefunction and probability plots were arranged side-by-side instead of stacked below the potential plot, unlike the companion sim (`L07_harmonic-oscillator.html`).
   **Why it matters:** Stacking plots vertically lets students visually align turning points in the potential with features in the wavefunction/probability — a key pedagogical connection at high quantum numbers. The user explicitly referenced the companion sim's layout.
   **Flag:** clear

2. **Issue:** The simulation used `η` (eta) as the position variable instead of the lecture's `x`.
   **Why it matters:** Notation mismatch with the lecture confuses students who are trying to connect the sim to their notes. The user was emphatic: "make the plots match the lecture notation!!!! we definitely shouldn't have eta."
   **Flag:** clear

3. **Issue:** The simulation used `Ψ` (capital psi) instead of the lecture's `ψ` (lowercase).
   **Why it matters:** Same notation-consistency problem — students should see the same symbols on screen as on the board.
   **Flag:** clear

4. **Issue:** Too many equations and readouts were displayed; only `ΔE / Eₙ` is pedagogically needed for this sim.
   **Why it matters:** The point of this sim is the high-`n` limit and classical correspondence. Extra formulas and stats distract from that focus. The user explicitly scoped the readout to just the one quantity that matters here.
   **Flag:** clear

5. **Issue:** The agent's plan proposed putting the probability density on the wavefunction panel; the user corrected this — keep it only on the probability-density panel, shaded below the classical curve.
   **Why it matters:** Overlaying `|ψ|²` on the wavefunction plot would muddle two different quantities on one axis. The user wanted clean separation: wavefunction on one panel, probability comparison on another. This was a direct correction of the agent's suggestion.
   **Flag:** clear

6. **Issue:** The wavefunction envelope `|ψ|` was displayed on the wavefunction plot.
   **Why it matters:** The user judged it unnecessary for this sim's pedagogical goal, cluttering the plot and distracting from the main point, and asked for it to be removed entirely.
   **Flag:** clear

7. **Issue:** The orange classical probability curve was too faint / hard to see against the plot.
   **Why it matters:** The whole point of this sim is the classical–quantum comparison at high `n`. If the classical reference curve is barely visible, that comparison fails.
   **Flag:** clear

8. **Issue:** No legends were displayed on the plots themselves — labels existed only in the sidebar or were absent.
   **Why it matters:** Students need to know which curve is which without having to look away from the plot. In-plot legends are standard practice for multi-curve figures.
   **Flag:** clear

9. **Issue:** Subscripts in the probability-density plot legend and y-axis label were not rendering correctly (raw text instead of formatted subscripts).
   **Why it matters:** Broken math formatting looks unprofessional and can confuse students about what quantity is being plotted.
   **Flag:** clear

10. **Issue:** Plot legends were poorly positioned (not in a consistent, readable location).
    **Why it matters:** The user asked for top-right placement on all plots so the legends are uniform and don't occlude data.
    **Flag:** clear

11. **Issue:** The wavefunction plot title and y-axis did not include the subscript `n` (i.e., showed `ψ` instead of `ψₙ`).
    **Why it matters:** This sim is specifically about exploring different quantum numbers; labeling the axis `ψₙ` makes explicit that the displayed function depends on the selected `n`.
    **Flag:** clear

12. **Issue:** The x-axis label overlapped with the plot box border on all three panels.
    **Why it matters:** Visual polish — overlapping text looks broken and is harder to read.
    **Flag:** clear

13. **Issue:** No maximize/restore option on individual plots, so students couldn't enlarge a single panel for closer inspection.
    **Why it matters:** For a three-panel layout, being able to zoom into one plot at a time is a basic usability need, especially when comparing fine wavefunction features at high `n`.
    **Flag:** clear

14. **Issue:** The maximize/restore buttons didn't match the button style used in other sims (specifically `L02_Two_Gaussian_superposition.html`).
    **Why it matters:** Visual consistency across the simulation suite — students shouldn't encounter different UI conventions in every sim.
    **Flag:** clear

15. **Issue:** The orange classical probability curve was drawn behind the green quantum probability curve, making it hard to see.
    **Why it matters:** Draw order matters: the classical reference curve is smaller in area and needs to sit on top to be visible, especially near the turning points where the classical divergence is the key feature.
    **Flag:** clear

16. **Issue:** Default animation speed was too fast, making it hard to observe the wavefunction oscillation at high `n`.
    **Why it matters:** A slower default (0.1x) gives students time to see the spatial structure before the phase evolution blurs it.
    **Flag:** clear

17. **Issue:** The animation speed display value had no units/suffix (e.g., just "0.1" instead of "0.1x").
    **Why it matters:** Without the "x" suffix, the number is ambiguous — students might interpret it as a frequency or time value rather than a speed multiplier.
    **Flag:** clear

18. **Issue:** Restoring a maximized plot caused a rendering bug where the probability panel went blank (layout race condition: canvas resized before flex reflow completed).
    **Why it matters:** The probability panel is the main pedagogical output of this sim. If it goes blank every time a student restores from maximize, the sim is effectively broken for its intended use.
    **Flag:** clear

19. **Issue:** When a plot was maximized, the other plots were still visible behind it due to semi-transparent background.
    **Why it matters:** Defeats the purpose of maximizing — the student sees visual noise from overlapping canvases instead of a clean enlarged view.
    **Flag:** clear

20. **Issue:** The potential plot `V(x)` had a filled/shaded region under the parabola with no physical or pedagogical justification.
    **Why it matters:** Shading under the potential curve could be mistaken for a probability density or physically meaningful region. The user asked why it was there and requested removal.
    **Flag:** clear

---

### cursor_simulation_audit_and_modificatio.md

**Sim file:** `L08_Finite_well_probability_plot.html`
**User requests in session:** 3

**Issues:**

1. **Issue:** The potential convention didn't match the lecture notes — the sim used `V = 0` inside the well and `V = +V₀` outside, but the lecture defines `V = -V₀` inside and `V = 0` outside.
   **Why it matters:** Students see a different energy diagram than what's in their notes, which makes it harder to connect the sim to the lecture derivation and the meaning of bound-state energies.
   **Flag:** clear

2. **Issue:** The well width control was not labeled as `2a` to match the lecture notation.
   **Why it matters:** The lecture defines the well as `|x| < a`, so the full width is `2a`. Using a different label or convention in the sim creates a notation disconnect.
   **Flag:** clear

3. **Issue:** The sidebar displayed unnecessary derived quantities — `δ`, `z₀`, `ℏ²/(2m)`, and explicit solver formulas — that are internal to the eigenvalue computation, not part of the lecture-facing physics.
   **Why it matters:** These quantities clutter the display and may confuse students who don't recognize them from lecture. The user described the display as "reaaally cluttered."
   **Flag:** clear

4. **Issue:** Parity labels, total bound-state count, and mass `m` value were shown directly in the display, adding more visual noise.
   **Why it matters:** For the pedagogical goal of this sim, students need to see the well, the energy levels, and the wavefunctions — not solver diagnostics. The user wanted `m` assumptions moved into the "about" tooltip instead.
   **Flag:** clear

5. **Issue:** The wavefunction and probability density were plotted as schematic overlays offset from energy levels on the energy-axis panel, with hidden peak-dependent rescaling.
   **Why it matters:** The y-axis is labeled as energy, but the overlaid wavefunction shapes are not energy quantities. Their heights are set by an arbitrary display scale factor that changes with the selected state, so students can't read them quantitatively. (Agent-identified in audit; user approved by directing implementation of the plan.)
   **Flag:** clear

6. **Issue:** Energies were displayed as positive values measured from the well bottom rather than as negative bound-state energies relative to the continuum threshold.
   **Why it matters:** The lecture convention defines bound-state energies as negative (below the `V = 0` outside region). Showing positive numbers inverts the sign convention students are learning. (Agent-identified in audit; user approved by directing implementation.)
   **Flag:** clear

---

### cursor_simulation_audit_plan_and_change.md

**Sim file:** `L15_2d_wavefunction_collapse_measurement.html`
**User requests in session:** 3

**Issues:**

1. **Issue:** The "State" line in the Statistics panel was redundant with the status pill already displayed elsewhere.
   **Why it matters:** Duplicated information wastes screen real estate and can confuse students if the two indicators ever show different things (e.g., during a transition).
   **Flag:** clear

2. **Issue:** The 3D/heatmap view toggle was implemented as a "plot 3D" on/off switch.  
   **Why it matters:** A switch makes it unclear what the other option/view is (in this case, heatmap). Offering buttons to switch between the two views is more clear and intuitive ("View as Heatmap" when in 3D mode and "View in 3D" when in heatmap mode). 
   **Flag:** clear

3. **Issue:** The heatmap was peak-normalized (colors scaled to current maximum) instead of using a fixed physically meaningful color scale, so the probability density didn't visually integrate to 1 as the wavepacket spread.
   **Why it matters:** The user explicitly said "the prob should always integrate to 1." Peak normalization makes the wavepacket always appear the same brightness/intensity regardless of spreading, which hides the conservation-of-probability physics and the key visual signature of spreading (dimming).
   **Flag:** clear

4. **Issue:** No color legend was displayed on the heatmap view.
   **Why it matters:** Without a legend mapping colors to `|ψ|²` values, the heatmap is a qualitative picture rather than a quantitative tool. Students can't read off actual probability densities.
   **Flag:** clear

5. **Issue:** The 3D visualization used a nonlinear soft-cap (`maxVisualHeight * (1 - exp(-physicalHeight / maxVisualHeight))`) that compressed tall peaks, making the displayed surface height a distorted version of the actual probability density.
   **Why it matters:** The nonlinear mapping means the visual height is not proportional to `|ψ|²` — students would misread the relative magnitudes of the probability density at different points. (Agent-identified in audit; user approved.)
   **Flag:** clear

6. **Issue:** The "Peak Height" statistic displayed the soft-capped display value rather than the actual peak `|ψ|²`.
   **Why it matters:** A numerical readout that doesn't match the actual physics quantity is straightforwardly wrong — a student copying that number is getting a fiction.
   **Flag:** clear

7. **Issue:** The 3D z-axis tick labels showed arbitrary scene-unit integers (0, 2, 4, 6) instead of actual `|ψ|²` values.
   **Why it matters:** Axis labels must correspond to the physical quantity being plotted; arbitrary integers make the axis uninterpretable.
   **Flag:** clear

8. **Issue:** The time readout displayed units of "s" (seconds), but the simulation uses natural units (ℏ = m = 1), not SI.
   **Why it matters:** Labeling natural-unit time as "seconds" is dimensionally misleading and contradicts the unit system stated in the about text. (Agent-identified in audit; user approved.)
   **Flag:** clear

9. **Issue:** The heatmap rendering computed `gaussianWavepacket()` for every screen pixel every frame (~1M expensive math calls at 60fps), causing the mode to time out / freeze in the VS Code browser.
   **Why it matters:** A simulation that freezes the browser is unusable. This was a fundamental performance issue, not just a rendering-environment quirk — the per-pixel computation was ~15x more work than needed.
   **Flag:** clear

---

### cursor_simulation_audit_plan_for_quantu.md

**Sim file:** `L09_Transmission_probability_plot_updated.html`
**User requests in session:** 7

**Issues:**

1. **Issue:** The barrier diagram's energy-level line and barrier rectangle used different vertical scale mappings, so when `E = U` the energy line did not visually coincide with the barrier top.
   **Why it matters:** The `E = U` threshold is the most important reference point in barrier transmission — if the diagram can't show it as an exact visual alignment, students get a wrong geometric intuition.
   **Flag:** clear

2. **Issue:** The wave display in the barrier diagram had numerical beating/aliasing artifacts at high energy, where the phase change per pixel exceeded the Nyquist limit.
   **Why it matters:** Aliasing makes the wave look physically wrong (standing-wave-like beating instead of a smooth travelling wave), which is visually confusing and has no physical basis. The user specifically flagged these artifacts.
   **Flag:** clear

3. **Issue:** The `E = U` reference was shown as a full-height dashed vertical line with a legend entry, instead of a simple x-axis marker.
   **Why it matters:** A full vertical line adds visual clutter to the transmission plot and competes with the actual data curves. The user wanted a small axis marker (like a triangle + label), matching the style of axis annotations in other sims.
   **Flag:** clear

4. **Issue:** The about-panel formula definitions omitted `ℏ`, writing quantities like `η = sqrt(2m(U−E))` without the `ℏ²` in the denominator, inconsistent with the lecture notes.
   **Why it matters:** Dropping `ℏ` from the displayed formulas makes them wrong as written — or at best implies a unit convention that isn't stated, which confuses students checking their algebra against the sim.
   **Flag:** clear

5. **Issue:** No disclosure that the `E > U` (above-barrier) transmission formula extends beyond the lecture 9 derivation.
   **Why it matters:** The lecture only derives the `E < U` case explicitly; showing `E > U` without noting it's an extension (via `η → iκ` substitution) could lead students to think they missed a derivation, or to cite a formula they haven't actually proved. (Agent-identified in audit; user approved.) The user asked for the non-derived formula to be removed from display.
   **Flag:** clear

6. **Issue:** The reflection coefficient `R = 1 − T` was not available as a display option.
   **Why it matters:** Students often need to see both `T` and `R` together to confirm probability conservation (R+T=1)and to understand where reflection dominates. (Agent-identified in audit; user approved.)
   **Flag:** clear

8. **Issue:** The wave rendering in the barrier diagram used 1-pixel sampling steps, producing visibly jagged curves — especially on high-DPI displays.
   **Why it matters:** Jagged rendering looks broken and makes it harder to see the smooth sinusoidal structure that students are supposed to recognize. It also looks unprofessional and sloppy.
   **Flag:** clear

9. **Issue:** The barrier plot was located in the sidebar instead of below the main plot.
   **Why it matters:** A small sidebar diagram is hard to see and spatially disconnected from the transmission curve it illustrates. Placing it below the plot keeps the visual narrative in one column. The user also asked to remove the extensive explanatory text and just label it "Barrier diagram (schematic)."
   **Flag:** clear

10. **Issue:** The `U` barrier-height label was placed on top of the barrier rectangle instead of on the side, unlike the `2a` width annotation below.
    **Why it matters:** Consistent annotation style (dimension lines with end-caps) makes diagrams easier to read. Putting `U` on top is ambiguous — it isn't obvious that it's the height of the barrier. 
    **Flag:** clear

11. **Issue:** No equation panel showing the relevant transmission formula (`T(k)` or `T(E)`) from the lecture notes alongside the simulation controls.
    **Why it matters:** Students using the sim to explore parameter dependence need the formula on screen so they can connect slider changes to terms in the equation. The user explicitly requested this, referencing specific lines in `QM_intro.tex`.
    **Flag:** clear

12. **Issue:** The equation display had inconsistent font sizes between the main formula line and the definitions line.
    **Why it matters:** Visual polish — mismatched sizes make the panel look unfinished and can imply a hierarchy that isn't intended.
    **Flag:** clear
