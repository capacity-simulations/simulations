# Fix prompt — Free-Body Diagram Builder

> Paste into Cursor with `Capacity_CM_simulations/Free-Body Diagram Builder.html` open.
> Companion review: `_cm-reviews/Free-Body-Diagram-Builder-review.md`.
>
> Covers all 16 real findings: physics P0 ×3 (FIX 2, 3, 4), physics P1 ×4 (FIX 3 friction
> direction, FIX 4 orbit period, FIX 6, FIX 7), physics P2 ×1 (FIX 11), non-physics P0 ×2
> (FIX 1, 5), non-physics P1 ×5 (FIX 4 ω handler, FIX 8, 9, 10, 12), non-physics P2 ×1 (FIX 13).

---

Fix prompt for `Capacity_CM_simulations/Free-Body Diagram Builder.html`.

A physics review found 16 defects. Fix all of them.

**DO NOT CHANGE:** `netForce()` (L1101, correct), `drawNetArrow()` (L1078, correct), the
block/stack/twobody/pendulum solutions (analytically correct), the orbit inertial-vs-rotating
grading special-cases in `gradeDiagram` L1420–1433 (correct and well-targeted), the
shell/inquiry framework, or the visual style.

**Two things that look wrong but are NOT — leave them alone:**
- The θ arc at `drawStaging` L918. At `phi = PI+th` the point is `(cx - r*cos th, cy - r*sin th)`:
  above the base line, inside the wedge. Correct.
- `#shell-speed` listening on `change`. That is correct for a `<select>`.

**Apply FIX 1 FIRST** — until it lands, nothing in this file can be tested at all.

---

## FIX 1 — [P0 functional] `closeEditor is not defined` throws on EVERY page load

`resetAll` L1721 calls `closeEditor()`. The function is defined **nowhere** — the identifier
appears exactly once in the file. `Shell.init` L689 calls `onReset()`, so it throws during
boot, before the rest of the boot sequence. Consequences:

- `requestAnimationFrame(loop)` never runs → **the animation loop never starts.** `state.time`
  stays 0 forever, the orbit never orbits, and the post-commit "release the body and watch it
  accelerate" reveal has never executed once.
- `renderMath()` never runs → all four KaTeX equations are permanently blank.
- `#inq-dots` stays empty though `Shell.totalSteps === 5`.
- `#shell-reset` throws after clearing state but before `layoutBody(); syncPanels(); fit()`,
  leaving ghost arrow cards, stale readouts and stale canvas arrows; the next interaction runs
  `panelVis(0)` and strips the entire builder UI. Recovery requires a page reload.

Arrows are edited inline in `#arrows-list` (there is no separate editor panel), so the missing
function is just a deselect. Add immediately above `resetAll`:

```js
function closeEditor(){
  state.selectedId = null;
  renderArrowsList();
}
```

---

## FIX 2 — [P0 physics] Net-force direction readout is sign-flipped

`syncPanels` L1553:

```js
const dir=Math.atan2(-n.fy, n.fx)*180/Math.PI; // FIX: sign convention (input 90°=up)
```

`netForce()` already returns `fy` **positive-up** (`fy += mag*sin(theta)`, theta in the sim's
"0°=right, 90°=up" convention). Negating it reports the **screen** angle while the arrow inputs,
the tooltips and `drawNetArrow` (L1078, `Math.atan2(net.fy, net.fx)`) all use the physics
convention — so the sidebar and the canvas contradict each other on screen. A single gravity
arrow at 270° currently reads `90°`: it tells the student the net force on a falling block points
straight **up**.

```js
const dir=Math.atan2(n.fy, n.fx)*180/Math.PI;
```

Delete the misleading `// FIX: sign convention` comment, and update the stale claim in the L270
POLISH comment ("fixed sign convention … using atan2(-fy,fx)").

---

## FIX 3 — [P0 physics] The incline solution is the MIRROR of the drawn incline

`drawStaging` L907–915 draws vertices (60, baseY), (W−60, baseY), (60, topY) with `topY < baseY`
— apex **top-left**, hypotenuse descending to the **right** — whose outward normal is at
`90 − theta`. `layoutBody` L843–844 agrees, offsetting the block by `(+sin th, +cos th)` in
physics coords = `90 − theta`.

