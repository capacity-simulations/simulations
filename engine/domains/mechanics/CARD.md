# MODULE domain.mechanics  (v1.0)
DEPENDS: core.roots
NAMESPACE: Engine.mech

## API
- solveKepler(M, e) -> anomaly                     // Kepler equation: e<1 solves E−e·sinE=M (eccentric anomaly), e>1 solves e·sinhF−F=M; throws for e=1 (parabolic)
- orbitFromPeriapsis(a, e, mu) -> orbit            // {r(theta), position(E)->{x,y}, period, energy, angularMomentum, periapsis, apoapsis}; focus at origin, periapsis on +x; specific (per-unit-mass) quantities; 0<=e<1
- pendulumPeriodRatio(theta0) -> T/T0              // exact (2/π)K(sin θ0/2) via AGM, machine precision; theta0 in radians, |theta0| < π
- dragForceLinear(v, b) -> F                       // F = −b·v; number or component array
- dragForceQuadratic(v, c) -> F                    // F = −c·|v|·v; number or component array
- terminalVelocity(m, g, b) -> vT                  // linear-drag terminal speed m·g/b (quadratic: sqrt(m·g/c))
- restitutionCollision1D(m1, v1, m2, v2, e) -> [v1p, v2p]  // 0<=e<=1; e=1 elastic, e=0 perfectly inelastic; ΔKE = −½μ(1−e²)(v1−v2)²
- explosionOutcome(m1, m2, Q) -> [v1, v2]          // fragments from rest sharing p* = sqrt(2μQ); total momentum exactly 0, KE released = Q
- effectivePotential(L, mu) -> Veff                // function r -> −mu/r + L²/(2r²) per unit mass; min −mu²/(2L²) at r = L²/mu
- classifyOrbitByEnergy(E, veffMin, {eps}) -> kind // 'circular' | 'bound' | 'parabolic' | 'unbound'; throws below veffMin−eps (default eps 1e-4)

## VOCABULARY
particle, force, acceleration, velocity, momentum, kinetic/potential energy,
orbit, eccentric/mean anomaly, periapsis/apoapsis, restitution, drag,
terminal speed, effective potential. Orbit quantities are specific
(per unit mass); mu = G·M; angles in radians.

## USAGE
    const E = Engine.mech.solveKepler(M, ecc);          // then r = a(1 − e·cosE)
    const orb = Engine.mech.orbitFromPeriapsis(a, ecc, mu);
    const { x, y } = orb.position(E);                   // T²∝a³: orb.period
    const [v1p, v2p] = Engine.mech.restitutionCollision1D(m1, v1, m2, v2, e);
    const Veff = Engine.mech.effectivePotential(L, mu);
    const kind = Engine.mech.classifyOrbitByEnergy(En, -mu*mu/(2*L*L));

## NEGATIVE CONSTRAINTS — read before writing any code
- State advances ONLY through core.integrate steppers (stepRK4, stepVerlet,
  stepSemiImplicit, ...) — never hand-rolled v += a*dt loops in sim code.
- NO wave/probability/collapse vocabulary: a classical particle has a definite
  position and velocity at all times; nothing here is a wavefunction.
- Collisions conserve momentum BY CONSTRUCTION via restitutionCollision1D /
  explosionOutcome — never adjust velocities ad hoc after the fact.
- Kepler anomalies only via solveKepler — never re-roll the Newton iteration
  inline; e = 1 needs Barker's equation, not a near-1 hack.
- Drag forces oppose velocity through dragForceLinear/dragForceQuadratic —
  never sign-flip components manually.
- Energies/classifications use the SAME mu and L as the motion; do not mix
  per-unit-mass and absolute quantities in one readout.
