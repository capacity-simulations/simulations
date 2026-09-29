// Parse-checks every <script> block in each file (module-free, so `import` is absent here).
import { readFileSync } from 'node:fs';
let bad = 0, blocks = 0;
for(const f of process.argv.slice(2)){
  const src = readFileSync(f, 'utf8');
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
  let m, n = 0;
  while((m = re.exec(src))){
    const type = (m[1].match(/type=["']([^"']+)/) || [,'text/javascript'])[1];
    if(!/javascript|module|^text\/babel$/.test(type)) continue;   // skip JSON manifests etc.
    n++; blocks++;
    try { new Function(m[2]); }
    catch(e){ bad++; console.log(`FAIL ${f} [script #${n}]: ${e.message}`); }
  }
  if(!n) console.log(`WARN ${f}: no inline script found`);
}
console.log(`${blocks} script blocks checked, ${bad} failed`);
process.exit(bad ? 1 : 0);
