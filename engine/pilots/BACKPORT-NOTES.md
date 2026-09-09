# Backport notes

Notes from opportunistic backports of existing sims onto the engine (M7c
onward). CHANGELOG lines live here while a parallel agent owns
engine/CHANGELOG.md — fold the "Changelog" section below into it when free.

## Changelog (pending merge into engine/CHANGELOG.md)

- M7c: first opportunistic backport — `pilots/harmonic-oscillator-backport.html`
  rebuilds `Sim_lab_sims/QM_sims/Harmonic-oscillator.html` on the engine
  (core.special hermiteNorm, canvas.fit/view/axes, controls.bind, Shell,
  verify.audit). Kills the original's latent DPR bug (resizeCanvases without
  setTransform) by construction and replaces the naive Hermite + logNorm route
  with the stable orthonormal recurrence; n slider extended 0–10 → 0–30 as the
  backport dividend. ψ_n agreement with the original ≤ 3.5e-15 relative at
  n ∈ {0, 3, 7, 10, 30}. verify.mjs PASS (static + dynamic + param sweep).
  Original file untouched; no engine files modified.

## M7c — Harmonic-oscillator.html (2026-08-05)

### Outcome

- Backport: `engine/pilots/harmonic-oscillator-backport.html` — VERIFY PASS
  (syntax, manifest, stamp, references, consoleErrors, audit, initialRun,
  paramSweep incl. n=30, screenshot).
- Original `Sim_lab_sims/QM_sims/Harmonic-oscillator.html` not modified; no
  engine module/card/tool modified.

### Effort

- Original: 789 lines (Tailwind + Lucide + MathJax CDNs, hand-rolled
  everything). Backport: 715 authored lines (1946 on disk, 1232 of which are
  the build-injected engine block). Net authored size is a wash — the win is
  *what* the lines are: zero physics/plumbing helpers survive
  (hermite/logFactorial/psiN, resizeCanvases, mapX/mapY, niceTickStep,
  formatAxisNumber, drawAxes, the rAF loop, play/pause/reset wiring, the info
  modal logic — all deleted, ~200 lines of the original), and the CDN
  dependencies are gone (self-contained file).
- Mapped cleanly: psiN → `mu^{1/4} · Engine.special.hermiteNorm(n, √mu·x)`
  (one line); resize/DPR → `Engine.fit.fit` per frame (the shipped DPR bug —
  `resizeCanvases` never calls `setTransform` — cannot be re-created through
  this API); mapX/mapY → `Engine.view.makeView(aspect:'stretch')`; axes/ticks →
  `Engine.axes.drawAxes`; slider wiring → `Engine.bind.bindSlider` with bounds
  living only on the inputs; loop/play/pause/reset/speed/info modal → Shell
  (original feel preserved: autoplay on, reset resumes and zeroes t, speed
  scales only the on-screen phase rate).
- Awkward bits (all minor):
  - Original's continuous speed slider (0.1–1.0) became the shell's
    `#shell-speed` control; shell listens on `change` and the established
    pattern is a discrete select (0.1/0.25/0.5/1x).
  - Speed semantics: original scaled only the phase (`phase = E·speed·t`) while
    its Time stat advanced at wall-clock rate; Shell scales dt, so the Time
    readout now advances at the scaled rate too. More consistent, but a
    visible behavior change.
  - `Engine.scale.fmt` trims trailing zeros, so readouts show "3.5" where the
    original showed "3.50" (tabular-nums mono font keeps it stable).
  - Double-headed dashed turning-point marker: `Engine.primitives.dashLine`
    covers the line; the two arrowheads are small hand-drawn triangles (no
    engine glyph for a two-headed dashed span; `canvas.arrow` draws full
    shafts).
  - MathJax equations became HTML/Unicode (no CDN allowed; vendored KaTeX not
    usable, see card gaps).

### Card gaps (places engine source was needed)

1. `shell/shell.js` — the shell card names `#shell-speed` but not the element
   type or event: source shows it reads `.value` at boot and listens on
   `'change'` (`parseFloat`), so a range input would not update live while
   dragging. Card should say "select (or any element firing change with a
   numeric .value)".
