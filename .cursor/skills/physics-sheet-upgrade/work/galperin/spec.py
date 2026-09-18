"""Galperin's billiard — equations from the sim's formal strip; diagrams computed
from the default N = 0, v0 = 1 m/s run (equal masses, 3 collisions).
"""
import math

# ---- sim defaults (slider/select value attributes / resetState) --------------
N0, V0 = 0, 1.0                     # mass exponent, heavy-block speed (m/s)
M1 = 1.0
M2 = 100.0 ** N0                    # 1 kg at N = 0
W_LIGHT, W_HEAVY = 0.5, 1.2
light_left = 3.0
x1_0 = light_left + W_LIGHT / 2     # 3.25 m
x2_0 = x1_0 + W_LIGHT / 2 + 3.0 + W_HEAVY / 2  # 7.10 m

# Equal-mass 1D run at defaults: exchange, wall, exchange. u_i = sqrt(m_i) v_i.
# States on the energy circle of radius sqrt(m2) v0 = 1.
STATES = [
    (0.0, -1.0),   # start: light at rest, heavy leftward
    (-1.0, 0.0),   # after BB 1: velocities exchanged
    ( 1.0, 0.0),   # after wall: light reversed
    ( 0.0,  1.0),  # after BB 2: heavy escapes right
]
assert len(STATES) - 1 == 3, 'N=0 must produce 3 collisions'

def galperin(N):
    theta = math.atan(10.0 ** (-N))
    ratio = math.pi / theta
    Pi = math.ceil(ratio) - 1
    return theta, ratio, Pi

th0, r0, Pi0 = galperin(0)
assert abs(th0 - math.pi / 4) < 1e-12
assert abs(r0 - 4.0) < 1e-12
assert Pi0 == 3
assert galperin(1)[2] == 31
assert galperin(2)[2] == 314
assert galperin(3)[2] == 3141

# Unfolding: horizontal trajectory y = h through a fan of rays k·θ, k = 0..4.
# For θ = π/4 the line y = h crosses the three interior rays — BB, wall, BB.
H = 0.85
RAY_LEN = 2.15
TH = math.pi / 4
RAY_ANGS = [k * TH for k in range(5)]  # 0, 45, 90, 135, 180
HITS = [(H / math.tan(a), H) for a in RAY_ANGS if 0 < a < math.pi]
assert len(HITS) == 3
assert HITS[0][0] > 0 and abs(HITS[1][0]) < 1e-12 and HITS[2][0] < 0

# ---- equations (sim KaTeX, lightly annotated) --------------------------------
EQS = {
 'eq1': r"""$\begin{aligned}
v_1' &= \frac{m_1-m_2}{m_1+m_2}\,v_1 + \frac{2m_2}{m_1+m_2}\,v_2 \\[2pt]
v_2' &= \frac{m_2-m_1}{m_1+m_2}\,v_2 + \frac{2m_1}{m_1+m_2}\,v_1
\end{aligned}$""",
 'eq2': r"$v_1' \;=\; -\,v_1$",
 'eq3': r"$\theta \;=\; \arctan\sqrt{m_1/m_2}\,,\qquad \Pi \;=\; \underbrace{\bigl\lceil \pi/\theta \bigr\rceil - 1}_{\textcolor{acc}{\text{collisions}}}$",
 'eq4': r"$\text{halt when }\; v_1 \ge 0 \;\text{ and }\; v_2 \ge v_1$",
 'eq5': r"$\text{for } m_2/m_1 = 100^{N}:\quad \theta \approx 10^{-N}\,,\qquad \Pi \;=\; \bigl\lfloor \pi\cdot 10^{N}\bigr\rfloor \quad (N\ge 1)$",
 'eq6': r"$u_i \;=\; \sqrt{m_i}\,v_i\,,\qquad u_1^2 + u_2^2 \;=\; m_2 v_0^2 \;=\; \text{const}$",
}

