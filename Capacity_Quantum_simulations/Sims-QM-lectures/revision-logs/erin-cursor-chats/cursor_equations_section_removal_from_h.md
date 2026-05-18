# Equations section removal from HTML
_Exported on 4/2/2026 at 19:01:43 EDT from Cursor (2.6.21)_

---

**User**

remove the "equations" section @Sims-QM-lectures/L02_Single_Gaussian_plot.html 

---

**Cursor**

Removing the Equations panel, its JavaScript (`rhsEqPsi1`, `renderMath`, `renderRhsEquations`), the `update()` call, and the CSS used only by that section.



Here’s what changed:

1. **HTML** — Removed the whole **Equations** `<section>` (title, note, and KaTeX card for ψ₁).

2. **Script** — Dropped `rhsEqPsi1`, `renderMath`, `renderRhsEquations`, and the `renderRhsEquations()` call inside `update()`.

3. **CSS** — Removed styles only used by that block: `.model-note`, `.eq-stack`, `.eq-card`, `.eq-label`, `.eq-body`, and the matching `body.theme-bright` rules.

The **About** popup still shows the same Gaussian formula via `renderAboutLatex()` on `aboutEq1`.

---

**User**

remove the explicit "+" sign from displaying for positive values

---

**Cursor**

Update applied: **X₁ (center)** no longer uses a leading `+` for nonnegative positions. It now always uses `X1.toFixed(2)` (e.g. `2.00` instead of `+2.00`). That was the only place in this file that added a `+` for positive numeric readouts.

