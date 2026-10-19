# encorepa.org

Static HTML site for Encore Performing Arts, a youth theater nonprofit in
St. George / Washington, Utah. No build step. Committing to `main` deploys
via Netlify.

Owner: Adam Record, Executive Director.

## Deployment

Commit and push to `main`. Netlify builds automatically, usually under a
minute. There is no staging branch and no build command for the HTML.

Do not hand Adam a zip of files to upload unless he asks for one. That was
the old workflow (GitHub web uploader) and it caused repeated partial
pushes, a merge conflict, and one occasion where the zip itself got
committed to the repo.

## Layout

All page HTML lives at the repo root, one file per URL, no extension in the
live URL (`tickets.html` serves `/tickets`). Subfolders: `img/`, `js/`,
`fonts/`, `blog/`, `classes/`, `shows/`, `page-to-stage/`, `netlify/`.
`sitemap.xml` and `_redirects` are at the root. `studio/` and `_build/` are
parked and not live.

Images live under `img/` by kind: `img/shows/`, `img/team/`, `img/gallery/`,
`img/hero/`, `img/blog/<post-slug>/`.

## Page conventions

**Catalogue-driven pages.** Several pages hold their content in a JS array
near the bottom rather than in markup:
- `tickets.html` has show objects with `status`, `ends`, `ticketUrl`. The
  `ends` date auto-retires a show from the list.
- Program pages (`junior.html`, `emerging-artists.html`, `senior.html`,
  `classes.html`) hold `const OFFERINGS = [...]`.

Edit the array, not the rendered markup. These pages render nothing useful
to a plain HTTP fetch, so verify them in a real browser.

**Structured data duplicates visible content.** Every show page carries a
JSON-LD block with event dates, prices, subEvents and FAQ answers that
repeat what is on the page. A text change that misses the JSON-LD leaves
the two disagreeing. Before doing find-and-replace on a page, pull the
`<script type="application/ld+json">` blocks out to placeholders, do the
text edits, parse and edit the JSON separately, then reinsert. Editing
JSON-LD with regex corrupts it.

**Show pages come in pairs.** The audience-facing ticketing page and the
performer-facing audition page are separate:
- `/little-women-tickets` + `/little-women-2026`
- `/villains-night` + (Aspire program page)
- `/a-christmas-carol-tickets` + `/a-christmas-carol-2026`
- Peter Pan has only `/peter-pan-jr-2026` so far.

New ticketing pages are built from `little-women-tickets.html`. When you do
that, strip the template residue. A Villains Night page shipped live with
Little Women's subtitle, its double-cast paragraph, and its ThunderTix
event id on the Buy tickets button.

**Announcement bar.** Most pages carry a sticky `.annc` bar with a single
`.annc-link`. It is per-page, not shared, so changing it means touching
every page. It had drifted to seven different messages, several months
stale, before the last sweep.

**Footer and nav** are duplicated per page. Carry both the 980px and 560px
media queries when porting a footer; omitting the 560px one stopped the
footer stacking on phones.

## Site-wide sweep rule

A fact that appears on one page almost always appears on several, plus in
JSON-LD, plus in meta descriptions. Before packaging any change to a date,
price, age range, time or show status, grep every page for the show name
and for the old value, and state which pages were searched and which
changed. This rule exists because a Carol date change was applied to one
page and missed on `tickets.html`, and because Peter Pan ages were swept
site-wide while Carol ages were not.

## Verification before shipping

Reading the diff is not enough. Several bugs got through code review and
were only caught by rendering:
- tag balance, `node --check` on each inline script, `json.loads` on each
  JSON-LD block
- render at 320, 390, 768, 1200 and 1600 and check for horizontal scroll
  (Playwright with the preinstalled Chromium)
- for a catalogue page, assert the rendered cards, not the source array
- contrast computed numerically, never eyeballed. A logo SVG shipped at
  1.8:1 on black because it carried a hardcoded fill.
- anchor links need `scroll-margin-top` to clear the sticky nav. Measured
  nav bottom is about 117px; the site uses 140px.

Validators produce false positives. A `<picture>` count on
`aspire-performing-co.html` looks unbalanced because one tag sits inside an
HTML comment. Verify a flag before reporting it.

## Third-party

- **Google Analytics 4**, measurement ID `G-DV819LQ0M7`. The gtag.js
  snippet sits in `<head>` directly after `<meta charset>` on every live
  page. There is no shared layout, so a new page gets the tag only by
  carrying it from the page it was cloned from. Check for it before
  shipping a new page: `grep -L G-DV819LQ0M7 *.html */*.html` should print
  nothing (ignore `studio/` and `_build/`, which are not live). Never add
  it twice on one page and never add a second property or GTM container
  without removing this one.
- **ThunderTix** for ticketing. Current event ids: Villains Night 272127,
  Peter Pan Jr. 272824, A Christmas Carol 272819.
- **Elfsight** for forms. Load `platform.js` once in `<head>`, not per
  embed, and do not use `data-elfsight-app-lazy` with multiple embeds on a
  page. Two script tags caused only one of two forms to render. Elfsight
  cannot be loaded from the sandbox, so embeds are the one thing that
  always needs a human to click and confirm.
- **Givebutter** for donations, **Resend** for email, **Sanity** parked.

## Source of truth

Show data comes from the Google Sheet "2026 Schedule Source of Truth",
sheet `Show Information`. Read it before changing dates, times, prices,
sensory or ASL performances. It is authoritative for intent but can lag
reality: ThunderTix governs what is actually purchasable, and the two have
disagreed. When they conflict, say so rather than picking one silently.

## Writing style

No em dashes and no emojis anywhere in page copy. Use commas, colons or a
second sentence. Most pages comply; `sensory-friendly-performances.html`
still has about 26 em dashes in its body copy.

Images get EXIF stripped, including GPS, before they go in. When replacing
an image, give it a new filename so caches break.
