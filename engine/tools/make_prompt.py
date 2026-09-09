#!/usr/bin/env python3
"""Generation-context assembler — the leakage firewall.

Assembles the ONLY context an LLM sees when authoring a sim: preamble, the
pre-filled manifest, and the doc cards of the human-selected modules (plus
their transitive deps). Nothing else from the engine enters the prompt, so a
quantum sim never sees mechanics vocabulary and vice versa.

Usage:
    python3 engine/tools/make_prompt.py --spec <brief.md> --sim-id <course/slug>
        --modules <comma-list> [--params <params.json>] [--out <file>]
        [--max-card-tokens N]

Design decisions:
  - Module selection is a HUMAN decision. Unknown names are a hard error and
    there is deliberately NO include-all flag.
  - Dependency resolution IMPORTS build.py's resolve_modules (not a copy), so
    the card order in the prompt is byte-for-byte the module order build.py
    will inline — one resolver, no drift.
  - The cross-domain bridge card is appended when modules from more than one
    domain FAMILY (domains/<family>/) are resolved: domain.relativity +
    domain.relativity-diagram is one family (no bridge); mechanics + quantum
    is two (bridge). The firewall guards physics domains, not file counts.
  - Token accounting (chars/4) covers everything EXCEPT the author's spec;
    hard fail above --max-card-tokens (default 8000) naming the biggest cards.
"""

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build import resolve_modules  # noqa: E402  (one resolver, no drift)

ENGINE_ROOT = Path(__file__).resolve().parent.parent
CARDS = ENGINE_ROOT / "cards"
SIM_ID_RE = re.compile(r"^[a-z0-9-]+/[a-z0-9-]+$")
DEFAULT_MAX_CARD_TOKENS = 8000


def die(msg):
    print(f"make_prompt.py: ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def warn(msg):
    print(f"make_prompt.py: WARNING: {msg}", file=sys.stderr)


def info(msg):
    print(f"make_prompt.py: {msg}", file=sys.stderr)


def tokens(text):
    return len(text) / 4


def domain_family(entry):
    """domains/<family>/... -> <family>; None for non-domain modules."""
    if entry.get("layer") != "domain":
        return None
    parts = Path(entry["file"]).parts
    return parts[1] if len(parts) >= 2 and parts[0] == "domains" else parts[0]


def load_card(rel_path):
    p = ENGINE_ROOT / rel_path
    if not p.exists():
        die(f"missing card file: {rel_path}")
    return p.read_text().strip()


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--spec", required=True, help="author's pedagogical brief (md)")
    ap.add_argument("--sim-id", required=True, help="sim id as <course>/<slug>")
    ap.add_argument("--modules", required=True,
                    help="comma-separated module names (human-selected)")
    ap.add_argument("--params", help="JSON file with the manifest params array")
    ap.add_argument("--out", help="output file (default: stdout)")
    ap.add_argument("--max-card-tokens", type=float, default=DEFAULT_MAX_CARD_TOKENS,
                    help="hard ceiling on card tokens excluding the spec "
                         f"(default {DEFAULT_MAX_CARD_TOKENS})")
    args = ap.parse_args()

    spec_path = Path(args.spec)
    if not spec_path.exists():
        die(f"no such spec file: {spec_path}")
    if not SIM_ID_RE.match(args.sim_id):
        die(f"sim id '{args.sim_id}' must match <course>/<slug> "
            "(lowercase letters, digits, hyphens)")

    registry = json.loads((ENGINE_ROOT / "registry.json").read_text())
    known = registry["modules"]

    requested = [m.strip() for m in args.modules.split(",") if m.strip()]
    if not requested:
        die("--modules is empty")
    unknown = [m for m in requested if m not in known]
    if unknown:
        die(f"unknown module name(s): {unknown}\n"
            f"  known modules: {', '.join(sorted(known))}\n"
            "  (module selection is a human decision — there is no "
            "include-all flag by design)")

    if "verify.audit" not in requested:
        warn("verify.audit is mandatory — auto-added to the manifest")
        requested.append("verify.audit")

    params = []
    if args.params:
        ppath = Path(args.params)
        if not ppath.exists():
            die(f"no such params file: {ppath}")
        try:
            params = json.loads(ppath.read_text())
        except json.JSONDecodeError as e:
            die(f"params file is not valid JSON: {e}")
        if not isinstance(params, list):
            die("params file must contain a JSON array (the manifest params schema)")

    # Transitive deps + layer rules + stable topo order — build.py's resolver.
    resolved = resolve_modules(requested, registry)

    manifest = {
        "manifestVersion": 1,
        "sim": args.sim_id,
        "engine": registry["engineVersion"],
        "modules": resolved,
        "params": params,
        "build": None,
    }
    manifest_block = (
        '<script type="application/json" id="engine-manifest">\n'
        + json.dumps(manifest, indent=2)
        + "\n</script>"
    )

    non_domain = [m for m in resolved if known[m].get("layer") != "domain"]
    domain_mods = [m for m in resolved if known[m].get("layer") == "domain"]
    families = sorted({domain_family(known[m]) for m in domain_mods})

    # ---- fixed assembly order ----
    sections = []  # (label for budget report, text)
    sections.append(("cards/_preamble.md", load_card("cards/_preamble.md")))
    sections.append((
        "manifest",
        "## MANIFEST — copy this verbatim into <head>\n\n"
        "```html\n" + manifest_block + "\n```",
    ))
    for m in non_domain:
        sections.append((known[m]["card"],
                         f"## MODULE {m}\n\n{load_card(known[m]['card'])}"))
    for m in domain_mods:
        sections.append((known[m]["card"],
                         f"## MODULE {m}\n\n{load_card(known[m]['card'])}"))
    if len(families) > 1:
        info(f"multiple domain families manifested ({', '.join(families)}) — "
             "appending cards/_cross-domain.md")
        sections.append(("cards/_cross-domain.md", load_card("cards/_cross-domain.md")))
    if "shell" in resolved:
        sections.append(("cards/_shell-contract.md", load_card("cards/_shell-contract.md")))
    sections.append(("cards/_verify-contract.md", load_card("cards/_verify-contract.md")))

    card_text = "\n\n".join(text for _, text in sections)
    card_tokens = tokens(card_text)

    spec_text = spec_path.read_text().strip()
    prompt = card_text + "\n\n## YOUR TASK\n\n" + spec_text + "\n"

    info(f"assembled ~{card_tokens:.0f} card tokens "
         f"(+ ~{tokens(spec_text):.0f} spec tokens) for {len(resolved)} modules: "
         f"{', '.join(resolved)}")

    if card_tokens > args.max_card_tokens:
        biggest = sorted(sections, key=lambda s: -len(s[1]))[:5]
        listing = "\n".join(f"    ~{tokens(t):>5.0f} tokens  {label}"
                            for label, t in biggest)
        die(f"card tokens ~{card_tokens:.0f} exceed the ceiling "
            f"{args.max_card_tokens:.0f} (spec excluded).\n"
            f"  Biggest cards:\n{listing}\n"
            "  Trim cards or drop modules — do NOT raise the ceiling casually: "
            "an oversized prompt is how context leaks.")

    if args.out:
        Path(args.out).write_text(prompt)
        info(f"wrote {args.out}")
    else:
        sys.stdout.write(prompt)


if __name__ == "__main__":
    main()
