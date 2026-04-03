# Sim Pain Points

Synthesized from 6 audit batches (`issues-batch-1.md` through `issues-batch-6.md`). Covers 22 distinct sims, 181 unique issues (after deduplicating cross-session repeats), and ~145 reviewer back-and-forth messages.

---

# Part A: Categorized Issues

Categories derived from the data, sorted by frequency.

---

## 1. Layout and interaction design

**Frequency:** 30 issues across 14 sims

**What goes wrong:** Panels are arranged in ways that prevent the visual comparisons the sim exists to teach. Interactive features students need (maximize/restore, display toggles, slit-configuration options) are missing. Axis ranges are hardcoded or poorly chosen, wasting plot space or clipping data. Controls are unintuitive or physically confusing.

**Why it matters:** A sim's layout *is* its argument. If the wavefunction and potential aren't vertically aligned, students can't see turning points. If there's no toggle between Re(ψ) and |ψ|², they can't connect nodes to probability minima. These aren't cosmetic preferences — the spatial arrangement is doing pedagogical work.

**Examples from the audit:**
- High-energy HO sim put wavefunction and probability plots side-by-side instead of stacked below the potential, preventing vertical alignment of turning points with wavefunction features (L07_HE)
- Bound-state sim had no toggle between Re(ψ) and |ψ|² views, and no option to hide wavefunctions to see the bare potential and energy levels (L08_Bound)
- Particle-on-a-circle was rendered as a 2D circle with radial deformations instead of a 3D perspective with wavefunction height along z (L05_circle)
- Double-slit mode-specific explanatory text was visible in both quantum and classical modes simultaneously (L04_double-slit)

---

## 2. Labeling and math formatting

**Frequency:** 29 issues across 12 sims

**What goes wrong:** Labels are missing, wrong, overlapping, or rendered as plain text where LaTeX is expected. Subscripts appear as raw characters. Font sizes are inconsistent between equation blocks and surrounding text. Axis annotations overlap with plot borders or each other.

**Why it matters:** Students read labels. A missing legend means they can't tell which curve is which. A broken subscript means they can't tell what quantity is plotted. Plain-text `F_z = -g_j * m_j * mu_B * (dB/dz)` on a canvas next to LaTeX-rendered equations in the sidebar looks broken and is harder to parse.

**Examples from the audit:**
- CSS `text-transform: uppercase` on plot titles turned ψ into Ψ, changing the physics meaning (L07_harmonic)
- Stern-Gerlach force equation and on-canvas labels rendered as plain text; inline `$...$` delimiters weren't configured in KaTeX auto-render (Stern-Gerlach)
- Probability-density legend subscripts rendered as raw text instead of formatted subscripts (L07_HE)
- Energy-level labels overlapped with the plotted level lines (L08_Bound)

---

## 3. Lecture-note misalignment

**Frequency:** 25 issues across 13 sims

**What goes wrong:** The sim uses different notation, variable names, sign conventions, unit conventions, or formulas than the lecture material it's supposed to illustrate. Sometimes the sim's entire content scope doesn't match the lecture — wrong topic, missing modes, or formulas from a different derivation.

**Why it matters:** These sims exist to reinforce lecture content. If the sim says η where the lecture says x, or uses V = 0 inside the well when the lecture uses V = −V₀, students spend cognitive effort translating instead of learning. Worse, they may not realize the conventions differ and just get confused.

**Examples from the audit:**
- A(k) plot used a different Gaussian prefactor and exponent denominator than the lecture-note definition on line 888–889 of QM_intro.tex (L06_A(k))
- Both bound-state sims used V = 0 inside the well and V = V₀ outside — the opposite of the lecture convention V = −V₀ inside, V = 0 outside (L08_Bound, L08_Finite)
- High-energy HO used η as the position variable and Ψ (capital) instead of the lecture's x and ψ (L07_HE)
- Multiple sims displayed nm units on sliders and axes when the lecture uses dimensionless/natural units (L06_A(k), L02_Two_Gaussian)

