# Recon: mapping the sim before touching it

Work read-only in this phase. The sims are built from a shared "shell" template
(header comment: `SHELL CSS — emit VERBATIM`), so most anchors below match exactly;
when one doesn't, use the fallback procedure and keep the diff minimal.

## A. Confirm the shell anatomy

Run these greps against the sim file and record what you find:

| What | How to find it | Why it matters |
|---|---|---|
| Formal toggle button | `grep -n 'toggle-formal'` | Patch 1 target; its listener is patch 2 |
| Formal strip content | `class="shell-formal"` section, `eq1..eqN` + prose | Source of truth for the physics content |
| Scene-control function | `grep -n 'applyInquiryScene'` | The hook the "see it" buttons call; note its accepted cfg keys (`omega`/`vLaunch`-style params, `frame`, `cfShow`-style toggles, `launch`, `playing`) |
| Sim boot tail | the end of the sim IIFE, usually `renderMath();\n})();` | Patch 3 insertion point (must be inside the IIFE so the hook can close over `applyInquiryScene`) |
| Shell API | `Shell.playing`, `Shell.setPlaying` usages | Pause on open, resume on close |
| Sliders | `input type="range"` inside `.ctrl-box` groups | id, min/max/step, physical symbol + unit, and which state fields they set (`readSliders`) |
| Slider listeners | `addEventListener('input'` on each slider | The layer syncs by dispatching `input` events — confirm the sim listens to `input`, not `change` |
| Trail/frame colors | CSS tokens like `--rest`/`--moving` or legend swatches | Diagrams must reuse the sim's own trail colors |
| Theme wiring | `shell-theme` listener; `body.light-theme, html[data-theme="light"]` selector | Explains the theme-repair module (see pitfalls #4) |
| Info modal + guided inquiry | `shell-info-modal`, `inq-cards` | Mine for the misconception, the Earth/real-world numbers, and the sim's own phrasing |
| External resources | every `<script src>` / `<link>` | All hosts must be CDN-allowlisted for hosted pages (see pitfalls #1) |

Also record the sim's **default parameter values** (slider `value` attributes and any
reset function) — the diagrams and the worked example are computed from them.

## B. The four structural patches (and only these)

Apply with `patchlib.Patcher` — each anchor asserted `count == 1`, file written only
after all four succeed.

**Patch 1 — button label.** Reference anchor:
```
<button id="toggle-formal" class="shell-btn">∑ Formal</button>
```
→ same button, label `⚛︎ The Physics` (U+269B + U+FE0E text-presentation selector), plus a helpful `title` attribute.

**Patch 2 — button listener.** Reference anchor (inside the Shell runtime's `wire()`):
```
    if(tFormal) tFormal.addEventListener('click',()=>{
      const hidden=root.classList.toggle('hide-formal');
      tFormal.classList.toggle('active',!hidden);
      requestAnimationFrame(refit);
    });
```
→ body replaced with `if(window.__openPhysics) window.__openPhysics();` plus a
one-line comment marking the change. This retires the bottom strip: the shell keeps
its default `hide-formal` class forever, so the old `<section class="shell-formal">`
stays in the file, hidden and harmless — do not delete it (it is the content backup
and other code may reference its ids).

**Patch 3 — scene hook.** Reference anchor (sim IIFE boot tail):
```
if(Shell.totalSteps > 0) onStep(Shell.step);
renderMath();
})();
```
→ insert before `})();`:
```
window.__physicsHooks = { scene:applyInquiryScene };
```
The insertion MUST be inside the same scope where the scene function is defined.
If the boot tail differs, find the final `})();` of the `<script>` block that defines
`applyInquiryScene` and anchor on the last few unique lines before it.

**Patch 4 — display font.** After the sim's first stylesheet `<link>` in `<head>`,
add:
```
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,600;0,700;1,500&display=swap">
```
`fonts.googleapis.com` is the ONLY external stylesheet host that hosted pages allow.
The layer's CSS already falls back to Georgia if the font fails to load.

## C. Fallbacks when an anchor differs

- Widen the anchor with surrounding lines until it is unique; never loosen to a
  regex over code you haven't read.
- If the sim has no `applyInquiryScene`, find whatever function the guided inquiry
  uses to set a scene (frame + params + optional launch). Expose that. If nothing
  exists, expose the minimal primitives instead
  (`{setFrame, sliders:{...}, launch, setPlaying}`) and adapt the layer's `SHOW`
  handler accordingly — but prefer the sim's own scene function: it already handles
  resets and repaint ordering correctly.
- If the theme selector scheme differs, adapt the theme-repair module's two sync
  functions; the principle (button writes the `<html>` attribute; a MutationObserver
  syncs the body class back) stays the same.
- Anything beyond these four patches is out of scope. If the sim seems to need more
  invasive change, stop and tell the user what and why instead of improvising.

## D. Content mining

Before writing new copy, extract from the sim itself:
- every equation in the formal strip (LaTeX strings if a `renderMath`-style map
  exists — copy them verbatim as the starting point for `spec.py`);
- the one-sentence concept and the named misconception from the info modal;
- real-world numbers the sim already commits to (they were chosen deliberately);
- the sim's vocabulary (e.g. "ground camera", "rotating frame") — the sheet must
  speak the same language as the sim's labels and legend.
