// Runtime probe for the SHELL-LEVEL defect classes — the ones no grep can find.
//
// Every class below was discovered by a per-sim reviewer, then found to recur
// across the fleet. Three of them are undetectable statically: the feedback
// pill is injected at runtime, header overflow only exists in a laid-out page,
// and a var(--…) font is rejected silently by the canvas with no trace in the
// source beyond the string itself.
//
// A static sweep is actively DANGEROUS for T1: the four shapes in the wild are
//   body-first              → correct
//   body || documentElement → correct (fallback never reached)
//   documentElement || body → BROKEN (:root always returns, so body is dead)
//   documentElement only    → BROKEN
// and a regex cannot reliably tell the 2nd from the 3rd across minified,
// multi-line and const-bound spellings. It mis-classified C118 (correct) as a
// defect during development. So T1 is measured, never inferred: does the canvas
// actually go light when the page does?
//
// CHECKS
//   T1 THEME    In light theme the canvas must not stay dark under a light page.
//               Measures the canvas's modal GROUND colour against the body's
//               background luminance. This is the exact reported symptom
//               ("whole canvas illegible in light mode").
//
//               Four further false-positive classes were found by adjudicating
//               a fleet-wide run, and are closed below. All four made the probe
//               fail sims that render PERFECTLY in light theme:
//                 a. querySelector('.theme-toggle, …, .theme-toggle-wrap')
//                    returns the DOCUMENT-ORDER first match, so it grabbed the
//                    inert wrapper div and the click did nothing → "theme is
//                    broken". Fixed by THEME_SEL, tried most-specific first.
//                 b. Light theme was recognised only as body.light-theme, but a
//                    sim owning its toggle may set html[data-theme=light]
//                    instead. Both are now accepted.
//                 c. "Ground" was the modal colour among OPAQUE samples. Most
//                    sims here paint no ground at all (line art on transparency,
//                    ~1-2% opaque), so the modal opaque colour is the INK — and
//                    correctly themed ink goes DARK on a light page. The check
//                    therefore fired on precisely the sims that theme correctly.
//                    Dominance is now measured over canvas AREA.
//                 d. Relative luminance is green-weighted, so a saturated warm
//                    SUBJECT filling the frame (brick, a magnet pole) scores
//                    ~0.43 and read as "dark". A dark ground must now also be
//                    dark in its brightest channel (DARK_CHANNEL_CEIL).
//   T2 FONT     ctx.font = '…var(--x)…' is rejected by the canvas, silently
//               leaving the PREVIOUS font — usually the 10px default. Hooks the
//               prototype setter before any page script runs and records every
//               assignment that did not take, plus the smallest size actually
//               rendered (floor: 12px for K-12 legibility).
//   T3 PILL     The reviewer-only feedback pill must not cover #cg-next or any
//               sidebar control. Hit-tests with elementFromPoint.
//   T4 OVERFLOW At 1024x768 the header must not over-subscribe its viewport and
//               push Play/Reset off screen. Checks horizontal overflow and
//               hit-tests each header control.
//
// Usage:
//   node tests/theme-layout-probe.mjs <sim.html> [more.html ...] [--json out.json]
// Driven over file://; exit 0 = all clean. Failures name the check and the
// measurement, never just "failed".

import { createRequire } from 'module';
import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';

// OPT-OUT for sims whose dark stage is a deliberate, load-bearing design choice
// — an optical bench is a darkroom, a satellite orbits at night, and you cannot
// render faint Airy rings or beam intensity on white. T1 cannot tell such a sim
// from a broken theme path, so the sim declares itself, in its own source:
//
//   <!-- THEME-PROBE-OPT-OUT: <reason, including the measured chrome contrast> -->
//
// The reason is mandatory and is echoed in the output, so the claim stays
// auditable and an opt-out can never be a silent way to dodge the check. It
// suppresses ONLY T1; font size, pill overlap and overflow are still enforced.
const OPT_OUT = /THEME-PROBE-OPT-OUT:\s*([^\n>]{10,200})/;

