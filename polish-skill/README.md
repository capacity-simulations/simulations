# polish-skill (Cursor)

The sim-foundry polish pass, packaged for Cursor. Protocol: `SKILL.md` (skill) or `polish.mdc` (the same content as a Cursor rule).

## Install (once)
1. Skill: copy this folder to `~/.cursor/skills/polish-skill/` (or a project's `.cursor/skills/`).
2. Rule (optional, same content): copy `polish.mdc` to `/Users/admin/Downloads/sim-foundry/.cursor/rules/polish.mdc`.
3. Subagents: copy `agents/*.md` to `~/.cursor/agents/` (physics-critic, pedagogy-critic, visuals-critic, polish-fixer, skill-slot-author).
4. Open `/Users/admin/Downloads/sim-foundry` in Cursor (needs node, python3, Google Chrome; the repo's node_modules provide puppeteer-core and jsdom).

## Model
Run the orchestrator AND every subagent on the strongest model available in Cursor (Claude Opus-class, high reasoning), the class the Claude Code polish ran on. A weaker model finds fewer defects and makes riskier fixes.

## Use
"Polish th-demagnetisation, th-carnot-cycle" → the agent follows SKILL.md steps 0–8 and files each result in `simulations-1/AI courses sims/polish/<course>/` with a POLISH-LOG row.

## Contents
- `templates/STANDING-RULINGS.md`: 32 binding owner/SME rules (sealed deck, frozen layers, layout law, …)
- `templates/ADDENDUM-TEMPLATE.md`: the orchestrator addendum appended to each critic brief
- `templates/RULINGS-TEMPLATE.md`: the fixer's binding rulings, with a real worked example
- `scripts/gates.sh`: the 9 gates · `deck-diff.mjs`: sealed-deck check · `shots.mjs`: screenshot set
  · `merge-findings.py` · `css-ban-scan.sh` · `gate-count.py` · `deliver.sh`

No API calls, no commits. Critic and fixer prompts come from the repo's `tools/polish-prompts.mjs`, so they stay in sync with the pipeline.
