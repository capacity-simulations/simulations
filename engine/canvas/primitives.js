// canvas.primitives — small shared path/glyph/style helpers.
// Harvest sources: Sim_lab_sims/CM_sims/L35-Orbits.html roundRect (most
// parameterized of the ~22 inline copies), Sim_lab_sims/CM_sims/L36-Scattering
// Extension.html css() (the only cssVar with a fallback), Sim_lab_sims/CM_sims/
// L6-The harmonic oscillator.html diamond(); dashLine factors out the
// setLineDash idiom repeated across the corpus. Canvas layer: shapes only.

/**
 * Rounded-rectangle path; opts.fill / opts.stroke may be true (use the
 * context's current style) or a style string (set it, then paint).
 */
export function roundRect(ctx, x, y, w, h, r, opts = {}) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (opts.fill) { if (typeof opts.fill === 'string') ctx.fillStyle = opts.fill; ctx.fill(); }
  if (opts.stroke) { if (typeof opts.stroke === 'string') ctx.strokeStyle = opts.stroke; ctx.stroke(); }
}

/**
 * Dashed line segment; dash state is saved/restored so it never leaks.
 * opts: {color, width, dash=[5,4], alpha}.
 */
export function dashLine(ctx, x0, y0, x1, y1, opts = {}) {
  ctx.save();
  if (opts.color) ctx.strokeStyle = opts.color;
  if (opts.width != null) ctx.lineWidth = opts.width;
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.setLineDash(opts.dash || [5, 4]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

/**
 * Read a CSS custom property from :root, with a fallback when it is unset
 * (or when no DOM exists, e.g. under node tests).
 */
export function cssVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const s = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return s || fallback;
}

/**
 * Diamond glyph centered at (x, y) with half-diagonal r; opts.fill /
 * opts.stroke as in roundRect.
 */
export function diamond(ctx, x, y, r, opts = {}) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
  if (opts.fill) { if (typeof opts.fill === 'string') ctx.fillStyle = opts.fill; ctx.fill(); }
  if (opts.stroke) { if (typeof opts.stroke === 'string') ctx.strokeStyle = opts.stroke; ctx.stroke(); }
}