const args = process.argv.slice(2);
const ji = args.indexOf('--json');
const JSON_OUT = ji >= 0 ? args.splice(ji, 2)[1] : null;
const ci = args.indexOf('--chrome');
const CHROME = ci >= 0 ? args.splice(ci, 2)[1]
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const rq = args.indexOf('--require-dir');
const REQ_DIR = rq >= 0 ? args.splice(rq, 2)[1] : import.meta.dirname + '/../node_modules-puppeteer/';

let puppeteer;
for (const dir of [REQ_DIR,
  '/Users/admin/Desktop/simulations-1/Fermi_SR_simulations/Capacity_SR_sims_v2_engine/_review/']) {
  try { puppeteer = createRequire(dir)('puppeteer-core'); break; } catch (e) {}
}
if (!puppeteer) { console.error('puppeteer-core not found — pass --require-dir <dir with node_modules/puppeteer-core>'); process.exit(1); }

const FONT_FLOOR = 12;

// Relative luminance, 0 (black) … 1 (white).
const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

// THEME CONTROL, in priority order. querySelector with a comma-list returns the
// DOCUMENT-ORDER first match, not the selector-order first match — so the old
// single-call '.theme-toggle, .theme-toggle-wrap button, .theme-toggle-wrap'
// matched the WRAPPER DIV on every sim that nests the control inside it, and
// clicking an inert div silently did nothing. The probe then reported the sim's
// theme as broken. Ask for the interactive element explicitly, most specific
// first, and keep the bare wrapper only as a last resort.
const THEME_SEL = [
  '#shell-theme',
  'label.theme-toggle', '.theme-toggle input', '.theme-toggle button', '.theme-toggle',
  '.theme-toggle-wrap button', '.theme-toggle-wrap input', '.theme-toggle-wrap label',
  '.theme-toggle-wrap',
];

// A ground colour whose BRIGHTEST channel still clears this is a mid-tone hue,
// not a dark stage. Relative luminance is heavily green-weighted, so a saturated
// warm subject — brick rgb(180,95,61), a magnet pole rgb(226,80,78) — scores
// ~0.43 and trips a <0.45 "dark" test while being plainly bright on screen.
// Real dark grounds in the fleet are slate-700 rgb(51,65,85) (max 85) and
// darker, so this floor separates the two with a wide margin either side.
const DARK_CHANNEL_CEIL = 140;

const INSTRUMENT = () => {
  // Runs before every page script. Records canvas font assignments that the
  // context silently refused, and the smallest size that actually rendered.
  window.__fontRejected = [];
  window.__fontSizes = [];
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
  if (!d || !d.set) return;
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', {
    configurable: true,
    get() { return d.get.call(this); },
    set(v) {
      d.set.call(this, v);
      const after = d.get.call(this);
      // The browser NORMALIZES the font string (quotes families, expands the
      // stack), so "requested !== resulting" is NOT evidence of rejection —
      // that comparison produced false positives on every healthy sim during
      // development. Two reliable signals instead:
      //   1. the string contains var(--…), which a canvas can never resolve;
      //   2. the pixel size that landed differs from the size asked for.
      const req = String(v);
      const wantPx = /(\d+(?:\.\d+)?)px/.exec(req);
      const gotPx = /(\d+(?:\.\d+)?)px/.exec(after || '');
      const varRef = /var\(\s*--/.test(req);
      // Compare sizes with a tolerance. An exact comparison produced a FALSE
      // POSITIVE: a sim computing Math.max(12, viewH*0.026) asks for
      // 18.875999999999998, the browser normalises the font to "18.876px", and
      // the two parse unequal even though the assignment took perfectly.
      // Sub-pixel sizes are worth avoiding, but they are not a rejected font.
      const sizeMiss = wantPx && gotPx && Math.abs(parseFloat(wantPx[1]) - parseFloat(gotPx[1])) > 0.02;
      const noSize = !!wantPx && !gotPx;
      if (varRef || sizeMiss || noSize) {
        if (window.__fontRejected.length < 12)
          window.__fontRejected.push({
            req: req.slice(0, 70), kept: String(after).slice(0, 50),
            why: varRef ? 'contains var(--…) — canvas cannot resolve it' : (noSize ? 'no size survived' : 'size changed'),
          });
      }
      if (gotPx) window.__fontSizes.push(parseFloat(gotPx[1]));
    },
  });
};

