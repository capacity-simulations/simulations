# MODULE core.scale  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.scale

## API
- makeScale(domain, range) -> s        // s(x) maps [d0,d1]→[r0,r1]; s.invert(y); s.domain; s.range
- clamp(x, lo, hi) -> number
- lerp(a, b, t) -> number
- fmt(x, digits = 2) -> string         // fixed digits, trailing zeros trimmed, -0 scrubbed, U+2212 minus

## VOCABULARY
domain, range, scale, value, mapping. (No physics vocabulary — this module maps numbers.)

## USAGE
    const X = Engine.scale.makeScale([0, 10], [40, 760]);
    const px = X(3.2);              // world value → screen px
    const x  = X.invert(px);        // screen px → world value
    label.textContent = Engine.scale.fmt(x, 2);

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll linear maps (`px = pad + (x - x0) * k`) — always makeScale, so
  inversion (for dragging) stays correct.
- Do NOT format numbers with template literals or toFixed directly in UI code —
  use fmt so "-0.00" and hyphen-minus never reach the screen.
