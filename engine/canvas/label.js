// canvas.label — text placement helpers, replacing the labelAt name collision:
// the two CM L4 sims exported incompatible functions under one name, split here.
// Harvest sources: Sim_lab_sims/CM_sims/L4-Projectile motion.html labelAt
// (measureText + canvas-bounds clamping, halo, alpha) → textBox;
// Sim_lab_sims/CM_sims/L4-Forces on objects explorer.html labelAt (radial
// placement beyond a leader tip, direction-based alignment) → callout.
// Canvas layer: text, boxes, and pixels only.

function parseAnchor(anchor) {
  let a = (anchor === 'c' || anchor === 'center') ? '' : String(anchor || 'nw');
  const vert = a.startsWith('n') ? 'n' : a.startsWith('s') ? 's' : 'c';
  if (vert !== 'c') a = a.slice(1);
  const horiz = a === 'w' ? 'w' : a === 'e' ? 'e' : 'c';
  return { vert, horiz };
}

/**
 * Draw text anchored at (x, y), clamped so it never leaves the canvas.
 * anchor: which point of the text box (x, y) is — 'nw','n','ne','w','c','e',
 * 'sw','s','se' (default 'nw': text extends right and down).
 * opts: {anchor, pad=3, color, bg (string, or true for default dark), font,
 * alpha, halo (string, or true for default light outline)}.
 * Returns the drawn box {x, y, w, h} in CSS pixels.
 */
export function textBox(ctx, text, x, y, opts = {}) {
  const pad = opts.pad != null ? opts.pad : 3;
  ctx.font = opts.font || '12px system-ui,sans-serif';
  const tw = ctx.measureText(text).width;
  const fpx = /(\d+\.?\d*)px/.exec(ctx.font);
  const th = fpx ? parseFloat(fpx[1]) : 12;
  const dpr = globalThis.devicePixelRatio || 1;
  const W = opts.w != null ? opts.w : (ctx.canvas ? ctx.canvas.width / dpr : Infinity);
  const H = opts.h != null ? opts.h : (ctx.canvas ? ctx.canvas.height / dpr : Infinity);
  const { vert, horiz } = parseAnchor(opts.anchor);
  let lx = horiz === 'w' ? x : horiz === 'e' ? x - tw : x - tw / 2;
  let ty = vert === 'n' ? y : vert === 's' ? y - th : y - th / 2;
  lx = Math.max(pad, Math.min(lx, W - tw - pad));
  ty = Math.max(pad, Math.min(ty, H - th - pad));
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  if (opts.bg) {
    ctx.fillStyle = typeof opts.bg === 'string' ? opts.bg : 'rgba(8,10,14,.82)';
    ctx.fillRect(lx - pad, ty - pad, tw + 2 * pad, th + 2 * pad);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  if (opts.halo) {
    ctx.strokeStyle = typeof opts.halo === 'string' ? opts.halo : 'rgba(255,255,255,.78)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, lx, ty);
  }
  ctx.fillStyle = opts.color || '#94a3b8';
  ctx.fillText(text, lx, ty);
  ctx.restore();
  return { x: lx - pad, y: ty - pad, w: tw + 2 * pad, h: th + 2 * pad };
}

/**
 * Place a label just beyond a tip point, along the anchor→tip direction, so
 * labels of differently-pointing leaders fan out radially instead of piling up.
 * anchorXY/tipXY: [x, y] pairs (e.g. an arrow's origin and returned {ex, ey}).
 * opts: textBox opts plus {off=15 (px beyond tip), leader (draw a thin line
 * from tip to the label)}. Returns the drawn box {x, y, w, h}.
 */
export function callout(ctx, text, anchorXY, tipXY, opts = {}) {
  const [ax, ay] = anchorXY, [tx, ty] = tipXY;
  let ux = tx - ax, uy = ty - ay;
  const L = Math.hypot(ux, uy);
  if (L < 1e-6) { ux = 0; uy = -1; } else { ux /= L; uy /= L; }
  const off = opts.off != null ? opts.off : 15;
  const bx = tx + ux * off, by = ty + uy * off;
  const anchor = ((uy > 0.35 ? 'n' : uy < -0.35 ? 's' : '') +
                  (ux > 0.35 ? 'w' : ux < -0.35 ? 'e' : '')) || 'c';
  if (opts.leader) {
    ctx.save();
    ctx.strokeStyle = opts.color || '#94a3b8';
    ctx.lineWidth = 1;
    ctx.globalAlpha = opts.alpha != null ? opts.alpha : 0.7;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(bx, by); ctx.stroke();
    ctx.restore();
  }
  return textBox(ctx, text, bx, by, Object.assign({}, opts, { anchor }));
}
