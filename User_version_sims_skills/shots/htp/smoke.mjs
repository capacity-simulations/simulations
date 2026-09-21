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

const FILE = resolve(__dirname, '../../../Fermi_university_sim_lab_sims/PP_sims/how-to-make-a-particle.html');
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

// ---- 6 cold boots: overlay always on, localStorage cleared ----
console.log('\n== cold boots ==');
for (let i = 0; i < 6; i++) {
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  const shown = await p.evaluate(() => {
    const ov = document.getElementById('welcome-overlay');
    return ov && !ov.classList.contains('hidden') && getComputedStyle(ov).display !== 'none';
  });
  ok(shown, `cold boot ${i + 1}/6 overlay visible`);
  const lect = await p.evaluate(() => getComputedStyle(document.getElementById('shell-lecture')).display === 'none');
  const ht = await p.evaluate(() => getComputedStyle(document.getElementById('ht-ctl')).display === 'none');
  ok(lect && ht, `cold boot ${i + 1}/6 lecture+HT hidden`);
  await p.close();
}

// ---- hero 1:1 backing store, both themes / both viewports ----
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

// ---- three entry modes ----
{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="inquiry"]');
  await sleep(500);
  const gi = await p.evaluate(() => ({
    ov: document.getElementById('welcome-overlay').classList.contains('hidden'),
    giOn: document.getElementById('btn-gi').classList.contains('active'),
    card: document.querySelector('#inq-cards .inq-step.active h4')?.textContent || '',
    nextDis: document.getElementById('inq-next').disabled,
    E: window.__inq?.state?.E
  }));
  ok(gi.ov && gi.giOn && gi.card.includes('A photon and a nucleus') && !gi.nextDis,
    `inquiry entry: overlay gone, card 1, Next enabled (E=${gi.E})`);
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
      glowId: glow && (glow.id || glow.className),
      navW: nav ? Math.round(nav.getBoundingClientRect().width) : 0,
      navRight: nav ? Math.round(innerWidth - nav.getBoundingClientRect().right) : null
    };
  });
  ok(cg.ov && cg.cgOn && cg.nav && cg.call, `controls entry: overlay gone, nav+callout up (glow=${cg.glowId})`);
  ok(Math.abs(cg.navW - 284) <= 4, `cg-nav width ${cg.navW} (want 284)`);
  ok(cg.navRight !== null && Math.abs(cg.navRight - 18) <= 4, `cg-nav right ${cg.navRight} (want 18)`);
  await shot(p, '02-controls-step1');
  // walk CG: every glow target exists; sidebar empty at step 1
  const uncovered = await p.evaluate(() => {
    const side = document.querySelector('.shell-aside');
    const boxes = [...side.querySelectorAll('.ctrl-box')];
    const vis = boxes.filter(b => {
      const cs = getComputedStyle(b); const r = b.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 4 &&
             !b.classList.contains('cg-hidden') && !b.classList.contains('cg-veiled') &&
             !b.closest('.cg-hidden');
    });
    return { total: boxes.length, visible: vis.length, names: vis.map(b => b.id) };
  });
  ok(uncovered.visible <= 1, `CG step 1 sidebar empty (${uncovered.visible}/${uncovered.total} ctrl-boxes: ${uncovered.names.join(',')})`);
  const nSteps = await p.evaluate(() => document.querySelectorAll('.cg-nav button').length);
  // click Next until Done
  for (let i = 0; i < 12; i++) {
    const label = await p.evaluate(() => document.getElementById('cg-next')?.textContent || '');
    const glowOk = await p.evaluate(() => {
      const st = document.querySelector('.cg-callout h5')?.textContent || '';
      const glow = document.querySelector('.cg-glow');
      if (st.includes('every control')) return true;
      return !!(glow && getComputedStyle(glow).display !== 'none');
    });
    ok(glowOk, `CG step glow/target ok (${label})`);
    if (label === 'Done') {
      await p.click('#cg-next');
      await sleep(300);
      break;
    }
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
    panel: !document.getElementById('panelOpen').classList.contains('sim-hidden')
  }));
  ok(fr.ov && fr.giOff && fr.panel, 'free entry: overlay gone, GI off, channels panel open');
  await shot(p, '03-free');
  await p.close();
}

