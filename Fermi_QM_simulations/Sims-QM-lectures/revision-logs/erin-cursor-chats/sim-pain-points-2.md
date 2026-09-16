# Sim Pain Points Synthesis

Synthesized from `issues-batch-1.md` through `issues-batch-6.md`.

## Data Overview

- Source files: 6 batch files in `erin-cursor-chats/`
- Sims audited: 22 distinct simulation files
- Duplicate confirmed: `L02_Two_Gaussian_wave_superposition.html` and `L02_Two_Gaussian_superposition.html` are the same sim and are combined below
- Total unique issues: about 180 overall, 181 after deduplicating repeated issues across sessions

### Sims appearing in multiple chat logs

- `L04_double-slit-experiment.html`: 4 chat logs, 13 issues, 14 requests
- `L05_particle-on-a-circle.html`: 2 chat logs, 20 issues, 13 requests
- `L06_A(k)-vs-k-plot.html`: 2 chat logs, 9 issues, 6 requests
- `L02_Single_Gaussian_plot.html`: 2 chat logs, 4 issues, 5 requests
- `L07_harmonic-oscillator.html`: 2 chat logs, 13 issues, 12 requests
- `L15_2d_wavefunction_collapse_measurement.html`: 2 chat logs, 12 issues, 6 requests
- `L02_Two_Gaussian_superposition.html`: multiple logs across batches 3-4, 11 issues, 12 requests

## Part A: Proposed Issue Categories

Approximate counts below are for pattern-finding, not bookkeeping. The categories are kept separate and each issue is assigned once.

1. `Visual clutter and information overload` (~30 issues, ~12 sims): excess readouts, equations, labels, overlays, or decorative elements compete with the thing the student should actually be looking at.
2. `Lecture-note misalignment` (~25 issues, ~15 sims): notation, variable names, sign conventions, formulas, units, or even content scope diverge from the lecture material the sim is supposed to support.
3. `Dishonest visualization` (~18 issues, ~10 sims): hidden normalization, nonlinear display mappings, per-state scaling, or formula/display mismatches make the plot misrepresent the underlying quantity.
4. `Labeling and math formatting` (~18 issues, ~10 sims): missing labels, wrong labels, overlapping text, broken subscripts, inconsistent font sizes, or plain-text math where proper notation is needed.
5. `Physics model errors` (~15 issues, ~8 sims): the actual model is wrong, not just the presentation. These include wrong force laws, wrong probability models, wrong sign conventions, or incorrect dynamics.
6. `Pedagogical framing problems` (~10 issues, ~7 sims): the sim teaches the wrong lesson or obscures the intended one even when the code is technically working.
7. `Layout and interaction design` (~15 issues, ~8 sims): poor panel arrangement, missing maximize/restore, unintuitive controls, draw-order problems, or layouts that block the visual comparison the sim exists to teach.
8. `Bad defaults` (~8 issues, ~6 sims): the initial state is not usable without manual repair, usually because the view is too zoomed out, too fast, upside down, or emphasizing the wrong panel.
9. `Poor rendering quality` (~7 issues, ~6 sims): jagged curves, aliasing, low spatial resolution, or traces too faint or thin to read.
10. `Broken or unusable functionality` (~8 issues, ~5 sims): crashes, freezes, race conditions, or interactions that fail badly enough to stop normal use.
11. `Dynamic axis instability` (~6 issues, ~5 sims): axes rescale so often that students cannot visually track convergence or parameter changes.

## Part B: Per-Sim Summary

