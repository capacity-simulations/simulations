import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let puppeteer;
for (const dir of [
  resolve(__dirname, '../../node_modules-puppeteer/'),
  '/Users/admin/Desktop/simulations-1/Fermi_SR_simulations/Capacity_SR_sims_v2_engine/_review/'
]) {
  try { puppeteer = createRequire(dir)('puppeteer-core'); break; } catch (e) {}
}
if (!puppeteer) { console.error('puppeteer-core not found'); process.exit(1); }

const FILE = resolve(__dirname, '../../../Fermi_university_sim_lab_sims/PP_sims/navigating-the-eight-fold-way.html');
const SHOTS = __dirname;
mkdirSync(SHOTS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = [];
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL', m); } else console.log('  ok  ', m); };

const b = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--allow-file-access-from-files', '--disable-web-security']
});

async function boot(vp, theme) {
  const p = await b.newPage();
  await p.setViewport(vp);
  await p.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
  await p.goto('file://' + FILE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(900);
  if (theme === 'light') {
    await p.evaluate(() => { const t = document.getElementById('shell-theme'); if (t) t.click(); });
    await sleep(400);
  }
  return p;
}
async function shot(p, name) {
  await p.screenshot({ path: resolve(SHOTS, name + '.png') });
}

console.log('\n== cold boots ==');
for (let i = 0; i < 6; i++) {
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  const shown = await p.evaluate(() => {
    const ov = document.getElementById('welcome-overlay');
    return ov && !ov.classList.contains('hidden') && getComputedStyle(ov).display !== 'none';
  });
  ok(shown, `cold boot ${i + 1}/6 overlay visible`);
  const st = await p.evaluate(() => {
    const lect = getComputedStyle(document.getElementById('shell-lecture')).display === 'none';
    const ht = getComputedStyle(document.getElementById('ht-ctl')).display === 'none';
    const s = window.__inq && window.__inq.state;
    return { lect, ht, qlines: !!(s && s.qlines), revealed: !!(s && s.revealed), mode: s && s.mode };
  });
  ok(st.lect && st.ht, `cold boot ${i + 1}/6 lecture+HT hidden`);
  ok(!st.qlines && !st.revealed && st.mode === 'oct',
    `cold boot ${i + 1}/6 octet, no diagonals, Ω hidden (mode=${st.mode})`);
  await p.close();
}

console.log('\n== welcome hero + entry modes ==');
for (const [w, h] of [[1400, 900], [1024, 768]]) {
  for (const theme of ['dark', 'light']) {
    const p = await boot({ width: w, height: h }, theme);
    const hero = await p.evaluate(() => {
      const c = document.getElementById('welcome-fringes');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { cssW: Math.round(r.width), cssH: Math.round(r.height), bw: c.width, bh: c.height };
    });
    ok(hero && hero.bw === hero.cssW && hero.bh === hero.cssH,
      `hero 1:1 ${theme} ${w}x${h} css=${hero && hero.cssW}x${hero && hero.cssH} bitmap=${hero && hero.bw}x${hero && hero.bh}`);
    await shot(p, `welcome-${theme}-${w}`);
    await p.close();
  }
}

{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="inquiry"]');
  await sleep(500);
  const gi = await p.evaluate(() => ({
    ov: document.getElementById('welcome-overlay').classList.contains('hidden'),
    giOn: document.getElementById('btn-gi').classList.contains('active'),
    card: document.querySelector('#inq-cards .inq-step.active h4')?.textContent || '',
    nextDis: document.getElementById('inq-next').disabled
  }));
  ok(gi.ov && gi.giOn && gi.card.includes('A map of baryons') && !gi.nextDis, 'inquiry entry: card 1, Next enabled');
  await shot(p, '01-inquiry-card1');
  await p.close();
}
{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="controls"]');
  await sleep(700);
  const cg = await p.evaluate(() => {
    const nav = document.querySelector('.cg-nav');
    const call = document.querySelector('.cg-callout');
    const glow = document.querySelector('.cg-glow');
    return {
      ov: document.getElementById('welcome-overlay').classList.contains('hidden'),
      cgOn: document.getElementById('btn-cg').classList.contains('active'),
      nav: !!(nav && getComputedStyle(nav).display !== 'none'),
      call: !!(call && getComputedStyle(call).display !== 'none'),
      glowId: glow && glow.id,
      navW: nav ? Math.round(nav.getBoundingClientRect().width) : 0,
      navRight: nav ? Math.round(innerWidth - nav.getBoundingClientRect().right) : null
    };
  });
  ok(cg.ov && cg.cgOn && cg.nav && cg.call, `controls entry (glow=${cg.glowId})`);
  ok(Math.abs(cg.navW - 284) <= 4, `cg-nav width ${cg.navW}`);
  ok(cg.navRight !== null && Math.abs(cg.navRight - 18) <= 4, `cg-nav right ${cg.navRight}`);
  await shot(p, '02-controls-step1');
  for (let i = 0; i < 12; i++) {
    const label = await p.evaluate(() => document.getElementById('cg-next')?.textContent || '');
    const glowOk = await p.evaluate(() => {
      const st = document.querySelector('.cg-callout h5')?.textContent || '';
      const glow = document.querySelector('.cg-glow');
      if (st.includes('every control')) return true;
      return !!(glow && getComputedStyle(glow).display !== 'none' && glow.getBoundingClientRect().height > 4);
    });
    ok(glowOk, `CG glow ok (${label})`);
    if (label === 'Done') { await p.click('#cg-next'); await sleep(300); break; }
    await p.click('#cg-next');
    await sleep(250);
  }
  await p.close();
}
{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="free"]');
  await sleep(500);
  const fr = await p.evaluate(() => ({
    ov: document.getElementById('welcome-overlay').classList.contains('hidden'),
    giOff: document.documentElement.classList.contains('gi-off'),
    revealed: !!(window.__inq && window.__inq.state.revealed)
  }));
  ok(fr.ov && fr.giOff && fr.revealed, 'free entry: GI off, Ω revealed');
  await shot(p, '03-free');
  await p.close();
}

