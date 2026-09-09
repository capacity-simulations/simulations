# ENGINE SIM — GENERATION RULES (read first)

You are writing ONE self-contained HTML file: markup, CSS, and sim JS in a
single document. No external network dependencies — vendored assets arrive
via the build, never via CDN links you add.

Hard rules — violating any of these invalidates the output:

1. **Manifest is fixed.** Emit the `<script type="application/json"
   id="engine-manifest">` block EXACTLY as provided below, verbatim, in
   `<head>`. You never choose, add, or remove modules — module selection is
   a human decision already made.
2. **You never write engine code.** Emit this empty block once in `<body>`:
   `<script id="engine-inline">/* ENGINE:BEGIN */ /* ENGINE:END */</script>`
   The build tool fills it; put nothing between the markers.
3. **Cards are the whole API.** Use ONLY the `Engine.*` APIs documented in
   the cards below. If an API you need is missing, STOP and say what is
   missing — never hand-roll a replacement, never guess.
4. **Audit is mandatory.** Every sim MUST call `Engine.audit.defineAudit`
   with at least one probe and one invariant (see VERIFY CONTRACT).
5. **Params come from the manifest.** Each `params` entry becomes one input
   (id = param id, min/max/step/value from the schema) bound with
   `Engine.bind.bindSlider` — never a hand-wired listener or JS-duplicated
   bounds.
6. Every NEGATIVE CONSTRAINTS section below is absolute.

## MANIFEST — copy this verbatim into <head>

```html
<script type="application/json" id="engine-manifest">
{
  "manifestVersion": 1,
  "sim": "qm/tunneling-example",
  "engine": "1.0.0-dev",
  "modules": [
    "canvas.fit",
    "core.scale",
    "controls.bind",
    "core.complex",
    "core.fft",
    "core.roots",
    "core.special",
    "core.sample",
    "domain.quantum",
    "shell",
    "verify.audit",
    "verify.guard"
  ],
  "params": [
    {
      "id": "v0",
      "label": "Barrier height V\u2080",
      "min": 0.1,
      "max": 8,
      "step": 0.1,
      "default": 2
    },
    {
      "id": "w",
      "label": "Barrier width w",
      "min": 0.5,
      "max": 10,
      "step": 0.5,
      "default": 3
    },
    {
      "id": "k0",
      "label": "Packet momentum k\u2080",
      "min": 0.5,
      "max": 4,
      "step": 0.1,
      "default": 1.5
    }
  ],
  "build": null
}
</script>
```

## MODULE canvas.fit

# MODULE canvas.fit  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.fit

## API
- fit(canvas, ctx) -> {w, h}           // size backing store to CSS box × DPR, reset transform; returns CSS-px size

## VOCABULARY
canvas, context, device pixel ratio, CSS pixels, backing store. (No physics vocabulary.)

## USAGE
    function draw() {
      const { w, h } = Engine.fit.fit(canvas, ctx);   // top of EVERY draw
      ctx.clearRect(0, 0, w, h);                      // all drawing in CSS px
      ...
    }

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT set canvas.width/height by hand or multiply by devicePixelRatio inline —
  always fit(), so hi-DPI screens stay sharp and zero-size layouts can't crash.
- Do NOT call ctx.scale(dpr, dpr) without a setTransform reset first — cumulative
  DPR scaling shrinks/blows up the scene on every resize (a real shipped bug).
- Draw in the returned CSS-pixel {w, h}, never in canvas.width/height (device px).

## MODULE core.scale

# MODULE core.scale  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.scale

## API
- makeScale(domain, range) -> s        // s(x) maps [d0,d1]→[r0,r1]; s.invert(y); s.domain; s.range
- clamp(x, lo, hi) -> number
- lerp(a, b, t) -> number
- fmt(x, digits = 2) -> string         // fixed digits, trailing zeros trimmed, -0 scrubbed, U+2212 minus

## VOCABULARY
domain, range, scale, value, mapping. (No physics vocabulary — this module maps numbers.)

## USAGE
    const X = Engine.scale.makeScale([0, 10], [40, 760]);
    const px = X(3.2);              // world value → screen px
    const x  = X.invert(px);        // screen px → world value
    label.textContent = Engine.scale.fmt(x, 2);

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll linear maps (`px = pad + (x - x0) * k`) — always makeScale, so
  inversion (for dragging) stays correct.
