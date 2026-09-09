# Canonical implementation (extracted from the validated L1 inquiry-v2 build)

Blocks are verbatim from `L1-Solar_System_Orbits-inquiry-v2.html`. Copy the
patterns; touch only what's marked ADAPT. Sims using the data-attribute
wiring style (choices carry `data-correct`/`data-fb`) keep that style —
adapt these patterns' CONTENT rules to it, don't convert the wiring.

## 1. Markup — a gated PREDICT card

ADAPT: number, title, stem, choices. Keep `data-gate`, the choice/eval
structure, and class names exactly — the shell binds to them.

```html
        <div class="inq-step" data-gate>
          <h4>2 · Predict — where is Mercury fastest?</h4>
          <p>Motion is paused so you can commit first. Along its orbit, where does Mercury move <strong>fastest</strong>?</p>
          <button class="choice">A · At its farthest point from the Sun</button>
          <button class="choice">B · Same speed everywhere — one orbit at a steady pace</button>
          <button class="choice">C · At its closest approach to the Sun</button>
          <div class="predict-eval" style="display:none"></div>
        </div>
```

## 2. Markup — OBSERVE then RESOLVE (the split that fixes spoilers)

The OBSERVE card acts + asks; the RESOLVE card names the law one card
later. ADAPT the copy; keep the two-card split.

```html
        <div class="inq-step">
          <h4>3 · Observe — r and v together</h4>
          <p>Mercury is selected — watch <strong>r</strong> and <strong>v</strong> in the stats panel through one full lap.</p>
          <p>As r shrinks toward the Sun, what does v do? And out at the far side of the orbit?</p>
        </div>

        <div class="inq-step">
          <h4>4 · Resolve — Kepler's second law</h4>
          <p>Fastest at <strong>perihelion</strong>, slowest at aphelion: falling inward from aphelion trades potential energy for speed. That is Kepler's second law — the line to the Sun sweeps <strong>equal areas in equal times</strong>. (Formal panel: v² = GM(2/r − 1/a).)</p>
        </div>
```

## 3. JS — wiring the predictions (JS-config style)

ADAPT: card indices (`cards[N]` — re-map on ANY card-count change),
correct index, feedback strings (budgets: ≤50 words, forward-pointing),
and `onWrong` hooks. Keep rebuttal mechanics like the ghost — they are
the sim's best feedback.

```js
  function wirePredictions(){
    const cards = document.querySelectorAll('#inq-cards .inq-step');
    setupChoiceCard(cards[1], 2, {
      correct: 'Correct \u2014 <strong>closest approach (perihelion)</strong>. Mercury has been falling toward the Sun since aphelion, trading potential energy for speed. Watch r and v together on the next card.',
      wrong: [
        'That is where Mercury is <em>slowest</em>. The <span class="answer">closest approach (perihelion)</span> is fastest \u2014 it has been falling inward, gaining speed. Watch r and v together on the next card.',
        'Watch the dashed ghost now orbiting at constant speed \u2014 real Mercury pulls ahead near the Sun and lags far out. Fastest is at <span class="answer">closest approach (perihelion)</span>.',
        null
      ],
      onWrong: (idx)=>{
        if(idx === 1){
          state.ghostActive = true;
          // Ghost is suppressed in outer view \u2014 ensure the rebuttal is visible
          if(state.view !== 'inner') setView('inner');
        }
      }
    });
    setupChoiceCard(cards[4], 2, {
      correct: 'Yes \u2014 <strong>Mercury</strong> (e = 0.206): the only orbit where the Sun sits visibly off-centre. Compare e values yourself on the next card.',
      wrong: [
        'Earth\u2019s e = 0.017 \u2014 the Sun looks centred in its orbit. <span class="answer">Mercury</span> (e = 0.206) is the standout; compare e values on the next card.',
        'Neptune\u2019s e = 0.009 \u2014 nearly a perfect circle. <span class="answer">Mercury</span> (e = 0.206) is the standout; compare e values on the next card.',
        null,
        'They are all ellipses \u2014 but with e this small, most look circular. <span class="answer">Mercury</span> is the giveaway: look for an off-centre Sun, not a squashed shape.'
      ]
    });
  }
```

`setupChoiceCard` is shell machinery — reuse as-is if present, insert
verbatim if adding inquiry to a sim that lacks it:

