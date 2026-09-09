#!/usr/bin/env python3
"""Card lint: every registry module's CARD.md must match its code and budget.

Checks, per module in registry.json:
  1. Card file exists and has the mandatory sections:
     API, VOCABULARY, USAGE, NEGATIVE CONSTRAINTS
  2. Every symbol exported by the module source appears in the card's API section,
     and every API bullet names a real exported symbol (no drift, either direction).
  3. Token budget (chars/4 heuristic): default 1200; override per-module with
     "cardBudget" in the registry entry.
  4. Domain-layer cards: the NEGATIVE CONSTRAINTS section must carry at least
     3 bullet lines (the firewall's teeth are the constraints).

Plus the four generation-contract cards in engine/cards/ (not modules —
assembled into every prompt by make_prompt.py): must exist and fit budgets
(_preamble 400, _shell-contract 800, _verify-contract 400, _cross-domain 350).

Exit nonzero on any failure — run in the same gate as tests.
"""

import json
import re
import sys
from pathlib import Path

ENGINE_ROOT = Path(__file__).resolve().parent.parent
SECTIONS = ["## API", "## VOCABULARY", "## USAGE", "## NEGATIVE CONSTRAINTS"]
EXPORT_RE = re.compile(
    r'^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)', re.M)
API_SYMBOL_RE = re.compile(r'^-\s*([A-Za-z_$][\w$]*)', re.M)
CONTRACT_CARDS = {
    "cards/_preamble.md": 400,
    "cards/_shell-contract.md": 800,
    "cards/_verify-contract.md": 400,
    "cards/_cross-domain.md": 350,
}
MIN_DOMAIN_CONSTRAINT_BULLETS = 3


def count_constraint_bullets(card):
    """Bullet lines ('- ...') under NEGATIVE CONSTRAINTS, up to the next '## '."""
    m = re.search(r'^## NEGATIVE CONSTRAINTS\b.*$', card, re.M)
    if not m:
        return 0
    section = card[m.end():].split("\n## ", 1)[0]
    return len(re.findall(r'^\s*-\s+\S', section, re.M))


def main():
    registry = json.loads((ENGINE_ROOT / "registry.json").read_text())
    failures = []

    for name, entry in registry["modules"].items():
        card_path = ENGINE_ROOT / entry["card"]
        src_path = ENGINE_ROOT / entry["file"]
        if not card_path.exists():
            failures.append(f"{name}: missing card {entry['card']}")
            continue
        card = card_path.read_text()

        for sec in SECTIONS:
            if not re.search(rf'^{re.escape(sec)}\b', card, re.M):
                failures.append(f"{name}: card missing mandatory section '{sec}'")

        budget = entry.get("cardBudget", 1200)
        tokens = len(card) / 4
        if tokens > budget:
            failures.append(f"{name}: card ~{tokens:.0f} tokens exceeds budget {budget}")

        exported = set(EXPORT_RE.findall(src_path.read_text()))
        api_section = card.split("## API", 1)[-1].split("## ", 1)[0]
        documented = set(API_SYMBOL_RE.findall(api_section))
        missing = exported - documented
        phantom = documented - exported
        if missing:
            failures.append(f"{name}: exported but not in card API: {sorted(missing)}")
        if phantom:
            failures.append(f"{name}: in card API but not exported: {sorted(phantom)}")

        if entry.get("layer") == "domain":
            n_bullets = count_constraint_bullets(card)
            if n_bullets < MIN_DOMAIN_CONSTRAINT_BULLETS:
                failures.append(
                    f"{name}: domain card has {n_bullets} NEGATIVE CONSTRAINTS "
                    f"bullet(s); needs >= {MIN_DOMAIN_CONSTRAINT_BULLETS}")

    for rel, budget in CONTRACT_CARDS.items():
        p = ENGINE_ROOT / rel
        if not p.exists():
            failures.append(f"contract card missing: {rel}")
            continue
        toks = len(p.read_text()) / 4
        if toks > budget:
            failures.append(f"{rel}: ~{toks:.0f} tokens exceeds budget {budget}")

    if failures:
        print("lint_cards: FAIL")
        for f in failures:
            print("  -", f)
        sys.exit(1)
    n = len(registry["modules"])
    print(f"lint_cards: OK ({n} module{'s' if n != 1 else ''} "
          f"+ {len(CONTRACT_CARDS)} contract cards)")


if __name__ == "__main__":
    main()
