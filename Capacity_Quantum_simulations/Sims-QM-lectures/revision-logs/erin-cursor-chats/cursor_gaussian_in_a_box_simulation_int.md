# Gaussian in a box simulation integration
_Exported on 4/2/2026 at 19:01:30 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L13_Fourier-series.html I want to add the Gaussian in a box to this simulation as a third option. I pasted some additional info below on the analytical form. Make a comprehensive plan to add this to the simulation


Yes, there's a clean analytical result.

For a Gaussian centered in a box of length $L$, say $f(x) = e^{-(x - L/2)^2 / 2\sigma^2}$ on $[0, L]$, expanded in a full Fourier series, the key insight is that the Fourier transform of a Gaussian is itself a Gaussian. Let me walk through the two natural basis choices:

**Full Fourier series (sin + cos, period $L$):**

If you center the Gaussian at the origin and work on $[-L/2, L/2]$, the function is even, so all $b_n = 0$ and:

$$a_n = \frac{2}{L} \int_{-L/2}^{L/2} e^{-x^2/2\sigma^2} \cos\!\left(\frac{2\pi n x}{L}\right) dx$$

For $\sigma \ll L$ (Gaussian well-contained), extend limits to $\pm\infty$:

$$a_n \approx \frac{2\sigma\sqrt{2\pi}}{L} \, \exp\!\left(-\frac{2\pi^2 n^2 \sigma^2}{L^2}\right)$$

The coefficients are a Gaussian envelope in $n$-space — they decay super-exponentially, so convergence is dramatically faster than the $1/n$ decay of a square wave.

**Particle-in-a-box basis (sin only, on $[0, L]$):**

If you want $f(x) = \sum b_n \sin(n\pi x / L)$ with the Gaussian centered at $L/2$, you substitute $u = x - L/2$ and use parity to get:

$$b_n \approx \frac{2\sigma\sqrt{2\pi}}{L} \, \sin\!\left(\frac{n\pi}{2}\right) \exp\!\left(-\frac{n^2\pi^2\sigma^2}{2L^2}\right)$$

Here $b_n = 0$ for even $n$ (by symmetry of the centered Gaussian), and odd-$n$ coefficients alternate sign via $\sin(n\pi/2)$.

Both are easy to compute in JS with no numerical integration needed. Want me to go ahead and look at the current sim and implement the instructor's feedback — replacing the sawtooth with a Gaussian-in-a-box option?

---

**Cursor**

I've read the simulation file and the general specs. Let me now create a comprehensive plan for adding the Gaussian-in-a-box as a third wave type.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Now I'll add the Gaussian button and the sigma slider control.

Now add the state variables and sigma slider event listener.

Now add the sigma slider event listener. Let me find where the N slider listeners are.

Now update `setWaveType()` to handle the three states.

Now add the Gaussian computation functions. Let me find the right spot, right after the existing wave term functions.

Now let me add Gaussian branches to all the branching functions. Let me read the current state of those functions.

Now I'll update all the branching functions at once with Gaussian support.

Now update `buildTermCards()` to use `n=i+1` labeling for Gaussian.

Now add the Gaussian branch to `updateEquation()`.

Now the big one: making both canvas drawing functions domain-aware. Let me read the `drawTermCanvases()` and `drawMainCanvas()` functions to identify all the spots that need changes.

I need to update the x-axis labels and vertical grid lines in `drawTermCanvases()` to be domain-aware. The `txToScreen` and data sampling already use `xMin`/`xMax`/`xRange` globals, so those are fine. I just need to change the hardcoded pi labels and grid lines.

Now update `drawMainCanvas()`. Let me read its current state.

Now I need to update several parts of `drawMainCanvas()`:

1. The ideal function call in the Y-range computation
2. The vertical grid lines
3. The x-axis labels
4. The vertical axis line (skip for Gaussian since x=0 is the left edge)
5. The ideal wave drawing
6. The legend text
7. The title text

Let me do these changes.

Now update the vertical grid lines in drawMainCanvas.

