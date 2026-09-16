# Simulation audit and adjustments
_Exported on 4/2/2026 at 21:44:29 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/general_specs.md @Sims-QM-lectures/QM_intro.tex  @Sims-QM-lectures/L08_Bound_states.html

You are given instructions in the general specs file to audit this simulation for correct physics, visualization, and strict adherence to the lecture notes. It is from the _th section in the QM_intro docs. Produce a plan as specified in the "general specs" document for my review. 

Additionally, some simulation-specific changes: 
-reduce max well depth to around 32. 
- change "physical space" to "potential and wavefunctions"
- change "energy level solutions" to "eta(k) vs k plot"

---

**Cursor**

Gathering general_specs audit format, the bound-states content in QM_intro.tex, and L08 implementation details to draft the plan.



Noting a potential convention mismatch: the lecture defines the well as V = −V₀ inside and 0 outside; the simulation draws V = 0 inside and V = V₀ outside (equivalent up to an additive constant). Verifying energy formulas match that shift.



---

**User**

Notation:
for 1, sure, add a subtitle. Feel free to scale the wavefunction height to make them fit well together, and not overlap. BUT, make sure it is an overall scaling factor across all wavefunctions. 
for 2. yes, shift the potential so it matches the lecture notes. MAKE SURE any changes in the sim are implemented correctly physically. 

for vis, 
1. yes, see my 1. point above. Don't bother with the correct eV scale for the wavefunctions, it is a schematic. Just make sure they are all scaled the same proportional to each other. 
2. Yes -- add buttons for "Show Re(psi)" and "Show |psi|^2", for the latter, display the psi^2 probability. 

Assumptions:
1. Yes- add a sentence in the about 

---

**Cursor**

Updating the plan document with your notation, potential-shift, visualization, and About-box decisions.



Updating the plan document with your decisions: lecture-aligned potential and energies, unified ψ scaling, Re(ψ) / |ψ|² toggles, subtitle, and About text.



Updated the plan file ([`l08_bound_states_audit_2aedc51e.plan.md`](/Users/erincrawley/.cursor/plans/l08_bound_states_audit_2aedc51e.plan.md)) with your choices. Here is the condensed version:

### Notation
- **Subtitle** on the left panel: energy zero at infinity (lecture convention) + explicit **schematic** ψ / density (not an eV scale for wavefunction amplitude).
- **Potential:** Draw **\(V=-V_0\)** in the well and **\(V=0\)** outside; implement consistently with **\(E = \hbar^2 k^2/(2m) - V_0\)** for listed energies and horizontal level lines. Transcendental math (**\(k^2+\eta^2 = 2mV_0/\hbar^2\)**) stays as today.

### Visualization
- **One global scale** \(s\) for all states in the active mode: from the largest needed excursion (e.g. \(\max_{j,x}\) of the plotted quantity), so shapes keep **fixed ratios** between states in **Re(ψ)** mode; **no per-state peak normalization** to 1 for ψ.
- **|ψ|² mode:** each state is a **properly normalized** probability density on \(x\), then the **same** \(s\) is applied to every state for layout (still labeled schematic vertically).

### Controls
- **“Show Re(ψ)”** and **“Show |ψ|²”** (e.g. radio-style). Re(ψ) matches the usual real eigenfunctions.

### About
- **One sentence** on the pedagogical **`ħ²/(2m)`** (`HBAR2_2M`).

Frontmatter todos were refreshed around potential/energy shift, subtitle + global scale, ψ modes, existing UI/About/cleanup/audit deliverable.

When you want this built in the repo, say **execute the plan** (or similar) and implementation can start.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the plan in `L08_Bound_states.html`: reading the file and working through the todos systematically.



Implementing changes: adding CSS for the subtitle and psi-mode buttons, then updating HTML and JavaScript.



Applying comprehensive edits: adding CSS and HTML updates first, then rewriting the physics drawing and helper logic.



Updating the About panel transcendental equation when parity is odd to match the lecture.



Here is what was implemented:

### Physics and plot ([`L08_Bound_states.html`](Sims-QM-lectures/L08_Bound_states.html))
- **Potential:** **V = 0** outside, **V = −V₀** for |x| < a (stroke + fill in the dip).
- **Energies:** **E = ħ²k²/(2m) − V₀** in code, sidebar, and level lines (negative, zero at infinity).
- **Vertical range:** Lerped **v** window from about **−1.28V₀** through a small positive band above **V = 0**; grid step adapts to **V₀**.

### Wavefunctions
- **`psiRawAtX`**, **`l2NormSqOnSegment`**, **`computeGlobalWaveScale`:** one **shared** **`waveScale`** for every state; **Re(ψ)** uses raw matched amplitudes; **|ψ|²** uses **normalization on the visible x-interval** then the same global scale.
- **Controls:** **Re(ψ)** / **|ψ|²** toggle (with **`.psi-sq-mode`** on **|ψ|²**); **Reset** restores **Re(ψ)**.

### UI / copy
- Panel titles: **Potential and wavefunctions**, **η(k) vs k plot**; matching **aria-labels** (HTML + `setupMaximizeButtons`).
- **Subtitle** under the left title: **E**, **V** in eV, **V = 0** at infinity, schematic shared scale for ψ / |ψ|².
- **V₀** slider **max = 32**.
- **About:** lecture potential, **E < 0** convention, and **pedagogical ℏ²/(2m)** sentence.

