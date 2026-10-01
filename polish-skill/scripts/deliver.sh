#!/bin/bash
# File a polished sim into the org repo's AI-courses tree and log it. No git commands.
# usage: bash deliver.sh <id> [course-folder-override]
set -e
REPO="${SIM_FOUNDRY:-/Users/admin/Downloads/sim-foundry}"
ROOT="/Users/admin/Desktop/simulations-1/AI courses sims/polish"
ID="$1"; [ -z "$ID" ] && { echo "usage: deliver.sh <id> [course]"; exit 2; }
if [ -n "$2" ]; then COURSE="$2"; else
  case "$ID" in
    qm-*) COURSE="quantum mechanics";;
    wv-*) COURSE="waves and acoustics";;
    th-*) COURSE="thermal and statistical physics";;
    cm-*) COURSE="classical mechanics";;
    *) echo "unknown prefix for $ID: pass the course folder name as 2nd arg"; exit 2;;
  esac
fi
SRC="$REPO/sims-eval-law/$ID.polished.html"
[ -f "$SRC" ] || { echo "missing $SRC (cp <id>.html <id>.polished.html after gates are green)"; exit 1; }
DEST="$ROOT/$COURSE"; mkdir -p "$DEST"
cp "$SRC" "$DEST/$ID.polished.html"
summ() { python3 "$(dirname "$0")/gate-count.py" "$1"; }
BEFORE=$(summ "$REPO/sims-eval-law/$ID.polish-gates-before.txt"); AFTER=$(summ "$REPO/sims-eval-law/$ID.polish-gates-after.txt")
LOG="$DEST/POLISH-LOG.md"
[ -f "$LOG" ] || printf "# Polish log — %s\n\n| Date | Sim | Gates before → after | Notes |\n|---|---|---|---|\n" "$COURSE" > "$LOG"
printf "| %s | %s | %s → %s | see sims-eval-law/%s.polish/fixer-report.md |\n" "$(date +%Y-%m-%d)" "$ID" "$BEFORE" "$AFTER" "$ID" >> "$LOG"
echo "delivered → $DEST/$ID.polished.html (gates $BEFORE → $AFTER)"
