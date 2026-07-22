# Cursor Implementation Prompts — Finalized Sim Changes

Ready-to-paste Cursor prompts for implementing the changes in `To_do_finalized_sims.md`.
Each prompt is tagged with its shell file (`Lxx-sy`) for quick lookup in this folder.
Prompts are added one at a time as they are reviewed.

---

## `L02-s1` · Inner product
**Shell file:** `L02-s1-inner-product-shell.html`
**To-do item:** #2 (Needs refactor) — expand into the combined "coordinates → vectors → inner product" base sim (absorbs L01-s2, L04-s1, L04-s2).

````markdown
# Refactor L02-s1 (Inner Product) into the combined "coordinates → vectors → inner product" base sim

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L02-s1-inner-product-shell.html`

This sim already works (two vectors A, B; rotate S′ by θ; watch components change while |A|, |B|, A·B stay fixed). We are **expanding its stage progression and adding two display controls** so it absorbs the "Different Coordinate Frames" (L01-s2), "Scalars vs vectors" (L04-s1), and "Euclidean space & metric" (L04-s2) sims. Physics correctness has been iterated over many rounds across all sims — **do not regress it**.

## HARD CONSTRAINTS — read first, do not violate

1. **Do NOT edit the shell runtime** (the `<script>` block labelled "SHELL RUNTIME — emit VERBATIM", ~lines 635–838) or any shell CSS above the `SIM CSS` marker. Only touch: the SIM CSS block, the SIM markup inside `<main>`/`<aside>`/`.shell-formal`, and the SIM `<script>` IIFE (starts ~line 842).
2. **Preserve the physics formulas exactly.** Passive rotation of components stays `x' = x·cosθ + y·sinθ`, `y' = −x·sinθ + y·cosθ`. Keep computing each frame's inner product and norms **independently** from that frame's own components (never copy S's value into S′). The equality must remain an emergent result, not an assignment.
3. **Keep and extend the `window.__audit` hook.** It must still expose `dot`, `norm`, `rotatedDot`, and you must add the new invariants below. This is how physics is verified — it must stay green.
4. **The two-panel engine, θ slider, auto-rotation (`onFrame`), drag-to-edit, guided-inquiry stepper, snapshots (`stepSnapshots`/`onStep`), and KaTeX rendering must keep working** after the refactor.
5. No new external dependencies. Vanilla JS + existing KaTeX only.

## Naming
- Rename all **on-screen labels / captions / hero text** from `A`,`B` to **`V`** (blue `#60a5fa`, = old A) and **`u`** (amber `#f59e0b`, = old B). You may keep internal state keys as-is to reduce churn, but nothing user-visible may say "A"/"B". Update the `Notation` and `Formal tools` blocks to match (V, u).

## New 4-stage progression (replaces the current 3 stages)
Replace the `1 · Vectors / 2 · Components / 3 · Inner product` buttons and their `.stage-N` CSS with **four** stages. In every stage, S is fixed and S′ is rotated by θ (and optionally translated — see below); coordinates are shown in **both** frames, in the same on-screen readout style already used here.

