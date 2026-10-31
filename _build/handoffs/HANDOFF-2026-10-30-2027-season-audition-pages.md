# HANDOFF 2026-10-30: 2027 season audition pages

Seven performer-facing audition pages, built from the v2 show/audition template
(`peter-pan-jr-2026.html`) and driven entirely by the Source of Truth sheet, tab
`2027 Show Information`.

**They ship staged, not launched:** `noindex, nofollow`, absent from
`sitemap.xml`, and not linked from the nav or any live page. Three things are
unconfirmed (licensed titles, key art, creative teams) and publishing a public
page with a guessed licensed title would be worse than holding it. Flipping each
one live is a one-line robots change plus a sitemap entry.

## The seven

| URL | Title as built | Program | Ages | Auditions | Performances | Tickets |
|---|---|---|---|---|---|---|
| `/little-mermaid` | The Little Mermaid | Junior Series | 7 to 13 | Dec 14, 2026 | Feb 3 to 6, 2027 | $15 |
| `/little-shop` | Little Shop of Horrors | Signature Series | 13 to 18 | Jan 9, 2027 | Mar 18 to 22, 2027 | $12 to $25 |
| `/charlie-and-the-chocolate-factory` | Charlie and the Chocolate Factory Jr. | Emerging Artists | 12 to 14 | Feb 20, 2027 | May 5 to 8, 2027 | $15 |
| `/finding-nemo` | Finding Nemo Jr. | Emerging Artists | 12 to 14 | May 15, 2027 | Jul 17 to 24, 2027 | $12 to $25 |
| `/addams-family` | The Addams Family | Signature Series | 13 to 18 | Jun 26, 2027 | Sep 10 to 18, 2027 | $12 to $25 |
| `/annie` | Annie Jr. | Junior Series | 7 to 13 | Sep 20, 2027 | Nov 19 and 20, 2027 | $15 |
| `/a-christmas-carol-2027` | A Christmas Carol: A New Musical | Show with a Pro | 7 to 18 | Sep 27, 2027 | Nov 29 to Dec 18, 2027 | $12 to $25 |

**Naming follows Adam's rule**: no year in the slug, except where the show
already has a URL on the site. Only A Christmas Carol qualifies, because
`/a-christmas-carol-2026` exists. Finding Nemo Jr. has run before but has no
page of its own, only a Past Shows card, so it takes the bare slug.

## The two held back

Adam asked for all nine productions. Two are not buildable yet.

1. **Spring Aspire** has **no audition date**. The sheet says "December date"
   for the vocal audition, the dance call and callbacks. An audition page whose
   whole purpose is the audition date cannot ship without it. Everything else is
   there: parent meeting Jan 14, rehearsals Jan 14 to April 15 on Thursdays
   4 to 8pm, performances April 21 to 24, sensory April 21 at 5:00pm. Ticket
   price is `??` in the sheet.
2. **Fall Aspire** has a full schedule but **two blockers**:
   - **No title.** The sheet says "Fall Aspire". The performance-date block in
     columns W and X labels the Oct 25 to 30 window "Villains", so it is almost
     certainly Villains Night 2027, but the sheet does not say so in the title
     row.
   - **A URL collision.** By Adam's rule it wants `/villains-night-2027`, since
     `/villains-night` already exists. **`villains-night-2027.html` is already
     taken by a redesign preview page** from the 2027-style track, and that
     preview URL is one Adam has been given for review. Both cannot live at one
     URL.

   Its data, for whenever that is settled: auditions Tue Jul 20, 2027 4 to 9pm
   at St. George Academy, dance call Jul 21, callbacks Jul 22, parent meeting
   Aug 14, rehearsals from Aug 19 on Thursdays 4 to 8pm, tech Oct 25 to 27,
   performances Oct 28 and 29 at 5:00pm and 7:30pm, sensory Wed Oct 27 at
   5:00pm, price `??`.

   **Recommendation:** confirm it is Villains Night 2027, then move the preview
   to `villains-night-preview.html` and repoint the four preview pages that link
   to it (home, tickets, sensory, programs). That gives permanent public content
   the natural URL and leaves the temporary scaffolding to move.

## What is real on these pages, and what is not