Only `solutionFor` L776–777 disagrees, requiring the normal at `90 + theta`. With `dirTol = 15`
(L1435) the mismatch is `2*theta` — up to 120° — so **a student who draws the physically correct
normal is marked wrong**, and the graded-correct green N arrow visibly fails to be perpendicular
to the drawn slope.

Two of three sites already agree on `90 − theta`; fix the third. In `solutionFor` case `'incline'`:

```js
{type:'normal',  dir:90-state.angle,   agent:'incline', mag:m*g*Math.cos(th)},
{type:'friction',dir:180-state.angle,  agent:'incline', mag:0, optional:true}
```

`180 − theta` is **up-slope** for the drawn geometry. This also fixes a second defect: the old
`180 + theta` was down-slope in its own convention, but static friction must **oppose** impending
sliding.

Verified: with the normal at `90 − theta`, `F_net = mg sin(theta)` at angle `−theta` — exactly
down the drawn slope. Magnitudes are unchanged and were already correct.

---

## FIX 4 — [P0 physics] Centrifugal force is hard-coded to mg and ignores ω

`solutionFor` L794: `const Fc = m*g;` is used for **both** the gravity and centrifugal arrows in
the orbit scenario. Canonical: `F_cf = m*omega^2*r`. `#s-omega` spans 0.2–3.0 rad/s — a **225×
range in ω²** — and changes nothing: the required magnitude stays 19.60 N at every value, in both
frames. The declared "surface-skimming, `g = omega^2 r`" assumption cannot hold across a free ω at
fixed r (`orbitRadiusPx()` L755 is fixed), so the scenario is self-inconsistent.

Add near the other constants (g does not belong in this scenario — the gravitational field at
orbital radius is not g):

```js
const ORBIT_R = 2.0;   // physical orbit radius (m) that orbitRadiusPx() depicts
```

Replace the whole `case 'orbit'` body in `solutionFor` with:

```js
case 'orbit': {
  const w = state.omega;
  const Fc = m*w*w*ORBIT_R;            // circular motion: F_c = m omega^2 r
  if(frame==='rotating'){
    return { required:[
      {type:'gravity',     dir:180, agent:'central body', mag:Fc},
      {type:'centrifugal', dir:0,   agent:'(fictitious — rotating frame)', mag:Fc}
    ], note:'In the ROTATING frame the body is at rest — gravity inward (m&omega;&sup2;r) is balanced by the fictitious centrifugal force outward. The body is at rest in this frame, so the Coriolis force (-2m&omega;&times;v&prime;) is zero.' };
  }
  return { required:[
    {type:'gravity', dir:180, agent:'central body', mag:Fc}
  ], note:'In an INERTIAL frame the orbit is due to gravity ALONE (agent: the central body), of magnitude m&omega;&sup2;r. Do NOT add a centrifugal or centripetal "force" arrow — the inward acceleration is the centripetal acceleration (a kinematic quantity), and gravity IS providing it.' };
}
```

This also makes `step()` L1694 (`orbitAngle += dt*state.omega`) consistent with the forces, which
it currently is not.

Then make `#s-omega` live — its handler L1342 is the only one of the four that neither redraws nor
invalidates the commit:

```js
sOmega.addEventListener('input',()=>{ state.omega=parseFloat(sOmega.value); vOmega.textContent=state.omega.toFixed(1); invalidateCommit(); syncPanels(); draw(); });
```

**Required collateral A — arrow scaling.** `pxPerN()` L999 scales to `state.mass*9.8`, now
unrelated to the orbit magnitudes: at m=10, ω=3 the required force is 180 N (~165 px) but at
m=10, ω=0.2 it is 0.8 N (~0.7 px, invisible). Scale to the largest force actually in play — this
also fixes the pre-existing case where a 500 N arrow at m=2 renders 2295 px:

