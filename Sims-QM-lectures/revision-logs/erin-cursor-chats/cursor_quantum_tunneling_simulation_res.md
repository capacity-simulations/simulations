# Quantum tunneling simulation restart conditions
_Exported on 4/13/2026 at 22:21:41 EDT from Cursor (2.6.21)_

---

**User**

At long times, the gaussian (on the lhs) starts to get wobbly. I think this is edge effects. Check what the current rules are for the sim to restart. Modify them slightly so the sim restarts sooner @Sims-QM-lectures/L09_Quantum_Tunneling_Gaussian_Wave.html 

---

**Cursor**

I’m checking the Gaussian tunneling file for the current auto-restart conditions, then I’ll tighten those thresholds so the packet resets before the boundary artifacts show up.

I found the auto-restart logic: it waits for a minimum travel time, then restarts if the run is too long, too much norm is absorbed, or too little probability remains visible. I’m nudging those cutoffs a bit earlier so the left-edge wobble gets cut off sooner without making the reset feel abrupt.

The thresholds are updated. I’m doing a quick sanity check for any new diagnostics in the edited file before I hand it back.

I adjusted the auto-restart logic in `Sims-QM-lectures/L09_Quantum_Tunneling_Gaussian_Wave.html` so it resets a bit earlier, which should cut off the late-time left-edge wobble sooner.

The sim previously waited for a minimum restart time of `max(40 fs, 1.2 * travelTime)` and then restarted if any of these happened: visible probability dropped below `2%`, absorbed probability exceeded `90%`, or total simulated time exceeded `200 fs`. I changed those to `max(36 fs, 1.1 * travelTime)`, visible probability below `3.5%`, absorbed probability above `85%`, and max time `180 fs`.

No linter errors were introduced. I didn’t run the animation in a browser here, so if you want, I can make one more pass after you preview it and tune the restart to be either a little earlier or a little less aggressive.

---

**User**

did you nudge them in the wrong direction? it seems like it went for longer

---

**Cursor**

I’m re-checking the restart logic against the actual edge-artifact behavior. The numbers I changed were all earlier on paper, so if it feels longer, the likely issue is that the current triggers are watching the wrong quantity rather than the wrong direction.

I see the issue now: the earlier edits made the existing thresholds more aggressive, but those thresholds only fire once the packet is mostly gone or absorbed. The wobble starts before that, so I’m switching the restart to look for probability piling up near the visible edges instead.

The first patch missed the exact local context, so I’m reading the nearby block and applying the same idea more precisely.

I’ve added a direct edge-band trigger now, which should behave much closer to what you meant by “restart sooner” than the old norm-based rules did. I’m doing a quick lint and spot-check on the exact block.

Not exactly the wrong direction numerically, but effectively the wrong trigger.

The first changes all pushed the old restart conditions earlier: lower max time, lower absorbed threshold, higher “visible probability is almost gone” threshold, and a shorter minimum wait. But those rules only fire after the packet is mostly gone or absorbed. Your wobble starts earlier, when the reflected Gaussian reaches the visible left edge, so the sim could still look like it was running too long.

I changed `Sims-QM-lectures/L09_Quantum_Tunneling_Gaussian_Wave.html` again so it now also restarts when enough probability enters a `1.5 nm` guard band near either visible edge. That should cut it off much closer to the onset of the boundary wobble instead of waiting for the packet to fully die away.

No linter issues were introduced. If it still feels late, the next two knobs to tighten are `AUTO_RESTART_EDGE_GUARD_WIDTH` and `AUTO_RESTART_EDGE_PROB_THRESHOLD`; I’d probably try `2.0` nm or `0.01` next.

---

**User**

now it restarts way too quick

---

**Cursor**

I see why: the new edge-band trigger is too eager. I’m narrowing it so it watches the left visible edge only, with a smaller band and a higher threshold, which should target the wobble without clipping the run so early.

I’m backing off that last change rather than undoing everything. The main fix is to stop treating either edge as a restart signal and only watch the left visible boundary, with gentler thresholds.

That backs the restart off substantially while still keeping the anti-wobble guard in place. I’m checking the edited block for any issues now.

I backed that last tweak off.

The new edge rule now only watches the left visible edge, not both edges, and it’s much less sensitive: the guard band is `1.0 nm` instead of `1.5 nm`, and it now waits for `4%` of the probability to reach that band instead of `1.5%`. That should stop the premature resets while still catching the left-side wobble before it gets too ugly.

I left the earlier general restart nudges in place for now. No linter issues were introduced. If this still feels a little early, the next mild step would be raising `AUTO_RESTART_EDGE_PROB_THRESHOLD` to `0.05` or `0.06` rather than removing the edge guard entirely.

---

**User**

undo the edge guard probability, it's too sensitive to get right

---

**Cursor**

I’m removing the edge-band restart logic and leaving the simpler time/absorption/visible-probability rules in place. After that I’ll do a quick lint check.

The patch missed the exact current text, so I’m reading the live block and removing only the edge-guard pieces from what’s actually in the file now.

I found the current block. I’m removing just the helper, constants, and restart condition tied to the edge guard, leaving the other restart thresholds untouched.

The edge-guard logic is out. I’m doing one final lint/readback check to make sure the restart block is clean.

I removed the edge guard entirely from `Sims-QM-lectures/L09_Quantum_Tunneling_Gaussian_Wave.html`.

The restart logic is back to the three simpler conditions only: minimum elapsed time, max simulation time, absorbed probability, and visible probability. No linter issues were introduced.