// Dismiss the welcome overlay and land in the guided-inquiry flow.
const ENTER = () => {
  const m = document.querySelector('.welcome-mode[data-mode="inquiry"]') ||
            document.querySelector('.welcome-mode');
  if (m) m.click();
  const chip = document.getElementById('aside-inquiry-restore');
  if (chip && getComputedStyle(chip).display !== 'none') chip.click();
};

const sample = () => {
  // Canvas top-left pixel + the body background it sits on.
  const out = { canvas: null, body: null, id: null };
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  const bm = /(\d+),\s*(\d+),\s*(\d+)/.exec(bodyBg);
  if (bm) out.body = [+bm[1], +bm[2], +bm[3]];
  // Some sims stage their main canvas behind a step, so the biggest VISIBLE
  // surface may be modest. Take anything meaningfully large, biggest first.
  const cs = [...document.querySelectorAll('canvas')]
    .filter(c => { const r = c.getBoundingClientRect(); return r.width > 120 && r.height > 80; })
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));
  for (const c of cs) {
    try {
      const ctx = c.getContext('2d');
      if (!ctx) continue;
      // A transparent top-left corner is common (padding, rounded plates), so
      // probe several points and take the first opaque one. If the whole
      // surface is transparent the sim paints no ground of its own, and the
      // element's own computed background is what the student sees.
      const pts = [[3, 3], [Math.round(c.width / 2), 3], [3, Math.round(c.height / 2)],
                   [Math.round(c.width / 2), Math.round(c.height / 2)]];
      // THE GROUND IS THE MOST COMMON COLOUR, not the first opaque pixel.
      // Two earlier attempts ("first pixel with alpha>8", then "alpha>=250")
      // both failed, for different reasons: the first sampled semi-transparent
      // ink on an unfilled canvas (getImageData is un-premultiplied, so ink
      // returns at full strength and any ink looks dark against a light page);
      // the second skipped legitimate grounds painted at rgba(...,.96), whose
      // alpha reads 245, and landed on a dashed line instead.
      // Sampling a grid and taking the modal near-opaque colour is what "ground"
      // actually means, and is robust to both.
      const step = 16, tally = new Map();
      let total = 0, grid = 0;
      const W = Math.min(c.width, 900), H = Math.min(c.height, 700);
      for (let y = 2; y < H; y += step) {
        for (let x = 2; x < W; x += step) {
          grid++;
          const d = ctx.getImageData(x, y, 1, 1).data;
          if (d[3] < 200) continue;                    // ink/transparent, not ground
          const k = `${d[0] >> 3},${d[1] >> 3},${d[2] >> 3}`;  // 5-bit buckets
          const e = tally.get(k) || { n: 0, rgb: [d[0], d[1], d[2]] };
          e.n++; tally.set(k, e); total++;
        }
      }
      if (total >= 8) {
        let best = null;
        for (const e of tally.values()) if (!best || e.n > best.n) best = e;
        // Dominance is measured over the CANVAS AREA (grid), never over the
        // opaque subset (total). Most sims in this fleet paint no ground at all
        // — they are line art on a transparent surface, and the page shows
        // through. On such a canvas only ~1-2% of samples are opaque, so the
        // modal colour among them is the INK: dividing by `total` made that ink
        // look like a 65%-dominant "ground", and since well-themed ink goes DARK
        // on a light page (slate-300 → slate-700) the check fired on exactly the
        // sims that theme correctly. Dividing by `grid` cannot mask a real dark
        // ground, which is opaque across the surface by definition.
        if (best && best.n / grid >= 0.30) {
          out.canvas = best.rgb;
          out.id = (c.id || c.className || 'canvas') + `@mode${Math.round(100 * best.n / grid)}%-of-area`;
        } else if (best) {
          // Two different reasons the modal colour can fail to dominate, and
          // they are NOT the same finding:
          //   mostly transparent → the sim paints no ground; nothing to judge.
          //   opaque but no dominant bucket → there IS a ground, but it is a
          //     gradient, so no single 5-bit bucket reaches 30%. T1 is BLIND
          //     here (pre-existing; it predates the area-dominance fix). Such a
          //     sim needs a human look, so say so rather than implying it is
          //     line art.
          const opaquePct = Math.round(100 * total / grid);
          out.groundless = opaquePct >= 70
            ? `ground is opaque (${opaquePct}%) but has no dominant colour — largest bucket rgb(${best.rgb}) is only ${Math.round(100 * best.n / grid)}%; likely a gradient, T1 cannot judge it`
            : `largest opaque colour rgb(${best.rgb}) covers only ${Math.round(100 * best.n / grid)}% of the surface (${opaquePct}% opaque overall) — line art on a transparent surface, not a ground`;
        }
      }
      // Fingerprint the whole surface. A canvas that is BYTE-IDENTICAL either
      // side of a theme toggle proves the theme never reached the drawing code
      // at all — that is the defect, unambiguously. A canvas that merely stays
      // dark may be a deliberate choice (an optical bench is a darkroom; one
      // sim adopted exactly that, with light chrome drawn over it), so darkness
      // alone must never be the failure signal.
      try {
        const g = ctx.getImageData(0, 0, Math.min(c.width, 240), Math.min(c.height, 160)).data;
        let hsh = 2166136261, opaque = 0;
        for (let k = 0; k < g.length; k += 17) { hsh ^= g[k]; hsh = Math.imul(hsh, 16777619); }
        for (let k = 3; k < g.length; k += 4) if (g[k] > 8) opaque++;
        out.hash = (hsh >>> 0).toString(16);
        // How much of the fingerprinted region the canvas actually OWNS. A sim
        // that clears without a ground fill leaves this region transparent, so
        // it hashes identically in both themes and looks "frozen" when the
        // canvas is in fact re-inking perfectly. One sim was mis-flagged
        // exactly this way, so the frozen test is only trusted on a region the
        // canvas paints.
        out.opaqueFrac = opaque / (g.length / 4);
      } catch (e) {}
      if (!out.canvas) {
        // Careful: a TRANSPARENT canvas background computes to "rgba(0,0,0,0)",
        // which naively parses as black and would be reported as a dark canvas.
        // Transparent means the student sees the page through it — not a defect.
        const bg = getComputedStyle(c).backgroundColor;
        const m = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(bg);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.1)) {
          out.canvas = [+m[1], +m[2], +m[3]]; out.id = (c.id || 'canvas') + '@css-bg';
        } else {
          out.transparent = true;
        }
      }
      if (out.canvas) break;
    } catch (e) { /* tainted or webgl — skip */ }
  }
  return out;
};

