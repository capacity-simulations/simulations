# QM Sim → User Version — all four layers, one sim, end to end (parallel-safe)

Turn ONE quantum-mechanics simulation in `Sims_user_versions/` into its **user
version**: welcome overlay (hero animation + three entry cards + read-aloud) →
guided-inquiry flow → controls-tutorial flow → card voiceover + Auto walkthrough.
Designed to run in many Cursor agent tabs at once — one agent per sim — so stay
strictly inside your assigned files.

The user names a sim (e.g. `Sims_user_versions/Harmonic-oscillator.html`).
You produce `Sims_user_versions/sim-use-builds/<same-basename>.html`.

## Ground rules (non-negotiable)

1. **Never modify the original sim.** `cp` it to `sim-use-builds/` first, then edit
   ONLY the copy. Other agents are editing sibling files concurrently — never run
   repo-wide formatters or cross-file search-and-replace.
2. **Copy-then-edit, small edits only.** Never rewrite a whole file in one write —
   use targeted string replacements.
3. **No git.** The user commits centrally after all agents finish.
4. **Don't touch physics.** The sim's kernel — wavefunction math, sampling,
   drawing, canvas loops — stays byte-identical apart from the sanctioned deltas
   below.
5. Scratch work goes in `$TMPDIR`, never in the repo.

## The specification (read these first — copy blocks, don't re-derive)

The skill bundle lives in `../Final_JEE_sims/Sim_use_version_skills/`:

- `guided-inquiry/SKILL.md` + `references/golden-flows.md` +
  `references/implementation.md` — the SME card grammar (FRAME + 3–5
  questions, classical baseline first, resolving answers, neutral stems,
  zero choreography prose; golden-flows.md is the canonical exemplar set)
  and the 🧭 button contract. implementation.md is mechanics-only.
- `controls-tutorial/SKILL.md` + `references/implementation.md` — §1–§4 the
  callout overlay + two-button template, **§6 the voiceover layer** (shared
  speech engine, Listen row, two-row nav, Auto, §6.5 Chrome TTS pitfalls —
  those defenses are load-bearing, copy them exactly).
- `welcome-overlay/SKILL.md` + `references/implementation.md` — hero canvas,
  three mode cards, Spotify-style read-aloud player.

**Validated exemplars — consult, don't re-derive:**

| Exemplar | Why it matters |
|---|---|
| `Sims_user_versions/sim-use-builds/infinite-potential-well.html` | **The QM pilot — your MECHANICS template.** All four layers on a QM sim, all gates passing. Copy its structure: standalone inquiry machinery, controller shape, voice engine placement, pill fix. Its CARD CONTENT (8 cards, forward-pointing feedback) predates the SME grammar — for what cards say, `golden-flows.md` governs. |
| `../Final_JEE_sims/Sim_use_version_skills/examples/Double-slit-experiment.welcome-cards.html` | Three base layers on a QM Three.js sim (predates the voice layer). |
| `../Final_JEE_sims/Module-01-Kinematics/C025-projectile-motion-ground-to-ground.html` | JEE reference for the **voice engine + Auto** (§6) — the validated source of `__makeCardVoice`. |
| `../Final_JEE_sims/Module-13-Optics/C203-refraction-and-snells-law.html` | JEE reference for the full four-layer C-series build. |

## ⚠ How QM sims differ from the JEE fleet (read before anything else)

1. **No shell.** QM sims have no `Shell`, no `Shell.init`, no `#shell-lecture`,
   no existing inquiry cards, no lecture mode. Do NOT hunt for them. The inquiry
   is **standalone**: you author `inqShow` / `stepReady` / `setupChoiceCard` /
   `applyStepReveals` / `onStep` yourself — copy the pattern from the pilot's
   controller script (it is ~200 lines and self-contained).
2. **You author the inquiry from scratch.** The JEE recipe's "copy-polish only"
   rule does not apply — there are no cards to polish. Author to the SME
   grammar (see "Inquiry authoring bar" below and `golden-flows.md`):
   baseline check → concept ladder → misconception table → card plan →
   affordance list → three red-team passes → copy. Never reuse another
   sim's concepts, misconceptions, or card copy.
3. **Heterogeneous ids.** Reset is `resetBtn` / `btnReset` / `reset` / absent;
   play is `startPause` / `playPause` / `btnPlay` / absent. Map THIS sim's ids
   first; wire `__fullReset` and the pause helper to what actually exists.
4. **The feedback pill** (`#qfbPill`, 6 sims). It is fixed bottom-right at
   z-index 99990 — above the template's overlay (5000) and exactly where the
   Controls Guide nav docks. If the sim has it, add the pilot's two-line fix:
   ```css
   .cg-nav{ bottom:74px; }
   body:has(#welcome-overlay:not(.hidden)) .qfb-pill{ display:none; }
   ```
5. **Theme.** Most QM sims are dark-only; some have `data-theme="light"`.
   The template CSS already targets both hooks — verify against the sim's
   actual toggle (`#theme-checkbox` where present) and screenshot both themes
   when a toggle exists.
