## Bloch Oscillations

**Description:** An electron wavepacket starts at the bottom of a single energy band in a perfect crystal, and a constant electric field is switched on. A free electron would simply keep accelerating. In the wavevector panel, the electron's wavevector does move steadily across the Brillouin zone, but it wraps around when it reaches the zone edge. In the real-space panel, the electron speeds up, slows down, reverses and comes back to where it started, over and over. This happens because the electron's velocity follows the slope of the band, and the slope changes sign each time the wavevector wraps around. A stronger field makes the oscillation both faster and smaller, and a wider band makes it larger. 

**Adjustable Parameters:** Electric field strength; band width

**Key Visual Elements:** Energy band plot with a dot moving across the zone and wrapping at the edge; the slope of the band at the dot drawn as a short tangent line; real-space panel with the wavepacket moving back and forth along the crystal; plot of position against time

**Associated Learning Objective:** Explain why an electron in a perfect crystal under a constant electric field oscillates back and forth instead of accelerating.

## Rabi Oscillations on the Bloch Sphere

**Description:** A laser drives a two-level atom. The atom’s state is an arrow on the Bloch sphere, with the ground state at the south pole and the excited state at the north pole. The laser sets an axis, and the arrow rotates around it. On resonance the axis lies in the equator, so the arrow swings all the way from pole to pole, and the excited-state population goes between 0 and 1. A stronger laser makes it swing faster. Detuning the laser tilts the axis towards a pole, so the arrow traces a smaller circle. The population then never reaches 1, and it oscillates faster.

**Adjustable Parameters:** Laser strength (Rabi frequency); detuning

**Key Visual Elements:** Rotatable Bloch sphere with the state arrow leaving a fading trail and the laser's rotation axis drawn through the centre; plot of excited-state population against time; two-level energy diagram with the laser arrow showing the detuning

**Associated Learning Objective:** Describe how a laser drives an atom between its ground and excited states as a rotation on the Bloch sphere, and explain why detuning stops the atom from reaching the excited state completely.

## Sharing Energy at Random

**Description:** A grid of atoms shares a fixed amount of energy, which comes in whole quanta. Each atom is drawn with its quanta stacked on top of it. At every step the simulation takes one quantum from a randomly chosen atom and gives it to another randomly chosen atom, so the total never changes. A histogram beside the grid counts how many atoms hold no quanta, how many hold one, how many hold two, and so on. Whatever arrangement the student starts from, whether all the energy on one atom or the same amount on every atom, the histogram settles into the same shape: a falling exponential, straight on a logarithmic scale. Adding more energy per atom makes it fall more slowly. This is where the Boltzmann factor comes from.

**Adjustable Parameters:** Number of atoms; number of quanta per atom; starting arrangement (all on one atom, spread evenly, random); shuffling speed

**Key Visual Elements:** Grid of atoms with their quanta drawn as stacked dots; live histogram of the number of atoms holding each amount of energy, with a toggle for a logarithmic vertical axis, where the distribution becomes a straight line; readout of the average energy per atom and the slope of the fitted line

**Associated Learning Objective:** Explain how the random sharing of energy between atoms produces an exponential distribution of energy, and how the average energy per atom sets how steeply it falls.