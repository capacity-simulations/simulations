  /* ---- Orientation: open the sheet on entry to every mode ------------------
     The tutor's note was that the sim does not say what it is about. The sheet
     already answers that; it was just opt-in. So it now opens itself when the
     student picks a mode, landing on the "Start here" block.

     PER-SIM: BRIEF_MODES only. Everything else in this block is portable. */
  var BRIEF_MODES = { inquiry: 1 };   /* guided inquiry is predict-before-reveal */

  var fullBox = $('phys-full'), fullBtn = $('phys-full-toggle'), orient = $('phys-orient');

  function setFull(open, brief){
    if(!fullBox || !fullBtn) return;
    fullBox.hidden = !open;
    fullBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var lab = fullBtn.querySelector('.pf-label');
    if(lab) lab.textContent = open ? 'Hide the full revision sheet'
      : (brief ? 'Open the full revision sheet — 7 chapters, and it contains the answers'
               : 'Open the full revision sheet — 7 chapters');
  }
  if(fullBtn) fullBtn.addEventListener('click', function(){
    setFull(fullBox.hidden, orient && orient.getAttribute('data-brief') === '1');
  });

  /* Wrap, don't replace: the header button calls __openPhysics() with no
     argument and must keep getting the whole sheet. */
  var openPhysicsCore = window.__openPhysics;
  window.__openPhysics = function(opts){
    var brief = !!(opts && opts.brief);
    if(orient) orient.setAttribute('data-brief', brief ? '1' : '0');
    var artEl = $('phys-art');
    if(artEl) artEl.setAttribute('data-brief', brief ? '1' : '0');
    setFull(!brief, brief);
    openPhysicsCore();
    /* always land on the orientation block, whatever was scrolled to last time */
    try{ document.querySelector('.phys-body').scrollTop = 0; }catch(e){}
  };

  /* This listener is registered AFTER the welcome overlay's own (the layer is
     injected below it), so __setMode has already run by the time it fires. The
     short timeout lets the controls-guide tour finish staging before the sheet
     covers it. */
  try{
    Array.prototype.forEach.call(
      document.querySelectorAll('#welcome-overlay .welcome-mode'), function(btn){
        btn.addEventListener('click', function(){
          var mode = btn.getAttribute('data-mode');
          setTimeout(function(){
            try{ window.__openPhysics({ brief: !!BRIEF_MODES[mode] }); }catch(e){}
          }, 80);
        });
      });
  }catch(e){}

  /* ---- "Run these values" — PER-SIM, WRITE THIS YOURSELF ------------------
     It MUST NOT call window.__physicsHooks.scene(). That path begins with the
     sim's reveal function, which unlocks the staged apparatus the inquiry deck
     asks the student to discover (and usually resets the sliders too). Push the
     sliders directly and close; nothing else.

       pushToSim(<mainSliderVarA>, <curA>());
       pushToSim(<mainSliderVarB>, <curB>());
       closePhys(<true if the sim should run, false to land paused>);

     The <mainSliderVar> and <cur*> names are whatever the layer's live-panel
     block already declared for this sim — reuse them, do not redeclare.
     Worked examples for all three finished sims: references/precedents.md. */
  try{
    var runBtn = $('phys-run');
    if(runBtn) runBtn.addEventListener('click', function(){
      /* TODO per sim */
      closePhys(true);
    });
  }catch(e){}
