# Wiki SR Simulation — Global Shell Design Guide

How to convert every sim in this folder to the shared design: a **global cream
top bar**, a **dynamic sidebar** (guided-inquiry stepper → always-present
controls), the **design-system skin** (dark/light), an **info modal**, and a
**toggleable formal region**.

- **Stylesheet:** `simulation-shell.css` (drop-in; do not edit per sim)
- **Reference implementation:** `boost-hyperbolic-rotation-shell.html` — a fully
  converted sim. When in doubt, copy its structure.
- **Golden rule:** the shell chrome (top bar, sidebar wrappers, stepper, info
  modal, runtime) is **fixed and identical** across sims. You only fill in the
  SIM-specific regions. Never rename a shell class/ID — the runtime wires them by
  name.

---

## 1. The design at a glance

```
┌─────────────────────────────────────────────────────────────┐
│  Title · ⓘ Info · ☾ Theme        ⛶ Max · ∑ Formal · Speed · ↻ · ⏸   │  ← GLOBAL top bar (cream, 62px)
├───────────────────────────────────────────┬─────────────────┤
│                                            │  GUIDED INQUIRY  │  ← sidebar zone 1
│                                            │  ● ○ ○ ○ ○       │     (stepper: dots +
│              HERO                           │  [ step card ]   │      one card at a time +
│        (canvas / plot-box)                 │      [ Next → ]  │      Skip ✕ / Next / Finish)
│                                            │ ─────────────────│
│                                            │  CONTROLS + STATS│  ← sidebar zone 2
│                                            │  [ sliders ]     │     (always present,
│                                            │  [ readouts ]    │      usable from load)
├───────────────────────────────────────────┴─────────────────┤
│  FORMAL (equations, off by default — ∑ Formal toggles it)     │
└─────────────────────────────────────────────────────────────┘
```

**Key behavioural principles**
1. **Top bar = global only.** Transport + Info/Theme/Maximize/Formal/Speed.
   No sim-specific sliders here.
2. **Sidebar is dynamic.** Guided inquiry sits on top; the sim's own controls +
   stats sit below and are live from the first paint. Finishing or skipping the
   inquiry collapses zone 1 to a slim restore bar so controls get the space.
3. **The shell owns the mechanics.** The `Shell` runtime drives the animation
   loop, Play/Pause, Reset, Speed, Maximize, theme, info modal, panel collapse,
   and the entire guided-inquiry stepper (dots + Next/Finish + Skip). You never
   wire those — you only supply `onFrame/onReset/onResize/onStep` and the content.
4. **Playable from load.** Every slider and Play works with zero clicks; the
   stepper gates only its own Next button, never the simulation.

---

## 2. Anatomy mapping (old sim → shell)

Every sim in this folder has the same parts. Move each into its shell home:

| In the original sim                                   | Goes into                                            |
|-------------------------------------------------------|------------------------------------------------------|
| `<h1>` title + subtitle                               | `.shell-title` in the header (subtitle in a `<span>`)|
| `<canvas>` + its wrapper                              | `.shell-hero` → wrap in `<div class="plot-box">`     |
| Play / Pause / Reset buttons                          | **Delete** — use the shell's `#shell-play`/`#shell-reset` |
| Speed control (if any)                                | **Delete** — use the shell's `#shell-speed`          |
| The `.pred` / prediction block                        | Guided-inquiry **step cards** in `#inq-cards`        |
| Parameter sliders (β, v, etc.)                        | `#aside-controls` → `.ctrl-box--slider`              |
| View toggles / mode switches (grid, β/φ, classic…)    | `#aside-controls` → `.ctrl-box`                      |
| Readouts / stat grids / invariant panels             | `#aside-controls` → `.ctrl-box` with `.stat-row`s    |
| "Show formal tools" checkbox                          | **Delete** — use the shell's `∑ Formal` (`#toggle-formal`) |
| KaTeX equations (the `#formal` block)                 | `.shell-formal` region                               |
| Physics + drawing JS                                  | keep verbatim; rewire the loop to `onFrame` (see §5) |

