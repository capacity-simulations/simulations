# The Physics sheet — AI-course variant

For the 137 lecture-list sims in `AI courses sims/<course>/courses/*.html`
(astro, EM, maths, thermal, waves; quantum is not in scope). Same product and quality
bar as the uni-lab sheet (`../SKILL.md`, `../references/content.md`, `../references/pitfalls.md`);
this note lists only what is different, and the kit that does the install.

## What is already in every AI sim (so do NOT patch anything)

The uni-lab skill's four structural patches are already done in these files:
- `#toggle-formal` "⚛︎ The Physics" button, whose click calls `window.__openPhysics()` (undefined until you install the layer, so the button is dead today);
- `window.__physicsHooks.scene(cfg)` — the See-it entry point;
- the STIX Two Text font link;
- one `<!-- PHYSICS_SHEET -->` marker (usually right before `</body>`).

The whole job is: **replace that marker with the layer.** Nothing else in the file
changes — `assemble_ai.py` proves it byte for byte.

## Two shell families — read the right scene API

| family | sims | how to tell | `scene(cfg)` keys | mirrored controls |
|---|---|---|---|---|
| **kit** | 80 (astro, EM, maths) | `window.__kit = {` present | the manifest param ids (`window.__SIM_MANIFEST.params[].id`); scene = Free Exploration defaults, then `setParam(id, v)` for each key; `launch`/`playing:true` start the clock | the params' `domId` inputs (`p-<id>`) |
| **legacy** | 57 (thermal `*.prebuild`, waves `*.polished`) | no `__kit`; a bespoke `function applyPhysicsScene(cfg)` | whatever that function reads — open it and use exactly its keys (e.g. `process`, `ratio`, `launch`) | the sim's own `<input type=range>` / `<select>` ids |

Both families: `scene()` first calls Free Exploration, which **resets every control to its
default** — so each SHOW entry must pass the current value of every control it should keep
(pitfall #6). `persim.js` gets `v` (current values keyed by DOM id) for exactly that.
The live panel mirrors any physics control the sim has (added 2026-09-30):
`{el:'id'}` for a range slider, select or checkbox; `{group:'<selector of the option buttons>', key}`
for a button group / segmented control (kit: `[data-kit-seg="<param>"] .kit-seg-btn`); `{radio:'<name>', key}`
for a radio group. Each mirror clicks or sets the sim's own control, so the sim's handlers run exactly as for
a student. A sim with button groups only is NOT a reason to hold it any more.

## Ground truth

1. **The course's Fermi Notes** — the PDF in the course folder. `pdftotext -layout` it once;
   `notes_anchors.json` (this folder) gives each sim's sections, pages, topic and "aha" line.
   The sheet must agree with the notes and **use their symbols and the sim's labels**. Never
   introduce a new symbol or rename one (SME rule); if the notes and the sim disagree, stop and
   report it — do not pick one.
2. **The sim itself** — the Info modal ("On screen / Controls / Measured"), the readouts, the
   physics code (`derive`/`advance` in kit sims, `physicsAt`/`__audit` in legacy ones). Every
   number the sheet prints is recomputed from that code, and at least one is checked against
   the sim's own readout in the browser.
3. **The Guided Inquiry cards** — the sheet must never contradict a card or its feedback.

## Lessons from the uni-lab audit (116 sheets, 696 findings) — design them out

- Don't cite UI the sim doesn't show (check every control/readout name against the page).
- "Defaults" in the sheet = the sim's actual opening state (read the manifest/slider values).
- Figure directions (rotation sense, field lines, sign of a slope) are the most common error — compute, then assert in `spec.py`.
- Wrong physics in prose was the #2 finding — recompute every number, check every claim against the notes.
- ch 04 was often thin — it must carry a real conceptual twist from the notes.
- The kicker line leaks answers easily: it names the topic, never the result.

## Guided-Inquiry safety (built into the layer — keep it)

While the inquiry cards are on screen, every See-it is paused and a note says why (the
sheet discusses the answers; a See-it would jump the scene past the current card). The
sheet itself and the live panel stay usable. In the Controls Guide a See-it first steps
out to Free Exploration. Esc closes only the sheet. The sheet sits above the header
(z-index 6200 > header 3000, tour 4000, welcome 5000).

## Workflow per sim

Work outside the repo: `WORK=<scratch>/physics-ai/<slug>`.

1. **Recon** — family, controls (ids, min/max/step, defaults), scene keys, readouts, the
   Info modal, the GI cards, notes sections (`notes_anchors.json` + the PDF text).
2. **Author** in `$WORK`:
   - `spec.py` — `EQS` (LaTeX, notes' notation) + `DIAGS` (3 TikZ figures computed from the
     sim's defaults, with asserts). Render: `python3 ../scripts/gen_assets.py $WORK/spec.py $WORK/assets_build`.
     **Look at every PNG** (pitfall #7).
   - `article.html` — lede + 7 chapters exactly as `content.md`, with `{{EQn}}`/`{{Dn}}` tokens.
     ch 03 must contain the live panel:
     ```html
     <div class="live-panel" id="phys-live">
       <div class="live-num" id="phys-num"></div>
       <div class="live-sub" id="phys-sub"></div>
       <div class="phys-mini" id="phys-mini"></div>
       <p class="live-hint">These are the sim's real controls — move them here and the sim follows.</p>
     </div>
     <ul class="pts"><li>…</li><li id="phys-worked"></li></ul>
     ```
     See-it buttons: `<button class="shell-btn seesim" data-show="key">▶ See it in the sim — …</button>`.
   - ch 07 is the self-test: exactly 3 `<details class="phys-q"><summary>question</summary><p class="ans">answer</p></details>`
     (a degenerate case, a scaling question, the conceptual question) — never a bullet list with the answers
     showing. The installer and the browser gate both enforce this.
   - `persim.js` — only `MINI`, `LIVE(v)`, `SHOW(v)` (contract in the template's PER-SIM
     comment). Helpers available: `fmt(x,d)`, `sci(x,d)`. No `</script>` in strings.
   - `meta.json` — `{"topic","kicker","title","slug"}`; `title` = the sim's title, `slug` = file stem.
3. **Assemble (dry)**: `python3 assemble_ai.py <sim.html> $WORK` → `$WORK/built.html`.
4. **Browser gate on the dry build**: `node browser_test_ai.mjs $WORK/built.html $WORK/shots`
   must print `RESULT PASS`. Then **look at** `sheet-dark.png`, `sheet-light.png`,
   `gi-paused.png` and every `seesim-*.png` — does each scene show what its chapter claims?
5. **Install**: `python3 assemble_ai.py <sim.html> $WORK --apply`, re-run the browser gate on
   the real file, and the Guided-Inquiry reset regression:
   `node gi_reset_test.mjs <listfile> 4` → `PASS n FAIL 0`.
6. **Report** per sim: family, notes sections used, numbers checked (sheet vs code vs readout),
   screenshots looked at, anything held (a physics or notation question for the SME).

Re-installing after an edit: `assemble_ai.py … --apply --replace` (cuts the old layer out
first; the guard then compares against the layer-free file).

## Files here

- `layer.ai.html` — the template (machinery + PER-SIM zones).
- `assemble_ai.py` — fill, install at the marker, guard + static checks.
- `browser_test_ai.mjs` — 20+ checks incl. GI pause, two-way live binding, See-its, Esc, theme, download.
- `gi_reset_test.mjs` — Guided-Inquiry Reset regression (fleet S1 fix).
- `notes_anchors.json` — each sim's notes sections, topic, aha line.
