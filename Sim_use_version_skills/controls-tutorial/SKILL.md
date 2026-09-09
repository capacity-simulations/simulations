---
name: controls-tutorial
description: Add a "Controls Guide" overlay tutorial to a single-file interactive simulation HTML page. Use this skill whenever the user asks to add a controls tutorial, controls guide, control walkthrough, onboarding for the controls, or "the controls layer like the solar-system sim" — even on sims that already have a guided inquiry. The result is a top-bar 🎛 Controls Guide button that walks the student through every control and readout one at a time with a purple chat-bubble callout pointing at the control, everything else hidden until its turn, terse one-line descriptions, and a bottom-right ‹ › Next nav.
---

# Controls Guide (overlay tutorial) for Simulation Pages

Retrofit an existing sim with the Controls Guide. The reference builds are
the user-validated `Double-slit-experiment.html` (guide-only, minimal
integration) and `L1-Solar_System_Orbits-two-button-mock.html` (guide +
guided inquiry with the two-button template). Verbatim blocks are in
`references/implementation.md`. **Read it before writing code.** Copy the
blocks; adapt only the parts marked ADAPT.

> This design SUPERSEDES the earlier sidebar-card tutorial (sticky card
> zone, "Try:" lines, title-bar Hide/Show toggle). Do not build that.

## Acceptance criteria (the validated behavior — all mandatory)

1. **Original sim untouched at boot.** Until the guide button is pressed,
   the sim behaves exactly as before: same boot state (playing or paused
   as the author made it), all controls and readouts visible, no callout
   or nav in the DOM. The only persistent additions are ids on wrapper
   elements, one CSS block, one button, and one script.
2. **One top-bar button, 🎛 Controls Guide**, in the sim's own top-bar
   button style, filled dark-green when active. It toggles the guide on
   and off. If the sim has a guided-inquiry zone, it gets a sibling
   🧭 Guided Inquiry button and the two are MUTUALLY EXCLUSIVE (see
   "Two-button template" below). No Lecture mode anywhere.
3. **Overlay, not cards.** Each step shows a floating callout anchored
   beside its control: PURPLE border and title (so it never blends with
   the green glow on the control), a speech-bubble arrow on the edge
   facing the target, aimed at the target's centre. Placement is
   side-aware: right-sidebar targets get the callout to their LEFT with a
   right-edge arrow; top-bar/canvas targets get it BELOW with a top arrow,
   flipping above when cramped. The closing card is centred with no arrow.
   Nav is a floating bottom-right bar in the callout's purple identity
   (purple border, outlined purple pager buttons, solid-purple Next):
   ‹ › pager + `Next →` (reads `Done` on the closing card).
4. **Hidden until its turn — by location.** Not-yet-introduced elements
   are hidden, never merely dimmed: sidebar panels and boxes collapse
   (`.cg-hidden`, display:none); top-bar controls go invisible but keep
   their slot (`.cg-veiled`, visibility:hidden) so the bar never reflows.
   The current control glows (`.cg-glow`, green pulse). A `cgMax`
   high-water mark makes reveal monotone: back-navigation never re-hides.
5. **Session memory.** Completing the guide (Done) or toggling it off
   restores everything. Reopening in the same session resumes at the step
   left, with everything introduced so far still visible; after completion
   it opens on the closing card with everything visible, and stepping
   back never re-hides. A browser reload is what restarts the guide from
   step 1. **Reset restores first-load**: the guide closes and its
   progress clears (`cgStep = cgMax = 0`); with the two-button template,
   Reset also puts Guided Inquiry back on at card 1.
6. **Copy is terse.** One line per control: what it is and what it
   controls, ≤15 words. No "Try:" lines, no observable-effect sentence.
   The closing card: "That's every control — explore freely; reopen the
   guide from the top bar."
7. **Complete coverage.** Every control and every readout panel gets a
   step or a written reason it doesn't (meta-UI only: theme toggle, info,
   hover-hint switches). A missed panel (the View panel was missed once)
   fails the manual check.

**Scene/mode-dependent controls.** If a guided control is hidden by the sim
in some scenes or modes, publish `window.__cgPrepare` from the sim (pin a
scene where every guided target exists) — the controller calls it on entry.
The browser test catches the failure (glowing target not visible); the
headless gate cannot, because it never reaches that scene.

## Workflow

