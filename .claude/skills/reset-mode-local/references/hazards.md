# Hazard ledger — every failure hit during the 34-sim rollout

Check each against your sim. Apply a fix ONLY when the oracle shows the
symptom; otherwise leave the sim alone.

## H1 — Mode switch (the core bug; every sim has it before the fix)
Symptom: reset lands in Guided Inquiry regardless of mode.
Fix: the shape template (wiring-shapes.md). That's the whole rollout.

## H2 — Boot-play parity
Symptom: oracle `playing` diff in free/CG (usually fresh=False, after=True).
Cause: reset path hardcodes/derives `setPlaying(true)` but the sim boots
paused. Boot state may be per-mode asymmetric — trust the oracle's fresh
snapshots, not intuition.
Fix: Shape A → cfg `resumeOnReset:'pause'`. Shape B/C → flip the listener's
boolean. NEVER fix with a timeout: wu-experiment already had a 0ms re-pause
timeout and it LOST the race — pause synchronously. (Precedents: sc-ising,
L12 twin, wu, feynman-sandbox, rabi, walker, the four timeless CMat sims.)

## H3 — Stale-step restaging
Symptom: mid-deck GI reset needs TWO clicks, or lands card 1 with the
departed card's scene/play state.
Cause: `__fullReset` resumes GI (`setGi(true)` → `__giResume` →
`onStep(<old step>)`) BEFORE showing card 1, so the departed card restages
itself over the fresh state.
Fix (QM, Shape D): insert `inqStep = 0;` before `setGi(true)`.
Fix (v2 shell): move `Shell.inqShow(0)` BEFORE `setGi(true)`.
(Precedents: infinite-potential-well, Double-slit, cm-bloch-oscillations.)
Sims whose card-1 staging is unconditional self-heal and need nothing
(sc-ising, build-a-baryon) — only fix when the oracle shows it.

## H4 — Accumulated visible state (libraries, counters, discovered lists)
Symptom: post-reset shows entries (library chips, recorded points, ghost
tags) that a fresh entry lacks — or the opposite: reset wipes an entry the
default view is supposed to show.
Cause: onReset clears then REPLAYS step staging (repopulating), or clears
without re-admitting what the default scene stages, or the GI restart runs
after onReset's resync re-admitted the departed card's item.
Fix (build-a-baryon precedent, in onReset): clear AFTER the step replay;
then re-admit ONLY the build standing on the stage (`state.resolved`); if GI
still leaks the departed card's item, expose a tiny `window.__libReset`
(clear + re-admit staged) and call it in the uv GI branch AFTER __fullReset.

## H5 — onReset resyncs to the ACTIVE card, but free/CG default differs
Symptom: free and/or CG reset lands card-0's scene (e.g. kT=0.10, electron
selected) where a fresh free/CG entry shows the onComplete view (kT=0.25,
Higgs, ladder off).
Cause: onReset ends with `onStep(Shell.step)` (the SYS-2 resync), which is
right for GI but wrong for free/CG whose opening is staged by __freeExplore.
Fix: in the uv hook, call `window.__freeExplore()` in the free branch — and
in the CG branch BEFORE `__cgPrepare()/cgShow(0)` when the CG opening also
uses it (mirror what `setCg(true)` itself runs on entry).
(Precedents: kronig-penney free-only; dirac-s-sea and
exploring-the-standard-model in both branches; feynman-sandbox free.)

## H6 — Free mode stages its own scene
Same fix as H5's free branch; listed separately because it occurs even when
onReset has no resync — whenever fresh free entry runs __freeExplore with
scene side-effects. Detect via the oracle, not by reading code.

## H7 — Per-sim "settings survive, run restarts" design (ACCEPTED, not a bug)
Symptom: slider/select values persist through reset in every mode, and the
sim's `onReset`/`resetState` READS the controls
(`parseFloat($('x').value)`) instead of writing them — sometimes with a
caption like "Applies before a run starts (or on next ↻ Reset)".
Ruling (user-approved on Galperin): the sim's documented semantics win.
Keep it; report the diff as accepted, citing the precedent.
(Precedents: Galperins_Billiard, cm-bloch, cm-phonon, sm-energy-sharing,
L12 twin's beta/tc sliders. Also accepted: shell speed select persists
fleet-wide; collider's intra-cycle animation clock phase; A(k)'s mirror
sliders inside the CLOSED Physics popup, resynced on open; hidden inquiry
done-dots caused by the oracle's own dirty gesture under gi-off.)

## H7b — s1 noise the oracle now classifies FOR you (do not hand-justify)
Two `s1` diff sources are NOT per-sim design and need no H7 ruling, because
the shipped oracle now handles them automatically:
 * **Physics-sheet mirror sliders** (`id="phys-*"`) — they live inside the
   CLOSED revision sheet and resync on open. The oracle skips them when
   choosing the probe (A(k)-vs-k-plot precedent). If a sim's ONLY ranges are
   `phys-*`, `s1` reads None — that is correct, not a failure.
 * **Live-animated controls** — sliders the sim drives itself (a rotating
   angle, a sweep). Their reading is an arbitrary sampling phase, exactly like
   virtual-particle-collider's `__vc.S.cy`. The oracle samples twice before
   snapshotting and, if the value moves on its own, exempts `s1` and prints
   `[s1 auto-exempt: sim animates it]`.
Consequence: an `s1` diff that SURVIVES the hardened oracle is a real static
control, so it needs a genuine H7 ruling — check that `onReset`/`resetState`
READS it (and that no reset path writes it back) before accepting.
(Found on SR batch 1: L03-s1 and L04-s1 animate their angle slider; L05-s2 has
only phys-* ranges; L00-s1 is the genuine H7 case — nothing writes slider-v
outside the Physics scene hook.)

## H9 — Fresh entry itself inherits boot card-staging (accept; log separately)
Symptom: free/CG reset restores the sim's DOM default, but the oracle's
fresh-entry snapshot shows a DIFFERENT value, so the diff looks like a reset
bug when reset is the CORRECT side.
Cause: the page boots by staging inquiry card 0 (`inqShow(0)` -> `onStep(0)`,
which pins controls), and the mode entry (`__freeExplore`) does not re-stage
that control — so choosing Free Exploration inherits card 0's pinned value.
Meanwhile the sim's own reset listener restores its documented default.
Ruling: ACCEPT the diff. Do NOT add a setter to the reset branch to reproduce
the inherited value — that would encode a mode-entry quirk into the reset path
and make Reset worse. The H1 mode-local fix still applies and must pass on
mode/card/tour/play. Log the entry quirk as a SEPARATE finding for the human.
(Found on QM batch 3: Harmonic_Oscillator_High_Energies — fresh free/CG shows
n=1 from card-0 staging; btnReset sets `n = 40` under the comment "Restore
default simulation state from any current configuration"; `__freeExplore` is
only `applyStepReveals(99); setPlaying(true)` and never touches n.)

## H8 — Dead/broken pre-existing guards
Symptom: a boot-parity or reset guard that provably never runs (e.g.
feynman-sandbox tested `window.Shell` while `Shell` is a top-level const →
always undefined). Remove it ONLY when replacing it with the synchronous
equivalent, and say so in the report. Never leave a racing timeout in place.
