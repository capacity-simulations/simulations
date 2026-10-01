#!/usr/bin/env python3
"""Add the "Start here" orientation block + mode-aware auto-open to a testprep sim
that already carries The Physics layer.

    python3 patch_orientation.py <workdir> <sim.html>

<workdir> must contain: orient.html, orient.css, orient.js, assets_build/art.json
(with a "d0" key). See references/content.md.

SAFETY CONTRACT — read this before changing anything here:

  1. ALL-ASSERT-THEN-WRITE. Every anchor is located and checked before one byte is
     written. A drifted file aborts with the sim untouched. Never relax an assert
     to "make it work" — a failing anchor means the sim is not the shape this
     patch was written for, and forcing it is how files get broken.

  2. EVERY INSERTION IS FENCED between ORIENT:BEGIN/ORIENT:END sentinels, so
     unpatch_orientation.py can remove exactly what was added and nothing else.
     This matters because other sessions edit these files concurrently: a
     restore-from-backup rollback would silently revert their work.

  3. ADDITIVE ONLY. The sim's own physics, inquiry deck, controls guide, welcome
     overlay and canvas code are never touched. The single relocation is
     #phys-live, which moves within the sheet the layer itself owns.
"""
import io, json, os, sys

if len(sys.argv) != 3:
    sys.exit(__doc__)
work = os.path.abspath(sys.argv[1])
sim = os.path.expanduser(sys.argv[2])

B, E = '<!-- ORIENT:BEGIN %s -->', '<!-- ORIENT:END %s -->'
BC, EC = '/* ORIENT:BEGIN %s */', '/* ORIENT:END %s */'


def rd(p):
    return io.open(p, encoding='utf-8').read()


s = rd(sim)
orig = len(s)
edits = []


def sub1(old, new, label):
    global s
    n = s.count(old)
    assert n == 1, f'{label}: anchor found {n}x, expected exactly 1 — ABORTED, file untouched'
    s = s.replace(old, new)
    edits.append(label)


# ---- preconditions -----------------------------------------------------------
assert 'id="phys-art"' in s, 'no Physics layer in this sim — install it first (see SKILL.md step 1)'
assert '<section id="phys-orient"' not in s, 'already patched (phys-orient present)'
assert 'id="phys-full"' not in s, 'already patched (phys-full present)'
assert 'ORIENT:BEGIN' not in s, 'already patched (sentinels present)'
assert s.count('.welcome-mode') >= 1, 'no welcome-mode buttons — nothing to hook the auto-open to'
for f in ('orient.html', 'orient.css', 'orient.js'):
    assert os.path.exists(os.path.join(work, f)), f'{work}/{f} missing'

# ---- 1 · CSS -----------------------------------------------------------------
sub1('@media(prefers-reduced-motion:reduce){#phys-toast{transition:none;}}',
     '@media(prefers-reduced-motion:reduce){#phys-toast{transition:none;}}\n'
     + BC % 'css' + '\n' + rd(os.path.join(work, 'orient.css')).rstrip('\n') + '\n' + EC % 'css',
     'css')

# ---- 2 · lift #phys-live out of its chapter ----------------------------------
# It is moved, not copied: refreshLive() addresses every element by id, so the
# panel keeps working wherever it sits, and two copies would duplicate ids.
i = s.index('<div class="live-panel" id="phys-live">')
j = s.index('</div>', s.index('live-hint', i)) + len('</div>')
live = s[i:j]
assert live.count('id="phys-live"') == 1, 'live panel slice: expected exactly one #phys-live'
assert live.count('class="mv"') >= 1 and live.rstrip().endswith('</div>'), 'live panel slice: bad shape'
# Leave the original indentation in place and put the marker where the panel
# was: unpatch then swaps marker->panel and the bytes match exactly.
lo = s.rindex('\n', 0, i) + 1
indent = s[lo:i]
assert indent.strip() == '', 'live panel is not alone on its line — ABORTED'
s = s[:i] + (B % 'live-was-here') + s[j:]
edits.append('live panel lifted out of its chapter')

# ---- 3 · the orientation section, above the lede -----------------------------
orient = rd(os.path.join(work, 'orient.html')).rstrip('\n')
art = json.load(io.open(os.path.join(work, 'assets_build', 'art.json'), encoding='utf-8'))
assert 'd0' in art, 'assets_build/art.json has no "d0" apparatus map'
assert '{{D0}}' in orient and '{{LIVE}}' in orient, 'orient.html must carry {{D0}} and {{LIVE}}'
orient = orient.replace('{{D0}}', art['d0']).replace('{{LIVE}}', live)
assert '{{' not in orient, 'unfilled token left in orient.html'

sub1('<article class="phys-art" id="phys-art">\n\n        <p class="lede">',
     '<article class="phys-art" id="phys-art" data-brief="0">\n\n'
     + B % 'section' + '\n' + orient + '\n' + E % 'section' + '\n'
     + B % 'collapse-open' + '''
        <button id="phys-full-toggle" class="shell-btn" aria-expanded="true" aria-controls="phys-full">
          <span class="pf-caret">&#9656;</span><span class="pf-label">Hide the full revision sheet</span>
        </button>
        <div id="phys-full">
'''.rstrip('\n') + '\n' + E % 'collapse-open' + '\n        <p class="lede">',
     'orientation section + collapse opening')

# ---- 4 · close the collapse wrapper just before </article> -------------------
sub1('        </div></div>\n\n      </article>',
     '        </div></div>\n\n'
     + B % 'collapse-close' + '\n        </div>\n' + E % 'collapse-close' + '\n      </article>',
     'collapse closing')

# ---- 5 · JS ------------------------------------------------------------------
JS_ANCHOR = "  /* ---- Download: the sheet IS the article"
sub1(JS_ANCHOR,
     '  ' + BC % 'js' + '\n' + rd(os.path.join(work, 'orient.js')).rstrip('\n')
     + '\n  ' + EC % 'js' + '\n' + JS_ANCHOR,
     'js')

# ---- 6 · the download clone must always be the WHOLE sheet -------------------
# The clone inherits on-screen state. Saved from a brief (guided-inquiry) open
# that would mean #phys-full[hidden] and data-brief="1" — a downloaded sheet with
# its chapters invisible and the worked run suppressed.
sub1("""    var art=$('phys-art').cloneNode(true);
    Array.prototype.forEach.call(art.querySelectorAll('.seesim'),function(b){b.remove();});""",
     """    var art=$('phys-art').cloneNode(true);
    Array.prototype.forEach.call(art.querySelectorAll('.seesim'),function(b){b.remove();});
    """ + BC % 'download' + """
    art.removeAttribute('data-brief');
    var pfClone=art.querySelector('#phys-full'); if(pfClone) pfClone.removeAttribute('hidden');
    var poClone=art.querySelector('#phys-orient'); if(poClone) poClone.setAttribute('data-brief','0');
    var prClone=art.querySelector('#phys-run'); if(prClone) prClone.remove();
    """ + EC % 'download',
     'download clone: always the full sheet')

io.open(sim, 'w', encoding='utf-8').write(s)
print(f'patched {os.path.basename(sim)}: {orig:,} -> {len(s):,} chars')
for e in edits:
    print('  ok  ' + e)
print('\nrollback:  python3 unpatch_orientation.py ' + sim)
