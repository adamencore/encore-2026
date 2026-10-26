# HANDOFF 2026-10-26: homepage banners, donate widgets, past shows

Session ran 2026-10-22 through 2026-10-24. Repo `adamencore/encore-2026`,
working clone at `/home/claude/encore-2026`. Everything below is committed and
pushed to `main`, so it is live on Netlify. Working tree was clean at
`3220cd2` with `## main...origin/main`.

This doc supersedes nothing. Read it alongside `ENCORE-MASTER-HANDOFF.md` and
the root `CLAUDE.md`.

---

## 1. What shipped, newest first

| Commit | What |
|---|---|
| `3220cd2` | Donate: first Givebutter widget wired properly |
| `f739a49` | Temporary Givebutter widget probe page |
| `a900577` | Page to Stage: Our Town and Shakespearience removed |
| `ee83d9d` | Past shows: nine recovered shows, campaigns block on donate, both concept pages deleted |
| `70c856d` | Homepage concept v2 (since deleted) |
| `b8295a8` | Homepage cleanup backlog cleared, six items, 179 files |
| `71da362` | Homepage concept v1 (since deleted) |
| `bf9e956` | Homepage: headline in the hero, sliding photo strip retired |
| `2bdeccf` | Homepage: full-bleed hero banner, wordmark in white |
| `c68512c` | Past shows: one card per show, links baked in, runtime shim retired |
| `5f53dd5` | Peter Pan Jr: Saturday closing moves to 5:30pm |
| `b9f2a3e` | Nov 6 page moved off the trolls URL, duplicate title dropped |
| `a6288e0` | Trolls: RSVP form added, CTA pointed at it |
| `52f3887` | Homepage banners: column seam killed, blurbs halved |
| `fafbda4` | Announcement bar removed from every page |
| `5572767` | Christmas Carol pages: black under the banner instead of blue |
| `c36a6d2` | Homepage: Christmas Carol cast cut-out and lower gradient |
| `f517a41` | Homepage: lower gradient and drifting motes on Villains Night |
| `7aa4d04` | Homepage: Villains Night cast cut-out |
| `fdb5d5c` | Homepage: Christmas Carol logo on its banner |
| `7fcbb83` | Homepage: texture and snowfall on the two show banners |
| `b07f98d` | Two homepage show banners rebuilt to the sample layout |

### Homepage show banners

Both banners (`.sb-vn` Villains Night, `.sb-cc` A Christmas Carol) are now
layered. Layer order inside `.sb`, which is `isolation:isolate`:

- `z-0 .sb-tex` background texture photo
- `z-1 .sb-scrim` horizontal colour scrim
- `z-2 .sb-snow` / `.sb-spark` animated canvas, capped at `opacity:.3`
- `z-2 .sb-grad` lower vertical gradient
- `z-3 .sb-grid` the copy and the cast cut-out

Cast cut-outs use `.sb-cutout` with `object-fit:contain`,
`object-position:50% 100%` and a `mask-image` feather on the bottom 10 percent
so they sit on the banner floor without a hard edge. Christmas Carol uses its
logo rather than a title set in type.

Snow: `n = clamp(20, round(width/20), 64)`, radius `0.9 + rand*2.2`, alpha
`0.5 + rand*0.5`. Motes: `n = clamp(16, round(width/42), 38)`, radius
`3.5 + rand*9`, four colours, sprite stops `0 to 1, .30 to .92, .55 to .38,
1 to 0`.

**The contrast ceiling trick is the thing to remember.** Cap the animated
canvas with CSS `opacity`, then draw at high per-particle alpha inside it. No
amount of particle overlap can then exceed the cap. Both banners measure above
AA with the animation running.

Show blurbs are half their old length, per Adam.

### The column seam

Adam reported a visible vertical line down the middle of both banners. It was
my own `.sb-copy` vignette: a radial gradient on an ellipse wider than its box,
still about 30 percent opaque where the copy column ended. Measured 20,60,70
outside against 17,50,60 inside. Both vignettes removed. If a seam ever comes
back, measure pixels either side of the column edge rather than looking at it.

### Hero

