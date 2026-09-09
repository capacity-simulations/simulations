// canvas.ticks — nice tick placement and tick-label formatting for axes.
// Harvest source: Sim_lab_sims/QM_sims/Single_Gaussian_plot.html genTicks
// (1/2/5×10ⁿ step selection, dedupe, degenerate-range guard) plus its inline
// tick-label formatting, generalized to any range. Canvas layer: numbers only.

const MINUS = '−';

/**
 * Nice tick positions covering [min, max], roughly approxN of them.
 * Steps are 1, 2, or 5 × 10ⁿ; result is deduped and ascending.
 * Degenerate range (max ≈ min) returns [min].
 */
export function niceTicks(min, max, approxN = 8) {
  if (max - min < 1e-12) return [min];
  const range = max - min, raw = range / approxN;
  const mag = Math.pow(10, Math.floor(Math.log10(raw))), r2 = raw / mag;
  let step;
  if (r2 <= 1.5) step = mag;
  else if (r2 <= 3.5) step = 2 * mag;
  else if (r2 <= 7.5) step = 5 * mag;
  else step = 10 * mag;
  const ticks = [];
  let s = Math.ceil(min / step) * step;
  for (; s <= max + step * 0.01; s += step) {
    if (s >= min - step * 0.01 && s <= max + step * 0.01) ticks.push(Math.round(s / step) * step);
  }
  const seen = new Set();
  return ticks.filter((t) => { if (seen.has(t)) return false; seen.add(t); return true; });
}

/**
 * Format one tick value for the axis, given the full axis range:
 * near-zero → "0"; wide ranges → 0–1 decimals; narrow ranges → enough decimals
 * to distinguish neighbors (uniform per axis); true minus sign (U+2212).
 */
export function tickLabel(v, range) {
  if (!Number.isFinite(v)) return String(v);
  const r = Math.abs(range) || 1;
  if (Math.abs(v) < r * 1e-9) return '0';
  let s;
  if (r > 2) {
    s = Math.abs(v) >= 10 ? String(Math.round(v)) : v.toFixed(1);
  } else {
    const d = Math.max(2, Math.min(6, Math.ceil(-Math.log10(r)) + 2));
    s = v.toFixed(d);
  }
  return s.replace('-', MINUS);
}