- Do NOT format numbers with template literals or toFixed directly in UI code —
  use fmt so "-0.00" and hyphen-minus never reach the screen.

## MODULE controls.bind

# MODULE controls.bind  (v1.0)
DEPENDS: core.scale
NAMESPACE: Engine.bind

## API
- bindSlider(state, id, key, {out, fmt, onChange}) -> {set(v), refresh()}
    range/number input → state[key]. Bounds come from the element's own
    min/max attributes (clamped; NaN falls back to min). out: id of a readout
    element; fmt: v => string (default Engine.scale.fmt).
- bindToggle(state, id, key, {onChange}) -> {set(v), refresh()}
    checkbox → boolean state[key].
- bindSelect(state, id, key, {parse, onChange}) -> {set(v), refresh()}
    select → state[key]; parse maps option string → value (default identity;
    pass parseFloat for numeric options).
All three: set(v) sanitizes, updates state + element + readout, fires onChange;
refresh() pushes state[key] back into the UI without firing onChange. At bind
time, state[key] is seeded from the markup value if undefined, else the UI is
synced to the pre-set state.

## VOCABULARY
state, key, control, slider, toggle, select, readout, bounds. (Controls map UI
to state values — no physics vocabulary.)

## USAGE
    const state = {};
    const v0 = Engine.bind.bindSlider(state, 'v0', 'v0',
      { out: 'v0Val', fmt: v => Engine.scale.fmt(v, 1) + ' m/s',
        onChange: () => recompute() });
    v0.set(3.5);                    // programmatic move (fires onChange)
    state.v0 = presets[i].v0; v0.refresh();   // sync UI after a preset

## NEGATIVE CONSTRAINTS — read before writing any code
- Never addEventListener('input'/'change') on a control by hand — always
  bindSlider/bindToggle/bindSelect, so clamp + NaN guard + readout stay uniform.
- Never duplicate slider bounds in JS — min/max live on the input element only.
- Never write el.value directly after binding — use set() or refresh(), or the
  state and the UI will drift apart.

## MODULE core.complex

# MODULE core.complex  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.complex

## API
- cAdd(a, b) -> {re, im}                          // a + b
- cSub(a, b) -> {re, im}                          // a - b
- cMul(a, b) -> {re, im}                          // a * b
- cDiv(a, b) -> {re, im}                          // a / b
- cScale(z, s) -> {re, im}                        // real s times z
- cAbs2(z) -> number                              // |z|^2
- cExp(z) -> {re, im}                             // e^z
- cSqrt(z) -> {re, im}                            // principal root, Re >= 0
- arrMulPhase(re, im, phaseRe, phaseIm)           // IN PLACE: (re,im)[i] *= (phaseRe,phaseIm)[i]
- arrAbs2(re, im, out?) -> Float64Array           // out[i] = re[i]^2 + im[i]^2; allocates if out omitted
- arrNormSq(re, im, dx = 1) -> number             // sum (re^2 + im^2) * dx  (Riemann sum)

## VOCABULARY
value, real part, imaginary part, phase, magnitude, array. (Split re/im
Float64Array pairs are the array representation — no interleaving.)

## USAGE
    const z = Engine.complex.cMul(Engine.complex.cExp({ re: 0, im: phi }), a);

    // Elementwise rotation of a sampled complex array by precomputed phases:
    Engine.complex.arrMulPhase(re, im, phaseRe, phaseIm);
    const total = Engine.complex.arrNormSq(re, im, dx);   // ~1 if normalized

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call the scalar c* ops inside per-element loops over arrays — each
  call allocates an object; use the arr* in-place ops (that is what they are
  for).
- Do NOT interleave [re0, im0, re1, im1, ...] arrays; the array contract is
  two parallel Float64Arrays everywhere in the engine (FFT included).
- arrMulPhase mutates re/im; copy first if the input must survive.
- cSqrt is the principal branch (result Re >= 0, cut on the negative real
  axis) — do not rely on any other branch.

## MODULE core.fft

# MODULE core.fft  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.fft

