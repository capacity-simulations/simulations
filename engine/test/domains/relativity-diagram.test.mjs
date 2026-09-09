// domain.relativity-diagram tests — pure geometry, clipped drawing (via the
// recording mock ctx), and the drag state machine driven by synthetic
// pointer events.
//
// Tolerances agreed for M6 (do NOT loosen silently — renegotiate in the plan):
//   primeTickPositions    hyperbola invariant |x^2 - ct^2 -+ k^2| < 1e-10 for
//                         every tick, k = 1..5, across betas up to 0.95
//                         (gamma^2 amplifies double rounding — 1e-10 leaves
//                         two orders of headroom over the observed ~1e-13).
//   prime grid lines      boosted ct' (resp. x') coordinate of both drawn
//                         endpoints equals the same INTEGER to 1e-9.
//   clipSegment           exact endpoint arithmetic asserted at 1e-12.
//   drawn px coords       every moveTo/lineTo of clipped primitives lies
//                         inside the view's px rect +-0.5 px.
//   classifyPair          threshold checks are exact inequalities at the
//                         snap-scaled boundaries (0.56*snap^2, 0.06*snap).
//   drag state machine    exact: nearest index, click-vs-drag at the 4 px
//                         threshold, snap to 0.25, world-box clamp.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  primeTickPositions, clipSegment, normalizeWorldline, classifyPair,
  drawSGrid, drawSAxes, drawPrimeGrid, drawPrimeAxes, drawLightCone,
  drawWorldline, drawEventMarker, makeDraggableEvents,
} from '../../domains/relativity/diagram.js';
import { gamma, boost2 } from '../../domains/relativity/index.js';
import { makeView } from '../../canvas/scale.js';
import { makeCtx } from '../canvas/mockctx.mjs';

/* Symmetric world box mapped to a 500x500 canvas, no pad: 50 px per unit. */
function view500() {
  return makeView({
    world: { x0: -5, y0: -5, x1: 5, y1: 5 },
    screen: { w: 500, h: 500, pad: 0 },
  });
}

function pxOfMoveLine(ctx) {
  return ctx.argsOf('moveTo').concat(ctx.argsOf('lineTo'));
}

/* ================= pure geometry ================= */

test('primeTickPositions: every tick sits on its calibration hyperbola (1e-10)', () => {
  for (const beta of [0, 0.1, -0.3, 0.6, -0.6, 0.9, -0.95, 0.95]) {
    const { xAxis, ctAxis } = primeTickPositions(beta, 5);
    assert.equal(xAxis.length, 10);
    assert.equal(ctAxis.length, 10);
    for (const t of xAxis) {
      const inv = t.x * t.x - t.ct * t.ct;   // x-like ticks: x^2 - ct^2 = +k^2
      assert.ok(Math.abs(inv - t.k * t.k) < 1e-10,
        `xAxis k=${t.k} beta=${beta}: ${inv - t.k * t.k}`);
    }
    for (const t of ctAxis) {
      const inv = t.ct * t.ct - t.x * t.x;   // ct-like ticks: ct^2 - x^2 = +k^2
      assert.ok(Math.abs(inv - t.k * t.k) < 1e-10,
        `ctAxis k=${t.k} beta=${beta}: ${inv - t.k * t.k}`);
    }
    // And they lie ON the tilted axes: ct = beta*x (x' axis), x = beta*ct (ct' axis).
    for (const t of xAxis) assert.ok(Math.abs(t.ct - beta * t.x) < 1e-12);
    for (const t of ctAxis) assert.ok(Math.abs(t.x - beta * t.ct) < 1e-12);
  }
  assert.throws(() => primeTickPositions(1), RangeError);
});