```js
function pxPerN(){
  let ref = 5;
  for(const f of state.arrows) ref = Math.max(ref, f.mag);
  const sol = solutionFor(state.scenario, state.frame);
  if(sol) for(const r of sol.required) ref = Math.max(ref, r.mag||0);
  return 90/ref;
}
```

**Required collateral B — magnitude tolerance.** `gradeDiagram` L1447 uses
`Math.max(0.5, r.mag*0.15)`; at low ω the required force is smaller than the 0.5 N floor,
silently disabling the magnitude check:

```js
const magTol = Math.max(0.05, r.mag*0.15);
```

Finally set `SCENARIOS.orbit.name` (L729) to `'Orbiting body (circular)'` and drop
", surface-skimming" wherever it appears in the Info modal.

---

## FIX 5 — [P0 pedagogy] A wrong agent is graded "✓ Correct FBD"

`gradeDiagram` L1461–1463: the agent-mismatch branch pushes a note but **never sets `ok=false`** —
every other branch (missing, direction, magnitude, extra) does. Gravity with agent "the floor" and
normal with agent "magic" produce a green `✓ Correct FBD.` followed by notes saying both agents
are wrong. The Info modal names agent attribution as this sim's #1 misconception target.

```js
if(r.agent && best.agent && !agentMatches(best.agent, r.agent)){
  ok=false;                                    // <-- ADD THIS LINE
  notes.push('<li>Agent for '+prettyType(r.type)+' looks off — you wrote "'+escHtml(best.agent)+'", expected something like "'+r.agent+'".</li>');
}
```

---

## FIX 6 — [P1 physics] Duplicate arrows of a required type are never flagged

`gradeDiagram` L1437–1444 grades only the closest-direction match per required type, and the
"Extra" loop L1466 only tests `r.type===a.type`, so surplus copies are invisible. gravity
19.6@270 + normal 19.6@90 + a **second gravity 500 N @270** returns `✓ Correct FBD … a = 0` while
the readouts show 500.00 N and 250.00 m/s².

Right after `const matches = ...` and its `matches.length===0` guard:

```js
if(matches.length > 1){
  ok=false;
  notes.push('<li>You drew '+matches.length+' separate <strong>'+prettyType(r.type)+'</strong> arrows. Exactly one agent exerts this force here — combine them into a single arrow.</li>');
}
```

---

## FIX 7 — [P1 physics] The "optional" incline friction is never validated

`req` filters out `optional` entries (L1416) so friction is never direction- or magnitude-checked,
while the Extra loop tests the **unfiltered** `sol.required` so it is never "Extra" either. Incline
30°/5 kg with friction 200 N @30° currently grades `✓ Correct FBD` at F_net = 175.50 N,
a = 35.10 m/s² (3.6 g). A friction that exactly cancels also passes, so "slides at g sin θ" and
"static" get the same green tick.

After the main `for(const r of req)` loop:

```js
for(const r of sol.required.filter(r=>r.optional)){
  const drawn = state.arrows.filter(a=>a.type===r.type);
  if(!drawn.length) continue;                 // optional: absent is fine
  if(drawn.length > 1){
    ok=false;
    notes.push('<li>You drew '+drawn.length+' separate <strong>'+prettyType(r.type)+'</strong> arrows — combine them into one.</li>');
    continue;
  }
  const f = drawn[0];
  const dd = Math.abs(((f.angleDeg - r.dir + 540)%360)-180);
  const along = (dd <= dirTol) || (Math.abs(dd-180) <= dirTol);   // up- or down-slope
  if(!along){
    ok=false;
    notes.push('<li><strong>Friction</strong> must act ALONG the surface — you drew '+f.angleDeg.toFixed(0)+'&deg;, expected &asymp;'+r.dir.toFixed(0)+'&deg; (up-slope) or '+((r.dir+180)%360).toFixed(0)+'&deg; (down-slope).</li>');
  }
  const MU_S = 0.6;                            // declared in the Formal panel
  const N = state.mass*9.8*Math.cos(state.angle*Math.PI/180);
  if(f.mag > MU_S*N + 0.05){
    ok=false;
    notes.push('<li><strong>Friction</strong> of '+f.mag.toFixed(1)+' N exceeds what static friction can supply here: f &le; &mu;<sub>s</sub>N = '+(MU_S*N).toFixed(1)+' N.</li>');
  }
}
```