## API
- fft(re, im, inverse = false)                    // IN PLACE radix-2 transform of split arrays
  // forward: X[k] = sum_j x[j] e^{-2 pi i j k / n}, no scaling;
  // inverse = true: e^{+...} and divides by n, so fft(); fft(,,true) round-trips.
  // THROWS RangeError unless n = re.length is a power of 2 and > 0.
- freqGrid(n, dx) -> Float64Array                 // angular frequencies per output bin,
  // FFT ordering [0 .. n/2-1, -n/2 .. -1] * 2*pi / (n * dx)

## VOCABULARY
sample, bin, spectrum, frequency, ordering. (No physics vocabulary — this
module transforms arrays.)

## USAGE
    Engine.fft.fft(re, im);                 // now in frequency space
    const k = Engine.fft.freqGrid(n, dx);   // k[i] pairs with bin i
    // ... multiply by a phase per bin (see core.complex arrMulPhase) ...
    Engine.fft.fft(re, im, true);           // back, already /n normalized

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call fft with a non-power-of-2 length — it throws; pad or regrid the
  data to the next power of 2 instead of trying other lengths.
- Do NOT re-derive the frequency array by hand (the 0..n-1 monotone grid is
  WRONG for bins above n/2) — always use freqGrid; its ordering matches this
  fft's output bins exactly.
- Do NOT normalize the forward transform or re-divide after the inverse —
  the /n lives in inverse = true only; double normalization silently shrinks
  amplitudes.
- fft works IN PLACE: it destroys the input arrays; copy first if needed.

## MODULE core.roots

# MODULE core.roots  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.roots

## API
- bisect(f, a, b, {tol = 1e-12, maxIter = 200}) -> number|null   // requires opposite signs at a, b; null on a bad bracket (never throws)
- newton(f, dfdx, x0, {tol = 1e-12, maxIter = 50}) -> number|null // null on zero/non-finite derivative or non-convergence
- bracketScan(f, a, b, n) -> [lo, hi][]                          // n-interval sign-change scan; each bracket feeds bisect; exact grid zeros come back as [x, x]

## VOCABULARY
function, interval, bracket, sign change, root, tolerance. (No physics vocabulary — this module finds zeros of numbers.)

## USAGE
    const root = Engine.roots.bisect((x) => f(x) - target, lo, hi);
    if (root == null) { /* no crossing in [lo, hi] — handle it */ }

    // Unknown number of roots: scan first, then refine each bracket.
    for (const [lo, hi] of Engine.roots.bracketScan(f, a, b, 400)) {
      const r = Engine.roots.bisect(f, lo, hi);
    }

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER hand-roll bisection or Newton loops in sim code — solve only through
  this module, and always handle the null (no root / no convergence) return.
- Do NOT grid-search-and-pick-nearest for a crossing — bracketScan + bisect is
  the pattern for functions with unknown root counts.
- bracketScan reports sign changes, not roots: a sign flip across a pole is
  still reported when both endpoint values are finite — check f at the refined
  root when poles are possible.

## MODULE core.special

# MODULE core.special  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.special

## API
- hermiteNorm(n, x) -> number
  // normalized Hermite function H_n(x) e^{-x^2/2} / sqrt(2^n n! sqrt(pi)),
  // stable orthonormal recurrence — safe for large n (validated to n = 60)
- assocLegendre(l, m, x, { condonShortley = true } = {}) -> number
  // P_l^m(x), integer l >= 0, -l <= m <= l (0 outside), x in [-1, 1].
  // condonShortley=true (engine default) INCLUDES the (-1)^m phase — equals
  // scipy lpmv and both harvest sims' m >= 0 recurrences (Spherical_harmonics
  // _Explorer incl. its negative-m branch; Hydrogen_atom_wavefunctions
  // substitutes |m| for negative m — pass Math.abs(m) to mimic it).
  // condonShortley=false returns (-1)^m times the default (phase removed).
- assocLaguerre(n, k, x) -> number                // L_n^{(k)}(x), degree n >= 0
- erf(x) -> number                                // A&S 7.1.26, max abs error ~1.5e-7

## VOCABULARY
index, degree, order, argument, recurrence, phase convention.

