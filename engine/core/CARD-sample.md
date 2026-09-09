# MODULE core.sample  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.sample

## API
- makeRng(seed) -> () -> number
  // seeded LCG (NR u32: s = 1664525·s + 1013904223 mod 2^32) -> uniforms in
  // [0, 1); equal seeds give identical sequences (reproducible runs)
- makeGaussian(rng = Math.random) -> () -> number
  // standard normal N(0,1) sampler; Box-Muller with cached spare (one
  // log/sqrt per two draws); each sampler owns its own cache
- sampleFromPDF(pdf, xMin, xMax, pdfMax, rng = Math.random, maxAttempts = 1000) -> number
  // rejection sampling of pdf(x) on [xMin, xMax] under the uniform envelope
  // pdfMax >= max pdf; two rng() uniforms per attempt. THROWS RangeError if
  // pdfMax/interval are invalid, if pdf(x) is negative/non-finite or exceeds
  // pdfMax (bad envelope), or if maxAttempts pass with no acceptance —
  // it never falls back to a midpoint (the harvested sim did; that biased
  // its histograms).

## VOCABULARY
draw, sample, density, envelope, interval, uniform source (rng).

## USAGE
    const rng = Engine.sample.makeRng(2026);         // seeded, reproducible
    const gauss = Engine.sample.makeGaussian(rng);   // rng: () -> [0, 1)
    const v = mu + sigma * gauss();

    const x = Engine.sample.sampleFromPDF((x) => density(x), x0, x1, densityMax, rng);

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call Math.random() directly in sim code — inject rng (pass a seeded
  generator to make runs and __audit sweeps reproducible; Math.random is only
  the default of last resort).
- Do NOT guess pdfMax low: an envelope below the true peak silently clips the
  distribution — sampleFromPDF throws when it catches pdf(x) > pdfMax, but
  only at points it happens to visit. Compute or bound the true max.
- Do NOT set pdfMax far above the true peak either — acceptance rate is
  mean(pdf)/pdfMax; a loose envelope wastes draws and can hit the attempt cap.
- Do NOT share one makeGaussian sampler across contexts that each need
  reproducibility — the spare cache couples their draw sequences; make one
  sampler per seeded stream.
