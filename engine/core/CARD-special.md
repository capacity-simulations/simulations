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