Full-bleed, `min-height:100svh`, copy centred. The headline is live text in
the hero, not the wordmark image. The sliding photo strip Adam asked to retire
is parked whole at `_build/parked/homepage-photo-strip.html`: the `nh-hero`
markup, nine CSS rules, the scroll script, and the old hero wordmark block,
with restore instructions in the file. Nothing was thrown away.

Two hero bugs worth not repeating:

- `.hero-copy` collapsed to 167px because `max-width:17ch` resolves against
  the 16px body font, not the headline. Fixed to `min(92vw,900px)` with the
  `15ch` moved onto the `h1`.
- The hero pinned to the bottom on phones because the 860px media query still
  carried `justify-content:flex-end` from the old left-aligned layout.

**Open question, nothing shipped.** Adam asked to see the homepage banner
without the dark overlay over the photo. I measured three options and he has
not picked. The bottom-only scrim option measured 6.64 to 9.66:1 and is the
safe choice if he does not come back to it.

### Announcement bar

Removed from 195 files. It was per-page, not shared, and had drifted to seven
different messages, several months stale. Removing it also fixed a 42px
sticky-nav offset bug on 96 pages.

### Christmas Carol pages

The blue gradient under the ticketing banner is now black, on both Carol pages.

### Trolls / November 6

Elfsight RSVP form added, CTA points at it. The page moved off the trolls URL
to `/november-6-performance` and the duplicate "Trolls The Musical" title
under the image is gone.

### Peter Pan Jr schedule

Saturday November 21 is now 2:00pm and 5:30pm, replacing 5:00pm and 7:30pm.
Swept both `peter-pan-jr-tickets.html` and `peter-pan-jr-2026.html`: visible
copy, the JSON-LD `subEvent` at `2026-11-21T17:30:00-07:00`, the run
`endDate`, and the FAQ answer in both the visible copy and the JSON-LD. The
FAQ now reads: "Thursday is at 7:30pm, Friday at 5:00pm and 7:30pm, and
Saturday at 2:00pm and 5:30pm."

Caught while sweeping: the audition page's grid listed only four of the five
ticketed performances, missing Friday 5:00pm. Added.

### Past shows

Rebuilt from a runtime shim into static markup and expanded from 21 to 30
cards, 29 of them linked. Card shape:

```html
<a class="ps-card" data-slug="SLUG" data-year="YYYY" data-title="sorttitle"
   href="BASE+PATH" target="_blank" rel="noopener"
   aria-label="TITLE, photo gallery"><picture>...</picture></a>
```

The sort bar is static markup plus a small inline script reading `data-year`
and `data-title`. "Featured" restores document order.

Nine shows were recovered that I had previously and wrongly reported as
blocked on missing thumbnails. The artwork was already in the repo under
`img/shows`, `img/gallery`, `img/junior` and `img/hero`. Lesson: search every
image folder before declaring an asset missing.

Gallery base is
`https://www.alanholbenphoto.com/Art-Music-Theater/Theater/Encore-Performing-Arts/n-r9cRgb/`.
A bogus path returns a page titled "404 - AlanHolbenPhotography", so checking
the page title in a real browser is a genuine existence test. That test caught
`2022-Peter-Pan` as a 404 before it shipped; `2022-Peter-Pan-Red-Cast` is the
live folder.

### Page to Stage

Our Town and Shakespearience removed from the Page to Stage page and from both
sitemaps.

### Donate

Banner photo added behind the hero (`img/gallery/hadestown-finale`) with a
`.give-scrim` over it, plus a campaigns block before
`<section aria-labelledby="impact-h">`. See section 3 for the Givebutter state.

### Two concept pages, deleted

Adam asked for a mock-up borrowing speechsisters.com's layout with Encore's
brand and fonts, then after v2 said "ok ignore this new design stlyle, its not
working". Both pages are deleted from the repo. Do not resurrect them unless
he asks. One finding worth keeping: Speech Sisters' muted grey fails AA at
3.56:1 on bone, so if that direction ever returns, `#55646a` is the fix at
5.07:1.

---

## 2. The process failure to not repeat

Adam asked twice, in two different sessions, "Why am i not seeing the updates
i requested above?"

