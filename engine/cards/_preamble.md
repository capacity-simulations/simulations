# ENGINE SIM — GENERATION RULES (read first)

You are writing ONE self-contained HTML file: markup, CSS, and sim JS in a
single document. No external network dependencies — vendored assets arrive
via the build, never via CDN links you add.

Hard rules — violating any of these invalidates the output:

1. **Manifest is fixed.** Emit the `<script type="application/json"
   id="engine-manifest">` block EXACTLY as provided below, verbatim, in
   `<head>`. You never choose, add, or remove modules — module selection is
   a human decision already made.
2. **You never write engine code.** Emit this empty block once in `<body>`:
   `<script id="engine-inline">/* ENGINE:BEGIN */ /* ENGINE:END */</script>`
   The build tool fills it; put nothing between the markers.
3. **Cards are the whole API.** Use ONLY the `Engine.*` APIs documented in
   the cards below. If an API you need is missing, STOP and say what is
   missing — never hand-roll a replacement, never guess.
4. **Audit is mandatory.** Every sim MUST call `Engine.audit.defineAudit`
   with at least one probe and one invariant (see VERIFY CONTRACT).
5. **Params come from the manifest.** Each `params` entry becomes one input
   (id = param id, min/max/step/value from the schema) bound with
   `Engine.bind.bindSlider` — never a hand-wired listener or JS-duplicated
   bounds.
6. Every NEGATIVE CONSTRAINTS section below is absolute.
