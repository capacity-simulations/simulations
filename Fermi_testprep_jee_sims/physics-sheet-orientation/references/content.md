# Authoring the orientation block

The student sees this **before** they have done anything. It has one job: make the sim
legible — what it is about, what it demonstrates, what every control does — without
answering a single inquiry card.

Calibration example: `assets/orient.example.html` (cm-conical-pendulum).

---

## Shape

Four numbered sections inside `<section id="phys-orient" data-brief="0">`, preceded by a
one- or two-sentence `.orient-lede`.

### 1 · What you'll work out

Three bullets. **Phrase every one as an open question or a "why/what/which", never as a
statement of the result.** This is the whole trick to being spoiler-safe and still
useful.

> ✅ "Why a conical pendulum holds its angle at **one** launch speed — and what it does at
> every other speed."
> ❌ "The angle only holds at v_c = √(gL sinθ tanθ)."

> ✅ "Whether a heavier block gives way sooner than a lighter one — and why the sim can
> refuse to tell you any masses at all."
> ❌ "Mass cancels, so all three blocks slide at the same angle."

Close with an `.orient-note` naming the syllabus slot ("JEE / NCERT Class 11 — static
friction, equilibrium of rigid bodies, and toppling about an edge").

### 2 · What this simulation shows

`<div class="fig f0">{{D0}}</div>`, then **two short paragraphs**:

- the setup and its real constants (masses, lengths, g) — constants are not answers;
- **the one thing to watch**, named explicitly, and the fact that the two sliders decide
  it. End here. Do not say what the outcome will be.

### 3 · Your controls

A `.orient-ctl` table: *Control · What it sets · Range · default · What to watch*.

- One row per control, **in the order the Controls Guide tours them**.
- **Reuse the `cgSteps` wording** (preflight prints it). Two descriptions of the same
  control that disagree is worse than one.
- Ranges and defaults come from the slider attributes, not from memory.
- "What to watch" must be an observation, not a conclusion: "what θ does after release",
  not "θ settles at 30°".
- Beware describing a readout the student has not unlocked. Conical's row reads "time
  since launch and the string angle θ — a third readout joins them as you uncover it",
  because `#row-lz` is hidden at that point and naming it would answer card 4.

### 4 · Try it from here

`{{LIVE}}` — the sheet's existing live panel, **moved** here from its chapter, never
copied — then the Run button and an `.orient-note` promising it reveals nothing:

```html
<button class="shell-btn orient-run" id="phys-run">▶ Run these values in the simulation</button>
```

Word the button for what it actually does: conical and wheel *run*, topple *uses* the
values and lands paused because there is nothing to launch.

---

## The `d0` apparatus map

Add to that sim's `spec.py`, render with `physics-sheet-upgrade/scripts/gen_assets.py`.

**Show:** the apparatus, the parts by name, which slider moves which part, and the one
thing to watch.
**Never show:** forces, thresholds, verdicts, derived values, or any number an inquiry
card asks for.

Reuse the sim's own PAL colours so the figure and the stage agree.

Then **rasterise it and look at it.** Every layout bug in the four maps so far was found
by eye and by nothing else:

- conical — "the held angle" and "the readouts follow" callouts drawn on top of each
  other; θ₀ hidden behind the string;
- topple — the ramp hinged at its **high** end (the hinge belongs at the low end, and
  `rot()` turns clockwise so downhill is to the right); caption riding up into a callout
  because it was anchored to the raised end's height;
- wheel — the wheel centred over the corner so the corner sat *inside* the wheel (at
  contact it touches ground and corner at once, so the centre sits back by
  `√(2Rh − h²)`); two labels drawn across the wheel's face.

Assert the geometry where you can. The wheel map carries
`assert abs(math.hypot(CX_M, RAD - H_DEF) - RAD) < 1e-12` — "the corner lies on the rim".

---

## Voice

Second person, plain, short sentences. No exclamation marks, no "let's". Bold the noun
the student should look for, not whole clauses. Numbers with units and consistent
decimals. If a sentence would survive in the revision chapters below, it probably belongs
there instead.
