EC 04/02/26: Lecture-aligned finite well (V = −V₀ inside, 0 outside), bound energies E = ħ²k²/(2m) − V₀, V₀ slider cap ~32 eV, panel titles “Potential and wavefunctions” and “η(k) vs k plot,” subtitle and About text on energy zero and pedagogical ℏ²/(2m), Re(ψ) vs normalized |ψ|² toggle with one global schematic scale, dynamic KaTeX for odd transcendental equation, removed stray text after `</html>`.

---

## L08_Bound_states.html

**Lecture match:** L08 — Bound States (finite square well)

**Status:** PASS

### Implemented model

- Finite well **V(x) = −V₀** for |x| < a, **V = 0** outside; bound-state **E = ħ²k²/(2m) − V₀** (same k, η, z₀ and circle **k² + η² = 2mV₀/ħ²** as in notes).
- Even: **η = k tan(ka)**; odd: **k/tan(ka) = −η**; intersections found by bisection on branches in ξ = ka vs circle radius z₀.
- **ħ²/(2m) = 0.0381 eV·nm²** (pedagogical).
- Left panel: **V** and **E** in eV; **Re(ψ)** or **|ψ|²** (per-state L² normalization on the plotted x-window, then one shared schematic vertical scale for all states).
- Right panel: **ξ = ka** vs **ηa** with axis ticks as physical k, η; quarter-circle **ξ² + η² = z₀²**.

### Lecture model

- As in QM_intro §Bound States: bound tails **e^{−η|x|}** outside; **cos/sin** inside; matching gives transcendental equations and **E_n = ħ²k_n²/(2m) − V₀**; graphical solution in (k, η); odd parity in exercise subsection.

### Issues

1. **[AMBIGUOUS / REQUIRES REVIEW] Odd parity in main UI**
   - **Where:** Parity toggle; odd equation moved to “Perhaps an Exercise” in the notes.
   - **Current behavior:** Odd solutions included with correct −cot matching and updated About KaTeX.
   - **Required fix:** None required; optional future copy could say “(see practice material).”
   - **Why:** Broader than core lecture text but consistent with notes.

2. **[NOTATION MISMATCH] |ψ|² normalization domain**
   - **Where:** `l2NormSqOnSegment` over visible x range.
   - **Current behavior:** Normalization ∫|ψ|² dx is truncated to the plot window (tails small if window is wide).
   - **Required fix:** Acceptable for schematic; widen x range if stricter normalization is needed.
   - **Why:** Exact normalization needs ±∞; window is several times a and decay length.

### Fix plan

- (Completed in this revision.) See HTML and this log.

### Post-fix validation

- [x] Equations match lecture notes (including odd transcendental when odd parity selected)
- [x] Normalization: |ψ|² integrates to ~1 on window; Re(ψ) uses raw relative amplitudes + global scale
- [x] Visualization: shared schematic scale; V/E in eV; no per-state peak rescaling of ψ
- [x] Units/notation: lecture potential and E < 0
- [x] Numerical: branches and z₀ unchanged; slider range adjusted
