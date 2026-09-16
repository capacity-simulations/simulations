// Sim-specific state checks for the double-slit port. Each hook receives the Playwright page.
const txt = async (p, sel) => (await p.$eval(sel, e => e.textContent.trim()).catch(()=>''));
const disp = async (p, sel) => p.$eval(sel, e => getComputedStyle(e).display).catch(()=>'missing');
const vis  = async (p, sel) => p.$eval(sel, e => getComputedStyle(e).visibility).catch(()=>'missing');
const hasCls = async (p, sel, c) => p.$eval(sel, (e,c)=>e.classList.contains(c), c).catch(()=>false);
module.exports = {
  async boot(p, ok){
    ok(await txt(p,'#playpause-btn')==='Pause', 'boot: sim running as the author made it');
    ok(await disp(p,'.detector-chart-panel')==='none', 'boot: chart (theory-curve leak) hidden');
    ok(await disp(p,'#params-group')!=='none' && await disp(p,'#slit-control-group')!=='none', 'boot: all controls available during inquiry');
    ok(await vis(p,'#classical-btn')!=='hidden', 'boot: Classical button available');
    ok(await p.evaluate(()=> typeof THREE!=='undefined' && !!document.querySelector('#main-canvas')), 'boot: Three.js initialised');
  },
  async card(p, i, phase, ok){           // phase: 'enter' | 'answered'
    if(i===1 && phase==='enter')    ok(await txt(p,'#playpause-btn')==='Play', 'card 2: paused on the gate');
    if(i===1 && phase==='answered') ok(await txt(p,'#playpause-btn')==='Pause', 'card 2: resumed after answering');
    if(i===2) { ok(await disp(p,'.detector-chart-panel')!=='none', 'card 3: chart revealed');
                ok(await p.$eval('#combined-chart-canvas', c=>c.clientWidth>0), 'card 3: chart canvas has size'); }
    if(i===4 && phase==='enter'){ ok(await txt(p,'#playpause-btn')==='Play', 'card 5: paused'); }
    if(i===5) { ok(await txt(p,'#slit2-toggle')==='S2: Closed', 'card 6: S2 pinned closed via the sim toggle');
                ok(await txt(p,'#playpause-btn')==='Pause', 'card 6: running'); }
    if(i===7) { ok(await txt(p,'#slit2-toggle')==='S2: Open', 'card 8: S2 reopened');
                ok(await hasCls(p,'#classical-btn','active'), 'card 8: classical overlay ON via the sim button');
              }
  },
  async finished(p, ok){
    ok(await disp(p,'#params-group')!=='none' && await disp(p,'.detector-chart-panel')!=='none', 'finish: everything visible (free exploration)');
    ok(await txt(p,'#slit2-toggle')==='S2: Open', 'finish: S2 open');
  },
  async afterReset(p, ok){
    ok(await p.$eval('#slit-sep', e=>e.value)==='1600' && await p.$eval('#wavelength', e=>e.value)==='525', 'reset: sliders at first-load defaults');
    ok(await txt(p,'#slit2-toggle')==='S2: Open' && !(await hasCls(p,'#classical-btn','active')), 'reset: S2 open, classical off');
    ok(await txt(p,'#playpause-btn')==='Pause', 'reset: running like first load');
    ok(await disp(p,'.detector-chart-panel')==='none', 'reset: card-1 reveals re-applied (chart hidden)');
  }
};
