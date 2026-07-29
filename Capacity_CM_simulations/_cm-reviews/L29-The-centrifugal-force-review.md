# The Centrifugal Force
**Lecture 29 · L29-The centrifugal-force-shell.html**

**System:** A ball held at radius r₀ on a carousel spinning at ω is released; the sim shows the *same* motion in the ground (inertial) camera — a straight tangential line — and in the rotating camera — an apparent outward-curving spiral — teaching that centrifugal F=mω²r is fictitious (rotating-frame-only). **Verdict:** Physics models correctly; frame transforms, release kinematics, and F_cf scaling all verified. Works cleanly. **Browser-probe:** ran, `errors: []`, 8 sweep states + 5 driven full-run states; F_cf badge and `__audit` scale exactly as ω²·r.

## PHYSICS

### P0
none.

### P1
none.

### P2
- [med] Friction phase uses `aF = μ·g` with `μ=0.40` (`computeE`, L959) applied only *after* the ball crosses the platform rim (`launched`, L964–972); while on the frictionless platform (`phase==='slide'`) it coasts at constant v₀, then decelerates on the floor. This is a reasonable modeling choice (labelled "platform frictionless · floor μ=0.40" in the ground legend, L1124) but is a pedagogical embellishment beyond the core lesson — the straight-line inertial path is what matters and it is correct either way. No fix needed; noting for transparency.
- [low] `st.Fcf = m·w²·rNow` (L1010) uses the ball's *instantaneous* radius after release, so the displayed/arrow F_cf keeps growing as the ball moves outward. That is the correct rotating-frame centrifugal magnitude at the ball's current position, but the badge (`updateNums`, L1203–1204) and `__audit` (L803) report F_cf at the *hold* radius r₀. Two internally-consistent but distinct quantities share the "F_cf" name; harmless since they coincide at/while held. **Fix (optional):** label the moving arrow "F_cf at current r" to distinguish it from the r₀ badge.

**Verified analytically (`node`):**
- Release velocity from the hold formula `v={w·p.z, −w·p.x}` equals `v₀·û` with `û={−sin θ_R, −cos θ_R}` and `v₀=ω·r₀` — i.e. the "Reality" release is exactly the pre-existing tangential velocity (no new force). ✓
- Claim unit `û_c={cos θ_R, −sin θ_R}` is the radial-outward direction, perpendicular to the tangential reality (`û_c·û = 0`) — the labelled ⚠ "fling" counterfactual, correctly the wrong (radial) launch. ✓
- Rotating-frame velocity `rv = v − Ω×r` with `Ω=+ω ĵ` gives `(v.x−ω·p.z, v.z+ω·p.x)`, matching code L1012. Coriolis `−2mΩ×v′` matches L1013. Trail world→platform transform is `R_y(−θ)`, matching L1029–1030. ✓
- `F_cf = m·ω²·r₀ = 4.50 N` at defaults (ω=1.5, r₀=2) matches badge and `__audit`. ✓
- `dE = √(Rp²−r₀²)` (L957) is the correct straight-tangent chord length from radius r₀ to the rim Rp; r₀∈[0.5,3] < Rp=3.4 always, so never imaginary. ✓

## NON-PHYSICS

### P0
none.

### P1
none.

### P2
- [ux][med] After `Maximize`, the split view's shared orbit camera tilts to a steep top-down angle that foreshortens the trails (see DRIVE_split_naive_big_end.png); trajectories read much more clearly in the non-maximized full-run captures. Minor; the default (non-maximized) framing is good. **Fix (optional):** clamp the polar angle a touch shallower for the split layout.
- [pedagogy][low] The centrifugal arrow and its "· fictitious" suffix (L1118) appear only in the rotating pass (`arrCf.visible = pass.f==='r'&&st.showF`, L1150) — correct — but the Coriolis toggle defaults OFF ("Coriolis arrow: OFF" badge). Fine as a progressive-disclosure default; the eq panel (L540) and audit still cover Coriolis. No fix needed.

## Browser-test evidence
- ω sweep at r=2 (probe): ω=0 → F_cf 0.00 N; ω=1 → 2.00 N; ω=2 → 8.00 N. **∝ω² confirmed** (audit: 0, 2, 8). No fling at ω=0 — ball at rest, platform static (sl-omega-min-0.png).
- r sweep at ω=1.5 (probe): r=0.5 → 1.13 N; r=1.75 → 4.05 N; r=3 → 6.75 N. **∝r confirmed** (audit: 1.125, 4.05, 6.75).
- Ground frame, full episode → ball's path is a **straight tangent line** from the release point out to rest; no F_cf arrow (fictitious force absent in the inertial frame), only real-force legend (DRIVE_ground_full.png). Matches expected inertial straight-line release.
- Rotating frame, full episode → **same** motion re-described as an outward-**curving spiral** ending "at rest (rotating view)" with a violet F_cf arrow present (DRIVE_rot_full.png). Matches expected rotating-frame apparent path.
- Split (Ground ↔ Rotating), naive mode → both viewports render populated trails with distinct legends ("real forces" left, "F_cf = mω²r" right), no blank/NaN, no cross-panel overlap (DRIVE_split_naive_big_end.png).
- Extremes (r=3 near rim Rp=3.4, ω=2) render sensibly, badge updates, no overlap/NaN (sl-r-max-3.png, sl-omega-max-2.png).
- Probe `errors: []` across all 8 states; `playLabel` toggles correctly; sliders restart the episode and clear trails (`paramChanged`→`resetEpisode`, L1226).

## To verify (human)
- Watch a live full run in the browser (non-headless) to confirm the ground trail is dead-straight for several ω/r₀ combinations and that the rotating spiral curvature visibly increases with ω (the ω²-dependence of apparent deflection), and that the naive "fling" ghost ball launches radially while the reality ball launches tangentially at the same speed.
- Confirm the episode ends and holds at rest (does not silently loop) after `t > E.tRest` for min and max slider settings.
