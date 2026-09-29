/* Orientation pop-up gate: auto-open in all three modes, and the guided-inquiry
   spoiler contract.  usage: node orient_test.mjs <sim.html> <config.json>

   config:
     miniSliders   [[miniId, simSliderId, valueToSet], ...]
     spoilers      strings that must NOT be visible anywhere in the modal in brief mode
     stagingHidden element ids that must still be display:none after close / after Run
     stagingLabels [[elementId, forbiddenRegexSource], ...]
     ctlRows       expected rows in the controls table
     runPlays      true if the Run button should leave the sim playing
*/
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const M = await import(join(dirname(fileURLToPath(import.meta.url)), 'cdp.mjs'));

/* resolve() first: a relative path would build file://Fermi_.../x.html, which
   silently loads nothing and shows up as a null querySelector 40 lines later. */
const file = resolve(process.argv[2]);
const cfg = JSON.parse(readFileSync(process.argv[3], 'utf8'));
const url = 'file://' + encodeURI(file);
let pass = 0, fail = 0;
const check = (n, ok, extra) => { ok ? pass++ : fail++;
  console.log(`${ok ? ' ok ' : 'FAIL'}  ${n}${!ok && extra !== undefined ? '   [' + extra + ']' : ''}`); };

const browser = await M.launch();

async function enter(mode) {
  const p = await M.newPage(browser);
  const errs = [];
  p.ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails.text);
  });
  await M.goto(p, url);
  await M.setViewport(p, 1512, 950);
  await new Promise(r => setTimeout(r, 1600));
  await M.evaluate(p, m => {
    document.querySelector(`#welcome-overlay .welcome-mode[data-mode="${m}"]`).click();
  }, mode);
  await new Promise(r => setTimeout(r, 900));
  return { p, errs };
}

/* the staging probe runs in-page; it must be cheap and DOM-only, because the
   sims keep their reveal flags in closures we cannot reach from here. */
const STAGING = (c) => {
  const hidden = {}, labels = {};
  for (const id of c.stagingHidden) {
    const el = document.getElementById(id);
    hidden[id] = !el || getComputedStyle(el).display === 'none';
  }
  for (const [id, re] of c.stagingLabels) {
    const el = document.getElementById(id);
    labels[id] = { text: el ? el.textContent : '(none)', bad: el ? new RegExp(re, 'i').test(el.textContent) : false };
  }
  return { hidden, labels };
};

