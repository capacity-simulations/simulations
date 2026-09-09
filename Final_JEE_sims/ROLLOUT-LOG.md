# User-version rollout ledger
Target: all module sims → four layers (inquiry button contract, controls guide, welcome, voiceover+auto) → sim-use-builds/, then module replacement at the end.
Verify gate per sim: GI + CG + WO verifiers, node --check, unique ids, hooks. Status: PENDING / BUILT / VERIFIED / FAILED(reason)

## Done pre-rollout
- C025-projectile-motion-ground-to-ground — VERIFIED (reference build)
- C203-refraction-and-snells-law — VERIFIED (eval build)
- C183-magnetic-flux-and-faradays-law — VERIFIED
- C028-relative-velocity-in-2d-river-boat-rain-man — VERIFIED (agent gates green, 186k tok)
- C024-relative-velocity-in-one-dimension — VERIFIED (agent gates green, 196k tok)
- C023-reading-x-t-v-t-and-a-t-graphs — VERIFIED (agent gates green, 206k tok)
- C041-banking-of-roads — VERIFIED (agent gates green, 215k tok)
- C021-equations-of-motion-for-uniform-acceleration — VERIFIED (agent gates green, 201k tok; fixed broken data-fb attr + staged a lookup leak)
- C037-static-and-kinetic-friction — VERIFIED (agent gates green, 225k tok; NOTE: pre-existing theory-curve lookup leak reported, not fixed — structural)
- C030-newtons-first-law-and-inertia — VERIFIED (agent gates green, 193k tok; original read-only, untouched)
- C036-pseudo-forces-and-non-inertial-frames — VERIFIED (agent gates green, 221k tok; async-boot split applied per skill pitfall)
- C033-free-body-diagrams-the-master-skill — VERIFIED (agent killed at reporting stage by session limit; build complete, rescued and independently gated)
- C039-motion-on-inclined-planes-with-friction — VERIFIED (same rescue; 6 cards / 16 steps)

## Batch 1 (Module-01 + Module-02): 10/10 VERIFIED by independent sweep 2026-09-04
- SKIPPED: C054--momentum-and-energy variant (older Aug-22 twin of the live C054; flagged for user decision — likely superseded leftover)
- C025--with-air-drag: distinct sim (drag variant), added to queue as OPEN
- C046-work-energy-theorem — VERIFIED (206k tok)
- C064-parallel-and-perpendicular-axis-theorems — VERIFIED (212k tok)
- C063-moment-of-inertia-and-radius-of-gyration — VERIFIED (209k tok; boot→paused per GI boot rule)
- C055-collisions-in-2d — VERIFIED (239k tok; fixed a feedback line leaking engine jargon)
- C051-conservation-of-mechanical-energy — VERIFIED (223k tok; added anti-lookup staging for the finish-speed readout)
- C062-torque-moment-of-force — VERIFIED (214k tok; fixed a card claiming an action onStep already performs)
- C054-elastic-and-inelastic-collisions-in-1d — VERIFIED (214k tok; copyright re-scan clean)
- C042-vertical-circular-motion — VERIFIED (250k tok; added latch-safe staging for a panel that showed the predict answer)
- C059-impulse-momentum-theorem — VERIFIED (238k tok; staged a note that answered its own predict)
- C053-potential-energy-curves — VERIFIED (220k tok)

## Batch 2 (Module-02 tail + Module-03 + Module-04 head): 10/10 VERIFIED by independent sweep

## Browser flow sweep 2026-09-04 (tools/flow-probe.mjs, real headless Chrome)
- 32 builds swept · 31 clean · 1 BROKEN: C070-rolling-on-an-inclined-plane
- C070 root cause: pxPerM went negative when availH < bodyReserve before layout settled → arc() IndexSizeError → Shell.init aborted → controls guide dead + no active inquiry card. PRE-EXISTING in the original (verified identical). Fixed in the user version by clamping pxPerM positive; re-probed clean (9/9 CG steps, card 1 active, free-explore clean).
- NOTE: the original Module-04 C070 still carries the bug; the user version supersedes it at replacement time.
- flow-probe is now a mandatory gate in the Cursor command + rule.

