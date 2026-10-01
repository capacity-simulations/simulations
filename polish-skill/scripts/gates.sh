#!/bin/bash
# The 9 sim-foundry gates on one assembled sim (the same battery the Claude Code polish used).
# usage: bash gates.sh <html path relative to sim-foundry, e.g. sims-eval-law/<id>.html> <sim-id>
# Green looks like: 1 frozen: []  |  2 audit: N/N kernel checks + k/k invariants  |  3 layout: "findings": []
#   4 gi: PASS  |  5 cg: PASS  |  6 wo: PASS  |  7 param-stability: "problems": []  |  8 style: PASS  |  9 reset-oracle: 3x PASS
REPO="${SIM_FOUNDRY:-/Users/admin/Downloads/sim-foundry}"
cd "$REPO" || exit 1
F=$1; SIM=$2
echo "== $F"
node --experimental-strip-types -e "import('./src/services/userShellKit.mjs').then(async m => { const {readFileSync} = await import('node:fs'); console.log('1 frozen:', JSON.stringify(m.verifyFrozenIntegrity(readFileSync('$F','utf8')))); });" 2>&1 | grep -v Warning
echo -n "2 audit: "; node --experimental-strip-types pipeline/physics-audit.mjs $F --course jee-physics --sim $SIM 2>&1 | grep -o '"summary": "[^"]*"'
echo -n "3 layout: "; node --experimental-strip-types pipeline/layoutGate.mjs $F 2>&1 | grep -o '"findings": \[\]' || echo LAYOUT-FAIL
echo -n "4 gi: "; node --experimental-strip-types pipeline/user-gates/gi-verify.js $F 2>&1 | tail -1
echo -n "5 cg: "; node --experimental-strip-types pipeline/user-gates/cg-verify.js $F 2>&1 | tail -1
echo -n "6 wo: "; node --experimental-strip-types pipeline/user-gates/wo-verify.js $F 2>&1 | tail -1
echo -n "7 param-stability: "; node --experimental-strip-types pipeline/user-gates/param-stability.mjs $F 2>&1 | grep -o '"problems": \[\]' || echo STAB-FAIL
echo -n "8 style: "; node --experimental-strip-types pipeline/user-gates/style-probe.mjs $F 2>&1 | tail -1
echo "9 reset-oracle:"; python3 tools/reset-oracle.py $F 2>&1 | tail -3
