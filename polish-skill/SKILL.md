---
name: polish-skill
description: Run the full sim-foundry POLISH pass (3 independent critics → orchestrator rulings → fixer → 9 gates → sealed-deck check → delivery) on prebuilt user-shell simulations, entirely from Cursor, with no API calls. Use when asked to polish one or more prebuilds (ids like qm-*, wv-*, th-*, cm-*), and file the polished sims under simulations-1/AI courses sims/polish/<course>/.
---

# Polish skill (sim-foundry, Cursor edition)

This is the same polish that has been run from Claude Code on every shipped sim (QM ×11, cm-* ×7, and the waves/thermal prebuilds that follow): three specialist critics (physics, pedagogy, visuals) review the prebuild independently, the orchestrator (YOU) merges their findings and writes binding rulings, a fixer applies them surgically, the 9 gates must be green, the sealed inquiry deck must be byte-identical, and the result is filed in the org repo.

Everything LLM-side runs in Cursor. Everything else is the repo's own deterministic scripts. **Never call any model API** (Bedrock/Anthropic/OpenAI) from a script. **Never commit or push** anything (sim-foundry or simulations-1) unless the owner asks.

## Paths (set once)

| Name | Path |
|---|---|
| REPO | `/Users/admin/Downloads/sim-foundry` (run every repo command from here) |
| SKILL | `/Users/admin/Desktop/simulations-1/polish-skill` (this folder) |
| SIMS | `$REPO/sims-eval-law` (working files: `<id>.prebuild.html`, `<id>.html`, `<id>.polished.html`, `<id>.polish/`) |
| DELIVER | `/Users/admin/Desktop/simulations-1/AI courses sims/polish/<course>/` |
| Chrome | `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (repo has `puppeteer-core`; playwright is NOT installed) |

Course folder from the id prefix (create the folder if missing; reuse if present):

| Prefix | Course folder |
|---|---|
| `qm-` | `quantum mechanics` |
| `wv-` | `waves and acoustics` |
| `th-` | `thermal and statistical physics` |
| `cm-` | `classical mechanics` |
| other | ask the owner once, then add a row here |

## Before you start (read once per session)

1. `templates/STANDING-RULINGS.md`: the binding owner decisions. They override any critic finding. Read ALL of it.
2. `templates/ADDENDUM-TEMPLATE.md`: what you append to each critic brief.
3. `templates/RULINGS-TEMPLATE.md`: what you write before the fixer runs.
4. The subagents in `agents/` (install them first, see README.md): `physics-critic`, `pedagogy-critic`, `visuals-critic`, `polish-fixer`, `skill-slot-author`.

## Run protocol: per sim `<id>` (sims can run in parallel, but each sim's steps are sequential)

### 0. Preflight
```bash
cd $REPO
ls sims-eval-law/<id>.prebuild.html sims-eval-law/<id>.core-slots.txt sims-eval-law/<id>.skill-slots.txt
```
- **No `<id>.prebuild.html`, but a core exists** (`sims/<id>.core-slots.txt` or `sims-eval-law/<id>.core-slots.txt`) and there are **no skill slots**: copy the core to `sims-eval-law/`, `grep -n '\bEngine\.' sims-eval-law/<id>.core-slots.txt` (must be empty; if not, reword ONLY those comments to `engine op <name>`), then delegate to **skill-slot-author** for `<id>`, then assemble:
  ```bash
  node --experimental-strip-types tools/assemble-user-sim.mjs sims-eval-law/<id>.core-slots.txt sims-eval-law/<id>.skill-slots.txt -o sims-eval-law/<id>.html
  cp sims-eval-law/<id>.html sims-eval-law/<id>.prebuild.html
  ```
- **CSS stripped by the assembler.** It silently drops any sim CSS rule whose FINAL selector is a frozen class (`.plot-box`, `.ctrl-box`, `.legend`, `.plot-title`, …). Run `bash $SKILL/scripts/css-ban-scan.sh sims-eval-law/<id>.core-slots.txt`. A rule it lists that does real layout work (anything except the harmless standard `body.light-theme .legend…` line) must be retargeted to a sim-owned class or id on the same element (selector-only change) and the sim re-assembled. A stripped layout rule once left a whole hero blank.
- Working copy: `cp sims-eval-law/<id>.prebuild.html sims-eval-law/<id>.html` (the fixer edits `<id>.html`; the prebuild stays pristine for the deck check and for rollback).

### 1. Baseline gates (on the prebuild)
```bash
bash $SKILL/scripts/gates.sh sims-eval-law/<id>.prebuild.html <id> > sims-eval-law/<id>.polish-gates-before.txt 2>&1
```
(Create `sims-eval-law/<id>.polish/` first if needed.) The 9 gates: 1 frozen-integrity, 2 physics-audit, 3 layout, 4 gi-verify, 5 cg-verify, 6 wo-verify, 7 param-stability, 8 style-probe, 9 reset-oracle. Record which are green and every failure line, verbatim. **Gate 2 N/A:** sims without an audit-spec entry (the lean `th-*` entries) have no physics-audit probes; gate 2 then prints no kernel-checks summary. Count it N/A (not a failure), and the physics critic must verify every on-screen and card number against the spec body instead.

### 2. Critic briefs
```bash
node --experimental-strip-types tools/polish-prompts.mjs sims-eval-law/<id>.html guided-inquiry
```
This writes `sims-eval-law/<id>.polish/{physics,pedagogy,visuals}.md` (system + user prompt, with the sim embedded in slimmed form) and an empty `findings.json`. Use `lecture-demo` instead of `guided-inquiry` only for a non-inquiry sim.
Then APPEND the orchestrator addendum to EACH of the three files (fill `templates/ADDENDUM-TEMPLATE.md` from step 1's gate output, the course entry and the prebuild README's known defects, if any). The addendum is identical in the three files except the last "<ROLE> CRITIC PRIORITIES" paragraph, which differs per role (all three are in the template).

### 3. Critics: THREE independent subagents, in parallel
Delegate, each in its own subagent and its own fresh context (never one agent doing all three):
- **physics-critic**: brief `sims-eval-law/<id>.polish/physics.md`, output `…/findings-physics.txt`
- **pedagogy-critic**: brief `…/pedagogy.md`, output `…/findings-pedagogy.txt`
- **visuals-critic**: brief `…/visuals.md`, output `…/findings-visuals.txt`

Each must exercise the sim in real headless Chrome (`$SKILL/scripts/shots.mjs` helps) and write ONLY its findings file. Output format per line: `- [SEVERITY: critical|major|minor] PRINCIPLE-ID — problem — concrete fix (selector/function + exact change)`, or exactly `NO FINDINGS`. If a critic returns nothing usable, re-run that critic ONCE; never write findings yourself.

### 4. Merge and rule (you, the orchestrator)
```bash
python3 $SKILL/scripts/merge-findings.py sims-eval-law/<id>.polish
```
Then read all three findings files IN FULL and write `sims-eval-law/<id>.polish/rulings.md` from `templates/RULINGS-TEMPLATE.md`:
- Apply `STANDING-RULINGS.md`. Mark every finding that breaks one INVALID AS WRITTEN, with a one-line reason and the allowed way to meet its intent (for example "staging, not text", or "order + pause, not disabled").
- Resolve conflicts. Physics correctness beats pedagogy and visuals, and the spec beats a critic's taste.
- Name the known gate failures the fixer must turn green, and the ones that stay as documented exceptions (for example the gi 60-word budget on sealed explanations).
- Keep it to 8–15 numbered rulings. You rule; you do not invent new work that no critic or gate raised.

### 5. Fixer brief and fix
```bash
node --experimental-strip-types tools/polish-prompts.mjs sims-eval-law/<id>.html guided-inquiry --fixer
cat sims-eval-law/<id>.polish/rulings.md >> sims-eval-law/<id>.polish/fixer.md
```
Delegate to **polish-fixer** with `sims-eval-law/<id>.polish/fixer.md` and the target `sims-eval-law/<id>.html`. It edits `<id>.html` IN PLACE (surgical edits, never regeneration; it IGNORES the brief's "output the complete HTML / add a <!-- POLISH --> comment" line, which is the retired API path) and writes `sims-eval-law/<id>.polish/fixer-report.md` (each finding: applied / skipped-invalid + why).

### 6. Gates: loop to green
```bash
bash $SKILL/scripts/gates.sh sims-eval-law/<id>.html <id> > sims-eval-law/<id>.polish-gates-after.txt 2>&1
node $SKILL/scripts/deck-diff.mjs sims-eval-law/<id>.prebuild.html sims-eval-law/<id>.html
```
Required:
- Every gate that was green before is still green.
- Every failure the rulings said to fix is now green.
- deck-diff prints `DECK IDENTICAL`.
- `grep -c '\bEngine\.' sims-eval-law/<id>.html` is 0.

Allowed to stay red only where rulings.md documents it (the gi 60-word budget on sealed text, pending the owner's ruling).
If anything regressed or is still red, send the SAME polish-fixer the exact failing gate lines plus the deck-diff output, and ask it to fix only that. **At most 3 fixer rounds.** If round 3 still fails:
- restore the working copy (`cp <id>.prebuild.html <id>.html`) if the regression is worse than the original;
- report the sim as NOT POLISHED, with the failing lines, and move on.

### 7. Verify the fixes landed (spot check, you)
- For every critical and major ruling, find the change in `<id>.html` (grep the selector or function named) or in the fixer report.
- Take one pair of screenshots (1440 and 860 px, dark theme) with `scripts/shots.mjs`, and look at them for overlap, blank canvases and clipped labels.
- A critical ruling that did not land goes back to the fixer. It counts toward the 3 rounds.

### 8. Deliver
```bash
cp sims-eval-law/<id>.html sims-eval-law/<id>.polished.html
bash $SKILL/scripts/deliver.sh <id>
```
`deliver.sh` copies `<id>.polished.html` into `DELIVER/<course>/` and appends a row (id, date, gates before → after, fixer rounds, documented exceptions) to that folder's `POLISH-LOG.md`. After a batch, add or update a short `README.md` in the course folder: which sims were polished, the gate table, anything left for the owner, and the documented exceptions. **No commit, no push.**

## Batch mode
Given a list of ids: run step 0–1 for all, then step 2–3 for all (critics for several sims can run in parallel: 3 per sim), then 4–8 per sim as critics finish. Keep a small table (id → stage → gates) in your replies so the owner can follow along. Two to four sims at a time is a sensible load.

## What this skill never does
- **API calls:** it never calls any model API, never runs `pipeline/build-batch.mjs`, and never starts a prebuild.
- **Frozen template layers:** it never edits them (the SHELL CSS and runtime, the Controls-Guide controller, the Welcome overlay, the Card-voiceover engine), and never edits `templates/`, `pipeline/`, `src/`, `engine/` or the course files in sim-foundry.
- **Sealed deck:** it never changes a card's words (stems, options, `data-fb`, headings) and never adds, removes or reorders cards. It never writes "predict".
- **Physics sheet:** it never fills the ⚛︎ The Physics layer or the `<!-- PHYSICS_SHEET -->` marker; the owner does that separately.
- **Commits:** it never commits or pushes.

## Failure playbook
| Symptom | Action |
|---|---|
| gate script crashes on boot (e.g. `Path2D is not defined`, jsdom lacks an API) | Fixer guards the call (feature-check and fall back to direct ctx path calls). It is a real defect: the headless gates must boot. |
| layout gate: SUBJECT TOO SMALL / EMPTY BAND / DEAD BAND | Fixer rescales the drawing or the canvas per the visuals finding; verify with `node --experimental-strip-types pipeline/layoutGate.mjs <file>`. |
| reset-oracle FAIL | The header ↻ Reset must restore every control to the spec's boot default in free mode and after the tour; in-card resets are sim-owned buttons. |
| param-stability problems | A slider gesture wiped a record the student builds: use `cfg.restartOnParamChange:false` with a sim-owned restart, or mark view-only containers `data-no-reset`. |
| physics-audit key mismatch | Fix the sim's `__audit.at` to use the sim's OWN physics path (never a separate re-derivation); a genuinely wrong on-screen number is fixed toward the course spec's values. |
| cg-verify / wo-verify fail after the fix | The fixer touched the skill layer or broke an id the Controls Guide selects; restore the ids. |
| assembler rejects `Engine.` | Reword the comment to `engine op <name>`. |
