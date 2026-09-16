---
name: review-sim
description: Review one shell SR sim against the syllabus + rubric + a headless smoke test, and write a structured review with a paste-ready Cursor fix-list. Use when the user asks to review/check/audit an SR sim (e.g. "review L05-s1", "/review-sim shell-versions/L05-s1-...html"). Read-only on the sims — fixes are implemented separately in Cursor.
---

# Review an SR shell sim

Fast-tracks review of the shell sims in this folder. You ANALYZE (read-only);
the user implements fixes via the Cursor agent (reversible). Do not edit the sim.

## Inputs (already prepared in this repo)
- `_review/syllabus.md` — per-sim syllabus reference (source of truth). Key = `LNN-sN`.
- `_review/syllabus.json` — same, machine-readable.
- `_review/RUBRIC.md` — the fixed acceptance bar + the review output format.
- `_review/smoke-test.mjs` — headless functional test (puppeteer-core + system Chrome).
- Design spec: `_design-reference/SHELL-DESIGN-GUIDE.md`, `_design-reference/simulation-shell.css`,
  and `_design-reference/reference-converted-sim.html`.

## Procedure (per sim)
1. **Resolve the file + key.** The arg is a sim name or path (default folder
   `shell-versions/`). Extract the `LNN-sN` key from the filename.
2. **Load the requirement.** Read that key's entry in `_review/syllabus.md`
   (topic, learning outcomes, elements, sim description, inquiry questions, notes,
   misconception, checkpoint). This is what the sim MUST satisfy. Do NOT re-parse
   the xlsx.
3. **Run the smoke test** for this sim and read its JSON:
   `cd _review && node smoke-test.mjs ../shell-versions/<file>` → then read
   `_review/<file-without-.html>-smoke.json` (JS errors, canvas, play, sliders,
   stepper advance, missing assets, top-bar controls).
4. **Read the sim file** and evaluate it against all five `RUBRIC.md` dimensions:
   (1) syllabus alignment, (2) physics correctness, (3) pedagogy, (4) UI/UX,
   (5) functional (fold in the smoke-test results). For dimension (2), run the
   **`/physics-check`** skill (deep pass — concepts, equations, numerical methods,
   engine architecture) and fold its P0/P1 physics concerns into the findings; the
   detailed analysis lives in `_review/<sim>-physics.md`.
5. **Write the review** to `_review/<file-without-.html>-review.md` in the exact
   format from `RUBRIC.md`: verdict line, syllabus-match line, findings grouped
   P0/P1/P2 (each tagged [align|physics|pedagogy|ux|functional] with a concrete
   fix), a **paste-ready Cursor fix-list**, and a **"Physics to verify (human)"**
   section.
6. **Print a concise summary** to the terminal: the verdict, the P0/P1 counts, and
   the smoke-test one-liner, so the user can triage without opening the file.

## Rules
- **Read-only on the sim.** Never modify the sim HTML — output only the review file.
- **Physics is candidate-only.** Surface correctness concerns with reasoning and
  mark them for the user to confirm; never assert the physics is wrong as settled.
- **Fixes must preserve physics/visuals** unless the fix itself IS a physics fix —
  say so explicitly in the fix-list, and keep each fix file-scoped and imperative
  so it can be pasted straight into the Cursor agent.
- **Ground every alignment finding** in a specific line from the syllabus entry
  (quote the requirement it misses or exceeds).
- If asked to review several, loop the procedure and end with a triage table
  (sim · verdict · P0 · P1 · smoke).

## Batch
- "review all" / "review the batch": first run `cd _review && node smoke-test.mjs --all`
  for the functional triage, then produce a review file per sim, then a summary table.
