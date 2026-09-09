// shell/shell.js — the canonical Shell runtime (Layer 3): rAF frame loop,
// play/pause/speed/reset, maximize, theme, info modal, formal region,
// collapsible panels, guided-inquiry stepper, lecture mode.
//
// Base: SR_sims/L09-s1-worldline-length-and-proper-time-shell.html L618-816
// (md5-identical in 10 SR files). Every drift feature found across the 57 sim
// Shell copies is folded in per shell/HARVEST-NOTES.md — include-always
// features are inert when the DOM lacks the element; behavior splits sit
// behind cfg flags. Line-harvest sources:
//   stepUnready                           — CM L37-Kepler's Laws
//   playLocked / setPlayLocked / #play-hint — CM Galperins_Billiard
//   setPlayEnabled / currentGated gating  — CM L36-The Energy of the Orbit-new
//   finishInquiry / onComplete            — CM L9-The pendulum
//   data-manual-gate opt-out + inqNext export — CM Free-Body Diagram Builder
//   scroll-steps-to-top                   — SR L10-s2
//   onExploreMode plumbing (+ aliases)    — SR L00-s1 (aliases: L01-s1, L08-s2)
//   'fastforward' lecture landing         — SR L19-s2
//   #shell-speed markup read at boot      — CM L1-Solar System Orbits
//   stepReady marks current dot done      — CM L35-Orbits
//   formal-open root class + lecture refit tail — SR L07-s1
//   fixed-dt accumulator frame mode       — QM Quantum_Tunneling_Gaussian_Wave L2230-2253
//
// BUILD ALIASING: the registry entry "shell" carries "alias": "Shell", so
// build.py emits `window.Shell = Engine.shell;` right after this module's
// IIFE — the frozen 57-sim API (`Shell.init({...})`, `Shell.stepReady()`,
// `Shell.step`, ...) keeps working unchanged. The speed/playing/step/totalSteps
// getter properties of that API are installed onto the built namespace object
// by init() (see _installGetters below), because the build's plain
// `return {exports}` shape cannot carry accessors.

const CFG_DEFAULTS = {
  resumeOnReset: true,        // true → Reset resumes play | false → leave play state alone | 'pause' → force pause
  autoplay: true,             // start the loop playing after init
  speed: 1,                   // fallback speed; a #shell-speed markup value wins at boot (CM L1-Solar fix)
  dtClamp: 0.05,              // max frame dt (seconds) before speed scaling — frame-stall guard
  lectureLanding: 'last',     // 'last' | 'first' | 'fastforward' (replay every onStep, SR L19-s2)
  finishFastForward: false,   // Finish/Skip replays remaining onStep(k) before completing (CM L9)
  resumeOnFinish: false,      // finishInquiry ends with setPlaying(true) (CM L9 tail)
  resetBeforeFirstStep: true, // onReset before the stepper's first onStep(0) — fixes the step-0 clobber
  scrollStepsToTop: true,     // scroll #inq-cards to top on step change (inert when pane not scrollable)
  gateLocksPlay: false,       // data-gate steps also disable ▶ Play until stepReady (CM L36-Energy)
};

let onFrame = () => {}, onReset = () => {}, onResize = () => {}, onStep = () => {};
let onComplete = () => {}, onExploreMode = () => {};
let cfg = Object.assign({}, CFG_DEFAULTS);
let frame = null;               // opt-in {mode:'fixed', dt, maxSubsteps}
let root = null;
let playing = true, speed = 1, last = 0, started = false, acc = 0;
let inqStep = 0, inqTotal = 0;  // guided-inquiry stepper (shell-owned)
let playLocked = false;         // Galperins: prediction gate can hold ▶ Play shut

