// Standard screenshot set for a user-shell sim, via the repo's puppeteer-core + system Chrome.
// usage: node shots.mjs <sim.html> <outDir> [--widths 1440,860] [--themes dark,light]
// Captures, per width x theme: welcome, free exploration, Controls Guide open, and every inquiry card
// (paging with the shell's pager). Also writes <outDir>/audit.json with window.__audit keys (if present)
// and <outDir>/console.txt with page errors. Critics: add your own steps for control extremes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const REPO = process.env.SIM_FOUNDRY || '/Users/admin/Downloads/sim-foundry';
const puppeteer = createRequire(REPO + '/package.json')('puppeteer-core');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [file, outDir] = process.argv.slice(2);
if (!file || !outDir) { console.error('usage: node shots.mjs <sim.html> <outDir> [--widths 1440,860] [--themes dark,light]'); process.exit(2); }
const opt = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1].split(',') : d; };
const widths = opt('--widths', ['1440', '860']).map(Number), themes = opt('--themes', ['dark', 'light']);
mkdirSync(outDir, { recursive: true });
const url = 'file://' + resolve(file);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
async function fresh(w, theme) {
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(`${w}/${theme}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`${w}/${theme} console: ${m.text()}`); });
  await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' }); await sleep(600);
  if (theme === 'light') await page.evaluate(() => { const b = document.getElementById('shell-theme'); if (b && !document.body.classList.contains('light-theme')) b.click(); });
  await sleep(200);
  return page;
}
const shot = (page, name) => page.screenshot({ path: `${outDir}/${name}.png` });
const startMode = (page, mode) => page.evaluate(m => {
  const b = document.querySelector(`#welcome-overlay [data-mode="${m}"]`); if (b) b.click(); else if (window.__setMode) window.__setMode(m);
}, mode);

for (const w of widths) for (const theme of themes) {
  const tag = `${w}-${theme}`;
  let p = await fresh(w, theme);
  await shot(p, `${tag}-00-welcome`);
  await startMode(p, 'free'); await sleep(800); await shot(p, `${tag}-01-free`);
  if (w === widths[0] && theme === themes[0]) {
    const audit = await p.evaluate(() => { try { const a = window.__audit; return a ? { keys: Object.keys(a), sample: typeof a.at === 'function' ? 'at() present' : null } : null; } catch (e) { return String(e); } });
    writeFileSync(`${outDir}/audit.json`, JSON.stringify(audit, null, 2));
  }
  await p.close();
  p = await fresh(w, theme);
  await startMode(p, 'controls'); await sleep(800); await shot(p, `${tag}-02-controls-guide`);
  await p.close();
  p = await fresh(w, theme);
  await startMode(p, 'inquiry'); await sleep(800);
  const n = await p.evaluate(() => document.querySelectorAll('#inq-cards .inq-step').length);
  for (let i = 0; i < n; i++) {
    await shot(p, `${tag}-1${i}-card${i + 1}`);
    await p.evaluate(() => { const b = document.getElementById('inq-pager-next'); if (b) b.click(); });
    await sleep(700);
  }
  await p.close();
}
await browser.close();
writeFileSync(`${outDir}/console.txt`, errors.join('\n') || 'no page errors');
console.log(`screenshots → ${outDir} (${widths.join(',')} × ${themes.join(',')}); page errors: ${errors.length}`);
