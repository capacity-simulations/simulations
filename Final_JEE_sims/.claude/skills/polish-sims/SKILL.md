---
name: polish-sims
description: Full 3-critic polish flow (physics + pedagogy + visuals critics → consolidated findings with orchestrator rulings → one surgical fixer → independent re-gate) on any sim in Module-*/. Ported from the sim-foundry sim-polish skill and rewired to this repo's verification stack. Subscription subagents only. Never pushes to S3.
---

# polish-sims — the 3-critic polish flow for Final_JEE_sims

Polish one already-built user-version sim: three specialist critics in
parallel, an orchestrator consolidation with binding rulings, one surgical
fixer, and an independent re-gate. Ported from `sim-polish` (sim-foundry);
the flow, critic disciplines, and battle-tested angles are identical — only
the gates and file conventions are this repo's.

## Invocation

`/polish-sims <module-relative-path>` — e.g.
`/polish-sims Module-03-Work-Energy-and-Power/C055-collisions-in-2d-and-coefficient-of-restitution.html`

Repo root: `/Users/admin/Downloads/Final_JEE_sims`. Curriculum ground truth:
`/Users/admin/Downloads/JEE_PHYSICS_CURRICULUM.md`. Audience: JEE
Main/Advanced (NCERT conventions), not K-12.

## HARD RULES (read before anything else)

1. **Subscription subagents only** (Agent tool). Never route critics or the
   fixer through an API.
2. **Targets are user versions.** Every sim carries four layers — welcome
   overlay (3 mode cards + hero + read-aloud), guided inquiry (gated POE
   cards), controls guide, card voiceover (play/pause/replay + Auto that
   never answers predictions). Fixes must not break any of them; the re-gate
   proves it. Layer plumbing that is contract-frozen: no speech auto-start,
   `pagehide` speech cancel, two-button `#btn-gi`/`#btn-cg` contract,
   `__giOff`/`__freeExplore`/`__giResume`/`__cgReveals` hooks, `data-no-reset`
   shields.
3. **The audit is a ratchet.** Run the sim's `window.__audit` before polish
   and record the pass count. It must pass exactly the same set after. A
   "fix" that moves audit numbers is a regression by definition.
4. **Surgical edits only.** The fixer changes what findings name — never
   wholesale rewrites. Card/feedback text is copy-polish only.
5. **Never add `disabled` to any sim parameter control.** Stage/hide instead.
   (Exception: the shell's own `gateLocksPlay`/`setPlayLocked` transport
   contract legitimately disables `#shell-play` behind an unanswered gate —
   sanctioned, do not flag or remove. Free exploration must always re-enable
   it via `__freeExplore`.)
6. **Scratch out of the repo.** Backups, findings, screenshots, and oracle
   scripts go in the session scratchpad / `$TMPDIR`, never in `Module-*/`.
7. **No third-party sim-source names** (copyright grep is a shipping gate).
8. **Never push to S3.** Flag `S3: re-push required` in the report; the user
   triggers pushes batch-wise.

## Phase 0 — Setup (orchestrator, you)

1. Verify the target exists; note byte size.
2. Snapshot to `<scratchpad>/<base>.prepolish.html` (if one already exists, a
   previous polish ran — ask the user whether to re-polish on top or restore).
3. Create `<scratchpad>/<base>.polish/` for findings + screenshots.
4. Baseline the gates so "unchanged" is provable later:
   - Parse: `node --check` every inline `<script>` (skip `type="application/json"`).
   - Baseline file for jsdom gates: `git show 6ba6f47:"<module-path>"` (the
     pre-user-version original) → temp file.
   - `cd Sim_use_version_skills && node {guided-inquiry,controls-tutorial,welcome-overlay}/scripts/verify.js ../<module-path> --baseline <temp>` — all PASS.
   - Static server `python3 -m http.server 8734` from repo root (once), then
     `node tools/user-version-eval.mjs <port> <module-path>` — exit 0.
   - `window.__audit` in the live page (CDP via `tools/cdp.mjs`, unique port)
     — record the ratchet: which checks pass.
   - Copyright grep: `grep -icE "phet|colorado" <file>` → 0.
