# SR Sim Review Rubric

The fixed acceptance bar for every shell sim. A review scores each sim on the five
dimensions below, each finding tagged with a severity:

- **P0 — blocking:** wrong physics, a dead/broken control, or a hard mismatch with
  the syllabus requirement. Must fix before sign-off.
- **P1 — should fix:** real pedagogy/alignment/UX gap that noticeably hurts the sim.
- **P2 — nice to have:** polish, wording, minor clutter.

Physics correctness findings are **candidates for the human reviewer to confirm** —
state the concern and the reasoning; never assert the physics is wrong as settled.

---

## 1. Syllabus alignment (vs `_review/syllabus.md` entry for this sim)
- Does the sim do what the **Sim description** says (the scenario, the objects, the
  degrees of freedom, the "before/after" framing)?
- Are the **Inquiry questions** from the sheet actually present as guided-inquiry
  steps (or answerable with the sim)? List any missing/renamed ones.
- Is the lecture's **Misconception** targeted (as a wrong prediction choice, not a
  standing text card)?
- Do the **Learning outcomes / Elements** get served? Flag anything the sim adds
  that the row does NOT ask for (scope creep) or omits that it does.

## 2. Physics correctness (candidate flags — human-verified)
- Quick pass here: equations / numerical methods / constants consistent with the
  concept; no SR traps (no auto-sweeping velocity/β over time; no proper-time clock
  on a photon; a function plot is not an animated particle; frame changes relabel
  axes rather than "move" events; one interval-sign convention ds² = (cΔt)² − (Δx)²);
  faithful evolution (no fake loop/plateau; stable axes).
- **For a DEEP physics pass** — concepts, every equation, numerical methods, and the
  physics-engine architecture/flow — run the **`/physics-check`** skill (spec:
  `_review/PHYSICS-RUBRIC.md`, report: `_review/<sim>-physics.md`) and fold its
  P0/P1 physics concerns into this review's findings. All physics findings remain
  candidates for the human physicist to confirm.

## 3. Pedagogy (per SHELL-DESIGN-GUIDE principles)
- Guided-inquiry arc fundamental → full (predict → observe → verify → extend →
  resolve); predicts gated; misconception encoded structurally.
- Fewest objects; every visible number is read/predicted/compared by some step.
- Invariant panels only where invariance IS the lesson.
- Formal tools off by default; quantities shown with frame + units.

## 4. UI / UX
- Global design intact: cream top bar (Info · Theme · Maximize · Formal · Speed ·
  Reset · Play), dynamic sidebar (inquiry stepper → controls), formal region.
- Layout: nothing overlaps; sidebar scrolls; canvas readable (labels ≥12px, prose
  ≥14px); light + dark both legible; maximize/theme/collapse don't distort the hero.
- Guided inquiry: Skip works, Next gates only on predicts, Finish collapses.

## 5. Functional (does it actually work — see smoke test)
- Loads with no console errors; canvas renders (non-blank).
- Play toggles; every slider/toggle fires its handler and changes something.
- Stepper Next/Finish/Skip work; formal toggle + theme + maximize work.
- No dead control (a control with no visible/honest effect).

---

## Review output format (what /review-sim writes to `_review/<sim>-review.md`)

```
# Review — <sim filename>
**Verdict:** <PASS | FIX NEEDED (n P0, m P1) | major rework>
**Syllabus match:** <one line: does it do what the row asks?>

## Findings
### P0
- [align|physics|pedagogy|ux|functional] <finding> — <why> → **Fix:** <concrete change>
### P1
- …
### P2
- …

## Suggested fixes for Cursor (paste-ready)
1. <imperative, file-scoped instruction; preserve physics/visuals unless the fix IS a physics fix>
2. …

## Physics to verify (human)
- <candidate correctness concerns for you to confirm>
```