// ---- walk every gate at student speed ----
console.log('\n== inquiry walk ==');
{
  const p = await boot({ width: 1400, height: 900 }, 'dark');
  await p.click('.welcome-mode[data-mode="inquiry"]');
  await sleep(400);

  const stateOf = () => p.evaluate(() => {
    const card = document.querySelector('#inq-cards .inq-step.active');
    const next = document.getElementById('inq-next');
    const choices = [...(card?.querySelectorAll('.choice') || [])];
    return {
      title: card?.querySelector('h4')?.textContent || '',
      gated: card?.hasAttribute('data-gate') || false,
      answered: card?.hasAttribute('data-answered') || false,
      nextDis: next.disabled,
      nextLabel: next.textContent.trim(),
      nChoices: choices.length,
      nCorrect: choices.filter(c => c.classList.contains('correct')).length,
      nDisabled: choices.filter(c => c.disabled).length,
      E: window.__inq?.state?.E,
      beam: !!window.__inq?.state?.beamOn,
      events: window.__inq?.state?.events?.length || 0,
      keHidden: document.getElementById('rowKE')?.classList.contains('sim-hidden'),
      nextHidden: document.getElementById('rowNext')?.classList.contains('sim-hidden'),
      panelHidden: document.getElementById('panelOpen')?.classList.contains('sim-hidden')
    };
  });

  let s = await stateOf();
  ok(!s.gated && !s.nextDis, `card 1 FRAME Next enabled (${s.title})`);
  ok(s.panelHidden && !s.beam, 'card 1 chamber empty, channels hidden');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis && !s.answered, `card 2 gate blocks Next (${s.title})`);
  ok(!s.beam && s.panelHidden, 'card 2 still empty until commit');
  // pick a WRONG first? one card: pick correct so we see one correct marked
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(400);
  s = await stateOf();
  ok(s.answered && !s.nextDis && s.nCorrect === 1 && s.nDisabled === s.nChoices,
    `card 2 commit: 1 correct, rest disabled (${s.nDisabled}/${s.nChoices}), Next on`);
  ok(Math.abs(s.E - 1) < 1e-6, `card 2 commit set E=1 GeV (got ${s.E})`);
  ok(!s.beam && (s.events === 0), 'card 2 commit does not fire (protects Q3 tracks)');
  await shot(p, '04-card2-answered');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis, `card 3 gate blocks Next (${s.title})`);
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(300);
  s = await stateOf();
  ok(s.answered && !s.nextDis && s.nCorrect === 1 && s.nDisabled === s.nChoices, 'card 3 commit ok');
  ok(!s.keHidden, 'card 3 commit revealed T row');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis, `card 4 gate blocks Next (${s.title})`);
  ok(s.nextHidden, 'card 4 next-threshold still hidden (anti-lookup)');
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(300);
  s = await stateOf();
  ok(s.answered && !s.nextDis && s.nCorrect === 1, 'card 4 commit ok');
  ok(!s.nextHidden, 'card 4 commit revealed next-threshold');
  await p.click('#inq-next');
  await sleep(350);

  s = await stateOf();
  ok(s.gated && s.nextDis && s.nextLabel.includes('Finish'), `card 5 gate blocks Finish (${s.title})`);
  await p.click('#inq-cards .inq-step.active .choice[data-correct]');
  await sleep(300);
  s = await stateOf();
  ok(s.answered && !s.nextDis && s.nCorrect === 1, 'card 5 commit ok');
  await shot(p, '05-card5-answered');

  // Finish → GI off
  await p.click('#inq-next');
  await sleep(400);
  const afterFinish = await p.evaluate(() => ({
    giOff: document.documentElement.classList.contains('gi-off'),
    giActive: document.getElementById('btn-gi').classList.contains('active'),
    panel: !document.getElementById('panelOpen').classList.contains('sim-hidden')
  }));
  ok(afterFinish.giOff && !afterFinish.giActive && afterFinish.panel, 'Finish → GI off, free explore');

  // Reset by REAL click — re-arm gates, card 1
  await p.click('#shell-reset');
  await sleep(700);
  const afterReset = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('#inq-cards .inq-step')];
    const active = cards.find(c => c.classList.contains('active'));
    const answered = cards.filter(c => c.hasAttribute('data-answered')).length;
    const disabledChoices = [...document.querySelectorAll('#inq-cards .choice')].filter(c => c.disabled).length;
    return {
      giOn: document.getElementById('btn-gi').classList.contains('active'),
      title: active?.querySelector('h4')?.textContent || '',
      answered,
      disabledChoices,
      nextDis: document.getElementById('inq-next').disabled,
      E: window.__inq?.state?.E,
      beam: !!window.__inq?.state?.beamOn
    };
  });
  ok(afterReset.giOn && afterReset.title.includes('A photon and a nucleus') && afterReset.answered === 0 && afterReset.disabledChoices === 0,
    `Reset re-arm: card 1, 0 answered, choices live (E=${afterReset.E} beam=${afterReset.beam})`);
  // walk to card 2 and confirm gate is back
  await p.click('#inq-next');
  await sleep(300);
  const rearmed = await p.evaluate(() => document.getElementById('inq-next').disabled);
  ok(rearmed, 'after Reset, card 2 gate blocks Next again');
  await shot(p, '06-after-reset-card2');
  await p.close();
}

// compact viewport inquiry
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