Now update the axes and axis labels section.

Now update the ideal wave drawing.

Now update the legend text.

Now update the title text.

Now update the About tooltip and narration steps. Let me read the current tooltip and narration.

Now update the narration steps. Let me read the current narration.

Now update narration step 5 (Wave Type) and add a new step about the Gaussian.

All todos are complete. Let me now do a final review of the file to make sure everything is consistent and there are no issues.

Everything looks good and consistent. Let me also verify the end of the file is clean.

The file looks complete and well-structured. Let me also check the `drawTermCanvases` y-range logic works correctly for Gaussian -- specifically, when `maxAmpFirst` is called with `getTermAmplitude(0)`, for Gaussian that returns `|gaussianCoeff(1)|`. Since `sin(pi/2) = 1`, b_1 is the largest coefficient, so the y-range will be set by the first term. That's correct.

One edge case I want to verify: the `getTermAmplitude(0)` call uses `termIndex + 1 = 1`, so `gaussianCoeff(1)` which has `sin(π/2) = 1`. For the second term (index 1), `gaussianCoeff(2)` has `sin(π) = 0`, so the amplitude is 0. This is correct -- even-n terms are identically zero. The term cards will show `b2 = 0.0000` with a flat line at zero, which is pedagogically valuable as noted in the plan.

Let me also verify there are no issues with the `yMaxVal` for the Gaussian in `drawTermCanvases`. When `maxAmpFirst` is zero (only possible if sigma=0, which can't happen with min=0.02), that could be a problem. But with sigma >= 0.02, `gaussianCoeff(1)` will be positive, so we're fine.

All the changes are complete. Here's a summary of everything that was done:

**HTML changes:**
- Added a third "Gaussian" button to the wave type toggle group
- Added a sigma slider control (`σ/L` range 0.02--0.25, default 0.10) that appears only when Gaussian is selected

**JavaScript state & controls:**
- Added `sigma` and `L_box` variables
- Added sigma slider event listener
- Updated `setWaveType()` to handle the `'gaussian'` type, toggle the sigma control visibility, and switch the plotting domain between `[-2π, 2π]` and `[0, L]`

**Gaussian math functions:**
- `gaussianCoeff(n)` -- analytical formula: `(2σ√(2π)/L) · sin(nπ/2) · exp(-n²π²σ²/2L²)`
- `gaussianTerm(n, x)` -- `b_n · sin(nπx/L)`
- `idealGaussian(x)` -- `exp(-(x - L/2)² / 2σ²)`

**Branching updates in all data functions:**
- `partialSum`, `getTermValue`, `getTermAmplitude`, `getTermLabel`, `getTermAmplitudeDisplay`, `buildTermCards` -- all gained a Gaussian branch

**Equation bar:**
- Gaussian mode shows the compact sum notation with the analytical coefficient formula rendered in KaTeX

**Canvas rendering (both term cards and main plot):**
- Domain-aware axis labels: `0, L/4, L/2, 3L/4, L` instead of `−2π...2π`
- Domain-aware grid lines
- Correct ideal function dispatch
- Proper legend and title text ("Gaussian in a Box")
- Disabled the discontinuity-jump detection for the smooth Gaussian target

**About tooltip and narration:**
- Updated tooltip to mention all three wave types and contrast convergence rates
- Updated narration step 5 to describe three options
- Added a new narration step 6 specifically about the Gaussian's super-exponential convergence and the role of sigma

---

**User**

Make a file with a 2-sentence summary of what was done and why, similar to the format of @Sims-QM-lectures/revision-logs/L02_Two_Gaussian_superposition.md , in the same folder

---

**Cursor**

Done. The revision log is at `Sims-QM-lectures/revision-logs/L13_Fourier-series.md`.

---

**User**

Can you make the dotted line for the target wave a wider px? So it can be seen behind the partial sum

---

**Cursor**

Done -- the target wave dashed line is now 3.5px wide (up from 2px), so it should be clearly visible behind the partial sum trace.

