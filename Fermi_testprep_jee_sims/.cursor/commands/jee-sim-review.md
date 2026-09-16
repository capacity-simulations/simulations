# JEE Sim Review — end-to-end physics & functional audit

Run a rigorous, review-only audit of the JEE physics simulation file(s) the user names (or asks about) in this folder.

## Single source of truth

First, read the full specification at `.claude/skills/jee-sim-review/SKILL.md` in this repo and follow it exactly. That file defines everything: the four review dimensions, the parameter-grid protocol, bucket/priority definitions, the report format, and the fix-after-approval rules.

## How to execute it in Cursor

Cursor has no Workflow/subagent fan-out, so use the skill's **serial fallback** (defined in its Part B):

1. **D1 — Physics oracle**: build an independent recomputation script (Python/Node, in a temp dir — never in the repo) and compare it against the sim over the full parameter grid: every slider at min/default/mid/max, all physically special points in range, plus extreme cross-combinations. Never trust the sim's own readouts, comments, or `window.__audit` as ground truth.
2. **D2 — Functional**: if a browser tool is available, open the file via `file://`, enumerate every interactive element from the live DOM, and drive all of it (sliders, buttons, top-bar chrome, full stepper walk, drags, resize, reset-mid-motion) with the console monitored. If no browser tool is available, do the deepest possible static handler-wiring audit and mark the report `browser-verified: no` — never silently downgrade.
3. **D3 — Visual↔parameter alignment**: timing vs computed period, proportionality sweeps, vector directions, scale honesty, readout↔drawing sync.
4. **D4 — Pedagogy**: NCERT/JEE conventions and symbols, units on every readout, Formal-mode equations matching the code's actual computation, stepper narrative, alignment with `COVERAGE-MAP.md` and `~/Downloads/JEE_PHYSICS_CURRICULUM.md`.

## Non-negotiable rules

- **REVIEW ONLY.** Do not edit any sim file. The deliverable is the report; files must be byte-identical afterward.
- Every issue goes in one of two buckets — **Physics** / **Non-physics** — ranked **P0/P1/P2** per the skill's exact definitions.
- Every issue carries a precise surgical proposed fix: `file:line`, exact current code, exact replacement code, one-line rationale, risk note.
- Every claimed physics defect must include the oracle numbers that prove it. Do not invent issues; empty buckets are stated explicitly.
- Fixes are applied only in a later pass, only for issues the user explicitly approves, as minimal diffs, each re-verified.

## Output

Produce the consolidated report exactly in the skill's Part C format (header line, Physics issues, Non-physics issues, Clean checks, Verdict), then ask which fixes the user wants to approve. Apply nothing yet.
