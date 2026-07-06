# SR Physics Review Rubric

A deep, code-level physics pass for one sim. Output is a **candidate analysis to
support the human physicist's manual check** — state findings with reasoning and a
confidence level; never assert the physics is settled-wrong.

Confidence tags: **[high]** clear from the code · **[med]** likely, worth checking ·
**[low]** a hunch / needs the human. Severity: P0 wrong physics · P1 misleading ·
P2 imprecise.

Anchor every claim to code (`function name` / line) and, where relevant, to the
concept in this sim's `_review/syllabus.md` entry.

---

## 1. Concept fidelity (does it model the right SR idea?)
- Identify the physical concept the sim claims (from the syllabus entry) and the
  one the code actually implements. Do they match?
- Correct regime: inertial frames (constant relative velocity), flat spacetime,
  1+1 or 2+1 D as appropriate. Flag any hidden acceleration, gravity, or medium.
- Unit convention stated and consistent (SI vs natural units c = 1). If c = 1,
  say so; if SI, check c appears correctly in every formula.

## 2. Equations (are they the right SR equations, correctly written?)
Check each formula present against the canonical form; verify signs, factors, and
domains. Common ones and what to verify:
- **Lorentz factor** γ = 1/√(1 − β²), β = v/c. Domain guard for β → 1 (γ → ∞).
- **Lorentz transform** ct′ = γ(ct − βx), x′ = γ(x − βct). Correct sign of β per
  boost direction; inverse uses +β.
- **Rapidity** φ = artanh β; β = tanh φ, γ = cosh φ, βγ = sinh φ. Boost as a
  hyperbolic rotation: matrix [[cosh φ, −sinh φ],[−sinh φ, cosh φ]].
- **Invariant interval** ds² = (cΔt)² − (Δx)² (this course's convention → timelike
  > 0). Same sign rule everywhere: computation, classification, colours, text.
- **Time dilation** Δt = γΔτ (moving clock runs slow); **length contraction**
  L = L₀/γ. Check which frame is proper (τ, L₀) — a swapped γ vs 1/γ is the classic bug.
- **Velocity addition** w = (u + v)/(1 + uv/c²). Check the denominator and that
  |w| < c for |u|,|v| < c.
- **Relativistic momentum / energy** p = γmv, E = γmc², E² = (pc)² + (mc²)²;
  massless: E = pc. Check conservation in collisions uses 4-momentum, not classical p.
- **Relativistic Doppler / aberration**, **constant proper acceleration**
  (hyperbolic worldline x² − (ct)² = (c²/α)²), **proper time** τ = ∫√(1 − β²) dt.
- Every symbol defined on first use; no quantity shown alongside its square; no
  invented symbol where a standard one exists.

## 3. Numerical methods
- Integrator: analytic closed-form (preferred where possible), Euler, semi-implicit,
  RK4? Is it adequate for the dynamics shown, or will it drift/blow up?
- `dt` handling: shell passes an already-speed-scaled, clamped dt to `onFrame`.
  Confirm the sim doesn't also clamp/scale twice or read wall-clock separately.
- Stability & guards near singularities: β clamped below 1; no √(negative);
  `atanh`/`asin` domain-guarded; no divide-by-zero at v = 0 or γ → ∞.
- Precision: does it hold up at extreme β (0.99+)? Are large γ values rendered
  honestly (clip with "→ ∞", not a silent plateau)?
- Determinism: does Reset reproduce the exact initial state?

## 4. Architecture & flow of the physics engine
- **State vs render separation:** is physics state a clear module-local model, with
  drawing derived from it — or is state tangled into draw calls?
- **Update path:** `onFrame(dt)` advances state then renders; one source of truth
  for time. No physics running inside event handlers in a way Reset can't undo.
- **Frame transformations:** world→screen and frame→frame transforms applied
  consistently and in the right order; a frame change relabels axes/redraws the
  grid (it must not look like an event physically moved within a fixed frame).
- **Coupling to controls:** each control maps to a real parameter of the model;
  changing it recomputes the dependent quantities everywhere (no stale numbers).
- **Reset/onReset** restores every state variable, flag, and counter.

## 5. SR animation-honesty traps (each is a common, serious error)
- **No auto-sweeping a velocity/β over time** — a v/c ramping 0→1→0 implies an
  *accelerating* frame; SR frames are inertial. Velocity should be a static slider.
- **A function plot is not a particle** — don't animate a dot travelling a curve
  (e.g. p–v); tie any marker to the slider value.
- **No proper-time clock on a photon** (dτ = 0 on a null worldline); a photon
  marker must not move at the same speed as a massive one.
- **Infinitesimals are symbols, not numbers** ("ds = 0.5" is wrong); a drawn
  differential's length must reflect its value (ds → 0 on the light cone).
- **Re-describing ≠ moving** — a frame control relabels S→S′ and redraws; it does
  not translate an event within one frame.
- **Faithful evolution:** one-pass physics doesn't loop/reverse; unbounded
  quantities visibly continue; plot axes are computed once (no mid-run rescale jump).
- **Causality:** light cone respected; nothing timelike crosses to spacelike
  without it being the explicit point (tachyon/causality sims).

---

## Physics report format (`_review/<sim>-physics.md`)

```
# Physics review — <sim filename>
**Concept (syllabus):** <one line>   **Models correctly:** <yes | partial | no>
**Unit convention:** <SI | c=1 | unclear>

## Equations found
| Quantity | In code (fn/line) | Canonical form | Verdict |
|---|---|---|---|
| γ | ... | 1/√(1−β²) | ✓ / ✗ (why) |

## Numerical methods
- integrator / dt / guards / precision — with risks.

## Architecture & flow
- state↔render, update path, frame transforms, control coupling, reset.

## SR trap checklist
- [pass/fail] per trap in §5, with the code evidence.

## Concerns for manual verification (prioritized)
- P0/P1/P2 · [confidence] · <finding> · <code anchor> · <why it matters>
```