## Cursor-build eval 2026-09-04 (17 builds)
- static battery (syntax/ids/hooks/copyright/structure): 17/17 ok
- jsdom gates (GI+CG+WO): 17/17 PASS
- deep browser eval (tools/user-version-eval.mjs): 17/17 ok — overlay present+visible, z=5000, hero canvas painted, all 3 mode cards, __setMode wired; inquiry mode opens a visible card with Listen row; voiceover engine present and play/Auto react; controls mode gives 2-row nav + 4 transport buttons + glow + masking, every step walked on-screen; free mode hands over with no residue and no speech leak; zero console exceptions
- NOTE: C100 was caught mid-build by the first pass (markup+CSS only, no engine/welcome script) and completed by its tab minutes later — file-existence is NOT a completion signal; gates are.
- GATE GAP FOUND: the welcome-overlay jsdom verifier PASSED C100 while __setMode and the welcome script were absent. tools/user-version-eval.mjs closes this.

- Title-consistency fix: C081 welcome-name "Four conic sections" -> "Orbits" (matched top bar); C054--momentum-and-energy welcome-name "Collisions in 1D" (the OTHER sim name) -> "Collisions: momentum & energy". Speech line 1 updated to match in both. Gates + deep eval re-run clean.
- Outstanding (not fixed, cosmetic): 12 sims where welcome-name is a different short form of the top-bar title.
- C198-displacement-current — VERIFIED (212k tok; NOTE pre-existing lookup leak on card 2 predict, reported not fixed)
- C192-ac-through-r-l-and-c — VERIFIED (226k tok; fixed 2 factual card errors: wrong transport button, wrong trace colour)
- C194-lcr-resonance — VERIFIED (208k tok; NOTE pre-existing lookup leak card 4 + a card mis-describing panel position)
- C190-lr-circuit — VERIFIED (206k tok; fixed a card referencing the deleted 🎓 button)
- C193-series-lcr — VERIFIED (232k tok; added applyStepReveals indirection so __cgReveals is real not a no-op)

## Full eval sweep 2026-09-04 evening (5 parallel agents, 49 new builds)
- static battery: 49/49 clean
- jsdom gates (GI+CG+WO with baselines): 49/49 PASS
- deep browser eval (overlay, 3 modes, GI card visible, CG walk, voiceover wiring, free handover, console): 49/49 ok
- With prior evals this covers EVERY build on disk. Zero broken sims.
- C213 note: welcome verifier needs --baseline (three.js CDN absent in jsdom, error pre-exists in original); different top-bar structure (no .shell-title) — overlay name matches <title>. Not a defect.
- Title alignment: 7 misleading (C055 C062 C067 C123 C136 C160 C223) + 15 partial — pending user decision.

## CORPUS COMPLETE 2026-09-04 — 100/100 module sims + 3 root sims built
- Final 5 (C161 C166 C169 C170 C171): static clean, jsdom 15/15 PASS, deep browser eval 5/5 ok
- EVERY build has now passed the full battery. Zero broken sims.
- Title issues on the final 5: C169 overlay says "Cyclotron clock" but the sim is Charge in a Magnetic Field (C170 is the cyclotron!) — MISLEADING/cross-sim; C161 "Kirchhoffs laws" vs "Circuit Lab 3D"; C171 "Force on a wire" vs "F = B I L sin θ" — misleading tier now 10 total.

## Title fixes 2026-09-04 (6 applied, verified)
- C055 "Collisions in 2D"->"Glancing collision" · C062 ->"The beam that will not turn" · C123 ->"Two springs, one mass" · C136 ->"Beats" · C161 ->"Circuit Lab 3D" · C169 "Cyclotron clock"(WRONG SIM)->"Charge in a magnetic field"
- Speech line 1 updated to match in all 6. All gates + deep eval re-pass 6/6.
- 4 of the earlier "misleading 10" were false positives once full top-bar (incl. subtitle) was read: C067, C160, C171, C223 — overlay text is verbatim in the top bar; left unchanged. Plus earlier fixes C081, C054-momentum.
- Remaining: 15 cosmetic partials, deliberately left.
- C161 title fix REVERTED per user: overlay stays "Kirchhoff's laws" (not "Circuit Lab 3D"); speech line restored; all gates re-pass
- C161 re-set to "Circuit Lab 3D" per user clarification (the earlier revert was a misunderstanding); gates re-pass

