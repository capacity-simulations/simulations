#!/usr/bin/env python3
"""Engine build: inline manifested engine modules into a single-file sim HTML.

Usage:
    python engine/tools/build.py <sim.html> [--upgrade] [--check]

Reads the sim's #engine-manifest JSON block, resolves modules against
engine/registry.json (transitive deps, layer rules), converts the ESM sources
into one `window.Engine` IIFE, writes it between the ENGINE:BEGIN/END markers
inside <script id="engine-inline">, and stamps manifest.build with
{engineVersion, date, hash}. Rebuilds are idempotent.

Module source style contract (enforced loosely here, strictly by lint):
  - top-level `export function NAME` / `export const NAME =` only
  - imports only from sibling engine modules: import {a, b} from '../core/scale.js'
"""

import argparse
import datetime as _dt
import hashlib
import json
import re
import sys
from pathlib import Path

ENGINE_ROOT = Path(__file__).resolve().parent.parent
BEGIN = "/* ENGINE:BEGIN */"
END = "/* ENGINE:END */"

MANIFEST_RE = re.compile(
    r'(<script[^>]*id="engine-manifest"[^>]*>)(.*?)(</script>)', re.S)
INLINE_RE = re.compile(
    r'(<script[^>]*id="engine-inline"[^>]*>)(.*?)(</script>)', re.S)
STYLE_RE = re.compile(
    r'(<style[^>]*id="engine-css"[^>]*>)(.*?)(</style>)', re.S)
IMPORT_RE = re.compile(
    r'^import\s*\{([^}]*)\}\s*from\s*[\'"]([^\'"]+)[\'"];?\s*$', re.M)
EXPORT_FN_RE = re.compile(r'^export\s+(?=(?:async\s+)?function\s+([A-Za-z_$][\w$]*))', re.M)
EXPORT_CONST_RE = re.compile(r'^export\s+(?=(?:const|let|class)\s+([A-Za-z_$][\w$]*))', re.M)


