// Real-Chrome flow probe for user-version sims.
//
// The three jsdom verifiers check STRUCTURE; they cannot catch a runtime
// exception thrown during Shell.init in a real browser. When that happens the
// sim still passes every gate but the welcome overlay leads into a dead
// controls guide / an inquiry with no active card. C070 shipped exactly that
// way (a negative canvas radius aborted init) — this probe is how it was found.
//
// Usage:
//   python3 -m http.server 8734          # from the repo root, once
//   node tools/flow-probe.mjs <port> <build1.html> [build2.html ...]
//
// Prints one line per build: "  ok  " or "BROKEN <flags>". Exit code 1 if any
// build is broken, so it can gate a batch.

import { launch } from './cdp.mjs';

const files = process.argv.slice(3);
let port = Number(process.argv[2] || 9500);
const wait = ms => new Promise(r => setTimeout(r, ms));
let broken = 0;

for (const f of files) {
  port++;
  let b;
  try {
    // Accepts a bare basename (legacy sim-use-builds layout) or a module-relative
    // path like Module-02-.../C041-....html (current layout).
    b = await launch(`http://localhost:8734/${f.includes('/') ? f : `sim-use-builds/${f}`}`, { port });
  } catch (e) { console.log(`FAIL-LAUNCH ${f}: ${e.message}`); broken++; continue; }
  try {
    await wait(2200);
    const boot = JSON.parse(await b.evalJs(`(() => JSON.stringify({
      activeCard: !!document.querySelector('#inq-cards .inq-step.active'),
      giActive: !!document.getElementById('btn-gi')?.classList.contains('active')
    }))()`));

    // welcome → controls guide: callout + nav must exist, something must glow and be masked
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="controls"]')?.click(); return 1; })()`);
    await wait(900);
    const cg = JSON.parse(await b.evalJs(`(() => JSON.stringify({
      callout: !!document.querySelector('.cg-callout'),
      nav: !!document.querySelector('.cg-nav'),
      rows: document.querySelectorAll('.cg-nav .cg-nav-row').length,
      glow: document.querySelectorAll('.cg-glow').length,
      masked: document.querySelectorAll('.cg-hidden,.cg-veiled').length
    }))()`));

    // every step: the glowing target must be on-screen and the callout visible
    const walk = JSON.parse(await b.evalJs(`(() => { try {
      const out=[]; const n=document.querySelector('#cg-next'); if(!n) return JSON.stringify([{bad:'no-next'}]);
      for(let i=0;i<40;i++){
        const g=document.querySelector('.cg-glow'); const c=document.querySelector('.cg-callout');
        if(!c) { out.push({step:i, bad:'no-callout'}); break; }
        const cr=c.getBoundingClientRect(); const gr=g?g.getBoundingClientRect():null;
        const bad=[];
        if(g && !(gr.width>0 && gr.height>0)) bad.push('glow-zero-size');
        if(g && !(gr.bottom>0 && gr.top<innerHeight)) bad.push('glow-offscreen');
        if(!(cr.width>0 && cr.bottom>0 && cr.top<innerHeight)) bad.push('callout-offscreen');
        if(bad.length) out.push({step:i, title:document.querySelector('.cg-callout h5')?.textContent, bad});
        if(n.textContent.indexOf('Done')>=0) break;
        n.click();
      }
      return JSON.stringify(out);
    } catch(e){ return JSON.stringify([{bad:'threw: '+e.message}]); } })()`));

    // reload → welcome → guided inquiry: a card must be active and visible
    await b.evalJs(`(() => { location.reload(); return 1; })()`);
    await wait(2200);
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="inquiry"]')?.click(); return 1; })()`);
    await wait(700);
    const gi = JSON.parse(await b.evalJs(`(() => { const c=document.querySelector('#inq-cards .inq-step.active');
      const r=c?c.getBoundingClientRect():null; return JSON.stringify({
        activeCard: !!c, visible: r ? (r.width>0 && r.height>0) : false,
        giOff: document.documentElement.classList.contains('gi-off') }); })()`));

    // reload → welcome → free exploration: no guide residue, controls usable
    await b.evalJs(`(() => { location.reload(); return 1; })()`);
    await wait(2200);
    await b.evalJs(`(() => { document.querySelector('.welcome-mode[data-mode="free"]')?.click(); return 1; })()`);
    await wait(700);
    const free = JSON.parse(await b.evalJs(`(() => JSON.stringify({
      giOff: document.documentElement.classList.contains('gi-off'),
      residue: document.querySelectorAll('.cg-hidden,.cg-veiled,.cg-glow').length
    }))()`));

    const exc = ((await b.consoleIssues?.()) || []).filter(i => i.type === 'exception');
    const flags = [];
    if (!boot.activeCard) flags.push('NO-ACTIVE-CARD@boot');
    if (!cg.callout || !cg.nav) flags.push('CG-DEAD');
    else {
      if (cg.rows !== 2) flags.push(`CG-nav-rows=${cg.rows}`);
      if (cg.glow === 0) flags.push('CG-no-glow');
      if (cg.masked === 0) flags.push('CG-no-masking');
    }
    if (walk.length) flags.push('CG-walk:' + JSON.stringify(walk).slice(0, 120));
    if (!gi.activeCard || !gi.visible) flags.push('GI-no-visible-card');
    if (gi.giOff) flags.push('GI-off-after-choosing-inquiry');
    if (!free.giOff) flags.push('FREE-did-not-hand-over');
    if (free.residue) flags.push(`FREE-residue=${free.residue}`);
    if (exc.length) flags.push('EXC:' + exc[0].text.split('\n')[0].slice(0, 70));

    if (flags.length) broken++;
    console.log(`${flags.length ? 'BROKEN' : '  ok  '} ${f.padEnd(58)} ${flags.join(' · ')}`);
  } catch (e) {
    broken++; console.log(`ERROR  ${f}: ${e.message}`);
  } finally { try { await b.close(); } catch {} }
}

if (broken) { console.log(`\n${broken} build(s) BROKEN`); process.exit(1); }
console.log(`\nall ${files.length} build(s) ok`);
