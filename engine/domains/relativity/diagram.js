// domain.relativity-diagram — the spacetime-diagram toolkit (namespace
// Engine.relDiagram). Canvas-facing companion to domain.relativity: draws
// axes/grids/light cones/worldlines/events in a DECLARED frame and provides
// the pure geometry (calibration ticks, clipping, normalization, pair
// classification, drag state machine) node-testably. c = 1: world coords are
// (x, ct) with ct up; screen mapping comes from a canvas.scale makeView.
//
// Harvest per domains/relativity/DIAGRAM-HARVEST.md (user ruling: the -new
// trio is live; -shell code is physics-reviewed and harvested where richer):
//   drawSGrid / drawSAxes      -new/L05:364,366 (four-quadrant, NOT the
//                              -shell bottom-pinned frame)
//   drawPrimeGrid              -new/L18:366 (γ-spaced; sole source)
//   drawPrimeAxes + ticks      -new/L18:369 (tilted axes; hyperbola
//                              calibration ticks at (γk, γβk) / (γβk, γk))
//   primeTickPositions         the tick math of -new/L18:369 factored PURE
//   drawLightCone              -new/L18:370 (filled future wedge + dashed 45°
//                              lines) wrapped in rect/clip per -shell:896-913
//   clipSegment                -shell:850-860 Liang–Barsky (no equivalent in
//                              the canvas layer; -new rayExit was origin-only)
//   normalizeWorldline         -shell:780-787 normalizeWL + 799-804
//                              addWorldline (time-forward ordering — fixes
//                              the -new v/c sign bug), + x tie-break
//   drawWorldline              -shell:946-970 drawWorldlines (superluminal
//                              dashing + ⚠ label, endpoint handles, clipped)
//   drawEventMarker            -new/L05:372 marker + -shell:1059-1084 radial
//                              label placement (direction from origin)
//   classifyPair               -new/L18:356-358 interval/classify/order with
//                              fix #10: thresholds RELATIVE to the snap grid
//                              (source baked |ds²|<0.035, |cΔt|<0.015 — the
//                              values for snapUnit 0.25, kept as ratios)
//   makeDraggableEvents        -shell:1095-1155 (nearest-match hit-testing,
//                              4px click-vs-drag threshold, long-press +
//                              right-click delete, pointer capture) with
//                              -shell's snap-on-drop feel (continuous drag,
//                              round at pointer-up) and injectable element/
//                              timers so node drives it with synthetic events
// Fixes applied at harvest (see DIAGRAM-HARVEST.md): #2 the S′ path is a live
// export (was unreachable in -new/L05), #4 time-forward v/c, #6 ONE clamp
// source (view.world — no baked ±5.5/±8), #7 every primitive clips to the
// viewport, #8 nearest-event hit-testing, #10 snap-relative thresholds.
// Content (event lists, presets, copy) is a SIM parameter, never module state
// (fix #3); the module never reads the DOM or theme — colors come in as opts
// (fix #11 lives sim-side: pass beta explicitly on every call, no hidden v).

import { gamma, interval } from './index.js';
import { clamp } from '../../core/scale.js';
import { textBox } from '../../canvas/label.js';
import { dashLine } from '../../canvas/primitives.js';

/* ---------- small local helpers (no exports) ---------- */

function strokeLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.save();
  if (color) ctx.strokeStyle = color;
  if (width != null) ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.restore();
}

/* Signed v/c formatting of the source sims (fmtV): +0.00 / −0.75 / ∞. */
function fmtV(v) {
  if (!Number.isFinite(v)) return '∞';
  const r = Math.round(v * 100) / 100;
  return (r < 0 ? '−' : '+') + Math.abs(r).toFixed(2);
}

