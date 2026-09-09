#!/usr/bin/env node
/**
 * Per-sim automated checker (plan M7a).
 *
 * Usage:
 *   node engine/tools/verify.mjs <sim.html> [--json <out.json>] [--shots-dir <dir>]
 *
 * STATIC pass (no browser):
 *   1. syntax      — every inline <script> block (except application/json)
 *                    passes `node --check` (temp file per block).
 *   2. manifest    — #engine-manifest exists, is valid JSON, and satisfies the
 *                    required-key checks of manifest.schema.json. Validation is
 *                    REPLICATED IN JS from build.py's validate_manifest (chosen
 *                    over shelling out to python3: no interpreter dependency,
 *                    no startup cost, and the checks are five lines — kept in
 *                    lockstep with build.py by the shared registry.json).
 *                    verify.audit must be in modules.
 *   3. stamp       — manifest.build non-null; the ENGINE:BEGIN block carries
 *                    the stamp comment; sha256 of the inlined code matches
 *                    manifest.build.hash.
 *                    HASH BOUNDARY (mirrors build.py exactly): build.py hashes
 *                    the concatenated module code BEFORE wrapping it, then
 *                    writes `\n{BEGIN}\n{stamp}\n{code}\n{END}\n`. So we take
 *                    the text between the markers, strip the single leading
 *                    "\n", strip the stamp line (first line) and its "\n",
 *                    strip the single trailing "\n", and sha256 the rest;
 *                    first 12 hex must equal manifest.build.hash (and the
 *                    `sha` token inside the stamp comment).
 *   4. references  — every `Engine.<ns>` used by the SIM's own scripts (not
 *                    the ENGINE block) resolves to a module reachable from the
 *                    manifest (transitive deps included, since build.py inlines
 *                    them); registry `namespace`/`alias` respected — a bare
 *                    `Shell.` call counts as the shell module via its alias.
 *                    Unknown namespace = hand-rolled around the API = fail.
 *
 * DYNAMIC pass (headless Chrome; skipped when static fails):
 *   5. console     — any console.error or pageerror during the session = fail.
 *   6. audit       — window.__audit appears within 15 s and version === 1.
 *   7. initial run — __audit.run() passes at the default state.
 *   8. param sweep — for each manifest param: setParam to min/default/max,
 *                    advance ~10 rAF frames, __audit.run(); failures labeled
 *                    with the param/value that broke them.
 *   9. screenshot  — default-state PNG to --shots-dir
 *                    (default engine/_review/shots/<simname>.png).
 *
 * Emits a verdict JSON {sim, file, static, dynamic, pass} to --json (or a
 * stdout summary) and exits nonzero on failure.
 */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));       // engine/tools
const ENGINE_ROOT = resolve(HERE, '..');                    // engine/

const BEGIN = '/* ENGINE:BEGIN */';
const END = '/* ENGINE:END */';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PUPPETEER_PKG =
  '/Users/admin/Desktop/simulations-1/Capacity_SR_sims_v2_engine/_review/node_modules/puppeteer-core/package.json';
const AUDIT_TIMEOUT_MS = 15000;
const SWEEP_FRAMES = 10;

/* ---------------------------------------------------------------- helpers */

function parseArgs(argv) {
  const args = { sim: null, json: null, shotsDir: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') args.json = argv[++i];
    else if (a === '--shots-dir') args.shotsDir = argv[++i];
    else if (!args.sim) args.sim = a;
    else fail(`unexpected argument: ${a}`);
  }
  if (!args.sim) fail('usage: node engine/tools/verify.mjs <sim.html> [--json <out.json>] [--shots-dir <dir>]');
  return args;
}

function fail(msg) {
  console.error(`verify.mjs: ERROR: ${msg}`);
  process.exit(2);
}

