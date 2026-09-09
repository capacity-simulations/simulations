#!/usr/bin/env node
/**
 * M3 golden-value harvest.
 *
 * Opens each verified sim headlessly (puppeteer-core + system Chrome), waits for
 * window.__audit, sweeps the sim's machine-readable probe over its meaningful
 * input domain, and writes engine/test/golden/<slug>.json:
 *   { source, capturedAt, probe, sweep: [{input, output}...] }
 *
 * Re-runnable; prints a summary table at the end.
 *
 * Usage:  node engine/test/capture/harvest-goldens.mjs
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require_ = createRequire(
  '/Users/admin/Desktop/simulations-1/Capacity_SR_sims_v2_engine/_review/node_modules/puppeteer-core/package.json'
);
const puppeteer = require_('puppeteer-core');

const HERE = dirname(fileURLToPath(import.meta.url));                 // engine/test/capture
const GOLDEN_DIR = resolve(HERE, '../golden');                        // engine/test/golden
const REPO_ROOT = resolve(HERE, '../../..');                          // simulations-1
const SIM_ROOT = join(REPO_ROOT, 'Sim_lab_sims');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const AUDIT_TIMEOUT_MS = 15000;

/* Helper used inside page.evaluate: set a range slider and fire its input listener. */
const PAGE_HELPERS = `
  window.__setSlider = function(id, value){
    const el = document.getElementById(id);
    if(!el) throw new Error('slider #' + id + ' not found');
    el.value = String(value);
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  window.__raf = function(n){
    return new Promise(res => {
      const tick = k => k <= 0 ? res() : requestAnimationFrame(() => tick(k - 1));
      tick(n);
    });
  };
`;

/* β grid used by all four SR sims: -0.95 .. 0.95 step 0.05, exact rationals i/20. */
function betaGrid() {
  const out = [];
  for (let i = -19; i <= 19; i++) out.push(i / 20);
  return out;
}

/* Each target: relative source path, output slug, probe description, and an
 * async in-page sweep function returning [{input, output}...].
 * Probe shapes were read from each sim's source — do not guess new domains. */
