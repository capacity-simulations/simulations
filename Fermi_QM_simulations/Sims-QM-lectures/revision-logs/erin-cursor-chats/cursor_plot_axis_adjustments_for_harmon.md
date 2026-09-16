# Plot axis adjustments for harmonic oscillator
_Exported on 4/2/2026 at 19:03:40 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L07_harmonic-oscillator.html right now, there is a lot of wasted x-axis space in all plots, and a lot of wasted y axis space in the bottom two plots. 
I don't want the axes so scale dynamically in the y-axis or x-axis. I also don't want to have the x-ticks overlap (as they do now for small mass). Feel free to change the max/min m and omega values if needed

Write a plan to satisfy these requirements.  



---

**Cursor**

Reading the harmonic oscillator lecture HTML to see how plots and axes are configured.



Analyzing axis logic: `getSuggestedXRange()` and `drawAxes` drive dynamic x-ranges and integer x-ticks that crowd when the range is large.



---

**User**

Make sure the plan still faithfully implements the correct functions, with no visual distortion

---

**Cursor**

Locating and updating the plan to require faithful physics plotting and no geometric distortion.



Updating the plan with an explicit “faithful rendering” section: preserve linear mapping, unchanged physics formulas, and envelope-based bounds so curves aren’t clipped in misleading ways.



Fixing a markdown typo on the "Files to touch" line.



Here’s what changed in the plan ([`/Users/erincrawley/.cursor/plans/l07_fixed_axes_plan_159fe45c.plan.md`](/Users/erincrawley/.cursor/plans/l07_fixed_axes_plan_159fe45c.plan.md)):

### Added: **Faithful functions and no visual distortion**
- Only **axis limits** change; **`psiN` / Hermite / `energy1D` / V in ℏω units** stay as they are—no extra rescaling of plotted values.
- Keep **linear `mapX` / `mapY`**, no log axes, no per-frame stretch, and **one linear energy scale** on the potential panel for both V(x) and the n-lines.
- **Same `PLOT_X_MAX`** on all three plots so x means the same thing in each row.
- **Envelope limits should contain the true curves** for every allowed `(n, m, ω)`, with a small headroom (1–3%) so you don’t get misleading **flat tops** from y-clipping.
- If full envelope makes **`ymax_pot`** huge, **tighten sliders or `PLOT_X_MAX`** instead of using an arbitrary low `ymax` that clips only V while levels still look fine.

### Potential panel (revised)
- **`ymax_pot`** is explicitly **envelope-based**: covers **max energy level** and **`½ μ PLOT_X_MAX²` over μ ∈ [μ_min, μ_max]**, so V at the corners isn’t clipped for any slider value, **on the same scale as the energy lines**.

### Todos & verification
- **envelope-constants** todo now includes potential **ymax** and “small headroom / avoid clipping.”
- New **`faithful-rendering`** todo: linear maps, shared y-scale per panel, verify bounds vs extrema.
- **Verification** adds peak/zero checks and **V vs levels on one axis**.

Also fixed a small markdown glitch in the “Files to touch” bullet.

When you’re ready to have this implemented in the HTML file, say to execute the plan and we can do that next.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the plan: reading the file and updating todos.



Implementing envelope constants, tightening sliders so `ymax_pot` stays manageable (plan: adjust μ range), then updating drawing and `drawAxes`.



Fixing mass display: `toFixed(1)` rounds 1.05 to 1.1. Using two decimal places for mass.



Here is what was implemented in [`Sims-QM-lectures/L07_harmonic-oscillator.html`](Sims-QM-lectures/L07_harmonic-oscillator.html):

### Envelope (fixed axes, no rescaling of physics)
- **`MIN_MASS` / `MAX_MASS` / `MIN_OMEGA` / `MAX_OMEGA`** set to **0.7–1.2** (matches sliders) so **`μ_max/μ_min`** stays moderate and **`YMAX_POT = max(n_max+½+margin, ½ μ_max PLOT_X_MAX²)`** stays on the order of tens instead of thousands, while still fitting **n = 0…10** on **x**.
- **`PLOT_X_MAX`** = classical turning point for **n = 10** at **μ_min**, times **1.12**; all three panels use **`x ∈ [−PLOT_X_MAX, PLOT_X_MAX]`**.
- **`PSI_Y_MAX`** and **`PROB_Y_MAX`** come from a **single grid search** over **n**, **μ**, and **x** on that window, with **`ENVELOPE_HEADROOM = 1.02`** (still using **`psiN`** / Hermite as before).
- **`YMAX_POT`** uses the same ℏω units as **`V/(ℏω)`** and **`E_n/(ℏω)`** so the potential and level lines stay on **one linear scale**.

### Drawing
- **`drawPotential`**: fixed **`xmin/xmax`** and **`ymin = −0.5`**, **`ymax = YMAX_POT`**; energy loop uses **`N_SLIDER_MAX`**.
- **`drawWavefunction`**: **`±PSI_Y_MAX`** on **x** as above.
- **`drawProbability`**: **`ymin = 0`**, **`ymax = PROB_Y_MAX`** (no fake negative band).