/* Extract all <script> blocks: [{attrs, body, line, id, type, hasSrc}]. */
function extractScripts(html) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1];
    const typeM = /type\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
    const idM = /id\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
    out.push({
      attrs,
      body: m[2],
      line: html.slice(0, m.index).split('\n').length,
      id: idM ? (idM[1] ?? idM[2]) : null,
      type: typeM ? (typeM[1] ?? typeM[2]).toLowerCase() : '',
      hasSrc: /\bsrc\s*=/i.test(attrs),
    });
  }
  return out;
}

function isJsScript(s) {
  if (s.hasSrc) return false;
  if (!s.type) return true;
  return ['text/javascript', 'application/javascript', 'module'].includes(s.type);
}

/* ------------------------------------------------------------ static pass */

function checkSyntax(scripts) {
  const dir = mkdtempSync(join(tmpdir(), 'verify-syntax-'));
  const errors = [];
  try {
    scripts.forEach((s, i) => {
      if (!isJsScript(s)) return;
      const f = join(dir, `block-${i}.${s.type === 'module' ? 'mjs' : 'js'}`);
      writeFileSync(f, s.body);
      try {
        execFileSync(process.execPath, ['--check', f], { stdio: ['ignore', 'ignore', 'pipe'] });
      } catch (e) {
        const msg = String(e.stderr || e.message)
          .split('\n').filter(Boolean).slice(0, 4).join(' | ')
          .replaceAll(f, `<script #${i} @line ${s.line}>`);
        errors.push(`script block #${i} (HTML line ${s.line}${s.id ? `, id=${s.id}` : ''}): ${msg}`);
      }
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return { ok: errors.length === 0, errors };
}

/* Replicates build.py validate_manifest (documented choice: JS, not python3). */
function checkManifest(scripts, registry) {
  const el = scripts.find((s) => s.id === 'engine-manifest');
  if (!el) return { ok: false, errors: ['no <script id="engine-manifest"> block'] };
  let m;
  try {
    m = JSON.parse(el.body);
  } catch (e) {
    return { ok: false, errors: [`manifest is not valid JSON: ${e.message}`] };
  }
  const errors = [];
  for (const key of ['manifestVersion', 'sim', 'engine', 'modules']) {
    if (!(key in m)) errors.push(`manifest missing required key: ${key}`);
  }
  if (m.manifestVersion !== undefined && m.manifestVersion !== 1) {
    errors.push(`unsupported manifestVersion ${m.manifestVersion}`);
  }
  const known = registry.modules;
  if (Array.isArray(m.modules)) {
    const unknown = m.modules.filter((x) => !(x in known));
    if (unknown.length) errors.push(`unknown module(s) ${JSON.stringify(unknown)}`);
    if ('verify.audit' in known && !m.modules.includes('verify.audit')) {
      errors.push('manifest must include verify.audit (mandatory module)');
    }
  } else if ('modules' in m) {
    errors.push('manifest.modules must be an array');
  }
  for (const v of m.vendor || []) {
    if (!(registry.vendor || {})[v]) errors.push(`unknown vendor asset: ${v}`);
  }
  if (m.params !== undefined) {
    if (!Array.isArray(m.params)) errors.push('manifest.params must be an array');
    else m.params.forEach((p, i) => {
      for (const k of ['id', 'label', 'min', 'max', 'step', 'default']) {
        if (!(k in (p || {}))) errors.push(`params[${i}] missing required key: ${k}`);
      }
    });
  }
  return { ok: errors.length === 0, errors, manifest: m };
}

/* Stamp + hash. See HASH BOUNDARY note in the header. */
function checkStamp(html, manifest) {
  const errors = [];
  const build = manifest && manifest.build;
  if (!build || typeof build !== 'object') {
    return { ok: false, errors: ['manifest.build is null/missing — sim was never built (run build.py)'] };
  }
  for (const k of ['engineVersion', 'date', 'hash']) {
    if (!(k in build)) errors.push(`manifest.build missing ${k}`);
  }
  const b = html.indexOf(BEGIN);
  const e = html.indexOf(END);
  if (b < 0 || e < 0 || e < b) {
    errors.push('ENGINE:BEGIN/ENGINE:END markers missing or out of order');
    return { ok: false, errors };
  }
  let inner = html.slice(b + BEGIN.length, e);
  if (!inner.startsWith('\n')) {
    errors.push('malformed ENGINE block: no newline after ENGINE:BEGIN');
    return { ok: false, errors };
  }
  inner = inner.slice(1);
  const nl = inner.indexOf('\n');
  const stamp = nl < 0 ? inner : inner.slice(0, nl);
  const stampM = /^\/\* engine v(\S+) \| modules: .* \| built \S+ \| sha ([0-9a-f]{12}) \*\/$/.exec(stamp);
  if (!stampM) {
    errors.push(`first line inside ENGINE block is not a build stamp comment: ${JSON.stringify(stamp.slice(0, 100))}`);
    return { ok: false, errors };
  }
  let code = inner.slice(nl + 1);
  if (code.endsWith('\n')) code = code.slice(0, -1);
  const digest = createHash('sha256').update(code, 'utf8').digest('hex').slice(0, 12);
  if (build.hash && digest !== build.hash) {
    errors.push(`inlined engine code hash mismatch: recomputed ${digest}, manifest.build.hash ${build.hash} — engine block was edited after build, or manifest tampered`);
  }
  if (build.hash && stampM[2] !== build.hash) {
    errors.push(`stamp comment sha ${stampM[2]} != manifest.build.hash ${build.hash}`);
  }
  if (build.engineVersion && stampM[1] !== build.engineVersion) {
    errors.push(`stamp engine version ${stampM[1]} != manifest.build.engineVersion ${build.engineVersion}`);
  }
  return { ok: errors.length === 0, errors, recomputedHash: digest, stampVersion: stampM[1] };
}

/* Namespaces provided by the manifest (transitive deps — build.py inlines them). */
function resolvedNamespaces(modules, registry) {
  const known = registry.modules;
  const seen = new Set();
  const visit = (name) => {
    if (seen.has(name) || !(name in known)) return;
    seen.add(name);
    for (const d of known[name].deps || []) visit(d);
  };
  for (const m of modules) visit(m);
  const nsToModule = new Map();   // Engine.<ns> -> module
  const aliasToModule = new Map(); // window.<Alias> -> module
  for (const name of seen) {
    const entry = known[name];
    const ns = entry.namespace || (name.includes('.') ? name.split('.').slice(1).join('.') : name);
    nsToModule.set(ns, name);
    if (entry.alias) aliasToModule.set(entry.alias, name);
  }
  return { modules: seen, nsToModule, aliasToModule };
}

function checkReferences(scripts, manifest, registry) {
  if (!manifest || !Array.isArray(manifest.modules)) {
    return { ok: false, errors: ['cannot check Engine references without a valid manifest'] };
  }
  const { nsToModule } = resolvedNamespaces(manifest.modules, registry);
  // All known namespaces/aliases across the whole registry (to name the culprit).
  const all = resolvedNamespaces(Object.keys(registry.modules), registry);
  const errors = [];
  const used = new Set();
  for (const s of scripts) {
    if (!isJsScript(s) || s.id === 'engine-inline') continue;
    for (const m of s.body.matchAll(/\bEngine\.([A-Za-z_$][A-Za-z0-9_$]*)/g)) used.add(m[1]);
    // Registry aliases (e.g. window.Shell for the shell module) count as usage.
    for (const [alias, mod] of all.aliasToModule) {
      if (new RegExp(`\\b${alias}\\s*\\.`).test(s.body) && !nsToModule.has(
        registry.modules[mod].namespace || mod)) {
        errors.push(`sim uses global "${alias}." (module ${mod}) but ${mod} is not manifested`);
      }
    }
  }
  for (const ns of used) {
    if (!nsToModule.has(ns)) {
      const owner = all.nsToModule.get(ns);
      errors.push(owner
        ? `sim references Engine.${ns} but module ${owner} is not in the manifest`
        : `sim references Engine.${ns} — no engine module provides that namespace (hand-rolled around the API?)`);
    }
  }
  return { ok: errors.length === 0, errors, used: [...used].sort() };
}

/* ----------------------------------------------------------- dynamic pass */

async function dynamicPass(simPath, manifest, shotPath) {
  const dyn = {
    consoleErrors: { ok: true, errors: [] },
    audit: { ok: false, errors: [] },
    initialRun: { ok: false, errors: [] },
    paramSweep: { ok: true, errors: [], sweeps: [] },
    screenshot: { ok: false, errors: [], path: shotPath },
  };
  let puppeteer;
  try {
    puppeteer = createRequire(PUPPETEER_PKG)('puppeteer-core');
  } catch (e) {
    dyn.audit.errors.push(`cannot load puppeteer-core: ${e.message}`);
    return dyn;
  }
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [
      '--no-first-run',
      '--disable-extensions',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--ignore-gpu-blocklist',
    ],
  });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(AUDIT_TIMEOUT_MS);
    page.on('console', (msg) => {
      if (msg.type() === 'error') dyn.consoleErrors.errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      dyn.consoleErrors.errors.push(`pageerror: ${String(err && err.message || err).split('\n')[0]}`);
    });

    await page.goto(pathToFileURL(resolve(simPath)).href, { waitUntil: 'load', timeout: 30000 });

    // 6. __audit within 15 s, version === 1
    try {
      await page.waitForFunction('!!window.__audit', { timeout: AUDIT_TIMEOUT_MS });
    } catch {
      dyn.audit.errors.push(`window.__audit did not appear within ${AUDIT_TIMEOUT_MS} ms`);
      dyn.consoleErrors.ok = dyn.consoleErrors.errors.length === 0;
      return dyn;
    }
    const version = await page.evaluate('window.__audit.version');
    if (version !== 1) dyn.audit.errors.push(`__audit.version is ${JSON.stringify(version)}, expected 1`);
    dyn.audit.ok = dyn.audit.errors.length === 0;

    await page.evaluate(`window.__raf = (n) => new Promise((res) => {
      const tick = (k) => (k <= 0 ? res() : requestAnimationFrame(() => tick(k - 1)));
      tick(n);
    });`);
    await page.evaluate('window.__raf(5)'); // let the sim settle

    // 7. initial run at defaults
    const first = await page.evaluate('window.__audit.run()');
    if (!first || first.pass !== true) {
      const failing = ((first && first.results) || []).filter((r) => !r.ok);
      dyn.initialRun.errors.push(
        `__audit.run() failed at default state: ${failing.map((r) =>
          `${r.name} (value=${JSON.stringify(r.value)}, expected=${JSON.stringify(r.expected)}, tol=${JSON.stringify(r.tol)})`).join('; ') || 'no results'}`);
    }
    dyn.initialRun.ok = dyn.initialRun.errors.length === 0;
    dyn.initialRun.results = (first && first.results) || [];

    // 8. param sweep min/default/max with ~10 rAF frames between
    for (const p of (manifest && manifest.params) || []) {
      for (const [which, value] of [['min', p.min], ['default', p.default], ['max', p.max]]) {
        const label = `${p.id}=${value} (${which})`;
        try {
          await page.evaluate(
            (id, v, frames) => {
              window.__audit.setParam(id, v);
              return window.__raf(frames);
            }, p.id, value, SWEEP_FRAMES);
          const r = await page.evaluate('window.__audit.run()');
          const failing = ((r && r.results) || []).filter((x) => !x.ok);
          dyn.paramSweep.sweeps.push({ param: p.id, which, value, pass: !!(r && r.pass) });
          if (!r || !r.pass) {
            dyn.paramSweep.errors.push(
              `invariant failure at ${label}: ${failing.map((x) =>
                `${x.name} (value=${JSON.stringify(x.value)}, expected=${JSON.stringify(x.expected)})`).join('; ') || 'run() returned no pass'}`);
          }
        } catch (e) {
          dyn.paramSweep.sweeps.push({ param: p.id, which, value, pass: false });
          dyn.paramSweep.errors.push(`setParam/run threw at ${label}: ${String(e && e.message || e).split('\n')[0]}`);
        }
      }
    }
    dyn.paramSweep.ok = dyn.paramSweep.errors.length === 0;

    // 9. screenshot at default state (params were left at max by the sweep)
    try {
      for (const p of (manifest && manifest.params) || []) {
        await page.evaluate((id, v) => { window.__audit.setParam(id, v); }, p.id, p.default);
      }
      await page.evaluate('window.__raf(5)');
      mkdirSync(dirname(shotPath), { recursive: true });
      await page.screenshot({ path: shotPath });
      dyn.screenshot.ok = true;
    } catch (e) {
      dyn.screenshot.errors.push(`screenshot failed: ${String(e && e.message || e).split('\n')[0]}`);
    }

    // 5. console errors — evaluated last so the whole session is covered
    dyn.consoleErrors.ok = dyn.consoleErrors.errors.length === 0;
  } finally {
    await browser.close().catch(() => {});
  }
  return dyn;
}