test('normalizeWorldline: click-order invariant, time-forward v', () => {
  const a = { x: 2, ct: 3 }, b = { x: -1, ct: 1 };
  const fwd = normalizeWorldline(b, a);
  const rev = normalizeWorldline(a, b);
  assert.deepEqual(fwd, rev, 'click order must not matter');
  assert.equal(fwd.ct1, 1, 'earlier event first');
  assert.ok(Math.abs(fwd.v - 1.5) < 1e-15, 'v = dx/dct measured time-forward');
  assert.equal(fwd.superluminal, true);
  // The -new sign bug: clicking late-then-early flipped v's sign. Never here.
  const sub = normalizeWorldline({ x: 1, ct: 4 }, { x: 0, ct: 0 });
  assert.ok(Math.abs(sub.v - 0.25) < 1e-15);
  assert.equal(sub.superluminal, false);
  // Simultaneous pair: still order-invariant (x tie-break), v = Infinity.
  const s1 = normalizeWorldline({ x: 2, ct: 1 }, { x: -2, ct: 1 });
  const s2 = normalizeWorldline({ x: -2, ct: 1 }, { x: 2, ct: 1 });
  assert.deepEqual(s1, s2);
  assert.equal(s1.v, Infinity);
  assert.equal(s1.superluminal, true);
  // Degenerate point: v is NaN, not superluminal.
  assert.ok(Number.isNaN(normalizeWorldline({ x: 1, ct: 1 }, { x: 1, ct: 1 }).v));
  assert.equal(normalizeWorldline({ x: 1, ct: 1 }, { x: 1, ct: 1 }).superluminal, false);
});

test('clipSegment: inside / outside / crossing / degenerate / extend', () => {
  const box = { x0: -5, y0: -5, x1: 5, y1: 5 };
  // Fully inside: unchanged.
  const inside = clipSegment(-1, -2, 3, 4, box);
  assert.deepEqual(inside, { x1: -1, y1: -2, x2: 3, y2: 4 });
  // Fully outside (beyond one edge, parallel): null.
  assert.equal(clipSegment(6, -3, 6, 3, box), null);
  assert.equal(clipSegment(-9, 7, 9, 7, box), null);
  // Crossing: clipped to the box edges exactly.
  const cross = clipSegment(-10, 0, 10, 0, box);
  assert.ok(Math.abs(cross.x1 - -5) < 1e-12 && Math.abs(cross.x2 - 5) < 1e-12);
  const diag = clipSegment(-10, -10, 10, 10, box);
  assert.ok(Math.abs(diag.x1 - -5) < 1e-12 && Math.abs(diag.y1 - -5) < 1e-12);
  assert.ok(Math.abs(diag.x2 - 5) < 1e-12 && Math.abs(diag.y2 - 5) < 1e-12);
  // Direction preserved (t0 < t1 along input direction).
  const rev = clipSegment(10, 10, -10, -10, box);
  assert.ok(rev.x1 > rev.x2, 'output ordered along the input direction');
  // Degenerate point: inside -> the point; outside -> null (both modes).
  assert.deepEqual(clipSegment(1, 1, 1, 1, box), { x1: 1, y1: 1, x2: 1, y2: 1 });
  assert.equal(clipSegment(9, 9, 9, 9, box), null);
  assert.deepEqual(clipSegment(1, 1, 1, 1, box, { extend: true }),
    { x1: 1, y1: 1, x2: 1, y2: 1 });
  // Extend: a short interior segment's LINE reaches both edges.
  const ext = clipSegment(0, 0, 1, 0, box, { extend: true });
  assert.ok(Math.abs(ext.x1 - -5) < 1e-12 && Math.abs(ext.x2 - 5) < 1e-12);
  // A line missing the box entirely: null even extended.
  assert.equal(clipSegment(0, 20, 1, 20, box, { extend: true }), null);
});

