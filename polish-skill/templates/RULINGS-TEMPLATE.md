# Rulings template (write to sims-eval-law/<id>.polish/rulings.md; appended to fixer.md)

The fixer treats this as binding: it overrides any conflicting finding. 8–15 numbered rulings, each one line or a short paragraph. Worked example (qm-well-superposition, abbreviated) at the bottom.

```markdown
ORCHESTRATOR RULINGS: <id> (override any conflicting finding):
1. SEALED DECK: the <n> cards are the SME's text VERBATIM (no stem, option or explanation changes, no added cards, never "predict"). The gi 60-word feedback budget failure on card <k> (<w> words, sealed) is a documented exception pending the owner: do NOT cut text for it; every other gi check must pass. <typesetting note if any>
2. The "⚛︎ The Physics" button stays INERT, the <!-- PHYSICS_SHEET --> marker UNFILLED; leave __physicsHooks. Info/theme buttons frozen; the Info modal CONTENT must be OUTCOME-NEUTRAL: <list the answers/misconception lines the pedagogy critic found in it, to remove>.
3. LAYOUT: <the visuals critic's verified recipe for each layoutGate finding>. layoutGate must return [].
4. STAGING: <Controls Guide / pager / captions that leak; how to stage them (stage 0 in the tour, gate on data-answered)>.
5. BOOT STATE: free exploration and the Controls Guide open on the spec's defaults <name them> unless the student has already changed the state.
6. <physics corrections, each tied to the spec/kernel value it must match>
7. <readouts/controls visibility, markup (.ctrl-slider-row, panel markup), header title only, plot-title case>
8. <legibility: ≥12 px, light-theme inks, TTS rows for any new glyph>
9. <audit: invariant fixes, keep __audit computed from the sim's own physics>
10. INVALID AS WRITTEN: <finding id/summary> — <why (which standing ruling)>; meet its intent by <staging/order+pause/skip>.
N. NEVER touch frozen template layers; keep __audit + invariants computed from the sim's own physics; no physics-number changes beyond ruling 6; keep every green gate green.
```

## Worked example (real, abbreviated): qm-well-superposition
1. SEALED DECK: the 6 cards are the SME's text VERBATIM. The gi 60-word budget failure on card 6 (61 words, sealed) is pending the owner: do NOT cut text; every other gi check must pass. Card 1's "e^{−iEₙt/ħ}" may be TYPESET on screen (superscript) with a matching TTS rule; the characters of the sealed text stay the same.
2. The ⚛︎ button stays INERT, the marker UNFILLED. The Info modal must become OUTCOME-NEUTRAL (pedagogy critical): no card answers (time-independent density, oscillates, h/(E₂ − E₁), ∝ w², half-period mirror image, width changes only the pace), no named wrong intuitions, no misconception as standing text. Replace the "real semiconductor layers" overclaim; add one neutral line that this is a coherent superposition (not a statistical mixture) without changing card wording.
3. LAYOUT (the visuals critic's verified recipe): remove the plot canvas height cap so it fills the column (aspect 1.25), reserve a 34 px title band above both canvases, keep the inset and the end note fully visible at 860 px, inset labels ≥ 12 px with "t (fs)" below the tick row. layoutGate must return [].
4. The Controls Guide must draw NO staged guides (__cgReveals → stage 0); the ‹ › pager must not show card 3's guide lines on an unanswered card 3.
5. Free exploration and the Controls Guide open on the spec's EQUAL MIXTURE (not card 1's ψ₁ pin) unless the student has already changed the state.
6. The plot title's time-rate claim must follow the shell Speed setting or state the 1× rate honestly; units in the frozen .plot-inline span; title-only header.
7. Readouts: move the one line of readouts under the inset (keep ids) so it is visible while a card is open; stage E₁/E₂ from card 4 and always in free exploration.
8. Light-theme inks ≥ 4.5:1 for the live curve and violet marks; sliders in the frozen .ctrl-slider-row markup; the end note must not break inside "t = 0".
9. Replace the tautological stationary-density invariant body with an independent recomputation of |Ψ|² from the complex amplitudes (same name/expected/tol).
10. NEVER touch frozen template layers; keep __audit + invariants computed from the sim's own physics; no physics-number changes.
