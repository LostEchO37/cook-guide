#!/usr/bin/env python3
"""Quick sanity checks for the Ember static site + recipe catalog."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "js"
errors: list[str] = []
warnings: list[str] = []


def load_ids(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    return re.findall(r"^\s*id:\s*['\"]([^'\"]+)['\"]", text, re.M)


def main() -> int:
    # Recipe IDs across packs
    recipe_files = sorted(JS.glob("recipe-data*.js"))
    all_ids: list[str] = []
    for f in recipe_files:
        if f.name == "recipe-data.js":
            continue
        all_ids.extend(load_ids(f))
    base_ids = load_ids(JS / "recipe-data.js")
    all_ids.extend(base_ids)

    dupes = {i for i in all_ids if all_ids.count(i) > 1}
    if dupes:
        errors.append(f"Duplicate recipe ids: {sorted(dupes)[:10]}")

    # Map recipe refs (only inside recipes: [...] arrays)
    fr = (JS / "food-regions.js").read_text(encoding="utf-8")
    map_ids: set[str] = set()
    for block in re.findall(r"recipes:\s*\[(.*?)\]", fr, re.S):
        map_ids.update(re.findall(r"'([a-z0-9-]+)'", block))
    catalog = set(all_ids)
    missing_map = sorted(r for r in map_ids if r not in catalog)
    if missing_map:
        errors.append(f"Map references unknown recipes: {missing_map[:15]}")

    # Ingredients
    ing_text = (JS / "ingredients.js").read_text(encoding="utf-8")
    defined = set(re.findall(r"^\s*(?:'([^']+)'|(\w+)):\s*\{", ing_text, re.M))
    defined = {a or b for a, b in defined}
    alias_map = {"egg": "eggs", "green onions": "green onion", "mayo": "mayonnaise"}
    used: set[str] = set()
    for f in recipe_files:
        t = f.read_text(encoding="utf-8")
        for part in re.findall(r"ingredients:\s*\[(.*?)\]|optional:\s*\[(.*?)\]", t, re.S):
            for chunk in part:
                used.update(re.findall(r'"([^"]+)"', chunk))
    missing_ing = sorted(
        k for k in used
        if alias_map.get(k, k) not in defined and k not in defined
    )
    if missing_ing:
        errors.append(f"Missing ingredient translations ({len(missing_ing)}): {missing_ing[:12]}")

    # Variant spam
    names = []
    for f in recipe_files:
        names.extend(re.findall(r"name:\s*['\"]([^'\"]+)['\"]", f.read_text(encoding="utf-8")))
    variants = [n for n in names if re.search(r"Variant\s*\d|变奏\d|變奏\d", n, re.I)]
    if variants:
        errors.append(f"Clone variant names still present: {variants[:8]}")

    # Required files
    for req in ["index.html", "styles.css", "sw.js", "js/app.js", "js/analytics.js", "server/app.py"]:
        if not (ROOT / req).is_file():
            errors.append(f"Missing required file: {req}")

    # Analytics endpoint note
    idx = (ROOT / "index.html").read_text(encoding="utf-8")
    if 'analytics-endpoint' not in idx:
        warnings.append("index.html missing analytics-endpoint meta")

    print(f"Recipes in catalog: {len(catalog)}")
    print(f"Map recipe refs: {len(map_ids)}")
    print(f"Ingredients defined: {len(defined)}")
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print("  ⚠", w)
    if errors:
        print("\nErrors:")
        for e in errors:
            print("  ✗", e)
        return 1
    print("\nAll checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
