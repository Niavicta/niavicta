"""
Report how the site actually uses its image bank.
-------------------------------------------------
Why this exists: the same photo kept landing on page after page (the glass atrium
roof was on three pages before anyone noticed), while most of the bank sat unused.
Nothing counted, so nothing stopped it.

Run it before publishing a page or a post:

    python check-image-usage.py            # report, always exits 0
    python check-image-usage.py --strict   # exit 1 if any image is overused
    python check-image-usage.py --max 2    # change the overuse threshold

What it counts:
  Real references only, from `src="…"`, `srcset="…"` and CSS `url(…)` across every
  .html and .css file in the repo. Text inside comments does not count, so the
  `dirs/img/NAME.jpg` placeholder in a CSS comment is correctly ignored.

What it reports:
  1. Coverage    - how many bank images the site uses, and how many sit unused.
  2. Overused    - any image on more than --max pages, with the pages named.
  3. Unused      - bank images nobody has reached for yet. Shop here first.
  4. Off-bank    - images referenced by the site but missing from image-bank.json
                   (team portraits and resource previews live outside the bank by design
                   and are ignored).

Exit codes:
  0 = report printed (default, even with overuse)
  1 = --strict and at least one image exceeds the threshold
"""

import argparse
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

REPO = Path(__file__).resolve().parent
BANK_FILE = REPO / "dirs" / "img" / "image-bank.json"

# Referenced by design but deliberately outside the bank, and exempt from the
# overuse check: every post carries its author's portrait, that is the pattern.
# Resource previews each belong to one resource landing page and its hub card.
OFF_BANK_OK = ("dirs/img/team/", "dirs/img/resources/")

DEFAULT_MAX_PAGES = 2

REF_PATTERNS = (
    re.compile(r'src\s*=\s*["\']([^"\']+)["\']', re.I),
    re.compile(r'srcset\s*=\s*["\']([^"\']+)["\']', re.I),
    re.compile(r'url\(\s*["\']?([^"\')]+)["\']?\s*\)', re.I),
)


def references(text: str):
    """Every image path referenced by markup or CSS in one file."""
    found = set()
    for pattern in REF_PATTERNS:
        for raw in pattern.findall(text):
            for candidate in raw.split(","):
                path = candidate.strip().split()[0] if candidate.strip() else ""
                if path.startswith("dirs/img/"):
                    found.add(path)
    return found


def usage():
    """Map each image path to the sorted pages that reference it."""
    pages = defaultdict(set)
    for f in sorted([*REPO.glob("*.html"), *REPO.glob("*.css")]):
        for path in references(f.read_text(encoding="utf-8", errors="ignore")):
            pages[path].add(f.name)
    return {path: sorted(names) for path, names in pages.items()}


def bank():
    """Bank entries keyed by file path."""
    data = json.loads(BANK_FILE.read_text(encoding="utf-8"))
    return {i["file"]: i for i in data["images"]}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--max", type=int, default=DEFAULT_MAX_PAGES,
                    help=f"pages an image may appear on (default {DEFAULT_MAX_PAGES})")
    ap.add_argument("--strict", action="store_true",
                    help="exit 1 when an image exceeds the threshold")
    args = ap.parse_args()

    if not BANK_FILE.exists():
        print(f"Image bank not found: {BANK_FILE}")
        return 0

    catalogue, used = bank(), usage()
    in_bank = {p: pages for p, pages in used.items() if p in catalogue}
    off_bank = {p: pages for p, pages in used.items()
                if p not in catalogue and not p.startswith(OFF_BANK_OK)}
    unused = sorted(set(catalogue) - set(used))
    overused = {p: pages for p, pages in sorted(used.items())
                if len(pages) > args.max and not p.startswith(OFF_BANK_OK)}

    print(f"Coverage: {len(in_bank)} of {len(catalogue)} bank images in use, "
          f"{len(unused)} unused. {len(used)} image(s) referenced in total.")

    if overused:
        print(f"\nOverused (more than {args.max} page(s)):")
        for path, pages in sorted(overused.items(), key=lambda kv: -len(kv[1])):
            print(f"  {len(pages)}x  {path}")
            print(f"        {', '.join(pages)}")
    else:
        print(f"\nNo image appears on more than {args.max} page(s).")

    if unused:
        print("\nUnused, shop here before reusing something:")
        for path in unused:
            entry = catalogue[path]
            print(f"  {path}")
            print(f"        {entry.get('description', '')[:100]}")

    if off_bank:
        print("\nReferenced but not catalogued (run build-image-bank.py, then describe them):")
        for path, pages in sorted(off_bank.items()):
            print(f"  {path}  ({', '.join(pages)})")

    if overused and args.strict:
        print("\nFAIL: pick a fresher image, or pass a higher --max deliberately.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
