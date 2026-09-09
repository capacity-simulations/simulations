# MODULE canvas.axes  (v1.0)
DEPENDS: canvas.ticks, canvas.label
NAMESPACE: Engine.axes

## API
- drawAxes(ctx, view, opts = {}) -> void
  // grid + ticks + tick labels + axis labels + frame for a makeView view.
  // opts: {xLabel, yLabel, xTicks=8, yTicks=5, grid=true, frame=true,
  //        gridColor, frameColor, tickColor, font}
- makeStripChart({maxPoints = 2000, series}) -> chart
  // series: [{color, width}]. chart.push(t, ...ys); chart.draw(ctx, view);
  // chart.clear(); chart.length. Polylines clipped to the view rect, tip dots.

## VOCABULARY
axes, grid, frame, tick, series, sample, strip chart, plot rect. (No physics
vocabulary — axes draw whatever quantities the sim maps into the view.)

## USAGE
    const view = Engine.view.makeView({ world, screen: { w, h, pad: 40 }, aspect: 'stretch' });
    Engine.axes.drawAxes(ctx, view, { xLabel: 't (s)', yLabel: 'x (m)' });
    chart.push(t, x1, x2);       // once per step, one y per series
    chart.draw(ctx, view);

## NEGATIVE CONSTRAINTS — read before writing any code
- Do NOT hand-roll axis frames, gridlines, or tick math — drawAxes + niceTicks own that.
- Do NOT build bespoke ring buffers / history arrays for rolling traces — makeStripChart
  owns retention (maxPoints) and clipping.
- Do NOT draw series outside the view's plot rect — the chart clips; drawing raw
  polylines over axis labels is the bug this replaces.
