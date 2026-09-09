// canvas.arrow — one arrow glyph replacing 13 incompatible signatures across
// the corpus. Harvest source: Sim_lab_sims/CM_sims/L4-Forces on objects
// explorer.html arrow() (best head geometry of the 6 CM variants + the
// off-canvas truncation glyph), converted to an endpoint-based signature.
// Canvas layer: pixels and directions only.

/**
 * Draw an arrow from (x0, y0) to (x1, y1).
 * opts: {color, width=2, head=8 (head length px), dash (array), alpha,
 * clip:{w,h} (canvas CSS size; the tip is pulled inside a 6 px margin and a
 * double-tick truncation glyph marks the shortening)}.
 * Returns {ex, ey, clipped} (actual tip — feed to callout), or null if the
 * arrow is under 1 px long (nothing drawn).
 */
export function drawArrow(ctx, x0, y0, x1, y1, opts = {}) {
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const color = opts.color || '#e2e8f0';
  const width = opts.width != null ? opts.width : 2;
  let ex = x1, ey = y1, clipped = false;
  if (opts.clip) {
    const M = 6;
    const tFor = (p0, d, lo, hi) => (d > 1e-9 ? (hi - p0) / d : d < -1e-9 ? (lo - p0) / d : Infinity);
    const t = Math.max(0.05, Math.min(1,
      tFor(x0, dx, M, opts.clip.w - M),
      tFor(y0, dy, M, opts.clip.h - M)));
    clipped = t < 0.999;
    ex = x0 + dx * t;
    ey = y0 + dy * t;
  }
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
  if (opts.dash) ctx.setLineDash(opts.dash);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.setLineDash([]);
  const a = Math.atan2(ey - y0, ex - x0);
  const hs = opts.head != null ? opts.head : 8;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - hs * Math.cos(a - 0.42), ey - hs * Math.sin(a - 0.42));
  ctx.lineTo(ex - hs * Math.cos(a + 0.42), ey - hs * Math.sin(a + 0.42));
  ctx.closePath();
  ctx.fill();
  if (clipped) {
    const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
    ctx.lineWidth = 2;
    for (const o of [14, 20]) {
      ctx.beginPath();
      ctx.moveTo(ex - ux * o + px * 5, ey - uy * o + py * 5);
      ctx.lineTo(ex - ux * o - px * 5, ey - uy * o - py * 5);
      ctx.stroke();
    }
  }
  ctx.restore();
  return { ex, ey, clipped };
}
