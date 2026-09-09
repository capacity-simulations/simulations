// verify.guard — fidelity vs the ANHARMONIC numerics-guard subsystem
// (Sim_lab_sims/QM_sims/Classical-vs-schrodinger-ANHARMONIC.html).
//
// Source threshold VALUES asserted here (NUMERICS_THRESHOLDS, L674-693):
//   warnNormError            1e-4   (L675)  -> normDrift warn default
//   stopNormError            1e-3   (L676)  -> normDrift halt default
//   warnQuantumEnergyDrift   1e-3   (L679)  -> invariantDrift warn default
//   stopQuantumEnergyDrift   1e-2   (L680)  -> invariantDrift halt default
//   warnClassicalEnergyDrift 1e-4   (L681)  -> passed as override
//   stopClassicalEnergyDrift 1e-3   (L682)  -> passed as override
//   warnHighKOccupancy       1e-6   (L683)  -> highFreqOccupancy warn default
//   stopHighKOccupancy       1e-5   (L684)  -> highFreqOccupancy halt default
//   high-k cutoff fraction   0.9 * kNyquist (L765)
//   getRelativeDrift(v, b) = |v - b| / max(1, |b|)  (L736-738)
//   getRecommendedSubsteps: ceil(Vmax*dt/0.08), ceil(omega*dt/0.04),
//                           clamp [5, 80]  (L744-755)
//   hasNonFinite -> immediate stop  (L1097)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGuard, normDrift, invariantDrift, highFreqOccupancy, finite }
  from '../../verify/guard.js';
import { defineAudit } from '../../verify/audit.js';

test('scripted norm sweep reproduces the source warn/halt decisions', () => {
  // Fake wavefunction: we drift its norm artificially by known amounts.
  let norm = 1;
  const warns = [], halts = [];
  const g = makeGuard({
    monitors: [normDrift(() => norm)],   // baseline 1 captured at creation
    onWarn: (r) => warns.push(r),
    onHalt: (r) => halts.push(r),
  });

  // drift 5e-5 < warnNormError 1e-4 -> ok
  norm = 1 + 5e-5;
  assert.equal(g.check().state, 'ok');
  assert.equal(warns.length, 0);

  // drift 3e-4 crosses warnNormError 1e-4 -> warn, plain-English reason
  norm = 1 + 3e-4;
  const r1 = g.check();
  assert.equal(r1.state, 'warn');
  assert.equal(warns.length, 1);
  assert.match(r1.reasons[0], /Norm drift is growing: 3\.0e-4/);
  assert.ok(Math.abs(r1.metrics.normDrift - 3e-4) < 1e-12);

  // still warn -> onWarn NOT re-fired (fires on ok->warn transition only)
  g.check();
  assert.equal(warns.length, 1);

  // drift 2e-3 crosses stopNormError 1e-3 -> halted, onHalt once,
  // reason names the metric in plain English
  norm = 1 + 2e-3;
  const r2 = g.check();
  assert.equal(r2.state, 'halted');
  assert.equal(halts.length, 1);
  assert.match(r2.reasons[0], /Norm drift exceeded tolerance: 2\.0e-3/);
  assert.match(r2.reasons[0], /grid is too coarse for this speed/);
});

test('halted check() is a no-op until reset(); reset recaptures baselines', () => {
  let norm = 1;
  const halts = [];
  const g = makeGuard({ monitors: [normDrift(() => norm)], onHalt: () => halts.push(1) });
  norm = 1.01;
  assert.equal(g.check().state, 'halted');
  assert.equal(halts.length, 1);

  norm = 1;                       // recovers, but check() must NOT resample
  const frozen = g.check();
  assert.equal(frozen.state, 'halted');
  assert.ok(Math.abs(frozen.metrics.normDrift - 0.01) < 1e-12);
  assert.equal(halts.length, 1);  // onHalt fired exactly once

  g.reset();                      // baseline recaptured at current norm = 1
  assert.equal(g.report().state, 'ok');
  assert.deepEqual(g.report().reasons, []);
  assert.equal(g.check().state, 'ok');

  norm = 1.01;                    // a fresh halt re-arms onHalt
  assert.equal(g.check().state, 'halted');
  assert.equal(halts.length, 2);
});

test('invariantDrift: source quantum-energy thresholds by default, label in reasons', () => {
  let E = 50;
  const g = makeGuard({ monitors: [invariantDrift('energy', () => E)] });
  E = 50.1;                       // relDrift = 0.1/50 = 2e-3 > warn 1e-3
  const r1 = g.check();
  assert.equal(r1.state, 'warn');
  assert.match(r1.reasons[0], /energy drift is growing: 2\.0e-3/);
  E = 51;                         // 0.02 > halt 1e-2
  const r2 = g.check();
  assert.equal(r2.state, 'halted');
  assert.match(r2.reasons[0], /energy drift exceeded tolerance/);
});

test('invariantDrift: classical channel via overrides (warn 1e-4 / halt 1e-3)', () => {
  let E = 10;
  const g = makeGuard({
    monitors: [invariantDrift('classical energy', () => E, { warn: 1e-4, halt: 1e-3 })],
  });
  E = 10 + 5e-3;                  // relDrift 5e-4: warn under classical thresholds
  const r = g.check();
  assert.equal(r.state, 'warn');
  assert.match(r.reasons[0], /classical energy drift/);
});