6. **Three.js sims** (`Double_slit_exp_Measurement`, `Multi_Stage_Stern_Gerlach_New`,
   `Hydrogen_atom_wavefunctions`, `Spherical_harmonics_Explorer`,
   `Double-slit-experiment`): hoist DOM-only wiring and hook publication ABOVE
   any `if(!window.THREE) return;` guard, and publish safe no-op hooks on the
   guarded path. The browser probe needs the CDN reachable.
7. **FULL vs LIGHT tier.** Animated sims (a play/pause control exists) get all
   four layers. Static-plot sims (no play control) get welcome + controls
   tutorial + voice, and an inquiry ONLY if a genuine prediction exists against
   a slider (e.g. Bound_states: how many bound states fit as V₀ rises — good
   POE). Never pad weak cards to reach a count; if there is nothing honest to
   predict, delete the `inquiry` welcome card per the welcome SKILL's rule and
   say so in NOTES.

## Procedure

### 0. Copy + map
`cp Sims_user_versions/<sim>.html Sims_user_versions/sim-use-builds/`.
Map the sim: every control id and its effect, every readout, the play/reset
ids, theme hook, pill presence, CDN guards, and which panel could leak a
PREDICT answer (readouts like `Energy E:` — these get `hidden-until-step`).

### 1. CSS + variable bridge
Append before the LAST `</style>`: a `:root` bridge mapping the template's
variable names onto this sim's (`--accent → --accent-blue`, `--surface →
--panel-bg`, `--text → --text-main`, `--muted → --text-muted`, `--border →
--border-color`, …— copy the pilot's bridge and adjust), then the template CSS
block, then the §6 voice CSS. The `.cg-nav` two-row override must land AFTER
the base `.cg-nav` rule in the cascade.

### 2. Markup
- `.guide-actions` (`#btn-gi` boots `active`, `#btn-cg`) into the top bar,
  left of the sim's action buttons. Reuse the sim's own button class.
- Wrapper ids on any control/panel that lacks one (markup only).
- The inquiry zone (`#inq-zone`: head, `#inq-dots`, `#inq-cards` with your
  authored cards, the Listen row, `.inq-nav`) as the FIRST child of the
  sidebar itself — ABOVE any sim-native sidebar header ("CONTROLS"), so the
  visual order is: top bar → Guided Inquiry → CONTROLS → panels. This is
  the cross-course layout contract (identical in JEE/CM/PP/SR; see the
  guided-inquiry SKILL § layout contract). Give the zone its own padding
  (~14–20px) + bottom border + `flex-shrink:0` — copy the fixed pilot's
  skeleton and its `.sidebar > .inq-zone` rule.
- The welcome overlay as first child of `<body>` — ADAPT only `.welcome-name`
  (≤22ch), `.welcome-blurb`, the hero caption; the three `.wm-desc` strings
  are HOUSE COPY, never rewrite. Delete the `inquiry` card if this sim gets
  no inquiry (LIGHT tier without a prediction).

### 3. Scripts — order matters
Three `<script>` blocks before `</body>`, in this order:
1. **Voice engine** (`__makeCardVoice` + GI voice/Auto wiring) — from the
   pilot / C025. ADAPT only `norm()`: keep the general symbol floor (², ³,
   subscripts, °, −, ×, ·, —, ≈, whitespace), swap the token rules for THIS
   sim's symbols (ψ, ħ, π, Δx, ⟨x⟩, eV, nm…). Test `norm()` on the actual
   card text.
2. **Controller** (standalone inquiry + two-button template + Controls Guide
   with two-row nav + Auto) — copy the pilot's controller; ADAPT: the pause/
   setter helpers to this sim's ids, `applyStepReveals` selectors, `onStep`
   state pinning, `setupChoiceCard` calls (indices, correct index, feedback),
   the `cgSteps` array, `__fullReset` internals, the Reset listener id.
3. **Welcome overlay script** — ADAPT speech lines 1–2 (3–6 house copy) and
   `drawHero`: draw THIS sim's central idea from its own equations
   (transparent bg, theme-aware, rAF accumulation ~1–2 s, one frame under
   reduced motion, never loop). The pilot samples |ψₙ|² per band; find this
   sim's equivalent single picture. **No auto-start speech** — narration
   begins only from the play button (verify.js enforces `speak === 0` at load).

### 4. Controls Guide `cgSteps`
Every control and readout gets a step or a written in-code reason (meta-UI
only: info tooltip, theme toggle, the feedback pill). Top-bar → `veil`;
sidebar boxes → `hide`; canvas panels inside grid/flex rows → `veil` (a
collapsed track leaves a stale canvas backing store). Couple related controls
with `also`. ≤15 words per step. Closing card `sel:null`.

### 5. Verify — every gate must pass

The kernel gate runs FIRST — it proves the production sim is intact
(original scripts byte-identical, no id/canvas/text removed, styles
append-only). Any failure here means you edited the sim, not layered on it:

```bash
cd ../Final_JEE_sims/Sim_use_version_skills
node tests/kernel-diff.mjs '<abs original>' '<abs build>'
```

