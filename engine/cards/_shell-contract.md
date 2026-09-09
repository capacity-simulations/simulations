# SHELL CONTRACT (condensed — the shell module card has the full API)

The Shell owns the runtime: rAF loop, play/pause/speed/reset, theme, modals,
inquiry stepper, lecture mode. The sim only implements callbacks. Boot ONCE,
after the DOM exists:

    Shell.init({
      onFrame(dt) { advance(dt); draw(); },   // dt in s, speed-scaled
      onReset()   { /* re-establish initial state */ },
      onResize()  { /* refit canvases, redraw */ },
      onStep(i)   { /* inquiry step i active (0-based) */ },
      onComplete(){ /* inquiry finished — free exploration */ },
      cfg: { /* all optional — see note below */ },
    });

cfg flags: full default list under init opts.cfg in the shell module card.

Frame modes:
- **Variable dt (default):** onFrame(dt) gets the clamped wall-clock delta;
  for ODE/closed-form sims.
- **Fixed dt:** pass `frame:{mode:'fixed', dt, maxSubsteps}` — accumulator
  loop calls onFrame with a CONSTANT dt. REQUIRED for PDE / split-operator /
  stiff-integrator sims: dt must never follow the display's frame rate.
  Never build your own loop either way.
In both modes dt is wall-clock SECONDS (speed-scaled); mapping it to
sim/natural time units is the sim's job.

DOM ids are wired by name (absent element ⇒ feature inert; full id list +
root classes in the shell module card); never rename or re-purpose them.
Skeleton:

    <body><div id="shell">          <!-- mode classes land on #shell -->
     <header class="shell-header">…buttons/speed…</header>
     <main class="shell-hero">canvas + #play-hint</main>
     <aside class="shell-aside">
      <div class="aside-zone" id="aside-inquiry">
       <div id="inq-dots"></div>
       <div id="inq-cards"><div class="inq-step">…</div>…</div>
       <div class="inq-nav">#inq-prev #inq-pager-next (pager arrows) ·
         #inq-next (primary Next/Finish)</div>
      </div>
      <button id="aside-inquiry-restore"></button><!-- sibling AFTER zone -->
      <div class="aside-zone">.shell-panel controls/readouts…</div>
     </aside>
     <section class="shell-formal">…</section> · #shell-info-modal last
    </div></body>

The build injects shell.css into `<style id="engine-css">` automatically —
never paste it; your own style tag holds sim CSS only.

Params → controls: per manifest param emit `<input type="range" id="{id}"
min max step value>` + a readout span, then
`Engine.bind.bindSlider(state,'sigma','sigma',{out:'sigmaVal',onChange:...})`.

Physics reads time only from onFrame's dt — never the wall clock. Drive play
state only via Shell methods (setPlaying, stepReady, refit, ...).
