# Canonical implementation — Controls Guide (overlay) + two-button template

Every block below is verbatim from a bundled example:
`examples/Double-slit-experiment.full-template.html` (standalone sim with its
own top bar; §1–3) and `examples/L1-Solar_System_Orbits.welcome-center.html`
(L-series shell; §4). `examples/L2-Newtons-laws.all-three-skills.html` is the
dry-run proof on an untouched prod sim (§4b). Copy; adapt only ADAPT parts.

## 1. CSS — insert before `</style>`

Guide-button wrapper (its OWN wrapper beside the sim's action box; text-only
labels; ADAPT the `--text-main`-free colours only if the sim's top bar is dark):

```css
        .guide-actions{display:flex;gap:8px;align-items:center;margin-left:auto;flex-shrink:0;}
        .top-bar-actions{margin-left:12px;}
        .guide-actions .btn-guide{height:36px;padding:0 14px;background:#fff;color:#334155;}
        .guide-actions .btn-guide.active{background:#065f46;color:#fff;border-color:#065f46;}
```

Zone hide rule — ADAPT the selector to the sim's inquiry-zone id:

```css
        .gi-off #inq-zone{display:none !important;}
```

Overlay guide (purple callout + purple nav, veil/hide classes, glow). Light-theme rules
target BOTH `html[data-theme="light"]` and `body.light-theme` — no
adaptation unless the sim uses a third hook.

```css
        .cg-hidden{display:none !important;}
        .cg-veiled{visibility:hidden !important;pointer-events:none;}
        .cg-glow{outline:1px solid #10b981;border-radius:8px;
          box-shadow:0 0 0 1px #10b981,0 0 14px rgba(16,185,129,.55);
          animation:cgPulse 1.6s ease-in-out infinite;}
        @keyframes cgPulse{0%,100%{box-shadow:0 0 0 1px #10b981,0 0 10px rgba(16,185,129,.4);}
          50%{box-shadow:0 0 0 2px #10b981,0 0 20px rgba(16,185,129,.7);}}
        .cg-callout{position:fixed;z-index:4000;max-width:260px;background:#0d1522;color:#e2e8f0;
          border:1.5px solid #8b5cf6;border-radius:10px;padding:10px 12px;box-shadow:0 10px 26px rgba(0,0,0,.45);font-family:var(--font-family);}
        .cg-callout h5{margin:0 0 4px;font-size:0.8rem;font-weight:700;color:#a78bfa;}
        .cg-callout p{margin:0;font-size:0.78rem;line-height:1.45;}
        .cg-arrow{position:absolute;width:12px;height:12px;background:#0d1522;transform:rotate(45deg);}
        .cg-callout.arrow-top .cg-arrow{top:-7px;border-top:1.5px solid #8b5cf6;border-left:1.5px solid #8b5cf6;}
        .cg-callout.arrow-bottom .cg-arrow{bottom:-7px;border-bottom:1.5px solid #8b5cf6;border-right:1.5px solid #8b5cf6;}
        .cg-callout.arrow-right .cg-arrow{right:-7px;border-top:1.5px solid #8b5cf6;border-right:1.5px solid #8b5cf6;}
        .cg-callout.arrow-left .cg-arrow{left:-7px;border-bottom:1.5px solid #8b5cf6;border-left:1.5px solid #8b5cf6;}
        .cg-callout.no-arrow .cg-arrow{display:none;}
        html[data-theme="light"] .cg-callout, body.light-theme .cg-callout{background:#fff;color:#0f172a;border-color:#7c3aed;}
        html[data-theme="light"] .cg-callout h5, body.light-theme .cg-callout h5{color:#7c3aed;}
        html[data-theme="light"] .cg-arrow, body.light-theme .cg-arrow{background:#fff;border-color:#7c3aed !important;}
        /* Nav bar matches the purple callout: same panel fill, purple border, purple buttons */
        .cg-nav{position:fixed;z-index:4000;right:18px;bottom:16px;display:flex;gap:8px;align-items:center;
          background:#0d1522;border:1.5px solid #8b5cf6;border-radius:10px;padding:8px 10px;box-shadow:0 10px 26px rgba(0,0,0,.45);font-family:var(--font-family);}
        .cg-nav button{height:30px;padding:0 12px;border-radius:6px;cursor:pointer;font-size:0.78rem;font-weight:600;
          background:transparent;border:1px solid #8b5cf6;color:#a78bfa;font-family:var(--font-family);transition:background .15s,color .15s;}
        .cg-nav button:hover:not(:disabled){background:rgba(139,92,246,.18);color:#e2e8f0;}
        .cg-nav button:disabled{opacity:.35;cursor:default;}
        .cg-nav #cg-next{background:#8b5cf6;border-color:#8b5cf6;color:#fff;min-width:76px;}
        .cg-nav #cg-next:hover:not(:disabled){background:#7c3aed;border-color:#7c3aed;color:#fff;}
        html[data-theme="light"] .cg-nav, body.light-theme .cg-nav{background:#fff;border-color:#7c3aed;}
        html[data-theme="light"] .cg-nav button, body.light-theme .cg-nav button{border-color:#7c3aed;color:#7c3aed;}
        html[data-theme="light"] .cg-nav button:hover:not(:disabled), body.light-theme .cg-nav button:hover:not(:disabled){background:rgba(124,58,237,.12);color:#5b21b6;}
        html[data-theme="light"] .cg-nav #cg-next, body.light-theme .cg-nav #cg-next{background:#7c3aed;color:#fff;}
```

## 2. Buttons — a `.guide-actions` wrapper placed BEFORE the sim's action box

```html
        <div class="guide-actions">
            <button type="button" class="btn-topbar btn-guide active" id="btn-gi" title="Show or hide the guided inquiry">Guided Inquiry</button>
            <button type="button" class="btn-topbar btn-guide" id="btn-cg" title="Show or hide the controls guide">Controls Guide</button>
        </div>
```

## 3. Controller — inside the template `<script>` (see the example for the
full file; the inquiry machinery precedes this block when the sim has one)

