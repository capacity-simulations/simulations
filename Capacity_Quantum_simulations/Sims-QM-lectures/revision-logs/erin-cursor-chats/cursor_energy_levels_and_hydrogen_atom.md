# Energy levels and hydrogen atom model resolution
_Exported on 4/13/2026 at 22:21:31 EDT from Cursor (2.6.21)_

---

**User**

The "energy levels" plot and the "hydrogen atom" model seem to be rendered a little blurry/fuzzy. Can you check the resolution for these pieces

---

**Cursor**

I’m checking the current `L22_Hydrogen_atom_energy_spectrum.html` file to see how the energy-level plot and the hydrogen-atom view are sized and whether their renderers are using device pixel ratio correctly.

I found that both visuals are drawn into a single HTML5 canvas, so the blur is likely tied to how that canvas is sized rather than to two separate widgets. I’m reading the resize and drawing code now.

Both the “energy levels” plot and the “hydrogen atom” model are being drawn into the same `<canvas>`, not separate images, so they share the same render resolution.

The key issue is that the canvas backing resolution is currently set to the container’s CSS size only:

```758:760:Sims-QM-lectures/L22_Hydrogen_atom_energy_spectrum.html
function resize() {
    W = canvas.width = container.clientWidth;
    H = canvas.height = container.clientHeight;
```

and the canvas is displayed at full CSS size:

```68:71:Sims-QM-lectures/L22_Hydrogen_atom_energy_spectrum.html
#mainCanvas {
    display: block;
    width: 100%;
    height: 100%;
}
```

That means the app is rendering at `1x` CSS-pixel resolution. On a Retina/HiDPI display, that usually looks a bit soft because the browser has to upscale the canvas to the device’s physical pixels. So:

- On a standard `devicePixelRatio = 1` display, the resolution is nominally fine.
- On a `devicePixelRatio = 2` display, the canvas is effectively under-resolved by `2x` in each dimension.
- The blur would affect both the energy-level diagram and the atom model equally, since both are drawn on the same canvas.

A secondary contributor is that many lines/text are drawn at fractional coordinates and thin widths, which can add a little antialias softness, but the main problem is the missing HiDPI scaling.

If you want, I can patch this file so the canvas renders at `window.devicePixelRatio` and should look noticeably sharper.

---

**User**

yes, patch the file

---

**Cursor**

I’m patching `L22_Hydrogen_atom_energy_spectrum.html` to use HiDPI canvas scaling so the energy diagram and atom rendering match the screen’s device pixel ratio.

I have the exact resize block now. I’m updating it to separate CSS size from backing-store size and to scale the drawing context once per resize, which is the standard fix for canvas fuzziness on Retina displays.

The HiDPI fix is in. I’m doing a quick lint check on the edited file to make sure the change didn’t introduce any diagnostics.

`L22_Hydrogen_atom_energy_spectrum.html` is patched so the canvas now renders at the display’s device pixel ratio instead of only at CSS resolution. That should make both the energy-level plot and the hydrogen atom view noticeably sharper on Retina/HiDPI screens.

No linter issues were introduced. If you want, I can also do a second pass for subpixel crispness on thin lines and text, but the main blur source is fixed now.

---

**User**

make the lines connecting the n levels and the energy lines brighter. 

---

**Cursor**

I’m updating the connector lines between the `n` labels and their energy levels so they stand out more against the dark background without changing the rest of the diagram styling.

I found the connector stroke block. I’m increasing both its opacity and thickness, and making the active-state connector brighter than the passive ones.

The brightness tweak is in. I’m checking the file for any diagnostics from the edit.

The connector lines are brighter now in `L22_Hydrogen_atom_energy_spectrum.html`. I increased both their opacity and line width, and the currently active transition levels get an even brighter connector.

No linter issues showed up. If you want, I can also brighten the horizontal energy level lines themselves to match.

---

**User**

you only did two of the lines

---

**Cursor**

You’re right. I only brightened the slanted connector strokes that appear when a label is displaced; I didn’t change the full set of level-to-label connector lines consistently. I’m fixing that now in the energy-level drawing block.

I found the issue: those connector strokes were only drawn when a label had been moved away from its level. I’m changing it so every `n` label gets a visible connector, not just the displaced ones.

That conditional is gone now, so all level labels should show connectors. I’m running a quick lint check on the file.

You were right: the code was only drawing those connector lines for labels that had been shifted, which is why only a couple changed.

I updated `L22_Hydrogen_atom_energy_spectrum.html` so every `n` label now gets a brighter connector to its energy level, and active levels still get the stronger highlight. No linter errors showed up.

---

**User**

the n=7 looks like it connects a tiny bit below the energy line. Is this happening, or a visual trick?

---

**Cursor**

I’m checking the exact `n=7` positioning logic in the energy-level layout, because the top levels are intentionally nudged to avoid label overlap and that can make the connector look slightly offset.

It’s mostly a visual trick, not a true mismatch at the energy-line end.

The connector is drawn starting at exactly the same `y` as the energy level:

```1029:1044:Sims-QM-lectures/L22_Hydrogen_atom_energy_spectrum.html
ctx.strokeStyle = isActive
    ? 'rgba(147, 197, 253, 1)'
    : `rgba(147, 197, 253, ${alpha})`;
ctx.lineWidth = isActive ? 2.7 : 1.9;
ctx.beginPath();
ctx.moveTo(lineLeft, y);
ctx.lineTo(lineRight, y);
ctx.stroke();

ctx.strokeStyle = isActive
    ? 'rgba(226, 232, 240, 0.9)'
    : 'rgba(203, 213, 225, 0.72)';
ctx.lineWidth = isActive ? 1.2 : 0.95;
ctx.beginPath();
ctx.moveTo(lineLeft - 4, y);
ctx.lineTo(lineLeft - 16, labelY);
```

So the connector begins on the exact same `y` coordinate as the horizontal level line. What can make `n=7` look slightly low is:

- `n=7` is in the crowded upper cluster, and those label positions are deliberately adjusted to avoid overlap.
- The connector is diagonal, thin, and anti-aliased on canvas, so at small sizes it can look like it starts a fraction below the horizontal line.
- Because the connector starts a few pixels left of the main line, your eye may compare different antialiased edges rather than the actual shared coordinate.

So: yes, `n=7` may be visually misleading, but no, the code is not intentionally attaching it below the energy line. If you want, I can make that visually cleaner by changing the connector to a short horizontal stub plus angled segment, or by snapping these strokes to half-pixel positions for crisper joins.

---

**User**

update logs

---

**Cursor**

I’m looking for the project’s update log or changelog file so I can record the canvas sharpness and energy-level connector changes in the right place.

I found the revision-log area. Next I’m locating the hydrogen-spectrum-specific log entry format so I can append this change in the same style rather than invent a new one.

I found the lecture-specific revision log. I’m reading the latest section at the end so I can append this session in the same format.

I’ve got the log format. I’m appending a new dated entry for today covering the HiDPI canvas fix and the energy-level connector-line adjustment.

The revision log entry is in place. I’m doing a quick lint/diagnostic check on the edited markdown file, though I don’t expect issues there.

I updated `Sims-QM-lectures/revision-logs/L22_Hydrogen_atom_energy_spectrum.md` with a new `04/09/26` entry covering the HiDPI canvas sharpening and the brighter `n`-level connector lines.

No diagnostics showed up.

