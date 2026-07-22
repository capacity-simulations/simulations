# To-Do — v3 Lecture Sim Changes

Built from the **Finalized Sim Changes** tab of *Special Relativity Syllabus and Course Planning*, reading the **`v3 changes needed`** column only. Every requirement listed in that column is captured below, one section per simulation, tagged with its **lecture number**, **simulation number**, and the mapped file in `shell-versions/`.

Several items reference diagrams/screenshots posted in **Slack** — those are flagged inline as **📎 see Slack** and will need the image to finalize.

**Legend** — file = mapped sim in `shell-versions/` · Status = the sheet's current status column.

---

## L02 · s1 — Inner product
**File:** `L02-s1-inner-product-shell.html` · **Status:** Needs small changes

- In **modes 2, 3, and 4**, when **"show projection"** is selected, also show the **coordinates of the vector** in the lower readout.
- Specifically for **mode 4**: keep the **invariant quantities on the left** of each bottom box, and show the **coordinates of the U and V vectors on the right-hand side** of the bottom box, for **both frames**.

---

## L05 · s1 — Frame clock and event time
**File:** `L05-s1-frame-clock-and-event-time-shell.html` · **Status:** Fine as-is

- Add a button titled **"measure simultaneous events."** When selected, **three events populate simultaneously** on screen. 📎 see Slack screenshot for good (x, y) coordinates for the three events.

---

## L05 · s2 — Spacetime diagram explorer (Lecture 5)
**File:** `L05-s2-spacetime-diagram-explorer-new.html` *(new consolidated version; `…-shell.html` is the old one)* · **Status:** Needs small changes

- **Remove the S′ frame axes and grid option** — it isn't needed at this point.

---

## L06 · s2 — Relative velocity of plane
**File:** `L06-s2-Rel_vel_of_a_plane_v2.html` · **Status:** Needs small changes

- Change **Alice's rendering** (still bald).
- Rename **Bob → Bella**.
- **Fix the plane** rendering to match the previous plane's rendering (visual consistency).

---

## L07 · s1 — Michelson–Morley experiment
**File:** `L07-s1-Michelson_Morley_experiment_3D.html` · **Status:** Fine as-is

- **Remove the "aether wind β = …" box** from the top-left.
- Add **two "mode" toggles — "experiment apparatus"** and **"simplified"** — giving **4 total combos**: `experiment apparatus`/`simplified` × `aether`/`actual`.
- **Simplified mode:** instead of the experimental setup, show a **single beam of light on the table** hitting the mirror and returning. In the top-right box show **"predicted round trip time: […]"**.
  - In **aether** mode this number **changes with apparatus angle** (transverse vs parallel to the wind) — the **Galilean calculation** (same as the airport sim, but with the aether wind speed).
  - In **actual** mode the number **doesn't change**, and drop "predicted" (so it reads **"actual round trip time"**).
- **Experiment mode:** instead of the telescope view and fringes, **label the two interferometer arms "A" and "B"** and display three quantities: **"predicted A round trip time: […]"**, **"predicted B round trip time: […]"**, and **"A−B difference: […]"**.
- 📎 see Slack for diagram.

---

## L08 · s2 — Spacetime diagram explorer (from Lecture 5)
**File:** `L08-s2-spacetime-diagram-explorer-new.html` *(new consolidated version; `…-shell.html` is the old one)* · **Status:** Needs refactor

- Add the ability to **enter point coordinates as text** in the **S or S′ frame**. *(Reasoning: click-and-drag currently snaps to the S grid, making it hard to place e.g. two events that are simultaneous in S′.)*
- When toggling **"show S′" on/off**, **remember the last v/c value** instead of **resetting v to the default** each time.

---

## L09 · s1 — Worldline length and proper time
**File:** `L09-s1-worldline-length-and-proper-time-shell.html` · **Status:** Needs small changes

- **Remove the "W1" label** (but keep the display of the point's coordinates).

---

## L11 · s2 — Light clock and geometric derivation of time dilation
**File:** `L11-s2-light-clock-and-geometric-derivation-of--shell.html` · **Status:** Fine as-is

- Nice-to-have: in **"rest clock" mode**, **zoom out** a bit so that at **γ = 1.25** we can see **4 full ticks of Bella's clock** (and thus **5 full ticks of Alice's**). *(May be too zoomed out — leave this change for last.)*

---

## L11 · s3 — Length contraction and simultaneity
**File:** `L11-s3-Length_contraction___simultaneity_v2.html` · **Status:** Needs refactor