---

## 4. Visual clutter and information overload

**Frequency:** 23 issues across 11 sims

**What goes wrong:** Too many readouts, annotations, equations, overlaid decorations, and redundant UI elements on screen at once. Derived quantities that duplicate slider readouts. Equation panels that belong behind an info button taking up permanent sidebar space. Decorative animations with no pedagogical purpose.

**Why it matters:** Every element on screen competes for student attention. A glowing dot pulsing at the Gaussian peak isn't helping anyone learn about momentum-space distributions. A sidebar showing σ_x alongside the localization parameter is adding a quantity the student doesn't know yet. The reviewer consistently asked for cleaner interfaces — the pattern is clear.

**Examples from the audit:**
- A(k) plot had a glowing pulsing dot at the peak, sparkle particles along the curve, ±σ/±2σ dashed lines, and a k₀ label overlay — all competing with the Gaussian shape the student should focus on (L06_A(k))
- Two-Gaussian superposition displayed σ_x readout, "Lecture 02 Model" equations panel, and small tick labels below every slider alongside slider readout values (L02_Two_Gaussian)
- Finite-well sim sidebar showed δ, z₀, ℏ²/(2m), and explicit solver formulas — internal eigenvalue-computation quantities, not lecture-facing physics (L08_Finite)

---

## 5. Dishonest visualization

**Frequency:** 17 issues across 12 sims

**What goes wrong:** The plot doesn't faithfully represent the physics quantity it claims to show. Hidden scaling factors, peak normalization, nonlinear mappings, or auto-rescaling make the displayed curve a distorted version of the actual data. In some cases, the displayed formula doesn't match what the code computes.

**Why it matters:** This is the most dangerous category. A student looking at a peak-normalized heatmap thinks the wavepacket isn't spreading. A student looking at a per-state-normalized wavefunction thinks all states have the same amplitude. A student reading "Peak Height = 4.2" doesn't know that number went through a nonlinear soft-cap. These aren't just ugly — they teach wrong physics.

**Examples from the audit:**
- 2D wavefunction heatmap was peak-normalized so the wavepacket always appeared the same brightness regardless of spreading, hiding probability conservation (L15_2D)
- 3D probability surface used a nonlinear soft-cap (`maxVisualHeight * (1 - exp(-h/maxVisualHeight))`) that compressed tall peaks, and the "Peak Height" readout showed this distorted value (L15_2D)
- Double-slit theory overlay used Chart.js Bézier smoothing (tension: 0.4) that created artificial overshoot above histogram bins, making a correct histogram look wrong (L04_double-slit)
- Bound-state wavefunctions were normalized per-state instead of using a global scale, destroying visual information about relative amplitudes (L08_Bound)

---

## 6. Pedagogical framing problems

**Frequency:** 13 issues across 9 sims

**What goes wrong:** The sim's design undermines the conceptual point it's supposed to make — not because it mismatches the lecture notation, but because the framing itself is wrong or missing. Wrong terminology teaches wrong concepts. Display choices obscure the lesson. Parameter design muddles the physics. Missing scaffolding leaves students without the context they need.

**Why it matters:** These are the issues where the fix requires understanding what the student is supposed to take away, not just matching a formula. A sim can have correct physics and correct notation and still fail pedagogically if it frames the content in a way that leads students to wrong conclusions.

**Examples from the audit:**
- Classical-vs-Schrödinger sim described probability tails beyond turning points as "quantum tunneling" — tunneling implies escape through a barrier, not the tail of a bound state (L03)
- About tooltip claimed each measurement "collapses" the wavefunction, but the code never modified the state — it just resampled from the same unchanging Gaussian every time, demonstrating Born-rule sampling on an ensemble, not collapse (wavefunctions-and-probability)
- Two-Gaussian superposition showed numeric substitutions (slider values plugged in) instead of symbolic equations, shifting student focus from mathematical structure to specific numbers (L02_Two_Gaussian)
- Equations of motion for both classical and quantum cases were not displayed in the sim whose entire point is comparing F = ma to the Schrödinger equation (L03)

