# MODULE domain.em-fields  (v1.0)
DEPENDS: core.integrate
NAMESPACE: Engine.em

## API
- makeCharges(list) -> charges                     // validated [{q, x, y}] (finite; q in units of e, k = 1); canonical input everywhere below
- fieldAt(charges, x, y, {softening}) -> [Ex, Ey]  // Coulomb superposition, E = sum q r_hat/(r^2+soft^2); k = 1 natural units
- potentialAt(charges, x, y, {softening}) -> V     // sum q/sqrt(r^2+soft^2), zero at infinity; grad V = -E exactly
- traceFieldLine(charges, x0, y0, {dir, maxSteps, stepSize, stopRadius, bounds, softening}) -> points
  // RK4 on the NORMALIZED field direction (fixed arc-length steps); dir +1 follows E, -1 follows -E;
  // points = [[x,y]...] + points.stop ('charge'|'bounds'|'stagnation'|'maxSteps') + points.charge (index | -1).
  // Keep stopRadius >= stepSize. A field line is geometry, tangent to E — NOT a motion.
- fieldLineSeeds(charges, {perCharge = 8, seedRadius}) -> [{x, y, dir}]
  // max(1, round(perCharge*|q|)) seeds per charge on a small circle (count scales with |q|);
  // + charges get dir +1 (lines leave radially), - charges dir -1; keep seedRadius > stopRadius
- equipotentialAt(charges, level, {bounds, grid: {nx, ny}, softening, refine}) -> segments
  // marching-squares contour of V = level; vertices Newton-refined onto the exact level
  // (refine = 2 default); segments = [[[xA,yA],[xB,yB]], ...]; crosses field lines at right angles
- lorentzForce(q, E, B, v) -> [Fx, Fy]             // F = q(E + v x B z_hat), E = [Ex,Ey], v = [vx,vy], B = out-of-plane Bz
- makeChargedParticle({q, m, x, y, vx, vy}) -> p   // validated state (m > 0) that stepParticle advances IN PLACE
- stepParticle(p, charges, Bz, dt, {softening, E0, pureBEps}) -> p
  // one step under fieldAt + uniform Bz (+ optional uniform E0, e.g. E x B setups):
  // |E| <= pureBEps -> exact norm-preserving rotation (core.integrate stepRotate; cyclotron
  // radius m|v|/(|q|B), period 2 pi m/(qB) exact); otherwise core.integrate stepRK4 on [x,y,vx,vy]

## VOCABULARY
point charge, source/test charge, electric field E, potential V, field line,
equipotential, superposition, Lorentz force, uniform field, cyclotron orbit,
Larmor radius, E x B drift. Static fields: nothing propagates or flows.
Units: k = 1, q in units of e, B = Bz out of plane.

## USAGE
    const charges = Engine.em.makeCharges([{q: 1, x: 1, y: 0}, {q: -1, x: -1, y: 0}]);
    const [Ex, Ey] = Engine.em.fieldAt(charges, 0, 2);
    for (const s of Engine.em.fieldLineSeeds(charges, {perCharge: 8}))
      drawPolyline(Engine.em.traceFieldLine(charges, s.x, s.y, {dir: s.dir, bounds}));
    const segs = Engine.em.equipotentialAt(charges, 0.3, {bounds, grid: {nx: 96, ny: 96}});
    const p = Engine.em.makeChargedParticle({q: -1, m: 1, x: 0, y: 0, vx: 1, vy: 0});
    Engine.em.stepParticle(p, [], 2, dt);          // uniform B only: exact circle

## NEGATIVE CONSTRAINTS — read before writing any code
- Field lines are NOT trajectories — a charge does not move along a field
  line; never animate charges sliding along field lines (traceFieldLine output
  is drawn as static geometry only).
- No photon / current-flow / "energy travels" animation language for static
  fields: no marching dashes, no pulses running down lines — nothing flows in
  electrostatics.
- Field and potential values come only from fieldAt/potentialAt — never
  re-derive Coulomb sums (q/r^2 loops) inline in sim code.
- Particle motion advances only through stepParticle (or core.integrate
  steppers) — never hand-rolled v += E*dt updates.
- For pure magnetic motion use the norm-preserving path (stepParticle's
  stepRotate branch) — RK4 alone inflates |v| every step and spirals the
  orbit outward.
- Do not mix field-line density with field strength claims off the seed
  circles: in 2D drawings line spacing is only qualitative between charges.
