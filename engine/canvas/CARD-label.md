# MODULE canvas.label  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.label

## API
- textBox(ctx, text, x, y, opts = {}) -> {x, y, w, h}
  // anchored text clamped inside the canvas. opts: {anchor:'nw' (nw/n/ne/w/c/e/
  // sw/s/se), pad=3, color, bg (true or style), font, alpha, halo (true or style),
  // w, h (override canvas CSS bounds)}
- callout(ctx, text, anchorXY, tipXY, opts = {}) -> {x, y, w, h}
  // label placed opts.off=15 px beyond tipXY along anchorXY→tipXY, alignment
  // following the direction so labels fan out radially; opts.leader draws a line.

## VOCABULARY
label, anchor, text box, callout, leader, tip, clamping. (No physics vocabulary —
labels print whatever text the sim supplies.)

## USAGE
    Engine.label.textBox(ctx, 'x = 0 (equilibrium)', px, py + 17,
                         { color: '#e2e8f0', bg: true });
    const tip = Engine.arrow.drawArrow(ctx, px, py, qx, qy, { color: c });
    if (tip) Engine.label.callout(ctx, 'F (N)', [px, py], [tip.ex, tip.ey], { color: c });

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT call ctx.fillText directly for labels — raw text walks off the canvas edge;
  textBox clamps and handles anchor/background/halo consistently.
- Do NOT reintroduce a `labelAt` helper — that name meant two incompatible things in
  the source sims and was deliberately split into textBox and callout.
- Do NOT stack callouts at a fixed offset direction — pass the real anchor and tip so
  labels of differently-pointing arrows fan out instead of piling up.
