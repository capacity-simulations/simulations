# MODULE canvas.scale  (v1.0)
DEPENDS: core.scale
NAMESPACE: Engine.view

## API
- makeView({world, screen, aspect}) -> view
  // world:{x0,y0,x1,y1} (y UP), screen:{w,h,pad} (pad: number or {l,r,t,b}),
  // aspect:'lock' (uniform scale, centered — default) | 'stretch' (fill rect).
  // view.toPx(x,y)->[px,py]; view.toWorld(px,py)->[x,y]; view.pxPerUnit;
  // view.pxPerUnitY (== pxPerUnit when locked); view.x / view.y scales;
  // view.world; view.screen; view.aspect

## VOCABULARY
world coordinates, screen pixels, view, aspect lock, padding. World y increases up;
screen y increases down — the flip lives inside the view. (No physics vocabulary.)

## USAGE
    const { w, h } = Engine.fit.fit(canvas, ctx);
    const view = Engine.view.makeView({ world: { x0: -3, y0: 0, x1: 3, y1: 6 },
                                        screen: { w, h, pad: { l: 46, r: 16, t: 16, b: 34 } } });
    const [px, py] = view.toPx(x, y);           // draw at px, py
    const [x2, y2] = view.toWorld(ev.offsetX, ev.offsetY);   // dragging

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll world→screen maps (`px = pad + (x - x0) * k`) — always makeView,
  so the inverse (dragging/hit-testing) and the y-flip stay consistent.
- Do NOT negate y yourself — the view already flips it; double-flipping mirrors scenes.
- Do NOT cache a view across resizes — rebuild it from fit()'s {w, h} every frame.
- Do NOT use 'stretch' for geometric scenes (circles become ellipses) — lock is default.
