// controls.bind — declarative control-to-state binding (Layer: controls).
// Harvest merge: QM_sims/Quantum_tunneling_Plane_Wave.html wireSlider (~L2603;
// the clamp + NaN guard) × SR_sims/L07-s1-Michelson_Morley_experiment_3D.html
// bind (~L3050; the state-key + fmt shape). Bounds are read from the input
// element's own min/max attributes — never duplicated in JS.
//
// Each binder returns {set(v), refresh()}:
//   set(v)    — programmatic write: sanitizes, updates state + element +
//               readout, and fires onChange (like a user gesture).
//   refresh() — push the current state[key] back into the UI without firing
//               onChange (use after external state mutation, e.g. a preset).

import { clamp, fmt } from '../core/scale.js';

function mustGet(id, who) {
  const el = document.getElementById(id);
  if (!el) throw new Error(who + ': no element with id "' + id + '"');
  return el;
}

function sanitizeNum(el, v) {
  let x = typeof v === 'number' ? v : parseFloat(v);
  const lo = parseFloat(el.min), hi = parseFloat(el.max);
  if (Number.isNaN(x)) x = Number.isFinite(lo) ? lo : 0;   // PW NaN guard
  if (Number.isFinite(lo) && Number.isFinite(hi)) x = clamp(x, lo, hi);
  return x;
}

/**
 * Bind a range/number input to state[key].
 * opts: { out: id-of-readout-element, fmt: v => string, onChange: v => {} }
 */
export function bindSlider(state, id, key, opts = {}) {
  const el = mustGet(id, 'bindSlider');
  const out = opts.out ? document.getElementById(opts.out) : null;
  const format = opts.fmt || (v => fmt(v));
  const show = v => { if (out) out.textContent = format(v); };

  el.addEventListener('input', () => {
    const v = sanitizeNum(el, el.value);
    state[key] = v;
    show(v);
    if (opts.onChange) opts.onChange(v);
  });

  function write(v, fire) {
    v = sanitizeNum(el, v);
    state[key] = v;
    el.value = String(v);
    show(v);
    if (fire && opts.onChange) opts.onChange(v);
    return v;
  }
  // Boot: seed state from the markup value, or push pre-set state into the UI.
  if (state[key] === undefined) { state[key] = sanitizeNum(el, el.value); show(state[key]); }
  else write(state[key], false);

  return { set: v => write(v, true), refresh: () => write(state[key], false) };
}

/** Bind a checkbox to boolean state[key]. opts: { onChange: v => {} } */
export function bindToggle(state, id, key, opts = {}) {
  const el = mustGet(id, 'bindToggle');

  el.addEventListener('change', () => {
    state[key] = !!el.checked;
    if (opts.onChange) opts.onChange(state[key]);
  });

  function write(v, fire) {
    v = !!v;
    state[key] = v;
    el.checked = v;
    if (fire && opts.onChange) opts.onChange(v);
    return v;
  }
  if (state[key] === undefined) state[key] = !!el.checked;
  else write(state[key], false);

  return { set: v => write(v, true), refresh: () => write(state[key], false) };
}

/**
 * Bind a <select> to state[key]. opts: { parse: str => value, onChange }.
 * parse defaults to identity (string options); pass parseFloat for numeric.
 */
export function bindSelect(state, id, key, opts = {}) {
  const el = mustGet(id, 'bindSelect');
  const parse = opts.parse || (v => v);

  el.addEventListener('change', () => {
    state[key] = parse(el.value);
    if (opts.onChange) opts.onChange(state[key]);
  });

  function write(v, fire) {
    state[key] = v;
    el.value = String(v);
    if (fire && opts.onChange) opts.onChange(v);
    return v;
  }
  if (state[key] === undefined) state[key] = parse(el.value);
  else write(state[key], false);

  return { set: v => write(v, true), refresh: () => write(state[key], false) };
}