---

## 7. Broken or unusable functionality

**Frequency:** 13 issues across 8 sims

**What goes wrong:** Features crash, freeze, or produce visibly broken output. KaTeX integration breaks an entire sim. Heatmap rendering freezes the browser. Maximize/restore causes a blank panel. Drag controls are inverted. Play button doesn't start the animation.

**Why it matters:** A broken sim is worse than no sim — students lose trust, and the lecturer has to work around it in real time.

**Examples from the audit:**
- Heatmap mode computed `gaussianWavepacket()` for every screen pixel every frame (~1M expensive math calls at 60fps), freezing the VS Code browser (L15_2D)
- KaTeX auto-render integration broke the classical-vs-Schrödinger sim entirely — raw LaTeX on screen, plots gone (L03)
- Restoring a maximized plot caused the probability panel to go blank due to a canvas-resize race condition (L07_HE)
- After fixing the default 3D orientation, the click-to-drag interaction was inverted — dragging down moved the view up (L05_circle)

---

## 8. Physics model errors

**Frequency:** 12 issues across 6 sims

**What goes wrong:** The underlying physics model is incorrect. Wrong force laws, wrong sampling distributions, wrong equations of motion. The sim computes something that contradicts the physics it's supposed to teach.

**Why it matters:** These are bugs, not design disagreements. A force equation missing a negative sign, a classical sampler that doesn't conserve which slit a particle passed through, a deflection law normalized by total spin — these produce output that is quantitatively and qualitatively wrong.

**Examples from the audit:**
- Classical double-slit sampler fell back to uniform random screen positions after 28 rejection attempts, injecting ~18% off-model hits where the classical density should be zero (up to ~37% at slider extremes) (L04_double-slit)
- Stern-Gerlach deflection was normalized by total spin (proportional to m_j/j), making all spin values produce the same total spread regardless of j (Stern-Gerlach)
- Free-particle Gaussian wavepacket showed uniform global phase rotation with no dispersion, which is only correct for an energy eigenstate (wavefunctions-and-probability)
- Stern-Gerlach displayed force equation was missing the negative sign — the sign that determines which m_j values deflect up vs. down (Stern-Gerlach)

---

## 9. Poor rendering quality

**Frequency:** 9 issues across 7 sims

**What goes wrong:** Polylines are visibly jagged due to insufficient spatial sampling per wavelength. Aliasing produces false beating patterns. Curves that should be prominent are too faint or too thin to see.

**Why it matters:** Students may mistake rendering artifacts for real physics (e.g., thinking the wavefunction is discontinuous). Jagged plots also just look unprofessional and undermine confidence in the sim. A classical probability curve that's too faint to see defeats the entire purpose of the classical–quantum comparison.

**Examples from the audit:**
- Wavepacket oscillations visibly jagged across multiple sims due to insufficient grid points per wavelength (L06_wavepacket, L03_anharmonic, L05_circle)
- Barrier transmission wave display had numerical beating artifacts at high energy where phase change per pixel exceeded the Nyquist limit (L09)
- Fourier series target-wave overlay was 2px wide and drawn behind the partial sum, making it invisible (L13_Fourier)

---

## 10. Bad defaults

**Frequency:** 5 issues across 4 sims

**What goes wrong:** The sim loads in a state that's not useful. Animation too fast to see. Camera too zoomed out. 3D view upside down. Default layout doesn't emphasize the most important panel. Students have to fix the view before they can start learning.

**Why it matters:** First impressions matter, especially in a lecture context where the sim might be shown for 30 seconds. If the default animation speed is too fast for the human eye — a pattern across multiple sims with time-evolution sliders — the student sees a blur, not physics. If the camera is zoomed out so the ring is a tiny dot, the 3D wavefunction view is useless until someone scrolls in. These are cheap to fix and high-impact.

