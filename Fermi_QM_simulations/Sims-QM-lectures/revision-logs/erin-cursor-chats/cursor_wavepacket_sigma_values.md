# Wavepacket sigma values
_Exported on 4/13/2026 at 22:22:36 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html what is the initial wavepacket sigma value? What is the "measured" wavepacket sigma value?

---

**Cursor**

I’m checking `L15_2d_wavefunction_collapse_measurement.html` for the wavepacket initialization and the post-measurement collapse settings, then I’ll point you to the exact code locations.

I found the sigma-related paths; next I’m reading the simulation logic around `getCurrentSigma()` and the measurement collapse to distinguish the initial width from the measured width.

The initial wavepacket sigma is `1.0` by default, stored in `initialWidth` and also set as the default `value` of the `widthSlider`.

```635:653:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
let initialWidth = 1.0;
let simulationSpeed = 0.2;
let initialPosX = 0;
let initialPosY = 0;
/* ... */
const hbar = 1;
const mass = 1;
const collapsedSigma0 = 0.3;
```

```559:562:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
<label for="widthSlider">Initial Width (sigma)</label>
<input type="range" class="slider" id="widthSlider" min="0.72" max="1.96" value="1.0" step="0.01">
```

The "measured" wavepacket sigma, meaning the width of the collapsed packet after pressing `Measure`, is `0.3`, from `collapsedSigma0`.

```944:949:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function getCurrentSigma(t) {
    if (isCollapsed) {
        const dt = Math.max(0, t - collapseTime);
        return Math.sqrt(collapsedSigma0 * collapsedSigma0 + (hbar * dt / (2 * mass * collapsedSigma0)) ** 2);
    }
    return Math.sqrt(initialWidth * initialWidth + (hbar * t / (2 * mass * initialWidth)) ** 2);
}
```

One subtlety: the measurement outcome position is sampled using the current pre-measurement sigma, but the post-measurement collapsed state is reset to sigma `0.3`.

---

**User**

change the initial and the measured value of sigma to both be 0.5. 

---

**Cursor**

I’m updating `L15_2d_wavefunction_collapse_measurement.html` so both the starting packet width and the post-measurement collapsed width use `sigma = 0.5`, and I’m checking the slider defaults so the UI stays consistent.

I found one extra UI dependency: the width slider currently can’t represent `0.5`, so I’m lowering its minimum and aligning the displayed default with the new sigma values.

The sigma values are changed; I’m doing a quick verification pass on the edited lines and checking for any linter issues in the file.

`L15_2d_wavefunction_collapse_measurement.html` now uses `sigma = 0.5` for both the initial wavepacket and the post-measurement collapsed wavepacket. I also updated the width slider UI so the default display is `0.50` and the slider can actually select `0.5` as its minimum.

No linter issues showed up in that file.

---

**User**

- change the default sigma for both to 0.75. 
- Instead of the "initial width" slider, make it a "measurement sigma" slider. Make it so the "initial sigma" is the same as the measurement sigma. 
- make the sliders min/max values 0.7 to 2.0

---

**Cursor**

I’m updating the sigma controls in `L15_2d_wavefunction_collapse_measurement.html` so there’s a single slider for measurement sigma, with both the initial packet and collapsed packet tied to that same value and the range set to `0.7`-`2.0`.

I’ve got the relevant hooks. I’m making the single sigma control drive both the pre-measurement and post-measurement widths, and I’m updating the UI text so it reflects that behavior instead of “initial width.”

The code changes are in place. I’m doing a quick pass now to confirm the new defaults, slider bounds, and shared sigma logic are all consistent.

`L15_2d_wavefunction_collapse_measurement.html` now uses a single `Measurement Sigma` slider with a default of `0.75`, and that same value drives both the initial wavepacket sigma and the post-measurement collapsed sigma. The slider range is now `0.7` to `2.0`.

I also updated the descriptive UI text so it matches the new behavior. No linter issues showed up in the file.

---

**User**

change the label "sigma" to the actual symbol

---

**Cursor**

