# Jagged wavepacket appearance
_Exported on 4/2/2026 at 19:00:21 EDT from Cursor (2.6.21)_

---

**User**

@Sims-v2/Time_evolution_Gaussian_wavepacket_v2.html The wavepacket waves look jagged -- is this just due to the grid spacing for x, or something more fundamental?

---

**Cursor**

Good question. It's the grid spacing relative to the oscillation frequency. Let me walk through the numbers:

**The math:**
- Domain: `xMin = -40` to `xMax = 60` → 100 a₀ total
- Grid points: `numPoints = 1200`
- Grid spacing: `dx ≈ 0.083 a₀`
- At default `k0 = 5`, the de Broglie wavelength is `λ = 2π/k0 ≈ 1.26 a₀`
- That gives **~15 sample points per oscillation cycle**

15 points per cycle is fine for *accuracy* (well above Nyquist), but canvas `lineTo` draws straight line segments between points, so the polygon approximation of a sine wave looks noticeably angular/jagged. The problem gets much worse if `k0` is cranked up — at `k0 = 15`, the wavelength drops to ~0.42 a₀ and you'd have only ~5 points per cycle, which would look very rough.

**There's nothing fundamentally wrong with the physics** — it's purely a rendering resolution issue. The analytic wavefunction is computed exactly at each grid point; there are just not enough points to make the canvas polyline look smooth.

The simplest fix is to increase `numPoints`. Since the wavefunction is evaluated analytically (no PDE solve), the cost is minimal. Bumping from 1200 to ~2400-3000 would roughly double the points per cycle and make the curves visually smooth, even at high k0. Want me to make that change?

---

**User**

yeah, quadruple the points

---

**Cursor**

Done. Now at `k0 = 5` you'll have ~60 points per wavelength, which should look quite smooth. Even at `k0 = 15` you'll still get ~20 points per cycle.

---

**User**

Is the physics totally correct?

---

**Cursor**

Good instinct to check. Let me trace through the math carefully.

The core formula the code implements is on lines 797-831. The Gaussian envelope, phase evolution, group velocity, and spreading are all handled correctly. But there's a normalization bug.

**The normalization bug (line 822)**

The correct normalization prefactor magnitude is:

\[
|N(t)| = \left(\frac{2\sigma^2}{\pi\,|\alpha(t)|^2}\right)^{1/4}
\]

where \(\alpha(t) = 2\sigma^2 + i\hbar t/m\).

The code computes:

```822:822:Sims-v2/Time_evolution_Gaussian_wavepacket_v2.html
            const norm_mag = 1.0 / (Math.pow(2 * Math.PI * sigma2, 0.25) * Math.pow(denom, 0.25));
```

That gives \(|N| = 1/\bigl((2\pi\sigma^2)^{1/4}\,|\alpha|^{1/2}\bigr)\), which is off from the correct value by a factor of \(\sqrt{2}\,\sigma\). You can confirm this: at the default \(\sigma = 1\), the "Norm" readout should show ~0.50 instead of 1.00.

**What's affected:**
- The Norm display reads \(1/(2\sigma^2)\) instead of 1
- Peak \(|\psi|^2\) values are scaled incorrectly
- The y-axis magnitudes on both plots are wrong

**What's NOT affected (normalization cancels):**
- Wavepacket shape, spreading, and propagation are all correct
- \(\langle x \rangle\), \(\Delta x\), group velocity, phase velocity are all correct (the code divides by `totalProb`)

