---
name: physics-check
description: Deep code-level physics review of an SR sim — concepts, equations, numerical methods, and physics-engine architecture/flow, with special relativity in mind. Use when the user asks to check/verify the physics of a sim (e.g. "physics check L14-s1", "verify the equations", "is the physics engine correct"). Produces a candidate analysis to support the user's own manual physics verification.
---

# Physics review of an SR sim

A focused, deep physics pass on ONE sim's code. You produce a rigorous **candidate
analysis** — the user is a physicist who will verify manually on top of it. Be
concrete and code-anchored; never claim the physics is settled-wrong. Read-only.

## Inputs
- `_review/PHYSICS-RUBRIC.md` — the SR physics checklist + report format. Follow it.
- `_review/syllabus.md` — the concept this sim is supposed to teach (match key `LNN-sN`).
- The sim file (default folder `shell-versions/`).

## Procedure
1. **Resolve** the file + `LNN-sN` key; read the concept from `_review/syllabus.md`.
2. **Extract the physics.** Read the sim's `<script>`; isolate the physics/model
   code from the rendering: state variables, the equations, the `onFrame` update,
   frame/coordinate transforms, control→parameter wiring, `onReset`. Quote code with
   function names / line numbers.
3. **Analyze against every section of `_review/PHYSICS-RUBRIC.md`:**
   (1) concept fidelity & unit convention, (2) equations vs canonical SR forms
   (signs, factors, domains), (3) numerical methods (integrator, dt, singularity
   guards, precision at β→1, determinism), (4) engine architecture/flow (state↔render
   separation, update path, frame transforms, reset), (5) the SR animation-honesty
   trap checklist.
4. **Optional numeric spot-check.** Where a pure relation is testable, verify a known
   value by reasoning or a quick `node -e` (e.g. γ(0.6c)=1.25, w=(u+v)/(1+uv) stays
   <c, ds² sign for a timelike pair). Note any that need running the sim to confirm.
5. **Write** `_review/<file-without-.html>-physics.md` in the rubric's report format:
   concept verdict, an equations table, numerical-methods notes, architecture/flow
   notes, the SR-trap checklist, and a **prioritized "Concerns for manual
   verification"** list (P0/P1/P2 + confidence + code anchor + why it matters).
6. **Print** a terminal summary: models-correctly verdict + the count of P0/P1
   physics concerns, so the user knows where to focus their manual check.

## Rules
- **Candidate-only + confidence-tagged.** Tag findings [high]/[med]/[low]; the human
  decides. Distinguish "definitely wrong" from "looks off, verify."
- **Code-anchored.** Every finding cites the function/line and the canonical form it
  should match. No hand-wavy claims.
- **SR mindset always on.** Inertial frames, one interval-sign convention
  (ds² = (cΔt)² − (Δx)²), proper vs coordinate time/length, massless vs massive,
  causality/light-cone, relativistic vs classical distinction.
- **Read-only.** Output only the physics report; fixes are applied later in Cursor.
- **Depth option.** For a tricky sim, you may spawn a physics-reviewer subagent
  (js-physics-sim-reviewer / physics-simulation-reviewer) for a second opinion and
  fold its verdict in — but keep the code-anchored, candidate-only framing.

## Batch
- "physics check all": loop over `shell-versions/*-shell.html`, write one physics
  report each, then a triage table (sim · models-correctly · P0 · P1).
