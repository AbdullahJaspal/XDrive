#!/usr/bin/env bash
# Links cursor-rules/ into .cursor/rules/ for Cursor IDE
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/.cursor/rules"
for f in "$ROOT/cursor-rules"/*.mdc; do
  name="$(basename "$f")"
  ln -sf "../../cursor-rules/$name" "$ROOT/.cursor/rules/$name"
done
echo "Cursor rules linked to .cursor/rules/"
