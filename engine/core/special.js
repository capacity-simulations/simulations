// core.special — special-function evaluations for series solutions.
// Harvest sources (Sim_lab_sims/QM_sims/):
//   hermiteNorm    Harmonic_Oscillator_High_Energies.html computeWavefunction
//                  L524–584 — the STABLE normalized three-term recurrence on
//                  psi_n directly (NOT the naive H_n * 1/sqrt(2^n n!) version
//                  in Harmonic-oscillator.html, which overflows at high n).
//   assocLegendre  Spherical_harmonics_Explorer.html L247–258 (negative-m
//                  relation) reconciled with Hydrogen_atom_wavefunctions.html
//                  L259–277 (|m|-only). BOTH source recurrences include the
//                  Condon–Shortley phase (the `pmm *= -f*s` Numerical-Recipes
//                  form); condonShortley=true (engine default, per plan) is
//                  what both sims compute for m >= 0 and matches
//                  scipy.special.lpmv. For m < 0 the Explorer applies the full
//                  P_l^{-m} relation (kept here); Hydrogen substitutes |m|.
//   assocLaguerre  Hydrogen_atom_wavefunctions.html L248–257.
//   erf            2d_wavefunction_collapse_measurement.html erfApprox
//                  L1070–1083 (Abramowitz & Stegun 7.1.26; max abs error
//                  ~1.5e-7 — display/statistics grade, not quadrature grade).
// Layer 1: no physics vocabulary — indices, arguments, values.

/**
 * Normalized Hermite function
 *   hermiteNorm(n, x) = H_n(x) e^{-x^2/2} / sqrt(2^n n! sqrt(pi)),
 * evaluated by the numerically stable orthonormal recurrence
 *   f_0 = pi^{-1/4} e^{-x^2/2},  f_1 = sqrt(2) x f_0,
 *   f_{k+1} = sqrt(2/(k+1)) x f_k - sqrt(k/(k+1)) f_{k-1}.
 * Stays in [-1, 1]-scale values for any n (verified to n = 60 vs scipy);
 * the naive H_n-then-normalize route overflows/loses digits at high n.
 */
export function hermiteNorm(n, x) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`hermiteNorm: n must be a non-negative integer, got ${n}`);
  }
  const f0 = Math.pow(Math.PI, -0.25) * Math.exp((-x * x) / 2);
  if (n === 0) return f0;
  let prev = f0;
  let curr = Math.SQRT2 * x * f0;
  for (let k = 1; k < n; k++) {
    const next = Math.sqrt(2 / (k + 1)) * x * curr - Math.sqrt(k / (k + 1)) * prev;
    prev = curr;
    curr = next;
  }
  return curr;
}

/**
 * Associated Legendre function P_l^m(x), integer l >= 0, -l <= m <= l,
 * x in [-1, 1]. Returns 0 when |m| > l.
 *
 * condonShortley = true (default, plan-confirmed): includes the (-1)^m phase —
 * identical to scipy.special.lpmv and to BOTH harvest sims' recurrences for
 * m >= 0. condonShortley = false returns (-1)^m times that (phase removed,
 * for m < 0 too, i.e. divided by (-1)^{|m|}).
 * Negative m uses P_l^{-m} = (-1)^m (l-m)!/(l+m)! P_l^m (the Explorer's
 * branch; Hydrogen_atom_wavefunctions instead substitutes |m| — callers
 * needing that sim's behaviour should pass Math.abs(m) explicitly).
 */
export function assocLegendre(l, m, x, { condonShortley = true } = {}) {
  if (!Number.isInteger(l) || l < 0 || !Number.isInteger(m)) {
    throw new RangeError(`assocLegendre: l must be a non-negative integer and m an integer, got l=${l}, m=${m}`);
  }
  const am = Math.abs(m);
  if (am > l) return 0;

  // Numerical-Recipes upward recurrence for P_am^am .. P_l^am (CS phase built in).
  let pmm = 1;
  if (am > 0) {
    const s = Math.sqrt(Math.max(0, (1 - x) * (1 + x)));
    let f = 1;
    for (let i = 1; i <= am; i++) {
      pmm *= -f * s;
      f += 2;
    }
  }
  let p;
  if (l === am) {
    p = pmm;
  } else {
    let pmmp1 = x * (2 * am + 1) * pmm;
    if (l === am + 1) {
      p = pmmp1;
    } else {
      let pll = 0;
      for (let ll = am + 2; ll <= l; ll++) {
        pll = ((2 * ll - 1) * x * pmmp1 - (ll + am - 1) * pmm) / (ll - am);
        pmm = pmmp1;
        pmmp1 = pll;
      }
      p = pll;
    }
  }

  if (m < 0) {
    // P_l^{-am} = (-1)^{am} (l-am)!/(l+am)! P_l^{am}; ratio as a running
    // product 1/((l-am+1)...(l+am)) to avoid factorial overflow.
    let ratio = 1;
    for (let i = l - am + 1; i <= l + am; i++) ratio /= i;
    p *= (am % 2 === 0 ? 1 : -1) * ratio;
  }
  if (!condonShortley && am % 2 === 1) p = -p;
  return p;
}

/**
 * Generalized (associated) Laguerre polynomial L_n^{(k)}(x) by the standard
 * three-term recurrence; matches scipy.special.genlaguerre(n, k)(x).
 * n is the degree (>= 0 integer); k the order parameter.
 */
export function assocLaguerre(n, k, x) {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`assocLaguerre: n must be a non-negative integer, got ${n}`);
  }
  if (n === 0) return 1;
  if (n === 1) return 1 + k - x;
  let Lp = 1;
  let Lc = 1 + k - x;
  for (let i = 1; i < n; i++) {
    const Ln = ((2 * i + 1 + k - x) * Lc - (i + k) * Lp) / (i + 1);
    Lp = Lc;
    Lc = Ln;
  }
  return Lc;
}

/**
 * Error function erf(x), Abramowitz & Stegun 7.1.26 rational approximation.
 * Max absolute error ~1.5e-7 over all x (odd in x; -> +/-1 for large |x|).
 * Adequate for cumulative-mass and display metrics; not for high-precision
 * quadrature.
 */
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const p = 0.3275911;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);
  return sign * y;
}
