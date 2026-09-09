// canvas.scale — world↔screen view mapping with y-flip and aspect handling.
// Harvest sources: Sim_lab_sims/SR_sims/L09-s1-worldline-length-and-proper-time-shell.html
// computeView/toPx/toWorld (aspect-locked, centered plot rect) + Sim_lab_sims/CM_sims/
// L36-Scattering Extension.html W2S/S2W (forward + inverse pair, needed for dragging).
// Canvas layer: maps abstract (x, y) coordinates to pixels; no physics vocabulary.

import { makeScale } from '../core/scale.js';

function padBox(pad) {
  if (typeof pad === 'number') return { l: pad, r: pad, t: pad, b: pad };
  const p = pad || {};
  return { l: p.l || 0, r: p.r || 0, t: p.t || 0, b: p.b || 0 };
}

/**
 * makeView({world:{x0,y0,x1,y1}, screen:{w,h,pad}, aspect:'lock'|'stretch'}) -> view
 * World y increases UP, screen y increases DOWN — the flip lives here, once.
 * 'lock'   : one uniform px-per-unit scale (min of both axes), plot centered in
 *            the padded rect — shapes keep their aspect ratio.
 * 'stretch': x and y scaled independently to fill the padded rect exactly.
 * pad: number (all sides) or {l,r,t,b}.
 */
export function makeView({ world, screen, aspect = 'lock' }) {
  const { x0, y0, x1, y1 } = world;
  const { w, h } = screen;
  const p = padBox(screen.pad);
  const innerW = Math.max(1, w - p.l - p.r);
  const innerH = Math.max(1, h - p.t - p.b);
  let X, Y;
  if (aspect === 'stretch') {
    X = makeScale([x0, x1], [p.l, p.l + innerW]);
    Y = makeScale([y0, y1], [p.t + innerH, p.t]);
  } else {
    const s = Math.min(innerW / (x1 - x0), innerH / (y1 - y0));
    const usedW = (x1 - x0) * s, usedH = (y1 - y0) * s;
    const offX = p.l + (innerW - usedW) / 2;
    const offY = p.t + (innerH - usedH) / 2;
    X = makeScale([x0, x1], [offX, offX + usedW]);
    Y = makeScale([y0, y1], [offY + usedH, offY]);
  }
  return {
    world: { x0, y0, x1, y1 },
    screen: { w, h, pad: p },
    aspect,
    x: X,
    y: Y,
    toPx: (x, y) => [X(x), Y(y)],
    toWorld: (px, py) => [X.invert(px), Y.invert(py)],
    pxPerUnit: (X(x1) - X(x0)) / (x1 - x0),
    pxPerUnitY: (Y(y0) - Y(y1)) / (y1 - y0),
  };
}
