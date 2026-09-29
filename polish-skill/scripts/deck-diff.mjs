// Sealed-deck check: the inquiry cards in the polished file must be IDENTICAL to the prebuild's
// (every card's text, every choice's text, every attribute on cards and choices, including data-fb).
// usage: node deck-diff.mjs <prebuild.html> <polished.html>   (paths absolute or relative to cwd)
// Prints "DECK IDENTICAL" (exit 0) or the differences (exit 1).
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const REPO = process.env.SIM_FOUNDRY || '/Users/admin/Downloads/sim-foundry';
const { JSDOM, VirtualConsole } = createRequire(REPO + '/package.json')('jsdom');

const [a, b] = process.argv.slice(2);
if (!a || !b) { console.error('usage: node deck-diff.mjs <prebuild.html> <polished.html>'); process.exit(2); }

const norm = s => (s || '').replace(/\s+/g, ' ').trim();
function deck(file) {
  const doc = new JSDOM(readFileSync(file, 'utf8'), { virtualConsole: new VirtualConsole() }).window.document;
  const root = doc.getElementById('inq-cards');
  if (!root) return null;
  return [...root.querySelectorAll('.inq-step')].map((step, i) => {
    const attrs = el => [...el.attributes].filter(x => x.name !== 'class' && x.name !== 'style' && x.name !== 'data-answered')
      .map(x => `${x.name}=${norm(x.value)}`).sort();
    return {
      card: i + 1,
      text: norm(step.textContent),
      attrs: attrs(step),
      choices: [...step.querySelectorAll('.choice')].map(c => ({ text: norm(c.textContent), attrs: attrs(c) })),
    };
  });
}
const A = deck(a), B = deck(b);
if (!A || !B) { console.log(`NO #inq-cards in ${!A ? a : b}`); process.exit(1); }
const out = [];
if (A.length !== B.length) out.push(`card count ${A.length} -> ${B.length}`);
for (let i = 0; i < Math.min(A.length, B.length); i++) {
  const x = A[i], y = B[i];
  if (x.text !== y.text) out.push(`card ${i + 1}: text differs\n  before: ${x.text.slice(0, 300)}\n  after:  ${y.text.slice(0, 300)}`);
  if (JSON.stringify(x.attrs) !== JSON.stringify(y.attrs)) out.push(`card ${i + 1}: card attributes differ ${JSON.stringify(x.attrs)} -> ${JSON.stringify(y.attrs)}`);
  if (x.choices.length !== y.choices.length) out.push(`card ${i + 1}: choice count ${x.choices.length} -> ${y.choices.length}`);
  x.choices.forEach((c, j) => {
    const d = y.choices[j]; if (!d) return;
    if (c.text !== d.text) out.push(`card ${i + 1} choice ${j + 1}: text "${c.text}" -> "${d.text}"`);
    if (JSON.stringify(c.attrs) !== JSON.stringify(d.attrs)) out.push(`card ${i + 1} choice ${j + 1}: attributes (incl. data-fb) differ`);
  });
}
if (out.length) { console.log('DECK CHANGED:\n' + out.join('\n')); process.exit(1); }
console.log(`DECK IDENTICAL (${A.length} cards, ${A.reduce((n, c) => n + c.choices.length, 0)} choices)`);
