"""The accepted Coriolis spec — copy this file as spec.py for a new sim and rewrite.

The pattern to imitate, not just the content:
  * EQS come from the sim's own formal-strip LaTeX, kept in its symbols.
  * Trajectories in DIAGS are COMPUTED from the sim's default parameters below,
    never sketched — the figure must agree with what the sim actually draws.
  * Colors: cyn/amb are the shell's trail colors; acc is the sheet accent.
    Structural strokes and text stay black (the pipeline maps them to currentColor).
  * Keep every label inside the canvas (7pt border helps, but check the PNGs).
  * Assert the physics of the figure where you can (see the bend-direction assert).
"""
import math

# ---- sim defaults (from the sliders' value attributes / reset function) --------
OM, V = 0.5, 2.0                    # rad/s, m/s
r0 = (0.0, -1.0)                    # launch point: rim bottom of the 1 m table
v_lab = (-OM * r0[1], V + OM * r0[0])   # radial v + (Omega z-hat) x r tangential

# exit time: |r0 + v t| = 1
_a = v_lab[0]**2 + v_lab[1]**2
_b = 2 * (r0[0]*v_lab[0] + r0[1]*v_lab[1])
_c = r0[0]**2 + r0[1]**2 - 1
T = (-_b + math.sqrt(_b*_b - 4*_a*_c)) / (2*_a)

N = 60
lab_pts, rot_pts = [], []
for i in range(N + 1):
    t = T * i / N
    x, y = r0[0] + v_lab[0]*t, r0[1] + v_lab[1]*t
    th = OM * t
    rot_pts.append((math.cos(-th)*x - math.sin(-th)*y,
                    math.sin(-th)*x + math.cos(-th)*y))
    lab_pts.append((x, y))
mid = N // 2
assert rot_pts[mid][0] > 0, 'rot-frame curve must bend right (+x) for Omega>0'

def coords(pts, s, dx=0.0):
    return ' '.join(f'({p[0]*s+dx:.3f},{p[1]*s:.3f})' for p in pts)

# tangent + right-normal at the midpoint (for the v / F arrows in d2)
tx = rot_pts[mid+1][0] - rot_pts[mid-1][0]
ty = rot_pts[mid+1][1] - rot_pts[mid-1][1]
_L = math.hypot(tx, ty); tx, ty = tx/_L, ty/_L
nx, ny = ty, -tx
mx, my = rot_pts[mid]

# ---- equations (from the sim's renderMath map, lightly respaced) ---------------
EQS = {
 'eq1': r"$m\,\vec a_{\mathrm{lab}} \;=\; \vec F_{\mathrm{real}} \;=\; 0 \;\;\Longrightarrow\;\; \vec r_{\mathrm{lab}}(t) \;=\; \vec r_0 + \vec v_0\,t$",
 'eq2': r"$m\,\vec a_{\mathrm{rot}} \;=\; \vec F_{\mathrm{real}} \;\underbrace{-\;2m\,\vec\Omega\times\vec v_{\mathrm{rot}}}_{\textcolor{acc}{\text{Coriolis}}} \;\underbrace{-\;m\,\vec\Omega\times(\vec\Omega\times\vec r)}_{\textcolor{acc}{\text{centrifugal}}}$",
 'eq3': r"$\bigl|\vec F_{\mathrm{Cor}}\bigr| \;=\; 2m\Omega v_{\mathrm{rot}} \qquad\quad \bigl|\vec F_{\mathrm{cf}}\bigr| \;=\; m\Omega^2 r$",
 'eq4': r"$\vec r_{\mathrm{rot}}(t) \;=\; R\bigl(-\theta(t)\bigr)\,\vec r_{\mathrm{lab}}(t)\,, \qquad \theta(t)=\int_0^{t}\Omega\;dt'$",
 'eq5': r"$\bigl|a_{\mathrm{Cor}}\bigr| \;=\; 2\,\Omega_\oplus v \;=\; 2\,(7.29\times10^{-5})(100) \;=\; 0.01458\ \mathrm{m/s^2}$",
 'eq6': r"$\vec F_{\mathrm{Cor}} \;=\; -\,2m\,\vec\Omega \times \vec v_{\mathrm{rot}}$",
}

