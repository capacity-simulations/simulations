// core.complex tests — algebraic identities and split-array/scalar agreement.
//
// Tolerances agreed for M4 (do NOT loosen silently — renegotiate in the plan):
//   cMul/cDiv round-trip, cSqrt square, cExp identities   abs error < 1e-12
//     (all O(1) operands; double round-off is ~1e-16 per op).
//   arrMulPhase vs scalar cMul loop   EXACT equality — the array op performs
//     the identical fp expressions in the identical order.
//   unit-phase rotation norm preservation   rel drift < 1e-12.
//   arrNormSq of an analytically normalized sampled Gaussian   |.| - 1 < 1e-12
//     (Riemann sum of a smooth periodic-decaying integrand is spectrally
//     accurate; the window is wide enough that tails underflow).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cAdd, cSub, cMul, cDiv, cScale, cAbs2, cExp, cSqrt,
  arrMulPhase, arrAbs2, arrNormSq,
} from '../../core/complex.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) < tol, `${msg}: ${a} vs ${b}`);

/* ================= scalar ops ================= */

test('cAdd/cSub/cScale/cAbs2: exact on simple values', () => {
  assert.deepEqual(cAdd({ re: 1, im: 2 }, { re: 3, im: -5 }), { re: 4, im: -3 });
  assert.deepEqual(cSub({ re: 1, im: 2 }, { re: 3, im: -5 }), { re: -2, im: 7 });
  assert.deepEqual(cScale({ re: 1.5, im: -2 }, 2), { re: 3, im: -4 });
  assert.equal(cAbs2({ re: 3, im: 4 }), 25);
});

test('cMul/cDiv: round-trip cDiv(cMul(a,b), b) recovers a', () => {
  const cases = [
    [{ re: 1.3, im: -0.7 }, { re: 0.2, im: 2.1 }],
    [{ re: -2, im: 0 }, { re: 0, im: -1 }],
    [{ re: 0.001, im: 5 }, { re: -3.7, im: 0.4 }],
  ];
  for (const [a, b] of cases) {
    const r = cDiv(cMul(a, b), b);
    close(r.re, a.re, 1e-12, 'round-trip re');
    close(r.im, a.im, 1e-12, 'round-trip im');
  }
  // i * i = -1
  assert.deepEqual(cMul({ re: 0, im: 1 }, { re: 0, im: 1 }), { re: -1, im: 0 });
});

test('cExp: e^{i*pi} = -1, additivity, magnitude', () => {
  const eipi = cExp({ re: 0, im: Math.PI });
  close(eipi.re, -1, 1e-12, 'Euler re');
  close(eipi.im, 0, 1e-12, 'Euler im');

  const a = { re: 0.3, im: 1.1 };
  const b = { re: -0.8, im: 2.6 };
  const prod = cMul(cExp(a), cExp(b));
  const sum = cExp(cAdd(a, b));
  close(prod.re, sum.re, 1e-12, 'exp additivity re');
  close(prod.im, sum.im, 1e-12, 'exp additivity im');

  close(cAbs2(cExp({ re: 0.5, im: -3 })), Math.exp(1), 1e-12, '|e^z|^2 = e^{2 Re z}');
});

test('cSqrt: principal square root squares back, Re >= 0', () => {
  const cases = [
    { re: 4, im: 0 }, { re: -4, im: 0 }, { re: 0, im: 2 }, { re: 0, im: -2 },
    { re: 3, im: -4 }, { re: -1.2, im: 0.5 }, { re: 0, im: 0 },
  ];
  for (const z of cases) {
    const s = cSqrt(z);
    assert.ok(s.re >= 0, `principal branch: Re sqrt >= 0 for ${JSON.stringify(z)}`);
    const sq = cMul(s, s);
    close(sq.re, z.re, 1e-12, 'sqrt^2 re');
    close(sq.im, z.im, 1e-12, 'sqrt^2 im');
  }
  // Branch: negative real axis maps to +i sqrt(|x|)
  const s = cSqrt({ re: -9, im: 0 });
  close(s.re, 0, 1e-12, 'sqrt(-9) re');
  close(s.im, 3, 1e-12, 'sqrt(-9) im');
});

