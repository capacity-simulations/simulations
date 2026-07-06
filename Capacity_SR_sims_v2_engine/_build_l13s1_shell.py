#!/usr/bin/env python3
"""Build L13-s1 Lorentz transformations shell."""
import re
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATE = ROOT / "L12-s1-twin-paradox-worldline-comparison-shell.html"
SOURCE = ROOT / "L13-s1-lorentz-transformations-on-vectors.html"
OUT = ROOT / "L13-s1-lorentz-transformations-on-vectors-shell.html"

tpl = TEMPLATE.read_text(encoding="utf-8")
src = SOURCE.read_text(encoding="utf-8")

fonts_block = re.search(r"<style data-sim-fonts>.*?</style>", tpl, re.S).group(0)
shell_css = re.search(r"<style>\s*(.*?)(/\* ={50,}\s*\n\s*SIM CSS)", tpl, re.S).group(1)
shell_rt = re.search(r"<script>\s*(const Shell = \(function\(\)\{.*?\}\)\(\);)", tpl, re.S).group(1)
info_modal = re.search(r'<div id="shell-info-modal".*?</div>\s*</div>\s*</div>', src, re.S).group(0)
formal = re.search(r'<section class="shell-formal">.*?</section>', src, re.S).group(0)

sim_js = re.search(
    r"/\* ={50,}\s*\n\s*SIM\s*\n\s*=+ \*/\s*\(function\(\)\{.*?\}\)\(\);\s*</script>",
    src, re.S,
).group(0).replace("</script>", "").strip()

# Remove old prediction handler
sim_js = re.sub(
    r"  /\* ---- prediction ---- \*/\s*function choose\(o\)\{.*?\}\s*"
    r"document\.querySelectorAll\('\.choice'\)\.forEach\(b=>b\.addEventListener\('click',\(\)=>choose\(b\.dataset\.opt\)\)\);\s*"
    r"function syncPredictUI\(\)\{.*?\}\s*",
    "", sim_js, flags=re.S,
)

# Remove stepper
sim_js = re.sub(
    r"  /\* ---- stepper ---- \*/\s*const stages=\[.*?\];\s*"
    r"function renderStepper\(\)\{.*?\}\s*",
    "", sim_js, flags=re.S,
)

# Remove state.stage
sim_js = sim_js.replace("markerPhase:0, pred:null, stage:0", "markerPhase:0, pred:null")

# Fix onReset - remove renderStepper, syncPredictUI; add inquiry clear
sim_js = re.sub(
    r"      markerPhase:0, pred:null, stage:0\n    \}\);",
    "      markerPhase:0, pred:null\n    });",
    sim_js,
)
sim_js = sim_js.replace(
    "    updateSliderVisibility(); syncButtons(); syncPredictUI();\n"
    "    document.getElementById('ckIn0').value=''; document.getElementById('ckIn1').value='';\n"
    "    document.getElementById('ckRes').innerHTML='';\n"
    "    renderStepper();\n"
    "    render();",
    """    updateSliderVisibility(); syncButtons();
    document.querySelectorAll('#inq-cards .inq-step').forEach(card => {
      delete card.dataset.answered;
      card.querySelectorAll('.choice').forEach(c => {
        c.disabled = false;
        c.classList.remove('correct','wrong','dim','sel');
      });
      const ev = card.querySelector('.predict-eval');
      if(ev){ ev.innerHTML=''; ev.className='predict-eval'; }
    });
    document.getElementById('ckIn0').value=''; document.getElementById('ckIn1').value='';
    document.getElementById('ckRes').innerHTML='';
    updateStepHL();
    render();""",
)

sim_js = sim_js.replace(
    "  renderKatex();\n  renderStepper();\n  syncButtons();",
    "  renderKatex();\n  syncButtons();",
)

# Fix group IDs for aside controls
sim_js = sim_js.replace("document.getElementById('grpV')", "document.getElementById('vGroup')")
sim_js = sim_js.replace("document.getElementById('grpU')", "document.getElementById('uGroup')")