const TARGETS = [
  {
    source: 'Sim_lab_sims/CM_sims/L17-The damped HO.html',
    slug: 'l17-damped-ho',
    probe: '__audit.at(alpha) -> {decayRate}: slow decay rate lambda(alpha) = alpha - sqrt(max(0, alpha^2 - omega0^2)), omega0 = 3; alpha is the damping slider, domain [0, 6] step 0.05',
    sweep: async () => {
      const out = [];
      for (let i = 0; i <= 120; i++) {
        const alpha = i / 20; // 0 .. 6 step 0.05
        out.push({ input: { alpha }, output: window.__audit.at(alpha) });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/L9-The pendulum.html',
    slug: 'l9-pendulum',
    probe: '__audit.at(theta0_rad) -> {periodRatio}: T(theta0)/T0 via the AGM complete elliptic integral; release amplitude slider domain 5..90 deg (argument passed in radians)',
    sweep: async () => {
      const out = [];
      for (let deg = 5; deg <= 90; deg++) {
        const rad = deg * Math.PI / 180;
        out.push({ input: { theta0Deg: deg, theta0Rad: rad }, output: window.__audit.at(rad) });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/L7-Motion in a potential.html',
    slug: 'l7-motion-in-a-potential',
    probe: '__audit.at(x) -> {speedAtMin, vAtX, barrierHeight, V, stableEq, unstableEq}: double-well V(x), v(x)=sqrt(2(E-V(x))/m), m=1 kg, default E slider (0.30 J); x swept over the sim world window [-2.6, 3.0] step 0.1',
    sweep: async () => {
      const out = [];
      for (let i = -26; i <= 30; i++) {
        const x = i / 10;
        out.push({ input: { x }, output: window.__audit.at(x) });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/L4-Projectile motion.html',
    slug: 'l4-projectile-motion',
    probe: '__audit.at() -> {range, flightTime, maxHeight} at current sliders (g = 9.81); swept by driving the #theta slider 0..90 deg step 5 at v0 = 25 m/s, then the #v0 slider 5..50 step 5 at theta = 45 deg',
    sweep: async () => {
      const out = [];
      window.__setSlider('v0', 25);
      for (let th = 0; th <= 90; th += 5) {
        window.__setSlider('theta', th);
        await window.__raf(1);
        out.push({ input: { v0: 25, thetaDeg: th }, output: window.__audit.at() });
      }
      window.__setSlider('theta', 45);
      for (let v = 5; v <= 50; v += 5) {
        window.__setSlider('v0', v);
        await window.__raf(1);
        out.push({ input: { v0: v, thetaDeg: 45 }, output: window.__audit.at() });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/L36-Scattering Extension.html',
    slug: 'l36-scattering-extension',
    probe: '__audit() (no argument) -> {b, v, psi, psiDeg, rmin, rminExact, tanHalf, invBV2, shots}: repulsive 1/r scattering; psi/rmin are last-shot values (null, no shots fired); rminExact/invBV2 are analytic in (b, v); swept by driving #b-slider 0.1..3.0 step 0.1 at v = 1.0',
    sweep: async () => {
      const out = [];
      window.__setSlider('v-slider', 1.0);
      for (let i = 1; i <= 30; i++) {
        const b = i / 10;
        window.__setSlider('b-slider', b);
        await window.__raf(1);
        out.push({ input: { b, v: 1.0 }, output: window.__audit() });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/L16-Friction-in-3d.html',
    slug: 'l16-friction-in-3d',
    probe: '__audit.at() -> {vacuumRange, vacuumFlightTime, dragRange, dragFlightTime, optimalDragAngleDeg, terminalVelocity, quadRange, quadFlightTime, optimalQuadAngleDeg, ...} at current sliders (g = 9.81); swept by driving #sl-theta 30..60 deg step 2 at defaults v0 = 29, b = 0.3, c = 0.007, m = 1',
    sweep: async () => {
      const out = [];
      for (let th = 30; th <= 60; th += 2) {
        window.__setSlider('sl-theta', th);
        await window.__raf(1);
        out.push({
          input: { thetaDeg: th, v0: 29, b: 0.3, c: 0.007, m: 1 },
          output: window.__audit.at(),
        });
      }
      return out;
    },
  },
  {
    source: 'Sim_lab_sims/CM_sims/Collisions.html',
    slug: 'collisions',
    probe: '__audit.at() (argument ignored) -> {mode, e, pBefore, pAfter, keBefore, keAfter, dKE, vcm} at current sliders; captured at defaults (m1 = m2 = 1, v1 = 2, v2 = -2), then swept by driving #s-m1 0.5..5.0 step 0.5',
    sweep: async () => {
      const out = [];
      out.push({ input: { default: true, m1: 1.0, m2: 1.0, v1: 2.0, v2: -2.0 }, output: window.__audit.at() });
      for (let i = 1; i <= 10; i++) {
        const m1 = i / 2;
        window.__setSlider('s-m1', m1);
        await window.__raf(1);
        out.push({ input: { m1, m2: 1.0, v1: 2.0, v2: -2.0 }, output: window.__audit.at() });
      }
      return out;
    },
  },
  /* ---- SR sims (grabbed now for M6) — all take __audit.at(beta) ---- */
  {
    source: 'Sim_lab_sims/SR_sims/L09-s1-worldline-length-and-proper-time-shell.html',
    slug: 'sr-l09-worldline-proper-time',
    probe: '__audit.at(beta) -> {gamma, deltaTPrime}: gamma = 1/sqrt(1-beta^2); deltaTPrime = gamma*(dt - beta*dx) at (dt, dx) = (0, 1) = -gamma*beta; beta in [-0.95, 0.95] step 0.05',
    sweep: srSweep,
  },
  {
    source: 'Sim_lab_sims/SR_sims/L13-s1-lorentz-transformations-on-vectors-shell.html',
    slug: 'sr-l13-lorentz-transformations',
    probe: '__audit.at(beta) -> {gamma, deltaTPrime}: gamma = 1/sqrt(1-beta^2); deltaTPrime = boost(0,1,beta)[0] = -gamma*beta; beta in [-0.95, 0.95] step 0.05',
    sweep: srSweep,
  },
  {
    source: 'Sim_lab_sims/SR_sims/L14-s1-momentum-vs-velocity-shell.html',
    slug: 'sr-l14-momentum-vs-velocity',
    probe: '__audit.at(beta) -> {gamma, momentum, totalEnergy}: c = 1, m = 1, so momentum = gamma*beta, totalEnergy = gamma; beta in [-0.95, 0.95] step 0.05',
    sweep: srSweep,
  },
  {
    source: 'Sim_lab_sims/SR_sims/L17-s1-photon-worldline-shell.html',
    slug: 'sr-l17-photon-worldline',
    probe: '__audit.at(beta) -> {gamma}: gamma = 1/sqrt(1-beta^2) via the sim\'s own gammaOf; beta in [-0.95, 0.95] step 0.05',
    sweep: srSweep,
  },
];

async function srSweep() {
  const out = [];
  for (let i = -19; i <= 19; i++) {
    const beta = i / 20;
    out.push({ input: { beta }, output: window.__audit.at(beta) });
  }
  return out;
}

async function captureOne(browser, target) {
  const page = await browser.newPage();
  try {
    page.setDefaultTimeout(AUDIT_TIMEOUT_MS);
    const url = pathToFileURL(join(REPO_ROOT, target.source)).href;
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForFunction('!!window.__audit', { timeout: AUDIT_TIMEOUT_MS });
    await page.evaluate(PAGE_HELPERS);
    // Let the sim settle a few frames (lecture-mode auto-toggle, first onFrame, etc.)
    await page.evaluate('window.__raf(5)');
    const sweep = await page.evaluate(target.sweep);
    if (!Array.isArray(sweep) || sweep.length === 0) throw new Error('empty sweep');
    const golden = {
      source: target.source,
      capturedAt: new Date().toISOString(),
      probe: target.probe,
      sweep,
    };
    const outPath = join(GOLDEN_DIR, `${target.slug}.json`);
    writeFileSync(outPath, JSON.stringify(golden, null, 2) + '\n');
    return { slug: target.slug, ok: true, probes: sweep.length, outPath };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  mkdirSync(GOLDEN_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-extensions',
      // WebGL-safe software rendering (harmless for 2D-canvas sims):
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });

  const results = [];
  try {
    for (const target of TARGETS) {
      process.stdout.write(`capturing ${target.slug} ... `);
      try {
        const r = await captureOne(browser, target);
        results.push(r);
        console.log(`ok (${r.probes} probes)`);
      } catch (err) {
        results.push({ slug: target.slug, ok: false, error: String(err && err.message || err) });
        console.log(`FAILED: ${err && err.message || err}`);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  console.log('\n=== summary ===');
  const w = Math.max(...results.map(r => r.slug.length)) + 2;
  for (const r of results) {
    console.log(
      r.slug.padEnd(w) + (r.ok ? `${r.probes} probes captured` : `FAILED (${r.error})`)
    );
  }
  const failed = results.filter(r => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} sims captured, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(err => { console.error(err); process.exit(1); });