**Examples from the audit:**
- High-energy HO default animation speed too fast to observe wavefunction oscillation at high n; reviewer asked for 0.1x default (L07_HE)
- 3D ring view rendered upside down by default (positive z at bottom of screen) and with camera zoomed out so far the ring was hard to see (L05_circle)
- Increasing default speed from 0.1x to 0.5x to fix a perceived "frozen" animation broke the measurement-interaction pacing — measurements happened too fast for the intended pedagogical workflow (New_Wavefunction_collapse)

---

## 11. Dynamic axis instability

**Frequency:** 5 issues across 5 sims

**What goes wrong:** Axes rescale on every frame, every parameter change, or every batch of samples. The visual "target" keeps moving, so students can't build intuition about convergence, parameter dependence, or relative magnitudes.

**Why it matters:** A shifting axis makes it impossible to answer "did the curve move, or did the axis move?" — which is exactly the question students are trying to answer when they adjust a slider. The fix is straightforward (use fixed or step-wise-expanding axis ranges), but the agent defaults to auto-scaling.

**Examples from the audit:**
- Gaussian histogram y-axis jumped around as samples accumulated, making it impossible to watch convergence to the theoretical curve (Gaussian-distribution)
- Bound-state η(k) plot axes constantly resized as well-depth changed, making the interaction feel unstable (L08_Bound)
- Double-slit histogram axis auto-rescaled every few seconds, making bars appear to "jump down" as if data was being thrown away (Sims-v2/double-slit)

---

# Part B: Per-Sim Summary

| Sim file | Issues | Requests | Top issue categories |
|----------|--------|----------|---------------------|
| L07_Harmonic_Oscillator_High_Energies.html | 20 | 14 | Labeling (6), Layout (5), Lecture misalignment (2) |
| L05_particle-on-a-circle.html | 20 | 13 | Layout (4), Labeling (3), Broken (3), Clutter (3) |
| L08_Bound_states.html | 16 | 6 | Layout (5), Labeling (4), Lecture misalignment (3) |
| L04_double-slit-experiment.html | 13 | 14 | Physics errors (4), Lecture misalignment (3), Dishonest viz (2) |
| L07_harmonic-oscillator.html | 13 | 12 | Labeling (3), Lecture misalignment (2), Dishonest viz (2), Clutter (2) |
| Sims-v2/stern-gerlach.html | 12 | 8 | Physics errors (4), Labeling (3), Broken (3) |
| L15_2d_wavefunction_collapse_measurement.html | 12 | 6 | Dishonest viz (3), Labeling (2), Layout (2) |
| L02_Two_Gaussian_superposition.html | 11 | 12 | Clutter (4), Lecture misalignment (2), Pedagogy (2) |
| L09_Transmission_probability_plot_updated.html | 11 | 7 | Layout (2), Labeling (2), Lecture misalignment (2), Rendering (2) |
| L06_A(k)-vs-k-plot.html | 9 | 6 | Clutter (4), Layout (2), Lecture misalignment (2) |
| L03_classical-vs-schrodinger.html | 7 | 7 | Pedagogy (4) |
| L03_classical-vs-schrodinger-ANHARMONIC.html | 6 | 7 | Labeling (2), spread across others |
| L08_Finite_well_probability_plot.html | 6 | 3 | Lecture misalignment (3), Clutter (2) |
| L02_Single_Gaussian_plot.html | 4 | 5 | Spread across categories |
| L04_Two_Gaussian_wavefunction_collapse.html | 4 | 4 | Lecture misalignment (2) |
| L05_plane_wave_plots.html | 3 | 4 | Spread |
| L06_Time_evolution_Gaussian_wavepacket_v2.html | 3 | 3 | Spread |
| Sims-v2/double-slit.html | 3 | 4 | Spread |
| Sims-v2/New_Wavefunction_collapse_Measurement.html | 3 | 4 | Spread |
| Sims-v2/gaussian-distribution.html | 2 | 2 | Axis instability, Dishonest viz |
| Sims-v2/wavefunctions-and-probability.html | 2 | 1 | Pedagogy, Physics errors |
| L13_Fourier-series.html | 1 | 3 | Rendering |