```bash
cd ../Final_JEE_sims/Sim_use_version_skills          # jsdom lives here
node guided-inquiry/scripts/verify.js    '<abs path to build>' --baseline '<abs path to original>'
node controls-tutorial/scripts/verify.js '<abs path to build>' --baseline '<abs path to original>'
node welcome-overlay/scripts/verify.js   '<abs path to build>' --baseline '<abs path to original>'
```

Then the layout gate (the inquiry must sit where every other course puts it
— right column, first block under the top bar, controls below):

```bash
node ../Final_JEE_sims/Sim_use_version_skills/tests/layout-probe.mjs \
  'Sims_user_versions/sim-use-builds/<basename>.html'
```

Then the real-Chrome flow probe (jsdom cannot see a boot exception that kills
both flows):

```bash
cd /Users/admin/Desktop/simulations-1 && python3 -m http.server 8734   # once
cd Final_JEE_sims && node tools/flow-probe.mjs <port> \
  "Capacity_Quantum_simulations/Sims_user_versions/sim-use-builds/<basename>.html"
```

Plus: `node --check` every inline script; unique ids (`btn-gi`, `btn-cg`,
`inq-voice`, `inq-auto`, `cg-auto`, `cg-rew`, `cg-fwd`, `cg-voice-play`,
`welcome-overlay` — exactly once each); hooks present (`__giVoiceStop`,
`safeCancel`, `engineDead`, `preferLocal`, `onCardDone`, `playLines`,
`__setMode`, `__fullReset`, `__giOff`, `__freeExplore`, `__giResume`,
`__cgReveals`); the original file unchanged. If the sim has a pill: open the
Controls Guide in the probe/screenshot and confirm the nav clears it.
**Never ship with a lowered bar** — if a gate can't pass, stop and say why.

## Inquiry authoring bar — the SME grammar (the part only you can get right)

**Canonical exemplars: `../Final_JEE_sims/Sim_use_version_skills/guided-inquiry/references/golden-flows.md`**
— ten flows by the senior physics SME, three of them for QM sims in THIS
course (Stern-Gerlach, Double-Slit Measurement, Multi-Stage SG). When these
rules and those flows disagree, the flows win.

- **Arc**: FRAME (physics-defining, ≤3 sentences, situating clause if a
  sibling sim exists) → Q1 = the classical/naive baseline → 2–4 chained
  questions. **4–6 cards total, hard max 6** — the SME's decks run 3–5.
- **Q1 asks what classical physics predicts** (classical smear, one-slit
  diffraction, "will it cross x = 0?"); the sim then breaks it. Must be
  answerable from prior intuition alone. Cold-open on the flagship predict
  only when it needs no sim vocabulary.
- **Question before observation — inviolable.** No card may run or show
  the phenomenon a later question asks about; if a draft deck watches
  first and asks second, move the question in front.
- **Each question changes exactly ONE apparatus element** vs the previous
  card and reads ONE countable observable ("how many regions are lit?").
  Ladder: baseline → mechanism → generalization → scaling. On a
  generalization question include ≥1 distractor consistent with the seen
  case (SG's 1/j vs 2j+1 both fit j = ½) so the sim must decide.
- **Questions test inference or representation-reading — never lookup,
  trivia, or UI operation.** Stems neutral: no classifying word that
  entails the answer. Choices are terse claims ≤ ~8 words; distractors are
  rival physical mechanisms. Fact questions stage leaking readouts with
  `hidden-until-step`; inference questions are immune to visible data —
  prefer the reframe over the hide.
- **Answers resolve on the spot**: 1–2 sentences naming the principle
  ("B. The magnetic field serves as a measurement device that collapses
  the wavefunction onto eigenstates of σ_z"). Claims strictly licensed by
  evidence shown so far — never over-claim. No forward-pointing feedback.
- **Tells only for naming/definitions**; behaviour is always asked.
  Trivia and glossary cards are deleted, not fixed.
- **Zero UI-choreography prose** ("Commit to…", "Your answer fires…",
  bold-control stage direction) — minimal imperatives naming physical
  objects; questions refer to physics objects, never UI objects.
- **Clean state between questions** (reset apparatus, quiet boot unless
  free exploration cannot decide a pending question); the card's
  observable is the hero graphic; affordance requests (source toggle,
  per-question reset, relocated pre-reveal text) are sanctioned, minimal,
  additive, and reported.
- Budgets: card ≤90 words pre-answer, choices 3–4, titles `N · topic`.
- Every factual claim checked against THIS sim's code (values, readout
  names, what actually changes on screen).

## Output contract

```
SIM: Sims_user_versions/<file>  →  Sims_user_versions/sim-use-builds/<file>
TIER: FULL | LIGHT (+ inquiry? yes/no + why)
GATES: GI <n> cards ✓ · CG <n> steps ✓ · WO ✓ · syntax ✓ · ids ✓ · hooks ✓ · flow-probe ✓
HERO: <one line — what the dots/curves literally are>
NORM: <tokens added / dropped>
PILL: <fixed | not present>
PITFALLS HIT: <three-js | id-map | theme | none>
DEVIATIONS: <forced deviations from the skills + why, or "none">
NOTES: <pre-existing defects found but NOT fixed, or "none">
```

Report deviations honestly — they are how the skills get better.
