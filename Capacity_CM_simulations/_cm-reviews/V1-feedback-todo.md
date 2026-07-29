# Classical Mechanics — V1 Feedback To-Do (first 10 sims)

Sources:
- **Spreadsheet:** "Classical Mechanics Syllabus and Course Planning.xlsx" → *Final Simulation Ideas* tab → `v1 changes` column (rows 2–11) + threaded cell comments.
- **Review doc:** "New sims review (1).docx" → general *Pedagogy* / *Physics* feedback + per-sim notes.

Legend: `[v1]` = spreadsheet v1-changes column · `[review]` = review doc · `[comment]` = threaded cell comment · `[David]` = open question for David (decide before/with the change).

---

## 0. GLOBAL — applies to ALL 10 sims (from review doc "general" sections)

**Pedagogy**
- [ ] **Top bar:** too many icons/displays; hard to know what to click. **Play and Reset must always be in the exact same place — top-right of the top bar.**
- [ ] **Readouts:** far too much text / too many constants. If a value is set by a slider (e.g. ω, r), do **not** also repeat it as (1) a readout below the sim and (2) canvas text. Readouts should give **just the numbers**; explain what's happening in **one intro paragraph/summary**, not scattered companion text.
- [ ] **Kill "AI-speak" companion text** on canvases/readouts (undefined mini-explanations; different names for the same concept in different places).
- [ ] **Show the key equations/symbols on the canvas** (not only in Formal mode) — put symbols where the quantity appears (e.g. `v₀` on the velocity arrow, `θ` at the launch angle, `F_drag = −bv`).
- [ ] **Length legend** ("1 m" scale bar) is usually distracting — remove it where the canvas already has a lot of visual content (keep only in sparse sims).
- [ ] **Multi-frame sims:** never display a quantity that is only true in frame B while frame A is selected (e.g. "v (rot frame)" shown in the lab frame).
- [ ] **Greek case (physics):** stop capitalizing symbols that should be lowercase (capital `Ω` → lowercase `ω`, etc.). Audit every sim.
- [ ] **Remove the "⋅" text divider everywhere.** `x ⋅ y` has a specific mathematical meaning; don't use "⋅" just to separate text. (Recurring — these are the "sneaky dot-product separators.")
- [ ] **Follow the lecture-notes / prompt notation** — several sims diverge from David's notation.
- [ ] **Misconception framing (design):** avoid rendering incorrect physics at the same level as correct physics (the current `⚠` counterfactual pattern). Incorrect physics "doesn't happen," so don't animate it as if it does. Prefer thought-experiment intros ("Your friend says X — do you agree, why/why not?"). Don't make every sim state a misconception and re-simulate its wrong physics. (A few exceptions OK, e.g. Michelson–Morley / double-slit predictions.)
- [ ] **"Counterfactual modes"** (the `⚠` "trust the formula / reality is the ghost" style toggles) are **not a useful way to introduce concepts** — reconsider them wherever they appear (esp. pendulum, damped/driven, harmonic). Sidebar copy for them is often meaningless AI-speak.
- [ ] **Drop the "What changes versus what doesn't?" framing** as a student category/stage — the review calls it a "messy" / "not particularly useful" category; students won't learn much from it. (Not present as that exact label in the current files, but avoid reintroducing it and rework any equivalent.)

---

## 1. L2 — Newton's Laws  ·  `L2-Newtons-laws.html`

- [ ] `[v1]` Remove the **twinkling** building lights (keep lights steadily on).
- [ ] `[v1]` **Inertia stage:** show a **puck on ice**, not a car on a road (a car needs friction to move; inertia stage should show frictionless motion).
- [ ] `[v1]` **"Pairs" scene:** remove **centre of mass** (concept not introduced yet).
- [ ] `[v1][David]` **"Pairs" scene:** remove the background (distracting) — confirm with David.
- [ ] `[review]` **2nd law: default animation speed is far too fast** — it starts looping almost immediately. Slow it down.
- [ ] `[review]` The velocity graph goes **"off the graph" but is drawn flat — incorrect & misleading.** Draw the graph small (e.g. upper-right of canvas) and **dynamically rescale the axes** as needed; never show a clipped-flat curve.
- [ ] `[review]` Fix **overlapping components** on the canvas.
- [ ] `[review]` Remove the **bottom-right readouts** — pixel count and "clamped" are meaningless/distracting to students.
- [ ] `[comment E2]` **Add a 4th scene: two-body interaction/collision** (e.g. a big box shoving a small box) targeting the "bigger objects push harder" misconception. Each body has **its own force readout that appears after** the student predicts which exerts the larger force (correct: **equal & opposite**).

---

## 2. L4 — Forces on Objects Explorer  ·  `L4-Forces on objects explorer.html`