/* ------------------------------------------------------------------ main */

function sectionPass(section) {
  return Object.values(section).every((c) => c && c.ok !== false);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const simPath = resolve(args.sim);
  let html;
  try {
    html = readFileSync(simPath, 'utf8');
  } catch (e) {
    fail(`cannot read ${simPath}: ${e.message}`);
  }
  const registry = JSON.parse(readFileSync(join(ENGINE_ROOT, 'registry.json'), 'utf8'));
  const scripts = extractScripts(html);
  const simName = basename(simPath).replace(/\.html?$/i, '');
  const shotPath = resolve(args.shotsDir || join(ENGINE_ROOT, '_review', 'shots'), `${simName}.png`);

  const staticPass = {};
  staticPass.syntax = checkSyntax(scripts);
  staticPass.manifest = checkManifest(scripts, registry);
  const manifest = staticPass.manifest.manifest || null;
  delete staticPass.manifest.manifest;
  staticPass.stamp = checkStamp(html, manifest);
  staticPass.references = checkReferences(scripts, manifest, registry);

  const staticOk = sectionPass(staticPass);
  let dynamic;
  if (staticOk) {
    dynamic = await dynamicPass(simPath, manifest, shotPath);
  } else {
    dynamic = { skipped: true, reason: 'static pass failed — dynamic pass not run' };
  }
  const dynamicOk = dynamic.skipped ? false : sectionPass(dynamic);
  const pass = staticOk && dynamicOk;

  const verdict = {
    sim: (manifest && manifest.sim) || simName,
    file: simPath,
    static: staticPass,
    dynamic,
    pass,
  };

  // Human-readable report
  const line = (name, c) => {
    const ok = c.skipped ? 'SKIP' : (c.ok ? 'ok' : 'FAIL');
    console.log(`  ${name.padEnd(14)} ${ok}`);
    for (const err of c.errors || []) console.log(`      - ${err}`);
    if (c.skipped) console.log(`      - ${c.reason}`);
  };
  console.log(`verify ${basename(simPath)} [static]`);
  for (const [k, v] of Object.entries(staticPass)) line(k, v);
  console.log(`verify ${basename(simPath)} [dynamic]`);
  if (dynamic.skipped) line('(all)', dynamic);
  else for (const [k, v] of Object.entries(dynamic)) line(k, v);

  if (args.json) {
    mkdirSync(dirname(resolve(args.json)), { recursive: true });
    writeFileSync(resolve(args.json), JSON.stringify(verdict, null, 2) + '\n');
  }
  console.log(`VERIFY ${pass ? 'PASS' : 'FAIL'} ${basename(simPath)}${args.json ? ` (verdict: ${args.json})` : ''}`);
  process.exit(pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
