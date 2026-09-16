# Simulation audit and modification plan
_Exported on 4/2/2026 at 21:44:44 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/general_specs.md @Sims-QM-lectures/QM_intro.tex  @Sims-QM-lectures/L08_Finite_well_probability_plot.html

You are given instructions in the general specs file to audit this simulation for correct physics, visualization, and strict adherence to the lecture notes. It is from the 8th section in the QM_intro docs. Produce a plan as specified in the "general specs" document for my review. 

Additionally, some simulation-specific changes: 
-make sure the potential is adhered to (width of 2a, minimum at -V_0)

-remove additional extra pieces -- delta, formulas, z_0, h^2/2m -- put assumptions on m into the "about"
-the display is reaaally cluttered. also remove parity, total bound states, m . 

---

**Cursor**

I’m reviewing the spec, the lecture-note section, and the current simulation structure so I can produce a concrete audit plan without making edits.

I’ve got the audit template and a first pass on the current UI; next I’m pulling the exact lecture-model content for the finite square well so the plan can be anchored to the notes rather than the sim.

The lecture notes make the central mismatch clear: the notes define a well of depth `-V0` on `|x|<a`, while the current sim uses `0` inside, `+V0` outside, and reports energies from the well bottom. I’m checking a couple more rendering details so the plan can name the exact plotting changes too.

I have enough primary-source context to draft the plan; I’m using two quick parallel passes now, one focused on lecture alignment and one on visualization integrity, to catch anything easy to miss in the large HTML file before I lock the plan.

One scope choice could materially change the implementation: the lecture’s main derivation is even-parity only, while the current sim computes both even and odd bound states. I need your preference before I freeze the plan.

**Finite Well Scope**

> **For strict lecture alignment, how should the simulation handle odd bound states?**
> - Restrict the sim to the main lecture scope: even-parity states only
> - Keep all bound states, but simplify the UI and hide parity labels ✔
> - Keep all bound states and mark odd states as beyond the main lecture / exercise material

I’ve got the last scope decision now, and I’m turning the audit into the reviewable plan in the exact simulation-audit structure from `general_specs.md`.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I’m implementing the approved L08 audit plan in the simulation file, starting with the potential/energy convention and then working through the display simplification and plotting rewrite.

I’ve isolated the main implementation hotspots: the current file still mixes the lecture-inconsistent `0..V0` convention with an auto-scaled overlay plot, so I’m restructuring both the UI and the canvas rendering together rather than patching them piecemeal.

I’m replacing the old one-panel overlay with a simpler lecture-aligned version: same bound-state solver, but with the well drawn as `-V0` on `|x|<a`, negative bound energies, and separate panels so `Psi` and `|psi|^2` are plotted with their own real axes.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I’m at the point of editing now: first I’m replacing the lecture-inconsistent labels/sidebar content, then I’ll rework the solver outputs and canvas into separate energy and probability panels so the plot no longer hides state-dependent scaling.

I’m making the structural UI changes first so the later rendering/code cleanup has stable targets: removing the formula-heavy sidebar blocks, switching to `2a`, and rewriting the About text around the lecture convention.

The sidebar and lecture-facing text are now aligned; next I’m switching the state data and drawing code over to lecture-sign energies and separate panels so the visual meaning matches the labels.

I’m replacing the old single-axis plotting block now; this is the main physics/visualization fix because it changes the simulation from “schematic overlays” to actual energy and probability axes.

The main rendering rewrite is in place; I’m cleaning up the remaining references from the old sidebar/formula/tunneling implementation and then I’ll run lints against the edited file.

The file is lint-clean. I’m doing one pass over the updated HTML/JS around the changed sections to catch any runtime mismatches in the new panel drawing and the simplified stats wiring before I mark the todos complete.

I’ve sanity-checked the new sections and I’m doing one final cleanup search for stale IDs or dead code from the removed sidebar/formula implementation, so I don’t leave behind broken references.

The stale-reference check came back clean and the file still has no linter issues. I’m closing out the to-dos now, since the convention change, panel redesign, and UI simplification are all implemented in the simulation file.

Implemented the L08 audit plan in `Sims-QM-lectures/L08_Finite_well_probability_plot.html`.

The sim now follows the lecture convention for the finite well: the potential is displayed as `V(x) = -V0` for `|x| < a` and `0` outside, the width control is labeled as `2a`, and the listed/selected energies are shown as negative bound-state energies relative to the outside region. I kept all bound states in the solver, but removed visible parity labeling from the UI as requested.

The biggest visualization fix is that the old hidden peak-rescaling is gone. The canvas is now split into two panels: an upper energy/potential panel and a lower wavefunction/probability panel with labeled axes for `|ψ|²` and `Ψ(x,t)`. That means the lower curves are plotted against their own physical scales instead of being offset on the energy axis. I also simplified the interface by removing the extra clutter you called out: parity, total bound states, `m`, `ℏ²/(2m)`, `z0`, `delta`, and the formula box. The fixed-mass assumption is now disclosed only in the About text.

Verification: `ReadLints` reports no linter errors for the edited file. I did not run a browser-based visual check here, so if you want, I can do one more pass focused purely on spacing/label readability in the rendered sim.

