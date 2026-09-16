---
name: physics-review-general
description: Domain-agnostic physics + pedagogy review of ANY physics simulation (mechanics, EM, thermo, waves/optics, fluids, quantum, relativity…). Use when asked to review/audit/check a physics sim that is NOT part of the SR shell course (for SR shell sims use review-sim / physics-check). Read-only candidate analysis; groups findings into Physics vs Non-physics buckets, each P0/P1/P2, with issue + fix.
---

# General physics-sim review

Read-only review of ONE physics simulation of any domain. You produce a **candidate
analysis** — code-anchored and confidence-tagged; the user verifies the physics on top.
Do not edit the sim.

## Inputs
- The sim file the user points at (HTML/JS/py/etc.).
- Optional: a one-line brief of what it should teach/do. If absent, infer intent from
  the code, title, comments, and UI.

## Procedure
1. **Identify domain & intent.** State the physical system in one line (e.g. "damped
   pendulum", "2-body orbit", "1-D wave on a string") and the concept it should convey.
2. **Separate model from render.** Isolate physics/state (variables, equations, the
   update/integration step, parameter wiring, reset) from drawing. Quote code with
   function names / line numbers.
3. **Review PHYSICS** (apply what fits the domain):
   - Equations vs the domain's canonical form — signs, factors, missing terms.
   - Dimensional / unit consistency.
   - Conservation & symmetry: energy/momentum/charge/mass conserved where they should
     be; correct limits (small-angle, v→0, t→∞, r→∞…).
   - Numerical method: integrator, dt sensitivity, energy drift / blow-up, singularity
     guards (÷0, √negative), determinism.
   - Physical honesty: nothing animates false physics; ICs/BCs and parameter ranges
     are physical.
4. **Review NON-PHYSICS:**
   - Pedagogy: one clear concept; labels + units present; misconceptions handled (not
     taught); every shown number earns its place.
   - UI/UX: controls discoverable and live; readable text; responsive layout; sensible
     defaults.
   - Functional/code: loads without console errors; no dead controls; no obvious
     performance/memory issues.
5. **Optional spot-check.** Verify a testable relation by reasoning or a quick
   `node -e` (e.g. energy constant for a conservative system, period vs analytic value).
   Note what needs running to confirm.
6. **Write** `<sim>-review.md` in the format below; print a terminal summary (verdict +
   P0/P1 counts per bucket).

## Output format
    # Review — <sim>
    **System:** <one line>   **Verdict:** <models correctly? works?>

    ## PHYSICS
    ### P0
    - [conf] <issue, code-anchored> → **Fix:** <concrete change>
    ### P1
    ### P2

    ## NON-PHYSICS
    ### P0
    - [pedagogy|ux|functional][conf] <issue> → **Fix:** <concrete change>
    ### P1
    ### P2

    ## To verify (human)
    - <physics claims needing manual/running confirmation>

## Rules
- **Two buckets always — PHYSICS and NON-PHYSICS — each split P0/P1/P2.** Empty tiers
  say "none."
- **Severity:** P0 = wrong physics or a broken/dead feature; P1 = real gap hurting
  correctness/learning/usability; P2 = polish.
- **Every finding = issue + suggested fix**, code-anchored (function/line),
  confidence-tagged [high]/[med]/[low].
- **Precise and short** — one or two lines per finding; no essays; don't restate the sim.
- **Physics is candidate-only** — a reasoned concern, never a settled verdict.
- **Read-only.** Output the review file only; fixes go to the editor later, paste-ready
  and physics-preserving unless the fix IS the physics fix.
- **Depth option.** For a tricky model, spawn js-physics-sim-reviewer /
  physics-simulation-reviewer for a second opinion and fold it in.

## Batch
- "review all": loop over the given sims, one review file each, then a triage table
  (sim · verdict · physics P0/P1 · non-physics P0/P1).
