---
name: add-hide-text
description: Install the "Hide Text" checkbox + empty hide-registry into CM lecture sims (one sim, a list, or "all"), following the canonical spec in .cursor/rules/hide-text-checkbox.mdc. Also handles the later "register" step — putting named text items into a sim's hide container. Use when asked to add the Hide Text checkbox/container, roll it out across sims, or register/hide specific labels. Install mode NEVER hides anything — the container ships empty.
---

# Add Hide-Text container to CM sims

**Canonical spec: `.cursor/rules/hide-text-checkbox.mdc` — read it FIRST, follow it
exactly.** This skill is the executor; the MDC is the single source of truth for the
markup, CSS, wiring script, registry format, naming tokens, and rules. If the two ever
disagree, the MDC wins.

## Mode 1 — install (default)

Given one sim, a list, or "all":

1. Read the MDC. Resolve targets; for "all" glob `Capacity_CM_simulations/*.html`
   minus `index.html`, `vendor/`, `CM_lecture_sims_backup/`.
2. Per sim, **idempotency check first**: if `id="ht-toggle"` is already present, skip
   and report "already installed".
3. Locate the three anchors and make exactly the MDC's three insertions:
   - markup after the `#shell-lecture` button,
   - CSS appended to the main `<style>` block (NOT the `data-sim-fonts` style, and
     never near the base64 FONT blob line — grep for anchors, don't read that line),
   - registry comment + wiring script immediately after the top bar's `</header>`.
4. Change nothing else. No text is hidden at install time; physics is untouched.

### Verify (per sim)
- Grep: exactly one `ht-toggle`, one `HIDE-TEXT REGISTRY`, one `#shell.hide-text .ht-hide`.
- Browser smoke (bundled probe from the review skill works unchanged):
  `node .claude/skills/review-CM-sims/browser-probe.mjs "<sim>" "<scratch-dir>"` →
  `errors: []`, and the initial screenshot shows the checkbox beside 🎓 Lecture.
- For one deeper check (first install / spot checks): drive the page with the same
  puppeteer pattern and assert that clicking `#ht-toggle` toggles class `hide-text` on
  `#shell`, with zero console errors and no visual change (registry is empty).

### Batch report
End with a table: sim · installed / already present / skipped (+why) · probe errors.

## Mode 2 — register (later, on explicit request only)

When asked to put specific texts into a sim's container ("register/hide X in <sim>"):
- DOM text → add class `ht-hide`; canvas text → wrap the draw call in `if(!HT()){ … }`.
- Text only — never gate physics, geometry, or marker shapes unless explicitly asked.
- Append one line per item to that sim's `HIDE-TEXT REGISTRY` comment (replace the
  "(empty …)" line on first registration). The registry must always list exactly what
  is registered — it is the reversibility manifest for the user-facing builds.
- Verify in the browser: checked → items gone; unchecked → items back; `errors: []`.

## Hard rules
- Install mode never hides or deletes anything.
- Hide-only, ever — this mechanism must stay fully reversible.
- Never modify physics code, the shell loop, or the auto-lecture script.
- These files are ~300 KB with a giant base64 font line — work by grep + targeted
  edits, never read the blob.