test('classifyPair: thresholds scale with the snap grid (fix #10)', () => {
  const O = { x: 0, ct: 0 };
  // Defaults (snapUnit 0.25) reproduce the source's tuned 0.035 / 0.015.
  assert.equal(classifyPair(O, { x: 1, ct: 3 }).kind, 'timelike');
  assert.equal(classifyPair(O, { x: 3, ct: 1 }).kind, 'spacelike');
  assert.equal(classifyPair(O, { x: 2.5, ct: 2.5 }).kind, 'lightlike');
  assert.equal(classifyPair(O, { x: 1, ct: Math.sqrt(1.03) }).kind, 'lightlike');   // |ds2| = 0.03 < 0.035
  assert.equal(classifyPair(O, { x: 1, ct: Math.sqrt(1.04) }).kind, 'timelike');    // |ds2| = 0.04 > 0.035
  assert.equal(classifyPair(O, { x: 1, ct: 0.01 }).order, 'simultaneous');          // |dct| = 0.01 < 0.015
  assert.equal(classifyPair(O, { x: 1, ct: 0.02 }).order, 'e1-first');              // 0.02 > 0.015
  assert.equal(classifyPair(O, { x: 1, ct: -0.02 }).order, 'e2-first');
  // Doubling the snap unit doubles both windows.
  const snap = { snapUnit: 0.5 };
  assert.equal(classifyPair(O, { x: 1, ct: 0.02 }, snap).order, 'simultaneous');    // 0.02 < 0.03
  assert.equal(classifyPair(O, { x: 1, ct: Math.sqrt(1.1) }, snap).kind, 'lightlike'); // 0.1 < 0.14
  assert.equal(classifyPair(O, { x: 1, ct: Math.sqrt(1.1) }).kind, 'timelike');     // but not at 0.25
  // ds2/dct/dx are the raw signed values.
  const r = classifyPair({ x: 1, ct: 1 }, { x: 2, ct: 4 });
  assert.equal(r.dct, 3);
  assert.equal(r.dx, 1);
  assert.ok(Math.abs(r.ds2 - 8) < 1e-15);
});

/* ================= drawing (mock ctx; clipping asserted) ================= */

test('drawSGrid + drawSAxes: integer lines, all px inside the view rect', () => {
  const view = view500();
  const ctx = makeCtx(500, 500);
  drawSGrid(ctx, view);
  // 11 vertical + 11 horizontal integer lines = 22 strokes.
  assert.equal(ctx.count('stroke'), 22);
  for (const [px, py] of pxOfMoveLine(ctx)) {
    assert.ok(px >= -0.5 && px <= 500.5 && py >= -0.5 && py <= 500.5,
      `grid point (${px}, ${py}) escapes the view`);
  }
  const ctx2 = makeCtx(500, 500);
  drawSAxes(ctx2, view);
  assert.ok(ctx2.count('stroke') >= 2 + 8 + 8, 'axes + tick marks drawn');
  const texts = ctx2.argsOf('fillText').map((a) => a[0]);
  assert.ok(texts.includes('x') && texts.includes('ct'), 'axis letters present');
  assert.ok(texts.includes('3') && texts.includes('-4'), 'numeric tick labels present');
});

test('drawPrimeGrid: every line is a constant-integer ct\' or x\' line, clipped', () => {
  const beta = 0.6;
  const view = view500();
  const ctx = makeCtx(500, 500);
  drawPrimeGrid(ctx, view, beta);
  const moves = ctx.argsOf('moveTo');
  const lines = ctx.argsOf('lineTo');
  assert.equal(moves.length, lines.length);
  assert.ok(moves.length > 10, `expected a filled grid, got ${moves.length} lines`);
  for (let i = 0; i < moves.length; i++) {
    for (const [px, py] of [moves[i], lines[i]]) {
      assert.ok(px >= -0.5 && px <= 500.5 && py >= -0.5 && py <= 500.5,
        `prime-grid point (${px}, ${py}) escapes the view (fix #7)`);
    }
    // Unproject both endpoints and boost: one primed coordinate must be the
    // same integer at both ends (grid lines have unit S' spacing).
    const [xA, ctA] = view.toWorld(...moves[i]);
    const [xB, ctB] = view.toWorld(...lines[i]);
    const [ctpA, xpA] = boost2(ctA, xA, beta);
    const [ctpB, xpB] = boost2(ctB, xB, beta);
    const constCt = Math.abs(ctpA - ctpB) < 1e-9;
    const constX = Math.abs(xpA - xpB) < 1e-9;
    assert.ok(constCt || constX, `line ${i} is neither constant-ct' nor constant-x'`);
    const val = constCt ? ctpA : xpA;
    assert.ok(Math.abs(val - Math.round(val)) < 1e-9,
      `line ${i}: primed coordinate ${val} is not an integer`);
  }
});