---

## 3. HTML skeleton (copy verbatim; fill the `{{…}}` regions)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{TITLE}}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<link rel="stylesheet" href="simulation-shell.css">
<style>
/* {{SIM_CSS}} — small, sim-specific only (canvas cursor, formal grid, etc.) */
</style>
</head>
<body>
<div id="shell" class="hide-formal">

  <!-- Info modal (shell-wired: opens on ⓘ, closes on ✕ / backdrop / Esc) -->
  <div id="shell-info-modal" class="shell-modal-backdrop">
    <div class="shell-modal" role="dialog" aria-modal="true">
      <div class="shell-modal-head">
        <h2>{{INFO_TITLE}}</h2>
        <button id="shell-info-close" class="shell-btn shell-modal-close" title="Close (Esc)">✕</button>
      </div>
      <div class="shell-modal-body">
        {{INFO_ROW_HTML}}
        {{INFO_PRINCIPLES_HTML}}
      </div>
    </div>
  </div>

  <!-- HEADER — GLOBAL ONLY. Canonical order: title · Info · Theme · Maximize ·
       Formal · Speed · Reset · Play. Drop ∑ Formal if no formal region; drop
       Speed if there is no time-animation. Add nothing sim-specific here. -->
  <header class="shell-header">
    <div class="shell-title">{{HEADER_TITLE_HTML}}</div>
    <div class="shell-group">
      <button id="shell-info" class="shell-btn" title="About this simulation">ⓘ Info</button>
      <button id="shell-theme" class="shell-btn" title="Toggle light / dark theme">☾</button>
    </div>
    <div class="shell-controls">
      <div class="shell-group">
        <button id="shell-maximize" class="shell-btn">⛶ Maximize</button>
        <button id="toggle-formal" class="shell-btn">∑ Formal</button>
        <label style="font-size:11px;">Speed</label>
        <select id="shell-speed" class="shell-select">
          <option value="0.25">0.25×</option><option value="0.5">0.5×</option>
          <option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option>
        </select>
      </div>
      <div class="shell-sep"></div>
      <div class="shell-group">
        <button id="shell-reset" class="shell-btn">↻ Reset</button>
        <button id="shell-play" class="shell-btn">⏸ Pause</button>
      </div>
    </div>
  </header>

  <!-- HERO — the simulation -->
  <main class="shell-hero">
    {{HERO_HTML}}
  </main>

  <!-- ASIDE — dynamic sidebar -->
  <aside class="shell-aside">
    <div id="aside-inquiry" class="aside-zone">
      <div class="aside-zone-head">
        <h3>Guided Inquiry</h3>
        <button id="aside-inquiry-skip" class="shell-btn aside-skip" title="Skip the guided inquiry">Skip ✕</button>
      </div>
      <div id="inq-dots" class="inq-dots"></div>
      <div id="inq-cards" class="aside-zone-body">
        {{ASIDE_INQUIRY_HTML}}
      </div>
      <div class="inq-nav"><button id="inq-next" class="shell-btn primary">Next →</button></div>
    </div>
    <button id="aside-inquiry-restore" class="aside-restore" title="Revisit the guided inquiry">▸ Guided inquiry</button>
    <div id="aside-controls" class="aside-zone">
      {{ASIDE_CONTROLS_HTML}}
    </div>
  </aside>

  <!-- FORMAL — equations, off by default -->
  <section class="shell-formal">
    {{FORMAL_HTML}}
  </section>

</div>

<script>
/* SHELL RUNTIME — paste verbatim from §4 (or copy from the reference file). */
/* … Shell IIFE … */

