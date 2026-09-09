# MODULE canvas.primitives  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.primitives

## API
- roundRect(ctx, x, y, w, h, r, opts = {}) -> void   // opts.fill/opts.stroke: true (current style) or style string; r clamped to fit
- dashLine(ctx, x0, y0, x1, y1, opts = {}) -> void   // {color, width, dash=[5,4], alpha}; dash state save/restored
- cssVar(name, fallback) -> string                   // ':root' CSS custom property, fallback if unset or no DOM
- diamond(ctx, x, y, r, opts = {}) -> void           // diamond glyph, half-diagonal r; fill/stroke as roundRect

## VOCABULARY
path, glyph, rounded rectangle, dash pattern, CSS custom property. (No physics
vocabulary — these are drawing primitives.)

## USAGE
    Engine.primitives.roundRect(ctx, x, y, 54, 38, 6, { fill: '#38bdf8', stroke: 'rgba(8,9,12,.65)' });
    Engine.primitives.dashLine(ctx, x0, y0, x1, y1, { color: accent, dash: [4, 3] });
    const accent = Engine.primitives.cssVar('--accent', '#38bdf8');
    Engine.primitives.diamond(ctx, px, py, 5, { fill: accent });

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT inline rr()/roundRect copies or arcTo chains — ~22 drifted copies existed;
  use this one (it also clamps the radius so thin boxes can't glitch).
- Do NOT call ctx.setLineDash without restoring — use dashLine so dashes never leak
  into later strokes.
- Do NOT read CSS variables via getComputedStyle inline — cssVar is the only variant
  with a fallback, which theming and node tests both require.
