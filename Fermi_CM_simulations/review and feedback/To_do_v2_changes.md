# V2 Changes — To-do by Simulation

Source: `Classical Mechanics Syllabus and Course Planning (1).xlsx` → tab **Final Simulation Ideas** → column **P ("v2 changes")**.
Sim titles and lecture numbers are taken verbatim from column C ("Simulation Name").

**Scope:** 17 sim rows carry a title. **3 are paused**, **1 has no v2 entry**, **13 need work** — **46 change items** total.

---

## Paused — no v2 work requested

| Lecture | Simulation | v2 note |
|---|---|---|
| **L2** | Newton's Laws | "Pause — we won't use this for lectures." |
| **L4** | Forces on Objects Explorer | "Pause — we won't use this for lectures." |
| **L35** | Orbits | "Pause — we won't use this for lectures." |

## No v2 entry

- **Free-Body Diagram Builder** (reused throughout) — column P empty.

---

# Active work

## L4 · Projectile Motion
`L4-Projectile motion.html` — 2 items

- [ ] **Simplify display:** add a checkbox to remove words from displaying on the canvas — axes labelling, grid, numbers, legend, the "independent" textbox, etc. **Keep the v₀ arrow and the θ display.**
- [ ] **Simplify display:** remove the A/B labels in lecture demo mode.

## L16 · Friction in Three Dimensions
`L16-Friction-in-3d.html` — 2 items

- [ ] Add a **third plot showing quadratic drag**.
- [ ] **Simplify display:** remove the legend, but **keep the on-screen labels** — "linear drag", "quad drag", and "vacuum".

## L6 · The Harmonic Oscillator
`L6-The harmonic oscillator.html` — 5 items

- [ ] **Slow down the default speed** — ideally even twice as slow as the current slowest speed.
- [ ] Remove the **vertical bar** that appears above each of the balls.
- [ ] Remove the **V-shape potential**.
- [x] Change **"compare two masses" → "compare two amplitudes"**.
- [ ] **Simplify display:** remove the legend, readouts like "locked in phase", the text below the x(t) plot, etc.

## L7 · Motion in a Potential
`L7-Motion in a potential.html` — 3 items

- [ ] **Simplify display:** remove *all* readout text and legends. Remove the **KE, v and a arrows**.
- [ ] **Keep** the dotted line at the barrier energy — blue dotted line with the energy **"E"** label.
- [ ] Change **"barrier scale s" → "potential scale"**.

## L9 · The Pendulum
`L9-The pendulum.html` — 4 items

- [ ] Make the **default view a maximized pendulum** (plot hidden).
- [x] Add an **overlay option for a second pendulum**, with a separate length slider for it.
- [x] Remove the **"glow" effect / ring** around the pendulum.
- [x] **Simplify display:** remove the L and θ readout on the canvas.
      *Note from the sheet:* keep the legend for now **when the small-angle overlay is ON**; remove the legend when small-angle mode is toggled **off**.

## L17 · The Damped Harmonic Oscillator
`L17-The damped HO.html` — 8 items

- [ ] **Simplify display:** remove all reference to **"at rest"** (keep just the green check mark); remove text displays ("2cm", etc.).
- [ ] **Simplify display:** remove the **top bar** when in "settle race" mode.
- [ ] Replace the `⚑ at rest: [ … ]s` text with **just a green check mark**.
- [ ] Write **only "scroll to zoom"** — drop the rest of the text following it.
- [ ] **Totally remove the "naive" plot.**
- [ ] Remove the **warning sign** from "settle race".
      *Open question carried in the sheet:* "Is anything incorrect being rendered here, or is it just targeting a misconception that students might think the race would happen in different orders?"
- [ ] Default so the **λ readout is minimized**.
- [ ] **Bug:** the sidebar headers have **capitalised lambda** (Λ instead of λ).

## L29 · The Centrifugal Force
`L29-The centrifugal-force.html` (also `L29-The centrifugal-force-shell.html`) — 5 items

- [ ] Don't show the ball **rolling** — just **sliding**. Rolling requires friction and the setup is frictionless.
- [ ] Have the ball **continue moving off the screen** (it can disappear at the fence). I.e. **remove the friction** — having it come to a stop as it currently does is confusing.
- [ ] **Simplify display:** remove all text on the merry-go-round (it blocks the view). **Keep** "rotating frame" / "ground frame" in the top left but remove the text below it. Remove the legend. **Keep only the labels on the forces.** Centrifugal force should read **`F_cent`**.
- [ ] Replace the **timed release** with a **"click to release" button**.
- [ ] **Totally remove the "warning" / incorrect mode.**

## L30 · The Coriolis Force
`L30-The coriolis-force.html` — 5 items

- [ ] Sim should **pause when the ball hits the edge**.
- [ ] **Simplify display:** similar comments to centrifugal — remove the target display. **Keep the legend for now but remove its last line.**
- [ ] Remove the **green lines from the background**. Instead, add a green line **whenever the user clicks launch**, so they can see where in the lab frame they launched from. *(See Slack for the green-line picture.)*
- [ ] **Previous (v1) comments still hold** — totally remove the **earth and table mode**, the **radii text displays**, etc. Simplify with a **default ω that is slow**.
- [ ] **Totally remove the "warning" / incorrect mode.**

## L30 · Coriolis on a Rotating Sphere
`L30-Coriolis on a Rotating Sphere.html` — 1 item

