# Special Relativity Simulation Studio

## What this project is

14 interactive physics simulations (single-file HTML) for teaching Special Theory of Relativity. Each simulation is self-contained with vanilla JS, Canvas 2D rendering, and inline CSS. No build step — open the HTML file in a browser.

## Simulation inventory

| File | Topic | Key physics |
|------|-------|-------------|
| `Galilean transformations_refined_1.html` | Galilean transforms | x' = x − vt, t' = t (pre-relativistic) |
| `Michelson_Morley_2_STR.html` | Michelson-Morley experiment | Null result, no ether wind, path-length argument |
| `Time_dilation_STR.html` | Time dilation | Δt = γΔt₀, light clock visual |
| `Time_dilation_refined_1.html` | Time dilation (v1 refinement) | Same physics, improved visuals |
| `Time_dilation_refined_2.html` | Time dilation (v2 refinement) | Same physics, further polish |
| `Light_clock_refined_1.html` | Light clock | Photon bouncing, Pythagoras → γ derivation |
| `Length_contraction_refined_2.html` | Length contraction | L = L₀/γ, contracted rod visual |
| `Simultaneity_principle_STR.html` | Relativity of simultaneity | Two lightning flashes, train observer vs ground |
| `Einstien_s_Train_Paradox_refined_1.html` | Einstein's train paradox | Extended simultaneity demo with moving frame |
| `Relativistic_velocity_addition_STR.html` | Velocity addition | v_rel = (v₁+v₂)/(1+v₁v₂/c²) |
| `Mass_correction_refined_1.html` | Relativistic mass | m = γm₀ (relativistic momentum framing) |
| `Mass_energy_equivalence_STR.html` | E = mc² | Rest energy, mass-energy conversion |
| `Twin_Paradox_STR.html` | Twin paradox | Asymmetric aging, worldlines |
| `Twin_paradox_STR_sim_2.html` | Twin paradox (v2) | Alternative visualization |

## Core physics constants and formulas

All simulations use natural units where c = 1 (velocity as fraction of c), except:
- `Einstien_s_Train_Paradox_refined_1.html`: c = 300 (pixel speed)
- `Simultaneity_principle_STR.html`: c = 300 (pixel speed)
- `Length_contraction_refined_2.html`: c = 1

### Lorentz factor (γ)
The central formula. Two equivalent implementations exist across the codebase:
```javascript
// Pattern A: standalone function (most sims)
function calculateLorentzFactor(v) {
    return 1 / Math.sqrt(1 - v * v);
}

// Pattern B: named lorentzFactor (Length_contraction)
function lorentzFactor(v) {
    return 1 / Math.sqrt(1 - (v * v) / (c * c));
}
```

### Critical physics rules (MUST hold in every simulation)

1. **γ ≥ 1 always**. γ = 1 at v = 0, γ → ∞ as v → c. Never < 1.
2. **v < c always** for massive objects. Slider must never allow v ≥ c (or v/c ≥ 1).
3. **Time dilation**: moving clocks run slow. Δt_moving = γ × Δt_rest. The moving frame's time is LONGER (more elapsed time for the same proper interval).
4. **Length contraction**: moving objects are shorter. L = L₀/γ. The moving frame's length is SHORTER.
5. **Velocity addition**: v_rel = (v₁+v₂)/(1+v₁v₂/c²). Result is always < c when inputs are < c.
6. **Twin paradox**: the travelling twin is YOUNGER on return (fewer proper time ticks).
7. **Galilean limit**: all relativistic formulas must reduce to classical at v << c (γ ≈ 1).
8. **E = mc²**: rest energy E₀ = m₀c². Total energy E = γm₀c².

## Code patterns across simulations

- **Velocity input**: range sliders with v as percentage of c (0–99%) or fraction (0–0.99)
- **Animation**: requestAnimationFrame loop with dt-based updates
- **State**: module-level let/const variables (no shared state object)
- **Canvas**: 2D context rendering, responsive resize handlers
- **Theme**: some sims have light/dark toggle
- **Reset**: most sims have play/pause and reset buttons

## When reviewing or modifying

1. Always verify γ formula: `1 / Math.sqrt(1 - v*v)` — NOT `Math.sqrt(1 - v*v)` (common error: forgetting the 1/)
2. Check v=0 edge case (γ should be exactly 1, no division issues)
3. Check v→c edge case (γ→∞, simulation should clamp or handle gracefully)
4. Verify slider bounds prevent v ≥ c
5. Check sign conventions: is the moving frame going left or right? Are transforms consistent?
6. In simultaneity sims: verify that events simultaneous in one frame are NOT simultaneous in the other
7. In twin paradox: verify the asymmetry — only the travelling twin accelerates/decelerates

## CCC Dance protocol

This project uses the CCC Dance builder-critic protocol for QC. See `.claude/ccc-dance.md` for the full protocol. Physics validation rules are in `physics-checklist.md`.