function loop(now) {
  let dt = (now - last) / 1000;
  if (dt > cfg.dtClamp) dt = cfg.dtClamp;
  last = now;
  if (playing) {
    if (frame && frame.mode === 'fixed') {
      // Fixed-dt accumulator (QM QTGW L2230-2253): FPS-independent PDE
      // stepping with a per-frame substep cap; the backlog is dropped when the
      // cap hits so a stalled tab never triggers a catch-up burst.
      acc += dt * speed;
      let n = Math.floor(acc / frame.dt);
      const cap = frame.maxSubsteps || 600;
      if (n > cap) { n = cap; acc = 0; } else { acc -= n * frame.dt; }
      for (let i = 0; i < n; i++) onFrame(frame.dt);
    } else {
      onFrame(dt * speed);
    }
  }
  requestAnimationFrame(loop);
}

export function refit() { onResize(); last = performance.now(); }

export function setPlaying(p) {
  if (p && playLocked) return;   // Galperins: prediction gate holds ▶ shut
  playing = p; last = performance.now();
  const b = document.getElementById('shell-play');
  if (b) { b.textContent = p ? '⏸ Pause' : '▶ Play'; b.classList.toggle('paused', !p); }
}

// Enable/disable the ▶ Play button without the playLocked hint (CM L36-Energy).
export function setPlayEnabled(on) {
  const b = document.getElementById('shell-play'); if (b) b.disabled = !on;
}

// Hard-lock ▶ Play behind a prediction commitment, with the #play-hint pill
// (CM Galperins_Billiard). Collapsing the inquiry always unlocks.
export function setPlayLocked(locked) {
  playLocked = locked;
  const b = document.getElementById('shell-play');
  const hint = document.getElementById('play-hint');
  if (b) {
    b.disabled = locked;
    b.title = locked ? 'Commit a prediction to unlock' : '';
  }
  if (hint) hint.classList.toggle('show', locked);
  if (locked && playing) setPlaying(false);
}

function setMaximized(on) {
  root.classList.toggle('shell-max', on);
  const maxBtn = document.getElementById('shell-maximize');
  if (maxBtn) {
    maxBtn.classList.toggle('active', on);
    maxBtn.textContent = on ? '⤡ Minimize' : '⛶ Maximize';
  }
  requestAnimationFrame(refit);
}

// "Free exploration" = the guided inquiry is out of the way (collapsed or
// lecture mode). SIMs use onExploreMode to unlock their full control surface
// (SR L00-s1); per-sim DOM toggling belongs in that handler, never here.
function isFreeExplore() {
  return root.classList.contains('inquiry-collapsed') || root.classList.contains('lecture-mode');
}
function notifyExploreMode() { onExploreMode(isFreeExplore()); }

// Dynamic sidebar: collapse the guided-inquiry zone to its restore bar (on
// answer or Skip) or expand it again (restore-bar click). Refit canvases so
// the sidebar height change never distorts the hero.
function setInquiryCollapsed(on) {
  root.classList.toggle('inquiry-collapsed', on);
  if (on) setPlayLocked(false);   // Galperins: collapsing always unlocks ▶
  notifyExploreMode();
  requestAnimationFrame(refit);
}

export function setLectureMode(on) {
  root.classList.toggle('lecture-mode', on);
  const b = document.getElementById('shell-lecture');
  if (b) b.classList.toggle('active', on);
  if (on) {
    const cards = inqCards();
    if (cards.length) {
      if (cfg.lectureLanding === 'fastforward') {
        // SR L19-s2: incremental onStep — replay every step so the lecture
        // scene matches the fully-revealed post-inquiry state.
        for (let i = 0; i < cards.length; i++) onStep(i);
        inqShow(cards.length - 1);
      } else if (cfg.lectureLanding === 'first') {
        inqShow(0);
      } else {
        inqShow(cards.length - 1);
      }
    }
    setInquiryCollapsed(true);
    if (cfg.gateLocksPlay) setPlayEnabled(true);   // L36-Energy: lecture never leaves ▶ dead
  } else {
    setInquiryCollapsed(false);
    inqShow(0);
  }
  notifyExploreMode();
  requestAnimationFrame(refit);   // SR L07-s1: refit tail after the mode swap
}

