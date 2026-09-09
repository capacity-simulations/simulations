---
name: jee-sim-deep-review
description: Deep review + fix loop for the JEE user-version simulations — physics truth (independent oracle, full parameter grid, browser-verified visuals) AND demonstration quality (a blind "Demonstration Oracle" that derives what an ideal demo of the topic must show, then audits the sim against it — visual salience, control-range pedagogy, representation honesty, regime coverage). Finds and surgically fixes defects; proposes larger demonstration enhancements for approval. Preserves the four user-version layers (welcome overlay, guided inquiry, controls guide, voiceover). Triggers: "deep review", "review and fix", "demonstration review", "pedagogy review", "is this sim teaching well", "review the user version".
---

# JEE Sims — Deep Review (physics truth + demonstration quality)

Two questions, in order, about one simulation:

1. **Is every quantity, motion, and drawn pixel physically true?** (Track P)
2. **Is this the best possible demonstration of this topic for a JEE student —
   do the visuals, controls, and ranges actually *communicate* the concept?** (Track D)

A sim can pass Track P perfectly and still fail Track D. The project's own
history proves it: `mag-cyclotron`'s B-slider produced pixel-identical orbits at
every value (the auto-scale exactly cancelled r ∝ 1/B — physics right, slider
demonstrating nothing); `mag-loop-torque` scaled force arrows by sin θ when F
doesn't depend on θ (teaching a false dependence with correct equations);
`mag-field-sources` spaced field circles uniformly while claiming 1/r. Track D
exists to catch this entire class systematically.

## Ground rules

- **Targets are user versions.** Every sim in `Module-*/` carries four layers
  (welcome overlay, guided inquiry, controls guide, card voiceover). Fixes must
  not break them; the post-fix gate re-verifies them (Part 4).
- **Defects are fixed in this loop; redesigns are proposed.** A finding that has
  a surgical fix (≤ ~30 lines, no new panels/controls/representations) is
  applied and re-verified. A finding whose fix would add or restructure a
  representation (new graph, new control, new comparison mode) is written up as
  an ENHANCEMENT with an implementation sketch and left for user approval.
- **Evidence or it didn't happen.** Every finding carries oracle numbers or a
  live-browser observation with `file:line`. Empty findings arrays are valid;
  never invent issues to look thorough.
- Scratch scripts (oracles, probes) go in the scratchpad/`$TMPDIR`, never the repo.
- One file per agent. No git operations (the user commits centrally).
- Curriculum ground truth: `/Users/admin/Downloads/JEE_PHYSICS_CURRICULUM.md`.
  Audience: JEE Main/Advanced aspirants — quantitative, comfortable with
  calculus and limiting cases; NOT K-12. Depth and sign conventions follow
  NCERT + JEE Advanced.

## Buckets and priorities

- **PHYSICS defect** — the physics presented is wrong or misleading (wrong
  equation/sign/unit/constant; readout ≠ oracle; drawn visual contradicting the
  parameters; false claim in copy/cards/voice; integrator drift). A stale label
  is a PHYSICS defect if it shows a wrong value.
- **DEMONSTRATION defect** — the physics is right but the sim *shows* it
  wrongly or fails to show it: dishonest visual encodings, dead-by-autoscale
  controls, key observable invisible or buried, pedagogically dead ranges,
  broken contrast/linkage. These are defects, not polish — they teach wrong
  intuitions or nothing.
- **FUNCTIONAL defect** — dead controls, console errors, layout/reset/lifecycle
  breakage, layer regressions.
- **ENHANCEMENT** — a concrete way this sim could demonstrate its topic better
  that requires more than a surgical change. Ranked by pedagogical ROI.

Priorities: **P0** = a student using defaults/typical settings is taught
something false or blocked. **P1** = wrong/dead only at edges; or the core
observable is significantly harder to see than it should be. **P2** = polish.

---

# TRACK P — Physics truth

Start blind: from the sim's title/topic ONLY, write down the governing
equations, JEE/NCERT sign conventions, expected limiting behaviors, and the
physically special points in each parameter's plausible range — BEFORE reading
the implementation. Then read the whole file.

## P1 · Oracle audit
Build an independent oracle (Python/Node in scratchpad) for every displayed and
drawn quantity. The sim's `window.__audit` is its claim about itself — run it,
never substitute it for the oracle.
- Equations, constants (CODATA/NCERT to displayed precision), units (each
  conversion exactly once), signs/conventions (NCERT optics signs, Lenz, torque
  sense, cross-product handedness), deg→rad at every trig call fed by a
  degree-labeled control.
- Numerics: fixed physics timestep or clamped frame delta; Speed control changes
  playback rate only, never the answer; semi-implicit Euler or better for
  oscillatory systems; no state blow-up after a long background tab.

## P2 · Parameter grid
For each core output, sim-vs-oracle at every slider {min, default, mid, max}
plus every physically special point in range (critical angle, critical damping,
resonance ω₀, threshold frequency, v_min = √(5gr), angle 0°/90°, mass-ratio
extremes). Multi-slider sims: each slider swept at default-others, plus ≥3
cross-combinations of extremes. Read values from the LIVE page (evaluate JS /
`__audit.state`), not by re-deriving code. At every grid point: agreement to
displayed precision, no NaN/Infinity/impossible values, graceful clamps.