ADAPT only `cgSteps` (selectors, `mode` veil/hide, `also`, title, ≤15-word
text; last entry `sel:null` is the closing card). Keep `__cgReveals` /
`__cgPrepare` calls, positioning (incl. the scroll-into-view before measuring —
short viewports), `cgMax` reveal, session memory, teardown:

```js
      /* ---------------- Two-button template ---------------- */
      const giBtn = $('btn-gi'), cgBtn = $('btn-cg'), root = document.documentElement;
      let cgOn = false, cgStep = 0, cgMax = 0, callout = null, nav = null;
      const cgSteps = [
        { sel:'#playpause-btn', mode:'veil', title:'Play / Pause', text:'Runs and pauses the particle source.' },
        { sel:'#reset-btn',     mode:'veil', title:'Reset',        text:'Clears detections and restarts the waves.' },
        { sel:'#classical-btn', mode:'veil', title:'Classical Pattern', text:'Overlays the classical bullets prediction P\u2081+P\u2082 for comparison.' },
        { sel:'#sep-box',       mode:'hide', also:['#width-box'], title:'Slit geometry', text:'Slit separation d and slit width a.' },
        { sel:'#wavelength-group', mode:'hide', title:'Wavelength', text:'Sets the photon wavelength \u03bb \u2014 colors follow it.' },
        { sel:'#dist-box',      mode:'hide', title:'Screen distance', text:'Distance L from the slits to the screen.' },
        { sel:'#animation-speed-group', mode:'hide', title:'Animation speed', text:'How fast waves expand and detections accumulate.' },
        { sel:'#slit-control-group', mode:'hide', title:'Slit control', text:'Opens or closes each slit \u2014 S1 and S2.' },
        { sel:'.detector-chart-panel', mode:'hide', title:'Detection chart', text:'Detected pattern beside the theoretical quantum curve.' },
        { sel:null, title:'That\u2019s every control', text:'Explore freely \u2014 reopen either guide from the top bar.' }
      ];
      const cel = sel => sel ? document.querySelector(sel) : null;
      function ensureUi(){
        if(callout) return;
        callout = document.createElement('div'); callout.className='cg-callout';
        callout.innerHTML = '<div class="cg-arrow"></div><h5></h5><p></p>';
        nav = document.createElement('div'); nav.className='cg-nav';
        nav.innerHTML = '<button id="cg-prev">\u2039</button><button id="cg-pgnext">\u203a</button><button id="cg-next">Next \u2192</button>';
        document.body.appendChild(callout); document.body.appendChild(nav);
        nav.querySelector('#cg-prev').addEventListener('click', ()=>cgShow(cgStep-1));
        nav.querySelector('#cg-pgnext').addEventListener('click', ()=>cgShow(cgStep+1));
        nav.querySelector('#cg-next').addEventListener('click', ()=>{ cgStep >= cgSteps.length-1 ? setCg(false) : cgShow(cgStep+1); });
        window.addEventListener('resize', positionCallout);
        window.addEventListener('scroll', positionCallout, true);
      }
      function positionCallout(){
        if(!cgOn || !callout) return;
        const st = cgSteps[cgStep], t = cel(st.sel), arrow = callout.querySelector('.cg-arrow');
        callout.classList.remove('arrow-top','arrow-bottom','arrow-left','arrow-right','no-arrow');
        const cw = callout.offsetWidth||260, ch = callout.offsetHeight||100;
        let x = innerWidth/2-cw/2, y = innerHeight/2-ch/2;
        if(!t){ callout.classList.add('no-arrow'); }
        else{
          if(t.scrollIntoView) t.scrollIntoView({ block:'nearest', inline:'nearest' });   // short viewports: bring the target on screen first
          const r = t.getBoundingClientRect();
          if(r.left > innerWidth*0.66){ x = r.left-cw-14; y = r.top+r.height/2-ch/2; callout.classList.add('arrow-right'); }
          else { x = r.left+r.width/2-cw/2; y = r.bottom+12;
            if(y+ch > innerHeight-8){ y = r.top-ch-12; callout.classList.add('arrow-bottom'); } else callout.classList.add('arrow-top'); }
          x = Math.max(8, Math.min(x, innerWidth-cw-8)); y = Math.max(8, Math.min(y, innerHeight-ch-8));
          if(arrow){
            if(callout.classList.contains('arrow-right')||callout.classList.contains('arrow-left')){ arrow.style.left=''; arrow.style.top = Math.max(10, Math.min(r.top+r.height/2-y-6, ch-22))+'px'; }
            else { arrow.style.top=''; arrow.style.left = Math.max(12, Math.min(r.left+r.width/2-x-6, cw-24))+'px'; }
          }
        }
        callout.style.left = Math.max(8, Math.min(x, innerWidth-cw-8))+'px';
        callout.style.top  = Math.max(8, Math.min(y, innerHeight-ch-8))+'px';
      }
      function cgShow(n){
        cgStep = Math.max(0, Math.min(n, cgSteps.length-1));
        cgMax = Math.max(cgMax, cgStep);
        const introduced = new Set(cgSteps.slice(0, cgMax+1).map(s=>s.sel));
        cgSteps.forEach(st=>{ [st.sel].concat(st.also||[]).forEach(sl=>{ const t=cel(sl); if(!t) return;
          t.classList.remove('cg-glow'); t.classList.toggle(st.mode==='hide'?'cg-hidden':'cg-veiled', !introduced.has(st.sel)); }); });
        const cur = cel(cgSteps[cgStep].sel); if(cur) cur.classList.add('cg-glow');
        callout.querySelector('h5').textContent = cgSteps[cgStep].title;
        callout.querySelector('p').textContent = cgSteps[cgStep].text;
        nav.querySelector('#cg-prev').disabled = cgStep<=0;
        nav.querySelector('#cg-pgnext').disabled = cgStep>=cgSteps.length-1;
        nav.querySelector('#cg-next').textContent = cgStep>=cgSteps.length-1 ? 'Done' : 'Next \u2192';
        positionCallout();
      }
      function setGi(on){
        root.classList.toggle('gi-off', !on);
        giBtn.classList.toggle('active', on);
        if(on){ if(cgOn) setCg(false, true); if(window.__giResume) window.__giResume(); }
        else  { if(window.__freeExplore) window.__freeExplore(); }
      }
      function setCg(on, keepGiState){
        cgOn = on;
        cgBtn.classList.toggle('active', on);
        if(on){
          if(!keepGiState) setGi(false);
          ensureUi();
          if(window.__cgReveals) window.__cgReveals(99);
          if(window.__cgPrepare) window.__cgPrepare();   // sims with scene/mode-dependent controls
          callout.style.display='block'; nav.style.display='flex';
          cgShow(cgStep);
        } else {
          if(callout){ callout.style.display='none'; nav.style.display='none'; }
          cgSteps.forEach(st=>[st.sel].concat(st.also||[]).forEach(sl=>{ const t=cel(sl); if(t) t.classList.remove('cg-hidden','cg-veiled','cg-glow'); }));
          if(keepGiState){ /* setGi(true) resumes */ } else if(window.__freeExplore) window.__freeExplore();
        }
      }
      window.__giOff = ()=> setGi(false);
      window.__setMode = mode => {           // welcome overlay entry points
        if(mode === 'controls') setCg(true);
        else if(mode === 'free') { if(cgOn) setCg(false); setGi(false); }
        else setGi(true);
      };
      /* Reset = the state of a fresh page load */
      const DEFAULTS = { 'slit-sep':1600, 'slit-width':490, 'wavelength':525, 'screen-dist':4000, 'rate':10 };
      window.__fullReset = ()=>{
        Object.keys(DEFAULTS).forEach(id=>{ const el=$(id); if(el && parseFloat(el.value)!==DEFAULTS[id]){ el.value=DEFAULTS[id]; el.dispatchEvent(new Event('input',{bubbles:true})); } });
        setSlit2(true); if(!slit1Open()){ const b=$('slit1-toggle'); if(wired(b)) b.click(); }
        setClassical(false);
        if(cgOn) setCg(false, true);
        cgStep = 0; cgMax = 0;
        setGi(true);
        inqShow(0);
        setPaused(false);                       // the sim's first-load state is running
      };
      giBtn.addEventListener('click', ()=> setGi(!giBtn.classList.contains('active')));
      cgBtn.addEventListener('click', ()=> setCg(!cgOn));
      $('reset-btn').addEventListener('click', ()=>{ setTimeout(()=>{ if(window.__fullReset) window.__fullReset(); }, 0); });
```

