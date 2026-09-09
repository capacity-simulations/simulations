# MODULE canvas.ticks  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.ticks

## API
- niceTicks(min, max, approxN = 8) -> number[]   // 1/2/5×10ⁿ steps, deduped, ascending; [min] if range degenerate
- tickLabel(v, range) -> string                  // per-axis-uniform decimals, "0" near zero, U+2212 minus

## VOCABULARY
tick, step, range, axis label. Steps are always 1, 2, or 5 times a power of ten.
(No physics vocabulary — these are numbers on an axis.)

## USAGE
    const xs = Engine.ticks.niceTicks(view.world.x0, view.world.x1, 8);
    for (const x of xs) {
      const [px] = view.toPx(x, view.world.y0);
      // gridline at px; label:
      const s = Engine.ticks.tickLabel(x, view.world.x1 - view.world.x0);
    }

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll tick loops with hard-coded steps (`for (x = 0; x <= 90; x += 15)`) —
  niceTicks keeps ticks round and readable when ranges change with a slider.
- Do NOT label ticks with toFixed/template literals — tickLabel keeps decimals uniform
  per axis, scrubs "-0", and uses a true minus sign.
- Do NOT filter out t=0 or assume ticks start at min — the first tick is the smallest
  step multiple inside the range.