## USAGE
    const psi = Engine.special.hermiteNorm(n, xi);          // already normalized
    const P = Engine.special.assocLegendre(l, m, Math.cos(theta));
    const L = Engine.special.assocLaguerre(nr, 2 * l + 1, rho);

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER compute H_n(x) then divide by sqrt(2^n n! sqrt(pi)) — that naive route
  overflows/loses digits at high n; hermiteNorm already returns the
  normalized value.
- Do NOT flip signs to "fix" orbital lobes: the Condon-Shortley phase is ON
  by default (plan-confirmed). If a legacy visual needs the other convention,
  pass { condonShortley: false } — never hand-negate results.
- Do NOT use erf where ~1e-7 error matters (quadrature, convergence tests);
  it is display/statistics grade only.
- assocLaguerre arguments are (degree, order, x) — for the usual radial pair
  that is (n - l - 1, 2l + 1), not (n, l).

## MODULE core.sample

# MODULE core.sample  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.sample

## API
- makeRng(seed) -> () -> number
  // seeded LCG (NR u32: s = 1664525·s + 1013904223 mod 2^32) -> uniforms in
  // [0, 1); equal seeds give identical sequences (reproducible runs)
- makeGaussian(rng = Math.random) -> () -> number
  // standard normal N(0,1) sampler; Box-Muller with cached spare (one
  // log/sqrt per two draws); each sampler owns its own cache
- sampleFromPDF(pdf, xMin, xMax, pdfMax, rng = Math.random, maxAttempts = 1000) -> number
  // rejection sampling of pdf(x) on [xMin, xMax] under the uniform envelope
  // pdfMax >= max pdf; two rng() uniforms per attempt. THROWS RangeError if
  // pdfMax/interval are invalid, if pdf(x) is negative/non-finite or exceeds
  // pdfMax (bad envelope), or if maxAttempts pass with no acceptance —
  // it never falls back to a midpoint (the harvested sim did; that biased
  // its histograms).

## VOCABULARY
draw, sample, density, envelope, interval, uniform source (rng).

## USAGE
    const rng = Engine.sample.makeRng(2026);         // seeded, reproducible
    const gauss = Engine.sample.makeGaussian(rng);   // rng: () -> [0, 1)
    const v = mu + sigma * gauss();

    const x = Engine.sample.sampleFromPDF((x) => density(x), x0, x1, densityMax, rng);

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call Math.random() directly in sim code — inject rng (pass a seeded
  generator to make runs and __audit sweeps reproducible; Math.random is only
  the default of last resort).
- Do NOT guess pdfMax low: an envelope below the true peak silently clips the
  distribution — sampleFromPDF throws when it catches pdf(x) > pdfMax, but
  only at points it happens to visit. Compute or bound the true max.
- Do NOT set pdfMax far above the true peak either — acceptance rate is
  mean(pdf)/pdfMax; a loose envelope wastes draws and can hit the attempt cap.
- Do NOT share one makeGaussian sampler across contexts that each need
  reproducibility — the spare cache couples their draw sequences; make one
  sampler per seeded stream.

## MODULE shell

# MODULE shell  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.shell — build also emits the legacy alias `window.Shell` (registry "alias")

