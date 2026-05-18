# Physics Validation Checklist — Special Relativity Simulations

Use this checklist in every CCC review round. The critic must verify each applicable item.

---

## Universal checks (apply to ALL simulations)

### Lorentz factor γ
- [ ] Formula is `1 / Math.sqrt(1 - v*v)` (not `Math.sqrt(1-v*v)`, not `1 - v*v`)
- [ ] γ = 1.0 when v = 0
- [ ] γ → ∞ as v → c (handled: Infinity return, clamp, or display "∞")
- [ ] γ is never < 1 for any slider position
- [ ] No NaN or imaginary results when v = c or v > c (guard: `if (v >= 1) return Infinity`)

### Velocity bounds
- [ ] Slider maximum prevents v ≥ c (max should be 0.99c or 99% of c, never 1.0 or 100%)
- [ ] No code path allows v to exceed c through calculation (e.g. velocity addition, interpolation)
- [ ] v = 0 is a valid state with no division-by-zero

### Display and numerical
- [ ] Displayed γ value matches the formula (not rounded incorrectly, not showing wrong number)
- [ ] Units are consistent (if c = 1, velocities are fractions; if c = 300, distances in pixels)
- [ ] Labels match what's plotted (e.g., "Time Dilation Factor" actually shows γ, not 1/γ)

### Animation
- [ ] Physics is dt-independent (frame rate doesn't change the physics)
- [ ] Pause/resume doesn't lose or reset state
- [ ] Reset returns all values to initial conditions

---

## Per-simulation checks

### Galilean Transformations
- [ ] x' = x − vt (position transform)
- [ ] t' = t (time is absolute — no time dilation)
- [ ] Velocities add linearly: u' = u − v
- [ ] This is intentionally NON-relativistic — no γ should appear

### Michelson-Morley Experiment
- [ ] With ether wind = 0: no fringe shift (null result)
- [ ] With ether wind > 0: fringe shift appears (hypothetical scenario)
- [ ] Parallel arm time: T_parallel = 2L/(c²−v²) × c = 2Lc/(c²−v²)
- [ ] Perpendicular arm time: T_perp = 2L/√(c²−v²)
- [ ] The historical result is NO shift detected → supports relativity

### Time Dilation (all 3 versions)
- [ ] Moving clock ticks SLOWER (fewer ticks in same wall-clock period)
- [ ] Δt = γ × Δt₀ (moving frame time = gamma × proper time)
- [ ] Light clock path is longer in moving frame (Pythagorean: √(d² + (vt)²))
- [ ] At v = 0, both clocks tick at the same rate
- [ ] The graph of γ vs v is correct: flat near 0, rising steeply near c

### Light Clock
- [ ] Photon bounces vertically in rest frame
- [ ] Photon follows diagonal path in moving frame (longer path → slower tick)
- [ ] Time per bounce: t_rest = 2d/c, t_moving = 2d/(c√(1−v²/c²)) = γ × t_rest
- [ ] Visual photon speed is always c in both frames (not faster in diagonal path)

### Length Contraction
- [ ] L = L₀/γ (contracted length = proper length divided by gamma)
- [ ] Moving object appears SHORTER (never longer)
- [ ] At v = 0, L = L₀ (no contraction)
- [ ] Contraction is only along the direction of motion (height unchanged)
- [ ] Graph of L/L₀ vs v: starts at 1, drops to 0 as v → c

### Relativity of Simultaneity (both versions)
- [ ] Two events simultaneous in ground frame are NOT simultaneous in train frame
- [ ] Train observer sees the front flash FIRST (if train moves toward front flash)
- [ ] At v = 0, both observers agree on simultaneity
- [ ] Time difference in moving frame: Δt' = γv·Δx/c²
- [ ] The sign of the time offset depends on direction of motion

### Relativistic Velocity Addition
- [ ] Formula: v_rel = (v₁ + v₂) / (1 + v₁v₂/c²)
- [ ] When both v₁, v₂ < c: result is always < c
- [ ] When v₁ = c or v₂ = c: result = c exactly (speed of light invariance)
- [ ] Galilean comparison: v_galilean = v₁ + v₂ (can exceed c — this is the point)
- [ ] At low speeds (v << c): relativistic ≈ Galilean (classical limit)

### Relativistic Mass
- [ ] m = γm₀ (relativistic mass increases with velocity)
- [ ] At v = 0: m = m₀
- [ ] As v → c: m → ∞ (display should show this)
- [ ] Graph of m/m₀ vs v has same shape as γ vs v
- [ ] Note: "relativistic mass" is a pedagogical convention; modern physics uses invariant mass + relativistic momentum p = γm₀v

### Mass-Energy Equivalence (E = mc²)
- [ ] Rest energy: E₀ = m₀c²
- [ ] Total energy: E = γm₀c²
- [ ] Kinetic energy: K = (γ−1)m₀c²
- [ ] At v = 0: K = 0, E = E₀ = m₀c²
- [ ] Energy-momentum relation: E² = (pc)² + (m₀c²)² (if shown)
- [ ] Conversion demo: small mass → enormous energy (factor of c² ≈ 9×10¹⁶)

### Twin Paradox (both versions)
- [ ] Travelling twin is YOUNGER on return (fewer proper time ticks)
- [ ] Stay-at-home twin ages normally
- [ ] The asymmetry is caused by the travelling twin's acceleration/deceleration (frame change)
- [ ] Proper time: τ = ∫√(1−v²/c²) dt < t_stay (integral is less than coordinate time)
- [ ] Worldlines: stay-home is straight vertical, traveller has bent/kinked path
- [ ] The travelling twin's worldline is SHORTER in spacetime (less proper time despite more spatial distance)

---

## Common physics errors to watch for

| Error | What it looks like | Correct version |
|-------|-------------------|-----------------|
| Inverted γ | `Math.sqrt(1 - v*v)` | `1 / Math.sqrt(1 - v*v)` |
| Wrong dilation direction | Moving clock ticks faster | Moving clock ticks slower |
| Wrong contraction direction | Moving object gets longer | Moving object gets shorter |
| v ≥ c allowed | Slider goes to 100% or 1.0 | Max is 99% or 0.99 |
| Galilean addition in relativistic sim | v₁ + v₂ without denominator | (v₁+v₂)/(1+v₁v₂/c²) |
| Twin paradox symmetric | Both twins age the same | Traveller is younger |
| γ < 1 | Using `1 - v*v` instead of `1/(1-v*v)` | γ = 1/√(1−v²/c²) ≥ 1 |
| Time dilation inverted | Δt' = Δt/γ for moving frame | Δt' = γΔt for moving frame |
