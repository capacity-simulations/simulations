# Standing rulings (binding on every polish; override any critic finding)

These are the owner's and the senior SME's decisions, accumulated over every polish run so far (QM, cm-*, waves, thermal). A finding that contradicts one is INVALID AS WRITTEN. Implement its intent another way, or skip it and say why.

## A. The inquiry deck (senior-SME directive, strict)
1. **SEALED DECK.** The guided-inquiry cards are the SME's text VERBATIM: stems, options, `data-fb` feedback, headings. Do not change a word. Do not add, remove, merge or reorder cards. Staging (onStep pins, reveal flags, reading order, canvas/readout timing) is fair game. The words are not. Verify with `scripts/deck-diff.mjs`.
2. **Never "predict".** No "predict", "Before pressing play, predict…" or "Before you…" wording anywhere the fixer writes (Info modal, captions, tour, hints).
3. **The gi 60-word feedback budget.** gi-verify flags explanations over 60 words. The explanations are sealed, so do NOT shorten them. This gate failure is a documented exception, pending the owner's ruling. Every OTHER gi check must pass.
4. **Typesetting is allowed, rewording is not.** Sealed text containing TeX-like fragments (`e^{−iEₙt/ħ}`) may be TYPESET at display time (a MutationObserver on `.predict-eval.show`, adding `<sup>`). The `data-fb` attribute and its characters stay untouched, and a matching TTS rule is added.

## B. Frozen template layers
5. **Never edit the frozen layers.** These are the SHELL CSS and runtime, the Controls-Guide controller, the Welcome overlay and the Card-voiceover engine (banner-marked blocks), plus any shell-owned id or class (`shell-*`, `plot-box`, `plot-title`, `legend`, `inq-*`, `ctrl-box`, `choice`, `predict-eval`, `aside-*`, `cg-*`, `welcome-*`). Sim-side classes are namespaced. frozen-integrity must return `[]`.
6. **Sim CSS never targets a frozen class as its FINAL selector.** The assembler silently strips such rules. Put a sim-owned class or id on the same element and target that.
7. **The ⚛︎ The Physics button stays INERT, and the `<!-- PHYSICS_SHEET -->` marker stays UNFILLED.** Leave `__physicsHooks` in place. The sheet is installed later, outside the polish. The Info button and theme toggle are frozen. The Info modal CONTENT is authored and in scope.
8. **Keep the `#shell` default classes.** Never remove `hide-aside` or `hide-formal` from `#shell`.

## C. Honesty, answers and staging
9. **The Info modal is outcome-neutral.** INFO_TITLE / INFO_ROW_HTML / INFO_PRINCIPLES_HTML describe what is on screen, what each control does and how things are measured. They never give a card's answer, never state the misconception as standing text, never name a distractor as wrong, and make no overclaims ("real semiconductor layers" and the like). Every physics claim in them must be true at every setting.
10. **Staging never leaks.** `window.__cgReveals` (the Controls Guide) reveals nothing the inquiry stages; the tour stays at stage 0 for staged answers. The ‹ › pager must not show a later card's answer on an unanswered card; gate reveals on `data-answered`. Nothing on the canvas, in a caption, in a readout label or in a legend marks a discovery before its card.
11. **Free exploration opens at the SPEC'S boot defaults,** not card 1's pinned set-up. `__freeExplore` writes the boot state unless the student has already changed it, using a `pristine` flag.
12. **The header ↻ Reset restores EVERY control to the spec's default,** in free mode and after the tour. An in-card reset the spec asks for (for example one that keeps a setting or clears a record) is a sim-owned button with its own id. Never make the full reset keep a setting.
13. **PLAYABLE FROM LOAD is inviolable.** Never add `disabled` to any slider, button or Play control, in markup or at init. Never lock interaction behind an answer. Commit-before-reveal is done by ORDER and PAUSE, never by disabling.
14. **The controls are exactly those the spec lists.** Add no speed, brightness or display controls of the sim's own (the shell's Speed select exists). Do not remove a spec control.
15. **Records survive slider gestures.** Where the sim keeps a record the student builds (swept curves, traces, marked points, ledgers), `cfg.restartOnParamChange:false` is deliberate. The record clears only on ↻ Reset or the spec's own restart.
16. **The declared model is the spec's choice.** Critique how it is SHOWN, not the choice.

## D. Physics and numbers
17. **No physics-number changes** unless the physics critic shows a number disagrees with the course spec or the kernel values. Then fix TOWARD the spec. Use exactly the constants the spec states (for example R = 8.314), so on-screen numbers match the cards.
18. **Keep `__audit` and its invariants,** computed from the sim's OWN physics code path. `at(inputs)` computes purely from its inputs. Replace a tautological invariant body with an independent recomputation (same name, expected value and tolerance).
19. **Rounding never contradicts the physics.** Equal model values are formatted from one rounded value. A non-zero value never displays as zero; use a ×10ⁿ form or more digits.
20. **No Engine-dot token.** The word Engine followed by a dot must not appear anywhere in the file, comments included. Cite formulas in comments as `engine op <name>`.

## E. Layout and visuals (the shell contract)
21. **The hero split law.** A quantitative companion (strip chart, inset plot, spectrum) gets its OWN canvas in its own band with a fixed basis (`flex:0 0 150–235px`, at most a third of the hero). It is never a sub-plot drawn inside the hero canvas, and there is never a `min-width` or horizontal scroll. Side-by-side at 1fr/1fr only when the spec is explicitly a comparison. A spec-mandated departure that the owner has already accepted (noted in the prebuild README) is left alone.
22. **The subject fills its canvas.** The drawn content spans at least about 60% of the canvas width and height at 1280×800, with margins, at every setting. layoutGate must return `"findings": []`.
23. **Nothing under the plot title.** Reserve a fixed top band (about 34 px) on each hero canvas.
24. **Plot-title symbols keep their case.** Put symbols and units in the frozen `.plot-inline` span, or use plain words.
25. **The header shows the TITLE ONLY,** with no subtitle span. The welcome name and `<title>` use the same wording.
26. **Legibility.** Canvas text is at least 12 px. Light-theme inks give at least 4.5:1 for text and at least 3:1 for data graphics. Use theme-aware PAL colours.
27. **Readouts and key controls stay visible while a card is open** at 1280×800 and 1440×900. Use the frozen panel markup (`.shell-panel-head` / `.shell-panel-body`, `.ctrl-slider-row`, `.ctrl-box-label`), never native bare sliders. The spec's single line of readouts sits in the hero column when the aside would push it below the fold.
28. **Fixed axes.** No auto-rescale or auto-fit that cancels the quantity a control changes.
29. **The headless gates must boot.** Do not rely at boot on browser APIs that jsdom lacks (for example `Path2D`). Feature-check them, or draw directly.

## F. Process
30. **Surgical fixes, not regeneration.** Preserve everything that works.
31. **The TTS rules cover every new glyph** the fixer puts on screen or in cards.
32. **No commit or push,** no API calls, and no edits to sim-foundry pipeline, template, engine or course files.
