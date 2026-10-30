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
| `/little-mermaid` | The Little Mermaid Jr. | Junior Series | 7 to 13 | Dec 14, 2026 | Feb 3 to 6, 2027 | $15 |
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
2. **Key art.** There is none for any 2027 show. Each hero uses a neutral Encore
   production photo from `img/gallery/` with alt text that describes the
   photograph honestly and does not claim it is the show. A Christmas Carol is
   the exception and uses the real `img/shows/cc-banner.jpg`. Every page needs
   its own key art and an OG image at 1200x630.
3. **The Elfsight registration embeds.** Adam is supplying these. Until then every
   "Register to audition" button points at the existing generic
   `/audition-registration`. When the embeds arrive, each show gets its own
   `<slug>-registration.html` on the pattern of `peter-pan-jr-registration.html`,
   and the buttons repoint. Remember the Elfsight rule: `platform.js` once in
   `<head>`, never `data-elfsight-app-lazy` with more than one embed on a page.
4. **Virtual audition submissions** are set to `production@encorepa.org`, which
   is what the sheet lists for all seven. The two Aspire shows use
   `randy@encorepa.org`, worth knowing when those get built.

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
