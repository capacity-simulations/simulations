// Shell runtime — cfg-flag behavior suite (DOM mocked; frame-loop tests live
// in frame.test.mjs so this file never has to pump the singleton rAF loop).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  init, setPlaying, setPlayEnabled, setPlayLocked, setLectureMode,
  stepReady, stepUnready, inqNext, refit, _state,
} from '../../shell/shell.js';
import { mockDoc } from './mockdoc.mjs';

const noop = () => {};
// The shell is a singleton with sticky callbacks — every init passes a full,
// fresh callback set so no recorder leaks across tests.
function opts(extra = {}) {
  return Object.assign({
    onFrame: noop, onReset: noop, onResize: noop, onStep: noop,
    onComplete: noop, onExploreMode: noop,
  }, extra);
}

test('autoplay default: playing after init, button reads Pause', () => {
  const m = mockDoc({ steps: 2 });
  init(opts());
  assert.equal(_state().playing, true);
  assert.equal(m.byId('shell-play').textContent, '⏸ Pause');
  assert.equal(m.byId('shell-play').classList.contains('paused'), false);
});

test('autoplay:false boots paused with Play label', () => {
  const m = mockDoc({ steps: 2 });
  init(opts({ cfg: { autoplay: false } }));
  assert.equal(_state().playing, false);
  assert.equal(m.byId('shell-play').textContent, '▶ Play');
  assert.equal(m.byId('shell-play').classList.contains('paused'), true);
});

test('resumeOnReset:true (default) — Reset resumes play', () => {
  const m = mockDoc({ steps: 1 });
  let resets = 0;
  init(opts({ onReset: () => resets++ }));
  const before = resets;
  setPlaying(false);
  m.byId('shell-reset').fire('click');
  assert.equal(resets, before + 1);
  assert.equal(_state().playing, true);
});

test("resumeOnReset:'pause' — Reset forces pause", () => {
  const m = mockDoc({ steps: 1 });
  init(opts({ cfg: { resumeOnReset: 'pause' } }));
  assert.equal(_state().playing, true);
  m.byId('shell-reset').fire('click');
  assert.equal(_state().playing, false);
});

test('resumeOnReset:false — Reset leaves the play state alone', () => {
  const m = mockDoc({ steps: 1 });
  init(opts({ cfg: { resumeOnReset: false, autoplay: false } }));
  m.byId('shell-reset').fire('click');
  assert.equal(_state().playing, false);
  setPlaying(true);
  m.byId('shell-reset').fire('click');
  assert.equal(_state().playing, true);
});

test("lectureLanding:'last' (default) jumps to the final card", () => {
  const m = mockDoc({ steps: 3 });
  const stepsSeen = [];
  init(opts({ onStep: i => stepsSeen.push(i) }));
  stepsSeen.length = 0;
  m.byId('shell-lecture').fire('click');
  assert.deepEqual(stepsSeen, [2]);
  assert.equal(_state().step, 2);
  assert.equal(m.root.classList.contains('lecture-mode'), true);
  assert.equal(m.root.classList.contains('inquiry-collapsed'), true);
});

test("lectureLanding:'fastforward' replays every onStep (SR L19-s2)", () => {
  const m = mockDoc({ steps: 3 });
  const stepsSeen = [];
  init(opts({ onStep: i => stepsSeen.push(i), cfg: { lectureLanding: 'fastforward' } }));
  stepsSeen.length = 0;
  m.byId('shell-lecture').fire('click');
  assert.deepEqual(stepsSeen, [0, 1, 2, 2]);   // full replay, then landing show
  assert.equal(_state().step, 2);
});

test("lectureLanding:'first' stays on card 0; exit restores inquiry", () => {
  const m = mockDoc({ steps: 3 });
  init(opts({ cfg: { lectureLanding: 'first' } }));
  m.byId('shell-lecture').fire('click');
  assert.equal(_state().step, 0);
  assert.equal(m.root.classList.contains('lecture-mode'), true);
  setLectureMode(false);
  assert.equal(m.root.classList.contains('lecture-mode'), false);
  assert.equal(m.root.classList.contains('inquiry-collapsed'), false);
  assert.equal(_state().step, 0);
});

test('Finish fires onComplete and collapses the inquiry (CM L9)', () => {
  const m = mockDoc({ steps: 2 });
  let completed = 0;
  init(opts({ onComplete: () => completed++ }));
  m.byId('inq-next').fire('click');            // 0 -> 1
  assert.equal(_state().step, 1);
  assert.equal(m.byId('inq-next').textContent, 'Finish');
  m.byId('inq-next').fire('click');            // Finish
  assert.equal(completed, 1);
  assert.equal(m.root.classList.contains('inquiry-collapsed'), true);
});

