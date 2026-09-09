# MODULE shell.hide-text  (v1.0)
DEPENDS: (none; pairs with the shell DOM contract)
NAMESPACE: Engine.hideText

## API
- initHideText() -> HT predicate — wires the #ht-toggle checkbox to the
    #shell.hide-text root class, publishes window.HT, and (two rAFs after
    boot) defaults the checkbox to the current lecture-mode state. Safe when
    #shell or #ht-toggle is absent: no wiring, and the returned predicate just
    reads the live #shell class (always false with no #shell). Toggling
    dispatches a window resize so canvases redraw even while paused.

## VOCABULARY
hide text, simplify display, registry, DOM item, canvas item, predicate.

## USAGE
    Engine.hideText.initHideText();
    // DOM items:    class="ht-hide" + CSS  #shell.hide-text .ht-hide{display:none;}
    // Canvas items: if(!window.HT()){ drawLabel(...); }
    // Keep a HIDE-TEXT REGISTRY comment in the sim HTML listing every
    // registered item (see the module header for the canonical block).

## NEGATIVE CONSTRAINTS — read before writing any code
- Never delete or blank text to "hide" it — gate DOM via .ht-hide, canvas via
  if(!window.HT()); the Hide Text checkbox must restore everything exactly.
- The hide container ships EMPTY at install — items are registered only when
  explicitly requested.
- Do not cache window.HT()'s value across frames — evaluate at draw time.