Add `mu_s = 0.6` to the Formal panel equations so the bound is declared, not magic.

---

## FIX 8 — [P1 pedagogy] Readouts and the release animation fire for diagrams graded WRONG

A gravity-only commit is correctly rejected ("Missing: normal") yet `#stat-committed` flips to
`yes`, the readouts print 19.60 N / 9.80 m/s², the net arrow is drawn, and `state.simAnim`
launches the body.

**a)** Add `gradeOk:false` to the `state` object (L732–752).

**b)** In `commitDiagram` L1394–1401, record the verdict and only build `simAnim` when the diagram
is acceptable (sandbox has no grading, so it always is):

```js
state.committed=true;
if(state.mode==='checked'){
  const grade=gradeDiagram();
  state.gradeOk = grade.ok;
  gradeBanner.className='grade-banner '+(grade.ok?'correct':'wrong');
  gradeBanner.style.display='block';
  gradeBanner.innerHTML = grade.html;
} else {
  state.gradeOk = true;
  gradeBanner.style.display='none';
}
if(state.gradeOk){
  const n = netForce();
  const m = state.mass;
  const TIME_SCALE = 6;
  state.simAnim = { x0: state.bodyPos.x, y0: state.bodyPos.y,
                    ax: (n.fx/m) * TIME_SCALE, ay: -(n.fy/m) * TIME_SCALE,
                    t:0, active:true };
} else {
  state.simAnim = null;
}
syncPanels();
draw();
```

**c)** `syncPanels` L1548: `if(state.committed){` → `if(state.committed && state.gradeOk){`
**d)** `drawArrows` L985: `if(state.committed){` → `if(state.committed && state.gradeOk){`
**e)** `invalidateCommit` L1184: add `state.gradeOk=false;`
**f)** `resetAll` L1715: add `state.gradeOk=false;`

---

## FIX 9 — [P1 ux] Stale green banner survives a parameter change

The four slider handlers L1340–1343 set `state.committed=false` **directly** instead of calling
`invalidateCommit()` L1184, which is the function that hides the banner. Commit a correct block FBD
at m=2, drag mass to 8: readouts correctly blank to "—", arrow magnitudes are now wrong for the new
weight, but `✓ Correct FBD` stays up.

Replace `state.committed=false;` with `invalidateCommit();` in the `s-mass`, `s-angle` and `s-fapp`
handlers (`s-omega` is already corrected in FIX 4), and in the `scenarioSel` change handler L1345,
which also clears `state.simAnim` by hand.

---

## FIX 10 — [P1 pedagogy] Stale rebuttal wording for an 'other'-type arrow

`extraExplanation` L1490 returns "no real agent has been identified" for every `other` arrow — but
`commitDiagram` L1384 already blocks arrows with an **empty** agent, so by the time this runs the
student **has** typed one (e.g. "motion"). The rejection is right; the stated reason is factually
wrong about their input.

```js
if(t==='other') return 'the agent you named isn\'t a body in contact with this object, and isn\'t acting on it at a distance — so it can\'t exert a force. "Motion", "momentum" and "inertia" are not agents.';
```

---

## FIX 11 — [P2 physics] Coriolis is a dead force type that the UI asks for

`coriolis` exists in `COLORS` L719, `symbolFor` L1096 and `prettyType`, and `#frame-note` tells the
student to "add centrifugal (**and Coriolis if the body moves**)" — but no solution includes it, so
adding one is graded `Extra: Coriolis — no agent in this scenario applies this kind of force`, the
wrong justification for a fictitious force.

**a)** In the rotating-frame text set on `#frame-note` (search the string in `syncPanels`):
"Rotating frame: add the fictitious centrifugal force. The body is at rest in this frame
(v′ = 0), so the Coriolis force −2mω×v′ is zero."

**b)** In `extraExplanation`, before the generic fallback:

```js
if(t==='coriolis') return 'the Coriolis force is -2m&omega;&times;v&prime;, which vanishes when the body is at rest in the rotating frame — as it is here. It is also fictitious, so it never appears in an inertial frame.';
```

