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
await sleep(1500);

const R = {};

// State reader
async function state(){
  return await page.evaluate(()=>{
    const g = id=>document.getElementById(id);
    const raw = id=>{const el=g(id);return el?el.textContent:null;};
    const auditAt = c=>window.__audit && window.__audit.at ? window.__audit.at(c) : null;
    const shell = g('shell');
    return {
      step: window.Shell && Shell.step,
      lectureMode: shell.classList.contains('lecture-mode'),
      inquiryCollapsed: shell.classList.contains('inquiry-collapsed'),
      polSlider: g('polSlider')? +g('polSlider').value: null,
      polVal: raw('polVal'),
      cntUp_raw: raw('cntUp'),
      cntDn_raw: raw('cntDn'),
      aMeas: raw('aMeas'),
      aTheo: raw('aTheo'),
      mirrorBtn: raw('mirrorBtn'),
      antiBtn: raw('antiBtn'),
      playBtn: raw('shell-play'),
      auditAt0: auditAt(0),
    };
  });
}

// Boot: click restore to open inquiry
await page.evaluate(()=>document.getElementById('aside-inquiry-restore').click());
await sleep(500);
R.afterRestore = await state();

// Answer all four cards fast
const clickChoice = async labelRegex=>await page.evaluate(re=>{
  const rx = new RegExp(re,'i');
  const active = document.querySelector('.inq-step.active');
  for(const b of active.querySelectorAll('button.choice')){ if(rx.test(b.textContent)){ b.click(); return true; } }
  return false;
}, labelRegex.source);
const clickNext = ()=>page.evaluate(()=>document.getElementById('inq-next').click());

await clickChoice(/no direction is special/); await sleep(200); await clickNext(); await sleep(300);
await clickChoice(/↓ counter/); await sleep(200); await clickNext(); await sleep(300);
await clickChoice(/Along it/); await sleep(200); await clickNext(); await sleep(300);
await clickChoice(/Yes — mirror plus C/); await sleep(200); await clickNext(); await sleep(500);
R.afterCards = await state();
await page.screenshot({path:join(OUT,'wu-rev2-A-post-inquiry.png')});

// Now at post-completion state. Toggle back to free explore via lecture button OFF or restore
// Reset to OPEN
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(500);
R.afterFreshReset = await state();

// Force setup: set P=1, mirror on, anti on, play
await page.evaluate(()=>{
  document.getElementById('polSlider').value=100;
  document.getElementById('polSlider').dispatchEvent(new Event('input',{bubbles:true}));
});
await sleep(200);
await page.evaluate(()=>document.getElementById('mirrorBtn').click());
await sleep(200);
await page.evaluate(()=>document.getElementById('antiBtn').click());
await sleep(200);
// Play if paused
const playBefore = await page.evaluate(()=>document.getElementById('shell-play').textContent.includes('Play'));
if(playBefore) await page.evaluate(()=>document.getElementById('shell-play').click());
await sleep(200);
R.beforeLongRun = await state();

// Real-time run: 25s at P=1 mirror+CP
await sleep(25000);
R.longRun_P1_25s = await state();
await page.screenshot({path:join(OUT,'wu-rev2-B-longrun-P1-CP.png')});

// Now test verdict-chip corner: P=0 with prediction committed and mirror ON, monitor 20s
await page.evaluate(()=>document.getElementById('shell-reset').click());
await sleep(400);
// Ensure we're in a card that starts paused or in free-explore. If lecture triggered on step 3 with mirror ON, that keeps mirror. But let's just force everything:
await page.evaluate(()=>{
  document.getElementById('polSlider').value=0;
  document.getElementById('polSlider').dispatchEvent(new Event('input',{bubbles:true}));
});
await sleep(200);
// Commit prediction: click card 2's ↓ choice, which sets S.pred='down'
// But we may not be on card 2. Force: set S.pred via wireControls path
const setPredResult = await page.evaluate(()=>{
  // Directly access the button, but the choice buttons are card-scoped.
  // Alternative: __audit.at doesn't set pred. Look for an exposed setter.
  // Try to find the card 2 button
  const cards = document.querySelectorAll('#inq-cards .inq-step');
  for(const c of cards){
    for(const b of c.querySelectorAll('button.choice')){
      if(b.dataset.pred==='down' && !c.dataset.answered) { b.click(); return {clicked:true, cardIdx: [...cards].indexOf(c)}; }
    }
  }
  return {clicked:false};
});
R.setPredResult = setPredResult;
await sleep(300);
// Ensure mirror ON
const mirState = await page.evaluate(()=>document.getElementById('mirrorBtn').textContent.includes('ON'));
if(!mirState) await page.evaluate(()=>document.getElementById('mirrorBtn').click());
await sleep(200);
// Set P=0 again (setState may have overridden)
await page.evaluate(()=>{
  document.getElementById('polSlider').value=0;
  document.getElementById('polSlider').dispatchEvent(new Event('input',{bubbles:true}));
});
await sleep(200);
// Play
const playBefore2 = await page.evaluate(()=>document.getElementById('shell-play').textContent.includes('Play'));
if(playBefore2) await page.evaluate(()=>document.getElementById('shell-play').click());
await sleep(200);
R.P0_verdictTest_start = await state();

// Sample every 2s for 30s and read cntUp/cntDn + aMeas
R.chipSamples = [];
for(let i=0;i<15;i++){
  await sleep(2000);
  R.chipSamples.push({t:(i+1)*2, ...(await state())});
}
await page.screenshot({path:join(OUT,'wu-rev2-C-P0-longrun.png')});

// Read canvas for verdict text (best-effort via screenshot description omitted); print sampling summary only
R.errors = errors;

console.log(JSON.stringify(R,null,2));
await browser.close();
