# MODULE controls.bind  (v1.0)
DEPENDS: core.scale
NAMESPACE: Engine.bind

## API
- bindSlider(state, id, key, {out, fmt, onChange}) -> {set(v), refresh()}
    range/number input → state[key]. Bounds come from the element's own
    min/max attributes (clamped; NaN falls back to min). out: id of a readout
    element; fmt: v => string (default Engine.scale.fmt).
- bindToggle(state, id, key, {onChange}) -> {set(v), refresh()}
    checkbox → boolean state[key].
- bindSelect(state, id, key, {parse, onChange}) -> {set(v), refresh()}
    select → state[key]; parse maps option string → value (default identity;
    pass parseFloat for numeric options).
All three: set(v) sanitizes, updates state + element + readout, fires onChange;
refresh() pushes state[key] back into the UI without firing onChange. At bind
time, state[key] is seeded from the markup value if undefined, else the UI is
synced to the pre-set state.

## VOCABULARY
state, key, control, slider, toggle, select, readout, bounds. (Controls map UI
to state values — no physics vocabulary.)

## USAGE
    const state = {};
    const v0 = Engine.bind.bindSlider(state, 'v0', 'v0',
      { out: 'v0Val', fmt: v => Engine.scale.fmt(v, 1) + ' m/s',
        onChange: () => recompute() });
    v0.set(3.5);                    // programmatic move (fires onChange)
    state.v0 = presets[i].v0; v0.refresh();   // sync UI after a preset

## NEGATIVE CONSTRAINTS — read before writing any code
- Never addEventListener('input'/'change') on a control by hand — always
  bindSlider/bindToggle/bindSelect, so clamp + NaN guard + readout stay uniform.
- Never duplicate slider bounds in JS — min/max live on the input element only.
- Never write el.value directly after binding — use set() or refresh(), or the
  state and the UI will drift apart.