- **Improve graphics for Bella and Alice** (hair is currently quite funny) — see prior visual comments.
- Change so the **default is spacetime diagram OFF**.
- **Fix the frame × measurement combinations.** Currently only **"Bella's frame" + "measure (Bella)"** looks good; the others look buggy:
  - **Alice's frame + "measure (Bella)":** currently **both people stop** — wrong. Instead show the **same marker flashes but NOT simultaneous**.
  - **Alice's frame + Alice's measurement:** **Bella should keep moving as normal**; show **two simultaneous flashes**, with **"L = 6 m"** displayed between where the two markers were.
  - **Bella's frame + Alice's measurement:** keep the **separate-time flashes** (already done well), **BUT do NOT** display "L = 0.6" along Bella's rod moving with Bella. Instead display the **"L = 0.6" label moving backwards** (the same way Alice moves backwards). *(Mental model: Alice makes two simultaneous chalk marks on the ground where she saw each end of Bella's ruler — that separation is "L = 0.6", so it should move with Alice, like chalk lines on the ground.)*

---

## L12 · s0 — Twin paradox demo
**File:** `L12-s0-Twin_paradox_Alice___Bella_turnaround.html` · **Status:** *(blank)*

- Make the visuals look **like Alice and Bella in the length-contraction sim** (once the hair is fixed) — just the **two moving figures, no background**.
- Keep it **very simple**: **no readouts, no clocks/times**. The idea is only to **set up the situation**.
- 📎 see Slack for diagram.

---

## L12 · s1 — Twin paradox worldline comparison
**File:** `L12-s1-twin-paradox-worldline-comparison-shell.html` · **Status:** Needs refactor

- **Add the "one-way + signal" mode back** to the lecture version.
- In **"one-way + signal" mode**, fix **overlapping text**, particularly where **Bella sends the signal**.
- In **"one-way + signal" mode + Bella's frame**, her **worldline ends early / the animation gets buggy** after leaving the red line — fix.

---

## L14 · s1 — Momentum vs velocity
**File:** `L14-s1-momentum-vs-velocity-shell.html` · **Status:** Needs small changes

- Add a **"view low velocity" checkbox**. When checked, display a **zoomed-in portion of the graph** — only **v/c = 0 to 0.1**. In this view the **classical and relativistic curves match up closely** (looks linear).

---

## L15 · s1 — Relativistic constant acceleration
**File:** `L15-s1-relativistic-constant-acceleration-shell.html` · **Status:** *(blank)*

- Add a **"view low velocity" checkbox**. When checked, only **animate the first ~10% of the trajectory, then stop** — in this view the **classical and relativistic curves match closely** (linear-looking) for **both the velocity and energy plots**. The user can then hit **play** to see the rest.
  - *Fallback if "play" is hard to implement:* when "view low velocity" is checked the animation **stops early**; otherwise uncheck it and play the entire trajectory.
- 📎 see Slack for image.

---

## L17 · s1 — Photon worldline
**File:** `L17-s1-photon-worldline-shell.html` · **Status:** Needs small changes

- Add a **"show energies" checkbox**. When selected:
  - a **"photon frequency (ν)" slider** appears, with values in the **visible-light range**, and the **photon worldline changes to the selected colour**;
  - the **"energy:" readouts are filled in** for **both the photon and the massive particle**.
- When **"show energies" is unselected**, **do not display the energy line** in the readouts section.

---

## L18 · s0 — Tachyon causality violation *(may move to L17)*
**File:** `L18-s0-tachyon-causality-violation-shell.html` · **Status:** Needs refactor

- Overall looks great (reviewing version `L18-s0-tachyon-causality-violation-shell`).
- **Move the origin location higher up / centered.**
- **Remove the "superluminal v …" label** currently on top of the superluminal signal. **Replace with "signal v = […]c"** (for **both** the causal and superluminal versions).

---

## L18 · s2 — Causality misconceptions
**File:** `L18-s2-causality-misconceptions-spacetime-explorer-new.html` · **Status:** Potentially Cut

- Change **E₁ → E1** and **E₂ → E2** (subscripts are hard to see).

---

## L19 · s2 — Electric and magnetic fields under boosts
**File:** `L19-s2-E_&_B_boost_v2.html` · **Status:** Needs generating

- Change the setup so the **charge moves at a fixed speed (say 0.5c)** and the **observer has a variable charge**.
- **View one frame at a time** — either **Alice (static lab frame)** or **Bella**. *(This was flipped in the generated sim; revert to **Alice static/lab frame** for consistency with the other sims.)*
- Make the simulation **static**: don't show the whole trajectory — just the **starting point of the charge**, its **instantaneous velocity vector arrow**, and the **net force arrow**.
- Idea: in the **moving frame (Bella)** we see **both B and E fields**; in **Alice's frame** we see **only the E field**.
- 📎 see Slack for sketch.

---

## Slack-dependent items (need the image before finalizing)
- **L05-s1** — (x, y) coordinates for the three simultaneous events.
- **L07-s1** — mode/layout diagram.
- **L12-s0** — setup diagram.
- **L15-s1** — low-velocity view image.
- **L19-s2** — field-under-boost sketch.
