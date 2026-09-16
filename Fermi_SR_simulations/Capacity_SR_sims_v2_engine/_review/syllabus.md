# Syllabus reference — per-sim (source of truth for review)

Auto-extracted from *Special Relativity Syllabus and Course Planning.xlsx* → `Syllabus` sheet.
Filename key `LNN-sN` maps to lecture NN, Simulation N. Do not hand-edit; re-extract if the xlsx changes.

## L00-s1
- **Lecture:** 0.0 — Prelude Equivalence & Why Special Relativity
- **Learning outcomes:** Form an intuition about the principle of equivalence between inertial observers.
Appreciate the core idea of relativity: that physical laws take the same form for all inertial observers.
Recognise that measurements of time depend on the observer (is not be absolute).
Identify the conceptual motivation for special relativity and the limitations of pre‑relativistic intuitions.
- **Elements:** Static Observers
Equivalence
Relativity
Relative Time
- **Sim description (what it must do):** (Guided inquiry): Ball on a train:  A 2D side view showing a train carriage moving at velocity v relative to a platform. A ball is thrown vertically up inside the carriage at speed u relative to the carriage. Two readout panels update live: position (x, y) and velocity (vₓ, vᵧ) of the ball in the currently active frame. A frame selector lets the student switch between the platform frame and the train frame. The ball's trajectory is traced in the active frame; switching frames clears the trajectory and redraws it from the new frame's perspective. No relativistic effects yet.
- **Inquiry questions:** Before running the simulation: the ball is thrown straight upward on the train and the train moves  relative to the platform. Sketch the trajectory of the ball as seen from the train. Now sketch it as seen from the platform. Are both sketches describing the same physical event? Can both be correct simultaneously?
- **Additional notes:** 1) Possible addition as a follow-up affter students have experimented: Now consider this: suppose instead of a ball, we throw a light pulse. Would the same logic apply? What would you predict? 2) The simulation could be stripped back to a lecture visual aid by removing the frame selector and just animating the two frames side by side.
- **Misconception (lecture):** —
- **Checkpoint (lecture):** Which of the following correctly describes the principle of relativity for inertial observers? Select all that apply.
a)        All inertial observers will agree on the numerical values they assign to positions and velocities.
b)        The laws of physics take the same mathematical form in all inertial frames.
c)        There is always one inertial frame that can be identified as “truly at rest” by performing physical experiments.
d)        No physical experiment performed inside a uniformly moving laboratory can tell you whether the laboratory is moving or stationary.
e)        Two inertial observers must agree that the same physical laws govern a falling ball, even though they may disagree on the ball’s trajectory.
 
Correct: b, d, e. – (a) is wrong: positions and velocities are frame-dependent quantities. (c) is wrong: no experiment can identify absolute rest, which is the whole point of the principle of relativity

## L01-s1
- **Lecture:** 1.0 — Geometry
- **Learning outcomes:** Explain what is meant by geometry as a mathematical description of space.
Use Cartesian and polar coordinates to describe points and trajectories.
Understand coordinates as labels rather than physical observables.
Recognise the role of geometry in formulating physical laws.
- **Elements:** What is geometry
Cartesian coordinates
Polar coordinates
- **Sim description (what it must do):** (Lecture visual aid) Polar vs Cartesian One window showing an object in uniform circular motion. Two plot windows updating coordinates live: cartesian window - x(t) and y(t), polar window - r(t) and θ(t).
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** A point P sits at coordinates (x, y) in one Cartesian frame. You switch to a rotated Cartesian frame. Which of the following is true?
a)        The point P has moved to a new location.
b)        The point P has not moved, but its numerical description has changed.
c)        Neither description is fully correct; P is only well-defined relative to a given coordinate frame.
Correct: b. Coordinates are labels we assign to points; rotating the coordinate axes reassigns those labels without moving the point. P is a location in space – the same location regardless of how we label it.

True or false: Choosing a coordinate system is a physical operation that can affect the outcome of measurements.
False. Choosing a coordinate system is a mathematical or descriptive choice – it affects the numerical values we assign to positions and trajectories, but not the underlying physics. Two observers using different coordinate systems will describe the same physical events with different numbers but will agree on all frame-independent physical quantities.

## L01-s2
- **Lecture:** 1.0 — Geometry
- **Learning outcomes:** Explain what is meant by geometry as a mathematical description of space.
Use Cartesian and polar coordinates to describe points and trajectories.
Understand coordinates as labels rather than physical observables.
Recognise the role of geometry in formulating physical laws.
- **Elements:** What is geometry
Cartesian coordinates
Polar coordinates
- **Sim description (what it must do):** (Lecture visual aid) Different Coordinate Frames: Side-by-side panels of two different coordinate systems (one rotated by θ relative to the other). Click anywhere on either grid; both highlight the chosen location with the same symbol (star, triangle, asterisk, etc) and display their respective (x, y) and (x', y'). A slider allows the theta to be rotated.
- **Inquiry questions:** Given an (x,y) point, what is the point's coordinates in the (x', y') coordinate system? (Set up the coords so this can be easily read off.)
- **Additional notes:** Follow-up question: the coordinates of the event changed every time you moved the axes, but the event didn't move at all. So what exactly are coordinates describing?
- **Misconception (lecture):** —
- **Checkpoint (lecture):** A point P sits at coordinates (x, y) in one Cartesian frame. You switch to a rotated Cartesian frame. Which of the following is true?
a)        The point P has moved to a new location.
b)        The point P has not moved, but its numerical description has changed.
c)        Neither description is fully correct; P is only well-defined relative to a given coordinate frame.
Correct: b. Coordinates are labels we assign to points; rotating the coordinate axes reassigns those labels without moving the point. P is a location in space – the same location regardless of how we label it.

True or false: Choosing a coordinate system is a physical operation that can affect the outcome of measurements.
False. Choosing a coordinate system is a mathematical or descriptive choice – it affects the numerical values we assign to positions and trajectories, but not the underlying physics. Two observers using different coordinate systems will describe the same physical events with different numbers but will agree on all frame-independent physical quantities.

## L02-s1
- **Lecture:** 2.0 — Vectors
- **Learning outcomes:** Describe Euclidean space as a geometric structure equipped with a metric.
Use the Kronecker delta as the metric in Cartesian coordinates.
Compute inner products and norms of vectors.
Represent physical quantities using vectors.
Interpret the velocity vector as a geometric object with coordinate‑independent meaning.
- **Elements:** Euclidean Space
Metric
Inner Product
Example: Velocity Vector
- **Sim description (what it must do):** (Lecture visual aid). Inner product: Two vectors A and B drawn on a plane, shown in two side-by-side panels. The right panel's axes are rotated by angle θ compared to the left's axes. Each panel displays the components of A and B in its frame, and their inner product A·B (with the full calculation in terms of A_x, A_y, etc shown). A slider sets θ. The vectors A and B can be changed by clicking and dragging the vector tip.
- **Inquiry questions:** Two vectors are shown in the current frame. Predict: if you rotate the coordnate frame by 90°, which of the following will change: 1) the components A_x, A_y,.. 2) the length |A| 3) the inner product A·B? Commit to a prediction before running the simulation!
- **Additional notes:** Follow up: Suppose A represents the velocity of a car. Does the car's speed depend on which way you orient your coordinate axes? If not, which of these quantities, the components or the norm, is the physically meaningful one? 
Can two observers using different coordinate orientations ever agree on the speed of an object? On its velocity components? Why, why not? What does this difference tell you about what 'velocity' really means?
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: A vector and its components are the same thing.
False. A vector is a geometric object that exists independently of any coordinate system. Its components are the numerical projections of that arrow onto the chosen coordinate axes. Rotating the axes changes the components but leaves the vector itself unchanged. Physics should be described in terms of the geometric object, not its frame-dependent numerical representation.

