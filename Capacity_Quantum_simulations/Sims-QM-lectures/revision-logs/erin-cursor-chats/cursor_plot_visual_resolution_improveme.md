# Plot visual resolution improvement
_Exported on 4/13/2026 at 22:21:56 EDT from Cursor (2.6.21)_

---

**User**

The rendering of the plots here looks blurry / low quality. Update this -- do not change the physics. Just the visual resolution. 

---

**Cursor**

I’m looking at the focused lecture file and the plot rendering setup so I can identify what controls visual resolution without touching the simulation math.

I found native `<canvas>` rendering with canvas width/height tied directly to CSS pixel size, which is a common cause of blur on Retina/high-DPI displays. I’m reading the resize and draw code next to confirm the safest resolution-only fix.

The blur source is confirmed: both canvases are bitmap-based and are allocated at only CSS-size resolution, so they’re being upscaled on high-DPI screens. I’m checking whether the ring view has any special transforms so the plan can cover both plots cleanly.

I have enough context to propose a targeted fix: make the canvases high-DPI aware so the plots render sharply on Retina/zoomed displays while keeping the existing drawing logic and physics intact.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

I’m implementing the high-DPI canvas sizing now, starting with the resize path and keeping all existing plot math untouched.

I’ve confirmed the safest approach is to size the bitmap at device-pixel resolution and keep drawing coordinates in CSS pixels, which avoids touching the existing plot formulas.

The canvas resize helper is in place; next I’m verifying the drawing code still uses CSS-space dimensions and checking for any diagnostics.

I’ve got the resize and transform parts clean; I’m doing a final pass on the draw paths and resize hooks so both the flat and ring views stay correct after maximize and window resize.

The render path is consistent now: resize/maximize still funnel through `resizeCanvases()`, and all three draw routines use CSS-space dimensions after the DPI transform. I’m doing one last diff check and then I’ll wrap up with what changed and how I verified it.

Updated `Sims-QM-lectures/L05_particle-on-a-circle.html` so both canvases render at device-pixel resolution instead of CSS-pixel resolution. The change adds a small high-DPI canvas setup helper, preserves the displayed CSS size, and resets each canvas transform so the existing drawing code still works in CSS-pixel coordinates.

I also switched the energy plot, flat wavefunction plot, and ring view to use `clientWidth`/`clientHeight` for layout-space drawing, which keeps maximize/restore and window resize behavior aligned with the sharper backing buffers. No physics, sampling formulas, animation logic, or plotted quantities were changed.

Verification: `ReadLints` reports no errors for the file, and the resize/maximize hooks still route through `resizeCanvases()`. I did not run a browser preview here, so the remaining check is a visual confirm that the plots now look crisp on your display.

---

**User**

change the phi in the "plot" axes to an x

---

**Cursor**

I’m updating the flat plot axis label from `φ` to `x` and checking that it only affects the displayed axis text.

I found two visible plot-axis labels tied to `φ`: the x-axis label itself and the y-axis title `ψ(φ)`. I’m changing both to `x`-based notation while leaving the underlying angular coordinate math alone.

Updated the flat plot axis labels in `Sims-QM-lectures/L05_particle-on-a-circle.html` so the x-axis now shows `x` and the y-axis label shows `ψ(x)` instead of `φ`-based notation. The underlying plotting/math was not changed.

Verification: no linter errors were reported for the file.

---

**User**

Increase the text size for all three plots. Don't update the legends

---

**Cursor**

I’m locating the canvas text styling in each plot so I can increase axis/tick/title sizes while leaving legend-like annotations unchanged.

I found the plot text settings. I’m increasing the energy-plot labels, flat-plot axis/tick labels, and ring axis labels, while leaving the annotation-style legend text unchanged.

The font-size pass is in; I’m checking diagnostics now to make sure the file is still clean.

Increased text size across the three plot renderings in `Sims-QM-lectures/L05_particle-on-a-circle.html` by enlarging the canvas-drawn labels for:

- energy-level labels and energy axis text
- flat plot tick/axis labels and y-scale markers
- ring-view axis labels

I left the legend/annotation text unchanged, including the probability label and `R = 1`. `ReadLints` reports no errors.

---

**User**

un-bold the x axis numbers

---

**Cursor**

I’m adjusting just the flat plot x-axis tick numbers so they use a normal weight, without changing the axis titles or any plot data.

The tick labels and axis title currently share one bold font setting, so I’m splitting them so only the x-axis numbers become regular weight.

Updated the flat plot so the x-axis tick numbers are no longer bold, while the `x` axis title stays bold. No linter errors were introduced.

---

**User**

update the logs @Sims-QM-lectures/revision-logs/L05_particle-on-a-circle.md 

---

**Cursor**

I’m updating the lecture revision log to reflect the recent plot-sharpness and label/text tweaks in `L05_particle-on-a-circle.html`.

I’ve got the exact set of recent changes from the lecture diff, and I’m adding a concise dated entry to the existing revision log now.

Updated `Sims-QM-lectures/revision-logs/L05_particle-on-a-circle.md` with a new `EC 04/09/26` entry covering:

- high-DPI canvas sharpening
- the displayed axis notation change from `φ` to `x`
- larger non-legend plot text for readability

---

**User**

@Sims-QM-lectures/L06_A(k)-vs-k-plot.html hide the "show sigma shading" option

---

**Cursor**

I’m finding the `show sigma shading` control and how it’s wired so I can hide just that option without affecting the plot behavior.

I found the control panel structure; next I’m reading the toggle markup and related JS so I can hide only that UI row cleanly.

The shading toggle is default-on in JS, so I’m hiding only its control row and leaving the shading behavior itself unchanged.

Hidden the `Show ±σ / ±2σ Shading` option in `Sims-QM-lectures/L06_A(k)-vs-k-plot.html` by hiding its control row while leaving the shading enabled by default. No linter errors were reported.

---

**User**

make it unselected also 

---

**Cursor**

I’m turning the hidden shading option off by default as well, so it starts unselected and the shading is not shown.

The hidden control is still checked and the JS default is still `true`, so I’m flipping both to `off` so the hidden option and the initial rendering stay aligned.

Updated `Sims-QM-lectures/L06_A(k)-vs-k-plot.html` so the hidden `Show ±σ / ±2σ Shading` checkbox is also unselected by default, and the shading now starts off. No linter errors were introduced.

---

**User**

update the logs @Sims-QM-lectures/revision-logs/L06_A(k)-vs-k-plot.md . The sigma shading was removed because the lecturer defines sigma differently

---

**Cursor**

I’m updating the L06 revision log with the sigma-shading removal and the reason you gave, so the lecture-specific change is documented clearly.

I’ve confirmed the change set: the sigma-shading control is hidden and the shading now starts disabled. I’m adding that rationale to the revision log now.

Updated `Sims-QM-lectures/revision-logs/L06_A(k)-vs-k-plot.md` with a new `EC 04/09/26` entry noting that the `±σ` / `±2σ` shading was removed from the lecture-facing version and disabled by default because the lecturer defines `σ` differently.

