# Review — L11-s2-light-clock-and-geometric-derivation-of--shell.html
**Verdict:** PASS (0 P0, 0 P1)
**Syllabus match:** Yes, stage-for-stage — a central panel shows the rest clock (t₀=2h/c), which fades to grey and is held while the moving clock builds up: the diagonal light path is traced one leg at a time, the triangle is completed and its three sides labelled (h, vt/2, ct/2), and the Pythagoras overlay resolves to t=γt₀. That is precisely the Sim description for this "lecture visual aid," and the additional-notes intent ("step-by-step triangle construction, greyed rest view kept for comparison") is honoured.

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, slider fires, 6 steps advance, gate unlocks via `.choice`, full top bar). Physics verified exact: the drawn triangle satisfies (ct/2)²=h²+(vt/2)² for every v (hypotenuse=γh, base=βγh), both light pulses move at the **same** pixel-speed c, and all formal equations are canonical.

### P1
- _None._

### P2
- **[align] Scope vs the lecture's broader element list.** The row lists elements **"Length Contractions"** (L455) and **"Spacetime distance"** (L457) and outcomes "Compute spacetime intervals" / "Distinguish invariant spacetime distance" / "Derive … from Lorentz transformations" (L451, L453-454). This sim covers **only time dilation via the geometric light-clock/Pythagoras route** — exactly what its Sim description asks for. Length contraction, spacetime intervals, and the algebraic Lorentz-transform derivation aren't here (presumably L11-s1 / lecture). → **Fix (confirm intent):** verify those elements/outcomes are served by L11-s1 or the lecture; no change needed to this sim, whose mandate is the geometric time-dilation derivation.
- **[pedagogy] Reciprocity of time dilation shown only in text.** The lecture's central misconception (each frame sees the *other's* clock slow; no privileged frame) is correctly addressed in the "Reveal rebuttal" prose and the frame-invariant γ tag, but not demonstrated visually (which would need two light clocks). Acceptable for a lecture aid. → **Fix (optional):** if reciprocity is a priority, consider a toggle showing the reciprocal case; otherwise leave as-is.
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.

## Suggested fixes for Cursor (paste-ready)
1. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
2. *(Optional, pedagogy)* If reciprocity should be shown rather than only stated, add a toggle that renders the reciprocal case (the other frame seeing this clock run slow) so students see the symmetry directly. New visual — preserve the existing geometric derivation; do not alter the t=γt₀ physics.

## Physics to verify (human)
- **Scope [align].** Confirm length contraction, spacetime intervals, and the Lorentz-transform derivation are covered by L11-s1 / the lecture; this sim is intentionally just the geometric time-dilation aid.
- No physics-correctness concerns: γ, the Pythagoras triangle (ct/2)²=h²+(vt/2)², and t=γt₀ are exact and the numerics verified for all v; both light pulses travel at c (time dilation emerges from path length, not a changed speed); proper time and reciprocity are correctly framed (see `L11-s2-...-physics.md`). No interval Δs² is labelled, so the sim is unaffected by the course-wide sign-convention question.
