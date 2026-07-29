# The Damped Harmonic Oscillator
**Lecture 17 · L17-The damped HO.html**

**System:** damped 1-D oscillator `ẍ + 2αẋ + ω₀²x = 0` (ω₀ = 3, x₀ = 1 m, ẋ₀ = 0); teaches the three regimes and that the slowest-decay exponent λ(α) peaks at critical α = ω₀.
**Verdict:** Models correctly and works. Physics is exact closed-form in all three regimes; the λ peak, the critical-fastest race, and the labelled ⚠ "naive e^(−αt)" counterfactual are all right. No P0/P1 physics bugs found. One dead no-op and minor pedagogy/polish nits only.
**Browser-probe:** Ran — `errors: []`, 5 swept states + 2 driven states (map-open, race). Readouts track α correctly: α=0.60→λ=0.60 (under), α=3.00→λ=3.00 (peak, meter full), α=6.00→λ=0.80 (over, meter fallen), matching node to 3 sig figs.

## PHYSICS

### P0
none.

### P1
none.

### P2
- [low] **α = 0 labelled "UNDERDAMPED".** `regimeOf` (line 803) returns `'under'` for all `a < ω₀` including exactly 0, so the badge reads UNDERDAMPED at α=0 (fn `updateReadouts`, line 1100), which is really the *undamped* SHM limit that never settles. The hover title (line 1101) correctly says "α = 0: no friction at all — it never settles," so it's disclosed, not wrong. Canonical: α=0 is undamped (conservative SHM), α∈(0,ω₀) underdamped. → **Fix:** show an "UNDAMPED" badge label when `S.alpha < 1e-9`. [evidence: `alpha-min-0.png` — pure ±1 cosine, no decay envelope, badge says UNDERDAMPED]

## NON-PHYSICS

### P0
none.

### P1
- [functional][high] **`updateInquirySteps()` is dead code** (lines 842–854). It maps ids `inq-step1..4` via `getElementById`, but no element with those ids exists — the inquiry cards use the `.inq-step` *class* with different ids (only reference is the array literal at line 843). Every lookup returns null and the `if(!el) return;` guard skips the whole loop, so the four calls (lines 1237, 1248, 1289, 1310) do nothing. Harmless but misleading dead code. → **Fix:** remove `updateInquirySteps` and its four call sites, or wire it to the real `.inq-step` cards / `#inq-dots` if per-step progress marking was intended. [matches the FILE NOTE "dead guarded no-op"]

### P2
- [pedagogy][low] **λ(α) map collapsed by default** (`DECAY-RATE MAP λ(α)` panel starts closed). The map is the sim's central payoff — the sharp peak at ω₀ — yet a student never sees it unless they expand the panel. → **Fix:** open the map panel by default (or auto-open it at inquiry step 6 "λ peaks at α = ω₀"). [evidence: collapsed in all 5 probe states; only visible after manual expand in `probe2__map-open-a4.5.png`]
- [pedagogy][low] **"Fastest return" vs the 2%-settling-time nuance.** The sim (correctly) frames the peaked quantity as the *decay exponent* λ, and the race (0.6/3/6) genuinely has critical first. But the *2%-settling-time* is actually minimized near α≈2.34, not exactly at ω₀, because critical's `(1+ω₀t)` prefactor slows the tail. The copy never claims critical globally minimizes settle time (it says "fastest return that never overshoots," which is exact), so this is not a bug — just a subtlety worth guarding if future copy is edited. [verified with node: settleTime min at α≈2.34 = 1.20 s; critical settle = 1.94 s]

## Browser-test evidence
- α = 0.60 (initial/after-play) → underdamped trace crosses x=0 and rings; badge UNDERDAMPED; λ=0.60; mass+trace advance on play. vs expected: ✓ (`initial.png`, `after-play.png`)
- α = 0 (slider min) → pure ±1 cosine, no decay envelope, energy conserved, λ=0.00, meter empty. vs expected undamped SHM: ✓ (`alpha-min-0.png`)
- α = 3.00 (slider mid) → monotonic approach to x=0 with NO overshoot; badge CRITICAL α=ω₀; λ=3.00, meter full = peak. vs expected critical: ✓ (`alpha-mid-3.png`)
- α = 6.00 (slider max) → slow crawl (exact purple curve well above the ⚠ red-dashed naive e^(−αt)); badge OVERDAMPED; λ=0.80 (dropped below peak). vs expected overdamped + labelled counterfactual: ✓ (`alpha-max-6.png`)
- α = 4.50, map open → λ(α) curve rises to sharp peak at ω₀=3 then falls; slider dot on descending branch at λ=1.15 (node: 1.146). vs expected dot tracks slider below peak: ✓ (`probe2__map-open-a4.5.png`)
- Race mode, predict "critical", play → strip: "Critical (α=3.00) first — at rest 1.94 s. Heavy α=6.00 still crawling — at rest only 4.96 s." Matches node settle times (1.944 s, 4.959 s). "Your pick — critical — wins." vs expected critical beats both light and heavy: ✓ (`probe2__race-running.png`)
- `go-critical` button: hidden until discovery, then jumps α to exactly 3.00 on click. ✓
- Numerical: ODE residual `ẍ+2αẋ+ω₀²x` ≈ 1e-7 (finite-diff floor) for α∈{0.0001, 0.6, 3, 6}; ICs x(0)=1, ẋ(0)=0; λ peaks at α=3.000 with λ_max=3.0000; λ continuous across critical. Integrator = exact closed form (no drift/blow-up possible).

## To verify (human)
- Confirm the P2 badge nit (α=0 → "UNDERDAMPED") is acceptable pedagogically or should read "UNDAMPED".
- Decide whether the λ(α) map should open by default given it is the sim's core takeaway.
- Optional: confirm removing dead `updateInquirySteps()` (vs wiring it to real inquiry cards) is the intended cleanup.
