# SR Simulations — Manager Feedback To‑Do List

**Meeting:** SR sims discussion — 2026‑07‑03 (18:30 IST)
**Reviewer / manager:** Erin Crawley  ·  **Implementer:** Binayak Samal
**Source:** *Notes by Gemini* (Summary · Decisions · Next steps · Details) + full transcript (00:00:54 → 01:42:35)
**Scope:** the last 10 SR simulations, reviewed sim‑by‑sim in order.
**Downstream owner:** Claudia (receives the updated guided‑inquiry versions via a GitHub link).

> **How to read this.** Items are grouped **Global** (apply to every sim) first, then one section per simulation in the order Erin reviewed them. Each item is a concrete, actionable change with the transcript timestamp(s) in brackets for traceability. Priority tags: **[P0]** must‑do for the Monday share (units, readouts, guided inquiry), **[P1]** should‑do, **[P2]** nice‑to‑have / future. Erin gave the most in‑depth feedback on the first few sims (L10–L13); many of those comments were explicitly said to apply to all the others.

---

## 0 · Global changes (apply to every simulation)

- [ ] **[P1] Remove default moving points from plots.** The auto‑moving dot/probe on static plots is distracting (the eye follows motion). Remove it across all plot sims. [00:02:16]
- [ ] **[P1] Hide irrelevant sliders/cards during guided inquiry.** On each guided‑inquiry card show only the controls the current step needs; grey‑out/hidden is better than "blinking to show where it is." [00:03:27, 00:04:23]
- [ ] **[P0] Start paused + predict‑before‑run.** Sims should open paused and require the student to commit a prediction before the simulation runs (not auto‑play from load). [00:12:20]
- [ ] **[P1] Gate progress on checking the answer.** Lock the *Next / Finish* button until the student has answered and reviewed the reasoning; then it becomes functional. [00:13:20]
- [ ] **[P1] Prediction UX — always allow viewing the correct explanation.** If a student picks a wrong option, still let them click the correct (green) option to read its explanation (helps students torn between two answers). [00:46:43, 00:48:06]
- [ ] **[P1] Cut in‑sim instructional text; rely on guided‑inquiry prompts.** Don't repeat "move the boost slider and watch…" inside the sim — put instructions in the guided‑inquiry card only. Be ruthless about trimming text. [01:08:41]
- [ ] **[P1] Hide detailed numeric readouts by default, with a toggle.** Raw number readouts are often hard to interpret; keep them off by default (like the ∑ Formal panel) with an option to show. [01:14:42, 01:18:28]
- [ ] **[P1] Every displayed quantity must earn its place** *(design principle Erin emphasized)*. If a number/stat/quantity is shown, it should be explained and needed for a reason — otherwise remove it. This drives many of the specific asks below (emphasize x²+y², drop the 0.9‑γ readout, remove "proper acceleration" / the extra proper‑time number, hide raw readouts). [00:06:30]
- [ ] **[P1] No separate "lecture demo" mode.** Decision: simply **hiding the guided inquiry** is sufficient for lecture use — do **not** build a separate lecture‑display mode. Share the guided‑inquiry versions; tell Claudia she can hit *Skip* to get the bare controls. [01:37:40, 01:38:45, 01:39:57]
- [ ] **[P2] "Friend says" is a misconception tool.** It presents a misconception without validating it, so students stay skeptical — keep this framing; not every sim needs one. [01:13:38]

---

## 1 · L10‑s2 — Lorentz transformation vs Euclidean rotation
*(first sim reviewed; many comments here were said to apply to the others)*

