// Shell frame loop — dtClamp and the opt-in fixed-dt accumulator (QTGW).
// The loop is a singleton scheduled once at first init, so this file keeps ONE
// mock alive for the whole run and re-inits with different cfg per test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { init, setPlaying, _state } from '../../shell/shell.js';
import { mockDoc } from './mockdoc.mjs';

const noop = () => {};
function opts(extra = {}) {
  return Object.assign({
    onFrame: noop, onReset: noop, onResize: noop, onStep: noop,
    onComplete: noop, onExploreMode: noop,
  }, extra);
}

const m = mockDoc({ steps: 0 });   // single doc: the rAF queue must persist

// Run one loop iteration with a monotonic timestamp far past `last` (which
// init sets to performance.now(), and the loop sets to the previous pump's
// timestamp), so dt is always clamped to cfg.dtClamp — deterministic
// regardless of wall-clock jitter.
let ts = 0;
function pumpStalledFrame() {
  ts = Math.max(ts, performance.now()) + 5000;
  m.flushRaf(ts);
}

test('variable-dt default: stalled frame is clamped to dtClamp * speed', () => {
  const frames = [];
  init(opts({ onFrame: dt => frames.push(dt) }));
  pumpStalledFrame();
  assert.deepEqual(frames, [0.05]);   // default dtClamp 0.05, speed 1
});

test('cfg.dtClamp is honored', () => {
  const frames = [];
  init(opts({ onFrame: dt => frames.push(dt), cfg: { dtClamp: 0.2 } }));
  pumpStalledFrame();
  assert.deepEqual(frames, [0.2]);
});

test('cfg.speed scales the variable dt', () => {
  const frames = [];
  init(opts({ onFrame: dt => frames.push(dt), cfg: { speed: 2 } }));
  pumpStalledFrame();
  assert.ok(Math.abs(frames[0] - 0.1) < 1e-12);   // 0.05 * 2
});

test('fixed mode: substeps of exactly frame.dt, capped at maxSubsteps', () => {
  const frames = [];
  init(opts({
    onFrame: dt => frames.push(dt),
    frame: { mode: 'fixed', dt: 0.001, maxSubsteps: 7 },
  }));
  pumpStalledFrame();                  // 0.05s backlog -> 50 substeps -> capped
  assert.equal(frames.length, 7);
  assert.ok(frames.every(dt => dt === 0.001));
});

test('fixed mode: accumulator carries exact-multiple frames', () => {
  const frames = [];
  init(opts({
    onFrame: dt => frames.push(dt),
    frame: { mode: 'fixed', dt: 0.05, maxSubsteps: 100 },
  }));
  pumpStalledFrame();                  // acc 0.05 -> exactly 1 substep
  pumpStalledFrame();
  assert.deepEqual(frames, [0.05, 0.05]);
});

test('paused loop never calls onFrame', () => {
  const frames = [];
  init(opts({ onFrame: dt => frames.push(dt) }));
  setPlaying(false);
  pumpStalledFrame();
  assert.deepEqual(frames, []);
  assert.equal(_state().playing, false);
});
