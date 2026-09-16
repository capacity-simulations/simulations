# Review — L18-s2-for-causality-misconceptions-a-simulatio-shell.html
**Verdict:** PASS (0 P0, 2 P1)
**Syllabus match:** Yes — the sim lets students read the invariant separation (s², classification) of an event pair and *predict* whether the time ordering is frame-dependent, then *boost to observe*, exactly as the row's Sim description requires; the "time ordering is absolute" misconception is encoded as prediction option (A), not a text card.

## Findings

### P0
- _None._ Smoke test clean (no console errors, canvas renders, play toggles, slider fires, 5 steps advance, full top bar). Physics engine verified correct with exact numeric spot-checks (γ(0.6)=1.25; v_sim=0.4→Δt′=0; order flips past v_sim for spacelike only; s² invariant under boost).

### P1
- **[align] Two of the four shared learning outcomes are not surfaced by name.** The row's outcomes include "Describe hypothetical **tachyons**" and "the connection between **superluminal propagation, acausality, and instabilities**." The sim teaches the interval/ordering half thoroughly but never uses the word *tachyon* or draws a superluminal signal worldline (that is L18-s1's job). The Sim description (the binding spec) is fully met, so this is not blocking — but a single sentence in Step 5 / notes tying "spacelike order-reversal ⇒ a faster-than-light (tachyonic) signal would let effect precede cause" would close the gap to the stated outcomes. → **Fix:** add one clause to the Synthesise step or "The rule" notes explicitly naming tachyons / superluminal signals as the acausality mechanism (text only — no physics change).
- **[functional] Two missing font assets.** The `@font-face` rules reference external `DMSans-SemiBold.ttf` and `JetBrainsMono-SemiBold.ttf` (alongside the embedded base64 `DMSansUser`), which 404 in the smoke test. Rendering degrades silently to the embedded/system fonts, so it is not visually broken, but it is two failed requests on every load. → **Fix:** remove the external-`.ttf` `@font-face` blocks (or point them at the embedded base64) so no request 404s; do not touch the working `data-sim-fonts` base64 block.

### P2
- **[pedagogy] Dead legacy stepper code.** `STEPS` (L1003), `buildDots` (L1009), and the `#step-title/#step-ind/#step-prompt/#step-dots` writes in `applyStep` (L1018-1021) target DOM ids that no longer exist (grep count = 0); the live inquiry is the shell's 5-card stepper. Null-guarded, so harmless, but it is confusing dead code. → **Fix:** delete `buildDots`/`STEPS` and the dead `#step-*` DOM writes, keeping the live `applyStep` state logic (S.step, boost-group deemph, notes reveal).
- **[physics] Representation convention (candidate — see physics report).** Boost uses the **orthogonal re-render** (relabel axes t→t′, move E₂ to its transformed coords) rather than skewed t′/x′ axes over fixed events. Physically correct and internally consistent; flagged only for cross-sim consistency with any Minkowski sim that uses skewed axes.
- **[ux] Symbol key defines v_sim unconditionally** (Δt/Δx) but the green v_sim marker only appears for spacelike pairs. A student on a timelike pair could compute v_sim=3 and wonder where the marker is. → **Fix:** append "(only < c, i.e. exists, for spacelike pairs)" to the v_sim key entry.

## Suggested fixes for Cursor (paste-ready)
1. In `shell-versions/L18-s2-for-causality-misconceptions-a-simulatio-shell.html`, in the Step 5 "Synthesise" inquiry card (and/or the "The rule" notes panel), add one sentence explicitly naming the tachyon/superluminal link, e.g. "A signal faster than light connecting a spacelike pair would, in some frame, arrive before it was sent — a **tachyon** would make effect precede cause. That acausality is why c is an absolute speed limit." Text-only; do not alter any physics or canvas logic.
2. In the same file's `<style>`/`<head>`, remove (or repoint to the embedded base64) the two `@font-face` rules whose `src` is `url('DMSans-SemiBold.ttf')` and `url('JetBrainsMono-SemiBold.ttf')`, so no external font request 404s. Leave the `<style data-sim-fonts>` base64 `@font-face` block untouched.
3. In the same file's `<script>`, delete the dead legacy stepper: the `STEPS` array (~L1003), the `buildDots` function (~L1009) and its call (~L1142), and the `#step-title`/`#step-ind`/`#step-prompt` writes plus the `#step-dots` loop inside `applyStep` (~L1018-1021). Keep the rest of `applyStep` (S.step clamp, `#boost-group` deemph, notes-panel reveal) — it is live. Verify the guided inquiry still advances after removal.
4. In the "Symbol key" panel, change the `v_sim` entry to note it only exists (is < c) for spacelike pairs. Text-only.

## Physics to verify (human)
- **Representation choice [med].** Confirm the orthogonal-re-render Minkowski convention (move the event, relabel axes) is intended and consistent with the rest of the course; some SR courses standardize on skewed t′/x′ axes over fixed events. Physics is correct either way (s² held, lightcone at 45°, E₁ at shared origin).
- **Classification dead-band ±0.02 [high confidence it's fine].** Verify the anti-jitter tolerance in `classification`/`orderStr` never mislabels a genuinely spacelike pair dragged very near the cone as lightlike/simultaneous.
- No other physics concerns — all equations match canonical SR forms and numeric spot-checks were exact (see `L18-s2-...-physics.md`).
