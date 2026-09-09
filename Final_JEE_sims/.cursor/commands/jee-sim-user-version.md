# JEE Sim → User Version — all four layers, one sim, end to end (parallel-safe)

Turn ONE simulation into its **user version**: guided-inquiry button contract → controls-tutorial overlay → welcome overlay → card voiceover + Auto walkthrough. Designed to run in many Cursor agent tabs at once — one agent per sim — so it must stay strictly inside its assigned files.

The user names a sim (e.g. `Module-05-Gravitation/C077-escape-velocity.html`). You produce `sim-use-builds/<same-basename>.html`.

## Ground rules (non-negotiable)

1. **Never modify the original sim.** `cp` it to `sim-use-builds/` first, then edit ONLY the copy. Other agents are editing sibling files concurrently — never run repo-wide formatters or cross-file search-and-replace.
2. **Copy-then-edit, small edits only.** Never write a whole ~300 KB file in one write — those calls fail mid-response and leave corrupt output. Use targeted string replacements.
3. **No git.** Don't commit, push, stage, or branch. The user commits centrally after all agents finish.
4. **No third-party sim names, ever.** These files were scrubbed for copyright. Never introduce "PhET", "Collision Lab", "Gases Intro", "Pickup Coil", "Colorado", or any external sim-source name in titles, copy, comments, or speech lines. Re-grep before you finish.
5. **Don't touch physics.** The sim's kernel, `window.__audit`, `engine-manifest` / `engine-inline` / `shell-runtime` blocks stay byte-identical apart from the specific sanctioned deltas below.
6. Scratch work goes in `$TMPDIR`, never in the repo.

## Read these first (they are the specification)

