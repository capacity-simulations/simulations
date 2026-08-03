# Review — Free-Body Diagram Builder

**System:** A reusable FBD *builder* (L4, Forces & Newton's Laws): the student adds agent-labelled force arrows to a body across 6 scenarios (block, stack, incline, two-body, pendulum, orbit), commits, and the diagram is graded against a known-good solution before the net-force/acceleration reveal.
**Verdict:** The core force models are right — `N = mg cos θ`, `F_net = mg sin θ`, `a = g sin θ` (mass-independent), balanced statics, and the inertial-vs-rotating orbit distinction are all analytically correct and correctly graded. But **the sim throws a ReferenceError on every page load** that silently kills the animation loop and all four equations, the **incline solution is the mirror image of the incline it draws**, the **net-force direction readout is sign-flipped**, the **ω slider is physically inert**, and **a wrong agent is graded "✓ Correct"** — which defeats the sim's own headline misconception target.
**Browser-probe:** ran — 14 states, **1 js-error** (`closeEditor is not defined`), 4 sliders; `readouts: []` / `audit: null` for all 14 (no `window.__audit`, readouts use `.stat-value`). Plus a scripted driver session (7 task groups, 20 screenshots) that reproduced the error, swept the incline, toggled frames, and probed the grader with 6 malformed diagrams.

---

## PHYSICS

### P0

- **[high] Net-force direction readout is sign-flipped — it reports the screen angle while everything else uses the physics convention.** `syncPanels` L1553: `Math.atan2(-n.fy, n.fx)`, but `netForce()` (L1101–1112) already returns `fy` **positive-up** (`fy += mag*sin(θ)`, θ in "0°=right, 90°=up"). The canvas overlay `drawNetArrow` (L1078) uses the correct `atan2(net.fy, net.fx)`, so the two disagree **on screen simultaneously**. Canonical: report in the same convention the student types. → **Fix:** `Math.atan2(n.fy, n.fx)`. The `// FIX: sign convention` comment and the L269 POLISH note claim this line was the fix; it is the bug. [evidence: single gravity 78.4 N @270° → readout **90°** (straight up) for a straight-down net force; incline 30°/5 kg → sidebar `150°` vs canvas `-150°`, `drv-incline-30-5.png`]

- **[high] The incline solution is the mirror image of the incline that is drawn.** `solutionFor` L776–777 requires `normal` at `90+θ` and `friction` at `180+θ`. But `drawStaging` L907–915 draws vertices (60, baseY), (W−60, baseY), (60, topY) with `topY < baseY` — apex **top-left**, hypotenuse descending to the **right** — whose outward normal is `90−θ`; and `layoutBody` L843–844 seats the block along `(+sin θ, +cos θ)` = **`90−θ`**, agreeing with the drawing. Only `solutionFor` disagrees. With `dirTol = 15°` (L1435) the mismatch is `2θ` — up to **120°** — so **a student who draws the physically correct normal is marked wrong**, and the graded-correct green `N` arrow visibly fails to be perpendicular to the drawn slope. → **Fix:** in `solutionFor` case `'incline'`, `dir: 90-state.angle` for normal and `dir: 180-state.angle` for friction. Verified: with `90−θ`, `F_net` = `mg sin θ` at `−θ` — exactly down the drawn slope. [evidence: `drv-incline-30-5.png` — green `N — incline 42.4 N` points up-and-left, off the hypotenuse]

- **[high] Centrifugal magnitude is hard-coded to `mg` and ignores ω entirely.** `solutionFor` L794: `const Fc = m*g` is used for both the gravity and centrifugal arrows in the orbit scenario. Canonical `F_cf = mω²r`. `#s-omega` spans 0.2→3.0 rad/s — a **225× range in ω²** — with the required centrifugal staying **19.60 N at every value**. The declared "surface-skimming, `g = ω²r`" assumption would fix `ω = √(g/r)` at a single value, but `r` is `orbitRadiusPx()` (L755, fixed) while ω is freely draggable, so the assumption is self-inconsistent across the slider. → **Fix:** either map the slider to a physical `r` and compute `Fc = m*state.omega**2*r`, or drop `#s-omega` from the orbit scenario and state ω is fixed by `g = ω²r`. [evidence: ω = 0.2 / 1.6 / 3.0 all give identical required magnitudes and identical readouts in both frames]

### P1

- **[high] Duplicate arrows of a required type are neither graded nor flagged as extra.** `gradeDiagram` L1437–1444 grades only the *closest-direction* match per required type, and the "Extra" loop L1466 only tests `r.type===a.type`. A diagram with gravity 19.6 N @270 + normal 19.6 N @90 + **a second gravity 500 N @270** returns **`✓ Correct FBD … ⇒ a = 0`** while the readouts show `500.00 N` and `250.00 m/s²`. → **Fix:** flag `matches.length > 1` as an error unless the scenario legitimately admits two of a type.
- **[high] The "optional" incline friction is never validated at any magnitude.** `req` filters out `optional` entries (L1416) but the Extra loop tests against the *unfiltered* `sol.required`, so friction is invisible to the grader. Incline 30°/5 kg with **friction 200 N @30°** grades `✓ Correct` with `F_net = 175.50 N`, `a = 35.10 m/s²` (3.6 g). A friction that exactly cancels (`24.5 N`) also passes, so "slides at g sin θ" and "static" get the same green tick. → **Fix:** grade optional entries when present — direction within tolerance and `f ≤ μ_s N`.
- **[med] Static friction in the incline solution points down-slope.** L777 `dir: 180+state.angle` is the down-slope direction in its own (mirrored) convention; static friction must **oppose** impending sliding, i.e. up-slope. Currently masked by `mag: 0` + `optional`, so it is never drawn or graded — but it is the model the solution asserts. → **Fix:** with the P0 mirror fix, up-slope is `180−θ`.
- **[med] Orbit visual period is inconsistent with the surface-skimming assumption.** `step` L1694 advances `orbitAngle += dt*state.omega` using the free slider ω, while the forces assume `ω = √(g/r)`. Latent only because the loop never runs (see non-physics P0). → **Fix:** derive the visual ω from `√(g/r)`, or resolve with the P0 ω fix.

### P2

- **[med] The θ arc is drawn outside the wedge.** `drawStaging` L918: `ctx.arc(baseX1, baseY, 28, Math.PI, Math.PI+th, false)` sweeps **below** the base line rather than into the triangle, so the angle marker doesn't mark the angle. → **Fix:** sweep `Math.PI-th → Math.PI` (or negate) so the arc lies inside the wedge.
- **[low] `coriolis` is a dead force type.** Present in `COLORS` (L719), `symbolFor` (L1096) and `prettyType`, and `#frame-note` tells the student "add centrifugal (**and Coriolis if the body moves**)", but no solution ever includes it, so adding one is graded `Extra: Coriolis — no agent in this scenario applies this kind of force` — a justification that is wrong for a fictitious force in any case. → **Fix:** drop the Coriolis prompt from `#frame-note` (the body is at rest in S′, so `F_cor = −2mΩ×v′ = 0`), and say exactly that.

---

## NON-PHYSICS

### P0

- **[functional][high] `closeEditor()` is called but never defined — a ReferenceError on every single page load.** `resetAll` L1721 calls it; the identifier appears nowhere else in the file. `Shell.init` (L689) calls `onReset()`, so it throws during boot, **before** the rest of the boot sequence. Everything after it in that script is skipped:
  - `requestAnimationFrame(loop)` never runs → **the animation loop never starts**. `state.time` stays `0` indefinitely. `#shell-play` and `#shell-speed` are cosmetic; the orbit never orbits; the post-commit "release the body and watch it accelerate" reveal — the payoff of the whole predict-then-check design — **never plays**.
  - `renderMath()` never runs → **all four KaTeX equations are permanently blank** inside ∑ Formal (`typeof katex === 'object'`, so the library is fine; calling `renderMath()` by hand fills them).
  - `#inq-dots` stays empty though `Shell.totalSteps === 5`.
  The sim only *looks* alive because a separate later `<script>` clicks `#shell-lecture`, which reveals the panels as a side effect.
  **Clicking `#shell-reset` then bricks the UI:** state is cleared but `layoutBody(); syncPanels(); fit()` never run, leaving ghost arrow cards, stale `#stat-*` readouts and stale canvas arrows; the *next* interaction runs `panelVis(0)` and strips the entire builder — no scenario select, no parameters, no Forces panel, no Commit. Recovery needs a reload. → **Fix:** define `closeEditor()` (close/deselect the arrow editor, `state.selectedId=null`) or delete the call. [evidence: `drv-err-boot-initial.png`, `drv-err-collapse-3-uicollapsed.png`, `drv-katex-blank.png` vs `drv-katex-after-manual.png`]

- **[pedagogy][high] A wrong agent is graded "✓ Correct FBD".** `gradeDiagram` L1461–1463 pushes an agent-mismatch note but **never sets `ok=false`** (every other branch does). Gravity with agent `"the floor"` + normal with agent `"magic"` yields a green **`✓ Correct FBD.`** followed by `Agent for gravity (weight) looks off — you wrote "the floor"…`. The Info modal names agent attribution as the sim's #1 misconception target ("Every real force on a body is attributed to an agent"); the grader lets it through with a tick. → **Fix:** `ok=false` in the agent branch, consistent with direction/magnitude.

### P1

- **[functional][high] `#s-omega` is inert beyond the physics.** Handler L1342 sets `state.omega` and the label only — no `draw()`, no `invalidateCommit()`, unlike the other three sliders. Combined with the hard-coded `Fc = m*g`, moving it changes nothing anywhere.
- **[ux][high] Stale green banner after a parameter change.** The slider handlers (L1340–1343) set `state.committed=false` **directly** instead of calling `invalidateCommit()` (L1184), which is the function that hides the banner. Commit a correct block FBD at m=2, drag mass to 8: readouts correctly blank to `—`, arrow magnitudes are now wrong for the new weight, but **`✓ Correct FBD` stays on screen**. → **Fix:** call `invalidateCommit()` in all four handlers. [evidence: `drv-stale-banner.png`]
- **[pedagogy][med] Readouts populate for diagrams graded *wrong*.** A gravity-only commit is correctly rejected (`Missing: normal`) yet `#stat-committed` flips to `yes` and the readouts print `19.60 N / 9.80 m/s²` — the sim computes and displays the consequences of a diagram it just told the student is incomplete. → **Fix:** only populate the readouts when `grade.ok`.
- **[pedagogy][med] Stale rebuttal wording.** Committing an `other`-type arrow *with* an agent typed ("motion") still returns `Extra: other — no real agent has been identified`. The rejection is right; the reason given is factually about the student's input and is wrong. → **Fix:** for `other` with a non-empty agent, explain that the named agent isn't a body in contact with (or acting at a distance on) this object.
- **[functional][med] No `window.__audit`, and readouts use `.stat-value` not `.shell-readout`** — the standard probe returns `readouts: []` / `audit: null` for all 14 states, so the sim is untestable by the harness. → **Fix:** expose `{scenario, frame, m, angle, omega, fapp, arrows, fnet, fdir, acc, graded}`.

### P2

- **[ux][med] Scenario names disagree between the model and the menu:** `SCENARIOS.twobody.name` = "Two-body: A pushes B" vs option "Two-body: push A onto B"; `orbit.name` = "Orbiting body (circular, surface-skimming)" vs option "Orbiting body (circular)" — the surface-skimming assumption the physics depends on is dropped exactly where the student chooses.
- **[ux][low] `#shell-speed` listens on `change`, not `input`** — moot while the loop is dead, but it will feel unresponsive once P0 is fixed.

---

## Browser-test evidence

| state | observed | expected |
|---|---|---|
| page load (`drv-err-boot-initial.png`) | `ReferenceError: closeEditor is not defined` at `resetAll` (1721) ← `init` (689); `state.time` = 0 after 2.5 s | clean boot, rAF loop running |
| ∑ Formal panel (`drv-katex-blank.png`) | all 4 equation slots `innerHTML === ""` | four rendered equations |
| `#shell-reset` (`drv-err-collapse-3-uicollapsed.png`) | ghost arrow cards + stale readouts; next click strips the whole builder | clean reset |
| gravity 78.4 N @270°, committed | `#stat-fdir` = **`90°`** | `−90°` (canvas overlay agrees) |
| incline θ=30,60 · m=1,5,10 | N = 8.49/42.44/84.87 & 4.90/24.50/49.00 N; `F_net` = mg sin θ; **a = 4.90 / 8.49 m/s², mass-independent** ✓ | ✓ correct |
| incline θ=30, m=5 (`drv-incline-30-5.png`) | required N at **120°**; drawn slope's outward normal is **60°** | solution must match the drawing |
| incline + friction 200 N @30° | **`✓ Correct FBD`**, `F_net` 175.50 N, `a = 35.10 m/s²` | rejected |
| block + duplicate gravity 500 N | **`✓ Correct FBD … a = 0`**, readouts `500.00 N`, `250.00 m/s²` | rejected |
| block, agents "the floor"/"magic" | **`✓ Correct FBD`** + contradictory notes | rejected |
| orbit, ω = 0.2 / 1.6 / 3.0 | required `F_cf` = 19.60 N at all three | `∝ ω²` |
| orbit inertial + centrifugal arrow | correctly rejected with a well-targeted rebuttal ✓ | ✓ |
| orbit rotating without centrifugal | correctly rejected ✓ | ✓ |
| all sliders at min/mid/max | no NaN, no Infinity, canvas never blank | ✓ |

## To verify (human)

- Which incline orientation you want: flipping `solutionFor` to `90−θ` (2 lines) vs mirroring `drawStaging` to apex-top-right (also needs `layoutBody` L843 flipped). I recommend the former — two of three sites already agree on `90−θ`.
- Whether `#s-omega` should drive a real `r` (making `F_cf = mω²r` live and dropping the surface-skimming crutch) or be removed from the orbit scenario. The current declared assumption `g = ω²r` cannot hold across a free ω at fixed r.
- Whether a duplicate arrow of a required type is ever legitimate in a planned scenario before making it a hard error.
- Whether the post-commit release animation (`state.simAnim`, L1704–1712) behaves correctly once the loop actually runs — it has never executed, so it is entirely untested.