- [ ] **[P1] Remove the moving "purple guy" probe.** The purple oscillating point requires too much explanation; delete it. [00:11:16] (also the general moving‑point removal, [00:02:16])
- [x] **[P1] Hide the Lorentz‑boost panel + irrelevant sliders during the rotation step.** While the student is on the rotation card they only need the left (rotation) panel and its one slider; the greyed‑out boost panel is distracting with no context yet. [00:03:27, 00:04:23]
- [ ] **[P1] Emphasize that x² + y² is invariant** (rather than emphasizing that the axes stay at 90°). If the sim keeps displaying the inter‑axis angle as a stat, that's fine — but the highlighted/taught invariant should be x² + y². [00:05:36, 00:06:30]
- [ ] **[P1] Turn on the grid but remove the blue dashed lines.** The primed grid is nice; the extra blue dashed line on each axis makes it busy. Offer the grid as the toggle, not the dashed lines. [00:08:48]
- [ ] **[P2] (Superseded) Guided/lecture toggle.** Originally planned to mock a toggle between guided‑inquiry and lecture modes — later superseded by the global decision to just hide the guided inquiry. No separate mode needed. [00:10:14 → 01:37:40]

---

## 2 · L11‑s2 — Light clock & geometric derivation of time dilation

- [ ] **[P1] Replace "roundtrip time" with "one tick of the clock."** "Roundtrip" may be misread as the clock moving back and forth. [00:13:20]
- [ ] **[P0] Tighten the proper‑time definition.** Current wording is word‑salad; use the simpler "proper time = the time in the **rest frame of the object**" (the single clock present at both events). [00:15:40, 00:16:45]
- [ ] **[P1] Reframe as one lab frame with two clocks.** Instead of "rest frame vs lab frame," present the **lab frame containing one static clock and one moving clock** — cleaner ("I'm only ever in one frame, looking at two clocks"). Signpost clearly which frame the question is asked in. [00:14:22, 00:15:40]
- [ ] **[P1] Remove the velocity‑change transition animation.** When v changes, jump directly to the new state (start from the new value) rather than animating the transition — or add a ~10 ms settle. [00:19:39]
- [ ] **[P1] Label the three triangle sides** (h, vt/2, ct/2). [00:19:39]
- [ ] **[P1] Keep the zoom grid.** The background grid that scales with the scene (so shrinking reads as zoom, not a physical shrink) is endorsed — keep it. [00:18:44]
- [ ] **[P1] Hammer the derivation on step 5.** Make step 5 explicitly "this is *how* you find the time‑dilation factor / *why* the equation is true" — compare the two sides of the equation. [00:22:52]
- [ ] **[P2] (Future) Frame‑switch extension.** On step 6, optionally allow switching to the orange (moving) clock's frame to show the reciprocal effect (the blue clock now the moving one) — and make the reciprocity resolution interactive (switch frames and watch) rather than just reading the rebuttal. Not high priority. [00:21:43, 00:22:52]
- [ ] **[P2] (Future) More interactive triangle.** Optionally let the student type what they think the hypotenuse (ct/2) and the base label are, then tab to a screen that reveals the answer. [00:19:39]
- [ ] **[P2] Formal "equation dump" is acceptable for now** — low priority to restructure. [00:20:40]

---

## 3 · L12‑s1 — Twin paradox worldline comparison

- [ ] **[P1] Add more X grid points.** The grid only shows partially and looks unfinished/non‑uniform — extend it for complete, uniform coverage. [00:23:53]
- [ ] **[P1] Simplify jargon.** "Minkowski triangle inequality" is unlikely to be known — simplify or drop it; consider removing the "everything after the asymmetry" structural text on option C. [00:25:04]
- [ ] **[P1] Clearly label the active frame and the "now" line.** Emphasize "we are in twin A's frame"; make sure every frame and the "now" line are labeled so students know which frame is active. [00:26:11]
- [ ] **[P1] Split long text into multiple panels.** Break big reading chunks up; make the "friend says" content a separate/next panel (it relates to step 3) so it's easier to read and tab between. [00:27:45]
- [ ] **[P1] Legend on new lines.** Write the quantity legend (τ_A, τ_B, v, γ, u …) with one item per line instead of a dense paragraph. [00:30:03]

---

## 4 · L13‑s1 — Lorentz transformations on vectors

