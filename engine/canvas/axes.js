// canvas.axes — axis frame/grid/tick rendering and a clipped strip chart.
// Harvest sources: Sim_lab_sims/CM_sims/L4-Projectile motion.html drawPlot
// (grid + tick-label + axis-label + frame structure, generalized to any view)
// and Sim_lab_sims/CM_sims/L17-The damped HO.html draw() (chart frame,
// clip-rect, multi-series polylines with tip markers), simplified to a
// reusable component. Canvas layer: values, series, and pixels only.

import { niceTicks, tickLabel } from './ticks.js';
import { textBox } from './label.js';

/**
 * Draw grid, ticks, tick labels, axis labels, and frame for a view
 * (from canvas.scale makeView).
 * opts: {xLabel, yLabel, xTicks=8, yTicks=5 (approx counts), grid=true,
 * frame=true, gridColor, frameColor, tickColor, font}.
 */
export function drawAxes(ctx, view, opts = {}) {
  const wd = view.world;
  const [xL, yT] = view.toPx(wd.x0, wd.y1);
  const [xR, yB] = view.toPx(wd.x1, wd.y0);
  const grid = opts.grid !== false;
  const gridColor = opts.gridColor || 'rgba(148,163,184,.28)';
  const tickColor = opts.tickColor || '#cbd5e1';
  const font = opts.font || '11px system-ui,sans-serif';
  const xRange = wd.x1 - wd.x0, yRange = wd.y1 - wd.y0;
  ctx.lineWidth = 1;
  for (const x of niceTicks(wd.x0, wd.x1, opts.xTicks || 8)) {
    const [px] = view.toPx(x, wd.y0);
    if (grid) {
      ctx.strokeStyle = gridColor;
      ctx.beginPath(); ctx.moveTo(px, yT); ctx.lineTo(px, yB); ctx.stroke();
    }
    textBox(ctx, tickLabel(x, xRange), px, yB + 5, { anchor: 'n', color: tickColor, font });
  }
  for (const y of niceTicks(wd.y0, wd.y1, opts.yTicks || 5)) {
    const [, py] = view.toPx(wd.x0, y);
    if (grid) {
      ctx.strokeStyle = gridColor;
      ctx.beginPath(); ctx.moveTo(xL, py); ctx.lineTo(xR, py); ctx.stroke();
    }
    textBox(ctx, tickLabel(y, yRange), xL - 5, py, { anchor: 'e', color: tickColor, font });
  }
  if (opts.frame !== false) {
    ctx.strokeStyle = opts.frameColor || 'rgba(203,213,225,.4)';
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);
  }
  if (opts.xLabel) textBox(ctx, opts.xLabel, xR, yB + 18, { anchor: 'ne', color: tickColor, font });
  if (opts.yLabel) textBox(ctx, opts.yLabel, xL, yT - 4, { anchor: 'sw', color: tickColor, font });
}

/**
 * Rolling multi-series chart: push samples, draw polylines clipped to the
 * view's plot rect with a dot at each series tip.
 * series: [{color, width=2}] — one entry per y-stream.
 * push(t, ...ys) appends one sample per series; oldest samples are dropped
 * beyond maxPoints. draw(ctx, view) maps (t, y) through the view.
 */
export function makeStripChart({ maxPoints = 2000, series = [] } = {}) {
  const ts = [];
  const ys = series.map(() => []);
  return {
    push(t, ...vals) {
      ts.push(t);
      for (let i = 0; i < ys.length; i++) ys[i].push(vals[i]);
      while (ts.length > maxPoints) {
        ts.shift();
        for (const a of ys) a.shift();
      }
    },
    clear() {
      ts.length = 0;
      for (const a of ys) a.length = 0;
    },
    get length() { return ts.length; },
    draw(ctx, view) {
      if (!ts.length) return;
      const wd = view.world;
      const [xL, yT] = view.toPx(wd.x0, wd.y1);
      const [xR, yB] = view.toPx(wd.x1, wd.y0);
      ctx.save();
      ctx.beginPath(); ctx.rect(xL, yT, xR - xL, yB - yT); ctx.clip();
      for (let si = 0; si < series.length; si++) {
        const s = series[si], a = ys[si];
        ctx.strokeStyle = s.color || '#38bdf8';
        ctx.lineWidth = s.width != null ? s.width : 2;
        ctx.beginPath();
        for (let i = 0; i < ts.length; i++) {
          const [px, py] = view.toPx(ts[i], a[i]);
          if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
        }
        ctx.stroke();
        const [tx, ty] = view.toPx(ts[ts.length - 1], a[a.length - 1]);
        ctx.fillStyle = s.color || '#38bdf8';
        ctx.beginPath(); ctx.arc(tx, ty, 3.5, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    },
  };
}