/* SIM — your physics/drawing + Shell.init (see §5). */
/* {{SIM_JS}} */
</script>
</body>
</html>
```

> The `hide-formal` class on `#shell` and the un-activated `#toggle-formal` mean
> formal tools start **hidden** — keep it that way.

---

## 4. The Shell runtime (paste verbatim)

This block is identical in every sim. It is the same runtime used by
`boost-hyperbolic-rotation-shell.html`; copy it from there, or from here:

```js
const Shell = (function(){
  const root = document.getElementById('shell');
  let onFrame=()=>{}, onReset=()=>{}, onResize=()=>{}, onStep=()=>{};
  let playing=true, speed=1, last=performance.now(), started=false;
  let inqStep=0, inqTotal=0;

  function loop(now){
    let dt=(now-last)/1000; if(dt>0.1)dt=0.1; last=now;
    if(playing) onFrame(dt*speed);
    requestAnimationFrame(loop);
  }
  function refit(){ onResize(); last=performance.now(); }

  function setPlaying(p){
    playing=p; last=performance.now();
    const b=document.getElementById('shell-play');
    if(b){ b.textContent = p ? '⏸ Pause' : '▶ Play'; b.classList.toggle('paused', !p); }
  }
  function setMaximized(on){
    root.classList.toggle('shell-max', on);
    const maxBtn=document.getElementById('shell-maximize');
    if(maxBtn){ maxBtn.classList.toggle('active', on); maxBtn.textContent = on ? '⤡ Minimize' : '⛶ Maximize'; }
    requestAnimationFrame(refit);
  }
  function setInquiryCollapsed(on){ root.classList.toggle('inquiry-collapsed', on); requestAnimationFrame(refit); }

  function inqCards(){ return root.querySelectorAll('#inq-cards .inq-step'); }
  function inqShow(n){
    const cards=inqCards(); if(!cards.length) return;
    inqStep=Math.max(0,Math.min(n,cards.length-1));
    cards.forEach((c,i)=>c.classList.toggle('active',i===inqStep));
    root.querySelectorAll('#inq-dots .inq-dot').forEach((d,i)=>{ d.classList.toggle('active',i===inqStep); d.classList.toggle('done',i<inqStep); });
    const next=document.getElementById('inq-next');
    if(next){ const card=cards[inqStep];
      const gated = card && card.hasAttribute('data-gate') && !card.hasAttribute('data-ready');
      next.disabled = gated; next.textContent = (inqStep>=cards.length-1) ? 'Finish' : 'Next →'; }
    onStep(inqStep); requestAnimationFrame(refit);
  }
  function inqNext(){ const cards=inqCards(); if(inqStep>=cards.length-1) setInquiryCollapsed(true); else inqShow(inqStep+1); }
  function stepReady(){ const card=inqCards()[inqStep]; if(card) card.setAttribute('data-ready',''); const next=document.getElementById('inq-next'); if(next) next.disabled=false; }

  function wire(){
    const play=document.getElementById('shell-play');
    const reset=document.getElementById('shell-reset');
    const spd=document.getElementById('shell-speed');
    const maxBtn=document.getElementById('shell-maximize');
    const skip=document.getElementById('aside-inquiry-skip');
    const restore=document.getElementById('aside-inquiry-restore');
    const tFormal=document.getElementById('toggle-formal');

    if(play) play.addEventListener('click',()=>setPlaying(!playing));
    if(reset) reset.addEventListener('click',()=>{ onReset(); last=performance.now(); setPlaying(true); });
    if(spd) spd.addEventListener('change',e=>{ speed=parseFloat(e.target.value)||1; });
    if(maxBtn) maxBtn.addEventListener('click',()=>setMaximized(!root.classList.contains('shell-max')));

    const infoBtn=document.getElementById('shell-info');
    const infoModal=document.getElementById('shell-info-modal');
    const infoClose=document.getElementById('shell-info-close');
    function setInfo(open){ if(infoModal) infoModal.classList.toggle('open',open); }
    if(infoBtn) infoBtn.addEventListener('click',()=>setInfo(true));
    if(infoClose) infoClose.addEventListener('click',()=>setInfo(false));
    if(infoModal) infoModal.addEventListener('click',e=>{ if(e.target===infoModal) setInfo(false); });

    const themeBtn=document.getElementById('shell-theme');
    if(themeBtn) themeBtn.addEventListener('click',()=>{ const light=document.body.classList.toggle('light-theme'); themeBtn.textContent = light ? '☀' : '☾'; requestAnimationFrame(refit); });

    document.addEventListener('keydown',e=>{ if(e.key!=='Escape') return;
      if(infoModal && infoModal.classList.contains('open')) setInfo(false);
      else if(root.classList.contains('shell-max')) setMaximized(false); });

    if(skip) skip.addEventListener('click',()=>setInquiryCollapsed(true));
    if(restore) restore.addEventListener('click',()=>setInquiryCollapsed(false));
    const inqNextBtn=document.getElementById('inq-next');
    if(inqNextBtn) inqNextBtn.addEventListener('click',inqNext);
    const cardsHost=document.getElementById('inq-cards');
    if(cardsHost) cardsHost.addEventListener('click',e=>{ const ch=e.target.closest('.choice'); if(!ch) return; const card=ch.closest('.inq-step'); if(card && card.classList.contains('active')) stepReady(); });
    if(tFormal) tFormal.addEventListener('click',()=>{ const hidden=root.classList.toggle('hide-formal'); tFormal.classList.toggle('active',!hidden); requestAnimationFrame(refit); });

    root.querySelectorAll('.shell-panel-head').forEach(head=>{ head.addEventListener('click',()=>{ head.parentElement.classList.toggle('collapsed'); requestAnimationFrame(refit); }); });
    let rt; window.addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(refit,80); });
  }

  return {
    init(opts){
      onFrame=opts.onFrame||onFrame; onReset=opts.onReset||onReset; onResize=opts.onResize||onResize; onStep=opts.onStep||onStep;
      wire();
      const cards=inqCards(); inqTotal=cards.length;
      if(inqTotal>0){ const dots=document.getElementById('inq-dots'); if(dots){ dots.innerHTML=''; for(let i=0;i<inqTotal;i++){ const d=document.createElement('span'); d.className='inq-dot'; dots.appendChild(d); } } inqShow(0); }
      else { root.classList.add('no-inquiry'); }
      onResize(); onReset(); last=performance.now();
      if(!started){ started=true; requestAnimationFrame(loop); }
    },
    get speed(){return speed;}, get playing(){return playing;},
    get step(){return inqStep;}, get totalSteps(){return inqTotal;},
    stepReady, setPlaying, refit
  };
})();
```

