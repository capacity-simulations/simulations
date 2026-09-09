# MODULE core.roots  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.roots

## API
- bisect(f, a, b, {tol = 1e-12, maxIter = 200}) -> number|null   // requires opposite signs at a, b; null on a bad bracket (never throws)
- newton(f, dfdx, x0, {tol = 1e-12, maxIter = 50}) -> number|null // null on zero/non-finite derivative or non-convergence
- bracketScan(f, a, b, n) -> [lo, hi][]                          // n-interval sign-change scan; each bracket feeds bisect; exact grid zeros come back as [x, x]

## VOCABULARY
function, interval, bracket, sign change, root, tolerance. (No physics vocabulary — this module finds zeros of numbers.)

## USAGE
    const root = Engine.roots.bisect((x) => f(x) - target, lo, hi);
    if (root == null) { /* no crossing in [lo, hi] — handle it */ }

    // Unknown number of roots: scan first, then refine each bracket.
    for (const [lo, hi] of Engine.roots.bracketScan(f, a, b, 400)) {
      const r = Engine.roots.bisect(f, lo, hi);
    }

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER hand-roll bisection or Newton loops in sim code — solve only through
  this module, and always handle the null (no root / no convergence) return.
- Do NOT grid-search-and-pick-nearest for a crossing — bracketScan + bisect is
  the pattern for functions with unknown root counts.
- bracketScan reports sign changes, not roots: a sign flip across a pole is
  still reported when both endpoint values are finite — check f at the refined
  root when poles are possible.
