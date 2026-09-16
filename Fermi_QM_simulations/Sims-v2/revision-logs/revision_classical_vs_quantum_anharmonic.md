EC 06/03: Fixed issues with probability rescaling (forcing all peaks to be same height, so probability was not being preserved) 


# Physics accuracy of simulation
_Exported on 3/6/2026 at 14:09:22 EST from Cursor (2.5.17)_

---

**User**

@/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html Check this simulation thoroughly for physics accuracy. 

---

**Cursor**

I've read the file carefully. Let me now compile a thorough physics accuracy review.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Fix 1: Revival time formula.

Fix 2: Rename "DECOHERENCE" to "DEPHASED" with corrected description.

Fix 3: Replace the simplistic spread-ratio cat state detection with actual peak counting. I need to read the full `updatePhaseIndicator` function and the probability density computation context.

Now I'll replace `updatePhaseIndicator` to accept the probability density and count peaks to determine the cat state. I also need to update the call site to pass the probability density.

Now I'll rewrite `updatePhaseIndicator` to count distinct peaks in the probability density, and update its call site to pass the wave function arrays.

Fix 4: Set the default sigma to the true coherent state width for this potential. I need to update the initial value, the slider default, and the display. The coherent state width is `1 / 2^(1/4) ≈ 0.841`. I'll use 0.84 for a clean slider value and add a tooltip note.

Now update the JS default for `sigma0`:

Fix 5: Label the energy line as "Classical E" and also compute/display the quantum energy. Let me find the energy drawing code.

I'll add a quantum energy computation function and draw both energy lines, clearly labeled.

I'll extend `calculateExpectations` to also compute the quantum energy expectation value (⟨V⟩ + ⟨T⟩). For the kinetic energy, I can use the finite-difference approximation of the second derivative, or estimate it from ⟨T⟩ = 1/(4σ²) for a Gaussian. Actually, let me compute it properly using the gradient of the wavefunction.

Now update the energy drawing code to show both classical and quantum energy lines:

I need to pass the quantum energy into the draw function. The draw function is called independently from the animation loop. The cleanest approach is to store the quantum energy in a module-level variable that gets updated each frame.

Now update the animation loop to store the quantum energy:

Now initialize `currentQuantumEnergy` at reset time too:

Now update the drawing code to label the classical energy line and add a quantum energy line:

Now update the legend to reflect the energy line changes. Let me find the legend section.

Fix 6: Add boundary-proximity warning. I'll add a visual warning overlay when significant probability density reaches near the grid edges. This is lighter-weight than implementing complex absorbing boundaries, and directly warns the user about potential artifacts.

I'll add a warning element in the HTML and a function to check boundary probability.

Now add the boundary check function and integrate it into the animation loop. Let me find a good place in the JS to add it, and the animation loop to call it.

Now add the boundary check function near the other calculation functions, and call it in the animation loop:

Now call `checkBoundaryProbability()` in the animation loop:

Also hide the warning on reset:

All six fixes are done. Let me do a final sanity check on the full file to make sure everything is consistent and nothing is broken.

The file looks clean and consistent. One small thing I notice: the sigma slider display callback on line 1009 uses `toFixed(1)` which will show "0.8" instead of "0.84" for the default. Let me fix that to use `toFixed(2)` to match the finer step of 0.01.

All six fixes are complete. Here's a summary of every change made:

1. **Revival time formula (Major)** -- Replaced the incorrect `pi / (3*eps*sqrt(energy))` with the correct perturbation theory result `4*pi / (3*eps)`, derived from the second derivative of the energy spectrum.

2. **"Decoherence" renamed to "Dephased" (Moderate)** -- This is a closed unitary system with no environment coupling, so decoherence never occurs. The label now correctly reads "DEPHASED" with a description mentioning dephasing and its reversibility.

3. **Cat state detection (Moderate)** -- Replaced the simplistic spread-ratio check with a `countSignificantPeaks()` function that scans the probability density for local maxima above 15% of the global peak. The "CAT STATE" label now only triggers when there are genuinely 2+ distinct peaks.

4. **Default sigma set to coherent state width (Minor)** -- Changed the default from 0.7 to 0.84 (close to the true coherent state width `1/2^{1/4} ≈ 0.841` for this potential). Added a hint below the slider showing the exact coherent state width, and refined the slider step to 0.01.