// ---- Guided-inquiry stepper (shell-owned, so Next/Finish are always wired) ----
// The SIM supplies sequential <div class="inq-step"> cards in #inq-cards. The
// shell shows ONE at a time, builds the dots, and drives the Next/Finish button.
// A card marked data-gate keeps Next disabled until the student clicks a .choice
// inside it (auto-detected) or the SIM calls Shell.stepReady(). A card marked
// data-manual-gate opts out of the .choice auto-detection (FBD) — the SIM must
// call stepReady() itself.
function inqCards() { return root.querySelectorAll('#inq-cards .inq-step'); }
function currentGated() {
  const card = inqCards()[inqStep];
  return !!(card && card.hasAttribute('data-gate') && !card.hasAttribute('data-ready'));
}
function inqUpdatePager() {
  const cards = inqCards();
  const prev = document.getElementById('inq-prev');
  const pnext = document.getElementById('inq-pager-next');
  if (prev) prev.disabled = inqStep <= 0;
  if (pnext) pnext.disabled = inqStep >= cards.length - 1 || (cfg.gateLocksPlay && currentGated());
}
function inqShow(n) {
  const cards = inqCards();
  if (!cards.length) return;
  inqStep = Math.max(0, Math.min(n, cards.length - 1));
  cards.forEach((c, i) => c.classList.toggle('active', i === inqStep));
  root.querySelectorAll('#inq-dots .inq-dot').forEach((d, i) => {
    d.classList.toggle('active', i === inqStep);
    d.classList.toggle('done', i < inqStep);
  });
  const next = document.getElementById('inq-next');
  if (next) {
    next.disabled = currentGated();
    next.textContent = (inqStep >= cards.length - 1) ? 'Finish' : 'Next →';
  }
  if (cfg.gateLocksPlay) {   // L36-Energy: gate ▶ Play behind the current step
    setPlayEnabled(!currentGated());
    if (currentGated()) setPlaying(false);
  }
  inqUpdatePager();
  onStep(inqStep);
  if (cfg.scrollStepsToTop) {   // SR L10-s2: long cards land scrolled to the top
    const host = document.getElementById('inq-cards');
    if (host) host.scrollTop = 0;
  }
  requestAnimationFrame(refit);
}
function inqPrev() {
  if (inqStep > 0) inqShow(inqStep - 1);
}
function inqPagerNext() {
  const cards = inqCards();
  if (inqStep < cards.length - 1) inqShow(inqStep + 1);
}
export function inqNext() {
  const cards = inqCards();
  if (inqStep >= cards.length - 1) finishInquiry();   // Finish = completed state + hide the inquiry
  else inqShow(inqStep + 1);
}
// Finish OR Skip (CM L9): optionally fast-forward through any remaining steps
// (applying each onStep so the scene ends in the SAME fully-revealed state as
// completing the inquiry), let the SIM set up free exploration via
// onComplete(), collapse the zone, and optionally leave the sim playing.
// With default flags this reduces to the canonical Finish (collapse only).
function finishInquiry() {
  const cards = inqCards();
  if (cfg.finishFastForward && cards.length) {
    for (let k = inqStep + 1; k < cards.length; k++) onStep(k);
    inqStep = cards.length - 1;
    root.querySelectorAll('#inq-dots .inq-dot').forEach((d, i) => {
      d.classList.toggle('active', i === inqStep);
      d.classList.toggle('done', i < inqStep);
    });
  }
  onComplete();
  setInquiryCollapsed(true);
  if (cfg.resumeOnFinish) setPlaying(true);
}
// SIM may call this to satisfy a data-gate step's requirement (e.g. "watched").
export function stepReady() {
  const card = inqCards()[inqStep];
  if (card) card.setAttribute('data-ready', '');
  const next = document.getElementById('inq-next'); if (next) next.disabled = false;
  // CM L35-Orbits: mark this dot as done immediately upon commit.
  const dot = root.querySelectorAll('#inq-dots .inq-dot')[inqStep];
  if (dot) dot.classList.add('done');
  if (cfg.gateLocksPlay) { setPlayEnabled(true); inqUpdatePager(); }
}
// Revoke the current card's readiness (CM L37-Kepler's Laws) — e.g. the
// student withdrew a committed prediction.
export function stepUnready() {
  const card = inqCards()[inqStep];
  if (card) card.removeAttribute('data-ready');
  const next = document.getElementById('inq-next');
  // Mirror inqShow: only disable Next when the card actually gates.
  if (next) next.disabled = !!(card && card.hasAttribute('data-gate'));
  if (cfg.gateLocksPlay) {
    setPlayEnabled(!currentGated());
    if (currentGated()) setPlaying(false);
    inqUpdatePager();
  }
}

