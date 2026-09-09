// Minimal recording mock of CanvasRenderingContext2D for node tests of the
// canvas modules: records every method call; measureText is deterministic
// (7 px per character). Not a test file — imported by the *.test.mjs suites.

export function makeCtx(w = 800, h = 600) {
  const calls = [];
  const rec = (name) => (...args) => { calls.push([name, ...args]); };
  const ctx = {
    canvas: { width: w, height: h },
    calls,
    count(name) { return calls.filter((c) => c[0] === name).length; },
    argsOf(name) { return calls.filter((c) => c[0] === name).map((c) => c.slice(1)); },
    fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', globalAlpha: 1,
    textAlign: 'left', textBaseline: 'alphabetic', lineJoin: 'miter',
    measureText(t) { return { width: 7 * String(t).length }; },
    getLineDash() { return []; },
  };
  for (const m of ['beginPath', 'moveTo', 'lineTo', 'arcTo', 'arc', 'rect',
    'closePath', 'fill', 'stroke', 'clip', 'fillRect', 'strokeRect', 'clearRect',
    'save', 'restore', 'setLineDash', 'fillText', 'strokeText',
    'setTransform', 'scale', 'translate', 'rotate']) ctx[m] = rec(m);
  return ctx;
}

export function makeCanvas(cssW = 300, cssH = 150) {
  return {
    width: 0,
    height: 0,
    getBoundingClientRect() { return { width: cssW, height: cssH }; },
  };
}