5. **Energy labeling (Minor)** -- The energy line is now labeled `E_cl` (classical energy). A second dashed line in green shows `⟨E⟩_q` (quantum energy expectation value), computed via `⟨V⟩ + ⟨T⟩` using finite-difference kinetic energy. The legend was updated to match.

6. **Boundary warning (Minor)** -- Added a `checkBoundaryProbability()` function that sums probability density in the 20 outermost grid points on each side. When this exceeds 10^-4, a red warning banner appears alerting the user to potential periodic-boundary artifacts.

---

**User**

Why is E_cl lower than E_q

---

**Cursor**

This is a direct consequence of the **Heisenberg uncertainty principle**.

Both the classical particle and the quantum wave packet start at position x0 with zero momentum. So both have zero kinetic energy at t=0, and identical potential energy V(x0). That's the classical energy:

**E_cl = V(x0) = x0² + ε·x0⁴**

But the quantum wave packet is not a point -- it's a Gaussian of width σ. Confining a particle to a region of width σ requires, by the uncertainty principle, a minimum momentum spread Δp ~ ℏ/(2σ). That momentum spread carries kinetic energy even though the *average* momentum is zero:

**⟨T⟩ = ℏ² / (4mσ²) = 1/(4σ²)** (with ℏ = m = 1)

For the default σ = 0.84, this gives ⟨T⟩ ≈ 0.35. On top of that, the potential energy expectation ⟨V⟩ is slightly *higher* than V(x0) because the wave packet samples the potential in a spread around x0, and V(x) is convex (curves upward), so averaging over the spread pulls ⟨V⟩ above V(x0).

Together these give:

**⟨E⟩_q = ⟨T⟩ + ⟨V⟩ > 0 + V(x0) = E_cl**

This is the quantum zero-point energy contribution -- a point particle can sit motionless at x0, but a wave packet cannot. Its spatial extent forces it to carry extra kinetic energy, and the curvature of the potential adds a bit more on the potential side. The gap between the two lines is a direct, visible manifestation of the energy cost of quantum uncertainty.

---

**User**

In the epsilon = 0 case, the wavepacket changes width -- this is not preserving probability

---

**Cursor**

This is actually two separate issues -- the width change is real and correct physics, and probability *is* being preserved. Let me explain.

**The width oscillation is physically correct.** In the ε = 0 case, you have a pure harmonic oscillator (V = x², so ω = √2). A Gaussian wave packet only maintains a constant width if it's a true coherent state with the exact width σ_coherent = 1/2^(1/4) ≈ 0.841. For any other σ, the packet "breathes" -- its width oscillates periodically at frequency 2ω. This is the well-known behavior of a squeezed state, and it's fully physical. The default σ = 0.84 is very close to 0.841 but not exact, so you'll see slight breathing. If you drag σ away from 0.84 (say to 0.5 or 1.3), the breathing becomes dramatic.

**Probability is conserved.** The split-operator method applies unitary operators (complex exponentials) at every step, so ∫|ψ|² dx = 1 is preserved to machine precision. When the packet spreads wider, it gets proportionally shorter -- the total area under the |ψ|² curve stays at 1. A wider, shorter Gaussian has the same integral as a narrower, taller one.

**What's misleading is the visualization.** Look at this line in the drawing code:

```811:811:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
            const probScale = yMax * 0.8 / maxProb;
```

The display rescales the probability density every frame so the tallest peak always reaches 80% of the plot height. This means:
- When the packet is narrow and tall (high maxProb), it gets scaled *down*
- When the packet is wide and short (low maxProb), it gets scaled *up*

So the visual height stays roughly constant while the visual width changes, making the apparent "area under the curve" look like it's growing and shrinking. The actual probability integral is constant -- it's the dynamic visual rescaling that creates the illusion of non-conservation.

If the display used a **fixed** probScale (set once at initialization and held constant), you'd see the packet get shorter as it widens and taller as it narrows, and the visual area would look constant -- which is the truth.

---

**User**

Fix the above so that the displayed probability is correct, and is not being artificially rescaled

---

**Cursor**

I need to replace the dynamic `probScale` (which rescales every frame based on the current peak) with a fixed scale computed once from the initial wave function. Let me find where to store it and where it gets initialized.

Now I'll make the changes. I need to:

1. Add a module-level `initialProbScale` variable.
2. Compute it once in `reset()` after initializing the wave function.
3. Use it instead of the dynamic rescaling in `draw()`.