/* Clip the px-space plot rect of a view (used to fence filled shapes). */
function clipToView(ctx, view) {
  const b = view.world;
  const [px0, py0] = view.toPx(b.x0, b.y1);   // top-left (world y up)
  const [px1, py1] = view.toPx(b.x1, b.y0);   // bottom-right
  ctx.beginPath(); ctx.rect(px0, py0, px1 - px0, py1 - py0); ctx.clip();
}

/* ---------- pure geometry ---------- */

/**
 * Hyperbola calibration ticks for the tilted S′ axes (PURE, world coords).
 * Ticks mark proper unit intervals: on the x′ axis at (γk, γβk), on the ct′
 * axis at (γβk, γk), k = ±1..±kMax — each satisfies x² − ct² = ±k² exactly
 * (the invariant hyperbolae through the S ticks). Throws via gamma for
 * |beta| >= 1. Returns {xAxis: [{k, x, ct}...], ctAxis: [{k, x, ct}...]}.
 */
export function primeTickPositions(beta, kMax = 5) {
  const g = gamma(beta);
  const xAxis = [], ctAxis = [];
  for (let n = 1; n <= kMax; n++) {
    for (const k of [-n, n]) {
      xAxis.push({ k, x: g * k, ct: g * beta * k });
      ctAxis.push({ k, x: g * beta * k, ct: g * k });
    }
  }
  return { xAxis, ctAxis };
}

/**
 * Liang–Barsky clip of the segment (x1,y1)-(x2,y2) to box {x0,y0,x1,y1}
 * (x0<x1, y0<y1, any 2D coords). opts.extend clips the INFINITE line through
 * the two points instead (the -shell worldline behaviour). Returns
 * {x1,y1,x2,y2} ordered along the input direction, or null when nothing is
 * inside. A degenerate (point) input returns the point if inside, else null.
 */
export function clipSegment(x1, y1, x2, y2, box, opts = {}) {
  const dx = x2 - x1, dy = y2 - y1;
  if (Math.abs(dx) < 1e-12 && Math.abs(dy) < 1e-12) {
    const inside = x1 >= box.x0 - 1e-12 && x1 <= box.x1 + 1e-12 &&
                   y1 >= box.y0 - 1e-12 && y1 <= box.y1 + 1e-12;
    return inside ? { x1, y1, x2, y2 } : null;
  }
  let t0 = opts.extend ? -Infinity : 0;
  let t1 = opts.extend ? Infinity : 1;
  const cs = [[-dx, x1 - box.x0], [dx, box.x1 - x1], [-dy, y1 - box.y0], [dy, box.y1 - y1]];
  for (const [p, q] of cs) {
    if (Math.abs(p) < 1e-12) { if (q < 0) return null; }
    else {
      const r = q / p;
      if (p < 0) { if (r > t0) t0 = r; }
      else { if (r < t1) t1 = r; }
    }
  }
  if (t0 > t1) return null;
  return { x1: x1 + t0 * dx, y1: y1 + t0 * dy, x2: x1 + t1 * dx, y2: y1 + t1 * dy };
}

/**
 * Time-forward normalization of a worldline given as two clicked endpoints
 * {x, ct} in ANY order (fix #4: the -new files computed v/c in click order,
 * flipping its sign). Orders by ct ascending (ties by x, so the result is
 * click-order invariant even for simultaneous endpoints). Returns
 * {x1, ct1, x2, ct2, v, superluminal}: v = dx/dct time-forward (Infinity for
 * a simultaneous pair, NaN for a degenerate point); superluminal per the
 * -shell guard |v| > 1 + 1e-9.
 */
export function normalizeWorldline(p1, p2) {
  let a = p1, b = p2;
  if (b.ct < a.ct || (b.ct === a.ct && b.x < a.x)) { const t = a; a = b; b = t; }
  const dct = b.ct - a.ct, dx = b.x - a.x;
  const v = dct === 0 ? (dx === 0 ? NaN : Infinity) : dx / dct;
  return {
    x1: a.x, ct1: a.ct, x2: b.x, ct2: b.ct, v,
    superluminal: Math.abs(v) > 1 + 1e-9,
  };
}