## 4. L-series shell variant (Guided Inquiry present, shell API)

Buttons in the header's left cluster (GI boots active):

```html
      <button id="btn-gi" class="shell-btn active" title="Show or hide the guided inquiry">Guided Inquiry</button>
      <button id="btn-cg" class="shell-btn" title="Show or hide the controls guide">Controls Guide</button>
```

Hooks published by the sim script (inside its scope):

```js
  window.__cgReveals = applyStepReveals; // controls-guide hook: lift/restore inquiry-step reveals
  // Free exploration = the post-completion state: everything revealed, no
  // inquiry leftovers (ghost, inner zoom). Applied when GI is turned off.
  window.__freeExplore = function(){
    applyStepReveals(99);
    state.ghostActive = false;
    if(state.view !== 'outer') setView('outer');
    render(0);
  };
  // Re-entering the inquiry restores its own step state (reveals, view, pause).
  window.__giResume = function(){
    onStep((typeof Shell !== 'undefined' && Shell.step) || 0);
  };
```

Mutual exclusion + handover:

```js
    function setGi(on){
      root.classList.toggle('gi-off', !on);
      giBtn.classList.toggle('active', on);
      if(on){
        if(cgOn) setCg(false, true);
        // Show the cards directly — clear any lingering collapsed state
        if(typeof Shell !== 'undefined' && Shell.setInquiryCollapsed) Shell.setInquiryCollapsed(false);
        // Restore the inquiry's own step state (reveals, view, pause-on-gate)
        if(window.__giResume) window.__giResume();
      } else {
        // Turning the inquiry off = free exploration: the completed state,
        // never a mid-inquiry snapshot.
        if(window.__freeExplore) window.__freeExplore();
      }
    }
    function setCg(on, keepGiState){
      cgOn = on;
      cgBtn.classList.toggle('active', on);
      if(on){
        if(!keepGiState) setGi(false);           // mutual exclusion
        ensureUi();
        // Controls guide needs everything visible: lift inquiry-step reveals
        if(window.__cgReveals) window.__cgReveals(99);
        if(window.__cgPrepare) window.__cgPrepare();   // sims with scene/mode-dependent controls
        callout.style.display = 'block'; nav.style.display = 'flex';
        show(cgStep);
      } else {
        if(callout){ callout.style.display = 'none'; nav.style.display = 'none'; }
        steps.forEach(st => [st.sel].concat(st.also || []).forEach(sl => {
          const t = el(sl); if(t) t.classList.remove('cg-hidden','cg-veiled','cg-glow');
        }));
        // Hand over: to the inquiry's step state if GI takes over, otherwise
        // to free exploration (both-off, or guide completed/toggled off).
        if(keepGiState){ /* setGi(true) runs __giResume right after */ }
        else if(window.__freeExplore) window.__freeExplore();
      }
    }
```

