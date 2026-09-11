---
name: jee-sim-review
description: End-to-end review of JEE physics HTML simulations in Final_JEE_sims — one skill covering physics correctness (independent oracle, every slider-parameter regime), functional correctness (browser-drive every control, find dead/broken components), visual↔parameter alignment, and pedagogy. Runs as an orchestrated parallel agent flow (one orchestrator + dimension sub-agents per sim; scales to many sims), with a serial fallback. Produces a two-bucket report (Physics / Non-physics) ranked P0/P1/P2 with precise surgical proposed fixes. REVIEW-ONLY — nothing is edited until the user approves fixes. Triggers: "review this sim", "validate physics", "audit the simulation", "test all controls", "find dead controls", "parallel review", "review all sims", "JEE sim review", "physics review".
---

# JEE Sims — End-to-End Simulation Review (orchestrated)

One skill, two parts. **Part A** is the review specification — the complete definition of what must be checked. **Part B** is the agent flow — how an orchestrator fans Part A out across parallel sub-agents per simulation. Part A is self-contained so it can also be run serially by a single agent (or ported verbatim to another tool such as Cursor, where dimensions D1→D4 are simply executed in order).

## Guarantee map — what this skill covers end to end

| Requirement | Where it is enforced |
|---|---|
| Physics correctness of every equation, constant, unit, sign | D1 (oracle audit) |
| Simulation behaves correctly for **every slider-parameter regime** | D1 parameter-grid protocol + D3 sweeps |
| Visuals fully align with slider parameters | D3 (visual↔parameter alignment) |
| All controls/sliders/buttons work; no dead controls | D2 (DOM-enumerated browser drive) |
| End-to-end behavior, flow gaps, broken components | D2 (stepper walk, reset/resize/lifecycle) |
| Pedagogical correctness, presentable to JEE students | D4 (pedagogy vs NCERT/JEE + curriculum map) |
| Issues grouped Physics / Non-physics, ranked P0/P1/P2 | Part C report (orchestrator merge) |
| Precise surgical fixes, applied only after approval | Part C issue format + Part D fix phase |

## Scope and codebase facts

Applies to the standalone HTML sims in `Final_JEE_sims/` (root and `CM/`). Curriculum ground truth: `/Users/admin/Downloads/JEE_PHYSICS_CURRICULUM.md` (numbered concepts, NCERT-first, JEE Advanced depth). File↔topic mapping: `COVERAGE-MAP.md`.

Two generations of sims — identify which you have first:
- **Engine-grounded** (contain `<script id="engine-manifest">` + a `verify.audit` module installing `window.__audit = {manifest, at, probes, invariants, state, setParam, run()}`): `mp-photoelectric`, `Terminal_velocity`, `fluid-terminal-velocity`, `rot-rolling-race`, `shm-damped`, `tir-fixed`, `Polarization_v2`, etc.
- **Shell-only / legacy** (no audit surface): all `*-shell.html`, `circuit-lab-3d-realistic`, most of `CM/`.

Common shell chrome in both: cream top bar (Info · Theme · Maximize · Formal · Speed · Reset · Play/Pause), guided-inquiry stepper sidebar (dots + Next/Finish + Skip, collapsible), custom slider rows (`.ctrl-slider-row` → `input[type=range]` + `.slider-val` readout), KaTeX from CDN. `photoelectric-bare.html` is superseded — exclude from batch runs unless explicitly named.

## Prime directive: review first, fix only after approval

- The deliverable of a review run is the report — **no sim file is edited**, not even "obvious one-liners." The file must be byte-identical after review.
- Every issue ships with an exact surgical proposed fix: `file:line`, current code, replacement code, one-line rationale, risk note.
- Fixes are applied only after the user approves specific ones — then as minimal diffs, each re-verified (browser + oracle).
- Oracle/scratch scripts go in the session scratchpad, never the project folder.

## Buckets and priorities — use exactly these

**Physics issues** — anything where the physics *presented to the student* is wrong or misleading: wrong equation/sign/unit/constant; readout disagreeing with independent recomputation; a drawn visual (direction, shape, scale, timing) contradicting the slider parameters; a false claim in labels/formulas/copy; visible integrator drift. Litmus: "is the physics shown to the student wrong?" — if yes it's a Physics issue even when the root cause is UI (a stale label showing the old g is Physics).

