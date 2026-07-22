# New SR Sims — paste-ready prompts (Sim Studio)

Simple, self-contained generation prompts for the 6 "Needs generating" sims from
*New Special Relativity Simulation Summaries.xlsx* (New sims needed tab). Each folds in the
sheet's Simulation Summary, Inquiry questions, Additional notes and Rough notes. Added one at a time.

---

## L00-s1 · Fly on a boat  (Prelude — Galilean relativity)

*Naming note: the xlsx says the cabin pair is Alice & Bella; the lecture text says Alice & Bob. Prompt uses Alice & Bella — swap if the manager prefers Bob.*

Build an interactive 2D simulation: **"Fly on a boat"** (Galilean relativity — Lecture 0, Prelude). No relativistic effects.

**Scene:** A 2D side view. A ship glides at constant velocity `v_boat` to the right, past a beach where **Galileo** stands watching. **Alice and Bella** are inside the ship's cabin. A **fly** is released inside the cabin and **falls** to the floor under gravity.

**Frames:** A frame selector switches between the **Cabin frame (Alice & Bella)** and the **Beach frame (Galileo)**. In the cabin frame the cabin is fixed and the beach scrolls left; in the beach frame the beach is fixed and the ship slides right.

**Physics — Galilean only (beach velocity = cabin velocity + boat velocity; no γ, no Lorentz, no light-speed limit):**
- The fly is released from rest relative to the cabin at height `h` and falls under gravity `g`.
- Cabin frame: straight vertical drop. `x = 0`, `y = h − ½gt²`; `vₓ = 0`, `v_y = −gt`.
- Beach frame: it also carries the boat's forward speed, tracing a parabola. `x = v_boat·t`, `y = h − ½gt²`; `vₓ = v_boat`, `v_y = −gt`.
- `v_y(t)` and the fall time `T = √(2h/g)` are identical in both frames; only `vₓ` (0 vs `v_boat`) and the path shape differ.

**Controls:** a slider for boat speed `v_boat` (optionally release height `h`), plus Play/Reset. No "throw speed" control — the fly is dropped, not thrown.

**Readouts:** two live panels showing the fly's **position (x, y)** and **velocity (vₓ, v_y)** in the currently active frame, each labelled with the active frame.

**Trajectory:** trace the fly's path in the active frame; on frame switch, clear and redraw from the new frame — a straight vertical drop in the cabin, a forward-leaning parabola from the beach.