**Real, from the sheet:** ages, program and its link, vocal audition date, time
and location, dance call, callbacks, parent meeting, rehearsal date range, days
of the week, times and location, tech week dates and times, the full in-theater
date list, performance dates and times, sensory-friendly date and time, ASL date
where there is one, and ticket prices.

**Not invented.** Where the sheet is blank the page says so rather than guessing:

- **Creative teams.** Every creative and design row in the sheet is empty for all
  17 shows, so the section reads "The creative team will be announced before
  auditions" with no cards.
- **Participation fees.** Not in the sheet at all. The template's fee card and
  the "what you'll need to register" checklist are **not rendered**, and the FAQ
  says the fee is not set yet and to contact us. The 2026 pages show $295 for
  Peter Pan Jr.; nothing in the 2027 data supports carrying that across.
- **Ticketing.** No ThunderTix event exists for any 2027 show, so there is no Buy
  button, and the JSON-LD carries **no `offers` and no `subEvent`**. Prices
  appear as plain text in the schedule block only. The per-performance card grid
  from the Peter Pan page is also left out, since that grid should be built from
  confirmed ThunderTix performances, not from a date range.
- **Weekday names.** Used only where the sheet supplies them, never computed. So
  the sensory line reads "November 30 at 5:00pm" rather than naming a weekday
  the sheet did not give.

**Needs your input before any of these go live:**

1. **Confirm the licensed titles.** I used the sheet's titles plus the edition
   suffix each tier normally licenses: Jr. for Junior and Emerging Artists, full
   edition for Signature. So "Little Shop" became *Little Shop of Horrors*, and
   "Charlie and the Chocolate Factory" became *Charlie and the Chocolate Factory
   Jr.* These appear in the title tag, h1, meta, JSON-LD and FAQ, so a correction
   is a regeneration, not a hand edit.

   **Two are now settled by the key art**, which is the better authority than my
   guess: the Finding Nemo art carries "JR" so that page keeps *Finding Nemo
   Jr.*, and the Addams art carries no suffix so that page keeps *The Addams
   Family*.

   **One changed because of it.** The Little Mermaid art reads "encore!
   presents / Disney / THE LITTLE MERMAID" with **no JR**, so that page was
   regenerated from *The Little Mermaid Jr.* to **The Little Mermaid**. Worth a
   second look: a Junior Series show for ages 7 to 13 would normally license the
   JR edition, so if the art simply drops the suffix for design reasons while
   the licensed title keeps it, that page needs reverting. It is a one-word
   change in the generator.
2. **Key art. Three of seven now have it**, supplied by Adam on 2026-10-30:
   The Addams Family, Finding Nemo Jr. and The Little Mermaid, each installed at
   `/img/shows/<slug>/band.jpg` plus `.webp` and a 1200x630 `og.jpg` plus
   `.webp`. A Christmas Carol uses the existing `img/shows/cc-banner.jpg`.

   **The three sources still carried EXIF**, 7, 7 and 7 entries, so the chat
   upload did not strip it this time. The full rebuild-from-raw-pixels recipe
   ran and zero EXIF is asserted on all twelve outputs. Do not assume uploads
   arrive clean.

   Little Shop of Horrors followed on the same day, same recipe, EXIF 5 to 0.

   **Still on stand-ins:** Charlie and the Chocolate Factory Jr. and Annie Jr.
   Each hero is a neutral Encore production photo from `img/gallery/` with alt
   text that describes the photograph honestly and does not claim it is the
   show, and their OG image is that same photo rather than a 1200x630 crop.
3. **The Elfsight registration embeds.** Adam is supplying these. Until then every
   "Register to audition" button points at the existing generic
   `/audition-registration`. When the embeds arrive, each show gets its own
   `<slug>-registration.html` on the pattern of `peter-pan-jr-registration.html`,
   and the buttons repoint. Remember the Elfsight rule: `platform.js` once in
   `<head>`, never `data-elfsight-app-lazy` with more than one embed on a page.
4. **Virtual audition submissions** are set to `production@encorepa.org`, which
   is what the sheet lists for all seven. The two Aspire shows use
   `randy@encorepa.org`, worth knowing when those get built.

## Per-show palette, and how it was checked

The template drives the whole page from four custom properties, and
`little-mermaid` is the first page to override them, sampled from its key art:

