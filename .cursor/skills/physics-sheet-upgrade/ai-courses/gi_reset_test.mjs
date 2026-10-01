// S1 test: answer the first cards of the guided inquiry, press Reset, and check the deck is re-armed:
// back on card 1, no card answered, no choice styled/locked, no feedback showing, Next locked on a gated
// card 1; then answering card 1 again must work. Usage: node test-s1.mjs <listfile> [conc]
import { createRequire } from 'module'; import { readFileSync } from 'fs';
const require = createRequire('/Users/admin/Desktop/simulations-1/Fermi_SR_simulations/Capacity_SR_sims_v2_engine/_review/');
const puppeteer = require('puppeteer-core');
const files = readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean); const CONC = +(process.argv[3] || 6);
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--allow-file-access-from-files'] });
const sleep = ms => new Promise(r => setTimeout(r, ms)); const q = files.slice(); let pass = 0, fail = 0; const fails = [];
async function one(f) {
  const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 }); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  try {
    await p.goto('file://' + f, { waitUntil: 'load', timeout: 45000 }); await sleep(900);
    const r = await p.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const w = document.querySelector('.welcome-mode[data-mode="inquiry"], .welcome-mode[data-mode="guided"]') || document.querySelectorAll('.welcome-mode')[0];
      if (w) w.click(); else if (window.__setMode) window.__setMode('inquiry');
      await sleep(600);
      const cards = () => [...document.querySelectorAll('#inq-cards .inq-step')];
      const act = () => cards().findIndex(c => c.classList.contains('active'));
      const initDis = cards().map(c => [...c.querySelectorAll('.choice')].map(x => x.disabled));
      let answered = 0;
      for (let k = 0; k < 3; k++) {
        const c = cards()[act()]; if (!c) break;
        const ch = [...c.querySelectorAll('.choice')].find(x => !x.disabled);
        if (ch) { ch.click(); answered++; await sleep(200); }
        const nx = document.getElementById('inq-next'); if (nx && !nx.disabled) { nx.click(); await sleep(350); } else break;
      }
      const before = cards().filter(c => c.hasAttribute('data-answered')).length;
      document.getElementById('shell-reset').click(); await sleep(700);
      const c0 = cards()[0];
      const res = { answered, answeredBefore: before, active: act(),
        stillAnswered: cards().filter(c => c.hasAttribute('data-answered')).length,
        styled: document.querySelectorAll('#inq-cards .choice.correct, #inq-cards .choice.wrong, #inq-cards .choice.dim').length,
        disabledChanged: cards().reduce((n, c, i) => n + [...c.querySelectorAll('.choice')].filter((x, j) => x.disabled !== initDis[i][j]).length, 0),
        fbShowing: document.querySelectorAll('#inq-cards .predict-eval.show').length,
        gated1: !!(c0 && c0.hasAttribute('data-gate') && c0.querySelector('.choice')),
        nextDisabled: !!(document.getElementById('inq-next') || {}).disabled };
      // answering again must work
      const ch = c0 && [...c0.querySelectorAll('.choice')].find(x => !x.disabled);
      if (ch) { ch.click(); await sleep(250); res.reanswerOk = c0.hasAttribute('data-answered') && !!c0.querySelector('.predict-eval.show, .choice.correct'); }
      return res;
    });
    const ok = r.answeredBefore > 0 && r.active === 0 && r.stillAnswered === 0 && r.styled === 0 && r.disabledChanged === 0 && r.fbShowing === 0 && (!r.gated1 || r.nextDisabled) && r.reanswerOk !== false && !errs.length;
    if (ok) pass++; else { fail++; fails.push(f.split('/').slice(-2).join('/') + ' ' + JSON.stringify(r) + (errs.length ? ' ERR ' + errs[0] : '')); }
  } catch (e) { fail++; fails.push(f + ' EXC ' + e.message.slice(0, 80)); }
  await p.close();
}
await Promise.all(Array.from({ length: CONC }, async () => { while (q.length) await one(q.shift()); }));
console.log('PASS', pass, 'FAIL', fail); fails.slice(0, 12).forEach(x => console.log('  ' + x));
await b.close(); process.exit(0);
