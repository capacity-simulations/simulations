// canvas.fit — DPR-aware canvas backing-store sizing.
// Harvest sources: Sim_lab_sims/CM_sims/L6-The harmonic oscillator.html fit()
// (setTransform reset before scale — fixes the cumulative-DPR bug) merged with
// Sim_lab_sims/SR_sims/L09-s1-worldline-length-and-proper-time-shell.html fit()
// (Math.max(1, …) zero-size guard). Canvas layer: pixels and rectangles only.

/**
 * Size a canvas's backing store to its CSS box × devicePixelRatio, reset the
 * context transform, and scale so 1 drawing unit = 1 CSS pixel.
 * Call at the top of every draw; returns the CSS-pixel size {w, h}.
 */
export function fit(canvas, ctx) {
  const dpr = globalThis.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(r.width * dpr));
  const h = Math.max(1, Math.floor(r.height * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return { w: r.width, h: r.height };
}
