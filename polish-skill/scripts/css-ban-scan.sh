#!/bin/bash
# Lists sim CSS rules the assembler will SILENTLY STRIP (final selector is a frozen shell class/id).
# Same regex as src/services/userShellKit.mjs CSS_BAN. The standard "body.light-theme .legend…" line
# is harmless (present in every sim); any other hit that does layout work must be retargeted to a
# sim-owned class/id on the same element (selector-only change), then re-assemble.
# usage: bash css-ban-scan.sh <sims-eval-law/<id>.core-slots.txt>
REPO="${SIM_FOUNDRY:-/Users/admin/Downloads/sim-foundry}"
node -e '
const fs=require("fs");
const BAN=/(^|[^\w-])(\.(shell|cg|welcome|inq|wm|wa)-[\w-]+|#shell\b|#inq-[\w-]+|#welcome-[\w-]+|#btn-(gi|cg)\b|#cg-[\w-]+|\.choice\b|\.predict-eval\b|\.aside-[\w-]+|\.plot-box\b|\.plot-title\b|\.legend\b|\.ctrl-box\b|\.formal-grid\b|\.eq-row\b)\s*[,{:.[]/m;
const t=fs.readFileSync(process.argv[1],"utf8"); const m=t.match(/<<<SLOT:SIM_CSS>>>([\s\S]*?)<<<END>>>/);
if(!m){console.log("no SIM_CSS slot");process.exit(0)}
const hits=m[1].split("\n").filter(l=>BAN.test(l));
if(!hits.length) console.log("CSS OK: no stripped rules");
hits.forEach(h=>console.log((/light-theme .legend|data-theme="light"\] .legend/.test(h)?"harmless  ":"STRIPPED  ")+h.trim().slice(0,200)));
' "$REPO/$1" 2>/dev/null || node -e 'console.log("usage: css-ban-scan.sh <path relative to sim-foundry>")'
