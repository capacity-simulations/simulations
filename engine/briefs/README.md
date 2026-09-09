# briefs/

The `example-tunneling*` files are ENGINE DOCUMENTATION: a reference brief
(+ params schema) and the prompt `tools/make_prompt.py` assembles from it.
Regenerate with:

    python3 tools/make_prompt.py --spec briefs/example-tunneling-brief.md \
      --sim-id qm/tunneling-example \
      --modules domain.quantum,shell,controls.bind,canvas.fit,verify.guard \
      --params briefs/params-example-tunneling.json \
      --out briefs/example-tunneling.prompt.md

Real pedagogical briefs
and generated prompts for production sims stay OUT of git per repo policy
(`_prompts/` and course briefs are gitignored) — do not add them here.
