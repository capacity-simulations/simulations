# JEE Sim Deep Review + Fix — one sim, end to end (parallel-safe)

Run the full `jee-sim-deep-review` specification on the ONE simulation the user
names, apply every defect fix, propose enhancements, verify, and log. Designed
for many Cursor tabs at once — one tab per sim; stay strictly inside your
assigned file.

## The specification

Read `.claude/skills/jee-sim-deep-review/SKILL.md` and execute it fully. It
defines the two tracks (P: physics truth · D: demonstration quality via the
blind Demonstration Oracle), Track L (user-version layer integrity), the fix
policy, gates, and the output contract. This command adds only the
parallel-run mechanics below.

## Ground rules (non-negotiable)

1. **One file only.** Read anything; EDIT only your assigned sim. No repo-wide
   replacements, no git.
2. **Order matters**: write the Track D **blind ideal-demo spec first**, from
   the sim's title + curriculum entry ONLY, before reading any implementation.
   Paste that spec into your report verbatim — it is the audit standard.
3. **Defects fixed, enhancements proposed.** Surgical fixes (≤ ~30 lines, no
   new panels/controls/representations) are pre-approved — apply and re-verify.
   Anything bigger goes in ENHANCEMENTS with an implementation sketch.
4. **Layers are sacred.** These are user versions: welcome overlay, guided
   inquiry, controls guide, voiceover (no auto-start; pagehide cancel). Your
   fixes must keep all of it working — the gate battery checks.
5. Scratch work in `$TMPDIR`. Never introduce third-party sim-source names.

## Browser mechanics

- Static server (start once if not running): from the repo root,
  `python3 -m http.server 8734 &`
- CDP driver: `tools/cdp.mjs` — `launch('http://localhost:8734/<module-path>', {port: PORT})`.
  **PORT unique per tab**: `12000 + <concept number> mod 500`; if launch fails
  with "no CDP page target", add 500 and retry. Wrap every evalJs in an IIFE.
  Always `b.close()`.
- Post-fix deep gate: `node tools/user-version-eval.mjs <PORT+7> <module-relative-path>`
  (accepts `Module-XX-…/Cxxx-….html`). Exit 0 required.
- jsdom verifiers (baselines from git history — the pre-user-version originals):
  ```
  git show 6ba6f47:"<module-path>" > $TMPDIR/baseline.html
  cd Sim_use_version_skills
  node guided-inquiry/scripts/verify.js "../<module-path>" --baseline "$TMPDIR/baseline.html"
  node controls-tutorial/scripts/verify.js "../<module-path>" --baseline "$TMPDIR/baseline.html"
  node welcome-overlay/scripts/verify.js "../<module-path>" --baseline "$TMPDIR/baseline.html"
  ```

## Deliverables

1. The skill's output contract block, verbatim format.
2. The blind ideal-demo spec (Track D·D1) included in full.
3. One `REVIEW-LOG.md` row appended (and nothing else in that file touched).
4. End with the reminder line: `S3: re-push required for this file`.