def die(msg):
    print(f"build.py: ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def load_registry():
    return json.loads((ENGINE_ROOT / "registry.json").read_text())


def validate_manifest(m, registry):
    for key in ("manifestVersion", "sim", "engine", "modules"):
        if key not in m:
            die(f"manifest missing required key: {key}")
    if m["manifestVersion"] != 1:
        die(f"unsupported manifestVersion {m['manifestVersion']}")
    known = registry["modules"]
    unknown = [x for x in m["modules"] if x not in known]
    if unknown:
        die(f"unknown module(s) {unknown}; known: {sorted(known)}")
    if "verify.audit" in known and "verify.audit" not in m["modules"]:
        die("manifest must include verify.audit (mandatory module)")
    for v in m.get("vendor", []):
        if v not in registry.get("vendor", {}):
            die(f"unknown vendor asset: {v}")


def resolve_modules(mods, registry):
    """Transitive deps + layer-rule check + stable topo order."""
    known = registry["modules"]
    rules = registry.get("layerRules", {})
    seen, order = set(), []

    def visit(name, stack=()):
        if name in seen:
            return
        if name in stack:
            die(f"dependency cycle: {' -> '.join(stack + (name,))}")
        entry = known[name]
        layer = entry.get("layer", name.split(".")[0])
        for dep in entry.get("deps", []):
            if dep not in known:
                die(f"{name} depends on unknown module {dep}")
            dep_layer = known[dep].get("layer", dep.split(".")[0])
            if dep_layer not in rules.get(layer, []) and dep_layer != layer:
                die(f"layer violation: {name} ({layer}) may not depend on {dep} ({dep_layer})")
            visit(dep, stack + (name,))
        seen.add(name)
        order.append(name)

    layer_rank = {"core": 0, "canvas": 1, "controls": 2, "domain": 3, "shell": 4, "verify": 5}
    for name in sorted(mods, key=lambda n: (layer_rank.get(known[n].get("layer", n.split(".")[0]), 9), n)):
        visit(name)
    return order


def transpile(name, entry, path_to_module):
    """ESM module source -> IIFE assigning window.Engine.<namespace>."""
    src = (ENGINE_ROOT / entry["file"]).read_text()
    ns = entry.get("namespace", name.split(".", 1)[1] if "." in name else name)
    base = (ENGINE_ROOT / entry["file"]).parent

    # imports -> destructuring from already-built Engine namespaces
    def repl_import(m):
        names, rel = m.group(1).strip(), m.group(2)
        try:
            key = (base / rel).resolve().relative_to(ENGINE_ROOT.resolve()).as_posix()
        except ValueError:
            key = None
        target = path_to_module.get(key)
        if target is None:
            die(f"{name}: import from unknown engine file '{rel}'")
        tns = target[1].get("namespace", target[0].split(".", 1)[1])
        return f"const {{{names}}} = Engine.{tns};"
    src = IMPORT_RE.sub(repl_import, src)

    exports = EXPORT_FN_RE.findall(src) + EXPORT_CONST_RE.findall(src)
    if not exports:
        die(f"{name}: no top-level exports found in {entry['file']}")
    src = EXPORT_FN_RE.sub("", src)
    src = EXPORT_CONST_RE.sub("", src)
    export_obj = ", ".join(exports)
    out = (f"// ---- module {name} ----\n"
           f"Engine.{ns} = (function () {{\n'use strict';\n{src}\n"
           f"return {{ {export_obj} }};\n}})();\n")
    # Optional registry "alias": expose the namespace under a legacy global
    # (e.g. shell -> window.Shell for the frozen 57-sim Shell API).
    alias = entry.get("alias")
    if alias:
        out += f"window.{alias} = Engine.{ns};\n"
    return out


def build_engine_block(manifest, registry):
    order = resolve_modules(manifest["modules"], registry)
    path_to_module = {e["file"]: (n, e)
                      for n, e in registry["modules"].items()}
    parts = ["window.Engine = window.Engine || {};\nconst Engine = window.Engine;\n"]
    for name in order:
        parts.append(transpile(name, registry["modules"][name], path_to_module))
    body = "\n".join(parts)

    vendor_blocks, css_parts = [], []
    for v in manifest.get("vendor", []):
        ventry = registry["vendor"][v]
        vpath = ENGINE_ROOT / ventry["file"]
        if not vpath.exists() or vpath.is_dir():
            print(f"build.py: WARNING: vendor asset '{v}' not present at {vpath}; skipping")
            continue
        kind = ventry.get("inline", "script")
        if kind == "style":
            css_parts.append(f"/* vendor:{v} */\n{vpath.read_text()}")
        else:
            vendor_blocks.append(f"/* vendor:{v} */\n{vpath.read_text()}")

    # Shell CSS ships with the shell module: sims that manifest `shell` get
    # shell/shell.css injected into <style id="engine-css"> automatically.
    if "shell" in order:
        shell_css = ENGINE_ROOT / "shell" / "shell.css"
        if shell_css.exists():
            css_parts.append(f"/* shell.css (engine-injected) */\n{shell_css.read_text()}")

    version = registry["engineVersion"]
    code = "\n".join(vendor_blocks + [body]) if vendor_blocks else body
    css = "\n".join(css_parts)
    return version, code, css, order


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sim")
    ap.add_argument("--upgrade", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    sim_path = Path(args.sim)
    if not sim_path.exists():
        die(f"no such file: {sim_path}")
    html = sim_path.read_text()

    mm = MANIFEST_RE.search(html)
    if not mm:
        die('no <script id="engine-manifest"> block found')
    try:
        manifest = json.loads(mm.group(2))
    except json.JSONDecodeError as e:
        die(f"manifest is not valid JSON: {e}")

    registry = load_registry()
    validate_manifest(manifest, registry)

    reg_version = registry["engineVersion"]
    pin = manifest["engine"]
    if pin != reg_version and not args.upgrade:
        die(f"sim pins engine {pin} but registry is {reg_version}; "
            f"pass --upgrade to rebuild against the current engine")

    version, code, css, order = build_engine_block(manifest, registry)
    digest = hashlib.sha256(code.encode()).hexdigest()[:12]
    today = _dt.date.today().isoformat()
    stamp = (f"/* engine v{version} | modules: {', '.join(order)} | "
             f"built {today} | sha {digest} */")
    block = f"\n{BEGIN}\n{stamp}\n{code}\n{END}\n"

    im = INLINE_RE.search(html)
    if not im:
        die('no <script id="engine-inline"> block found')
    html = html[:im.start(2)] + block + html[im.end(2):]

    # CSS injection (shell.css + style-type vendor assets). Idempotent: the
    # whole <style id="engine-css"> content is replaced each build. The hash
    # above covers the JS block only — CSS is not part of the physics surface.
    if css:
        cm = STYLE_RE.search(html)
        if not cm:
            head_end = re.search(r'</head>', html, re.I)
            if not head_end:
                die("CSS injection needs a </head> (or add <style id=\"engine-css\"></style> yourself)")
            html = (html[:head_end.start()]
                    + '<style id="engine-css">\n</style>\n'
                    + html[head_end.start():])
            cm = STYLE_RE.search(html)
        css_block = f"\n/* engine CSS v{version} (auto-injected; do not edit) */\n{css}\n"
        html = html[:cm.start(2)] + css_block + html[cm.end(2):]

    manifest["engine"] = version
    manifest["build"] = {"engineVersion": version, "date": today, "hash": digest}
    new_manifest = json.dumps(manifest, indent=2)
    # manifest block moved if inline block precedes it; re-locate before replacing
    mm = MANIFEST_RE.search(html)
    html = html[:mm.start(2)] + "\n" + new_manifest + "\n" + html[mm.end(2):]

    sim_path.write_text(html)
    print(f"built {sim_path.name}: engine v{version}, modules [{', '.join(order)}], sha {digest}")

    if args.check:
        verify = ENGINE_ROOT / "tools" / "verify.mjs"
        if verify.exists():
            import subprocess
            sys.exit(subprocess.call(["node", str(verify), str(sim_path)]))
        print("build.py: NOTE: verify.mjs not present yet; --check skipped")


if __name__ == "__main__":
    main()
