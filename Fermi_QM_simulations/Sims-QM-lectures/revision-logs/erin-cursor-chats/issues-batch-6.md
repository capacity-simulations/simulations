# Issues Batch 6

---

### cursor_simulation_physics_correctness.md

**Sim file:** `Sims-v2/double-slit.html`
**User requests in session:** 4

**Issues:**

1. **Issue:** The computed intensity included an artificial Gaussian envelope factor `exp(-x²/2σ²)` that was not shown in the displayed formula and has no basis in double-slit physics.
   **Why it matters:** The extra Gaussian suppresses outer fringes beyond what the sinc² diffraction envelope already produces, making the pattern physically wrong. Worse, the displayed formula (`I = I₀ cos²(…) × sinc²(…)`) didn't match what was actually computed, so students studying the code or the output would get inconsistent information.
   **Flag:** clear

2. **Issue:** The histogram y-axis auto-rescaled every time a new batch of hits arrived, causing the bars to visually "jump down" or appear to reset every few seconds.
   **Why it matters:** The user directly observed this: "The normalization seems to reset/jump to a lower value every few seconds." This makes it look like the data is being thrown away, when actually the axis is just stretching. It's visually confusing and undermines the pedagogical goal of watching smooth convergence.
   **Flag:** clear

3. **Issue:** After switching to normalized histogram display (dividing by max bin), the histogram converged too slowly to the theoretical curve.
   **Why it matters:** The root causes were (a) only 50 Monte Carlo samples per wavefront, giving ~2 hits/bin/sec across 80 bins, requiring nearly a minute for the shape to stabilize, and (b) max-bin normalization (peak = 1) is unstable early on because a single lucky bin dominates. The user observed: "The histogram is not converging very quickly." Cursor recommended increasing samples and switching to total-count normalization.
   **Flag:** clear

---

### cursor_stern_gerlach_simulation_physics.md

**Sim file:** `Sims-v2/stern-gerlach.html`
**User requests in session:** 8

**Issues:**

1. **Issue:** Sign inconsistency — beam path guide lines and m_j labels were negated relative to the actual particle deflection direction.
   **Why it matters:** Students would see a label saying "+1/2" pointing to where particles with m_j = −1/2 actually land (or vice versa), directly contradicting the physics of the force law.
   **Flag:** clear

2. **Issue:** Deflection was normalized by total spin (proportional to m_j / j), so all spin values produced the same total spread on the detector regardless of j.
   **Why it matters:** In real Stern-Gerlach, deflection is proportional to m_j alone (at fixed gradient). A j = 2 system should spread wider than j = 1/2. The normalization made every spin system look the same, hiding one of the key observables the experiment reveals.
   **Flag:** clear

3. **Issue:** The simulation assumed g_J = 1 without disclosing it; the real silver experiment has g_J ≈ 2.
   **Why it matters:** Students comparing the simulation to textbook treatments of the original Stern-Gerlach experiment would find the deflection magnitude off by a factor of ~2 with no explanation. Even if simplifying to g_J = 1 is fine pedagogically, it should be stated.
   **Flag:** needs-review

4. **Issue:** The displayed force equation was missing the negative sign (showed F_z = g_J m_J μ_B ∂B/∂z instead of F_z = −g_J m_J μ_B ∂B/∂z).
   **Why it matters:** The sign determines which m_j values deflect up vs. down — it's the physical content of the anti-parallel magnetic moment. Getting this wrong in the displayed equation is a direct physics error.
   **Flag:** clear

5. **Issue:** Animation was not frame-rate independent — particle motion ran faster or slower depending on the user's display refresh rate.
   **Why it matters:** On a 120 Hz display the particles would traverse the magnet twice as fast as on a 60 Hz display, potentially changing the apparent deflection if the force integration depends on frame count rather than elapsed time.
   **Flag:** clear

6. **Issue:** An artificial progress ramp `(0.5 + progress * 0.5)` scaled the force from 50% to 100% as the particle traversed the magnet, instead of applying a constant force throughout.
   **Why it matters:** The Stern-Gerlach derivation assumes a uniform field gradient (dB/dz = const) inside the magnet. Ramping the force makes the deflection physics inconsistent with the displayed equation and muddies the linear relationship between m_j and deflection.
   **Flag:** clear

7. **Issue:** Detection band thickness (vertical spread of the dot cluster for each m_j) grew visibly with |m_j|, more than expected.
   **Why it matters:** The user directly observed this. The root cause was a ~17% uniform velocity spread (`vx = 2.2 + Math.random() * 0.4`), which is much wider than a realistic collimated or velocity-selected beam. The effect is physically real but exaggerated — it makes outer bands look smeared out, potentially obscuring the clean discrete-spot result that the experiment is famous for.
   **Flag:** clear

8. **Issue:** After implementing the effusive beam velocity distribution, the guide lines and detector window labels no longer aligned with where particles actually landed.
   **Why it matters:** The guide lines and labels used a hardcoded heuristic (`fieldStrength * 10`) for deflection, which no longer matched the real particle dynamics after the velocity and force constants changed. Students would see dotted target lines that don't match the data — visually confusing and undermines trust in the simulation.
   **Flag:** clear

9. **Issue:** The F_z force equation was displayed as plain text rather than rendered in LaTeX.
   **Why it matters:** Proper typesetting (subscripts, partial derivatives, Greek letters) is standard in physics presentations; plain text like "F_z = -g_j * m_j * mu_B * (dB/dz)" is harder to parse and looks unprofessional.
   **Flag:** clear

10. **Issue:** After adding LaTeX rendering, the equation font size was larger than the surrounding explanation text.
    **Why it matters:** Inconsistent font sizing looks sloppy and draws disproportionate attention to the equation vs. the explanatory context around it.
    **Flag:** clear