# Add readout updates for moved sliders
sim_js = sim_js.replace(
    "    setText('pBeta', f2(state.beta));",
    "    setText('pBeta', f2(state.beta));\n"
    "    setText('roV0', 'V⁰ = '+f2(V.V0));\n"
    "    setText('roV1', 'V¹ = '+f2(V.V1));\n"
    "    setText('roU', 'u = '+f2(state.u));",
)

sim_js = sim_js.replace(
    "  Shell.init({ onFrame, onReset, onResize });",
    """function updateStepHL(){
  const vg=document.getElementById('vGroup');
  const bg=document.getElementById('betaGroup');
  const lg=document.getElementById('layerGroup');
  if(vg) vg.classList.toggle('hl', Shell.step===1);
  if(bg) bg.classList.toggle('hl', Shell.step===1);
  if(lg){
    const mag=document.getElementById('btnMag');
    const four=document.getElementById('btnFour');
    const world=document.getElementById('btnWorld');
    if(mag) mag.classList.toggle('hl', Shell.step===2);
    if(four) four.classList.toggle('hl', Shell.step===3);
    if(world) world.classList.toggle('hl', Shell.step===4);
  }
}

function onStep(i){
  updateStepHL();
  render();
}

function evalPrediction(o){
  const evalBox = document.querySelector('.inq-step[data-gate] .predict-eval');
  if(!evalBox) return;
  state.pred=o;
  if(o==='C'){
    evalBox.className='predict-eval show correct';
    evalBox.innerHTML='Correct — the Minkowski magnitude is a Lorentz invariant. Turn on <b>Minkowski magnitude</b> and slide &beta;: the components V&prime;&sup0;, V&prime;&sup1; change, yet the arrow tip stays on the invariant hyperbola and the two V&middot;V readouts stay equal.';
  } else {
    evalBox.className='predict-eval show wrong';
    evalBox.innerHTML='In Euclidean space, rotating a vector changes its components but not its length, because x&sup2;+y&sup2; is invariant under rotation. A Lorentz boost is the Minkowski-geometry analogue: it changes V&sup0; and V&sup1; but preserves &minus;(V&sup0;)&sup2;+(V&sup1;)&sup2;. The minus sign is crucial — it is what makes the magnitude invariant under <i>boosts</i> rather than rotations. Turn on <b>Minkowski magnitude</b> and slide &beta; to see this directly.<br><br>The answer is <b>(C) it stays the same</b>.';
  }
}

document.querySelectorAll('#inq-cards .inq-step').forEach(card => {
  const evalBox = card.querySelector('.predict-eval');
  const choices = card.querySelectorAll('.choice');
  choices.forEach(ch => ch.addEventListener('click', () => {
    if(card.dataset.answered) return;
    card.dataset.answered = '1';
    const correct = ch.dataset.correct === '1';
    const opt = ch.dataset.c;
    choices.forEach(c => {
      c.disabled = true;
      if(c.dataset.correct === '1') c.classList.add('correct');
      else if(c === ch) c.classList.add('wrong');
      else c.classList.add('dim');
    });
    evalPrediction(opt);
    render();
  }));
});

  updateStepHL();
  Shell.init({ onFrame, onReset, onResize, onStep });""",
)

