import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';
const HERE = dirname(fileURLToPath(import.meta.url));
const req = createRequire(resolve(HERE,'../../../Capacity_SR_sims_v2_engine/_review/') + '/');
const puppeteer = req('puppeteer-core');

const URL = 'http://localhost:8765/Sims_v2_lecture_versions/wu-experiment-and-the-death-of-parity.html?v=rev2';
const OUT = HERE;
const sleep = ms=>new Promise(r=>setTimeout(r,ms));

const browser = await puppeteer.launch({
  executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless:true, args:['--no-sandbox']
});
const page = await browser.newPage();
await page.setViewport({width:1440,height:900});
const errors=[]; const consoles=[];
page.on('pageerror',e=>errors.push('PAGEERROR:'+e.message));
page.on('console',m=>{consoles.push({type:m.type(), text:m.text()}); if(m.type()==='error' && !/Failed to load resource/.test(m.text())) errors.push('CONSOLE:'+m.text());});
await page.goto(URL,{waitUntil:'networkidle2'});
await sleep(1200);

const R = {};
R.title = await page.title();
R.errorsAtLoad = [...errors];

// ==== state helpers (via DOM only, since S is closure-scoped) ====
async function state(){
  return await page.evaluate(()=>{
    const g = id=>document.getElementById(id);
    const txt = id=>{const el=g(id);return el?el.textContent.trim():null;};
    const auditAt0 = window.__audit && window.__audit.at ? window.__audit.at(0) : null;
    const auditAt1 = window.__audit && window.__audit.at ? window.__audit.at(1) : null;
    const auditAtM1= window.__audit && window.__audit.at ? window.__audit.at(-1) : null;
    const shell = document.getElementById('shell');
    return {
      step: window.Shell && Shell.step,
      lectureMode: shell.classList.contains('lecture-mode'),
      inquiryCollapsed: shell.classList.contains('inquiry-collapsed'),
      polVal: txt('polVal'),
      polSlider: g('polSlider')? +g('polSlider').value: null,
      cntUp: +(txt('cntUp')||0),
      cntDn: +(txt('cntDn')||0),
      aMeas: txt('aMeas'),
      aTheo: txt('aTheo'),
      mirrorBtn: txt('mirrorBtn'),
      antiBtn: txt('antiBtn'),
      playBtn: txt('shell-play'),
      auditP: auditAt0 && auditAt0.polarization,
      auditA: auditAt0 && auditAt0.asymmetryCoefficient,
      auditSlope: auditAt0 && auditAt0.slope,
      auditVoverC: auditAt0 && auditAt0.betaMean,
      auditDensity_0: auditAt0 && auditAt0.probabilityDensityPerUnitCosTheta,
      auditDensity_1: auditAt1 && auditAt1.probabilityDensityPerUnitCosTheta,
      auditDensity_m1: auditAtM1 && auditAtM1.probabilityDensityPerUnitCosTheta,
    };
  });
}

// Ensure inquiry is open: click restore chip if in lecture mode
R.bootLectureMode = await page.evaluate(()=>document.getElementById('shell').classList.contains('lecture-mode'));
if (R.bootLectureMode) {
  await page.evaluate(()=>document.getElementById('aside-inquiry-restore').click());
  await sleep(400);
}
R.afterRestore = await state();
await page.screenshot({path:join(OUT,'wu-rev2-01-boot-inquiry.png')});

// helpers
const clickChoice = async (labelRegex)=>{
  return await page.evaluate(re=>{
    const rx = new RegExp(re,'i');
    const active = document.querySelector('.inq-step.active') || document.querySelectorAll('.inq-step')[Shell.step];
    if(!active) return {ok:false, reason:'no active'};
    for(const b of active.querySelectorAll('button.choice')){ if(rx.test(b.textContent)){ b.click(); return {ok:true, text:b.textContent.trim()}; } }
    return {ok:false, reason:'no match'};
  }, labelRegex.source);
};
const clickNext = async ()=>await page.evaluate(()=>{const n=document.getElementById('inq-next');if(n && !n.disabled){n.click(); return true;} return false;});

R.card1_click = await clickChoice(/no direction is special/);
await sleep(500);
R.afterCard1Answer = await state();
R.card1_nextClicked = await clickNext();
await sleep(500);
R.afterCard1 = await state();

R.card2_click = await clickChoice(/↓ counter/);
await sleep(500);
R.afterCard2Answer = await state();
R.card2_nextClicked = await clickNext();
await sleep(700);
R.afterCard2 = await state();
await page.screenshot({path:join(OUT,'wu-rev2-02-card3-mirror.png')});

