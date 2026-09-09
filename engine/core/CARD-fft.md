# MODULE core.fft  (v1.0)
DEPENDS: (none)
NAMESPACE: Engine.fft

## API
- fft(re, im, inverse = false)                    // IN PLACE radix-2 transform of split arrays
  // forward: X[k] = sum_j x[j] e^{-2 pi i j k / n}, no scaling;
  // inverse = true: e^{+...} and divides by n, so fft(); fft(,,true) round-trips.
  // THROWS RangeError unless n = re.length is a power of 2 and > 0.
- freqGrid(n, dx) -> Float64Array                 // angular frequencies per output bin,
  // FFT ordering [0 .. n/2-1, -n/2 .. -1] * 2*pi / (n * dx)

## VOCABULARY
sample, bin, spectrum, frequency, ordering. (No physics vocabulary — this
module transforms arrays.)

## USAGE
    Engine.fft.fft(re, im);                 // now in frequency space
    const k = Engine.fft.freqGrid(n, dx);   // k[i] pairs with bin i
    // ... multiply by a phase per bin (see core.complex arrMulPhase) ...
    Engine.fft.fft(re, im, true);           // back, already /n normalized

## NEGATIVE CONSTRAINTS — read before writing any code
- NEVER call fft with a non-power-of-2 length — it throws; pad or regrid the
  data to the next power of 2 instead of trying other lengths.
- Do NOT re-derive the frequency array by hand (the 0..n-1 monotone grid is
  WRONG for bins above n/2) — always use freqGrid; its ordering matches this
  fft's output bins exactly.
- Do NOT normalize the forward transform or re-divide after the inverse —
  the /n lives in inverse = true only; double normalization silently shrinks
  amplitudes.
- fft works IN PLACE: it destroys the input arrays; copy first if needed.