Alice and Bob use coordinate systems that are rotated relative to each other, and both observe the same moving particle. Select all quantities they will agree on.
a)        The x-component of the particle’s velocity
b)        The y-component of the particle’s velocity
c)        The norm of the velocity vector
d)        The speed of the particle
Correct: c, d. The speed and norm are coordinate-independent scalars. The individual components (a) and (b) depend on the orientation of the axes and therefore differ between Alice and Bob.

True or false: Alice and Bob, who use coordinate systems that are rotated relative to each other, are neither identical nor equivalent observers.
False. They are not identical – they use different coordinate systems and will assign different numerical components to the same velocity vector, as the previous question showed. But they are equivalent: neither frame is more valid or physically privileged than the other, and both descriptions are equally correct from a physics perspective: The fact that they agree on the speed and the norm (i.e., the physically meaningful quantities) is precisely the evidence for their equivalence.

## L02-s2
- **Lecture:** 2.0 — Vectors
- **Learning outcomes:** Describe Euclidean space as a geometric structure equipped with a metric.
Use the Kronecker delta as the metric in Cartesian coordinates.
Compute inner products and norms of vectors.
Represent physical quantities using vectors.
Interpret the velocity vector as a geometric object with coordinate‑independent meaning.
- **Elements:** Euclidean Space
Metric
Inner Product
Example: Velocity Vector
- **Sim description (what it must do):** (Guided inquiry) Euclidean space and metric: A 2D plane with a zoom toggle. Zoomed in: a small displacement ds shown as the hypotenuse of a right triangle with legs dx and dy, alongside the metric equation ds² = (2x2 Kronecker delta)(dx dy vector) = dx² + dy² and the Kronecker delta written out as a 2×2 matrix. Zoomed out: students click two points P1 and P2, see the right triangle connecting them with legs Δx and Δy, type Δx and Δy values into input blanks, and read the computed Δs from the metric formula.
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: A vector and its components are the same thing.
False. A vector is a geometric object that exists independently of any coordinate system. Its components are the numerical projections of that arrow onto the chosen coordinate axes. Rotating the axes changes the components but leaves the vector itself unchanged. Physics should be described in terms of the geometric object, not its frame-dependent numerical representation.

Alice and Bob use coordinate systems that are rotated relative to each other, and both observe the same moving particle. Select all quantities they will agree on.
a)        The x-component of the particle’s velocity
b)        The y-component of the particle’s velocity
c)        The norm of the velocity vector
d)        The speed of the particle
Correct: c, d. The speed and norm are coordinate-independent scalars. The individual components (a) and (b) depend on the orientation of the axes and therefore differ between Alice and Bob.

True or false: Alice and Bob, who use coordinate systems that are rotated relative to each other, are neither identical nor equivalent observers.
False. They are not identical – they use different coordinate systems and will assign different numerical components to the same velocity vector, as the previous question showed. But they are equivalent: neither frame is more valid or physically privileged than the other, and both descriptions are equally correct from a physics perspective: The fact that they agree on the speed and the norm (i.e., the physically meaningful quantities) is precisely the evidence for their equivalence.

## L03-s1
- **Lecture:** 3.0 — Coordinate Transformation
- **Learning outcomes:** Describe spatial rotations as symmetry transformations.
Transform velocity vectors under rotations.
Recognise rotations as a prototype for more general symmetry transformations.
- **Elements:** Change of Coordinate
Velocity vector
- **Sim description (what it must do):** (Lecture visual aid) Shape rotation and symmetry: Several shapes (circle, square, equilateral triangle, regular pentagon, regular hexagon) each in its own panel. A shared rotation slider rotates them all simultaneously. As the slider moves, each shape is highlighted at the angles where it returns to its starting configuration: the circle continuously, the square at every 90°, the equilateral triangle at every 120°, the pentagon at every 72°, the hexagon at every 60°. The symmetric angles are printed below the shapes once they are discovered.
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: Rotating the coordinate axes is the same physical operation as rotating the object being described.
False. Rotating the coordinate axes is a purely mathematical re-labelling – it changes the numerical description without moving any physical object. Rotating an object is a physical operation that changes its position or orientation in space. Both operations use the rotation matrix R(θ), but they are conceptually distinct: one is a change of description, the other is a change of the physical situation.

A rotation is a symmetry transformation of Euclidean space. Which of the following statements correctly describes what this means? Select all that apply.
(a) Rotations change the distances and angles between geometric objects – that is what makes these transformations physically meaningful. 
(b) Rotations leave distances and angles between geometric objects unchanged — this is what it means for them to be symmetries. 
(c) Because Euclidean space has no preferred direction, we can rotate coordinate axes and all possible such orientations of coordinate axes are physically equivalent. 
(d) A symmetry transformation always leaves the individual components of vectors unchanged.
(Correct: b, c – (a) has the definition backwards: a symmetry transformation is precisely one that leaves distances and angles invariant (d) is wrong: components do change under rotations – it is the metric-derived quantities (distances, angles, norms) that are preserved.

## L04-s1
- **Lecture:** 4.0 — Scalar invariants
- **Learning outcomes:** Identify translations and rotations as special coordinate transformations between Cartesian systems.
Use the Euclidean metric to define invariant quantities.
Distinguish between scalars and vectors under coordinate transformations.
Derive the spatial distance (interval) between points as a scalar invariant.
Understand invariance as a guiding principle for constructing physical observables.
- **Elements:** Changes between Cartesian
Euclidean metric
Scalars
Space distance (interval)
- **Sim description (what it must do):** (Lecture visual aid). Scalars vs vectors: Two vectors A and B drawn on a plane, shown in two side-by-side panels. The right panel's axes are rotated by angle θ compared to the left's axes. Each panel displays the components of A and B in its frame, the norm of each vector, and the norm of the vector (A-B). A slider sets θ. The vectors A and B can be changed by clicking and dragging the vector tip.
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: Physical laws must be expressed in terms of scalars, i.e. quantities that are coordinate-independent, because otherwise different observers would derive different forms of those laws.
True. If a physical law were written in terms of coordinates alone, rotating the coordinate axes would give a different equation – contradicting the requirement that the laws of physics do not depend on the choice of observers.

Which of the following are scalar invariants under translations and rotations between Cartesian coordinate systems? Select all that apply.
a)	The x-component of a velocity vector
b)	The speed of a particle
c)	The distance between two points P and Q
d)	The angle between two vectors
e)	The metric 
Correct: b, c, d. – (a) is frame-dependent. (e) The metric is a tensor and not a scalar

