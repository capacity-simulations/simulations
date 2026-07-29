# The Harmonic Oscillator
**Lecture 6 · L6-The harmonic oscillator.html**

**System:** Two balls released from rest in a 1-D potential well; a two-ball "race" showing the SHM period `T = 2π√(m/k)` is amplitude-independent, contrasted with a *labelled* ⚠ constant-force well `V = F₀|x|` where `T ∝ √A`. Closed-form motion, no integrator.
**Verdict:** Models the canon correctly — SHM `ẍ = −ω²x`, `ω = √(k/m)`, `T = 2π√(m/k)`, amplitude-independence, `E = ½kA²`, and the counterfactual are all exact. No physics bugs found. Works cleanly across all slider extremes.
**Browser-probe:** Ran — `errors: []`, 14 swept states + 1 driven const-mode state; every readout/audit matches analytic values.

## PHYSICS
### P0
- none

### P1
- none

### P2
- [low] Counterfactual recorder traces (`drawRec`/`seg`, ~L1042–1052) render the ⚠ constant-force motion, which is exactly piecewise-**parabolic** (triangle-ish `x(t)`), as a smooth polyline that reads as near-sinusoidal at this sample density. The *physics* (from `constState`, L795–801) is exact and the period contrast (`T₂ > T₁`) is correct; only the eye might infer "sinusoid." Optional. → **Fix (optional):** none needed — arcs are genuinely parabolic and visually close; if desired, add a one-line caption "piecewise-parabolic, not sinusoidal" in const mode. [evidence: const-mode.png shows two different-period, near-sine traces slipping apart]

## NON-PHYSICS
### P0
- none

### P1
- none

### P2
- [pedagogy][low] Amplitude sliders `A₁`/`A₂` (min 0.15, max 0.70) can exceed the labelled axis (ticks to 0.6 m, `XVIEW = 0.78`); at `A = 0.70` the turning-point tick/diamond sits just right of the "0.6 m" label but still inside the frame — no clipping, just visually close. → **Fix (optional):** extend an axis tick to 0.7 m or nudge `XVIEW`; cosmetic only. [evidence: in-a2-max-0.7.png]
- [ux][low] Speed selector is intentionally hidden (L1249–1250) and `window.__audit` returns only `{period}`. Both are by design (audit exposes the amplitude-independent kernel). No action.

## Browser-test evidence
- k = 5 (min) → T₁ = T₂ = 1.987 s; k = 40 (max) → 0.702 s — **raising k shortens T** ✓ (screenshots: in-k-min-5.png, in-k-max-40.png)
- m = 0.2 (min) → 0.628 s; m = 2 (max) → 1.987 s — **raising m lengthens T** ✓ (screenshot: in-m-max-2.png)
- A₁/A₂ swept 0.15 → 0.70 → **T unchanged at 0.993 s** in every state; only E-lines/turning points move — amplitude-independence ✓ (screenshots: in-a1-*, in-a2-max-0.7.png)
- `window.__audit.at()` period matches the `T₁` readout to full precision in all 14 states (e.g. 0.99346, 1.98692, 0.70248) and matches analytic `2π√(m/k)` ✓
- Spring well after-play: two recorder sinusoids of equal period, different amplitude, crossing zero together; "✓ locked in phase: T₁ = T₂" tag; force arrows point inward with ball-2 arrow longer (F = −kx grows with x) ✓ (screenshot: after-play.png)
- ⚠ Constant-F mode (driven): V-shaped well, **equal-length** capped force arrows, traces slip apart, "⚠ slipping apart: T ∝ √A here"; T₁ = 0.993 s, T₂ = 1.405 s (= √2·0.993, exact) — counterfactual correct and clearly labelled, does not leak into spring mode ✓ (screenshot: const-mode.png)
- No NaN/blank canvas, no overlapping readouts/labels at any extreme; energy axis (0–10.5 J) and E-lines stay in-bounds; E = ½kA² independent of m (well unchanged by m slider) ✓

## To verify (human)
- Energy conservation is analytic (`E = Eof(A) = ½kA²` fixed; KE/PE from closed form), so no numerical drift is possible — confirm the collapsed live Energy-ledger shows KE + PE = E constant while playing (code: `updateLedger`, L1089–1095, sets `e1/e2` to `Eof` regardless of position).
- Confirm the F₀ tuning claim in the Info/formal panel: `F₀ = 8kA_ref/π²` makes `T_const(0.30 m) = T_spring` — verified analytically here (F₀ = 4.8634 N, both = 0.9935 s at k = 20, m = 0.5); re-check at other k/m if desired (F₀ scales with k, tuning holds since both T's share the √(1/k) dependence at A_ref).