- `Sim_use_version_skills/guided-inquiry/SKILL.md` + `references/implementation.md`
- `Sim_use_version_skills/controls-tutorial/SKILL.md` + `references/implementation.md` — **§1–§4** are the base layers, **§6** is the voiceover layer (including §6.4's identifier map and §6.4b for watcher sims). Every code block is verbatim-copyable.
- `Sim_use_version_skills/welcome-overlay/SKILL.md` + `references/implementation.md`

**Validated exemplars** — consult the one matching your sim's shell instead of re-deriving:
- C-series (`Module-*/C0xx-*.html`): `sim-use-builds/C203-refraction-and-snells-law.html`
- L-series (root `L30-*.html`, `Galperins_Billiard.html`): `sim-use-builds/L30-the-coriolis-force.html`

## Procedure

### 0. Copy + map
`cp <original> sim-use-builds/<basename>.html`. Then map the sim: top-bar buttons, every sidebar panel/slider/readout, the inquiry cards and their wiring style (`data-correct`/`data-fb` vs `setupChoiceCard`), whether the shell has `restartOnParamChange`, and whether any script is gated behind a CDN guard (`if(!window.THREE) return;`).

### 1. Guided inquiry — button contract (content is copy-polish ONLY)
Replace `#shell-lecture` with the two-button pair (`#btn-gi` boots `active`, `#btn-cg`). Remove the lecture **markup** — the `#shell-lecture` button, the `#aside-inquiry-restore` strip, and any end-of-body auto-lecture boot script. Leave `setLectureMode` and its listeners in the shell-runtime block alone: with their elements gone they are unreachable, and ground rule 5 keeps shell-runtime byte-identical apart from the two sanctioned deltas (Finish → `__giOff`, and exporting `setInquiryCollapsed`/`inqShow`). This matches the validated C203 exemplar. Add `.gi-off #aside-inquiry{display:none !important;}`. Route the inquiry's Finish through `window.__giOff`. Expose `setInquiryCollapsed` and `inqShow` on the `Shell` object. Publish from the sim's scope: `__cgReveals` (its `applyStepReveals`, or a documented no-op), `__freeExplore` (the POST-COMPLETION state — not a mid-inquiry snapshot), `__giResume`, and `__cgPrepare` if any guided control only exists in one scene/mode.

**Cards: trim only budget violations** (card ≤90 words pre-answer, feedback ≤60). Never restructure cycles, never rewrite distractors.

**Then grep the card copy for controls you just removed.** Cards that say "press the 🎓 button" or "click Lecture" point at a control this layer deletes — fix the wording (C190 shipped with exactly that). Also check cards for transport instructions that contradict the boot state ("Press ▶ Play" on a sim that boots playing) and for colour/position claims that no longer match the scene.

### 2. Controls tutorial
Every control and readout gets a step, or a written in-code reason it doesn't (meta-UI only: info, theme). Top-bar → `veil`; sidebar/canvas panels → `hide`, EXCEPT a canvas panel inside a CSS grid or flex row — use `veil` there and say why in-code: `display:none` collapses the track and leaves a DPR-fitted canvas with a stale backing store until the next repaint (hit independently on C192 and C194); couple related controls with `also`. Add wrapper ids where missing (markup only). Copy is ≤15 words per step. Hook Reset → `__fullReset` with an **additive** `setTimeout(0)` listener; don't edit the shell's own reset handler.

### 3. Welcome overlay
Four blocks from the reference. ADAPT: the sim name (`.welcome-name`, ≤22ch), a one-sentence blurb, speech lines 1–2 (3–6 are house copy, verbatim), and **`drawHero` — the one real per-sim decision**: draw this sim's central idea *from its own equations* (equal-time dots so density shows speed; accumulate over ~1–2 s via rAF; one frame under `prefers-reduced-motion`; transparent background; theme-aware colours; never loop). Keep `WELCOME_ONCE = false`. Use the **ranked** `pickVoice` (Google US English first) — if the sim already carries the old regex picker, retrofit it.

### 4. Voiceover + Auto (reference §6)
Engine `<script>` goes immediately **before** the two-button controller script. Listen row above `.inq-nav`. Two-row controls-guide nav. Apply all six controller deltas.

Three things that bite:
- **CSS anchor**: append §6.1 CSS *after* the sim's existing `.cg-nav` rules (some builds keep template CSS in a later `<style>` block — appending to the first block silently loses the two-row layout).
- **Button height**: `#inq-voice`/`#inq-auto` must equal the sim's pager-button height (standard C-series shell = 27px: 13px line + 12px padding + 2px border) so the sidebar row doesn't grow.
- **`norm()`**: keep the general symbol/punctuation floor rules; delete the example tokens that don't occur in this sim and add the ones that do (Φ, ε, ω, θ, primes, units…). Check the actual card text.

The Chrome TTS defenses in the engine (deferred speak, `safeCancel`, `onstart` watchdog, `preferLocal`, `engineDead`, guarded `resume()`) are load-bearing — copy them exactly. §6.5 explains each.

### 5. Known pitfalls — check each against your sim
- **Watcher shells** (`restartOnParamChange`): add `data-no-reset` to `#btn-gi`, `#btn-cg`, `#welcome-overlay`, and the created callout + nav, or every guide click restarts the run.
- **Early-return guards**: hoist DOM-only prediction wiring and hook publication *above* any `if(!window.THREE) return;`, and publish safe no-op hooks on the guarded path.
- **Async boot**: if `Shell.init` waits on a CDN library, split it — immediate `Shell.init({})` for inquiry/chrome, late `Shell.attach(callbacks)` when the library lands.
- **Latch-style reveals**: if a reveal is gated by a commit *latch* rather than the step index, re-derive it from `data-answered` / `Shell.step` inside `__giResume`, or free-explore leaves the answer visible on re-entry.
- **No `applyStepReveals`, but the sim stages something anyway**: if `draw()` reads `Shell.step` directly to hide/show a panel, do NOT ship `__cgReveals` as a no-op — the guide would then point at a hidden target. Add a two-line `revealStep`/`applyStepReveals(i)` indirection and route `__cgReveals` / `__freeExplore` / `__giResume` through it (C193, C192).
- **`data-answered`**: the Auto observer needs it on committed cards. If the sim's choice wiring doesn't set it, add `card.setAttribute('data-answered','')` in the commit handler.
- **Boot state**: if the sim boots playing and the first PREDICT concerns what the running sim shows, boot paused.

## Verify — every gate must pass before you report

```bash
cd Sim_use_version_skills                       # jsdom is installed here
node guided-inquiry/scripts/verify.js   '../sim-use-builds/<basename>.html' --baseline '../<original-path>'
node controls-tutorial/scripts/verify.js '../sim-use-builds/<basename>.html' --baseline '../<original-path>'
node welcome-overlay/scripts/verify.js   '../sim-use-builds/<basename>.html'
```

Always pass `--baseline` so pre-existing CDN/console errors don't count against you. Plus:

- `node --check` every inline `<script>` (skip `type="application/json"` blocks).
- Unique ids — each of `btn-gi`, `btn-cg`, `inq-voice`, `inq-auto`, `cg-auto`, `cg-rew`, `cg-fwd`, `cg-voice-play`, `welcome-overlay` appears **exactly once**.
- Hooks present: `__giVoiceStop`, `safeCancel`, `engineDead`, `preferLocal`, `onCardDone`, `playLines`, `__setMode`, `__fullReset`, `__giOff`, `__freeExplore`, `__giResume`, `__cgReveals`.
- Copyright re-grep (rule 4) returns nothing.
- The original file is unchanged (`git status` shows it clean).

### Real-Chrome flow probe — MANDATORY, the jsdom gates cannot replace it

The three verifiers check *structure*. They cannot see a runtime exception thrown during `Shell.init` in a real browser — and when that happens the sim still passes every gate while the welcome overlay leads into a **dead controls guide and an inquiry with no active card**. C070 shipped exactly that way (a negative canvas radius from `availH - bodyReserve` before layout settled aborted init mid-boot).

```bash
python3 -m http.server 8734          # from the repo root, once
node tools/flow-probe.mjs 9500 <basename>.html
```

It drives real headless Chrome through welcome → controls guide (walking every step, asserting the glow target is on-screen), welcome → guided inquiry (a card must be active *and* visible), and welcome → free exploration (no guide residue), and fails on any console exception. Exit 0 required.

If it reports a boot exception, **check the original sim too** (`node tools/flow-probe.mjs` against a copy, or just load the original and read the console): the defect is usually pre-existing, in which case fix it in your build with a minimal surgical change and say so in NOTES — the user version is what ships.

Fix and re-run until all gates pass. **Never ship with a lowered bar** — if a gate can't pass, stop and report why.

Remaining browser-only checks (real-gesture audio, callout aesthetics, both themes) need a human; the user does one manual pass at the end. Don't fake them.

## Output contract

End your run with exactly this shape:

```
SIM: <original path>  →  sim-use-builds/<basename>.html
GATES: GI <n> cards ✓ · CG <n> steps ✓ · WO ✓ · syntax ✓ · ids ✓ · hooks ✓ · copyright ✓ · flow-probe ✓
INQUIRY: copy-polish only | trims: <what changed, or "none">
HERO: <one line — what the dots literally are>
NORM: <tokens added / dropped>
PITFALLS HIT: <watcher | early-return | async-boot | latch | data-answered | none>
DEVIATIONS: <forced deviations from the skills + why, or "none">
NOTES: <pre-existing defects found but NOT fixed (out of scope), or "none">
```

Report deviations honestly — they are how the skill files get better. If the skill text was ambiguous or wrong, quote the passage and say what you decided.
