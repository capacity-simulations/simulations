// Minimal CDP driver for headless Chrome (no deps; Node >=22 global WebSocket)
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function launch(url, { port = 9333, width = 1440, height = 900 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), 'cdp-prof-'));
  const proc = spawn(CHROME, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--headless=new', '--no-first-run', '--no-default-browser-check',
    `--window-size=${width},${height}`, url,
  ], { stdio: 'ignore' });

  // wait for the debugger endpoint + page target
  let target = null;
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find(t => t.type === 'page');
      if (target) break;
    } catch {}
  }
  if (!target) {
    proc.kill();
    throw new Error(`no CDP page target on port ${port} — a stale headless Chrome may still own it (try another port), or the page never loaded (is the static server on :8734 up?)`);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  const consoleMsgs = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.consoleAPICalled') {
      consoleMsgs.push({ type: m.params.type, text: (m.params.args || []).map(a => a.value ?? a.description ?? '').join(' ') });
    }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      consoleMsgs.push({ type: 'exception', text: (d.exception && (d.exception.description || d.exception.value)) || d.text });
    }
    if (m.method === 'Log.entryAdded') {
      consoleMsgs.push({ type: m.params.entry.level, text: m.params.entry.text, source: m.params.entry.source });
    }
  };
  const send = (method, params = {}) => new Promise((res) => {
    const mid = ++id;
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');

  return {
    proc, ws, consoleMsgs,
    async evalJs(expr, { awaitPromise = false } = {}) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise });
      if (r.result && r.result.exceptionDetails) {
        return { __error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
      }
      return r.result && r.result.result ? r.result.result.value : undefined;
    },
    async screenshot(path) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(path, Buffer.from(r.result.data, 'base64'));
      return path;
    },
    consoleIssues() { return consoleMsgs.filter(m => ['error', 'exception', 'warning'].includes(m.type)); },
    allConsole() { return consoleMsgs; },
    async close() { try { ws.close(); } catch {} try { proc.kill(); } catch {} },
  };
}
