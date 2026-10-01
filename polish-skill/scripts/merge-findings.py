#!/usr/bin/env python3
"""Merge the three critics' findings files into findings.json (the input polish-prompts.mjs --fixer reads).
usage: python3 merge-findings.py <sims-eval-law/<id>.polish>
Reads findings-physics.txt, findings-pedagogy.txt, findings-visuals.txt; writes findings.json
{physics, pedagogy, visuals} and prints a severity count per critic. Fails if a file is missing or empty."""
import json, os, re, sys
d = sys.argv[1]
out, bad = {}, []
for role in ('physics', 'pedagogy', 'visuals'):
    p = os.path.join(d, f'findings-{role}.txt')
    if not os.path.exists(p) or not open(p, encoding='utf8').read().strip():
        bad.append(role); continue
    t = open(p, encoding='utf8').read().strip()
    out[role] = t
    sev = {s: len(re.findall(rf'\[SEVERITY:\s*{s}\]', t, re.I)) for s in ('critical', 'major', 'minor')}
    print(f"{role:9s} " + ('NO FINDINGS' if t == 'NO FINDINGS' else ' '.join(f'{k} {v}' for k, v in sev.items())))
if bad:
    sys.exit(f'MISSING/EMPTY findings for: {", ".join(bad)} (re-run that critic once)')
json.dump(out, open(os.path.join(d, 'findings.json'), 'w', encoding='utf8'), indent=2, ensure_ascii=False)
print('wrote', os.path.join(d, 'findings.json'))