### Ticks
- **`niceTickStep`** + **target tick count** from plot width (~**48 dpr px** per x-label) so x labels do not crowd at small **μ** (with the old huge x-range).

### Sliders & labels
- HTML ranges updated to **0.7–1.2**, **step 0.05**; **`massVal`** uses **`toFixed(2)`** so values like **1.05** display correctly.

`getSuggestedXRange`, **`computeMaxPsi`**, and the old analytic **`WAVEFUNCTION_Y_MAX` / `PROBABILITY_Y_MAX`** are removed. All related todos are **completed**. Open the HTML in a browser to confirm layout on your screen size.

---

**User**

make sure the psi(x, t) and psi^2 in the titles don't render in all caps

---

**Cursor**

Removing `uppercase` from the parent forces the whole title to mixed case. Splitting labels: keep `uppercase` on the English words and wrap the math in `normal-case`.



Here’s what changed:

The second and third plot captions used Tailwind’s **`uppercase`** on the whole line, so **ψ** and **|ψ|²** were forced to capitals (where the font even has them).

Those lines are now split so only the English part is uppercased:

- **Wavefunction** → `<span class="uppercase">Wavefunction</span> <span class="normal-case">ψ(x,t)</span>`
- **Probability density** → `<span class="uppercase">Probability density</span> <span class="normal-case">|ψ|²</span>`

`uppercase` was removed from the outer div and applied only to the first span; the math uses **`normal-case`** so **`text-transform: none`** applies and ψ / |ψ|² render as intended.

The rotated canvas y-axis labels (`'ψ(x,t)'` and `'|ψ|²'` in `drawAxes`) were already unaffected by CSS.

---

**User**

-Make the Energy axis not scaled by h omega. Scale the max y-axis point so that the max n value is near the top of the plot. 

---

**Cursor**


Reading the potential plot and energy-scaling logic in L07.




Using absolute energy E = (n+½)ℏω (with ℏ=1, E = (n+½)ω) for the potential plot, setting ymax from the highest level so n_max sits near the top, and removing the ℏω-normalized axis.




Here is what changed:

### Energy axis (potential plot)
- **Units**: The vertical axis is now **actual energy** \(E\) and \(V(x)=\tfrac12 m\omega^2 x^2\) (same units as \(E_n=(n+\tfrac12)\hbar\omega\) with **\(\hbar=1\)** in your sim). The label is **`Energy`** instead of **`Energy (ℏω)`**.
- **Range**: **`ymax = energy1D(N_SLIDER_MAX) * 1.08`**, so the **\(n=10\)** level sits a little below the top (~8% headroom). **`ymin = 0`** so the bottom is physical \(V(0)=0\).
- **Drawing**: Level positions use **`mapY(En, …)`** with **`En = energy1D(n)`** (no division by \(\hbar\omega\)). The potential curve uses **`0.5 * mass * omega * omega * x * x`**, which matches that energy scale (the old **`0.5 * mu * x²`** was **\(V/(\hbar\omega)\)** with \(\mu=m\omega/\hbar\)).

The parabola can still be **clipped at the top** when \(V(x)\) exceeds `ymax`; that is expected when the window is tuned so the **highest \(n\) line** fills the plot.

The unused **`YMAX_POT`** constant was removed.

---

**User**

Actually, I don't like the dynamic scaling. Make it so the y max is at the max omega height (looks to be around 14/15, but don't hard code -- use the max height the y axis is at for the largest omega value.)

---

**Cursor**


Defining a fixed potential `ymax` from `MAX_OMEGA` and `N_SLIDER_MAX` (same headroom factor), and using it in `drawPotential`.





Here’s what changed:

**`POT_E_Y_MAX`** is set once from the same knobs as the UI (no literal 14/15):

```js
const POT_E_Y_MAX = (N_SLIDER_MAX + 0.5) * hbar * MAX_OMEGA * POT_E_Y_HEADROOM;
```

So the top of the energy axis is the energy of the **highest \(n\)** when **\(\omega = \omega_\mathrm{max}\)** (from `MAX_OMEGA`), plus the existing **8%** headroom. With `N_SLIDER_MAX = 10`, `MAX_OMEGA = 1.2`, `hbar = 1`, that’s **10.5 × 1.2 × 1.08 ≈ 13.6**.

**`drawPotential`** always uses **`ymax = POT_E_Y_MAX`**, so the vertical scale no longer depends on the current \(\omega\). Level lines and \(V(x)\) still use the **current** `omega` and `mass`; at \(\omega_\mathrm{max}\), the \(n = 10\) line sits just under the top; for smaller \(\omega\), the same levels sit lower on a fixed axis.

If you change the ω slider’s `max` in HTML, keep **`MAX_OMEGA`** in the script aligned so this stays correct.