for (const mode of ['inquiry', 'controls', 'free']) {
  const { p, errs } = await enter(mode);
  const brief = mode === 'inquiry';
  const r = await M.evaluate(p, () => {
    const vis = el => { for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n); if (cs.display === 'none' || n.hidden) return false; } return true; };
    let seen = '';
    /* the WHOLE modal, not just the article: the kicker in .phys-head is visible
       too, and on the first sim it named the conserved quantity. */
    (function walk(n) { for (const c of n.children) { if (!vis(c)) continue;
      if (!c.children.length) seen += ' ' + c.textContent; else walk(c); } })(
      document.querySelector('.phys-modal'));
    return { open: document.getElementById('phys-backdrop').classList.contains('open'),
             fullHidden: document.getElementById('phys-full').hidden,
             brief: document.getElementById('phys-orient').getAttribute('data-brief'),
             scrollTop: Math.round(document.querySelector('.phys-body').scrollTop),
             orientVisible: vis(document.getElementById('phys-orient')),
             liveVisible: vis(document.getElementById('phys-live')),
             runVisible: vis(document.getElementById('phys-run')),
             d0: !!document.querySelector('#phys-orient .fig.f0 svg'),
             ctlRows: document.querySelectorAll('#phys-orient .orient-ctl tbody tr').length,
             seesimVisible: [...document.querySelectorAll('.seesim')].filter(vis).length,
             seen };
  });

  console.log(`\n--- entered "${mode}" ---`);
  check(`${mode}: sheet auto-opened`, r.open);
  check(`${mode}: landed on the orientation block`, r.scrollTop === 0 && r.orientVisible);
  check(`${mode}: apparatus map d0 rendered`, r.d0);
  check(`${mode}: controls table has ${cfg.ctlRows} rows`, r.ctlRows === cfg.ctlRows, String(r.ctlRows));
  check(`${mode}: live sliders present`, r.liveVisible);
  check(`${mode}: Run button present`, r.runVisible);
  check(`${mode}: full sheet ${brief ? 'collapsed' : 'open'}`, r.fullHidden === brief, `hidden=${r.fullHidden}`);
  check(`${mode}: data-brief="${brief ? 1 : 0}"`, r.brief === (brief ? '1' : '0'), r.brief);
  check(`${mode}: no page exceptions`, errs.length === 0, errs.slice(0, 1).join(''));

  if (brief) {
    for (const bad of cfg.spoilers)
      check(`inquiry: "${bad}" not visible`, !r.seen.includes(bad),
            (r.seen.match(new RegExp('.{0,30}' + bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '.{0,30}')) || [''])[0]);
    check('inquiry: no reachable "see it in the sim" button', r.seesimVisible === 0, String(r.seesimVisible));

    // opening and closing the sheet must not unlock anything on the stage
    const st = await M.evaluate(p, c => {
      document.getElementById('phys-close').click();
      return (new Function('c', 'return (' + c.fn + ')(c)'))(c);
    }, { ...cfg, fn: STAGING.toString() });
    for (const [id, ok] of Object.entries(st.hidden))
      check(`inquiry: #${id} still hidden after close`, ok);
    for (const [id, v] of Object.entries(st.labels))
      check(`inquiry: #${id} not revealed`, !v.bad, v.text);

    // ...and neither must the Run button
    const run = await M.evaluate(p, c => {
      window.__openPhysics({ brief: true });
      for (const [mini, , val] of c.miniSliders) {
        const e = document.getElementById(mini);
        e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
      }
      document.getElementById('phys-run').click();
      const got = c.miniSliders.map(([, main]) => document.getElementById(main).value);
      const stg = (new Function('c', 'return (' + c.fn + ')(c)'))(c);
      return { got, closed: !document.getElementById('phys-backdrop').classList.contains('open'),
               playing: (window.Shell ? !!Shell.playing : null), stg };
    }, { ...cfg, fn: STAGING.toString() });

    cfg.miniSliders.forEach(([mini, main, val], k) => {
      check(`inquiry: Run pushed ${mini} -> ${main}`, Math.abs(+run.got[k] - +val) < 1e-9,
            `${run.got[k]} vs ${val}`);
    });
    check('inquiry: Run closed the sheet', run.closed);
    check(`inquiry: Run left the sim ${cfg.runPlays ? 'playing' : 'paused'}`,
          run.playing === cfg.runPlays, String(run.playing));
    for (const [id, ok] of Object.entries(run.stg.hidden))
      check(`inquiry: Run did NOT unlock #${id}`, ok);
    for (const [id, v] of Object.entries(run.stg.labels))
      check(`inquiry: Run did NOT reveal #${id}`, !v.bad, v.text);
  } else {
    check(`${mode}: chapters reachable (see-it buttons visible)`, r.seesimVisible > 0, String(r.seesimVisible));
  }
  p.close();
}

/* the header button must still give the whole sheet */
{
  const { p } = await enter('inquiry');
  const r = await M.evaluate(p, () => {
    document.getElementById('phys-close').click();
    document.getElementById('toggle-formal').click();
    return { open: document.getElementById('phys-backdrop').classList.contains('open'),
             fullHidden: document.getElementById('phys-full').hidden,
             brief: document.getElementById('phys-orient').getAttribute('data-brief') };
  });
  console.log('\n--- header button after an inquiry entry ---');
  check('header ⚛︎ opens the sheet', r.open);
  check('header ⚛︎ gives the FULL sheet even after a brief open', r.fullHidden === false);
  check('header ⚛︎ clears brief mode', r.brief === '0');
  p.close();
}

/* the collapse toggle */
{
  const { p } = await enter('inquiry');
  const r = await M.evaluate(p, () => {
    const b = document.getElementById('phys-full-toggle'), f = document.getElementById('phys-full');
    const before = f.hidden, lab0 = b.querySelector('.pf-label').textContent;
    b.click(); const after = f.hidden, lab1 = b.querySelector('.pf-label').textContent;
    b.click();
    return { before, after, back: f.hidden, lab0, lab1 };
  });
  console.log('\n--- the collapse toggle ---');
  check('starts collapsed in inquiry', r.before === true);
  check('opens on click', r.after === false);
  check('closes again', r.back === true);
  check('label warns about answers while collapsed', /contains the answers/.test(r.lab0), r.lab0);
  check('label flips when open', /Hide the full/.test(r.lab1), r.lab1);
  p.close();
}

console.log(`\n${pass} passed, ${fail} failed`);
browser.proc.kill();
process.exit(fail ? 1 : 0);
