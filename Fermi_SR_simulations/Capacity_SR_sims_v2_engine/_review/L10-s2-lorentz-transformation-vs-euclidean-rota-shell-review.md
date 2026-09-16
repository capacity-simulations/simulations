# Review — L10-s2-lorentz-transformation-vs-euclidean-rota-shell.html
**Verdict:** PASS (0 P0, 1 P1 — a candidate convention flag)
**Syllabus match:** Yes, and it exceeds the description — two side-by-side panels (Euclidean rotation left, Lorentz boost right), each with labelled events and a second coordinate system whose axes tilt with a slider (θ left, β right); the unit circle x²+y²=1 is drawn and preserved on the left, the hyperbola (ct)²−x²=1 on the right (plus the spacelike x²−(ct)²=1, a calibration grid, unit-tick placement, and a probe point riding the invariant curve). This is a model rendering of "boost = hyperbolic rotation."

## Findings

### P0
- _None._ Smoke test clean (no errors, both canvases render, both sliders fire, 5 steps advance, gate unlocks via `.choice`, full top bar). Physics verified exact: (ct)²−x²=1 preserved under all boosts, scissor angle 90°−2·atan(β)→0° as β→1, rotation preserves x²+y² at a fixed 90°, all formal equations canonical.

### P1
- **[physics/consistency] The declared metric signature contradicts the course convention and this sim's own checkpoint (candidate).** The formal panel states **"Signature (+, −): ds² = (c dt)² − dx²"** (line 584) and the invariant readout shows (ct)²−x². But the course convention — stated verbatim in the syllabus for L5, L8, **L10-s1** (this lecture's sibling), L17, and in **this sim's own checkpoint** (syllabus line 417: `Δs² = −c²Δt² + Δx²`) — is spacelike-positive, the opposite overall sign. So within lecture 10.0, the sim uses (+,−) while its checkpoint and sibling use (−,+). *Not a physics error* (the sim is internally consistent and faithfully draws the (ct)²−x²=1 hyperbola its Sim description specifies; (ct)²−x² is the natural positive invariant for the circle↔hyperbola analogy) — but it clashes with the checkpoint a student sees in the same lecture. → **Fix (candidate — confirm the course-wide convention first):** keep the (ct)²−x² visual and readout (don't sacrifice the analogy), but add one bridging line to the formal note, e.g.: *"In this course's convention Δs² = −c²Δt² + Δx² = −[(ct)²−x²]; the boost preserves it either way."* Text-only; no change to the geometry or transforms.

### P2
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.

## Suggested fixes for Cursor (paste-ready)
1. **(Convention — confirm the course-wide decision first.)** In `shell-versions/L10-s2-lorentz-transformation-vs-euclidean-rota-shell.html`, in the formal-panel note under "How the axes differ & the invariant interval," add a bridging sentence reconciling the sim's `(ct)²−x²` invariant with the course's spacelike-positive interval: *"In this course's convention Δs² = −c²Δt² + Δx² = −[(ct)²−x²]; the boost preserves it either way."* Do not change the drawn hyperbolas, the invariant readouts, or the transforms — this only reconciles the sign notation with the L10 checkpoint and L10-s1.
2. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.

## Physics to verify (human)
- **Metric signature [high — course-wide decision].** This sim declares (+,−) `ds²=(ct)²−x²`, which matches `_review/PHYSICS-RUBRIC.md` but **contradicts the syllabus** (L5/L8/L10-s1/L17 and this sim's own checkpoint all use the spacelike-positive `Δs²=−c²Δt²+Δx²`). Decide the single course-wide convention. Recommended: keep this sim's (ct)²−x² *visual* (cleaner for the analogy) and reconcile via a note, rather than flipping the drawing. Also correct the PHYSICS-RUBRIC line, which currently endorses the minority (timelike-positive) convention.
- No physics-correctness concerns otherwise: the boost, rotation, both invariant hyperbolas, rapidity/hyperbolic-rotation matrices, and the scissor angle 90°−2arctanβ are all correct and numerically exact (see `L10-s2-...-physics.md`).