/**
 * Classify a pair of events {x, ct} (interval + temporal order) with
 * thresholds RELATIVE to the snap grid (fix #10). opts.snapUnit (default
 * 0.25, the -new sims' grid) scales both: lightlikeEps = 0.56·snapUnit²
 * and simultaneityEps = 0.06·snapUnit — exactly the source's tuned 0.035 /
 * 0.015 at snapUnit 0.25. Returns {dct, dx, ds2, kind, order} with kind
 * 'timelike'|'spacelike'|'lightlike' and order 'simultaneous'|'e1-first'|
 * 'e2-first' (a frame-DEPENDENT statement for spacelike pairs — label it
 * with its frame).
 */
export function classifyPair(e1, e2, opts = {}) {
  const snapUnit = opts.snapUnit != null ? opts.snapUnit : 0.25;
  const dct = e2.ct - e1.ct, dx = e2.x - e1.x;
  const { ds2, kind } = interval(dct, dx, { lightlikeEps: 0.56 * snapUnit * snapUnit });
  const tEps = 0.06 * snapUnit;
  const order = Math.abs(dct) <= tEps ? 'simultaneous' : dct > 0 ? 'e1-first' : 'e2-first';
  return { dct, dx, ds2, kind, order };
}

/* ---------- drawing (all take ctx + a canvas.scale view; all clipped) ---------- */

/**
 * Unit grid of the S frame across the view box. opts: {color, width, step}.
 */
export function drawSGrid(ctx, view, opts = {}) {
  const b = view.world;
  const color = opts.color || 'rgba(148,163,184,.20)';
  const width = opts.width != null ? opts.width : 1;
  const step = opts.step || 1;
  for (let gx = Math.ceil(b.x0 / step) * step; gx <= b.x1 + 1e-9; gx += step) {
    strokeLine(ctx, ...view.toPx(gx, b.y0), ...view.toPx(gx, b.y1), color, width);
  }
  for (let gy = Math.ceil(b.y0 / step) * step; gy <= b.y1 + 1e-9; gy += step) {
    strokeLine(ctx, ...view.toPx(b.x0, gy), ...view.toPx(b.x1, gy), color, width);
  }
}

/**
 * Four-quadrant S axes through the origin with integer tick marks, numeric
 * labels, and 'x' / 'ct' axis labels (-new sAxes; negative-ct supported).
 * opts: {color, tickColor, font, labelFont, labels=true}.
 */
export function drawSAxes(ctx, view, opts = {}) {
  const b = view.world;
  const axis = opts.color || '#cbd5e1';
  const tick = opts.tickColor || '#94a3b8';
  const hasX = b.y0 <= 0 && b.y1 >= 0;   // the x axis lives at ct = 0
  const hasCt = b.x0 <= 0 && b.x1 >= 0;  // the ct axis lives at x = 0
  if (hasX) strokeLine(ctx, ...view.toPx(b.x0, 0), ...view.toPx(b.x1, 0), axis, 1.8);
  if (hasCt) strokeLine(ctx, ...view.toPx(0, b.y0), ...view.toPx(0, b.y1), axis, 1.8);
  ctx.save();
  ctx.fillStyle = tick;
  ctx.font = opts.font || '600 10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  if (hasX) {
    for (let i = Math.ceil(b.x0); i <= b.x1 + 1e-9; i++) {
      if (!i) continue;
      const [px, py] = view.toPx(i, 0);
      strokeLine(ctx, px, py - 3, px, py + 3, tick, 1);
      ctx.fillText(String(i), px - 4, py + 15);
    }
  }
  if (hasCt) {
    for (let i = Math.ceil(b.y0); i <= b.y1 + 1e-9; i++) {
      if (!i) continue;
      const [px, py] = view.toPx(0, i);
      strokeLine(ctx, px - 3, py, px + 3, py, tick, 1);
      ctx.fillText(String(i), px + 7, py + 3);
    }
  }
  ctx.restore();
  if (opts.labels !== false) {
    const fontOpts = { color: axis, font: opts.labelFont, bg: opts.labelBg };
    if (hasX) textBox(ctx, 'x', view.toPx(b.x1, 0)[0] - 14, view.toPx(b.x1, 0)[1] - 16, fontOpts);
    if (hasCt) textBox(ctx, 'ct', view.toPx(0, b.y1)[0] + 8, view.toPx(0, b.y1)[1] + 4, fontOpts);
  }
}

