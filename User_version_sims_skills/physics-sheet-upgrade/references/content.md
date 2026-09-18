# Authoring the sheet: structure, voice, quality bar

The sheet must read like a chapter a good TA wrote, not AI documentation. That was
the user's explicit test, reached after rejecting a card-grid version as "just
another piece of AI documentation." The devices that fixed it: a single-column
article, numbered chapters headed by *questions*, short bolded bullets, boxed
sections, and equations/diagrams that visibly agree with the sim.

## The article skeleton

```
lede            One outlined sentence: the whole topic as a reframing.
ch 01           The core phenomenon — "where does X come from?"
ch 02           The qualitative rule — direction / sign / when it applies
ch 03  (LIVE)   The quantity — magnitude law + live panel + live worked run
ch 04           The conceptual twist — "is it even real?" / what the formalism means
ch 05           The real world — where nature runs this physics, with honest scale
ch 06           The traps — 3–4 misconceptions, quoted then corrected
ch 07           Self-test — 3 tap-to-reveal questions
```

Seven chapters is the calibrated length. Merge or add one only if the topic truly
demands it; never pad. The numbers are legitimate here because revision has an
order — a student who reads 01→07 has covered the topic.

## Voice rules (apply to every line)

- **Chapter headings are questions a student would ask**, in plain words:
  "Which way does it bend?", not "Directional properties of the force."
- **Bullets, not paragraphs**: 2–4 per block, one idea each, the load-bearing words
  in `<b>`. If a bullet needs a second sentence, it's usually two bullets.
- **The lede is a reframing, one or two sentences**, pattern: "X isn't Y. It's Z."
  Coriolis: "The Coriolis force isn't a push. It's what a straight line looks like
  from a spinning room." Write a new one for each topic; never reuse this one.
- Speak the sim's language: use the exact frame/trail/control names the sim shows.
- Numbers are honest: label first-order estimates as such ("first-order estimate;
  the sim integrates exactly"); never claim precision the sheet doesn't have.
- No filler ("In this section we will…"), no hedging, no exclamation marks.

## Equations (spec for `gen_assets.py`)

- Use the sim's own formal-strip LaTeX as the base; keep its symbols and subscripts.
- One board per equation, each with a ≤1-line caption in plain words.
- Structural annotation belongs in the math: `\underbrace{...}_{\textcolor{acc}{name}}`
  for named terms (accent color `acc` is predefined in the pipeline).
- Chapter 03's first equation is the magnitude law the live panel computes.

## Diagrams (3 is the calibrated count)

1. **The core comparison figure** (ch 01): the topic's two representations side by
   side (for Coriolis: ground vs table camera). Trajectories are **computed** in the
   spec from the sim's default parameters — never sketched — and drawn in the sim's
   own trail colors, so the figure and the live sim visibly agree.
2. **The rule figure** (ch 02): the qualitative law made visual — vectors on the
   computed path, a right-angle mark where perpendicularity matters, the parameter
   sign labeled.
3. **The real-world figure** (ch 05): the simplest icon of the phenomenon in nature
   (for Coriolis: N/S hemisphere spin directions), one shared caption.

**If the user mentions Manim**: Manim itself cannot run inside a web page, and
this pipeline is the correct equivalent — it uses Manim's own underlying engine
(LaTeX / Computer Modern for equations, programmatic vector geometry for figures),
which is where Manim's visual quality comes from. Say so honestly rather than
claiming Manim was used; never ship raster video/frames in its place.

Figure rules: labels in Computer Modern via TikZ nodes; structural strokes in black
(the pipeline converts them to `currentColor` so they follow the theme); accent and
trail colors literal; every label fully inside the border (pitfalls #7); one shared
caption line beats two staggered ones.

## The live chapter (03) — the interactive heart

Requirements, all mandatory:
- The panel's mini-sliders mirror the sim's real sliders **both ways** (drag either;
  the other follows; the turntable/scene reacts). The machinery in
  `layer.reference.html` does this by dispatching `input` events — keep it.
- The big mono line substitutes the **current** values into the magnitude law and
  states the qualitative consequence of the current sign ("Ω < 0 → deflects left").
- The **worked run is live**: an element (`id="phys-worked"`) rebuilt inside
  `refreshLive()` that walks the current values end to end (force → acceleration →
  characteristic time → predicted outcome, with a closed-form when one exists —
  Coriolis: deflection ≈ Ω/v) and ends with the honesty tag.
- **"Replay this run in the sim" uses the live values** and its toast states the
  prediction so the launch becomes a predict-and-verify moment. Never reset to
  defaults on replay — that exact bug was reported by the user (pitfalls #6).

## "See it in the sim" buttons

One per chapter where the sim can demonstrate the claim (typically ch 01–03).
Each entry in the layer's `SHOW` map sets `frame`, optional overlays, `launch:true`,
`playing:true`, and always passes the **current** slider values. The toast is one
bold-led sentence telling the student exactly what to watch
("**Both cameras, one motion.** Straight on the left, curved on the right…").

## Traps and self-test

- Traps: quote the misconception in bold ("Coriolis is a real push."), then correct
  it in ≤1 sentence. The sim's info modal usually names the primary misconception —
  it goes first.
- Self-test: exactly 3 `<details>` questions covering (a) a degenerate case (what if
  the relevant variable is zero?), (b) a scaling question (double X, halve Y), and
  (c) the conceptual frame question. Answers are 1–2 sentences and may reuse a
  formula inline as plain text.

## Calibration example — the accepted Coriolis sheet

The article content the user signed off on lives inside
`assets/layer.reference.html` (between `<article id="phys-art">` and
`</article>`). Read it before writing new content and match its density: heading
lengths, bullets per chapter, caption lengths, toast phrasing, self-test shape.
Your sheet for a new topic should feel like the same author wrote it.
