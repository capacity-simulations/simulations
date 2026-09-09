// shell.hide-text — optional "Hide Text" runtime ("Simplify display" v2).
// Source: CM_sims/L6-The harmonic oscillator.html L446-470 (best copy of the
// 13-file CM Hide-Text IIFE).
//
// Registration convention (kept per-sim, in the sim HTML next to the checkbox):
//
//   <!-- HIDE-TEXT REGISTRY ("Simplify display" v2)
//        DOM items:    add class "ht-hide" to the element.
//        Canvas items: wrap the draw call in  if(!HT()){ ... }
//        Keep this list current when registering items:
//        - [canvas] "well legend" — drawWell, ~L1073
//        - [dom]    ".plot-title" subtitle
//   -->
//
// The SIM's CSS gates DOM items:   #shell.hide-text .ht-hide{display:none;}
// Canvas draw code gates through the predicate:  if(!window.HT()){ ...label... }

/**
 * Wire the #ht-toggle checkbox to the #shell.hide-text class and publish the
 * window.HT predicate. Returns the predicate; safe no-op (predicate always
 * false) when the sim has no #shell or no #ht-toggle.
 */
export function initHideText() {
  const shell = document.getElementById('shell');
  const box = document.getElementById('ht-toggle');
  const HT = () => !!shell && shell.classList.contains('hide-text');
  if (typeof window !== 'undefined') window.HT = HT;
  if (!shell || !box) return HT;
  function apply() {
    shell.classList.toggle('hide-text', box.checked);
    window.dispatchEvent(new Event('resize')); /* forces a redraw in every sim, even while paused */
  }
  box.addEventListener('change', apply);
  /* Default: follow lecture mode at boot. An auto-lecture script clicks 🎓 on
     the first rAF, so read the state one frame later. Independent thereafter. */
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    box.checked = shell.classList.contains('lecture-mode');
    apply();
  }); });
  return HT;
}