# ---- diagrams ----------------------------------------------------------------
def ray(ang, L):
    return f'({L*math.cos(ang):.3f},{L*math.sin(ang):.3f})'

DIAGS = {
 # d1: lab apparatus (default positions) beside the computed N=0 energy circle
 'd1': r"""\begin{tikzpicture}
\definecolor{blu}{RGB}{96,165,250}
\definecolor{pnk}{RGB}{244,114,182}
%% --- lab (blocks placed from sim resetState, uniformly scaled) ---
\fill[black!12] (-0.22,-0.12) rectangle (0.0,1.22);
\draw[line width=1.15pt] (0,-0.12) -- (0,1.22);
\node at (-0.08,1.42) {\scriptsize wall};
\draw[line width=.9pt] (-0.22,-0.12) -- (3.35,-0.12);
\fill[blu] (0.88,0.0) rectangle (1.20,0.52);
\draw[line width=.6pt] (0.88,0.0) rectangle (1.20,0.52);
\fill[pnk] (1.98,0.0) rectangle (2.78,0.70);
\draw[line width=.6pt] (1.98,0.0) rectangle (2.78,0.70);
\draw[-{Latex}, pnk, line width=1.25pt] (3.28,0.96) -- (2.42,0.96);
\node[blu] at (1.04,0.72) {\scriptsize $m_1$};
\node[pnk] at (2.38,1.18) {\scriptsize $m_2,\;v_0$};
%% --- energy circle: N=0 states (0,-1) -> (-1,0) -> (1,0) -> (0,1) ---
\begin{scope}[shift={(5.45,0.48)}]
\draw[line width=.8pt] (0,0) circle (1.08);
\draw[line width=.35pt] (-1.28,0) -- (1.28,0);
\draw[line width=.35pt] (0,-1.28) -- (0,1.28);
\draw[-{Latex}, line width=.5pt] (1.08,0) -- (1.34,0);
\draw[-{Latex}, line width=.5pt] (0,1.08) -- (0,1.34);
\node at (1.54,0.02) {\scriptsize $u_1$};
\node at (0.22,1.50) {\scriptsize $u_2$};
\draw[blu, line width=1.25pt] (0,-1.08) -- (-1.08,0);
\draw[line width=1.25pt] (-1.08,0) -- (1.08,0);
\draw[pnk, line width=1.25pt] (1.08,0) -- (0,1.08);
\fill (0,-1.08) circle (1.8pt);
\fill[blu] (-1.08,0) circle (1.8pt);
\fill (1.08,0) circle (1.8pt);
\fill[pnk] (0,1.08) circle (1.8pt);
\node at (0.48,-1.32) {\scriptsize start};
\end{scope}
\end{tikzpicture}""",

 # d2: unfolding of the N=0 wedge — trajectory y = H crosses 3 computed rays
 'd2': r"""\begin{tikzpicture}
\definecolor{pnk}{RGB}{244,114,182}
\fill[acc!18] (0,0) -- (2.15,0) -- (%(r1)s) -- cycle;
\draw[line width=.75pt] (0,0) -- (%(r0)s);
\draw[pnk, line width=.9pt] (0,0) -- (%(r1)s);
\draw[line width=.75pt] (0,0) -- (%(r2)s);
\draw[pnk, line width=.9pt] (0,0) -- (%(r3)s);
\draw[line width=.75pt] (0,0) -- (%(r4)s);
\draw[-{Latex}, acc, line width=1.3pt] (2.35,%(h)s) -- (-2.35,%(h)s);
\fill[acc] (%(h1x)s,%(h)s) circle (2.1pt);
\fill[acc] (%(h2x)s,%(h)s) circle (2.1pt);
\fill[acc] (%(h3x)s,%(h)s) circle (2.1pt);
\node[acc] at (%(h1x)s,%(hdot)s) {\scriptsize 1};
\node[acc] at (0.28,%(hdot)s) {\scriptsize 2};
\node[acc] at (%(h3x)s,%(hdot)s) {\scriptsize 3};
\node at (1.42,0.32) {\small $\theta=\pi/4$};
\node[pnk] at (1.88,1.58) {\scriptsize block--block};
\node at (0.00,2.38) {\scriptsize wall};
\node[pnk] at (-1.88,1.58) {\scriptsize block--block};
\node at (0.00,-0.48) {\scriptsize straight line through copies of the wedge --- 3 crossings};
\end{tikzpicture}""" % {
    'h': f'{H:.3f}',
    'hdot': f'{H+0.30:.3f}',
    'r0': ray(0, RAY_LEN),
    'r1': ray(TH, RAY_LEN),
    'r2': ray(2*TH, RAY_LEN),
    'r3': ray(3*TH, RAY_LEN),
    'r4': ray(math.pi, RAY_LEN),
    'h1x': f'{HITS[0][0]:.3f}',
    'h2x': f'{HITS[1][0]:.3f}',
    'h3x': f'{HITS[2][0]:.3f}',
 },

 # d3: four mass ratios, the four counts — wedge angles computed from N
 'd3': r"""\begin{tikzpicture}
\definecolor{blu}{RGB}{96,165,250}
%% N=0, θ=π/4
\begin{scope}[shift={(0,0)}]
\draw[line width=.8pt] (1.15,0) -- (0,0) -- ({1.15*cos(45)},{1.15*sin(45)});
\fill[acc!25] (0,0) -- (1.15,0) -- ({1.15*cos(45)},{1.15*sin(45)}) -- cycle;
\node at (0.58,-0.42) {\small $N=0$};
\node at (0.58,-0.72) {\scriptsize $m_2=1\,\mathrm{kg}$};
\node[acc] at (0.58,1.22) {\small $3$};
\end{scope}
%% N=1, θ=arctan(0.1) ≈ 5.71°
\begin{scope}[shift={(2.55,0)}]
\draw[line width=.8pt] (1.15,0) -- (0,0) -- ({1.15*cos(5.711)},{1.15*sin(5.711)});
\fill[acc!25] (0,0) -- (1.15,0) -- ({1.15*cos(5.711)},{1.15*sin(5.711)}) -- cycle;
\node at (0.58,-0.42) {\small $N=1$};
\node at (0.58,-0.72) {\scriptsize $m_2=100\,\mathrm{kg}$};
\node[acc] at (0.58,1.22) {\small $31$};
\end{scope}
%% N=2, θ=arctan(0.01) ≈ 0.573°
\begin{scope}[shift={(5.10,0)}]
\draw[line width=.8pt] (1.15,0) -- (0,0) -- ({1.15*cos(0.573)},{1.15*sin(0.573)});
\fill[acc!35] (0,0) -- (1.15,0) -- ({1.15*cos(0.573)},{1.15*sin(0.573)}) -- cycle;
\node at (0.58,-0.42) {\small $N=2$};
\node at (0.58,-0.72) {\scriptsize $m_2=10^{4}\,\mathrm{kg}$};
\node[acc] at (0.58,1.22) {\small $314$};
\end{scope}
%% N=3, θ=arctan(0.001) ≈ 0.0573°
\begin{scope}[shift={(7.65,0)}]
\draw[line width=.8pt] (1.15,0) -- (0,0) -- ({1.15*cos(0.0573)},{1.15*sin(0.0573)});
\fill[acc!45] (0,0) -- (1.15,0) -- ({1.15*cos(0.0573)},{1.15*sin(0.0573)}) -- cycle;
\node at (0.58,-0.42) {\small $N=3$};
\node at (0.58,-0.72) {\scriptsize $m_2=10^{6}\,\mathrm{kg}$};
\node[acc] at (0.58,1.22) {\small $3141$};
\end{scope}
\node at (4.40,-1.18) {\scriptsize each extra two zeros on the mass ratio buy one more digit of $\pi$};
\end{tikzpicture}""",
}
