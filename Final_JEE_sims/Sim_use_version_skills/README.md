# Sim tutorial skills (final agreed template — Sept 2026)

Two skills for Cursor/Claude Code, plus the two validated example builds they
are extracted from.

- `controls-tutorial/` — the 🎛 Controls Guide OVERLAY (purple chat-bubble
  callout with aimed arrow, hidden-until-turn by location, terse copy,
  session memory, Reset = first-load). Supersedes the old sidebar-card design.
- `welcome-overlay/` — the first-landing Welcome (centered layout): hero drawn
  from the sim's physics, three entry modes, Spotify-style read-aloud
  player. Additive only; requires the two-button template.
- `guided-inquiry/`  — the POE card grammar for Guided Inquiry (gated
  predicts with misconception feedback, observe-asks / resolve-tells, staged
  anti-lookup reveals) plus the 🧭 Guided Inquiry button contract
  (mutual exclusion with Controls Guide, free-exploration handover,
  no Lecture mode).
- `examples/` — `L2-Newtons-laws.all-three-skills.html` is the dry-run
  proof: all three skills applied in order to an untouched prod sim (copy
  polish + Lecture removal, 9-step guide, welcome), browser-tested. `L4-Forces_on_objects.all-three-skills.html` is the second
  dry-run proof (incline-only controls via `__cgPrepare`). `Double-slit-experiment.welcome-cards.html` (all three skills on a
  production Three.js sim — browser-tested) and
  `L1-Solar_System_Orbits.final-two-button.html` (both flows together).

Each skill has `SKILL.md` (rules + workflow), `references/implementation.md`
(verbatim code blocks with ADAPT markers) and `scripts/verify.js`
(config-free jsdom gate; `npm i jsdom` once; always pass `--baseline
<original.html>` so CDN-library errors don't count against you).

## Safety + layout gates (run on every build)

- `tests/kernel-diff.mjs <original> <build>` — the production sim is intact:
  every original script byte-identical (physics/controls untouched), no id,
  canvas or visible text removed, styles append-only. `--allow-script-edits`
  downgrades sanctioned L-series in-script deltas to reviewed warnings.
- `tests/layout-probe.mjs <build>` — the inquiry sits in the cross-course
  layout (right column, first block under the top bar, controls below).

## Browser test (mandatory before delivery)
`tests/browser-smoke.js` runs the templated sim in real Chromium:
`npm i playwright && npx playwright install chromium` once, then
`node tests/browser-smoke.js patched.html --baseline original.html --shots shots/`.
Offline, add `--cdn-map tests/cdn-map.json` after vendoring the sim's CDN
libs (`npm pack three@0.128.0 chart.js@4.4.0`, extract, fix paths in the
map). Add a `<sim>.checks.js` for per-card state assertions
(`tests/double-slit.checks.js` is the worked example). Run it again with `--theme-toggle <selector>` on sims with a theme switch and
once with `--viewport 1024x768`; it includes an alpha-aware contrast check.
Review screenshots (both themes).

Suggested order per sim: guided-inquiry first (if the sim has/needs one),
then controls-tutorial, then welcome-overlay, then every verifier plus the
browser smoke.

## Card voiceover + Auto walkthrough (added Sept 2026, validated on C025)

Both flows can carry narration: a Listen row (play/pause + Auto pill) above
the Guided Inquiry pager, and a two-row Controls Guide nav (transport + Auto
over the card nav). One shared speech engine drives both — per-card
play/pause/resume/replay, card-synced narration on every navigation route,
and Auto walkthroughs (the inquiry Auto waits at prediction gates, reads the
feedback after the student commits, then continues; it never answers).
Everything — engine, markup, CSS, controller deltas, the behaviour contract,
and the hard-won Chrome TTS pitfalls (deferred speak, guarded cancel, remote-
voice hang watchdog, real-gesture-only testing) — is verbatim in
`controls-tutorial/references/implementation.md` §6; the guided-inquiry and
welcome-overlay SKILLs point there. Apply it after the three base skills.
The reference build is `../sim-use-builds/C025-projectile-motion-ground-to-ground.html`.