## L04-s2
- **Lecture:** 4.0 — Scalar invariants
- **Learning outcomes:** Identify translations and rotations as special coordinate transformations between Cartesian systems.
Use the Euclidean metric to define invariant quantities.
Distinguish between scalars and vectors under coordinate transformations.
Derive the spatial distance (interval) between points as a scalar invariant.
Understand invariance as a guiding principle for constructing physical observables.
- **Elements:** Changes between Cartesian
Euclidean metric
Scalars
Space distance (interval)
- **Sim description (what it must do):** Euclidean space and metric (sim from lecture 2): Addition of a separate control that lets students translate the origin and rotate the axes.
- **Inquiry questions:** —
- **Additional notes:** Prompt for Claudia to kick off the lecture: she asks students to formulate their own definition of "physical observable" before the formal one is given, using the simulation evidence as the basis
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: Physical laws must be expressed in terms of scalars, i.e. quantities that are coordinate-independent, because otherwise different observers would derive different forms of those laws.
True. If a physical law were written in terms of coordinates alone, rotating the coordinate axes would give a different equation – contradicting the requirement that the laws of physics do not depend on the choice of observers.

Which of the following are scalar invariants under translations and rotations between Cartesian coordinate systems? Select all that apply.
a)	The x-component of a velocity vector
b)	The speed of a particle
c)	The distance between two points P and Q
d)	The angle between two vectors
e)	The metric 
Correct: b, c, d. – (a) is frame-dependent. (e) The metric is a tensor and not a scalar

## L05-s1
- **Lecture:** 5.0 — Spacetime
- **Learning outcomes:** Define events and reference frames in spacetime.
Construct and interpret spacetime diagrams.
Represent worldlines of particles and observers.
Understand time and space as components of a unified spacetime description.
Appreciate the physical meaning of simultaneity.
- **Elements:** Event
Frame
Spacetime diagrams
Measuring distances and time
- **Sim description (what it must do):** (Guided inquiry) Frame clock and event time: A 2D grid representing an inertial frame S, with a single central clock displayed at the top-right corner showing the elapsed coordinate time t for the entire frame. A frame indicator panel in the top-right corner shows the active frame name and its velocity. The grid and clock are rendered in a consistent frame colour. Students place point events anywhere on the grid by clicking; each placed event is immediately labelled with the coordinate time read from the central clock at the moment it is placed, regardless of the event's spatial distance from the origin or the clock. No additional clocks can be placed within the frame. A second frame S′ with its own central clock, grid, and frame colour can be activated via a toggle; a slider sets its velocity v relative to S. When S and S′ are both active, both grids and both clocks are visible simultaneously. At t = 0 both clocks are synchronised and the origins of S and S′ coincide. When an event is placed, both frames independently label it with their own coordinate time.
- **Inquiry questions:** Step 1: Before placing any events: this simulation has one clock per frame. It doesn't let you place additional clocks at different positions. Why do you think that design choice was made? What problem might arise if each observer in the frame had their own separate clock? Step 2: An event occurs at position x = 10 (ten grid squares from the clock). The clock currently reads t = 0. What time coordinate will the simulation assign to this event? Commit to an answer before running. Step 3: Light from the event would take some time to travel from x = 10 to the clock at x = 0. Should the simulation wait for the light to arrive at the clock before recording the time? Why, or why not? Step 4: Now suppose there is a second frame S' moving at velocity v relative to S, also with a single central clock. Both clocks read t = 0 when the frames overlap. An event occurs. Will the two frames assign the same time coordinate to it? Why, why not?
- **Additional notes:** This simulation is meant to familarize students with the basic visual language and basic features that we'll use for all frame simulations consistently. This consistency will reduce cognitive load for students as they become familiar with the design of the simulations. This is how such visual consistency could look like in practice: 1) a frame indicator panel, always in the same corner, showing the name of the currently active frame (e.g. S, S′) and its velocity relative to a reference, 2) a single central clock design applied consistently, i.e., one clock per frame, always displayed in the same position, 3) possibly also a consistent grid colour per frame (e.g. S always rendered on a neutral grid, S′ always on a visually distinct one) so that switching frames produces an immediately visible change in the environment, not just in the readouts
- **Misconception (lecture):** —
- **Checkpoint (lecture):** Which of the following are spacetime events? Select all that apply.
(a) A train journey from Paris to Berlin
(b) A photon being absorbed by an atom at a specific moment
(c) The collision of two billiard balls at a specific moment
(d) The planet Earth
Correct: b, c. An event is a point in spacetime (a) is a worldline: a continuous sequence of events. (d) is an extended object with a worldline spanning several billion years, not a single event.)

On a spacetime diagram with ct on the vertical axis and x on the horizontal axis, what does a vertical straight worldline represent?
(a) An object moving at the speed of light
(b) An object at rest in this frame
(c) An object accelerating uniformly
Correct: b. A vertical worldline means the x-coordinate does not change over time: the object stays at the same spatial location as ct increases. 

Two observers, Alice and Bob, are both at rest in frame S. An event E occurs. Alice is 2 m from E; Bob is 20 m from E. Which observer assigns the earlier coordinate time to event E?
(a) Alice, because she and her clock are closer to the event
(b) Bob, because being further away means the event happened earlier in his past
(c) Neither – both assign the same coordinate time
(d) It depends on how fast the signal from E travels
Correct: c. In a single inertial frame, all clocks are synchronised. Since Alice and Bob are co-moving observers with synchronised clocks, they will agree on the time coordinate. The signal travelling time is irrelevant to the coordinate time assignment.

## L05-s2
- **Lecture:** 5.0 — Spacetime
- **Learning outcomes:** Define events and reference frames in spacetime.
Construct and interpret spacetime diagrams.
Represent worldlines of particles and observers.
Understand time and space as components of a unified spacetime description.
Appreciate the physical meaning of simultaneity.
- **Elements:** Event
Frame
Spacetime diagrams
Measuring distances and time
- **Sim description (what it must do):** Spacetime diagram explorer: A 2D spacetime diagram with ct vertical and x horizontal, drawn over a background grid. Students place events on the diagram, draw worldlines for moving objects, and select pairs of events to read off relationships: their (ct, x) coordinates, cΔt, Δx, and whether they are simultaneous (Δt = 0) or at the same location (Δx = 0). A default observer worldline at x = 0 is present.
- **Inquiry questions:** —
- **Additional notes:** https://en.wikipedia.org/wiki/File:MinkBoost2.gif
- **Misconception (lecture):** —
- **Checkpoint (lecture):** Which of the following are spacetime events? Select all that apply.
(a) A train journey from Paris to Berlin
(b) A photon being absorbed by an atom at a specific moment
(c) The collision of two billiard balls at a specific moment
(d) The planet Earth
Correct: b, c. An event is a point in spacetime (a) is a worldline: a continuous sequence of events. (d) is an extended object with a worldline spanning several billion years, not a single event.)

On a spacetime diagram with ct on the vertical axis and x on the horizontal axis, what does a vertical straight worldline represent?
(a) An object moving at the speed of light
(b) An object at rest in this frame
(c) An object accelerating uniformly
Correct: b. A vertical worldline means the x-coordinate does not change over time: the object stays at the same spatial location as ct increases. 

