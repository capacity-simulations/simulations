# Quantum Mechanics Simulation Audit + Implementation Spec

## Goal

Use this document to review and refine the simulations in `Sims-v2/` so that they are:

1. **physically correct**,
2. **faithful to the lecture notes `Sims-QM-lectures/QM_intro.tex`**, and
3. **visually honest** (no non-physical rescaling, clipping, or presentation choices that distort the physics).

The simulation code may be edited. **The lecture notes may not be edited.**

This document is written for a coding agent. Follow it literally.

---

## What to deliver for each simulation

For each simulation, do **all** of the following:

1. **Audit the code** against the matching lecture `.tex` notes.
2. **List every issue found**, grouped by category.
3. **Propose a concrete implementation plan** for fixing the issues.
4. **Only then implement the fixes** in the simulation code.
5. **Summarize exactly what changed** and why.

If a point is ambiguous, do **not** silently choose an interpretation. Mark it as **AMBIGUOUS / REQUIRES REVIEW** and explain the tradeoff.

---

## Matching convention

- A lecture sim with prefix `L##_` is a sim that is for lecture `##`. Each section in the lecture notes is a "lecture". 


**The lecture notes are the source of truth** if the sim and notes disagree. If you have strong evidence for a lecture note being incorrect, you should flag it as an issue and propose a fix.

---

## Hard rules (apply to every simulation)

### 1. Physics correctness

A simulation fails physics review if **any** of the following are wrong or missing:

- Hamiltonian, Schrödinger equation, eigenvalue equations, normalization factors, expectation values, uncertainty formulas, propagators, matrix elements, or boundary conditions, or other physics equations/concepts do not match the lecture notes.
- A formula in code or in the UI is only approximately correct when the lecture presents an exact expression and the approximation is not explicitly part of the lesson.
- The plotted or sampled probability density is not properly normalized.
- Units are inconsistent, hidden, or mixed. If natural units are used, that must be explicit and consistent everywhere in the simulation.
- A measurement rule, collapse rule, sampling rule, or state update is inconsistent with the lecture’s intended model.
- Numerical methods are used outside their safe regime without warnings, guardrails, or validation.

### 2. Visualization integrity

A simulation fails visualization review if the display is physically misleading in **any** of these ways:

- A wavefunction, probability density, or histogram is rescaled by its current peak, by `max(...)`, or by any auto-fit rule that changes the physical meaning of the vertical axis from state to state.
- A quantity is plotted with hidden scaling and the UI does not clearly state the scale.
- The plot clips values, compresses ranges, or otherwise changes the apparent physics for presentation convenience.
- A plot labeled `|ψ|²`, `ψ`, `Re(ψ)`, `Im(ψ)`, energy, etc. does not actually show that quantity.
- A histogram compares counts to a continuous PDF without density normalization.
- Decorative effects (opacity, glow, gradients, overlays) obscure nodes, tails, support, zeros, or sign structure.
- Axis labels, titles, or legends are missing, inconsistent, or mathematically wrong.

### 3. Lecture alignment

A simulation fails lecture alignment if:

- notation differs from the lecture notes in content or notation without good reason,
- the simulation includes extra assumptions that are not disclosed,
- the simulation omits an equation, definition, or concept that is central to that lecture, or
- the simulation introduces a model that is materially narrower or broader than the lecture scope without stating so clearly

### 4. Symbol fidelity

Every symbol in the simulation (variable names, axis labels, UI text, 
LaTeX in the HTML) must match the lecture notes exactly unless a 
substitution is explicitly declared and justified in the audit output. 
A symbol mismatch (e.g. V_0 vs U, k vs κ, n vs N) is always flagged 
as NOTATION MISMATCH regardless of whether it affects the physics.

### 5. No symbol or quantity introductions

The simulation must not introduce any symbol, parameter, control, 
displayed statistic, or UI element that does not appear in the 
matching lecture section. This rule is unconditional — physical 
justifiability is not a sufficient reason to add something. 
If a quantity seems missing, flag it as AMBIGUOUS / REQUIRES REVIEW 
and do not implement it.

---

## Required audit procedure

For each sim, do the following in order.

### Step 1 — Extract the implemented model

Read the HTML/JS and write down:

- every displayed equation,
- every physics formula actually used in code,
- every normalization rule,
- every sampling / collapse / time-evolution rule,
- every numerical method,
- every hidden assumption (fixed phase, real-only coefficients, finite window, periodic boundary, capped timestep, smoothing, interpolation, etc.),
- every plotted quantity and how it is scaled.

### Step 2 — Extract the lecture model

Read the matching `.tex` lecture notes and list:

- the lecture’s equations,
- the intended notation,
- the intended conceptual scope,
- anything the lecturer is explicitly trying to show the student.

### Step 3 — Compare them directly

Do not stop at the displayed formulas. Check the **actual implementation** against the lecture.

In particular, compare:

- displayed equations vs implemented equations,
- UI labels vs plotted data,
- normalization shown in the UI vs normalization actually used,
- narrative text vs actual model behavior,
- lecture scope vs simulation scope.

### Step 4 — Check visualization honesty

For every plotted quantity, answer all of these:

- What is the exact quantity being plotted?
- What is the vertical axis in physical units?
- Is the vertical scaling fixed or state-dependent?
- Is the quantity normalized?
- Is any clipping, cap, smoothing, or auto-fit applied?
- If yes, is that physically justified and explicitly labeled?

