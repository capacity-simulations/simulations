#!/usr/bin/env python3
"""Remove the orientation block from a sim, leaving everything else exactly as it is.

    python3 unpatch_orientation.py <sim.html>

This is a TRUE INVERSE, not a restore-from-backup. It deletes only the regions
fenced by ORIENT:BEGIN/ORIENT:END and puts #phys-live back where it came from.
Any edits anyone else made to the file since patching — including edits inside
the Physics sheet — survive untouched. That matters: these sims are edited by
more than one session at a time, and rolling back by overwriting from a snapshot
would silently destroy someone else's work.

Exit codes: 0 removed · 2 nothing to remove · 1 refused (unrecognised shape).
"""
import io, os, re, sys

if len(sys.argv) != 2:
    sys.exit(__doc__)
sim = os.path.expanduser(sys.argv[1])
s = io.open(sim, encoding='utf-8').read()
orig = len(s)

if 'ORIENT:BEGIN' not in s:
    if '<section id="phys-orient"' in s:
        sys.exit('REFUSED: this file carries an orientation block but no sentinels — it was\n'
                 'patched before sentinels existed. Roll it back with git, or with the\n'
                 'pre-patch snapshot recorded in the run log. Nothing changed.')
    print('nothing to remove (no orientation block found)')
    sys.exit(2)

removed = []


def cut(label, html=True):
    """Delete one fenced region, sentinels included."""
    global s
    b = ('<!-- ORIENT:BEGIN %s -->' if html else '/* ORIENT:BEGIN %s */') % label
    e = ('<!-- ORIENT:END %s -->' if html else '/* ORIENT:END %s */') % label
    nb, ne = s.count(b), s.count(e)
    if nb == 0 and ne == 0:
        return
    assert nb == 1 and ne == 1, f'{label}: sentinels {nb}/{ne}, expected 1/1 — ABORTED'
    i, j = s.index(b), s.index(e) + len(e)
    assert i < j, f'{label}: sentinels out of order — ABORTED'
    # Expand to whole lines when the sentinels sit alone on theirs, so no orphan
    # indentation or blank line survives. Anything else and we cut exactly the
    # fenced span.
    ls = s.rindex('\n', 0, i) + 1
    if s[ls:i].strip() == '':
        i = ls
    le = s.find('\n', j)
    if le != -1 and s[j:le].strip() == '':
        j = le + 1
    s = s[:i] + s[j:]
    removed.append(label)


# 1 · put the live panel back where the patch took it from ---------------------
mark = '<!-- ORIENT:BEGIN live-was-here -->'
sec_b, sec_e = '<!-- ORIENT:BEGIN section -->', '<!-- ORIENT:END section -->'
if mark in s:
    assert s.count(mark) == 1, 'live-was-here marker is not unique — ABORTED'
    assert s.count(sec_b) == 1 and s.count(sec_e) == 1, 'orientation section sentinels missing — ABORTED'
    section = s[s.index(sec_b):s.index(sec_e) + len(sec_e)]
    m = re.search(r'<div class="live-panel" id="phys-live">.*?<p class="live-hint">.*?</p>\s*</div>',
                  section, re.S)
    assert m, 'could not find #phys-live inside the orientation section — ABORTED'
    live = m.group(0)
    # strip it from the section first, so the section cut below does not carry it
    s = s.replace(section, section.replace(live, ''), 1)
    s = s.replace(mark, live, 1)     # the marker sits at the original indent
    removed.append('live panel returned to its chapter')

# 2 · the fenced regions --------------------------------------------------------
for label in ('section', 'collapse-open', 'collapse-close'):
    cut(label)
for label in ('css', 'js', 'download'):
    cut(label, html=False)

# 3 · the two attributes the patch added ---------------------------------------
if '<article class="phys-art" id="phys-art" data-brief="0">' in s:
    s = s.replace('<article class="phys-art" id="phys-art" data-brief="0">',
                  '<article class="phys-art" id="phys-art">', 1)
    removed.append('data-brief attribute')

# 4 · prove nothing of ours is left --------------------------------------------
for leftover in ('ORIENT:BEGIN', 'ORIENT:END', 'phys-orient', 'phys-full', 'phys-run'):
    assert leftover not in s, f'leftover after unpatch: {leftover} — ABORTED, file untouched'
assert s.count('id="phys-live"') == 1, 'live panel count wrong after unpatch — ABORTED'

io.open(sim, 'w', encoding='utf-8').write(s)
print(f'unpatched {os.path.basename(sim)}: {orig:,} -> {len(s):,} chars')
for r in removed:
    print('  removed  ' + r)
