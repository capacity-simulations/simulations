# Golden guided-inquiry flows — the SME dataset (canonical)

Transcribed verbatim-in-substance from the senior physics SME's document
*"Guided Exploration Questions"* (last updated 9 Sept 2026, 6:34pm IST;
source PDF: `guided-exploration-questions.pdf`). These ten flows are the
**canonical exemplar set** for the guided-inquiry grammar in `SKILL.md`.
When the grammar and an agent's instinct disagree, these flows win. When
these flows and the grammar appear to disagree, flag it — do not silently
pick one.

Companion evidence: the 8 Sept audit *"Guided-Inquiry Rewrite Candidates"*
(16 sims, anti-patterns A–F). Note two places the SME **overruled** the
audit — both are encoded in the grammar:
- L05's "equal height" question was audit-flagged as a giveaway; the SME
  kept it. Representation-reading questions are legitimate.
- Wine-Bottle's told-not-asked massive-mode card was audit-flagged; the SME
  kept it as a tell. Naming/definitions may be told; behaviour is asked.

---

## 1 · Stern-Gerlach  (QM)

**Global instructions**
- Add a toggle to start/stop the beam. Landing page starts with the beam OFF.
- Text in a card before the simulation is displayed: *"A particle source
  emits particles with a random magnetic moment μ, and this beam is passed
  through an inhomogeneous magnetic field aligned along the z-axis, as
  shown. The force on each particle is proportional to the projection of
  the magnetic moment along the z-axis, denoted μ_z. Quantum mechanically,
  the magnetic moment is proportional to the spin of the particle."*
- After this, click **Proceed** to advance to the simulation.
- After each question, reset the detector and turn the beam off.

**Q1.** Classically, what is the distribution of particles on the detector
screen?
A. Uniform distribution. · B. Peaked at the center and tapering towards the
edges. · C. Two peaks that are widely separated.
**Answer.** A, since μ can point in any direction and therefore μ_z can take
any value between ±μ_z.

**Q2.** A particle with spin j = 1/2 is emitted by the beam, and the beam
splits into two. Why?
A. The particle's charge causes the beam to split. · B. The spin
wavefunction collapses. · C. The spins are attracted by the magnetic field.
**Answer.** B. The magnetic field serves as a measurement device that
collapses the wavefunction onto eigenstates of the σ_z operator.

**Q3.** For particles with spin j, how many bands does the beam split into?
A. 1/j bands. · B. 2j+1 bands. · C. j+1 bands.
**Answer.** B. A spin-j particle has 2j+1 degenerate eigenstates labelled by
the magnetic quantum number m, and this degeneracy is lifted by a magnetic
field.
*(Design note: for the observed j = 1/2 → 2 bands, BOTH 1/j and 2j+1 give 2
— the distractors are deliberately degenerate on the seen case, so the
student must change j in the sim to discriminate.)*

**Q4.** The magnetic field gradient is doubled and the beam emits j = 1/2
particles. How does the force on the particles in the beam change?
A. The force increases 4×. · B. The force reduces by half. · C. The force
doubles.
**Answer.** C. The force is proportional to the gradient of the magnetic
field.

---

## 2 · Double-Slit Experiment — Measurement  (QM)

**Global instructions**
- Add a toggle to start/stop source emission.
- Text in a card before the simulation is displayed: *"A point source emits
  monochromatic radiation at wavelength λ. A screen with two slits is
  placed in between the source and a detector screen."*
- After this, click **Proceed** to advance to the simulation.
- Add functionality to close the L/R screens (slits).

**Q1.** Classically, if one slit is closed, what form does the distribution
take?
A. Crests and troughs, an interference pattern. · B. Highest in front of
the slit, and tapering away from it. · C. Both slits are required.
**Answer.** B. This is a standard diffraction pattern from classical wave
optics.

*Text in a card before the next question:* "Young's double slit experiment
shows an interference pattern, i.e. crests and troughs."

**Q2.** What conclusion can be drawn from Young's double slit experiment?
A. Classical physics is inadequate to describe light. · B. Light has both
particle and wave natures. · C. Classically, light behaves like a wave, as
only waves can interfere.
**Answer.** C. Waves can have constructive/destructive interference, not
particles.
*(Design note: A and B over-claim relative to the evidence shown — Young's
alone licenses only the wave conclusion. Claims must be exactly what the
evidence supports.)*

**Q3.** Place particle detectors in front of the two slits. Predict the
pattern that will form on the detector?
A. An interference pattern. · B. A uniform distribution. · C. A
superposition of two diffraction patterns, i.e. two diffraction peaks.
**Answer.** C. The distribution is the sum of the distributions created by
two individual slits.

---

## 3 · Multi-Stage Stern-Gerlach  (QM)

**Global instructions**
- Text in a card before the simulation: *"In this experiment we consider
  sequential Stern-Gerlach stages, instead of just a single stage."*

