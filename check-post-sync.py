"""
Check that every published blog post on the site still matches its vault draft.
------------------------------------------------------------------------------
Why this exists: the vault markdown draft is where Chani edits. The website is a
separate, hand-published HTML file. Nothing links them automatically, so an edit
in the vault can silently fail to reach the live page (it has happened).

This is the gate. Run it BEFORE pushing any post change:

    python check-post-sync.py

How the pairing works:
  Each vault draft under content/blog/ carries a `website-path:` frontmatter
  field naming its page in this repo, e.g.

      website-path: you-dont-lose-your-work-to-ai.html

  Drafts with an empty `website-path` are unpublished and are skipped.

What it compares:
  The draft's `## Draft` section (minus the H1 title) against the <p> paragraphs
  inside the page's <div class="prose article"> block, paragraph by paragraph.
  Quotes, dashes, entities, and whitespace are normalised, so smart quotes in the
  HTML and straight quotes in the markdown count as equal. Only real wording
  differences are reported.

Exit codes:
  0 = every published post matches its draft
  1 = at least one post has drifted (or a draft points at a missing page)
"""

import html
import re
import sys
import unicodedata
from pathlib import Path

REPO = Path(__file__).resolve().parent

VAULT = (
    Path.home()
    / "Niavicta"
    / "Niavicta - Operations - Documents"
    / "03-Corporate"
    / "05-Stakeholders"
    / "niavicta-brain"
)
BLOG_DIR = VAULT / "content" / "blog"
SKIP_DRAFTS = {"blog.md"}


def frontmatter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return {}
    fields = {}
    for line in m.group(1).splitlines():
        fm = re.match(r"^([a-zA-Z0-9_-]+):\s*(.*)$", line)
        if fm:
            fields[fm.group(1)] = fm.group(2).strip().strip('"').strip("'")
    return fields


def normalise(s: str) -> str:
    """Make markdown and HTML comparable: entities, smart punctuation, spacing."""
    s = html.unescape(s)
    s = unicodedata.normalize("NFKC", s)
    s = s.replace(" ", " ")                       # nbsp
    s = re.sub(r"[“”„‟]", '"', s)  # smart double quotes
    s = re.sub(r"[‘’‚‛]", "'", s)  # smart single quotes
    s = re.sub(r"[–—]", "-", s)              # en/em dash
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def window(s: str, other: str, pad: int = 60) -> str:
    """Show the part of `s` where it starts diverging from `other`, with context."""
    i = 0
    while i < min(len(s), len(other)) and s[i] == other[i]:
        i += 1
    start = max(0, i - pad)
    end = min(len(s), i + pad)
    return ("..." if start else "") + s[start:end] + ("..." if end < len(s) else "")


def draft_paragraphs(md: str):
    """Paragraphs of the `## Draft` section, excluding headings."""
    m = re.search(r"^## Draft\s*$(.*?)(?=^## |\Z)", md, re.S | re.M)
    if not m:
        return None
    body = m.group(1)
    paras = []
    for chunk in re.split(r"\n\s*\n", body):
        chunk = chunk.strip()
        if not chunk or chunk.startswith("#"):
            continue
        paras.append(normalise(chunk))
    return paras


def html_paragraphs(page: str):
    """Paragraphs inside the article's prose block."""
    m = re.search(r'<div class="prose article".*?>(.*?)</div>', page, re.S)
    if not m:
        return None
    return [normalise(re.sub(r"<[^>]+>", "", p)) for p in
            re.findall(r"<p>(.*?)</p>", m.group(1), re.S)]


def check(draft_path: Path):
    """Return (status, messages). status: 'ok' | 'skip' | 'fail'."""
    md = draft_path.read_text(encoding="utf-8")
    fm = frontmatter(md)
    web = fm.get("website-path", "")
    if not web:
        return "skip", [f"{draft_path.name}: no website-path (unpublished)"]

    page_path = REPO / web
    if not page_path.exists():
        return "fail", [f"{draft_path.name}: website-path points at missing page '{web}'"]

    d = draft_paragraphs(md)
    if d is None:
        return "fail", [f"{draft_path.name}: no '## Draft' section found"]
    h = html_paragraphs(page_path.read_text(encoding="utf-8"))
    if h is None:
        return "fail", [f"{web}: no '<div class=\"prose article\">' block found"]

    msgs = []
    if len(d) != len(h):
        msgs.append(f"paragraph count differs: draft has {len(d)}, page has {len(h)}")
    for i, (dp, hp) in enumerate(zip(d, h), 1):
        if dp != hp:
            msgs.append(f"paragraph {i} differs:\n"
                        f"    draft: {window(dp, hp)}\n"
                        f"    page : {window(hp, dp)}")
    if msgs:
        return "fail", [f"{draft_path.name}  ->  {web}"] + ["  " + m for m in msgs]
    return "ok", [f"{draft_path.name}  ->  {web}  in sync ({len(d)} paragraphs)"]


def main():
    if not BLOG_DIR.exists():
        print(f"Vault blog folder not found: {BLOG_DIR}")
        print("Skipping sync check (run this on a machine with the vault synced).")
        return 0

    drafts = sorted(p for p in BLOG_DIR.glob("*.md") if p.name not in SKIP_DRAFTS)
    failed, checked = [], 0
    for d in drafts:
        status, msgs = check(d)
        if status == "skip":
            continue
        checked += 1
        for m in msgs:
            print(("  FAIL  " if status == "fail" else "  ok    ") + m if not m.startswith("  ") else m)
        if status == "fail":
            failed.append(d.name)

    print()
    if failed:
        print(f"{len(failed)} published post(s) have drifted from the vault draft: {', '.join(failed)}")
        print("Reconcile before pushing: the vault draft is the source of truth for the words.")
        return 1
    print(f"All {checked} published post(s) match their vault drafts.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