Keep the type registered for future moving-body scenarios.

---

## FIX 12 — [P1 functional] No `window.__audit`; readouts invisible to the harness

The standard review probe returns `readouts: []` / `audit: null` for all 14 states. Add after
`netForce()`:

```js
window.__audit = () => {
  const n = netForce();
  const mag = Math.hypot(n.fx, n.fy);
  const sol = solutionFor(state.scenario, state.frame);
  return {
    scenario: state.scenario, frame: state.frame, mode: state.mode,
    m: state.mass, angle: state.angle, omega: state.omega, fapp: state.fapp,
    arrows: state.arrows.map(a=>({type:a.type, agent:a.agent, mag:a.mag, dir:a.angleDeg})),
    required: sol ? sol.required.map(r=>({type:r.type, dir:r.dir, mag:r.mag, optional:!!r.optional})) : null,
    committed: state.committed, gradeOk: state.gradeOk,
    fnet: mag, fdir: mag<0.05 ? null : Math.atan2(n.fy, n.fx)*180/Math.PI,
    acc: mag/state.mass
  };
};
```

Also add `shell-readout` alongside `stat-value` on `#stat-fnet`, `#stat-fdir` and `#stat-acc`
(L493, L500, L507) so the generic probe scrapes them.

---

## FIX 13 — [P2 ux] Scenario name disagrees between model and menu

`SCENARIOS.twobody.name` is `'Two-body: A pushes B'` but the `<option>` L425 reads
`'Two-body: push A onto B'`. Make the option match the model: `'Two-body: A pushes B'`.
(The `orbit` label is handled in FIX 4.)

---

## ACCEPTANCE

1. **BOOT:** zero console errors. `state.time` grows (loop running). All four KaTeX equations
   render. 5 inquiry dots. `#shell-reset` fully resets and leaves the builder usable (scenario
   select, parameters, Forces panel, Commit all visible).
2. **DIRECTION:** single gravity 78.4 N @270° → `#stat-fdir` reads `-90°`, canvas agrees.
   Applied 10 N @45° → `45°`.
3. **INCLINE:** at θ=30 the required normal is 60° and the drawn green N arrow is visibly
   perpendicular to the hypotenuse. Sweep θ=0/30/60 × m=1/5/10 and confirm **unchanged**:
   N = mg cos θ (8.49/42.44/84.87 and 4.90/24.50/49.00 N), F_net = mg sin θ, a = g sin θ =
   4.90 / 8.49 m/s² and **mass-independent**. Net force now points at −θ, down the drawn slope.
4. **ORBIT:** required |F| scales as ω² — at m=2, r=2: ω=0.2 → 0.16 N, ω=1.0 → 4.00 N,
   ω=3.0 → 36.00 N, both frames. Inertial a = ω²r (4.00 m/s² at ω=1). Rotating frame still
   balances to 0.00 N. The two orbit special-cases still reject centrifugal-in-inertial and
   missing-centrifugal-in-rotating. The orbit visibly rotates with period 2π/ω.
5. **GRADER** — these must now be **rejected** (they currently pass):
   - gravity agent "the floor" + normal agent "magic"
   - gravity 19.6@270 + normal 19.6@90 + second gravity 500 N @270
   - incline 30/5 with friction 200 N @30°

   These must still be **accepted**: the exact required set for all 6 scenarios, and both frames
   for orbit.
6. **READOUTS:** a gravity-only commit shows the rejection banner **and** leaves
   `#stat-fnet/#stat-fdir/#stat-acc` at "—", no net arrow, no body motion. A correct commit shows
   the numbers and animates the release.
7. **BANNER:** commit correct at m=2, drag mass to 8 → banner disappears with the readouts.
8. **SCALING:** no arrow exceeds ~90 px at any (scenario, m, ω, F_app) combination, none shorter
   than ~1 px at the slider extremes.
9. `window.__audit()` returns finite values; the standard probe reports `errors: []` and non-null
   `audit` for all 14 states.
10. No NaN or Infinity in any readout at any slider extreme.
