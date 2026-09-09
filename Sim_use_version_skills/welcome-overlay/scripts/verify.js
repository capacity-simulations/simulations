#!/usr/bin/env node
/*
 * Welcome-overlay invariant verifier (headless, config-free).
 * Usage: node verify.js <patched.html> [--baseline <original.html>]
 * Exit 0 = pass. Pair with tests/browser-smoke.js for the real-browser gate.
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
function boot(file, withSpeech) {
  const html = fs.readFileSync(file, 'utf8');
  const errors = [], speech = { speak: 0, cancel: 0 };
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) {
    w.HTMLCanvasElement.prototype.getContext = () => h.o;
    w.Element.prototype.scrollIntoView = function () {};
    w.requestAnimationFrame = cb => setTimeout(() => cb(16), 16);
    if (withSpeech) {
      w.speechSynthesis = { speaking: false, pending: false, getVoices: () => [], addEventListener: () => {},
        speak: () => { speech.speak++; }, cancel: () => { speech.cancel++; } };
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
    } else { delete w.speechSynthesis; }
  }});
  dom.window.addEventListener('error', e => errors.push(String(e.message)));
  return new Promise(res => setTimeout(() => res({ dom, errors, speech }), 1100));
}
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); };

(async () => {
  const baseErrs = baseline ? (await boot(baseline, true)).errors : [];

  // ---- Pass A: with speech synthesis available ----
  {
    const { dom, errors, speech } = await boot(target, true);
    const d = dom.window.document, $ = s => d.querySelector(s), $$ = s => Array.from(d.querySelectorAll(s));
    // Double-application guard: a skill applied twice must be caught, not tolerated
    for (const id of ['btn-gi','btn-cg','inq-zone','aside-inquiry','welcome-overlay','cg-callout','ctlZone']) {
      const n = d.querySelectorAll('#' + id + ', .' + id).length; ok(n <= 1, `no duplicate #${id} (found ${n})`);
    }
    { const tpl = [...d.querySelectorAll('script')].map(x => x.textContent).filter(t => /Controls Guide|Welcome overlay|Two-button template|Guided Inquiry \+ Controls Guide/.test(t)); ok(tpl.length === new Set(tpl).size, 'no duplicated template script blocks (' + tpl.length + ' template scripts)'); }
    const ov = $('#welcome-overlay');
    ok(!!ov, '#welcome-overlay present');
    ok($$('#welcome-overlay').length === 1, 'overlay present exactly once');
    if (!ov) return report();
    ok(!ov.classList.contains('hidden'), 'boot: overlay shown');
    ok(dom.window.getComputedStyle(ov).zIndex === '5000', 'overlay z-index 5000 (above guide callouts)');
    ok(!!$('#welcome-fringes'), 'hero canvas present');
    ok(!!$('#welcome-title .welcome-kicker') && $('#welcome-title .welcome-kicker').textContent.trim() === 'Welcome to', 'title: "Welcome to" kicker');
    ok(!!$('#welcome-title .welcome-name') && $('#welcome-title .welcome-name').textContent.trim().length > 0, 'title: sim name line');
    const HOUSE = { inquiry: 'Uncover the simulation in steps and see the physics emerge.', controls: 'Learn each control, one at a time.', free: 'Everything open. Experiment on your own.' };
    $$('.welcome-mode').forEach(b => {
      const d = b.querySelector('.wm-desc'); ok(d && d.textContent.trim() === HOUSE[b.dataset.mode], `card ${b.dataset.mode}: house-copy description`);
      ok(/Start/.test((b.querySelector('.wm-go')||{textContent:''}).textContent), `card ${b.dataset.mode}: "Start" affordance`);
    });
    const pill = $('.welcome-mode[data-mode="inquiry"] .wm-tag'); ok(pill && pill.textContent.trim() === 'Recommended', 'inquiry card: inline "Recommended" pill');
    // rows ⇔ buttons
    const has = id => !!$(id);
    const rows = Object.fromEntries($$('.welcome-mode').map(b => [b.dataset.mode, b]));
    ok(!!rows.free, 'free-exploration row present');
    ok((has('#btn-gi') === !!rows.inquiry), 'inquiry row present iff #btn-gi exists');
    ok((has('#btn-cg') === !!rows.controls), 'controls row present iff #btn-cg exists');
    ['inquiry', 'controls', 'free'].forEach(m => { if (rows[m]) {
      ok(rows[m].querySelector('.wm-title') && rows[m].querySelector('.wm-desc'), `row ${m}: title + description`);
    }});
    // transport present + speech attempted + progress text
    ['#welcome-prev', '#welcome-speak', '#welcome-next', '#welcome-progress', '#welcome-seg'].forEach(s => ok(!!$(s), `${s} present`));
    ok(speech.speak > 0, 'auto read-aloud attempted (timed fallback with no voices)');
    ok(/^1 \/ \d+$/.test($('#welcome-progress').textContent.trim()), 'progress reads "1 / N"');
    $('#welcome-next').click(); $('#welcome-next').click();
    ok($('#welcome-progress').textContent.trim().startsWith('3 /'), 'forward twice → line 3');
    $('#welcome-prev').click();
    ok($('#welcome-progress').textContent.trim().startsWith('2 /'), 'rewind → line 2');
    ok(typeof dom.window.__setMode === 'function', 'window.__setMode wired');
    // boot state must be untouched by the overlay: GI (if present) active, CG inactive
    if (has('#btn-gi')) ok($('#btn-gi').classList.contains('active'), 'boot: Guided Inquiry active behind the overlay (sim boot unchanged)');
    if (has('#btn-cg')) ok(!$('#btn-cg').classList.contains('active'), 'boot: Controls Guide inactive behind the overlay');
    // choose controls → overlay hidden, speech cancelled, CG on
    const before = speech.cancel;
    if (rows.controls) {
      rows.controls.click();
      ok(ov.classList.contains('hidden'), 'choose controls: overlay hidden');
      ok(speech.cancel > before, 'choose: speech cancelled');
      ok($('#btn-cg').classList.contains('active'), 'choose controls: Controls Guide on');
      if (has('#btn-gi')) ok(!$('#btn-gi').classList.contains('active'), 'choose controls: inquiry off (exclusion)');
    }
    const newErrs = errors.filter(e => !baseErrs.includes(e));
    ok(newErrs.length === 0, 'no new runtime errors (speech present): ' + JSON.stringify(newErrs.slice(0, 3)));
  }
  // ---- Pass B: no speech synthesis → player disables, nothing throws, free mode still works ----
  {
    const { dom, errors } = await boot(target, false);
    const d = dom.window.document, $ = s => d.querySelector(s);
    ok($('#welcome-speak') && $('#welcome-speak').disabled, 'no speech API: play button disabled');
    const free = d.querySelector('.welcome-mode[data-mode="free"]');
    free.click();
    ok($('#welcome-overlay').classList.contains('hidden'), 'choose free: overlay hidden');
    if ($('#btn-gi')) ok(!$('#btn-gi').classList.contains('active'), 'choose free: inquiry off');
    if ($('#btn-cg')) ok(!$('#btn-cg').classList.contains('active'), 'choose free: controls off');
    const newErrs = errors.filter(e => !baseErrs.includes(e));
    ok(newErrs.length === 0, 'no new runtime errors (no speech API): ' + JSON.stringify(newErrs.slice(0, 3)));
  }
  report();
  function report() {
    if (fails.length) { console.log(`FAIL (${fails.length}):`); fails.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
    console.log('PASS — welcome overlay invariants hold' + (baseline ? ` (${baseErrs.length} baseline errors ignored)` : ''));
    process.exit(0);
  }
})().catch(e => { console.log('FAIL (harness): ' + (e && e.message)); process.exit(1); });