He was right both times. He had sent a twelve-item homepage cleanup list, and
each turn afterwards he sent something new, and each turn I took the newest
request and quietly deferred the list. Six items had never been built at all.
They were all cleared in one 179-file commit (`b8295a8`) once I noticed.

**The rule going forward: a batched list from Adam is a backlog, not a
suggestion. New requests get appended to it, not substituted for it. Before
closing any turn, check the list for unbuilt items and either build them or
say out loud which ones are still open.**

---

## 3. Givebutter: open, and what is actually needed

The donate page is wired correctly now:

- Loader once in `<head>`:
  `<script async src="https://widgets.givebutter.com/latest.umd.cjs?acct=r4LTMUN6MZ570QnU&p=other"></script>`
- Inside the General Support card, line 537:
  `<givebutter-widget id="d54afr"></givebutter-widget>`
- `.camp-alt` link to the full campaign page kept beneath, so the card works
  even if the widget does not render

**How the embed actually works.** Givebutter's embed is two parts: an
account-level loader, identical for every campaign on the account, plus a
per-campaign `<givebutter-widget id="XXXXXX">`. Adam pasted the loader three
separate times believing it was three different campaigns. It was byte
identical each time. That is expected: the loader cannot distinguish
campaigns.

Campaign codes are six characters and sit at the end of the campaign URL:
`givebutter.com/support-encore-performing-arts-d54afr` gives `d54afr`, and the
known older campaign `givebutter.com/RgRkeL` gives `RgRkeL`. `d54afr` was
derived that way, not observed working, because both browsers were unreachable
from the session at that moment.

**Verification still outstanding.** `/gb-widget-test` is a temporary,
unlisted, noindex probe page carrying four labelled candidates: A `d54afr`,
B the full slug, C `RgRkeL`, D the loader alone. Whichever box renders a
donation form confirms the pattern. **Delete `gb-widget-test.html` once
confirmed.**

**Still needed from Adam:** the campaign links for Christmas Carol and Peter
Pan Jr, in the form `givebutter.com/XXXXXX`. The six-character code comes off
the end and both cards go up in minutes. Asking for the script again will not
help; it is the same line every time.

---

## 4. Verification method, since this is what catches the real bugs

Reading the diff is not enough. These checks caught bugs that had already
passed a read-through.

**Serve over HTTP, never `file://`.** Every path on this site is root-relative
(`/img/...`), so `file://` silently fails to load images and any contrast
measurement is then taken against a flat background colour. This was a real
false pass.

```
cd /home/claude/encore-2026 && (python3 -m http.server 8777 &) ; sleep 1.2
```

Then point Playwright at `http://127.0.0.1:8777/`.

**Dismiss the class-promo modal in every render script.** "Find your class
today" / "Maybe later" appears about two seconds after load and covers
screenshots. Click buttons whose text matches "maybe later" or "close", then
`display:none` anything `position:fixed` matching
`[class*="promo"],[id*="promo"],[class*="modal"],[class*="overlay"]`.

**Contrast, measured not eyeballed.** Screenshot a plate with the text hidden
via `visibility:hidden`, crop each element's bounding box, composite the text
colour over every backdrop pixel honouring alpha, take the worst ratio. Skip
pixels matching a known solid highlight, for example the teal `(51,128,147)`
within tolerance 26.

**The rest of the checklist:** tag balance, `node --check` on every inline
script, `json.loads` on every JSON-LD block, render at 320, 390, 768, 1200 and
1600 checking for horizontal scroll, and for a catalogue page assert the
rendered cards rather than the source array.

**JSON-LD editing.** Parse with `json.loads`, modify the object, re-serialise,
splice back by index: `s[:m.start()] + block + s[m.end():]`. Never `re.sub`,
because JSON `\u` escapes are read as replacement templates and corrupt the
block.

**Regex on markup.** A non-greedy `.*?</div>` closes on the first `</div>` and
orphans nested markup. Removing `.nh-collage` that way left four stray divs
and an unbalanced `</div>`. The tag checker caught it before the commit.
Balance-scan instead of using non-greedy regex.

