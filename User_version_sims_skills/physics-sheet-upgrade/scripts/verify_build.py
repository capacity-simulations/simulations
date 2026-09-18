#!/usr/bin/env python3
"""Verify an upgraded sim before delivery.

Usage:
    python3 verify_build.py sim.html                       # layer + patch checks
    python3 verify_build.py sim.html --original orig.html  # + isolation proof

--original adds the strongest production-safety check: with the layer stripped,
the built file must differ from the pristine original at ONLY the four sanctioned
patch sites (button label, listener body, scene hook, font link). Any other
changed line — whitespace included — fails the build.

Checks (each maps to an entry in references/pitfalls.md):
  1. layer marker present exactly once, injected directly before the final </body>
  2. no unfilled {{TOKEN}} / %%TOKEN%% placeholders in the layer
  3. structural patches applied: "⚛︎ The Physics" button; old hide-formal toggle
     body gone; window.__physicsHooks present; STIX Two Text fonts link present
  4. layer JS parses (node --check)
  5. no U+20D7 combining arrows anywhere in the layer (scoped: sim's own prose
     outside the layer may legitimately contain them)
  6. exactly one real </script> inside the layer (its own closer) — any other
     means an unescaped closer inside a JS string
  7. svg ids inside the layer are unique (poppler namespacing survived)
  8. live-worked-example wiring present (phys-worked rebuilt in refreshLive;
     no reset-to-defaults replay)
  9. file under 16 MB
 10. (--original) isolation: outside the layer and the four patch sites, the
     built file is line-identical to the original (pitfalls #9, #10)
Exit code 0 only if every check passes.
"""
import difflib, io, re, subprocess, sys, tempfile, os

PATCH_SIGNATURES = [
    ('patch 1: button label', 'toggle-formal'),
    ('patch 2: listener -> __openPhysics', '__openPhysics'),
    ('patch 3: scene hook', '__physicsHooks'),
    ('patch 4: STIX font link', 'fonts.googleapis.com/css2?family=STIX+Two+Text'),
]


def isolation_check(built, original, span):
    """Every diff block between original and (built minus layer) must match
    exactly one sanctioned patch signature, and all four must appear."""
    # remove the layer plus the single newlines the injector added around it
    stripped = built[:span[0]].rstrip('\n') + '\n' + built[span[1]:].lstrip('\n')
    a = original.splitlines()
    b = stripped.splitlines()
    seen, problems = set(), []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if tag == 'equal':
            continue
        changed = '\n'.join(b[j1:j2]) or '\n'.join(a[i1:i2])
        hits = [name for name, sig in PATCH_SIGNATURES if sig in changed]
        if len(hits) == 1:
            seen.add(hits[0])
        else:
            problems.append(f'lines {i1+1}-{i2} of original changed outside the four '
                            f'patch sites: {changed[:120]!r}')
    for name, _ in PATCH_SIGNATURES:
        if name not in seen:
            problems.append(f'sanctioned site missing from diff: {name}')
    return problems

MARKER = 'THE PHYSICS LAYER'


def find_layer(s):
    if s.count(MARKER) != 1:
        return None, f'layer marker "{MARKER}" found {s.count(MARKER)} times (need 1)'
    i = s.index(MARKER)
    start = s.rindex('<!--', 0, i)
    end = s.rindex('</script>') + len('</script>')
    if end <= start:
        return None, 'layer closing </script> not found after marker'
    return (start, end), None


def main():
    path = sys.argv[1]
    original_path = None
    if '--original' in sys.argv:
        original_path = sys.argv[sys.argv.index('--original') + 1]
    s = io.open(path, encoding='utf-8').read()
    fails = []

    span, err = find_layer(s)
    if err:
        print('FAIL layer-locate:', err); sys.exit(1)
    layer = s[span[0]:span[1]]
    tail = s[span[1]:].strip()
    if tail != '</body>\n</html>'.strip() and not re.fullmatch(r'</body>\s*</html>\s*', s[span[1]:]):
        fails.append('layer is not immediately before the final </body> (pitfalls #10)')

    if '{{' in layer or '%%' in layer:
        fails.append('unfilled template token in layer')

    if '⚛︎ The Physics' not in s:
        fails.append('patch 1 missing: "⚛︎ The Physics" button label')
    if "const hidden=root.classList.toggle('hide-formal')" in s:
        fails.append('patch 2 missing: old formal-toggle listener body still present')
    if 'window.__physicsHooks' not in s:
        fails.append('patch 3 missing: window.__physicsHooks scene hook')
    if 'fonts.googleapis.com/css2?family=STIX+Two+Text' not in s:
        fails.append('patch 4 missing: STIX Two Text fonts link')

    # extract layer JS and parse it
    a = layer.rindex("'use strict';")
    a = layer.rindex('<script>', 0, a) + len('<script>')
    b = layer.index('</script>', a)
    js = layer[a:b]
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
        f.write(js); tmp = f.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
    os.unlink(tmp)
    if r.returncode != 0:
        fails.append('layer JS fails node --check:\n' + r.stderr[:800])

    if '\u20d7' in layer:
        fails.append('U+20D7 combining arrow inside layer (pitfalls #2)')

    n_closers = layer.count('</scr' + 'ipt>')
    if n_closers != 1:
        fails.append(f'{n_closers} real </scr''ipt> in layer, expected 1 — '
                     'unescaped closer inside a JS string? (pitfalls #8)')

    if '</bo'+'dy>' in layer:
        fails.append('literal </bo''dy> inside the layer (pitfalls #13) — live-server-style '
                     'injectors splice their reload script at every occurrence, corrupting the '
                     'layer JS; write <\\/body> in JS strings and avoid it in comments')

    layer_no_comments = re.sub(r'<!--.*?-->', '', layer, flags=re.S)
    ids = re.findall(r'\bid="([^"]+)"', layer_no_comments)
    dupes = sorted({i for i in ids if ids.count(i) > 1})
    if dupes:
        fails.append('duplicate ids in layer (svg namespacing broken? pitfalls #3): '
                     + ', '.join(dupes[:8]))

    if 'phys-worked' in layer:
        if "\\u2014 your settings" not in js and 'your settings' not in js:
            fails.append('phys-worked present but not rebuilt from live values (pitfalls #6)')
    if 'reset?0.5' in js or 's.reset?' in js:
        fails.append('replay resets to defaults instead of live values (pitfalls #6)')

    if len(s.encode('utf-8')) > 16 * 1024 * 1024:
        fails.append('file exceeds the 16 MB hosted-page cap')

    if original_path:
        orig = io.open(original_path, encoding='utf-8').read()
        for prob in isolation_check(s, orig, span):
            fails.append('isolation: ' + prob)
        if not any(f.startswith('isolation') for f in fails):
            print('isolation: built file differs from original at exactly the four sanctioned sites')

    if fails:
        print(f'FAILED {len(fails)} check(s):')
        for f_ in fails:
            print(' -', f_)
        sys.exit(1)
    print(f'ALL CHECKS PASSED  ({path}, {len(s)} chars, layer {len(layer)} chars)')


if __name__ == '__main__':
    main()
