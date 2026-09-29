// Minimal CDP driver over Node's global WebSocket — no npm deps.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/* Chrome binary: env override first, then the newest puppeteer cache build, then
   the system installs. Pinning one cache path made this file rot every time
   puppeteer updated, so resolve it at run time instead. */
import { existsSync, readdirSync } from 'node:fs';
function findChrome(){
  if(process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const cache = join(process.env.HOME || '', '.cache', 'puppeteer', 'chrome-headless-shell');
  if(existsSync(cache)){
    const builds = readdirSync(cache).sort().reverse();
    for(const b of builds){
      for(const leaf of ['chrome-headless-shell-mac-arm64','chrome-headless-shell-mac-x64',
                         'chrome-headless-shell-linux64']){
        const p = join(cache, b, leaf, 'chrome-headless-shell');
        if(existsSync(p)) return p;
      }
    }
  }
  for(const p of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                  '/Applications/Chromium.app/Contents/MacOS/Chromium',
                  '/usr/bin/google-chrome', '/usr/bin/chromium']) if(existsSync(p)) return p;
  throw new Error('No Chrome found. Set CHROME_BIN to a chrome/chrome-headless-shell binary.');
}
const BIN = findChrome();

export async function launch(){
  const port = 9300 + Number(process.hrtime.bigint() % 400n);
  const dir = mkdtempSync(join(tmpdir(), 'cdp-'));
  const proc = spawn(BIN, [
    `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
    '--no-sandbox', '--disable-gpu', '--hide-scrollbars=false',
    '--force-device-scale-factor=1', '--allow-file-access-from-files',
    '--disable-features=CalculateNativeWinOcclusion', 'about:blank',
  ], { stdio: 'ignore' });

  let info = null;
  for(let i = 0; i < 150; i++){
    try { info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; }
    catch { await new Promise(r => setTimeout(r, 100)); }
  }
  if(!info) { proc.kill(); throw new Error('chrome did not start'); }
  return { proc, port, wsUrl: info.webSocketDebuggerUrl };
}

export class Session {
  constructor(ws, sessionId){ this.ws = ws; this.sessionId = sessionId; this.id = 0; this.pending = new Map(); }
  send(method, params = {}){
    const id = ++this.id;
    const msg = { id, method, params };
    if(this.sessionId) msg.sessionId = this.sessionId;
    this.ws.send(JSON.stringify(msg));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
}

export async function newPage(browser){
  const ws = new WebSocket(browser.wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const root = new Session(ws, null);
  const sessions = new Map([[null, root]]);
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    const s = sessions.get(m.sessionId ?? null);
    if(m.id && s && s.pending.has(m.id)){
      const { res, rej } = s.pending.get(m.id); s.pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
  };
  const { targetId } = await root.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await root.send('Target.attachToTarget', { targetId, flatten: true });
  const page = new Session(ws, sessionId);
  sessions.set(sessionId, page);
  await page.send('Page.enable');
  await page.send('Runtime.enable');
  page.close = () => ws.close();
  return page;
}

export async function goto(page, url){
  await page.send('Page.navigate', { url });
  await new Promise(r => setTimeout(r, 900));
}

export async function setViewport(page, width, height){
  await page.send('Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 260));
}

export async function evaluate(page, fn, arg){
  const expr = `(${fn.toString()})(${JSON.stringify(arg ?? null)})`;
  const r = await page.send('Runtime.evaluate',
    { expression: expr, returnByValue: true, awaitPromise: true });
  if(r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'eval failed');
  return r.result.value;
}
