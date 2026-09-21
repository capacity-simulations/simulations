#!/usr/bin/env python3
"""Apply the four sanctioned patches and inject The Physics layer."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))
from patchlib import Patcher, fill_tokens, inject_layer

HERE = os.path.dirname(os.path.abspath(__file__))
HTML = os.path.join(HERE, 'cm-brachistochrone-race.polished.html')
LAYER = os.path.join(HERE, 'layer.html')
ART = os.path.join(HERE, 'assets_build', 'art.json')

OLD_BTN = '<button id="toggle-formal" class="shell-btn">∑ Formal</button>'
NEW_BTN = '<button id="toggle-formal" class="shell-btn" title="Open the revision sheet">\u269B\uFE0E The Physics</button>'

OLD_LIS = """  if (tFormal) tFormal.addEventListener('click', () => {
    const hidden = root.classList.toggle('hide-formal');
    root.classList.toggle('formal-open', !hidden);   // SR L07-s1: lets sim CSS make room
    tFormal.classList.toggle('active', !hidden);
    requestAnimationFrame(refit);
  });"""
NEW_LIS = """  if (tFormal) tFormal.addEventListener('click', () => {
      // Physics layer: open the revision sheet instead of toggling the strip.
      if(window.__openPhysics) window.__openPhysics();
  });"""

OLD_HOOK = """Shell.init({ onFrame:onFrame, onReset:onReset, onResize:onResize, onStep:onStep, onComplete:onComplete, cfg:{ autoplay:false } });
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ fit(); drawAll(); renderEqs(); });
})();"""
NEW_HOOK = """Shell.init({ onFrame:onFrame, onReset:onReset, onResize:onResize, onStep:onStep, onComplete:onComplete, cfg:{ autoplay:false } });
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ fit(); drawAll(); renderEqs(); });
  function applyPhysicsScene(cfg){
    cfg = cfg || {};
    freeExplore();
    var sep=$('sep'), drop=$('drop'), grav=$('grav');
    if (cfg.dx !== undefined && sep) { sep.value = cfg.dx; sep.dispatchEvent(new Event('input',{bubbles:true})); }
    if (cfg.dy !== undefined && drop) { drop.value = cfg.dy; drop.dispatchEvent(new Event('input',{bubbles:true})); }
    if (cfg.g !== undefined && grav) { grav.value = cfg.g; grav.dispatchEvent(new Event('input',{bubbles:true})); }
    if (cfg.reveal !== false) { ST.revealed = true; applyView(); }
    resetRun(); fit(); fitView(); drawAll();
    if (typeof Shell !== 'undefined') {
      if (Shell.setPlayLocked) Shell.setPlayLocked(false);
      if (Shell.setPlayEnabled) Shell.setPlayEnabled(true);
    }
    if (cfg.launch || cfg.playing) {
      if (typeof Shell !== 'undefined') Shell.setPlaying(true);
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
