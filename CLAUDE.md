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

**Team Hub gate.** Everything under `/team/*` is password protected by
`netlify/edge-functions/team-gate.js` (env var `PROTECTED_PAGE_PASSWORD`).
It must live in `netlify/edge-functions/`: until 2026-11-02 it sat at the
repo root, Netlify never deployed it, and `/team` was open. After any
deploy, the Netlify deploy summary should list one edge function.

**Photo Library** (`/team/photos`). Page `team/photos.html`, backend
`netlify/functions/photos.mjs` (served at `/team/api/photos/*`, inside the
gate). The catalog lives in a Google Sheet, never in this public repo.
Env vars: `GOOGLE_SERVICE_ACCOUNT_KEY`, `PHOTO_LIBRARY_SHEET_ID`,
optional `SMUGMUG_API_KEY`. Never commit photos of Young Artists here.

**Onboarding portal** (`/onboarding`, `/onboarding/training`). Pages
`onboarding/index.html` and `onboarding/training.html`, backend
`netlify/functions/onboarding.mjs` at `/onboarding/api/*`.

**OPEN PREVIEW as of 2026-11-04.** `PREVIEW_OPEN = true` in BOTH
`netlify/edge-functions/onboarding-gate.js` and
`netlify/functions/onboarding.mjs`, at Adam's request, so the portal can be
walked through without a password while it is being built. While that is
true, both pages are reachable by anyone with the URL and
`/onboarding/api/save` accepts unauthenticated writes. **To go live: set both
constants to false and delete the `.preview` banner block and its CSS from
`onboarding/index.html` and `onboarding/training.html`.** All four changes go
together.

**It has its own gate and its own password, and that is deliberate.**
`netlify/edge-functions/onboarding-gate.js` reads `ONBOARDING_PASSWORD`
(cookie `onboarding_auth`, 14 day session) and falls back to
`PROTECTED_PAGE_PASSWORD` when that is unset. Do not move onboarding under
`/team/*`: a new contractor needs it on day one, and the Team Hub password
also unlocks the Young Artist photo library, which an unscreened person must
not reach before their background check clears.

Responses go to a private Google Sheet (`ONBOARDING_SHEET_ID`), which must be
shared as Editor with the service account's `client_email`. Rows are keyed on
lowercased email and upserted: an empty incoming field keeps whatever an
earlier save stored, so partial progress is never wiped.

**Tax IDs and bank details are never collected here.** The packet puts those in
QuickBooks only, and the function enforces it: free text fields are screened
for SSN shapes, long digit runs and named terms, and a match is refused with a
message pointing at QuickBooks. Phone fields are not screened. If you add a
field, decide whether it belongs in that screened list.

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

**Audience code of conduct.** Every ticketing page carries the
`.house-note` block, "A welcoming house", at the top of the Inclusivity and
accessibility section, immediately above `.incl-groups`. It states that Encore
reserves the right to refuse admission or ask a guest to leave for behavior
toward the company, volunteers, staff or other guests. It is on
`tickets.html`, `a-christmas-carol-tickets.html`, `little-women-tickets.html`,
`peter-pan-jr-tickets.html` and `villains-night.html`, byte-identical on all
five. **New ticketing pages inherit it from the `little-women-tickets.html`
template, so do not strip it along with the template residue.** If the wording
changes, change it on all five. It is the audience counterpart to the
participant code of conduct in section 5 of `terms-and-conditions.html`, so the
two should keep agreeing.

**Announcement bar.** Most pages carry a sticky `.annc` bar with a single
`.annc-link`. It is per-page, not shared, so changing it means touching
every page. It had drifted to seven different messages, several months
stale, before the last sweep.

**Footer and nav** are duplicated per page. Carry both the 980px and 560px
media queries when porting a footer; omitting the 560px one stopped the
footer stacking on phones.

