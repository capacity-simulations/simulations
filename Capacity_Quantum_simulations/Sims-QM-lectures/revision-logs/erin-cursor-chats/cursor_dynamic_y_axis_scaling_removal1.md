# Dynamic y-axis scaling removal
_Exported on 4/2/2026 at 18:59:20 EDT from Cursor (2.6.21)_

---

**User**

Remove the dynamic y-axis scaling @Sims-v2/gaussian-distribution.html 

---

**Cursor**

The `getDynamicMaxY()` function currently scales the y-axis to accommodate both the theoretical peak and the empirical histogram data as it grows. I'll change it to use only the theoretical peak so the y-axis stays fixed for a given σ value.

Done. The y-axis now scales only to the theoretical peak of the Gaussian curve (with 15% headroom), rather than dynamically adjusting as histogram bars accumulate. The axis will still adapt when you change σ via the slider, but it won't shift around as samples come in.

---

**User**

Now, check that the histogram is displaying correctly, and is normalized properly to be a probability density. 

---

**Cursor**

Let me read the current histogram drawing code carefully.

Now let me also review the sampling and bin logic.

I've reviewed the histogram code carefully. There are two issues with the normalization:

1. **`totalSamples` includes out-of-range samples** (line 1151 increments for every sample, but only in-range ones go into bins). This makes the raw density too low. The renormalization step at the end masks this, but it's the wrong foundation.

2. **The 3-point smoothing + forced renormalization** artificially reshapes the density. The smoothing flattens the peak (it averages over 1.5 x-units, which is significant relative to the curve width), and the renormalization forces the integral to 1 rather than letting the data converge naturally.

The fix is to track in-range samples properly and compute the raw probability density directly — no smoothing or renormalization needed.

Now replace the histogram drawing to use `samplesInRange` and remove the smoothing/renormalization:

Let me verify the final state of the key functions looks correct.

Everything looks good. Here's a summary of the changes:

- **Added `samplesInRange` counter** — tracks only the samples that land within `[xMin, xMax]`, which is the correct denominator for computing probability density over the visible bins.
- **Simplified density calculation** to `(histogram[i] / samplesInRange) / binXWidth` — this is the standard probability density estimator: (relative frequency) / (bin width).
- **Removed the 3-point smoothing** — it was artificially flattening the peak by averaging over 1.5 x-units, distorting the true empirical distribution.
- **Removed the forced renormalization** — no longer needed since the raw density with the correct denominator naturally integrates to ~1 over the visible range.

The histogram now shows the true empirical probability density and will converge cleanly to the theoretical Gaussian curve as samples accumulate.

