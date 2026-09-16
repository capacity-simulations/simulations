## How Far Perturbation Theory Gets You

**Description:** The simulation works with a single integral, $Z(\lambda)=\frac{1}{\sqrt{2\pi}}\int_{-\infty}^{\infty}dx,e^{-x^{2}/2-\lambda x^{4}}$, which is a field theory with spacetime shrunk to a point: the Gaussian is the propagator, the quartic term is the interaction, and expanding in $\lambda$ and integrating term by term is Feynman-diagram perturbation theory with nothing else going on. Both sides of the comparison are available, which is what makes it worth building. The exact value is computed numerically and drawn as a horizontal line, and the perturbative coefficients $a_n=(-1)^n(4n-1)!!/n!$ are exact as well, so the student can add one term at a time and watch the partial sums approach that line. They close in, come very near, and then turn around and run away, and no choice of $\lambda$ prevents this. What changes with $\lambda$ is how long the running-away is postponed: at $\lambda=0.01$ the partial sums track the exact value for about six terms before deteriorating, and at $\lambda=0.1$ the first correction already overshoots. A panel showing the size of each term makes the mechanism plain, since the terms shrink, reach a smallest value and then grow, because the coefficients grow like $16^n n!$ while $\lambda^n$ only shrinks geometrically. That factorial is the number of ways of pairing up $4n$ objects, which is to say the number of diagrams at order $n$, and it is the same reason perturbation theory diverges in a real field theory. A switch flips the sign of the quartic term, and this is the reason for everything else. With the sign reversed, the integrand grows without bound far from the origin, the shaded area under it is infinite, and $Z$ has no value at all, however small $\lambda$ is. A convergent power series in $\lambda$ would have to work on both sides of zero, so no such series can exist. This is Dyson's argument for QED in miniature.

**Adjustable Parameters:** Coupling $\lambda$; number of terms kept; sign of the quartic term

**Key Visual Elements:** Plot of the integrand with the area under it shaded, so that flipping the sign visibly sends the tails up instead of down; plot of the partial sums against the number of terms kept, with a horizontal line at the exact value; bar chart of the size of each term, showing the shrinking, the smallest term and the growth after it; readout of the closest approach to the exact value and of how many terms achieved it, neither marked in advance

**Associated Learning Objective:** Explain why a perturbative expansion can approach the exact answer, stop improving at a number of terms set by the coupling, and then run away from it, and relate that behaviour to the integral's failure to exist for the opposite sign of the coupling.

## Why Heat Capacities Have Steps

**Description:** A large number of identical systems, each with a ladder of evenly spaced energy levels, sit at a temperature the student sets. The ladder is drawn with the occupation of each level shown as a bar. At low temperature almost every system sits in its ground state, and nudging the temperature up barely changes the average energy, so the heat capacity is close to zero. As the temperature rises past the point where the thermal energy matches the spacing between levels, the upper levels start to fill, the average energy climbs steeply, and the heat capacity rises to its classical value and stays there. Changing the spacing between levels slides the whole step along the temperature axis without changing its shape. This is why a mode of motion contributes nothing to the heat capacity until the temperature is high enough to excite it.

**Adjustable Parameters:** Temperature; spacing between energy levels

**Key Visual Elements:** Ladder of energy levels with occupation drawn as bars that fill as the temperature rises; plot of average energy against temperature with the classical straight line shown faintly for comparison; plot of heat capacity against temperature, with the current temperature marked on both plots

**Associated Learning Objective:** Explain why the heat capacity falls towards zero when the thermal energy is smaller than the spacing between a system's energy levels, and returns to its classical value when it is larger.

## The Random Walker

**Description:** A crowd of walkers starts at the same point on a line. At each step every walker moves one step left or right, with even odds. The walkers spread out, and a histogram of their positions builds up below them, filling into a bell shape. The width of that bell grows, but more and more slowly: it follows the square root of the number of steps, which a second plot shows as a straight line. The student can see that a walker that has taken a hundred steps has usually got only about ten steps away from where it started. This is the reason a smell crosses a room far more slowly than the molecules themselves travel.

**Adjustable Parameters:** Number of walkers; length of one step; steps per second

**Key Visual Elements:** Walkers moving along a horizontal line, each leaving a faint trail; histogram of their positions growing beneath them, with a bell curve drawn over it; plot of the width of the histogram against the square root of the number of steps, which stays a straight line; readouts of the number of steps taken and the current width

**Associated Learning Objective:** Explain why the spread of a random walk grows as the square root of the number of steps rather than in proportion to it.