test('finishFastForward: Skip replays remaining steps then completes', () => {
  const m = mockDoc({ steps: 3 });
  const stepsSeen = []; let completed = 0;
  init(opts({
    onStep: i => stepsSeen.push(i), onComplete: () => completed++,
    cfg: { finishFastForward: true, autoplay: false },
  }));
  stepsSeen.length = 0;
  m.byId('aside-inquiry-skip').fire('click');
  assert.deepEqual(stepsSeen, [1, 2]);         // remaining steps replayed
  assert.equal(completed, 1);
  assert.equal(m.root.classList.contains('inquiry-collapsed'), true);
  assert.equal(_state().playing, false);       // resumeOnFinish defaults off
});

test('resumeOnFinish: finishing starts the loop', () => {
  const m = mockDoc({ steps: 2 });
  init(opts({ cfg: { finishFastForward: true, resumeOnFinish: true, autoplay: false } }));
  assert.equal(_state().playing, false);
  m.byId('aside-inquiry-skip').fire('click');
  assert.equal(_state().playing, true);
});

test('default Skip only collapses (no fast-forward, no onComplete)', () => {
  const m = mockDoc({ steps: 3 });
  const stepsSeen = []; let completed = 0;
  init(opts({ onStep: i => stepsSeen.push(i), onComplete: () => completed++ }));
  stepsSeen.length = 0;
  m.byId('aside-inquiry-skip').fire('click');
  assert.deepEqual(stepsSeen, []);
  assert.equal(completed, 0);
  assert.equal(m.root.classList.contains('inquiry-collapsed'), true);
});

test('gateLocksPlay: gated card disables Play until stepReady (CM L36)', () => {
  const m = mockDoc({ steps: [{ gate: true }, {}] });
  init(opts({ cfg: { gateLocksPlay: true } }));
  assert.equal(m.byId('shell-play').disabled, true);
  assert.equal(_state().playing, false);
  assert.equal(m.byId('inq-next').disabled, true);
  assert.equal(m.byId('inq-pager-next').disabled, true);
  stepReady();
  assert.equal(m.byId('shell-play').disabled, false);
  assert.equal(m.byId('inq-next').disabled, false);
  assert.equal(m.byId('inq-pager-next').disabled, false);
});

test('gateLocksPlay off (default): gate holds Next but never Play', () => {
  const m = mockDoc({ steps: [{ gate: true }, {}] });
  init(opts());
  assert.equal(m.byId('shell-play').disabled, false);
  assert.equal(_state().playing, true);
  assert.equal(m.byId('inq-next').disabled, true);
});

test('setPlayLocked: hint pill + hard Play lock (Galperins)', () => {
  const m = mockDoc({ steps: 0 });
  init(opts());
  setPlayLocked(true);
  assert.equal(m.byId('shell-play').disabled, true);
  assert.equal(m.byId('play-hint').classList.contains('show'), true);
  assert.equal(_state().playing, false);       // locking pauses
  setPlaying(true);                            // ignored while locked
  assert.equal(_state().playing, false);
  setPlayLocked(false);
  assert.equal(m.byId('shell-play').disabled, false);
  assert.equal(m.byId('play-hint').classList.contains('show'), false);
  setPlaying(true);
  assert.equal(_state().playing, true);
});

test('collapsing the inquiry always unlocks Play (Galperins)', () => {
  const m = mockDoc({ steps: 1 });
  init(opts());
  setPlayLocked(true);
  m.byId('inq-next').fire('click');            // Finish on card 0 -> collapse
  assert.equal(_state().playLocked, false);
  assert.equal(m.byId('shell-play').disabled, false);
});

test('stepReady marks the dot done (CM L35); stepUnready revokes (CM L37)', () => {
  const m = mockDoc({ steps: [{ gate: true }] });
  init(opts());
  assert.equal(m.byId('inq-next').disabled, true);
  stepReady();
  assert.equal(m.byId('inq-next').disabled, false);
  assert.equal(m.byId('inq-dots').children[0].classList.contains('done'), true);
  assert.equal(m.cards[0].hasAttribute('data-ready'), true);
  stepUnready();
  assert.equal(m.cards[0].hasAttribute('data-ready'), false);
  assert.equal(m.byId('inq-next').disabled, true);
});