| Sim file | Issues found | User requests | Top issue categories |
| --- | ---: | ---: | --- |
| `L07_Harmonic_Oscillator_High_Energies.html` | 20 | 14 | lecture-note misalignment; labeling/math formatting; layout/interaction |
| `L05_particle-on-a-circle.html` | 20 | 13 | layout/interaction; labeling/math formatting; bad defaults |
| `L08_Bound_states.html` | 16 | 6 | lecture-note misalignment; layout/interaction; labeling/math formatting |
| `L04_double-slit-experiment.html` | 13 | 14 | physics model errors; lecture-note misalignment; dishonest visualization |
| `L07_harmonic-oscillator.html` | 13 | 12 | visual clutter; labeling/math formatting; dishonest visualization |
| `Sims-v2/stern-gerlach.html` | 12 | 8 | physics model errors; labeling/math formatting; broken functionality |
| `L15_2d_wavefunction_collapse_measurement.html` | 12 | 6 | dishonest visualization; broken functionality; labeling/math formatting |
| `L02_Two_Gaussian_superposition.html` | 11 | 12 | visual clutter; lecture-note misalignment; pedagogical framing |
| `L09_Transmission_probability_plot_updated.html` | 11 | 7 | lecture-note misalignment; layout/interaction; poor rendering quality |
| `L06_A(k)-vs-k-plot.html` | 9 | 6 | visual clutter; lecture-note misalignment; layout/interaction |
| `L03_classical-vs-schrodinger.html` | 7 | 7 | pedagogical framing; broken functionality; layout/interaction |
| `L03_classical-vs-schrodinger-ANHARMONIC.html` | 6 | 7 | poor rendering quality; labeling/math formatting; broken functionality |
| `L08_Finite_well_probability_plot.html` | 6 | 3 | lecture-note misalignment; visual clutter; dishonest visualization |
| `L02_Single_Gaussian_plot.html` | 4 | 5 | visual clutter; dynamic axis instability; bad defaults |
| `L04_Two_Gaussian_wavefunction_collapse.html` | 4 | 4 | pedagogical framing; lecture-note misalignment |
| `L05_plane_wave_plots.html` | 3 | 4 | lecture-note misalignment; layout/interaction |
| `Sims-v2/double-slit.html` | 3 | 4 | dishonest visualization; dynamic axis instability; physics model errors |
| `Sims-v2/New_Wavefunction_collapse_Measurement.html` | 3 | 4 | bad defaults; pedagogical framing; broken functionality |
| `L06_Time_evolution_Gaussian_wavepacket_v2.html` | 3 | 3 | poor rendering quality; lecture-note misalignment; physics model errors |
| `Sims-v2/gaussian-distribution.html` | 2 | 2 | dynamic axis instability; dishonest visualization |
| `Sims-v2/wavefunctions-and-probability.html` | 2 | 1 | pedagogical framing; physics model errors |
| `L13_Fourier-series.html` | 1 | 3 | poor rendering quality |

`L02_Two_Gaussian_wave_superposition.html` and `L02_Two_Gaussian_superposition.html` are treated as one row above.

### Most painful sims

- `L05_particle-on-a-circle.html`: 20 issues, 13 requests
- `L07_Harmonic_Oscillator_High_Energies.html`: 20 issues, 14 requests
- `L08_Bound_states.html`: 16 issues, 6 requests
- `L04_double-slit-experiment.html`: 13 issues, 14 requests
- `L07_harmonic-oscillator.html`: 13 issues, 12 requests

### Averages

- Average issues per sim: 8.2
- Average requests per sim: 6.6

### Sim-type clustering notes

- Harmonic-oscillator sims are the heaviest cluster: 33 issues across `L07_harmonic-oscillator.html` and `L07_Harmonic_Oscillator_High_Energies.html`.
- Bound-state / finite-well sims are another dense cluster: 22 issues across `L08_Bound_states.html` and `L08_Finite_well_probability_plot.html`.
- Multi-panel, multi-view, and 3D sims accumulate the most pain points. They create more chances for layout failure, dishonest scaling, label collisions, and bad defaults.

## Part C: Summary

- Total issues: 181 across 22 sims
- Top 3 categories by count: visual clutter and information overload; lecture-note misalignment; dishonest visualization

The strongest pattern is not deep physics bugs. It is presentation-level failure: cluttered screens, lecture-note mismatch, misleading scaling, and labels that either break or say the wrong thing. These sims are a subset of the full suite, but even within this subset the repeated failure mode is clear: the agent tends to add more than the sim needs, auto-scale what should stay fixed, and use generic physics notation instead of the lecture's notation. The less frequent categories are often the more dangerous ones. Dishonest visualization and physics-model errors produce output that can look plausible while still teaching the wrong thing.
