#!/usr/bin/env python3
"""
Launch the 2027 design: promote every *-2027 preview over its live page.

    python3 _build/launch_2027.py --check            # dry run in a temp copy, report only
    python3 _build/launch_2027.py --apply            # do it in this working tree

What it does
  1. Moves each preview onto its live filename:
       home-2027.html            -> index.html
       <page>-2027.html          -> <page>.html
       blog-2027.html            -> blog.html
       blog-2027/<slug>.html     -> blog/<slug>.html
     Kept as they are: a-christmas-carol-2027.html (a real 2027 production page,
     not a preview) and directors-2027-season-x7k.html (private page).
  2. Rewrites every internal link to a preview (/about-2027, /blog-2027/x,
     /home-2027 ...) to the live URL, in HTML, JS, JSON and XML across the repo.
  3. Gives each promoted page the robots setting its live page had. The previews
     are all noindex; a page whose live version was indexable becomes indexable.
  4. Checks every internal href and src on every page against the files on
     disk and the rules in _redirects, and reports anything that would 404.

It does not delete retired pages or add their redirects; that is a separate list.
This file lives in _build/, which _redirects keeps from being served.
"""
import argparse, os, re, shutil, sys, tempfile, json
from pathlib import Path

KEEP = {"a-christmas-carol-2027.html", "directors-2027-season-x7k.html"}
TEXT_EXT = {".html", ".js", ".json", ".xml", ".txt", ".css"}
SKIP_DIRS = {".git", "_build", "studio", "node_modules"}
ROBOTS_RE = re.compile(r'[ \t]*<meta name="robots" content="[^"]*">\n?')

def plan(root: Path):
    moves = []
    for p in sorted(root.glob("*-2027.html")):
        if p.name in KEEP:
            continue
        base = p.name[:-len("-2027.html")]
        moves.append((p, root / ("index.html" if base == "home" else base + ".html")))
    blog = root / "blog-2027"
    if blog.is_dir():
        for p in sorted(blog.glob("*.html")):
            moves.append((p, root / "blog" / p.name))
    return moves

def slug_map(moves, root):
    """URL path of each preview -> URL path of its live page."""
    m = {}
    for src, dst in moves:
        rel = src.relative_to(root).as_posix()[:-5]
        live = dst.relative_to(root).as_posix()[:-5]
        m["/" + rel] = "/" if live == "index" else "/" + live
    m["/blog-2027"] = "/blog"
    return m

def rewrite_links(text, smap):
    # Longest first so /blog-2027/x is handled before /blog-2027.
    keys = sorted(smap, key=len, reverse=True)
    pat = re.compile("(" + "|".join(re.escape(k) for k in keys) + r")(?=[\"'#?/\s)<,]|$)")
    def sub(mo):
        return smap[mo.group(1)]
    out = pat.sub(sub, text)
    out = out.replace('href="/"/', 'href="/')  # guard, should never trigger
    return out

def robots_of(path: Path):
    if not path.exists():
        return None
    m = re.search(r'<meta name="robots" content="([^"]*)">', path.read_text(encoding="utf-8", errors="ignore"))
    return m.group(1) if m else ""

def promote(root: Path, log):
    moves = plan(root)
    smap = slug_map(moves, root)
    for src, dst in moves:
        live_robots = robots_of(dst)  # None = no live page existed
        h = src.read_text(encoding="utf-8")
        if live_robots is None or live_robots == "" or "noindex" not in live_robots:
            h, n = ROBOTS_RE.subn("", h, count=1)
            state = "indexable"
        else:
            h = ROBOTS_RE.sub(f'<meta name="robots" content="{live_robots}">\n', h, count=1)
            state = f"kept live robots ({live_robots})"
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(h, encoding="utf-8")
        src.unlink()
        log.append(f"{src.relative_to(root)} -> {dst.relative_to(root)}  [{state}]")
    if (root / "blog-2027").is_dir() and not any((root / "blog-2027").iterdir()):
        (root / "blog-2027").rmdir()
    changed = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            p = Path(dirpath) / fn
            if p.suffix not in TEXT_EXT and fn != "_redirects":
                continue
            t = p.read_text(encoding="utf-8", errors="ignore")
            nt = rewrite_links(t, smap)
            if nt != t:
                p.write_text(nt, encoding="utf-8")
                changed += 1
    log.append(f"link rewrites in {changed} files")
    return moves

# ---------------------------------------------------------------- link check
def redirect_rules(root):
    rules = []
    f = root / "_redirects"
    if f.exists():
        for line in f.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            src = line.split()[0]
            rules.append(src)
    return rules

def matches_rule(path, rules):
    for r in rules:
        if r.endswith("/*") and path.startswith(r[:-1]):
            return True
        if r.rstrip("/") == path.rstrip("/"):
            return True
    return False

def resolves(root, path, rules):
    path = path.split("#")[0].split("?")[0]
    if path in ("", "/"):
        return (root / "index.html").exists()
    rel = path.lstrip("/")
    cands = [root / rel, root / (rel + ".html"), root / rel / "index.html"]
    if any(c.is_file() for c in cands):
        return True
    return matches_rule(path, rules)

HREF_RE = re.compile(r'(?:href|src|srcset)="(/[^"]*)"')

def check(root: Path):
    rules = redirect_rules(root)
    broken = {}
    pages = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if not fn.endswith(".html"):
                continue
            pages += 1
            p = Path(dirpath) / fn
            h = re.sub(r"<!--.*?-->", "", p.read_text(encoding="utf-8", errors="ignore"), flags=re.S)
            for m in HREF_RE.finditer(h):
                for part in m.group(1).split(","):
                    url = part.strip().split(" ")[0]
                    if not url.startswith("/") or url.startswith("//") or "'+" in url or "SLUG" in url:
                        continue  # JS-built or template URLs
                    if not resolves(root, url, rules):
                        broken.setdefault(url, set()).add(p.relative_to(root).as_posix())
    leftover = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if fn.endswith((".html", ".js")):
                p = Path(dirpath) / fn
                t = p.read_text(encoding="utf-8", errors="ignore")
                for m in re.finditer(r'(?<![a-z0-9/._-])/[a-z0-9-]+-2027(?:/[a-z0-9-]+)?', t):
                    s = m.group(0)
                    before = t[max(0, m.start() - 4):m.start()]
                    if before.endswith(("/js", "/img", "img/shows")) or t[m.end():m.end() + 3] == ".js":
                        continue  # asset paths, not page links
                    if s.startswith(("/a-christmas-carol-2027", "/directors-2027")):
                        continue
                    leftover.append((p.relative_to(root).as_posix(), s))
    return pages, broken, leftover

def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--check", action="store_true")
    g.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    repo = Path(__file__).resolve().parent.parent
    if a.check:
        tmp = Path(tempfile.mkdtemp()) / "site"
        shutil.copytree(repo, tmp, ignore=shutil.ignore_patterns(".git"))
        root = tmp
    else:
        root = repo
    log = []
    moves = promote(root, log)
    pages, broken, leftover = check(root)
    print(f"{len(moves)} pages promoted, {pages} pages checked")
    print("\n".join(log[-1:]))
    print(f"broken internal links: {len(broken)}")
    for url, srcs in sorted(broken.items()):
        print(f"  {url}  <- {', '.join(sorted(srcs)[:4])}{' ...' if len(srcs) > 4 else ''}")
    print(f"leftover -2027 references: {len(leftover)}")
    for f, s in leftover[:20]:
        print(f"  {f}: {s}")
    if a.check:
        shutil.rmtree(tmp.parent)
    sys.exit(1 if broken or leftover else 0)

if __name__ == "__main__":
    main()
