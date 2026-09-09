# relativity/diagram.js harvest spec (M6)

User ruling: the `-new` trio (L05-s2 / L08-s2 / L18-s2 `…-new.html`) are the LIVE sims —
harvest prefers them; fall back to `L05-s2-spacetime-diagram-explorer-shell.html` (non-live
but physics-reviewed) only where noted. Line offsets: L18 = L05+1, L08 = L05+2 for lines ≥303.

## Per-primitive sources (file:lines)
- World↔screen mapping: -new/L05:359-360 (origin-centred, DPR, negative-ct support; NOT -shell's half-plane geo)
- Inverse map + snap: -new/L05:376; adopt -shell's snap-on-drop feel (round at pointer-up, continuous drag)
- line/label/clear: -new/L05:361-363; graft -shell:765-778 pillText styling onto label's clamping
- S grid: -new/L05:364; S axes+ticks: -new/L05:366 (four-quadrant; NOT -shell's bottom-pinned frame)
- Tilted S′ axes + hyperbola calibration ticks: -new/L18:369 (sole source; ticks at (γk, γvk) verified)
- γ-spaced prime grid: -new/L18:366 (sole source, physics verified)
- Segment/line clipping: **-shell:850-860 clip() (Liang–Barsky) + 861-865 distSeg** — better than -new rayExit (origin-only); keep rayExit as wrapper
- Light cone: -new/L18:370 (filled future wedge + dashed 45° lines; L05 branch = origin cross); FIX: wrap in ctx.rect/clip per -shell:896-913
- Worldlines: **-shell:946-970 drawWorldlines + 780-787 normalizeWL + 799-804 addWorldline** (time-forward normalization fixes the -new v/c sign bug; superluminal dashing + ⚠ label; clipped)
- Projections layer: -shell:971-990 (richer: feet ticks, numeric labels, alpha fade)
- Separation triangle: -shell:991-1034 (fill, degenerate suppression, Δs label/readout — absent in -new)
- Event markers: -new/L05:372 marker + **-shell:1059-1084 radial label placement/clamping**
- Drag/hit-testing: **-shell:1095-1155** (nearest-within-12px, event/wlpoint/wlline drags, 4px click-vs-drag threshold, long-press + right-click delete, pointer capture; -new is first-match-17px events-only)
- interval/classify/order/gamma/boost: -new/L18:356-358 (sole source; thresholds |ds²|<0.035, |cΔt|<0.015 — make relative to snap grid)
- eventInPrime/eventFromPrime: -new/L08:376-377; S′ readout wiring: **-new/L08:413,419-433** (lastV boost persistence — intended fix; L18:379 snap-to-0 is the bug) + L18:374 ordering-badge rows (complementary)
- Numeric coord entry panel: -new/L08:375,378-412,435-437 (parseCoord partial-input tolerance, focused-input skip) — harvest wholesale
- Reception signals: -new/L08:373 (ct_rec = ct + |x| at x=0, pulse via onFrame L08:440)
- Now-line sweep: -shell:1042-1058; Observer worldline: -shell:939-945 (absent in -new)

## Fixes to apply at harvest (defects in the live -new trio)
1. Drop dead KaTeX CSS (line 202; no KaTeX is loaded — formal content is plain Unicode HTML, keep that approach; do NOT inherit -shell's CDN KaTeX)
2. Strip/wire L05's unreachable S′ path (primeGrid/primeAxes/rayExit/boost dead — no #show-prime control)
3. CONFIGS becomes a module parameter, not a baked-in triple (2/3 of each file is inert cross-lecture payload)
4. Fix worldline v/c sign (normalizeWL) + add superluminal guard
5. Worldlines: draw in all lectures, add delete/drag/hit-test (from -shell)
6. Unify clamps (drag ±5.5 vs entry ±8 vs grid ±8/ticks ±5)
7. Clip all primitives to viewport (lightGeometry/primeGrid/primeAxes draw to ext 9-10 unclipped)
8. Nearest-event hit-testing (not first-match)
9. readings() null-guards everywhere (L05's guarded shape + L08/L18 row content)
10. Classification thresholds relative to snap grid
11. lastV boost persistence everywhere (L08 behavior)
12. The trio's duplicated Shell module + CSS/font payload is replaced by the engine shell at build time
