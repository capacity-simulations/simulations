---
name: guided-inquiry
description: Restructure, refine, or add a Guided Inquiry card zone (POE — Predict/Observe/Explain — cards with gated multiple-choice predictions) in a single-file simulation HTML page built on the L-series shell (inq-dots, inq-step cards, choice buttons, predict-eval feedback). Use this skill whenever the user asks to restructure guided inquiry, refine inquiry/predict questions, fix inquiry cards, add a missing guided-inquiry section, or make inquiry cards more precise — even phrased as "do the inquiry like the L1 solar-system one". The result follows a strict card grammar with short, misconception-targeted questions, staged reveals so answers can never be looked up before commitment, and a top-bar 🧭 Guided Inquiry button that owns the zone's visibility (paired with the 🎛 Controls Guide button when both exist).
---

# Guided Inquiry for Simulation Pages

Restructure or add the Guided Inquiry zone of an L-series shell sim to the
validated card grammar. The reference implementation is
`L1-Solar_System_Orbits-inquiry-v2.html` (validated by the user); its
mechanics blocks are in `references/implementation.md`.

**Read `references/implementation.md` before writing any code or cards.**
Copy its patterns; adapt only the parts marked ADAPT.

## The card grammar (validated — do not improvise new card types)

The arc: **ORIENT → (PREDICT → OBSERVE → RESOLVE) × 2 → SYNTHESIS**,
usually 6–8 cards. One concept per POE cycle, ordered easy → hard. The
final RESOLVE and SYNTHESIS may share one card when both stay short.

| Type | Job | Hard rules | Budget |
|---|---|---|---|
| ORIENT | What's on screen + one action to begin | Names conventions (scale, enlarged icons); ends in a concrete start action | ≤60 words |
| PREDICT | One committed question about ONE observable | `data-gate`d; sim paused; stem NEVER leaks the answer and NEVER invites looking a value up; 3–4 choices; EVERY distractor is a named misconception, never filler | stem ≤40, choices ≤20 each |
| OBSERVE | One concrete action + a question about what they see | Asks, never tells — the answer arrives only in the next card; pins the state it assumes (selection, scene, view) | ≤60 words |
| RESOLVE | The principle, after the observation | Names the formal law; ties to what was just seen | ≤60 words |
| EXTEND (optional) | A "make X happen" challenge using controls | Assumes controls are known (controls tutorial runs first) | ≤60 words |
| SYNTHESIS | The one sentence they leave with | Exactly one idea, plainly stated | ≤30 words |

Per-choice feedback rules (≤50 words each):
- Name the intuition's origin ("everyday friction trains you to expect…").
- Point at what in the sim confirms/refutes it — **forward** ("watch r and
  v on the next card"), never fully resolving; the RESOLVE card keeps its
  job. Naming the correct choice is fine (the UI highlights it anyway).
- Keep and reuse the sim's rebuttal mechanics (ghost objects, mode flips)
  — they are the strongest feedback the sim has.

## Two structural rules that outrank copy

1. **No lookup before commitment.** If a readout, list, or label anywhere
   on screen would let the student read off a PREDICT answer, stage its
   reveal to AFTER that card (the shell's `applyStepReveals` pattern). A
   stem that says "click X to read Y… now predict Y" is testing clicking,
   not physics.
2. **State pinning.** Every OBSERVE card declares the state it assumes and
   `onStep` sets it (select the body, switch the scene/view, pause/play).
   Never rely on the student having left the sim in the right state.

## Refine vs restructure vs add (decide FIRST)

- **Copy polish only** — cards already follow the grammar (validated on
  Newton's laws: the verifier flagged one 97-word card; trimming its stem
  was the entire inquiry change): gated predicts
  with per-choice misconception feedback, observe-asks/resolve-tells,
  state pinning. Trim to budgets, nothing structural.
- **Refine in place** — mechanics sound but grammar violated (spoiler
  observe cards, lookup-leak stems, mashed resolve cards, missing
  feedback). Restructure the cards; keep the sim's wiring style and
  mechanics (see below).
- **Full add** — no inquiry zone. Insert the shell blocks from the
  reference and author from scratch.

Wiring styles in the fleet — adapt whichever exists, never convert:
- **JS-config** (L1 style): feedback lives in `wirePredictions()` /
  `setupChoiceCard(card, correctIdx, {correct, wrong[], onWrong})`.
- **Data-attribute** (L2 style): choices carry `data-correct` / `data-fb`
  and the shell wires them.

## Workflow

### 1. Map the sim
Identify: the 2–3 teachable concepts and their on-screen observables; all
readouts/lists that could leak an answer; the wiring style; the step hooks
(`onStep`, `applyStepReveals` or equivalents); existing rebuttal mechanics
(ghosts, contrast modes); any step-driven view/scene switching and the
indices it hardcodes.

### 2. Structure proposal (mandatory — this is the judgment layer)
Before writing any card, produce and reason through, in this order:
- **Concept list**: the 2–3 phenomena that deserve POE cycles, ordered
  easy → hard, each with its single best observable.
- **Misconception table**: for each PREDICT, every distractor named as a
  misconception with its everyday origin. If you can't name the
  misconception, the distractor is filler — replace it.
- **Card plan**: one line per card — type, the one observable or claim,
  pinned state, and which reveals unlock at that step.
Then two red-team passes: (a) answer each PREDICT stem using only the stem
— if guessable without the sim, tighten it; (b) walk the reveals — at each
PREDICT, list everything visible on screen and confirm none of it contains
the answer. On the first few sims, show this proposal to the user for
sign-off before writing cards.

### 3. Write the cards
Follow the grammar table exactly. Number `1 ·, 2 ·, …`; RESOLVE cards may
carry a name ("Resolve — Kepler's second law"). Verify EVERY factual claim
against this sim's code — values, readout names, what actually changes.

### 4. Wire
- Update `wirePredictions` indices (or data attributes) to the new card
  positions — **index drift is the #1 mechanical hazard**: `onStep` view
  maps, ghost-clear conditions, and reveal thresholds all hardcode card
  indices; re-map every one when the card count changes.
- Add state pinning to `onStep` for each OBSERVE card.
- Stage reveals in `applyStepReveals` per rule 1 above.
- Keep gate auto-pause and delayed Next-unlock (the shell has them).

### 5. Verify
```
node scripts/verify.js <patched.html> --baseline <original.html>
```
Config-free invariants: dots == cards; every card with choices is gated;
gated cards block Next until a choice; answering shows non-empty feedback,
marks exactly one choice correct, disables all choices, re-enables Next;
word budgets (card ≤90 pre-answer, feedback ≤60); Finish on the last card;
no NEW runtime errors vs baseline. The script rewinds first — these shells
boot on the LAST card under headless jsdom (a pre-existing quirk, fine in
real browsers).

Manual checks the script cannot judge: gates actually pause the sim; every
factual claim true in THIS sim; pinned states and view switches land on
the right cards; at each PREDICT, nothing visible leaks the answer; the
OBSERVE cards ask rather than tell.

Deliver as a new file (`<simname>-inquiry-v2.html`); never overwrite the
upload.

## The Guided Inquiry button and the two-button template (validated)

Visibility of the inquiry zone is owned by ONE top-bar button, 🧭 Guided
Inquiry (boots active). When the sim also gets a Controls Guide (see the
controls-tutorial skill), the two buttons are mutually exclusive:
activating one deactivates the other; both off = clean sim.

- **No Lecture mode, no restore strip.** Delete any 🎓 Lecture button,
  `setLectureMode`, and "▸ Guided inquiry" restore strip. The inquiry's own
  Finish (and Skip, where present) route through `window.__giOff` so the
  button state and the zone never disagree. (Lecture mode was also the
  cause of the jsdom boot-on-last-card quirk; removing it removes the
  quirk.)
- **Turning the inquiry OFF = free exploration** — the sim hands over its
  POST-COMPLETION state via `window.__freeExplore`. If the sim already has
  an `onComplete()` (L2-style shells do), `__freeExplore` is simply
  `onComplete`; keep the shell's Finish fast-forward (`onStep` for the
  remaining cards) and route only the collapse call through `__giOff`: all staged reveals
  lifted, rebuttal objects (ghosts) cleared, default view/scene restored.
  Never a mid-inquiry snapshot.
- **Turning it back ON resumes** — `window.__giResume` re-applies the
  current card's state (reveals, pinned selection/mode/view, pause on a
  gate). Progress is intact; the step counter is never reset by hiding.