## API
- init(opts) -> undefined — boot the shell; call ONCE, after the DOM exists.
    opts.onFrame(dt)    advance the sim by dt seconds (already speed-scaled)
    opts.onReset()      re-establish initial sim state
    opts.onResize()     refit canvases (also called on maximize/theme/panel changes)
    opts.onStep(i)      guided-inquiry step i became active (0-based)
    opts.onComplete()   inquiry finished/skipped — set up free exploration
    opts.onExploreMode(free)  inquiry collapsed or lecture mode toggled
                              (aliases accepted: onLectureMode, onInquiryCollapsed)
    opts.frame          optional {mode:'fixed', dt, maxSubsteps} — fixed-dt
                        accumulator loop for PDE sims (default: variable dt)
    opts.cfg (defaults) resumeOnReset:true (true=resume | false=leave | 'pause'),
                        autoplay:true, speed:1 (a #shell-speed markup value wins),
                        dtClamp:0.05, lectureLanding:'last'|'first'|'fastforward',
                        finishFastForward:false, resumeOnFinish:false,
                        resetBeforeFirstStep:true, scrollStepsToTop:true,
                        gateLocksPlay:false
- setPlaying(p) — play/pause; syncs the ▶/⏸ button label
- setPlayEnabled(on) — enable/disable the ▶ Play button
- setPlayLocked(locked) — hard-lock ▶ behind a prediction; shows #play-hint
- setLectureMode(on) — 🎓 lecture display mode (collapses inquiry; landing per cfg)
- refit() — call after any sim-driven layout change
- stepReady() — satisfy the active data-gate card (enables Next, marks dot done)
- stepUnready() — revoke it (re-disables Next on gated cards)
- inqNext() — programmatic Next/Finish (Finish fires onComplete + collapse)
- _state() -> snapshot object — tests/debug only, never sim logic
    After init, Shell.speed / .playing / .step / .totalSteps are read-only getters.

## VOCABULARY
shell, frame loop, guided inquiry, step card, gate, lecture mode, free
exploration, hero, aside, formal region. (UI runtime — no physics vocabulary.)

## USAGE
    Shell.init({ onFrame(dt){ advance(dt); draw(); }, onReset(){ ... },
                 onResize(){ fitAll(); draw(); }, onStep(i){ applyStep(i); },
                 cfg:{ resumeOnReset:'pause' } });
DOM-ID contract (wired by name; every element optional — absent ⇒ feature inert):
#shell (root) · #shell-play #shell-reset #shell-speed #shell-maximize
#shell-info #shell-info-modal #shell-info-close #shell-theme #shell-lecture
#toggle-formal · #aside-inquiry #aside-inquiry-skip #aside-inquiry-restore
#inq-dots #inq-cards (holds .inq-step cards; data-gate / data-manual-gate)
#inq-prev #inq-pager-next #inq-next · #play-hint · .shell-panel > .shell-panel-head
· .choice inside a gated card auto-calls stepReady on click.
Root classes the shell drives: shell-max, lecture-mode, inquiry-collapsed,
no-inquiry, hide-formal, formal-open; body.light-theme. shell/shell.css is the
styling contract for these names.

## NEGATIVE CONSTRAINTS — read before writing any code
- Never hand-roll a rAF loop, play/pause state, speed control, theme toggle, or
  stepper — Shell owns them; the sim only implements the callbacks.
- Never rename or re-purpose contract IDs/classes, and never wire sim-specific
  DOM inside shell code — per-sim show/hide belongs in onExploreMode/onStep.
- Do not call onFrame/onReset yourself; drive the sim only via Shell methods.
- Physics must not depend on wall-clock time — use the dt passed to onFrame;
  PDE sims needing a stable dt use frame:{mode:'fixed', ...}, not their own loop.

## MODULE verify.audit

# MODULE verify.audit  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.audit

## API
- defineAudit({probes, invariants, state, setParam}, target) -> audit
  // installs target.__audit = {version: 1, manifest, probes, invariants,
  //                            state, setParam, run()}  (target defaults to
  // window/globalThis; manifest parsed from the #engine-manifest block)
  // probes:     pure numeric fns, exposed as-is (e.g. at(beta), meanX())
  // invariants: each fn returns {ok, value, expected, tol};
  //             run() -> {pass, results: [{name, ok, value, expected, tol}]}
  // state:      optional live-state accessor object (or null)
  // setParam(id, v): defaults to setting the control's value and dispatching
  //             'input' — the SAME code path controls.bind listens on

## VOCABULARY
audit, probe, invariant, manifest, parameter sweep, pass/fail. (No physics
vocabulary — the surface reports named numbers against tolerances.)

## USAGE
    Engine.audit.defineAudit({
      probes: { meanX: () => computeMeanX() },
      invariants: {
        norm: () => { const n = computeNorm();
          return { ok: Math.abs(n - 1) < 1e-6, value: n, expected: 1, tol: 1e-6 }; },
      },
      state: sim,
    });
    // verify.mjs then drives: __audit.run(), __audit.setParam('amp', 2), ...

## NEGATIVE CONSTRAINTS — read before writing any code
- The __audit surface is the machine-verification contract: EVERY sim must
  call defineAudit (build.py refuses a manifest without verify.audit).
- Invariant fns must return the full {ok, value, expected, tol} record —
  never a bare boolean; verify.mjs reports all four fields.
- Probes and invariants must be pure reads: never mutate sim state, never
  advance time. Parameter changes go through setParam only.
- Never override setParam to write state directly while the control is a DOM
  input — bypassing the 'input' event skips the sanitize/clamp path the user
  exercises, and the sweep stops testing the real UI wiring.

## MODULE verify.guard

# MODULE verify.guard  (v1.0)
DEPENDS: (none)  — audit integration is runtime detection, never an import
NAMESPACE: Engine.guard

## API
- makeGuard({monitors, onWarn, onHalt}) -> {check(t), reset(), recommendSubsteps(frameDt, maxRate, {targetPhase, minSubsteps, maxSubsteps}), report(), registerWith(audit)}
  // report() -> {state: 'ok'|'warn'|'halted', reasons: [plain-English], metrics}
  // halt: onHalt(report) fires ONCE; check() no-ops until reset().
  // reset(): recaptures every monitor baseline (also runs once at creation).
  // recommendSubsteps: ceil(maxRate*frameDt/targetPhase) clamped [5, 80]
  //   (ANHARMONIC phase-per-substep bound; targetPhase default 0.08)
  //   split-operator sims: maxRate = max phase rate (max|V| + max kinetic
  //   energy)/ħ, e.g. V0 + k0²/2 in natural units
  // registerWith(audit): monitors become 'guard.<name>' audit invariants;
  //   auto-called when window.__audit already exists at makeGuard time.
- normDrift(computeNorm, {warn, halt}) -> monitor          // defaults 1e-4 / 1e-3
- invariantDrift(label, computeValue, {warn, halt}) -> monitor  // defaults 1e-3 / 1e-2; label is YOUR string ('energy')
- highFreqOccupancy(spectrumFn, {fraction, warn, halt}) -> monitor
  // spectrumFn() -> {power} in FFT ordering; occupancy of |index| >= fraction*Nyquist bin; defaults 0.9, 1e-6 / 1e-5
- finite(...arrayGetters) -> monitor                       // any NaN/Inf halts

## VOCABULARY
monitor, drift, baseline, occupancy, substep, warn, halt, reason. (Monitors,
not physics — the guard watches numbers; the caller names the quantities.)

## USAGE
    const guard = Engine.guard.makeGuard({
      monitors: [
        Engine.guard.normDrift(() => computeNorm()),
        Engine.guard.invariantDrift('energy', () => computeEnergy()),
        Engine.guard.finite(() => psiRe, () => psiIm),
      ],
      onHalt: (r) => { Shell.setPlaying(false); showBanner(r.reasons); },
    });
    // per frame:  guard.check(t);      on Reset:  guard.reset();
    const n = guard.recommendSubsteps(frameDt, maxPotential);

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER silently loosen thresholds: overriding warn/halt requires a source
  comment justifying the physics; defaults are the reviewed ANHARMONIC values.
- NEVER catch-and-continue past a halt: a halted guard means the numbers are
  wrong — stop the loop and surface report().reasons verbatim; do not call
  reset() from frame code to un-stick it.
- Do not hand-roll drift/aliasing checks in sim code — add a monitor.
- Baselines belong to reset(): never recompute them mid-run to make a drifting
  quantity look flat.
- Create the guard only AFTER sim state exists — monitor closures execute
  immediately at creation (baselines captured then).

## MODULE domain.quantum

# MODULE domain.quantum  (v1.0)
DEPENDS: core.complex, core.fft, core.roots, core.special, core.sample
NAMESPACE: Engine.quantum

## API
- makeGrid({n, xMin, xMax}) -> grid                // {n, xMin, xMax, dx, x, k}; n a power of 2 (throws otherwise); k FFT-ordered
- gaussianPacket(grid, {x0, k0, sigma}) -> psi     // normalized {re, im} Float64Arrays; mean position x0, mean momentum hbar·k0;
  // sigma is the std of |psi|² in x (envelope e^{−(x−x0)²/4σ²}): Δx = σ, Δk = 1/(2σ)
- makeSplitOperator({grid, V, hbar, m, absorber}) -> op
  // V: Float64Array of grid.n potential samples on grid.x (NOT a function).
  // op.step(psi, dt, substeps): psi IN PLACE, substeps applications of the dt
  //   splitting — advances time dt·substeps (dt is per-substep, never
  //   subdivided); unitary Strang, phases cached per dt.
  // absorber {width, strength = 0.15, hardWidth = min(50, width/4)}: per-side
  //   zone of width grid SAMPLES; outermost hardWidth zeroed, rest damped;
  //   op.absorbedLeft/.absorbedRight track removed probability (norm +
  //   absorbed stays 1); op.resetAbsorbed()
- prob(psi, out) -> Float64Array                   // |psi|² per sample — the ONLY source of detection statistics
- normSq(psi, dx) -> number                        // sum |psi_i|²·dx (1 when normalized)
- expectation(psi, grid, 'x'|'p', {hbar}) -> number // mean position, or mean momentum via the FFT spectrum
- findBoundStates(V0, a, {hbar, m}) -> states      // finite well depth V0, HALF-width a; [{E, parity, k, kappa}] sorted by E, E in (−V0, 0)
- transferMatrix(E, segments, {hbar, m}) -> {T, R} // piecewise-constant [{V, width}] between V = 0 leads; handles E≈V degenerate branch; T + R = 1
- transmissionRect(E, V0, width, {hbar, m}) -> T   // closed form, one rectangular barrier; sinh (E<V0) / sin (E>V0) branches + E→V0 limit
- radialRnl(n, l, r, {a0}) -> R_nl(r)              // hydrogen radial function, orthonormal in ∫R²r²dr
- sampleDetection(pdfArray, grid, rng) -> x        // ONE detection position drawn from a density array (e.g. prob(psi)); rng injectable

## VOCABULARY
wavefunction psi, probability density |psi|², amplitude, superposition,
interference, eigenstate, energy level, bound state, tunneling, transmission/
reflection probability, expectation value, measurement, detection event,
collapse (instantaneous replacement of psi). Units hbar = m = 1 unless passed.

## USAGE
    const grid = Engine.quantum.makeGrid({n: 2048, xMin: -100, xMax: 100});
    const psi = Engine.quantum.gaussianPacket(grid, {x0: -40, k0: 2, sigma: 5});
    const op = Engine.quantum.makeSplitOperator({grid, V, absorber: {width: 256}});
    op.step(psi, dt, 4);                            // advances t by 4·dt — the only update
    const density = Engine.quantum.prob(psi);
    const hit = Engine.quantum.sampleDetection(density, grid, rng); // a point, drawn
    const { T, R } = Engine.quantum.transferMatrix(E, [{V: V0, width: w}]);

## NEGATIVE CONSTRAINTS — read before writing any code
- NO trajectories: nothing travels from source to screen; a particle has no
  position between preparation and detection; detection events are sampled
  from |ψ|² (sampleDetection) — never animated as a moving dot along a path.
- NO classical vocabulary for quantum objects: never "ball", "bounces",
  "path", "orbit", "the electron goes through slit A".
- NO force-based updates on ψ: evolution is splitStep/eigenphases only —
  never v += F*dt on a quantum state.
- Collapse is instantaneous replacement of ψ, not motion: after a measurement,
  overwrite ψ with the post-measurement state in one frame — never animate ψ
  "shrinking" toward the outcome.
- In comparison sims, classical concepts live exclusively in the classical
  panel using domain.mechanics — never imported into quantum rendering or
  update code.
- Probabilities come only from prob/normSq/transferMatrix/transmissionRect —
  never from counting pixels or ad-hoc renormalization; if norm drifts,
  the step is wrong (or belongs to the absorber accounting).

# SHELL CONTRACT (condensed — the shell module card has the full API)

The Shell owns the runtime: rAF loop, play/pause/speed/reset, theme, modals,
inquiry stepper, lecture mode. The sim only implements callbacks. Boot ONCE,
after the DOM exists:

    Shell.init({
      onFrame(dt) { advance(dt); draw(); },   // dt in s, speed-scaled
      onReset()   { /* re-establish initial state */ },
      onResize()  { /* refit canvases, redraw */ },
      onStep(i)   { /* inquiry step i active (0-based) */ },
      onComplete(){ /* inquiry finished — free exploration */ },
      cfg: { /* all optional — see note below */ },
    });

cfg flags: full default list under init opts.cfg in the shell module card.

Frame modes:
- **Variable dt (default):** onFrame(dt) gets the clamped wall-clock delta;
  for ODE/closed-form sims.
- **Fixed dt:** pass `frame:{mode:'fixed', dt, maxSubsteps}` — accumulator
  loop calls onFrame with a CONSTANT dt. REQUIRED for PDE / split-operator /
  stiff-integrator sims: dt must never follow the display's frame rate.
  Never build your own loop either way.
In both modes dt is wall-clock SECONDS (speed-scaled); mapping it to
sim/natural time units is the sim's job.

DOM ids are wired by name (absent element ⇒ feature inert; full id list +
root classes in the shell module card); never rename or re-purpose them.
Skeleton:

    <body><div id="shell">          <!-- mode classes land on #shell -->
     <header class="shell-header">…buttons/speed…</header>
     <main class="shell-hero">canvas + #play-hint</main>
     <aside class="shell-aside">
      <div class="aside-zone" id="aside-inquiry">
       <div id="inq-dots"></div>
       <div id="inq-cards"><div class="inq-step">…</div>…</div>
       <div class="inq-nav">#inq-prev #inq-pager-next (pager arrows) ·
         #inq-next (primary Next/Finish)</div>
      </div>
      <button id="aside-inquiry-restore"></button><!-- sibling AFTER zone -->
      <div class="aside-zone">.shell-panel controls/readouts…</div>
     </aside>
     <section class="shell-formal">…</section> · #shell-info-modal last
    </div></body>

The build injects shell.css into `<style id="engine-css">` automatically —
never paste it; your own style tag holds sim CSS only.

Params → controls: per manifest param emit `<input type="range" id="{id}"
min max step value>` + a readout span, then
`Engine.bind.bindSlider(state,'sigma','sigma',{out:'sigmaVal',onChange:...})`.

Physics reads time only from onFrame's dt — never the wall clock. Drive play
state only via Shell methods (setPlaying, stepReady, refit, ...).

# VERIFY CONTRACT (mandatory in every sim)

Call `Engine.audit.defineAudit({probes, invariants, state})` once, after the
sim state exists. It installs `window.__audit`, the surface the automated
verifier drives. Minimum: ONE probe and ONE invariant.

- **Probes** are pure, numeric, physics-meaningful reads: e.g.
  `norm: () => normSq(psi, grid.dx)`, `meanX: () => expectation(psi, grid,
  'x')`. Never mutate state, never advance time, never return DOM strings.
- **Invariants** each return the FULL record `{ok, value, expected, tol}` —
  never a bare boolean. Pick quantities the physics guarantees (norm = 1,
  energy constant, T + R = 1) with an honest tol. The verifier's initial
  `run()` is NOT at t = 0: the sim autoplays from page load, `__audit` may
  appear seconds later, and ~5 rAF settle frames precede run() (~10 per
  setParam sweep) — invariants must hold at ANY t.
- `setParam` defaults to setting the control's value and dispatching
  `'input'` — the same path `Engine.bind` listens on; the verifier sweeps
  every manifest param min/default/max through it and re-checks invariants.
  Don't override it to poke state directly.

**verify.guard** — add for ANY sim that steps a PDE or numerical integrator
(split-operator, RK4/Verlet loops): build a `makeGuard` with at least
`normDrift` or `invariantDrift('energy', ...)` plus `finite(...)`, call
`guard.check(t)` each frame and `guard.reset()` in onReset, and stop the loop
on halt (surface `report().reasons` verbatim). Don't hand-roll drift checks,
and never loosen thresholds without a source comment justifying the physics.

## YOUR TASK

# Brief: Quantum tunneling through a rectangular barrier (QM course)

Students should SEE that a wavepacket meeting a barrier splits into reflected
and transmitted parts, and that transmission survives even when E < V0.
Panels: (1) |ψ|² over x with the barrier drawn as a shaded rectangle;
(2) a live T and R readout with T + R shown summing to 1 (absorbed
probability accounted). Sliders: barrier height V0, barrier width w, packet
mean momentum k0. Guided inquiry (4 steps): predict what happens when E < V0
→ run and observe the split → raise V0 until T is tiny but nonzero → relate
w to T at fixed V0 (thin barriers leak more). Reset restores the incident
packet at x0 = −40. Use natural units (hbar = m = 1); keep the evolution
visibly smooth at speed 1.