Two observers, Alice and Bob, are both at rest in frame S. An event E occurs. Alice is 2 m from E; Bob is 20 m from E. Which observer assigns the earlier coordinate time to event E?
(a) Alice, because she and her clock are closer to the event
(b) Bob, because being further away means the event happened earlier in his past
(c) Neither – both assign the same coordinate time
(d) It depends on how fast the signal from E travels
Correct: c. In a single inertial frame, all clocks are synchronised. Since Alice and Bob are co-moving observers with synchronised clocks, they will agree on the time coordinate. The signal travelling time is irrelevant to the coordinate time assignment.

## L06-s1
- **Lecture:** 6.0 — Galilean Relativity
- **Learning outcomes:** Describe relative motion between inertial observers.
Apply Galilean transformations to positions and velocities.
Explain the principle of Galilean relativity.
- **Elements:** Relative motion
Relative Speed
Relative Velocity
- **Sim description (what it must do):** (Guided inquiry) Dodgeball: A 2D top-down view showing two people, A and B, and a ball thrown from A toward B. Three selectable frames: A's rest frame, B's rest frame, and the ball's rest frame. A frame indicator panel in the top-right corner shows the active frame name and its velocity. A velocity readout panel shows the speed and direction of each object (A, B, and ball) in the currently selected frame. Sliders set the velocity of A relative to the ground, the velocity of B relative to the ground, and the speed of the ball relative to A. Switching frames updates all velocity readouts simultaneously and redraws the trajectories from the new frame's perspective.
- **Inquiry questions:** —
- **Additional notes:** Requiring students to actively select the frame before reading off velocities makes frame-dependence unavoidable by design. The adjustable velocity of A and B allows students to explore Galilean velocity addition, linking back to the learning outcomes.
- **Misconception (lecture):** A friend argues: 'the ground frame is the natural one to use – the velocities in that frame are the real ones.' What would you say to them? Does the simulation give you any evidence either way?
- **Checkpoint (lecture):** True or false: In Galilean relativity, if observer A measures observer B's speed as v, then B must also measure A's speed as v.
True. If B moves at +v relative to A, then from B's perspective A moves at −v. The magnitudes are equal. This kinematic symmetry follows directly from Galilean velocity addition and reinforces that neither observer can claim to be the one who is "really" moving.

## L07-s1
- **Lecture:** 7.0 — Speed of Light
- **Learning outcomes:** Understand the theoretical expectations for light propagation in a medium.
Explain how the speed of light varies depending on the observer in Galilean relativity.
Identify the tension between Galilean relativity and electromagnetism.
- **Elements:** Aether
Theoretical Predictions
Michelson Morley Experiment
- **Sim description (what it must do):** Michaelson-Morley experiment: A top-down view of the interferometer: light source, beam splitter, perpendicular arms (length L), and a detector where the recombined beams interfere. An "aether wind" arrow points in a fixed direction across the apparatus; the entire apparatus can be rotated relative to this wind. Two modes: in aether "prediction" mode, the round-trip light travel times in the two arms are computed using Galilean velocity addition, the fringe pattern at the detector is drawn from the resulting path-length difference, and rotating the apparatus shifts the pattern. In actual experiment mode, the same apparatus shows no fringe shift on rotation at any velocity (the actual result). It should be strongly highlighted that the galilean "prediction" is incorrect.
- **Inquiry questions:** Step 1: The aether wind blows along the horizontal arm. A light pulse travels along that arm and back. Does it take longer going with the wind or against it? Does the total round trip take the same time as a pulse in the perpendicular arm? Commit to a prediction before switching on the aether mode. Step 2: Rotate the apparatus 90°. According to the aether prediction, does the fringe pattern shift? Now switch to experiment mode. What does the actual result show? Is the result consistent with Galilean velocity addition?Why, why not? Is the result consistent with Maxwell's equations? Why, why not?
- **Additional notes:** —
- **Misconception (lecture):** A friend argues: 'Light must travel faster relative to an observer moving toward it – just like sound does.' What would you say to them?
- **Checkpoint (lecture):** "Light must travel faster relative to an observer moving toward the source – just like sound travels faster relative to someone walking toward a loudspeaker." Which of the following statements correctly identifies what is wrong with this analogy? Select all that apply.
(a) The analogy only works for sound because sound requires a medium; no such medium exists for light.
(b) The analogy is correct for slow observers but breaks down near the speed of light.
(c) If the analogy were right, the Michelson-Morley apparatus would show a fringe shift when rotated – but none was observed.
(d) The analogy confuses the speed of the source with the speed of the observer.
Correct: a, c, – (b) is wrong: the analogy fails at all speeds, not just relativistic ones. (d) is a different confusion, not the one the statement is making.

## L08-s1
- **Lecture:** 8.0 — Lightcone
- **Learning outcomes:** Define the lightcone structure of spacetime.
Distinguish between timelike, spacelike, and null separations.
Explain the relativity of simultaneity.
Interpret causal structure using spacetime diagrams.
- **Elements:** Simultaneity
Relative Time
Rotations in spacetime
- **Sim description (what it must do):** Relativity of simultaneity: A 2D Minkowski diagram with ct vertical and x horizontal in the unprimed frame. The student places two events on the diagram that share the same ct value (simultaneous in the unprimed frame). A second frame's axes, moving at speed v is shown, with ct' and x' axes on the same diagram. Lines parallel to the x' axis are drawn through each event (lines of constant ct'); these intersect the ct' axis at different points, showing the two events' ct' values are different (they are not simultaneous in the primed frame). There is an adjustable slider for v/c.
- **Inquiry questions:** —
- **Additional notes:** See diagram here: https://medium.com/mathadam/minkowski-spacetime-the-geometry-of-special-relativity-22b557229dd
- **Misconception (lecture):** A friend says: 'The two events only look non-simultaneous in S′ because the light signals take different times to reach the observer – if you correct for travel time, they're simultaneous again.' Are you convinced by that argument? Why, why not?
- **Checkpoint (lecture):** On a Minkowski diagram (ct vertical, x horizontal), the line connecting two events has a certain slope. Match each slope description to the correct separation type.

a) The line is steeper than 45°, i.e., |Δct| > |Δx|: correct: timelike
b) The line makes exactly 45°, i.e., |Δct| = |Δx|: correct: null/lightlike
c) The line is shallower than 45°, i.e., |Δct| < |Δx|: correct: spacelike


Two distinct events share the same ct-coordinate on a Minkowski diagram. Which statement is correct?
(a) They are simultaneous for all inertial observers
(b) They are simultaneous in this frame only, and are spacelike separated
(c) They are timelike separated, because one can in principle cause the other
(d) Their separation type depends on how far apart they are spatially
Correct: b. Two events with Δt = 0 and Δx ≠ 0 have spacetime interval Δs² = −c²(0)² + Δx² = Δx² > 0, which is spacelike. Because no signal at ≤ c can connect them, neither can causally influence the other, and their simultaneity is frame-dependent. A different inertial frame will, in general, assign different t-coordinates to the two events.

