// Headless functional smoke test for shell sims.
// Drives the system Chrome via puppeteer-core (no bundled browser download).
//
// Usage:
//   node smoke-test.mjs ../shell-versions/L00-s1-ball-on-a-train-shell.html
//   node smoke-test.mjs --all            # every *-shell.html in ../shell-versions
//
// Reports, per sim: console/page errors, canvas non-blank, Play toggles, how many
// range sliders fire without error, and stepper Next/Finish/Skip presence + advance.
// Writes _review/<sim>-smoke.json and prints a one-line PASS/FAIL summary.

import puppeteer from 'puppeteer-core';
import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, basename } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function targets(){
  const a = process.argv.slice(2);
  if (a.includes('--all')) {
    const dir = resolve(HERE, '../shell-versions');
    return readdirSync(dir).filter(f => f.endsWith('-shell.html')).map(f => resolve(dir, f));
  }
  return a.filter(x => !x.startsWith('--')).map(x => resolve(process.cwd(), x));
}

async function testOne(browser, file){
  const page = await browser.newPage();
  const errors = [];       // JS errors (functional)
  const missing = [];      // failed resource loads (styling/asset risk)
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('requestfailed', req => { const u = req.url(); if (!/favicon/i.test(u)) missing.push(u.replace(/^file:\/\//,'')); });
  const r = { sim: basename(file), errors: [], missing: [], checks: {} };
  try {
    await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle2', timeout: 20000 });
    await new Promise(res => setTimeout(res, 700)); // let rAF + KaTeX settle

    // canvas non-blank
    r.checks.canvasNonBlank = await page.evaluate(() => {
      const c = document.querySelector('canvas'); if (!c) return false;
      const g = c.getContext('2d'); if (!g) return true; // webgl/other — assume ok
      try { const d = g.getImageData(0,0,c.width,c.height).data;
        for (let i=3;i<d.length;i+=400) if (d[i] !== 0) return true;
        // fallback: any non-uniform pixel
        const first = d.slice(0,3).join();
        for (let i=0;i<d.length;i+=4000) if (d.slice(i,i+3).join() !== first) return true;
        return false; } catch { return true; }
    });

    // Play toggles label
    r.checks.playToggles = await page.evaluate(() => {
      const b = document.getElementById('shell-play'); if (!b) return false;
      const before = b.textContent.trim(); b.click(); const after = b.textContent.trim();
      b.click(); return before !== after;
    });

    // sliders fire without throwing
    r.checks.sliders = await page.evaluate(() => {
      const rs = [...document.querySelectorAll('input[type=range]')];
      let ok = 0;
      for (const s of rs) { try {
        const mid = (parseFloat(s.min||'0') + parseFloat(s.max||'1')) / 2;
        s.value = String(mid);
        s.dispatchEvent(new Event('input', { bubbles: true }));
        s.dispatchEvent(new Event('change', { bubbles: true })); ok++;
      } catch(e){} }
      return { total: rs.length, fired: ok };
    });

    // stepper present + advances (answer a gated first card so we truly test advance)
    r.checks.stepper = await page.evaluate(() => {
      const cards = document.querySelectorAll('#inq-cards .inq-step');
      const next = document.getElementById('inq-next');
      const skip = document.getElementById('aside-inquiry-skip');
      if (!cards.length) return { hasInquiry: false };
      const activeBefore = document.querySelector('.inq-step.active');
      const gated = next && next.disabled;
      if (gated) { const ch = activeBefore && activeBefore.querySelector('.choice'); if (ch) ch.click(); }
      let advanced = false;
      if (next && !next.disabled) { next.click(); advanced = document.querySelector('.inq-step.active') !== activeBefore; }
      return { hasInquiry: true, steps: cards.length, hasNext: !!next, hasSkip: !!skip, firstGated: !!gated, advanced };
    });

    // top-bar controls present
    r.checks.topbar = await page.evaluate(() =>
      ['shell-info','shell-theme','shell-maximize','toggle-formal','shell-reset','shell-play']
        .filter(id => !document.getElementById(id)));

    r.errors = errors; r.missing = [...new Set(missing)];
  } catch (e) {
    r.errors = errors.concat('LOAD FAILED: ' + e.message); r.missing = [...new Set(missing)];
  } finally { await page.close(); }

  const c = r.checks;
  // Hard fail = JS error or a broken control. Missing resources are a warning.
  r.pass = r.errors.length === 0 && c.canvasNonBlank && c.playToggles &&
           c.sliders && c.sliders.fired === c.sliders.total &&
           (c.stepper && c.stepper.hasInquiry ? c.stepper.advanced : true) &&
           (!c.topbar || c.topbar.length === 0);
  return r;
}

const files = targets();
if (!files.length) { console.error('No target. Pass a file or --all.'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const results = [];
for (const f of files) {
  const r = await testOne(browser, f);
  results.push(r);
  writeFileSync(resolve(HERE, basename(f).replace(/\.html$/, '') + '-smoke.json'), JSON.stringify(r, null, 2));
  const c = r.checks;
  const bits = [
    r.pass ? 'PASS' : 'FAIL',
    r.errors.length ? `${r.errors.length} JS-err` : 'no-err',
    c.canvasNonBlank ? 'canvas✓' : 'canvas✗',
    c.playToggles ? 'play✓' : 'play✗',
    c.sliders ? `sliders ${c.sliders.fired}/${c.sliders.total}` : 'sliders?',
    c.stepper?.hasInquiry ? `steps ${c.stepper.steps}${c.stepper.advanced ? ' adv✓' : ' adv✗'}` : 'no-inquiry',
    (c.topbar && c.topbar.length) ? `missing-ctrl:${c.topbar.join(',')}` : 'topbar✓',
    r.missing.length ? `⚠ ${r.missing.length} missing-asset` : '',
  ].filter(Boolean);
  console.log(`${bits[0].padEnd(4)} ${r.sim}\n      ${bits.slice(1).join(' | ')}`);
}
await browser.close();
const failed = results.filter(r => !r.pass).length;
console.log(`\n${results.length} tested, ${results.length - failed} pass, ${failed} fail.`);
