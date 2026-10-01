#!/usr/bin/env python3
"""Assemble and install the AI-course Physics sheet into ONE sim, with the isolation guard.

Usage:
    python3 assemble_ai.py <sim.html> <workdir> [--apply] [--replace]

<workdir> holds the per-sim sources:
    meta.json        {"topic": "...", "kicker": "...", "title": "...", "slug": "..."}
    article.html     the <article> body: lede + 7 chapters, with {{EQn}} / {{Dn}} tokens
    persim.js        the PER-SIM block (TITLE/FILE are filled from meta.json; write
                     MINI, LIVE and SHOW only — see README.md)
    assets_build/art.json   from ../scripts/gen_assets.py

What it does (all-or-nothing; without --apply it only checks and writes <workdir>/built.html):
  1. fills the template (layer.ai.html) — every {{TOKEN}} must resolve;
  2. replaces the single `<!-- PHYSICS_SHEET -->` marker with
     `<!-- PHYSICS_SHEET: layer installed -->` + the layer;
  3. GUARD: the bytes before and after the marker are identical to the original, and
     removing the layer gives back the original file exactly;
  4. static checks: no unfilled tokens, no U+20D7, exactly one </script> in the layer,
     every svg id unique in the whole page, layer script parses (node --check),
     #phys-live / #phys-num / #phys-mini / #phys-worked present, every data-show key
     is also written in SHOW, file < 16 MB.
--replace re-installs over an existing layer (the old layer is cut out first, and the
guard then compares against that layer-free file).
"""
import io, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
MARK = '<!-- PHYSICS_SHEET -->'
INSTALLED = '<!-- PHYSICS_SHEET: layer installed -->'
END = '<!-- /THE PHYSICS LAYER -->'


def fail(msg):
    raise SystemExit('FAIL: ' + msg)


def strip_layer(t):
    i = t.find(INSTALLED)
    if i < 0:
        return t
    j = t.find(END, i)
    if j < 0:
        fail('installed layer has no end marker')
    return t[:i] + MARK + t[j + len(END):]


def build_layer(wd):
    meta = json.load(io.open(os.path.join(wd, 'meta.json'), encoding='utf-8'))
    art = json.load(io.open(os.path.join(wd, 'assets_build', 'art.json'), encoding='utf-8'))
    article = io.open(os.path.join(wd, 'article.html'), encoding='utf-8').read()
    persim = io.open(os.path.join(wd, 'persim.js'), encoding='utf-8').read()
    tpl = io.open(os.path.join(HERE, 'layer.ai.html'), encoding='utf-8').read()

    def fill_art(m):
        k = m.group(1)
        if k not in art:
            fail(f'article token {{{{{k}}}}} has no asset in art.json')
        return art[k]
    article = re.sub(r'\{\{((?:EQ|D)\d+)\}\}', fill_art, article)

    assert tpl.count('/* ===== PER-SIM =====') == 1 and tpl.count('/* ===== END PER-SIM ===== */') == 1
    a, b = tpl.index('/* ===== PER-SIM ====='), tpl.index('/* ===== END PER-SIM ===== */')
    head_comment = tpl[a:tpl.index('*/', a) + 2]
    js_js = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
    persim = (head_comment + '\n  var TITLE=\'' + js_js(meta['title']) + "', FILE='the-physics-"
              + meta['slug'] + ".html';\n" + persim.rstrip() + '\n  ')
    tpl = tpl[:a] + persim + tpl[b:]
    esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;').replace('"', '&quot;')
    tpl = (tpl.replace('{{TOPIC}}', esc(meta['topic']))
              .replace('{{KICKER}}', esc(meta['kicker']))
              .replace('{{ARTICLE}}', article))
    return tpl.rstrip('\n')   # must end exactly at END so the guard's strip is exact


def checks(layer, built):
    left = re.findall(r'\{\{[A-Z0-9_]+\}\}|%%[A-Z0-9_]+%%', layer)
    if left:
        fail(f'unfilled tokens: {sorted(set(left))}')
    if '⃗' in layer:
        fail('U+20D7 combining arrow in the layer (renders as tofu — pitfalls #2)')
    if layer.count('</script>') != 1:
        fail(f'{layer.count("</script>")} </script> in the layer — one only (pitfalls #8)')
    ids = re.findall(r'\bid="([^"]+)"', built)
    lay_ids = re.findall(r'\bid="([^"]+)"', layer)
    clash = sorted({i for i in lay_ids if ids.count(i) > 1})
    if clash:
        fail(f'duplicate ids after install (use each {{EQn}}/{{Dn}} token once): {clash[:12]}')
    for need in ('id="phys-live"', 'id="phys-num"', 'id="phys-mini"', 'id="phys-worked"'):
        if need not in layer:
            fail(f'missing {need} (the live chapter is required — content.md)')
    ch7 = layer.split('<div class="no">07</div>')[-1] if '<div class="no">07</div>' in layer else ''
    nq = len(re.findall(r'<details class="phys-q"', ch7))
    if nq != 3:
        fail(f'ch 07 must be the self-test: exactly 3 <details class="phys-q"> questions (found {nq}) — content.md')
    shows = set(re.findall(r'data-show="([^"]+)"', layer))
    js = layer[layer.index('<script>') + 8: layer.index('</script>')]
    for k in shows:
        if not re.search(r'[{,\s]' + re.escape(k) + r'\s*:', js):
            fail(f'data-show="{k}" has no entry in SHOW')
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(js)
    r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
    os.unlink(f.name)
    if r.returncode:
        fail('layer JS does not parse:\n' + r.stderr[-1500:])
    if len(built.encode('utf-8')) > 16 * 1024 * 1024:
        fail('file over 16 MB')
    return len(shows)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        raise SystemExit(__doc__)
    sim, wd = args
    apply, replace = '--apply' in sys.argv, '--replace' in sys.argv
    orig_disk = io.open(sim, encoding='utf-8', newline='').read()
    if INSTALLED in orig_disk and not replace:
        fail('layer already installed — pass --replace to re-install')
    orig = strip_layer(orig_disk)
    if orig.count(MARK) != 1:
        fail(f'{orig.count(MARK)} PHYSICS_SHEET markers (need exactly 1)')
    layer = build_layer(wd)
    i = orig.index(MARK)
    before, after = orig[:i], orig[i + len(MARK):]
    built = before + INSTALLED + '\n' + layer + after
    # GUARD — nothing outside the layer changes
    assert built.startswith(before) and built.endswith(after)
    if strip_layer(built) != orig:
        fail('guard: removing the layer does not give back the original')
    n = checks(layer, built)
    io.open(os.path.join(wd, 'built.html'), 'w', encoding='utf-8', newline='').write(built)
    print(f'OK  layer {len(layer)//1024} KB · {n} See-it keys · guard byte-identical outside the layer')
    if apply:
        if io.open(sim, encoding='utf-8', newline='').read() != orig_disk:
            fail('sim changed on disk while assembling — re-run')
        tmp = sim + '.phystmp'
        io.open(tmp, 'w', encoding='utf-8', newline='').write(built)
        os.replace(tmp, sim)
        print('INSTALLED', sim)


if __name__ == '__main__':
    main()