## L08-s2
- **Lecture:** 8.0 — Lightcone
- **Learning outcomes:** Define the lightcone structure of spacetime.
Distinguish between timelike, spacelike, and null separations.
Explain the relativity of simultaneity.
Interpret causal structure using spacetime diagrams.
- **Elements:** Simultaneity
Relative Time
Rotations in spacetime
- **Sim description (what it must do):** Spacetime diagram explorer (from lecture 5):  The lecture 5 sim, with: A default observer worldline at x = 0 is present; a toggle adds light-signal lines from each event to the observer's worldline, displaying both the event's actual t coordinate on the grid and the (later) time at which the observer sees it. Annotate event pairs to state whether they are timelike, lightlike, or spacelike separated
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** A friend says: 'The two events only look non-simultaneous in S′ because the light signals take different times to reach the observer – if you correct for travel time, they're simultaneous again.' Are you convinced by that argument? Why, why not?
- **Checkpoint (lecture):** On a Minkowski diagram (ct vertical, x horizontal), the line connecting two events has a certain slope. Match each slope description to the correct separation type.

a) The line is steeper than 45°, i.e., |Δct| > |Δx|: correct: timelike
b) The line makes exactly 45°, i.e., |Δct| = |Δx|: correct: null/lightlike
c) The line is shallower than 45°, i.e., |Δct| < |Δx|: correct: spacelike


Two distinct events share the same ct-coordinate on a Minkowski diagram. Which statement is correct?
(a) They are simultaneous for all inertial observers
(b) They are simultaneous in this frame only, and are spacelike separated
(c) They are timelike separated, because one can in principle cause the other
(d) Their separation type depends on how far apart they are spatially
Correct: b. Two events with Δt = 0 and Δx ≠ 0 have spacetime interval Δs² = −c²(0)² + Δx² = Δx² > 0, which is spacelike. Because no signal at ≤ c can connect them, neither can causally influence the other, and their simultaneity is frame-dependent. A different inertial frame will, in general, assign different t-coordinates to the two events.

## L09-s1
- **Lecture:** 9.0 — Proper Time
- **Learning outcomes:** Define proper time as an invariant along a worldline.
Relate proper time to physical clock measurements.
Interpret rest mass in relation to proper time.
Explain the geometric meaning of elapsed time in spacetime.
- **Elements:** Rest
Physical time
Proper time
- **Sim description (what it must do):** (Guided inquiry) Worldline length and proper time: A 2D Minkowski diagram with ct vertical and x horizontal (using the same frame indicator panel and coordinate readouts as the L8 simultaneity simulation). Two events E₁ and E₂ are fixed on the diagram. Students connect E₁ to E₂ by choosing from three worldline options: a straight inertial path, a two-segment bent path , and a three-segment path with two direction changes. For each worldline, the simulation computes the proper time along each segment and displays the summed total in a readout panel. Possible add-on: A frame selector allows the student to switch to a moving frame S′; the worldline shapes and segment endpoints transform accordingly, but the proper time total displayed for each path remains unchanged. A slider sets v/c for S′.
- **Inquiry questions:** Step 1: Three travellers all leave event E₁ and arrive at event E₂. One travels in a straight line; the other two take detours. Before running the simulation, which traveller do you predict ages the most? Why? Step 2: Construct each worldline in turn and record the proper time. Rank them. Is the result what you predicted? How does the straight-line result compare to your intuition about path length? (Optional step 3: Switch to frame S′. Do the proper time totals change? Do the coordinate time intervals Δt′ along each segment change?)
- **Additional notes:** the L8 and L9 simulations share the same Minkowski diagram interface, with L9 adding the worldline-drawing layer on top
- **Misconception (lecture):** A friend says: 'The traveller who took the longer path through space must have aged more – they covered more distance.' What does the simulation show? What is it about the spacetime interval, as opposed to the spatial distance, that makes the result come out this way?
- **Checkpoint (lecture):** True or false: any two clocks that depart from event E₁ and arrive at event E₂ will show the same elapsed time when they reunite.
False: (Proper) time depends on the worldline, i.e., the path through spacetime, taken between E₁ and E₂

Three travellers, A, B, and C, all depart from event E₁ and arrive at event E₂. A travels in a straight inertial worldline. B takes a two-segment path, first moving away from A's trajectory and then back. C takes a three-segment path with two direction changes, making a larger detour. Rank the three from most to least proper time elapsed.
Correct ordering: Most to least: A, then B, then C. The straight inertial worldline maximises proper time

## L10-s1
- **Lecture:** 10.0 — Lorentz transformations
- **Learning outcomes:** Describe Minkowski spacetime and its metric structure.
Derive and apply Lorentz transformations between inertial frames.
Interpret Lorentz transformations as hyperbolic rotations in spacetime.
Identify invariant quantities under Lorentz transformations.
- **Elements:** Minkowski metric
Inertial Frames
Lorentz transformations
- **Sim description (what it must do):** Minkowski space and metric: (similar to lecture 2/4 sim on euclidean space) A 2D (t,x) plane with a zoom toggle. Zoomed in: a small displacement ds shown as the hypotenuse of a right triangle with legs dt and dx, alongside the metric equation ds² = (eta_ij)(dt dx vector) =  - c^2 dt² + dx² and the metric (eta) written out as a 2×2 matrix. Zoomed out: students click two points P1 and P2, see the right triangle connecting them with legs Δt and Δx, type Δt and Δx values into input blanks, and read the computed Δs from the metric formula. Option for spacelike, lightlike, and timelike separated points so students can see the result of negative or zero distance points.
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** Select all quantities that are the same for all inertial observers:
(a) The time interval Δt between two events
(b) The spatial separation Δx between two events
(c) The spacetime interval Δs² = −c²Δt² + Δx²
(d) The proper time along a worldline connecting two events
(e) The speed of light c
Correct: c, d, e. The time interval (a) and spatial separation (b) are frame-dependent and change under Lorentz boosts. The spacetime interval (c) is preserved by all Lorentz transformations by construction. Proper time (d) is a Lorentz scalar. The speed of light (e) is invariant by the second postulate, and is geometrically represented by the 45° lightcone, which is preserved under boosts.

## L10-s2
- **Lecture:** 10.0 — Lorentz transformations
- **Learning outcomes:** Describe Minkowski spacetime and its metric structure.
Derive and apply Lorentz transformations between inertial frames.
Interpret Lorentz transformations as hyperbolic rotations in spacetime.
Identify invariant quantities under Lorentz transformations.
- **Elements:** Minkowski metric
Inertial Frames
Lorentz transformations
- **Sim description (what it must do):** Lorentz transformation vs Euclidean rotation: Two side-by-side panels: Euclidean rotation on the left, Lorentz boost on the right. Each panel has labeled events and a second coordinate system whose axes tilt as a slider moves — θ for rotation on the left, β for boost on the right. The unit circle x² + y² = 1 is drawn on the left and is preserved under rotation; the hyperbola (ct)² − x² = 1 is drawn on the right and is preserved under boost.
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** Select all quantities that are the same for all inertial observers:
(a) The time interval Δt between two events
(b) The spatial separation Δx between two events
(c) The spacetime interval Δs² = −c²Δt² + Δx²
(d) The proper time along a worldline connecting two events
(e) The speed of light c
Correct: c, d, e. The time interval (a) and spatial separation (b) are frame-dependent and change under Lorentz boosts. The spacetime interval (c) is preserved by all Lorentz transformations by construction. Proper time (d) is a Lorentz scalar. The speed of light (e) is invariant by the second postulate, and is geometrically represented by the 45° lightcone, which is preserved under boosts.

