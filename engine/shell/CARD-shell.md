# MODULE shell  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.shell — build also emits the legacy alias `window.Shell` (registry "alias")

## API
- init(opts) -> undefined — boot the shell; call ONCE, after the DOM exists.
    opts.onFrame(dt)    advance the sim by dt seconds (already speed-scaled)
    opts.onReset()      re-establish initial sim state
    opts.onResize()     refit canvases (also called on maximize/theme/panel changes)
    opts.onStep(i)      guided-inquiry step i became active (0-based)
    opts.onComplete()   inquiry finished/skipped — set up free exploration
    opts.onExploreMode(free)  inquiry collapsed or lecture mode toggled
                              (aliases accepted: onLectureMode, onInquiryCollapsed)
    opts.frame          optional {mode:'fixed', dt, maxSubsteps} — fixed-dt
                        accumulator loop for PDE sims (default: variable dt)
    opts.cfg (defaults) resumeOnReset:true (true=resume | false=leave | 'pause'),
                        autoplay:true, speed:1 (a #shell-speed markup value wins),
                        dtClamp:0.05, lectureLanding:'last'|'first'|'fastforward',
                        finishFastForward:false, resumeOnFinish:false,
                        resetBeforeFirstStep:true, scrollStepsToTop:true,
                        gateLocksPlay:false
- setPlaying(p) — play/pause; syncs the ▶/⏸ button label
- setPlayEnabled(on) — enable/disable the ▶ Play button
- setPlayLocked(locked) — hard-lock ▶ behind a prediction; shows #play-hint
- setLectureMode(on) — 🎓 lecture display mode (collapses inquiry; landing per cfg)
- refit() — call after any sim-driven layout change
- stepReady() — satisfy the active data-gate card (enables Next, marks dot done)
- stepUnready() — revoke it (re-disables Next on gated cards)
- inqNext() — programmatic Next/Finish (Finish fires onComplete + collapse)
- _state() -> snapshot object — tests/debug only, never sim logic
    After init, Shell.speed / .playing / .step / .totalSteps are read-only getters.

## VOCABULARY
shell, frame loop, guided inquiry, step card, gate, lecture mode, free
exploration, hero, aside, formal region. (UI runtime — no physics vocabulary.)

## USAGE
    Shell.init({ onFrame(dt){ advance(dt); draw(); }, onReset(){ ... },
                 onResize(){ fitAll(); draw(); }, onStep(i){ applyStep(i); },
                 cfg:{ resumeOnReset:'pause' } });
DOM-ID contract (wired by name; every element optional — absent ⇒ feature inert):
#shell (root) · #shell-play #shell-reset #shell-speed #shell-maximize
#shell-info #shell-info-modal #shell-info-close #shell-theme #shell-lecture
#toggle-formal · #aside-inquiry #aside-inquiry-skip #aside-inquiry-restore
#inq-dots #inq-cards (holds .inq-step cards; data-gate / data-manual-gate)
#inq-prev #inq-pager-next #inq-next · #play-hint · .shell-panel > .shell-panel-head
· .choice inside a gated card auto-calls stepReady on click.
Root classes the shell drives: shell-max, lecture-mode, inquiry-collapsed,
no-inquiry, hide-formal, formal-open; body.light-theme. shell/shell.css is the
styling contract for these names.

## NEGATIVE CONSTRAINTS — read before writing any code
- Never hand-roll a rAF loop, play/pause state, speed control, theme toggle, or
  stepper — Shell owns them; the sim only implements the callbacks.
- Never rename or re-purpose contract IDs/classes, and never wire sim-specific
  DOM inside shell code — per-sim show/hide belongs in onExploreMode/onStep.
- Do not call onFrame/onReset yourself; drive the sim only via Shell methods.
- Physics must not depend on wall-clock time — use the dt passed to onFrame;
  PDE sims needing a stable dt use frame:{mode:'fixed', ...}, not their own loop.
