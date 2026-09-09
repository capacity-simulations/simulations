// core.scale — linear mapping, clamping, and number formatting.
// Harvest sources: ~12 inline linear-map copies across QM_sims (collapsed to one
// factory); fmt from Sim_lab_sims/CM_sims/Collisions.html (-0-safe, U+2212 minus).
// Layer 1: no physics vocabulary — operates on domains, ranges, and values.

const MINUS = '−';

/**
 * Linear map from [d0,d1] to [r0,r1] with inversion.
 * makeScale([0,10],[0,500]) -> s ; s(5)=250 ; s.invert(250)=5
 */
export function makeScale(domain, range) {
  const [d0, d1] = domain, [r0, r1] = range;
  const k = (r1 - r0) / (d1 - d0);
  const s = (x) => r0 + (x - d0) * k;
  s.invert = (y) => d0 + (y - r0) / k;
  s.domain = [d0, d1];
  s.range = [r0, r1];
  return s;
}

export function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Format a number for display: fixed digits, trailing zeros trimmed,
 * "-0.000" scrubbed to "0", true minus sign (U+2212).
 */
export function fmt(x, digits = 2) {
  if (!Number.isFinite(x)) return String(x);
  let s = x.toFixed(digits);
  if (digits > 0) s = s.replace(/\.?0+$/, '');
  if (s === '-0' || s === '' || s === '-') s = '0';
  return s.replace('-', MINUS);
}