**Non-physics issues** — dead/miswired controls, console errors, layout/resize/DPR breakage, reset/flow/stepper gaps, performance, missing initial paint, network-dependency risks.

- **P0** — a student using the sim normally is taught something false or cannot use it: wrong physics in any default/typical range; NaN/Infinity in a readout; dead primary control; crash; visual contradicting parameters.
- **P1** — wrong/broken only at edges (slider extremes, degenerate geometry); secondary control or flow defect that degrades but doesn't block; pedagogically confusing (not false) presentation.
- **P2** — polish: cosmetic inconsistency, wording, formatting, non-blocking robustness gaps.

---

# PART A — Review specification (four dimensions)

Every dimension starts the same way: read the sim's `<title>`, `<h1>`, Info panel, and stepper copy to fix what it claims to teach; map it to curriculum concept numbers; write down the governing equations, JEE/NCERT sign conventions, and limiting behaviors **before** reading the implementation. Then read the whole file — state variables and units, physics functions, integrator, all interactive elements, draw loop, reset paths, and (engine-grounded) the manifest params schema and `__audit` claims.

## D1 — Physics correctness (oracle audit)

Recompute, never trust. Build an **independent oracle** (small Python/Node script in the scratchpad, or clean hand computation) for every displayed/drawn quantity. The sim's own `__audit` is the sim's claim about itself — run it, but it never substitutes for the oracle, because `at()` and the UI can share the same wrong formula.

- **Equations & constants** match the standard results; constants match CODATA/NCERT to displayed precision (known defect class: `photoelectric-bare` hardcoded h to 4 figures, shifting the stopping potential in the 4th decimal).
- **Units** — each conversion appears exactly once per term; slider units (cm, nm, °, km/h) vs internal SI/radians.
- **Signs & conventions** — torque sense, NCERT optics sign convention, friction/drag/EMF direction (Lenz), cross-product handedness.
- **Angles** — deg→rad at every `Math.sin/cos/tan` fed by a degree-labeled control.
- **Numerics** — fixed physics timestep; frame-delta clamped (one long frame must not blow up state); semi-implicit Euler or better for oscillators; the **Speed control changes playback rate only, never the physics answer**.
- **Parameter-grid protocol** (this is how "every set of slider parameters" is covered): for each core output, compare sim vs oracle at a grid over the control space — every slider at {min, default, mid, max} plus all physically special points in range (critical angle, critical damping, threshold frequency, resonance, angle 0°/90°, mass-ratio extremes). For multi-slider sims, test each slider's sweep at default-others plus at least 3 cross-combinations of extremes. Read the sim's values from the **live page** (`javascript_tool` / `__audit.state` / `setParam`), not from re-deriving its code. Agreement to displayed precision; at every grid point: no NaN/Infinity/negative-impossible values, graceful clamps at bounds.
- **Invariants** — if `__audit` exists: `run()` must pass after load, after parameter changes, and after ≥30 s of simulated time. Otherwise probe the natural invariants by hand (energy in undamped systems, momentum in collisions).

## D2 — Functional correctness (browser drive)

Use `claude-in-chrome` (load all tools in one ToolSearch batch; open the file via `file://` in a **new tab**; close it when done).

