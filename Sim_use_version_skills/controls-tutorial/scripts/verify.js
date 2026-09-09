#!/usr/bin/env node
/*
 * Controls Guide (overlay) invariant verifier — config-free.
 * Usage: node verify.js <patched.html> [--baseline <original.html>]
 * Discovers the guide from the DOM (#btn-cg, .cg-callout, .cg-nav) and
 * asserts the validated behavior. With --baseline, pre-existing runtime
 * errors (CDN libs failing headlessly) are subtracted. Exit 0 = pass.
 */
const fs = require('fs');
const { JSDOM } = require('jsdom');
const args = process.argv.slice(2);
const target = args[0];
const baseline = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : null;
if (!target) { console.error('usage: node verify.js <patched.html> [--baseline <original.html>]'); process.exit(1); }

const h = {};
// Canvas stub: every property is callable, every call returns the same callable,
// numeric coercion gives 0 and `.width` gives 10 — so sim draw loops never throw headlessly.
const anyFn = new Proxy(function () {}, { get: (t, k) => (k === 'width' || k === 'height' ? 10 : k === Symbol.toPrimitive ? () => 0 : anyFn), apply: () => anyFn });
h.o = anyFn;
function boot(file) {
  const html = fs.readFileSync(file, 'utf8');
  const errors = [];
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
    w.HTMLCanvasElement.prototype.getContext = () => h.o;
    w.Element.prototype.scrollIntoView = function () {};
    w.requestAnimationFrame = cb => setTimeout(() => cb(16), 16);
  }});
  dom.window.addEventListener('error', e => errors.push(String(e.message)));
  return new Promise(res => setTimeout(() => res({ dom, errors }), 500));
}
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

(async () => {
  const baseErrs = baseline ? (await boot(baseline)).errors : [];
  const { dom, errors } = await boot(target);
  const d = dom.window.document;
  const $ = s => d.querySelector(s);
  const $$ = s => Array.from(d.querySelectorAll(s));
  // Double-application guard: a skill applied twice must be caught, not tolerated
  for (const id of ['btn-gi','btn-cg','inq-zone','aside-inquiry','welcome-overlay','cg-callout','ctlZone']) {
    const n = d.querySelectorAll('#' + id + ', .' + id).length; ok(n <= 1, `no duplicate #${id} (found ${n})`);
  }
  { const tpl = [...d.querySelectorAll('script')].map(x => x.textContent).filter(t => /Controls Guide|Welcome overlay|Two-button template|Guided Inquiry \+ Controls Guide/.test(t)); ok(tpl.length === new Set(tpl).size, 'no duplicated template script blocks (' + tpl.length + ' template scripts)'); }
  const btn = $('#btn-cg');
  ok(!!btn, '#btn-cg present');
  if (!btn) return report();
  const hiddenSet = () => new Set($$('.cg-hidden, .cg-veiled'));
  const glows = () => $$('.cg-glow');

  // Boot: original untouched
  ok(!$('.cg-callout') && !$('.cg-nav'), 'boot: no callout/nav in DOM');
  ok(hiddenSet().size === 0 && glows().length === 0, 'boot: no cg classes applied');
  ok(!btn.classList.contains('active'), 'boot: guide button inactive');

  // Open
  btn.click();
  const co = $('.cg-callout'), nav = $('.cg-nav');
  ok(btn.classList.contains('active'), 'open: button active');
  ok(!!co && !!nav && co.style.display !== 'none', 'open: callout + nav shown');
  ok(!!co && !!co.querySelector('.cg-arrow'), 'open: arrow element present');
  const next = () => $('#cg-next'), prev = () => $('#cg-prev');
  ok(hiddenSet().size > 0, 'step 1: later elements hidden/veiled');
  ok(glows().length === 1, 'step 1: exactly one glowing element');

  // Forward walk: monotone reveal; glow never hidden; side class per step
  let prevHidden = hiddenSet().size, steps = 1;
  const titles = [co.querySelector('h5').textContent];
  while (next().textContent.trim() !== 'Done') {
    next().click(); steps++;
    const hs = hiddenSet();
    ok(hs.size <= prevHidden, `step ${steps}: reveal monotone (${hs.size} <= ${prevHidden})`);
    prevHidden = hs.size;
    const g = glows();
    if (g.length) {
      ok(g.length === 1, `step ${steps}: one glow`);
      ok(!g[0].classList.contains('cg-hidden') && !g[0].classList.contains('cg-veiled'), `step ${steps}: glowing element is visible`);
      { const cs = dom.window.getComputedStyle(g[0]); ok(cs.display !== 'none' && cs.visibility !== 'hidden', `step ${steps}: glowing element not hidden by the sim itself (computed style)`); }
      ok(/arrow-(top|bottom|left|right)/.test(co.className), `step ${steps}: callout has a side arrow class`);
    }
    titles.push(co.querySelector('h5').textContent);
    ok(co.querySelector('p').textContent.trim().split(/\s+/).length <= 18, `step ${steps}: text ≤18 words`);
    if (steps > 40) { ok(false, 'runaway walk'); break; }
  }
  ok(co.classList.contains('no-arrow'), 'closing card: no arrow');
  ok(glows().length === 0, 'closing card: no glow');
  ok(hiddenSet().size === 0, 'closing card: everything revealed');
  ok(new Set(titles).size === titles.length, 'step titles unique');

  // Back-nav never re-hides
  prev().click(); prev().click();
  ok(hiddenSet().size === 0, 'back-nav: nothing re-hides');
  while (next().textContent.trim() !== 'Done') next().click();

  // Done: restore + deactivate; revisit = closing card, all visible
  next().click();
  ok(!btn.classList.contains('active'), 'done: button inactive');
  ok(co.style.display === 'none' && nav.style.display === 'none', 'done: callout + nav hidden');
  ok(hiddenSet().size === 0 && glows().length === 0, 'done: all cg classes cleared');
  btn.click();
  ok(co.classList.contains('no-arrow') && hiddenSet().size === 0, 'revisit after done: closing card, all visible (session memory)');
  btn.click();

  // Reset = first-load: guide closes + progress cleared
  const reset = $('#reset-btn, #btn-reset, #shell-reset, [id*="reset" i]');
  if (reset) {
    btn.click(); reset.click();
    await new Promise(r => setTimeout(r, 80)); // reset handlers may defer a tick
    ok(!btn.classList.contains('active'), 'reset: guide closed');
    btn.click();
    ok(hiddenSet().size > 0 && !co.classList.contains('no-arrow'), 'reset: reopen starts at step 1 with elements re-hidden');
    btn.click();
  } else ok(false, 'no Reset element found (expected id containing "reset")');

  const newErrs = errors.filter(e => !baseErrs.includes(e));
  ok(newErrs.length === 0, 'no new runtime errors: ' + JSON.stringify(newErrs.slice(0, 3)));
  report();

  function report() {
    if (fails.length) { console.log(`FAIL (${fails.length}):`); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
    console.log(`PASS — ${steps} steps, all Controls Guide invariants hold` + (baseline ? ` (${baseErrs.length} baseline errors ignored)` : ''));
    process.exit(0);
  }
})().catch(e => { console.log('FAIL (harness): ' + (e && e.message)); process.exit(1); });
