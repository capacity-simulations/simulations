# Hazards

Every entry here is a bug that already happened. Read before patching a new sim.

---

## H1 · The `.seesim` buttons are spoilers (the big one)

`window.__physicsHooks.scene()` begins with the sim's reveal function, which unlocks the
whole staged apparatus at once. See the table in SKILL.md.

**Prevention.** In Guided Inquiry the chapters stay collapsed (that hides every `.seesim`),
and `Run these values` uses its own path:

```js
pushToSim(mainSliderA, curA());
pushToSim(mainSliderB, curB());
closePhys(true);        // or false to land paused
```

**Test.** `stagingHidden` / `stagingLabels` in `orient.json` assert the proxy nodes are
still hidden *after close* **and** *after Run*. Without the second check a Run that leaks
would pass.

---

## H2 · The kicker is inside the modal and it spoils

All three sims shipped a kicker that gave something away:

| sim | old kicker tail | why it leaks |
|---|---|---|
| conical | "one angle, one speed, one **conserved number**" | card 4 asks *which* component is conserved |
| topple | "**one comparison decides it**" | card 4 asks *what* comparison decides it |
| wheel | "**what the strike keeps, and what it costs**" | cards 1 and 3 |

All reworded to `<topic> · what it is about, the physics behind it, and what every control
does`.

**The deeper bug was in the test**: the first spoiler scan walked `#phys-art` only, and the
kicker lives in `.phys-head`. It passed vacuously. The scan now walks `.phys-modal`, and
each old phrase is in that sim's `spoilers` list so a regression is caught.

**Prevention.** After widening a scan, prove it is not vacuous — assert it *reaches* the
text you expect it to police.

---

## H3 · The download clone inherits brief state

`$('phys-art').cloneNode(true)` copies `#phys-full[hidden]` and `data-brief="1"`, so a
sheet saved from a guided-inquiry open had its seven chapters invisible and the worked run
suppressed. Patch step 6 strips both and removes `#phys-run` from the clone. Do not drop
that edit.

---

## H4 · Play may be gated

`setPlaying()` carries `if (p && playLocked) return;`. In the three done sims `playLocked`
is `false` and `setPlayLocked(true)` is never called, so Run works. **Preflight prints
both** — if a sim really gates play behind a committed prediction, a Run button in inquiry
mode will silently do nothing. Drop it there and explain the gate instead.

---

## H5 · Concurrent editors

Another session edits these files. Observed: `cm-slide-or-topple` had a Physics sheet in
`~/Downloads` but **none** in the repo; a `Forces` control appeared in
`cm-conical-pendulum` seven minutes after it was patched, which changed the controls table
from 6 rows to 7 and failed the test.

**Prevention.** Patch in place, never rebuild a repo file from a kit. Re-run preflight
before touching a file you last saw a while ago. If a row count fails, check whether the
sim genuinely gained a control before "fixing" the test. Roll back with
`unpatch_orientation.py` — a true inverse — never by restoring a snapshot, which would
destroy the other session's work.

---

## H6 · An existing figure cannot be the apparatus map

Every figure in every sheet carries an answer: conical `d1` prints `v_c = 1.6820`, topple
`d1`/`d3` print the threshold angles and the verdicts, wheel `d1`/`d2` print the ledger.
`d0` must be drawn fresh.

---

## H7 · Anchors that are conical-shaped

The first patcher asserted `'phys-speed-v' in live` — a conical-only id — and aborted on
topple, whose live panel has `phys-mu-v`. It aborted **before writing**, which is the point.
The guard is now "exactly one `#phys-live`, at least one `.mv`".

**Prevention.** When an assert fires on a new sim, ask whether it encodes something
universal or something you only saw once. Generalise it; never delete it.

---

## H8 · `evaluate(page, fn, arg)` takes ONE argument

`cdp.mjs` serialises a single argument. Passing three silently yields `undefined` for the
rest, which looked like four product failures on the first run. Pass one object.

---

## H9 · MutationObserver timing in theme checks

The layer's theme repair is a `MutationObserver`, so `data-theme` → body class lands a tick
later. Reading the class synchronously fails. Await ~120 ms.

---

## H10 · Build witnesses left in the repo

`build_layer.py` writes `<sim>.prelayer.html` next to the sim — a 378 KB file that must not
ship. Move it into the workdir after installing a layer. (Checked in, once.)
