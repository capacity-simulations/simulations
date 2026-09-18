"""All-or-nothing patching for production sim files.

Usage:
    from patchlib import Patcher, fill_tokens, inject_layer

    p = Patcher('work/sim.html')
    p.rep(OLD_BUTTON, NEW_BUTTON, 'button label')
    p.rep(OLD_LISTENER, NEW_LISTENER, 'formal listener')
    p.insert_before('})();\\n</anchor-tail>', HOOK_LINE, 'scene hook')  # or rep()
    p.apply()          # asserts every anchor occurs exactly once, THEN writes once

    layer = fill_tokens(open('layer.html').read(), 'art.json')
    inject_layer('work/sim.html', layer)

Design rule (pitfalls #9): a failed anchor must leave the file byte-identical to
before the run. Patcher therefore queues edits and only writes after every anchor
has matched exactly once against the evolving text.
"""
import io, json


class PatchError(AssertionError):
    pass


class Patcher:
    def __init__(self, path):
        self.path = path
        self.ops = []          # (old, new, label)

    def rep(self, old, new, label):
        self.ops.append((old, new, label))
        return self

    def insert_before(self, anchor, text, label):
        """Insert text immediately before an exactly-once anchor."""
        self.ops.append((anchor, text + anchor, label))
        return self

    def apply(self, verbose=True):
        s = io.open(self.path, encoding='utf-8').read()
        for old, new, label in self.ops:
            n = s.count(old)
            if n != 1:
                raise PatchError(
                    f'anchor "{label}" matched {n} times (need exactly 1); '
                    f'nothing was written — widen or fix the anchor')
            s = s.replace(old, new)
            if verbose:
                print('ok:', label)
        io.open(self.path, 'w', encoding='utf-8').write(s)
        if verbose:
            print(f'wrote {self.path} ({len(s)} bytes, {len(self.ops)} patches)')
        return s


def fill_tokens(layer_html, art_json_path):
    """Replace {{EQ1}}..{{DN}} tokens with SVG strings from gen_assets output."""
    art = json.load(open(art_json_path))
    for k, v in art.items():
        tok = '{{' + k.upper() + '}}'
        if tok not in layer_html:
            raise PatchError(f'token {tok} not found in layer template')
        layer_html = layer_html.replace(tok, v)
    if '{{' in layer_html:
        i = layer_html.index('{{')
        raise PatchError('unfilled token near: ' + layer_html[i:i+40])
    return layer_html


def inject_layer(path, layer_html):
    """Append the layer immediately before the file's single </body> (pitfalls #10)."""
    s = io.open(path, encoding='utf-8').read()
    n = s.count('</body>')
    if n != 1:
        raise PatchError(f'expected exactly one </body> before injection, found {n}')
    s = s.replace('</body>', layer_html + '\n</body>')
    io.open(path, 'w', encoding='utf-8').write(s)
    print(f'layer injected ({len(layer_html)} chars) -> {path} ({len(s)} bytes)')
    return s
