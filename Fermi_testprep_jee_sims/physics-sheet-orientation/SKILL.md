---
name: physics-sheet-orientation
description: Make a JEE testprep sim (Fermi_testprep_jee_sims/**) explain itself. Prepends a "Start here" orientation block — learning objectives, a spoiler-free apparatus diagram, a table of every control, and the sim's own sliders with a Run button — to The Physics sheet, and makes that sheet open automatically when the student enters Guided Inquiry, Controls Guide or Free Exploration. In Guided Inquiry it opens in a brief, spoiler-safe form. Use when asked to "make the sim say what it is about", "add the orientation/start-here pop-up", "show the physics sheet on entry", to act on tutor feedback that a sim does not communicate its purpose, controls or physics, or to continue this rollout on more sims. Three sims are done (references/precedents.md); this skill reproduces them exactly. Additive only, fenced, and fully reversible.
---

# Physics-sheet orientation pop-up

A tutor's note started this: the sims **don't say what they are about** — what physics
they cover, what the controls do, what is being demonstrated. The Physics sheet already
answered all three; it was just opt-in behind a header button, and written as revision
*after* the fact rather than orientation *before* it.

So: a **"Start here"** block goes on top of the sheet, and the sheet **opens itself** on
entry to every mode. The student reads the framing, optionally sets the sliders and runs
it, closes, and lands in the mode they chose.

## The one thing that will bite you

**Every `▶ See it in the sim` button already in the sheet is a spoiler.** They all route
through `window.__physicsHooks.scene()`, which begins by calling the sim's reveal
function — and that function unlocks the staged apparatus in one go:

| sim | reveal function sets |
|---|---|
| cm-conical-pendulum | `revealVc, showL, showInset, conserved` — the v_c tick, the L vector, the inset, the "conserved" label |
| cm-slide-or-topple | `showSlide, showTopple, showWh` — both threshold curves and the w/h labels (and resets both sliders) |
| cm-wheel-step | `revealLvl = 99` — every row of the strike ledger |

Those are the answers the inquiry deck asks students to predict. The sims' own Info
modals call them *earned landmarks*. This is **already live** on every sim carrying the
layer — this skill contains it in Guided Inquiry, it does not fix it fleet-wide.

Three consequences, all non-negotiable:

1. In Guided Inquiry the chapters stay **collapsed**, which puts every `.seesim` button
   out of reach.
2. `▶ Run these values` gets its **own slider-only path**. It must never call
   `__physicsHooks.scene()`.
3. Nothing you write in the orientation block may state a card's answer — including the
   diagram and the sheet **kicker** (all three kickers had to be reworded; see hazards).

## Procedure

Work **one sim at a time**. Never batch.

### 1 · Preflight — read-only, always

```sh
python3 scripts/preflight.py <sim.html> --emit <workdir>
```

It reports the layer state, checks all six patch anchors occur exactly once, extracts the
reveal function and names candidate DOM proxies, lists the sliders, prints the
controls-guide wording, and flags the play gate. Exit 0 = ready, 2 = blocked, 3 = already
patched. **If it says blocked, stop and fix that first.**

*No Physics layer yet?* Install it before anything else — `physics-sheet-upgrade` for a
fresh sheet, or `build_layer.py` from the CM3 kit for a foundry sim with an intact
`<!-- PHYSICS_SHEET -->` marker. `cm-slide-or-topple` needed this; its Downloads copy had
a sheet while the repo copy did not. Then re-run preflight.

### 2 · Read the inquiry deck

Open every `.inq-step` card and write down what each one asks the student to predict.
That list *is* your spoiler list. You cannot write safe objectives without it.

### 3 · Author the `d0` apparatus map

A new, **spoiler-free** diagram added to that sim's `spec.py`, rendered with the
`physics-sheet-upgrade` `gen_assets.py`. It names the parts and says which slider moves
which one — no forces, no thresholds, no verdicts, no numbers a card asks for. An
existing figure will **not** do: every one of them carries an answer on its face.

Rasterise it and **look at it**. Every layout bug in the four maps built so far — wrong
hinge end, callouts stacked on each other, labels inside the wheel — was found by
looking, not by any check. See `references/content.md`.

### 4 · Write the orientation block

Copy `assets/orient.example.html` (the conical sim, the calibration example) into your
workdir as `orient.html` and rewrite the four sections for this topic. Copy
`assets/orient.css` unchanged. Copy `assets/orient.template.js` as `orient.js` and write
only the Run body — the template marks the slot and states the rule. Format and voice:
`references/content.md`.

### 5 · Patch

```sh
python3 scripts/patch_orientation.py <workdir> <sim.html>
```

All-assert-then-write: a drifted anchor aborts with the file untouched. Every insertion
is fenced in `ORIENT:BEGIN/END` sentinels.

Rollback at any point, and it is a true inverse — other people's later edits survive:

```sh
python3 scripts/unpatch_orientation.py <sim.html>
```

### 6 · Verify — all five gates, in this order

```sh
SK=Fermi_testprep_jee_sims/physics-sheet-orientation      # this skill
PS=User_version_sims_skills/physics-sheet-upgrade         # the sheet skill

node    $SK/scripts/syntax.mjs       <sim.html>                          # 1 every block parses
node    $SK/scripts/orient_test.mjs  <sim.html> <workdir>/orient.json    # 2 orientation + spoilers
node    <cm3-kit>/runtime_test.mjs   <sim.html> <workdir>/rt.json        # 3 the sheet, unregressed
python3 $PS/scripts/verify_build.py  <sim.html> --foundry                # 4 layer integrity
```

5 · **Screenshots** of the brief view, the controls table and the toggle bar, in both
themes. Gates 1–4 cannot see a collision or an unreadable diagram.

Gate 3 needs the existing per-sim `rt.json` from the CM3 kit, with `nsvg` raised by one
for the new `d0`. If a sim has no `rt.json`, gates 1, 2 and 4 plus screenshots are still
the minimum.

`orient_test.mjs` is config-driven — see `references/precedents.md` for the three working
`orient.json` files. It asserts the three-mode auto-open, the full spoiler contract, that
the staging flags are *still* locked after close **and** after Run, the header button, and
the collapse toggle.

**Verify the verifier.** Run `orient_test.mjs` against the pre-patch snapshot; it must
fail loudly. A suite that passes on an unpatched file is testing nothing.

### 7 · Record

Append the sim to `references/precedents.md`: its config, its reveal function, its DOM
proxies, and anything that surprised you.

## Hard rules

- **Additive only.** The sim's physics, inquiry deck, controls guide, welcome overlay and
  canvas code are never edited. The whole feature lives in the Physics layer, which is
  why it ports. The single relocation is `#phys-live`, and it moves within the sheet.
- **Never weaken an assert** to make a patch apply. A failing anchor means the file is not
  the shape this was written for.
- **Never rebuild a repo file from a build kit.** These sims are edited concurrently by
  other sessions; the repo copy is routinely ahead of the kit. Patch in place. (A second
  session added a `Forces` control to cm-conical-pendulum seven minutes after it was
  patched.)
- **Re-run preflight if you have been away from a file.** It is cheap, and it catches the
  drift that would otherwise abort a patch mid-rollout.
- One sim per pass, every gate green, before starting the next.
- No git operations unless explicitly asked.

## Making it invocable

The skill lives here because that is where it was asked for. To have it offered
automatically, symlink it into the repo's skill directory:

```sh
ln -s ../../Fermi_testprep_jee_sims/physics-sheet-orientation \
      .claude/skills/physics-sheet-orientation
```

Everything runs standalone either way — `scripts/cdp.mjs` and `scripts/syntax.mjs` are
vendored, and the Chrome binary is resolved at run time (`CHROME_BIN`, then the newest
puppeteer cache build, then system installs).

## Self-test

The round-trip is the guarantee that this cannot break a sim:

```sh
cp <sim.html> /tmp/rt.html
python3 scripts/patch_orientation.py <workdir> /tmp/rt.html
python3 scripts/unpatch_orientation.py /tmp/rt.html
cmp <sim.html> /tmp/rt.html && echo "byte-identical"
```

Verified byte-identical on `cm-wheel-step`. Also verified: a second patch attempt aborts
and leaves the file untouched; preflight exits 3 on an already-patched file; unpatch
refuses a file that has an orientation block but no sentinels.

## What "done" looks like

Auto-open in all three modes, landing at the top of the orientation block · brief +
collapsed in Guided Inquiry with no spoiler string and no reachable `.seesim` · Run
pushes the sliders and leaves the staging untouched · the header ⚛︎ button still opens
the full sheet · the downloaded sheet is still complete · every pre-existing gate still
green.