- **Reset = first-load** — `window.__fullReset`: inquiry on at card 1
  (`inqShow(0)`), controls-guide progress cleared, sim defaults restored,
  paused/playing as on boot. Expose `inqShow`/`step` on the shell object
  if they're private.
- **Boot paused when running would spoil a prediction.** If the author's
  sim boots playing and the first PREDICT concerns what the running sim
  shows, the first-load state pauses it; the Orient card says to press
  Play.
- The Controls Guide, when entered, lifts inquiry reveals
  (`window.__cgReveals(99)`) and hands them back on exit. Publish
  `applyStepReveals` as `window.__cgReveals` — it lives in the sim's IIFE
  and is otherwise invisible to the template script (a `typeof` guard
  silently no-ops; this shipped once).

Reference code for all of this is §4 of the controls-tutorial skill's
`references/implementation.md` (verbatim from the L1 final build).

## Pitfalls (each observed in the fleet)

- **The spoiler observe card**: telling the student what to notice in the
  same card that asks them to look ("notice how v is largest when r is
  smallest"). Observe asks; Resolve tells — split them.
- **The lookup-leak stem**: a PREDICT that invites reading the answer off
  a readout before committing. Fix structurally (stage the reveal), not
  just textually.
- **Index drift**: changing the card count without re-mapping every
  hardcoded index in `wirePredictions`, `onStep` view/ghost logic, and
  reveal thresholds. Walk each one explicitly.
- **Feedback that resolves**: per-choice feedback so complete the RESOLVE
  card has nothing left to say. Point forward instead.
- **The mashed closer**: a final card carrying both cycles' resolutions
  plus implementation trivia at 120+ words. One principle + one synthesis
  line; cut internals (integrators, code details) from student copy.
- **jsdom last-card boot** (sims still carrying Lecture mode): headless
  walkthroughs must rewind with `inq-prev` before asserting anything
  about card 1 — and the quirk can MASK bugs by pre-revealing everything;
  test realistic flows from card 1.
- **Theory curves are lookup leaks.** A chart that draws the theoretical
  prediction from boot (the double-slit |ψ₁+ψ₂|² curve) answers the first
  PREDICT; hide that panel until the commit, reveal it on the Observe
  card where dots fill the curve.
- **Hidden-until-step helper text.** Hint paragraphs near controls often
  state the answer ("close one slit to see single-slit diffraction");
  keep them inside the group that stays hidden until after the commit.
- **Mid-inquiry exit leaving a half-built sim** — route every exit
  (button off, Finish, both-off) through `__freeExplore`.

## Bulk application

Process one sim at a time with the full workflow; never reuse another
sim's concept list, misconceptions, or card copy — structural similarity
is not conceptual similarity. Always pass `--baseline`. A sim failing any
invariant is fixed or set aside, never shipped with a lowered bar. Log
every forced deviation from this skill and report it to the user at the
end of the batch as skill feedback.
