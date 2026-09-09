# MODULE core.complex  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.complex

## API
- cAdd(a, b) -> {re, im}                          // a + b
- cSub(a, b) -> {re, im}                          // a - b
- cMul(a, b) -> {re, im}                          // a * b
- cDiv(a, b) -> {re, im}                          // a / b
- cScale(z, s) -> {re, im}                        // real s times z
- cAbs2(z) -> number                              // |z|^2
- cExp(z) -> {re, im}                             // e^z
- cSqrt(z) -> {re, im}                            // principal root, Re >= 0
- arrMulPhase(re, im, phaseRe, phaseIm)           // IN PLACE: (re,im)[i] *= (phaseRe,phaseIm)[i]
- arrAbs2(re, im, out?) -> Float64Array           // out[i] = re[i]^2 + im[i]^2; allocates if out omitted
- arrNormSq(re, im, dx = 1) -> number             // sum (re^2 + im^2) * dx  (Riemann sum)

## VOCABULARY
value, real part, imaginary part, phase, magnitude, array. (Split re/im
Float64Array pairs are the array representation — no interleaving.)

## USAGE
    const z = Engine.complex.cMul(Engine.complex.cExp({ re: 0, im: phi }), a);

    // Elementwise rotation of a sampled complex array by precomputed phases:
    Engine.complex.arrMulPhase(re, im, phaseRe, phaseIm);
    const total = Engine.complex.arrNormSq(re, im, dx);   // ~1 if normalized

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call the scalar c* ops inside per-element loops over arrays — each
  call allocates an object; use the arr* in-place ops (that is what they are
  for).
- Do NOT interleave [re0, im0, re1, im1, ...] arrays; the array contract is
  two parallel Float64Arrays everywhere in the engine (FFT included).
- arrMulPhase mutates re/im; copy first if the input must survive.
- cSqrt is the principal branch (result Re >= 0, cut on the negative real
  axis) — do not rely on any other branch.
