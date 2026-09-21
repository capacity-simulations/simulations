"""Brachistochrone race — equations from the sim's formal strip; diagrams
computed from the default Δx = 1.5 m, Δy = 1.0 m, g = 9.81 m/s² run.
"""
import math

# ---- sim defaults (slider value attributes / onReset) ------------------------
DX, DY, G = 1.5, 1.0, 9.81


def solve_cycloid(dx, dy):
    """Match sim solveCycloid: (θ−sinθ)/(1−cosθ) = Δx/Δy, R = Δy/(1−cosθ)."""
    ratio = dx / dy
    lo, hi = 1e-9, 2 * math.pi - 1e-9

    def f(t):
        return (t - math.sin(t)) / (1 - math.cos(t)) - ratio

    for _ in range(90):
        m = 0.5 * (lo + hi)
        if f(m) > 0:
            hi = m
        else:
            lo = m
    tF = 0.5 * (lo + hi)
    return tF, dy / (1 - math.cos(tF))


def sample_quad(n=80):
    return [(i / n) ** 2 for i in range(n + 1)]


def cycloid_pts(dx, dy, n=80):
    tF, R = solve_cycloid(dx, dy)
    pts = []
    for u in sample_quad(n):
        t = tF * u
        pts.append((R * (t - math.sin(t)), R * (1 - math.cos(t))))
    pts[-1] = (dx, dy)
    return pts, tF, R


def arc_pts(dx, dy, n=80):
    r = (dx * dx + dy * dy) / (2 * dx)
    ca = max(-1.0, min(1.0, 1 - dx / r))
    phiF = math.acos(ca)
    pts = []
    for u in sample_quad(n):
        ph = phiF * u
        pts.append((r - r * math.cos(ph), r * math.sin(ph)))
    pts[-1] = (dx, dy)
    return pts, r, phiF


def straight_pts(dx, dy, n=40):
    return [(dx * u, dy * u) for u in sample_quad(n)]


def coords(pts, sx, sy, ox=0.0, oy=0.0):
    return ' '.join(f'({p[0]*sx+ox:.3f},{p[1]*sy+oy:.3f})' for p in pts)


pts_c, TF, R = cycloid_pts(DX, DY)
pts_a, RARC, PHIF = arc_pts(DX, DY)
pts_s = straight_pts(DX, DY)
L = math.hypot(DX, DY)
T_CYC = TF * math.sqrt(R / G)
T_LINE = math.sqrt(2 * L * L / (G * DY))
V_ARR = math.sqrt(2 * G * DY)
CYC_LEN = 4 * R * (1 - math.cos(TF / 2))

assert abs(TF - 3.0688) < 1e-3
assert abs(R - 0.5007) < 1e-3
assert T_CYC < T_LINE, 'cycloid must beat the chord at defaults'
assert abs(pts_c[-1][0] - DX) < 1e-12 and abs(pts_c[-1][1] - DY) < 1e-12

# Far-post cycloid (inquiry card 7: Δx = 3.00 m) — roll angle past 180°.
pts_far, TF_FAR, R_FAR = cycloid_pts(3.0, 1.0)
assert TF_FAR > math.pi, 'Δx = 3 m must dip below the finish'
YMAX_FAR = 2 * R_FAR  # bottom of the generating circle, θ = π
assert YMAX_FAR > 1.0

# Generating-circle snapshot for d2: later on the roll so the tracing
# point sits clear of the release line.
TH_SHOW = 2.20
CX = R * TH_SHOW
CY = R
PX = R * (TH_SHOW - math.sin(TH_SHOW))
PY = R * (1 - math.cos(TH_SHOW))
assert 0.6 < PY < 1.0, 'tracing point should be near the bottom of the circle'

# Scale: y plotted downward so the figure matches the sim (y = drop).
S1 = 2.15
S2 = 2.35
S3 = 1.55

# ---- equations (sim KaTeX, lightly annotated) --------------------------------
EQS = {
 'eq1': r"""$T[y] \;=\; \displaystyle\int_{0}^{\Delta x}
\underbrace{\sqrt{\dfrac{1+y'^{2}}{2\,g\,y}}}_{\textcolor{acc}{ds/v}}\,dx$""",
 'eq2': r"$x \;=\; R(\theta-\sin\theta),\qquad y \;=\; R(1-\cos\theta)$",
 'eq3': r"""$T_{\mathrm{cyc}} \;=\; \theta_{F}\sqrt{\dfrac{R}{g}}\,,\qquad
T_{\mathrm{line}} \;=\; \sqrt{\dfrac{2L^{2}}{g\,\Delta y}}$""",
 'eq4': r"$v \;=\; \sqrt{2gy}\;\;\Longrightarrow\;\; v_{\mathrm{arrival}} \;=\; \sqrt{2g\,\Delta y}$",
 'eq5': r"""$\dfrac{\theta_{F}-\sin\theta_{F}}{1-\cos\theta_{F}}
 \;=\; \dfrac{\Delta x}{\Delta y}\,,\qquad
 R \;=\; \dfrac{\Delta y}{1-\cos\theta_{F}}$""",
 'eq6': r"$T \;\propto\; \dfrac{1}{\sqrt{g}}\qquad\text{on every track}$",
}

