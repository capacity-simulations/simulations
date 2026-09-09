// core.fft — in-place radix-2 Cooley–Tukey FFT on split re/im arrays.
// Harvest source (Sim_lab_sims/QM_sims/):
//   fft       Quantum_Tunneling_Gaussian_Wave.html L1187–1238 (the better-
//             commented of the two byte-identical copies; the other lives in
//             Classical-vs-schrodinger-ANHARMONIC.html L886).
//   FIX AT HARVEST: both source copies silently corrupt data when n is not a
//             power of 2 (Math.log2 truncation makes bit reversal wrong);
//             the engine copy throws RangeError instead.
//   freqGrid  factors the k-grid derivation re-inlined per FFT sim.
// Layer 1: no physics vocabulary — samples, bins, frequencies.

/**
 * In-place radix-2 FFT of the complex array (re + i*im).
 * Forward transform: X[k] = sum_j x[j] e^{-2*pi*i*j*k/n} (no scaling).
 * inverse = true applies e^{+...} and divides by n, so
 * fft(re, im); fft(re, im, true) restores the input.
 * n = re.length must be a power of 2 (and > 0) — throws RangeError otherwise.
 */
export function fft(re, im, inverse = false) {
  const n = re.length;
  if (!Number.isInteger(n) || n <= 0 || (n & (n - 1)) !== 0) {
    throw new RangeError(`fft: length must be a positive power of 2, got ${n} — pad or regrid`);
  }
  if (im.length !== n) {
    throw new RangeError('fft: re and im must have the same length');
  }
  const bits = Math.log2(n);

  // Bit reversal
  for (let i = 0; i < n; i++) {
    let j = 0;
    for (let k = 0; k < bits; k++) {
      j = (j << 1) | ((i >> k) & 1);
    }
    if (j > i) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  // Cooley–Tukey butterflies
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = (inverse ? 2 : -2) * Math.PI / size;
    const wReal = Math.cos(angle);
    const wImag = Math.sin(angle);

    for (let i = 0; i < n; i += size) {
      let wr = 1, wi = 0;
      for (let j = 0; j < halfSize; j++) {
        const idx1 = i + j;
        const idx2 = i + j + halfSize;

        const tr = wr * re[idx2] - wi * im[idx2];
        const ti = wr * im[idx2] + wi * re[idx2];

        re[idx2] = re[idx1] - tr;
        im[idx2] = im[idx1] - ti;
        re[idx1] = re[idx1] + tr;
        im[idx1] = im[idx1] + ti;

        const newWr = wr * wReal - wi * wImag;
        wi = wr * wImag + wi * wReal;
        wr = newWr;
      }
    }
  }

  // Normalize for inverse FFT
  if (inverse) {
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] /= n;
    }
  }
}

/**
 * Angular-frequency grid matching this fft's output bin ordering:
 *   [0, 1, ..., n/2-1, -n/2, ..., -1] * 2*pi / (n * dx)
 * dx is the sample spacing of the input array. Returns a Float64Array;
 * bin k of fft output oscillates as e^{i * freqGrid(n,dx)[k] * x}.
 * Same power-of-2 requirement as fft.
 */
export function freqGrid(n, dx) {
  if (!Number.isInteger(n) || n <= 0 || (n & (n - 1)) !== 0) {
    throw new RangeError(`freqGrid: length must be a positive power of 2, got ${n}`);
  }
  if (!(dx > 0) || !Number.isFinite(dx)) {
    throw new RangeError('freqGrid: dx must be a positive finite number');
  }
  const out = new Float64Array(n);
  const dk = (2 * Math.PI) / (n * dx);
  const half = n / 2;
  for (let i = 0; i < half; i++) out[i] = i * dk;
  for (let i = half; i < n; i++) out[i] = (i - n) * dk;
  return out;
}