console.log('\n== inquiry walk ==');
{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="inquiry"]');
  await sleep(400);
  const stateOf = () => p.evaluate(() => {
    const card = document.querySelector('#inq-cards .inq-step.active');
    const next = document.getElementById('inq-next');
    const choices = [...(card?.querySelectorAll('.choice') || [])];
    const s = window.__inq && window.__inq.state;
    return {
      title: card?.querySelector('h4')?.textContent || '',
      gated: card?.hasAttribute('data-gate') || false,
      answered: card?.hasAttribute('data-answered') || false,
      nextDis: next.disabled,
      nextLabel: next.textContent.trim(),
      nChoices: choices.length,
      nCorrect: choices.filter(c => c.classList.contains('correct')).length,
      nDisabled: choices.filter(c => c.disabled).length,
      qlines: !!(s && s.qlines),
      revealed: !!(s && s.revealed),
      mode: s && s.mode
    };
  });

  let s = await stateOf();
  ok(!s.gated && !s.nextDis && s.mode === 'oct' && !s.qlines && !s.revealed, `card 1 FRAME (${s.title})`);
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis && !s.qlines, `card 2 gate, diagonals off (${s.title})`);
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(300);
  s = await stateOf();
  ok(s.answered && !s.nextDis && s.nCorrect === 1 && s.nDisabled === s.nChoices && s.qlines, 'card 2 commit: diagonals on');
  await shot(p, '04-card2-answered');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis && s.mode === 'dec' && !s.qlines && !s.revealed,
    `card 3 gate, diagonals off, Ω hidden (${s.title})`);
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(300);
  s = await stateOf();
  ok(s.answered && s.qlines && !s.revealed, 'card 3 commit: diagonals on, Ω still hidden');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis && s.nextLabel.includes('Finish') && !s.revealed, `card 4 gate, Ω hidden (${s.title})`);
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(400);
  s = await stateOf();
  ok(s.answered && s.revealed && s.nCorrect === 1, 'card 4 commit: Ω revealed');
  await shot(p, '05-card4-answered');

  await p.click('#inq-next');
  await sleep(400);
  const afterFinish = await p.evaluate(() => ({
    giOff: document.documentElement.classList.contains('gi-off'),
    revealed: !!(window.__inq && window.__inq.state.revealed)
  }));
  ok(afterFinish.giOff && afterFinish.revealed, 'Finish → GI off, free explore');

  await p.click('#shell-reset');
  await sleep(700);
  const afterReset = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('#inq-cards .inq-step')];
    const active = cards.find(c => c.classList.contains('active'));
    const s = window.__inq && window.__inq.state;
    return {
      giOn: document.getElementById('btn-gi').classList.contains('active'),
      title: active?.querySelector('h4')?.textContent || '',
      answered: cards.filter(c => c.hasAttribute('data-answered')).length,
      disabledChoices: [...document.querySelectorAll('#inq-cards .choice')].filter(c => c.disabled).length,
      qlines: !!(s && s.qlines),
      revealed: !!(s && s.revealed),
      mode: s && s.mode
    };
  });
  ok(afterReset.giOn && afterReset.title.includes('A map of baryons') && afterReset.answered === 0 && afterReset.disabledChoices === 0,
    `Reset re-arm card 1 (${afterReset.mode} qlines=${afterReset.qlines} Ω=${afterReset.revealed})`);
  ok(afterReset.mode === 'oct' && !afterReset.qlines && !afterReset.revealed, 'Reset scene: octet, no diagonals, Ω hidden');
  await p.click('#inq-next');
  await sleep(300);
  ok(await p.evaluate(() => document.getElementById('inq-next').disabled), 'after Reset, card 2 gate blocks Next');
  await shot(p, '06-after-reset-card2');
  await p.close();
}

{
  const p = await boot({ width: 1024, height: 768 }, 'light');
  await p.click('.welcome-mode[data-mode="inquiry"]');
  await sleep(400);
  await shot(p, 'inquiry-light-1024');
  await p.close();
}

await b.close();
console.log('\n' + (fails.length ? `FAIL (${fails.length})\n` + fails.map(f => '  · ' + f).join('\n') : 'PASS — browser smoke'));
process.exit(fails.length ? 1 : 0);