function wire() {
  const play = document.getElementById('shell-play');
  const reset = document.getElementById('shell-reset');
  const spd = document.getElementById('shell-speed');
  const maxBtn = document.getElementById('shell-maximize');
  const skip = document.getElementById('aside-inquiry-skip');
  const restore = document.getElementById('aside-inquiry-restore');
  const tFormal = document.getElementById('toggle-formal');

  if (play) play.addEventListener('click', () => { if (!play.disabled) setPlaying(!playing); });
  // Reset zeroes state; whether the loop then plays is cfg-driven (tri-state).
  if (reset) reset.addEventListener('click', () => {
    onReset(); last = performance.now(); acc = 0;
    if (cfg.resumeOnReset === 'pause') setPlaying(false);
    else if (cfg.resumeOnReset) setPlaying(true);
    // resumeOnReset:false → leave the play state as the student had it
  });
  if (spd) {
    // CM L1-Solar fix: honor the select's authored markup value at boot.
    speed = parseFloat(spd.value) || cfg.speed;
    spd.addEventListener('change', e => { speed = parseFloat(e.target.value) || cfg.speed; });
  }

  if (maxBtn) maxBtn.addEventListener('click', () => setMaximized(!root.classList.contains('shell-max')));

  const infoBtn = document.getElementById('shell-info');
  const infoModal = document.getElementById('shell-info-modal');
  const infoClose = document.getElementById('shell-info-close');
  function setInfo(open) { if (infoModal) infoModal.classList.toggle('open', open); }
  if (infoBtn) infoBtn.addEventListener('click', () => setInfo(true));
  if (infoClose) infoClose.addEventListener('click', () => setInfo(false));
  if (infoModal) infoModal.addEventListener('click', e => { if (e.target === infoModal) setInfo(false); });

  // Light/dark theme toggle (default dark). Swaps the icon and refits canvases.
  const themeBtn = document.getElementById('shell-theme');
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-theme');
    themeBtn.textContent = light ? '☀' : '☾';
    requestAnimationFrame(refit);
  });

  const lecture = document.getElementById('shell-lecture');
  if (lecture) lecture.addEventListener('click', () => setLectureMode(!root.classList.contains('lecture-mode')));

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (infoModal && infoModal.classList.contains('open')) setInfo(false);
    else if (root.classList.contains('shell-max')) setMaximized(false);
  });

  // Skip collapses the inquiry (CM L37); under finishFastForward it goes through
  // finishInquiry so the scene still ends fully revealed (CM L9's contract).
  if (skip) skip.addEventListener('click', () => {
    if (cfg.finishFastForward) finishInquiry();
    else setInquiryCollapsed(true);
    if (cfg.gateLocksPlay) setPlayEnabled(true);   // L36-Energy: Skip unlocks ▶
  });
  if (restore) restore.addEventListener('click', () => setLectureMode(false));
  // Next / Finish — shell-driven step advance (Finish collapses the inquiry).
  const inqNextBtn = document.getElementById('inq-next');
  if (inqNextBtn) inqNextBtn.addEventListener('click', inqNext);
  const inqPrevBtn = document.getElementById('inq-prev');
  if (inqPrevBtn) inqPrevBtn.addEventListener('click', inqPrev);
  const inqPagerNextBtn = document.getElementById('inq-pager-next');
  if (inqPagerNextBtn) inqPagerNextBtn.addEventListener('click', inqPagerNext);
  // Auto-gate: a .choice click inside the active gated card enables Next —
  // unless the card opts out with data-manual-gate (FBD; the SIM then gates
  // via stepReady()/stepUnready() itself).
  const cardsHost = document.getElementById('inq-cards');
  if (cardsHost) cardsHost.addEventListener('click', e => {
    const ch = e.target.closest('.choice'); if (!ch) return;
    const card = ch.closest('.inq-step');
    if (card && card.classList.contains('active') && !card.hasAttribute('data-manual-gate')) {
      stepReady();
    }
  });
  if (tFormal) tFormal.addEventListener('click', () => {
    const hidden = root.classList.toggle('hide-formal');
    root.classList.toggle('formal-open', !hidden);   // SR L07-s1: lets sim CSS make room
    tFormal.classList.toggle('active', !hidden);
    requestAnimationFrame(refit);
  });

  root.querySelectorAll('.shell-panel-head').forEach(head => {
    head.addEventListener('click', () => {
      head.parentElement.classList.toggle('collapsed');
      requestAnimationFrame(refit);
    });
  });

  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(refit, 80); });
}

