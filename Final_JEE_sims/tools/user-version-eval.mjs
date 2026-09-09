// Deep eval for user-version sims — real headless Chrome.
//
// Covers what the jsdom verifiers cannot: that the ONBOARDING OVERLAY actually
// opens the sim correctly from all three modes, and that the VOICEOVER layer is
// wired and responds. C100 passed all three jsdom gates while missing the entire
// welcome script and voiceover engine — that is the gap this closes.
//
//   python3 -m http.server 8734        # from the repo root, once
//   node tools/user-version-eval.mjs <startPort> <build1.html> [build2.html ...]
//
// Exit 1 if any build fails.

import { launch } from './cdp.mjs';

const files = process.argv.slice(3);
let port = Number(process.argv[2] || 9600);
const wait = ms => new Promise(r => setTimeout(r, ms));
const J = async (b, expr) => JSON.parse(await b.evalJs(`(() => { try { return JSON.stringify(${expr}); } catch(e){ return JSON.stringify({__err: e.message}); } })()`));
let bad = 0;

for (const f of files) {
  port++;
  let b, flags = [];
  // Accepts either a bare basename (legacy sim-use-builds layout) or a
  // module-relative path like Module-13-Optics/C203-....html (current layout).
  const rel = f.includes('/') ? f : `sim-use-builds/${f}`;
  try { b = await launch(`http://localhost:8734/${rel}`, { port }); }
  catch (e) { console.log(`FAIL-LAUNCH ${f}: ${e.message}`); bad++; continue; }
  try {
    await wait(2300);

    // Guard: a dead static server or a stale Chrome on this port makes every
    // assertion below fail at once and reads as a totally broken build. It is not.
    const alive = await J(b, `({ title: document.title, nodes: document.querySelectorAll('*').length })`);
    if (!alive.nodes || alive.nodes < 50) {
      console.log(`SKIP   ${f.replace('.html','').padEnd(58)} PAGE-DID-NOT-LOAD (static server on :8734 down, or port ${port} held by a stale Chrome) — not a build defect`);
      bad++; try { await b.close(); } catch {} ; continue;
    }

    // ---- 1. the overlay itself ----
    const ov = await J(b, `(() => { const o=document.getElementById('welcome-overlay'); if(!o) return {present:false};
      const cs=getComputedStyle(o); const cards=[...document.querySelectorAll('.welcome-mode')].map(c=>c.dataset.mode);
      return { present:true, visible: cs.display!=='none', z:cs.zIndex, modes:cards,
        hero: !!document.getElementById('welcome-fringes'),
        heroPainted: (()=>{ const c=document.getElementById('welcome-fringes'); if(!c) return false;
          try { const x=c.getContext('2d').getImageData(0,0,c.width,c.height).data; for(let i=3;i<x.length;i+=4000) if(x[i]) return true; return false; } catch(e){ return 'tainted'; } })(),
        player: !!document.getElementById('welcome-speak'),
        setMode: typeof window.__setMode }; })()`);
    if (!ov.present) flags.push('NO-OVERLAY');
    else {
      if (!ov.visible) flags.push('overlay-not-visible-at-boot');
      if (ov.z !== '5000') flags.push(`overlay-z=${ov.z}`);
      if (!ov.hero) flags.push('no-hero-canvas'); else if (ov.heroPainted === false) flags.push('HERO-BLANK');
      if (!ov.player) flags.push('no-readaloud-player');
      if (ov.setMode !== 'function') flags.push('__setMode-MISSING');
      for (const m of ['inquiry','controls','free']) if (!ov.modes.includes(m)) flags.push(`mode-card-missing:${m}`);
    }

    // ---- 2. mode: guided inquiry ----
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="inquiry"]')?.click(); return 1; })()`);
    await wait(900);
    const gi = await J(b, `(() => { const c=document.querySelector('#inq-cards .inq-step.active'); const r=c?c.getBoundingClientRect():null;
      return { dismissed: document.getElementById('welcome-overlay')?.classList.contains('hidden'),
        giBtn: !!document.getElementById('btn-gi')?.classList.contains('active'),
        giOff: document.documentElement.classList.contains('gi-off'),
        card: !!c, cardVisible: r? (r.width>0&&r.height>0):false,
        voiceBtn: !!document.getElementById('inq-voice'), autoBtn: !!document.getElementById('inq-auto') }; })()`);
    if (!gi.dismissed) flags.push('inquiry-mode:overlay-stayed');
    if (!gi.giBtn || gi.giOff) flags.push('inquiry-mode:zone-not-on');
    if (!gi.card || !gi.cardVisible) flags.push('inquiry-mode:NO-VISIBLE-CARD');
    if (!gi.voiceBtn || !gi.autoBtn) flags.push('inquiry-mode:listen-row-missing');

    // ---- 3. voiceover wiring (headless has no voices: assert wiring, not audio) ----
    const vo = await J(b, `(() => { const v=document.getElementById('inq-voice'), a=document.getElementById('inq-auto');
      if(!v||!a) return {missing:true};
      const before=v.dataset.vstate; v.click(); const after=v.dataset.vstate;
      const autoBefore=a.classList.contains('active'); a.click(); const autoAfter=a.classList.contains('active');
      a.click(); v.click();
      return { engine: typeof window.__makeCardVoice, stop: typeof window.__giVoiceStop,
               before, after, reacts: before!==after, autoToggles: autoBefore!==autoAfter }; })()`);
    if (vo.missing) flags.push('voice:controls-missing');
    else {
      if (vo.engine !== 'function') flags.push('voice:ENGINE-MISSING');
      if (vo.stop !== 'function') flags.push('voice:__giVoiceStop-missing');
      if (!vo.reacts) flags.push(`voice:play-inert(${vo.before}->${vo.after})`);
      if (!vo.autoToggles) flags.push('voice:auto-pill-inert');
    }

    // ---- 4. mode: controls guide ----
    await b.evalJs(`(() => { location.reload(); return 1; })()`); await wait(2300);
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="controls"]')?.click(); return 1; })()`);
    await wait(900);
    const cg = await J(b, `(() => ({ callout: !!document.querySelector('.cg-callout'), nav: !!document.querySelector('.cg-nav'),
      rows: document.querySelectorAll('.cg-nav .cg-nav-row').length, glow: document.querySelectorAll('.cg-glow').length,
      masked: document.querySelectorAll('.cg-hidden,.cg-veiled').length,
      transport: ['cg-rew','cg-voice-play','cg-fwd','cg-auto'].filter(i=>document.getElementById(i)).length }))()`);
    if (!cg.callout || !cg.nav) flags.push('controls-mode:GUIDE-DEAD');
    else {
      if (cg.rows !== 2) flags.push(`controls-mode:nav-rows=${cg.rows}`);
      if (!cg.glow) flags.push('controls-mode:no-glow');
      if (!cg.masked) flags.push('controls-mode:no-masking');
      if (cg.transport !== 4) flags.push(`controls-mode:transport=${cg.transport}/4`);
    }
    // walk every step, glow must stay on-screen
    const walk = await J(b, `(() => { const n=document.querySelector('#cg-next'); if(!n) return [{bad:'no-next'}];
      const out=[]; for(let i=0;i<40;i++){ const c=document.querySelector('.cg-callout'); if(!c){out.push({step:i,bad:'callout-gone'});break;}
        const cr=c.getBoundingClientRect(); const g=document.querySelector('.cg-glow'); const gr=g?g.getBoundingClientRect():null; const bad=[];
        if(g&&!(gr.width>0&&gr.height>0)) bad.push('glow-zero'); if(g&&!(gr.bottom>0&&gr.top<innerHeight)) bad.push('glow-offscreen');
        if(!(cr.width>0&&cr.bottom>0&&cr.top<innerHeight)) bad.push('callout-offscreen');
        if(bad.length) out.push({step:i,title:c.querySelector('h5')?.textContent,bad});
        if(n.textContent.indexOf('Done')>=0) break; n.click(); }
      return out; })()`);
    if (walk.length) flags.push('controls-walk:' + JSON.stringify(walk).slice(0,110));

    // ---- 5. mode: free exploration ----
    await b.evalJs(`(() => { location.reload(); return 1; })()`); await wait(2300);
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="free"]')?.click(); return 1; })()`);
    await wait(800);
    // Free exploration must actually leave the CONTROLS on screen. C041 shipped
    // with an unclosed .inq-listen div that nested the whole controls zone inside
    // #aside-inquiry — which free mode hides — so every slider vanished while all
    // three jsdom gates stayed green. Assert on painted geometry, not classes.
    const fr = await J(b, `(() => { const boxes=[...document.querySelectorAll('.ctrl-box,[id^=grp-],[id^=box-]')];
      const painted = boxes.filter(e => { const r=e.getBoundingClientRect(); return r.width>0 && r.height>0; });
      return { giOff: document.documentElement.classList.contains('gi-off'),
        giBtn: !!document.getElementById('btn-gi')?.classList.contains('active'),
        residue: document.querySelectorAll('.cg-hidden,.cg-veiled,.cg-glow').length,
        boxes: boxes.length, painted: painted.length,
        inInquiry: boxes.filter(e => e.closest('#aside-inquiry')).length,
        speaking: !!(window.speechSynthesis && speechSynthesis.speaking) }; })()`);
    if (!fr.giOff || fr.giBtn) flags.push('free-mode:inquiry-still-on');
    if (fr.residue) flags.push(`free-mode:guide-residue=${fr.residue}`);
    if (fr.speaking) flags.push('free-mode:speech-leaked');
    if (fr.boxes && !fr.painted) flags.push(`free-mode:NO-VISIBLE-CONTROLS(0/${fr.boxes})`);
    if (fr.inInquiry) flags.push(`controls-nested-in-inquiry=${fr.inInquiry}`);

    const exc = ((await b.consoleIssues?.()) || []).filter(i => i.type === 'exception');
    if (exc.length) flags.push('EXC:' + exc[0].text.split('\n')[0].slice(0,70));

    if (flags.length) bad++;
    console.log(`${flags.length ? 'BROKEN' : '  ok  '} ${f.replace('.html','').padEnd(58)} ${flags.join(' · ')}`);
  } catch (e) { bad++; console.log(`ERROR  ${f}: ${e.message}`); }
  finally { try { await b.close(); } catch {} }
}
if (bad) { console.log(`\n${bad} of ${files.length} FAILED`); process.exit(1); }
console.log(`\nall ${files.length} builds pass`);
