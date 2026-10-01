# Orchestrator addendum: append to each critic brief (physics.md, pedagogy.md, visuals.md)

Fill every `<…>`. Keep the shared part identical in the three files; the last paragraph is role-specific (use only the matching one). Append with a leading `---`.

```markdown
---
## ORCHESTRATOR ADDENDUM (binding — read before critiquing)

**Gate state (pre-polish):** <copy step 1: e.g. "frozen-integrity [], physics-audit 120/120 kernel checks + 5/5 invariants PASS, cg PASS, wo PASS, param-stability [], style PASS, reset-oracle 3/3">. FAILING: <each failing gate line verbatim, e.g. "layoutGate: SUBJECT TOO SMALL on canvas #ladder: 15 % …", "gi feedback budget card 6 (74 words, sealed)">. Every fix you propose must keep the green gates green.

**GI feedback word budget:** gi-verify flags explanations over 60 words. The explanations are the senior SME's SEALED text: they may NOT be shortened or reworded. Do NOT propose text cuts for this; it is a gate-rule question pending the owner.

**Deliberate design decisions (do NOT propose reversing them):**
1. SEALED DECK: the inquiry cards are the SME's questions VERBATIM (stems, options, explanations). No wording changes, no added or removed cards, never "predict" wording. Staging, pins and reveal timing are fair game; the words are not.
2. The controls are exactly those the spec lists. No speed, brightness or display controls of the sim's own.
3. cfg.restartOnParamChange:false is deliberate wherever the sim keeps a record the student builds: the record must survive every slider gesture and clear only on ↻ Reset (or the spec's own restart).
4. The "⚛︎ The Physics" button is INTENTIONALLY INERT and the <!-- PHYSICS_SHEET --> marker UNFILLED (installed later, outside the pipeline). The Info button and theme toggle are frozen shell. The Info modal CONTENT is authored and IS in scope: it must be outcome-neutral (no answers to any card).
5. The declared model in the course spec is the SME spec's stated simplification: critique how it is SHOWN, not the choice.
6. Owner preference: the header shows the TITLE ONLY (no subtitle span).
<7+. sim-specific accepted departures from the prebuild README "Things to look at" / "Deliberate departures", e.g. "The pressure strip stays inside the main canvas aligned with the pipe (spec-mandated; accepted)".>

**Known issues to confirm and give precise fixes for:**
- <each failing gate line again, as a task>
- <each defect listed for this sim in the batch README's "Defects to hand to polish", verbatim. The batch READMEs are in /Users/admin/Desktop/simulations-1/AI courses sims/prebuild/<course>/ (README.md, README-list1/2/3.md)>
- <anything you noticed in the prebuild yourself (e.g. a Controls Guide that reveals a staged answer)>

**Spec source:** the '<id>' entry in pipeline/courses/jee-physics/course.mjs (body, craft, card set-ups, staging) and the SME spec <absolute path of the spec .md, if known>.
```

## Role-specific last paragraph (append ONE, matching the file)

**physics.md**
```markdown
**PHYSICS CRITIC PRIORITIES:** recompute the numbers the sim shows (from the course entry's formulas and reference values; the engine ops named in its craft/ref); exercise the sim in a real browser (repo puppeteer-core with /Applications/Google Chrome.app/Contents/MacOS/Google Chrome; playwright is NOT installed) at every card set-up and at the ends of every control range; check the declared model is what is drawn; check the audit invariants are computed from the sim's own physics (not tautologies); check every number a card quotes is what the student reads on screen at that card's set-up.
```

**pedagogy.md**
```markdown
**PEDAGOGY CRITIC PRIORITIES:** hunt ANSWER LEAKS card by card (read each card's correct answer in the course entry): canvas captions, labels, legends, readout labels, the Info modal copy, the Controls Guide reveals, anything shown before the card that asks for it. Check each card's onStep set-up is applied so the student starts where the question stands, and that the student can physically do and read what each card asks (readouts visible while the card is open at 1280×800).
```

**visuals.md**
```markdown
**VISUALS CRITIC PRIORITIES:** take screenshots (repo puppeteer-core; playwright NOT installed; /Users/admin/Desktop/simulations-1/polish-skill/scripts/shots.mjs helps) at 1440 and 860 px, both themes: default free exploration, every card's set-up state, both ends of each control, and the Controls Guide open. LOOK at them. Give precise fixes for every layoutGate finding above and verify them with `node --experimental-strip-types pipeline/layoutGate.mjs <file>` on a scratch copy; check label collisions, fonts ≥ 12 px, light-theme inks, legend placement (top-right house convention unless it covers data), fixed axes, nothing under the frozen plot title.
```
