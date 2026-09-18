#!/usr/bin/env python3
"""Apply the four sanctioned patches and inject The Physics layer."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))
from patchlib import Patcher, fill_tokens, inject_layer

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, 'Galperins_Billiard.html')
LAYER = os.path.join(HERE, 'layer.html')
ART = os.path.join(HERE, 'assets_build', 'art.json')

OLD_BTN = '<button id="toggle-formal" class="shell-btn">∑ Formal</button>'
NEW_BTN = '<button id="toggle-formal" class="shell-btn" title="Open the revision sheet">∑ The Physics</button>'

OLD_LIS = """    if(tFormal) tFormal.addEventListener('click',()=>{
      const hidden=root.classList.toggle('hide-formal');
      tFormal.classList.toggle('active',!hidden);
      requestAnimationFrame(refit);
    });"""
NEW_LIS = """    if(tFormal) tFormal.addEventListener('click',()=>{
      // Physics layer: open the revision sheet instead of toggling the strip.
      if(window.__openPhysics) window.__openPhysics();
    });"""

OLD_HOOK = """    if (card && card.hasAttribute('data-gate') && !card.hasAttribute('data-ready')) {
      Shell.setPlayLocked(true);
    }
  });
})();"""
NEW_HOOK = """    if (card && card.hasAttribute('data-gate') && !card.hasAttribute('data-ready')) {
      Shell.setPlayLocked(true);
    }
  });
  function applyPhysicsScene(cfg){
    cfg = cfg || {};
    var sel = document.getElementById('N-select');
    var vEl = document.getElementById('v0-slider');
    if (cfg.N !== undefined && sel) {
      sel.value = String(cfg.N);
      sel.dispatchEvent(new Event('change', {bubbles:true}));
    }
    if (cfg.v0 !== undefined && vEl) {
      vEl.value = cfg.v0;
      vEl.dispatchEvent(new Event('input', {bubbles:true}));
    }
    Shell.setPlayLocked(false);
    if (cfg.launch || cfg.playing) {
      resetState();
      draw();
      updateReadouts();
      updateBadge();
      Shell.setPlaying(true);
    }
  }
  window.__physicsHooks = { scene:applyPhysicsScene };
})();"""

OLD_FONT = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">'
NEW_FONT = OLD_FONT + '\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:ital,wght@0,400;0,600;0,700;1,500&display=swap">'

p = Patcher(HTML)
p.rep(OLD_BTN, NEW_BTN, 'button label')
p.rep(OLD_LIS, NEW_LIS, 'formal listener')
p.rep(OLD_HOOK, NEW_HOOK, 'scene hook')
p.rep(OLD_FONT, NEW_FONT, 'STIX font link')
p.apply()

layer = fill_tokens(open(LAYER, encoding='utf-8').read(), ART)
inject_layer(HTML, layer)
print('build ok')
