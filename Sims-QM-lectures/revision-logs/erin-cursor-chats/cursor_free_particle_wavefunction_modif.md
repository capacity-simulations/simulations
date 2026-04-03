# Free particle wavefunction modification
_Exported on 4/2/2026 at 19:01:18 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L05_plane_wave_plots.html Modify this code to just show the free particle wavefunction. Relevant info is below. Remove the "show on circle button and functionality. Display the relevant energy and wavefunction equations, and let k be a selectable parameter. Display lambda in terms of k, and p


\subsection{The Free Particle}

{\color{olive} The simplest system is a free particle with $V(x)=0$.} This is a particle that doesn't experience a force. It's simple but, as we will see, it's also annoyingly subtle. In fact, it has subtleties that don't appear in more complicated problems, essentially because there's the possibility that the wavefunction runs off to infinity. Nonetheless, we can solve it. 

\para
{\color{olive} We have
\be -\frac{\hbar^2}{2m} \frac{d^2\psi}{dx^2} = E\psi\nn\ee
%
The solutions are
%
\be \psi(x) = e^{ikx} \nn\ee
%
for any choice of $k$ and for $E=\hbar^2 k^2/2m$. These are called {\it plane wave} states -- they're waves spread out everywhere in space.} Differentiate this twice and you'll pull down two powers of $ik$ and you'll see that this works. You need that factor of $i$ in the exponent because there's a minus sign here in the Schrodinger equation.

\para
Now comes a subtlety. The wavefunction is complex. So this is a solution whether $k$ is real or imaginary. Mathematically it solves the Schrodinger equation for any $k$. But suppose that $k$ is imaginary -- so it's $i$ times some real number. Then the factor of $i$ cancels in the exponent and this is the exponential of some number times x. But that's going to blow up at either $x\ra +\infty$ (if that number is positive) or $x\ra -\infty$ (if that number is negative).  These are non-normalisable 

\para
{\color{olive} We will only consider solutions with $k\in \R$. Even these states aren't normalisable because
%
\be \int_{-\infty}^{+\infty} |\psi|^2\,dx = \int_{-\infty}^{+\infty} dx = \infty\ .\nn\ee
%
} Strictly, this means that we shouldn't consider these states at all! This is exactly the annoying subtlety that I mentioned above.  {\color{olive}This is an annoying subtlety. We'll duck this issue for now and come back to it later.

\para
Classically, a free particle has energy $E= \ft12 mv^2 = p^2/2m$. Compare to the result above suggests that the momentum is
%
\be p = \hbar k\ .\nn\ee
%
Said differently, our solution is
%
\be \psi(x) = \cos(kx) + i\sin(kx)\nn\ee
%
These have wavelength
%
\be \lambda = \frac{2\pi}{|k|}\ .\nn\ee
%
So the momentum is related to the wavelength of the wavefunction
%
\be |p| = \frac{2\pi\hbar}{\lambda}\ .\nn\ee
%
$\lambda$ is called the de Broglie wavelength.}  This was an idea that predates the Schrodinger equation -- in fact it was the idea that inspired Schrodinger's work. That a particle with momentum $p$ has an associated wavelength given by this formula. Here we see that this is a simple result of the Schrodinger equation. And it's good intuition to have. A wavefunction that oscillates with some wavelength $\lambda$ will correspond to a particle with momentum $p$ given by this formula. 



---

**Cursor**

Now I have a clear picture of the existing code and the target physics. Let me create the plan.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Given the scope of changes (nearly every section of the file needs rewriting), I'll write the complete new file.

Now let me verify the file was written correctly by reading it back and checking the key sections.

I notice there's a duplicate parabola draw in the `drawDispersionRelation` function. Let me clean that up.

I see the duplicate parabola draw. Let me remove the first (buggy) attempt and keep only the clean one.

Now let me also check whether there are any remaining references to the old "circle" or "ring" or "n" variable that shouldn't be there.

Good -- no remaining circle/ring/degeneracy references. Let me also verify no stray references to the old `n` variable as a quantum number (vs legitimate uses of `n` in other contexts).

No standalone `n` variable references. Let me do a final read of the complete JavaScript section to make sure everything is clean.