---

## 5. The runtime contract — the 4 hooks you implement

```js
Shell.init({ onFrame, onReset, onResize, onStep });
```

- **`onFrame(dt)`** — called every animation frame; `dt` is already
  speed-multiplied and clamped (seconds). Advance state and redraw. Only called
  while playing.
- **`onReset()`** — restore all state to defaults and draw once. The shell also
  forces Play on after reset (Reset doubles as replay-from-start).
- **`onResize()`** — re-fit canvases (DPR + `getBoundingClientRect`) and redraw.
  The shell calls this on every layout change (maximize, panel collapse, theme
  switch, inquiry collapse, viewport resize).
- **`onStep(i)`** *(optional)* — called with the 0-based inquiry step on load and
  on every advance. Use it to evolve the scene per step (reveal a second frame,
  switch a readout, pause on the predict step). Read `Shell.step` in your draw
  code too.

Other helpers: `Shell.setPlaying(bool)`, `Shell.refit()`, `Shell.stepReady()`,
`Shell.step`, `Shell.totalSteps`, `Shell.playing`, `Shell.speed`.

**Rewiring the old loop.** Replace the sim's own
`let playing; function loop(){…requestAnimationFrame(loop)}` with an `onFrame`.
Delete its Play/Pause/Reset button handlers. A slider drag typically calls
`Shell.setPlaying(false)` then redraws (scrub while paused). Example:

