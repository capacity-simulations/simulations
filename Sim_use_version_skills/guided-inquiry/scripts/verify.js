#!/usr/bin/env node
/*
 * Guided-inquiry invariant verifier (config-free).
 *
 * Usage: node verify.js <patched.html> [--baseline <original.html>]
 *
 * Discovers cards from the DOM and asserts the mechanical invariants of the
 * validated card grammar. Rewinds to card 1 first — L-series shells boot on
 * the LAST card under headless jsdom (pre-existing quirk, fine in browsers).
 * With --baseline, pre-existing runtime errors (CDN libs) are subtracted.
 * Exit 0 = pass, 1 = fail.
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
const holder = { o: anyFn };

function boot(file) {
  const html = fs.readFileSync(file, 'utf8');
  const errors = [];
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      w.HTMLCanvasElement.prototype.getContext = () => anyFn;
      w.Element.prototype.scrollIntoView = function () {};
      w.requestAnimationFrame = cb => setTimeout(() => cb(16), 16);
    }
  });
  dom.window.addEventListener('error', e => errors.push(String(e.message)));
  return new Promise(res => setTimeout(() => res({ dom, errors }), 500));
}

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const words = t => t.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  let baseErrs = [];
  if (baseline) baseErrs = (await boot(baseline)).errors;

  const { dom, errors } = await boot(target);
  const d = dom.window.document;
  // Double-application guard: a skill applied twice must be caught, not tolerated
  for (const id of ['btn-gi','btn-cg','inq-zone','aside-inquiry','welcome-overlay','cg-callout','ctlZone']) {
    const n = d.querySelectorAll('#' + id + ', .' + id).length; ok(n <= 1, `no duplicate #${id} (found ${n})`);
  }
  { const tpl = [...d.querySelectorAll('script')].map(x => x.textContent).filter(t => /Controls Guide|Welcome overlay|Two-button template|Guided Inquiry \+ Controls Guide/.test(t)); ok(tpl.length === new Set(tpl).size, 'no duplicated template script blocks (' + tpl.length + ' template scripts)'); }
  const cards = Array.from(d.querySelectorAll('#inq-cards .inq-step'));
  const next = d.getElementById('inq-next');
  const prev = d.getElementById('inq-prev');
  const dots = d.getElementById('inq-dots');
  const active = () => cards.findIndex(c => c.classList.contains('active'));

  // SME grammar (golden-flows.md): decks run 3-6 cards — two golden decks are
  // exactly 3 (Spacetime Explorer, Standard Model). Floor lowered from 4.
  // The 6-card ceiling WARNS rather than fails so pre-grammar builds (7-8
  // cards) can still take surgical fixes before their full rewrite lands.
  ok(cards.length >= 3, `at least 3 cards (found ${cards.length})`);
  if (cards.length > 6) console.log(`  ⚠ ${cards.length} cards exceeds the SME grammar max of 6 — restructure on the next content pass`);
  ok(!!next && !!prev && !!dots, 'inq nav elements present');
  if (fails.length) return report();
  ok(dots.children.length === cards.length, `dots (${dots.children.length}) == cards (${cards.length})`);

  // Structural: every card with choices must be gated; every gated card has choices + eval box.
  cards.forEach((c, i) => {
    const ch = c.querySelectorAll('.choice').length;
    const gated = c.hasAttribute('data-gate');
    if (ch > 0) {
      ok(gated, `card ${i + 1}: has choices but no data-gate`);
      ok(ch >= 3 && ch <= 4, `card ${i + 1}: 3-4 choices (found ${ch})`);
      ok(!!c.querySelector('.predict-eval'), `card ${i + 1}: predict-eval box present`);
    }
    if (gated) ok(ch > 0, `card ${i + 1}: gated but has no choices`);
    // Word budget: pre-answer visible text (stem + choices) <= 90.
    const w = words(c.textContent);
    ok(w <= 90, `card ${i + 1}: pre-answer text ${w} words (budget 90)`);
  });

  // Rewind (jsdom boots on the last card), then walk.
  let guard = cards.length + 2;
  while (active() > 0 && guard--) prev.click();
  ok(active() === 0, 'rewound to card 1');

  for (let i = 0; i < cards.length; i++) {
    if (i > 0) { next.click(); await sleep(30); }
    ok(active() === i, `walk: card ${i + 1} active`);
    const c = cards[i];
    if (c.hasAttribute('data-gate') && !c.hasAttribute('data-answered')) {
      ok(next.disabled, `card ${i + 1}: gated Next disabled before choice`);
      c.querySelectorAll('.choice')[0].click();
      await sleep(1200); // shell delays Next unlock after a wrong answer
      const ev = c.querySelector('.predict-eval');
      const shown = ev && (ev.style.display === 'block' || ev.classList.contains('show'));
      ok(shown, `card ${i + 1}: feedback shown after choice`);
      ok(ev && words(ev.textContent) >= 6, `card ${i + 1}: feedback non-trivial`);
      ok(ev && words(ev.textContent) <= 60, `card ${i + 1}: feedback ${words(ev.textContent)} words (budget 60)`);
      const correctBtns = c.querySelectorAll('.choice.correct').length;
      ok(correctBtns === 1, `card ${i + 1}: exactly one choice marked correct (found ${correctBtns})`);
      ok([...c.querySelectorAll('.choice')].every(b => b.disabled), `card ${i + 1}: choices disabled after answer`);
      ok(!next.disabled, `card ${i + 1}: Next re-enabled after answer`);
    } else if (!c.hasAttribute('data-gate')) {
      ok(!next.disabled, `card ${i + 1}: ungated Next enabled`);
    }
  }
  ok(/finish|done/i.test(next.textContent), `last card: Next reads Finish/Done ("${next.textContent.trim()}")`);
  next.click(); // must not throw

  const newErrs = errors.filter(e => !baseErrs.includes(e));
  ok(newErrs.length === 0, 'no new runtime errors: ' + JSON.stringify(newErrs.slice(0, 3)));

  report();

  function report() {
    if (fails.length) {
      console.log(`FAIL (${fails.length}):`);
      fails.forEach(f => console.log('  ✗ ' + f));
      process.exit(1);
    }
    console.log(`PASS — ${cards.length} cards, all inquiry invariants hold` + (baseline ? ` (${baseErrs.length} baseline errors ignored)` : ''));
    process.exit(0);
  }
})().catch(e => { console.log('FAIL (harness): ' + (e && e.message)); process.exit(1); });
