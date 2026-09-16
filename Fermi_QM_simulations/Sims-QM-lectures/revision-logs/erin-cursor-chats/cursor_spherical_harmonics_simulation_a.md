# Spherical harmonics simulation audit
_Exported on 4/13/2026 at 22:22:11 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/L19_Spherical_harmonics_Explorer.html Carefully check the simulation for correctness. The spherical harmonics must be implemented correctly. Come up with a plan for a thorough physics audit. 

---

**Cursor**

I've carefully read through the entire simulation file. Let me now do a detailed cross-check of the mathematical formulas against known correct values.

---

**User**

Also use @Sims-QM-lectures/QM_intro.tex section on angular momentum for the spherical harmonics

---

**Cursor**

Let me read the TeX file to find the angular momentum / spherical harmonics section.

I've now carefully read the full simulation code and the relevant section of the lecture notes. Let me create a thorough physics audit plan.

I've done a line-by-line physics audit of the code against the standard formulas and the lecture notes. Here is my plan.

---

**User**

"Standard: Y_1^{-1} = +\sqrt{3/(8\pi)}\sin\thetae^{-i\phi}, so \arg(Y_1^{-1}) = -\phi"

In the notes, the formula is @QM_intro.tex (3641-3642) . Are you using a different normalization than the book? Explain the discrepancy. There could be error's in the book's normalization, but we need to adhere to the notes as long as the notes are correct. 

---

**Cursor**

Great question — let me clarify precisely.

**There is no actual discrepancy between the notes and the code (or my audit).** Here's why:

The lecture notes deliberately give **un-normalized** spherical harmonics — you can see this from the very first one on line 3637: \(Y_{0,0} = 1\), whereas the properly normalized version is \(Y_{0,0} = 1/\sqrt{4\pi}\). The same applies throughout: normalization constants are stripped to show the functional dependence cleanly.

So the notes' \(Y_{1,-1} = \sin\theta\, e^{-i\phi}\) and my audit's \(Y_1^{-1} = +\sqrt{3/(8\pi)}\,\sin\theta\, e^{-i\phi}\) are the **same function** — both have a positive coefficient multiplying \(\sin\theta\, e^{-i\phi}\). The only difference is the normalization constant \(\sqrt{3/(8\pi)}\) that the notes omit. The phase \(\arg(Y_1^{-1}) = -\phi\) is identical in both.

**There is a subtler convention difference, but it doesn't matter here.** The notes also omit the Condon-Shortley phase \((-1)^m\) in the associated Legendre polynomials. You can see this because the notes write \(Y_{1,1} = \sin\theta\, e^{i\phi}\) (positive coefficient), whereas the CS convention gives \(Y_1^1 = -\sqrt{3/(8\pi)}\,\sin\theta\, e^{i\phi}\) (negative, from the \((-1)^1\) in \(P_1^1\)). The code uses the CS convention throughout, which is the standard in Griffiths, Sakurai, and most modern QM texts. Both conventions are correct — the CS phase is an overall sign choice that cancels in all observables (\(|Y|^2\), real harmonics, expectation values).

**The bug I found is real and convention-independent.** Regardless of whether you use the CS phase or not, the code's `computeComplexYPhase` function fails to account for the \((-1)^{|m|}\) factor in the \(Y_l^{-m} = (-1)^m [Y_l^m]^*\) relation (CS convention) or equivalently the sign that arises from \(P_l^{|m|}(\cos\theta)\) carrying the CS phase while the actual \(Y_l^{-|m|}\) should not have it in the theta-dependent sign. Either way, the phase is off by \(\pi\) for \(m = -1, -3, -5\).

**Bottom line**: The notes are correct (they just omit normalization and CS phase for pedagogy). The code is also correct in its convention choice. The one real bug is the phase computation I identified, which produces visibly wrong hue-coloring in Complex mode for odd negative \(m\).

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

The fix is applied. The `computeComplexYPhase` function now correctly accounts for the \((-1)^{|m|}\) factor when \(m < 0\) and \(|m|\) is odd, adding an extra \(\pi\) to the phase. This corrects the hue coloring in Complex mode for \(m = -1, -3, -5\).

---

**User**

write a short report saying what was changed and why, like @Sims-QM-lectures/revision-logs/L22_Hydrogen_atom_energy_spectrum.md in the same folder

---

**Cursor**

Done. The revision log is at `Sims-QM-lectures/revision-logs/L19_Spherical_harmonics_Explorer.md`, written in the same single-paragraph style as the L22 log. It summarizes the bug (wrong phase for odd negative m in complex mode), the root cause (missing \((-1)^{|m|}\) factor), the fix, and notes that the rest of the physics passed the audit.

---

**User**

@Sims-QM-lectures/index.html update the index with all the sims in the folder

---

**Cursor**

Reading `index.html` and listing HTML simulations in `Sims-QM-lectures`.



Adding the two missing root-level sims (L19, L21) and sorting the list by lecture number.



Here is what changed:

**Updates in** [`Sims-QM-lectures/index.html`](Sims-QM-lectures/index.html)

- **Added** the two root-level sims that were missing from the list:
  - `L19_Spherical_harmonics_Explorer.html` — “L19: Spherical harmonics explorer”
  - `L21_Hydrogen_atom_wavefunctions.html` — “L21: Hydrogen atom wavefunctions”
- **Comment** above the array: the index lists **only HTML files in the folder root** (same as before); `old/` and other subfolders are not linked, since those are archived/alternate builds.

The list is still ordered by lecture number (L02 → L22) and now has **22** sims, matching every `*.html` in `Sims-QM-lectures/` except `index.html`.

If you want the `old/` versions listed too (e.g. a second “Archive” grid), say so and we can add that.

