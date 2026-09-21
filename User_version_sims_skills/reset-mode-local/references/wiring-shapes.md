# Wiring shapes and verbatim patch templates

Every user-version sim has TWO reset listeners on the same button: the
shell/sim listener (restores the experiment) and a later user-version (uv)
hook (`setTimeout(__fullReset, 0)`), which is what forced Guided Inquiry.
The fix leaves the first mostly alone and makes the second mode-local.

Identify the shape with these greps, then apply the matching template.

## Identifying greps

```
grep -n "reset.addEventListener\|rst.addEventListener\|resetBtn.addEventListener\|shellReset.addEventListener" sim.html
grep -n "setLectureMode(true); } last" sim.html      # PP one-liner?
grep -c "function cgShow" sim.html                    # 1 => cgShow, 0 => local show(n)
grep -n "Shell.init(" sim.html                        # cfg: autoplay / timeless
grep -n "let playing=" sim.html                       # shell boot play state
grep -n "window.__fullReset" sim.html                 # uv hook + fullReset body
grep -c "__cgPrepare" sim.html
```

## Shape A — v2 shell with cfg tri-state (CM_sims/Condensed_matter_sims, some others)

Marker: shell has `CFG_DEFAULTS` with `resumeOnReset` tri-state; uv layer has
`function cgShow`. Shell reset listener is clean (no mode switch).

Patch 1 — uv hook (anchor is exact; `shellReset` may be named `resetBtn`/`rst`):

OLD
```
  if(shellReset) shellReset.addEventListener('click', ()=>{ setTimeout(()=>{ if(window.__fullReset) window.__fullReset(); }, 0); });
```
NEW
```
  /* Mode-local reset: the shell listener already restored the experiment.
     Restart only the CURRENT mode's flow — never switch modes. */
  if(shellReset) shellReset.addEventListener('click', ()=>{ setTimeout(()=>{
    if(cgOn){
      if(cgAuto) setCgAuto(false);
      if(cgVoice) cgVoice.stop();
      cgStep = 0; cgMax = 0;
      if(window.__cgPrepare) window.__cgPrepare();
      cgShow(0);
    } else if(giBtn.classList.contains('active')){
      if(window.__fullReset) window.__fullReset();
    }
  }, 0); });
```

Patch 2 — boot parity, ONLY if `Shell.init` cfg has `autoplay:false` or
`timeless:true` (both boot paused): add `resumeOnReset:'pause'` to the cfg
object. Sims that boot playing need nothing.

Precedents: sc-ising-order, qs-rabi-bloch-sphere, mc-random-walker (paused);
cm-bloch, cm-phonon (playing); crystal-diffraction, kronig-penney,
heat-capacity, identical-counting (timeless→'pause').

## Shape B — older harvest shell, uv layer uses local `show(n)` (most SR, some CM)

Marker: `function cgShow` count 0; CG stepper advanced via a local
`show(cgStep+1)`; shell reset listener hardcodes `setPlaying(true)` or
`setPlaying(false)` (no cfg tri-state).

Patch 1 — uv hook: same template as Shape A but call `show(0)` instead of
`cgShow(0)`.

Patch 2 — boot parity: find the boot play state PER MODE with the oracle's
fresh-entry snapshots (some sims are asymmetric — L11 light clock plays in
free/CG but pauses in GI; L12 twin pauses everywhere). If boot is paused and
the shell listener says `setPlaying(true)`, flip it to `false` with a short
comment. If asymmetric with playing boot in free/CG, leave `true` (the GI
branch's fullReset path handles the GI pause).

Precedents: L11-s2 (playing, no change), L12-s2 twin (paused → false),
L17 damped HO (playing, no change), Galperins_Billiard (paused, already false).

## Shape C — PP one-liner (PP_sims; the shell listener ITSELF forces lecture)

Marker: shell listener is
`onReset(); if(inqCards().length){ inqStep=0; setLectureMode(true); } last=performance.now(); setPlaying(X);`

Patch 1 — strip ONLY the mode switch from the shell listener:

NEW
```
    /* Mode-local reset: restore the experiment only — never force Lecture
       mode. The user-version layer restarts the current mode's own flow. */
    if(reset) reset.addEventListener('click',()=>{ onReset(); last=performance.now(); setPlaying(X); });
```
where X follows boot parity (grep `let playing=`; wu boots paused → false,
build-a-baryon boots playing → true).

Patch 2 — uv hook: Shape A template (PP uv layers have `cgShow`).

Precedents: build-a-baryon, wu-experiment, and the whole 15-sim batch
(dirac, standard-model, feynman-sandbox, gold-foil, how-to-make, eight-fold,
detector-hq, scale, spin-helicity, wine-bottle, cloud-chamber, collider).

## Shape D — QM pre-shell generation (QM_sims)

Marker: no `Shell` object; sim-side reset listener on a sim-specific button
(`#reset`, `#reset-btn`, `#resetBtn` — grep `id="reset`); uv hook
`$('<btn>').addEventListener('click', ()=>{ setTimeout(__fullReset, 0) })`;
`inqStep` is a plain uv-layer variable.

Patch 1 — uv hook: Shape A template on the sim's button id (QM uv layers
have `cgShow`).

Patch 2 — STALE-STEP CHECK (hazard H3, hit on BOTH QM sims done by hand):
if `__fullReset` ends `... setGi(true); inqShow(0);` insert `inqStep = 0;`
immediately before `setGi(true)` with the standard comment.

Play state: these sims manage their own animation flags; their reset
listeners already restore them (both precedents boot playing). Oracle's
`Shell.playing` reads null — that is fine.

Precedents: infinite-potential-well, Double-slit-experiment,
2d_wavefunction_collapse_measurement, A(k)-vs-k-plot.

## Deviants

If none of the greps match cleanly (e.g. ma-perturbation-breakdown.opus-5 —
non-standard shell), map the reset path from scratch, keep the same product
rule, and say so in the report. Never guess an anchor: widen until unique.