R.card3_click = await clickChoice(/Along it/);
await sleep(600);
R.afterCard3Answer = await state();
R.card3_nextClicked = await clickNext();
await sleep(700);
R.afterCard3 = await state();
await page.screenshot({path:join(OUT,'wu-rev2-03-card4-cp.png')});

R.card4_click = await clickChoice(/Yes — mirror plus C/);
await sleep(600);
R.afterCard4Answer = await state();
R.card4_nextClicked = await clickNext();
await sleep(500);
R.afterCard4 = await state();
await page.screenshot({path:join(OUT,'wu-rev2-04-post-inquiry-free.png')});

// Pager: card 4 → back to card 1 → forward to card 4 (state fingerprint compare)
R.postComplete_lectureMode = await page.evaluate(()=>document.getElementById('shell').classList.contains('lecture-mode'));
// The lecture flag may have been set by onComplete. Reopen inquiry via restore.
if (R.postComplete_lectureMode) {
  await page.evaluate(()=>document.getElementById('aside-inquiry-restore').click());
  await sleep(400);
}
for(let i=0;i<5;i++){ await page.evaluate(()=>{const p=document.getElementById('inq-prev'); if(p && !p.disabled) p.click();}); await sleep(300); }
R.afterPrevAll = await state();
await page.screenshot({path:join(OUT,'wu-rev2-05-back-card1.png')});
for(let i=0;i<3;i++){ await page.evaluate(()=>{const n=document.getElementById('inq-pager-next'); if(n && !n.disabled) n.click();}); await sleep(300); }
R.afterFwdAll = await state();
await page.screenshot({path:join(OUT,'wu-rev2-06-fwd-card4.png')});

// Reset while at card 3 (test SYS-2 already-resolved reapply)
await page.evaluate(()=>{const p=document.getElementById('inq-prev'); if(p && !p.disabled) p.click();});
await sleep(300);
R.atCard3 = await state();
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(600);
R.afterResetCard3 = await state();
await page.screenshot({path:join(OUT,'wu-rev2-07-after-reset-card3.png')});

// P slider walk (post-inquiry: send to end)
// Go to free-explore by clicking through
await page.evaluate(()=>document.getElementById('shell-lecture').click());
await sleep(500);
R.afterLectureON = await state();
await page.screenshot({path:join(OUT,'wu-rev2-07b-lecture-on.png')});

// Reset to clean state for slider walk
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(400);

const walkP = async (v)=>{ await page.evaluate(vv=>{const el=document.getElementById('polSlider');el.value=vv;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}, v); await sleep(400); return await state(); };
R.P0 = await walkP('0');
R.P25 = await walkP('25');
R.P50 = await walkP('50');
R.P75 = await walkP('75');
R.P100 = await walkP('100');
await page.screenshot({path:join(OUT,'wu-rev2-08-P100.png')});

// Toggle mirror/anti
await page.evaluate(()=>document.getElementById('mirrorBtn').click());
await sleep(300);
R.mirrorOn = await state();
await page.screenshot({path:join(OUT,'wu-rev2-09a-mirror-on.png')});
await page.evaluate(()=>document.getElementById('antiBtn').click());
await sleep(300);
R.antiOn = await state();
await page.screenshot({path:join(OUT,'wu-rev2-09-mirror-cp.png')});
// Repeat click (toggle back)
await page.evaluate(()=>document.getElementById('antiBtn').click());
await sleep(200);
R.antiOff = await state();
await page.evaluate(()=>document.getElementById('mirrorBtn').click());
await sleep(200);
R.mirrorOff = await state();
// Confirm anti-off forces mirror-off? No: anti-off leaves mirror as is
R.finalToggle = await state();

// Formal panel
await page.evaluate(()=>document.getElementById('toggle-formal').click());
await sleep(500);
R.formalOpen = await page.evaluate(()=>{
  const eqW = document.getElementById('eqW');
  const eqProb = document.getElementById('eqProb');
  const eqA = document.getElementById('eqA');
  const rectW = eqW && eqW.getBoundingClientRect();
  const rectP = eqProb && eqProb.getBoundingClientRect();
  const rectA = eqA && eqA.getBoundingClientRect();
  const eqrow = document.querySelector('.sim-eqrow');
  const eqrowRect = eqrow && eqrow.getBoundingClientRect();
  return {
    eqW_text: eqW?eqW.textContent.trim():null,
    eqProb_text: eqProb?eqProb.textContent.trim():null,
    eqA_text: eqA?eqA.textContent.trim():null,
    eqW_h: rectW?rectW.height:null,
    eqW_w: rectW?rectW.width:null,
    eqProb_h: rectP?rectP.height:null,
    eqProb_w: rectP?rectP.width:null,
    eqA_h: rectA?rectA.height:null,
    eqA_w: rectA?rectA.width:null,
    eqrow_h: eqrowRect?eqrowRect.height:null,
    eqrow_w: eqrowRect?eqrowRect.width:null,
    katex_loaded: !!window.katex,
    dist_visible: !!document.getElementById('distCanvas'),
  };
});
await page.screenshot({path:join(OUT,'wu-rev2-10-formal.png')});

