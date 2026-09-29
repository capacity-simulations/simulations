#!/usr/bin/env python3
"""Count green gates (of 9) in a gates.sh output file. usage: python3 gate-count.py <gates-output.txt>"""
import re, sys
try: t = open(sys.argv[1], encoding='utf8').read()
except Exception: print('n/a'); sys.exit(0)
g = 0
g += '1 frozen: []' in t
m = re.search(r'"(\d+)/(\d+) kernel checks \+ (\d+)/(\d+) invariants', t)
na = ('2 audit:' in t and 'kernel checks' not in t)  # no audit-spec entry (lean th-* entries)
g += bool(m and m.group(1) == m.group(2) and m.group(3) == m.group(4))
g += '"findings": []' in t
g += bool(re.search(r'^4 gi: PASS', t, re.M))
g += 'cg: PASS' in t
g += 'wo: PASS' in t
g += '"problems": []' in t
g += '8 style: PASS' in t
g += t.split('9 reset-oracle:')[-1].count('PASS') >= 3 if '9 reset-oracle:' in t else 0
print(f'{g}/8 (audit N/A)' if na else f'{g}/9')