```js
function onFrame(dt){ phase += dt*0.5; /* advance */ draw(); }
function onReset(){ /* zero state */ draw(); }
function onResize(){ draw(); }
slider.addEventListener('input',()=>{ Shell.setPlaying(false); /* set param */ draw(); });
Shell.init({ onFrame, onReset, onResize });
```

---

## 6. Guided inquiry — the step cards you write

Fill `{{ASIDE_INQUIRY_HTML}}` with a sequence of `<div class="inq-step">` cards,
one per step, in order. The shell shows one at a time, builds the dots, and
drives **Next → / Finish** (Finish collapses the inquiry — there is **no Hide**).
You write **only the cards**; never build the dots, Next, Finish, Skip, or restore.

```html
<!-- A gated PREDICT card: Next waits until the student picks a choice -->
<div class="inq-step" data-gate>
  <h4>1 · Predict …</h4>
  <p>Question prose …</p>
  <button class="choice" data-correct="0" data-fb="Rebuttal shown only if picked …">A) wrong (misconception)</button>
  <button class="choice" data-correct="1" data-fb="Why it's right … <strong>the key fact</strong>.">B) correct</button>
  <button class="choice" data-correct="0" data-fb="Another rebuttal …">C) wrong</button>
  <div class="predict-eval"></div>
</div>

<!-- An ungated OBSERVE card: Next is enabled immediately -->
<div class="inq-step">
  <h4>2 · Watch …</h4>
  <p>Press ▶ and watch …</p>
</div>
```

**Authoring rules**
- **4–6 cards, fundamental → full sim.** Typical arc: predict → observe → verify
  → introduce the next layer/frame (predict first) → observe → resolve.
- **`data-gate`** on any card whose Next should wait for an answer. The shell
  auto-enables Next when the student clicks any `.choice` in that card. (For a
  "watch it first" gate, call `Shell.stepReady()` when done.)
- **Encode the misconception as a wrong `.choice`**, with its rebuttal in
  `data-fb`, revealed only when picked. **Never** add a standing "common
  misconception" text card — it teaches the error to students who didn't hold it.
- **The scene evolves via `onStep(i)`** (in your draw code), not by hiding cards.

**Prediction feedback handler** (generic; add once in your SIM JS):

```js
document.querySelectorAll('#inq-cards .inq-step').forEach(card=>{
  const evalBox=card.querySelector('.predict-eval');
  const choices=card.querySelectorAll('.choice');
  choices.forEach(ch=>ch.addEventListener('click',()=>{
    if(card.dataset.answered) return; card.dataset.answered='1';
    const correct=ch.dataset.correct==='1';
    choices.forEach(c=>{ c.disabled=true;
      if(c.dataset.correct==='1') c.classList.add('correct');
      else if(c===ch) c.classList.add('wrong'); else c.classList.add('dim'); });
    if(evalBox){ evalBox.innerHTML=ch.dataset.fb||''; evalBox.classList.add('show', correct?'correct':'wrong'); }
  }));
});
```

Add to your `{{SIM_CSS}}` so the feedback box hides until answered:

```css
.inq-step h4{margin:0 0 8px;font-size:14px;font-weight:600;color:var(--text);}
.inq-step p{margin:0 0 12px;font-size:14px;line-height:1.55;color:var(--muted);}
.inq-step .predict-eval{display:none;}
.inq-step .predict-eval.show{display:block;}
```

If a sim has **no** inquiry, leave `{{ASIDE_INQUIRY_HTML}}` empty — the shell
hides the whole zone automatically.

---

## 7. Controls + stats (design-system components)

