// verify.guard — generic numerics guard (Layer: verify). Monitors, not physics:
// this module watches numbers drift and spectra alias; it never names ψ or E.
//
// Genericized from the numerics-guard subsystem of
// Sim_lab_sims/QM_sims/Classical-vs-schrodinger-ANHARMONIC.html:
//   NUMERICS_THRESHOLDS            L674-693  (defaults kept verbatim below)
//   numerics state/metrics object  L695-718
//   getRelativeDrift               L736-738  |v - b| / max(1, |b|)
//   getNyquistK                    L740-742  (index form here: N/2 bin)
//   getRecommendedSubsteps         L744-755  phase-per-substep bound
//   computeMomentumDiagnostics     L757-782  high-k occupancy >= 0.9*kNyquist
//   assessResetSafety              L815-847  warn/stop reason accumulation
//   updateNumericalStatus          L1044-1110 auto-halt + plain-English reasons
//
// AUDIT INTEGRATION (design choice): registerWith(audit) is the explicit
// contract; as a convenience makeGuard also auto-detects an already-installed
// __audit surface (globalThis.__audit.version === 1) at creation and registers
// its monitors as 'guard.<name>' invariants. Runtime detection — NOT an import
// — keeps verify.guard's registry deps [] : a guard must work in a page that
// never loaded verify.audit, and verify modules never import each other. If
// the sim calls defineAudit AFTER makeGuard, it must call
// guard.registerWith(window.__audit) itself.

function relDrift(value, baseline) {          // ANHARMONIC getRelativeDrift L736
  return Math.abs(value - baseline) / Math.max(1, Math.abs(baseline));
}

function formatExp(value) {                   // ANHARMONIC formatExp L732
  return Number.isFinite(value) ? value.toExponential(1) : 'NaN';
}

/* Grade a metric against warn/halt thresholds. NaN grades as halt
 * (!(NaN <= x) is true). tol reported to audit is the halt threshold. */
function grade(value, warn, halt, warnMsg, haltMsg) {
  if (!(value <= halt)) return { value, level: 'halt', reason: haltMsg(value), tol: halt };
  if (!(value <= warn)) return { value, level: 'warn', reason: warnMsg(value), tol: halt };
  return { value, level: 'ok', reason: null, tol: halt };
}

/**
 * Relative drift of a normalization vs its value captured at reset().
 * Defaults: warnNormError 1e-4 / stopNormError 1e-3 (source L675-676).
 */
export function normDrift(computeNorm, { warn = 1e-4, halt = 1e-3 } = {}) {
  let baseline = 1;
  return {
    name: 'normDrift',
    reset() { baseline = computeNorm(); },
    sample() {
      return grade(relDrift(computeNorm(), baseline), warn, halt,
        (v) => 'Norm drift is growing: ' + formatExp(v),
        (v) => 'Norm drift exceeded tolerance: ' + formatExp(v) +
               ' — the grid is too coarse for this speed.');
    },
  };
}

/**
 * Generic conserved-quantity drift; label is the caller's string ('energy').
 * Defaults: warnQuantumEnergyDrift 1e-3 / stopQuantumEnergyDrift 1e-2
 * (source L679-680; its classical channel used 1e-4/1e-3 — pass those in).
 */
export function invariantDrift(label, computeValue, { warn = 1e-3, halt = 1e-2 } = {}) {
  let baseline = 0;
  return {
    name: label + 'Drift',
    reset() { baseline = computeValue(); },
    sample() {
      return grade(relDrift(computeValue(), baseline), warn, halt,
        (v) => label + ' drift is growing: ' + formatExp(v),
        (v) => label + ' drift exceeded tolerance: ' + formatExp(v) +
               ' — the stepper is no longer conserving it.');
    },
  };
}

/**
 * Fraction of spectral power at |frequency index| >= fraction * Nyquist bin.
 * spectrumFn() -> {power: Float64Array} in FFT ordering (bin i <= N/2 is +i,
 * bin i > N/2 is i-N; both map to |index| = min(i, N-i), Nyquist = N/2 —
 * the index form of source L765's 0.9 * getNyquistK() cutoff, L767-775 sum).
 * Defaults: warnHighKOccupancy 1e-6 / stopHighKOccupancy 1e-5 (source L683-684).
 */