| Variable | Was | Now | What it drives |
|---|---|---|---|
| `--show-mid` | `#36575c` | **`#1e4876`** | `--charcoal` (body text), `--accent`, `--teal` |
| `--show-deep` | `#1f3a3e` | **`#081d36`** | `--accent-2`, the hero art backdrop |
| `--show-bright` | `#4f8278` | **`#2e669d`** | `--charcoal-2` (background only), gradient light end |
| `--show-tint` | `#cfe1dd` | **`#b1dbee`** | pale highlight, the h1 `<em>` |

Sampled by median-cut quantize plus region averages, never by eye.
`#1e4876` is 7.4% of the image, `#081d36` is the single most dominant at
13.4%, `#b1dbee` is the pale highlight at 3.9%.

**The obvious pick for `--show-bright` was wrong.** The top light ray,
`#53a5da` at 9.2% of the image, is the colour that makes the art feel like
the art. But `--show-bright` is the light end of the hero gradient, and
cream tagline text over `#53a5da` measures **2.14:1**. `#2e669d` is the
lightest of the art's own blues that still carries cream at 4.75:1 and the
tint h1 at 4.06:1. The ray colour stays where it belongs, in the key art
beside the text.

`--show-mid` doubles as body text, so it had to be dark: it measures
**9.13:1** on paper, better than the 7.66:1 of the slate it replaced.

### Measuring it

Contrast was measured on the rendered page, not computed from the
stylesheet, with two refinements that matter:

1. **`color: transparent`, not `visibility: hidden`.** Hiding an element
   also hides its own background, so dark pill buttons measure against
   whatever is behind them instead of against themselves. Transparent text
   removes the glyphs and leaves every background, gradient and image intact.
2. **Per-element screenshots, not crops from a full-page shot.** A `fullPage`
   capture grows the viewport to the document height, which re-lays-out the
   sticky nav and every `min-height` block, so boxes measured beforehand point
   at the wrong pixels. The first run produced 54 nonsense failures that way,
   with backdrops reading back as the text colour itself.

**A control run matters more than the raw count.** Measured against `annie`,
which still has the template palette: 46 failures there, and the Little
Mermaid palette introduced 5 new ones plus 4 made worse, all of them in the
hero. Darkening `--show-bright` fixed the h1 and the tagline at both widths.

**The one remaining non-control failure is a verified false positive.** The
date caption over the art reported 1.09:1, because `.cap` carries 48px of top
padding whose box overlaps the cream "MERMAID" lettering. Measuring the inked
glyph run alone, via a Range over the text node, gives **16.67:1 at 390px and
17.58:1 at 1200px**. The caption is fine; the element box is not the text.

Most of the remaining failures are inherited from the template and are
present on all seven pages. Worth a separate pass, not a palette change.

## Little Shop of Horrors: a monochrome palette

Key art is cracked black with cream dripping lettering. Two colours, no hue
to borrow, so this palette is monochrome on purpose.

| Variable | Value | Source |
|---|---|---|
| `--show-deep` | `#060708` | the cracked black, 19.0% of the image, most dominant |
| `--show-mid` | `#202122` | the lifted grey in the texture, 6.9%. Body text at 15.73:1 on paper |
| `--show-tint` | `#f0ede5` | the dripping lettering, 14.2%. 17.23:1 on deep |
| `--show-bright` | `#333538` | **interpolated, not sampled**, so the hero gradient has a visible light end. Carries cream at 9.75:1 |

**Dropping hue was checked first, not assumed safe.** In-body links are marked
by `font-weight: 600` plus a `border-bottom`, and already take `var(--charcoal)`,
so they never relied on colour to read as links. A monochrome palette costs no
link affordance here. Had links been colour-only, this palette would have needed
an accent that is not in the art.

Result against the `annie` control: **24 flagged elements versus 32, zero new
failures, 8 improved and 8 gone entirely.**

### Three bugs in the measuring script, all of which invented failures

Worth knowing, because the same script will be used on the remaining pages.

1. **`getComputedStyle` can return `color(srgb 0.10 0.10 0.11)`**, not just
   `rgb(26, 26, 27)`. Reading those 0-to-1 floats as 0-to-255 turned every such
   colour into near-black and produced a page full of phantom failures.
