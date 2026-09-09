---
name: welcome-overlay
description: Add the first-landing Welcome overlay to a single-file simulation HTML page that already carries the Guided Inquiry / Controls Guide two-button template. Use this skill whenever the user asks for a welcome screen, landing overlay, intro card, mode picker, "start screen", or "the welcome we did for the solar-system sim". The result is a centered, immersive overlay over the live sim: a hero strip that draws the sim's core physical idea, a small "Welcome to" kicker over the big sim name, a one-line description, three glass cards side by side (Guided inquiry — Recommended, Controls guide, Free exploration), and a Spotify-style read-aloud player using the browser's speech synthesis. Purely additive: one CSS block, one overlay element, one script, one hook.
---

# Welcome overlay (centered, immersive)

The reference build is the user-validated `L1-Solar_System_Orbits` centered
welcome; verbatim blocks are in `references/implementation.md`. **Read it
before writing code.** Copy the blocks; adapt only the ADAPT parts.

## Production-safety contract (read this twice)

These sims are shipped products. The overlay must be impossible to blame
for a regression:

1. **Additive only.** The ONLY changes to a sim are: one CSS block before
   `</style>`; one `#welcome-overlay` element as the first child of `body`
   after the header (fixed-position, so placement is cosmetic); one
   `<script>` before `</body>`; and one 5-line `window.__setMode` hook
   inside the existing two-button controller. Never edit the sim's own
   functions, styles, or markup.
2. **The sim boots exactly as before behind the overlay** — same
   playing/paused state, same panels, same inquiry card. The overlay
   only dims and blurs; choosing a mode calls `window.__setMode`, which
   routes to the SAME `setGi` / `setCg` the top-bar buttons use.
3. **Nothing leaks after dismissal.** Dismissing hides the overlay
   (`display:none`, so it intercepts nothing), stops speech, and leaves
   no timers or listeners that touch the sim.
4. **No hard dependencies.** Speech synthesis is feature-detected; if
   absent, the player disables itself and nothing throws. No external
   assets, fonts, or libraries.
5. **Z-order.** Overlay z-index 5000 sits above the guide callout/nav
   (4000). Nothing in the sim should exceed it; check.
6. **Gate before delivery** with BOTH verifiers (§Verify), and look at the
   screenshot.

## Anatomy (validated — do not restructure)

- Backdrop: radial dim over the live sim, 2px blur — dark tones on the dark
  theme, light tones on the light theme; the composition is IDENTICAL in
  both (no card box appears in light mode).
- Hero: a full-width band (`#welcome-fringes` canvas, masked to fade at
  both sides) above the title, drawing the sim's core idea from its own
  equations — see "The hero is the one per-sim decision".
- Title `h2` = a small muted kicker "Welcome to" (fixed) over the sim
  name in the big weight (`.welcome-name`, ≤22ch, e.g. "Solar system
  orbits"). One-line description beneath (≤ ~18 words).
- "How would you like to begin?" then three GLASS CARDS in a row
  (semi-transparent fill + backdrop blur + thin translucent border, hover
  lift with the mode colour on the border; they stack on narrow screens).
  Each card: icon tile, title, one-line description, a "Start ›"
  affordance at the bottom. **Guided inquiry** (green; inline
  "Recommended" pill beside the title) → `data-mode="inquiry"`;
  **Controls guide** (purple) → `controls`; **Free exploration** (amber)
  → `free`. Descriptions are fixed HOUSE COPY: "Uncover the simulation in
  steps and see the physics emerge." / "Learn each control, one at a
  time." / "Everything open. Experiment on your own." (The inquiry line is
  deliberately general — not every flow opens with a Predict card.)
- Footer: "Listen to the intro" + transport inline on ONE row: skip-back,
  44px circular play/pause (SVG icons switch by `data-state`),
  skip-forward, then the segment-per-line progress bar beside them.
  Icon-only buttons; state in `title`/`aria-label`. (A variant with the
  bar beneath the buttons was tried and rejected — keep it inline.)
- Read-aloud: 6-line script spoken one utterance per line; true
  pause/resume via a tracked (line, char) position from boundary events;
  skip-back restarts the line or steps back; auto-attempts on load with a
  timed fallback; stops on mode choice.

## Rules

