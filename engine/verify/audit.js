// verify.audit — the __audit machine-verification surface (Layer: verify).
// Formalizes the window.__audit convention already present ad-hoc in 35 sims
// (SR `__audit.at(beta)` in 23 files, CM orbit audits in 12). This module is
// contract, not framework: one call installs the surface verify.mjs drives.
//
// defineAudit(opts, target) works without a browser: pass any globalThis-like
// target (default globalThis) — node tests inject a mock {document, Event}.

/* Parse the inert #engine-manifest JSON block, or null when absent/invalid. */
function readManifest(target) {
  const doc = target && target.document;
  if (!doc || typeof doc.getElementById !== 'function') return null;
  const el = doc.getElementById('engine-manifest');
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch (e) { return null; }
}

/* Default setParam: drive the control through the SAME code path as the UI.
 * controls.bind listens for 'input' on the element (see controls/bind.js
 * bindSlider), so setting .value and dispatching 'input' exercises the
 * sanitize/clamp/state/onChange chain exactly like a user gesture. When the
 * manifest carries a params schema, only its ids are accepted. */
function makeSetParam(target, manifest) {
  return function setParam(id, value) {
    const doc = target && target.document;
    if (!doc) throw new Error('audit.setParam: no document in this context');
    if (manifest && Array.isArray(manifest.params) &&
        !manifest.params.some((p) => p.id === id)) {
      throw new Error('audit.setParam: "' + id + '" is not in the manifest params schema');
    }
    const el = doc.getElementById(id);
    if (!el) throw new Error('audit.setParam: no control element "' + id + '"');
    el.value = String(value);
    const Ev = target.Event || (typeof Event !== 'undefined' ? Event : null);
    el.dispatchEvent(Ev ? new Ev('input', { bubbles: true }) : { type: 'input' });
    return el.value;
  };
}

/**
 * Install the audit surface: target.__audit =
 *   {version: 1, manifest, probes, invariants, state, setParam, run()}.
 * - probes: pure numeric functions, exposed as-is.
 * - invariants: each fn MUST return {ok, value, expected, tol}; run()
 *   aggregates them into {pass, results:[{name, ok, value, expected, tol}]}.
 *   A throwing invariant is recorded as ok:false, never rethrown.
 * - state: optional live-state accessor object (or null).
 * - setParam(id, v): defaults to the UI-code-path helper above.
 * Returns the audit object (also handed to guards via registerWith).
 */
export function defineAudit(opts = {}, target = globalThis) {
  const probes = opts.probes || {};
  const invariants = opts.invariants || {};
  const state = opts.state || null;
  const manifest = readManifest(target);

  const audit = {
    version: 1,
    manifest,
    probes,
    invariants,
    state,
    setParam: opts.setParam || makeSetParam(target, manifest),
    run() {
      const results = [];
      for (const name of Object.keys(invariants)) {
        let r;
        try {
          r = invariants[name]() || {};
        } catch (e) {
          r = { ok: false, value: String((e && e.message) || e), expected: null, tol: null };
        }
        results.push({ name, ok: !!r.ok, value: r.value, expected: r.expected, tol: r.tol });
      }
      return { pass: results.every((x) => x.ok), results };
    },
  };
  if (target) target.__audit = audit;
  return audit;
}