/**
 * γ-spaced grid of the S′ frame (frame velocity beta as seen in S): dashed
 * lines of constant ct′ (ct = βx + k/γ) and constant x′ (x = βct + k/γ) at
 * unit S′ spacing, generated to exactly cover — and clipped to — the view
 * box (fixes #6/#7; the source drew a fixed ±7 set to extent 10 unclipped).
 * opts: {color, width, dash}.
 */
export function drawPrimeGrid(ctx, view, beta, opts = {}) {
  const g = gamma(beta);
  const b = view.world;
  const color = opts.color || 'rgba(45,212,191,.52)';
  const width = opts.width != null ? opts.width : 1.2;
  const dash = opts.dash || [3, 4];
  const corners = [[b.x0, b.y0], [b.x0, b.y1], [b.x1, b.y0], [b.x1, b.y1]];
  const draw = (seg) => {
    if (seg) dashLine(ctx, ...view.toPx(seg.x1, seg.y1), ...view.toPx(seg.x2, seg.y2), { color, width, dash });
  };
  let lo = Infinity, hi = -Infinity;   // constant-ct′ lines: ct − βx = k/γ
  for (const [cx, cy] of corners) { const q = cy - beta * cx; if (q < lo) lo = q; if (q > hi) hi = q; }
  for (let k = Math.ceil(lo * g); k <= Math.floor(hi * g); k++) {
    const q = k / g;
    draw(clipSegment(b.x0, beta * b.x0 + q, b.x1, beta * b.x1 + q, b, { extend: true }));
  }
  lo = Infinity; hi = -Infinity;       // constant-x′ lines: x − βct = k/γ
  for (const [cx, cy] of corners) { const q = cx - beta * cy; if (q < lo) lo = q; if (q > hi) hi = q; }
  for (let k = Math.ceil(lo * g); k <= Math.floor(hi * g); k++) {
    const q = k / g;
    draw(clipSegment(beta * b.y0 + q, b.y0, beta * b.y1 + q, b.y1, b, { extend: true }));
  }
}

/**
 * Tilted S′ axes (ct′: x = βct; x′: ct = βx) through the origin, clipped to
 * the view, with hyperbola calibration ticks (primeTickPositions) and ct′/x′
 * labels at the positive-direction viewport exit (-new primeAxes; the rayExit
 * label anchor is clipSegment's forward endpoint here). Ticks/labels are
 * suppressed below opts.tickMinBeta (default 0.02) where S′ ≈ S.
 * opts: {color, kMax=5, tickMinBeta, labels=true, font}.
 */