## L11-s1
- **Lecture:** 11.0 — Relative  length and time
- **Learning outcomes:** Derive time dilation and length contraction from Lorentz transformations.
Explain the frame dependence of measured lengths and time intervals.
Compute spacetime intervals between events.
Distinguish invariant spacetime distance from coordinate‑dependent quantities.
- **Elements:** Length Contractions
Time dilation
Spacetime distance
- **Sim description (what it must do):** Time Dilation, train paradox: A train moves at velocity v relative to a platform. Inside the train, observer A sits next to a light clock: a source on the floor, a mirror on the ceiling at height h. Observer B stands on the platform. Two side-by-side views. In A's frame the train is at rest; the pulse bounces straight up and back down, round-trip time t_A = 2h/c. In B's frame the train moves rightward,with it; the pulse traces a diagonal, with (by Pythagoras) the round-trip time t_B = 2h/√(c²−v²) = γ·t_A. While there are eventually two side by side views, the sim progresses as follows: 1) maximized view of A's train frame  2) side by side view, with A's frame greyed out and B's view highlighted, 3) full side by side view.
- **Inquiry questions:** Before running the simulation: observer A measures the round-trip time of the light pulse using their own clock. Observer B measures it likewise using theirs. Predict: will they agree? If not, who measures the longer time – and why?
- **Additional notes:** https://i.sstatic.net/kxf9N.png
- **Misconception (lecture):** A friend says: 'Moving clocks run slow – so to find which frame measures the proper time, just figure out which one is moving.' From the simulation, is either frame uniquely identifiable as the moving one? What does that imply for your friend's strategy?


A friend says: 'In B's frame, A is moving, so A's clock runs slow. That means B's clock runs fast relative to A's.' Switch to A's frame. According to A, who is moving? Whose clock runs slow now? Can both of you be right simultaneously – and if so, what has gone wrong with the phrase 'moving clocks run slow'?"

A friend says: 'A's frame must be special – time runs slower there than everywhere else, which contradicts Einstein's first postulate.' What is your friend assuming about the two events being measured?
- **Checkpoint (lecture):** True or false: In B's frame, A's clock runs slow. Therefore, in A's frame, B's clock runs fast.
False. By the symmetry of the principle of relativity, in A's frame, it is B who is moving, so B's clock runs slow according to A as well. Each frame measures the other's clocks as ticking more slowly. "Moving clocks run slow" applies symmetrically in both directions: neither frame is privileged, and no clock is absolutely "slow" or "fast."

A rod is at rest in frame S. Frame S' moves along at speed v in a direction aligned with the rod. In which frame is the rod's measured length longer, and why?
Correct: The rod is longest in its rest frame S. In S', the rod is moving, and its measured length is less than the proper length. 

A rod is at rest in frame S. Frame S' moves along at speed v in a direction perpendicular to the rod. In which frame is the rod's measured length longer, and why?
Correct: The rod has the same length in both frames. Length contraction only occurs along the direction of relative motion – the transverse dimensions are unaffected.

## L11-s2
- **Lecture:** 11.0 — Relative  length and time
- **Learning outcomes:** Derive time dilation and length contraction from Lorentz transformations.
Explain the frame dependence of measured lengths and time intervals.
Compute spacetime intervals between events.
Distinguish invariant spacetime distance from coordinate‑dependent quantities.
- **Elements:** Length Contractions
Time dilation
Spacetime distance
- **Sim description (what it must do):** (Lecture visual aid) Light clock and geometric derivation of time dilation: A single central panel shows a light clock at rest: a pulse bouncing vertically between two mirrors separated by height h, with the round-trip time t₀ = 2h/c displayed. This view then fades to grey and the vertical path is held in the background. A second view builds up incrementally on the same panel: the bottom mirror moves horizontally at speed v, tracing a baseline; the light pulse traces the two diagonal legs of a triangle, drawn one leg at a time as the clock travels. When the triangle is complete, the three side lengths are labelled — h for the vertical (rest-frame) leg, vt/2 for the horizontal base, and ct/2 for the hypotenuse – and the Pythagorean relation is displayed alongside, resolving to t = γt₀.
- **Inquiry questions:** —
- **Additional notes:** This is the stripped-down version of the time dilation inquiry simulation better suited to be shown during the lecture. The step-by-step triangle construction makes the geometric origin of γ visible and keeps the logical chain (rest-frame bounce time, moving-frame diagonal, Pythagoras, result) pretty clear. The greyed rest-frame view remains visible throughout so students can compare the two situations.
- **Misconception (lecture):** A friend says: 'Moving clocks run slow – so to find which frame measures the proper time, just figure out which one is moving.' From the simulation, is either frame uniquely identifiable as the moving one? What does that imply for your friend's strategy?


A friend says: 'In B's frame, A is moving, so A's clock runs slow. That means B's clock runs fast relative to A's.' Switch to A's frame. According to A, who is moving? Whose clock runs slow now? Can both of you be right simultaneously – and if so, what has gone wrong with the phrase 'moving clocks run slow'?"

A friend says: 'A's frame must be special – time runs slower there than everywhere else, which contradicts Einstein's first postulate.' What is your friend assuming about the two events being measured?
- **Checkpoint (lecture):** True or false: In B's frame, A's clock runs slow. Therefore, in A's frame, B's clock runs fast.
False. By the symmetry of the principle of relativity, in A's frame, it is B who is moving, so B's clock runs slow according to A as well. Each frame measures the other's clocks as ticking more slowly. "Moving clocks run slow" applies symmetrically in both directions: neither frame is privileged, and no clock is absolutely "slow" or "fast."

A rod is at rest in frame S. Frame S' moves along at speed v in a direction aligned with the rod. In which frame is the rod's measured length longer, and why?
Correct: The rod is longest in its rest frame S. In S', the rod is moving, and its measured length is less than the proper length. 

A rod is at rest in frame S. Frame S' moves along at speed v in a direction perpendicular to the rod. In which frame is the rod's measured length longer, and why?
Correct: The rod has the same length in both frames. Length contraction only occurs along the direction of relative motion – the transverse dimensions are unaffected.

