// Browser probe for CLASSICAL-MECHANICS shell sims.
// Drives the system Chrome via puppeteer-core (no bundled download) to VALIDATE
// PHYSICS BEHAVIOUR VISUALLY: screenshots the initial + running state, then sweeps
// every range slider (min / mid / max) capturing a screenshot, the on-screen
// readouts, and window.__audit (if the sim exposes it) at each setting.
//
// Usage:
//   node browser-probe.mjs <sim.html> [outdir]
// Writes:
//   <outdir>/<sim>__<label>.png        (one per captured state)
//   <outdir>/<sim>-probe.json          (errors + readouts + audit per state)
//
// puppeteer-core is resolved from the SR engine's _review/node_modules via an
// explicit createRequire base, so this script runs from anywhere.

import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, basename } from 'node:path';

const REQUIRE_BASE = '/Users/admin/Desktop/simulations-1/Capacity_SR_sims_v2_engine/_review/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const require = createRequire(REQUIRE_BASE);
const puppeteer = require('puppeteer-core');

const file = resolve(process.cwd(), process.argv[2] || '');
const outdir = resolve(process.cwd(), process.argv[3] || './_cm-probe');
mkdirSync(outdir, { recursive: true });
const name = basename(file).replace(/\.html$/, '');

const readState = (page) => page.evaluate(() => {
  const txt = (sel) => Array.from(document.querySelectorAll(sel))
    .map(e => (e.textContent || '').trim()).filter(Boolean);
  let audit = null;
  try { if (window.__audit && typeof window.__audit.at === 'function') audit = window.__audit.at(0); }
  catch (e) { audit = { error: String(e) }; }
  return {
    readouts: txt('.shell-readout, [id^="ro"], .drow, #data-body'),
    playLabel: (document.getElementById('shell-play') || {}).textContent || null,
    audit,
  };
});

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: ['--no-sandbox', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/i.test(m.text())) errors.push(m.text()); });

const probe = { sim: name, errors, states: [] };
const capture = async (label) => {
  const s = await readState(page);
  probe.states.push({ label, ...s });
  await page.screenshot({ path: `${outdir}/${name}__${label}.png` });
};

await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle2', timeout: 20000 });
await new Promise(r => setTimeout(r, 800)); // let rAF + KaTeX settle

await capture('initial');

// Press Play and let it evolve, so animation-driven physics is visible.
await page.evaluate(() => { const b = document.getElementById('shell-play'); if (b) b.click(); });
await new Promise(r => setTimeout(r, 1600));
await capture('after-play');

// Sweep every range slider min / mid / max; restore afterwards.
const sliders = await page.evaluate(() => Array.from(document.querySelectorAll('input[type=range]'))
  .map(s => ({ id: s.id, min: +s.min, max: +s.max, value: +s.value })));
for (const s of sliders) {
  if (!s.id) continue;
  const mid = Math.round(((s.min + s.max) / 2) * 100) / 100;
  for (const [tag, val] of [['min', s.min], ['mid', mid], ['max', s.max]]) {
    await page.evaluate(({ id, val }) => {
      const el = document.getElementById(id); if (!el) return;
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, { id: s.id, val });
    await new Promise(r => setTimeout(r, 450));
    await capture(`${s.id}-${tag}-${val}`);
  }
  await page.evaluate(({ id, val }) => {
    const el = document.getElementById(id); if (!el) return;
    el.value = val; el.dispatchEvent(new Event('input', { bubbles: true }));
  }, { id: s.id, val: s.value });
}

writeFileSync(`${outdir}/${name}-probe.json`, JSON.stringify(probe, null, 2));
console.log(`probe: ${probe.states.length} states, ${errors.length} js-errors, ${sliders.length} sliders → ${outdir}`);
await browser.close();
