# MODULE domain.relativity  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.rel

## API
- gamma(beta) -> g                                // Lorentz factor 1/sqrt(1-beta^2); throws RangeError for |beta| >= 1
- boost2(ct, x, beta) -> [ctPrime, xPrime]        // 2D boost S -> S' (S' at +beta along x); c = 1 everywhere
- unboost2(ctPrime, xPrime, beta) -> [ct, x]      // inverse boost S' -> S (= boost2 with -beta)
- boost4(V, beta) -> Vprime                       // [ct, x, y, z] boost along x; y, z pass through; new array
- minkowskiNormSq(V) -> number                    // -ct^2 + x^2 + y^2 + z^2 signature (-,+,+,+); boost-invariant
- interval(dct, dx, {lightlikeEps}) -> {ds2, kind} // ds2 = dct^2 - dx^2 (timelike POSITIVE — opposite sign to minkowskiNormSq); kind 'timelike'|'spacelike'|'lightlike'; eps defaults relative to input scale
- rapidity(beta) -> phi                           // atanh(beta); rapidities ADD under composition
- betaFromRapidity(phi) -> beta                   // tanh(phi)
- addVelocities(u, v) -> w                        // (u+v)/(1+uv), all in units of c; |w| <= 1 always
- properTimeAlong(points) -> tau                  // sum sqrt(dct^2-dx^2) over a polyline of {ct,x} or [ct,x]; NaN if any segment is spacelike

## VOCABULARY
frame S / S', beta = v/c, ct, event, worldline, interval, timelike/spacelike/lightlike,
proper time, rapidity. c = 1 in every function. Simultaneity is frame-relative.

## USAGE
    const g = Engine.rel.gamma(beta);
    const [ctP, xP] = Engine.rel.boost2(ct, x, beta);      // event in S'
    const { kind } = Engine.rel.interval(dct, dx);
    const w = Engine.rel.addVelocities(0.8, 0.7);          // 0.9459..., never 1.5
    const tau = Engine.rel.properTimeAlong([{ct:0,x:0},{ct:5,x:3}]);

## NEGATIVE CONSTRAINTS — read before writing any code
- γ only via Engine.rel.gamma — never hand-roll 1/sqrt(1-v*v) (8 drifted
  spellings existed; this is the one).
- NO Galilean velocity addition — never u + v for velocities; only
  addVelocities (or add rapidities).
- Frame changes ONLY via boost2/boost4 (inverse via unboost2 / -beta) — never
  hand-written γ(x - vt) expressions in sim code.
- Worldlines and coordinates are always in a DECLARED frame — name the frame
  (S or S') wherever coordinates appear.
- No absolute-simultaneity language: "simultaneous" only ever "in frame …";
  temporal order of spacelike pairs is frame-dependent.
- Do not mix the two sign conventions: interval() is timelike-positive,
  minkowskiNormSq() is (-,+,+,+). Pick per readout and say which.
- properTimeAlong is for timelike polylines: NaN means a spacelike segment —
  surface it as "not a valid worldline", never silently clamp.
