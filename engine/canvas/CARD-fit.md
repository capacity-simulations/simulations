# MODULE canvas.fit  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.fit

## API
- fit(canvas, ctx) -> {w, h}           // size backing store to CSS box × DPR, reset transform; returns CSS-px size

## VOCABULARY
canvas, context, device pixel ratio, CSS pixels, backing store. (No physics vocabulary.)

## USAGE
    function draw() {
      const { w, h } = Engine.fit.fit(canvas, ctx);   // top of EVERY draw
      ctx.clearRect(0, 0, w, h);                      // all drawing in CSS px
      ...
    }

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT set canvas.width/height by hand or multiply by devicePixelRatio inline —
  always fit(), so hi-DPI screens stay sharp and zero-size layouts can't crash.
- Do NOT call ctx.scale(dpr, dpr) without a setTransform reset first — cumulative
  DPR scaling shrinks/blows up the scene on every resize (a real shipped bug).
- Draw in the returned CSS-pixel {w, h}, never in canvas.width/height (device px).