test('drift uses the source relative form |v-b|/max(1,|b|), not plain relative', () => {
  let q = 0.5;
  const g = makeGuard({ monitors: [invariantDrift('q', () => q)] });
  q = 0.508;                      // |0.008|/max(1, 0.5) = 8e-3 -> warn, NOT halt
  const r = g.check();            // (plain relative 1.6e-2 would have halted)
  assert.equal(r.state, 'warn');
  assert.ok(Math.abs(r.metrics.qDrift - 8e-3) < 1e-12);
});

test('highFreqOccupancy: synthetic spectra with known high-k fractions', () => {
  // N = 8, default fraction 0.9: cutoff index 3.6 -> only the Nyquist bin
  // (i = 4, |index| = 4) counts as high-k.
  const power = new Float64Array(8);
  const g = makeGuard({ monitors: [highFreqOccupancy(() => ({ power }))] });

  power[0] = 1; power[4] = 5e-7;  // occupancy ~5e-7 < warn 1e-6 -> ok
  assert.equal(g.check().state, 'ok');

  power[4] = 3e-6;                // occupancy ~3e-6 in (1e-6, 1e-5] -> warn
  const r1 = g.check();
  assert.equal(r1.state, 'warn');
  assert.ok(Math.abs(r1.metrics.highFreqOccupancy - 3e-6 / (1 + 3e-6)) < 1e-15);
  assert.match(r1.reasons[0], /High-frequency occupancy is increasing/);

  power[4] = 0.5;                 // occupancy 1/3 >> stop 1e-5 -> halt
  const r2 = g.check();
  assert.equal(r2.state, 'halted');
  assert.match(r2.reasons[0], /indicates aliasing/);
  assert.ok(Math.abs(r2.metrics.highFreqOccupancy - 0.5 / 1.5) < 1e-15);
});

test('highFreqOccupancy: FFT ordering mirrors negative frequencies', () => {
  // fraction 0.5 on N = 8 -> cutoff index 2; bin 6 (|index| 2) is high-k,
  // bin 1 (|index| 1) is not.
  const power = new Float64Array(8);
  power[1] = 1; power[6] = 1;
  const mon = highFreqOccupancy(() => ({ power }), { fraction: 0.5 });
  assert.equal(mon.sample().value, 0.5);
});

test('finite() catches an injected NaN (and Infinity) and halts', () => {
  const re = new Float64Array(16), im = new Float64Array(16);
  const g = makeGuard({ monitors: [finite(() => re, () => im)] });
  assert.equal(g.check().state, 'ok');

  im[7] = NaN;
  const r = g.check();
  assert.equal(r.state, 'halted');
  assert.match(r.reasons[0], /Non-finite values were detected/);
  assert.equal(r.metrics.finite, 1);
  assert.equal(g.check().state, 'halted');   // still frozen

  g.reset();
  im[7] = 0; re[3] = Infinity;
  assert.equal(g.check().state, 'halted');   // Inf caught too
});

test('recommendSubsteps matches the source formula on hand-computed pairs', () => {
  const g = makeGuard({});
  // Source (L744-755): min(80, max(5, ceil(Vmax*dt/0.08), ceil(omega*dt/0.04)))
  // Pair 1: Vmax = 25,  dt = 0.02 -> ceil(25*0.02/0.08)  = ceil(6.25) = 7
  assert.equal(g.recommendSubsteps(0.02, 25), 7);
  // Pair 2: Vmax = 2,   dt = 0.02 -> ceil(0.5) = 1 -> clamped up to 5
  assert.equal(g.recommendSubsteps(0.02, 2), 5);
  // Pair 3: Vmax = 400, dt = 0.1  -> ceil(500) = 500 -> clamped down to 80
  assert.equal(g.recommendSubsteps(0.1, 400), 80);
  // Frequency channel: omega = 12, dt = 0.05, target 0.04. Float-faithful to
  // the source: 12*0.05/0.04 = 15.000000000000002 in IEEE754 -> ceil = 16.
  assert.equal(g.recommendSubsteps(0.05, 12, { targetPhase: 0.04 }), 16);
});

test('registerWith(audit): monitors become guard.* invariants (halt = tol)', () => {
  let norm = 1;
  const audit = defineAudit({}, {});          // plain injected target
  const g = makeGuard({ monitors: [normDrift(() => norm)] });
  assert.equal(g.registerWith(audit), true);
  assert.equal(typeof audit.invariants['guard.normDrift'], 'function');

  let out = audit.run();
  assert.equal(out.pass, true);

  norm = 1 + 3e-4;                            // warn level still passes audit
  out = audit.run();
  assert.equal(out.pass, true);

  norm = 1.01;                                // above halt threshold fails it
  out = audit.run();
  assert.equal(out.pass, false);
  const r = out.results.find((x) => x.name === 'guard.normDrift');
  assert.ok(Math.abs(r.value - 0.01) < 1e-12);
  assert.equal(r.tol, 1e-3);                  // stopNormError
  assert.equal(r.expected, 0);
});

test('auto-detects an installed __audit surface at creation', () => {
  const hadAudit = Object.prototype.hasOwnProperty.call(globalThis, '__audit');
  const prev = globalThis.__audit;
  try {
    const audit = defineAudit({}, globalThis);   // installs globalThis.__audit
    makeGuard({ monitors: [finite(() => [1, 2, 3])] });
    assert.equal(typeof audit.invariants['guard.finite'], 'function');
    assert.equal(audit.run().pass, true);
  } finally {
    if (hadAudit) globalThis.__audit = prev;
    else delete globalThis.__audit;
  }
});
