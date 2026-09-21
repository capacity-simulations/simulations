#!/usr/bin/env python3
"""Definition of done for the mode-local Reset: fresh-entry == post-reset.

Usage:
    python3 oracle.py <sim.html> [reset-button-id] [--probe JS_EXPR]

For each mode (free / inquiry / controls):
  fresh-load -> pick the mode on the welcome overlay -> snapshot
  -> dirty (inquiry: answer+advance twice; all: first range to max, play)
  -> ONE reset click -> 1.2s -> snapshot -> diff.
Also: mid-deck GI reset must land card index 0 in that ONE click, and zero
pageerror events are tolerated anywhere.

Snapshot: gi/cg button active, active card index, Shell.playing (null on the
QM generation — fine), first range value, plus an optional --probe expression
evaluated into the snapshot (use it for sim-specific accumulated state, e.g.
'state && state.lib ? state.lib.length : null' won't work for IIFE state —
probe DOM instead, e.g. a readout's textContent).

PASS = no diffs. Diffs are FAILURES unless justified under hazards.md H7
(accepted per-sim design) with a named precedent — the human reviews those
justifications, so report them verbatim, never silently.

Exit 0 only if every mode passed (accepted diffs still exit 1 so the caller
must look; use --allow KEY[,KEY] to exempt justified keys after classifying).
"""
import sys, json, urllib.parse

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = [a for a in sys.argv[1:] if a.startswith('--')]
if not args:
    raise SystemExit(__doc__)
path = args[0]
btn = args[1] if len(args) > 1 else None
probe = 'null'
allow = set()
for o in opts:
    if o.startswith('--probe='): probe = o.split('=',1)[1]
    if o.startswith('--allow='): allow = set(o.split('=',1)[1].split(','))

from playwright.sync_api import sync_playwright

SNAP = """(()=>{
  const gi=document.getElementById('btn-gi'),cg=document.getElementById('btn-cg');
  const cards=[...document.querySelectorAll('.inq-step')];
  const act=document.querySelector('.inq-step.active');
  let playing=null; try{ playing=(typeof Shell!=='undefined')?Shell.playing:null; }catch(e){}
  const r=document.querySelector('input[type=range]');
  let probe=null; try{ probe=(%s); }catch(e){ probe='PROBE_ERR:'+e; }
  const co=document.querySelector('.cg-callout h5');
  const nv=document.querySelector('.cg-nav');
  return {gi:gi?gi.classList.contains('active'):null,
          cg:cg?cg.classList.contains('active'):null,
          card:act?cards.indexOf(act):-1, playing, s1:r?r.value:null,
          cgTitle:co?co.textContent:null,
          cgNav:nv?(nv.style.display!=='none'):null, probe};})()""" % probe

def find_btn(pg):
    return pg.evaluate("""(()=>{for(const id of ['shell-reset','reset','reset-btn','resetBtn','btnReset'])
        if(document.getElementById(id)) return id; return null;})()""")

fails = 0
with sync_playwright() as p:
    br = p.chromium.launch(channel='chrome')
    for mode in ['free', 'inquiry', 'controls']:
        pg = br.new_page(viewport={'width':1500,'height':920}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)[:90]))
        pg.goto('file://'+urllib.parse.quote(path if path.startswith('/') else __import__('os').path.abspath(path)), wait_until='load')
        pg.wait_for_timeout(1300)
        pg.evaluate(f"document.querySelector('.welcome-mode[data-mode=\"{mode}\"]').click()")
        pg.wait_for_timeout(900)
        rid = btn or find_btn(pg)
        fresh = pg.evaluate(SNAP)
        if mode == 'inquiry':
            for _ in range(2):
                pg.evaluate("document.querySelector('.inq-step.active .choice')?.click()"); pg.wait_for_timeout(250)
                # pager id varies by generation: v2 shell uses inq-pager-next, QM uses inq-pgnext
                pg.evaluate("(document.querySelector('#inq-pager-next')||document.querySelector('#inq-pgnext'))?.click()"); pg.wait_for_timeout(300)
        if mode == 'controls':
            for _ in range(2):
                pg.evaluate("(document.getElementById('cg-pgnext')||document.getElementById('cg-fwd')||document.getElementById('cg-next'))?.click()"); pg.wait_for_timeout(250)
        pg.evaluate("const r=document.querySelector('input[type=range]'); if(r){r.value=r.max; r.dispatchEvent(new Event('input',{bubbles:true}))}")
        pg.evaluate("try{if(typeof Shell!=='undefined')Shell.setPlaying(true)}catch(e){}")
        pg.wait_for_timeout(450)
        mid = pg.evaluate(SNAP)
        pg.evaluate(f"document.getElementById('{rid}').click()")
        pg.wait_for_timeout(1200)
        after = pg.evaluate(SNAP)
        diffs = {k:(fresh[k],after[k]) for k in fresh if fresh[k]!=after[k] and k not in allow}
        one_click_ok = (mode!='inquiry') or (after['card']==0)
        ok = not diffs and not errs and one_click_ok
        if not ok: fails += 1
        print(f"{mode:9} {'PASS' if ok else 'FAIL'}"
              + (f"  diffs={diffs}" if diffs else '')
              + ('' if one_click_ok else '  MID-DECK NEEDS >1 CLICK')
              + (f"  pageerrors={errs[:2]}" if errs else '')
              + (f"  [dirtied: card {mid['card']}, s1 {mid['s1']}]" if mode=='inquiry' else '')
              + (f"  [tour dirtied to: {mid['cgTitle']}]" if mode=='controls' else ''),
              flush=True)
        pg.close()
    br.close()
sys.exit(1 if fails else 0)
