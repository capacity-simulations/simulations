# Review — L16-s1-energy-momentum-conservation-in-a-collis-shell.html
**Verdict:** PASS (0 P0, 1 P1)
**Syllabus match:** Yes — two particles (m₁,m₂,v₁,v₂) collide; the four-momentum of each is shown before and after under total four-momentum conservation; all three modes (elastic, inelastic-merge, decay) are present; a readout shows total E and total p before/after in the current frame; a boost slider transforms to S′; and a rest-energy / mass-budget panel shows E₀ and ΔM. The inquiry ("two identical particles at β=0.8 merge — is M 2m, more, or less?") is the gated Step 1 predict, correctly answered by B (M>2m). This matches the row's Sim description and Inquiry question line-for-line.

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, all 6 sliders fire, 6 steps advance, gate unlocks via `.choice`, full top bar). Physics verified with exact numeric spot-checks across all three modes and the boost (M=3.333 m₀ for the merge; decay products at v=0.80; elastic velocity-exchange with rest mass preserved; invariant mass fixed under boost). Four-momentum conservation is the central trap and it is handled correctly (invariant mass, not summed rest mass).

### P1
- **[ux] The boost-frame velocity is displayed as "v₂", colliding with particle 2's velocity.** `frameName()` (L868) renders the frame header and four-momentum table label as `Frame S′ (v₂ = …)` using a subscript-2, but the boost slider is labelled `v_b` (L575) and the sim's own design note (L439) says the frame should read "(v_b = …)". Because **v₂ is a defined input in this sim** (particle 2's velocity), showing "v₂ = +0.50 c" as the *boost* value is genuinely misleading — a student may think particle 2's velocity changed. The Lorentz transform itself is correct; only the label is wrong. → **Fix:** in `frameName`, replace the subscript-2 in the `Frame S′ (v₂ = …)` string with a "b" subscript so it reads `v_b`, matching the slider and the ∑ Formal boost equation. Label-only; no physics/visual change.

### P2
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[align] Per-particle E₀=mc² is implicit rather than an explicit callout.** The Sim description asks the rest-energy panel to "highlight E₀ = mc² for each particle in its rest frame." The "Rest energy & mass budget" panel shows Σ rest mass, ΣK, ΔM/Q (mass–energy equivalence), and a student can read each particle's E₀ by boosting to its rest frame (E→m). The concept is served, but there's no explicit per-particle "E₀ = m₁c²" line. → **Fix (optional):** add a small per-particle E₀ = m·c² row to the rest-energy panel, or confirm the current mass-budget framing satisfies the intent. Text only.

## Suggested fixes for Cursor (paste-ready)
1. In `shell-versions/L16-s1-energy-momentum-conservation-in-a-collis-shell.html`, in the `frameName(vb)` function (~L868), change the boosted-frame string `'Frame S′  (v₂ = '+fmtV(vb)+')'` so the subscript on `v` is a "b" (i.e. `v_b`), not a subscript-2 — matching the boost slider label (`v_b`, ~L575) and the ∑ Formal boost equation. Do not change `fmtV` or the transform; this is a display-label fix only.
2. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
3. *(Optional, alignment)* In the "Rest energy & mass budget" panel builder (`buildRestEnergy`, ~L997), add a short per-particle line showing `E₀ = m·c²` for each particle (numerically = its m in these units), to make the "E₀ = mc² for each particle" requirement explicit. Text/readout only — no change to the collision physics.

## Physics to verify (human)
- No physics-correctness concerns to flag — all three modes (elastic CM-reversal, inelastic invariant-mass merge, two-body decay energies), the four-momentum Lorentz boost, and the invariant-mass panel match canonical forms and the numeric spot-checks were exact (see `L16-s1-...-physics.md`). Conservation is correctly built on four-momentum (not classical p), and forbidden decays are honestly flagged rather than shown as "conserved."
- Sanity-confirm the labelling fix: after changing `frameName` to `v_b`, the boost readout should no longer share a glyph with the particle-2 velocity slider `v₂`.
