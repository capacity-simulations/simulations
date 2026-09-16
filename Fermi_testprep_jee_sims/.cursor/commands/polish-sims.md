# Polish sims — 3-critic polish flow, one sim per tab (parallel-safe)

Run the full `polish-sims` flow on the ONE simulation the user names: three
critic passes, consolidated findings with rulings, surgical fixes, independent
re-gate. Designed for many Cursor tabs at once — one tab per sim; stay
strictly inside your assigned file.

## The specification

Read `.claude/skills/polish-sims/SKILL.md` and execute it fully — it defines
the three critics (physics / pedagogy / visuals) with their battle-tested
angles, the consolidation-with-rulings format, the fixer discipline, the
verification bar, and the known-benign list. This command adds only the
serial-run mechanics below.

## Serial order (Cursor runs single-threaded — no subagents)

Execute the critics as three strictly separate passes of YOUR OWN work, in
this order, writing each critic's findings block before starting the next:

1. **Phase 0** setup + gate baseline + `__audit` ratchet + DO-NOT-FLAG list.
2. **Critic 1 — physics** (oracle in `$TMPDIR`; re-run the sim's math in Node).
3. **Critic 2 — pedagogy** (full spoiler sweep incl. welcome blurb + voiceover
   script lines; gated-card leak check BEFORE commit).
4. **Critic 3 — visuals** (REAL screenshots via `tools/cdp.mjs`; both themes;
   check every `ctx.font` for literal `var(--…)` — canvas renders it 10px).
5. **Phase 2** consolidation: merge, rule on conflicts, write
   `$TMPDIR/<base>.polish/findings.md` with the verification bar.
6. **Phase 3** apply the fixes yourself, surgically, per the rulings.
7. **Phase 4** re-run the ENTIRE verification bar.
8. **Phase 5** ledger row + report.

Do not interleave critic mindsets — finish and record each pass before the
next; the pedagogy pass must not soften physics findings and vice versa.

## Ground rules (non-negotiable)

1. **One file only.** Read anything; EDIT only your assigned sim (plus one
   appended row in `REVIEW-LOG.md`). No repo-wide replacements, no git.
2. **Backups + findings + screenshots in `$TMPDIR`**, never in `Module-*/`.
3. **Layers are sacred**: welcome overlay, guided inquiry, controls guide,
   voiceover (no auto-start; pagehide cancel; Auto never answers predictions).
   The gate battery re-proves all of it.
4. **`__audit` ratchet**: record the passing set before touching anything; it
   must be identical after.
5. Never add `disabled` to a sim parameter control (the shell's
   `gateLocksPlay` transport disable is sanctioned — leave it; free
   exploration must re-enable ▶ via `__freeExplore`).
6. Never introduce third-party sim-source names. Never push to S3.

## Browser mechanics

- Static server (start once if not running): from the repo root,
  `python3 -m http.server 8734 &`
- CDP driver: `tools/cdp.mjs` — `launch('http://localhost:8734/<module-path>', {port: PORT})`.
  **PORT unique per tab**: `12700 + <concept number> mod 200`; if launch fails
  with "no CDP page target", add 200 and retry. Wrap every evalJs in an IIFE.
  Always `b.close()`.
- The scene canvas is `#sceneCanvas` (or the visible canvas) — NOT the first
  `<canvas>` in the DOM; `#welcome-fringes` (the hidden hero) comes first and
  will silently give you blank pixel probes.

## Verification bar (all must pass before reporting)

```bash
# parse
node --check on every inline <script>
# jsdom gates against the pre-user-version original
git show 6ba6f47:"<module-path>" > $TMPDIR/baseline.html
cd Sim_use_version_skills
node guided-inquiry/scripts/verify.js   "../<module-path>" --baseline "$TMPDIR/baseline.html"
node controls-tutorial/scripts/verify.js "../<module-path>" --baseline "$TMPDIR/baseline.html"
node welcome-overlay/scripts/verify.js  "../<module-path>" --baseline "$TMPDIR/baseline.html"
cd ..
# deep browser eval (overlay, 3 modes, inquiry, CG walk, voiceover wiring,
# free-mode controls visible, free-mode ▶ enabled)
node tools/user-version-eval.mjs <PORT+7> "<module-path>"
# live __audit == ratchet · copyright grep -icE "phet|colorado" == 0
```

Plus: the specific live probe for every critical/major fix, re-run after the fix.

## Deliverables

1. The report: verdict first, then per-critic finding counts, best catch,
   per-gate scorecard before/after, deviations.
2. `$TMPDIR/<base>.polish/findings.md` in full (paste into the report).
3. One `REVIEW-LOG.md` row appended (and nothing else in that file touched).
4. End with the reminder line: `S3: re-push required for this file`.