I’m updating the visible UI text in `L15_2d_wavefunction_collapse_measurement.html` so occurrences of the word `sigma` use the Greek symbol `σ` instead.

I found two user-facing places using the word `sigma`: the slider label and the control description in the tooltip. I’m changing both to `σ` so the terminology stays consistent across the UI.

The text update is in. I’m doing a quick check to confirm the visible label now uses `σ` and that nothing else broke.

The visible UI text in `L15_2d_wavefunction_collapse_measurement.html` now uses `σ` instead of the word “sigma,” including the slider label and the control description tooltip.

No linter issues showed up.

---

**User**

thoroughly check the correctness of this physics simulation @Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html . 

---

**Cursor**

Let me read the full simulation file to do a thorough physics review.

I've now read the entire simulation logic. Here is a thorough physics audit.

---

## Physics Correctness Review

### 1. Free-particle Gaussian spreading -- CORRECT

The `getCurrentSigma` function (line 944) implements:

$$\sigma(t) = \sqrt{\sigma_0^2 + \left(\frac{\hbar t}{2 m \sigma_0}\right)^2}$$

This is the standard result for the width (standard deviation of |ψ|²) of a minimum-uncertainty Gaussian wavepacket evolving under the free-particle Hamiltonian. You can verify by expanding the textbook form σ₀√(1 + (ℏt/2mσ₀²)²) -- they are algebraically identical.

The code correctly uses `dt = t - collapseTime` for the post-collapse branch and `t` for the pre-collapse branch.

### 2. 2D probability density -- CORRECT

```1170:1179:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function gaussianWavepacket(x, y, t) {
    const sigma = getCurrentSigma(t);
    const center = getCurrentCenter();
    const x0 = center.x;
    const y0 = center.y;

    const r2 = (x - x0) ** 2 + (y - y0) ** 2;
    // This returns the probability density |psi|^2, normalized on the full x-y plane.
    const amplitude = gaussianDensityNorm2D(sigma);
    return amplitude * Math.exp(-r2 / (2 * sigma * sigma));
}
```

This returns:

$$|\psi(x,y,t)|^2 = \frac{1}{2\pi\sigma(t)^2}\,\exp\!\left(-\frac{r^2}{2\sigma(t)^2}\right)$$

