# Double-slit experiment line display
_Exported on 4/2/2026 at 19:01:36 EDT from Cursor (2.6.21)_

---

**User**

@L04_double-slit-experiment.html (457-460) Make each line only show in the relevant mode

---

**Cursor**

Exploring how modes are implemented in the double-slit experiment HTML so we can show each explanatory line only in the relevant mode.



Wrapping the tooltip lines in elements and toggling their visibility in the classical-mode button handler alongside the legend updates.



Wrapping the two mode-specific lines in spans and toggling them in the classical button handler. Using block-level spans so spacing stays valid inside the `<p>`.



Using the same variable names in the `else` block (separate block scope) for consistency.



Here’s what changed:

**Markup**  
The quantum and classical blurbs are each wrapped in a block `<span>` (`info-tooltip-quantum-line` / `info-tooltip-classical-line`). By default the quantum one is shown and the classical one is hidden (`display: none`), matching the default simulation mode.

**Script**  
When you toggle “Show Classical Pattern” / “Hide Classical Pattern”, the same handler that updates the chart legends now switches those spans: classical mode shows only the orange/classical line; quantum mode shows only the green/quantum line.

The shared intro and the Feynman “key difference” sentence stay visible in both modes so the tooltip still reads coherently when you compare the two ideas.

---

**User**

@L04_double-slit-experiment.html (515-517) Oops - I meant this part

---

**Cursor**

Wrapping the chart description lines and toggling them when the classical mode button fires (same pattern as the legends).



Here’s what changed:

**`chart-description`**  
- The quantum sentence is in `#chart-desc-quantum-line` (visible by default).  
- The classical sentence is in `#chart-desc-classical-line` with `display: none` initially.

**Classical toggle**  
- Entering classical mode: hide the quantum span, show the classical span (`display: ''`).  
- Returning to quantum mode: show the quantum span, hide the classical span again.

So the sidebar text under the chart tracks the same mode as the orange/green legends. The “About” tooltip is unchanged.

