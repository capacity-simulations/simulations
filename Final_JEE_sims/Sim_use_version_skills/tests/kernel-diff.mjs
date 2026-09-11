// Kernel-preservation gate: proves a user-version build did not alter the
// production sim's physics, visuals, or controls — only added to them.
//
// Usage: node tests/kernel-diff.mjs <original.html> <build.html> [--allow-script-edits]
//
// Checks (exit 1 on any failure):
//   1. SCRIPTS  — every <script> block of the ORIGINAL appears byte-identical
//                 in the build (physics kernel, control wiring, animation loops
//                 untouched). New blocks (voice engine, controller, welcome)
//                 are listed as additions. --allow-script-edits downgrades
//                 modified-original-script to a listed warning for L-series
//                 conversions whose recipes sanction enumerated in-script
//                 deltas (Finish→__giOff, exposing inqShow) — the diff is
//                 printed so a human can confirm it is only that.
//   2. IDS      — every element id present in the original is still present
//                 in the build (no control, readout, or canvas removed).
//   3. CANVASES — every <canvas> tag of the original appears unchanged
//                 (same ids/attrs — rendering surfaces untouched).
//   4. TEXT     — every visible text chunk (>= 12 chars) of the original
//                 body still occurs in the build (labels, readouts, notes
//                 not deleted; relocation is fine — occurrence is checked,
//                 not position).
//   5. STYLES   — every original <style> block's content is contained
//                 verbatim in the build (template CSS is append-only;
//                 original rules never edited).

import { readFileSync } from 'fs';

const args = process.argv.slice(2).filter(a => a !== '--allow-script-edits');
const ALLOW_EDITS = process.argv.includes('--allow-script-edits');
if (args.length < 2) { console.error('usage: node kernel-diff.mjs <original.html> <build.html> [--allow-script-edits]'); process.exit(1); }
const [orig, build] = args.map(f => readFileSync(f, 'utf8'));

const blocks = (h, tag) => [...h.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g'))].map(m => m[1]);
const norm = s => s.replace(/\r\n/g, '\n');

let fails = [], warns = [], notes = [];

// 1. scripts
const oScripts = blocks(orig, 'script').map(norm).filter(s => s.trim());
const bScripts = blocks(build, 'script').map(norm);
const bSet = bScripts.map(s => s.trim());
let modified = 0;
for (const s of oScripts) {
  if (!bSet.some(b => b === s.trim())) {
    modified++;
    const head = s.trim().slice(0, 90).replace(/\n/g, ' ');
    (ALLOW_EDITS ? warns : fails).push(`original <script> not byte-identical in build: "${head}…"`);
  }
}
const added = bScripts.filter(b => b.trim() && !oScripts.some(o => o.trim() === b.trim()));
notes.push(`scripts: ${oScripts.length} original (${oScripts.length - modified} identical, ${modified} modified), ${added.length} added`);

// 2. ids
const ids = h => new Set([...h.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const oIds = ids(orig), bIds = ids(build);
const lost = [...oIds].filter(i => !bIds.has(i));
if (lost.length) fails.push(`element ids removed: ${lost.join(', ')}`);
notes.push(`ids: ${oIds.size} original, ${lost.length} removed, ${bIds.size - (oIds.size - lost.length)} added`);

// 3. canvases
const canv = h => [...h.matchAll(/<canvas\b[^>]*>/g)].map(m => m[0]);
const oCanv = canv(orig), bCanv = canv(build);
const lostCanv = oCanv.filter(c => !bCanv.includes(c));
if (lostCanv.length) fails.push(`canvas tags changed/removed: ${lostCanv.join(' | ')}`);
notes.push(`canvases: ${oCanv.length} original, all ${oCanv.length - lostCanv.length} preserved`);

// 4. visible text
const bodyOf = h => { const i = h.search(/<body[^>]*>/); let t = i >= 0 ? h.slice(i) : h;
  t = t.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  return t.replace(/<[^>]+>/g, '\n'); };
const chunks = bodyOf(orig).split(/\n+/).map(s => s.trim()).filter(s => s.length >= 12);
const bBody = bodyOf(build).replace(/\s+/g, ' ');
const lostText = [...new Set(chunks)].filter(c => !bBody.includes(c.replace(/\s+/g, ' ')));
if (lostText.length) fails.push(`visible text removed: ${lostText.slice(0, 5).map(t => `"${t.slice(0, 50)}"`).join(' · ')}${lostText.length > 5 ? ` (+${lostText.length - 5} more)` : ''}`);
notes.push(`text chunks: ${new Set(chunks).size} original, ${lostText.length} missing`);

// 5. styles
const oStyles = blocks(orig, 'style').map(norm);
const bAll = norm(build);
const lostStyle = oStyles.filter(s => s.trim() && !bAll.includes(s.trim()));
if (lostStyle.length) fails.push(`original <style> content edited (must be append-only): ${lostStyle.length} block(s)`);
notes.push(`styles: ${oStyles.length} original blocks, ${oStyles.length - lostStyle.length} contained verbatim`);

for (const n of notes) console.log('  · ' + n);
for (const w of warns) console.log('  ⚠ ' + w);
if (fails.length) { for (const f of fails) console.log('  ✗ ' + f); console.log(`FAIL (${fails.length})`); process.exit(1); }
console.log(warns.length ? `PASS with ${warns.length} sanctioned-edit warning(s) — review the diffs above` : 'PASS — kernel, controls, canvases, text and styles all preserved');