Single-owner routing + Reset = first-load (`Shell.inqShow` / `Shell.step`
exposed on the shell):

```js
    window.__giOff = ()=> setGi(false);   // shell's Skip/Finish route here
    window.__setMode = mode => {           // welcome overlay entry points
      if(mode === 'controls') setCg(true);
      else if(mode === 'free') { if(cgOn) setCg(false); setGi(false); }
      else setGi(true);
    };
    // Reset = the state of a fresh page load: Guided Inquiry on at card 1,
    // Controls Guide off with its session progress cleared.
    window.__fullReset = ()=>{
      if(cgOn) setCg(false, true);        // silent CG off (GI takes over next)
      cgStep = 0; cgMax = 0;              // guide progress like a fresh load
      setGi(true);
      if(typeof Shell !== 'undefined' && Shell.inqShow) Shell.inqShow(0);
    };
```

Finish routes through the Guided Inquiry button (Skip likewise); delete the
Lecture button, `setLectureMode`, and the restore strip:

```js
  function inqNext(){
    const cards=inqCards();
    if(inqStep>=cards.length-1){ if(window.__giOff) window.__giOff(); else setInquiryCollapsed(true); }
    else inqShow(inqStep+1);
  }
```

## 4b. `window.__cgPrepare` — controls that exist only in some scene/mode

Publish from the sim a hook that pins a scene where EVERY guided target is
present; the controller calls it on guide entry. Found on Newton's laws,
whose completed inquiry ends in scene ③ where the F and m sliders are hidden:

```js
window.__cgPrepare = function(){ applyInquiryScene({ scene:2, mode:'newton', F:4, m:1, playing:true }); };
```

## 5. Verification

`node scripts/verify.js <patched.html> --baseline <original.html>` then the
real-browser gate `node ../tests/browser-smoke.js …` (SKILL.md §4).