**Image recipe, mandatory, these are photos of minors.**
`ImageOps.exif_transpose`, then `convert('RGBA')` or `convert('RGB')`, then
`Image.new` plus `putdata` to rebuild from raw pixels, then resize LANCZOS,
then save webp and jpg. Verify zero EXIF after. New filename every time so
caches break.

One Pillow trap: `Image.getchannel('A')` returns a **copy**, so mutating it
does nothing. You must `putalpha()` back. I only caught this because the
output bytes were identical to the input.

**Known validator false positives, already verified, do not re-report:**
stray `</body>` on five pages (193 of 312 pages have no `<body>` at all), a
stray `</div>` in `blog/a-magical-week-our-frozen-jr-camp.html`,
`unclosed:script` in `les-miserables-page-to-stage.html`, the check mark
U+2713 flagged as an emoji, and em dashes inside `<title>`, meta
descriptions, CSS comments and the logo `aria-label`.

---

## 5. Source of truth conflicts, both need a human

1. **ThunderTix still sells Peter Pan Jr Saturday at 7:30pm.** The site now
   says 5:30pm. ThunderTix governs what is actually purchasable, so until
   someone changes it there, the two disagree in public. Event ids: Villains
   Night 272127, Peter Pan Jr 272824, A Christmas Carol 272819, Little Women
   270667.
2. **The Google Sheet "2026 Schedule Source of Truth" is behind.** It still
   has the old Peter Pan times and still lists the November 2026 camp that
   Adam asked to remove from the site.

---

## 6. Open items

**Waiting on Adam:**

- Pick the homepage hero overlay treatment. Nothing shipped.
- Christmas Carol and Peter Pan Jr Givebutter campaign links.
- Confirm the Givebutter widget renders, then `/gb-widget-test` gets deleted.
- Elfsight embeds always need a human to click and confirm; Elfsight cannot
  load from the sandbox.

**Past shows, incomplete:**

- Four shows have live galleries but no image anywhere in the repo: Encanto
  2022, Encanto 2023, Descendants 2022, Addams Family Jr 2021.
- Six cards use production stills rather than designed key art.
- Les Mis and Newsies link to rehearsal or promo galleries only.
- Villains Night 2023 has no gallery at all.
- Villains 2025 has rehearsal only, Villains 2026 has promo only.

**Offered, not taken up:**

- Retire `/page-to-stage/our-town` and `/page-to-stage/shakespearience` with
  redirects. Both are still live but orphaned now that the links are gone.
- Delete the duplicate `/shakespearience` at the site root.
- Sweep the teal `.sh-badge`, which measures 4.46:1 across ten pages.
- Clear four orphaned images: `vn-banner`, `cc-banner`, `vn-art-sanderson`,
  `cc-art-poster`.
- Update the Google Sheet for the Peter Pan times and the removed November
  camp.

---

## 7. Standing rules this session confirmed

From `CLAUDE.md` and from Adam directly. None of these changed; all were
exercised.

- Commit and push to `main`. Netlify deploys. No staging branch. Never hand
  Adam a zip unless he asks for one.
- No em dashes and no emojis in page copy, comments, READMEs, alt text or
  aria-labels, even when his source text has them. En dashes in date and time
  ranges are fine. `sensory-friendly-performances.html` still carries about 26
  em dashes in its body copy and has not been cleaned.
- Site-wide sweep before packaging any change to a date, price, age range,
  time or show status. Grep every page for the show name and for the old
  value, and state which pages were searched and which changed.
- Read the Google Sheet before changing show data, and surface conflicts
  rather than picking one side silently.
- Edit the catalogue arrays, not the rendered markup, on `tickets.html` and
  the program pages. Those pages render nothing useful to a plain HTTP fetch.
- Elfsight `platform.js` once in `<head>`, never per embed, and never
  `data-elfsight-app-lazy` with multiple embeds on a page.
- Verify a flag before reporting it. Validators produce false positives.
- Brand: performers are "Young Artists", capitalised. Never "kid", "child" or
  "children" outside licensed proper nouns. Palette is `#338093` teal and
  `#22353d` dark slate.
- Adam hand-edits pages in the repo himself sometimes. Never assume the live
  file is the one last delivered. Pull before touching anything.