- [ ] **[P1] Remove the moving dot/probe on the plot.** [00:30:22]
- [ ] **[P1] Don't call V a "particle's world line."** Inaccurate if the settings make V spacelike (a tachyon, faster than light). Reword. [00:31:25]
- [ ] **[P1] Add a note that V is a spacetime *displacement/point*, not a velocity.** Students will otherwise read V as a velocity once velocity is discussed. Add the clarifying note (at least on the velocity step). [00:41:59, 00:43:23]
- [ ] **[P1] Replace the hyperbola projection + orange dotted lines with a frame switch.** The projection‑to‑hyperbola visualization and the orange dotted projection lines are confusing. Instead, let the user **switch to the primed frame**, turning the (now non‑perpendicular) primed axes **orange** (X′, T′). [00:36:29, 00:37:47]
- [ ] **[P1] Move the invariant readout to the top corners of each frame.** Put V·V / V′·V′ in the top‑left (frame S) and top‑right (frame S′) so it's clear the magnitude is invariant in both frames; show V′ coords + "V′·V′ = …" in **green** on activation. [00:38:59]
- [ ] **[P1] Remove the "orange ghost" lines.** [00:43:23]
- [ ] **[P1] De‑clutter as the sim progresses / scale up the grid.** The display gets too busy at later steps — scale the grid up and/or remove unnecessary items so labels stay legible. [00:32:49, 00:34:13]
- [ ] **[P2] Frame readouts framing.** Frame S readout gives the coordinates (and how S′ moves at β); frame S′ gives the V′ coordinates — the key thing to show is that the V coordinates differ between the two frames. [00:34:13, 00:35:27]
- [ ] **[P2] Consider dropping the extra "proper time" number.** Erin noted the particle's proper‑time readout is "just an extra number" that isn't needed for this sim's point (that V's coordinates differ between frames) — consider removing it to cut clutter. [00:35:27]
- [ ] **[P2] Sequencing — core visual steps first.** Steps 1–3 with the corrected visual outputs already carry the main point; consider introducing the velocity‑addition material only *after* those. [00:45:04]

---

## 5 · L14‑s1 — Momentum vs velocity

- [ ] **[P0] Fix / verify the momentum (p) units.** The readout is giving p in units of mass (m) rather than m·c; verify the calculation accounts for the mass factor and displays the correct unit (e.g. kg·c or m₀c). Flagged for the Monday share (~50% priority). [00:49:06, 00:50:39, 01:41:08]
- [ ] **[P1] Fix the classical dashed line at small velocities.** It has a Y‑offset; both curves should meet at the origin (0,0). [00:49:06]
- [ ] **[P1] Remove the "γ = 0.9…" readout on the curve.** 0.9 is not a mathematically special value; showing it implies a false specialness. Remove it. [00:49:06, 00:51:43]
- [ ] **[P1] Improve the "doubling the rest mass" visualization.** Make the curve's change under a doubled m₀ clearer (use the slider to demonstrate). [00:48:06]
- [ ] **[P2] (Future) Synthesis input.** Optionally let the user type "what they took away" and pop the synthesis out. [00:51:43]

---

## 6 · L15‑s1 — Relativistic constant acceleration

- [ ] **[P1] Remove the "proper acceleration" statement/readout.** The "a₀ = F/m (proper, frame‑invariant)" framing is unclear in this context and Erin leaned toward removing it entirely (rather than trying to explain it). [00:53:06, 00:54:31, 00:55:37]
- [ ] **[P1] Separate the force and acceleration readouts.** Show the acceleration readout clearly/distinctly below the force slider. [00:53:06]
- [ ] **[P1] Rework the prediction (step 3) toward energy.** Don't ask "what will the graph look like after a long time" (already seen). Use options like "velocity keeps increasing forever" (the Alex/Newtonian misconception) vs "you need ever more energy," to get at *why* you can't keep accelerating. [00:55:37, 00:56:47]
- [ ] **[P1] Move the friend/prediction question to *after* the energy plot.** Better context once the energy behavior is visible. [00:58:05, 00:59:04]
- [ ] **[P1] Higher‑precision velocity readout.** Add decimals (e.g. up to ~10) so ongoing acceleration is visible past v = 0.99 (currently it "sticks" at 0.99). [00:58:05]
- [ ] **[P2] Lower the default applied force.** Maxed‑out force spends too long hugging the curve; add a few smaller default values. [00:58:05]
- [ ] **[P2] Deepen the synthesis wording.** "The speed limit emerges from the equation" reads shallow; make it more educational — Erin liked the step‑5 framing that *the work must go into increasing γ, not just more speed*, so lean into that. [00:59:04]

