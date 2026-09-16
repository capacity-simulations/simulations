// Canvas-distortion gate: proves the user-version layers did not corrupt the
// sim's rendering buffers.
//
// WHY: hosts that size a canvas from clientHeight AT PARSE TIME measure a
// container that the not-yet-styled welcome overlay has squashed, and build
// the backing store at the wrong size. The plot then ships stretched or
// blurred. EVERY structural gate passes — only pixels show it. Found on
// Time_evolution_Gaussian_wavepacket (backing store 2px tall behind a 465px
// display) and Classical-vs-schrodinger-ANHARMONIC.
//
// FIX (additive, cascade-safe): dispatch a window 'resize' after load so the
// sim's OWN handler re-sizes its canvases:
//   window.addEventListener('load', () => requestAnimationFrame(() =>
//     requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))));
// Prefer this over moving the template CSS into <head>, which would place
// template rules BEFORE the sim's own and change the cascade.
//
// Usage: node tests/canvas-check.mjs        (sweeps the QM sim-use-builds dir)
// Compares each canvas's backing-store:display ratio in the build against the
// same canvas in the original; >0.15 drift is reported as DISTORTED.

import {createRequire} from 'module';
import {readdirSync} from 'fs';
const require = createRequire('/Users/admin/Desktop/simulations-1/Capacity_SR_sims_v2_engine/_review/');
const puppeteer = require('puppeteer-core');
const R='/Users/admin/Desktop/simulations-1/Capacity_Quantum_simulations/Sims_user_versions/';
const files=readdirSync(R+'sim-use-builds').filter(f=>f.endsWith('.html'));
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--allow-file-access-from-files']});
const measure=async(url,dismiss)=>{
  const p=await b.newPage(); await p.setViewport({width:1500,height:950});
  try{ await p.goto(url,{waitUntil:'networkidle0',timeout:25000}); }catch(e){}
  await new Promise(r=>setTimeout(r,1400));
  if(dismiss){ await p.evaluate(()=>{const m=document.querySelector('.welcome-mode[data-mode="free"]'); if(m)m.click();}); await new Promise(r=>setTimeout(r,700)); }
  const out=await p.evaluate(()=>[...document.querySelectorAll('canvas')]
    .filter(c=>{const r=c.getBoundingClientRect(); return r.width>50&&r.height>50;})
    .map(c=>{const r=c.getBoundingClientRect();
      return {id:c.id||'(anon)', ratio:+(c.width/Math.max(1,r.width)).toFixed(2), vratio:+(c.height/Math.max(1,r.height)).toFixed(2)};}));
  await p.close(); return out;
};
console.log('sim'.padEnd(44),'verdict');
for(const f of files){
  const o=await measure('file://'+R+f,false);
  const n=await measure('file://'+R+'sim-use-builds/'+f,true);
  let verdict='ok';
  for(const oc of o){
    const nc=n.find(x=>x.id===oc.id); if(!nc) continue;
    if(Math.abs(nc.ratio-oc.ratio)>0.15||Math.abs(nc.vratio-oc.vratio)>0.15){
      verdict=`DISTORTED ${oc.id}: orig ${oc.ratio}x${oc.vratio} -> build ${nc.ratio}x${nc.vratio}`; break;}
  }
  if(!o.length) verdict='(no canvas measured)';
  console.log(f.replace('.html','').padEnd(44), verdict);
}
await b.close();
