# Single slit diffraction analysis
_Exported on 4/13/2026 at 22:22:17 EDT from Cursor (2.6.21)_

---

**User**

Check if the single slit physics is correct. Why is there more than one "bump" in the single slit case? The simulation must be physically correct. @Sims-QM-lectures/L04_double-slit-experiment.html 

---

**Cursor**

I’m checking how the single-slit case is implemented in `Sims-QM-lectures/L04_double-slit-experiment.html`, then I’ll compare that behavior to the expected quantum single-slit pattern so I can explain whether the extra bumps are physical or a modeling artifact.

I’ve confirmed the recent revision explicitly added single-slit mode and mentions fixing the detector pattern. Now I’m reading the actual sampling formula, because the answer depends on whether the screen hits come from a true single-slit diffraction law or from a Gaussian placeholder.

The implementation is using a real single-slit diffraction law in quantum mode, not a Gaussian. I’m checking the lecture source next so I can tell you whether the intended lesson for `L04` actually includes side lobes, or whether the code has drifted beyond the lecture scope.

## Findings

The extra bumps in the **quantum single-slit** case are **physically correct**. They are not an interference bug from the second slit; they are the **secondary maxima of the single-slit diffraction pattern**.

The code is explicitly using the standard single-slit Fraunhofer intensity
\[
I(\theta)\propto \left(\frac{\sin\beta}{\beta}\right)^2,\qquad
\beta=\frac{\pi a\sin\theta}{\lambda}
\]
when only one slit is open:

```1512:1548:Sims-QM-lectures/L04_double-slit-experiment.html
function singleSlitProbabilityAtX(x, L) {
    const theta = Math.atan(x / L);
    const sinTheta = Math.sin(theta);
    const beta = (Math.PI * state.slitWidth * sinTheta) / state.lambda;
    if (Math.abs(beta) <= 0.001) return 1.0;
    return Math.pow(Math.sin(beta) / beta, 2);
}

// Single-slit diffraction centered on a slit at position slitX
function singleSlitProbabilityAtXCentered(x, slitX, L) {
    const theta = Math.atan((x - slitX) / L);
    const sinTheta = Math.sin(theta);
    const beta = (Math.PI * state.slitWidth * sinTheta) / state.lambda;
    if (Math.abs(beta) <= 0.001) return 1.0;
    return Math.pow(Math.sin(beta) / beta, 2);
}

function quantumProbabilityAtX(x, L) {
    const bothOpen = state.slit1Open && state.slit2Open;
    const s1x = -state.sep / 2;
    const s2x = state.sep / 2;
    ...
    } else if (state.slit1Open) {
        return singleSlitProbabilityAtXCentered(x, s1x, L);
    } else if (state.slit2Open) {
        return singleSlitProbabilityAtXCentered(x, s2x, L);
    }
```

So if you close one slit and still see multiple peaks, that is the expected `sinc^2` structure: one large central maximum plus weaker side lobes.

## Why More Than One Bump Appears

For a real single slit, the minima occur at

\[
a\sin\theta = m\lambda,\quad m=1,2,3,\dots
\]

and between those minima you get smaller secondary maxima. So:

- If `a / λ` is small, you mostly see one broad bump.
- If `a / λ` gets larger, zeros and side lobes become visible.
- That matches the note already embedded in the sim UI: “reduce `λ` so that `a/λ > 2`” to see the `sinc^2` zeros and side lobes.

This is also consistent with the lecture intent: the notes explicitly say that with waves, “it matters whether a single slit is open or both slits are open,” and for quantum particles “we see diffraction” building up probabilistically.

```624:627:Sims-QM-lectures/QM_intro.tex
{\color{blue} No script for this as it would be intertwined too much with the demo. But we should definitely do a demo! First the classical case with balls. Obviously they only go through one slit or the other. Then the classical case for a wave. Now it matters whether a single slit is open or both slits are open, but that's ok because the wave is an extended object -- it literally goes through both slits at the same time.
...
Then the big surprise. The quantum particles is a combination of the two -- we see diffraction, but we also only detect a particle in particular position. It's described by the wavefunction until we look. If we look after it's passed, then we get collapse of the wavefunction and the diffraction pattern only builds up over time, probabilistically.
```

## One Important Detail

When one slit is closed, the sim keeps the remaining slit at its actual position `x = ±d/2`, rather than moving it to the center. That means the whole single-slit pattern is centered behind the surviving slit, which is physically sensible for this apparatus:

```1068:1072:Sims-QM-lectures/L04_double-slit-experiment.html
// Single-slit mode: one opening at the open slit's position
const openSlitX = state.slit1Open ? -state.sep / 2 : state.sep / 2;
const halfW = state.slitWidth / 2;
const leftEdge = openSlitX - halfW;
const rightEdge = openSlitX + halfW;
```

So if the “main bump” looks shifted left or right, that is also expected.

## Bottom Line

The **detector physics for the single-slit case looks correct**. More than one bump is expected in the **quantum** single-slit regime whenever the slit is wide enough relative to the wavelength for side lobes to fit on the screen.

The only caveat I’d keep in mind is that the animated wave arcs are schematic; the physically meaningful part is the detector sampling law above. If you want, I can next do a stricter audit of whether the single-slit and double-slit formulas are consistent with the same approximation regime everywhere in this file.

