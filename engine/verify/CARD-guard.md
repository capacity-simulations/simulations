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