Now compute the fixed scale in `reset()`, right after `initializeWaveFunction()`:

Now replace the dynamic scaling in `draw()` with the fixed scale:

Now let me verify the result is consistent by reading back the relevant sections.

The fix is clean. Here's what changed:

- **`initialProbScale`** is now computed once per reset, based on the peak of the initial wave function and the plot's y-axis range (`yMax * 0.8 / initMaxProb`). This gives the same initial visual sizing as before.
- **During drawing**, the fixed `initialProbScale` is used instead of recomputing from the current `maxProb` every frame.

Now when the wave packet breathes or spreads, it will visually get shorter as it gets wider (and taller as it narrows), correctly reflecting that the total probability integral ∫|ψ|²dx = 1 is conserved. The area under the curve will look constant, which is the physical truth.

---

**User**

Check the simulation thoroughly for correct physics and visualization. Wavefunction calculations and displayed probabilities must be totally correct. 

---

**Cursor**

I've done a line-by-line audit of the entire simulation. Here is my assessment.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Both fixes are done:

1. The hardcoded HTML default for the spread display now reads "0.84", matching the JS `sigma0` default.
2. The y-axis label now reads "Energy / |ψ|² (scaled)" to make explicit that the probability density and energy share the axis with different physical dimensions.

---

**User**

Remove the "coherent" / "cat state" pop up

---

**Cursor**

I'll remove the entire info overlay (phase indicator, description, and boundary warning), along with the JS that drives it.

Now remove the JS references to the removed elements and the functions that update them.

Now remove the `countSignificantPeaks` and `updatePhaseIndicator` functions.

Now remove the calls to `updatePhaseIndicator` in the animation loop and reset function.

Finally, clean up the now-unused CSS for the phase indicator and overlay.

Done. The phase indicator overlay (COHERENT / SPREADING / CAT STATE / DEPHASED) has been completely removed -- HTML, CSS, and all JS functions and calls. The boundary warning is preserved as a standalone floating element that only appears when the wave function reaches the grid edges.

---

**User**

What is "revival time"

---

**Cursor**

**Revival time** is the time at which a spread-out quantum wave packet reassembles itself back into (approximately) its original shape, after having completely dispersed.

Here's the physical picture, step by step:

1. **The packet is a superposition of energy eigenstates.** When you initialize a Gaussian wave packet, you're not putting the system into a single energy eigenstate — you're creating a weighted sum of many eigenstates |n⟩, centered around some mean quantum number n̄.

2. **Each eigenstate oscillates at its own frequency.** The n-th eigenstate evolves as exp(-i E_n t/ℏ). Because the potential is *anharmonic* (the x⁴ term), the energy levels are not perfectly evenly spaced — E_n grows slightly faster than linearly in n. So different components of the wave packet oscillate at slightly different rates.

3. **Dephasing:** Initially all components are in phase and add up to a nice Gaussian. Over time they fall out of step — the packet spreads and eventually smears across the whole well. This is what you see.

4. **Rephasing (revival):** But because the energy spacings follow a definite mathematical pattern, after a specific time T_rev, all the components simultaneously come back into phase again. The packet reconstructs to look just like the original Gaussian. This is the quantum revival.

**The formula in this simulation** is:

\[T_\text{rev} = \frac{2\pi}{|d^2E_n/dn^2|}= \frac{4\pi}{3\varepsilon}\]

The second derivative d²E/dn² measures the "unevenness" of the energy spacing — how much faster than linear the levels grow. The larger ε (more anharmonic), the faster the components drift out of phase and the sooner they complete a full rephasing cycle. For small ε, the spacing is nearly uniform (nearly harmonic), the dephasing is very slow, and T_rev is very large.

There are also **fractional revivals** at T_rev/2, T_rev/3, etc., where the packet partially reassembles into two or three sub-packets — these are the "cat state" appearances you see mid-cycle.

---

**User**

I changed the displayed statistics but now the main plot isn't rendering

---

**Cursor**

I can see the problem immediately. You removed the "Revival Time" and "FPS" stat items from the HTML, but the JavaScript still tries to reference those elements and write to them.

Look at these two lines in the JS:

```406:406:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
        const revivalDisplay = document.getElementById('revivalDisplay');
```

```410:410:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
        const fpsDisplay = document.getElementById('fpsDisplay');
```

Both `getElementById` calls return `null` because those elements no longer exist in the HTML. Then later when the code does:

```871:871:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
            revivalDisplay.textContent = revivalTime === Infinity ? '∞' : revivalTime.toFixed(1);
```

```823:823:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
                fpsDisplay.textContent = fps;
```

...it throws `Cannot set properties of null` on those `null` references, which crashes the entire script before `animate()` can run — hence the blank canvas.

**The fix** (switch to Agent mode and I can do it, or do it yourself): remove or comment out these four lines:

1. `const revivalDisplay = document.getElementById('revivalDisplay');` (line 406)
2. `const fpsDisplay = document.getElementById('fpsDisplay');` (line 410)
3. `revivalDisplay.textContent = ...` (line 871)
4. `fpsDisplay.textContent = fps;` (line 823)

---

**User**

Is the speed/acceleration of the classical particle correct

---

**Cursor**

Yes, the classical particle's dynamics are correct. Let me walk through each component:

**Force law (acceleration)**

```489:490:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html</p>
        function force(xVal) {
            return -2 * xVal - 4 * epsilon * xVal * xVal * xVal;
```

This is F = -dV/dx = -(2x + 4εx³), the exact negative gradient of V(x) = x² + εx⁴. Correct.

**Initial conditions**

The particle starts at `classicalX = x0`, `classicalV = 0`. This is physically the classical turning point — the particle is released from rest at maximum displacement, where all energy is potential and kinetic energy is zero. This is fully consistent with the quantum wave packet, which also starts with zero mean momentum (psiImag = 0).

**RK4 integrator**

```545:559:/Users/erincrawley/Downloads/Classical_vs_Quantum_state (1).html
        function propagateClassical(dt) {
            const k1v = force(classicalX);
            const k1x = classicalV;
            ...
```

Standard fourth-order Runge-Kutta for the coupled system dx/dt = v, dv/dt = F(x). The four stages are correctly computed and combined with weights (1, 2, 2, 1)/6. Correct.

**Time step accuracy**

The effective sub-step is dt = 0.02 × speed / 5 = 0.004 at 1× speed. The classical half-period for the harmonic part is π/√2 ≈ 2.22, giving about 550 RK4 steps per half-oscillation. RK4 global error is O(dt⁴), so the trajectory error per period is negligible (~10⁻¹⁰).

**One honest caveat: energy drift**

RK4 is not a symplectic integrator, so it doesn't exactly conserve the Hamiltonian over long times — energy will drift very slowly. For typical run durations this is not noticeable. If you wanted exact energy conservation you'd use a symplectic method like Störmer-Verlet, but RK4 is standard and accurate enough here.

**Visualization**

The particle dot is drawn at `yScale(V(classicalX))`, i.e. on the potential curve. This is correct — it shows the particle sitting on the wall of the well, which is where a classical particle with that position and that potential would be visualized in an energy diagram.

Everything checks out.

---

**User**

but is the displayed acceleration correct? It's hard to tell

---

**Cursor**

Here's what correct motion should look like, so you can verify visually:

**Starting at x₀ = 4, v = 0 (default settings)**

The initial force is F = -2(4) - 4(0.05)(4³) = -8 - 12.8 = **-20.8** (strongly toward center). So the particle should:

1. **Start moving slowly** — velocity is zero, but acceleration is already large
2. **Speed up noticeably** as it slides down the right wall of the potential
3. **Flash through x = 0 quickly** — maximum speed occurs here where F = 0
4. **Slow visibly** as it climbs the left wall, decelerating under an increasingly positive force
5. **Momentarily stop at x = -4** (the left turning point, by symmetry of V), then return

The hallmark of correct oscillator physics is that the particle spends most of its time near the turning points (slow) and least time near x = 0 (fast). This is identical to a pendulum spending most time at the ends of its swing.

**How to check it**

- At 1× speed, each animation frame advances simulation time by 0.02. At ~60 FPS the particle completes one full oscillation in roughly 4.44 / (60 × 0.02) ≈ **3.7 real seconds**. If it's completing oscillations much faster or slower than that, something is wrong.

- The motion is symmetric: time from x=4→0 should equal time from x=0→-4.

- Increasing ε should **slow down** the oscillation slightly (the anharmonic well is wider for the same energy, so the period lengthens) and the turning point on the left side stays at x = -4 by symmetry since V is an even function.

If any of those properties look wrong to you, let me know what you're observing and I can pinpoint it.

