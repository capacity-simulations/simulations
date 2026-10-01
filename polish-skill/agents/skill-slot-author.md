---
name: skill-slot-author
description: Authors the 7 skill slots (welcome, tour, TTS) for ONE sim-foundry user-shell core build that has no skill slots yet, so it can be assembled into a prebuild. Use when the polish skill finds a core-slots.txt without a skill-slots.txt.
---

Author the 7 skill slots for ONE sim-foundry user-shell simulation. Repo: /Users/admin/Downloads/sim-foundry (run everything from there). Do NOT edit the core slots.

THE SIM (read it first, in full): sims-eval-law/<id>.core-slots.txt, the 11 core slots. Everything you author must match what is actually in there: real element ids, real control names, real readout ids, the real card text.
THE SPEC ENTRY (for the physics and the SEALED DECK): the '<id>' entry in pipeline/courses/jee-physics/course.mjs (its body has the model and the cards with their correct answers).

FORMAT: exactly these 7 slots, in this order, each delimited <<<SLOT:NAME>>> ... <<<END>>>:
WELCOME_NAME, WELCOME_BLURB, WELCOME_HERO_LABEL, WELCOME_HERO_DRAW, WELCOME_INTRO_LINES, TTS_NORM_RULES, CG_STEPS.
Structural reference for every slot's shape, conventions and budgets (read fully first): sims-eval-law/qm-photoelectric-effect.skill-slots.txt (and sims-eval-law/cm-spinning-book.skill-slots.txt). Rules:
- WELCOME_NAME: short faithful title, ≤ 22 characters.
- WELCOME_BLURB: one sentence, about 13 words.
- WELCOME_HERO_DRAW: self-contained on $('welcome-fringes'), theme-agnostic, safe when the canvas is absent, backing store sized from getBoundingClientRect × devicePixelRatio, redraws on resize; labels ≥ 12 px on screen in DM Sans (never Georgia/serif).
- WELCOME_INTRO_LINES: exactly two single-quoted comma-terminated lines beginning 'Welcome to ...'.
- TTS_NORM_RULES: cover EVERY glyph the cards, options, explanations and UI speak (subscripts, superscripts, Greek letters, ħ, √, fractions, units): compounds before bare glyphs; never duplicate the frozen floor rules for − × ≈ →. Run the chain over every card string and confirm sensible speech with no leftover glyphs.
- CG_STEPS: every text line ≤ 15 words; each step {sel, text, mode, also}; first three steps #shell-maximize, #toggle-formal, #shell-reset (mode:'veil') as in the reference; transport controls handled as the reference does (if present); then each sidebar control box and readout panel (mode:'hide'; use 'veil' for panels inside the hero column whose hiding would resize the hero); terminal sel:null step; every sel verified to exist as an id in the core slots (grep each); skipped ids named in a comment with reasons.

SPOILER DISCIPLINE: read every card's question and correct answer in the spec entry. NO welcome text, blurb, hero label, hero drawing, intro line or tour step may state or imply ANY card's answer, mark any threshold/peak/node/minimum the cards ask the student to find, or show a curve the student is meant to discover. Draw the set-up only, with a "?".

VERIFY BEFORE FINISHING (iterate until green):
  node --experimental-strip-types tools/assemble-user-sim.mjs sims-eval-law/<id>.core-slots.txt sims-eval-law/<id>.skill-slots.txt -o sims-eval-law/<id>.html
  node --experimental-strip-types pipeline/user-gates/cg-verify.js sims-eval-law/<id>.html | tail -1
  node --experimental-strip-types pipeline/user-gates/wo-verify.js sims-eval-law/<id>.html | tail -1
Return a SHORT report (≤ 120 words): slot list, CG coverage, TTS coverage, assembly + cg + wo results, one-line spoiler audit, and anything in the CORE slots that looked broken (do not fix it, report it). Never call any model API.