**Q1.** Place an X magnet after the first Z magnet. How many regions of the
detector screen are lit up?
A. A single peak at the center of the detector. · B. Two peaks
corresponding to split caused by the last (X) magnet. · C. Four peaks.
**Answer.** C. Each magnet causes a twofold split.

**Q2.** Block the spin-down (↓) output after the first Z magnet. Place a Z
magnet in the second slot. How many regions of the detector screen are lit
up?
A. One, since the spin-down (↓) output is blocked. · B. Two, since every
beam can be split further into spin-up (↑) and spin-down (↓) outputs. ·
C. None.
**Answer.** A. The beam entering the second Stern-Gerlach set-up is only
spin-up (↑) and remains so.

**Q3.** Block the spin-down (↓) output after the first Z magnet. Place an X
magnet in the second slot, and block one of the outputs (←). Now place a Z
magnet in the third slot. How many regions of the detector screen are lit
up?
A. One. · B. Two. · C. Four.
**Answer.** Two. The X apparatus destroys the Z measurement done in the
first Stern-Gerlach apparatus, and so under a subsequent Z measurement one
recovers two possible values of spin.

---

## 4 · Spacetime Diagram Explorer  (SR)

**Q1.** Events 1 and 2 begin on the same horizontal line, i.e. they have
the same height off the spatial axis. What does this imply?
A. The events are simultaneous. · B. The events are at the same location in
space. · C. The events are nearby.
**Answer.** A. The events are simultaneous as they share the same ct
coordinate.

**Q2.** Drag Event 2 such that the line joining it to Event 1 makes a 45
degree angle. Which of the following statements is true?
A. There exists a frame of reference in which these two events are
simultaneous. · B. The spacetime interval between the two events depends on
the observer. · C. A ray of light that leaves Event 1 will reach Event 2.
**Answer.** C. The spacetime interval between the two events is zero.

**Q3.** Add worldlines of particles that make different angles with the
x-axis. What is the significance of the v/c label?
A. Worldlines can have many possible slopes. · B. Slopes v/c > 1 are not
allowed. · C. Slopes v/c < 1 are not allowed.
**Answer.** B. Slopes v/c > 1 correspond to particles moving faster than
light, which is impossible.

---

## 5 · Relativistic Constant Acceleration  (SR) — slide edits

- Text in Slide 1 should be: *"Press play and compare the relativistic
  curve (solid) with the Newtonian prediction (dashed)."*
- Remove Slide 2 (the symbol glossary).
- Move current Slide 3 (the gated predict) **before** Slide 1.

---

## 6 · The Damped Oscillator  (CM) — slide edits

- Slide 1 should be: *"A mass connected to a spring is released from a
  height of 1 m and is underdamped. Will it cross the x = 0 reference point
  or go to rest immediately?"*
- Slide 2 should be: *"The damping factor is now critical. Compare with the
  underdamped case."*
- Slide 3 should be: *"Now observe the overdamped case. How is it different
  from the critically damped case?"*
- Move slides 4 and 5 (the settle-race predict and the race) **before**
  current slide 1.
- For slide 6, the decay-rate map should be the **hero graphic**.

---

## 7 · Exploring the Standard Model  (PP) — slide edits

- Slide 1 should be: *"Columns I–III are matter particles. The gauge column
  consists of force carriers. The masses of these particles is indicated on
  a logarithmic scale at the bottom of the screen."*
- Slide 2 should be: *"Each column of matter particles is called a
  generation. When going from one generation to the next, what changes?"*
- Slide 3 should be: *"Heavier particles are harder to produce, and the
  last particle we found was the Higgs boson. Is it therefore the
  heaviest?"*
- Remove Slide 4 (the Lagrangian term-count question).

---

## 8 · The Wine-Bottle Potential  (PP) — slide edits

- Slide 1 should be: *"The potential V(φ) is described by a quartic
  potential, and μ² is the coefficient of the quadratic term. It can be
  both positive or negative. Explore what happens when you change μ²."*
- Slide 2 should be: *"Let μ² = −2. The potential looks like the bottom of
  a wine bottle, and the field sits at the center φ = 0. Will it stay
  there?"* The explanation on answering should be: *"It is an equilibrium
  but an unstable one."*
- Slide 3 should be: *"Small oscillations about the local minima are
  responsible for a massive mode in the spectrum of the theory."*
- Slide 4 should be: *"The field rests at some point on the circle of local
  minima. If one pushes the field along the green arrow, what happens?"*
- Slide 5 should be: *"When μ² is varied but kept less than zero, which of
  the following modes remains?"* The answer should read: *"For all μ² < 0
  there is a massless mode called the Goldstone mode."*

---

## 9 · Simulations that are fine (no changes)

The guided-inquiry text is fine as-is for:
- Causality Misconceptions Explorer (SR)
- E & B Under A Boost (SR)

*(Both were audit-flagged as structurally weak; the SME passed them. His
bar is whether the flow makes physical sense to a student — density of
post-predict physics prose is not, by itself, a defect.)*