test('drawPrimeAxes: tilted axes clipped, in-box calibration ticks, labels', () => {
  const beta = 0.6;
  const view = view500();
  const ctx = makeCtx(500, 500);
  drawPrimeAxes(ctx, view, beta, { labels: false });   // labels draw fillRect bgs — count ticks alone
  for (const [px, py] of pxOfMoveLine(ctx)) {
    assert.ok(px >= -0.5 && px <= 500.5 && py >= -0.5 && py <= 500.5,
      `prime-axis point (${px}, ${py}) escapes the view`);
  }
  // Ticks inside |x|,|ct| <= 5 at gamma = 1.25: xAxis k = +-1..4 (gamma*k <= 5)
  // and ctAxis likewise -> 16 squares.
  assert.equal(ctx.count('fillRect'), 16);
  const ctxL = makeCtx(500, 500);
  drawPrimeAxes(ctxL, view, beta);
  const texts = ctxL.argsOf('fillText').map((a) => a[0]);
  assert.ok(texts.includes('ct′') && texts.includes('x′'), 'axis labels present');
  // Below the tick threshold: axes only, no squares.
  const ctx2 = makeCtx(500, 500);
  drawPrimeAxes(ctx2, view, 0.01);
  assert.equal(ctx2.count('fillRect'), 0);
});

test('drawLightCone: fenced by a px clip rect; filled wedge only on demand', () => {
  const view = view500();
  const ctx = makeCtx(500, 500);
  drawLightCone(ctx, view, { x: 1, ct: -2 }, { filledFuture: true });
  assert.equal(ctx.count('clip'), 1, 'the -shell rect/clip fix is applied');
  const rect = ctx.argsOf('rect')[0];
  assert.deepEqual(rect, [0, 0, 500, 500], 'clip rect = the view px rect');
  assert.equal(ctx.count('fill'), 1, 'future wedge filled');
  assert.equal(ctx.count('stroke'), 2, 'two dashed 45-degree lines');
  const ctx2 = makeCtx(500, 500);
  drawLightCone(ctx2, view, null);
  assert.equal(ctx2.count('fill'), 0, 'no wedge without filledFuture');
  // 45 degrees in px space: |dpx| = |dpy| for both lines.
  const m = ctx2.argsOf('moveTo'), l = ctx2.argsOf('lineTo');
  for (let i = 0; i < m.length; i++) {
    assert.ok(Math.abs(Math.abs(l[i][0] - m[i][0]) - Math.abs(l[i][1] - m[i][1])) < 1e-9,
      'light rays are 45-degree lines');
  }
});

test('drawWorldline: superluminal flagged, dashed, warned; subluminal solid', () => {
  const view = view500();
  const ctx = makeCtx(500, 500);
  const wl = drawWorldline(ctx, view, { x: 4, ct: 2 }, { x: 0, ct: 0 }, { handles: false });
  assert.equal(wl.superluminal, true, 'slope 2 must flag');
  assert.deepEqual(ctx.argsOf('setLineDash')[0][0], [7, 5], 'superluminal renders dashed');
  const labels = ctx.argsOf('fillText').map((a) => a[0]).join(' ');
  assert.ok(labels.includes('⚠ |v|>c'), 'warning label present');
  assert.ok(labels.includes('+2.00'), 'v/c value labeled time-forward');

  const ctx2 = makeCtx(500, 500);
  const wl2 = drawWorldline(ctx2, view, { x: 0, ct: 0 }, { x: 2, ct: 4 }, { handles: false });
  assert.equal(wl2.superluminal, false);
  assert.ok(Math.abs(wl2.v - 0.5) < 1e-15);
  const dashes = ctx2.argsOf('setLineDash').filter((a) => a[0].length && a[0][0] === 7);
  assert.equal(dashes.length, 0, 'subluminal renders solid');
  const labels2 = ctx2.argsOf('fillText').map((a) => a[0]).join(' ');
  assert.ok(labels2.includes('+0.50') && !labels2.includes('⚠'));
  // Endpoints far outside: still drawn clipped, never past the view.
  const ctx3 = makeCtx(500, 500);
  drawWorldline(ctx3, view, { x: -40, ct: -41 }, { x: 40, ct: 41 }, { label: false });
  for (const [px, py] of pxOfMoveLine(ctx3)) {
    assert.ok(px >= -0.5 && px <= 500.5 && py >= -0.5 && py <= 500.5,
      `worldline point (${px}, ${py}) escapes the view`);
  }
});