### 1. Map the sim
List every top-bar control, every sidebar panel/box, every readout panel,
in layout order. Classify by LOCATION: top bar → `veil`; sidebar/canvas
panels → `hide`. Identify the sim's top-bar button class (reuse it for the
guide button), its Reset element, and whether a guided-inquiry zone exists.
Give wrappers ids where missing (`sep-box`, `params-group`, …) — markup
only, no behaviour change. Group tightly-coupled controls with `also`
(e.g. slit separation + slit width; a select + its label) so they reveal
and glow together.

### 2. Insert the three blocks (reference §1–3)
CSS before `</style>`; the button beside the sim's existing top-bar action
buttons (left of Reset/Play); the controller `<script>` before `</body>` —
INCLUDING its `<script>` wrapper. ADAPT only the `steps` array (selectors,
mode, `also`, title, text) and the Reset selector.

### 3. If the sim has a guided-inquiry zone: two-button template (reference §4)
Add the 🧭 Guided Inquiry button (boot: active) beside 🎛 Controls Guide.
Wire `setGi`/`setCg` for mutual exclusion and expose the four hooks:
- `window.__giOff` — the inquiry's own Finish/Skip route here (the GI
  button is the single owner of inquiry visibility; delete any restore
  strip and any Lecture button/mode).
- `window.__freeExplore` — turning the inquiry OFF, or reaching both-off,
  hands over the POST-COMPLETION state (all inquiry reveals lifted, no
  mid-inquiry leftovers such as ghost objects or zoomed views).
- `window.__giResume` — turning the inquiry back ON re-applies its current
  step's state (reveals, view, pause-on-gate), so progress is intact.
- `window.__fullReset` — Reset = first-load: GI on at card 1, CG off with
  progress cleared, sim defaults restored, then paused/playing as on boot.
Entering the guide lifts inquiry-step reveals (`window.__cgReveals(99)`)
so hidden-by-inquiry panels can be described; the guide's own hide/veil
then takes over.

**Scope hazard:** functions inside the sim's IIFEs (`applyStepReveals`,
`setInquiryCollapsed`, …) are NOT visible to a separate `<script>`. Expose
them on `window` or the sim's public object; a `typeof fn === 'function'`
guard silently no-ops otherwise — this bug shipped once and only showed in
a real browser.

### 4. Verify
```
node scripts/verify.js <patched.html> --baseline <original.html>
```
Config-free: boot untouched (no callout, no cg classes); button toggles;
callout + arrow + side class per step; hidden/veiled set non-empty at step
1 and monotone; glow present and never on a hidden element; back-nav
never re-hides; closing card has no arrow and `Done`; Done restores
everything and deactivates; revisit lands on the closing card fully
visible; Reset deactivates and clears progress (reopen = step 1 re-hidden);
no NEW runtime errors vs baseline (CDN libs like Three.js/KaTeX throw
headlessly — baseline subtracts them).

Run the browser test twice: default, and with `--theme-toggle <selector>` on
sims that have a theme switch (plus once at `--viewport 1024x768`).
Manual checks (browser): callout placement and arrow aim on real
geometry; every control/readout covered; copy true for THIS sim.

Deliver as a new file; never overwrite the upload in place.

## Pitfalls (each observed)
- Dim instead of hide — un-introduced controls stayed readable. Hide.
- Hiding top-bar buttons with display:none — the bar reflows. Veil.
- Callout in the same colour as the glow — two jobs, two colours.
- Scope bug above — hooks must be on `window`.
- Lecture mode conflicting with the buttons — remove it; both-off is the
  presenter view.
- Forgetting a sidebar panel (View/Zoom) — enumerate everything.
- Reset leaving a hybrid (closing card lingering, inquiry gone) — Reset
  must route through `__fullReset` / clear guide progress.
- The controller pasted without `<script>` tags is inert text.
- Light-theme selector mismatch (`html[data-theme]` vs `body.light-theme`)
  left the callout dark on a light UI; the CSS now targets both hooks.
- On a 1024×768 viewport the last sidebar panel sat below the fold and the
  clamped callout drifted 119px from it; the controller now scrolls the
  target into view before measuring. Always run the smoke at 1024×768 too.
- Applying a skill twice (bulk re-runs) duplicates ids — every verifier
  now fails on duplicate template ids or script blocks.
- Green/white nav shipped in one reference while the agreed design was purple — the nav
  must match the callout; the reference CSS now carries the purple nav.
- Testing: jsdom walkthroughs must count clicks exactly; several "bugs"
  were test off-by-ones. Assert state, not click counts.

## Bulk application
One sim at a time, full mapping each time; never reuse another sim's
`steps`, ids, or copy. Always `--baseline`. Log deviations and report
them as skill feedback.