# ---- diagrams -------------------------------------------------------------------
s1, s2 = 1.15, 1.5
DIAGS = {
 # d1: the core comparison — same flight, two cameras, sim trail colors
 'd1': r"""\begin{tikzpicture}
\draw[line width=.8pt] (0,0) circle (%(s)s);
\draw[line width=.8pt] (3.4,0) circle (%(s)s);
\draw[-{Latex}, acc, line width=.7pt] (-0.55,%(top)s) arc (110:70:1.6);
\node[acc] at (0,%(omy)s) {\scriptsize $\Omega$};
\draw[cyn, line width=1.4pt] plot coordinates {%(lab)s};
\draw[amb, line width=1.4pt] plot[smooth] coordinates {%(rot2)s};
\fill (0,-%(s)s) circle (1.6pt);
\fill (3.4,-%(s)s) circle (1.6pt);
\node at (0,-%(cap)s) {\small ground camera};
\node at (3.4,-%(cap)s) {\small table camera};
\node at (0,-%(cap2)s) {\scriptsize straight, no force};
\node at (3.4,-%(cap2)s) {\scriptsize same flight, re-plotted};
\end{tikzpicture}""" % {
    's': s1, 'top': s1+0.12, 'omy': s1+0.42, 'cap': s1+0.42, 'cap2': s1+0.75,
    'lab': coords(lab_pts, s1), 'rot2': coords(rot_pts, s1, dx=3.4)},

 # d2: the rule — vectors on the computed path, right-angle mark, sign labeled
 'd2': r"""\begin{tikzpicture}
\draw[line width=.8pt] (0,0) circle (%(s)s);
\draw[-{Latex}, acc, line width=.7pt] (-0.62,%(top)s) arc (112:68:1.9);
\node[acc] at (0,%(omy)s) {\small $\Omega>0$};
\draw[amb, line width=1.4pt] plot[smooth] coordinates {%(rot)s};
\fill (0,-%(s)s) circle (1.8pt);
\draw[-{Latex}, line width=1.1pt] (%(mx)s,%(my)s) -- (%(vx)s,%(vy)s);
\node at (%(vlx)s,%(vly)s) {\small $\vec v_{\mathrm{rot}}$};
\draw[-{Latex}, acc, line width=1.3pt] (%(mx)s,%(my)s) -- (%(fx)s,%(fy)s);
\node[acc] at (%(flx)s,%(fly)s) {\small $\vec F_{\mathrm{Cor}}$};
\draw (%(rax)s,%(ray)s) -- (%(rbx)s,%(rby)s) -- (%(rcx)s,%(rcy)s);
\node at (0,-%(cap)s) {\scriptsize always $90^\circ$ to the motion --- to the \textit{right} when $\Omega>0$};
\end{tikzpicture}""" % {
    's': s2, 'top': s2+0.12, 'omy': s2+0.45, 'cap': s2+0.45,
    'rot': coords(rot_pts, s2),
    'mx': f'{mx*s2:.3f}', 'my': f'{my*s2:.3f}',
    'vx': f'{(mx+tx*0.62)*s2:.3f}', 'vy': f'{(my+ty*0.62)*s2:.3f}',
    'vlx': f'{(mx+tx*0.62-nx*0.22)*s2:.3f}', 'vly': f'{(my+ty*0.62-ny*0.22)*s2+0.16:.3f}',
    'fx': f'{(mx+nx*0.55)*s2:.3f}', 'fy': f'{(my+ny*0.55)*s2:.3f}',
    'flx': f'{(mx+nx*0.55)*s2+0.18:.3f}', 'fly': f'{(my+ny*0.55)*s2-0.34:.3f}',
    'rax': f'{(mx+tx*0.16)*s2:.3f}', 'ray': f'{(my+ty*0.16)*s2:.3f}',
    'rbx': f'{(mx+tx*0.16+nx*0.16)*s2:.3f}', 'rby': f'{(my+ty*0.16+ny*0.16)*s2:.3f}',
    'rcx': f'{(mx+nx*0.16)*s2:.3f}', 'rcy': f'{(my+ny*0.16)*s2:.3f}'},

 # d3: the real world — one shared caption line (pitfalls #7)
 'd3': r"""\begin{tikzpicture}
\draw[line width=.8pt] (0,0) circle (0.95);
\draw[line width=.8pt] (2.9,0) circle (0.95);
\draw[-{Latex}, acc, line width=1.2pt] (0.62,-0.32) arc (-27:225:0.7);
\draw[-{Latex}, acc, line width=1.2pt] (2.28,0.32) arc (153:-95:0.7);
\node at (0,0) {\small N};
\node at (2.9,0) {\small S};
\node at (1.45,-1.4) {\scriptsize N: deflects \textit{right} $\to$ CCW \qquad S: deflects \textit{left} $\to$ CW};
\end{tikzpicture}""",
}