test('.choice click auto-readies a gated card — unless data-manual-gate (FBD)', () => {
  const auto = mockDoc({ steps: [{ gate: true }] });
  init(opts());
  const card = auto.cards[0];
  const choice = { closest: () => card };
  auto.byId('inq-cards').fire('click', { target: { closest: () => choice } });
  assert.equal(auto.byId('inq-next').disabled, false);

  const manual = mockDoc({ steps: [{ gate: true, manualGate: true }] });
  init(opts());
  const mCard = manual.cards[0];
  const mChoice = { closest: () => mCard };
  manual.byId('inq-cards').fire('click', { target: { closest: () => mChoice } });
  assert.equal(manual.byId('inq-next').disabled, true);   // sim must call stepReady
});

test('speed: #shell-speed markup value wins at boot (CM L1-Solar)', () => {
  const m = mockDoc({ steps: 0 });
  m.byId('shell-speed').value = '0.5';
  init(opts());
  assert.equal(_state().speed, 0.5);
  m.byId('shell-speed').fire('change', { target: { value: '2' } });
  assert.equal(_state().speed, 2);
  m.byId('shell-speed').fire('change', { target: { value: 'bogus' } });
  assert.equal(_state().speed, 1);             // falls back to cfg.speed
});

test('scrollStepsToTop scrolls #inq-cards on step change (SR L10-s2)', () => {
  const m = mockDoc({ steps: 2 });
  assert.equal(m.byId('inq-cards').scrollTop, -1);
  init(opts());
  assert.equal(m.byId('inq-cards').scrollTop, 0);

  const off = mockDoc({ steps: 2 });
  init(opts({ cfg: { scrollStepsToTop: false } }));
  assert.equal(off.byId('inq-cards').scrollTop, -1);
});

test('resetBeforeFirstStep:true (default) — onReset precedes onStep(0)', () => {
  mockDoc({ steps: 2 });
  const order = [];
  init(opts({ onReset: () => order.push('reset'), onStep: i => order.push('step' + i) }));
  assert.ok(order.indexOf('reset') < order.indexOf('step0'));
});

test('resetBeforeFirstStep:false — canonical step-first order preserved', () => {
  mockDoc({ steps: 2 });
  const order = [];
  init(opts({
    onReset: () => order.push('reset'), onStep: i => order.push('step' + i),
    cfg: { resetBeforeFirstStep: false },
  }));
  assert.ok(order.indexOf('step0') < order.indexOf('reset'));
});

test('onExploreMode fires on collapse; onLectureMode alias accepted (SR L00-s1)', () => {
  const m = mockDoc({ steps: 1 });
  const seen = [];
  init(opts({ onExploreMode: v => seen.push(v) }));
  m.byId('aside-inquiry-skip').fire('click');
  assert.deepEqual(seen, [true]);

  const m2 = mockDoc({ steps: 1 });
  const alias = [];
  init(opts({ onExploreMode: undefined, onLectureMode: v => alias.push(v) }));
  m2.byId('shell-lecture').fire('click');
  assert.ok(alias.length > 0);
  assert.equal(alias[alias.length - 1], true);
});

test('no inquiry cards -> root gets no-inquiry', () => {
  const m = mockDoc({ steps: 0 });
  init(opts());
  assert.equal(m.root.classList.contains('no-inquiry'), true);
});

test('formal toggle drives hide-formal AND formal-open (SR L07-s1)', () => {
  const m = mockDoc({ steps: 0 });
  init(opts());
  m.byId('toggle-formal').fire('click');
  assert.equal(m.root.classList.contains('hide-formal'), true);
  assert.equal(m.root.classList.contains('formal-open'), false);
  m.byId('toggle-formal').fire('click');
  assert.equal(m.root.classList.contains('hide-formal'), false);
  assert.equal(m.root.classList.contains('formal-open'), true);
});

test('frozen getter API installed on the built namespace (window.Shell alias)', () => {
  const m = mockDoc({ steps: 2 });
  m.win.Engine = { shell: {} };
  m.byId('shell-speed').value = '0.25';
  init(opts());
  const ns = m.win.Engine.shell;
  assert.equal(ns.speed, 0.25);
  assert.equal(ns.playing, true);
  assert.equal(ns.step, 0);
  assert.equal(ns.totalSteps, 2);
  inqNext();
  assert.equal(ns.step, 1);
  refit();   // exported and callable
});
