# Wavefunction collapse in simulation accuracy
_Exported on 4/2/2026 at 18:59:45 EDT from Cursor (2.6.21)_

---

**User**

@Sims-v2/wavefunctions-and-probability.html Is the "About this simulation" actually physically correct? Does it really collapse the wavefunction? 

---

**Cursor**

Let me read the file to examine both the "About this simulation" text and the actual simulation code.

Great question. After carefully reading the tooltip text and the simulation code, here's my analysis:

## What the "About" tooltip claims

The tooltip (lines 452-456) says:

> Each measurement "collapses" the wavefunction, yielding a random position sampled from the probability distribution.

## What the code actually does

The `performMeasurement()` function (line 1037) does this:

```1037:1045:Sims-v2/wavefunctions-and-probability.html
        function performMeasurement() {
            const x = sampleGaussian(dataCenter, sigma);
            measurements.push(x);
            
            // Add flash effect
            flashEffects.push({ x: x, age: 0 });
            
            updateStats();
        }
```

It samples a random number from the Gaussian distribution and appends it to a list. That's it. **The wavefunction itself is never modified.** The top panel always displays the exact same Gaussian -- before, during, and after every "measurement."

## Is this physically correct?

**No, the word "collapses" is misleading.** Here's why:

1. **No collapse is simulated.** In quantum mechanics, a position measurement collapses the wavefunction to a narrow peak (ideally a delta function) at the measured value. After collapse, the *next* measurement would sample from this new, collapsed state -- not the original Gaussian. The simulation never changes the wavefunction state; it draws every sample from the identical, unchanging Gaussian.

2. **What it actually demonstrates is the Born rule.** The simulation models the scenario: "Prepare a large *ensemble* of identical quantum systems, each in the same Gaussian state, and measure each one once." The outcomes are distributed according to |psi(x)|^2, and the histogram converges to the theoretical curve. That's the Born rule, not wavefunction collapse.

3. **The time evolution is also oversimplified.** The Re/Im view (lines 768-798) shows `envelope(x) * cos(omega*t)` and `-envelope(x) * sin(omega*t)` -- a uniform global phase rotation. This is only correct for an energy eigenstate (e.g., ground state of a harmonic oscillator). A free-particle Gaussian wavepacket with zero momentum is *not* an energy eigenstate; it should exhibit **dispersion** (spreading in width over time). The simulation shows no dispersion at all.

## What IS correct

- |psi(x)|^2 = Gaussian is a valid quantum probability density
- Sampling via Box-Muller correctly implements the Born rule
- The histogram converging to the theoretical curve is an accurate illustration of quantum statistics
- The normalization is properly done

## Recommended fix for the tooltip

The tooltip should say something like:

> *Each measurement samples a random position from the probability distribution |psi(x)|^2, demonstrating the Born rule. Over many measurements on identically prepared systems, the histogram converges to the theoretical distribution.*

This avoids the incorrect claim of collapse and accurately describes what the code does.

Would you like me to create a plan to fix the tooltip text (and optionally the time-evolution physics)?

