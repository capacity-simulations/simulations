#!/usr/bin/env python3
"""READ-ONLY recon. Run this FIRST, on every sim, before touching anything.

    python3 preflight.py <sim.html> [--emit <workdir>]

It answers the four questions that decide whether this skill can be applied
safely, and it drafts the per-sim config so you are not hand-copying ids:

  1. Is the Physics layer installed, and is the sim un-patched?
  2. Does every anchor the patcher needs occur EXACTLY once?
  3. What does this sim's reveal function unlock — i.e. what would the existing
     "See it in the sim" buttons spoil, and which DOM nodes prove it?
  4. What are the sliders, the controls, and the play gate?

With --emit it writes <workdir>/orient.draft.json. Read it, correct it, save it
as orient.json. It is a draft: the spoiler list in particular is a guess from
the sheet's own numbers and MUST be reviewed against the inquiry cards.

Exit codes: 0 ready to patch · 2 blocked (reason printed) · 3 already patched.
"""
import io, json, os, re, sys

if len(sys.argv) < 2:
    sys.exit(__doc__)
sim = os.path.expanduser(sys.argv[1])
emit = None
if '--emit' in sys.argv:
    emit = os.path.abspath(sys.argv[sys.argv.index('--emit') + 1])
s = io.open(sim, encoding='utf-8').read()
name = os.path.basename(sim)
problems, notes = [], []


def hdr(t):
    print(f'\n=== {t} ' + '=' * max(0, 58 - len(t)))


print(f'preflight: {name}  ({len(s):,} chars)')

# ---- 1 · state ---------------------------------------------------------------
hdr('1 · state')
has_layer = 'id="phys-art"' in s and 'phys-backdrop' in s
raw_marker = s.count('<!-- PHYSICS_SHEET -->')
patched = '<section id="phys-orient"' in s or 'ORIENT:BEGIN' in s
print(f'  Physics layer installed : {has_layer}')
print(f'  raw <!-- PHYSICS_SHEET -->: {raw_marker}')
print(f'  orientation already added: {patched}')
if patched:
    print('\nALREADY PATCHED — nothing to do. To redo it, unpatch first.')
    sys.exit(3)
if not has_layer:
    if raw_marker == 1:
        problems.append('No Physics layer, but the injection marker is present: install the '
                        'sheet first (SKILL.md step 1), then re-run preflight.')
    else:
        problems.append('No Physics layer and no injection marker — this sim is out of scope.')

# ---- 2 · the patcher's anchors ----------------------------------------------
hdr('2 · anchors (each must be exactly 1)')
ANCHORS = {
 'css hook': '@media(prefers-reduced-motion:reduce){#phys-toast{transition:none;}}',
 'article + lede': '<article class="phys-art" id="phys-art">\n\n        <p class="lede">',
 'last chapter close': '        </div></div>\n\n      </article>',
 'js hook': '  /* ---- Download: the sheet IS the article',
 'download clone': "    var art=$('phys-art').cloneNode(true);",
 'live panel': '<div class="live-panel" id="phys-live">',
}
for label, a in ANCHORS.items():
    n = s.count(a)
    flag = 'ok ' if n == 1 else 'BAD'
    print(f'  [{flag}] {label:22s} {n}')
    if n != 1 and has_layer:
        problems.append(f'anchor "{label}" occurs {n}x (need 1) — the patcher would abort')

# ---- 3 · the spoiler audit (the part that actually matters) ------------------
hdr('3 · spoiler audit — what the scene hook unlocks')
reveal = None
for pat in (r'window\.__freeExplore\s*=\s*(?:\(\)\s*=>|function)',
            r'function\s+freeExplore\s*\('):
    m = re.search(pat, s)
    if m:
        i = s.index('{', m.start())
        d = 0
        for j in range(i, len(s)):
            if s[j] == '{':
                d += 1
            elif s[j] == '}':
                d -= 1
                if d == 0:
                    reveal = s[m.start():j + 1]
                    break
        break
if reveal:
    print('  reveal function found:')
    for line in reveal.strip().split('\n')[:14]:
        print('     ' + line.strip()[:96])
    flags = sorted(set(re.findall(r'\b(?:state\.)?(show[A-Za-z]+|reveal[A-Za-z]*|conserved)\s*=', reveal)))
    print(f'\n  flags it sets: {flags or "(none spotted — read it yourself)"}')
    print('  -> Every ".seesim" button routes through this. In guided inquiry the')
    print('     orientation pop-up must therefore (a) keep the chapters collapsed and')
    print('     (b) give "Run these values" its OWN slider-only path. Never call')
    print('     window.__physicsHooks.scene() from the orientation block.')
    if re.search(r"\$\(\s*'(\w[\w-]*)'\s*\)\s*\.value\s*=", reveal) or '.value=' in reveal:
        notes.append('the reveal function also RESETS sliders — another reason Run must not use it')
