# MODULE domain.quantum  (v1.0)
DEPENDS: core.complex, core.fft, core.roots, core.special, core.sample
NAMESPACE: Engine.quantum

## API
- makeGrid({n, xMin, xMax}) -> grid                // {n, xMin, xMax, dx, x, k}; n a power of 2 (throws otherwise); k FFT-ordered
- gaussianPacket(grid, {x0, k0, sigma}) -> psi     // normalized {re, im} Float64Arrays; mean position x0, mean momentum hbar·k0;
  // sigma is the std of |psi|² in x (envelope e^{−(x−x0)²/4σ²}): Δx = σ, Δk = 1/(2σ)
- makeSplitOperator({grid, V, hbar, m, absorber}) -> op
  // V: Float64Array of grid.n potential samples on grid.x (NOT a function).
  // op.step(psi, dt, substeps): psi IN PLACE, substeps applications of the dt
  //   splitting — advances time dt·substeps (dt is per-substep, never
  //   subdivided); unitary Strang, phases cached per dt.
  // absorber {width, strength = 0.15, hardWidth = min(50, width/4)}: per-side
  //   zone of width grid SAMPLES; outermost hardWidth zeroed, rest damped;
  //   op.absorbedLeft/.absorbedRight track removed probability (norm +
  //   absorbed stays 1); op.resetAbsorbed()
- prob(psi, out) -> Float64Array                   // |psi|² per sample — the ONLY source of detection statistics
- normSq(psi, dx) -> number                        // sum |psi_i|²·dx (1 when normalized)
- expectation(psi, grid, 'x'|'p', {hbar}) -> number // mean position, or mean momentum via the FFT spectrum
- findBoundStates(V0, a, {hbar, m}) -> states      // finite well depth V0, HALF-width a; [{E, parity, k, kappa}] sorted by E, E in (−V0, 0)
- transferMatrix(E, segments, {hbar, m}) -> {T, R} // piecewise-constant [{V, width}] between V = 0 leads; handles E≈V degenerate branch; T + R = 1
- transmissionRect(E, V0, width, {hbar, m}) -> T   // closed form, one rectangular barrier; sinh (E<V0) / sin (E>V0) branches + E→V0 limit
- radialRnl(n, l, r, {a0}) -> R_nl(r)              // hydrogen radial function, orthonormal in ∫R²r²dr
- sampleDetection(pdfArray, grid, rng) -> x        // ONE detection position drawn from a density array (e.g. prob(psi)); rng injectable

## VOCABULARY
wavefunction psi, probability density |psi|², amplitude, superposition,
interference, eigenstate, energy level, bound state, tunneling, transmission/
reflection probability, expectation value, measurement, detection event,
collapse (instantaneous replacement of psi). Units hbar = m = 1 unless passed.

## USAGE
    const grid = Engine.quantum.makeGrid({n: 2048, xMin: -100, xMax: 100});
    const psi = Engine.quantum.gaussianPacket(grid, {x0: -40, k0: 2, sigma: 5});
    const op = Engine.quantum.makeSplitOperator({grid, V, absorber: {width: 256}});
    op.step(psi, dt, 4);                            // advances t by 4·dt — the only update
    const density = Engine.quantum.prob(psi);
    const hit = Engine.quantum.sampleDetection(density, grid, rng); // a point, drawn
    const { T, R } = Engine.quantum.transferMatrix(E, [{V: V0, width: w}]);

## NEGATIVE CONSTRAINTS — read before writing any code
- NO trajectories: nothing travels from source to screen; a particle has no
  position between preparation and detection; detection events are sampled
  from |ψ|² (sampleDetection) — never animated as a moving dot along a path.
- NO classical vocabulary for quantum objects: never "ball", "bounces",
  "path", "orbit", "the electron goes through slit A".
- NO force-based updates on ψ: evolution is splitStep/eigenphases only —
  never v += F*dt on a quantum state.
- Collapse is instantaneous replacement of ψ, not motion: after a measurement,
  overwrite ψ with the post-measurement state in one frame — never animate ψ
  "shrinking" toward the outcome.
- In comparison sims, classical concepts live exclusively in the classical
  panel using domain.mechanics — never imported into quantum rendering or
  update code.
- Probabilities come only from prob/normSq/transferMatrix/transmissionRect —
  never from counting pixels or ad-hoc renormalization; if norm drifts,
  the step is wrong (or belongs to the absorber accounting).