**Guided inquiry (predict → construct → evaluate):**
1. Predict (before running): the fly is released and falls while the ship glides forward. Sketch its path as seen by Alice & Bella in the cabin, then by Galileo on the beach. Same physical event — can both sketches be right at once?
2. Cabin frame: run it — the fly drops straight down; read x, y, vₓ (=0), v_y.
3. Predict the beach path: what does Galileo see? (A) straight down, same as the cabin [wrong]; (B) a parabola leaning the way the ship moves [correct]; (C) it drifts backward, left behind [wrong]. (The fly already carries the ship's horizontal velocity and no horizontal force acts, so it keeps pace → parabola.)
4. Beach velocity: read vₓ — (A) 0 [wrong]; (B) `v_boat` [correct]; (C) negative [wrong].
5. Evaluate: v_y and the fall time are the same in both frames; only vₓ and the path shape differ. Same fly, same fall, same gravity → both frames describe the same event, both valid (equivalence of inertial observers).

**Closing question (bridge to SR — pose only, don't model):** "Suppose instead of a fly we tracked a **light pulse** — would the same 'just add the ship's velocity' rule still work?"

**Optional:** also allow a stripped-back "lecture visual aid" version that hides the inquiry and just shows the straight-drop vs parabola frame switch.

---

## L06-s1 · Relative velocity of plane  (Galilean velocity addition)

*Recast of the "Dodgeball" sim (status Cut). Skeleton stays the same; scene follows Lecture 6 §b.*

Build an interactive 2D simulation: **"Relative velocity of plane"** (Galilean velocity addition — Lecture 6). No relativistic effects.

**Scene:** A 2D top-down view along one horizontal axis (all motion collinear, moving East/right). Three objects: **Alice** at rest on the ground; **Bob** moving at velocity `V` relative to the ground (e.g. on a train); and a **plane** moving at velocity `u` relative to the ground. Show each as a labelled figure/icon with a velocity arrow.

**Frames:** A frame selector with three choices — **Alice's rest frame (ground frame S)**, **Bob's rest frame**, and the **plane's rest frame**. Switching frames instantly updates all velocity readouts and redraws the trajectories from the new frame's perspective (the object defining the active frame becomes stationary).

**Physics — Galilean velocity addition only (no γ, no Lorentz, no light-speed limit):** in a frame moving at velocity `W` relative to the ground, every object's velocity = (its ground velocity) − `W`.
- Ground frame (Alice, S): Alice = 0, Bob = `V`, plane = `u`.
- Bob's frame: Alice = `−V`, Bob = 0, plane = `u − V`.
- Plane's frame: Alice = `−u`, Bob = `V − u`, plane = 0.

**Controls:** sliders for `V` (Bob/train speed) and `u` (plane speed), in km/h. Defaults **`u = 200 km/h`, `V = 100 km/h`** — so switching to Bob's frame reproduces the lecture's worked answer, plane = `u − V` = **100 km/h**. Plus Play/Reset.

**Readout panels:**
- A **frame indicator** (top-right corner): the active frame's name and its velocity relative to the ground.
- A **velocity readout**: the speed and direction of Alice, Bob, and the plane in the currently selected frame, with the **Galilean addition shown alongside the numbers** — e.g. in Bob's frame display "plane: u′ = u − V = 200 − 100 = 100 km/h".

**Guided inquiry (predict → select frame → evaluate):** requiring the student to actively select a frame before reading off velocities makes frame-dependence unavoidable by design.
1. Predict: Alice sees the plane at `u = 200 km/h` and the train (Bob) at `V = 100 km/h`, both East. What speed does Bob measure for the plane? (A) 300 km/h — you add them [wrong]; (B) 200 km/h — same as Alice [wrong]; (C) 100 km/h — `u − V` [correct].
2. Check: switch to Bob's frame and read the plane's velocity — `u − V = 100 km/h`.
3. Explore: change `V` and `u` and switch frames; confirm the plane's speed in Bob's frame is always `u − V`, and that every object's velocity shifts by `−W` when you enter a frame moving at `W`.
4. Closing question (bridge to SR — pose only, don't model): "If the 'plane' were a light pulse instead, would this simple `u − V` subtraction still work?" — the assumption that velocities just add is exactly what special relativity overturns.

---

## L07-s1 · Airplane in wind  (aether-wind analogy for the speed of light)

*Lecture 7 §b — motivates Michelson–Morley. Classical/Galilean speeds only.*

Build an interactive 2D simulation: **"Airplane in wind"** (aether-wind analogy for the speed of light — Lecture 7, §b). Classical/Galilean speeds only.

**Scene:** A 2D top-down view with two airports **400 km apart**; a plane flies **round trips** between them at a fixed **airspeed of 100 km/h** (its speed through the air). A steady **wind** of adjustable speed `w` (default **60 km/h**, keep `w` < 100) blows across the scene, drawn as **prominent, clearly visible arrows**. A running timer accumulates **each leg separately** before showing the round-trip total (so the slow leg is visibly the one that dominates).

**Three selectable cases (present in this order):**
1. **No wind (baseline):** ground speed 100 km/h each way → **4 h each way, 8 h total.**
2. **Crosswind (wind perpendicular to the route):** the plane must **crab** (visibly angle its nose into the wind) to hold a straight ground track, so ground speed = `√(100² − w²)` = `√(100² − 60²)` = **80 km/h** → **5 h each way, 10 h total.**
3. **Tailwind/headwind (wind parallel to the route):** outbound = `100 + w` = **160 km/h** (2.5 h); return = `100 − w` = **40 km/h** (10 h) → **12.5 h total.**

**Summary panel:** the three round-trip times side by side — **8 h / 10 h / 12.5 h**.

**Physics (make the formulas explicit; all classical velocity addition):**
- Times are `distance ÷ ground speed`, `distance = 400 km` each way.
- Parallel legs add/subtract the wind (`100 ± w`); the perpendicular case uses `√(100² − w²)`.
- **Key misconception:** in the parallel case the tailwind and headwind legs do **not** cancel — the round trip (12.5 h) is slower than no wind (8 h) because you spend far longer on the slow (headwind) leg; and it's slower than the perpendicular case (10 h).

**Controls:** slider for wind speed `w` (default 60, `w` < 100); case selector (1/2/3); Play/Reset. All three round-trip times recompute live as `w` changes.

**Guided element (predict → run):** before Case 3 ask — *"Out with a tailwind, back into a headwind. Do the legs cancel, giving 8 h like no wind?"* (A) yes → 8 h [wrong]; (B) no, ~12.5 h, the slow headwind leg dominates [correct]. Then run it and read the split timer.

**Closing bridge (state explicitly):** this is the analogy behind the **Michelson–Morley experiment** — light as the plane, the hypothetical **aether wind** as the wind. The parallel vs perpendicular "arms" would take **different round-trip times**, showing up as a **shift in the interference fringes** when the apparatus rotates. Michelson–Morley looked for that shift and found none — which forces the speed of light to be the same for all observers.

---

## L11-s3 · Length contraction & simultaneity  (Lecture 11 §b)

*Match Alice/Bella colours from the light-clock sim: Alice = blue, Bella = orange.*

Build an interactive 2D simulation: **"Length contraction & simultaneity"** (Lecture 11, §b — length contraction is a consequence of the relativity of simultaneity).

**Scene:** A 2D side view of a room. **Bella** (orange) runs left-to-right through the room at speed `v` carrying a **horizontal rod** of rest length `L₀`; **Alice** (blue) stands at rest in the room. To measure the moving rod, Alice marks both of its endpoints at the same instant — draw this as **two marker flashes**, one at each end of the rod. Alice = blue, Bella = orange (colours from the light-clock sim).

**Frames:** A frame selector with two choices — **Alice's frame (room, blue)** and **Bella's frame (rod's rest frame, orange)**. The rod is drawn on screen in whichever frame is active (moving in Alice's frame, stationary in Bella's), and the two endpoint-marking events are shown on both a small space diagram and a time readout, so the student sees the *same two events* in each frame.

**The measurement:** a **"Measure" button** fires the two endpoint-marking events. These two events are **simultaneous in Alice's frame** (`Δt = 0` by construction — that's what "measure a length" means). The gap between the marks is the length each frame attributes to the rod.

**Physics (`c = 1` for the transform; display lengths in cm):**
- `γ = 1/√(1 − v²/c²)`.
- **Rest length (Bella):** the rod is at rest, measured at leisure → `L₀ = x₂′ − x₁′` (proper length, the longest).
- **Contracted length (Alice):** the moving rod measures `L = L₀/γ < L₀`.
- **The two marking events:** simultaneous for Alice (`Δt = 0`), but Lorentz-transforming to Bella (`t′ = γ(t − v·x/c²)`) gives `Δt′ = γ·v·L/c² ≠ 0` — **not simultaneous for Bella**. That non-simultaneity is *why* Alice's rod is shorter: her two "same instant" marks were made at different times in Bella's frame.

**Controls:** a `v/c` slider (default **`v = 0.8c`**); an `L₀` control (default **`L₀ = 10 cm`**); the frame selector (Alice / Bella); the **Measure** button; Play/Reset.

**Readouts (update on frame switch):** `L₀`, the measured length `L` in the active frame, `γ`, and the **two marking-event times** in the active frame — equal for Alice (`t₁ = t₂`), unequal for Bella (`t₁′ ≠ t₂′`), with the gap `Δt′` shown.

**Guided inquiry (predict → measure → switch frame → evaluate):**
1. Predict: Alice measures Bella's moving rod. Longer, same, or shorter than `L₀`? (A) longer [wrong]; (B) same [wrong]; (C) shorter, `L₀/γ` [correct].
2. Measure (Alice's frame): press Measure — the two ends are marked at the same instant; read `L = L₀/γ`.
3. Predict: were Alice's two marks made at the same time for Bella too? (A) yes, simultaneous for everyone [wrong]; (B) no — they happen at different times in Bella's frame [correct].
4. Switch to Bella's frame: the same two marking events are now **not simultaneous** (`Δt′ = γvL/c² ≠ 0`); read the two unequal times. In Bella's frame the rod is at rest at its full `L₀`.
5. Evaluate: length contraction (`L = L₀/γ`) and the relativity of simultaneity are the **same fact** seen two ways — Alice's shorter measurement follows directly from her two marks not being simultaneous for Bella.

**Worked check (`v = 0.8c`, `L₀ = 10 cm`):** `γ = 5/3 ≈ 1.667`, so Alice measures **`L = 6 cm`** (lecture's worked answer), while Bella still has the full `L₀ = 10 cm` rod. The two marks, simultaneous for Alice, are separated by `Δt′ = γvL/c² = (5/3)(0.8)(6) = 8` (in cm-of-light units) for Bella.

**Closing bridge (state explicitly):** the moving rod isn't "really" shorter — Alice and Bella simply disagree about which pairs of events are simultaneous, and length depends on measuring both ends *at once*.

---

## L12-s2 · Twin paradox — one-way call / signal  ("no return" mode)

*A "no-return" variant of the twin-paradox worldline diagram. We already prototyped this logic as the "one-way + signal" mode inside the shell L12-s1, so the physics is validated — this is the standalone Sim Studio build.*

Build an interactive simulation: **"Twin paradox — one-way call / signal"** (Lecture 12). No-return variant.

**Scene:** A Minkowski diagram (space `x` horizontal, time `ct` vertical). Two worldlines leave a common departure event **E₁**:
- **Alice** (stay-at-home): a straight vertical line at `x = 0` (inertial).
- **Bella** (traveller): a single straight line at speed `v` — she does not return. `x = v·t`.
Alice = blue, Bella = orange.

**The call:** at an event **E_C** on Bella's worldline, Bella calls Alice — a **light signal (45° line)** is emitted from E_C toward Alice, landing on Alice's worldline at reception event **E_R**, carrying Bella's location and clock reading.

**Physics (`c = 1`):**
- `γ = 1/√(1 − v²)`. `E₁ = (0,0)`; `E_C = (v·t_C, t_C)`; light goes leftward at 45° → `E_R = (0, t_C·(1+v))`.
- Bella's proper time at E_C (reported): `τ_B = t_C·√(1−v²) = t_C/γ`.
- Alice's proper time at E_R (when the call arrives): `τ_A = t_C·(1+v)`.
- The signal stays 45° in every frame (light-speed invariance).

**Frames:** selector with **S (Alice's rest frame)** and **S′ (Bella's rest frame)**. Switching redraws + updates all event coordinates via `t′ = γ(t − v·x)`, `x′ = γ(x − v·t)`. (In S′: Bella vertical, Alice at `−v`, `E_C = (0, τ_B)`, signal still 45°.)

**Labels & readouts:** label each event **E₁, E_C, E_R** with its **(x, ct) coordinates in the active frame**; display **Bella's proper time at E_C** and **Alice's proper time at E_R**.

**Controls:** a `v` slider (default `v = 0.6`); a control to set the call time `t_C` (slider or drag E_C along Bella's worldline); Play/Reset.

**Worked check (v = 0.6, t_C = 5):** `E_C = (3, 5)`, `E_R = (0, 8)`, `τ_B = 4`, `τ_A = 8` — Bella reports clock = 4 while Alice's clock = 8 on arrival (light delay + one-way time dilation, no turnaround).

---

## L19-s1 · Electric & magnetic fields under a boost  (Lecture 19 — Lorentz force & E/B mixing)

*Lecture-demo. Correctness note: the rough notes say "B shrink," but the transform gives B → γB (grows); it's the magnetic FORCE that vanishes in Alice's frame because v′=0, not B.*

Build an interactive simulation: **"Electric & magnetic fields under a boost"** (Lecture 19 — the Lorentz force & E/B mixing). Lecture-demo mode.

**Big idea:** E and B are frame-dependent facets of one electromagnetic field. A deflection that looks purely magnetic in one frame is purely electric in the charge's own rest frame — same physics, frame-dependent explanation.

**Layout:** two lab views **side by side** — **Bob's frame** (left) and **Alice's frame** (right) — plus a **mandatory frame selector** and a **boost slider** sweeping an observer's speed `β` from `0` (Bob) to `v` (Alice, riding the charge). Live field readouts (E, B) per frame.

**Bob's frame:** charge `q` moves at `v` along `+x`; **pure B field into the page** (`E = 0`, `B = B ẑ`). Magnetic force `F = q v × B = qvB` deflects it **+y**; trace the curved track.

**Alice's frame (boosted to ride the charge):** `v′ = 0` → **magnetic force vanishes**. An **electric field appears**, `E′ = γvB` (vertical, giving the same +y deflection), so electric force `qE′ = qγvB` produces the **same deflection**. Important: B does **not** shrink — it transforms to `B′ = γB` (larger); it just exerts no force on a stationary charge.

**Field transform (boost along x by β, `c = 1`):**
- `E′_y = γ(E_y − β·B_z)`, `B′_z = γ(B_z − β·E_y)`, `γ = 1/√(1−β²)`.
- From Bob (`E_y=0`, `B_z=B`): at `β`, `E′ = −γβB` (grows from 0), `B′ = γB`. At `β=v`: `E′ = γvB`, `B′ = γB`.

**Boost slider:** as `β` sweeps `0 → v`, **E grows continuously from 0 to γvB** (and B from B to γB), while the physical deflection stays the same in every frame (transverse momentum is boost-invariant; time dilation reconciles the force rates).

**Controls & readouts:** a `v` (or `B`) slider; the boost slider `β`; frame selector (Bob / Alice). Per-frame E and B readouts (magnitude + direction), and the force type/magnitude ("magnetic qvB" vs "electric qγvB").

**Worked check (v = 0.6, B = 1):** `γ = 1.25`; Alice's `E′ = 0.75`, `B′ = 1.25`; magnetic force in Bob `= 0.6q`, electric force in Alice `= 0.75q` — different force values (differ by γ), same physical deflection.

---

## ⚙️ `__audit` verification hook — add to ALL new sims (cross-cutting)

*Every other sim in this set exposes a `window.__audit` object; the newly generated sims are missing it. Add it to each. It is a **verification hook only** — invisible to students, does not touch rendering, physics, controls, or layout, and never runs during normal use. It exists so the sim's core physics can be checked headlessly (Node, no browser) by comparing its returned numbers against the worked checks below.*

**General contract (same for every sim):**
- Add, as the **last statement** of the sim's script (immediately before `</script>`, or at the end of the sim IIFE so it can see the physics functions/state), a global:
  ```js
  window.__audit = { at(param){ /* return an object of PURE physics numbers */ } };
  ```
- It must **reuse the sim's existing physics functions/variables** (do not re-derive or hardcode) — call the same code the sim already uses, just return the raw numbers (SI or natural units, not pixels).
- It must have **zero side effects**: no drawing, no state mutation, no DOM writes. Reading `state`/inputs is fine.
- Do **not** run a browser/HTTP server to test — leave visual testing to me. Verify only with `node --check`.

**Per-sim: what `at(...)` should return, and the worked check it must satisfy.** Adapt the parameter and field names to the sim's actual variables; the *values* are what matter.

- **L00-s2 · Fly on a boat** — `at(t)` returns `{ T, y, vy, x_cabin, vx_cabin, x_beach, vx_beach }` where `T=√(2h/g)`, `y=h−½gt²`, `vy=−gt`, cabin `x=0,vx=0`, beach `x=v_boat·t, vx=v_boat`.
  *Check (h=2.5, g=9.8, v_boat=4):* `T≈0.7143`; at `t=0.5` → `y≈1.275`, `vy≈−4.9`, `vx_cabin=0`, `vx_beach=4`, `x_beach=2`.

- **L06-s1 · Relative velocity of plane** — `at(frame)` (or return all three) returns each object's velocity `{ alice, bob, plane }` in the chosen frame, using `vel_in_frame = ground_vel − W`.
  *Check (u=200, V=100):* ground → `{0,100,200}`; Bob's frame → `{−100, 0, 100}` (plane = u−V = 100); plane's frame → `{−200, −100, 0}`.

- **L07-s1 · Airplane in wind** — `at(w)` returns `{ t_none, t_cross, t_parallel }` round-trip times, with `t_none=2·D/c_air`, `t_cross=2·D/√(c_air²−w²)`, `t_parallel=D/(c_air+w)+D/(c_air−w)` (D=400, c_air=100).
  *Check (w=60):* `t_none=8`, `t_cross=10` (ground speed √(100²−60²)=80), `t_parallel=12.5`.

- **L11-s3 · Length contraction & simultaneity** — `at(v)` returns `{ gamma, L, dtPrime }` where `gamma=1/√(1−v²)`, `L=L0/gamma`, `dtPrime=gamma·v·L/c²` (c=1; L0 in cm).
  *Check (v=0.8, L0=10):* `gamma=5/3≈1.6667`, `L=6`, `dtPrime=8`.

- **L12-s2 · Twin paradox — one-way call** — `at(v, tC)` returns `{ gamma, E_C:[x,ct], E_R:[x,ct], tauB, tauA }` with `gamma=1/√(1−v²)`, `E_C=[v·tC, tC]`, `E_R=[0, tC·(1+v)]`, `tauB=tC/gamma`, `tauA=tC·(1+v)`.
  *Check (v=0.6, tC=5):* `gamma=1.25`, `E_C=[3,5]`, `E_R=[0,8]`, `tauB=4`, `tauA=8`.

- **L19-s1 · E & B under a boost** — `at(beta)` returns `{ gamma, Ey, Bz }` in the boosted frame from Bob's `E_y=0, B_z=B`: `gamma=1/√(1−β²)`, `Ey=gamma(0−β·B)=−γβB`, `Bz=gamma·B`.
  *Check (B=1, β=0.6):* `gamma=1.25`, `Ey=−0.75` (magnitude 0.75), `Bz=1.25`.

**Verify (no browser):** `node --check` passes; loading the file and calling `window.__audit.at(<check input>)` returns the worked-check numbers above (to ~1e−6). Confirm nothing else changed — the hook is purely additive.