## P3 · Browser functional + visual truth
Drive the real page (CDP driver `tools/cdp.mjs`, unique port per agent; wrap
every evalJs in an IIFE):
- Enumerate controls from the live DOM, drive every one; dead-control verdicts
  come from observed state/pixels, not code reading.
- Console clean on load and after each interaction class.
- Timing: measured on-screen period = computed period × speed setting.
- Proportionality: double a parameter → drawn quantity responds with the right
  functional form (double λ → double spacing, where to scale).
- Direction/geometry: arrows point where physics says; drawn angles = computed.
- Scale honesty: to-scale claims verified numerically; deliberate not-to-scale
  must be disclosed in copy (silence = P1).
- Reset/pause/resize/theme lifecycle: no stale canvas while paused (interact
  while paused → repaint), no ghost state after Reset, both themes legible
  (canvas often doesn't re-read CSS vars — check drawn colors), DPR/resize safe.
- Known defect classes from this codebase — check each explicitly: pause-desync
  (canvas only redrawn in onFrame); theme vars read from `documentElement` while
  the class lands on `body`; unbounded KaTeX retry; silent canvas clamps at
  slider extremes; the shell's restart path wiping state the cards depend on;
  view-only buttons missing `data-no-reset`; `ctx.font = 'var(--font-sans)'`
  (canvas cannot parse var() — text silently renders at 10px).

---

# TRACK D — Demonstration quality (the Demonstration Oracle)

The method mirrors the physics oracle: derive an independent standard first,
then audit against it. Anchored in physics-education research: PhET design
principles (make the invisible visible; implicit scaffolding; action visible
within seconds), Mayer's multimedia principles (signaling, contiguity,
coherence), cognitive load theory (kill extraneous load, keep intrinsic),
Ainsworth's multiple-representations framework (linked, complementary
representations), and variation theory (students learn a critical dimension by
varying IT while everything else stays fixed).

## D1 · Blind ideal-demo spec — write this BEFORE reading the sim's implementation
From the topic alone (title + curriculum entry), derive and write down:

1. **Core observables** — the 2–4 things a student must literally SEE happen to
   internalize this topic. (Rolling race: same shape reaches bottom first
   regardless of mass/radius; translation+rotation decomposition; the
   energy split.) Be concrete: "sees X change when Y changes."
2. **The causal chain** — the mechanism the visuals must expose, not just the
   end result (flux CHANGING → EMF → current → bulb; not just "bulb lights").
3. **Must-reach regimes** — the parameter regimes where behavior qualitatively
   changes, including the limiting/critical cases JEE examines (critical
   damping, resonance, critical angle, orbit escape, μ = tan θ). Each must be
   INSIDE control ranges and findable without magic slider hunting.
4. **Essential contrasts** — the side-by-side or before/after comparisons that
   carry the concept (elastic vs inelastic; with/without drag; frame A vs B).
5. **Best-fit representations** — which of {animation, vector overlay, live
   graph, bar/energy meter, numeric readout, formal equation} this topic needs,
   and which linkage between them matters (e.g., x–t slope ↔ live v readout).
6. **The 5-second default** — what a student should see happen within ~5
   seconds of pressing Play on defaults, before touching anything.

## D2 · Audit the real sim against the spec — in the live browser
Work through the eight audits; every failure is a finding with evidence.

1. **Observable coverage** — each core observable from the spec: visible?
   salient (visually dominant when it matters) or buried in a corner readout?
   missing entirely?
2. **Causal visibility** — is the mechanism watchable, or does the sim jump
   from cause to effect? (Intermediate quantities drawn? Rates visible as
   motion/growth, not only as numbers?)
3. **Control-range pedagogy** — for EVERY control: does [min, max] span the
   pedagogically interesting range including the other side of each critical
   point? Is `step` fine enough near criticality (can the student land on
   resonance, or does it jump over)? Do defaults sit where the phenomenon
   shows? Is any pedagogically-crucial parameter missing or locked?
4. **Control honesty (dead-by-autoscale and friends)** — drive every control
   min→max and MEASURE pixels: does the drawn scene actually change, with the
   correct functional form? Named classes: auto-fit cancelling the very
   dependence the control teaches; arrows scaled by a factor the quantity
   doesn't depend on; spacing drawn uniform while claimed ∝ 1/r; response
   clipped by canvas bounds so the top half of the range shows nothing.
5. **Representation linkage** — number, drawing, graph, and equation must be
   same-frame consistent and visibly connected (Mayer contiguity: labels on the
   thing, not in a distant legend; graph cursor synced to animation time).
   Missing linkage that the topic needs (per spec item 5) is a finding.
6. **Contrast affordances** — are the essential contrasts (spec item 4)
   experiencable — twin/ghost/overlay/preset — or must the student hold the
   before-case in memory? (Memory-based comparison of dynamics is a known
   failure mode; JEE topics with ratio answers need visible ratios.)