sim_css = """
/* ============================================================================
   SIM CSS
   ========================================================================== */
.sim-hero-wrap{display:grid;grid-template-rows:auto 1fr;gap:8px;height:100%;min-height:0;}
.sim-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}
.sim-toolbar .shell-btn{font-size:12px;padding:5px 10px;}
.sim-canvas-wrap{position:relative;min-height:0;min-width:0;border:1px solid var(--border);
  border-radius:8px;background:#0a0c11;overflow:hidden;flex:1;}
canvas#mink{width:100%;height:100%;display:block;touch-action:none;cursor:crosshair;}
.ovl{position:absolute;z-index:6;pointer-events:none;background:rgba(10,13,18,.82);
  border:1px solid var(--border);border-radius:7px;padding:7px 9px;
  font-family:var(--font-nums);font-size:12px;line-height:1.55;
  max-width:48%;overflow-wrap:anywhere;backdrop-filter:blur(2px);}
.ovl-tl{top:10px;left:10px;}
.ovl-tr{top:10px;right:10px;text-align:left;}
.ovl-bl{bottom:10px;left:10px;}
.ov-blue{color:#93c5fd;} .ov-orange{color:#fbbf24;} .ov-green{color:#5eead4;}
.ov-inv{color:#c4b5fd;} .ov-dim{color:var(--ink-mute);}
.sl-mini{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text-muted);}
.sl-mini label{min-width:28px;font-weight:600;}
.sl-mini .shell-range{flex:1;min-width:0;}
.friend-resp{display:flex;flex-direction:column;gap:6px;margin-top:8px;}
.fr-btn{font:inherit;font-size:12px;text-align:left;background:var(--surface);
  border:1px solid var(--border);color:var(--text);padding:7px 9px;border-radius:6px;cursor:pointer;line-height:1.4;}
.fr-btn:hover{border-color:var(--accent-soft);}
.chk-row{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:12.5px;}
.chk-row label{min-width:34px;color:var(--text-muted);}
.chk-row input{width:90px;background:var(--ctrl-bg);border:1px solid var(--ctrl-border);color:var(--text);
  border-radius:6px;padding:5px 7px;font:inherit;font-size:12.5px;}
.chk-res{margin-top:8px;font-size:12px;line-height:1.55;}
.formal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media(max-width:1000px){.formal-grid{grid-template-columns:1fr;}}
.eq-row{background:rgba(15,23,42,.5);border:1px solid var(--border);border-radius:8px;padding:10px 12px;}
.eq-row h4{margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-mid);}
.eq-row .k{overflow-x:auto;}
.defn{font-size:12px;color:var(--text-muted);line-height:1.6;margin-top:6px;}
.defn b{color:var(--text);}
.shell-btn.hl{outline:2px solid rgba(96,165,250,.7);outline-offset:3px;animation:hlpulse 1.4s infinite;}
.shell-group.hl,.ctrl-box.hl{outline:2px solid rgba(96,165,250,.7);outline-offset:3px;border-radius:8px;animation:hlpulse 1.4s infinite;}
@keyframes hlpulse{0%,100%{outline-color:rgba(96,165,250,.7);}50%{outline-color:rgba(96,165,250,.18);}}
.frame-btn.active,.shell-btn.active.layer-on{background:rgba(6,182,212,.16);border-color:rgba(6,182,212,.4);color:#67e8f9;}
"""

header = """  <header class="shell-header">
    <div class="shell-title">Lorentz Transformation of a Four-Vector
      <span>boost changes components, preserves V·V</span></div>
    <div class="shell-group">
      <button id="shell-info" class="shell-btn" title="About this simulation">ⓘ Info</button>
      <button id="shell-theme" class="shell-btn" title="Toggle light / dark theme">☾</button>
    </div>
    <div class="shell-controls">
      <div class="shell-group">
        <button id="shell-maximize" class="shell-btn">⛶ Maximize</button>
        <button id="toggle-formal" class="shell-btn">∑ Formal</button>
        <label style="font-size:11px;">Speed</label>
        <select id="shell-speed" class="shell-select">
          <option value="0.25">0.25×</option><option value="0.5">0.5×</option>
          <option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option>
        </select>
      </div>
      <div class="shell-sep"></div>
      <div class="shell-group">
        <button id="shell-reset" class="shell-btn">↻ Reset</button>
        <button id="shell-play" class="shell-btn">⏸ Pause</button>
      </div>
    </div>
  </header>"""

