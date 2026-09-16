# Review — L14-s1-momentum-vs-velocity-shell.html
**Verdict:** PASS (0 P0, 0 P1)
**Syllabus match:** Yes, tightly — a plot of relativistic momentum p = γm₀v (y) vs velocity v (x) with a rest-mass slider, exactly as the Sim description requires. The three inquiry questions (behaviour near v=0, near v=c, effect of doubling m₀) are the three gated prediction steps, correctly answered (nearly-the-same / diverges / every-point-doubles). Rest-mass invariance and four-momentum are served (Step 5 + Formal eq5), and the lecture's "relativistic mass" misconception is explicitly avoided — Step 5 frames γ as the runaway factor multiplying m₀v, not a "mass."

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, both sliders fire, 6 steps advance, all three gated predicts unlock via `.choice`, full top bar). Physics verified: γ(0.6)=1.25 → p=0.750 m₀c; ratio at v=0.9c = γ=2.29×; v→c ⇒ p→∞ (honest "p → ∞" arrow); all six Formal equations canonical.

### P1
- _None._

### P2
- **[align] "Inertial mass" is only implicitly served.** The row lists element **"Inertial Mass"** (L532) and outcome **"Understand the concept of inertial mass"** (L529). The sim addresses it only indirectly — the p→∞ divergence and the Step-2 feedback ("no finite force can accelerate a massive particle to c") gesture at growing inertia, but "inertial mass" is never named. The binding Sim description (L534) asks only for the p-vs-v plot with a rest-mass slider, which is fully delivered. → **Fix (confirm intent):** verify inertial mass is covered in the lecture, or add a one-line note tying the momentum divergence to diverging inertia (why c is unreachable). Text only.
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[ux] The unit label "units of m₀c" reuses the m₀ slider symbol.** The y-axis and hover read-off label p in "m₀c", but m₀ is also the live slider (0.5–5); since the plot is absolute (doubling m₀ doubles p), the unit's "m₀" must mean a *fixed* reference mass (=1). "1.15 m₀c" at m₀=2 can read ambiguously. → **Fix:** label the unit as a fixed reference (e.g., note m₀=1 defines the unit) or use a neutral "p (arb. units)". Cosmetic.
- **[ux] Play/Pause is inert (static diagram).** `onFrame` is a no-op by design — the sim is a static plot explored via sliders/hover. The Play button still toggles its label but changes nothing. Honest for a static sim, but a student may expect motion. → **Fix (optional):** none needed; optionally hide/disable Play for this static sim if the shell allows.

## Suggested fixes for Cursor (paste-ready)
1. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
2. **(Alignment — confirm intent.)** If "inertial mass" should be served here, add one short line (side panel or Formal note) connecting the p = γm₀v divergence to diverging inertia — i.e., why ever more momentum is needed for the same Δv near c, so c is unreachable. Text only; do not change the plot or physics.
3. *(Optional, clarity)* In the y-axis title and the hover/marker read-off, disambiguate the "m₀c" unit so it clearly denotes a fixed reference mass (m₀=1), not the current slider value — e.g., add "(m₀=1 sets the unit)" to the Formal intro, or relabel as "p (arb. units)". Label-only; no physics change.

## Physics to verify (human)
- **"Inertial mass" scope [align].** Confirm whether the inertial-mass element/outcome is meant to be developed in this sim or the lecture; the sim currently only implies it via the momentum divergence.
- No physics-correctness concerns: p=γm₀v, the classical comparison, the four-momentum (eq5), the γ→∞ divergence, and E²=(pc)²+(m₀c²)² all match canonical forms, and the sim correctly avoids the "relativistic mass" framing that the lecture checkpoint targets (see `L14-s1-...-physics.md`).
