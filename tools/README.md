# Encore — Gallery & Blog photo workflow

Goal: get lots of photos (blog posts, Past Shows galleries up to ~200 each)
onto the site WITHOUT routing them through a Claude chat. You process them
locally, then push with GitHub Desktop. Claude only built the machinery.

## One-time setup
```
pip install pillow
pip install pillow-heif      # only if you have iPhone .HEIC photos
```

## Add a Past Shows gallery (run once per show)
```
python3 tools/optimize-gallery.py \
    --slug newsies-2024 \
    --title "Newsies" \
    --year 2024 \
    --blurb "Summer 2024 at the Electric Theater." \
    --src "/path/to/folder/of/raw/newsies/photos"
```
What it does:
- resizes each photo to a web "full" (~1600px) + "thumb" (~600px), WebP
- fixes sideways orientation, strips camera/location metadata
- writes  img/gallery/newsies-2024/{full,thumb}/001.webp ...
- writes  img/gallery/newsies-2024/manifest.json
- updates img/gallery/index.json  (the Past Shows list)

Then: open GitHub Desktop -> you'll see the new files under img/gallery/ ->
commit -> push. Netlify deploys automatically. The show now appears at
/past-shows and its gallery at /gallery/newsies-2024.

## Notes
- Keep your full-res ORIGINALS somewhere safe (Drive / hard drive). Only the
  web-optimized WebPs go in the repo — that keeps the site fast and the repo small.
- Re-running the same --slug cleanly overwrites that gallery.
- To remove a show: delete its img/gallery/<slug>/ folder AND its entry in
  img/gallery/index.json, then push.
- The Past Shows page shows a friendly "check back soon" message while empty.

## Blog photos (when you're ready)
Same idea — download the images off Squarespace once, optimize, and we'll
point the blog <img> tags at the new local /img/blog/... paths. Ask Claude to
generate the downloader + the src-rewrite script when you want to tackle it.