export function drawPrimeAxes(ctx, view, beta, opts = {}) {
  const b = view.world;
  const c = opts.color || '#2dd4bf';
  const ct = clipSegment(beta * b.y0, b.y0, beta * b.y1, b.y1, b, { extend: true });
  if (ct) strokeLine(ctx, ...view.toPx(ct.x1, ct.y1), ...view.toPx(ct.x2, ct.y2), c, 2.2);
  const xa = clipSegment(b.x0, beta * b.x0, b.x1, beta * b.x1, b, { extend: true });
  if (xa) strokeLine(ctx, ...view.toPx(xa.x1, xa.y1), ...view.toPx(xa.x2, xa.y2), c, 2.2);
  const minBeta = opts.tickMinBeta != null ? opts.tickMinBeta : 0.02;
  if (Math.abs(beta) <= minBeta) return;
  const ticks = primeTickPositions(beta, opts.kMax != null ? opts.kMax : 5);
  ctx.save();
  ctx.fillStyle = c;
  for (const t of ticks.xAxis.concat(ticks.ctAxis)) {
    if (t.x < b.x0 || t.x > b.x1 || t.ct < b.y0 || t.ct > b.y1) continue;
    const [px, py] = view.toPx(t.x, t.ct);
    ctx.fillRect(px - 2.3, py - 2.3, 4.6, 4.6);
  }
  ctx.restore();
  if (opts.labels !== false) {
    const lblOpts = { color: c, font: opts.font, bg: true };
    const ctEnd = clipSegment(0, 0, beta, 1, b, { extend: true });
    const xEnd = clipSegment(0, 0, 1, beta, b, { extend: true });
    if (ctEnd) {
      const [px, py] = view.toPx(ctEnd.x2, ctEnd.y2);
      textBox(ctx, 'ct′', px + (beta >= 0 ? 8 : -24), py + 8, lblOpts);
    }
    if (xEnd) {
      const [px, py] = view.toPx(xEnd.x2, xEnd.y2);
      textBox(ctx, 'x′', px - 20, py + (beta >= 0 ? 12 : -24), lblOpts);
    }
  }
}

/**
 * Light cone anchored at event {x, ct} (null/omitted → origin): dashed 45°
 * lines through the event, plus the filled future wedge when
 * opts.filledFuture. The whole cone is fenced by a px-space clip of the view
 * rect (the -shell rect/clip fix — the -new version drew past the plot).
 * opts: {filledFuture, color, fillStyle, dash}.
 */
export function drawLightCone(ctx, view, event, opts = {}) {
  const e = event || { x: 0, ct: 0 };
  const b = view.world;
  const color = opts.color || 'rgba(250,204,21,.82)';
  const dash = opts.dash || [6, 5];
  const reach = (b.x1 - b.x0) + (b.y1 - b.y0);   // beyond any corner from any interior point
  ctx.save();
  clipToView(ctx, view);
  if (opts.filledFuture) {
    ctx.fillStyle = opts.fillStyle || 'rgba(250,204,21,.055)';
    ctx.beginPath();
    ctx.moveTo(...view.toPx(e.x, e.ct));
    ctx.lineTo(...view.toPx(e.x - reach, e.ct + reach));
    ctx.lineTo(...view.toPx(e.x + reach, e.ct + reach));
    ctx.closePath();
    ctx.fill();
  }
  dashLine(ctx, ...view.toPx(e.x - reach, e.ct - reach), ...view.toPx(e.x + reach, e.ct + reach),
    { color, width: 1.5, dash });
  dashLine(ctx, ...view.toPx(e.x - reach, e.ct + reach), ...view.toPx(e.x + reach, e.ct - reach),
    { color, width: 1.5, dash });
  ctx.restore();
}

/**
 * Draw one worldline from two endpoints {x, ct} (any click order — always
 * normalized first, fix #4) clipped to the view. Superluminal lines render
 * dashed with an '⚠ |v|>c' warning appended to the v/c label. opts:
 * {color, width, name (label prefix), label=true, handles=true,
 * extend (clip the infinite line, -shell style)}. Returns the
 * normalizeWorldline record so callers can read v/superluminal.
 */
