# -*- coding: utf-8 -*-
"""Liga lotes TST/TSE em src/lib/sumulas/index.ts."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
meta = json.loads(
    (ROOT / "tmp" / "sumulas-tst-tse-meta.json").read_text(encoding="utf-8")
)
idx = ROOT / "src" / "lib" / "sumulas" / "index.ts"
text = idx.read_text(encoding="utf-8")

imports: list[str] = []
names: list[str] = []
for block in meta["tst"] + meta["tse"]:
    exp = block["export"]
    names.append(exp)
    mod = block["file"].replace(".ts", "")
    line = f'import {{ {exp} }} from "@/lib/sumulas/{mod}";'
    if line not in text:
        imports.append(line)

marker = "export const TODOS_LOTES_SUMULAS"
if imports:
    if marker not in text:
        raise SystemExit("marker missing")
    text = text.replace(marker, "\n".join(imports) + "\n\n" + marker, 1)

# Localizar array TODOS_LOTES_SUMULAS = [ ... ];
m = re.search(
    r"export const TODOS_LOTES_SUMULAS[^=]*=\s*\[(.*?)\n\];",
    text,
    re.S,
)
if not m:
    raise SystemExit("array TODOS_LOTES_SUMULAS não encontrado")

body = m.group(1)
missing = [n for n in names if n not in body]
if not missing:
    idx.write_text(text, encoding="utf-8")
    print("array already complete;", len(names), "lotes")
else:
    extra = ",\n".join("  " + n for n in missing)
    # inserir antes do fechamento
    new_text = text[: m.end(1)] + ",\n" + extra + text[m.end(1) :]
    idx.write_text(new_text, encoding="utf-8")
    print("added to array", len(missing), "lotes")