hero = """  <main class="shell-hero">
    <div class="plot-box" style="flex:1;min-height:0;display:flex;flex-direction:column;">
      <div class="sim-hero-wrap">
        <div class="sim-toolbar" id="layerGroup">
          <button id="btnSprime" class="shell-btn active">S′ axes</button>
          <button id="btnMag" class="shell-btn">Minkowski magnitude</button>
          <button id="btnFour" class="shell-btn">Constrain to four-velocity</button>
          <button id="btnWorld" class="shell-btn">Worldline context</button>
        </div>
        <div class="sim-canvas-wrap">
          <canvas id="mink"></canvas>
          <div class="ovl ovl-tl" id="ovlS"></div>
          <div class="ovl ovl-tr" id="ovlSp"></div>
          <div class="ovl ovl-bl" id="ovlMag"></div>
        </div>
      </div>
    </div>
  </main>"""

inquiry = """
    <div id="aside-inquiry" class="aside-zone">
      <div class="aside-zone-head">
        <h3>Guided Inquiry</h3>
        <button id="aside-inquiry-skip" class="shell-btn aside-skip" title="Skip the guided inquiry">Skip ✕</button>
      </div>
      <div id="inq-dots" class="inq-dots"></div>
      <div id="inq-cards" class="aside-zone-body">

      <div class="inq-step" data-gate>
        <h4>1 · Predict</h4>
        <p>As you push &beta; from 0 toward &plusmn;0.9 (now &beta; = <span id="pBeta">0.60</span>), how does
        <b>&minus;(V&sup0;)&sup2; + (V&sup1;)&sup2;</b> measured in the new frame S&prime; compare with frame S?</p>
        <button class="choice" data-c="A" data-correct="0"><span class="ck">A</span>It increases in S&prime;.</button>
        <button class="choice" data-c="B" data-correct="0"><span class="ck">B</span>It decreases in S&prime;.</button>
        <button class="choice" data-c="C" data-correct="1"><span class="ck">C</span>It stays the same.</button>
        <div class="predict-eval"></div>
      </div>

      <div class="inq-step">
        <h4>2 · Explore the four-vector</h4>
        <p>Set a four-vector <b>V</b> with the V&sup0;/V&sup1; sliders, or drag on the diagram. Press <b>Play</b> to watch the particle trace its worldline. Move <b>&beta;</b> to tilt the S&prime; axes. What changes? What stays the same?</p>
      </div>

      <div class="inq-step">
        <h4>3 · Investigate invariance</h4>
        <p>Turn on <b>Minkowski magnitude</b> in the layer toolbar. Slide &beta; and compare the two V&middot;V readouts. Try timelike, spacelike and null vectors — does invariance hold for all of them?</p>
      </div>

      <div class="inq-step">
        <h4>4 · Four-velocity</h4>
        <p>Turn on <b>Constrain to four-velocity</b>. Set ordinary velocity <b>u</b> and boost <b>&beta;</b>. Read u&prime; = V&prime;&sup1;/V&prime;&sup0; and compare it with the velocity-addition formula (u&minus;&beta;)/(1&minus;u&beta;).</p>
      </div>

      <div class="inq-step">
        <h4>5 · Worldline geometry</h4>
        <p>Turn on <b>Worldline context</b>. The displacement E&sub2;&minus;E&sub1; is the four-vector. Watch the events&rsquo; S&prime; coordinates change while the segment stays the same geometric object.</p>
      </div>

      <div class="inq-step">
        <h4>6 · Synthesise</h4>
        <p>Components <b>V&sup0;, V&sup1;</b> are frame-dependent; the Minkowski magnitude <b>V&middot;V = &minus;(V&sup0;)&sup2; + (V&sup1;)&sup2;</b> is a Lorentz invariant. Open <b>&sum; Formal</b> for the boost matrix.</p>
        <p>Hit <b>Finish</b> to explore freely.</p>
      </div>

      </div>
      <div class="inq-nav"><button id="inq-next" class="shell-btn primary">Next →</button></div>
    </div>

    <button id="aside-inquiry-restore" class="aside-restore" title="Revisit the guided inquiry">▸ Guided inquiry</button>"""