test('drawEventMarker: marker + radially-placed label', () => {
  const view = view500();
  const ctx = makeCtx(500, 500);
  drawEventMarker(ctx, view, { x: 3, ct: 4 }, { label: 'E₁ (3, 4)', selected: true });
  assert.equal(ctx.count('arc'), 2, 'selection ring + marker');
  const ft = ctx.argsOf('fillText');
  assert.equal(ft.length, 1);
  // Radial direction from the origin: event px (400, 50); the label lands
  // further along (+x, -y) — textBox may clamp, so check the y side which has room.
  const [px, py] = view.toPx(3, 4);
  assert.ok(ft[0][2] <= py, `label pushed outward (y ${ft[0][2]} vs marker ${py})`);
});

/* ================= drag state machine (synthetic pointers) ================= */

function harness(events, opts = {}) {
  const view = view500();
  const changes = [];
  const captured = [];
  const released = [];
  const element = {
    getBoundingClientRect: () => ({ left: 100, top: 50 }),
    setPointerCapture: (id) => captured.push(id),
    releasePointerCapture: (id) => released.push(id),
  };
  const timers = { pending: [], fire() { const t = this.pending.splice(0); t.forEach((f) => f()); } };
  const h = makeDraggableEvents({
    events, view, element,
    onChange: (c) => changes.push(c),
    setTimeout: (fn) => (timers.pending.push(fn), timers.pending.length),
    clearTimeout: (id) => { if (id) timers.pending = []; },
    ...opts,
  });
  // Synthetic pointer at WORLD coords, honoring the element offset.
  const at = (x, ct, extra = {}) => {
    const [px, py] = view.toPx(x, ct);
    return { clientX: px + 100, clientY: py + 50, pointerId: 7, button: 0, ...extra };
  };
  return { h, changes, captured, released, timers, at, view };
}

test('makeDraggableEvents: nearest event wins over first-match (fix #8)', () => {
  const events = [{ x: 0, ct: 0 }, { x: 0.1, ct: 0 }];   // 5 px apart at 50 px/unit
  const { h, at } = harness(events);
  // Pointer right on top of events[1]: old first-match-within-17px logic
  // would have grabbed events[0]; nearest must grab events[1].
  h.pointerdown(at(0.1, 0));
  h.pointermove(at(1.1, 1));
  h.pointerup(at(1.1, 1));
  assert.equal(events[1].x, 1, 'the NEAREST event moved (snapped)');
  assert.equal(events[1].ct, 1);
  assert.equal(events[0].x, 0, 'the first-listed event stayed put');
  assert.equal(events[0].ct, 0);
});

test('makeDraggableEvents: click vs drag at the 4 px threshold', () => {
  const events = [{ x: 0, ct: 0 }];
  const { h, changes, at } = harness(events);
  // 3 px of motion (< 4): a click -> select, no movement.
  h.pointerdown(at(0, 0));
  h.pointermove({ clientX: at(0, 0).clientX + 3, clientY: at(0, 0).clientY, pointerId: 7, button: 0 });
  h.pointerup(at(0, 0));
  assert.deepEqual(changes.map((c) => c.type), ['select']);
  assert.equal(events[0].x, 0, 'click never moves the event');
  // 10 px of motion: a drag -> continuous 'drag' then snapped 'drop'.
  changes.length = 0;
  h.pointerdown(at(0, 0));
  h.pointermove({ clientX: at(0, 0).clientX + 10, clientY: at(0, 0).clientY, pointerId: 7, button: 0 });
  assert.equal(changes[0].type, 'drag');
  assert.ok(Math.abs(events[0].x - 0.2) < 1e-12, 'drag is continuous (unsnapped 10/50)');
  h.pointerup({ clientX: at(0, 0).clientX + 10, clientY: at(0, 0).clientY, pointerId: 7, button: 0 });
  assert.equal(changes[changes.length - 1].type, 'drop');
  assert.equal(events[0].x, 0.25, 'snap-on-drop to the 0.25 grid');
});

