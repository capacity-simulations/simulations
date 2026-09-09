#!/usr/bin/env python3
"""Generate test/golden/special-values.json — scipy reference values for core.special.

Run from anywhere:  python3 engine/test/capture/gen-special-values.py
Requires scipy (generated with 1.17.1). Regenerate only when the table spec
changes; the JSON is checked in so tests never need scipy.

Tables:
  hermite   psi_n(x) = H_n(x) exp(-x^2/2) / sqrt(2^n n! sqrt(pi))
            via scipy eval_hermite + log-space normalization (gammaln),
            n in {0, 1, 5, 20, 50, 60}, x = +/-(0.5 .. 8 step 0.5).
  legendre  scipy.special.lpmv(m, l, x) — NOTE lpmv INCLUDES the
            Condon-Shortley phase, i.e. matches condonShortley=true.
            l = 0..6, m = -l..l, x in {-0.9, -0.5, 0, 0.3, 0.7, 0.95}.
  laguerre  scipy.special.genlaguerre(n, k)(x) for the hydrogen pairs
            (n_deg, k) = (n - l - 1, 2l + 1), principal n <= 7,
            x in {0.1, 0.5, 1, 2, 5, 10, 15}.
  erf       scipy.special.erf on x = +/-(0 .. 3 step 0.25).
"""

import json
import sys
from pathlib import Path

import numpy as np
import scipy
from scipy.special import erf, eval_hermite, gammaln, genlaguerre, lpmv

OUT = Path(__file__).resolve().parent.parent / "golden" / "special-values.json"


def psi_n(n, x):
    """Normalized Hermite function, log-space normalization (safe to n=60)."""
    log_norm = -0.5 * (n * np.log(2.0) + gammaln(n + 1) + 0.5 * np.log(np.pi))
    return eval_hermite(n, x) * np.exp(log_norm - x * x / 2.0)


def main():
    x_h = np.concatenate([-np.arange(0.5, 8.001, 0.5)[::-1], np.arange(0.5, 8.001, 0.5)])
    hermite = [
        {"n": n, "x": x_h.tolist(), "psi": psi_n(n, x_h).tolist()}
        for n in (0, 1, 5, 20, 50, 60)
    ]

    x_l = [-0.9, -0.5, 0.0, 0.3, 0.7, 0.95]
    legendre = [
        {"l": l, "m": m, "x": x_l, "p": [float(lpmv(m, l, x)) for x in x_l]}
        for l in range(7)
        for m in range(-l, l + 1)
    ]

    x_g = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0]
    pairs = sorted({(n - l - 1, 2 * l + 1) for n in range(1, 8) for l in range(n)})
    laguerre = [
        {"n": q, "k": k, "x": x_g, "L": [float(genlaguerre(q, k)(x)) for x in x_g]}
        for q, k in pairs
    ]

    x_e = np.concatenate([-np.arange(0.25, 3.001, 0.25)[::-1], np.arange(0.0, 3.001, 0.25)])
    erf_tab = {"x": x_e.tolist(), "y": erf(x_e).tolist()}

    table = {
        "_meta": {
            "generator": "test/capture/gen-special-values.py",
            "scipy": scipy.__version__,
            "numpy": np.__version__,
            "note": "lpmv includes the Condon-Shortley phase (condonShortley=true).",
        },
        "hermite": hermite,
        "legendre": legendre,
        "laguerre": laguerre,
        "erf": erf_tab,
    }
    OUT.write_text(json.dumps(table, indent=1) + "\n")
    n_rows = len(hermite) + len(legendre) + len(laguerre) + 1
    print(f"wrote {OUT} ({n_rows} rows, scipy {scipy.__version__})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
