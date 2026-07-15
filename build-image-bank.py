"""
Refresh the website image bank catalog.
------------------------------------------------------------------------
Scans dirs/img/ for images and keeps dirs/img/image-bank.json in sync.

What it does:
  - Adds any NEW image it finds, scaffolded with empty description/tags so a
    human (or AI) can fill them in.
  - Refreshes the auto fields on every entry: width, height, orientation, ratio.
  - Flags entries whose file has gone missing.
  - NEVER overwrites the descriptive fields you write (alt, description, tags,
    use) — those are yours; this only tops up the mechanical metadata.

Run it any time you drop new images in:
    python build-image-bank.py

No third-party packages needed (dimensions are read straight from the file
headers), so it runs anywhere Python does.
"""

import json
import struct
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parent
IMG_DIR = REPO / "dirs" / "img"
MANIFEST = IMG_DIR / "image-bank.json"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"}
# Files that are chrome, not content — skip them from the searchable bank.
SKIP_NAMES = {"image-bank.json"}
# Subfolders of dirs/img that are deliberately NOT part of the searchable bank.
# Founder portraits are placed by hand on specific pages, never auto-suggested.
SKIP_DIRS = {"team"}


def excluded(path: Path) -> bool:
    return path.name in SKIP_NAMES or any(part in SKIP_DIRS for part in path.relative_to(IMG_DIR).parts[:-1])


def png_size(data: bytes):
    if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
        w, h = struct.unpack(">II", data[16:24])
        return w, h
    return None


def jpeg_size(data: bytes):
    i, n = 2, len(data)
    while i < n:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        # Start-of-frame markers carry the dimensions.
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            h, w = struct.unpack(">HH", data[i + 5:i + 9])
            return w, h
        seg_len = struct.unpack(">H", data[i + 2:i + 4])[0]
        i += 2 + seg_len
    return None


def gif_size(data: bytes):
    if data[:6] in (b"GIF87a", b"GIF89a"):
        w, h = struct.unpack("<HH", data[6:10])
        return w, h
    return None


def dimensions(path: Path):
    try:
        data = path.read_bytes()
    except OSError:
        return None
    for reader in (png_size, jpeg_size, gif_size):
        size = reader(data)
        if size:
            return size
    return None  # svg / webp / avif: vector or unsupported header, leave blank


def orient(w, h):
    if not w or not h:
        return ""
    if abs(w - h) / max(w, h) < 0.05:
        return "square"
    return "landscape" if w > h else "portrait"


def rel(path: Path) -> str:
    return path.relative_to(REPO).as_posix()


def main():
    existing = {}
    if MANIFEST.exists():
        doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
        for entry in doc.get("images", []):
            existing[entry["file"]] = entry

    found = sorted(
        p for p in IMG_DIR.rglob("*")
        if p.is_file() and p.suffix.lower() in EXTS and not excluded(p)
    )

    images, new_count, todo_count = [], 0, 0
    seen = set()
    for p in found:
        key = rel(p)
        seen.add(key)
        entry = existing.get(key, {})
        if not entry:
            new_count += 1
        size = dimensions(p)
        w, h = (size if size else (entry.get("width", 0), entry.get("height", 0)))
        merged = {
            "file": key,
            "alt": entry.get("alt", ""),
            "description": entry.get("description", ""),
            "tags": entry.get("tags", []),
            "use": entry.get("use", ["inline"]),
            "orientation": orient(w, h),
            "width": w or 0,
            "height": h or 0,
        }
        if not merged["description"] or not merged["tags"]:
            merged["todo"] = "fill description + tags"
            todo_count += 1
        images.append(merged)

    # Reconcile entries not scanned this pass.
    for key, entry in existing.items():
        if key in seen:
            continue
        p = REPO / key
        if p.exists():
            continue  # now excluded from the bank (e.g. moved into a skipped folder) — drop it
        entry["missing"] = True  # file genuinely gone — keep the entry but flag it
        images.append(entry)

    images.sort(key=lambda e: e["file"])
    doc = {
        "_meta": {
            "purpose": "Searchable catalog of reusable website images. AI/authors read this to pick images for blog posts and page updates. See dirs/img/README.md.",
            "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "count": len(images),
        },
        "images": images,
    }
    MANIFEST.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"image-bank.json refreshed: {len(images)} images "
          f"({new_count} new, {todo_count} need description/tags)")
    if todo_count:
        print("Fill the 'todo' entries so they become searchable.")


if __name__ == "__main__":
    main()