---

## 7 · L16‑s1 — Energy–momentum conservation in a collision (relativistic collisions)

- [* ] **[P1] Trim the table: remove the velocity (v) and gamma (γ) columns.** The table is hard to parse; v and γ aren't needed to make the point. [01:00:58, 01:02:34, 01:03:48]
- [ *] **[P1] Add a "sum of masses" row.** Show Σm before (= 2) and after (= 3.33) to demonstrate that **mass is not conserved**, while continuing to show ΣE and Σp (which **are** conserved). [01:02:34, 01:03:48]
- [ ] **[P0] Move the prediction to the beginning.** Make it a real *predict‑before‑play* step (e.g. "select which are conserved: mass / energy / momentum"), before running the collision. [01:03:48, 01:05:04]
- [ *] **[P1] Reset the whole collision on a new boost value.** Whenever the user changes the boost, reset and replay the full collision so the frame change is clear (rest frame of M → static; boosted frame → M moving). [01:05:04, 01:06:22, 01:07:16]
- [ ] **[P1] Reduce clutter — move the table/display to the left sidebar.** Mock this. Keep the table visible alongside the animation for the frame‑comparison step (need to boost and watch the table change). Cut the in‑sim instruction text. [01:07:16, 01:08:41, 01:09:41]
- [ *] **[P1] Remove "M₀" / "Mot" as a rest‑mass unit.** Confusing (M₀ usually means rest mass, but here big M's rest mass is 3.33). Drop the rest‑mass unit label. [01:09:41]

---

## 8 · L17‑s1 — Photon worldline

- [ ] **[P1] Remove the "Show comparison" step.** It's redundant, adds no pedagogical value, and the gap‑area it shades isn't meaningful. [01:10:58, 01:12:17] (can be hidden as a paert of lecture display mode)
- [ *] **[P1] Unify the X/Y grid scale.** Currently labeled every 1 unit on X and every 2 on Y — make the scale uniform (every 2 on both is fine if 1 is too busy). [01:14:42, 01:15:43]
- [ *] **[P1] Keep the numeric readout hidden by default (toggle to show).** The readout is hard to interpret; the guided inquiry carries the objective. [01:14:42, 01:16:59, 01:18:28]
- [ ] **[P1] Add an intro sentence about the frame setup.** State that the observer is in a frame where **both** the massive particle and the photon are moving (this is why the massive particle's proper time is less than the measured value). [01:19:32]
- [ ] **[P2] Verify "world line" terminology for the photon.** Double‑check whether calling the photon's path a "world line" is appropriate (world line may imply proper time along it) — terminology check, Erin to confirm. [01:10:58]

---

## 9 · L18‑s1 — Tachyon causality violation

- [ ] **[P1] For [01:25:01, 01:26:53, 01:28:10, 01:29:19]
- [ ] **[P1] Restructure the prediction.** First have the student interpret the graph (time between sending and receiving), *then* predict whether it's possible to be in a frame where **E3 happens before E1** (the core of the paradox). Don't just ask "can the reply arrive before it was sent" up front. [01:29:19]
- [ ] **[P1] Don't let the prediction feedback repeat the guided‑inquiry instructions.** Erin noticed the predict explanation gives "how‑to" instructions that the guided inquiry already covers — if it's covered in the guided inquiry, the explanation should instead defer with "hit *Next* to test your prediction." [01:20:42]
- [* ] **[P1] Add an event‑annotation box (top‑right of the grid).** Label and track the specific events (E1: Alice sends, E2: Bob receives, E3: Alice receives…) as they change, so students follow the chronology. [01:30:22, 01:31:29]
- [ ] **[P1] Move the obscured axis labels (ct′, X′) to the top/side of the axes.** The ct′ label is currently far on the left and hard to see; put it at the top of the vertical axis, X′ at the right. [01:20:42, 01:23:49]
- [ ] **[P1] Add boost checkpoints for event ordering.** After boosting (so E2 is before E1), ask about the relative ordering of events; consider a drag‑and‑drop to order events. [01:30:22]
- [ ] **[P1] Clarify "superluminal" = faster than light.** Define the jargon. [01:20:42, 01:28:10]
- [ ] **[P2] Drop units on the interval.** SR usually leaves units off; it's light‑seconds — probably no unit needed. [01:20:42, 01:22:07]
- [ ] **[⚑ Flag] Frame‑change representation differs from other sims.** This sim shows S′ as the perpendicular axes (observer in S changing) rather than keeping S fixed and tilting S′ — flag this to Claudia so students aren't confused between the two frame‑change conventions used across sims. [01:22:07, 01:23:49, 01:32:32]

---

## 10 · L18‑s2 — Causal ordering & the spacetime interval (causality misconceptions)

- [ ] **[P1] Force both a spacelike *and* a timelike event pair, in sequence.** Update the guided inquiry so the student must: move E2 **spacelike**‑separated → answer the ordering question → boost & check (order reverses) → *Next* → make it **timelike**‑separated → answer → boost & check (order holds). Don't let them explore only one case. [01:32:32, 01:33:58, 01:35:07, 01:36:30]
- [ ] **[P2] Trim the skipped / lecture‑demo view.** In the guided‑inquiry‑hidden (lecture‑demo) view, a bit too much is displayed for causal ordering — trim what's shown. [01:37:40]
- [ ] **[⚑ Flag] Frame‑change representation differs from L18‑s1.** Same flag as above — two different ways of showing the frame change are used across the tachyon/causal‑ordering sims; flag for Claudia to avoid student confusion. [01:32:32]

---

## 11 · Delivery & priorities

- [ ] **[P0] Prioritize: units → readouts → guided inquiry.** These are the headline priorities for the first share. [01:39:57]
- [ ] **[P0] Momentum (L14‑s1) unit fix + readout clarity by Monday (2026‑07‑06).** Explicitly called out (~50% priority) for the Monday drop. [01:41:08]
- [ ] **[P0] Push the updated guided‑inquiry versions to a GitHub repo and share the link with Claudia.** A simple GitHub link (no local file system) — easier to download. [01:39:57, 01:41:08]
- [ ] **[P1] Iterate the remaining guided‑inquiry changes in parallel** using the meeting notes/next‑steps as the tracker. [01:41:08]

---

## Appendix · Cross‑reference to the independent physics/UX review (not raised in the meeting)

These came out of the earlier per‑sim `/review-sim` passes and were **not** discussed in this meeting. They're listed separately so they don't get confused with Erin's asks — decide whether to fold any in.

- **Interval sign‑convention split (course‑wide).** Some sims use spacelike‑positive `Δs² = −c²Δt² + Δx²` (L13, L17, L18‑s1) and some use timelike‑positive `ds² = (ct)² − x²` (L10‑s2, L16, L18‑s2). The **syllabus** convention is spacelike‑positive, so **L10‑s2, L16, L18‑s2 deviate** — and L10‑s2's formal note even contradicts its own checkpoint. `_review/PHYSICS-RUBRIC.md` currently endorses the minority convention and should be corrected. (Related to Erin's L18‑s1/L18‑s2 "two frame‑change representations" flag.)
- **L16‑s1:** the canvas frame header renders the boost velocity as "v₂", colliding with particle‑2's velocity symbol; should read `v_b` (matches the slider and Formal panel).
- **L11‑s2:** the five build stages are only reachable via the guided inquiry — add a persistent "Construction stage" control so a user who skips can still step through them.
- All 10 sims: two external `.ttf` fonts 404 on load (harmless — they fall back to the embedded base64); remove the dead `@font-face` refs.

*(Full per‑sim analysis: `_review/<sim>-review.md` and `_review/<sim>-physics.md`.)*