5. KNOWN NOISE: jsdom "Could not parse CSS stylesheet" lines appear on
   passing runs (KaTeX CSS); a favicon 404 is environmental. Neither is a
   finding.
6. Assemble the DO-NOT-FLAG list for the critics: declared model
   simplifications in the sim's Info modal / comments, the sanctioned
   `gateLocksPlay` transport disable, staged reveals that are per-step by
   design, and anything already logged as accepted-residual in `REVIEW-LOG.md`.

## Phase 1 — Three critics, in parallel (subagents)

Launch all three in one message. Each critic reviews ONLY against its
principles below, produces findings only (fixes nothing), in the exact format:
`- [SEVERITY: critical|major|minor] PRINCIPLE-ID — one-line problem — concrete
fix (selector/function named)`. `NO FINDINGS` if clean. End with severity
counts. Every finding needs evidence (numbers, screenshot path, or observed
live state + `file:line`). Ground truth: the curriculum entry + any declared
model in the sim's own copy (a declared simplification is not a defect).

### Critic 1 — physics
Display honesty (displayed = computed; no hidden normalization), model
correctness beyond `__audit`'s probe points (the audit samples a few points —
the critic checks the FORMULAS and the SAMPLING/ANIMATION), animation
faithfulness (does motion imply false physics?), notation/units/signs (NCERT).
Battle-tested angles — assign explicitly:
- Does any cosmetic constant (speed floor, head start, alpha floor, clamp)
  contradict the model at a state the inquiry parks the student in?
- Does any view/layout constant leak into the physics domain (a view clamp
  truncating real distribution mass)?
- Are readouts pure state functions (frame-rate and pause independent)?
- Numeric integration bias if particles move under forces (Euler first-frame
  kick; oscillators need semi-implicit Euler or better).
- Where feasible, RE-RUN the sim's math numerically in Node and compare
  against an independent oracle — don't eyeball formulas.
- Canvas geometry honesty: drawn angles = computed; any aspect squash or
  auto-scale that bends a quantitative visual claim (a "90°" drawn at 59°).

### Critic 2 — pedagogy
The spoiler chain and the discovery arc — historically the highest-value
critic. Assign explicitly:
- SPOILER SWEEP across: `<title>`, header subtitle, plot titles, Info modal
  (one click from load — it must tease, never tell), panel headings and row
  labels, welcome name/blurb/hero caption, the welcome VOICEOVER script lines,
  banners, graph annotations, and choice/feedback texts. Anything that answers
  a gated prediction before commit is a finding (welcome-layer leaks are the
  recurring class in this repo).
- Every OBSERVE card needs a prediction-commit BEFORE its reveal; cards are
  phrased action + question, never narrated outcomes.
- Cards reference only already-revealed elements; staging order matches card
  order; `onStep` must not perform the student's own task.
- Orphaned controls: every visible control serves a card or is staged to
  free-explore. A counterfactual mode must carry a card.
- Interaction × inquiry: does dragging mid-observation wipe the very thing the
  card asks the student to watch (input → restart → blanked overlay)? Does a
  paused scene repaint on input (pause-desync class)?
- Transfer/synthesis card ends as a question, not a fact.