controls = """
    <div id="aside-controls" class="aside-zone">
      <div class="shell-panel">
        <div class="shell-panel-head"><h3>Controls</h3><span class="shell-caret">▾</span></div>
        <div class="shell-panel-body">
          <div class="ctrl-box ctrl-box--stacked" id="vGroup">
            <span class="ctrl-box-label">Four-vector V (frame S)</span>
            <div class="ctrl-readout-row">
              <span id="roV0" class="shell-readout">V⁰ = 2.00</span>
              <span id="roV1" class="shell-readout">V¹ = 1.00</span>
            </div>
            <div class="sl-mini"><label>V⁰</label><input id="sV0" type="range" min="-4" max="4" step="0.05" value="2" class="shell-range"></div>
            <div class="sl-mini"><label>V¹</label><input id="sV1" type="range" min="-4" max="4" step="0.05" value="1" class="shell-range"></div>
          </div>
          <div class="ctrl-box ctrl-box--stacked" id="uGroup" style="display:none;">
            <span class="ctrl-box-label">Ordinary velocity u (four-velocity mode)</span>
            <div class="ctrl-readout-row">
              <span id="roU" class="shell-readout">u = 0.50</span>
            </div>
            <div class="sl-mini"><label>u</label><input id="sU" type="range" min="-0.95" max="0.95" step="0.01" value="0.5" class="shell-range"></div>
          </div>
          <div class="ctrl-box ctrl-box--stacked" id="betaGroup">
            <span class="ctrl-box-label">Boost β (v/c)</span>
            <div class="ctrl-readout-row">
              <span id="roBeta" class="shell-readout">β = 0.60 · γ<sub>β</sub> = 1.25</span>
            </div>
            <div class="sl-mini"><label>β</label><input id="sBeta" type="range" min="-0.95" max="0.95" step="0.01" value="0.6" class="shell-range"></div>
          </div>
        </div>
      </div>

      <div class="shell-panel">
        <div class="shell-panel-head"><h3>Key idea</h3><span class="shell-caret">▾</span></div>
        <div class="shell-panel-body">
          <p>Components <b>V⁰, V¹</b> are <i>frame-dependent</i>. The Minkowski magnitude
          <b>V·V = −(V⁰)² + (V¹)²</b> is <i>frame-independent</i> — the invariant.</p>
          <p style="font-family:var(--font-nums);font-size:11.5px;color:var(--text-muted)">Current: V = (<span id="iV0">2.00</span>, <span id="iV1">1.00</span>),
          V·V = <span id="iVV">-3.00</span> (<span id="iType">timelike</span>)</p>
        </div>
      </div>

      <div class="shell-panel collapsed">
        <div class="shell-panel-head"><h3>Check your calculation</h3><span class="shell-caret">▾</span></div>
        <div class="shell-panel-body">
          <p style="font-size:12.5px">Given V = (<span id="ckV0">2.00</span>, <span id="ckV1">1.00</span>) and β = <span id="ckB">0.60</span>,
          predict V′ in S′, then Check.</p>
          <div class="chk-row"><label>V′⁰</label><input id="ckIn0" type="number" step="0.01" placeholder="?"></div>
          <div class="chk-row"><label>V′¹</label><input id="ckIn1" type="number" step="0.01" placeholder="?"></div>
          <button class="shell-btn" id="ckBtn">Check</button>
          <div class="chk-res" id="ckRes"></div>
        </div>
      </div>
    </div>"""

head = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lorentz Transformation of a Four-Vector</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
{fonts_block}
<style>
{shell_css}
{sim_css}
</style>
</head>
"""

body = f"""<body>
<div id="shell" class="hide-formal">

  <button id="shell-exit-max" class="shell-btn shell-exit-max" title="Restore (Esc)">⤢ Restore</button>

{info_modal}

{header}

{hero}

  <aside class="shell-aside">
{inquiry}
{controls}
  </aside>

{formal}

</div>

<script>
{shell_rt}

{sim_js}
</script>
</body>
</html>"""

OUT.write_text(head + body, encoding="utf-8")
print(f"Wrote {OUT} ({OUT.stat().st_size // 1024} KB)")