- [ ] **Need to check physics correctness.** Weird things are happening with the displays.

## L1 · Solar System Orbits
`L1-Solar System Orbits.html` — 4 items

- [ ] **Default speed is too fast.**
- [ ] Change the animation speeds so that when toggling between **inner and outer modes, the inner planets have the same speed in both modes**.
- [x] Remove the **perihelion** marker and the **"e ="** text — keep only the planet names.
- [ ] **Check the actual placement of the Sun at the foci** — the foci positions look incorrect for the ellipses shown. *(See Slack screenshot.)*

## L36 · The Energy of the Orbit
`L36-The Energy of the Orbit.html` — 2 items

- [ ] **Change from the 1/r plot to an effective-potential plot.**
- [ ] Find some way to **connect to the idea that dθ/dt is a function of r**.

## L36 · Scattering Extension
`L36-Scattering Extension.html` — 2 items (+1 comment)

- [ ] Remove text — the **`b = …` labels**.
- [ ] **Simplify display:** remove a lot of the displayed text, labels and symbols (ψ, etc.).
- *Comment, not a change:* "Looks really nice!"

## L37 · Kepler's Laws
`L37-Kepler's Laws.html` — 3 items

- [ ] **Simplify display · K1:** remove the dotted line and `a`, and **"empty focus"** (but **keep the focus marker**), perihelion, aphelion, etc.
- [ ] **Simplify display · K2:** remove the **area bar displays**.
- [ ] **Simplify display · K3:** remove the **AU's display on the left**; remove the **"measuring …" pending text** and go straight to the labelled point (e.g. "Mercury"); **remove the other slopes — keep only slope = 1.**

---

# Cross-references with the reviews already completed

These are flagged because a v2 request either overlaps, supersedes, or conflicts with work already done. **Worth confirming intent before implementing.**

### Already investigated — L30 Coriolis on a Rotating Sphere
The v2 ask is "check physics correctness". A full review was completed (`_cm-reviews/L30-Coriolis-on-a-Rotating-Sphere-review.md`). It found and fixed: a P0 where forward-Euler on the Coriolis rotation injected energy (parcels reached 55× launch speed at 4×), and a P1 where three inconsistent rotation rates were in play while the panel asserted they agreed. Direction physics (NH anticlockwise / SH clockwise / equatorial null) was verified correct. **This item may already be satisfied** — worth checking against what "weird things … with the displays" referred to.

### Conflicts with a decision just taken — L36 The Energy of the Orbit
The v2 ask is "change from 1/r plot to effective potential plot." This is exactly the option (a) offered during the L36 review; **option (b) was chosen and implemented instead** — V(r) retained, the intersection relabelled the "L = 0 energy limit", and a second marker added at the true aphelion. The v2 request would replace that with V_eff. Both are defensible; the trade-off is that V_eff makes the intersection genuinely the turning point but reshapes the curve on every slider tick. **Needs a decision, not just implementation.**
The second L36 ask (dθ/dt as a function of r) is new work — the current sim has no angular-momentum readout.

### Supersedes a fix just made — L37 Kepler's Laws
The v2 ask is "remove the other slopes (keep only the slope = 1)." Two rounds of work were just spent correcting the wrong-slope guide line (it was labelled `slope 2 (T ∝ a²)`, corrected to `slope 4/3`, then repositioned so the label wasn't overprinted). **v2 removes those guide lines entirely**, which makes that work moot — no harm, but don't re-fix them.
Also note K3's "measuring …" text is scheduled for removal here, but it was *added* during the review to disclose that un-measured planets are plotted at their analytic period. If the text goes, consider whether un-measured planets should be hidden rather than shown sitting exactly on the line.

### Already measured as correct — L1 Solar System Orbits
The v2 ask is to check whether the Sun sits at the correct focus. The L1 review measured this by least-squares conic fit: the Sun sits at distance `a·e` from the ellipse centre to within **0.005 % (e = 0.3) and 0.026 % (e = 0.6)**, and the empty focus is drawn at −2ae. **The focus placement is correct.** The Slack screenshot may be showing a different issue — most likely the L1 review's own finding that at outer zoom Mercury's whole orbit is 4.5 px and sits inside the 14 px Sun corona, which can read as a misplaced focus. Worth checking the screenshot against that.
The "default speed is too fast" ask also interacts with the L1 fix that made `yrPerSec` view-dependent (0.02 inner / 0.5 outer, capped at 1.4 yr/s) — and the inner/outer speed-matching ask is a *third* variation on that same mapping. **Treat all three as one change to the time mapping**, not three independent edits.

### Filename note — L16
The sheet calls this "Friction in Three Dimensions" and asks for a quadratic-drag plot. The file `L16-Friction-in-3d.html` in fact contains the drag-projectile sim ("Projectile Motion with Air Drag"), and the earlier CM review index records that the filename was kept as legacy per a prior decision. The v2 ask is consistent with the *content*, not the filename — no conflict, just don't be misled by the name.

---

## Recurring theme

**"Simplify display" appears in 11 of the 13 active sims.** The consistent direction is: strip on-canvas text, legends, readouts and secondary labels; keep only the physics markers and the one or two labels that carry the lesson. Several sims also ask to remove "warning"/"naive"/counterfactual modes outright (L17, L29, L30). Worth doing as one coordinated pass with a shared convention rather than sim-by-sim, so the lecture set ends up visually consistent.
