# Removal of nm units in HTML file
_Exported on 4/2/2026 at 19:01:50 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L02_Two_Gaussian_superposition.html remove all use of "nm" units

---

**Cursor**

Searching the file for "nm" occurrences to remove nanometer units.



Removing all "nm" labels and using dimensionless position/localization display (numbers only or neutral axis label).



Summary of changes:

**Sliders (HTML)**  
- `X₁` / `X₂`: default readouts and tick labels are numeric only (`-2.00`, `+2.00`, marks `-5`, `0`, `+5`).  
- `a`: readout is just the number; end marks are `0.1` and `3.5`; middle is `σ_x =` plus the value with no trailing unit.

**Plot**  
- Horizontal axis label is now `Position, x` (no `(nm)`).

**JavaScript `update()`**  
- `vX1` / `vX2` show only the signed number.  
- `vA` shows `a.toFixed(3)` with no `nm⁻²` suffix.

Math and slider ranges are unchanged; only displayed units were removed so everything reads as dimensionless coordinates.

---

**User**

remove the explicit + from displaying for positive numbers

---

**Cursor**

Removing the `+` prefix from X₁/X₂ value displays and updating the initial HTML and slider marks if they use `+`.



Here’s what was updated:

1. **`update()`** — `vX1` and `vX2` now use `X1.toFixed(2)` and `X2.toFixed(2)` only (no leading `+` for nonnegative values).

2. **Initial `vX2`** — Default text is `2.00` instead of `+2.00`.

3. **Slider end labels** — The right tick is `5` instead of `+5` on both `X₁` and `X₂` sliders so positive endpoints match the same convention.

Negative values still show a normal minus sign from `toFixed(2)` (e.g. `-2.00`).

---

**User**

remove the small numbers below the sliders

---

**Cursor**

Removing all `.marks` rows and moving `vSigma` into the `a` slider header so `update()` still finds it.



Here’s what changed:

**Removed** every `<div class="marks">…</div>` under the five sliders (the small min / mid / max labels).

**CSS** — Dropped the `.marks` rule and the bright-theme `.marks` override.

**σₓ readout** — It used to live in the `a` slider marks row. It’s now on the same line as `a`, as  
`1.000 · σₓ=0.50` (with `vA` and `vSigma` still updated by `update()`). The old markup also had a typo (`σ</sub>`); it’s now valid `σ<sub>x</sub>`.

---

**User**

Change the auto scaling of the bottom plot y axis so the max height of the plot occurs at around 75%height of the total plot

---

**Cursor**

Implementing auto y-scaling for plot 3 only: compute data peaks and set axis max so peaks sit at 75% of the plot height. Top plots keep fixed scales.



Here is what was implemented:

### Probability mode (bottom `|Ψ|²` plot)
- After the two component plots, the code finds `probPeak = max over x of (|Ψ|² and the classical mixture curve)`.
- The bottom axis uses `probYMax3 = probPeak / 0.75` so that peak sits at **75%** of the way from 0 to the top of the y-axis (about **25%** headroom above).
- If everything is effectively zero (`probPeak ≤ 1e-15`), it keeps the old fixed cap `probYMax = 1.5`.
- Interference thresholds and markers on that plot now use `probYMax3` so they stay consistent with the new scale.

### Real-part mode (bottom `Re(Ψ)` plot)
- `rePeak` is the largest `|Re|` among the two components and the sum.
- `reYMax3 = rePeak / 0.75` gives a symmetric `[-reYMax3, reYMax3]` range so the largest excursion uses **75%** of the half-span from the axis center to the top (or bottom).
- If `rePeak` is negligible, it falls back to the fixed `reYMax = 1.2`.

The top two plots are unchanged (still 0…1.5 for densities and ±1.2 for `Re` components).

The fraction is set as `yAxisPeakFraction = 0.75` next to the padding config so you can tune it in one place.

---

**User**

remove the "sigma sub x from displaying

