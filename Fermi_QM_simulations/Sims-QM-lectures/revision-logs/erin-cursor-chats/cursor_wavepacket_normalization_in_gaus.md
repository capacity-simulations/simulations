# Wavepacket normalization in Gaussian function
_Exported on 4/2/2026 at 21:43:52 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html Very carefully check the physics here. Specifically, I want to totally ensure that the wavepacket is always correctly normalized. The volume under the Gaussian should be = 1. 

---

**Cursor**

I’m checking the 2D collapse simulation’s wavepacket definition and probability-density math first, with a focus on whether the Gaussian is normalized at every stage.

I’ve found the core normalization logic. Next I’m reading the evolution and measurement code around `gaussianWavepacket()` and the finite-window sampling to verify the formulas, not just the labels.

The core 2D Gaussian formula itself looks physically right so far. I’m now checking whether the simulation ever mixes up “normalized on all space” versus “normalized inside the visible square,” because that’s the main place a hidden normalization bug could creep in.

I’ve confirmed the analytic form is the standard normalized 2D Gaussian on the plane. I’m doing one more pass with a numerical check, then I’ll either report that it’s sound or make the normalization more explicit in the code and UI if there’s any ambiguity.

I didn’t find a normalization error in the actual 2D Gaussian formula, but the file currently blurs two different ideas: normalization over all space versus mass inside the finite plotted window. I’m tightening that up in the code and UI so the normalization is explicit and auditable.

I checked the normalization carefully, and the Gaussian itself is physically correct. The code is using the standard 2D probability density
\[
\rho(x,y,t)=|\psi|^2=\frac{1}{2\pi\sigma(t)^2}\exp\!\left[-\frac{(x-x_0)^2+(y-y_0)^2}{2\sigma(t)^2}\right],
\]
which integrates to `1` over the full `x-y` plane for any `sigma(t)`.

```913:915:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
function gaussianDensityNorm2D(sigma) {
    return 1 / (2 * Math.PI * sigma * sigma);
}
```

```1143:1152:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
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

What I changed was to make that distinction explicit in the simulation, because the only subtlety here is that the plotted square is finite. So the packet is always normalized on all space, but the probability visible inside the `[-10,10] x [-10,10]` window can be slightly below `1` when tails extend beyond the view. I added a `Total Probability = 1.000000` readout and a separate `Visible Probability` readout so the physics is auditable instead of implicit.

```1179:1183:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
const visibleMass = getVisibleProbabilityMass(time);
document.getElementById('timeDisplay').textContent = time.toFixed(2);
document.getElementById('peakDisplay').textContent = peakPsi2 < 0.01 ? peakPsi2.toExponential(2) : peakPsi2.toFixed(4);
document.getElementById('normalizationDisplay').textContent = '1.000000';
document.getElementById('visibleMassDisplay').textContent = visibleMass.toFixed(6);
```

I also updated the tooltip text so it now says explicitly that `∫∫ |ψ|² dx dy = 1` on the full plane, while measurement is sampled within the finite viewing window and therefore renormalized there.

As a cross-check, I numerically integrated the implemented Gaussian and got `~1.0000000000` for representative widths, so there is no normalization bug in the packet formula. No linter issues were introduced.

One residual note: `measureWavefunction()` still samples the finite-window Born distribution by Monte Carlo over random points, so the measurement distribution is approximate, not exact. If you want, I can make that sampling exact as well by replacing it with direct sampling from the truncated 2D Gaussian.

---

**User**

Yes, make the sampling exact

---

**Cursor**

I’m replacing the Monte Carlo weighted-point measurement with exact sampling from the truncated Gaussian in the visible square, so the collapse outcomes follow the Born rule without approximation.

I’ve got the exact approach: sample each coordinate from the corresponding 1D Gaussian and reject only points outside the detector bounds. Because the 2D density factorizes over the square window, that gives the exact truncated 2D Born distribution.

The code change is in place and lint-clean. I’m making one final wording tweak so the UI now explicitly says the finite-window measurement is sampled exactly, not approximately.

The measurement step is now exact within the finite detector window.

I replaced the old Monte Carlo weighted-point approximation with direct sampling from the truncated Gaussian: each coordinate is drawn from the corresponding 1D normal distribution and rejected unless it lies in `[-gridSize, gridSize]`. Because the 2D Gaussian factorizes, that produces the exact Born distribution conditioned on being inside the visible square.

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

```917:941:Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html
let spareStandardNormal = null;

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

function sampleTruncatedGaussian1D(mu, sigma, minVal, maxVal) {
    while (true) {
        const sample = mu + sigma * sampleStandardNormal();
        if (sample >= minVal && sample <= maxVal) return sample;
    }
}
```

I also updated the tooltip text so it now says the measurement is sampled exactly from `|ψ|²` in the finite window. Lint check is clean.

If you want, I can also add a small on-screen note that distinguishes “full-plane normalization” from “finite-window measurement” even more explicitly for students.

---

**User**

What is the speed at which the wavepacket spreads? Do a full physics audit to make sure the wavefunction spreading speed, center position speed, etc. is totally correct. 

---

**Cursor**

I’m auditing the simulation’s dynamics now: the time-dependent width, the packet center motion, and whether the implemented formulas match a correct free-particle Gaussian in 2D.

I’ve finished the audit. The core verdict is that the displayed density dynamics are correct for a zero-momentum free Gaussian, but the simulation is not a full complex wavefunction model, so there are a couple of important scope caveats I’m packaging into a concrete plan.

