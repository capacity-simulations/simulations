# SR Simulations — Manager Feedback To‑Do List (First 10)

**Meetings:**
- **Weekly Alignment (Updated)** — 2026‑07‑08 (08:01 EDT) — covered the *first three* sims + global pause/maximize decisions.
- **SR sims feedback** — 2026‑07‑09 (22:00 IST) — picked up *"from the fourth one"* and reviewed sims 4→10 (full transcript 00:02:13 → 01:12:15).

**Reviewer / manager:** Erin Crawley  ·  **Implementer:** Binayak Samal
**Source:** *Notes by Gemini* (Summary · Decisions · Next steps · Details) for both meetings + the full 07‑09 transcript.
**Scope:** the **first 10** SR simulations — `L00‑s1‑ball‑on‑a‑train` → `L05‑s2‑spacetime‑diagram‑explorer`, reviewed sim‑by‑sim in folder order.
**Downstream owner:** Claudia (receives a GitHub link to the ~20 sims in **lecture‑viewer** mode to establish the project's tone; final edits not required before sharing).
**Hard delivery:** lecture‑viewer default + lecture‑number title tags + working GitHub link, ideally by 2026‑07‑10 evening (Erin's time), latest by Monday.

> **How to read this.** Items are grouped **Global** (apply to every sim) first, then one section per simulation in the order they were reviewed. Each item is a concrete, actionable change with the transcript timestamp(s) or the doc field (Decision / Next step / Details) in brackets for traceability. Priority tags: **[P0]** must‑do for the Claudia share (lecture‑viewer default, lecture tags, GitHub link, units, dot‑separator cleanup), **[P1]** should‑do content/structure refinements, **[P2]** nice‑to‑have / future. The first three sims come only from the 07‑08 weekly notes (no transcript); sims 4–10 have detailed transcript timestamps.

---

## 0 · Global changes (apply to every simulation)

- [ ] **[P0] Default to "lecture‑viewer" mode for the Claudia review.** Set every sim's display to lecture‑viewer (guided inquiry hidden) as the default for the stakeholder draft. [07‑09 Decision · 01:05:29]
- [ ] **[P0] Add lecture‑number tags to every simulation title.** Standardize titles so each carries its lecture number (Lxx). [07‑09 Decision · Next steps · 01:06:35]
- [ ] **[P0] Ship via a GitHub link, not local files.** Push the updated sims and share a single working GitHub link (~20 sims) so Claudia can open them directly; notify Erin if the folder architecture changes so she can resend the link. [07‑09 · 01:05:29, 01:07:42]
- [ ] **[P0] Replace "light seconds" units with arbitrary units.** Across sims, drop explicit `light‑seconds` axis units in favor of arbitrary units (e.g. "a.u."). The point is that **both axes share the same unit**, not what the unit is. [07‑09 Decision · 00:56:27]
- [ ] **[P0] Remove "·" dot separators from captions/labels.** The small mid‑dot used to separate text reads as a **dot product** in a physics context — replace with another separator. Applies to titles/captions too. [07‑09 · 00:53:48, Next steps]
- [ ] **[P0] Paused + predict‑before‑run overlay on prediction cards.** On "predict the path/answer" cards, open **paused** with a semi‑transparent gray overlay + a large center pause symbol. Apply this **selectively to predict cards only** — do not force play/pause on every card (minimize friction). [07‑08 Decision · Next steps · Details]
- [ ] **[P1] Ask the question *before* the instruction.** In guided inquiry, when a card asks a question, state the question first, *then* the "move the slider / drag the point" instruction — not the other way around. [07‑09 · 00:18:23, 00:19:54]
- [ ] **[P1] Cut the card count; trim repetitive cards.** Even simple sims default to ~5 cards, many restating the previous one. Reduce the number of guided‑inquiry cards and remove redundant steps. [07‑09 · 00:25:10, 00:26:10]
- [ ] **[P1] Remove redundant in‑sim instructional / overlay text.** Rely on visual proximity of plots + apparatus for context; strip control‑info overlays and duplicated instructions. [07‑08 Details · 07‑09 · 00:27:38]
- [ ] **[P1] Editorial pass on AI‑generated guided‑inquiry copy (later layer).** For the core lecture‑accompanying sims, a human should review each prompt/response to remove "AI‑speak" and fix terminology. Deferred, not blocking. [07‑09 · 00:19:54, 00:20:40]
- [ ] **[P1] Keep the maximize button on the top bar (lecture use).** The top bar stays dedicated to global display (pause / reset); maximize is retained so an instructor can enlarge a plot without touching sliders. No need to relocate controls in the maximized state. [07‑08 Decision · Details]
- [ ] **[P1] Let users maximize individual plots by selection.** Migrate plot‑interaction so a user can maximize the specific plot they select. [07‑08 Decision]
- [ ] **[P2] Build a guided‑inquiry predict‑overlay mock + template.** Once the lecture‑mode versions are final, prepare mockups for the predict‑overlay, finalize one template, then iterate all sims onto it. [07‑09 · 00:14:21, Next steps]

---

## 1 · L00‑s1 — Ball on a train
*(07‑08 weekly notes; no transcript this round)*

- [ ] **[P1] Keep the simplistic / cartoonish visual style.** Erin endorsed it as **"timeless"** and preferable to the previous animated styles that were prone to aging — retain this approach. [07‑08 Details]
- [ ] **[P0] Apply the paused + gray‑overlay pause symbol to the predict‑path card(s).** This is the canonical "predict the path" sim that motivated the global pause decision. [07‑08 Decision · Details]

---

## 2 · L01‑s1 — Polar vs Cartesian (the "circle" sim)
*(07‑08 weekly notes)*

- [ ] **[P0] Make θ a 0–360° sawtooth; remove dynamic scaling.** The θ plot should loop between 0 and 360° as a sawtooth wave rather than dynamically rescaling — this aligns it with the bottom‑left readout, which also shows θ in 0–360°. [07‑08 Decision · Next steps · Details]
- [ ] **[P1] Keep the X/Y axis color‑coding; consider a visual element for θ.** The color‑coded X and Y axes were appreciated. Consider adding a visual cue for θ so **all four coordinates** (x, y, r, θ) are represented. [07‑08 Details]
- [ ] **[P1] Simplify the interface text.** The visual proximity of the plots and the apparatus already gives sufficient context — cut redundant labels/copy. [07‑08 Details]
- [ ] **[P2] Consider "lecture demo mode" for this sim.** The LLM‑generated guided‑inquiry questions here were repetitive / not complex enough for true guided inquiry; this sim may be better suited to a lecture demo. [07‑08 Details]

---

## 3 · L01‑s2 — Different coordinate frames (the "coin" sim)
*(07‑08 weekly notes)*

- [ ] **[P1] Restrict to a single draggable point; remove multi‑point placement.** Multi‑point placement caused confusion over coordinate readouts. Allow only one point that the user can click and drag. [07‑08 Decision · Next steps · Details]
- [ ] **[P1] Disable auto‑rotate.** Auto‑rotate confuses students comparing a static coordinate frame to a dynamically rotating one — turn it off here. [07‑08 Decision · Next steps · Details]

---

## 4 · L02‑s1 — Inner product
*(sim 4; first reviewed on 07‑09)*

- [ ] **[P1] Remove auto‑rotate.** [00:03:12]
- [ ] **[P1] Move the invariant section into the sidebar / stats.** Relocating it frees up space and reduces the "too busy" feeling (the invariant idea is already carried by the a·b calculation shown in both frames). [00:06:10, 00:07:32]
- [ ] **[P1] Add the magnitude‑of‑A calculation, shown in both frames.** Use the freed space to compute |A| in each frame — it reinforces the same "different inputs, invariant output" story. Show only |A| (both |A| and |B| would be overkill). [00:07:32, 00:04:43]
- [ ] **[P1] Keep the a·b calculation across both frames.** It's interesting precisely because you plug in different component numbers yet the result is invariant. [00:05:36]
- [ ] **[P1] Structure the flow as predict → reveal.** Steps 1–2: student predicts which components change; step 3: reveal which components change. [00:03:12]
- [ ] **[P1] Emphasize the invariance intuition on step 3.** Highlight that the vector lengths and the angle between them are invariant, which is *why* a·b = |a||b|cosθ is conserved. [00:09:05]
- [ ] **[P1] Once the bottom bar is gone, keep the side‑by‑side per‑frame displays.** As you move a vector, all numbers move but the invariant (green box) stays fixed — that contrast is the point. [00:07:32]

---

## 5 · L02‑s2 — Euclidean space and metric
*(sim 5)*

- [ ] **[P1] Refocus on macroscopic Euclidean distance ↔ the infinitesimal metric.** The lesson is comparing everyday Euclidean distance to the metric form (dx, dy, ds) — **not** "the hypotenuse is shorter than the sum of the two sides." Reframe the guided inquiry away from the hypotenuse comparison. [00:10:21]
- [ ] **[P1] Remove the moving circles racing along the sides.** They're a distraction and reinforce the wrong (hypotenuse) framing. [00:13:07]
- [ ] **[P1] Rebuild the guided inquiry around zoomed‑out → zoomed‑in.** Zoomed‑out card: "how do we calculate distances here?" Then: "go to the zoomed‑in view — same idea, just very small legs (dx, dy, ds)." [00:13:07, 00:14:21]
- [ ] **[P1] Frame it as a warm‑up to the Minkowski metric.** This sim sets up the later Minkowski metric (the one with the negative time sign) as another notion of measuring distance. [00:10:21]
- [ ] **[P2] Visual look is good as‑is.** Switching between zoomed‑out and zoomed‑in is effective; the side‑by‑side calculator + picture is nice — keep it. [00:11:45]

---

## 6 · L03‑s1 — Shape rotation and symmetry (the "most times" sim)
*(sim 6)*

- [ ] **[P1] Keep auto‑rotate on here.** It handles the slider‑precision / snapping problem (hard to land exactly on a symmetry angle by dragging). [00:15:49 · 07‑09 Decision]
- [ ] **[P1] Remove legend step 3.** The display is self‑explanatory; the legend step is unnecessary. [00:17:09 · 07‑09 Decision]
- [ ] **[P2] Confirm the glow fires only at the correct symmetry angle.** The ±2–3° threshold issue was already fixed — verify it still only glows on the exact symmetry angle. [00:15:49]
- [ ] **[P2] Simple sim — candidate for lecture demo.** Low guided‑inquiry complexity; fine as a quick demo. [00:17:09]

---

## 7 · L04‑s1 — Scalars vs vectors under rotation
*(sim 7)*

- [ ] **[P1] Build up one vector first, then add the second.** Introduce a single vector with its components + norm, then add the second vector and show both sets of components/magnitudes. [00:21:05, 00:22:16 · 07‑09 Decision]
- [ ] **[P1] Make the operation layers toggleable (hide one by one).** Allow hiding/showing components, |A|, |B|, a−b, a·b step by step so the instructor can focus on one thing at a time. [00:20:00, 00:21:05]
- [ ] **[P1] Ask the question before the "move it" instruction.** (Instance of the global guided‑inquiry rule.) [00:18:23]
- [ ] **[P1] Land the takeaway: the magnitude of a vector is invariant; define a scalar as "same in any reference frame."** Introduce the scalar definition this way. [00:22:16, 00:23:54]
- [ ] **[P1] Clarify why a component (e.g. aₓ) still changes.** aₓ is a number (scalar‑like) but it's a *component/projection* of a vector, so it changes under rotation — contrast that with the invariant magnitude. [00:23:54, 00:24:00]

---

## 8 · L04‑s2 — Euclidean space and metric ("distance scalar invariant")
*(sim 8; translation/rotation distance sim)*

- [ ] **[P1] Reduce the number of guided‑inquiry cards.** [00:25:10]
- [ ] **[P1] Fix the over‑blinking distance readout.** The distance blinking to draw attention on card 1 is nice, but it keeps blinking on card 2 — stop it after its intro card. [00:27:38]
- [ ] **[P1] Remove the bottom‑left control overlay + play/pause info.** You can drag and click while watching the screen; the overlay is excess. [00:27:38 · 07‑09 Decision]
- [ ] **[P1] Split translations and rotations into separate steps.** Step 2 = translations (shift origin along x/y → Δx, Δy unchanged); step 3 = rotations (Δx, Δy change but distance is invariant). Don't have one step list all sliders and the next re‑ask about the same sliders. [00:28:59 · 07‑09 Decision · Next steps]
- [ ] **[P1] Remove the metric popup; show the info in the top‑right corner.** The popup restates the top‑right info but squared (numbers don't match → feels like extra content). Keep a single top‑right display in **flat** (non‑squared) distances. [00:28:59 · 07‑09 Decision]
- [ ] **[P1] Keep the step‑5 summary table.** Good element. [00:30:10]
- [ ] **[P2] Make the summary table a drag‑and‑drop fill‑in.** For more interactivity, have the student fill the table (then it cements). [00:30:10]
- [ ] **[P2] Controls / view toggles are clear — no change needed.** [00:30:10]

---

## 9 · L05‑s1 — Frame clock and event coordinates
*(sim 9; "a little bit of a troublemaker" — richest sim)*

- [ ] **[P1] Rename the "t = 0" answer label to "the time the clock reads right now."** Bug‑proofs step A against the case where the clock was already ticking (if the student hit play, "t = 0" is wrong). [00:33:00 · 07‑09 Decision · Next steps]
- [ ] **[P1] Fix reset/pause behavior.** After the user hits play, **reset currently autoplays** — reset should return to a **paused** state. [00:35:22, 00:38:14]
- [ ] **[P1] Remove step 3 (the light‑path / signal‑delay demo).** It risks the misconception that the recorded time waits on light arrival. Replace it with **placing multiple events at different locations** and noticing every one has the **same synchronized time** — i.e. every grid point has its own synchronized clock. [00:36:53, 00:38:14, 00:39:55 · 07‑09 Decision · Next steps]
- [ ] **[P1] Reset the grid whenever the relative speed changes.** t′ depends on the speed, so the readouts must reset on any speed change. [00:41:13 · 07‑09 Decision · Next steps]
- [ ] **[P1] Don't reference a later step from an earlier card.** Selecting option A in step 2 currently teases "step 4" — instead say "as we'll see later" (the student must pass step 3 first). [00:34:13]
- [ ] **[P1] Split step 4 into two cards.**
  - Card A — an event gets a **different time in S vs S′**. [00:42:47]
  - Card B — **simultaneity**: E1 & E2 (same t, same x‑relation) share a t′ value, but E3 at a different x has a different t′ — because t′ depends on **both** t and x. [00:44:36, 00:46:22, 00:47:24]
- [ ] **[P1] Replace the top‑right / origin t′ display with a moving tag at the S′ origin.** The protected top‑right t′ only reflects the **origin's** clock, which misleads (in S′ every grid point has a synchronized clock). Attach a little moving clock/tag at the S′ origin that continuously shows t′. [00:48:34 · 07‑09 Decision · Next steps]
- [ ] **[P2] Keep the S′ length‑contraction visual.** It's good. [00:38:14]
- [ ] **[P2] (Future) Optional "turn on clocks" at every grid point.** A zoomed‑in view showing a synchronized clock at each grid point would hammer home universal time — but may look busy; low priority, needs a zoomed‑in grid. [00:49:37, 00:50:41, 00:51:44]

---

## 10 · L05‑s2 — Spacetime diagram explorer
*(sim 10)*

- [ ] **[P1] Redraw the axes cleaner; reposition the ct label.** Drop the gray box; label the axes in the style of the Euclidean‑metric/distance sim. The ct label is currently far off to the left — move it to the top of the vertical axis. [00:52:38 · 07‑09 Next steps]
- [ ] **[P0] Remove the "frame S·C = 1 light‑second" caption.** When two events are collocated this caption appears/moves and makes the layout jump/feel buggy — delete it. (Also removes a "·" dot‑product‑looking separator.) [00:53:48, 00:55:04 · 07‑09 Decision · Next steps]
- [ ] **[P0] Arbitrary units instead of light‑seconds on the axes.** Only "same unit on both axes" matters. [00:56:27 · 07‑09 Next steps]
- [ ] **[P1] Guided inquiry: place events, classify them.** Have students place events and read whether pairs are **simultaneous** or **lightlike‑separated**, etc. [00:57:40]
- [ ] **[P2] (Future) Add a Δs / spacetime‑interval layer.** Later, add an optional layer that shows the spacetime interval Δs between events (e.g. simultaneous events have negative/ spacelike Δs) — same "bones," extra layer. [00:57:40, 00:59:16]
- [ ] **[P2] Consolidate with the more‑detailed Minkowski‑diagram sim.** This sim overlaps heavily with a more robust Minkowski‑diagram sim; consider **starting from that one and trimming details** to produce the "just show events on a diagram" version, for a consistent look the students have seen before. [00:57:40, 01:00:09]

---

## 11 · Cross‑cutting geometric decision (affects L02‑s1 / L04‑s1 / L05‑s2)

- [ ] **[P1] Establish the inner‑product‑invariance sim as the core geometric framework.** It looks the nicest (font/vibe); deprioritize the standalone spacetime‑diagram approach for the geometric thread. Add toggleable layers to it — **vector components**, **a − b**, **a · b** — each switchable on/off so an instructor can show exactly one thing at a time. This can absorb most of what the overlapping geometric sims do. [01:00:09, 01:01:36, 01:02:36 · 07‑09 Decision]

---

## 12 · Bonus / not part of the first 10

- [ ] **[P2] Michelson–Morley (L07‑s1, 3D):** the 3D rendering (built externally via Cap Bulb / the Fable model) looks great. Open design question: **how best to present the ether prediction** so students read it as a *prediction with a caveat*, not a fact — keep the warning framing and keep iterating. Discuss in detail separately. [01:02:36, 01:04:14]

---

## 13 · Delivery & priorities

- [ ] **[P0] Priority order for the share: lecture‑viewer default → lecture‑number title tags → GitHub link.** Erin is fine sharing with Claudia **before** all content edits land — the goal is to convey the "vibe." [01:05:29, 01:06:35, 01:07:42]
- [ ] **[P0] Target: send by 2026‑07‑10 evening (Erin's time); Monday at the latest.** ~20 sims in lecture‑demo mode; the remaining ~7 in‑between sims to follow. [01:07:42, 01:08:35]
- [ ] **[P1] Iterate the content changes in parallel**, using these meeting notes / next‑steps as the tracker. [01:06:35]

---

## 14 · Forward look — Classical Mechanics (next phase)

*Not part of the first‑10 refinement, but agreed direction for after the current SR/particle‑physics phase.*

- [ ] **[P2] Pivot to classical‑mechanics sims after the current phase.** Erin to share David's Google sheet of rough ideas. [01:08:35, 01:09:33 · 07‑09 Decision]
- [ ] **[P2] Consolidation strategy: build ~15 multi‑part sims, not ~30 sporadic single‑purpose ones.** Group overlapping ideas into fewer, robust simulations (add one or two features onto a shared base rather than making separate sims) — the same overlap problem seen in the geometric SR sims. [01:08:35, 01:09:33, 01:10:47 · 07‑09 Decision]

---

*Sim‑to‑file map (folder order = review order):*
1. `L00‑s1‑ball‑on‑a‑train‑shell.html`
2. `L01‑s1‑polar‑vs‑cartesian‑one‑window‑showing‑an‑shell.html`  ·  3. `L01‑s2‑different‑coordinate‑frames‑shell.html`
4. `L02‑s1‑inner‑product‑shell.html`  ·  5. `L02‑s2‑euclidean‑space‑and‑metric‑shell.html`
6. `L03‑s1‑shape‑rotation‑and‑symmetry‑shell.html`  ·  7. `L04‑s1‑scalars‑vs‑vectors‑shell.html`
8. `L04‑s2‑euclidean‑space‑and‑metric‑shell.html`  ·  9. `L05‑s1‑frame‑clock‑and‑event‑time‑shell.html`
10. `L05‑s2‑spacetime‑diagram‑explorer‑shell.html`
