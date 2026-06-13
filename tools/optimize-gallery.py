#!/usr/bin/env python3
"""
optimize-gallery.py  —  Encore Performing Arts gallery image pipeline
=====================================================================

Turn a folder of raw photos (phone shots, camera JPGs, HEIC, PNG) into
web-ready WebP thumbnails + full images, and write the manifest the site
reads. The photos never have to go through Claude — you run this locally,
then push the output with GitHub Desktop.

WHAT IT DOES, per run (one gallery / one show):
  * fixes orientation (so sideways phone photos stand up)
  * makes a "full" version  (max ~1600px long edge)   -> img/gallery/<slug>/full/001.webp
  * makes a "thumb" version (max ~600px  long edge)   -> img/gallery/<slug>/thumb/001.webp
  * strips camera metadata (location, device, etc.)
  * names them 001, 002, 003 ... in filename order
  * writes img/gallery/<slug>/manifest.json   (what the gallery page reads)
  * updates img/gallery/index.json            (the Past Shows list)

WHAT IT DOES NOT DO:
  * touch your originals (read-only; keep your full-res originals somewhere safe)
  * upload anything (you push with GitHub Desktop afterwards)

------------------------------------------------------------------------
SETUP (one time):
    pip install pillow
    pip install pillow-heif        # only if you have .HEIC photos from iPhone

USAGE:
    python3 tools/optimize-gallery.py \
        --slug newsies-2024 \
        --title "Newsies" \
        --year 2024 \
        --src "/path/to/folder/of/raw/newsies/photos"

    # optional caption shown under the gallery title:
        --blurb "Our summer 2024 production at the Electric Theater."

Run it once per show. Re-running the same --slug overwrites that gallery
cleanly. After it finishes: open GitHub Desktop, you'll see the new files
under img/gallery/, commit, and push. Netlify deploys automatically.
------------------------------------------------------------------------
"""

import argparse, json, os, sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install pillow")

# Optional HEIC support (iPhone photos). Safe if not installed.
try:
    import pillow_heif  # noqa
    pillow_heif.register_heif_opener()
    HEIC = True
except Exception:
    HEIC = False

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff"}
if HEIC:
    EXTS |= {".heic", ".heif"}


def find_site_root(start: Path) -> Path:
    """Walk up from the script until we find the folder that has index.html."""
    for p in [start] + list(start.parents):
        if (p / "index.html").exists():
            return p
    # fall back to current dir
    return Path.cwd()


def natural_key(name: str):
    """Sort like a human: img2 before img10."""
    import re
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", name)]


def resize_to(img: Image.Image, max_edge: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_edge:
        return img.copy()
    if w >= h:
        nw, nh = max_edge, round(h * max_edge / w)
    else:
        nh, nw = max_edge, round(w * max_edge / h)
    return img.resize((nw, nh), Image.LANCZOS)


def main():
    ap = argparse.ArgumentParser(description="Optimize a folder of photos into a web gallery.")
    ap.add_argument("--slug", required=True, help="url-safe id, e.g. newsies-2024")
    ap.add_argument("--src", required=True, help="folder containing the raw photos")
    ap.add_argument("--title", default=None, help='display title, e.g. "Newsies"')
    ap.add_argument("--year", default=None, help="production year, e.g. 2024")
    ap.add_argument("--blurb", default="", help="optional one-line description")
    ap.add_argument("--site", default=None, help="site root (defaults to auto-detect)")
    ap.add_argument("--full-size", type=int, default=1600)
    ap.add_argument("--thumb-size", type=int, default=600)
    ap.add_argument("--q-full", type=int, default=82, help="WebP quality for full images")
    ap.add_argument("--q-thumb", type=int, default=78, help="WebP quality for thumbnails")
    args = ap.parse_args()

    slug = args.slug.strip().lower().replace(" ", "-")
    title = args.title or slug.replace("-", " ").title()
    src = Path(args.src).expanduser()
    if not src.is_dir():
        sys.exit(f"--src folder not found: {src}")

    site = Path(args.site).expanduser() if args.site else find_site_root(Path(__file__).resolve().parent)
    gdir = site / "img" / "gallery" / slug
    full_dir, thumb_dir = gdir / "full", gdir / "thumb"
    full_dir.mkdir(parents=True, exist_ok=True)
    thumb_dir.mkdir(parents=True, exist_ok=True)

    files = sorted([p for p in src.iterdir() if p.suffix.lower() in EXTS], key=lambda p: natural_key(p.name))
    if not files:
        hint = "" if HEIC else "  (HEIC support is OFF — run: pip install pillow-heif)"
        sys.exit(f"No images found in {src}{hint}")

    print(f"\n  Gallery: {title}  ({slug})")
    print(f"  Source : {src}")
    print(f"  Output : {gdir}")
    print(f"  Photos : {len(files)} found{'  [HEIC on]' if HEIC else ''}\n")

    photos = []
    for i, f in enumerate(files, 1):
        try:
            im = Image.open(f)
            im = ImageOps.exif_transpose(im)          # fix orientation
            if im.mode in ("RGBA", "P", "LA"):
                im = im.convert("RGB")
            n = f"{i:03d}.webp"
            full = resize_to(im, args.full_size)
            thumb = resize_to(im, args.thumb_size)
            # save WITHOUT exif/icc -> strips metadata
            full.save(full_dir / n, "WEBP", quality=args.q_full, method=6)
            thumb.save(thumb_dir / n, "WEBP", quality=args.q_thumb, method=6)
            photos.append({
                "src": f"/img/gallery/{slug}/full/{n}",
                "thumb": f"/img/gallery/{slug}/thumb/{n}",
                "w": full.size[0], "h": full.size[1],
            })
            print(f"   {i:>3}/{len(files)}  {f.name}  ->  {n}  ({full.size[0]}x{full.size[1]})")
        except Exception as e:
            print(f"   !! skipped {f.name}: {e}")

    if not photos:
        sys.exit("Nothing was processed.")

    # manifest.json (read by gallery.html)
    manifest = {
        "slug": slug, "title": title, "year": args.year or "",
        "blurb": args.blurb, "count": len(photos),
        "cover": photos[0]["thumb"], "photos": photos,
    }
    (gdir / "manifest.json").write_text(json.dumps(manifest, indent=2))

    # index.json (read by past-shows.html) — upsert this show, newest first
    idx_path = site / "img" / "gallery" / "index.json"
    try:
        idx = json.loads(idx_path.read_text())
        if not isinstance(idx, list):
            idx = []
    except Exception:
        idx = []
    idx = [s for s in idx if s.get("slug") != slug]
    idx.append({
        "slug": slug, "title": title, "year": args.year or "",
        "blurb": args.blurb, "count": len(photos), "cover": photos[0]["thumb"],
    })
    def yk(s):
        try: return -int(s.get("year") or 0)
        except: return 0
    idx.sort(key=lambda s: (yk(s), s.get("title", "")))
    idx_path.write_text(json.dumps(idx, indent=2))

    print(f"\n  Done. {len(photos)} photos -> {gdir}")
    print(f"  Wrote manifest.json and updated index.json")
    print(f"  Next: GitHub Desktop -> commit the new img/gallery files -> push.\n")


if __name__ == "__main__":
    main()