**Google tag and the ThunderTix conversion.** Every served page carries two
snippets, and like the nav and the footer they are per-page, not shared:
the gtag.js loader plus `gtag('config')` for GA4 `G-3D0B1Z5QPP` and Google
Ads `AW-17423659350` in `<head>`, and a delegated click listener before
`</body>` that fires conversion `AW-17423659350/8INxCOv7_bAdENbin_RA` on any
link to a `thundertix.com` host. **A new page built from scratch will not
have them, and the Ad Grant needs at least one conversion a month**, so copy
both from `little-women-tickets.html`. On 344 pages as of 2026-11-02, all
but `team/` and `onboarding/` (both behind gates, deliberately untagged, so
staff and contractor activity stays out of the public GA property) and
parked folders.

The head snippet goes **immediately after `<meta charset>`, not immediately
after `<head>`**. Browsers only sniff the first 1024 bytes for the encoding
declaration, and the template banner comment above `<html>` already pushes
that meta to byte 1018 on `little-women-2026.html`. Inserting in front of it
pushes the declaration out of the window on 22 pages and risks mojibake in
copy that uses middle dots and en dashes.

**Note for sweeps:** that conversion script puts the string `thundertix.com`
on every page, so `grep -rl thundertix` now matches all 344. To find pages
that actually sell tickets, grep for a real `href="https://...thundertix` or
`ticketUrl:"https://...thundertix`. That returns 14.

**Primary seller statement.** Every show and ticket page carries
`<p class="seller-note">`: "Encore Performing Arts produces this show.
Tickets are sold only through our box office, at face value." (`tickets.html`
and `tickets-2027.html` say "these shows".) It is required on the page for
Google Ads event ticket seller certification, it is per-page like everything
else here, and **new ticketing pages inherit it from the
`little-women-tickets.html` template, so do not strip it as template
residue.** On 12 pages as of 2026-11-02. `index.html` and
`villains-night-program.html` do not have it. Never use the word "official"
in this copy.

On heroes that are a photograph or a palette-built gradient, the line carries
a translucent plate (`background:rgba(10,14,18,.58)` on white) because no text
colour clears AA against a highlight: both camp pages and the three
`.pbanner` previews. The `lwt-hero` and `cc-banner` ticket pages pass on
colour alone and have no plate.

**Three pages also say tickets are "sold through our ticketing partner"**
(`tickets.html`, `tickets-2027.html`, `peter-pan-jr-2026.html`). That sits
awkwardly beside "sold only through our box office" for a certification
reviewer. Left alone deliberately; see the 2026-11-02 seller statement
handoff.

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

## Brand palette

**The site's CSS has drifted from the actual brand.** Measured 2026-11-04 by
exporting the "Encore 2026 Brand Proposal" from Canva and sampling the logo
artwork:

| | Brand (canonical) | What the site CSS says |
|---|---|---|
| Teal | `#10789c` | `#338093` |
| Coral | `#e46038` | `#e8716b` |
| Neutral | `#282420` warm near-black | `#22353d` cool slate |

**Coral is a co-primary, not an accent.** In the logo artwork it carries the
same pixel weight as teal, and the proposal shows the wordmark reversed out of
teal, near-black and coral as three equal fields. The site barely uses it.

`onboarding/training.html` is built on the canonical values. The rest of the
site is not, and `#338093` is also the colour behind four separate AA contrast
failures on this project. A palette reconciliation is worth doing as its own
pass; it has not been done.

Canva also holds an "Encore Brand Kit" (`kAExu-Sz5YA`). The connector lists
brand kits but does not expose their colour values, so exporting a design and
sampling it is the way to read the brand.

## Writing style

No em dashes and no emojis anywhere in page copy. Use commas, colons or a
second sentence. Most pages comply; `sensory-friendly-performances.html`
still has about 26 em dashes in its body copy.

Images get EXIF stripped, including GPS, before they go in. When replacing
an image, give it a new filename so caches break.