- **Offer only modes that exist.** If the sim has no inquiry zone, delete
  the `inquiry` row; if no controls guide, delete the `controls` row.
  `free` always exists. Never show a row whose button is missing.
- **Copy is per sim and short.** `.welcome-name` = the sim name only (the
  kicker supplies "Welcome to"); description
  = the phenomenon in one sentence a student can picture; hero caption =
  what the dots literally are. Speech lines 1–2 are the sim-specific
  ones; lines 3–6 are house copy.
- **Theme + font hooks.** Replace `var(--font-sans)` with the sim's font
  variable. Light-theme rules target both `html[data-theme="light"]` and
  `body.light-theme`; add a selector only for a third hook. No other CSS
  edits. ALWAYS run the browser test once per theme (`--theme-toggle`).
- **Show-once.** `WELCOME_ONCE` in the script controls a `localStorage`
  flag (try/catch). Keep it `false` while the user reviews; set `true` for
  production. Reset must NOT re-show the welcome (it doesn't — Reset is
  the sim's first-load state, not a first visit).
- **Reduced motion.** The hero draws in one frame and the card entrance
  is disabled under `prefers-reduced-motion`.

## The hero is the one per-sim decision

Everything else is fixed. The hero must:
- Draw the sim's central idea **from its own physics**, not a stock
  image: interference intensity sampled into dots (double-slit); orbits as
  equal-time-step dots so density shows speed (solar system). Ask: what
  single picture IS this sim?
- Accumulate as the single orchestrated entrance moment; never loop.
- Carry a caption that names what is drawn, not the conclusion.
- Known trade-off (accepted by the user): the hero may show the phenomenon
  the first Predict asks about. Keep the caption neutral so it doesn't
  spell out the answer.
Two exemplars are in the reference (§4). Write a new `drawHero` for each
sim; keep the canvas id, size (1280×240), and the `reduce` handling.

## Workflow

1. Confirm the sim has the two-button template (`#btn-gi` / `#btn-cg`,
   `setGi` / `setCg`). If not, apply the controls-tutorial / guided-inquiry
   skills first.
2. Insert the four blocks (reference §1–3, §5). Map font + theme hooks.
3. Write the sim's copy and speech lines; write `drawHero`.
4. Verify (below). Deliver as a new file; never overwrite the upload.

## Verify
```
node scripts/verify.js <patched.html>                      # headless invariants
node ../tests/browser-smoke.js <patched.html> --baseline <original.html> \
     [--cdn-map ../tests/cdn-map.json] --shots shots/     # real browser
```
Add `--theme-toggle <selector>` (sims with a theme switch) and a second run
with `--viewport 1024x768`; the smoke's alpha-aware contrast check covers
template text in both themes. Headless: overlay present once, z-index 5000, exactly the mode rows whose
buttons exist, `__setMode` wired, each row's mode lands on the matching
button state, dismissal hides + cancels speech, no speech object touched
before the script guard, hero canvas present, the sim's boot state
unchanged by the overlay. Browser: shown on landing, speech attempted,
transport (forward/rewind/pause keeps position/resume), dismiss, then
the full inquiry + guide + Reset walk with zero new console errors.
Look at `00-welcome.png`: contrast, the hero, two-line title.

## Pitfalls (each observed)
- Light mode once fell back to an opaque white card with a dark hero strip
  — a different design. Both themes must share one composition: transparent
  card, hero drawn on the dim with theme-aware colours.
- Light theme was never screenshotted until the final eval — and it hid two
  defects (an unreadable pill, a callout that stayed dark). Test both themes.
- Headless Chromium has no voices: auto-read must attempt on a timer, not
  only on `voiceschanged`.
- Stopping speech by cancelling loses position; track (line, charAt) from
  `onboundary` and re-speak from there. Don't rely on native pause().
- Icon glyphs (emoji) render inconsistently; use the inline SVGs.
- Three equal boxes as a vertical list read as a dialog; the SME-approved
  form is three horizontal glass cards with a Start affordance.
- The hero must be drawn at the canvas's own aspect; stretching a strip
  canvas into a different box turns dots into dashes.
- A theory curve drawn over the dots reads as clutter; the centered layout
  has no curve.
- Test click-counting: assert state (labels, progress text), not clicks.