### Critic 3 — visuals
Judge PIXELS, not imagination — real screenshots required: drive the live page
with `tools/cdp.mjs` (headless Chrome; unique port), dismiss the welcome
overlay via the free-explore mode card, then capture AT MINIMUM: default load,
2–4 physics-distinct states driven through the REAL controls (dispatch
input/change events), each control extreme that changes the scene, any
counterfactual mode, and **light theme** (header toggle). Save screenshots to
the scratchpad and cite paths.
Judge: canvas text ≥ 12px in both themes — and check every `ctx.font` for a
literal `var(--…)` string (canvas cannot parse it; text silently renders 10px
— a confirmed recurring class here); label collisions incl. canvas-painted
text under DOM titles; theme-blind canvases (hardcoded dark bg + var() text);
dead bands / subject-too-small; instrument legibility (scales, zero marks,
units); arrows with visible heads that stay visible over the subject;
label-on-the-thing (Mayer contiguity) vs distant legends; welcome-hero
rendering matches its caption's physics claim.
Where an interaction bug is suspected, verify with TRUSTED input (CDP
`Input.dispatchMouseEvent` drags), never only synthetic events.

## Phase 2 — Consolidation (orchestrator, you — never delegated)

Write `<scratchpad>/<base>.polish/findings.md`:
1. Merge duplicates across critics into single items (cite both; one root cause).
2. **Resolve conflicts with explicit ORCHESTRATOR RULINGS** on physics-honesty
   grounds, and say why. (Precedent: state-wipe on param change — kept where
   stale-state visuals would lie, removed via `data-no-reset` where live
   response is the honest behavior.)
3. Order: `## CRITICAL`, `## MAJOR`, `## MINOR`, numbered C1…, M1…, m1….
   Each item: finding + binding ruling (the HOW, concrete enough to execute).
4. End with a **Verification bar for the fixer**: every gate from Phase 0, the
   `__audit` ratchet, the specific live probe for each critical fix (with
   expected numbers), trusted-input retest where an interaction bug is
   involved, `no disabled` on sim controls, CSS scoped to sim-owned selectors,
   and layer-copy re-sync whenever cgSteps/welcome/voiceover text changes.

## Phase 3 — Fixer (one subagent)

Prompt it with: the findings file (read COMPLETELY first), the prepolish
backup path marked never-edit, the critic screenshots, and its standing
discipline: surgical exact-string edits with uniqueness checks; match local
style; any shell mechanic relied on (`data-no-reset`, `__cgPrepare`,
`__cgReveals`, gateLocksPlay, header literals) must be verified by grepping
the sim's own file before use — never assumed. The fixer runs the ENTIRE
verification bar itself and reports per-finding status + measured numbers.
Deviations from a ruling are acceptable only when the ruling's own
verification target demands it — reported as deviations with evidence.
If the fixer hits a bar failure it cannot resolve: STOP, do not ship, report
with the option to restore from the prepolish backup.

## Phase 4 — Independent re-gate (orchestrator, you)

Never trust the fixer's own verification alone. Re-run yourself:
1. `node --check` all inline scripts.
2. The three jsdom verifiers with `--baseline` → PASS ×3.
3. `node tools/user-version-eval.mjs <port> <module-path>` → exit 0.
4. Live `__audit` → exactly the ratchet set.
5. Re-run the specific probe for every critical/major fix.
6. Copyright grep → 0. No `disabled` added to sim controls.

## Phase 5 — Ship & report

Leave the fixed file in place. Append one row to `REVIEW-LOG.md` (file, date,
critic finding counts, fixes one-line each with severity, deviations,
`browser-verified: yes/no`). Do NOT push to S3 — end the report with
`S3: re-push required for this file`. Git commits are handled centrally by
the session orchestrator, never by sub-agents.

Final report leads with the verdict, then: finding counts per critic, the
best catch, per-gate scorecard before/after, deviations. A red gate is a
stop, not a footnote.

## Known-benign classes (do not re-litigate)

- jsdom "Could not parse CSS stylesheet" noise (KaTeX) on PASSING runs.
- Favicon 404 in the harness.
- The `gateLocksPlay` transport disable behind an unanswered prediction gate.
- Audio-only TTS buttons; deadpan-by-design actions.
- Per-step staged reveals (hidden ≠ broken; check the staging order instead).
- "Subject too small" measured at idle for sims that draw only after Play.
