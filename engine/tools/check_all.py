#!/usr/bin/env python3
"""Folder-level engine-sim checker (plan M7a).

Usage:
    python3 engine/tools/check_all.py <folder> [--engine-only] [--list-only]

For every .html under <folder> (recursive):
  - no #engine-manifest block  -> "legacy" (hidden with --engine-only)
  - manifest present           -> print the engine version from the build stamp,
                                  then run verify.mjs (skipped with --list-only)
                                  and print PASS/FAIL.

Ends with a summary table; exits nonzero if any engine sim failed.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ENGINE_ROOT = Path(__file__).resolve().parent.parent
VERIFY = ENGINE_ROOT / "tools" / "verify.mjs"

MANIFEST_RE = re.compile(
    r'<script[^>]*id="engine-manifest"[^>]*>(.*?)</script>', re.S)
STAMP_RE = re.compile(
    r'/\* engine v(\S+) \| modules: .* \| built \S+ \| sha ([0-9a-f]{12}) \*/')


def engine_version(html, manifest):
    """Engine version from the build stamp (manifest.build first, then the
    stamp comment in the ENGINE block); 'unbuilt' when neither exists."""
    if isinstance(manifest, dict):
        build = manifest.get("build")
        if isinstance(build, dict) and build.get("engineVersion"):
            return str(build["engineVersion"])
    m = STAMP_RE.search(html)
    return m.group(1) if m else "unbuilt"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("folder")
    ap.add_argument("--engine-only", action="store_true",
                    help="hide legacy (manifest-less) sims from the listing")
    ap.add_argument("--list-only", action="store_true",
                    help="classify and print versions only; do not run verify.mjs")
    args = ap.parse_args()

    root = Path(args.folder)
    if not root.is_dir():
        print(f"check_all.py: ERROR: no such folder: {root}", file=sys.stderr)
        sys.exit(2)

    files = sorted(p for p in root.rglob("*.html") if p.is_file())
    if not files:
        print(f"check_all.py: no .html files under {root}")
        sys.exit(0)

    rows = []  # (relpath, kind, version, status)
    for p in files:
        rel = p.relative_to(root).as_posix()
        html = p.read_text(errors="replace")
        mm = MANIFEST_RE.search(html)
        if not mm:
            if not args.engine_only:
                rows.append((rel, "legacy", "-", "-"))
                print(f"{rel}: legacy")
            continue
        try:
            manifest = json.loads(mm.group(1))
        except json.JSONDecodeError:
            manifest = None
        version = engine_version(html, manifest)
        if args.list_only:
            rows.append((rel, "engine", version, "-"))
            print(f"{rel}: engine v{version}")
            continue
        proc = subprocess.run(
            ["node", str(VERIFY), str(p)],
            capture_output=True, text=True)
        status = "PASS" if proc.returncode == 0 else "FAIL"
        rows.append((rel, "engine", version, status))
        print(f"{rel}: engine v{version} ... {status}")
        if status == "FAIL":
            detail = (proc.stdout + proc.stderr).strip()
            for line in detail.splitlines():
                print(f"    | {line}")

    engine_rows = [r for r in rows if r[1] == "engine"]
    legacy_n = sum(1 for r in rows if r[1] == "legacy")
    failed = [r for r in engine_rows if r[3] == "FAIL"]

    print("\n=== summary ===")
    if rows:
        w = max(len(r[0]) for r in rows) + 2
        print(f"{'sim'.ljust(w)}{'kind'.ljust(8)}{'engine'.ljust(12)}status")
        for rel, kind, version, status in rows:
            print(f"{rel.ljust(w)}{kind.ljust(8)}{version.ljust(12)}{status}")
    checked = "listed" if args.list_only else "verified"
    print(f"\n{len(engine_rows)} engine sim(s) {checked}, "
          f"{legacy_n} legacy, {len(failed)} failed")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
