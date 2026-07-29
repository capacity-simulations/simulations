# Newton's Three Laws
**Lecture 2 · L2-Newtons-laws.html**

**System:** Three tabbed 1-D scenes — ① inertia (F_net=0 ⇒ constant v), ② F=ma (live a=F/m), ③ action–reaction pair (equal-opposite forces, Σp=0, COM fixed) — each with a labelled ⚠ counterfactual mode (Aristotle v=F/k in ①–②; "heavier pushes harder" unequal pair in ③).
**Verdict:** Models the canon correctly; all three laws implemented exactly; counterfactuals are clearly labelled and do not leak into the ✓ Newton mode. No physics bugs found.
**Browser-probe:** Ran (bundled sweep, 14 states, errors:[]) + 2 custom probes (scene-2 audit sweep, scene-3 both modes, scene-1 Aristotle), errors:[] on all.

## PHYSICS
### P0
none
### P1
none
### P2
- [low] Scene ③ counterfactual response ratio is |v_B|/|v_A| = (m_A/m_B)² = 16 (force scaled by m_X/m̄ *then* ÷m), not m_A/m_B. This is inside the ⚠ "heavier pushes harder" mode (`pairForces()`, L791–795) and is a self-consistent counterfactual, so it is not wrong — but the Data-panel note text "|v_B|/|v_A| = … · m_A/m_B = 4.00" invites a comparison that only holds in Newton mode. → **Fix (optional):** in the ⚠ branch, drop or relabel the m_A/m_B comparison line so it isn't juxtaposed against the counterfactual ratio. [high that the physics is intended; low that any change is needed]

## NON-PHYSICS
### P0
none
### P1
none
### P2
- [pedagogy][low] Scene ① lets F≠0 via the force slider, which then accelerates the "inertia" car (a=F/m, `step()` L851–854) and shows `F_net=+10 N`. Physically correct and useful as a "disturb it" exploration, but the scene framing is "F_net=0"; a one-line hint that moving F breaks the balance would prevent a "scene ① also has F=ma" conflation. → **Fix:** add a transient caption when |F|>0 in scene ①.
- [ux][low] The default sweep never leaves scene ①, so `window.__audit.at()` (always scene-②'s P[2]) reads accel:4 across the whole bundled sweep; a reviewer glancing only at the bundled JSON could think the audit is frozen. It is correct — custom scene-② sweep confirms it tracks F and m. → **Fix:** none needed; noted for future probe coverage.

## Browser-test evidence
- Scene ② audit, F=4: m=1→accel 4, m=2→accel 2 (halved), m=8→accel 0.5 — a=F/m exact. (custom-probe stdout)
- Scene ② audit, F=6 m=2 → accel 3; net-4 on m=2 → accel 2 (kernel row (6−2)N/2kg=2 m/s²). (custom-probe)
- Scene ② played ~2 s, F=4/m=1: readout `a=F_net/m=4.00 m/s²`, note "t=2 s → v=8, x=8". (screenshot: custom_s2_played.png)
- Scene ③ Newton, m_A=4/m_B=1: v_A=−1.00, v_B=4.00, |v_B|/|v_A|=4.00=m_A/m_B, **Σp=0.00 kg·m/s**; ⊕ COM sits on dashed start line. (screenshot: custom_s3_newton.png)
- Scene ③ ⚠ naive, sampled over contact: Σp grows 0→1.22→3.02→**4.80** kg·m/s then holds (matches hand calc 4.8); ⊕ COM visibly drifts right of "COM start". (screenshot: custom_s3_naive_end.png)
- Scene ① ⚠ Aristotle: F=0 → v=0.00 (instant rest); F=10 → v=5.00 (=F/k, k=2). Labelled counterfactual behaves as designed. (custom-probe)
- Scene ① m=1: mg=9.8 N ↓ (red) = N=9.8 N ↑ (blue), balanced; m=8: mg=N=78.5 N (=8×9.81), arrows/car scale with mass, no overlaps. (screenshots: L2-Newtons-laws__initial.png, __mRange-max-8.png)
- Scene ① F=+10 N: green v arrow + amber F=+10 N arrow, vertical mg/N still balanced, no element collisions. (screenshot: L2-Newtons-laws__fRange-max-10.png)
- Integrator: exact constant-force update `x+=v·dt+½a·dt²; v+=a·dt` (L853–854); scene ③ segments the step at contact boundaries so impulses are exact (L863–875). Mass slider min 0.5 kg — no ÷0 in a=F/m. No NaN/blank canvas at any extreme; probe errors:[] throughout.

## To verify (human)
- Watch scene ③ Newton mode live end-to-end to confirm the ⊕ COM never leaves the dashed line during AND after contact (probe confirms Σp=0 numerically and end-state screenshot shows COM on the line; a continuous visual pass is the last check).
- Confirm the scene-① "disturb with F" affordance reads as intended pedagogy rather than contradicting the F_net=0 framing (P2 above).
