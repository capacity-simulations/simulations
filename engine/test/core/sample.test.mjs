// core.sample tests — seeded determinism, distribution moments, KS fit, guards.
// All randomness in these tests flows through a seeded LCG (u32 Numerical-
// Recipes constants) injected as rng — nothing here touches Math.random.
//
// Tolerances agreed for M4 (do NOT loosen silently — renegotiate in the plan):
//   makeGaussian moments at 1e5 draws (fixed seed)   |mean| < 0.01,
//     |var - 1| < 0.02 (2%) — statistical, deterministic under the fixed seed.
//   sampleFromPDF vs sin^2(pi x) CDF, 1e4 draws (fixed seed)
//     Kolmogorov-Smirnov D < 0.01 (expected D ~ 0.87/sqrt(n) ~ 0.009).
//   Determinism   same seed -> identical sequences, exact equality.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGaussian, makeRng, sampleFromPDF } from '../../core/sample.js';

const lcg = (seed) => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

/* ================= makeRng ================= */

test('makeRng: same seed -> identical sequence across instances; different seed differs', () => {
  const r1 = makeRng(2026);
  const r2 = makeRng(2026);
  const a = Array.from({ length: 64 }, () => r1());
  const b = Array.from({ length: 64 }, () => r2());
  assert.deepEqual(a, b, 'identical seed -> identical draws (exact equality)');
  const r3 = makeRng(1);
  assert.notDeepEqual(a, Array.from({ length: 64 }, () => r3()), 'different seed differs');
  // Matches the reference NR-constants LCG used throughout these tests.
  assert.deepEqual(Array.from({ length: 64 }, lcg(2026)), a, 'NR u32 LCG stream');
});

test('makeRng: draws are uniforms in [0, 1)', () => {
  const r = makeRng(123456789);
  for (let i = 0; i < 10000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1, `draw ${i} = ${v} outside [0, 1)`);
  }
});

/* ================= makeGaussian ================= */

test('makeGaussian: same seed reproduces the exact sequence; caches are independent', () => {
  const g1 = makeGaussian(lcg(2026));
  const g2 = makeGaussian(lcg(2026));
  const a = Array.from({ length: 16 }, () => g1());
  const b = Array.from({ length: 16 }, () => g2());
  assert.deepEqual(a, b, 'identical seed -> identical draws');
  const g3 = makeGaussian(lcg(1));
  assert.notDeepEqual(a, Array.from({ length: 16 }, () => g3()), 'different seed differs');
  // Interleaving a second sampler must not disturb the first one's spare cache.
  const g4 = makeGaussian(lcg(2026));
  const g5 = makeGaussian(lcg(999));
  const c = [];
  for (let i = 0; i < 16; i++) { c.push(g4()); g5(); }
  assert.deepEqual(c, a, 'independent spare caches');
});

test('makeGaussian: Box-Muller spare — exactly one uniform pair per two draws', () => {
  let calls = 0;
  const counting = () => { calls++; return 0.5; };
  const g = makeGaussian(counting);
  g(); g();
  assert.equal(calls, 2, 'two draws consume one (u1, u2) pair');
  g();
  assert.equal(calls, 4, 'third draw starts a new pair');
});

test('makeGaussian: 1e5-draw moments (seeded): |mean| < 0.01, var within 2%', () => {
  const g = makeGaussian(lcg(123456789));
  const n = 100000;
  let sum = 0, sumSq = 0;
  for (let i = 0; i < n; i++) { const v = g(); sum += v; sumSq += v * v; }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  assert.ok(Math.abs(mean) < 0.01, `mean ${mean}`);
  assert.ok(Math.abs(variance - 1) < 0.02, `variance ${variance}`);
});

/* ================= sampleFromPDF ================= */

test('sampleFromPDF: deterministic under a fixed seed', () => {
  const pdf = (x) => 2 * Math.sin(Math.PI * x) ** 2;
  const a = [], b = [];
  const r1 = lcg(55), r2 = lcg(55);
  for (let i = 0; i < 100; i++) a.push(sampleFromPDF(pdf, 0, 1, 2, r1));
  for (let i = 0; i < 100; i++) b.push(sampleFromPDF(pdf, 0, 1, 2, r2));
  assert.deepEqual(a, b, 'identical seed -> identical samples');
  for (const x of a) assert.ok(x >= 0 && x <= 1, 'samples inside [xMin, xMax]');
});

test('sampleFromPDF: 1e4 draws from sin^2(pi x) pass KS at D < 0.01', () => {
  // pdf 2 sin^2(pi x) on [0,1]; CDF F(x) = x - sin(2 pi x)/(2 pi).
  const pdf = (x) => 2 * Math.sin(Math.PI * x) ** 2;
  const F = (x) => x - Math.sin(2 * Math.PI * x) / (2 * Math.PI);
  const rng = lcg(31415926);
  const n = 10000;
  const xs = new Float64Array(n);
  for (let i = 0; i < n; i++) xs[i] = sampleFromPDF(pdf, 0, 1, 2, rng);
  xs.sort();
  let D = 0;
  for (let i = 0; i < n; i++) {
    const Fi = F(xs[i]);
    D = Math.max(D, Math.abs((i + 1) / n - Fi), Math.abs(Fi - i / n));
  }
  assert.ok(D < 0.01, `KS statistic D = ${D}`);
});

test('sampleFromPDF: attempt cap throws RangeError instead of returning a biased midpoint', () => {
  // pdf ~ 0 everywhere: nothing ever accepted (rng()*pdfMax < 0 is false).
  const rng = lcg(7);
  assert.throws(() => sampleFromPDF(() => 0, 0, 1, 2, rng), RangeError, 'default cap');
  let evals = 0;
  assert.throws(
    () => sampleFromPDF(() => { evals++; return 0; }, 0, 1, 2, rng, 25),
    RangeError, 'custom cap');
  assert.equal(evals, 25, 'respects maxAttempts');
});

test('sampleFromPDF: guards — bad envelope, bad interval, bad pdf values', () => {
  const rng = lcg(11);
  assert.throws(() => sampleFromPDF((x) => x, 0, 1, 0, rng), RangeError, 'pdfMax = 0');
  assert.throws(() => sampleFromPDF((x) => x, 0, 1, NaN, rng), RangeError, 'pdfMax NaN');
  assert.throws(() => sampleFromPDF((x) => x, 1, 0, 2, rng), RangeError, 'xMax <= xMin');
  assert.throws(() => sampleFromPDF(() => 5, 0, 1, 1, rng), RangeError, 'pdf above pdfMax');
  assert.throws(() => sampleFromPDF(() => -1, 0, 1, 1, rng), RangeError, 'negative pdf');
  assert.throws(() => sampleFromPDF(() => NaN, 0, 1, 1, rng), RangeError, 'NaN pdf');
});
