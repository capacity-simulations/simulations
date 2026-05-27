#!/usr/bin/env python3
"""
Convert standalone simulation HTML files back to shared-CSS versions.

The standalone files created for Drive sharing contain the shared
simulation-design-system.css contents inside the first <style> block. This
script removes that inlined shared block and restores a stylesheet pointer,
while preserving each simulation's own page-specific CSS and JavaScript.

Example:
    python3 convert_standalone_to_css_versions.py \
        --source-dir ../new_sims \
        --output-dir . \
        --overwrite
"""

from __future__ import annotations

import argparse
from pathlib import Path


DEFAULT_LINK_HREF = "../simulation-design-system.css"
START_MARKER = (
    "<style>\n"
    "/* Shared simulation design system inlined so this HTML file works when "
    "downloaded standalone. */\n"
)
END_MARKER = "/* End shared simulation design system. */\n\n"


def convert_html(text: str, link_href: str) -> str:
    """Return HTML with the inlined shared CSS replaced by a link tag."""
    start = text.find(START_MARKER)
    if start == -1:
        raise ValueError("inlined shared CSS start marker was not found")

    css_body_start = start + len(START_MARKER)
    end = text.find(END_MARKER, css_body_start)
    if end == -1:
        raise ValueError("inlined shared CSS end marker was not found")

    replacement = f'<link rel="stylesheet" href="{link_href}">\n<style>\n'
    return text[:start] + replacement + text[end + len(END_MARKER) :]


def collect_sources(source_dir: Path, files: list[str]) -> list[Path]:
    if files:
        return [Path(file) if Path(file).is_absolute() else source_dir / file for file in files]
    return sorted(source_dir.glob("*.html"))


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Create CSS-dependent copies from standalone simulation HTML files."
    )
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path("../new_sims"),
        help="Directory containing standalone HTML files. Defaults to ../new_sims.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("."),
        help="Directory to write CSS-pointer versions. Defaults to this folder.",
    )
    parser.add_argument(
        "--link-href",
        default=DEFAULT_LINK_HREF,
        help=f"Stylesheet href to insert. Defaults to {DEFAULT_LINK_HREF}.",
    )
    parser.add_argument(
        "--files",
        nargs="*",
        default=[],
        help="Optional file names or paths to convert. Defaults to all .html files in source-dir.",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Overwrite output files if they already exist.",
    )
    args = parser.parse_args()

    source_dir = args.source_dir.resolve()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    converted = 0
    for source in collect_sources(source_dir, args.files):
        source = source.resolve()
        if not source.exists():
            raise FileNotFoundError(f"source file not found: {source}")
        if source.suffix.lower() != ".html":
            continue

        destination = output_dir / source.name
        if destination.exists() and not args.overwrite:
            print(f"skip existing: {destination}")
            continue

        converted_html = convert_html(source.read_text(), args.link_href)
        destination.write_text(converted_html)
        print(f"wrote: {destination}")
        converted += 1

    print(f"converted {converted} file(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