export function drawWorldline(ctx, view, p1, p2, opts = {}) {
  const wl = normalizeWorldline(p1, p2);
  const b = view.world;
  const color = opts.color || '#2dd4bf';
  const seg = clipSegment(wl.x1, wl.ct1, wl.x2, wl.ct2, b, { extend: !!opts.extend });
  if (!seg) return wl;
  const [X1, Y1] = view.toPx(seg.x1, seg.y1);
  const [X2, Y2] = view.toPx(seg.x2, seg.y2);
  if (wl.superluminal) {
    dashLine(ctx, X1, Y1, X2, Y2, { color, width: opts.width != null ? opts.width : 2.5, dash: [7, 5] });
  } else {
    strokeLine(ctx, X1, Y1, X2, Y2, color, opts.width != null ? opts.width : 2.5);
  }
  if (opts.handles !== false) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (const [hx, hct] of [[wl.x1, wl.ct1], [wl.x2, wl.ct2]]) {
      if (hx < b.x0 || hx > b.x1 || hct < b.y0 || hct > b.y1) continue;
      const [px, py] = view.toPx(hx, hct);
      ctx.beginPath(); ctx.rect(px - 4, py - 4, 8, 8); ctx.stroke();
    }
    ctx.restore();
  }
  if (opts.label !== false) {
    const txt = (opts.name ? opts.name + ': ' : '') + 'v/c = ' + fmtV(wl.v) +
      (wl.superluminal ? '  ⚠ |v|>c' : '');
    textBox(ctx, txt, (X1 + X2) / 2 + 8, (Y1 + Y2) / 2 - 6, {
      color: wl.superluminal ? '#fda4af' : color,
      font: opts.font, bg: true, w: view.screen.w, h: view.screen.h,
    });
  }
  return wl;
}

/**
 * Event marker {x, ct} with radially-placed label (-shell placement: pushed
 * along the origin→event direction so labels of different events fan out,
 * then clamped to the canvas by textBox). opts: {color, r=6.5, selected,
 * label (string; falsy → no label), from ({x,ct} radial anchor, default
 * origin), font}.
 */