export function highFreqOccupancy(spectrumFn, { fraction = 0.9, warn = 1e-6, halt = 1e-5 } = {}) {
  return {
    name: 'highFreqOccupancy',
    reset() {},
    sample() {
      const power = spectrumFn().power;
      const n = power.length;
      const cutoff = fraction * (n / 2);
      let total = 0, high = 0;
      for (let i = 0; i < n; i++) {
        total += power[i];
        if (Math.min(i, n - i) >= cutoff) high += power[i];
      }
      return grade(total > 0 ? high / total : 0, warn, halt,
        (v) => 'High-frequency occupancy is increasing: ' + formatExp(v),
        (v) => 'High-frequency occupancy indicates aliasing: ' + formatExp(v) +
               ' — the spectrum has reached the grid resolution limit.');
    },
  };
}

/**
 * NaN/Inf scan over the arrays returned by each getter. Any non-finite entry
 * halts immediately (source L1097: hasNonFinite -> stop). value = bad count.
 */
export function finite(...arrayGetters) {
  return {
    name: 'finite',
    reset() {},
    sample() {
      let bad = 0;
      for (const get of arrayGetters) {
        const a = get();
        for (let i = 0; i < a.length; i++) if (!Number.isFinite(a[i])) bad++;
      }
      if (bad) {
        return { value: bad, level: 'halt', tol: 0,
                 reason: 'Non-finite values were detected in the solver state.' };
      }
      return { value: 0, level: 'ok', reason: null, tol: 0 };
    },
  };
}

/**
 * makeGuard({monitors, onWarn(report), onHalt(report)}) ->
 *   {check(t), reset(), recommendSubsteps(frameDt, maxRate, opts), report(),
 *    registerWith(audit)}
 * report() -> {state: 'ok'|'warn'|'halted', reasons: [plain-English], metrics}.
 * Auto-halt (source L1101-1106): any halt-level monitor flips state to
 * 'halted', onHalt fires ONCE with the report, and check() is a no-op until
 * reset(). onWarn fires on each ok->warn transition. reset() recaptures every
 * monitor baseline and re-arms; makeGuard resets once at creation.
 */
export function makeGuard({ monitors = [], onWarn = null, onHalt = null } = {}) {
  let state = 'ok';
  let reasons = [];
  let metrics = {};
  let haltNotified = false;

  function report() {
    return { state, reasons: reasons.slice(), metrics: Object.assign({}, metrics) };
  }

  function check(t) {
    if (state === 'halted') return report();   // no-op until reset()
    const warns = [], stops = [];
    for (const m of monitors) {
      const r = m.sample(t);
      metrics[m.name] = r.value;
      if (r.level === 'halt') stops.push(r.reason);
      else if (r.level === 'warn') warns.push(r.reason);
    }
    const prev = state;
    reasons = stops.length ? stops : warns;    // source L802: stops preempt warns
    state = stops.length ? 'halted' : warns.length ? 'warn' : 'ok';
    if (state === 'halted') {
      if (!haltNotified) { haltNotified = true; if (onHalt) onHalt(report()); }
    } else if (state === 'warn' && prev === 'ok' && onWarn) {
      onWarn(report());
    }
    return report();
  }

  function reset() {
    state = 'ok'; reasons = []; metrics = {}; haltNotified = false;
    for (const m of monitors) m.reset();
  }

  /* Substep recommendation, ANHARMONIC getRecommendedSubsteps L744-755
   * generalized. The source bounded phase-per-substep two ways —
   * ceil(maxV * frameDt / 0.08) and ceil(omega * frameDt / 0.04) — then
   * clamped to [5, 80]. Here the caller supplies ONE maxRate (e.g. max|V|/hbar,
   * or an angular frequency) and the target phase per substep; the source's
   * two-channel form is max(recommendSubsteps(dt, maxV),
   * recommendSubsteps(dt, omega, {targetPhase: 0.04})). */
  function recommendSubsteps(frameDt, maxRate,
      { targetPhase = 0.08, minSubsteps = 5, maxSubsteps = 80 } = {}) {
    const n = Math.ceil((maxRate * frameDt) / targetPhase);
    return Math.min(maxSubsteps, Math.max(minSubsteps, n));
  }

  /* Register every monitor as an audit invariant 'guard.<name>':
   * ok = not at halt level, tol = the halt threshold, expected = 0. */
  function registerWith(audit) {
    if (!audit || !audit.invariants) return false;
    for (const m of monitors) {
      audit.invariants['guard.' + m.name] = () => {
        const r = m.sample();
        return { ok: r.level !== 'halt', value: r.value, expected: 0, tol: r.tol };
      };
    }
    return true;
  }

  reset();   // capture baselines at attach (source captures *Energy0 at reset)
  const g = typeof globalThis !== 'undefined' ? globalThis : null;
  if (g && g.__audit && g.__audit.version === 1) registerWith(g.__audit);
  return { check, reset, recommendSubsteps, report, registerWith };
}