- [ ] `[v1]` Move the **whole triangle + block setup slightly left** so that with "Show Components" on, the `mg·cosθ` label fits on the right-hand side (see Slack image).
- [ ] `[v1]` **Show Components:** make the dashed component lines **red** to match the `mg` arrow; and **fade the actual `mg` arrow** (reduced opacity) when components are shown — so it doesn't look like extra forces are being added (same force, different visualization).
- [ ] `[v1]` **Show Net Force:** render `mg`, `N`, and friction arrows **more faintly** (lower opacity) than the purple net-force arrow.
- [ ] `[v1]` (final version, not urgent) Show-Components is unfinished: components don't show for a force added via **Add Force** — fix for the final version.
- [ ] `[review]` Remove the **"2 m" legend** — meaningless and physically wrong (forces aren't in metres).
- [ ] `[review]` Sim should **not loop** when it reaches the edges.
- [ ] `[review]` Fix **overlapping elements** — the force values currently can't be read.
- [ ] `[review]` **On Play:** remove the force arrows and mass; show **only acceleration and velocity**.
- [ ] `[review]` **Controls:** balanced forces are finicky to dial in — add **text entry** for force magnitudes/angles.

---

## 3. L4 — Projectile Motion  ·  `L4-Projectile motion.html`

- [ ] `[v1]` In the legend, rename **"ghost trails" → "previous trials."** (Otherwise looks good.)
- [ ] `[review]` Remove the **"⋅" text divider** (use plain separators).
- [ ] `[review]` Put the **symbols `v₀` and `θ` on the canvas** where they appear (`v₀` on the velocity vector arrow, `θ` at the launch angle) — not just repeated numbers.
- [ ] `[review]` **Very little of the canvas is used — zoom in further at the start** (currently only usable when v and m are maxed).
- [ ] `[review]` Fix the **overlapping elements** on this canvas.

---

## 4. L16 — Friction in Three Dimensions (projectile drag)  ·  `L16-Friction-in-3d.html`

- [ ] `[v1][review]` **Fix notation to match the lecture notes / prompt:** use **`b`** as the (linear) drag coefficient instead of `k`/`m`. Check David's lecture notes (Canvas link in Slack).
- [ ] `[v1][review]` Implement the prompt: **student chooses linear (`F = −bv`) or quadratic (`F = −c|v|v`) drag.** (Currently missing.)
- [ ] `[review]` The **vacuum model should NOT carry the `⚠` warning sign** — a projectile in vacuum is correct physics, not a misconception.
- [ ] `[review]` Write the drag equation **on the canvas** (e.g. `F_drag = −bv`), not only in Formal mode.
- [ ] `[review]` **Very little of the canvas is used — zoom in further** at the start.
- [ ] `[review]` Put the **symbols `v₀` and `θ` on the canvas** where they appear.
- [ ] `[review]` (Physics overall correct — the outstanding issues are prompt setup + notation.)

---

## 5. L6 — The Harmonic Oscillator  ·  `L6-The harmonic oscillator.html`

- [ ] `[v1][review]` **Default to ONE ball.** The second ball complicates the sim with little benefit (and the sliders only change one ball's values). Add a **checkbox / "Compare two masses" mode** that, when enabled, reveals the `A₂` slider and the second mass.
- [ ] `[review]` **Default animation speed is far too fast** — slow it down.

---

## 6. L7 — Motion in a Potential  ·  `L7-Motion in a potential.html`

- [ ] `[v1][review]` **`E_top` case must not roll/oscillate back.** The lesson is that reaching the top takes **infinite** time; but the sim currently times out (~max float precision / ~1 min) and then shows the ball rolling back / oscillating — incorrect and undermines the lesson. Make it asymptotically stall (never returns).
- [ ] `[review]` Make the **`|v|` readout much more prominent** — the key idea is speed decreasing but never reaching 0 near `E = E_top`; it's currently lost among many readouts/icons.
- [ ] `[review]` **`x₀` slider must respect the energetically-allowed region.** Currently `x₀ = 2.15` is selectable but not allowed (must be `< 2`), so the slider value contradicts the on-screen text. Constrain the slider to allowed values (or switch to **click-to-place the ball**, per the original prompt).
- [ ] `[v1]` (Text density) probably more on-canvas text than the final wants — keep for now, prune later with David.
- [ ] `[comment J7]` Add inquiry question: **"Predict the turning points by placing the E-line yourself before running."**

---

## 7. L9 — The Pendulum  ·  `L9-The pendulum.html`

- [ ] `[v1]` Move the **plot to the right** of the pendulum (below squashes both).
- [ ] `[v1][review]` **Default `θ₀ = 5°`** and **cap max `θ₀` at 90°** (divergence toward 180° is out of scope).
- [ ] `[v1][review]` **Fixed ceiling** — the pivot/ceiling shouldn't move when `L` changes; only the rod length should change. *(Partly addressed by the recent fixed-scale/centred-pivot work — verify it fully satisfies this.)*
- [ ] `[v1][review]` **Period plot y-axis:** currently `T/T₀` (doesn't rescale) — but a silently-rescaling axis is misleading. Decide: **plot `T` itself** so the scale change is honest/visible (easier once `θ₀` is capped at 90°). `[David]`
- [ ] `[v1]` Remove the **"⋅" dot-product separator** in the plot display.
- [ ] `[review]` Remove the **"ghost lead 56% accumulated / % of a period"** statistic — not useful.
- [ ] `[review]` Relabel **"T exact (K)" → "T exact"** — `K` (elliptic integral) is unexplained and beyond scope. *(May already be reworded — "T exact (K)" not found in the current file; verify.)*
- [ ] `[review]` Put the **symbols `L` and `θ` on the canvas** where they appear (e.g. when `L`/`θ` change, show the labelled diagram instead of auto-playing).
- [ ] `[review]` **Rework the small-angle counterfactual sidebar copy** — the flagged text ("⚠ Small-angle — trust the formula … reality becomes the dashed ghost … only the emphasis swaps") is meaningless and self-contradictory (a "warning" that also says "trust"). *(Verbose wording appears already removed; confirm the remaining `⚠ Small-angle` copy reads clearly — see global counterfactual note.)*
- [ ] `[David]` Which readouts to show?

---

## 8. L17 — The Damped Harmonic Oscillator  ·  `L17-The damped HO.html`

- [ ] `[v1][David]` **Leave the "settle race" option for now**; refine its visuals later — first ask David whether he wants it.
- [ ] `[v1]` **Check the `⚠` warning symbol on the settle-race view:** is anything actually incorrect being rendered, or is it only flagging a student misconception (about which order they settle in)? Fix if incorrect; otherwise reconsider per the global "misconception framing" note.
- [ ] `[global]` Apply global fixes: Greek case, remove "⋅" dividers, trim readout clutter, check default speed.
- ⚠ **Note:** the review doc's per-sim section covers **"Driven Resonance"** (a mass-on-spring driven by `F₀cos(Ωt)`, resonance curves, free-motion regimes), which is **not one of these 10 files** and appears to be a separate/upcoming sim. If L17 is meant to grow into that, its extra requirements are: follow the driven-resonance prompt (use `Ω` not `ω` for drive; add free-motion mode with under/over/critically-damped regimes; allow small-`α` divergence; higher-res plot x-axis; don't compare to a "naive prediction"; fix `ω/ω₀` axis-label overlap). Confirm scope with the manager.

---

## 9. L29 — The Centrifugal Force  ·  `L29-The centrifugal-force-shell.html` (+ `L29-The centrifugal-force.html`)

- [ ] `[v1]` Make the **trajectory line much stronger / wider**.
- [ ] `[v1]` **Match colours to the legend** — the in-sim colours (e.g. the purple arrow) look fainter than in the legend.
- [ ] `[v1]` **Remove the "Fling claim" option.**
- [ ] `[v1]` **Default to 0.5× speed.**
- [ ] `[review]` **Greek case:** lowercase `ω`, not capital.
- [ ] `[review]` Remove **"Constants m = 1.00 kg · g = 9.81 m/s²"** — gravity is irrelevant to this sim (and drop the "⋅").
- [ ] `[review]` **Strip the confusing companion readout text** (this sim is the doc's main example): `τ` is never defined; "agent: latch" is meaningless; "r ball → axis" implies a new symbol when `r₀` is already defined; "= ω·r₀ (riding)" — "riding" is unclear. Readouts should be **just numbers**; move any explanation to one intro paragraph.
- [ ] `[review]` Length legend ("1 m") is distracting here (lots of visual content) — remove.
- [ ] `[David]` Look of this one vs. the Coriolis one (standardize).

---

## 10. L30 — The Coriolis Force  ·  `L30-The coriolis-force.html`

- [ ] `[v1]` **"Table" vs "Earth Pole":** clarify what they change. If they only change **rotation speed** (not table radius), move them to **small selectable options directly under the rotation-rate slider**.
- [ ] `[v1]` Rename the **"camera" heading → "frame selector"**, and move the frame selector to the **top of the sidebar**.
- [ ] `[v1]` Rename **"wind speed" → "launch speed."**
- [ ] `[v1]` After launch the ball gets stuck while the table keeps rotating under it — instead **pause the table after launch** *or* **loop the launches**.
- [ ] `[review]` Show the **green velocity arrow in the lab frame too** (constant velocity there).
- [ ] `[review]` Draw **all vectors/trajectories more strongly** — currently hard to see.
- [ ] `[review][global]` **Don't show "v (rot frame)" while the lab frame is selected** (multi-frame rule).
- [ ] `[v1][David]` Standardize the **overall look** with the centrifugal sim.

---

### Cross-cutting quick wins (touch many sims at once)
- Remove every **"⋅" text divider** (L9, L29, projectile sims, …).
- **Lowercase Greek** audit (L29, L30, and any others).
- **Default speed** too fast: L2 (2nd law), L6 — and check the rest.
- **Play/Reset placement** standardized top-right across all.
- **Symbols on canvas** (`v₀`, `θ`, `L`, `F_drag`): L4-Projectile, L16, L9.