If you want, I can now tune just one of the remaining coarse knobs, most likely `MAX_SIMULATION_TIME`, since that’s the least finicky way to make it restart a bit sooner.

---

**User**

I changed the current vals way down -- this seems counter intuitive. What is happening? Are these working correctly?

@L09_Quantum_Tunneling_Gaussian_Wave.html (2045-2046) 

---

**Cursor**

I’m checking the exact restart conditions around those thresholds so I can tell you whether the behavior is genuinely counterintuitive or just the result of the way each quantity is defined.

Yes, they appear to be working correctly as written, but the comments next to them are now wrong, which is what makes this feel counterintuitive.

What the two thresholds mean in `L09_Quantum_Tunneling_Gaussian_Wave.html`:

- `AUTO_RESTART_ABSORBED_THRESHOLD` checks `totalAbsorbed > threshold`. `totalAbsorbed` starts near `0` and only goes up, so lowering this number makes the sim restart sooner.
- `AUTO_RESTART_PROB_THRESHOLD` checks `visibleProb < threshold`. `visibleProb` starts near `1` and goes down, so raising this number makes the sim restart sooner.

So with your current values:

- `AUTO_RESTART_ABSORBED_THRESHOLD = 0.15` means restart once about 15% has been absorbed. That is much earlier than the old comment’s “85%”.
- `AUTO_RESTART_PROB_THRESHOLD = 0.15` means restart once the visible window contains less than 15% of the probability. That is also much earlier than the old comment’s “3.5%”.

The comments are stale:
- `0.15` is not “below 3.5%”
- `0.15` is not “85% absorbed”

Also, these conditions are combined with `OR`, after the minimum wait time:
- max time exceeded, or
- enough absorbed, or
- little enough still visible

So whichever one trips first causes the reset.

Short version: the logic is probably fine, but the comments are misleading, and the two thresholds have opposite “direction intuition” because one quantity grows and the other shrinks. If you want, I can update the comments so they match the current values and rewrite them to make the semantics obvious.

---

**User**

the comments are fine, I don't care -- The thing I'm confused about -- are the two metrics not just opposites of each other? How do they differ?

---

**Cursor**

No, they are not opposites.

They differ in two important ways:

- `visibleProb` is an instantaneous snapshot.
  It measures how much probability is currently inside the plotted window, from `xMinDisplay` to `xMaxDisplay`.

- `totalAbsorbed` is a cumulative counter.
  It measures how much probability has ever been removed by the absorbing boundaries at the far edges of the full FFT domain.

So they answer different questions:

- `visibleProb`: “How much of the packet can I still see right now?”
- `totalAbsorbed`: “How much of the packet has already been eaten by the boundary absorbers over the whole run?”

Why they are not complements:

- There is probability outside the visible window but still not absorbed yet.
  The display only shows `-12` to `18` nm, but the simulation domain is much larger, and there are absorbing regions beyond the visible area.
- A packet can leave the visible region and spend time in the off-screen part of the domain before it gets absorbed.
- `absorbed` only increases.
- `visibleProb` can go up or down depending on where the packet is.

So at some moment you can have something like:

- `visibleProb = 0.10`
- `totalAbsorbed = 0.15`

That does not mean the missing `0.75` vanished. Much of it can simply be off-screen but still present in the domain.

If it helps, the rough bookkeeping is:

`full-domain live probability + totalAbsorbed ~= 1`

but

`visibleProb + totalAbsorbed != 1`

because `visibleProb` is only the on-screen subset of the live probability.

---

**User**

ok, which should I change to get rid of wobbles

---

**Cursor**

For the visible wobble, change `AUTO_RESTART_PROB_THRESHOLD`.

That is the knob most directly tied to “what’s still on screen.” If you want the sim to restart sooner, increase it. Higher means “restart while there is still more probability in the visible window,” so it cuts off before the late-time edge artifacts get obvious.

`AUTO_RESTART_ABSORBED_THRESHOLD` is a weaker knob for this purpose. It depends on the packet reaching the far absorbing layers of the full domain, so it lags behind what you actually see in the plot. It can help, but it is less directly connected to the wobble.

Practical guidance:
- Increase `AUTO_RESTART_PROB_THRESHOLD` to restart earlier.
- Decrease `MAX_SIMULATION_TIME` if you want a simple hard cap as a backup.
- Leave `AUTO_RESTART_ABSORBED_THRESHOLD` alone unless you specifically want the reset tied to boundary absorption.

If you want a starting point, try moving `AUTO_RESTART_PROB_THRESHOLD` upward gradually, not downward, for example from `0.15` to `0.20` or `0.25`. If that still does not catch the wobble soon enough, then the next thing to reduce is the minimum wait in `computeMinRestartTime()`.

---

**User**

update logs

---

**Cursor**

I’m updating the lecture revision log for the Gaussian tunneling sim to reflect the restart-threshold tuning and the final rollback of the edge-guard experiment.

I found the existing log file for this sim. I’m appending a short entry that records the restart-tuning work and notes that the edge-guard approach was tried and then removed because it was too sensitive.

The log entry is in place. I’m doing a quick readback to confirm the wording landed cleanly.

Updated `Sims-QM-lectures/revision-logs/L09_Quantum_Tunneling_Gaussian_Wave.md` with a new `04/09/26` entry covering the auto-restart tuning, the abandoned edge-guard experiment, and the conclusion that `visibleProb` is the main useful knob for suppressing the wobble.

No issues were introduced.