1. **Enumerate first, then test.** Via `javascript_tool`: `querySelectorAll('button, input, select, [role=button], [tabindex], canvas')` plus registered pointer handlers. The checklist comes from the live DOM, not code comments — that is how HTML-present-but-never-wired dead controls get caught.
2. **Console clean on load** (`read_console_messages`; KaTeX CDN failure → raw TeX → Non-physics issue, note offline risk).
3. **Sliders** — drive each min → mid → max via native setter + `input` event: live state change, live `.slider-val` update, initial `value` matches initial state, `min/max/step` internally consistent and physically sensible for JEE ranges.
4. **Buttons & shell chrome** — click every one: Info opens/closes; Theme flips with everything legible in both themes (canvas often doesn't re-read CSS vars — check drawn colors); Maximize/restore keeps canvas + hit-tests right; Formal toggle shows equations (D1/D4 verify their content); Speed changes rate only; **Reset** restores state + slider positions + labels + traces + stepper; **Play/Pause** freezes physics time, not just drawing.
5. **Stepper walk** — every step via Next to Finish, plus Skip, plus collapse/restore. Each step's instruction must be executable against controls that exist; a step referencing a missing/renamed control is a flow gap (P1); a step asserting a false outcome is a Physics issue.
6. **Drag targets** — drag to and past both extremes; graceful clamp; `setPointerCapture`; `touch-action: none`; generous hit radius.
7. **After each interaction class** — re-check console for new errors.
8. **Resize & DPR** — narrow → wide → narrow: canvas re-fits, no blank frame, no physics drift, hit-tests still land.
9. **Lifecycle** — pause → change sliders → Reset → Play: no ghost state, no stale traces or labels.
10. **Dead-control verdict** — any enumerated element with no observable effect on state, drawing, or readout: report as dead (P0 if primary, P1 otherwise) with the wiring fix proposed.

If browser tools fail after 2–3 attempts, stop retrying, complete what can be checked from code, and mark `browser-verified: no` prominently — never silently downgrade.

## D3 — Visual↔parameter alignment

A first-class physics check on the *picture*, in the live browser:

- **Timing** — measure on-screen periods/rates (timestamp state via `javascript_tool` over ~10 s): computed T = 2.0 s must mean a visible cycle in 2.0 s of sim time × speed setting.
- **Proportionality sweeps** — double a parameter and confirm the drawn quantity responds with the right functional form (double amplitude → double drawn amplitude; double λ → double drawn spacing where to scale).
- **Direction & geometry** — arrows point where physics says (drag opposes v, centripetal inward, refraction bends the correct side of the normal); drawn angles match computed angles (probe canvas-space coordinates via JS; screenshot-inspect otherwise).
- **Scale honesty** — if drawn to scale, verify one length ratio numerically; if deliberately not to scale, the copy must say so (silence = Physics P1).
- **Readout↔drawing sync** — number shown and thing drawn come from the same state on the same frame; no one-frame lag; nothing stale after Reset.

## D4 — Pedagogy & curriculum alignment

- Terminology, symbols, conventions match NCERT/JEE (u/v/f optics with NCERT signs; ε, r for cell EMF/internal resistance; standard g unless stated).
- Every readout has units; displayed precision is defensible.
- Formal-mode KaTeX equations are rendered correctly **and match what the code actually computes** (cross-check against D1's oracle).
- Stepper narrative builds the concept in a sensible order; defaults make the interesting regime reachable without magic slider hunting.
- Simplifications (no drag, ideal wires, point masses) are fine **if stated**; unstated ones a JEE student would trip over are P1. Never propose adding physics the sim deliberately omits and declares.
- Confirm the sim actually teaches its `COVERAGE-MAP.md`/curriculum entry; note gaps (e.g., a "polarization" sim missing the single-slit half of its P0 entry) as pedagogy findings, not as features to build.

### D4b — Novice (K-12) visual legibility

The physics depth is JEE Main/Advanced and never drops. But the humans using
these sims are **school students in classes 11–12 (~16–18)**, usually meeting
the topic for the first time — a diagram only a person who already understands
the topic can decode has failed, however correct it is. Audit in the live
browser at 1500×950 and 1024×768; each failure is a pedagogy finding:

- every arrow, colour, dashed line, shaded region and symbol is identified on
  first appearance, in the scene or an adjacent key — not only in a distant
  legend or the voiceover;
- a quantity's first appearance carries its NAME, not just its symbol
  ("induced EMF ε", not a bare "ε");
- text is legible after DPR (canvas ≥12px, sidebar ≥13px — measure it), nothing
  clipped at a canvas edge or hidden behind another element
  (`ctx.font='var(--font-sans)'` silently renders 10px — grep for it);
- colour is never the only channel for a distinction (shape/label/dash too),
  and the palette survives red-green colour blindness;
- the DEFAULT scene, paused at t = 0, is self-explanatory from pixels alone;
- ≤ ~3 novel visual encodings competing at once without staging or highlight;
- guided-inquiry cards use no term before defining it and name every control
  exactly as its on-screen label reads.

Labelling, glossing, font size, contrast, colour redundancy and legend
placement are surgical fixes. A new inset/panel/redrawn schematic is an
ENHANCEMENT proposal. **Never resolve one of these by simplifying the physics.**

---

# PART B — Orchestrated agent flow (parallelize per sim)

The four dimensions are independent by design, so one simulation is reviewed by **four parallel sub-agents plus you as orchestrator-merger**. Use the `Workflow` tool (the user has opted into this orchestration by invoking this skill).

### Single-sim flow

1. **Orchestrator prep (you, inline):** resolve the absolute file path; read this SKILL.md body (fresh, with Read) to embed in sub-agent prompts.
2. **Fan out** one Workflow, phase `'Review'`, `parallel()` over the four dimensions. Each `agent()` call gets: `effort: 'high'` (model omitted — inherit session model unless the user names one), `label: '<basename>:D<n>'`, `schema: DIM_REPORT_SCHEMA`, and this prompt:

```
[full body of this SKILL.md]

===
Your assignment
---------------
Target file: <absolute path>
Dimension:   D<n> — <name>. Execute ONLY Part A → D<n> end-to-end (plus the
             shared ground-truth step at the top of Part A).
Scope:       REVIEW ONLY. Do not edit this or any project file. Oracle/scratch
             scripts go in your scratchpad. D2/D3: open the file via file:// in
             a NEW Chrome tab (one ToolSearch batch for the tools) and close
             your tab when done. If browser tools fail after 2-3 tries, finish
             from code and set browserTested=false.
Output:      ONLY the structured report per the schema. Every issue needs
             evidence (oracle numbers / browser observation, with file:line)
             and an exact proposed fix (location, currentCode, replacementCode,
             rationale, risk). Do not invent issues — empty arrays are valid.
             Assign bucket and P0/P1/P2 per the skill's definitions.
```

`DIM_REPORT_SCHEMA` (inline it in the workflow script):

```
{ type:'object',
  required:['file','dimension','browserTested','physicsIssues','nonPhysicsIssues','cleanChecks','notes'],
  additionalProperties:false,
  properties:{
    file:{type:'string'}, dimension:{type:'string', enum:['D1','D2','D3','D4']},
    browserTested:{type:'boolean'},
    physicsIssues:{type:'array', items:{'$ref':'#/$defs/issue'}},
    nonPhysicsIssues:{type:'array', items:{'$ref':'#/$defs/issue'}},
    cleanChecks:{type:'array', items:{type:'string'}},
    notes:{type:'string'} },
  '$defs':{ issue:{ type:'object',
    required:['priority','description','evidence','line','proposedFix'],
    additionalProperties:false,
    properties:{
      priority:{type:'string', enum:['P0','P1','P2']},
      description:{type:'string'}, evidence:{type:'string'},
      line:{type:'integer', minimum:0},
      proposedFix:{ type:'object',
        required:['location','currentCode','replacementCode','rationale','risk'],
        additionalProperties:false,
        properties:{ location:{type:'string'}, currentCode:{type:'string'},
          replacementCode:{type:'string'}, rationale:{type:'string'},
          risk:{type:'string'} } } } } } }
```

(If the runtime rejects `$ref`/`$defs`, inline the issue schema at both sites.)

3. **Orchestrator merge (you, inline):** dedupe across dimensions — same root cause (same `file:line` or same underlying defect) found by two agents becomes ONE issue keeping the highest priority and strongest evidence, noting both dimensions. Do not soften or drop findings; where two agents disagree on priority, keep the higher unless the evidence clearly settles it. Then assemble the Part C report.

### Multi-sim flow

For N files: `parallel()` over the flat list `files × [D1..D4]` (labels `basename:D1` …), then merge per file. 4 agents per file — with the session's 15-agent guideline, warn and confirm before launching more than 3 files at once; for a large batch, run in chunks of 3 files and aggregate across chunks. Chrome note for the user before launch: 2 tabs per sim (D2+D3) will open.

### Rules the orchestrator must obey

- Assign dimensions and files deterministically; never let a sub-agent choose its target.
- Review-phase agents write nothing in the project — no worktrees needed.
- A `null` agent result (dropped/failed) = that dimension unreviewed: say so in the report and offer to re-run just that dimension. Never fill in its findings yourself.
- Aggregate verbatim (minus dedupe); same-pattern issues in different files stay separate issues (note the pattern in the tail summary).

### Serial fallback (no Workflow tool, or ported to Cursor)

Execute Part A yourself in order D1 → D2 → D3 → D4 (D2 and D3 can share one browser tab), then produce the Part C report. Identical checks, identical output — only slower.

---

# PART C — Consolidated report (the deliverable)

```
FILE: <name> — <title> · Concepts: <curriculum #s> · Audit surface: yes/no
Browser-verified: D2 yes/no · D3 yes/no · __audit.run(): pass/fail/n-a

## Physics issues
[PHY-P0-1] <one-line defect>   (found by: D1, D3)
  Evidence: <oracle numbers / browser observation>  (file:line)
  Proposed fix:
    location: <file:line>
    current:  <exact code>
    replace:  <exact code>
    rationale: <one line>  ·  risk: <what else this touches>
[PHY-P1-…] …

## Non-physics issues
[FUN-P0-1] … (same shape)

## Clean checks
<one line per major area that passed — oracle agreement grid, invariants, all controls live, stepper walk, …>

## Verdict
<ship / fix-P0s-first / needs-rework> + anything the author must know
```

Multi-sim runs additionally get: a header table (file · verdict · P0/P1/P2 counts per bucket · browser-verified), all Physics issues across files sorted P0→P1→P2, then Non-physics likewise, then a tail summary (totals, unreviewed dimensions, cross-file patterns). End with the approval prompt: which fixes to apply (all P0s / per-issue / per-file). **Apply nothing yet.** Do not invent issues to look thorough — every claimed physics defect must carry the oracle numbers that prove it; empty buckets are stated explicitly.

# PART D — Fix phase (only after explicit approval)

- Apply only the approved fixes, exactly as proposed (justify any code-forced deviation).
- Minimal surgical diffs: no refactors, renames, cosmetic drift, new features, or new dependencies; shell CSS/markup and authorial copy preserved.
- Multiple files edited concurrently → fan out one agent per file with `isolation: 'worktree'`; a single file → fix inline.
- After each fix: re-run the specific oracle comparison and browser check that caught it, plus `__audit.run()` where present. Report per-fix diff summary + re-verification result.

---

## Common defect patterns in this codebase — check specifically

- Constants hardcoded at too-low precision (the `photoelectric-bare` h class).
- Physics dt coupled to rAF delta unclamped → long frame blows up the integrator.
- Speed control multiplying dt **into the physics** instead of playback stepping.
- Reset restoring state but not slider `.value`/labels/traces/stepper.
- `input` vs `change` on ranges — label desync during drag.
- Theme toggle leaving canvas-drawn colors stale (canvas doesn't re-read CSS vars).
- Formal-mode KaTeX disagreeing with the code's actual formula.
- Degree-labeled slider fed raw into `Math.sin`; cm/nm/km-h conversion applied 0 or 2 times.
- `Math.abs` on a signed lever arm; one-sided clamps hiding sign errors.
- Stepper steps referencing renamed/removed controls.
- Missing initial paint; missing resize handler; DPR unapplied or doubled.
- KaTeX CDN dependency → degrades offline (once per file, P2 unless equations load-bearing).
- `__audit.at()` sharing the exact formula under test with the UI — self-consistent but unverified; the oracle decides.

## Anti-patterns — never

- Editing anything before approval. Trusting the sim's readouts/comments/`__audit` as ground truth. Verifying only at defaults. Proposing feature additions, redesigns, refactors, or new test files as "fixes." Leaving scratch/debug artifacts in the project. Eyeballing signs, timing, or scale instead of computing them.

## Definition of done (review run)

- Every displayed quantity checked against an independent oracle over the full parameter grid (all sliders swept + special points + cross-combinations).
- Every DOM-enumerated control driven in a real browser, console monitored; drag/resize/reset/stepper lifecycles exercised; dead controls identified.
- Visual↔parameter alignment verified for timing, proportionality, direction, scale, and readout sync.
- Pedagogy checked against JEE/NCERT conventions and the curriculum entry.
- Report delivered in Part C format, buckets prioritized, every issue carrying an executable surgical fix — and every sim file byte-identical to when the review started.
