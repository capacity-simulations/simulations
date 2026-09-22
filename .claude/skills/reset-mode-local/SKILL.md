---
name: reset-mode-local
description: Make the ↻ Reset button MODE-LOCAL in a university-lab user-version sim (Fermi_university_sim_lab_sims/**). Reset must restart the CURRENT mode (Guided Inquiry / Controls Guide / Free Exploration) from its own beginning and NEVER switch modes, landing on exactly the view a fresh entry into that mode shows. Use when asked to "fix the reset button", "make reset mode-local", "roll out the reset fix", or to continue the reset rollout on more sims. 34 sims are already done (see references/precedents.md); this skill encodes their full playbook so the remaining sims land identically. Surgical edits only; the shipped oracle script is the definition of done.
---

# Reset, mode-local

The user-approved product rule (validated across 34 sims, three review rounds):

- **Guided Inquiry** → back to card 1, via the sim's own `__fullReset` path
  (the deck restages the scene itself, so sim and cards cannot disagree).
- **Controls Guide** → the tour restarts at step 1.
- **Free Exploration** → experiment reset only; mode and reveals untouched —
  *unless* this sim's free mode stages its own scene (see hazards H6).
- Reset lands on **exactly the view a fresh entry into that mode shows** —
  the oracle below is the definition of done, per mode.
- Play state after Reset matches the **boot** play state (which may differ
  per mode). Never add timeouts to fix play state — act synchronously (H2).
- **Per-sim design outranks uniformity**: if the sim's own code/captions say a
  setting survives Reset (e.g. `onReset` READS sliders), keep it and report it
  as an accepted diff (H7). When in doubt, STOP and ask — do not improvise.

## Procedure (one sim at a time; never git unless asked)

1. **Check it isn't already done** — `references/precedents.md` lists every
   finished sim. Then MAP the wiring with the greps in
   `references/wiring-shapes.md` and identify the sim's shape (A–D).
2. **Patch** using that shape's verbatim template. The templates are exact:
   anchor with `assert count==1` python replacement (all-assert-then-write),
   matching the file's real characters (curly quotes, indentation).
3. **Check every hazard** in `references/hazards.md` (H1–H8) against this
   sim. Most sims need only the template; the hazards say exactly when more
   is needed and give the precedent fix to copy.
4. **Run the shipped oracle** — do not write your own:
   `python3 .claude/skills/reset-mode-local/scripts/oracle.py <sim.html> [reset-btn-id]`
   (auto-detects `shell-reset`/`reset`/`reset-btn` if omitted). It tests all
   three modes: fresh-entry snapshot vs post-reset snapshot, the one-click
   mid-deck GI check, and page errors. Iterate on the patch until every mode
   PASSes or every remaining diff is justified under H7's accepted-diff rules
   (cite the matching precedent by name).
5. **Syntax gate**: `node --check` every inline script block of the file.
6. **Report** per sim: shape used, edits (one line each), oracle table,
   accepted diffs with justification + precedent, anything you were unsure
   about. If the oracle cannot be made to pass without inventing something
   outside the hazard ledger, STOP and report instead of improvising — a new
   hazard class is a finding, not a licence.

## Hard rules

- Smallest change that passes the oracle. Never touch physics, guided-inquiry
  card logic, panel reveals, z-index/stacking, or The Physics layer.
- Keep each sim's GI answer policy as-is (some decks clear answers on
  restart, some keep them — both are approved; do not unify).
- Playwright must launch `p.chromium.launch(channel='chrome')` — there is no
  bundled chromium on this machine.
- One commit per sim ONLY when the user asks for commits; message pattern in
  precedents.md.