Fill `{{ASIDE_CONTROLS_HTML}}` with `.shell-panel` cards. Inside, use the
component classes (the shell styles them; don't invent styling):

```html
<div class="shell-panel">
  <div class="shell-panel-head"><h3>Controls</h3><span class="shell-caret">▾</span></div>
  <div class="shell-panel-body">

    <!-- Slider -->
    <div class="ctrl-box ctrl-box--slider">
      <div class="ctrl-box-head"><span class="ctrl-box-label" id="vLbl">v = 0.60c</span></div>
      <div class="ctrl-slider-row"><input type="range" id="v" min="0" max="0.99" step="0.01" value="0.6"></div>
      <div class="control-range"><span>0</span><span>0.99c</span></div>
    </div>

    <!-- A toggle / mode switch (a genuine sim control, not a shell duplicate) -->
    <div class="ctrl-box">
      <div class="stat-row"><span class="stat-label">Show gridlines</span><input type="checkbox" id="grid" checked></div>
    </div>

  </div>
</div>

<div class="shell-panel">
  <div class="shell-panel-head"><h3>Readouts</h3><span class="shell-caret">▾</span></div>
  <div class="shell-panel-body">
    <div class="ctrl-box" id="readouts">
      <div class="stat-row"><span class="stat-label">γ</span><span class="stat-value">1.25</span></div>
      <div class="stat-row"><span class="stat-label">Δt′</span><span class="stat-value">2.50 s</span></div>
    </div>
  </div>
</div>
```

Panels collapse when their head is clicked (shell-wired). Sliders/toggles must be
**live from load**. Show the physical quantity with frame + units
("v = 0.87c (ground frame)"), not a bare ratio.

---

## 8. Formal region + KaTeX

Put equations in `.shell-formal` (hidden until ∑ Formal). Render them **after**
KaTeX loads — the shell loads KaTeX with `defer`, so guard it:

```js
function K(id,tex){ const el=document.getElementById(id); if(el&&window.katex) katex.render(tex,el,{throwOnError:false,displayMode:true}); }
function renderFormal(){ if(!window.katex) return; K('eq1', "…"); K('eq2', "…"); }
if(window.katex) renderFormal(); else window.addEventListener('DOMContentLoaded', renderFormal);
```

A two-column formal layout (add to `{{SIM_CSS}}`):

```css
.formal-grid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:1000px){.formal-grid{grid-template-columns:1fr 1fr;}}
.eq-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px 12px;}
.eq-lab{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-mute);margin-bottom:6px;}
```

---

## 9. Info modal

Fill three placeholders (instructor-facing — a plain table is fine):

- `{{INFO_TITLE}}` — `About: <sim title>`
- `{{INFO_ROW_HTML}}` — an `<h3>Source</h3>` + `<dl class="shell-info-dl">` of
  Concept / Serves / Inquiry / Misconception.
- `{{INFO_PRINCIPLES_HTML}}` — an `<h3>Pedagogy principles applied</h3>` +
  `<table class="shell-info-table">` (`<th>ID</th><th>Principle</th><th>How it
  shows up here</th>`), one row per principle the sim honors.

See `boost-hyperbolic-rotation-shell.html` for the exact markup.

---

## 10. Theming, colours & fonts

- **Use tokens, not hex.** For all SIM CSS use `var(--bg)`, `var(--surface)`,
  `var(--text)`, `var(--muted)`, `var(--accent)`, `var(--ctrl-bg)`,
  `var(--border)`, etc., so both themes work. For canvas colours read the token
  once (`getComputedStyle(document.documentElement).getPropertyValue('--accent')`)
  and re-read in `onResize`/redraw so a theme switch recolours the canvas.
  *(The SR frame colours `--rest` / `--moving` / `--photon` are intentionally
  constant across themes — keep them for frame identity.)*
- **The cream top bar is theme-independent** by design — leave it.
- **Fonts.** `simulation-shell.css` declares `@font-face` for `DMSansUser` +
  `JetBrainsMonoNums` pointing at relative `.ttf` files. Two options:
  1. **Linked stylesheet:** keep the `.ttf` files next to the HTML.
  2. **Fully self-contained single file** (what the reference does): inline
     `simulation-shell.css` into a `<style>` and replace the two `@font-face`
     `src:url('…ttf')` with base64 `src:url(data:font/ttf;base64,…)`. Then the
     HTML needs no external files at all.
  Either way, use `var(--font-sans)` for text and `var(--font-nums)` for numerals.

---

## 11. Pedagogy & quality bar (keep the physics honest)

- **One concept per sim**, statable in one sentence.
- **Fewest objects (A2):** open with the minimum the concept needs; no metric
  cards / counts that no step reads.
- **Numbers earn their place (C):** every visible number is read, predicted, or
  compared by some step.
- **Invariant panels are scoped (J):** show an invariant readout **only** in sims
  whose lesson *is* invariance (interval, metric, inner product). Turn it **off**
  for dilation / contraction / relative-velocity sims.
- **Misconceptions are structural (H1):** encode them in wrong choices, never a
  standing text card.
- **Formal off by default (A3):** ship `hide-formal`; the student turns it on.
- **Physics honesty — do not animate false physics:**
  - **Never auto-sweep a velocity / β / v/c over time.** A v/c that ramps 0→1→0
    implies an *accelerating* frame — but SR frames are inertial. Expose velocity
    as a **static slider** the student sets; the scene updates live on drag. A
    slider-driven diagram with no time-animation is correct — don't invent motion
    to keep Play busy (drop Speed/Play if there's nothing to animate).
    *(Note: `boost-hyperbolic-rotation-shell.html` deliberately keeps the
    original's auto-sweep to stay faithful to that specific sim; for new
    conversions, prefer the static-slider pattern.)*
  - **A function plot is not a particle** — don't animate a dot travelling a
    curve (p vs v); tie any marker to the student's slider value.
  - **No proper-time clock on a photon** (dτ = 0 on a null worldline).
  - **Re-describing ≠ moving:** when a control changes the reference *frame*,
    relabel axes (S→S′) and redraw the grid so it's clearly a frame change.
- **Interval sign convention:** use `ds² = (cΔt)² − (Δx)²` consistently
  (timelike > 0, spacelike < 0, lightlike 0) across every sim.
- **Readable text:** canvas labels ≥ 12px, prose ≥ 14px; on-canvas text is
  labels only — explanations live in the side panels.

---

## 12. Conversion checklist (per sim)

- [ ] Link `simulation-shell.css`; move the sim's own CSS into a small `<style>`.
- [ ] Wrap the page in the `#shell` skeleton (header / hero / aside / formal).
- [ ] Title + subtitle into `.shell-title`; delete the old `<h1>`/`<h2>`.
- [ ] Canvas into `.shell-hero` inside a `.plot-box` (+ optional `.plot-title` / `.legend`).
- [ ] Delete the sim's Play/Pause/Reset/Speed/formal-toggle buttons.
- [ ] Rewire the loop: `onFrame` / `onReset` / `onResize`, then `Shell.init(...)`.
- [ ] Turn the prediction block into 4–6 `.inq-step` cards (gate the predicts).
- [ ] Add the generic prediction-feedback handler + its CSS.
- [ ] Move sliders/toggles/readouts into `#aside-controls` `.shell-panel`s.
- [ ] Move equations into `.shell-formal`; guard KaTeX for deferred load.
- [ ] Fill the three info-modal placeholders.
- [ ] Verify: loads playable (Play + every slider work with zero clicks), Next
      gates only on predicts, Finish collapses the inquiry, Maximize/Formal/Theme
      all present and working, no console errors.

---

**Reference:** `boost-hyperbolic-rotation-shell.html` is a complete, working
example of every rule above. Copy from it whenever this guide is ambiguous.
