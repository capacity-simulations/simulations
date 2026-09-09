# CROSS-DOMAIN RULES (this sim manifests more than one physics domain)

More than one domain card is present below because a human chose a
comparison/coupled sim. The domains do NOT blend:

- Each domain's NEGATIVE CONSTRAINTS remain ABSOLUTE within its own panel,
  state, and update code. A quantum panel obeys every quantum constraint even
  when a classical panel sits beside it, and vice versa.
- Declare panel ownership in a comment at the top of the sim JS, e.g.
  `// PANEL OWNERSHIP: left = domain.mechanics, right = domain.quantum` —
  and keep each panel's state object and update path separate.
- The ONLY permitted couplings between domains are (a) shared parameters from
  the manifest schema and (b) read-only overlays (one panel may DRAW numbers
  computed by the other, never feed them into its own update).
- Classical state never feeds quantum updates: no positions, velocities, or
  forces entering psi's evolution — and no quantum amplitudes steering a
  classical trajectory. Comparison happens in the reader's eye and in
  read-only readouts, not in the state.
- Vocabulary stays domain-local: classical words (ball, path, trajectory,
  force) only in classical panels/labels; quantum words (wavefunction,
  amplitude, collapse) only in quantum ones.
