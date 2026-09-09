// core.fft tests — analytic transforms, round-trip, Parseval, guards.
//
// Tolerances agreed for M4 (do NOT loosen silently — renegotiate in the plan):
//   impulse/DC/single-tone bins        abs error < 1e-9 (n <= 64; butterfly
//                                      round-off accumulates ~n*eps).
//   ifft(fft(x)) round-trip            abs error < 1e-12 per element
//                                      (random O(1) data, n up to 1024).
//   Parseval sum |x|^2 = (1/n) sum |X|^2   rel error < 1e-12.
//   1024-pt Gaussian |X_k|*dx vs analytic sigma*sqrt(2*pi)*e^{-sigma^2 k^2/2}
//                                      abs error < 1e-10 (magnitude removes
//                                      the -L/2 grid-offset linear phase).
//   freqGrid ordering                  exact (integer multiples of 2*pi/(n*dx)).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fft, freqGrid } from '../../core/fft.js';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) < tol, `${msg}: ${a} vs ${b}`);
const lcg = (seed) => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

/* ================= analytic transforms ================= */

test('impulse at 0 transforms to all-ones spectrum', () => {
  const n = 16;
  const re = new Float64Array(n), im = new Float64Array(n);
  re[0] = 1;
  fft(re, im);
  for (let k = 0; k < n; k++) {
    close(re[k], 1, 1e-9, `X[${k}] re`);
    close(im[k], 0, 1e-9, `X[${k}] im`);
  }
});

test('DC input transforms to n at bin 0, zero elsewhere', () => {
  const n = 32;
  const re = new Float64Array(n).fill(1), im = new Float64Array(n);
  fft(re, im);
  close(re[0], n, 1e-9, 'X[0]');
  close(im[0], 0, 1e-9, 'X[0] im');
  for (let k = 1; k < n; k++) {
    close(re[k], 0, 1e-9, `X[${k}] re`);
    close(im[k], 0, 1e-9, `X[${k}] im`);
  }
});

test('single complex tone e^{2*pi*i*k0*j/n} lands entirely in bin k0', () => {
  const n = 64, k0 = 5;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    re[j] = Math.cos(2 * Math.PI * k0 * j / n);
    im[j] = Math.sin(2 * Math.PI * k0 * j / n);
  }
  fft(re, im);
  for (let k = 0; k < n; k++) {
    close(re[k], k === k0 ? n : 0, 1e-9, `X[${k}] re`);
    close(im[k], 0, 1e-9, `X[${k}] im`);
  }
});

/* ================= round-trip and Parseval ================= */

test('ifft(fft(x)) restores random input to 1e-12', () => {
  const n = 256, rng = lcg(99);
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let j = 0; j < n; j++) { re[j] = 2 * rng() - 1; im[j] = 2 * rng() - 1; }
  const re0 = re.slice(), im0 = im.slice();
  fft(re, im);
  fft(re, im, true);
  for (let j = 0; j < n; j++) {
    close(re[j], re0[j], 1e-12, `x[${j}] re`);
    close(im[j], im0[j], 1e-12, `x[${j}] im`);
  }
});

test('Parseval: sum |x|^2 = (1/n) sum |X|^2', () => {
  const n = 256, rng = lcg(1234);
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let j = 0; j < n; j++) { re[j] = 2 * rng() - 1; im[j] = 2 * rng() - 1; }
  let sx = 0;
  for (let j = 0; j < n; j++) sx += re[j] * re[j] + im[j] * im[j];
  fft(re, im);
  let sX = 0;
  for (let k = 0; k < n; k++) sX += re[k] * re[k] + im[k] * im[k];
  close(sX / n / sx, 1, 1e-12, 'Parseval ratio');
});

test('1024-pt Gaussian: spectrum magnitude matches the analytic transform and round-trips', () => {
  // x_j = -L/2 + j*dx, f(x) = e^{-x^2/(2 sigma^2)};
  // |integral f e^{-ikx} dx| = sigma*sqrt(2*pi)*e^{-sigma^2 k^2/2} ~ |X_k|*dx.
  const n = 1024, L = 40, dx = L / n, sigma = 1;
  const re = new Float64Array(n), im = new Float64Array(n);
  for (let j = 0; j < n; j++) {
    const x = -L / 2 + j * dx;
    re[j] = Math.exp(-x * x / (2 * sigma * sigma));
  }
  const re0 = re.slice(), im0 = im.slice();
  fft(re, im);
  const k = freqGrid(n, dx);
  for (let i = 0; i < n; i++) {
    const mag = Math.hypot(re[i], im[i]) * dx;
    const exact = sigma * Math.sqrt(2 * Math.PI) * Math.exp(-sigma * sigma * k[i] * k[i] / 2);
    close(mag, exact, 1e-10, `|X| at k=${k[i].toFixed(3)}`);
  }
  fft(re, im, true);
  for (let j = 0; j < n; j++) {
    close(re[j], re0[j], 1e-12, `round-trip re[${j}]`);
    close(im[j], im0[j], 1e-12, `round-trip im[${j}]`);
  }
});

/* ================= guards and freqGrid ================= */

test('fft throws RangeError on non-power-of-2 and empty input', () => {
  assert.throws(() => fft(new Float64Array(3), new Float64Array(3)), RangeError, 'n=3');
  assert.throws(() => fft(new Float64Array(0), new Float64Array(0)), RangeError, 'n=0');
  assert.throws(() => fft(new Float64Array(12), new Float64Array(12)), RangeError, 'n=12');
  assert.throws(() => fft(new Float64Array(8), new Float64Array(4)), RangeError, 'length mismatch');
  // powers of 2 do not throw
  fft(new Float64Array(1), new Float64Array(1));
  fft(new Float64Array(2), new Float64Array(2));
});

test('freqGrid: FFT bin ordering [0..n/2-1, -n/2..-1] * 2*pi/(n*dx)', () => {
  const n = 8, dx = 0.5;
  const k = freqGrid(n, dx);
  const dk = 2 * Math.PI / (n * dx);
  assert.deepEqual(Array.from(k), [0, 1, 2, 3, -4, -3, -2, -1].map((m) => m * dk));
  assert.throws(() => freqGrid(6, 1), RangeError, 'non-power-of-2');
  assert.throws(() => freqGrid(8, 0), RangeError, 'dx = 0');
  assert.throws(() => freqGrid(8, -1), RangeError, 'dx < 0');
});