/* ================= split-array ops ================= */

const lcg = (seed) => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

test('arrMulPhase: exactly matches the scalar cMul loop', () => {
  const n = 257; // deliberately not a power of 2 — no FFT constraint here
  const rng = lcg(42);
  const re = new Float64Array(n), im = new Float64Array(n);
  const pr = new Float64Array(n), pi = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    re[i] = 2 * rng() - 1; im[i] = 2 * rng() - 1;
    const phi = 2 * Math.PI * rng();
    pr[i] = Math.cos(phi); pi[i] = Math.sin(phi);
  }
  const expRe = new Float64Array(n), expIm = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const p = cMul({ re: re[i], im: im[i] }, { re: pr[i], im: pi[i] });
    expRe[i] = p.re; expIm[i] = p.im;
  }
  arrMulPhase(re, im, pr, pi);
  assert.deepEqual(Array.from(re), Array.from(expRe), 'identical fp expressions -> exact re');
  assert.deepEqual(Array.from(im), Array.from(expIm), 'identical fp expressions -> exact im');
});

test('arrMulPhase: unit phases preserve the norm', () => {
  const n = 512, rng = lcg(7);
  const re = new Float64Array(n), im = new Float64Array(n);
  const pr = new Float64Array(n), pi = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    re[i] = 2 * rng() - 1; im[i] = 2 * rng() - 1;
    const phi = 2 * Math.PI * rng();
    pr[i] = Math.cos(phi); pi[i] = Math.sin(phi);
  }
  const before = arrNormSq(re, im);
  arrMulPhase(re, im, pr, pi);
  const after = arrNormSq(re, im);
  close(after / before, 1, 1e-12, 'unit rotation norm ratio');
});

test('arrAbs2: values, allocation, and out reuse', () => {
  const re = Float64Array.of(3, 0, -1);
  const im = Float64Array.of(4, 2, 1);
  const out = arrAbs2(re, im);
  assert.ok(out instanceof Float64Array, 'allocates Float64Array when out omitted');
  assert.deepEqual(Array.from(out), [25, 4, 2]);
  const reuse = new Float64Array(3);
  assert.equal(arrAbs2(re, im, reuse), reuse, 'returns the provided out');
  assert.deepEqual(Array.from(reuse), [25, 4, 2]);
});

test('arrNormSq: analytically normalized sampled Gaussian gives 1', () => {
  // psi(x) = (pi*s^2)^{-1/4} e^{-x^2/(2 s^2)} e^{i k0 x};  integral |psi|^2 dx = 1.
  const n = 512, L = 40, dx = L / n, s = 1.3, k0 = 2.5;
  const re = new Float64Array(n), im = new Float64Array(n);
  const amp = Math.pow(Math.PI * s * s, -0.25);
  for (let j = 0; j < n; j++) {
    const x = -L / 2 + j * dx;
    const g = amp * Math.exp(-x * x / (2 * s * s));
    re[j] = g * Math.cos(k0 * x);
    im[j] = g * Math.sin(k0 * x);
  }
  close(arrNormSq(re, im, dx), 1, 1e-12, 'norm of normalized Gaussian');
  // dx default = 1: plain vector norm
  close(arrNormSq(re, im), arrNormSq(re, im, dx) / dx, 1e-12, 'dx scaling');
});

test('length mismatches throw RangeError', () => {
  const a = new Float64Array(4), b = new Float64Array(3);
  assert.throws(() => arrMulPhase(a, a, a, b), RangeError);
  assert.throws(() => arrMulPhase(a, b, a, a), RangeError);
  assert.throws(() => arrAbs2(a, b), RangeError);
  assert.throws(() => arrAbs2(a, a, b), RangeError);
  assert.throws(() => arrNormSq(a, b), RangeError);
});