2. **`locator.screenshot()` scrolls the element to the top of the viewport**,
   parking it under the sticky nav, which then reads as the backdrop. Fixed by
   hiding `position: fixed` overlays and unsticking `position: sticky` chrome.
   Note the first attempt at this set the fixed mobile menu to `static`, which
   dropped a full-height dark panel into the document flow and made things
   worse.
3. **Worst-pixel-in-box counts decorative dark marks inside the text box.**
   The two surviving "failures" on this page are `.pill` at 1.00 and `.faq .ans`
   at 1.08. Both are artifacts: the pill's own 7px bullet dot is `--charcoal`,
   the same colour as the pill's text, and the FAQ answer contains a link with a
   `--charcoal` bottom border. The method finds those and calls them the
   backdrop. Rendered, the pill is charcoal on cream at roughly 14:1 and the FAQ
   answers are dark on white. Both artifacts appear on the control too.

**The lesson for the next page: a contrast number that looks catastrophic
(1.00, "X on X") is almost always the method, not the page. Screenshot the
element and look before changing anything.**

## The template-residue guard, and the two bugs it caught

New pages from this template are exactly where the Villains Night bug came from,
when a page shipped live carrying Little Women's subtitle, its double-cast
paragraph and its ThunderTix event id. So the generator asserts that none of
these survive into any output: `Peter Pan`, `peter-pan`, `Neverland`,
`Tinker Bell`, `Wendy`, `Captain Hook`, `Lost Boys`, `272824`, `$295`,
`Randy Sly`, `randy-sly`, `thundertix`, `Sep 21`, `September 21, 2026`,
`class="closed-note"`, `class="conflict-note"`, and the template's four
`[POSTER]`, `[REGISTER]`, `[DISCOUNTS]`, `[CTA-IMAGE]` markers. Plus zero em
dashes, each document tag exactly once, every JSON-LD block parsing, and every
referenced local image existing on disk.

It caught two real problems on the first two runs:

1. **The template's own header comment survived**, carrying "Peter Pan Jr." twice
   and a reference to the Lion King page. The pattern expected the comment to
   close with hyphen rules; it closes with equals rules. Now anchored on the
   doctype and the first `-->` instead.
2. **`closed-note` tripped the guard from the stylesheet**, not from markup. The
   CSS rules for `.closed-note` and `.conflict-note` are still defined in the
   template's stylesheet and are now unused, along with `.perf-grid`, `.pf`,
   `.fee-card`, `.checklist` and the team-card rules. Left defined on purpose, so
   those blocks can come back when there is data for them. The guard now checks
   for `class="closed-note"`.

## Verification

- **Structure.** Every JSON-LD block parses, and each page's `WebPage.url` was
  asserted to end in that page's own slug, which is the check that actually
  catches a copied canonical. `node --check` passes on every inline script. Each
  of `<html>`, `<head>`, `<body>`, `<main>` and their closers appears exactly
  once. Zero em dashes.
- **Staging confirmed:** all seven carry `noindex, nofollow`, none appears in
  `sitemap.xml`, and nothing on the site links to them.
- **Rendered over HTTP** at 320, 390, 768, 1200 and 1600: no horizontal scroll,
  no broken images, no JavaScript errors. Section count, audition card count,
  FAQ count and the stat bar were asserted from the rendered DOM rather than the
  source.

## Open

1. **The two Aspire shows**, as above. Spring needs an audition date; Fall needs
   a title and a URL decision.
2. **Licensed titles, key art, creative teams, fees, Elfsight embeds**, as above.
3. **Camps are not built.** The other eight sheet entries are the monthly camps.
   They use a different template (`little-mermaid-camp-2026.html`) and most have
   no show title yet, just "Jan Camp", "March Camp" and so on.
4. **Per-show ages still conflict with the program bands.** Carried over from
   `HANDOFF-2026-10-30-age-range-sweep.md`. These seven pages state the program
   band for their tier, which is the ruling, so if a show is meant to flex its
   own range, that is a per-page change.
5. **The sheet's performance-date block lives outside the structured columns.**
   Columns W and X hold a pasted list pairing date windows with show names. It is
   the only place the Oct 25 to 30 window is labelled "Villains". Worth folding
   into the structured rows so it is not lost.