2. `canvas/axes.js` — the card documents `yLabel` but not its placement:
   it is drawn as a textBox anchored at the plot's top-LEFT corner, which
   collides with any DOM title overlaid there (this sim's layout). Had to read
   the (inlined) source to diagnose; fixed sim-side by dropping yLabel and
   letting the panel titles carry the axis meaning. Card should state the
   yLabel position.
3. `tools/build.py` + the existing pilot — the exact manifest JSON shape
   (`manifestVersion/sim/engine/modules/params`) and the
   `engine-inline` marker block are only learnable from the build tool and
   `qm-tunneling-pilot.html`; a manifest example in `cards/_preamble.md` would
   remove this.
4. Engine limitation (worked around, not a card gap): registry vendor asset
   `fonts` is declared `inline: "style"` but `build.py` concatenates every
   vendor file into the JS engine block, so vendored CSS (@font-face) cannot
   actually be inlined — the backport uses a system font stack instead.

### Physics fidelity (node, original formulas vs engine route, shared grid)

Original `psiN` (naive Hermite recurrence + logNorm) vs backport
`mu^{1/4}·hermiteNorm(n, √mu·x)`, mu = 1, 1601 points on x ∈ [−8, 8]
(n = 30 on x ∈ [−10, 10]):

| n  | max abs diff | max\|ψ\| | rel. to peak | pointwise rel (\|ψ\| > 1e-6·peak) |
|----|-------------|----------|--------------|------------------------------------|
| 0  | 0           | 0.751126 | 0            | 0                                  |
| 3  | 4.4e-16     | 0.587877 | 7.6e-16      | 3.1e-14                            |
| 7  | 5.6e-16     | 0.546142 | 1.0e-15      | 2.0e-14                            |
| 10 | 1.8e-15     | 0.529475 | 3.5e-15      | 2.6e-14                            |
| 30 | —           | —        | 3.5e-15      | —                                  |

Well inside the ≤1e-8 gate — physics preserved exactly (the original's
logNorm route is fine at these n; the engine route is the one validated to
n = 60).

n = 30 dividend: slider extended 0–10 → 0–30. ∫|ψ₃₀|²dx = 1.0000000000 on a
wide fine grid; verify's param sweep drives n to 30 through the real UI path
and all invariants hold. Audit normalization tolerance is 5e-4 with a source
comment: the worst reachable corner (n = 30, mu = 0.49) truncates a measured
6.8e-5 of |ψ|² outside the plotted window (window sized to 1.12× the n = 30
turning point, as in the original's margin convention).

### Migration recipe for the next backport

1. Read the original fully; list physics formulas, controls (+bounds/defaults),
   layout regions, loop/playback semantics, and any latent bugs to kill.
2. Ground the numbers first: replicate the original's physics formulas in a
   node script against the engine module you will use (import the ESM source
   directly), on a shared grid; record the agreement table BEFORE writing the
   sim. Also measure anything you need for honest audit tolerances (e.g.
   plotted-window truncation of a normalization integral).
3. Copy the manifest/inline skeleton from an existing pilot: manifest in
   `<head>` (modules you actually use + params mirroring the original's
   sliders), empty `ENGINE:BEGIN/END` block in `<body>` before the sim script.
4. Map hand-rolled helpers to engine calls one-for-one (DPR resize → fit,
   linear maps → makeView, ticks/axes → drawAxes, slider wiring → bindSlider,
   loop/playback/theme/info → Shell callbacks with cfg matching the original's
   autoplay/reset feel). Keep plot-range constants derived from the *inputs'*
   min/max attributes so bounds are never duplicated in JS.
5. defineAudit with probes for every headline readout and invariants the
   physics guarantees; set tolerances from step-2 measurements, with comments.
6. `python3 engine/tools/build.py pilots/<name>.html --check` until PASS;
   read the screenshot it drops in `engine/_review/shots/` and fix visual
   collisions (remember: drawAxes yLabel sits at the plot's top-left).
7. Log effort, card gaps (each place you needed module source), and the
   physics table here; leave the original file untouched.