---

**Cursor**

Here’s what was changed:

**`a (localization)` row** — The extra readout `· σ_x = …` is removed. That control now matches the others: a single value span with `id="vA"` (e.g. `1.000`).

The `update()` logic in your file no longer referenced `vSigma` or a `sigma` variable, so nothing else needed editing there.

If anything still shows σ_x after a refresh, say where you see it (e.g. about popup or equations) and we can strip that too.

---

**User**

Move the "lecture 2 model" section and equations into the info "about" button

---

**Cursor**

Moving the Lecture 02 Model block into the about popup, merging equation rendering into `renderAboutLatex`, and removing per-frame `renderRhsEquations()` from `update()`.



Here’s what was done:

### Layout
- Removed the whole **Lecture 02 Model** block from the right-hand panel (note + three equation cards).
- Added a matching **Lecture 02 model** block in the **About** dialog (after **Scope**, before the quote), with the same note text and the same three targets: `rhsEqPsi1`, `rhsEqPsi2`, `rhsEqPsi`.

### Rendering
- **`renderAboutLatex()`** now draws all five math regions the first time the About dialog is opened: the two existing display equations plus the three component/superposition equations (via **`renderMath`** when KaTeX is available).
- Non-KaTeX and **catch** paths set plain/unicode fallbacks for those three as well.
- Removed **`renderRhsEquations()`** and the **`renderRhsEquations()`** call from **`update()`**, so those equations are no longer re-rendered every frame.

### Styling / UX
- About dialog **`max-width`** increased to **520px** so the wider formulas fit.
- **`about-body`** uses **`max-height: min(85vh, 720px)`** and **`overflow-y: auto`** so long content scrolls on short screens.
- Scoped rules for **`.about-popup .eq-stack`**, **`.about-popup .eq-body`** (right-aligned, blue tone), KaTeX size, and bright-theme **`.eq-body`** color so it matches the rest of the popup.

Opening **(i)** still positions the popup and runs **`renderAboutLatex()`** once; the model text and ψ₁, ψ₂, Ψ equations only appear there now.

---

**User**

When first opened/hitting "reset", default to the display with the bottom plot maximized

---

**Cursor**

Implementing in `L02_Two_Gaussian_superposition.html`: it has the three-plot maximize UI. Adding `ensureMaximized(3)` for initial load and reset, and refactoring `setMaximized` to use it.



Removing duplicate `scheduleUpdate` calls: `ensureMaximized` shouldn't call `scheduleUpdate` because `setMaximized` already does; fixing `setMaximized` logic.



Implemented this in **`Sims-QM-lectures/L02_Two_Gaussian_superposition.html`** (the sim with three stacked plots and per-plot maximize). **`L03_classical-vs-schrodinger.html`** doesn’t have that maximize UI—only the two canvases per column—so nothing was changed there.

### Changes
1. **Initial layout** — `#plotsArea` now includes the class **`maximized-3`** so the superposition plot is large on first paint (no flash of three equal rows).
2. **Plot 3 control** — Default **`title`** / **`aria-label`** match the restored state (“Restore (minimize)” / “Restore”).
3. **`ensureMaximized(plotNum)`** — Applies a given maximized layout and updates the three maximize buttons (no double `scheduleUpdate`).
4. **`clearMaximizedLayout()`** / **`setMaximizeButtonTitles()`** — Shared helpers; **`setMaximized`** still toggles maximize ↔ grid.
5. **Load** — After wiring listeners, the script runs **`ensureMaximized(3)`** then **`update()`** so titles stay in sync.
6. **Reset** — After restoring sliders and `|ψ|²` mode, it runs **`ensureMaximized(3)`** and **`scheduleUpdate()`** so reset always returns to the bottom plot maximized.

If you instead want **`L03_classical-vs-schrodinger.html`** to favor the lower canvas (e.g. `|ψ|²` vs potential), say how you’d like that to behave and we can add it.