# ---- diagrams ----------------------------------------------------------------
DIAGS = {
 # d1: the race at sim defaults, sim trail colors, y downward
 'd1': r"""\begin{tikzpicture}
\definecolor{strt}{RGB}{251,191,36}
\definecolor{blu}{RGB}{96,165,250}
\definecolor{cycol}{RGB}{34,211,238}
\fill[black!8] (%(pax)s,0.18) rectangle (%(pbx)s,-0.42);
\draw[line width=1.05pt] (%(pax)s,0.18) -- (%(pax)s,-0.42);
\fill[black!8] (%(fx)s, %(fy)s+0.18) rectangle (%(fx)s+0.16, %(fy)s-0.42);
\draw[line width=1.05pt] (%(fx)s, %(fy)s+0.18) -- (%(fx)s, %(fy)s-0.42);
\draw[strt, line width=1.45pt] plot coordinates {%(st)s};
\draw[blu, line width=1.45pt] plot[smooth] coordinates {%(ar)s};
\draw[cycol, line width=1.55pt] plot[smooth] coordinates {%(cy)s};
\fill (0,0) circle (2.0pt);
\fill (%(fx)s,%(fy)s) circle (2.0pt);
\node[strt] at (2.55,-0.22) {\scriptsize straight line};
\node[blu] at (0.72,-1.55) {\scriptsize circular arc};
\node[cycol] at (1.55,-2.42) {\scriptsize cycloid};
\node at (1.61,0.38) {\scriptsize release};
\node at (%(fx)s+0.42,%(fy)s-0.08) {\scriptsize finish};
\node at (1.61,-3.05) {\scriptsize same two posts --- shortest chute is last to arrive};
\end{tikzpicture}""" % {
    'st': coords(pts_s, S1, -S1),
    'ar': coords(pts_a, S1, -S1),
    'cy': coords(pts_c, S1, -S1),
    'fx': f'{DX*S1:.3f}',
    'fy': f'{-DY*S1:.3f}',
    'pax': '-0.16',
    'pbx': '0.00',
 },

 # d2: the rule — a circle of the computed R rolling under the release line
 'd2': r"""\begin{tikzpicture}
\definecolor{cycol}{RGB}{34,211,238}
\draw[line width=.7pt] (-0.35,0) -- (%(endx)s,0);
\node at (0.70,0.34) {\scriptsize release line};
\draw[line width=.85pt] (%(ccx)s,%(ccy)s) circle (%(rr)s);
\draw[cycol, line width=1.45pt] plot[smooth] coordinates {%(path)s};
\fill[cycol] (%(px)s,%(py)s) circle (2.15pt);
\draw[line width=.55pt] (%(ccx)s,%(ccy)s) -- (%(px)s,%(py)s);
\draw[line width=.45pt, densely dotted] (%(ccx)s,%(ccy)s) -- (%(ccx)s,0);
\node at (%(ccx)s+0.42,0.34) {\scriptsize $R\theta$};
\node[cycol] at (%(px)s-1.22,%(py)s-0.38) {\scriptsize tracing point};
\node at (%(ccx)s+0.48,%(ccy)s) {\scriptsize $R$};
\fill (%(fx)s,%(fy)s) circle (1.7pt);
\node at (1.85,-3.02) {\scriptsize $\theta$ is the roll angle, not a polar angle};
\end{tikzpicture}""" % {
    'path': coords(pts_c, S2, -S2),
    'rr': f'{R*S2:.3f}',
    'ccx': f'{CX*S2:.3f}',
    'ccy': f'{-CY*S2:.3f}',
    'px': f'{PX*S2:.3f}',
    'py': f'{-PY*S2:.3f}',
    'fx': f'{DX*S2:.3f}',
    'fy': f'{-DY*S2:.3f}',
    'endx': f'{DX*S2+0.35:.3f}',
 },

 # d3: moving the far post picks a different cycloid segment (computed)
 'd3': r"""\begin{tikzpicture}
\definecolor{cycol}{RGB}{34,211,238}
%% default Δx = 1.5 m, θ_F ≈ 176°
\begin{scope}[shift={(0,0)}]
\draw[line width=.45pt] (-0.15,0) -- (2.55,0);
\draw[cycol, line width=1.35pt] plot[smooth] coordinates {%(c1)s};
\fill (0,0) circle (1.6pt);
\fill (%(f1x)s,%(f1y)s) circle (1.6pt);
\draw[densely dotted, line width=.4pt] (%(f1x)s,0) -- (%(f1x)s,%(f1y)s);
\node at (1.16,0.38) {\small $\Delta x=1.5\,\mathrm{m}$};
\node[acc] at (1.16,-2.05) {\small $\theta_F=176^\circ$};
\end{scope}
%% Δx = 3.0 m, θ_F ≈ 232° — dips below the finish then climbs
\begin{scope}[shift={(4.55,0)}]
\draw[line width=.45pt] (-0.15,0) -- (4.85,0);
\draw[cycol, line width=1.35pt] plot[smooth] coordinates {%(c2)s};
\fill (0,0) circle (1.6pt);
\fill (%(f2x)s,%(f2y)s) circle (1.6pt);
\draw[densely dotted, line width=.4pt] (%(f2x)s,0) -- (%(f2x)s,%(f2y)s);
\draw[acc, densely dotted, line width=.45pt] (%(bx)s,%(by)s) -- (%(f2x)s,%(by)s);
\node at (2.32,0.38) {\small $\Delta x=3.0\,\mathrm{m}$};
\node[acc] at (2.32,-2.55) {\small $\theta_F=232^\circ$};
\end{scope}
\node at (4.55,-3.15) {\scriptsize same family of cycloids --- a farther post selects a longer roll, including a dip below the finish};
\end{tikzpicture}""" % {
    'c1': coords(pts_c, S3, -S3),
    'c2': coords(pts_far, S3, -S3),
    'f1x': f'{DX*S3:.3f}',
    'f1y': f'{-DY*S3:.3f}',
    'f2x': f'{3.0*S3:.3f}',
    'f2y': f'{-1.0*S3:.3f}',
    'bx': f'{R_FAR*math.pi*S3:.3f}',
    'by': f'{-YMAX_FAR*S3:.3f}',
 },
}