test('makeDraggableEvents: drags clamp to view.world (fix #6)', () => {
  const events = [{ x: 4, ct: 4 }];
  const { h, at } = harness(events);
  h.pointerdown(at(4, 4));
  h.pointermove(at(9, 9));   // way outside the +-5 box
  h.pointerup(at(9, 9));
  assert.equal(events[0].x, 5, 'clamped to world x1');
  assert.equal(events[0].ct, 5, 'clamped to world y1');
});

test('makeDraggableEvents: touch long-press deletes; motion cancels it', () => {
  const events = [{ x: 1, ct: 1 }, { x: -2, ct: 0 }];
  const { h, changes, timers, at } = harness(events);
  h.pointerdown(at(1, 1, { pointerType: 'touch' }));
  assert.equal(timers.pending.length, 1, 'long-press timer armed for touch');
  timers.fire();
  assert.equal(events.length, 1, 'long-press deleted the event');
  assert.equal(events[0].x, -2, 'the other event survives');
  assert.deepEqual(changes.map((c) => c.type), ['delete']);
  assert.equal(h._state().dragging, false, 'drag cleared after delete');
  // Motion beyond the click threshold disarms the timer.
  changes.length = 0;
  h.pointerdown(at(-2, 0, { pointerType: 'touch' }));
  h.pointermove(at(-1, 0, { pointerType: 'touch' }));
  timers.fire();   // nothing pending -> no delete
  assert.equal(events.length, 1, 'motion cancelled the long-press');
  h.pointerup(at(-1, 0, { pointerType: 'touch' }));
  assert.equal(changes[changes.length - 1].type, 'drop');
  // Mouse pointers never arm the timer.
  h.pointerdown(at(-1, 0));
  assert.equal(timers.pending.length, 0);
  h.pointerup(at(-1, 0));
});

test('makeDraggableEvents: right-click delete via contextmenu; misses ignored', () => {
  const events = [{ x: 1, ct: 1 }];
  const { h, changes, at } = harness(events);
  let prevented = 0;
  h.contextmenu({ ...at(4, -4), preventDefault: () => prevented++ });
  assert.equal(events.length, 1, 'far-away right-click deletes nothing');
  h.contextmenu({ ...at(1, 1), preventDefault: () => prevented++ });
  assert.equal(events.length, 0, 'right-click on the event deletes it');
  assert.equal(prevented, 2, 'default context menu suppressed');
  assert.deepEqual(changes.map((c) => c.type), ['delete']);
  // pointerdown with button 2 is left to contextmenu (no drag starts).
  h.pointerdown({ ...at(0, 0), button: 2 });
  assert.equal(h._state().dragging, false);
});

test('makeDraggableEvents: pointer capture through the injected element API', () => {
  const events = [{ x: 0, ct: 0 }];
  const { h, captured, released, at } = harness(events);
  h.pointerdown(at(0, 0));
  assert.deepEqual(captured, [7], 'setPointerCapture with the pointerId');
  h.pointerup(at(0, 0));
  assert.deepEqual(released, [7], 'releasePointerCapture on up');
  // A miss never captures.
  h.pointerdown(at(4, -4));
  assert.equal(captured.length, 1);
  // pointercancel clears the drag state.
  h.pointerdown(at(0, 0));
  h.pointercancel();
  assert.equal(h._state().dragging, false);
});