7. **Extraneous load** — clutter that competes with the core observable;
   decorative animation near the signal; >2 simultaneous novel encodings;
   anything the student must decode that doesn't serve the topic. (JEE students
   tolerate high intrinsic load — cut only the extraneous.)
8. **The naive-student walk** — play the sim as a student who does the obvious
   thing: press Play, drag the biggest slider, follow the cards. Note every
   point where the interesting thing did NOT happen, where nothing visibly
   changed, or where what happened contradicts the card/voiceover text.
   (Also confirms the guided-inquiry cards' claimed observations actually
   occur when instructions are followed literally.)

## D3 · Demonstration report card
Score 1–5 on five axes, each with a one-line justification tied to evidence:
- **Invisible made visible** (fields, forces, rates, energy drawn, not implied)
- **Causal salience** (mechanism watchable; key quantity dominant)
- **Regime coverage & control honesty** (ranges, criticality, honest pixels)
- **Representation linkage** (animation ↔ graph ↔ numbers ↔ equation)
- **Guided path** (defaults + cards + contrasts reliably produce the aha)

Scores are for the ledger and batch triage (a 2 anywhere ⇒ at least one
DEMONSTRATION finding or ENHANCEMENT must explain it). Do not inflate.

---

# TRACK L — Layer integrity (user-version)

- Card, callout, and voiceover COPY must match present behavior (no references
  to removed buttons, wrong colors, wrong panel positions, actions `onStep`
  already performs, transport instructions contradicting boot state).
- Predict-gate hygiene: at each gated card, nothing on screen leaks the answer
  pre-commit (readouts, plotted theory curves, banners). Leaks found earlier in
  C198/C194/C192/C037 were reported-not-fixed; in THIS loop a surgical staging
  fix (hide/reveal an existing element by step) is in scope; a renderer
  restructure is an ENHANCEMENT.
- Fixes must keep: two-button contract, overlay + three modes, Listen rows,
  transport, Auto behavior (never answers predictions), no speech auto-start,
  pagehide speech cancel, `data-no-reset` shields on watcher shells.

---

# Part 4 — Fix phase and gates

1. Apply every PHYSICS / DEMONSTRATION / FUNCTIONAL defect fix surgically
   (exact-string replace with uniqueness check; minimal diff; match local
   style). ENHANCEMENTS are NOT applied — they go in the report.
2. Re-verify each fix live: re-run the specific probe that caught it.
3. Run the full gate battery:
   - `node --check` on every inline script;
   - the three jsdom verifiers with `--baseline` (originals live in git —
     `git show <pre-replacement-commit>:<path>` if a baseline is needed);
   - `node tools/user-version-eval.mjs <port> <module-relative-path>` (deep
     browser eval: overlay, 3 modes, inquiry, controls walk, voiceover wiring);
   - copyright grep (no third-party sim-source names).
4. Ledger: append one row to `REVIEW-LOG.md` (file, date, grid size, fixes
   one-line each with priority, report-card scores, enhancements proposed,
   `browser-verified: yes/no` per track).
5. Flag in the final report: **fixed sims must be re-pushed to S3** (the
   platform serves from S3; the push pipeline + manifest exist — the user
   triggers it batch-wise).

# Part 5 — Orchestration

**Parallel (Claude Code, Workflow/agents):** per sim, three sub-agents —
(A) Track P oracle+grid, (B) Track P browser functional/visual + Track L,
(C) Track D demonstration oracle — then one **skeptic pass**: an independent
agent receives all findings and tries to REFUTE each against the live sim
(kills anchoring and false positives; PLAUSIBLE-but-unverified findings are
downgraded and marked). The orchestrator merges (dedupe by root cause, keep
highest priority + strongest evidence), applies fixes, runs gates, writes the
ledger row. Track D's D1 spec MUST be written by an agent that has not yet read
the implementation (blind-first is the point).

**Serial (Cursor, one tab per sim):** execute in this exact order — D1 blind
spec FIRST (from title/curriculum only), then Track P (P1→P3), then Track D
audits, then Track L, then fixes + gates + ledger. The blind spec must be
written into the report before any implementation reading is logged.

Per-agent CDP ports: unique per tab/agent (e.g., 12000 + concept number mod
500). Static server: `python3 -m http.server 8734` from the repo root.

# Output contract

```
FILE: <module-relative path>
TRACK P: grid <n> points, <m> mismatches · browser-verified yes/no
TRACK D: report card V:<1-5> C:<1-5> R:<1-5> L:<1-5> G:<1-5>
FIXED (n): [P0|P1|P2][PHYS|DEMO|FUNC|LAYER] <one line> · verified <how>
ENHANCEMENTS (m): [ROI-ranked] <one line each + implementation sketch>
GATES: syntax ✓ · jsdom ×3 ✓ · user-version-eval ✓ · copyright ✓
LEDGER: REVIEW-LOG.md row appended
S3: re-push required for this file
```