If the answer is not fully clear from the code, treat that as an issue.

### Step 5 — Check numerical integrity

For simulations with propagation, FFTs, finite grids, or time stepping, explicitly check:

- domain size,
- grid spacing,
- timestep / substep size,
- norm conservation,
- energy drift,
- edge / boundary contamination,
- aliasing or high-k contamination,
- whether diagnostics are surfaced to the user when reliability degrades.

If a simulation can become numerically unreliable at some slider settings, that must be treated as a real issue unless the sim warns the user and constrains the regime.

### Step 6 — Produce a plan before coding

For each issue, specify:

- whether it is a **PHYSICS BUG**, **VISUALIZATION BUG**, **NOTATION MISMATCH**, **CONTENT GAP**, or **AMBIGUOUS / REQUIRES REVIEW**,
- the exact lines or blocks involved,
- the intended fix,
- whether the fix changes only UI text, only plotting, only numerics, or the underlying model.

After that, implement the fixes.

---

## Known recurring issue patterns to check explicitly

These are not hypothetical. Check for them in every simulation.

### A. Hidden vertical rescaling of `|ψ|²`

Flag any plotting logic that rescales the wavefunction or probability density to fit the viewport, including patterns like:

- `peak = max(...)`
- `scale = const / peak`
- `y = y0 - value * autoScale`
- labels such as `scaled` or `normalized for display`

This is a bug **unless** the visualization is explicitly documented as a schematic display and the axis is labeled accordingly.

### B. UI implies coefficient normalization when normalization actually comes from `N` or `N'`

If the lecture writes

- `ψ = (1/sqrt(N'))(α ψ1 + β ψ2)`

then the UI should not imply that the user must enforce `α² + β² = 1` unless that is genuinely the chosen model.

If the code normalizes by `N'` but the UI displays `Coefficient choice: α² + β² = ...`, treat that as a notation/content issue unless the sim explicitly says coefficients are being restricted to normalized real weights.

### C. Hidden restriction to real, in-phase coefficients

If the lecture allows `α, β ∈ ℂ` but the sim forces:

- `α, β ∈ ℝ`,
- fixed relative phase,
- `cos φ = 1`, `sin φ = 0`, or equivalent,

then the simulation must either:

1. expose that degree of freedom, or
2. clearly declare that it is a restricted toy model.

Do not leave such restrictions implicit.

### D. Measurement model narrower or broader than the lecture

If the lecture’s collapse discussion is a discrete toy story (“detect near X1 or X2”) but the sim implements a continuous-position sample `x_m ~ |ψ(x)|²` followed by localization around `x_m`, mark this for review.

This may be acceptable, but it must be checked deliberately rather than assumed.

### E. Numerical reliability hidden behind a polished UI

If the sim has FFT propagation, finite domains, substeps, or safety thresholds, verify that the UI communicates when the result is no longer trustworthy.

Diagnostics are good, but they do **not** excuse visibly misleading plots.

---

## Implementation rules

When fixing a simulation:

- Prefer fixes that make the simulation **more physically exact**, not merely prettier.
- Do not change the lecture notes.
- Do not silently broaden or narrow the conceptual scope.
- Keep notation consistent with the lecture.
- If you must choose between a visually convenient plot and a physically faithful plot, choose the physically faithful plot.
- If a physically faithful plot becomes hard to read, solve that with better layout, axis design, labels, or multiple panels — **not** by distorting the data.

---

## Output format for each simulation

Use this exact structure.

```md
## [filename]
**Lecture match:** L[##] — [lecture title]
**Status:** PASS / ISSUES FOUND / REQUIRES REVIEW

### Implemented model
- [brief summary of the actual model in code]

### Lecture model
- [brief summary from the `.tex` notes]

### Issues
1. [PHYSICS BUG] [short title]
   - **Where:** [function / lines / UI element]
   - **Current behavior:** [what the sim currently does]
   - **Required fix:** [what to change]
   - **Why:** [physics / lecture rationale]

2. [VISUALIZATION BUG] [short title]
   - **Where:** ...
   - **Current behavior:** ...
   - **Required fix:** ...
   - **Why:** ...

3. [NOTATION MISMATCH] ...
4. [CONTENT GAP] ...
5. [AMBIGUOUS / REQUIRES REVIEW] ...

### Fix plan
- [ordered implementation checklist]

### Post-fix validation
- [ ] Equations match lecture notes
- [ ] Normalization checked
- [ ] Visualization uses physically meaningful scaling
- [ ] Units/notation match lecture
- [ ] Numerical diagnostics checked (if relevant)
```

---

## Agent checklist before marking a simulation complete

Do **not** mark a sim complete unless all relevant items below are true.

- [ ] Every displayed equation was compared with the lecture notes.
- [ ] Every implemented equation was compared with the lecture notes.
- [ ] Every plotted quantity was identified and checked for hidden rescaling.
- [ ] Normalization was verified analytically or numerically.
- [ ] Units were checked.
- [ ] Scope restrictions were made explicit.
- [ ] Numerical stability was checked where relevant.
- [ ] All changes were summarized clearly.

---

## Notes for the coding agent

Be skeptical of polished UI text. Trust the actual code and the lecture notes.

Common failure mode: the simulation *looks* right because the plot auto-fits nicely, but the displayed quantity is no longer physically meaningful. Treat that as a real bug.

Another common failure mode: the code correctly normalizes the state internally, but the UI text explains the state using a different normalization convention. Treat that as a real mismatch too.
