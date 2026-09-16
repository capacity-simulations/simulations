# Review — L17-s1-photon-worldline-shell.html
**Verdict:** PASS (0 P0, 1 P1)
**Syllabus match:** Yes — Minkowski diagram (ct vertical, x horizontal), photon drawn as a 45° null worldline E₁→E₂ with Δs²=−c²Δt²+Δx² and Δτ displayed, plus a massive worldline E₁→E₂′ with a β slider that continuously updates the slope. Both inquiry steps ("predict Δs² and Δτ"; "push β→0.99, what happens as β→1?") are present as gated predicts, and the lecture misconception ("catch up with a photon") is encoded structurally (β capped <1, prediction option B-d, friend prompt) — matching the row's Sim description and Inquiry questions closely.

## Findings

### P0
- _None._ Smoke test clean (no errors, canvas renders, slider fires, 6 steps advance, both gated predicts unlock via `.choice`, full top bar). Physics verified correct with exact numeric spot-checks (Δτ=Δt√(1−β²) shrinking 6.93→0.40 s as β→0.995, Δs²=−48 at β=0.5, γ growing, photon Δs²=Δτ=0). The proper-time-on-a-photon trap is explicitly avoided (photon marker carries no clock; code comment L907).

### P1
- **[align] The element "Momentum" and the outcome "Relate energy, momentum, and frequency of light" are not served.** The row lists element **"Momentum"** (L598) and outcome **"Relate energy, momentum, and frequency of light"** (L594), and the lecture checkpoint tests `E = pc = hf` — but the sim covers only worldline / Δs² / proper time, with no energy, momentum, or frequency. *Caveat:* the binding **Sim description** (L599) is entirely about the worldline/interval/proper-time comparison and says nothing about momentum/energy, so the sim faithfully does what it's told; adding E=pc=hf could even read as scope creep against the description. → **Fix (confirm intent first):** verify with the course team whether E=pc=hf / momentum / frequency is meant to be served by the lecture, checkpoint, or another sim. If it should appear here, add a small non-interactive readout or Formal-panel line noting `E = pc = hf` for the photon (massless ⇒ E=pc, not E=0) — text only, no change to the worldline physics.

### P2
- **[functional] Two missing font assets.** `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (404 in the smoke test) alongside the working embedded base64. Degrades to system/embedded fonts; not visually broken. → **Fix:** remove (or repoint to base64) the two external-`.ttf` `@font-face` blocks; leave the `data-sim-fonts` base64 block untouched.
- **[physics/consistency] Interval sign convention differs from L18-s2 (candidate).** This sim uses `Δs²=−c²Δt²+Δx²` (spacelike>0), which **matches its own syllabus row exactly**, but L18-s2 uses `s²=Δt²−Δx²` (timelike>0). The syllabus itself is not uniform across rows. Moot for the photon (Δs²=0), but the massive (timelike) case shows opposite signs across sims. → **Fix:** none in this sim (it's faithful to its row); flagged for a course-wide convention decision.
- **[ux] Off-scale massive endpoint at low β.** For β<0.4 (min 0.05) E₂′ sits above the ct=10 window; handled honestly with a clamped arrow and "↑ off-scale (ct=…)" label, and the readout stays correct. → **Fix (optional):** consider raising the β slider minimum toward ~0.3 so E₂′ stays mostly on-screen, or keep as-is (the off-scale label is honest). No physics change.

## Suggested fixes for Cursor (paste-ready)
1. **(Alignment — confirm intent before applying.)** In `shell-versions/L17-s1-photon-worldline-shell.html`, if the course wants the energy/momentum/frequency outcome served here, add one non-interactive line to the ∑ Formal panel: the photon relation `E = pc = hf` with a one-clause note that a massless particle has zero *rest* mass but nonzero energy/momentum. Text/Formal only — do not alter the worldline, Δs², or Δτ logic. If the outcome is covered elsewhere, leave the sim unchanged.
2. Remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 block untouched.
3. *(Optional UX)* Consider raising the β slider `min` from `0.05` toward `0.3` so the massive absorption event E₂′ stays within the ct=10 window at the low end; the current off-scale handling is already honest, so this is polish only. No physics change.

## Physics to verify (human)
- **Scope of the row vs the sim [align].** Confirm whether "Momentum" / "relate energy, momentum, and frequency of light" (and the E=pc=hf checkpoint) are intended to be taught by this sim or by the surrounding lecture. The sim's own description does not ask for them.
- **Interval sign convention [consistency].** This sim's `Δs²=−c²Δt²+Δx²` matches its syllabus row but is opposite to L18-s2's `s²=Δt²−Δx²`. Decide the course-wide convention; no change needed within L17-s1 itself.
- Core physics checks out exactly: proper time `Δτ=Δt√(1−β²)`, interval, γ, the null-worldline limit, and all six Formal equations match canonical forms (see `L17-s1-...-physics.md`); the photon correctly carries zero proper time and no clock.