## L12-s1
- **Lecture:** 12.0 — Twin paradox
- **Learning outcomes:** Analyse the twin paradox using spacetime diagrams.
Distinguish between inertial and non‑inertial motion in relativity.
Explain the role of acceleration without attributing it as the direct cause.
Resolve apparent paradoxes using proper time.
- **Elements:** Constant Velocity
Relative Time
Acceleration
- **Sim description (what it must do):** (Guided inquiry) Twin paradox worldline comparison: A Minkowski diagram showing two worldlines departing from a common event E₁ (departure) and reuniting at event E₂ (return). Twin A's worldline is a straight vertical line (inertial). Twin B's worldline consists of two segments: outbound at speed v and return at speed −v, meeting at a turnaround event E_T. The proper time along each worldline is computed and displayed. A frame selector allows students to view the diagram from S (A's rest frame) or from either of B's two inertial segments.
- **Inquiry questions:** Step 1: Twin B travels out at v and returns at the same speed. Before running: predict which twin is older at the reunion. Now predict what A would say about B's ageing and what B would say about A's ageing from their respective perspectives? Step 2: Read off the proper times for both worldlines. Now switch to B's outbound frame. What does A's worldline look like from here? According to this frame, is A ageing faster or slower than B? Is this consistent with your earlier answer about which twin ends up older? Step 3: Is the twin paradox really a paradox, or a consequence of something you already knew? Switch between A's frame and B's two inertial segments. Is there any single inertial frame in which B is at rest for the entire journey? What physical event breaks the symmetry – and how does the diagram show it?
- **Additional notes:** —
- **Misconception (lecture):** A friend says: 'The situation is completely symmetric – from B's point of view, A is the one who travels away and comes back. So they should age the same amount.' Do you agree with them? Why, why not?
- **Checkpoint (lecture):** Twin A stays on Earth. Twin B travels to a distant star at high speed and returns. When they reunite, who is older?
(a) A, because B was the one moving
(b) B, because B experienced more events during the journey
(c) A, because B's inertial worldline between departure and reunion is shorter in proper time
(d) They are the same age, because motion is relative
Correct: (c); The reasoning in (a) as stated is wrong: "B was moving" is frame-dependent language that does not explain anything. The reason is geometric: the shape of B's worldline through spacetime: B's worldline, which involves a spatial detour and a change of direction, accumulates less proper time. 

True or false: The twin scenario is physically symmetric. A is moving relative to B, and B is moving relative to A, so both twins have an equally valid claim to being "the one at rest."
False. The scenario is symmetric in each individual inertial segment, but it is not globally symmetric. A remains in a single inertial frame for the entire journey. B does not – B must change direction to return, which means changing inertial frames. This asymmetry is not a matter of perspective or description: it is a physical fact that B's worldline has a direction change while A's does not.

## L13-s1
- **Lecture:** 13.0 — Four-velocity Vector
- **Learning outcomes:** Define four‑vectors and their transformation properties.
Construct the four‑velocity from a particle’s worldline.
Relate four‑velocity to ordinary velocity.
Describe how four‑velocity transforms under Lorentz transformations.
- **Elements:** Four-vectors
Velocity vector under Lorentz transformations
- **Sim description (what it must do):** Lorentz transformations on vectors: Simulation allowing students to input a four-vector and Lorentz transformation, predict the output vector, and check against their prediction
- **Inquiry questions:** —
- **Additional notes:** We could add an additional feature where we connect two events via worldlines and ask students to interpret the transformation rule to concrete geometric objects.
- **Misconception (lecture):** —
- **Checkpoint (lecture):** What distinguishes a four-vector from an ordinary 3D spatial vector in special relativity? Select all that apply.
a) A four-vector includes a timelike component alongside three spatial components, and its components transform under Lorentz transformations in the same way as the spacetime displacement (cΔt, Δx, Δy, Δz)
b) The Minkowski norm of a four-vector is the same in all inertial frames: it is a Lorentz scalar.
c) A four-vector transforms correctly under spatial rotations, whereas an ordinary 3-vector does not.
d) A four-vector transforms correctly under Lorentz boosts, whereas an ordinary 3-vector does not.
Correct: a, b, d; c) is false: ordinary 3-vectors transform correctly under spatial rotations; it is Lorentz boosts that they cannot handle

The four-velocity is defined as U^μ = dx^μ/dτ, where τ is the proper time. Why is it essential to differentiate with respect to proper time rather than coordinate time t? Select all that apply.
(a) Proper time is easier to compute than coordinate time in most reference frames.
(b) Coordinate time t is not well-defined for moving particles, so it cannot be used as a parameter.
(c) Differentiating dx^μ with respect to coordinate time t produces a quantity with the wrong number of components to be a four-vector.
(d) Coordinate time t is frame-dependent and transforms under Lorentz boosts, so dx^μ/dt does not transform as a four-vector. Proper time τ is a Lorentz scalar – the same in all frames – so differentiating wrt dτ preserves the four-vector transformation properties.
Correct: d. — (a) is false: coordinate time is often simpler to work with computationally. (b) is false: coordinate time is perfectly well-defined; the issue is that it is frame-dependent, not undefined. (c) is false: dx^μ/dt still has four components; the problem is the transformation law, not the number of components.

## L14-s1
- **Lecture:** 14.0 — Mass
- **Learning outcomes:** Distinguish between rest mass and relativistic energy–momentum.
Appreciate why rest mass is invariant.
Understand the concept of inertial mass.
Construct the four‑momentum of a particle.
- **Elements:** Rest Mass
Inertial Mass
Four-momentum
- **Sim description (what it must do):** Momentum vs velocity (Guided inquiry): A plot of relativistic momentum p = γmv (y-axis) against velocity v (x-axis). There is a rest-mass slider.
- **Inquiry questions:** (Before viewing the graph) What is the expected behaviour near v=0? Near v=c? What is the effect of e.g. doubling the rest mass, m?
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: rest mass is a frame-dependent quantity that increases with velocity.
False. Rest mass m is a Lorentz scalar – it is the same in every inertial frame.

"Rest mass is just the mass you measure when the object is sitting still. Once it's moving, the real mass is γm." Which of the following statements correctly identifies what is problematic about this framing?
(a) The framing implies that mass is frame-dependent – that an object has a larger mass in one frame than another – which contradicts the fact that rest mass is a Lorentz scalar.
(b) The framing is harmless because γm and rest mass m are both well-defined quantities that any physicist can distinguish from context.
(c) What actually changes with velocity are the particle's momentum and total energy, not its rest mass m, which remains fixed and frame-independent.
(f) The concept of relativistic mass γm is necessary to make Newton's second law F = ma work relativistically, so it has a useful role 
Correct: a, c; (b) is false in practice: the framing consistently misleads students and appears in widely-cited errors; (d) is false: F = γma does not hold in general

## L15-s1
- **Lecture:** 15.0 — Relativistic dynamics
- **Learning outcomes:** Define four‑acceleration and four‑force.
Formulate Newton’s second law in a Lorentz‑invariant form.
Relate relativistic force to changes in four‑momentum.
Understand the geometric structure of relativistic dynamics.
- **Elements:** Four-acceleration
Four-Force
Equations of motion and Newton’s law
- **Sim description (what it must do):** Relativistic constant acceleration (Guided inquiry): A particle is pushed by a constant force F (which can be adjusted on a slider). Plots of some quantities build up over time (using F = dp/dt with p = γmv): 1) velocity vs time graph, with a dashed asymptote line at v=c,  2) Energy vs time (or energy vs. velocity) graph
- **Inquiry questions:** (Before viewing the graph) What do you expect the v vs t graph to look like? (option here -- concept cartoon: "character A says the velocity will continue to grow without bound. Do you agree?")
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** True or false: Newton's second law F = ma continues to hold in relativistic dynamics, provided m is replaced by the relativistic mass γm.
False. The correct relativistic equation is F = dp/dt with p = γmv as the relativistic momentum. There is no single scalar quantity that replaces m in F = ma for forces in all directions. 

