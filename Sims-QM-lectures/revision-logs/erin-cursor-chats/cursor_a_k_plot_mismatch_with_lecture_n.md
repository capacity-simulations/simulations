# A(k) plot mismatch with lecture notes
_Exported on 4/2/2026 at 19:03:33 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/QM_intro.tex @Sims-QM-lectures/L06_A(k)-vs-k-plot.html This function is not matching with the lecture notes: @QM_intro.tex (888-889) . Fix the html code so it accurately plots A(k) as specified in the notes. 

---

**Cursor**

I’m checking the lecture note formula against the plotting code now, then I’ll update the HTML so the plotted `A(k)` matches the expression in `QM_intro.tex`.

I found the mismatch: the HTML is using a normalized Gaussian with different prefactor and denominator, while the notes define `A(k)` with an added constant factor and `2σ²` in the exponent. I’m reading the plotting logic now so I can update both the displayed formula and the actual curve.

The notes’ extra factor `exp(k0² / 2σ²)` can make the peak very large, so I’m also checking the y-axis logic; otherwise the corrected formula would immediately clip off the plot for larger `k0/σ`.

I’ve got the fix scoped: update the displayed formula, replace the old normalized Gaussian with the lecture-note expression, and make the y-axis/labels scale to the much larger amplitudes that expression can produce.

The core plot is fixed. I’m making one more pass through the explanatory text so the page description matches the corrected `A(k)` instead of the old normalized-probability wording.

Updated `Sims-QM-lectures/L06_A(k)-vs-k-plot.html` so the plot now matches the lecture-note definition of `A(k)` from `QM_intro.tex`. The displayed KaTeX formula and the JS plotting function now use
```356:360:Sims-QM-lectures/L06_A(k)-vs-k-plot.html
const latexFormula = 'A(k) = \\exp\\!\\left(-\\frac{(k-k_0)^2}{2\\sigma^2} + \\frac{k_0^2}{2\\sigma^2}\\right)';
document.addEventListener('DOMContentLoaded', function() {
    if (typeof katex === 'undefined') return;
    const opts = { displayMode: true, throwOnError: false };
```

```427:430:Sims-QM-lectures/L06_A(k)-vs-k-plot.html
// Lecture-note definition of A(k)
function gaussian(k, k0, sigma) {
    const exponent = (k0 * k0 - (k - k0) * (k - k0)) / (2 * sigma * sigma);
    return Math.exp(exponent);
}
```

Because this expression can produce much larger amplitudes than the old normalized Gaussian, I also made the y-axis and tooltip formatting scale dynamically so the corrected curve stays visible across the slider range:
```438:455:Sims-QM-lectures/L06_A(k)-vs-k-plot.html
function getYAxisStep(maxValue) {
    const roughStep = maxValue / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const residual = roughStep / magnitude;

    if (residual <= 1) return magnitude;
    if (residual <= 2) return 2 * magnitude;
    if (residual <= 5) return 5 * magnitude;
    return 10 * magnitude;
}

function formatValue(value) {
    if (value === 0) return '0';
    if (Math.abs(value) >= 1000 || Math.abs(value) < 0.01) {
        return value.toExponential(2).replace('+', '');
    }
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2);
}
```

I also cleaned up the modal text so it no longer describes the old normalized `|A(k)|^2` percentages. `ReadLints` reports no linter errors for the edited file. I didn’t run a browser session, so the remaining check would just be a quick visual confirmation that the curve now matches the note for a few `k0, σ` values.

---

**User**

In which line is the equation?

---

**Cursor**

The lecture-note equation is on line `888` of `Sims-QM-lectures/QM_intro.tex`.

If you also mean the same equation in the HTML simulation, it appears in `Sims-QM-lectures/L06_A(k)-vs-k-plot.html` on line `356` as the `latexFormula` string, and the plotting function implementing it starts on line `428`.

---

**User**

update the revision logs with a sentence @Sims-QM-lectures/revision-logs/L06_A(k)-vs-k-plot.md 

---

**Cursor**

Update complete. Added this line to `Sims-QM-lectures/revision-logs/L06_A(k)-vs-k-plot.md`:

**EC 04/02/26:** The plotted and KaTeX-displayed A(k) were aligned with the lecture notes (Gaussian in exp with (k−k₀)²/(2σ²) plus the k₀²/(2σ²) term), the y-axis was made dynamic with readable tick formatting for large amplitudes, and the about text was adjusted so it no longer described the old normalized |A(k)|² probability picture.