which integrates to 1 over the full plane. Correct for an isotropic 2D Gaussian with zero initial momentum (center doesn't translate, only spreads).

### 3. Visible probability mass -- CORRECT

```959:966:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function getVisibleProbabilityMass(t) {
    const sigma = getCurrentSigma(t);
    const center = getCurrentCenter();
    const min = -gridSize;
    const max = gridSize;
    const px = gaussianMassInWindow1D(center.x, sigma, min, max);
    const py = gaussianMassInWindow1D(center.y, sigma, min, max);
    return Math.max(0, Math.min(1, px * py));
}
```

Since the 2D Gaussian is separable, the rectangular integral factors as a product of two 1D CDF differences. Each 1D term uses:

$$P_x = \tfrac{1}{2}\!\left[\text{erf}\!\left(\frac{x_\text{max}-\mu}{\sqrt{2}\,\sigma}\right) - \text{erf}\!\left(\frac{x_\text{min}-\mu}{\sqrt{2}\,\sigma}\right)\right]$$

which is the standard Gaussian CDF formula. The erf approximation is Abramowitz-Stegun 7.1.26 (max error ~1.5 x 10^-7). All correct.

### 4. Born-rule measurement sampling -- CORRECT

```1234:1242:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function measureWavefunction() {
    // Exact sampling from the Born distribution conditioned on the finite detector window.
    const sigma = getCurrentSigma(time);
    const center = getCurrentCenter();
    const min = -gridSize;
    const max = gridSize;

    collapsePosition.x = sampleTruncatedGaussian1D(center.x, sigma, min, max);
    collapsePosition.y = sampleTruncatedGaussian1D(center.y, sigma, min, max);
```

The measurement position is drawn from the current |ψ|² distribution truncated to the visible window. Because the 2D Gaussian over a rectangular window remains separable, sampling x and y independently from truncated 1D Gaussians is mathematically exact. The rejection sampler is a correct method for truncated-Gaussian sampling.

### 5. Box-Muller normal sampling -- CORRECT

```919:934:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function sampleStandardNormal() {
    if (spareStandardNormal !== null) {
        const cached = spareStandardNormal;
        spareStandardNormal = null;
        return cached;
    }

    let u1 = 0;
    let u2 = 0;
    while (u1 <= Number.EPSILON) u1 = Math.random();
    u2 = Math.random();

    const mag = Math.sqrt(-2 * Math.log(u1));
    const angle = 2 * Math.PI * u2;
    spareStandardNormal = mag * Math.sin(angle);
    return mag * Math.cos(angle);
}
```

Standard Box-Muller with the correct guard against log(0). Correct.

### 6. Post-collapse re-spreading -- CORRECT

After collapse, the state is modeled as a new Gaussian centered at the measured position with width `measurementSigma`, which then spreads again using the same free-particle formula with `dt = t - collapseTime`. Repeated measurements correctly resample from the current (spread) distribution and reset the collapse clock. This is all physically sound.

### 7. Normalization display (hardcoded `1.000000`) -- CORRECT

The analytic normalization over the infinite plane is exactly 1 at all times, so hardcoding this is appropriate. The separate "visible mass" readout correctly tracks how much probability is inside the finite window.

---

## One physics note (not an error)

Since `initialWidth` and `measurementSigma` are now the same value (0.75), a measurement no longer produces a visibly narrower packet -- it only **relocates** the wavepacket to the sampled position and resets the spreading clock. If the intent is to demonstrate wavefunction *collapse* (narrowing), you'd want the post-measurement sigma to be noticeably smaller than the pre-measurement sigma at the time of measurement. This was the case with the original values (initial 1.0, collapsed 0.3). The current configuration is still physically valid -- it just shows "re-localization without narrowing" rather than the dramatic collapse-to-a-spike effect.

---

**Bottom line: the physics is correct.** The spreading formula, normalization, Born-rule sampling, erf approximation, and post-collapse dynamics are all implemented faithfully. No errors found.

---

**User**

in the heatmap mode, make the grid line up with 1 unit spaces on the axes 

---

**Cursor**

The current grid uses an arbitrary pixel step. I need to change it so each grid line corresponds to 1 physical unit on the axes (every integer from -10 to 10).

Done. The heatmap grid lines now land on every integer from -10 to 10 in both x and y, matching the physical coordinate axes. Lines at multiples of 5 (the labeled tick marks) are drawn slightly brighter so the major gridlines stand out, while the intermediate 1-unit lines are subtler.

---

**User**

Make the "measure" button Blue and above the "heatmap" section 

---

**Cursor**

Now I'll move the Measure button into its own section above the "View & measurement" section, and give it a blue style.

I also need to make the blue hover state work for the Measure button. Let me add a dedicated style for it rather than relying on the inline style alone.

Now let me clean up the inline style since the CSS handles it.

Done. The Measure button is now:

1. **Blue** (`#2563eb` background, lighter `#3b82f6` on hover) -- matching the Play button style.
2. **Above** the heatmap/view toggle section, in its own panel section at the top of the sidebar controls.

---

**User**

Add a "Lecture display" checkbox option under "visuals" which hides the "statistics" and "recent collapses" sections

---

**Cursor**

I can see the structure. I'll add a "Lecture display" checkbox under the Visuals section and add IDs to the Statistics and Recent Collapses sections so they can be toggled.

Now add an ID to the Recent Collapses section.

Now add the event listener for the checkbox. Let me find where the other listeners are.

Done. There's now a **Lecture display** checkbox under the Visuals section. When checked, it hides both the Statistics and Recent Collapses panels; unchecking it brings them back.

---

**User**

add an entry in the logs stating what was changed and why: @Sims-QM-lectures/revision-logs/L15_2d_wavefunction_collapse_measurement.md 

---

**Cursor**

Added the new log entry at the top of the revision log, summarizing all the changes from this session: unified sigma control, σ symbol, heatmap grid alignment, blue Measure button repositioning, Lecture display toggle, and the physics audit.