// Hide Text toggle
await page.evaluate(()=>{const c=document.getElementById('ht-toggle'); if(c){c.checked=!c.checked; c.dispatchEvent(new Event('change',{bubbles:true}));}});
await sleep(300);
R.hideTextOn = await page.evaluate(()=>({has: document.getElementById('shell').classList.contains('hide-text'), hidden: [...document.querySelectorAll('.ht-hide')].length}));
await page.screenshot({path:join(OUT,'wu-rev2-11-hidetext-on.png')});
await page.evaluate(()=>{const c=document.getElementById('ht-toggle'); if(c){c.checked=!c.checked; c.dispatchEvent(new Event('change',{bubbles:true}));}});
await sleep(200);

// Theme toggle
await page.evaluate(()=>document.getElementById('shell-theme')?.click());
await sleep(400);
R.themeLightHTML = await page.evaluate(()=>document.documentElement.className);
await page.screenshot({path:join(OUT,'wu-rev2-12-light.png')});
await page.evaluate(()=>document.getElementById('shell-theme')?.click());
await sleep(300);

// Info modal
await page.evaluate(()=>document.getElementById('shell-info')?.click());
await sleep(500);
R.info = await page.evaluate(()=>{
  const m = document.getElementById('shell-info-modal');
  return m ? { open: m.classList.contains('open') || getComputedStyle(m).display!=='none', text: (m.textContent||'').replace(/\s+/g,' ').substring(0,700) } : null;
});
await page.screenshot({path:join(OUT,'wu-rev2-13-info.png')});
await page.evaluate(()=>document.getElementById('shell-info-close')?.click());
await sleep(300);

// Long statistical run: 12s at P=1 mirror+CP after reset
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(400);
await page.evaluate(()=>{const el=document.getElementById('polSlider');el.value='100';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
await sleep(300);
R.longRun_start = await state();
await sleep(12000);
R.longRun_after12s_P1 = await state();
await page.screenshot({path:join(OUT,'wu-rev2-14-longrun-P1.png')});

// Corner test: P=0, commit prediction via card 2 down-then-back, monitor for false verdicts
// simpler: reset, set P=0, mirror on, drive ~15s and see if the verdict chip ever flashes ✗ / ✓
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(400);
await page.evaluate(()=>document.getElementById('shell-lecture').click()); // lecture mode -> hides inquiry
await sleep(500);
await page.evaluate(()=>{const el=document.getElementById('polSlider');el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
await sleep(200);
await page.evaluate(()=>document.getElementById('mirrorBtn').click());
await sleep(200);

// Look at __audit at cosθ across the range at P=0
R.audit_P0 = await page.evaluate(()=>{
  return {
    at_neg1: window.__audit.at(-1),
    at_0: window.__audit.at(0),
    at_p1: window.__audit.at(1),
  };
});

// Sample verdict chip periodically
R.chipSamples = [];
for(let i=0;i<15;i++){
  await sleep(1000);
  const snap = await page.evaluate(()=>{
    // Look for canvas draw text; verdict chip is drawn on canvas. Instead, inspect the aMeas + something
    const aMeas = document.getElementById('aMeas').textContent.trim();
    const aTheo = document.getElementById('aTheo').textContent.trim();
    return { aMeas, aTheo };
  });
  R.chipSamples.push({t:(i+1), ...snap});
}
await page.screenshot({path:join(OUT,'wu-rev2-15-P0-longrun.png')});

// Big long-run at P=1 to compute empirical asymmetry vs theory
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(400);
await page.evaluate(()=>{const el=document.getElementById('polSlider');el.value='100';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));});
await sleep(200);
await sleep(20000);
R.longP1_20s = await state();

R.errors = errors;
R.consolesFiltered = consoles.filter(c=>c.type==='error' || c.type==='warning').slice(0,20);

console.log(JSON.stringify(R,null,2));
await browser.close();