else:
    notes.append('no freeExplore found; re-read the scene hook by hand before writing Run')
    print('  (none found — inspect window.__physicsHooks.scene manually)')

print('\n  candidate DOM proxies for the staging assertions')
print('  (pick the ones that are display:none before the deck unlocks them):')
proxies = sorted(set(re.findall(r"(?:showRow|setRowVisible)\(\s*'([\w-]+)'", s)
                     + re.findall(r"\$\(\s*'(panel-[\w-]+)'\s*\)", s)
                     + re.findall(r'id="(row-[\w-]+)"', s)))
print('     ' + (', '.join(proxies[:18]) if proxies else '(none found — inspect by hand)'))

# ---- 4 · controls, sliders, play gate ---------------------------------------
hdr('4 · controls, sliders, play gate')
sliders = []
for t in re.findall(r'<input[^>]*type="range"[^>]*>', s):
    g = lambda k: (re.search(k + r'="([^"]*)"', t) or [None, None])[1]
    if (g('id') or '').startswith('phys-'):
        continue
    sliders.append(dict(id=g('id'), min=g('min'), max=g('max'), step=g('step'), value=g('value')))
for sl in sliders:
    print(f"  slider  {sl['id']:12s} {sl['min']}..{sl['max']}  step {sl['step']}  default {sl['value']}")
if len(sliders) != 2:
    notes.append(f'{len(sliders)} sim sliders (the three done sims each have 2) — adapt the '
                 'live panel and Run accordingly')

cg = re.findall(r"\{\s*sel:'([^']+)'[^}]*?title:'([^']*)'[^}]*?text:'([^']*)'", s)
print('\n  controls-guide steps — USE THIS WORDING in the controls table so the two')
print('  can never drift apart:')
for sel, title, text in cg:
    print(f'     {sel:18s} {title:22s} {text[:74]}')

pl_false = 'playLocked = false' in s or 'playLocked=false' in s
pl_true = bool(re.search(r'setPlayLocked\(\s*true\s*\)', s))
print(f'\n  playLocked declared false : {pl_false}')
print(f'  setPlayLocked(true) called: {pl_true}')
if pl_true:
    notes.append('PLAY IS GATED in this sim: setPlaying() will swallow Run while locked. '
                 'Either drop the Run button in inquiry mode or explain the gate in its place.')

wo = s.count('.welcome-mode')
once = 'WELCOME_ONCE = false' in s
print(f'\n  .welcome-mode occurrences : {wo}')
print(f'  WELCOME_ONCE = false      : {once}')
if not once:
    notes.append('WELCOME_ONCE is not false — returning students may skip the overlay entirely, '
                 'so the mode-click hook would never fire for them. Check the boot path.')
cards = len(re.findall(r'class="inq-step', s))
print(f'  inquiry cards             : {cards}   <- read every one before writing objectives')

# ---- verdict -----------------------------------------------------------------
hdr('verdict')
for n in notes:
    print('  NOTE     ' + n)
for p in problems:
    print('  BLOCKED  ' + p)
if problems:
    print('\nNOT READY. Fix the above, then re-run preflight.')
    sys.exit(2)
print('  ready to patch.')

if emit:
    os.makedirs(emit, exist_ok=True)
    nums = sorted({m for m in re.findall(r'\b\d+\.\d{2,4}\b', s)
                   if 'phys-art' in s}, key=len, reverse=True)[:0]
    draft = {
        '_README': 'DRAFT from preflight. Review every field. The spoilers list especially: '
                   'it must name the numbers and verdicts the inquiry cards ask students to '
                   'predict, plus any phrase in the sheet kicker.',
        'miniSliders': [[f'phys-{sl["id"]}', sl['id'], sl['value']] for sl in sliders],
        'spoilers': [],
        'stagingHidden': [p for p in proxies if p.startswith(('panel-', 'row-'))][:4],
        'stagingLabels': [],
        'ctlRows': len(cg) if cg else 6,
        'runPlays': True,
    }
    p = os.path.join(emit, 'orient.draft.json')
    io.open(p, 'w', encoding='utf-8').write(json.dumps(draft, indent=2) + '\n')
    print(f'\n  draft config -> {p}')
    print('  (fix miniSliders values to TEST values, fill spoilers, save as orient.json)')
