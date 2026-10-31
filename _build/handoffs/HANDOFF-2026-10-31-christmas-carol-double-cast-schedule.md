# HANDOFF 2026-10-31: A Christmas Carol double-cast schedule

Adam supplied the final performance schedule, split into a **Figgy cast** and a
**Plum cast**, with three dark nights.

## The net change

The site had **20 rows**. It now has **18**: sixteen ticketed performances plus
two free sensory-friendly shows, nine per cast.

| Change | Detail |
|---|---|
| **Removed** | Wed Dec 9, Mon Dec 14, Tue Dec 15 |
| **Added** | Fri Dec 4, 5:00pm, a second free sensory-friendly performance (Plum) |
| **Added** | a Figgy or Plum label on every one of the 18 performances |

The run still opens Mon Nov 30 and closes Fri Dec 18, so every "November 30
through December 18" string on the site stays correct. Only the counts moved.

### The schedule as built

**Figgy (9):** Nov 30 7:00 opening, Dec 1 5:00 sensory, Dec 1 7:00, Dec 3 7:00,
Dec 5 7:00, Dec 7 7:00, Dec 10 7:00, Dec 12 2:00 ASL matinee, Dec 16 7:00.

**Plum (9):** Dec 2 7:00, Dec 4 5:00 sensory, Dec 4 7:00, Dec 5 2:00 matinee,
Dec 8 7:00, Dec 11 7:00, Dec 12 7:00, Dec 17 7:00, Dec 18 7:00 closing.

Displayed in one chronological list rather than split in two, because a buyer
asks "what can I see on Saturday" far more often than "when is Plum on". The
cast reads as a chip on each row.

**Every weekday name was asserted against the day Adam gave for that date**, so
a transposed date could not reach the page. All 18 matched.

## Pages changed

| Page | What |
|---|---|
| `a-christmas-carol-tickets.html` | calendar 20 to 18, cast chips, counts, JSON-LD subEvents 20 to 18 |
| `a-christmas-carol-2026.html` | **the same calendar and the same 20 subEvents lived here too** |
| `sensory-friendly-performances.html` | Dec 4 Plum show added, 2 rows to 3 |

**The audition page was the catch.** It carries its own copy of the full
calendar and its own 20-entry `subEvent` list, so changing only the ticket page
would have left the performer-facing twin advertising three cancelled nights.
This is exactly what the site-wide sweep rule exists for. Both pages now carry
identical 18-row calendars and identical structured data.

`index.html` needed nothing: it states the date range and no count. The ASL page
carries no dated Carol listing, only a photo.

JSON-LD was lifted to a placeholder, rebuilt as parsed objects and spliced back
by index. The two sensory shows carry no `offers`, matching how the single
sensory show was handled before. 18 subEvents, 16 with offers, asserted on both
pages.

## Flags, in order of urgency

1. **ThunderTix is almost certainly still selling December 9, 14 and 15.**
   Event 272819 was not touched and cannot be reached from this session. Until
   those three dates come down there, the site says a performance does not exist
   while ThunderTix will still take money for it. **Check that first.** If any
   seats were already sold for those nights, those buyers need moving.
2. **The source of truth sheet is now stale in three ways**, tab
   `Show Information`, the Christmas Carol 2026 column:
   - Performances reads "November 30-December 18 (option to add matinee and
     evening show on 19)". The Dec 19 option is not happening, and the three
     dark nights are not recorded.
   - Sensory Show reads "December 1 @5pm, optional- December 4 @4:30pm". The
     December 4 show is confirmed and is at **5:00pm, not 4:30pm**.
   - There is no cast split in the sheet at all.
   Say the word and I will update it, the way the Villains running order was
   updated.
3. **The two sensory reservation links now carry their date**,
   `?performance=A+Christmas+Carol+December+1` and `...+December+4`. They were
   both the same string before, which would have made the two nights
   indistinguishable in the form responses. **Worth checking the Elfsight form
   handles the new values**, since the old one was a bare show name.
4. **`a-christmas-carol-tickets-2027.html` still has the old 20-performance
   schedule.** It is a redesign preview: noindex, unlinked, not in the sitemap,
   so nothing public is wrong. It will need this schedule before that track
   goes live.
5. **Which Young Artist is in which cast is not on the site.** Only the
   performance-level label. If families need a roster, that is a separate page
   or a program insert.

## Follow-up the same day: the December 4 registration does not exist yet

Adam: there is no registration link for the December 4 show, and Joyce builds
one Monday. Two corrections followed.

1. **The December 4 row no longer carries a button.** It announces the date,
   time and cast, and shows a non-interactive `Reservations open soon` pill:
   dashed border, muted, deliberately not button-shaped so nobody taps a CTA
   that leads nowhere. A line under the list says the date and time are final
   and the booking link will be added.
2. **The December 1 link was put back to `?performance=A+Christmas+Carol`.**
   Earlier the same day it was changed to carry the date, so that two sensory
   shows could be told apart in the form responses. That was the right idea at
   the wrong moment: Joyce's existing form expects the bare show name and that
   reservation flow is live now. **When she builds the December 4 link on
   Monday, both will need distinguishing**, by date or by cast, and the form
   needs a matching value. Flipping the pill to a live button is a one-line
   change here.

### A layout bug this introduced, caught and fixed

The new pill pushed the page **37px past the viewport at 320px**. Confirmed as
mine, not pre-existing, by rendering `git show HEAD:` of the same file side by
side: HEAD was clean at 320, 360 and 390; the working tree overflowed only at
320.

The cause was not the pill's own width. At `max-width:980px` the row collapses
to `grid-template-columns:auto 1fr` and `.show-row .btn` is given
`grid-column:1 / -1` so the button takes its own full-width line. **The pill is
not a `.btn`**, so it stayed in column 1, forced that auto column to 162px and
squeezed the title column to 45px, which the 110px show-title link then
overflowed.

Fixed by giving the pill the same placement as the button,
`.show-row .btn,.show-row .show-soon{grid-column:1 / -1;...}`, plus
`.show-main{min-width:0}` as a safety net, since a grid item defaults to
`min-width:auto` and refuses to shrink below its content.

**Worth remembering: anything standing in for `.btn` in a `.show-row` needs the
same responsive grid placement, or it breaks the row below 980px.**

## Verification

- Every JSON-LD block parses on all three pages, `node --check` passes on every
  inline script, document tags appear once each, and the em dash count is
  unchanged on each file (the sensory page's 26 pre-existing ones are untouched).
- Rendered over HTTP at 320, 390, 768, 1200 and 1600. No horizontal scroll, no
  broken images, no JavaScript errors. Counted from the rendered DOM rather than
  the source: 18 `.ccal-row` with 9 Figgy and 9 Plum on both Carol pages, and 3
  `.show-row` on the sensory page.
- The dark nights were asserted absent both as calendar rows and as
  `2026-12-09`, `2026-12-14`, `2026-12-15` anywhere in the structured data. The
  prose note that announces them is the only place those dates appear.