const results = [];
let failed = 0;
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--allow-file-access-from-files'] });

for (const f of args) {
  const errs = [];
  const rec = { file: f, checks: {} };
  let optOut = null;
  try { const m = OPT_OUT.exec(readFileSync(resolve(f), 'utf8')); if (m) optOut = m[1].trim(); } catch (e) {}
  if (optOut) rec.themeOptOut = optOut;
  const p = await b.newPage();
  await p.evaluateOnNewDocument(INSTRUMENT);
  await p.setViewport({ width: 1500, height: 950 });
  try { await p.goto('file://' + resolve(f), { waitUntil: 'networkidle0', timeout: 30000 }); } catch (e) {}
  await new Promise(r => setTimeout(r, 1400));
  await p.evaluate(ENTER);
  await new Promise(r => setTimeout(r, 700));

  // ---- T1 THEME -----------------------------------------------------------
  // Establish an ANIMATION BASELINE first. A moving canvas differs frame to
  // frame whatever the theme does, so without this the byte-identical test
  // silently passes every animated sim (it did exactly that for an orbit sim
  // during development). Two samples in the SAME theme: if they already differ,
  // the frozen test cannot speak and the ground-luminance signal is used.
  const dark = await p.evaluate(sample);
  await new Promise(r => setTimeout(r, 450));
  const dark2 = await p.evaluate(sample);
  const animating = !!(dark.hash && dark2.hash && dark.hash !== dark2.hash);
  const toggled = await p.evaluate((sels) => {
    for (const s of sels) { const t = document.querySelector(s); if (t) { t.click(); return s; } }
    return false;
  }, THEME_SEL);
  await new Promise(r => setTimeout(r, 900));
  const light = await p.evaluate(sample);
  // BOTH theme spellings are in the wild and both are correct: the shell puts
  // .light-theme on <body>, while a sim carrying its own toggle may instead set
  // data-theme="light" on <html> (its CSS is written as html[data-theme=light]).
  // Recognising only the first reported a working toggle as broken.
  const isLightNow = await p.evaluate(() =>
    document.body.classList.contains('light-theme') ||
    document.documentElement.classList.contains('light-theme') ||
    document.documentElement.getAttribute('data-theme') === 'light' ||
    document.body.getAttribute('data-theme') === 'light');

  if (!toggled) errs.push('T1 THEME: no theme control found (#shell-theme/.theme-toggle) — theme check could not run');
  else if (!isLightNow) errs.push(`T1 THEME: clicking the theme control ("${toggled}") put neither .light-theme nor data-theme="light" on body/html — check could not run`);
  else if (!light.canvas) {
    // Not a failure: a surface that paints no ground of its own shows the page
    // beneath it, so there is no canvas ground that could be stuck dark.
    rec.checks.theme = { skipped: light.groundless || (light.transparent ? 'canvas paints no ground (transparent)' : 'no readable 2d canvas') };
  }
  else {
    const cl = lum(light.canvas), bl = lum(light.body || [255, 255, 255]);
    const maxCh = Math.max(light.canvas[0], light.canvas[1], light.canvas[2]);
    // Only trust the frozen test when the canvas actually paints the region we
    // fingerprint (see opaqueFrac above) — a transparent region is not evidence.
    const painted = (light.opaqueFrac || 0) > 0.05;
    const frozen = painted && !animating && dark.hash && light.hash && dark.hash === light.hash;
    // A dark ground must be dark in EVERY channel, not merely low-luminance:
    // see DARK_CHANNEL_CEIL. Without this, any canvas whose subject fills the
    // frame in a saturated warm hue — a brick wall, a magnet's north pole —
    // was reported as a dark ground while rendering perfectly in light theme.
    const groundDark = bl > 0.5 && cl < 0.45 && maxCh <= DARK_CHANNEL_CEIL;
    rec.checks.theme = {
      canvasLum: +cl.toFixed(3), bodyLum: +bl.toFixed(3), canvas: light.canvas,
      maxChannel: maxCh, id: light.id, animating, frozen: !!frozen, groundDark,
    };
    if (optOut && (frozen || groundDark)) {
      // Declared deliberate. Report it so it stays visible, but do not fail.
      rec.checks.theme.optedOut = optOut;
      console.log(`  ·   ${f} — T1 opted out: ${optOut}`);
    }
    else if (frozen)
      // NB: a byte-identical render is evidence the theme did not change the
      // drawing, NOT proof the drawing code is broken — a deliberately
      // theme-invariant stage looks the same. Hence the opt-out above.
      errs.push(`T1 THEME: static canvas render is BYTE-IDENTICAL across the theme toggle (hash ${light.hash}) — either the theme never reaches the drawing code, or the stage is deliberately theme-invariant and should declare THEME-PROBE-OPT-OUT [${light.id}]`);
    else if (groundDark)
      // Ground still dark under a light page. For an animated canvas this is
      // the only available signal; it CAN be deliberate (an optical bench drawn
      // as a darkroom with adapted chrome), so it is reported as a finding to
      // adjudicate rather than a proven bug.
      errs.push(`T1 THEME: canvas ground stays dark in light theme — rgb(${light.canvas}) lum ${cl.toFixed(2)} under body lum ${bl.toFixed(2)} [${light.id}]${animating ? ' (animated: verify whether the dark ground is deliberate)' : ''}`);
  }
  // back to dark for the remaining checks
  if (toggled && isLightNow) { await p.evaluate((sels) => { for (const s of sels) { const t = document.querySelector(s); if (t) { t.click(); return; } } }, THEME_SEL); await new Promise(r => setTimeout(r, 500)); }

  // ---- T2 FONT ------------------------------------------------------------
  const fonts = await p.evaluate(() => ({
    rejected: window.__fontRejected || [],
    min: (window.__fontSizes || []).length ? Math.min(...window.__fontSizes) : null,
    n: (window.__fontSizes || []).length,
  }));
  rec.checks.font = fonts;
  if (fonts.rejected.length)
    errs.push(`T2 FONT: ${fonts.rejected.length} canvas font assignment(s) did not take — e.g. "${fonts.rejected[0].req}" (${fonts.rejected[0].why}) → kept "${fonts.rejected[0].kept}"`);
  if (fonts.min !== null && fonts.min < FONT_FLOOR)
    errs.push(`T2 FONT: smallest rendered canvas text ${fonts.min}px < ${FONT_FLOOR}px floor (${fonts.n} assignments sampled)`);

  // ---- T3 PILL ------------------------------------------------------------
  const pill = await p.evaluate(() => {
    const hit = (el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return { ok: true, reason: 'not rendered' };
      const x = r.x + r.width / 2, y = r.y + r.height / 2;
      const top = document.elementFromPoint(x, y);
      if (!top) return { ok: true, reason: 'offscreen' };
      const ok = top === el || el.contains(top) || top.contains(el);
      // A bare "SPAN" names nothing useful — walk up until an ancestor carries
      // an id or class so the report identifies the actual overlay.
      let n = top, label = '';
      for (let i = 0; n && i < 6; i++, n = n.parentElement) {
        const t = (n.id ? '#' + n.id : (typeof n.className === 'string' && n.className.trim() ? '.' + n.className.trim().split(/\s+/)[0] : ''));
        if (t) { label = t; break; }
      }
      return { ok, blocker: ok ? null : (label || top.tagName).slice(0, 40) };
    };
    const cg = document.getElementById('btn-cg');
    if (cg) cg.click();
    return new Promise(res => setTimeout(() => {
      const out = { blocked: [] };
      const next = document.getElementById('cg-next');
      if (next) { const h = hit(next); if (!h.ok) out.blocked.push(`#cg-next blocked by "${h.blocker}"`); }
      const side = document.querySelector('.sidebar, .shell-aside, .control-panel, .right-panel, .controls-panel, aside');
      if (side) for (const el of side.querySelectorAll('input[type=range], button, select')) {
        const h = hit(el);
        if (!h.ok && /feedback|pill|fb-/i.test(h.blocker || '')) out.blocked.push(`${el.id || el.type || el.tagName} blocked by "${h.blocker}"`);
      }
      res(out);
    }, 700));
  });
  rec.checks.pill = pill;
  for (const bl of (pill.blocked || []).slice(0, 4)) errs.push(`T3 PILL: ${bl}`);

  // ---- T4 OVERFLOW at 1024x768 -------------------------------------------
  await p.setViewport({ width: 1024, height: 768 });
  await new Promise(r => setTimeout(r, 900));
  const of = await p.evaluate(() => {
    const out = { scrollW: document.documentElement.scrollWidth, inner: window.innerWidth, unreachable: [] };
    const bar = document.querySelector('.top-bar, .shell-header, .app-header, .header-bar, .top-title-bar, .title-bar, .topbar, header, .header');
    if (bar) {
      out.barW = Math.round(bar.scrollWidth);
      for (const el of bar.querySelectorAll('button, input, select')) {
        const r = el.getBoundingClientRect();
        if (r.width < 2) continue;
        if (r.right > window.innerWidth + 1 || r.left < -1) {
          out.unreachable.push((el.id || (el.textContent || '').trim() || el.tagName).slice(0, 22));
        }
      }
    }
    return out;
  });
  rec.checks.overflow = of;
  if (of.scrollW > of.inner + 2)
    errs.push(`T4 OVERFLOW: page scrolls horizontally at 1024 (scrollWidth ${of.scrollW} > ${of.inner})`);
  if (of.unreachable.length)
    errs.push(`T4 OVERFLOW: ${of.unreachable.length} header control(s) off screen at 1024x768: ${of.unreachable.slice(0, 5).join(', ')}`);

  rec.errs = errs;
  results.push(rec);
  console.log(errs.length ? `FAIL  ${f}\n      ${errs.join('\n      ')}` : `  ok  ${f}`);
  if (errs.length) failed++;
  await p.close();
}
await b.close();

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(results, null, 2));
console.log(`\n${args.length - failed}/${args.length} clean, ${failed} with findings`);
process.exit(failed ? 1 : 0);