11. **Issue:** Inline LaTeX using single-dollar delimiters (e.g., `$z$`) did not render because the KaTeX auto-render configuration only included `$$…$$` and `\(…\)` delimiters.
    **Why it matters:** Parts of the physics explanation that used inline math appeared as raw markup (`$z$`) instead of rendered symbols, making the text look broken.
    **Flag:** clear

12. **Issue:** On-screen math labels drawn on the canvas (j values, |B| max/min, ∂B/∂z) were in plain text rather than LaTeX or properly formatted notation.
    **Why it matters:** These labels are the primary quantitative readouts students see while interacting with the simulation. Inconsistent math formatting (LaTeX in the sidebar, plain text on the canvas) is jarring and reduces visual coherence. It also looks less professional and polished.
    **Flag:** clear

---

### cursor_time_evolution_on_play_button.md

**Sim file:** `Sims-v2/New_Wavefunction_collapse_Measurement.html`
**User requests in session:** 4

**Issues:**

1. **Issue:** Clicking the Play button for the first time did not visibly start time evolution — the simulation appeared frozen.
   **Why it matters:** The user reported this three times across the session. The root cause was twofold: (a) the animation loop was started with a direct `animate()` call instead of `requestAnimationFrame(animate)`, so the first frame had no valid browser timestamp, and (b) at the default 0.1x speed, the wavefunction width changes by only 0.1% after a full second, making any evolution imperceptible even when it was technically running.
   **Flag:** clear

2. **Issue:** The agent's fix of increasing the default simulation speed from 0.1x to 0.5x broke the pacing of measurement interactions — measurements happened too fast for the intended pedagogical workflow.
   **Why it matters:** The user pushed back directly: "no I don't like this change, now all the 'measurement' clicks happen too fast." The speed was set at 0.1x for a reason — the measurement workflow depends on having time to observe, click, observe collapse, watch re-spreading, and click again. The agent fixed one problem by creating another.
   **Flag:** clear

3. **Issue:** The user questioned why the wavefunction spreads much faster after a measurement collapse than after initially pressing Play (implying the rates should be the same).
   **Why it matters:** This turns out to be correct physics (Heisenberg uncertainty: a narrower collapsed packet with σ = 0.05 spreads ~400x faster than the initial σ = 1.0 packet), and cursor confirmed it. But the dramatic visual contrast is pedagogically significant — it's the reason the initial Play appears frozen while post-measurement evolution is vivid. Whether this asymmetry needs better visual/textual signaling for students is worth considering.
   **Flag:** clear

---

### cursor_wavefunction_collapse_in_simulat.md

**Sim file:** `Sims-v2/wavefunctions-and-probability.html`
**User requests in session:** 1

**Issues:**

1. **Issue:** The "About this simulation" tooltip claims each measurement "collapses" the wavefunction, but the code never modifies the wavefunction state — it samples from the same unchanging Gaussian every time.
   **Why it matters:** The user directly asked "Does it really collapse the wavefunction?" The answer is no. In quantum mechanics, collapse localizes the state so subsequent measurements sample from the new state. Here, every sample is drawn from the original distribution as if each measurement were on a fresh identically-prepared system. The simulation demonstrates the Born rule on an ensemble, not wavefunction collapse. The tooltip language is physically misleading.
   **Flag:** clear

2. **Issue:** The time evolution of the complex wavefunction (Re/Im view) shows a uniform global phase rotation (`cos(ωt)`, `−sin(ωt)`) with no dispersion, which is only correct for an energy eigenstate, not a free-particle Gaussian wavepacket.
   **Why it matters:** A free-particle Gaussian with zero momentum is not an energy eigenstate — it should exhibit dispersion (spreading width over time). Showing stationary-state phase rotation for what is labeled as a Gaussian wavepacket is a physics error that could confuse students about the difference between eigenstates and general states.
   **Flag:** clear

---

### cursor_wavepacket_normalization_in_gaus.md

**Sim file:** `Sims-QM-lectures/L15_2d_wavefunction_collapse_measurement.html`
**User requests in session:** 3

**Issues:**

1. **Issue:** The simulation had no visible distinction between full-plane normalization (∫∫|ψ|² dx dy = 1, always exact) and the probability visible inside the finite plotting window (which can be < 1 when tails extend beyond the view).
   **Why it matters:** Without explicit readouts, students could see a probability surface that visually doesn't "look like" it sums to 1 (because the window clips the tails) and incorrectly conclude the normalization is broken. The cursor added "Total Probability = 1.000000" and a separate "Visible Probability" readout to make this auditable.
   **Flag:** clear

2. **Issue:** The measurement sampling used an approximate Monte Carlo weighted-point method (random points scored by probability density) instead of exact sampling from the truncated Gaussian.
   **Why it matters:** The user specifically asked for exact sampling. Monte Carlo rejection on random grid points introduces approximation error in the Born-rule measurement outcomes — the sampled distribution only converges to |ψ|² in the limit of many candidate points. Exact sampling from the truncated 2D Gaussian (via Box-Muller + rejection on the window bounds) gives the correct distribution without approximation.
   **Flag:** clear

3. **Issue:** The simulation models probability density dynamics only, not a full complex wavefunction — there is no phase information, momentum, or interference capability.
   **Why it matters:** The spreading dynamics are correct for a zero-momentum free Gaussian (σ(t) = √(σ₀² + (ℏt/2mσ₀)²)), but the simulation cannot show phenomena that depend on complex phase (e.g., a moving wavepacket, interference between packets, or momentum-space representations). Cursor flagged this as a scope caveat rather than a bug, but it limits what the simulation can teach.
   **Flag:** clear