- **Stage 1 — Point P.** Draw a single draggable **point P** (no arrow). Show its coordinates as `(x, y)` in S and `(x′, y′)` in S′. Teaches: same point, two different number-pairs. (This is the L01-s2 visual.)
- **Stage 2 — Vector V, tail at origin.** Add draggable arrow **V** from the origin. Readout shows V's components in both frames (they differ) and **‖V‖** (same in both). Teaches: components are frame-dependent, norm is invariant.
- **Stage 3 — Vector V, tail NOT at origin.** Make **both the tip and the tail** of V draggable (tail defaults off-origin). Show tip and tail coordinates in both frames, the components as `tip − tail`, and ‖V‖. Teaches: ‖V‖ is invariant even when the vector isn't rooted at the origin.
- **Stage 4 — Two vectors u and V, tails at origin.** Show both arrows, both component sets, both norms, and the **inner product u·V** in both frames (this is today's stage-3 behaviour, relabelled). Teaches: inner-product invariance.

Update `applyStage()`, the `.stage-N` CSS visibility rules, the stage buttons markup, and the guided-inquiry `applyStepDefaults()`/`onStep` stage mapping to cover 4 stages. Keep the existing pattern of CSS-class-driven readout-row visibility.

## Control 1 — "Include calculation" checkbox (new)
Add a checkbox in the Controls panel, default **unchecked**.
- **Unchecked (clean default):** show **only the invariant quantities** — ‖V‖ (and ‖u‖, and u·V at stage 4) — laid out compactly, matching the "Scalars vs vectors" (L04-s1) invariant-chip style. Hide all component numbers and the `√(…)` / `(..)(..)+(..)(..)` expansions.
- **Checked:** reveal the full breakdown (per-frame components, the norm `√(…)` expansion, and the dot-product expansion) — i.e. today's detailed readout.
- Drive this with a class on `simRoot` (e.g. `calc-on`/`calc-off`) so it composes with the `.stage-N` classes via CSS, consistent with how staging already works. The invariant quantities stay pinned **below each frame** in both modes.

## Control 2 — Translate the S′ origin (new, physics-critical)
Add a control to **translate the origin of the S′ frame** by `(tx, ty)` (two small sliders, or drag the S′ origin). This folds in L04-s2 (invariance under translation as well as rotation).

**Physics that MUST be correct (this is the whole point of the stage):**
- **Point P** (Stage 1): its S′ coordinates are `R(θ)·(P − t)` where `t=(tx,ty)` — i.e. translation **does** change a point's coordinates.
- **Vector components** (Stages 2–4): a vector is a difference of two points, so **translation cancels — vector components and ‖V‖, u·V depend on θ ONLY, never on `(tx,ty)`.** Do not apply the translation to vector components. Showing that points move but vectors/inner-products don't is the pedagogical payload; getting this wrong is a physics regression.
- Build this so both a **with-translation** and a **without-translation** version can be evaluated: gate the control behind a single constant (e.g. `const ENABLE_ORIGIN_TRANSLATION = true`) and default the offset to `(0,0)` so the "without" experience is the clean baseline. Note in a comment that the manager will pick which ships.

## Extend the audit hook
In `window.__audit`, keep `dot`, `norm`, `rotatedDot`, and add:
- `pointCoords(P, thetaDeg, tx, ty)` → S′ coordinates of a point (rotation **and** translation).
- `vectorComponents(tip, tail, thetaDeg, tx, ty)` → S′ components; **must return the same value for any `tx,ty`** (assert translation-independence).
- `rotatedDot`/`norm` must remain translation-independent. Add an inline comment giving a worked example (e.g. V=(3,4), u=(4,−1): u·V=8 for every θ and every translation).

## Acceptance / self-check before you finish
1. Open the file in a browser: all 4 stages switch cleanly; θ slider + auto-rotate still work; dragging P, V's tip, V's tail, and u all work in both panels.
2. Toggle "Include calculation" on/off at each stage — layout stays intact, invariants remain visible below each frame.
3. With translation enabled: sweeping `tx,ty` visibly moves P's S′ coordinates but leaves **all** vector components, norms, and u·V unchanged (to displayed precision). Sweeping θ leaves norms and u·V unchanged.
4. In console: `__audit.rotatedDot([3,4],[4,-1], k)` is constant for many k; `__audit.vectorComponents` is invariant under `tx,ty`.
5. No console errors; KaTeX in Notation/Formal renders; guided-inquiry Next/Prev and Reset restore state correctly.
6. Confirm you did not modify the shell runtime block or shell CSS.

Make the changes surgically and keep the existing code style (IIFE, `el()` helper, `fmt()`, canvas `drawPanel`/`render` split).
````

---

## `L08-s2` · Spacetime diagram explorer
**Shell file:** `L08-s2-spacetime-diagram-explorer-shell.html`
**To-do item:** #5 (Needs refactor) — pair-selection interval explorer.
**Decision (agreed):** *Hybrid events* — free-explore/lecture opens with just E₁ + E₂; the guided inquiry spawns E₃/E₄ on the steps that need them, preserving all current pedagogy.
**Scope note:** the "make L5 and L8 one sim / hide SL·TL·null labels" work lands on **L05-s2**, not this file. Do not touch cross-sim consistency here.

````markdown
# Refactor L08-s2 (Spacetime diagram explorer) — open with two events, keep the rich inquiry

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L08-s2-spacetime-diagram-explorer-shell.html`

This sim already implements the pair-selection interval layer (select two events → Δs² + timelike/null/spacelike classification, with a light cone that follows the reference event). We are making ONE behavioural change — the default number of events — using a **hybrid** approach that keeps the existing 5-step guided inquiry (reception-time vs coordinate-time, and "simultaneous ≠ seen together") fully intact. Physics correctness has been iterated over many rounds — **do not regress it**.

## HARD CONSTRAINTS — read first, do not violate

1. **Do NOT edit the shell runtime** (the `<script>` block that starts `const Shell = (function(){ … })();`, roughly lines 563–763) or any shell CSS. Only touch the SIM CSS block, the SIM markup, and the SIM `<script>` code below the shell.
2. **Preserve the physics exactly. Do not change any of these functions' math:**
   - `interval(a,b)` (L776): `Δs² = Δct² − Δx²` (signature: timelike ⇒ Δs² > 0).
   - `classify(ds2)` (L777): `|Δs²| < 0.06 → lightlike; > 0 → timelike; < 0 → spacelike`.
   - `drawLightCone()` (L890): ±45° lines `ct − ct₀ = ±(x − x₀)`.
   - Reception time `ct_rec = ct + |x|` (in `drawSignals`, and the `recv` equation).
   - Proper time `Δτ = √(Δs²)` for timelike pairs (in `updatePairInfo`).
3. **The pair-selection + classification layer and the light-cone-follows-reference behaviour must keep working** (single-click classifies against the reference; double-click re-bases the cone; `refEvent()` = `selection[0]`).
4. The θ-less canvas engine, drag-to-move events, light-signals toggle, guided-inquiry stepper, and per-step snapshots (`stepSnapshots`/`onStep`/`saveStepState`/`restoreStepState`) must all keep working.
5. No new external dependencies. Vanilla JS + existing KaTeX only.

## The one change: hybrid event defaults

**Target behaviour:**
- **Fresh load / lecture open / free-explore (inquiry finished or not on a step that needs more):** exactly **two** events — **E₁ at (0, 0)** and **E₂** off-origin (keep the current `(3, 1)` — a spacelike separation, good for "drag me"). The reference is E₁; dragging either event live-updates Δs² and the classification; the light cone follows E₁.
- **Guided inquiry:** the steps that reference E₃/E₄ **spawn them on entry** and position them exactly as the current per-step layout does, so the reception-time and simultaneity teaching is unchanged.

**Code touch-points (all in the SIM block):**

1. **`defaultEvents()` (L791)** — return only E₁ `{x:0, ct:0}` and E₂ `{x:3, ct:1}`. Drop E₃/E₄ from the default. Keep their colours/names for when they're re-created.
2. **Base state / `onReset()` (L1281)** — set `nextId = 3` and `selection = [1]` for the two-event base. `onReset` still calls `applyStepDefaults(Shell.step)`, which will re-materialize E₃/E₄ when the current step needs them.
3. **`applyStepDefaults()` (L1246)** — today it assumes `getEv(2/3/4)` exist. Change it to **create-if-missing** (E₃ as id 3, E₄ as id 4, with their original names/colours) for the branches that use them, and to **remove E₃/E₄** for the base/free branch so free-explore shows only E₁+E₂. Keep every existing position it sets (the same-ct E₂/E₃ layout, the reception layout, the classification layout) byte-for-byte — that layout is physics-tuned.
4. **`addEvent()` (L1124)** — the `k = id - 5` indexing into `positions`/`palette` assumes user events start at id 5. Rebase it (e.g. index by `S.events.filter(e=>e.user).length`, not `id-5`) so it stays correct now that ids 3/4 are reserved for inquiry events. Mark user-created events with `user:true`.
5. **Delete gate in `updateEventsList()` (L1103)** — replace the `ev.id >= 5` test with `ev.user` so E₁/E₂ (locked) and the inquiry-managed E₃/E₄ are not user-deletable, while user-added events are.
6. **Guided-inquiry card markup (steps 1–5)** — leave the text as-is; it references E₂/E₃/E₄ which will exist during those steps. Just verify step 1 spawns E₃ and step 2 spawns E₄.

## Add a physics-verification hook (new)

This sim currently has no `window.__audit`. Add one for machine-checkable physics (mirrors the other sims):
```js
window.__audit = {
  interval: (a,b) => (b.ct-a.ct)**2 - (b.x-a.x)**2,      // Δs² , timelike ⇒ >0
  classify: ds2 => Math.abs(ds2)<0.06 ? 'lightlike' : (ds2>0?'timelike':'spacelike'),
  reception: ev => ev.ct + Math.abs(ev.x),               // ct_rec = ct + |x|, c=1
  // Δs² and its classification are Lorentz-invariant: boosting both events by β leaves them unchanged.
  boostInvariant: (a,b,beta) => {
    const g=1/Math.sqrt(1-beta*beta), L=e=>({ct:g*(e.ct-beta*e.x), x:g*(e.x-beta*e.ct)});
    const i0=(b.ct-a.ct)**2-(b.x-a.x)**2, A=L(a),B=L(b), i1=(B.ct-A.ct)**2-(B.x-A.x)**2;
    return {before:i0, after:i1, invariant: Math.abs(i0-i1)<1e-9};
  }
};
```

## Acceptance / self-check before you finish
1. Fresh load and Reset (with the inquiry finished/collapsed) show **exactly E₁ and E₂**; dragging either updates the Δs² readout and classification; the light cone follows E₁; double-click re-bases the cone.
2. Step through the guided inquiry: step 1 shows the same-ct E₂/E₃ pair; step 2 adds E₄ against E₁'s cone; steps 3–5 behave exactly as before. Prev/Next and Reset restore state correctly.
3. `＋ Add event` creates a deletable user event with a sane position; E₁/E₂ (and inquiry E₃/E₄) show no ✕.
4. In console: `__audit.boostInvariant({x:0,ct:0},{x:3,ct:1},0.6).invariant === true`; `__audit.classify(__audit.interval({x:0,ct:0},{x:3,ct:1}))` returns `'spacelike'`.
5. No console errors; the five physics functions in the do-not-touch list are unchanged; the shell runtime block is untouched.

Make the changes surgically and keep the existing code style (top-level functions, `S` state object, `w2p`/`p2w`, `drawAll`/`render` split).
````

---

## `L11-s2` · Light clock & geometric derivation of time dilation
**Shell file:** `L11-s2-light-clock-and-geometric-derivation-of--shell.html`
**To-do item:** #6 — reframe as two clocks in one frame (Alice at rest, Bella moving).
**Context:** the "new 3D one" referenced in the notes is `L11-s1-Time-dilation-train-paradox-shell_updated.html`; this 2D geometric sim stays and gets the tweaks below.

````markdown
# Refactor L11-s2 (Light clock) — two clocks in one frame: Alice (at rest) vs Bella (moving)

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L11-s2-light-clock-and-geometric-derivation-of--shell.html`

The sim currently shows a split screen: a left "REST FRAME" panel (clock at rest, vertical bounce, proper time t₀) and a right "LAB FRAME" panel (clock moving at v, diagonal path), separated by a vertical divider. Per Lecture 11a we are re-presenting this as **one frame — Alice's frame — containing two clocks:** Alice's clock at rest and Bella's clock moving through it. This is a **relabel + presentation** change plus one animation tweak. The math is untouched.

## IMPORTANT — how to work on this task
- **Do NOT spin up an HTTP server, headless browser, or any browser-automation/screenshot loop.** (That is slow and unnecessary here.) Implement the changes and verify by static reasoning + the `node --check`/console checks in the last section. The user will test visually in the browser afterwards.
- Keep changes surgical; match the existing code style.

## HARD CONSTRAINTS — physics must not change
Do **not** alter any of the pixel-kinematics that encode the physics — they make both light pulses move at the same on-screen speed (c) while the moving pulse's path is longer:
- `gammaOf(b) = 1/√(1−b²)`.
- Rest pulse half-trip time `T0/2` (`restY`); moving pulse half-trip time `γ·T0/2` (`movePos`, `drawMove`'s `half=L.gamma*T0/2`).
- Horizontal advance per half-trip `base = β·γ·h_px` (in `layout()`).
- The right-triangle geometry in `drawMove` (points A/B/C/D, legs `h` and `vt/2`, hypotenuse `ct/2`) and the result `t = γ t₀`.
- The `window.__audit` hook (`at(beta) → {gamma, dilatedTime}`) stays.
Also do not touch the shell runtime block or shell CSS. Only edit the SIM CSS, SIM markup, and the SIM `<script>` IIFE.

## Change 1 — Relabel to Alice / Bella (single frame)
Replace the "rest frame / lab frame" language with the lecture's Alice/Bella framing, keeping the colours (Alice = cyan `#22d3ee/#67e8f9`, at rest; Bella = amber `#fbbf24`, moving):
- Canvas headers (in `draw()`, ~L903–904): `'REST FRAME · clock at rest'` → **`'ALICE · clock at rest'`**; `'LAB FRAME · clock moves at v →'` → **`'BELLA · clock moving at v →'`**.
- Update the other user-visible "rest frame / lab frame" strings for consistency, preserving physical meaning (v is **Bella's speed in Alice's frame**; t₀ is the **proper time of the at-rest clock**): the v-slider label `'v (clock speed, lab frame)'` and its title (~L505/511), the notation list item (~L561), and the inquiry card wording that says "in the clock's rest frame" / "in the lab frame" (~L463/468). Do **not** change the equations or the meaning of t₀, t, v, γ.
- The stage-1 button can stay labelled "Rest clock" (it's the construction-stage name), but if you relabel it, keep it short.

## Change 2 — Remove the divider (one continuous frame)
In `draw()` (~L889–899) remove the panel split so it reads as a single frame: delete the two background tint fills (`fillRect(0,0,divX,h)` cyan and `fillRect(divX,0,…)` amber) and the vertical boundary line(s) at `divX`. Keep both clocks where they are (Alice's at `rx`, Bella's starting near `A_x`); they now simply share one frame. You may keep `divX` in `layout()` if other code references it, but nothing should draw a divider.

## Change 3 — In "Rest clock" (stage 1), let Bella's clock run until off-screen before looping
Only in **stage 1**, Bella's moving clock should keep bouncing and translating rightward across the whole (now undivided) frame until it exits the right edge, then loop — so the longer path of the moving clock is visible over several bounces. In **stages 2–5 the current single-round-trip behaviour must stay** (the triangle/Pythagoras construction depends on one round trip from `A_x` to `A_x+2·base`).

Implementation notes:
- `movePos()` currently does `cyc=(tAnim/half)%2` and its vertical formula `y = k===0 ? (y_b−f·h) : (y_t+f·h)` only handles `cyc ∈ [0,2)`. For the stage-1 free-run, let `cyc` grow unbounded and generalise the bounce parity to `k%2` (`y = (k%2===0) ? (y_b−f·h_px) : (y_t+f·h_px)`), with `x = A_x + base·cyc`. When `x` passes the right edge (e.g. `> w − rightMargin`), reset the animation clock so it loops from the start.
- Keep `base` and `half` exactly as defined (unchanged pixel-speed and γ-timing) — only the loop point and the parity generalisation change.
- Do not apply the free-run to stages 2–5; gate on `state.stage===1`.

## Verification (NO browser / NO server)
1. `node --check` on the inline script passes (extract the `<script>` block and check syntax).
2. In the console after load (user will do this, but reason it through): `__audit.at(0.6).gamma === 1.25` and `dilatedTime === 1.25`; the do-not-touch kinematics values (`base`, `half`, `gammaOf`) are unchanged from before.
3. Static self-review: confirm `base=β·γ·h_px` and the `γ·T0/2` half-trip are untouched; confirm the divider draw calls are gone; confirm the free-run branch is gated to `state.stage===1` and stages 2–5 still wrap at one round trip; confirm no remaining user-visible "rest frame"/"lab frame" text.
4. Do not modify the shell runtime block or shell CSS.

Leave visual/interaction testing to the user.
````

---

## `L05-s1` · Frame clock & event time
**Shell file:** `L05-s1-frame-clock-and-event-time-shell.html`
**To-do item:** #7 (Small change) — remove the "light path" option.

````markdown
# L05-s1 (Frame clock & event time) — remove the "Light path" option

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L05-s1-frame-clock-and-event-time-shell.html`

Remove the optional "☀ Light path" toggle and everything it drives. It draws a dashed line from each event to the origin, captioned "light signal toward origin (**not used for time-stamping**)" — it is a cosmetic annotation with **no** role in the physics (coordinate time is frame-wide, not light-delayed; the light-delay idea is deliberately only the wrong prediction choice B). This is a small, surgical decluttering change.

## HOW TO WORK — no browser testing
- **Do NOT spin up an HTTP server, headless browser, or screenshot/browser-automation loop.** Implement the edit and verify with `node --check` + static review only. The user tests visually afterwards.

## HARD CONSTRAINTS — don't break anything else
1. **Do NOT touch the shell runtime block** (`SHELL RUNTIME — emit VERBATIM`, ~L553+) or the shell CSS. Only edit the SIM markup, SIM `<script>`, and (optional) the info-modal text.
2. **Do NOT change any physics or other feature.** Leave untouched: the S′ Lorentz transform (`xp=gam*(ev.x - st.v*ev.t)`, `tp=gam*(ev.t - st.v*ev.x)`), event stamping/coordinate-time logic, the **S′ grid toggle** (`showSp`), the velocity slider, event placement/drag, the guided inquiry, and the `window.__audit` hook (~L1070) — keep it exactly as is.
3. This is a pure removal — do not rename or restyle unrelated controls.

## Exactly what to remove (all `showLight` / `lightBtn` / `light-toggle` usage — 11 `showLight` refs + button + handle)
1. **Button markup** (~L526): delete `<button id="light-toggle" class="shell-btn">☀ Light path</button>`.
2. **State** (~L771): remove the `showLight:false` field from the state object.
3. **Event drawing** (`drawEvents`, ~L967–971): delete the `if(st.showLight){ … dashed line to origin … }` block.
4. **Bottom caption** (~L882–888): the current `if(st.showLight && st.events.length){ …light caption… } else if(st.events.length===0){ …click-to-place hint… }` — remove the light-caption branch but **keep the empty-state hint**, i.e. reduce it to `if(st.events.length===0){ …click to place event E₁… }`. Do not lose that hint or the max-events hint below it.
5. **Control handle + listener**: remove `const lightBtn=document.getElementById('light-toggle');` (~L1027) and its `lightBtn.addEventListener('click', …)` block (~L1044–1045).
6. **onReset** (~L1055, L1060): remove `st.showLight=false;` and the two `lightBtn.…` reset lines.
7. **Step snapshots**: remove `showLight` from `saveStepState` (~L1102) and from `restoreStepState` (~L1114), and delete the `lightBtn.classList.toggle(...)` / `lightBtn.textContent=...` restore lines (~L1121–1122).
8. **applyStepDefaults / other reset path** (~L1133, L1143): remove `st.showLight=false;` and the `lightBtn.…` lines.
9. **Info-modal pedagogy text** (~L377, L385): update the two rows that mention the light path so they don't reference a removed feature — e.g. A2 "S′ grid and the light path appear only on their own toggles" → "S′ grid appears only on its own toggle"; D6 "S′ and light path are additive layers…" → "S′ is an additive layer…".

After editing, grep the file for `showLight`, `lightBtn`, and `light-toggle` — there should be **zero** remaining occurrences.

## Verify (no browser)
1. `node --check` on the inline script passes.
2. `grep -n 'showLight\|lightBtn\|light-toggle'` returns nothing.
3. Static review: the empty-state "click to place event" hint and the max-events hint still render; the S′-grid toggle, slider, Lorentz math, guided inquiry, and `__audit` are unchanged; shell runtime block untouched.

Keep the change minimal and match the existing code style.
````

---

## `L05-s2` · Spacetime diagram explorer
**Shell file:** `L05-s2-spacetime-diagram-explorer-shell.html`
**To-do item:** #8 (Small changes).
**Lecture grounding (Lecture 5 — Spacetime):** the lecture introduces the **spacetime interval between events** as the spacetime analog of distance, and defers the causal classification (timelike / spacelike / null) to **Lecture 8 (Light Cone)**. So this sim should show **Δs as a value only, with no TL/SL/null labels** — exactly the manager's note.

````markdown
# L05-s2 (Spacetime diagram explorer) — Lecture-5 small changes

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L05-s2-spacetime-diagram-explorer-shell.html`

Apply the six small changes below. This is the Lecture-5 explorer: reading events and separations (cΔt, Δx) off ONE spacetime diagram — **no Lorentz transforms**, and (per Lecture 5) the spacetime interval Δs is shown as a magnitude with **no causal classification** (timelike/spacelike/null is a Lecture-8 concept).

## HOW TO WORK — no browser testing
- **Do NOT spin up an HTTP server, headless browser, or screenshot/automation loop.** Implement and verify with `node --check` + `grep` + static review only. The user tests visually afterwards.

## HARD CONSTRAINTS — don't break physics or anything else
1. **Do NOT edit the shell runtime block or shell CSS.** Only the SIM CSS, SIM markup, and SIM `<script>`.
2. **Do NOT change the coordinate/geometry math:** `computeGeo`, `toPx`, `toData`, `clip`, `normalizeWL` (time-forward worldline convention), and the separation reads `cΔt = b.ct−a.ct`, `Δx = b.x−a.x`. This sim has no Lorentz transform — do not add one.
3. Keep the existing readout badge logic (Same / Simultaneous / Δt=0 / Co-located Δx=0 / Neither) — that is a Δt/Δx classification, **not** the forbidden causal (TL/SL/null) classification. Leave it.
4. Scope: these are the Lecture-5 small changes only. The larger "merge L5 and L8 into one layered sim / hide SL·TL·null" consolidation is a separate future effort — **do not attempt it here**.

## Change 1 — Remove E3 (start with two events)
- `resetState()` (~L805): `const e1=pushEvent(-1,2), e2=pushEvent(2,2); pushEvent(-1,5);` → remove the third `pushEvent(-1,5)` so only **E1(-1,2)** and **E2(2,2)** exist; keep `selectedPair=[e1.id,e2.id]`.
- Inquiry card that references E₃ (~L461: "Click E₁ then E₃ … co-located … drag E₃"): rewrite to use **E₁ and E₂** and dragging — e.g. "E₁ and E₂ start on the same ct (Δt = 0, simultaneous). Drag **E₂** so it shares E₁'s x — now Δx = 0 and they're co-located; the connector runs vertically." (Preserve the simultaneity + co-location teaching with just the two events.)
- Info-modal pedagogy row (~L395: "E₁, E₂, E₃ are drawn…") → "E₁, E₂ are drawn…".

## Change 2 — Remove the "a.u." units
Delete the `a.u.` unit text everywhere it appears; leave bare axis names and numbers (natural units, c = 1):
- Canvas axis labels (~L918, L920): `'x  (a.u.)'` → `'x'`, `'ct  (a.u.)'` → `'ct'`.
- Readout chips (~L1124–1125): drop the trailing `' a.u.'` from the `cΔt` and `Δx` chips.
- Readout note (~L1128): `'frame S · c = 1 · a.u. = arbitrary units'` → `'frame S · c = 1'`.
- Help/pedagogy text mentioning a.u. (~L387, L478): remove the "a.u." wording.

## Change 3 — Remove the gray box (let the canvas fill)
- `#stcanvas` CSS (~L315–316): remove `border:1px solid var(--line);` (and the `border-radius:8px;`) so the canvas fills its space with no boxed outline. Keep `background`, `width/height:100%`.

## Change 4 — Fix mismatched fonts (canvas should match the UI)
The canvas hardcodes `'Inter'` in every `ctx.font`, but the UI uses `--font-sans:'DMSansUser',…` and `--font-nums:'JetBrains Mono',…` (Inter isn't even loaded → it falls back to a different sans). Replace the canvas font family to match the design system:
- For text labels (axis names, event labels, badges): use `"DMSansUser, 'DM Sans', sans-serif"` (matches `--font-sans`).
- For pure numbers (axis tick numbers, coordinate/Δ readouts drawn on canvas): use `"'JetBrains Mono', ui-monospace, monospace"` (matches `--font-nums`).
- Keep every existing size/weight; only change the family. (There are ~10 `ctx.font='… Inter'` sites — update all.)

## Change 5 — Sweeping "now" line OFF by default, with a toggle
Currently `onFrame` always advances `nowCt` and `drawNow()` always runs.
- Add state `showNow` (default **false**) alongside the other state vars; initialise it in `resetState()`.
- Gate the render: in `draw()` (~L860) call `drawNow()` only `if(showNow)`.
- Gate the sweep: in `onFrame` (~L1211) advance `nowCt` only when `showNow` is true; otherwise just `draw()` (static diagram). Keep Play/Pause working.
- Add a toggle button in the Controls (next to the `mode-worldline` button), e.g. `⏱ Now line`, that flips `showNow`, toggles its `.active` class, and redraws. Reset it in `resetUI()`.
- Thread `showNow` through `saveStepState`/`restoreStepState` (like `nowCt`/`worldlineMode`) so guided-inquiry stepping preserves it.

## Change 6 — Add a Δs readout (no classification) + Δs on the triangle at Layer 3
Show the spacetime interval **as a magnitude only** — this is convention-independent and inherently omits the timelike/spacelike/null distinction (which is exactly what Lecture 5 wants deferred).
- Compute `ds = Math.sqrt(Math.abs(cdt*cdt - dx*dx))` (with `cdt=cΔt`, `dx=Δx`, c = 1).
- **Readout strip:** add a `Δs = <ds, 1 decimal>` chip next to the `cΔt` / `Δx` chips in `updateReadout()`. No "timelike/spacelike/null" wording anywhere.
- **On the triangle:** in `drawTriangle()` (only reached at `currentLayer>=3`, "3 · Separation"), draw a `Δs = <value>` label near the midpoint of the hypotenuse A→B (offset so it doesn't overlap the connector's own label). Match the triangle's existing label style/colour.
- Do **not** add any interval-sign or causal wording. (If a signed Δs² is ever wanted later, it must follow the Lecture-5 convention `Δs² = Δx² − (cΔt)²` and be reconciled with the L08 sims — but that is out of scope here; the magnitude sidesteps it.)

## Add a physics-verification hook (new — none exists)
Append near the end of the SIM IIFE:
```js
window.__audit = {
  separations: (a,b) => ({ cdt: b.ct-a.ct, dx: b.x-a.x }),
  ds: (a,b) => Math.sqrt(Math.abs((b.ct-a.ct)**2 - (b.x-a.x)**2)),  // |Δs| shown to students, no classification
  ds2: (a,b) => (b.ct-a.ct)**2 - (b.x-a.x)**2                        // signed Δs² for checking only (c=1)
};
```

## Verify (no browser)
1. `node --check` on the inline script passes.
2. `grep -n 'a\.u\.'` → nothing; `grep -n "ctx.font='[^']*Inter"` → nothing; `grep -n 'E₃\|pushEvent(-1,5)'` → nothing.
3. Static review: only E1/E2 seed; `drawNow` gated on `showNow` (default false) and `onFrame` doesn't advance `nowCt` when off; the new "Now line" toggle resets and snapshots correctly; `Δs` chip shows with no TL/SL/null text and the triangle shows `Δs` only at Layer 3; coordinate/geometry math and the shell runtime are untouched.

Keep changes surgical and match the existing code style.
````

### `L05-s2` follow-up fix — label overlaps (Δs/Δx/cΔt piling up; event tags on the light cone)

````markdown
# L05-s2 — fix overlapping canvas labels

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L05-s2-spacetime-diagram-explorer-shell.html`

Two label-layout bugs to fix. Both are **pure canvas text placement** — do not change any physics, geometry (`toPx`/`toData`/`computeGeo`), event positions, the `Δs`/`cΔt`/`Δx` values, or the shell runtime. No new libraries.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.** The user tests visually.

## Bug 1 — Separation-triangle labels overlap each other (`drawTriangle`, ~L977–997)
With the default simultaneous pair (E₁, E₂ both at ct = 2) the triangle collapses to a flat horizontal line, so `Δx`, `Δs`, and `cΔt = +0.0` all land on the same spot (and `cΔt` sits on E₂). Fix the placement so the three labels never overlap, including the degenerate simultaneous (cΔt ≈ 0) and co-located (Δx ≈ 0) cases:

- **Δx** (horizontal leg A→C midpoint): offset it vertically to the side of the leg **away from B** (the opposite vertex). When cΔt ≈ 0, default it to one side (e.g. above the line).
- **cΔt** (vertical leg C→B midpoint): keep the horizontal offset away from A, but **skip drawing it when `|cdt| < 0.06`** (degenerate — otherwise it reads "cΔt = +0.0" on top of E₂).
- **Δs** (hypotenuse A→B midpoint): offset perpendicular **away from the right-angle corner C**, with a larger offset (~16–18 px). When cΔt ≈ 0, force Δs to the **opposite** vertical side from Δx so they don't collide. **Skip Δs when the pair is the same event** (`|dx| < 0.06 && |cdt| < 0.06`).
- **Δx**: also **skip when `|dx| < 0.06`** (co-located — the horizontal leg has zero length).
- Use a shared small **background pill** behind each label (see helper below) so the text is legible where it crosses the triangle/connector/grid.

## Bug 2 — Event tags overlap the light cone (`drawEvents`, ~L1033–1039)
E₂ at (2, 2) sits exactly on the 45° light-cone line, so its "E₂" tag is unreadable over the dashed cone. Fix:
- Draw a semi-transparent rounded **background pill** behind each event label (same helper) so it stays legible over the cone / grid / connector.
- Place the label on the side pointing **away from the origin** (outward): offset along the normalized screen vector from the origin pixel `toPx(0,0)` to the event pixel `p`, by ~13 px, then clamp within the plot bounds (`geo.x0`, `geo.plotRight`, `geo.plotTop`, `geo.plotBottom`). Keep the existing edge-flip safety.

## Shared helper (add once, use in both places)
Add a small pill-label helper near the other drawing helpers and use it for the event labels and the three triangle labels:
```js
function pillText(text, x, y, color, align){
  ctx.save();
  ctx.font = ctx.font; // caller sets font/size first
  ctx.textAlign = align||'left'; ctx.textBaseline='middle';
  const w = ctx.measureText(text).width, padX=5, h=16;
  let bx = align==='right' ? x-w-padX : align==='center' ? x-w/2-padX : x-padX;
  ctx.fillStyle = 'rgba(10,12,17,0.72)';
  const r=4, bw=w+padX*2, by=y-h/2;
  ctx.beginPath();
  ctx.moveTo(bx+r,by); ctx.arcTo(bx+bw,by,bx+bw,by+h,r); ctx.arcTo(bx+bw,by+h,bx,by+h,r);
  ctx.arcTo(bx,by+h,bx,by,r); ctx.arcTo(bx,by,bx+bw,by,r); ctx.closePath(); ctx.fill();
  ctx.fillStyle = color; ctx.fillText(text, align==='right'?x-padX : align==='center'?x : x, y);
  ctx.restore();
}
```
(Adjust the fill so the caller's `textAlign` still lands correctly; keep the existing colours/fonts — `FONT_NUM` for the numeric triangle labels, `FONT_LABEL` for event tags.)

## Verify (no browser)
1. `node --check` on the inline script passes.
2. Static review: with a simultaneous pair, `cΔt` is skipped and `Δx`/`Δs` sit on opposite sides (no overlap); with a co-located pair, `Δx` is skipped; a generic pair shows all three on their own sides. Event tags have a background pill and sit outward of the origin, clamped in-bounds.
3. No changes to physics/geometry, `Δs` values, event positions, or the shell runtime.

Keep it surgical.
````

---

## `L08-s1` · Relativity of simultaneity
**Shell file:** `L08-s1-relativity-of-simultaneity-shell.html`
**To-do items:** #10 (Small changes) + #11 (Lecture-9 spacetime-interval add-on).
**Lecture grounding:** Lecture 8 defines the interval and its invariance ("The spacetime interval must be invariant"). Lecture 9's EC note is the literal source of the add-on: *"modify the lecture 8 'Relativity of Simultaneity' simulation … to also display the space-time interval in each of the frames so observers can agree about s² and how to classify events, although the coordinates in spacetime differ."*

````markdown
# L08-s1 (Relativity of simultaneity) — remove hyperbolas, add S′ grid, show the interval in both frames

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L08-s1-relativity-of-simultaneity-shell.html`

Three changes: (1) remove the calibration hyperbolas, (2) add a tilted **S′ grid** alongside the existing S grid so simultaneity-loss is obvious, (3) add a **spacetime-interval readout in each frame** (Lecture 9) — Δs² computed from S coordinates and from S′ coordinates, shown to be equal while the coordinates differ.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.** The user tests visually.

## HARD CONSTRAINTS — physics must not change
1. **Do NOT edit the shell runtime block or shell CSS.** Only the SIM CSS, SIM markup, and SIM `<script>`.
2. **Preserve the Lorentz transform exactly:** `ctp = g*(ct − b*x)`, `xp = g*(x − b*ct)`, `g = 1/√(1−b²)` (`gamma()`). The primed-axis directions (`ct′: x=β·ct`, `x′: ct=β·x`) and the primed tick positions (`[n·β·γ, n·γ]`) are algebraic — keep them; they do **not** depend on the drawn hyperbolas.
3. **Δs² must remain frame-invariant by construction** — compute it independently in each frame from that frame's own Δct/Δx; never copy one into the other. Keep/extend the `window.__audit` hook.
4. Keep working: the β slider + auto-sweep (`onFrame`), event dragging, the constant-ct′ construction lines (`drawConstruct`), the light cone, the guided inquiry + snapshots, and the "naive equal-reception" fading line.

## Change 1 — Remove all hyperbolas
- In `render()`, delete the hyperbola block (the `for(const A of [1,2,3])` loops that stroke the timelike `ct²−x²=A²` and spacelike `x²−ct²=A²` dashed curves, ~L886–909). Remove `COL.hyper` if it becomes unused.
- **Keep** the primed axes, the primed tick marks (`[n·β·γ, n·γ]`), and the constant-ct′ construction lines — none of these are hyperbolas.
- Formal panel (~L542): the "Hyperbolic calibration of ticks" row now describes a removed feature — replace it with an "S′ grid — lines of constant ct′ and x′" row (or remove it).
- Guided-inquiry text that references "dashed hyperbolas … calibration curves" (~L463): reword to point at the S′ grid instead. Do not touch the light-cone reference ("dashed 45° lines", ~L477).

## Change 2 — Add the S′ grid (grids for both frames)
The unprimed S grid already draws constant-x (vertical) and constant-ct (horizontal) lines. Add a **tilted S′ grid** in the same clipped plot region where the hyperbolas were:
- Lines of **constant ct′** (parallel to the x′ axis) and **constant x′** (parallel to the ct′ axis), for integer ct′/x′ values spanning the plot. Map each S′ lattice line back to (x, ct) via the inverse boost: `x = γ(x′ + β·ct′)`, `ct = γ(ct′ + β·x′)`, and clip to the data box (reuse the existing clip/`clip()` approach).
- Draw them faintly in the S′ colour (`COL.pax`), visually distinct from the S grid (e.g. thinner / lower alpha / dashed), **under** the axes, events, and construction lines.
- Purpose (Claudia's note — emphasise simultaneity loss): with the S′ grid visible it's obvious that A and B, which share one horizontal S grid line (same ct), sit on **different constant-ct′ grid lines** → different t′.
- Add an **"S′ grid" toggle** to the "Display layers" controls (next to `ct′ readouts` / `Light cone`), **on by default**; store it in state and thread it through the step snapshots like `showReadouts`/`showCone`. When β = 0 the S′ grid coincides with the S grid (fine).

## Change 3 — Spacetime interval in each frame (Lecture-9 add-on)
Make the interval's frame-invariance explicit in the Readings panel:
- Add a **Δx′ (S′)** readout: `Δx′ = γ(Δx − β·Δct)` (with Δct = 0 here, `Δx′ = γ·Δx`).
- Replace the single `Δs²` line with **two** computed independently, shown equal:
  - `Δs²|S = Δct² − Δx²` (from S coordinates).
  - `Δs²|S′ = Δct′² − Δx′²` (from S′ coordinates).
  - A short "✓ equal — invariant" flag when they match (they always will), plus the causal class label (spacelike / timelike / null) — **the same in both frames**.
- Frame it so the takeaway reads: *coordinates differ between S and S′ (Δct = 0 vs Δct′ ≠ 0; Δx vs Δx′), but Δs² and the classification agree.*
- Keep the existing colour coding (S′ items in blue/rose as now).

## Extend the audit hook
Keep `at(beta)`; add:
```js
intervalBothFrames: (A, B, beta) => {
  const g = 1/Math.sqrt(1-beta*beta);
  const dct=B.ct-A.ct, dx=B.x-A.x, s2S = dct*dct - dx*dx;
  const dctp = g*((B.ct-beta*B.x)-(A.ct-beta*A.x));
  const dxp  = g*((B.x-beta*B.ct)-(A.x-beta*A.ct));
  const s2Sp = dctp*dctp - dxp*dxp;
  return { s2S, s2Sp, invariant: Math.abs(s2S - s2Sp) < 1e-9 };
}
```

## Sign-convention note (flag, do not silently change)
This sim uses `Δs² = Δct² − Δx²` (timelike-positive). The lecture notes use `Δs² = −c²Δt² + Δx²` (spacelike-positive) — the classification labels are identical either way and the invariance holds either way. **Keep this sim's existing convention** for internal consistency; aligning all interval sims (L05-s2 / L08-s1 / L08-s2) to the lecture's sign is a separate cross-sim decision — do not change it here.

## Verify (no browser)
1. `node --check` on the inline script passes.
2. Console reasoning: `__audit.intervalBothFrames({x:-1.5,ct:3},{x:2,ct:3},0.6).invariant === true` for several β; `s2S` and `s2Sp` match.
3. Static review: no hyperbola drawing remains; the S′ grid renders (clipped, faint, toggleable, default on) and A/B land on different constant-ct′ lines when β≠0; Δx′ and both Δs² readouts appear and agree; Lorentz math, construction lines, light cone, and shell runtime untouched.

Keep changes surgical and match the existing code style.
````

### `L08-s1` follow-up — group the Readings panel by frame (S / S′) + fix Δs² subscripts

````markdown
# L08-s1 — group the Readings panel into S and S′ (declutter) + fix the Δs² subscripts

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L08-s1-relativity-of-simultaneity-shell.html`

The Readings panel is a flat 12-row list and reads as cluttered. Reorganise it into **two frame groups (S and S′)** with headers, and fix the spacetime-interval labels so the frame is a proper **subscript** on Δs². This is a **markup + small CSS** change only.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.**

## HARD CONSTRAINTS
1. **Do NOT change any JavaScript** — `updatePanel()` writes to these IDs and must keep working untouched: `r-vc`, `r-g`, `r-dx`, `r-dxp`, `r-cts`, `r-dct`, `r-cta`, `r-ctb`, `r-dctp`, `r-ds2s`, `r-ds2sp`, `r-inv`. **Every one of these `id="r-…"` value spans must survive** the restructure (same ids, same inline colour styles). Keep the outer `id="readingsPanel"` on the panel body (it's used by `updateStepHL`).
2. Do NOT touch the shell runtime, the canvas/render code, or any physics. This is presentation only.
3. Only edit: the Readings-panel markup (~L520–531) and add a little SIM CSS for the group headers.

## Change 1 — Group the readouts by frame
Restructure the `#readingsPanel` body into these blocks (keep the existing `.readline` / `.k` / `.v` structure for each row, and keep the S′ rows' inline colours — Δx′ & Δs²|S′ teal `#2dd4bf`, ct′_A blue `#60a5fa`, ct′_B rose `#fb7185`):

- **Top (frame relationship, no header):** `v/c (S′ rel. to S)` → `r-vc`; `γ = 1/√(1−β²)` → `r-g`.
- **Group "Frame S"** (header): `ct_A , ct_B` → `r-cts`; `Δx = x_B − x_A` → `r-dx`; `Δct` → `r-dct`; `Δs²_S = Δct² − Δx²` → `r-ds2s`.
- **Group "Frame S′"** (header, teal): `ct′_A` → `r-cta`; `ct′_B` → `r-ctb`; `Δx′ = γ(Δx − β·Δct)` → `r-dxp`; `Δct′ = ct′_B − ct′_A` → `r-dctp`; `Δs²_S′ = (Δct′)² − (Δx′)²` → `r-ds2sp`.
- **Bottom (invariant / agreement, no header or a subtle "Both frames" label):** `Interval` → `r-inv` (the `✓ equal — spacelike` line). This row is the payoff: the interval agrees across the two groups.

Add a small group-header style in the SIM CSS, e.g.:
```css
.read-group-head{font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink-mute);font-weight:600;margin:9px 0 3px;}
.read-group-head.sp{color:#2dd4bf;}   /* Frame S′ */
```
Use `<div class="read-group-head">Frame S</div>` and `<div class="read-group-head sp">Frame S′</div>` before their groups. Keep it compact so the panel doesn't grow much taller.

## Change 2 — Fix the Δs² subscripts
In the two interval rows, the frame label is currently the pipe form `Δs²|S` / `Δs²|S′`. Make the frame a proper **subscript** and keep the exponents as superscripts:
- S row `.k`: `Δs²<sub>S</sub> = Δct² − Δx²` (use `<sup>2</sup>` for the squares if the surrounding text uses tags; unicode ² is acceptable if consistent).
- S′ row `.k`: `Δs²<sub>S′</sub> = (Δct′)² − (Δx′)²` — wrap the primed quantities so the square clearly applies to the whole `(Δct′)` / `(Δx′)`, not just the prime.
- Do the same subscript treatment anywhere else `Δs²|S`/`|S′` appears (e.g. keep the Formal-panel "Invariant interval" row consistent if it uses the pipe form).

## Verify (no browser)
1. `node --check` on the inline script still passes (JS unchanged).
2. `grep -o 'id="r-[a-z0-9-]*"'` lists all 12 ids (`r-vc,r-g,r-dx,r-dxp,r-cts,r-dct,r-cta,r-ctb,r-dctp,r-ds2s,r-ds2sp,r-inv`) — none dropped; `id="readingsPanel"` still present.
3. `grep -c 'Δs²|S'` → 0 (pipe form replaced by `<sub>`).
4. Static review: two clear frame groups with headers; S′ colours preserved; no JS/physics/shell changes.

Keep it surgical.
````

---

## `L09-s1` · Worldline length & proper time
**Shell file:** `L09-s1-worldline-length-and-proper-time-shell.html`
**To-do item:** #12 (Small change) — option to hide the third worldline.
**Decision (agreed):** the toggle **defaults to OFF** — the sim opens as the **two-worldline** view (A straight + B, matching the Lecture-9b figure); worldline **C** is shown via the toggle. Because the default is two, the guided inquiry is reworded to a two-traveller framing.
**Lecture grounding:** the Lecture-9b figure shows two worldlines (Alice at rest, Bob moving); the Lecture-9b delivery EC note says "show three different worldline options" — the toggle makes the third available, so both are satisfied.

````markdown
# L09-s1 (Worldline length & proper time) — add an option to hide the third worldline (C)

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L09-s1-worldline-length-and-proper-time-shell.html`

Add a toggle to show/hide worldline **C** (the two-waypoint path `[E1, W2, W3, E2]`). It **defaults to OFF**, so the sim opens as a clean **two-worldline** comparison — A (straight) and B (one kink) — matching the Lecture-9b figure. C can be switched on to restore the three-path view.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.** The user tests visually.

## HARD CONSTRAINTS — physics must not change
1. **Do NOT touch the proper-time / geometry math:** `seg()` (`τ=√(Δct²−Δx²)`), `pathInfo()`, `pathVerts()`, `accumTau()`, `toDisplay()`/`fromDisplay()` (Lorentz), `gam()`. Hiding C is **visibility only** — never change how τ is computed.
2. **Do NOT edit the shell runtime block or shell CSS.** Only SIM CSS, SIM markup, SIM `<script>`.
3. Keep the `window.__audit` hook (τ-invariance check) intact.
4. A/B are always present and unaffected; dragging, frame switch (S/S′), Play/animation, and per-segment detail keep working.

## Change 1 — State + toggle
- Add `showC:false` to the `st` state object (default hidden).
- Add a **helper** `function visiblePaths(){ return st.showC ? ['A','B','C'] : ['A','B']; }` and use it in place of the hardcoded `['A','B','C']` lists.
- Add a control in the **Worldline** section of Controls (near the A/B/C selector, ~L539–543): a checkbox/button e.g. **"Show 3rd worldline (C)"**, default off. On change: set `st.showC`; if turning **off** while `st.focus==='C'`, set `st.focus='A'` and re-sync the selector active state; show/hide the `#clkC` clock card and the `#focusC` selector button; then `updateReadout(); updateClocks(); draw();`.

## Change 2 — Gate C everywhere it's drawn/listed (when `!st.showC`)
Replace the `['A','B','C']` iterations with `visiblePaths()` so C is skipped when hidden:
- `drawPathLines()` (~L971) — the `order` array.
- `drawPathTauLabels()` (~L1025).
- `updateReadout()` (~L1108–1111) — the `best` search and the `badge` display loop (compute "longest τ" over visible paths only; A stays the winner).
- `updateClocks()` (~L1158–1159) — the `leader` search and the clock-update loop.
- **Clock card / selector button:** hide `#clkC` (L575) and `#focusC` (L543) when C is hidden (e.g. `style.display='none'`), show them when on. (Keep computing `pathInfo('C')` if convenient — it's harmless — but never render C's line/label/row/clock/badge while hidden.)
- **Auto-fit** `computeView()` (~L887): exclude the C-only waypoints from the fit when hidden — `const pts=[st.E1,st.E2,st.W1].concat(st.showC?[st.W2,st.W3]:[]).map(toDisplay);` — so the view frames just A/B.

## Change 3 — Reword the guided inquiry to two travellers (default is two)
Since the default view is A + B, update the user-facing inquiry text so it doesn't reference a hidden C:
- Prediction card (~L495–497): change option **(a)** from "Traveller C — most spatial detours…" to reference **B** (the kinked path): e.g. *"(a) Traveller B — took a spatial detour → longer path → most aging"* (this keeps the same misconception, now on B). Keep (b) "all age the same" and (c) "Traveller A — straight inertial" (correct). In the feedback strings, change any "τ_A > τ_B > τ_C" to **"τ_A > τ_B"**.
- Card 1 (~L503 and the mirror string ~L837): "Rank them **A, B, C**" → "Rank them **A and B**"; "watch the **three** clocks … race" → "watch the **two** clocks … race".
- Card 2 (~L508 and ~L838): "Worldline **A/B/C** selector" → "Worldline **A/B** selector".
- (Optional, for consistency) the About-modal lines that say "three paths / three reunited travellers" can be softened to "two paths (a third is optional)".
- Note: when the user toggles C on mid-inquiry, the A/B wording is slightly conservative but not wrong — acceptable.

## Verify (no browser)
1. `node --check` passes.
2. Static review: on load only A and B are drawn/listed (no C line, no `#clkC`, no `#focusC`, no C row); toggling C on restores all three; toggling off while C is focused falls back to A; the view auto-fits to A/B when C is hidden.
3. `seg`/`pathInfo`/`accumTau`/`toDisplay`/`__audit` unchanged; shell runtime untouched; inquiry text no longer references a hidden C.

Keep changes surgical and match the existing code style.
````

---

## `L10-s2` · Lorentz transformation vs Euclidean rotation
**Shell file:** `L10-s2-lorentz-transformation-vs-euclidean-rota-shell.html`
**To-do item:** #13 (Small changes).
**Grounding:** Lecture 10 frames a boost as a *hyperbolic rotation* preserving the invariant hyperbola (vs a circle for Euclidean rotation). Claudia's note: *"remove the hyperbola/circle — make visible with a toggle"* and *"just wants to show the orange axes"* (rotating under Euclidean rotation vs the angle closing under a boost).
**Agreed defaults:** invariant-curves toggle **default OFF** (per Claudia's "remove … make visible with a toggle"); quantities toggle **default ON** (the note says "a toggle to *hide*"). Both are one-line flips if you want them the other way.

````markdown
# L10-s2 (Lorentz vs Euclidean rotation) — curve toggle, readout toggle, fix doubled axis labels

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L10-s2-lorentz-transformation-vs-euclidean-rota-shell.html`

Three small changes: (1) a toggle to show/hide the invariant **circle/hyperbolas**, (2) a toggle to hide the **quantity readouts** below each panel, (3) fix the **doubled axis labels**. Claudia's lecture view is "just the orange axes" — the primed axes rotating rigidly (left) vs scissoring closed (right).

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.** The user tests visually.

## HARD CONSTRAINTS — physics must not change
1. **Do NOT touch the transform math:** `gamma(b)`, `lorentzTX(t,x,b)`, and the point/coordinate math inside `ptEu`, `ptLor`, `updateFoot` (the boost `x'=γ(x−βct)`, `ct'=γ(ct−βx)`, the circle `cos/sin` rotation, and the invariant computations). The toggles gate **rendering only**; the fix is **label position only**.
2. **Do NOT edit the shell runtime block or shell CSS.** Only SIM CSS, SIM markup, SIM `<script>`.
3. Keep the `window.__audit` hook intact. Keep the existing `calib` toggle (grid + calibration ticks) working.

## Change 1 — Toggle for the invariant curves (circle / hyperbolas), default OFF
- Add `showInv:false` to the `state` object (`const state={ theta:0, beta:0, calib:false, predicted:null }`).
- Add a control button in the same `ctrl-box` as the `⌗ Primed grid + ticks` button, e.g. **`◯ Invariant curves`**, default inactive. On click: flip `state.showInv`, toggle its `.active` class, `render()`.
- Gate the teal curves on `showInv`:
  - **Left (`drawEuclid`):** the primary circle (`ctx.arc(cx,cy,s,…)`, ~L1058) → wrap in `if(state.showInv)`. The outer calibration circle (~L1059) → `if(state.showInv && state.calib)`.
  - **Right (`drawLorentz`):** the primary `hyperbolaTimelike(…,1)` / `hyperbolaSpacelike(…,1)` (~L1090–1091) → wrap in `if(state.showInv)`. The outer n=2 hyperbolas (~L1092–1096) → `if(state.showInv && state.calib)`.
- Leave the grid and axis unit-ticks under `calib` as they are (they're calibration aids on the axes, independent of the curves).
- Reset (`onReset`, ~L1159): set `state.showInv=false` and clear the button's `.active`.
- **Inquiry/legend text touch-ups** (because curves now default off): in the step that says "Rotation preserves the **circle** … a boost preserves the **hyperbola**" (~L514), add "— turn on **Invariant curves** to see them." Soften the legend line (~L568) and the formal note "Both curves are drawn in teal" (~L597) to "when **Invariant curves** is on."

## Change 2 — Toggle to hide the quantity readouts, default ON (shown)
- Add `showQty:true` to `state`.
- Add a control button e.g. **`▦ Readouts`**, default active (shown). On click: flip `state.showQty`, toggle `.active`, and show/hide both foot strips `#foot-left` and `#foot-right` (`el.style.display = state.showQty ? '' : 'none'`), then `render()`.
- `updateFoot()` can keep writing innerHTML unconditionally (hidden strips just aren't visible) — or early-return when hidden; either is fine, but the strips' `display` must follow `showQty`.
- Reset: `state.showQty=true`, button active, strips visible.

## Change 3 — Fix the doubled axis labels
At low θ/β (and exactly at the default θ=0, β=0) the **orange primed** axis labels drawn by `drawAxisLine` (`'x′'`, `'y′'` left; `'ct′'`, `'x′'` right, ~L959) sit on top of the **black unprimed** labels drawn by `drawAxes` (`'x'`, `'y'` / `'x'`, `'ct'`, ~L952–953) because the primed axes coincide with the unprimed ones — this reads as doubled labels.
- Fix in `drawAxisLine`: offset the primed label **perpendicular to its own axis** by a fixed screen amount (~14 px) on a consistent outward side, so it never overlaps the unprimed label even when the axes coincide. For axis world-direction `dir=[dx,dy]`, the screen tangent is `(dx, −dy)`; use a screen-normal like `(dy, dx)` (normalized) and add `off*normal` to the label position. Keep it inside the panel bounds (the existing `lbl(…,w,…)` clamps horizontally).
- Apply the analogous separation to the orange unit-tick numbers in `drawTicks` if they still collide with the black tick numbers at θ=0/β=0 (they already offset along the normal — increase the offset only if needed).
- Do not move or restyle the black unprimed labels.

## Verify (no browser)
1. `node --check` passes.
2. Static review: on load the teal circle/hyperbolas are **absent** (toggle off) and the readout strips are **present** (toggle on); the `◯ Invariant curves` toggle shows/hides all teal curves (n=1 and, with calib, n=2); the `▦ Readouts` toggle hides/shows both foot strips; at θ=0 / β=0 the `x′/y′/ct′` labels no longer sit on the `x/y/ct` labels; `calib` still controls grid + ticks.
3. `gamma`, `lorentzTX`, `ptEu`, `ptLor`, `updateFoot` math and `__audit` unchanged; shell runtime untouched.

Keep changes surgical and match the existing code style.
````

---

## `L12-s1` · Twin paradox worldline comparison
**Shell file:** `L12-s1-twin-paradox-worldline-comparison-shell.html`
**To-do item:** #14 (Small changes).
**Grounding (Lecture 12):** Alice (Twin A) stays; Bella (Twin B) runs and returns; the asymmetry is Bella's turnaround. Naming/colours already match (A blue `#7eb8ff`, B red `#fc8a8a`).
**Decisions (agreed):** the one-way signal is emitted at a **fixed time t = T/2** (the old turnaround time); and a **short inquiry note** is added describing what the one-way mode shows.

````markdown
# L12-s1 (Twin paradox) — frame switch resets the now-line + add a one-way "Bella signals Alice" mode

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L12-s1-twin-paradox-worldline-comparison-shell.html`

Two changes: (1) switching the reference frame resets the "now" line to the start; (2) a new **One-way** mode where Bella does not return but sends a light signal back to Alice reporting her clock and position.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.** The user tests visually.

## HARD CONSTRAINTS — physics must not change
1. **Do NOT touch the transform/proper-time math:** `tf()` (Lorentz), `events()`, `segPT()`, `properAtNow()`, `gammaOf()`. New geometry must reuse `tf()` so it transforms correctly per frame.
2. **Do NOT edit the shell runtime block or shell CSS.** Only SIM CSS, SIM markup, SIM `<script>`.
3. Keep the round-trip mode's behaviour, the frame selector, the sweep animation (`onFrame` advancing `p`), the guided inquiry, and `window.__audit` intact.

## Change 1 — Switching reference frame resets the "now" line
In the frame-button handler (the `frameBtns.forEach(b=>b.addEventListener('click', …))` block, ~L1153–1158) set **`p=0;`** before re-rendering, so the amber now-line returns to E₁ on every frame switch. (`renderReadings()`/`render()` already read `p`, so `tNow` becomes 0.) No other logic changes.

## Change 2 — New "One-way + signal" mode
Add a mode with a toggle; **round-trip stays the default and is unchanged.**

### State + toggle
- Add `let mode='roundtrip';` (values `'roundtrip' | 'oneway'`).
- Add a control (near the Reference-frame group, ~L529) — two buttons or a toggle, e.g. **"Round trip"** / **"One-way + signal"**, default Round trip. On change: set `mode`, `p=0`, update button active state, `renderReadings(); render();`.
- Reset (`onReset`) sets `mode='roundtrip'` and re-syncs the toggle.

### Geometry (all in A's frame, then drawn via `tf()`)
In one-way mode:
- **Alice:** unchanged straight worldline E₁(0,0) → (0, T).
- **Bella:** outbound only, E₁(0,0) → **E_out = (v·T, T)** (no return, no kink).
- **Emission event E_send = (v·T/2, T/2)** — Bella emits a light signal here (fixed at t = T/2).
- **Light signal:** a leftward 45° ray from E_send to Alice's line (x=0), arriving at **E_recv = (0, (T/2)(1+v))**. (Because Δt = Δx = v·T/2.) Since the light cone is Lorentz-invariant, transforming both endpoints with `tf()` keeps it at 45° in every frame — good.
- **Bella's clock at emission (proper time):** `τ_B_send = (T/2)·√(1−v²)` = `(T/2)/γ`.

Do **not** hard-code these — compute them from `v` and `T` so they stay correct as the slider moves. (Sanity at v=0.60, T=10: E_send=(3,5), E_recv=(0,8), τ_B_send=4.0.)

### Drawing (one-way mode)
- Draw Bella's outbound worldline (E₁→E_out) in `colB`; draw Alice (E₁→(0,T)) in `colA`. Skip the return leg, the turnaround kink indicator, and the reunion event E₂/labels.
- Draw the **light signal** E_send→E_recv as a distinct dashed ray in a signal colour (e.g. green `#4ade80`) — clearly different from the amber now-line and the faint light-cone lines — labelled "light signal".
- Mark **E_send** ("Bella signals") and **E_recv** ("Alice receives") with event markers/labels.
- Add a readout **badge near E_recv** (reuse `drawBadge`): main "Bella's signal", sub `"τ_B = {τ_B_send} yr @ x = {v·T/2} ly · Alice hears it at t = {(T/2)(1+v)} yr"`.
- The now-line sweep and the live τ_A/τ_B counters still work (Bella's τ accumulates along the outbound line).

### Readings panel (one-way mode)
In `renderReadings()`, when `mode==='oneway'`, show the one-way story instead of the reunion Δτ: Bella's emission (her clock `τ_B_send`, position `v·T/2`, coord time `T/2`), Alice's reception time `(T/2)(1+v)`, and note the signal travelled at c. Keep the "now" line and v rows. (Round-trip readings unchanged.)

### Guided-inquiry note (agreed)
Add a short line (or a small extra step) that fires/opens for the one-way mode — e.g.: *"**One-way mode:** Bella never turns around — she just signals Alice. The light signal reports Bella's clock (τ_B) and position; Alice receives it later (light-travel delay), and Bella's clock reads less than Alice's — one-way time dilation, no turnaround needed."* Keep the existing round-trip prediction/steps intact.

## Verify (no browser)
1. `node --check` passes.
2. Static review: switching frames resets the now-line to E₁ (`p=0`); round-trip mode is visually unchanged; one-way mode shows Bella's outbound line + a 45° green light signal from (v·T/2, T/2) to (0, (T/2)(1+v)), with the emission/reception markers and the signal readout; the signal stays 45° when you switch frames; `tf`/`properAtNow`/`gammaOf`/`__audit`/shell runtime unchanged.
3. Numbers check at v=0.60: E_send=(3,5), E_recv=(0,8), τ_B_send=4.00.

Keep changes surgical and match the existing code style.
````

### `L12-s1` follow-up — light rename to Alice / Bella (match the lecture, fix the A/B ↔ Alice/Bella inconsistency)

````markdown
# L12-s1 — introduce Alice (A) and Bella (B) in the text (keep the notation)

**File:** `Capacity_SR_sims_v2_engine/shell-versions/L12-s1-twin-paradox-worldline-comparison-shell.html`

Right now the round-trip mode calls the twins "Twin A / Twin B" while the one-way mode calls them "Alice / Bella" — inconsistent. Lecture 12 names them **"Twin A: Alice"** and **"Twin B: Bella"**. Make the whole sim use the lecture's names, while **keeping all the compact notation unchanged**. This is a **text-only** change — no physics, no JS identifiers, no logic.

## HOW TO WORK — no browser testing
Implement and verify with `node --check` + `grep` + static review only. **Do NOT start an HTTP server / headless browser / screenshot loop.**

## HARD CONSTRAINTS — rename display text ONLY
1. **Do NOT rename any JS identifier or attribute value:** keep `colA`, `colB`, the `frame` values and `data-frame="S"/"Sp"/"Spp"`, the τ subscript markup `τ<sub>A</sub>` / `τ<sub>B</sub>` (`τ_A`, `τ_B`), `data-c="a"/"b"/"c"`, element ids (`eqA`, `eqB`, …), and the `.mode-btn`/`.frame-btn` classes. Do **not** touch any physics, `tf()`, `oneWayGeom()`, `properAtNow()`, `__audit`, or the shell runtime.
2. **Keep the frame labels S / S′ / S″ and the event names E₁, Eₜ, E₂** exactly as they are.
3. This is purely swapping user-visible prose/label strings.

## Rename rules (display strings only)
- **"Twin A" → "Alice (A)"** on first/prominent mention (frame buttons, formal panel labels, About), and **"Alice"** in running prose. **"Twin B" → "Bella (B)"** / **"Bella"** likewise.
- Bare pronoun-style "A"/"B" in sentences → the name: e.g. *"A occupies one inertial frame … B does not"* → *"Alice occupies one inertial frame … Bella does not"*; *"A follows the straight worldline"* → *"Alice follows the straight worldline"*.
- Keep **τ_A / τ_B** as the symbol (optionally gloss once as "Alice's proper time τ_A", "Bella's proper time τ_B").
- Frame descriptions can name the twin but keep the letter: e.g. `"Twin A frame (S)"` → `"Alice's frame (S)"`, `"B outbound (S′)"` → `"Bella outbound (S′)"`, `"B return (S″)"` → `"Bella return (S″)"`.

## Specific spots to update (not exhaustive — grep to be sure)
- **Frame buttons** (~L532–534): `Twin A frame (S)` → `Alice's frame (S)`; `B outbound (S′)` → `Bella outbound (S′)`; `B return (S″)` → `Bella return (S″)`. (Keep `data-frame` values.)
- **Predict card** (~L471–473): the prompt "Twin B departs …" → "Bella departs …", choices `Twin A — the stay-at-home twin` → `Alice (A) — the stay-at-home twin`, `Twin B — the traveler` → `Bella (B) — the traveler`. (Keep `data-c`.)
- **Compare-frames card** (~L480): "switch to **B's outbound frame (S′)**" → "Bella's outbound frame (S′)"; keep τ_A/τ_B.
- **Friend-claim step + buttons** (~L488–490): the "From B's point of view, A is the one who travels…" text and the three `.fr-btn` answers → Alice/Bella.
- **Formal-panel labels** (~L559–560): `Twin A — straight (inertial) worldline` → `Alice (A) — straight (inertial) worldline`; `Twin B — kinked worldline` → `Bella (B) — kinked worldline`.
- **About/pedagogy dt/dd** (~L385, L394): "travelling twin" / "which twin ages more" — may keep "twin" generically, but where it says A/B use the names.
- **`frameBadgeCopy()`** (~L899–915): `"We are in Twin A's frame"` → `"We are in Alice's frame"`, `"S · stay-at-home twin (A at rest)"` → `"S · Alice at rest (stay-at-home)"`, `"Viewing from B's outbound frame"` → `"Viewing from Bella's outbound frame"`, `"S′ · B at rest on the way out"` → `"S′ · Bella at rest on the way out"`, and the return-frame equivalents.
- **`renderReadings()`** (~L1059–1083): `frameHead` strings ("We are in Twin A's frame (S)", "B's outbound frame (S′)", "B's return frame (S″)") → Alice/Bella; the `speeds` strings ("A at rest · B out …", "A moves …") → Alice/Bella; the def-rows "proper time along A's straight worldline" / "along B's kinked worldline" → Alice's / Bella's; "B's outbound/return speed" → Bella's.
- **`updatePrompt()`** (~L1087): "Twin B departs …" → "Bella departs …".
- **`evalPrediction()`** (~L1104–1112): "Twin A ages more", "Twin B (the traveler)", "A follows …", "B's path has a kink …" → Alice/Bella (keep τ_A/τ_B symbols).
- **`friendResp()`** (~L1117–1124): all "A"/"B" prose → Alice/Bella.
- **Canvas speed labels** (~L1018–1022): `"A: at rest"` → `"Alice: at rest"`, `"A: −0.60c"` → `"Alice: −0.60c"`, `"B: 0.60c"` → `"Bella: 0.60c"`, `"B return: …"` → `"Bella return: …"`, `"B outbound: …"` → `"Bella outbound: …"`.
- **One-way mode** already uses Alice/Bella — leave it (now consistent with everything else).

## Verify (no browser)
1. `node --check` passes (no JS logic changed).
2. `grep -c 'Twin A\|Twin B'` → 0 (or only where "twin" is used generically without A/B); `grep -c 'colA\|colB'` unchanged; `grep -o 'data-frame="[^"]*"'` still shows `S`/`Sp`/`Spp`; `τ<sub>A</sub>`/`τ<sub>B</sub>` still present.
3. Static review: names read consistently across round-trip and one-way modes; frame labels S/S′/S″ and event names E₁/Eₜ/E₂ unchanged; no physics/JS-identifier/`__audit`/shell changes.

Keep it surgical.
````

---

````markdown
# L07-s1 — Michelson–Morley (3D) · make the aether-wind arrows prominently visible
`L07-s1-Michelson_Morley_experiment_3D.html`

To-do item #9: the red aether-wind arrows are currently too faint/translucent to read against the dark room. Make them **prominently visible**. This is a **cosmetic-only** change — do NOT alter any physics, motion, gating, or layout.

## The only place to edit
The wind-arrow construction IIFE — the block commented `/* ---- aether wind: translucent arrows drifting in fixed world +X ---- */` (around L2502–2526), specifically the material and the two geometries. These are `THREE.MeshBasicMaterial` (unlit → color already renders full-bright), so the faintness is caused by **`opacity: 0.3`** and the **thin geometry**, nothing else.

Change exactly these values inside that IIFE:
- **Material** (currently `new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3, depthWrite: false })`):
  - `opacity: 0.3` → **`opacity: 0.9`**
  - `color: 0xf87171` → **`color: 0xff4d4d`** (a brighter, more saturated red — still clearly "the red aether arrows", still matching the red used for the aether mode elsewhere)
  - keep `transparent: true` and `depthWrite: false` unchanged.
- **Shaft geometry** `new THREE.CylinderGeometry(0.012, 0.012, 0.34, 6)` → **`new THREE.CylinderGeometry(0.028, 0.028, 0.5, 8)`** (thicker + a bit longer, smoother).
- **Tip geometry** `new THREE.ConeGeometry(0.038, 0.12, 8)` → **`new THREE.ConeGeometry(0.085, 0.22, 10)`** (bigger arrowhead).
- **Tip position** `tp.position.x = 0.23` → **`tp.position.x = 0.36`** (so the cone still sits flush at the leading end of the longer shaft: `0.5/2 + 0.22/2 = 0.36`).

That is the entire change.

## Do NOT touch (physics + functionality must stay byte-identical)
- The physics functions `aetherPathDiffFor`, `aetherPathDiff`, `aetherPathShift`, `pathShift` — unchanged.
- The wind **drift + wrap** logic in the animation loop (`a.position.x += dt * 1.35; if (a.position.x > 6.5) a.position.x = -6.5;`) — unchanged.
- The **visibility gating** `const windVisible = state.mode === 'aether'; windGroup.visible = windVisible;` — arrows still show ONLY in Aether mode — unchanged.
- The **count (42)**, the random spawn positions, and the **apparatus-exclusion** line (`if (Math.hypot(...) < 2.6) ...`) — unchanged.
- The `windLegend` HTML/CSS, banner, detector, plots, ΔN-vs-θ curve, KaTeX, lighting, camera/orbit — unchanged.
- No shell/CSS/layout edits.

## Do NOT run a browser or HTTP server
Verify statically only — leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline script region passes (only literal numbers/one hex color changed).
2. `grep -n 'opacity: 0.9' ...` and `grep -n '0xff4d4d' ...` each hit exactly once, inside the wind IIFE; `grep -c 'opacity: 0.3'` on that block → 0.
3. Confirm `aetherPathDiff`, `aetherPathShift`, `windGroup.visible`, the `dt * 1.35` drift line, and the `< 2.6` exclusion are all still present and unchanged.
4. Arrow count still `for (let i = 0; i < 42; i++)`.

Keep it surgical.
````

---

````markdown
# L07-s1 — Michelson–Morley (3D) · slightly reduce the aether-wind arrow opacity (follow-up)
`L07-s1-Michelson_Morley_experiment_3D.html`

Follow-up to the previous L07-s1 change: the brighter arrows are now clearly visible but a touch too heavy. **Slightly reduce their opacity** so they read as a wind overlay rather than dominating the apparatus.

## The only change
In the wind-arrow construction IIFE (block commented `/* ---- aether wind: translucent arrows drifting in fixed world +X ---- */`, ~L2502–2526), in the `THREE.MeshBasicMaterial`:
- `opacity: 0.9` → **`opacity: 0.7`**

Nothing else. Leave `color: 0xff4d4d`, `transparent: true`, `depthWrite: false`, both geometries, `tp.position.x = 0.36`, the count (42), drift/wrap, visibility gating, and apparatus-exclusion exactly as they are.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline script passes.
2. `grep -c 'opacity: 0.7'` in the wind IIFE → 1; `grep -c 'opacity: 0.9'` there → 0.
3. `color: 0xff4d4d`, the `dt * 1.35` drift line, `windGroup.visible = ... 'aether'`, and the `< 2.6` exclusion all still present and unchanged.

Keep it surgical.
````

---

````markdown
# L00-s2 — Fly on a boat · make the animation loop continuously (like Ball on a train)
`L00-s2-Fly_on_a_boat_v2.html`

Right now the fly animation runs once and stops when the fly lands — you must Reset + Play to see it again. Make it **loop forever while playing**, exactly like `L00-s1-ball-on-a-train-shell.html`: fly falls → lands → brief hold with a **glowing cue on the live readouts** signalling the loop is resetting → short pause → relaunch from the top → repeat. The loop must feel **continuous, never glitchy** — the scrolling scene must not snap back when a loop restarts.

## Reference (copy the pattern from Ball on a train)
`L00-s1-ball-on-a-train-shell.html` already loops. Mirror its approach:
- a continuous world clock `S.pan` (advances every frame, only reset on hard Reset) drives the scrolling background, **decoupled** from the fall clock `S.t` (which resets each loop);
- `landHold` holds the ball on the floor briefly at the catch, then relaunches;
- `relaunchCue` (seconds) drives a glow via `roState.classList.toggle('ro-relaunch', S.relaunchCue>0)` — CSS `#ro-state.ro-relaunch{box-shadow:0 0 14px …}`.

## Edit 1 — State: add the loop accumulators
In the `state` object, add three fields (keep the existing `landed`):
```js
pan: 0,          // continuous world clock — drives scrolling, NEVER resets on loop
landHold: 0,     // seconds remaining holding the fly on the floor before relaunch
relaunchCue: 0,  // seconds remaining of the "loop reset" glow on the readouts
```
Add two constants near the top of the sim script:
```js
const LAND_HOLD    = 0.45; // s — hold on the floor so the landing readouts register
const RELAUNCH_CUE = 0.35; // s — glow duration right after relaunch
```

## Edit 2 — Rewrite `onFrame(dt)` to loop (replace the current body)
```js
function onFrame(dt){
  const T = fallTime();
  state.pan += dt;                                   // continuous — background scroll uses this
  if(state.relaunchCue > 0) state.relaunchCue = Math.max(0, state.relaunchCue - dt);

  if(state.landHold > 0){
    // Hold on the floor, then relaunch from the top.
    state.landHold = Math.max(0, state.landHold - dt);
    state.t = T; state.landed = true;
    if(state.landHold === 0){
      state.t = 0; state.landed = false;
      state.trail.length = 0;                        // fresh trail for the next loop
      state.relaunchCue = RELAUNCH_CUE;              // glow the readouts to cue the reset
    }
  } else {
    state.t += dt;
    if(state.t >= T){
      state.t = T; state.landed = true; state.landHold = LAND_HOLD;
    } else {
      const s = flyState();
      const last = state.trail[state.trail.length-1];
      if(!last || Math.hypot(s.x-last.x, s.y-last.y) > 0.02) state.trail.push({x:s.x, y:s.y});
    }
  }
  updateReadouts();
  draw();
}
```

## Edit 3 — Make the scrolling scene continuous (no snap on loop)
The background scroll and water currently use `state.t`, which resets each loop and would snap the scene back. Switch them to the continuous `state.pan`:
- In `drawBackground()`: `const beachOffset = state.frame==='cabin' ? -state.v * state.t : 0;`
  → `const beachOffset = state.frame==='cabin' ? -state.v * state.pan : 0;`
- In the water-ripple loop in `drawBackground()`: the phase `state.t*1.2` → `state.pan*1.2`.
- **Beach frame:** leave the ship/fly horizontal position on `state.t` (so the parabola still marches across a ground-fixed camera and the whole run resets together during the glowing hold — this is the same coordinated reset Ball-on-a-train uses in its train frame). Do NOT put the ship on `pan` (it would march off-screen).

## Edit 4 — Reset must clear the new fields
In `resetSim()` add: `state.pan = 0; state.landHold = 0; state.relaunchCue = 0;` (alongside the existing `state.t = 0; state.landed = false; state.trail.length = 0;`). Leave `onReset(){ resetSim(); }` as is.

## Edit 5 — The glowing "loop resetting" cue on the live readouts
Wrap the **two fly readout panels** (the `Fly · position` `.shell-panel` and the `Fly · velocity` `.shell-panel`) in a single container:
```html
<div id="live-readouts">
  … the two existing .shell-panel readout blocks, unchanged …
</div>
```
Add CSS (next to the other sim styles):
```css
#live-readouts{border-radius:8px;transition:box-shadow .25s ease, border-color .25s ease;}
#live-readouts.loop-cue{box-shadow:0 0 16px rgba(34,211,238,.4);}
#live-readouts.loop-cue .stat-value{color:#e0f2fe;}
```
At the end of `updateReadouts()` add the toggle:
```js
const live = document.getElementById('live-readouts');
if(live) live.classList.toggle('loop-cue', state.relaunchCue > 0);
```
(Optional nicety: also show a tiny `↻ looping…` label inside `#live-readouts` while `loop-cue` is on.)

## Do NOT touch (physics + everything else stays intact)
- `flyState()` and `fallTime()` formulas — byte-identical. The fall physics is unchanged; only the *scheduling* (loop vs. one-shot) and the background *scroll source* (`pan` vs `t`) change.
- The KaTeX equation panels, the frame toggle (`setFrame`) and its trail rebuild, the guided inquiry, `Shell.setLectureMode(true)` default, and the view/camera mapping (`computeView`/`wx`/`wy`) — unchanged (except the two `beachOffset`/water-phase lines in Edit 3).
- No shell-runtime edits.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `grep -n 'state.pan'` shows it: incremented in `onFrame`, used in `drawBackground` (beachOffset + water phase), and zeroed in `resetSim`. `grep -n 'relaunchCue'` shows decrement + set-to-RELAUNCH_CUE + the readout toggle.
3. `flyState`/`fallTime` bodies are unchanged vs. before; the KaTeX `K('eq-*', …)` strings are unchanged.
4. `#live-readouts` wraps exactly the two fly readout panels; `.loop-cue` CSS present.

Keep it surgical.
````

---

````markdown
# L06-s2 — Relative velocity of a plane · fix frame-picker gate + calc double-sign
`L06-s2-Rel_vel_of_a_plane_v2.html`

Two surgical fixes. **Do not touch the physics** (`v' = v − W` in `step()`, `refreshReadouts()`, `renderFormal()`) or any other behavior.

## Fix 1 — Enforce the frame-picker gate the About panel promises
The About table claims *"Frame-picker is disabled until after the prediction,"* but the picker is never actually disabled. Implement it — **but only while the student is on the unanswered prediction step**, so lecture mode (which starts past step 0) and later steps keep the picker fully usable.

**1a — CSS:** next to the existing `.frame-picker` rules (around the `SIM CSS` block, ~L233–242), add:
```css
.frame-picker.locked{opacity:.45;pointer-events:none;filter:grayscale(.3);}
```

**1b — Lock helper:** inside the SIM IIFE, add a function (near `refreshReadouts`):
```js
function updateFrameLock(){
  const fp = document.getElementById('framePicker');
  const card0 = document.querySelectorAll('#inq-cards .inq-step')[0];
  const answered = card0 && card0.classList.contains('answered');
  // Lock ONLY while sitting on the unanswered prediction (step 0).
  // Lecture mode + every later step leave it unlocked.
  if(fp) fp.classList.toggle('locked', Shell.step===0 && !answered);
}
```

**1c — Call it at the three moments the lock can change:**
- In the `onStep` hook (currently `onStep: (i)=>{ refreshReadouts(); }`) add `updateFrameLock();` after `refreshReadouts()`.
- In the step-1 choice handler, right after `card.classList.add('answered');`, add `updateFrameLock();`.
- In the `onReset` hook, after the prediction card is reset (its `answered` class removed) and before `fit();`, add `updateFrameLock();`.

(No need to guard the click handler — `pointer-events:none` already blocks clicks while locked.)

## Fix 2 — Remove the double-sign in the worked-calc / KaTeX text
`fmt()` and `fmtSigned()` are currently identical (both prepend `+`), so manual subtraction strings render as `"0 − +100"` and `"+200 − +100"`. Make `fmt()` **unsigned** (leave `fmtSigned` exactly as is):
```js
function fmt(v){
  if(Math.abs(v)<0.5) return '0';
  return '' + Math.round(v);
}
```
That single change fixes L983/985/987/988 (`cA/cB/cP` calc strings) and the KaTeX applied-lines (L1021–1023) → e.g. `"200 − 100 = +100"`. The standalone readout values (`vAlice/vBob/vPlane`, L973–975) use `fmtSigned`, so their signs are unaffected — verify they still show a leading sign.

## Do NOT touch
- Any physics: `frameW()`, the `v − W` computations, defaults `V=100 / u=200`, the position/animation logic, the recenter/wrap.
- `fmtSigned`, the frame-transform readouts' sign behavior, the guided-inquiry content, `Shell.setLectureMode(true)` default, KaTeX equations' math.
- The shell runtime block.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `fmt` no longer contains `(v>0?'+':'')`; `fmtSigned` still does.
3. `updateFrameLock` is defined and called in exactly three places (onStep, the choice handler after `answered`, onReset); `.frame-picker.locked` CSS present.
4. Physics functions (`frameW`, `step`, the `v − W` lines) are byte-identical to before.

Keep it surgical.
````

---

````markdown
# L06-s2 — Relative velocity of a plane · remove two on-canvas overlaps
`L06-s2-Rel_vel_of_a_plane_v2.html`

Two label overlaps to remove. Purely rendering/positioning — **do not touch any physics** (`frameW`, `step`, the `v − W` velocities) or any values.

## Overlap 1 — canvas frame-info box collides with the color legend (top-right)
The canvas draws a frame-info box ("Alice's rest frame (ground S)" + "frame speed vs. ground: W = …") pinned to the **top-right** of the canvas (in `render()`, the "Frame indicator (top-right)" block, ~L797–820: `boxX = W - boxW - 14; boxY = 14;`). The HTML `.legend` (Alice / Bob / Plane chips) is also pinned top-right (CSS `.legend{top:42px;right:16px;…}`). They sit on top of each other.

**Fix:** move the canvas frame-info box to the **top-left**, below the "East (+x)" compass, so it's on the opposite side from the legend. Change only its two position lines:
```js
// was: const boxX = W - boxW - 14;  const boxY = 14;
const boxX = 14;
const boxY = 44;   // clears the East compass (which occupies ~y24–40 top-left)
```
Leave the box's width-measuring, background, border, and both `fillText` calls unchanged (they position relative to `boxX`/`boxY`, so they follow automatically). Do NOT move or restyle the HTML `.legend`.

## Overlap 2 — Alice & Bob labels/velocities garble when their positions coincide
Alice and Bob are both drawn at `groundY - 22` (`render()`, ~L829/831), so when their x's coincide (at rest, or right after a frame switch resets positions) their velocity arrow (`y-34`), name label (`y-42`) and velocity text (`y-54`) overlap → "AlBoebb", "+1000 km/h".

**Fix:** lift **Bob's entire annotation stack** (arrow + name + velocity text) to a higher tier whenever he is horizontally close to Alice, so the two stacks never collide.

**2a — Give `drawActor` an optional vertical offset for its annotations.** Add a final `dy=0` param and apply it to the arrow, the zero-marker, and both text lines (leave the ICON at `y`, i.e. on the ground):
```js
function drawActor(x,y,label,color,vel,kind,dy=0){
  …icon drawing unchanged (still uses y)…
  // arrow:
  const ay = y - 34 - dy;                 // was: y - 34
  …
  // zero-velocity marker:
  ctx.arc(x, y-34-dy, 6, 0, Math.PI*2);   // was: y-34
  …
  // labels:
  ctx.fillText(label, x, y-42-dy);        // was: y-42
  …
  ctx.fillText(vLabel, lx, y-54-dy);      // was: y-54
}
```

**2b — In `render()`, detect the Alice/Bob proximity and lift Bob.** Where Alice and Bob are drawn, compute their pixel-x once and pass the lift to Bob only:
```js
const pxA = xRef + S.xA*pxPerKm;
const pxB = xRef + S.xB*pxPerKm;
const closeAB = Math.abs(pxA - pxB) < 54;
drawActor(pxB, groundY - 22, 'Bob',   COL.bob,   vB, 'train');   // draw train FIRST (behind)
drawActor(pxA, groundY - 22, 'Alice', COL.alice, vA, 'person');  // person on top, stays visible
drawActor(xRef + S.xP*pxPerKm, skyY, 'Plane', COL.plane, vP, 'plane');
```
Then give Bob the lift by passing `closeAB ? 30 : 0` as his `dy`:
```js
drawActor(pxB, groundY - 22, 'Bob', COL.bob, vB, 'train', closeAB ? 30 : 0);
```
(Alice keeps `dy = 0`. A 30 px lift puts Bob's stack at `y-64…y-84`, clearing Alice's `y-34…y-54` with a gap. Drawing the train before the person keeps Alice visible when they overlap.) Remove the now-inaccurate comment "slightly right of alice icon vertically."

## Do NOT touch
- Any physics: `frameW()`, `step()`, the `vA/vB/vP = … − W` computations, defaults, positions/animation.
- The legend markup/CSS, the guided inquiry, `Shell.setLectureMode(true)`, KaTeX, the sidebar readouts.
- The shell runtime block.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. The frame-info box now uses `boxX = 14; boxY = 44;` (top-left); the HTML `.legend` CSS is unchanged.
3. `drawActor` has a `dy=0` param applied to the arrow, zero-marker, and both `fillText` y-values; Bob is drawn before Alice and receives `closeAB ? 30 : 0`.
4. Physics functions unchanged byte-for-byte.

Keep it surgical.
````

---

````markdown
# L00-s2 — Fly on a boat · make the guided inquiry expose the sim step by step
`L00-s2-Fly_on_a_boat_v2.html`

Right now the guided-inquiry cards are just text — the scene never changes as you step through them, so every question is asked against the same static picture. The sim already accepts an `onStep` hook but **it is never passed to `Shell.init`**, so the cards are inert. Wire it up so each card drives the simulation into the state its question is about (predict = paused before release; run = playing), and align the card wording to that state.

**Do not touch the physics** (`flyState`, `fallTime`, `onFrame`, the trajectory math). This is purely wiring the step→scene mapping + prose. Keep the 6 cards in the **same order and same `data-correct` values** — the prediction-feedback handler keys on the step index (0, 2, 3), so renumbering would break it.

## Edit 1 — Add an `onStep` handler that exposes the scene per card
The sim already has `setFrame('cabin'|'beach')`, `resetSim()`, and `Shell.setPlaying(bool)` is exposed. Near the existing `onReset`/`onResize` hooks, add:
```js
function onStep(i){
  // Each card exposes the state its question is about:
  //  predict cards → paused at t=0 (fly at the ceiling, before release)
  //  run cards     → replay from t=0, playing
  switch(i){
    case 0: setFrame('cabin'); resetSim(); Shell.setPlaying(false); break; // predict, cabin, before release
    case 1: setFrame('cabin'); resetSim(); Shell.setPlaying(true);  break; // cabin: straight drop
    case 2: setFrame('beach'); resetSim(); Shell.setPlaying(false); break; // predict beach path, before release
    case 3: setFrame('beach'); resetSim(); Shell.setPlaying(true);  break; // beach: parabola, read v_x
    case 4: setFrame('beach'); resetSim(); Shell.setPlaying(true);  break; // evaluate, parabola running
    case 5: Shell.setPlaying(true); break;                                 // bridge / free explore
  }
}
```
Then pass it in the init call:
```js
// was: Shell.init({ onFrame, onReset, onResize });
Shell.init({ onFrame, onReset, onResize, onStep });
```
(`Shell.setLectureMode(true)` on the next line stays — it jumps to the last step, whose `onStep(5)` leaves the sim running; correct for the lecture default. Exiting lecture mode returns to step 1's predict-paused state, as it should.)

This also composes cleanly with the continuous-loop change: on run steps the fly loops; on predict steps it sits frozen at the ceiling.

## Edit 2 — Align each card's wording to the state it now drives
Keep the `<h4>` numbers, the `data-gate`/`data-correct` attributes, choices, and `.predict-eval` divs. Only adjust the framing prose so it matches the auto-driven scene:

- **Card 1 (step 0 — predict):** it's now **paused in the Cabin frame, just before release**. Add a line like: *"Below, you're in the Cabin frame, paused the instant before the fly is released. Before you run it —"* then keep the existing "Can both sketches be right?" question + choices.
- **Card 2 (step 1 — cabin run):** it now **auto-plays**. Change *"Press ▶ Play and watch"* → *"The fly is falling now in the Cabin frame — watch the position/velocity panels."* Keep the "straight down, x=0, vₓ=0, v_y=−gt" explanation.
- **Card 3 (step 2 — predict beach):** the view has now **auto-switched to the Beach frame and paused before release**. Change *"Now switch to the Beach frame (button below) and think first"* → *"The view has switched to the Beach frame, paused just before release. Predict first — what path will Galileo trace?"* Keep the A/B/C choices.
- **Card 4 (step 3 — beach run):** it now **auto-plays the parabola**. Add *"It's running now — read vₓ in the velocity panel."* Keep the question + choices.
- **Card 5 (step 4 — evaluate):** the **beach parabola is running** as they read this. Optionally open with *"With the parabola running,"* then keep the shared-vs-different summary.
- **Card 6 (step 5 — bridge):** unchanged (free-explore / complete state).

## Do NOT touch
- Physics: `flyState`, `fallTime`, `onFrame`, `resetSim`'s reset logic, `setFrame`'s transform/trail logic — unchanged.
- The prediction-feedback handler (the `stepIdx === 0/2/3` block) — the card order is preserved, so leave it as-is.
- Card count/order/`data-correct`, the shell runtime block, KaTeX equations, controls.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `Shell.init(...)` now includes `onStep`; `onStep` defines the 6-case switch calling `setFrame`/`resetSim`/`Shell.setPlaying`.
3. `flyState`/`fallTime`/`onFrame` bodies are unchanged; `data-correct` values and card order are unchanged (still 6 `.inq-step` cards, gates on cards 1/3/4).
4. Stepping the switch: even indices of predict cards (0,2) pause; run cards (1,3,4) play; frames are cabin (0,1) / beach (2,3,4).

Keep it surgical.
````

---

````markdown
# L06-s2 — Relative velocity of a plane · make the guided inquiry expose the sim step by step
`L06-s2-Rel_vel_of_a_plane_v2.html`

The guided inquiry currently asks its questions without driving the scene: `onStep` only calls `refreshReadouts()`, so the "Predict" question isn't anchored to the ground frame and stepping through cards doesn't change what's shown. Wire `onStep` so each card exposes the frame its question is about, and keep the scene moving so the relative motion is visible.

**Do not touch the physics** (`frameW`, `step`, the `v − W` velocities, defaults). This is scene-wiring + tiny prose only. Keep all 4 cards in the **same order** and keep the `data-c`/gate attributes — the prediction handler and the step-2 gate (`Shell.step===1`) depend on the order.

**Compatibility:** this sim has other pending prompts (frame-picker lock + double-sign; on-canvas overlap fixes). This edit only adds a helper and rewrites `onStep`; it composes with those. If the frame-lock fix is applied, its `updateFrameLock()` is preserved below via a `typeof` guard.

## Edit 1 — Extract a `selectFrame(f)` helper (single source of truth for frame changes)
Frame changes currently live only inside the `#framePicker` click handler. Add a reusable helper next to `refreshReadouts`:
```js
function selectFrame(f){
  document.querySelectorAll('#framePicker button').forEach(b=>b.classList.toggle('on', b.dataset.f===f));
  S.frame = f;
  S.xA = 0; S.xB = 0; S.xP = 0;   // fresh from origin, as the click handler already does
  refreshReadouts();
}
```
Then refactor the existing click handler to use it (behavior identical):
```js
document.getElementById('framePicker').addEventListener('click', e=>{
  const btn = e.target.closest('button[data-f]');
  if(!btn) return;
  selectFrame(btn.dataset.f);
  Shell.refit();
});
```

## Edit 2 — Rewrite `onStep` to drive the frame per card + keep the scene moving
`Shell.setPlaying` is exposed. Replace the current `onStep: (i)=>{ refreshReadouts(); }` with:
```js
onStep: (i)=>{
  // Expose the frame each card is about:
  //  step 0 (Predict): ground frame — student sees plane = 200, Bob = 100 before predicting
  //  step 1 (Check):   student switches to Bob's frame themselves — the gate enforces it; don't override
  //  steps 2–3 (Explore / Bridge): leave whatever frame the student is in
  if(i===0) selectFrame('alice');
  Shell.setPlaying(true);            // keep objects moving so relative velocity is visible (also separates the icons)
  refreshReadouts();
  if(typeof updateFrameLock === 'function') updateFrameLock();  // preserved if the frame-lock fix is applied
}
```
(Leave `Shell.setLectureMode(true)` on the following line as-is — it jumps to the last card, whose `onStep` keeps the scene running; exiting lecture mode returns to step 0 in the ground frame, as intended.)

## Edit 3 — Tiny wording alignment (optional, keep it minimal)
Keep all `<h4>` numbers, `data-c`, choices, gate, and `#eval1`/`#step2Status` intact. Only nudge two lines so they name the now-driven state:
- **Card 1 (step 0 — Predict):** it already describes the ground view ("Alice … sees the plane at u=200 … Bob at V=100"). Optionally append *"— that's exactly the view below."* so it's explicit the shown frame matches.
- **Card 2 (step 1 — Check):** keep "click Bob's rest frame …". Optionally add *"(the frame picker is unlocked now)"* if the frame-lock fix is applied.

No other card text changes.

## Do NOT touch
- Physics: `frameW`, `step`, the `vA/vB/vP = … − W` computations, defaults `V=100 / u=200`, position/animation, recenter/wrap.
- The step-2 gate logic in `refreshReadouts` (`Shell.step===1` → `stepReady`), the prediction-choice handler, KaTeX, the shell runtime block.
- Card count/order and `data-c` values.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `selectFrame` is defined and used by both the click handler and `onStep`; the click handler still calls `Shell.refit()`.
3. `onStep` calls `selectFrame('alice')` only for `i===0`, then `Shell.setPlaying(true)` + `refreshReadouts()`; step 1 does NOT force a frame (the gate still requires the student to pick Bob's frame).
4. Physics functions (`frameW`, `step`, the `v − W` lines) unchanged byte-for-byte; 4 `.inq-step` cards in original order.

Keep it surgical.
````

---

````markdown
# L06-s2 — Relative velocity of a plane · make the on-screen motion realistic (pace + smooth wrap)
`L06-s2-Rel_vel_of_a_plane_v2.html`

The objects crawl (~5 px/s for 100 km/h) so the motion looks unrealistic next to the km/h readouts. Fix the **animation pace** (not the km/h values) and smooth out the position wrapping. **Do not change any physics** — the km/h numbers, `frameW`, and the `v − W` velocities stay identical; only the playback speed and the on-screen position bookkeeping change.

## Edit 1 — Add a tunable animation time-scale constant
Near the top of the SIM IIFE (e.g. right after the `COL` colours), add:
```js
// Playback pace only (km/h readouts are unchanged). Higher = faster on-screen motion.
// 1/2 → "1 hour = 2 s": 100 km/h ≈ 31 px/s, 200 km/h ≈ 62 px/s. Tune 0.4–0.7 to taste.
const ANIM_TIME_SCALE = 1/2;
```

## Edit 2 — Rewrite `step(dt)` to use it + wrap smoothly
Replace the body of `step(dt)` (currently the `timeScale = 1/12`, the `const W = frameW()`, the position updates, and the `LIM`/mean-recenter block) with:
```js
function step(dt){
  const Wf = frameW();                 // frame velocity — renamed from W so it no longer shadows the canvas-width W
  const vA = 0 - Wf;
  const vB = S.V - Wf;
  const vP = S.u - Wf;
  S.xA += vA * dt * ANIM_TIME_SCALE;
  S.xB += vB * dt * ANIM_TIME_SCALE;
  S.xP += vP * dt * ANIM_TIME_SCALE;

  // Keep objects on screen with continuous edge-wrap (no jarring mean-recenter).
  // The active frame's rest object has v=0 → stays centred; moving objects wrap edge-to-edge.
  if(W > 0){
    const pxPerKm = Math.min(W,900)/900;
    const HALF = (W/2 + 24)/pxPerKm;   // half the visible width in km, + small off-screen margin
    for(const k of ['xA','xB','xP']){
      if(S[k] >  HALF) S[k] -= 2*HALF;
      else if(S[k] < -HALF) S[k] += 2*HALF;
    }
  }
  render();
}
```

**Why the rename matters:** the old `step()` did `const W = frameW();`, which **shadowed** the module-level `W` (canvas width). Renaming the local to `Wf` (matching `refreshReadouts`) frees `W` so the wrap can read the true canvas width. The velocities are computed exactly as before — only the variable name changed.

## Do NOT touch
- Physics/readouts: `frameW`, the `v − W` values, the km/h numbers, `refreshReadouts`, `renderFormal`, defaults `V=100 / u=200`, slider ranges.
- `render()` and `drawActor` (the `pxPerKm`/ruler drawing there is unchanged), the guided inquiry, frame picker, KaTeX, the shell runtime block.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `ANIM_TIME_SCALE` is defined once and used in all three position updates; `timeScale`/`LIM` no longer appear in `step`.
3. `step` uses `Wf = frameW()` for the velocities (no `const W = frameW()` shadow); the wrap uses the module `W` (canvas width) guarded by `if(W>0)`.
4. The `v − W` math (now `… − Wf`) is numerically identical to before; no other function changed.

Keep it surgical.
````

---

````markdown
# L7-s2 — Airplane & wind · fix the guided-inquiry flow (genuine predict → reveal → evaluate)
`L7-s2-Airplane_&_wind_v2.html`

The guided inquiry asks students to "predict" the round-trip time, but the answer is already on screen: entering each predict card auto-plays the flight (the split timer counts to the answer) AND the summary panel shows all three totals (8 · 10 · 12.5 h) from the very first card. So the predictions are read-offs. Also cards 3 and 4 sit in the identical state (Case 3 playing), so Case 3 is revealed twice while Case 2 never gets its own reveal beat.

Fix it so each case is **set up (answer withheld) → predicted → revealed**, with a progressive summary. **Do not change any physics** — `times()`, the km/h numbers, `onFrame` accumulation stay identical. This is inquiry-flow wiring + card text only. Keep the 5 cards in the same order and keep `data-gate` on cards 2 and 3.

## Edit 1 — Track which cases have been revealed (state + summary)
Add a reveal map to `state` (Case 1 baseline is always shown):
```js
revealed: {1:true, 2:false, 3:false},
```
In `updateSummary()`, show a case's total only once revealed (otherwise a "predict" placeholder):
```js
document.getElementById('sum1-val').textContent = state.revealed[1] ? t1.total.toFixed(2)+' h' : '— predict —';
document.getElementById('sum2-val').textContent = state.revealed[2] ? t2.total.toFixed(2)+' h' : '— predict —';
document.getElementById('sum3-val').textContent = state.revealed[3] ? t3.total.toFixed(2)+' h' : '— predict —';
```
(The leg timers already read 0.00 h while paused, so no extra hiding is needed there.)

## Edit 2 — `onStep`: withhold on unpredicted cards, reveal on evaluate/bridge
Replace the body of `onStep(i)` with logic that (a) re-hides predictions when the student (re)enters the start, (b) pauses at t=0 on a not-yet-predicted predict card so nothing is given away, and (c) reveals everything on the evaluate/bridge cards (also makes lecture-mode's final scene complete):
```js
function onStep(i){
  if(i===0) state.revealed = {1:true, 2:false, 3:false};   // restart of the inquiry → re-hide predictions
  if(i>=3)  state.revealed = {1:true, 2:true,  3:true };    // evaluate + bridge → everything revealed

  let target = state.caseNum;
  if(i===0) target = 1;
  else if(i===1) target = 2;
  else if(i===2 || i===3) target = 3;

  state.caseNum = target;
  document.querySelectorAll('.case-btn').forEach(b=>b.classList.toggle('active', parseInt(b.dataset.case,10)===target));
  resetFlight();
  updateSummary();
  renderKatex();

  const isPredict = (i===1 || i===2);          // crosswind / tail-head-wind predict cards
  if(isPredict && !state.revealed[target]){
    Shell.setPlaying(false);                    // paused at t=0 → prediction pending, answer withheld
  } else {
    Shell.setPlaying(true);                     // baseline / evaluate / bridge → run the flight
  }
  drawScene();
}
```

## Edit 3 — Reveal the case when the student answers its predict card
Give `wirePredict` the case number and reveal + play on answer, so the flight runs and the summary total appears only *after* the prediction is committed. Change the signature and the two calls:
```js
function wirePredict(cardIdx, evalId, caseNum, msgs){   // add caseNum
  ...
  c.addEventListener('click',()=>{
    if(card.hasAttribute('data-answered')) return;
    card.setAttribute('data-answered','');
    ... existing choice styling + evalBox ...
    // reveal the result now that they've committed:
    state.revealed[caseNum] = true;
    resetFlight();
    updateSummary();
    Shell.setPlaying(true);
  });
}
```
Update the calls:
```js
wirePredict(1, 'eval2', 2, { ...crosswind msgs... });   // card 2 → Case 2
wirePredict(2, 'eval3', 3, { ...tail/head msgs... });   // card 3 → Case 3
```

## Edit 4 — Card text: match the new rhythm + repurpose card 4 as evaluate
Keep the `<h4>` numbers, `data-gate`, `data-c`, `data-correct`, choices, and `.predict-eval` divs. Only adjust prose:
- **Card 2 (crosswind predict):** end with a line like *"The timer is paused — commit to an answer before it runs."* Keep the `v_ground = √(100²−60²) = 80 km/h` setup line (that's the given; the round-trip **time** is what they predict).
- **Card 3 (tail/head predict):** keep the leg speeds (given) and the "do the legs cancel?" question; add *"Predict before it runs."*
- **Card 4 — reframe from "Watch it play out" to an evaluate/compare beat** (Case 3 was already revealed when they answered card 3). New content, e.g.:
  - `<h4>4 · Compare — why any wind is slower</h4>`
  - "All three totals are now in the summary: **8 · 10 · 12.5 h**. The tail/head-wind case (12.5 h) is the slowest because you're stuck in the slow 40 km/h headwind leg for 10 h — the fast leg can't make up for it. And the parallel (12.5 h) and perpendicular (10 h) cases differ."
- **Card 1 (baseline)** and **Card 5 (bridge):** unchanged.

## Do NOT touch
- Physics: `times()`, `onFrame` accumulation, the km/h/DIST/AIRSPEED constants, `SIM_HOURS_PER_SEC`, `renderKatex` math, slider range.
- Card count/order and the gate/`data-correct` attributes; the shell runtime block.

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `state.revealed` exists; `updateSummary` gates each `sum*-val` on it; on load only Case 1 shows a number, Cases 2 & 3 show "— predict —".
3. Entering card 2 or card 3 (unpredicted) leaves the flight paused (timers 0.00); answering the card sets `revealed[caseNum]=true`, plays the flight, and fills that summary total.
4. Reaching card 4/5 reveals all three totals. `times()`/`onFrame` unchanged byte-for-byte.

Keep it surgical.
````

---

```markdown
# L12-s2 — Twin paradox (one-way call) · expose the sim step by step in the guided inquiry
`L12-s2-Twin_Paradox_v2.html`

The 6-card content flow is good, but the simulation state isn't tied to the cards: `onStep` never sets the frame or the play state, both predicted values are already on screen, and the animation free-runs regardless of which card you're on. Fix it so each card exposes exactly its state, in sequence. **Highest priority: the sim must be exposed step by step in the correct order.** **Do not change any physics** (`eventsS`, `boost`, `gamma`, the τ formulas) — this is inquiry-state wiring + reveal-gating + minor card text.

Cards (indices): 0 Set scene · 1 Predict τ_B (gate) · 2 Send signal · 3 Predict τ_A (gate) · 4 Change frames S→S′ · 5 Resolve.

## Edit 1 — Add a reusable `setFrame(f)` helper
Frame changes live only inside the `.fbtn` click handler. Extract a helper (used by the toggle AND `onStep`):
```js
function setFrame(f){
  state.frame = f;
  document.querySelectorAll('.fbtn').forEach(b=>b.classList.toggle('active', b.dataset.frame===f));
  autoView(); updateReadouts(); draw();
}
```
Refactor the `.fbtn` click handler to call `setFrame(btn.dataset.frame); Shell.refit();`.

## Edit 2 — Hide the predicted values until the student answers
Add reveal flags to `state`: `revealB:false, revealA:false`.

In `updateReadouts()`, gate the two proper times (and the ratio) on them:
```js
document.getElementById('tauB').textContent = state.revealB ? tauB.toFixed(2) : '?';
document.getElementById('tauA').textContent = state.revealA ? tauA.toFixed(2) : '?';
document.getElementById('ratio').textContent = (state.revealA && state.revealB) ? (tauA/tauB).toFixed(3) : '?';
```
In `draw()`, gate the τ labels on the event dots the same way — the E_C dot's `τ_B = …` sublabel only when `state.revealB` (else pass `'τ_B = ?'` or no sublabel), the E_R dot's `τ_A = …` only when `state.revealA`. Also gate the floating τ_B label in `drawBellaSweep` on `state.revealB`.

Reveal on answer: give `wireChoices` an `after` callback fired once the student picks, and use it to reveal + redraw:
```js
function wireChoices(evalId, correctKey, feedback, after){
  return function(container){
    ...
    btn.addEventListener('click', ()=>{
      ...existing styling + evalEl...
      if(after) after();          // reveal now that they've committed
    });
  };
}
// calls:
wireChoices('eval1','c',{...}, ()=>{ state.revealB=true; updateReadouts(); draw(); })(step2);
wireChoices('eval2','c',{...}, ()=>{ state.revealA=true; updateReadouts(); draw(); })(step4);
```

## Edit 3 — Rewrite `onStep(i)` to drive frame + reveal + animation per card
Replace the current `onStep` body:
```js
function onStep(i){
  // Frame per card: S for scene/predict/signal + resolve; S′ for the frame-change card.
  setFrame(i===4 ? 'Sp' : 'S');

  // Reveal gating tied to the cards (re-hide when before the predict; show both once past them).
  if(i<2) state.revealB = false;
  if(i<4) state.revealA = false;
  if(i>=4){ state.revealB = true; state.revealA = true; }   // frame-change + resolve rely on showing invariance

  // Freeze the sim at the state each card is about; only the signal card animates.
  const tR = state.tC*(1+state.v);
  if(i===0){ state.tSweep = 0;          Shell.setPlaying(false); }  // scene set — Bella not sent yet
  else if(i===1){ state.tSweep = state.tC; Shell.setPlaying(false); }  // Bella held AT E_C — predict τ_B
  else if(i===2){ state.tSweep = state.tC; Shell.setPlaying(true);  }  // animate the 45° signal climbing to E_R
  else if(i===3){ state.tSweep = tR;    Shell.setPlaying(false); }  // signal ARRIVED at E_R — predict τ_A
  else {          state.tSweep = tR;    Shell.setPlaying(false); }  // change-frames + resolve: full static picture

  autoView(); updateReadouts(); draw();
}
```
(`setFrame` already redraws; the trailing calls are harmless. `Shell.setPlaying` is exposed. Since the shell only calls `onFrame` while playing, pausing genuinely freezes `tSweep` at the value set above — so predict cards hold their meaningful frozen state instead of looping.)

## Edit 4 — Card text: match the auto-driven state
Keep all `<h4>` numbers, `data-gate`, `.choice` `data-c`/order, and `.predict-eval` divs. Only adjust prose:
- **Card 2 (predict τ_B):** add *"(predict before the value is revealed — τ_B is hidden until you answer)."*
- **Card 4 (predict τ_A):** add *"(τ_A is hidden until you answer)."*
- **Card 5 (change frames):** it's now auto-switched — change *"Now switch to Bella's rest frame S′ using the toggle in the sidebar."* → *"The view has switched to Bella's rest frame S′. Bella is now vertical; Alice recedes at −v."* Keep the three invariance bullets.
- **Cards 1, 3, 6:** unchanged.

## Do NOT touch
- Physics: `eventsS`, `boost`, `gamma`, `τ_B=t_C/γ`, `τ_A=t_C(1+v)`, the 45° signal geometry, slider ranges, drag-E_C.
- Card count/order and gate/`data-c` attributes; the shell runtime block; `updateReadouts`' event-coordinate lines (E₁/E_C/E_R coords stay shown — only the τ values are gated).

## Do NOT run a browser or HTTP server
Verify statically; leave visual confirmation to me.

## Verify (no browser)
1. `node --check` on the inline sim script passes.
2. `onStep` calls `setFrame('S')` for cards 0–3 and 5, `setFrame('Sp')` for card 4; sets `Shell.setPlaying(true)` only for card 2; sets `tSweep` per card as above.
3. On load / card 2, `#tauB` shows `?` until the card is answered; on card 4, `#tauA` shows `?` until answered; both show numbers on cards 5–6.
4. Physics functions unchanged byte-for-byte; 6 cards in original order; frame toggle still works manually.

Keep it surgical.
````
`
# L14-s1 — momentum vs velocity: hover readout at v→c + "your point" vanishes off-frame

````
Edit ONLY `L14-s1-momentum-vs-velocity-shell.html`. Make two surgical changes inside the
`draw()` function. Do NOT touch the "SHELL RUNTIME — emit VERBATIM" block. Do NOT start a
browser or HTTP server — verify statically with `node --check` on the extracted <script> and
with grep. Preserve the physics exactly (relativistic momentum stays p = γ·m₀·v via pRel/gamma;
do not change VMAX, ymax, the curve sampling, or the divergence arrow).

Two feedback items:
1. The hover read-off (the box that follows the mouse) must NOT show a finite p (or γ) when the
   displayed velocity rounds up to the speed limit "1.000c". Because hoverV is capped at
   VMAX=0.9995 and (0.9995).toFixed(3) === "1.000", the tooltip currently reads "v = 1.000c,
   p = <finite>", which is wrong — at v = c both p and γ diverge. When the displayed v rounds to
   "1.000c", show the divergence instead of a number.
2. The violet slider-bound "your point" marker must VANISH when its momentum runs off the top of
   the plot (p > ymax), rather than clamping to the top edge with an up-arrow. For larger masses
   the point currently gets stuck at the top (~p = 10). When it is out of frame, draw nothing for
   it — the relativistic curve's existing "p → ∞" divergence arrow already conveys the blow-up.

--- CHANGE 1: hover read-off text (inside `if(state.hoverV!==null){ ... }`) ---

REPLACE:
    const t1='v = '+v.toFixed(3)+'c';
    const t2='p = '+g3(p);
    const t3='γ = '+g3(gamma(v));

WITH:
    const atC = (v.toFixed(3)==='1.000');          // v rounds up to the speed limit → p, γ diverge
    const t1='v = '+v.toFixed(3)+'c';
    const t2= atC ? 'p → ∞' : ('p = '+g3(p));
    const t3= atC ? 'γ → ∞' : ('γ = '+g3(gamma(v)));

(Leave the crosshair line, the hover dot, and the tooltip box layout unchanged.)

--- CHANGE 2: "your point" marker vanishes when off-frame ---

REPLACE the entire block:

  /* slider-bound static marker ("your point") */
  {
    const v=state.vSel, p=pRel(v,m0), x=VX(v);
    const clamped = p>ymax;
    const y = clamped ? Y0+2 : PYr(p);
    ctx.strokeStyle='rgba(167,139,250,.55)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(x,Y1); ctx.lineTo(x,y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#a78bfa'; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,5.5,0,7); ctx.fill(); ctx.stroke();
    if(clamped){
      ctx.fillStyle='#a78bfa'; ctx.beginPath();
      ctx.moveTo(x,Y0-2); ctx.lineTo(x-5,Y0+8); ctx.lineTo(x+5,Y0+8); ctx.closePath(); ctx.fill();
    }
    ctx.font='bold 12px Inter,sans-serif'; ctx.fillStyle='#c4b5fd';
    ctx.textAlign='left'; ctx.textBaseline='bottom';
    const lbl='your point';
    const tw=ctx.measureText(lbl).width;
    let lx=x+9; if(lx+tw>X1) lx=x-9-tw; if(lx<X0+2) lx=X0+2;
    let ly=y-8; if(ly<Y0+14) ly=y+22;
    ctx.fillText(lbl, lx, ly);
  }

WITH:

  /* slider-bound static marker ("your point") — vanishes when it runs off the top of the plot */
  {
    const v=state.vSel, p=pRel(v,m0), x=VX(v);
    if(p<=ymax){                        // out of frame ⇒ draw nothing (curve's "p → ∞" arrow shows the blow-up)
      const y = PYr(p);
      ctx.strokeStyle='rgba(167,139,250,.55)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x,Y1); ctx.lineTo(x,y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='#a78bfa'; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,y,5.5,0,7); ctx.fill(); ctx.stroke();
      ctx.font='bold 12px Inter,sans-serif'; ctx.fillStyle='#c4b5fd';
      ctx.textAlign='left'; ctx.textBaseline='bottom';
      const lbl='your point';
      const tw=ctx.measureText(lbl).width;
      let lx=x+9; if(lx+tw>X1) lx=x-9-tw; if(lx<X0+2) lx=X0+2;
      let ly=y-8; if(ly<Y0+14) ly=y+22;
      ctx.fillText(lbl, lx, ly);
    }
  }

After editing, verify:
- `node --check` passes on the extracted <script>.
- grep confirms the token `clamped` no longer appears in the file.
- grep confirms `atC` appears exactly once in the hover block.
````
