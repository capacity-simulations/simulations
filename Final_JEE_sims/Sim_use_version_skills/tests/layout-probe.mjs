// Layout-contract probe for guided-inquiry builds — course-agnostic.
//
// THE CONTRACT (measured identical across JEE-C, CM-L, PP-v2 and SR shells,
// zone at x=1199 y=80 w=283 with an 18px gap below the top bar on all four):
//   1. The inquiry zone (#aside-inquiry or #inq-zone) renders in the RIGHT
//      column (its right edge within 40px of the viewport edge).
//   2. It is the FIRST visible block below the top bar: gap ≤ 28px and NO
//      other leaf element (e.g. a "CONTROLS" header) renders between the top
//      bar's bottom edge and the zone's top edge in that column.
//   3. Zone-internal order: zone head → #inq-dots → #inq-cards →
//      (.inq-listen when the voice layer is applied) → .inq-nav.
//   4. The controls area (#aside-controls / first control panel) starts BELOW
//      the zone.
// Sims that boot into lecture mode are reopened; a welcome overlay is entered
// via its inquiry card first.
//
// Usage:
//   node tests/layout-probe.mjs <build1.html> [build2.html ...]
//   (absolute paths or paths relative to cwd; driven over file://)
// Requires Chrome at the standard macOS path, driven via puppeteer-core —
// pass --chrome <path> to override. Exit 0 = all conform.

import { createRequire } from 'module';
import { resolve } from 'path';

const args = process.argv.slice(2);
const ci = args.indexOf('--chrome');
const CHROME = ci >= 0 ? args.splice(ci, 2)[1]
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const rq = args.indexOf('--require-dir');
const REQ_DIR = rq >= 0 ? args.splice(rq, 2)[1] : import.meta.dirname + '/../node_modules-puppeteer/';

let puppeteer;
for (const dir of [REQ_DIR,
  '/Users/admin/Desktop/simulations-1/Capacity_SR_sims_v2_engine/_review/']) {
  try { puppeteer = createRequire(dir)('puppeteer-core'); break; } catch (e) {}
}
if (!puppeteer) { console.error('puppeteer-core not found — pass --require-dir <dir with node_modules/puppeteer-core>'); process.exit(1); }

const GAP_MAX = 28;
let failed = 0;
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--allow-file-access-from-files'] });

