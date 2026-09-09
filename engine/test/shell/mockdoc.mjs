// Minimal DOM mock for shell/controls tests (node:test, no jsdom).
// mockDoc() installs globalThis.document / window / requestAnimationFrame
// stubs and returns handles for driving them.

export function makeClassList() {
  const s = new Set();
  return {
    add: (...n) => n.forEach(x => s.add(x)),
    remove: (...n) => n.forEach(x => s.delete(x)),
    contains: n => s.has(n),
    toggle(n, force) {
      const on = force === undefined ? !s.has(n) : !!force;
      if (on) s.add(n); else s.delete(n);
      return on;
    },
  };
}

export function makeEl(id = '') {
  const listeners = Object.create(null);
  const attrs = Object.create(null);
  return {
    id, value: '', textContent: '', innerHTML: '', title: '', className: '',
    disabled: false, checked: false, scrollTop: -1, min: '', max: '',
    children: [], parentElement: null,
    classList: makeClassList(),
    addEventListener(t, fn) { (listeners[t] = listeners[t] || []).push(fn); },
    fire(t, ev) {
      (listeners[t] || []).slice().forEach(fn => fn(ev !== undefined ? ev : { target: this }));
    },
    listenerCount(t) { return (listeners[t] || []).length; },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return k in attrs ? attrs[k] : null; },
    hasAttribute(k) { return k in attrs; },
    removeAttribute(k) { delete attrs[k]; },
    appendChild(c) { this.children.push(c); c.parentElement = this; return c; },
    querySelectorAll() { return []; },
    closest() { return null; },
  };
}

/**
 * mockDoc({steps}) -> { byId, cards, raf, win, flushRaf }
 * steps: a number of .inq-step cards, or an array of descriptors
 *        ({gate:true, manualGate:true}).
 */
export function mockDoc(opts = {}) {
  const els = new Map();
  const byId = id => { if (!els.has(id)) els.set(id, makeEl(id)); return els.get(id); };

  let spec = opts.steps || 0;
  if (typeof spec === 'number') spec = Array.from({ length: spec }, () => ({}));
  const cards = spec.map((s, i) => {
    const c = makeEl(`step-${i}`);
    if (s.gate) c.setAttribute('data-gate', '');
    if (s.manualGate) c.setAttribute('data-manual-gate', '');
    return c;
  });

  const root = byId('shell');
  root.querySelectorAll = sel => {
    if (sel === '#inq-cards .inq-step') return cards.slice();
    if (sel === '#inq-dots .inq-dot') return byId('inq-dots').children.slice();
    return [];
  };
  // The shell clears the dots host via innerHTML = '' before rebuilding.
  const dots = byId('inq-dots');
  Object.defineProperty(dots, 'innerHTML', {
    get() { return ''; },
    set() { dots.children.length = 0; },
  });

  const doc = {
    getElementById: byId,
    createElement: () => makeEl(''),
    addEventListener() {},
    body: makeEl('body'),
  };
  const raf = { queue: [] };
  const win = {
    dispatched: [],
    addEventListener() {},
    dispatchEvent(ev) { win.dispatched.push((ev && ev.type) || String(ev)); },
  };
  globalThis.document = doc;
  globalThis.window = win;
  globalThis.requestAnimationFrame = fn => { raf.queue.push(fn); return raf.queue.length; };

  return {
    byId, cards, raf, win, root,
    flushRaf(ts) {
      const q = raf.queue.slice();
      raf.queue.length = 0;
      q.forEach(fn => fn(ts));
    },
  };
}
