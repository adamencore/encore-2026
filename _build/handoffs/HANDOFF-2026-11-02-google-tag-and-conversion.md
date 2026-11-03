# HANDOFF 2026-11-02: Google tag and ThunderTix click conversion

Encore has a Google Ad Grant, up to $10,000 a month in free Search ads, and
Google requires at least one tracked conversion a month to keep it. **The site
had no Google tag at all.** Tickets are sold on `encoreperformingarts.thundertix.com`,
a domain we cannot tag, so a click through to ThunderTix is the conversion.

## IDs now live

| Item | Value |
|---|---|
| GA4 measurement ID | `G-3D0B1Z5QPP` |
| Google Ads tag ID | `AW-17423659350` |
| Conversion `send_to` | `AW-17423659350/8INxCOv7_bAdENbin_RA` |
| Conversion in Google Ads | Ticket click to ThunderTix (Begin checkout, primary) |

## Scope: 344 pages, no shared layout

There is no template, partial or include on this site. Every page is a
standalone HTML file with its own duplicated head, nav and footer, so both
snippets went into all 344 served pages individually.

| Group | Files | Tagged |
|---|---|---|
| Root pages, live | 94 | yes |
| Root pages, `-2027` redesign previews | 22 | yes |
| `blog/` | 105 | yes |
| `blog-2027/` | 104 | yes |
| `page-to-stage/` | 11 | yes |
| `classes/` | 6 | yes |
| `shows/`, `past-shows/` | 2 | yes |
| `team/` | 5 | **no** |
| `_build/`, `studio/` | 2 | **no** |

**Two scope decisions worth knowing about.**

1. **The `-2027` previews were tagged even though they are noindex and
   unlinked.** They are a full redesign that will eventually replace the live
   pages. If they went untagged, the day that track goes live the entire site
   would silently lose its Google tag and the Ad Grant would break with no
   warning. Tagging them now costs nothing, since they get no traffic.
2. **`team/` was deliberately skipped.** It is the staff hub behind the
   `team-gate` edge function, password protected, so it is not ad traffic and
   tagging it would pour internal staff activity into the public GA property.
   Say the word and it takes one line to include.

## One deviation from the handoff, and why

The handoff said to put the tag **immediately after the opening `<head>` tag**.
It is instead immediately after the `<meta charset>` line, one line later.

Browsers only scan the **first 1024 bytes** of a document for the encoding
declaration. Thirty one of these pages open with a long template banner comment
before `<html>`, and on `little-women-2026.html` that already pushes the charset
meta to **byte 1018**. Inserting 380 bytes of script in front of it would have
shoved the declaration out of that window on **22 pages**, and the copy on this
site uses literal middle dots and en dashes, which is exactly the content that
turns into mojibake when encoding detection falls back.

The tag still loads before everything else on the page, so tracking is
unaffected. This was the only change made to the specified approach.

## What was added

**In `<head>`, after the charset meta:** the gtag.js loader plus `gtag('config')`
for both GA4 and Ads, byte for byte as specified.

**Before `</body>`:** a delegated capture phase click listener that fires the
conversion on any link whose hostname ends in `thundertix.com`.

### The listener never delays a click, which is worth knowing

All **74** ThunderTix anchors in the markup are `target="_blank"`. Every one of
them takes the listener's new tab branch: it fires a beacon and returns
immediately, with **no `preventDefault` and no 1 second hold**. The same tab
branch that waits on `event_callback` is dead code against the current markup.
It was kept exactly as specified because a future same tab link would need it.

That means the rollout cannot have broken a ticket link. There is no code path
on any current page where navigation is intercepted.

## Verification

`tickets.html` and the program pages hold their content in a JS array, so
everything below was measured in a real browser over HTTP, not from source.

- **Exactly once per page, all 344 uniform:** GA4 id x2 (loader plus config),
  Ads id x3 (config plus two `send_to`), `send_to` x2, gtag.js loader x1,
  listener x1, `</body>` x1. Zero pages deviated.
- **No layout changed.** A HEAD checkout was served on a second port and every
  test page rendered side by side at **320, 390, 768, 1200 and 1600**. Document
  scroll width, scroll height, anchor count, image count and rendered text
  length were identical on all eleven pages at all five widths. No horizontal
  scroll, no new JavaScript errors.