Everything looks clean. Let me now do a final check for any lint issues.

No lint errors. Now let me mark all todos as completed.

All tasks are complete. Here's a summary of everything that was done:

**Title and info tooltip** -- Page title and top-bar changed from "Particle on a Circle" to "Free Particle". The info tooltip now describes the free particle with \(V(x)=0\), plane wave solutions, the de Broglie wavelength, and the non-normalisability caveat.

**Removed circle/ring functionality** -- All ring-related code was removed: the "Show on Circle" button, `showOnRing` state, `drawWavefunctionRing()`, all 3D projection helpers (`rotateRingPoint`, `projectRingPoint`, `strokeProjectedPolyline`, etc.), ring drag/zoom/dblclick event listeners, and ring-interactive CSS classes. The animate loop now always calls `drawWavefunctionPlot()`.

**Replaced quantum number n with wavenumber k** -- The integer slider for `n` (range -10 to 10) was replaced with a continuous `k` slider (range -10 to 10, step 0.1, default 1.0). The degeneracy badge was removed entirely.

**Rewrote energy panel** -- Instead of discrete energy levels, the left panel now shows the dispersion relation \(E(k) = k^2\) as a parabola with properly labeled axes (k on horizontal, E in units of \(\hbar^2/2m\) on vertical). The current k value is highlighted as a glowing pink dot on the parabola with dashed projection lines to the axes.

**Rewrote wavefunction panel** -- The x-axis now runs from \(-4\pi\) to \(4\pi\) (position space, not angle). It plots \(\text{Re}(\psi) = \cos(kx - k^2t)\) in blue and \(\text{Im}(\psi) = \sin(kx - k^2t)\) in green. The y-axis is marked at \(\pm 1\). The probability density toggle shows a constant \(|\psi|^2 = 1\) band labeled "not normalisable". A purple wavelength bracket annotation appears below the x-axis showing \(\lambda\).

**Updated control panel** -- The Current State section now shows k, \(E = k^2\, \hbar^2/2m\), \(\lambda = 2\pi/|k|\), and \(p = \hbar k\). The Lecture Equations section displays all five key equations from the lecture: energy, wavefunction (with cos + i sin decomposition), de Broglie wavelength, momentum, and the momentum-wavelength relation.

**Updated reset logic** -- Reset now sets k to 1.0, with no ring-related reset code.

---

**User**

I changed the k bounds. Make it so the dispersion relation x-axis is given by the max k slider value

---

**Cursor**

Now I see the issue. The `kRange` is hardcoded at 12, but the slider max is now 2.5. I need to make `kRange` derive from the slider's max attribute.

I need to: (1) derive `kRange` from the slider max, and (2) make the tick marks adaptive to the actual range. Let me apply the changes.

Now update the tick marks to be adaptive rather than hardcoded for range 10.

Let me verify the result reads cleanly around the changed area.

Everything looks correct. The dispersion relation x-axis now reads `kRange` directly from `kSlider.max`, so it will automatically adapt to whatever bounds you set on the slider (currently -2.5 to 2.5). The tick marks on both axes are also adaptive -- for the k-axis with range 2.5, ticks will appear every 0.5, and for the E-axis with max energy 6.25, ticks will appear every 1.

---

**User**

give a bit more padding on the plot size, right now the E display cuts off on the RHS

---

**Cursor**

The right padding is only 30px, which is too tight for the "E = ..." label on the highlighted dot. Let me increase it.

Increased the right padding from 30px to 60px on the dispersion relation panel so the energy label on the highlighted point no longer gets clipped.

---

**User**

Make a file with a 2-sentence summary of what was done and why, similar to the format of @Sims-QM-lectures/revision-logs/L02_Two_Gaussian_superposition.md , in the same folder

---

**Cursor**

Creating a revision log matching that format for the plane-wave sim.



Tightening the second sentence to match the reference’s density.



Added [Sims-QM-lectures/revision-logs/L05_plane_wave_plots.md](Sims-QM-lectures/revision-logs/L05_plane_wave_plots.md) with the same `EC MM/DD/YY:` lead-in style as the L02 log: first sentence summarizes the conversion to the free-particle sim and main features; second sentence says why the ring UI was dropped and notes the dispersion padding fix.