**Everything else checks out:**
- Gaussian exponent \(-(x-x_0-v_g t)^2/(2\alpha(t))\) is correct
- Phase \(k_0(x - x_0) - \hbar k_0^2 t/(2m)\) is physically correct (differs from the about-section formula by a global phase, which doesn't affect observables)
- Group velocity \(v_g = \hbar k_0/m\) and phase velocity \(v_p = \hbar k_0/(2m)\) are correct

The fix is a one-line change. Want me to apply it?

---

**User**

From my notes, I have this for the Probability normalization (different from the wavefunction). Is this consistent with your suggested change?

\be P(x,t) = C|\psi(x,t)|^2 &=& \frac{2\pi C}{|\alpha|} \,\exp\left(-\frac{1}{2\alpha}( x -ik_0/\sigma^2)^2 -\frac{1}{2\alpha^\star}(x +ik_0/\sigma^2)^2 \right)\nn\\ &=&  
\frac{2\pi C e^{k_0^2/\sigma^2}}{|\alpha|} \exp\left(-\frac{1}{\sigma^2|\alpha|^2}\left(x-\frac{\hbar k_0t}{m}\right)^2\right)\nn\ee
%
where $C$ is a normalisation factor. } You need a little bit of algebra to get to the second line. {\color{olive}You can check that the probability is correctly normalised if we take 
%
\be C = \frac{e^{-k_0^2/\sigma^2}}{\sqrt{4\sigma^2 \pi^{3}}} \ .\ee
%

---

**Cursor**

Yes, your notes are consistent with the fix. The key thing to recognize is that your notes use a different \(\sigma\) convention from the code.

**Your notes** use:

\[
\psi(x,0) \propto \exp\!\left(-\tfrac{\sigma^2 x^2}{2} + ik_0 x\right), \qquad \alpha = \tfrac{1}{\sigma^2} + \tfrac{it}{m}
\]

Here \(\sigma\) is essentially a momentum-space width parameter (with units of inverse length).

**The code** uses:

\[
\psi(x,0) \propto \exp\!\left(-\tfrac{(x-x_0)^2}{4\sigma_{\text{code}}^2} + ik_0(x - x_0)\right), \qquad \alpha_{\text{code}} = 2\sigma_{\text{code}}^2 + \tfrac{it}{m}
\]

Here \(\sigma_{\text{code}}\) is the position-space uncertainty \(\Delta x\).

**The mapping between them** is \(1/\sigma_{\text{notes}}^2 = 2\sigma_{\text{code}}^2\), which makes the two \(\alpha\) definitions identical:

\[
\alpha_{\text{notes}} = \frac{1}{\sigma_{\text{notes}}^2} + \frac{it}{m} = 2\sigma_{\text{code}}^2 + \frac{it}{m} = \alpha_{\text{code}}
\]

**Checking the normalization:** Your notes give the correctly normalized probability as:

\[
P = \frac{1}{\sigma_{\text{notes}}\sqrt{\pi}\,|\alpha|}\,\exp\!\left(-\frac{(x - v_g t)^2}{\sigma_{\text{notes}}^2\,|\alpha|^2}\right)
\]

(after substituting your \(C\) and simplifying the prefactors). Substituting \(\sigma_{\text{notes}} = 1/(\sqrt{2}\,\sigma_{\text{code}})\):

\[
P = \frac{\sqrt{2}\,\sigma_{\text{code}}}{\sqrt{\pi}\,|\alpha|}\,\exp\!\left(-\frac{2\sigma_{\text{code}}^2\,(x - v_g t)^2}{|\alpha|^2}\right)
\]

This is exactly what my fix produces. The corrected normalization magnitude in the code gives \(|N|^2 = \sqrt{2}\,\sigma_{\text{code}} / (\sqrt{\pi}\,|\alpha|)\), which matches this prefactor. So your notes and the fix are in agreement.

Want me to go ahead and apply the one-line fix?

---

**User**

yes

---

**Cursor**

Done. The Norm readout should now show 1.0000 (within numerical integration error) for all parameter values.

---

**User**

What is the norm readout even showing?

---

**Cursor**

It's showing the numerical integral of \(|\psi(x,t)|^2\) over the simulation domain, computed via a simple Riemann sum:

```1026:1028:Sims-v2/Time_evolution_Gaussian_wavepacket_v2.html
                meanX += x * prob * dx;
                totalProb += prob * dx;
            }
```

```1088:1088:Sims-v2/Time_evolution_Gaussian_wavepacket_v2.html
            document.getElementById('normVal').textContent = totalProb.toFixed(4);
```

So it's computing \(\int_{-40}^{60} |\psi(x,t)|^2\,dx\) numerically each frame and displaying it to 4 decimal places. For a correctly normalized wavefunction, this should read 1.0000 as long as the wavepacket stays well within the domain boundaries (i.e., the tails aren't getting clipped at \(x = -40\) or \(x = 60\)).

It's a useful sanity check: if the norm drifts from 1, it means either the normalization is wrong (which was the bug we just fixed), or the wavepacket has spread/propagated far enough that significant probability is leaking off the edges of the computational domain.

---

**User**

write in plaintext the old and new values

---

**Cursor**

**Change 1: Grid resolution**

- Old: `const numPoints = 1200;`
- New: `const numPoints = 4800;`

**Change 2: Normalization magnitude**

- Old: `const norm_mag = 1.0 / (Math.pow(2 * Math.PI * sigma2, 0.25) * Math.pow(denom, 0.25));`
- New: `const norm_mag = Math.pow(2 * sigma2 / (Math.PI * denom), 0.25);`

---

**User**

the alpha in the about this is also wrong. it should be 1/sigma^2 for the first term. Check that this hasn't propagated. 

---

**Cursor**

Let me check all the places where α(t) is referenced or computed in the code.

The about section formula (line 643) is purely display LaTeX — it doesn't feed into any computation. The actual computation on lines 798-823 uses `2 * sigma2` directly.

However, I want to flag something: **the about section is actually correct for the code's convention.** Here's why:

- The slider's σ is the **position-space width** (Δx = σ, in Bohr radii)
- With that convention, the Gaussian at t=0 is exp[-(x-x₀)²/(4σ²)]
- Writing that as exp[-(x-x₀)²/(2α)], you get α₀ = 2σ², so α(t) = 2σ² + it/m

Your notes use α = 1/σ² + it/m, but your σ there is a **different quantity** — it's the momentum-space width parameter (σ_notes = 1/(√2 · σ_code)). The two α definitions are identical once you account for the mapping: 1/σ_notes² = 2σ_code².

So you have a choice:

1. **Keep the about section as-is** (α = 2σ² + it/m) — consistent with the slider's position-space σ
2. **Change the about section to** α = 1/σ² + it/m — matches your notes, but then the σ in the equation means something different from the σ on the slider, which could confuse students

Which do you prefer?