export function drawEventMarker(ctx, view, ev, opts = {}) {
  const color = opts.color || ev.color || '#2dd4bf';
  const r = opts.r != null ? opts.r : 6.5;
  const [px, py] = view.toPx(ev.x, ev.ct);
  ctx.save();
  if (opts.selected) {
    ctx.strokeStyle = color; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(px, py, r + 4.5, 0, 2 * Math.PI); ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(px, py, r, 0, 2 * Math.PI); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  if (opts.label) {
    const from = opts.from || { x: 0, ct: 0 };
    const [ox, oy] = view.toPx(from.x, from.ct);
    let vx = px - ox, vy = py - oy;
    const L = Math.hypot(vx, vy);
    if (L < 1e-9) { vx = 0; vy = -1; } else { vx /= L; vy /= L; }
    textBox(ctx, opts.label, px + vx * 13, py + vy * 13, {
      anchor: 'c', color, bg: true, font: opts.font,
      w: view.screen.w, h: view.screen.h,
    });
  }
}

/* ---------- interaction ---------- */

/**
 * Drag/select/delete state machine for an array of events [{x, ct, ...}]
 * (mutated in place). Returns plain handlers {pointerdown, pointermove,
 * pointerup, pointercancel, contextmenu} — attach them to a canvas, or drive
 * them with synthetic {clientX, clientY, pointerId, pointerType, button}
 * objects in node. Behaviour (-shell 1095-1155 + harvest fixes):
 *   - nearest event within hitRadius px wins, not the first match (fix #8);
 *   - continuous (unsnapped) drag, snapped to snapUnit at pointer-up;
 *   - < clickThreshold px of motion = a click → onChange {type:'select'};
 *   - touch long-press (longPressMs, cancelled by motion) and right-click
 *     (contextmenu) delete the event → onChange {type:'delete'};
 *   - positions clamp to view.world (ONE clamp source, fix #6);
 *   - pointer capture through opts.element when it provides the API.
 * opts: {events, view, onChange({type:'drag'|'drop'|'select'|'delete', event,
 * index}), hitRadius=12, clickThreshold=4, longPressMs=600, snapUnit=0.25,
 * element, setTimeout, clearTimeout (injectable timers for tests)}.
 */
export function makeDraggableEvents(opts) {
  const events = opts.events;
  const view = opts.view;
  const onChange = opts.onChange || (() => {});
  const hitRadius = opts.hitRadius != null ? opts.hitRadius : 12;
  const clickThreshold = opts.clickThreshold != null ? opts.clickThreshold : 4;
  const longPressMs = opts.longPressMs != null ? opts.longPressMs : 600;
  const snapUnit = opts.snapUnit != null ? opts.snapUnit : 0.25;
  const element = opts.element || null;
  const setT = opts.setTimeout || ((fn, ms) => setTimeout(fn, ms));
  const clearT = opts.clearTimeout || ((id) => clearTimeout(id));

  let drag = null, longTimer = null;

  function rel(e) {
    const r = element && element.getBoundingClientRect
      ? element.getBoundingClientRect() : { left: 0, top: 0 };
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function nearest(px, py) {
    let best = -1, bd = hitRadius;
    for (let i = 0; i < events.length; i++) {
      const [ex, ey] = view.toPx(events[i].x, events[i].ct);
      const d = Math.hypot(px - ex, py - ey);
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  const b = view.world;
  const snap = (v) => (snapUnit > 0 ? Math.round(v / snapUnit) * snapUnit : v);
  function place(ev, x, ct) {
    ev.x = clamp(x, b.x0, b.x1);
    ev.ct = clamp(ct, b.y0, b.y1);
  }
  function removeAt(i) {
    const ev = events.splice(i, 1)[0];
    onChange({ type: 'delete', event: ev, index: i });
  }

  function pointerdown(e) {
    if (e.button === 2) return;   // right button → contextmenu path
    const [px, py] = rel(e);
    const i = nearest(px, py);
    if (i < 0) return;
    if (element && element.setPointerCapture) {
      try { element.setPointerCapture(e.pointerId); } catch (_) { /* detached */ }
    }
    drag = { index: i, moved: false, x0: px, y0: py };
    if (e.pointerType === 'touch') {
      clearT(longTimer);
      longTimer = setT(() => {
        if (drag && !drag.moved) { const i2 = drag.index; drag = null; removeAt(i2); }
      }, longPressMs);
    }
  }
  function pointermove(e) {
    if (!drag) return;
    const [px, py] = rel(e);
    if (!drag.moved && Math.hypot(px - drag.x0, py - drag.y0) > clickThreshold) {
      drag.moved = true;
      clearT(longTimer);
    }
    if (!drag.moved) return;
    const ev = events[drag.index];
    if (!ev) { drag = null; return; }
    const [wx, wct] = view.toWorld(px, py);
    place(ev, wx, wct);   // continuous while dragging; snap happens on drop
    onChange({ type: 'drag', event: ev, index: drag.index });
  }
  function pointerup(e) {
    clearT(longTimer);
    if (!drag) return;
    const ev = events[drag.index];
    if (ev) {
      if (!drag.moved) {
        onChange({ type: 'select', event: ev, index: drag.index });
      } else {
        place(ev, snap(ev.x), snap(ev.ct));   // -shell snap-on-drop feel
        onChange({ type: 'drop', event: ev, index: drag.index });
      }
    }
    if (element && element.releasePointerCapture) {
      try { element.releasePointerCapture(e.pointerId); } catch (_) { /* ok */ }
    }
    drag = null;
  }
  function pointercancel() { clearT(longTimer); drag = null; }
  function contextmenu(e) {
    if (e.preventDefault) e.preventDefault();
    const [px, py] = rel(e);
    const i = nearest(px, py);
    if (i >= 0) removeAt(i);
  }

  return {
    pointerdown, pointermove, pointerup, pointercancel, contextmenu,
    _state: () => ({ dragging: !!drag, moved: !!(drag && drag.moved) }),
  };
}
