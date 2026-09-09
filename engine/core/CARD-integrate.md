# MODULE core.integrate  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.integrate

## API
- stepRK4(deriv, y, t, h) -> newY                 // deriv(y, t) -> array; y is number[] or Float64Array; input never mutated
- stepVerlet(accel, pos, vel, h)                  // IN PLACE on pos/vel; accel(pos) -> array (position-only)
- stepSemiImplicit(accel, pos, vel, h)            // IN PLACE; accel(pos, vel) -> array; rate updates first, then position
- stepRotate(vec, axis, angle) -> vec'            // exact planar rotation of [x, y] (CCW radians); axis = null in v1; norm-preserving
- stepAdaptive(deriv, y, t, h, {tol, hMin, hMax}) -> {y, hUsed, hNext}   // step-doubling error control; returns a NEW y
- makeEventStepper({state, advance, events, maxEventsPerStep}) -> {step, state}
  // advance(state, dt) free-advances; events: [{detect(state) -> time|null, resolve(state)}];
  // ties go to the earliest-listed event; step(dt) -> {events, spent}

## VOCABULARY
state, derivative, rate, position, step, event, detect, resolve. (No physics vocabulary — this module advances arrays.)

## USAGE
    const deriv = (y, t) => [y[2], y[3], ax(y), ay(y)];
    y = Engine.integrate.stepRK4(deriv, y, t, h);

    const es = Engine.integrate.makeEventStepper({
      state: { x: 0.5, v: 1 },
      advance: (s, dt) => { s.x += s.v * dt; },
      events: [{ detect: (s) => s.v < 0 ? -s.x / s.v : null,
                 resolve: (s) => { s.v = -s.v; } }],
    });
    es.step(dt);

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER hand-roll integration loops in sim code — state advances only through
  these steppers.
- No physics vocabulary in this module or in code extending it: steppers see
  state arrays and rates, never named quantities.
- Do NOT feed stepVerlet a rate-dependent accel — its energy behaviour assumes
  accel(pos); use stepSemiImplicit or stepRK4 when the rate enters the force.
- Do NOT advance a pure rotation with an Euler update — it inflates the norm
  by sqrt(1 + (w*dt)^2) every step; use stepRotate.
- Do NOT poll for events inside advance() — event timing belongs in detect(),
  resolution in resolve().
