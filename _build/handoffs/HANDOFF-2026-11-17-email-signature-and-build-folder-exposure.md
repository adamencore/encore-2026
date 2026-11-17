# HANDOFF 2026-11-17: Apple Mail signature, and `_build/` was publicly served

Two things happened in this chat. The first is what Adam asked for. The second
is what building it turned up, and it is the more important of the two.

Commits: `1b2bf55` (signature assets), `7ebcc95` (block `_build/` and
`studio/`), plus a CLAUDE.md correction.

---

## 1. Email signature for Apple Mail

Adam sent a screenshot of a signature design and asked for it as code.

**Design in the screenshot:** teal circular "e!" badge on the left; to the
right, ADAM RECORD in bold caps, Executive Director in teal, 801.452.1153,
encorepa.org as a link, and a row of three teal social icons below.

### What shipped

| File | Size | Notes |
|---|---|---|
| `img/email/sig-encore-badge.png` | 160x160 | displays at 80px, downscaled from `logo.png` |
| `img/email/sig-instagram.png` | 44x44 | displays at 22px, outline glyph |
| `img/email/sig-youtube.png` | 44x44 | displays at 22px, solid badge |
| `img/email/sig-facebook.png` | 44x44 | displays at 22px, solid circle |
| `_build/email-signature/adam-record-signature.html` | 3.5KB | the markup, source only, not served |

All four images verified live at 200 / `image/png` with correct dimensions.

### Decisions worth knowing

**Hosted images, not base64 and not inline SVG.** Inline SVG is stripped by
Outlook. Base64 is stripped by Outlook and parts of Gmail, and it bloats every
message. Absolute `https://encorepa.org/...` URLs are the only form that
survives forwarding into an unknown client. The cost is that the images are now
load-bearing for mail Adam has already sent, which is why CLAUDE.md now says
not to rename or delete `img/email/`.

**Teal is `#338093`, not the screenshot's `#487e91`.** `#338093` is what
`favicon.svg` and the live site CSS use, so the signature matches the site
rather than the mockup. It computes to 4.52:1 on white, which passes AA. The
canonical brand teal is `#10789c` (5.02:1) and if the palette reconciliation in
CLAUDE.md ever happens, this is one more place to sweep. Text is `#22353d`,
the site's neutral, against the mockup's `#243f49`.

**The link is teal and underlined, not browser blue.** The blue in the
screenshot is an unstyled default, not a design choice.

**Phone and website are explicit anchors.** `tel:+18014521153` and
`https://encorepa.org`, each with `color` forced inline. Without that, iOS and
Apple Mail auto-detect the phone number and recolor it blue with an underline,
which is exactly the thing that makes a signature look unfinished.

**Email HTML rules this file follows, all of which matter:** table layout with
`role="presentation"`; every style inline, no `<style>` block and no classes;
`font-family` repeated on every text cell because Outlook does not inherit it;
`mso-line-height-rule:exactly` on every line; `width`/`height` as attributes
*and* in the style; `display:block` on every image to kill the baseline gap;
`alt` on every image; no web fonts, so Mikado is out and the stack is Helvetica
Neue / Helvetica / Arial.

### Verified

- Rendered headless and compared against Adam's screenshot. Matches.
- Icon row left edge aligns with "ADAM RECORD" to 0.0px.
- Every image is 2x its display size.
- Zero horizontal overflow at a 320px viewport.
- Tag balance: 3 tables, 7 `tr`, 11 `td`, 6 `a`, all closed.
- 0 `<style>` blocks, 0 `class=` attributes, 0 relative image paths.
- No em dashes, no en dashes, no emoji.
- Rendered again with images blocked. It degrades to alt text, which is ugly
  but legible; the badge alt was shortened from "Encore Performing Arts" to
  "Encore" so it stops wrapping to three lines and shoving the layout around.

### Install

Easiest path, and the one to give Adam first: open the HTML file in Safari,
select all, copy, then paste into Mail > Settings > Signatures with
"Always match my default message font" **unchecked**. If Mail flattens it, the
fallback is to create a placeholder signature, quit Mail, edit the
`.mailsignature` file in `~/Library/Mail/V10/MailData/Signatures/`, keep the
header lines at the top, paste the markup below them, then Get Info on the file
and tick Locked so Mail does not overwrite it.

