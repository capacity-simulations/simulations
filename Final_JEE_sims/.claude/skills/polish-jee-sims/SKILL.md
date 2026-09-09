---
name: polish-jee-sims
description: Run the Engine-v2 polish stage over the JEE sims in Final_JEE_sims using Claude Code in the terminal at zero API cost — an orchestrator finds the unpolished batch, fans one review agent out per sim in parallel, then applies every edit through the same guard chain the paid API polish uses. Covers the full flow from a cold start: status, emit, parallel review, apply, verify. Triggers "polish the sims", "run polish", "polish module N", "next polish batch", "polish stage", "polish-batch".
---

# Polish the JEE sims — orchestrated, parallel, $0

The polish stage is **three critics (physics / pedagogy / visuals) then a fixer**,
run over a built simulation. Anthropic's API can do it for about **$2.60 a sim**.
This skill does the identical work — same prompts, same guard chain — through
Claude Code in the terminal for **$0**, and fans it across parallel agents.

## Read this first: the one thing that goes wrong

**The file on disk is not named after the sim.**

| | |
|---|---|
| Course sim name (what `--only` takes) | `ce-internal-resistance` |
| File on disk | `Module-10-Current-Electricity/C160-emf-internal-resistance-and-terminal-voltage.html` |

The course's `filedPath(base)` holds that mapping and `polish-batch` resolves
through it. All 78 `jee-physics` sims have one.

So: **`--outdir` is the TOP-LEVEL `Final_JEE_sims`, never a module folder, and
`--only` takes course names, never `C###-…` names.**

Point `--outdir` at a module folder and `course.sims()` matches nothing there,
`polish-batch` falls back to scanning the directory, finds the `C###` files,
resolves **no audit spec**, and polishes with `mode=auto` and the
**audit-regression guard inert**. It will look like it worked. One real
protection will be gone.

## Where things are

| | |
|---|---|
| Sims | `/Users/admin/Downloads/Final_JEE_sims` (14 `Module-*` folders, 76 of 78 built) |
| Pipeline repo | `/Users/admin/Downloads/capacity-studio-share` — **run all commands from here** |
| Course | `jee-physics` |
| Polished so far | 2 (`ce-internal-resistance`, `emi-motional-emf`) |

`OPENROUTER_KEY` must be set or `polish-batch` refuses to start — but **`--via=file`
spends nothing on it**. No LLM call is made; the key is only checked at boot.

```bash
cd /Users/admin/Downloads/capacity-studio-share
export OPENROUTER_KEY=$(grep '^VITE_OPENROUTER_KEY=' .env.local | cut -d= -f2)
export SIMS=/Users/admin/Downloads/Final_JEE_sims
```

---

## Step 0 — what is left

```bash
node studio-pipeline/polish-status.mjs --course jee-physics --outdir $SIMS
```

Reports built / polished / **PENDING**, grouped by module, and flags anything
`BLOCKED` (a refused build — **never polish one**) or lacking an audit spec.

Polished is read from `<file>.prepolish.html`, which `polish-batch` writes **only**
when an edit survived the guards. It cannot report a polish that did not happen.

Pick the batch — one module at a time, because a reviewer holding one module's
physics in their head reviews it better than five unrelated topics:

```bash
BATCH=$(node studio-pipeline/polish-status.mjs --course jee-physics --outdir $SIMS --next 5)
# or scope it:  --module Module-09 --next 5
echo $BATCH
```

**Start with 5.** Raise it only after a clean batch.

## Step 1 — emit the review bundles

```bash
node studio-pipeline/polish-batch.mjs --course jee-physics --outdir $SIMS \
  --only $BATCH --via=file --emit
```

Each sim gets its **own directory** `$SIMS/<base>.polish/` holding:

- `input.html` — the built sim, managed blocks stripped to empty markers
- `REVIEW.md` — the three critics' real system prompts plus the fixer's hard rules
- `meta.json`

Separate directories per sim is what makes the parallel step safe: no two agents
ever touch the same file.

Confirm the header of each says `spec` and a real mode (`mode=guided-inquiry`).
`no spec` or `mode=auto` means the naming trap above — stop and fix `--outdir`.

## Step 2 — fan out one agent per sim

Launch **one agent per sim, in a single message** so they run concurrently. Give
each agent exactly one sim and one directory. Prompt each with:

> You are running the polish stage for ONE simulation.
>
> Directory: `$SIMS/<base>.polish/`
>
> 1. Read `REVIEW.md` **in full**. It contains four roles — `[physics]`,
>    `[pedagogy]`, `[visuals]`, `[fixer]` — with their real acceptance principles.
> 2. Read `input.html` completely before judging anything.
> 3. Play the three reviewer roles in order, then the fixer. Each reviewer reports
>    only against its own principles; "NO FINDINGS" is a normal, good result.
> 4. Write the COMPLETE revised document to `output.html` in that same directory —
>    starting `<!DOCTYPE html>`, ending `</html>`, no markdown fences.
> 5. The first thing inside `<body>` must be
>    `<!-- POLISH: [physics] … ; [pedagogy] … ; [visuals] … -->` summarising what
>    you changed and what you deliberately did not.
>
> HARD RULES, all enforced downstream — breaking one discards your whole output:
> - Leave the first `<style>` block (shell CSS) **byte-identical**.
> - Leave `engine-manifest`, `engine-inline` and `shell-runtime` markers exactly
>   as received; they are re-filled from source after you return.
> - Never disable, pause or gate Play / Reset / the sim's motion, and never gate
>   the sim callbacks on a "has the student answered" flag.
> - Do not ADD panels, buttons, sliders, readouts, plots or inquiry steps.
>   Polish refines; it does not extend.
> - A removal needs evidence: identify the element exactly, and state the search
>   that found nothing referencing it. When unsure, KEEP it.
> - If every reviewer finds nothing, copy `input.html` to `output.html` unchanged
>   and say so.
>
> Report back: the sim name, findings per role, and what you changed.

**If you are the agent and you are not sure whether a finding is in scope, it is
not.** The fixer section of `REVIEW.md` is the authority; re-read it rather than
guessing.

## Step 3 — apply, through the guards

One run for the whole batch. Concurrency 2 is the default and is right — `--apply`
drives a real browser per sim.

```bash
node studio-pipeline/polish-batch.mjs --course jee-physics --outdir $SIMS \
  --only $BATCH --via=file --apply
```

`--apply` re-injects the shell and engine from source and runs the **same** chain
the API polish runs: shell integrity → de-gate → syntax → **audit regression** →
first paint → claim check. An edit that breaks any of them is **discarded** and
the original build ships unchanged. There is no way for a bad polish to survive,
which is why a bold fix costs nothing to attempt.

Expect: `POLISH DONE: 5/5 · N kept · M discarded by the guards`.

A discard is information, not a failure — read that sim's log at
`$SIMS/logs/<base>.polish.log` to see which guard rejected it.

## Step 4 — verify

```bash
node studio-pipeline/polish-status.mjs --course jee-physics --outdir $SIMS
```

PENDING must have dropped by the number kept. Each polished sim now has
`<file>.prepolish.html` beside it — the original, so every polish is reversible.

Then loop: Step 0 for the next batch.

---

## Guardrails

- **Never run `polish-batch` without `--via=file`.** The default is `--via=api`:
  four billed OpenRouter passes, ~$2.60 a sim. `--via=file` is the same work at $0.
- **Never point `--outdir` at a module folder.** See the naming trap above.
- **Never polish a `.BLOCKED.html` sim.** The pipeline refused that build; polishing
  it dresses up something already rejected.
- **One agent, one sim, one directory.** Two agents in one `.polish/` directory
  will overwrite each other's `output.html`.
- **`--only` is prefix-matching with exact-match priority.** `--only rot-rolling`
  also selects `rot-rolling-race` unless an exact match exists. Always pass the
  full comma-separated list from `polish-status --next`.

## Scaling past five

Raise the agent count only after a batch comes back with no discards **and** the
reviews read as substantive rather than rubber-stamped. The limits that actually
bind:

- `--apply` runs a real browser per sim; keep `--conc` at 2–3 regardless of how
  many agents reviewed.
- Agent count is bounded by review quality, not by the machine. Ten agents that
  each skim are worse than five that read the file.

## Related

`jee-sim-review` is a different skill: a deeper **review-only** audit (independent
physics oracle, browser-driven control sweeps, no edits without approval). Use it
when you want to *find* problems. Use this one to *apply* the standard polish.