### Other
- **KaTeX:** **η = k tan(ka)** vs **k/tan(ka) = −η** when parity changes (`renderTranscendentalEq` from **`calculateBoundStates`**).
- Removed junk after **`</html>`**.

### Audit deliverable
- [`Sims-QM-lectures/revision-logs/L08_Bound_states.md`](Sims-QM-lectures/revision-logs/L08_Bound_states.md) — short EC line plus the **general_specs** style block (**Status: PASS**, issues, checklist).

The plan file was not modified. All related todos are **completed**.

---

**User**

-remove regions sidebar section and labels in the 
- Make option to hide wavefunctions / just show potential. 
-label the two curves with the legend on the plot. 
-make the dynamic axis not so obvious -- let the user e.g. increase a until the plot reaches the edges, then have it rescale. Same for V_0. 
- The E_# labels are on top of the plots. move them a touch higher. 

---

**Cursor**

Updating `L08_Bound_states.html` to remove the regions section, add a hide-wavefunctions option, label the plotted curves directly, soften the dynamic rescaling behavior, and nudge the `E_n` labels.



Making a focused single-file patch now: trimming the leftover region UI, adding the hide/show control, and changing the axis behavior and on-plot labels together so the interaction stays coherent.



The first patch missed some exact context, so I’m re-reading the current file slices and applying smaller, safer edits.



Applying the remaining UI and behavior changes in smaller hunks to avoid clobbering the working file.



The functional changes are in; I’m cleaning one small toggle-label mismatch and then checking diagnostics on the edited file.



Updated `Sims-QM-lectures/L08_Bound_states.html` with the requested UI/behavior tweaks.

The regions section in the sidebar is gone, and the on-plot `Region I / II / III` labels were removed too. There is now a `Hide wavefunctions` toggle so the left panel can show just the potential and energy levels. I also added direct labels on the right plot for the transcendental curve and the circle, so the main objects are identified in-place.

The dynamic rescaling is now less eager in both panels: the physical-space axes and the `η(k)` plot wait until `a` or `V₀` gets close to the edge before expanding, instead of constantly resizing early. I also nudged the `E_n` labels upward so they sit above the level lines instead of on top of them.

No linter errors were reported for `L08_Bound_states.html`.

---

**User**

When "Show wavefunctions" is selected, do *not* show the E levels. Instead, show double sided arrows labelling 2a as the width and V0 as the depth. 

Also, the circle's label is hidden -- move the label to below the eta = k tan label. Add a legend on the plot also , so I can decide which looks better.  

---

**Cursor**

Updating the bound-states plot behavior so the wavefunction view emphasizes the geometry of the well instead of the energy lines, and adjusting the right-plot labeling so both direct labels and an on-plot legend are available.



Applying the final set of plot tweaks now: replacing the E-level overlays with geometric annotations in wavefunction mode, moving the circle label under the tan/cot label, and adding a compact legend directly on the right plot.



Quickly checking the edited file for diagnostics, then I’ll close out.



Updated `Sims-QM-lectures/L08_Bound_states.html` so that when wavefunctions are visible, the energy level lines and `E_n` labels are no longer drawn. In that mode, the plot now shows double-headed annotations for the well geometry instead: `2a` for the width and `V₀` for the depth.

On the right-hand plot, the circle label was moved to sit below the `η = k tan(ka)` / `η = −k cot(ka)` label, and I also added a small boxed legend directly on the plot so you can compare the two labeling styles. The direct labels are still there.

No linter errors were reported for `L08_Bound_states.html`.

---

**User**

You did the opposite of what I wanted, but I specified incorrectly. Let's try again:
- When "Show wavefunctions" is UNselected, do *not* show the E levels. Only when UNselected, show double sided arrows labelling 2a as the width and V0 as the depth. 
-when "Show wavefunctions" is selected,  show the E levels and the wavefunctions. Do not show the double sided arrows labelling 2a as the width and V0 as the depth. 

Keep the legend, but make the label match the lecture notes. k^2 + \eta^2 = \frac{2mV_0}{\hbar^2}. Remove the other labels. 

---

**Cursor**

Adjusting the visibility logic and plot labels so the wavefunctions view shows energies, while the potential-only view shows the `2a` and `V₀` arrows, and trimming the right-plot labels down to the lecture-form circle label plus the legend.



Reversing that display logic now and simplifying the right-plot annotations so only the boxed legend remains, with the circle entry written exactly in the lecture-note form.



Running a quick diagnostics check on the updated file, then I’ll wrap up.



Updated `Sims-QM-lectures/L08_Bound_states.html` so the display logic now matches what you intended:

- When wavefunctions are **shown**, the plot shows both the **energy levels** and the **wavefunctions**.
- When wavefunctions are **hidden**, the **energy levels are also hidden**, and the plot instead shows the double-headed arrows for **`2a`** and **`V₀`**.

On the right-hand plot, I removed the direct text labels entirely and kept only the boxed on-plot legend. The circle entry in that legend now matches the lecture notation as requested: `k² + η² = 2mV₀/ħ²`.

No linter errors were reported for `L08_Bound_states.html`.

