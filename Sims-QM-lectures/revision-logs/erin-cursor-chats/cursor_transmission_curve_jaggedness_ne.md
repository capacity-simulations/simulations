# Transmission curve jaggedness near E=U line
_Exported on 4/13/2026 at 22:21:46 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/revision-logs/L09_Transmission_probability_plot.md when on t vs k, and for max slider values, the transmission curve seems to0 jagged (like there are not enough x-points) near the E=U line

---

**Cursor**

I’m looking into the `t vs k` rendering near `E = U`, focusing on how the transmission data is sampled at high slider values so I can fix the jagged curve rather than just mask it.

I found the likely area: the issue is probably in the plot sampling for the `t vs k` curve itself, not the barrier sketch. I’m narrowing in on the functions that build the curve and any adaptive-point logic near the threshold.

I’ve narrowed it to either a real under-sampling issue or a threshold-specific numeric transition. I’m doing a quick numerical check around `E = U` at the extreme slider settings so I can choose the right fix.

I’ve confirmed the curve itself becomes extremely sharp just above threshold at the largest `a`, `U`, and `m` values, so this really is a sampling problem. I’m patching the plot builder to add threshold-focused samples rather than just globally increasing point count.

The targeted sampling change is in place. I’m doing a quick sanity check for syntax/lint issues and rereading the patched section to make sure the new helper logic is coherent.

The patch is syntactically clean. I’m doing one last repo-level check of the touched files so I can report back precisely what changed.

Adjusted the `T vs k` curve sampling in `Sims-QM-lectures/L09_Transmission_probability_plot.html` so the region around `E = U` gets extra threshold-focused samples instead of relying only on the global uniform point count. The sharp structure there is real at max `a`, `U`, and `m`, and the old sampling was too coarse to draw it smoothly.

I also logged the change in `Sims-QM-lectures/revision-logs/L09_Transmission_probability_plot.md`.

Verification: `ReadLints` reports no errors for the edited HTML. I didn’t run a live browser check here, so the natural next step is to reload the page and look again at `T vs k` with the sliders maxed out.

---

**User**

It still looks jagged -- can you up the minimum resolution?

---

**Cursor**

I’m increasing the floor on the curve sampling directly so the plot stays smooth even before the adaptive threshold logic kicks in. After that I’ll do a quick lint check.

I’ve confirmed the current floors are still pretty conservative. I’m bumping both the whole-curve minimum and the threshold-focus minimum so the canvas gets many more x-samples by default.

The sampling floor is raised. I’m checking for any lint/syntax fallout and then you should be able to refresh and compare immediately.

Raised the minimum sampling resolution in `Sims-QM-lectures/L09_Transmission_probability_plot.html`.

The whole-curve floor went from `800` to `3000` samples, and the threshold-focused floor near `E = U` went from `1200` to `5000`, with more aggressive width-based scaling too. `ReadLints` is still clean.

Refresh the page and check the same max-slider case again. If it still looks rough after that, the next step would be switching from straight polyline rendering to a small offscreen supersample/downsample pass, but I’d try this higher floor first.

---

**User**

increase it even more -- especially in the region near E=U

---

**Cursor**

I’m pushing the threshold sampling harder rather than just inflating the whole curve uniformly, so the extra resolution lands mostly where the sharp structure is: right around `E = U`.

I found a good place to concentrate more points: an extra ultra-dense pass over the first threshold neighborhood, using the same `q = sqrt(2m|E-U|)` parameterization that naturally clusters points near `E = U`.

The denser threshold pass is in. I’m just checking that the edited HTML is still clean and that the new counts landed where intended.

Increased it substantially, with most of the extra density now concentrated near `E = U`.

In `Sims-QM-lectures/L09_Transmission_probability_plot.html` I raised:
- the global minimum from `3000` to `5000`
- the main threshold-focused pass from `5000` to `9000`
- and added a second ultra-dense threshold pass at `18000+` samples over the immediate neighborhood of `E = U`

`ReadLints` is still clean. Reload the plot and check the same extreme case again; if it still isn’t visually smooth enough after this, the remaining limitation is likely the canvas line rendering itself rather than the x-sample count.

