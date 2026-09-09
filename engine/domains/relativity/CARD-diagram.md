# MODULE domain.relativity-diagram  (v1.0)
DEPENDS: domain.relativity, core.scale, canvas.label, canvas.primitives
NAMESPACE: Engine.relDiagram

## API
World coords are (x, ct), ct up, c = 1; `view` is a canvas.scale makeView.
- primeTickPositions(beta, kMax=5) -> {xAxis, ctAxis}   // PURE hyperbola calibration ticks (γk, γβk)/(γβk, γk); each satisfies x²−ct² = ±k²
- clipSegment(x1, y1, x2, y2, box, {extend}) -> {x1,y1,x2,y2}|null  // Liang–Barsky vs box {x0,y0,x1,y1}; extend clips the infinite line
- normalizeWorldline(p1, p2) -> {x1,ct1,x2,ct2,v,superluminal}      // time-forward ordering; v sign is click-order invariant
- classifyPair(e1, e2, {snapUnit=0.25}) -> {dct,dx,ds2,kind,order}  // thresholds scale with the snap grid
- drawSGrid(ctx, view, {color,width,step})
- drawSAxes(ctx, view, {color,tickColor,labels})        // four-quadrant axes + integer ticks
- drawPrimeGrid(ctx, view, beta, {color,width,dash})    // γ-spaced S' grid, clipped to view
- drawPrimeAxes(ctx, view, beta, {kMax,labels})         // tilted ct'/x' axes + calibration ticks
- drawLightCone(ctx, view, event, {filledFuture,color}) // event {x,ct} or null → origin; clipped
- drawWorldline(ctx, view, p1, p2, {color,name,label,handles,extend}) -> wl  // normalized + clipped; superluminal → dashed + '⚠ |v|>c'
- drawEventMarker(ctx, view, ev, {color,label,selected,from})  // radial label placement from origin
- makeDraggableEvents({events, view, onChange, hitRadius, snapUnit, element}) -> handlers
  // {pointerdown,pointermove,pointerup,pointercancel,contextmenu}; nearest-hit,
  // 4px click-vs-drag, continuous drag + snap-on-drop, long-press/right-click delete

## VOCABULARY
spacetime diagram, event, worldline, light cone, S / S' axes, calibration
hyperbola, snap grid. Every drawn primitive belongs to a declared frame.

## USAGE
    const view = Engine.view.makeView({ world: {x0:-6, y0:-6, x1:6, y1:6},
                                        screen: {w, h, pad: 24} });
    Engine.relDiagram.drawSGrid(ctx, view);
    Engine.relDiagram.drawSAxes(ctx, view);
    Engine.relDiagram.drawPrimeAxes(ctx, view, beta);
    Engine.relDiagram.drawLightCone(ctx, view, events[0], { filledFuture: true });
    const h = Engine.relDiagram.makeDraggableEvents({ events, view, element: canvas,
      onChange: () => draw() });
    canvas.addEventListener('pointerdown', h.pointerdown);  // + move/up/cancel/contextmenu

## NEGATIVE CONSTRAINTS — read before writing any code
- ALWAYS normalizeWorldline (or drawWorldline, which does it) before drawing
  or labeling a worldline — raw click order flips the v/c sign.
- ALWAYS clip to the viewport: use clipSegment / the draw* primitives; never
  stroke world-space lines past view.world.
- Classification thresholds are RELATIVE to the snap grid — pass your
  snapUnit to classifyPair; never bake |ds²| < 0.035-style constants.
- CONFIGS-style content (event presets, captions, per-lecture payloads) is
  sim-side, NEVER module-side — this module takes data as parameters only.
- One clamp source: drag, grid, and axes all use view.world — do not invent
  separate drag/entry extents.
- Pass beta explicitly on every S′ call; do not cache a module-side frame
  velocity (the snap-to-0 readout bug came from hidden state).
