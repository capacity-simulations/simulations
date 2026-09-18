# Pitfalls ledger

Every entry below is a bug that actually shipped (or nearly shipped) while reaching
the accepted design. The machinery in `assets/layer.reference.html` and the scripts
already embody the preventions — this file exists so you don't "simplify" one away.

## 1. External stylesheets are blocked on hosted pages → KaTeX renders as garbage
Hosted artifact pages allow external **scripts** from a short CDN allowlist but
external **stylesheets only from fonts.googleapis.com**. The sim's KaTeX `<link>`
(jsdelivr) silently fails there, so KaTeX markup renders as jumbled duplicated
symbols. This is why the sheet's equations are **inline SVG rendered by local
pdflatex** — zero runtime dependencies. Never reintroduce a math library or any
non-Google-Fonts stylesheet into the layer. (Leave the sim's own KaTeX links alone:
its formal strip is permanently hidden, and the guided inquiry may not use them.)

## 2. Unicode combining arrows (U+20D7) render as tofu boxes
`v⃗`-style combining characters depend on font support the viewer doesn't have —
they showed as empty boxes above every vector in a user screenshot. Prevention:
vector arrows exist ONLY inside the LaTeX SVGs (`\vec`) — never as combining
characters in prose, SVG `<text>`, or HTML. `verify_build.py` rejects any U+20D7 in
the layer; keep it that way.

## 3. Poppler SVG id collisions
`pdftocairo` names glyph defs `glyph-0-0`, `clip-1`, … in **every** file. Inline
several SVGs on one page and `<use href="#glyph-0-0">` resolves to the *first*
SVG's defs — wrong glyphs everywhere. `gen_assets.py` namespaces every `id=`,
`xlink:href="#`, and `url(#` with the asset's own name. If you post-process SVGs by
hand, preserve this.

## 4. The hosting viewer pins `data-theme` on `<html>` → theme button appears dead
The sim's light theme matches `body.light-theme, html[data-theme="light"]`, and its
☾ button only toggles the body class. The artifact viewer sets
`html[data-theme="light"]`, which outranks the button forever. The layer's
theme-repair module fixes this: sync body-class from the html attribute (plus a
MutationObserver), and after the sim's own click handler runs, mirror the body class
back up to the `<html>` attribute. Keep both directions; removing either
reintroduces the dead button or breaks viewer-initiated theme changes.

## 5. Blob/anchor downloads are inert on hosted pages
`a.download` + `URL.createObjectURL` does nothing inside a hosted artifact page.
The layer requests the `downloads` runtime capability
(`await window.claude.use('downloads')`, then `dl.save({filename, data})`) and falls
back to the blob anchor only when the capability is absent (i.e. the file is opened
directly in a browser). When publishing as an artifact, declare
`capabilities: {downloads: true}` on the **first** publish; republishing without a
`capabilities` argument carries it forward. Handle `declined` silently and
`rate_limited` with a toast — both are user decisions, not errors.

## 6. Frozen "worked example" vs live sliders (user-reported bug)
The replay button originally reset to defaults to match hard-coded example text;
the user moved the sliders, hit replay, and got defaults. The fix is structural:
the worked-run element is rebuilt inside `refreshLive()` from current values, and
the replay handler always launches `curOm()/curV()`-style current values with a
toast that states the live prediction. Never hard-code example numbers anywhere the
user can change the inputs.

## 7. TikZ labels clipped at the border / sloppy caption stagger
Rendered figures had a label cut by the standalone crop and two staggered captions
that read as broken. Prevention lives in the pipeline (7pt border for TikZ) and in
review discipline: **rasterize every asset to PNG and look at it** before assembly.
Prefer one shared caption line under multi-panel figures.

## 8. `</script>` inside JS-built HTML terminates the layer's script
The download builder assembles a full HTML document inside a JS string. Any literal
`</script>` in that string ends the *layer's* `<script>` at parse time. Every
closing script tag inside strings must be written `<\/script>`. An opening
`<script>` in a string is harmless. `verify_build.py` counts real closers in the
layer (must be exactly the layer's own).

## 9. All-or-nothing patching
A patch script that writes after some replacements succeed and one anchor fails
leaves a half-patched production file. `patchlib.Patcher` queues replacements,
asserts every anchor occurs exactly once, and writes only if all pass. A partial
failure aborts with the original untouched — keep that property; never loop
"replace what matches."

## 10. Listener ordering assumptions
The layer's slider sync and button behavior assume the sim's own listeners are
already registered (the layer's `<script>` sits after the sim's boot script and
before `</body>`). Injecting the layer anywhere else — or deferring it — breaks the
"runs after the sim's handler" guarantees (e.g. the theme mirror reads the class
the sim's handler just toggled). Always inject immediately before the final
`</body>`.

## 11. Modal/viewport interactions
Small ones that were each a user round-trip: the pop-up must sit clearly **below**
the top bar (`align-items:flex-start` + ~64px top padding + height capped at
`calc(100vh - 100px)`), pause the sim on open and restore the previous play state on
close, close on Esc and on backdrop click, and focus the close button on open.

## 12. Scope of checks
The sim's own prose legitimately contains characters (like r⃗ in the info modal)
that are banned in the layer. All verification is scoped to the injected layer
block, not the whole file — don't "fix" the sim's original content.

## 13. Live Server splices its reload script at EVERY literal `</body>`
Cursor/VS Code Live Server (and similar dev servers) inject their auto-reload
`<script>` by string-replacing `</body>` — every occurrence, not just the real
one. The layer's header comment ("injected before </body>") and the download
builder's `'...</body></html>'` JS string both matched, so the served page had a
raw `<script>` block spliced into the middle of the layer's JavaScript — syntax
error, dead layer, dead button — while file:// and plain http servers worked
perfectly. Prevention: the layer must contain NO literal `</body>` sequence;
write `<\/body>` inside JS strings (same runtime output) and reword comments.
`verify_build.py` now rejects any literal `</body>` inside the layer.