### Not done

- Dark mode. Apple Mail in dark mode will put dark `#22353d` text on a dark
  background. The usual fix is forcing a white card behind the whole signature,
  which looks worse in every other case, so it was left alone. If Adam raises
  it, that is the tradeoff to put to him.
- No title/role line for his SunRiver work, no physical address, no pronouns,
  no seasonal show promo strip. None were in the mockup.

---

## 2. `_build/` and `studio/` were being served. They are not now.

This was not part of the request. It surfaced because CLAUDE.md said `_build/`
was "parked and not live", the signature HTML was put there on that basis, and
a routine post-deploy check found it answering 200.

### What was actually reachable

Verified against the live site on 2026-11-17, before the fix:

```
/_build/handoffs/HANDOFF-2026-11-04-contractor-onboarding-portal.md
    200   text/markdown     8133 bytes
/_build/build_pts.py        200   text/x-python
/_build/events.json         200   application/json
/_build/email-signature/adam-record-signature.html
    200   text/html
```

Netlify deploys the whole repo. "Parked" only ever meant "no page links to it".

### How bad

Moderate, not severe, and worth stating precisely rather than either
shrugging it off or overselling it.

- Directory listing is off. `/_build/handoffs/` returned a real 404, so
  nobody could enumerate the folder; reaching a file took the exact filename.
- Nothing on the site links to any of it, and it is not in `sitemap.xml`.
- But `robots.txt` said `Allow: /` with no exclusions, so nothing instructed a
  crawler that found a URL by any other route to leave it alone.
- The contents are internal engineering notes, not credentials. **No secrets
  were in the repo.** The gate passwords (`PROTECTED_PAGE_PASSWORD`,
  `ONBOARDING_PASSWORD`) are Netlify environment variables and were never in
  these files.
- The sharpest item is the onboarding handoff, which describes how the
  onboarding gate works and that `PREVIEW_OPEN` is currently `true`. The
  portal being in open preview is already public by construction, so this is
  a map to an open door rather than a key to a locked one. It is still not
  something to leave sitting on the public web.

### The fix

Top of `_redirects`, above every other rule:

```
/_build/*   /404.html   404!
/studio/*   /404.html   404!
```

**The `!` is load-bearing.** Netlify serves a real file on disk in preference
to an unforced redirect rule, and these paths are all real files, so without
the force flag the rule does nothing at all. `robots.txt` now disallows both as
defense in depth, and the signature page carries `noindex,nofollow` on top of
that.

Re-verified live after deploy: all five previously-reachable paths now return
404, while `/img/email/sig-encore-badge.png`, `/sunriver-promo` and `/tickets`
still return 200, so the new top-of-file rules shadow nothing.

### Follow-ups for whoever picks this up

1. **Check Google Search Console** for any `_build/` or `studio/` URL that got
   indexed before today. If any did, the 404 will clear it, but it is worth
   knowing whether it ever happened. Nobody has looked.
2. **Decide whether handoff docs belong in the repo at all.** They are already
   in the Claude project, which is where Adam reads them. `_build/handoffs/`
   is a second copy that exists only because it was convenient, and it is the
   copy that was exposed. Deleting it removes the problem class rather than
   patching it. This needs Adam's call, so it was not done.
3. **`studio/` is parked Sanity schema.** Same reasoning: if Sanity is not
   coming back, it can go.
4. CLAUDE.md has been corrected. The old line is the reason this happened, and
   the new one says plainly not to assume an unlinked folder is private.

---

## Files touched

```
img/email/sig-encore-badge.png                              new
img/email/sig-instagram.png                                 new
img/email/sig-youtube.png                                   new
img/email/sig-facebook.png                                  new
_build/email-signature/adam-record-signature.html           new
_redirects                                                  block rules at top
robots.txt                                                  Disallow _build, studio
CLAUDE.md                                                   corrected the "parked
                                                            and not live" claim,
                                                            added img/email/ warning
```