## Newton catalog trio 2026-09-04
- Catalog total is 102 = our 100 + C031 + C032, all three the SAME sim differing only in the boot scene line (verified by diffing the S3 objects).
- Built C031 (boot+free scene ② F=ma) and C032 (boot+free scene ③ pairs) from the verified C030 user version; C030 free-explore changed to land scene ① per user directive (was post-completion scene ③).
- All 3: jsdom gates PASS (baselined against the true S3 originals), deep eval ok, and a scene-fingerprint probe confirms boot AND free-exploration land the correct law in real Chrome.
- Module copy of C030 re-synced to the updated build. AWAITING USER GO-AHEAD for the S3 batch upload.

## S3 BATCH UPLOAD COMPLETE 2026-09-04
- Manifest: 102 catalog rows -> unique uuid-matched keys -> local builds; 0 ambiguities
- All 102 current objects backed up locally before writing
- Upload: single recursive put, content-type text/html
- Readback: 102/102 byte-identical to local user versions
- Blast-radius check: exactly the 102 manifest keys modified today; the other 89 sim objects untouched
- Zero database changes; id/slug/sim_path preserved on every row

## Voiceover fixes 2026-09-04 evening
- Removed welcome auto-start in all 105 builds (platform same-origin iframe inherited click activation -> reliable autoplay)
- Added pagehide -> speechSynthesis.cancel() (Chrome keeps a removed iframes speech playing; platform modal unmounts without cancelling)
- Harness-proven: pagehide fires on iframe removal, cancel runs (3/3), player idle at load; deep-eval regression 3/3
- Module copies re-synced 100/100
- S3 re-push complete: 102/102 uploaded + readback byte-identical; fix markers verified in every readback and via the live serve route

## Newton trio → three distinct per-law sims 2026-09-05
- Per-law overlay titles/intros/speech + custom heroes (C031 F=ma 2-row, C032 recoil pair)
- Scene switcher REMOVED in all three; each locked to its law (boot + free-explore + finish)
- Guided inquiry split: 4 cards each (orient → gated predict → observe → synthesis), per-law only
- Controls guides retargeted (C032 guides mA/mB; F/m steps removed); __cgPrepare deleted; info modals per-law; C032 counterfactual relabeled "F ∝ mass"
- Welcome verifier updated: now asserts NO auto read-aloud (design changed 09-04)
- All gates + deep eval + CDP walks pass on all three. AWAITING GO for S3 push (these 3 keys).

## C041 banked-turn scene rebuilt as a true cross-section 2026-09-07
- Was authored as an inclined plane (flat ground + pivot + ramp + lane dashes running up the tilt), which fed the classic incline/banked-curve misconception
- Now a slice across the carriageway: tarmac slab on a battered embankment, datum line, kerb + guardrail, cross-section paint marks only
- Added the cues that separate a TURN from a hill: ⊗ "into the page" badge + ⊗ on the car, plan-view inset (arc, centre, r, travel arrow), "to the centre of the turn" arrow
- Rear-view car reproportioned (62x50, tapered roof, plate, contact-patch tyres, tight shadow) with <=3 deg suspension roll driven by the in-plane imbalance
- Welcome hero rebuilt to match; friction label no longer lands on the car
- Earlier same-day: unclosed .inq-listen div (controls were nested in #aside-inquiry, invisible in free mode); all canvas subscripts (v_d, v_min, v_max, F_c) now render as real subscripts
- Gates hardened: user-version-eval asserts controls are PAINTED in free mode + not nested in the inquiry zone (catches the div bug); flow-probe accepts module-relative paths
- Verified: 3 jsdom gates, deep eval, flow-probe, 12-sim no-false-positive sample, light+dark themes
- AWAITING GO for S3 push (C030, C031, C032, C041)