A particle is accelerated from rest by a constant force. Which speed interval requires more work to traverse?
(a) From v = 0 to v = 0.5c, because the particle spends more time accelerating over this larger interval.
(b) From v = 0.9c to v = 0.95c, because γ is large and grows rapidly near c, so the same increment of speed requires a much larger increment of energy.
(c) Both intervals require the same work because the speed increment is 0.5c in the first case and only 0.05c in the second, and the larger interval compensates for the smaller γ effect.
Correct: b. Near v = 0, γ ≈ 1 and the energy is well approximated by the Newtonian ½mv², so the work done over the first interval is modest. Near v = c, the total energy E = γmc² is extremely sensitive to small changes in v: even a tiny speed increment requires a large increment of energy. The interval from 0.9c to 0.95c has a much smaller Δv than 0 to 0.5c, but the γ-factor more than compensates – the work required is far greater.

## L16-s1
- **Lecture:** 16.0 — E=mc^2
- **Learning outcomes:** Derive the relativistic energy–momentum relation.
Explain the concept of rest energy.
Interpret mass–energy equivalence.
Apply energy–momentum conservation in relativistic processes.
- **Elements:** Energy at rest
Momentum equation
- **Sim description (what it must do):** (Guided inquiry) Energy-momentum conservation in a collision: Two particles of specified rest masses m₁, m₂ and velocities v₁, v₂ collide. The simulation displays the four-momentum of each particle before the collision and the four-momentum of the products after, subject to total four-momentum conservation. Three collision modes: elastic, inelastic, and decay. A readout panel shows total E and total p before and after in the current frame. A boost slider transforms to S′. A rest-energy panel highlights E₀ = mc² for each particle in its rest frame.
- **Inquiry questions:** Two identical particles of rest mass m collide head-on at equal and opposite speeds β = 0.8 and merge. Predict the rest mass of the combined particle. Is it 2m? More? Less?
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** A particle of rest mass m is at rest. Which of the following correctly states its total energy and what this implies about the physical interpretation of mass?
(a) The total energy is zero, because a particle at rest has no kinetic energy.
(b) The total energy is mc² – mass is a form of stored energy that a particle carries by virtue of existing, independently of its motion
(c) The total energy is ½mc², by analogy with the Newtonian kinetic energy ½mv²
(d) The total energy is mc², but only in the particle's rest frame; in all other frames the particle has zero energy because it is not moving relative to itself.
Correct: b; (a) conflates total energy with kinetic energy; rest energy exists independently of motion; (c) applies the Newtonian kinetic energy formula incorrectly
(d) confuses two separate things: E = mc² is the rest energy in the particle's own rest frame, and it is frame-independent in the sense that the rest mass m is a Lorentz scalar – every frame agrees on the value of m and therefore on the rest energy mc², even though the total energy E = γmc² in a frame where the particle is moving is larger

## L17-s1
- **Lecture:** 17.0 — Photon
- **Learning outcomes:** Describe massless particles in special relativity.
Explain why proper time vanishes for photons.
Relate energy, momentum, and frequency of light.
Represent photon worldlines in spacetime diagrams.
- **Elements:** Massless particle
Proper time
Momentum
- **Sim description (what it must do):** (Guided inquiry) Photon worldline: A Minkowski diagram with ct vertical and x horizontal. A photon worldline is drawn as a 45° diagonal from an emission event E₁ to an absorption event E₂. The spacetime interval Δs² = −c²Δt² + Δx² is computed and displayed in a readout panel alongside the proper time Δτ along the worldline. A second worldline shows a massive particle travelling between the same two events; a slider adjusts its speed from low β up toward 1, continuously updating the worldline slope.
- **Inquiry questions:** Step 1: A photon travels from E₁ to E₂. Predict the spacetime interval Δs² between these events. Now predict the proper time elapsed along the photon's worldline. What do you expect for a massive particle travelling the same spatial distance? Step 2: Confirm your prediction. Move the slider for the massive particle to β = 0.99. What happens as β → 1?
- **Additional notes:** —
- **Misconception (lecture):** A friend says: 'If I travel fast enough I can catch up with a photon and see it at rest – just like running alongside a train.' How do you respond?
- **Checkpoint (lecture):** True or false: a photon has zero energy because it has zero rest mass.
False. A photon has zero rest mass but non-zero energy E = pc = hf, where p is its momentum and f its frequency

True or false: "A photon travels from a distant star to your eye. During the journey, the photon experiences the passage of time – but because it is moving so fast, the elapsed proper time is extremely small."
False. The proper time along a photon worldline is not merely very small – it is exactly zero, for any photon journey of any distance.

## L18-s1
- **Lecture:** 18.0 — Faster than Light
- **Learning outcomes:** Explain why the speed of light is an absolute speed limit.
Analyse causality using lightcone structure.
Describe hypothetical tachyons and their properties.
Understand the connection between superluminal propagation, acausality, and instabilities.
- **Elements:** Absolute Speed Limit
Causality
Tachyons
- **Sim description (what it must do):** (Guided inquiry) Tachyon causality violation: A Minkowski diagram reusing the L9 spacetime interval simulation interface. Students place two events freely on the diagram and connect them with a signal worldline by setting its speed and the slope of the worldline. The spacetime interval between the events are displayed in a readout panel. A frame selector allows students to switch to any boosted frame S′; the time-ordering indicator shows which event has the larger t coordinate in the active frame. A second signal tool allows a return worldline to be drawn from the second event back toward the first observer's worldline, completing a potential causal loop.
- **Inquiry questions:** Using what you know about spacetime intervals and frame dependence: can a signal travelling faster than light ever create a causal paradox? Build a scenario that either demonstrates this or rules it out.
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** A signal connects two spacelike-separated events. True or false: all inertial observers agree on which event is the cause and which is the effect.
False. For spacelike separations, the time ordering is frame-dependent: there is always an inertial frame in which the "cause" appears to occur after the "effect," and a frame in which they are simultaneous.

## L18-s2
- **Lecture:** 18.0 — Faster than Light
- **Learning outcomes:** Explain why the speed of light is an absolute speed limit.
Analyse causality using lightcone structure.
Describe hypothetical tachyons and their properties.
Understand the connection between superluminal propagation, acausality, and instabilities.
- **Elements:** Absolute Speed Limit
Causality
Tachyons
- **Sim description (what it must do):** For causality misconceptions, a simulation activity in which students determine the invariant separation of event pairs and predict the frame-dependence (or invariance) of their time ordering, before observing the result
- **Inquiry questions:** —
- **Additional notes:** —
- **Misconception (lecture):** —
- **Checkpoint (lecture):** A signal connects two spacelike-separated events. True or false: all inertial observers agree on which event is the cause and which is the effect.
False. For spacelike separations, the time ordering is frame-dependent: there is always an inertial frame in which the "cause" appears to occur after the "effect," and a frame in which they are simultaneous.