- **Every JSON-LD block still parses**, 298 of them, and **every one of the 1,260
  pre-existing inline scripts is byte identical** to HEAD. That was checked by
  diffing the full set of script blocks per page against `git show HEAD:`, not
  by reading the diff.
- **Both new snippets pass `node --check`.**
- **The conversion actually fires.** Clicking a real ThunderTix link on
  `a-christmas-carol-tickets.html` and on `index.html` pushed exactly
  `["event","conversion",{"send_to":"AW-17423659350/8INxCOv7_bAdENbin_RA","transport_type":"beacon"}]`
  into `dataLayer`, which is the precise hand off gtag.js reads to send the hit.
  The gtag.js loader request was confirmed firing with the right GA4 id.

Google's own domains are not reachable from the build sandbox, so the hit could
not be watched leaving the machine. The dataLayer push is the part this repo
controls and it is correct. Tag Assistant is the right place to confirm the last
hop.

### Two flags raised by the checkers, both verified as false alarms

- **`page-to-stage/hadestown-pro-shot.html` looked like it had three `<head>`
  tags.** Lines 438 and 592 are the literal text "`<head>`" inside Elfsight
  comments. One real head. The insert anchors on `<html>` immediately followed
  by `<head>` so it could not latch onto those.
- **Five files look like they are missing `<body>`:** `blog.html`,
  `blog/index.html` and three blog posts. They have `</body>` but no opening
  tag. **Pre-existing, confirmed against HEAD**, and valid HTML, since the body
  start tag is optional. Not worth fixing, but now written down.

## Live verification on encorepa.org, after deploy

Done in a real browser against the live site, since the build sandbox cannot
reach .

**All four pages from the handoff's Step 6 serve the right thing:** ,
,  and  each carry
GA4 x2, Ads x3,  x2 and the listener x1, with the tag directly after
the charset meta, which lands at byte 62, 514, 874 and 62 respectively, all
comfortably inside the 1024 byte window.

**Google's own library really loaded**, not just our snippet: ,
 and  all exist on the page, and those are created
by gtag.js, not by anything in this repo.

**A real Buy tickets click sends a real conversion.** Resource timing showed
these appear on the click, which is the hit itself rather than a dataLayer push:

- 
- 
- 

GA4 page views are landing too, at .

**Tickets still open normally.** A probe on the anchor itself, which runs after
the site's capture phase listener, reported . The
listener does not cancel navigation. All 19 ThunderTix links on the Carol page
are .

**Three test conversions were fired during this check**, from one browser on
2026-11-02 around 7:10pm. They will appear in Google Ads. They are real, so
the grant's one conversion a month requirement is already satisfied for
November, but discount them when reading early numbers.

## Deploy

Commits `ddb6231` (pages) and `aee06f7` (this doc plus CLAUDE.md), message `Add Google tag (GA4 + Ads) and ThunderTix click
conversion`, pushed to `main`. Deploy `6ae940d2`, ready, published 2026-11-02 7:03pm Mountain, 22 second build, 344 generated pages uploaded, edge function still deployed, secret scan clean. Netlify project `encore-2026`, production,
`https://encorepa.org`.

## Open items

1. **`/tickets` itself produces no conversions.** Its catalogue routes to show
   pages (`/little-women-tickets`, `/a-christmas-carol-tickets`) rather than
   straight to ThunderTix, and the one direct ThunderTix entry, Little Mermaid
   Camp, auto retired when its `ends` date passed. So an ad pointing at
   `/tickets` converts one click deeper, on the show page. That still tracks
   fine, it is just worth knowing when reading the Ads report.
2. **No CSP exists** on this site. `netlify.toml` sets `X-Frame-Options`,
   `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, and
   there is no `_headers` file and no CSP meta tag, so Step 4 of the handoff
   needed nothing. If a CSP is ever added, it has to allow googletagmanager,
   google-analytics, googleadservices and doubleclick or tracking dies quietly.
3. **The privacy policy does not mention analytics or advertising cookies.**
   The site now sets Google Analytics and Google Ads cookies on every page.
   `privacy-policy.html` should say so. Worth an hour.
4. **New pages need the tag.** It is per page, like the nav, the footer and the
   announcement bar. `little-women-tickets.html` is the template new ticketing
   pages are built from and it now carries both snippets, so new ticket pages
   inherit them. Anything built from scratch will not.