### Most painful sims

**L07_Harmonic_Oscillator_High_Energies.html** — highest issue count (20) and highest request count (14). Needed a near-complete rework: wrong layout, wrong notation, too many readouts, missing legends, broken maximize/restore, and rendering issues. The session was long because fixes kept uncovering new problems.

**L04_double-slit-experiment.html** — 13 issues across 4 separate chat sessions, 14 total requests. The core physics model was fundamentally wrong (classical sampler, normalization, slit-tracking), which meant fixes were deep, not cosmetic. High request count reflects the reviewer having to push back repeatedly on the same model issues.

**L05_particle-on-a-circle.html** — 20 issues, 13 requests across 2 sessions. The 3D visualization was wrong from the start (2D rendering, upside down, inverted controls), and the flat-plot and energy-ladder views each had their own problems. Lots of surface area to fix.

**L02_Two_Gaussian_superposition.html** — 11 issues, 12 requests across 3 sessions. A relatively simple sim, but the high request count reflects persistent cleanup: removing units, removing clutter, fixing equations, fixing the default layout. Death by a thousand cuts.

### Averages

- **Average issues per sim:** 8.2
- **Average requests per sim:** 6.6

### Sim-type clustering

Some sim types consistently produced more issues:

- **Harmonic oscillator** sims (L07_harmonic, L07_HE): 33 issues across 2 sims, avg 16.5. These are multi-panel sims with energy diagrams, wavefunctions, and probability densities — lots of surfaces for labeling, layout, and scaling problems.
- **Bound-state / finite-well** sims (L08_Bound, L08_Finite): 22 issues across 2 sims, avg 11. Convention mismatches with the lecture notes hit hard here because the sign convention for the potential changes the meaning of every energy value.
- **Particle-on-a-circle / plane-wave** sims (L05_circle, L05_plane_waves): 23 issues across 2 sims, avg 11.5. The 3D rendering in L05_circle drove most of this — 3D scenes multiply the number of things that can be wrong (camera, orientation, drag controls, axis labels, draw order).
- **Gaussian / superposition** sims (L02_Single, L02_Two_Gaussian, Gaussian_dist): 17 issues across 3 sims, avg 5.7. Simpler sims with fewer panels; issues were mostly clutter and notation cleanup.
- **Collapse / measurement** sims (L04_collapse, L15_2D, New_WF, wf-and-prob): 21 issues across 4 sims, avg 5.3. Mixed bag — L15_2D had serious dishonest-viz problems, but the others were lighter.

The pattern: sims with more panels, more parameter interactions, and more visual representations per screen accumulate more issues. This isn't surprising, but it suggests that complex sims need more upfront specification or a more structured review pass.

---

# Part C: Summary

**Total issues:** 181 across 22 sims

**Top 3 categories:**
1. Layout and interaction design — 30 issues (17%)
2. Labeling and math formatting — 29 issues (16%)
3. Lecture-note misalignment — 25 issues (14%)

**Takeaway:**

The three most common issue types — layout, labeling, and lecture-note alignment — account for almost half of all issues (84/181). None of these require deep physics knowledge to fix; they require knowing what the lecturer wants the student to see, and then making sure the sim shows exactly that. The agent's default instincts are wrong in predictable ways: it auto-scales axes, adds derived readouts the student doesn't need, uses whatever notation seems standard rather than matching the lecture, and lays out panels for information density rather than visual comparison. The less common but more dangerous categories — dishonest visualization (17 issues) and physics model errors (12 issues) — are harder to catch because they produce output that looks plausible. Peak normalization, hidden rescaling, and nonlinear display mappings all make a sim "work" visually while quietly misrepresenting the physics. These need reviewer attention specifically because the agent won't flag them on its own.
