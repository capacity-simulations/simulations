# MODULE canvas.arrow  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.arrow

## API
- drawArrow(ctx, x0, y0, x1, y1, opts = {}) -> {ex, ey, clipped} | null
  // opts: {color, width=2, head=8, dash, alpha, clip:{w,h}}.
  // clip pulls the tip inside a 6 px canvas margin and draws a double-tick
  // truncation glyph. Returns the actual tip (feed to Engine.label.callout);
  // null (nothing drawn) if shorter than 1 px.

## VOCABULARY
arrow, tip, head, shaft, truncation glyph, endpoints. Arrows are screen-space
glyphs from pixel to pixel — the sim decides what quantity they depict.

## USAGE
    const [px, py] = view.toPx(x, y);
    const [qx, qy] = view.toPx(x + vx * s, y + vy * s);
    const tip = Engine.arrow.drawArrow(ctx, px, py, qx, qy,
                  { color: '#34d399', width: 2, clip: { w, h } });
    if (tip) Engine.label.callout(ctx, 'v', [px, py], [tip.ex, tip.ey], { color: '#34d399' });

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll arrowheads (moveTo/lineTo triangles at the tip) — 13 incompatible
  arrow signatures existed before this module; there is exactly one now.
- Do NOT scale arrow length by drawing thicker lines — length carries the magnitude,
  width is style only.
- Do NOT let long arrows run off-canvas silently — pass opts.clip so truncation is
  visibly marked, never faked by clamping the underlying values.