// The frozen 57-sim API reads Shell.speed/.playing/.step/.totalSteps as getter
// properties. The build's `return {exports}` object cannot carry accessors, so
// install them on the built namespace (Engine.shell === window.Shell) here.
function _installGetters() {
  const w = (typeof window !== 'undefined') ? window : null;
  const ns = w && ((w.Engine && w.Engine.shell) || w.Shell);
  if (!ns || Object.getOwnPropertyDescriptor(ns, 'speed')) return;
  Object.defineProperties(ns, {
    speed:      { get: () => speed,    configurable: true },
    playing:    { get: () => playing,  configurable: true },
    step:       { get: () => inqStep,  configurable: true },
    totalSteps: { get: () => inqTotal, configurable: true },
  });
}

export function init(opts) {
  opts = opts || {};
  onFrame = opts.onFrame || onFrame; onReset = opts.onReset || onReset;
  onResize = opts.onResize || onResize; onStep = opts.onStep || onStep;
  onComplete = opts.onComplete || onComplete;
  // onExploreMode aliases kept for the SR variants (L01-s1 used onLectureMode,
  // L08-s2 used onInquiryCollapsed) — all fire on the same free-explore signal.
  onExploreMode = opts.onExploreMode || opts.onLectureMode || opts.onInquiryCollapsed || onExploreMode;
  cfg = Object.assign({}, CFG_DEFAULTS, opts.cfg || {});
  frame = opts.frame || null;
  root = document.getElementById('shell');
  playing = !!cfg.autoplay;
  speed = cfg.speed;
  acc = 0;
  wire();
  // Build the guided-inquiry stepper from the .inq-step cards the SIM supplied.
  const cards = inqCards();
  inqTotal = cards.length;
  // DECIDED (HARVEST-NOTES): reset-first is correct — the canonical step-first
  // order let onReset clobber the step-0 scene. The flag exists only for
  // exact-fidelity backports of old SR sims.
  if (cfg.resetBeforeFirstStep) { onReset(); onResize(); }
  if (inqTotal > 0) {
    const dots = document.getElementById('inq-dots');
    if (dots) { dots.innerHTML = ''; for (let i = 0; i < inqTotal; i++) { const d = document.createElement('span'); d.className = 'inq-dot'; dots.appendChild(d); } }
    inqShow(0);
  } else {
    root.classList.add('no-inquiry');   // no inquiry → hide the whole zone + restore bar
  }
  if (!cfg.resetBeforeFirstStep) { onResize(); onReset(); }
  last = performance.now();
  // DECIDED: init always ends with setPlaying(autoplay) — re-syncs the Play
  // button label after onReset regardless of what onReset touched.
  setPlaying(playing);
  if (cfg.gateLocksPlay) {   // L36-Energy: a gated first card locks ▶ at boot
    setPlayEnabled(!currentGated());
    if (currentGated()) setPlaying(false);
  }
  _installGetters();
  if (!started) { started = true; requestAnimationFrame(loop); }
}

// Test/debug snapshot of shell state — never call from sim logic; sims use the
// Shell.speed/.playing/.step/.totalSteps getters instead.
export function _state() {
  return {
    playing, speed, step: inqStep, totalSteps: inqTotal, playLocked,
    cfg: Object.assign({}, cfg),
  };
}