for (const f of args) {
  const p = await b.newPage(); await p.setViewport({ width: 1500, height: 950 });
  try { await p.goto('file://' + resolve(f), { waitUntil: 'networkidle0', timeout: 30000 }); } catch (e) {}
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(() => {
    const m = document.querySelector('.welcome-mode[data-mode="inquiry"]'); if (m) m.click();
    const lect = document.getElementById('shell-lecture');
    if (lect && (document.documentElement.classList.contains('lecture-mode') ||
                 document.getElementById('shell')?.classList.contains('lecture-mode'))) lect.click();
    const chip = document.getElementById('aside-inquiry-restore');
    if (chip && getComputedStyle(chip).display !== 'none') chip.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const g = await p.evaluate(() => {
    const q = s => document.querySelector(s);
    const rect = e => { if (!e) return null; const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return cs.display === 'none' || r.width === 0 ? null : { x: r.x, y: r.y, w: r.width, h: r.height }; };
    const topbar = rect(q('.top-bar') || q('.shell-header') || q('header'));
    const zone = rect(q('#aside-inquiry') || q('#inq-zone'));
    const dots = rect(q('#inq-dots')), cards = rect(q('#inq-cards'));
    const listen = rect(q('.inq-listen')), nav = rect(q('.inq-nav'));
    const ctrl = rect(q('#aside-controls') || q('.panel-block') || q('.ctrl-box'));
    const gi = rect(q('#btn-gi')), theme = rect(q('#shell-theme') || q('.theme-toggle-wrap') || q('.theme-toggle'));
    const resetB = rect(q('#shell-reset') || q('#reset') || q('#reset-btn') || q('#btn-reset'));
    let intruder = null;
    if (topbar && zone) {
      for (const e of document.body.querySelectorAll('*')) {
        const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (cs.display === 'none' || r.width < 10 || r.height < 8) continue;
        if (e.children.length > 2) continue;
        if (r.left >= zone.x - 8 && r.top >= topbar.y + topbar.h - 2 && r.top < zone.y - 2 && r.height < 60)
          { intruder = (e.textContent || '').trim().slice(0, 30) || e.tagName; break; }
      }
    }
    return { topbar, zone, dots, cards, listen, nav, ctrl, gi, theme, resetB, intruder, vw: innerWidth };
  });

  const errs = [];
  if (!g.zone) errs.push('no inquiry zone rendered');
  else {
    if (g.vw - (g.zone.x + g.zone.w) > 40) errs.push('zone not in the right column');
    if (g.topbar && g.zone.y - (g.topbar.y + g.topbar.h) > GAP_MAX)
      errs.push(`gap below top bar ${Math.round(g.zone.y - (g.topbar.y + g.topbar.h))}px > ${GAP_MAX}px`);
    if (g.intruder) errs.push(`element between top bar and zone: "${g.intruder}"`);
    if (!g.dots) errs.push('no #inq-dots'); if (!g.cards) errs.push('no #inq-cards');
    if (!g.nav) errs.push('no .inq-nav');
    if (g.dots && g.cards && !(g.dots.y < g.cards.y)) errs.push('dots not above cards');
    if (g.listen && g.nav && !(g.listen.y < g.nav.y)) errs.push('listen row not above nav');
    if (g.ctrl && !(g.zone.y < g.ctrl.y)) errs.push('controls not below the inquiry zone');
  }
  // TOP-BAR CONTRACT: the Guided Inquiry / Controls Guide pair lives in the
  // LEFT cluster, right after the theme control — never right-anchored beside
  // Reset/Play (JEE reference: gi at x≈307-569 of 1500; Reset at x≈1322).
  if (g.gi) {
    if (g.gi.x > g.vw * 0.55) errs.push(`#btn-gi right-anchored (x=${Math.round(g.gi.x)} of ${g.vw}) — belongs in the left cluster beside the theme toggle`);
    if (g.theme && g.gi.x < g.theme.x) errs.push('#btn-gi left of the theme control — order is info → theme → btn-gi → btn-cg');
    if (g.resetB && g.gi.x > g.resetB.x) errs.push('#btn-gi to the right of Reset');
  }
  // GUIDE-NAV CONTRACT: the Controls Guide nav docks at the BOTTOM of the
  // viewport (reference bottom:16px). A raised nav collides with sidebar
  // controls on busy sims; overlapping the reviewer-only feedback pill is
  // accepted. Open the guide to measure it.
  if (await p.evaluate(() => !!document.getElementById('btn-cg'))) {
    await p.evaluate(() => document.getElementById('btn-cg').click());
    await new Promise(r => setTimeout(r, 600));
    const nav = await p.evaluate(() => { const e = document.querySelector('.cg-nav');
      if (!e || getComputedStyle(e).display === 'none') return null;
      const r = e.getBoundingClientRect();
      const s = document.querySelector('.sidebar') || document.querySelector('.shell-aside') || document.querySelector('aside');
      const sc = s ? (() => { const b = s.getBoundingClientRect(); return b.x + b.width / 2; })() : null;
      return { bottomGap: innerHeight - (r.y + r.height),
               offCenter: sc === null ? null : Math.abs((r.x + r.width / 2) - sc) }; });
    if (nav && nav.bottomGap > 28) errs.push(`guide nav floats ${Math.round(nav.bottomGap)}px above the viewport bottom (reference: 16px)`);
    // Centered on the sidebar. Tolerance 30px: legacy JEE right:18 anchoring
    // measures 24-28px off (accepted shipped fleet); anything beyond means the
    // nav is visibly skewed on this sim's sidebar — center it with equal side
    // margins (width: sidebarW - 36px; right:18px).
    if (nav && nav.offCenter !== null && nav.offCenter > 30)
      errs.push(`guide nav ${Math.round(nav.offCenter)}px off the sidebar centre — give it equal side margins`);
    if (!nav) errs.push('controls guide opened but no visible .cg-nav');
  }
  console.log(errs.length ? `FAIL  ${f}\n      ${errs.join('\n      ')}` : `  ok  ${f}`);
  if (errs.length) failed++;
  await p.close();
}
await b.close();
process.exit(failed ? 1 : 0);
