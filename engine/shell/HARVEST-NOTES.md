# shell.js harvest spec (M2)

Derived from the 57-copy diff (31 normalized variants; 10 files byte-identical to
canonical SR `L09-s1-worldline-length-and-proper-time-shell.html` L618–816).
This file is the implementation contract for `shell/shell.js`.

## Init signature

```js
Shell.init({
  onFrame, onReset, onResize, onStep,
  onComplete,        // no-op default (from CM finishInquiry group, best copy L9-The pendulum.html)
  onExploreMode,     // no-op default; fired from setInquiryCollapsed + setLectureMode
                     // (best-formed source: SR L00-s1; keep aliases onLectureMode, onInquiryCollapsed)
  cfg: {
    resumeOnReset:      true,     // tri-state: true | false | 'pause'  (38/12/5 split)
    autoplay:           true,     // 51 true / 6 false
    speed:              1,        // 1 (51) | 0.5 (3) | 0.25 (2); ALSO read select markup value at boot (L1-Solar fix)
    dtClamp:            0.05,     // DECIDED: safer 0.05 becomes the default (only bites on frame stalls;
                                  // strictly more stable; L37 evidence). Old sims keep 0.1 until backport.
    lectureLanding:     'last',   // 'last' (49) | 'first' (5) | 'fastforward' (3, source L19-s2)
    finishFastForward:  false,    // 10 CM files
    resumeOnFinish:     false,    // the setPlaying(true) tail of finishInquiry
    resetBeforeFirstStep: true,   // DECIDED: reset-first is correct; canonical step-first order is a
                                  // latent bug (onReset clobbers the step-0 scene). New sims get true.
    scrollStepsToTop:   true,     // DECIDED: include-always semantics (inert when pane not scrollable);
                                  // kept as a flag only for exact-fidelity backports.
    gateLocksPlay:      false,    // 1 file (L36-Energy)
  }
});
// DECIDED: init() always ends with setPlaying(autoplay) — re-syncs Play button label after onReset.
```

## Include always (verified inert when unused — no flags)
- inqPrev / inqPagerNext / inqUpdatePager with if(el) guards
- `no-inquiry` guard (54/57 canonical behavior)
- stepUnready() — sole source CM `L37-Kepler's Laws.html`
- setPlayLocked() + playLocked guard + #play-hint — sole source CM `Galperins_Billiard.html`
- setPlayEnabled() export — source CM `L36-The Energy of the Orbit-new.html` (its gating side-effects go behind gateLocksPlay)
- `data-manual-gate` opt-out clause + inqNext export — source CM `Free-Body Diagram Builder.html`
- setLectureMode export; aside-inquiry-skip wiring (3 guarded lines, future-proofing)
- stepReady() marks current dot done — source CM `L35-Orbits.html`
- `formal-open` root-class toggle + refit at end of setLectureMode — source SR `L07-s1`
- Debounced 80ms resize; Escape handler
- Boot: read #shell-speed markup value with fallback (CM `L1-Solar System Orbits.html`)

## Dropped (with justification)
- D6 `window.__onInquirySkip` global (FBD) → replaced by onComplete
- D7 sim-specific DOM ids in shell (#gridToggle, #btn-curve, #btn-twin, #btn-launch,
  #panel-readouts, #panel-results, .mode-tab, #row-gamma; 5 files) → belongs in each
  sim's onExploreMode handler; per-sim edit at backport time, never in shell.js
- D11 auto-gate handler removal (L1-Solar, L30-Coriolis-Sphere) → canonical handler restored
- The 3 minified `-new` files' shell entirely (unguarded wiring, undebounced resize,
  answer-grading inside the shell). If those sims are ever backported, the grading
  logic moves into sim code first. Engine adopts canonical only.
- L30-The coriolis-force zero-card onComplete path (file has cards; safe drop)

## Line-harvest sources (feature → file)
See the diff report; key: stepUnready→L37; playLocked→Galperins; setPlayEnabled/currentGated→L36-Energy;
finishInquiry/onComplete→L9-pendulum; manual-gate/inqNext→FBD; scroll-to-top→L10-s2;
onExploreMode plumbing→L00-s1 (+ aliases from L08-s2-shell, L01-s1); fastforward landing→L19-s2;
speed-select boot read→L1-Solar; dot-done stepReady→L35; formal-open→L07-s1.