```js
  function setupChoiceCard(card, correctIdx, feedback){
    if(!card) return;
    const choices = card.querySelectorAll('.choice');
    const evalBox = card.querySelector('.predict-eval');
    choices.forEach((c, idx) => {
      c.addEventListener('click', () => {
        if(card.hasAttribute('data-answered')) return;
        card.setAttribute('data-answered','');
        const isCorrect = (idx === correctIdx);
        choices.forEach((cc, ii) => {
          cc.disabled = true;
          if(ii === correctIdx) cc.classList.add('correct');
          else if(ii === idx) cc.classList.add('wrong');
          else cc.classList.add('dim');
        });
        evalBox.style.display = 'block';
        evalBox.classList.remove('correct','wrong');
        evalBox.classList.add(isCorrect ? 'correct' : 'wrong');
        evalBox.innerHTML = isCorrect ? feedback.correct : feedback.wrong[idx];
        if(!isCorrect && feedback.onWrong) feedback.onWrong(idx);
        // Resume motion so student can observe the resolution
        if(!Shell.playing) Shell.setPlaying(true);
        // Unlock Next only after the student has read the rebuttal for a beat
        setTimeout(()=>Shell.stepReady(), isCorrect ? 250 : 900);
      });
    });
  }
```

## 4. JS — onStep: pause on gates, pin state, map views

ADAPT: the pinning line(s) per OBSERVE card, the ghost/rebuttal clear
condition, and the view map — every hardcoded index here must be re-walked
when the card count changes.

```js
  function onStep(i){
    applyStepReveals(i);
    // Auto-pause on prediction (gated) steps so student commits before observing
    const cards = document.querySelectorAll('#inq-cards .inq-step');
    const card = cards[i];
    if(card && card.hasAttribute('data-gate') && !card.hasAttribute('data-ready')){
      Shell.setPlaying(false);
    }
    // State pinning: the speed OBSERVE card assumes Mercury's readouts are live
    if(i === 2 && state.selected == null) setSelectedPlanet(0);
    // Ghost is the step-2 rebuttal \u2014 keep it through the speed OBSERVE card, then clear
    if(i > 2) state.ghostActive = false;
    // View follows the cycle: inner for the speed cycle (0\u20133), outer for the shape cycle (4\u20136)
    const wantView = (i >= 4) ? 'outer' : 'inner';
    if(state.view !== wantView) setView(wantView);
    render(0);
  }
```

## 5. JS — staged reveals (the anti-lookup mechanism)

ADAPT: which selectors unlock at which index. The rule: anything that
could be read off to answer a PREDICT stays hidden until AFTER that
card's commit.

```js
  function applyStepReveals(i){
    // r/v visible from the speed OBSERVE card (index >= 2)
    document.querySelectorAll('.row-r, .row-v').forEach(el => {
      el.classList.toggle('hidden-until-step', i < 2);
    });
    // a/e and the planet list held back until the shape OBSERVE card (index >= 5),
    // so the shape PREDICT is committed from the picture, not looked up.
    document.querySelectorAll('.row-a, .row-e').forEach(el => {
      el.classList.toggle('hidden-until-step', i < 5);
    });
    const pl = document.getElementById('panel-planet-list');
    if(pl) pl.classList.toggle('hidden-until-step', i < 5);
  }
```

## 6. Template hooks the sim must publish (verbatim from the L1 final build)

Place beside `applyStepReveals` inside the sim's scope. `__freeExplore` is
the post-completion state; `__giResume` re-applies the current card:

```js
  window.__cgReveals = applyStepReveals; // controls-guide hook: lift/restore inquiry-step reveals
  // Free exploration = the post-completion state: everything revealed, no
  // inquiry leftovers (ghost, inner zoom). Applied when GI is turned off.
  window.__freeExplore = function(){
    applyStepReveals(99);
    state.ghostActive = false;
    if(state.view !== 'outer') setView('outer');
    render(0);
  };
  // Re-entering the inquiry restores its own step state (reveals, view, pause).
  window.__giResume = function(){
    onStep((typeof Shell !== 'undefined' && Shell.step) || 0);
  };
```

Finish routes through the Guided Inquiry button (`window.__giOff`), with
the collapse call kept only as a fallback:

```js
  function inqNext(){
    const cards=inqCards();
    if(inqStep>=cards.length-1){ if(window.__giOff) window.__giOff(); else setInquiryCollapsed(true); }
    else inqShow(inqStep+1);
  }
```

The button pair, `setGi`/`setCg`, and `__fullReset` are in the
controls-tutorial skill's reference §4 — the two skills share that block.
The card voiceover + Auto layer (Listen row, engine, contract, Chrome TTS
pitfalls) is §6 of the same file — the inquiry-side markup and wiring are
included there verbatim.

## 7. Verification

Prefer `node scripts/verify.js <patched.html> --baseline <original.html>`.
It boots headlessly with canvas stubbed, REWINDS to card 1 first (these
shells boot on the last card under jsdom), then asserts the mechanical
invariants listed in SKILL.md §5. Exit 0 gates delivery. The harness is
the same permissive-Proxy canvas stub used by the controls-tutorial
verifier; KaTeX/Three.js CDN failures belong to the baseline, not to you.
