# JEE Sim Review + Auto-Fix — one sim, end to end (parallel-safe)

Run the full `jee-sim-review` audit on the ONE simulation file the user names, then apply every fix found (P0, P1 and P2) automatically, then re-verify. This command is designed to run in several Cursor agent tabs at once — one agent per sim — so it must stay strictly inside its assigned file.

## Ground rules (non-negotiable)

1. **One file only.** Read anything you like, but EDIT only the single sim file you were given. Other agents are concurrently editing sibling files in this repo. Never run repo-wide formatters or search-and-replace across files.
2. **No git.** Do not commit, push, stage, or branch. The user commits centrally after all parallel agents finish.
3. **Scratch work** (oracle scripts, screenshots, patched probes) goes in a temp dir (`$TMPDIR` or `/tmp/jee-review-<concept>/`), never in the repo.
4. **Fixes are pre-approved** for this command only: skip the skill's approval pause and apply all P0/P1/P2 fixes as minimal surgical diffs. Everything else in the skill (review depth, evidence standards, fix style) applies unchanged.

## Procedure

1. Read the full specification at `.claude/skills/jee-sim-review/SKILL.md` and follow it exactly — it defines the four dimensions (D1 physics oracle, D2 functional browser drive, D3 visual↔parameter alignment, D4 pedagogy), the parameter-grid protocol, bucket/priority definitions, and the fix-phase rules (Part D).
2. Execute the serial fallback D1 → D2 → D3 → D4 on your file.
   - **Browser testing is mandatory** for D2/D3 (and D1's live-page comparisons). Use the headless-Chrome CDP driver at `tools/cdp.mjs`:
     ```js
     import { launch } from '<repo>/tools/cdp.mjs';
     const b = await launch('file:///<abs-path-to-sim>.html', { port: PORT });
     // b.evalJs(expr), b.screenshot(path), b.consoleIssues(), b.close()
     ```
     Chrome binary: `/Applications/Google Chrome.app`. **PORT must be unique per agent**: use `9600 + <concept number mod 100>`; if two assigned sims share a concept number (e.g. two C025 variants) or launch fails with "no CDP page target", add 100 and retry. Always `b.close()` when done.
   - Wrap every `evalJs` snippet in an IIFE (`(() => { ... })()`) — top-level `const` persists across evaluations and will throw on redeclare.
   - Check the codebase's known defect classes explicitly (listed at the end of the skill): pause-desync (canvas redrawn only in `onFrame` — interact while paused and compare canvas hash), theme vars read from `document.documentElement` while the class lands on `document.body`, unbounded KaTeX retry, silent canvas clamps at slider extremes, guided-inquiry cards asserting outcomes the sim doesn't produce when followed literally, the shell's `runEnded`/restart path wiping sim state the cards depend on, and view-only buttons missing `data-no-reset`.
3. Write the consolidated Part C report (both buckets, P0/P1/P2, exact surgical fixes) into the chat.
4. **Apply every fix** exactly as proposed (deviate minimally only if the code forces it, and say so). Prefer exact-string replacement with a uniqueness check (`count == 1`) before each edit.
5. **Re-verify live** after fixing: reload via CDP — console clean, `window.__audit.run()` passes if present, and re-run the specific probe that caught each fixed issue (pause-desync → re-test interaction-while-paused; theme → re-screenshot both themes; card claims → re-walk the stepper).
6. Finish with a summary block the user can paste into `REVIEW-LOG.md`: file, dimensions completed, fixes applied (one line each, priority first), verification results, and anything skipped with the reason.

## Output contract

End your run with exactly this shape:

```
FILE: <path>
DIMS: D1 ✓ D2 ✓ D3 ✓ D4 ✓   (browser-verified: yes/no per dim)
FIXED (N): [P0] <one line> · verified <how>
           [P1] ...
SKIPPED (M): <issue> — <reason>
VERIFY: console clean = yes/no · __audit.run() = pass/fail/n-a
```
