# HANDOFF 2026-10-27: Villains Night online program

Shipped `a477ae9` on `main`. Live at **encorepa.org/villains-night-program**.

Source: Adam's Canva shortlink `canva.link/6orc669ps5jm949`, which resolves to
design `DAHZJdXdIu0`, titled "Villains Night 26 Program", 8 pages. He pointed at
pages 1, 3 and 4.

---

## What the page is

A mobile-first online program, one long scroll with a sticky chip bar for
jumping between sections. Built from the site's shared head, nav, footer and
brand CSS by lifting them out of `villains-night.html`, so it inherits the
palette, the fonts and both footer media queries.

Sections, in order: hero, The Company (seven Aspire groups, 118 Young Artists),
The Team (creative and production), Special Thanks, Our Generous Donors (four
tiers plus a Join The Core call-out), Our Mission, What's Next at Encore,
Program Sponsors.

Rosters and credits are plain markup, not a JS array, so the page is readable to
a plain HTTP fetch unlike the catalogue pages.

Also added to `sitemap.xml`, priority 0.6. XML re-parsed after the edit.

---

## Where the content came from, page by page

- **Page 1** gave the hero dates and the "What's Next" cards.
- **Page 3** gave The Team, Special Thanks and the donor wall.
- **Page 4** gave the seven Aspire group rosters.
- **Page 2** is the paid ads (St. George Academy, Sunpro). Rendered as a text
  sponsor block, since the ad artwork could not be downloaded. See "Open" below.
- **Pages 5 to 8 were NOT used.** They are the old Little Women program, still
  sitting in the back half of the same Canva document. More on this below.

Group counts as published: Spark 12, Ignite 13, Ember 19, Inferno 16, Blaze 22,
Rise 16, Illuminate 20. Total 118. Donors: 5 at $10,000+, 5 at $5,000+, 21 at
$1,000+, 8 at $500+, 39 in all.

---

## Four judgement calls, all reversible

1. **Taylor Garrett was printed in two tiers**, $5,000+ and $1,000+. The page
   lists the name once, at $5,000+. Adam should confirm which is right.
2. **Kelby's surname was printed two ways** on page 3: "Kelby Tyrrell" as
   Director and Choreographer, "Kelby Tyrell" with one R in Hair and Makeup.
   Normalised to the double-R spelling, which is also what the Google Sheet uses.
3. **Special Thanks ended on a trailing comma** after "Nicole Ram," as though a
   name was cut off. The page closes the sentence with "and every volunteer and
   family who gave their time to this show." The fuller wording on page 5 was not
   grafted across, because that belongs to the Little Women program.
4. **The ":)" in Special Thanks was dropped.** House style is no emojis in page
   copy, and it was the only one in the document.

---

## Source of truth check, as the sweep rule requires

Searched every page in the repo for Christmas Carol run dates before publishing
any. Found "November 30 through December 18" and its variants in 20 places, on
`tickets.html`, `index.html`, `senior.html`, `a-christmas-carol-2026.html`,
`a-christmas-carol-tickets.html` and the Carol rehearsals blog post. Nothing was
changed; the new page was written to match.

Confirmed against the Google Sheet "2026 Schedule Source of Truth", sheet
`Show Information`:

- Villains Night: performances October 29 to 30, 5:00pm and 7:30pm, Electric
  Theater, sensory show October 28, tickets $15. Matches the site.
- Christmas Carol: November 30 to December 18. Matches the site and page 1.

**Conflict to raise with Adam:** page 6 of the Canva document, in the Little
Women half, says Carol runs **Nov 27 to Dec 19**. That contradicts page 1 of the
same document, the sheet, and all 20 instances on the live site. The printed
program carries a wrong Carol date in its back half if those pages go to press.

**Second conflict, smaller:** the sheet lists the Villains Night Stage Manager as
Randy Sly. The program lists Shannon Martin as Stage Manager and Randy Jo Sly as
Production Manager. The program's own credits were used, since Adam built it last
week and it is the more current artifact. The sheet is behind.

---

## Verification that was actually run

Served over HTTP on 127.0.0.1:8781, never `file://`, since every path is
root-relative. Rendered with the preinstalled Chromium.

- **320, 390, 768, 1200, 1600:** no horizontal scroll at any width, no broken
  images, no HTTP 400s. DOM asserted, not the source: 7 groups, 118 names,
  21 roles, 39 donors present at every width.
- **Three elements flagged as extending past the viewport were verified before
  being reported.** All three are jump chips inside `.pg-jump-in`, which is a
  deliberate horizontal scroller. Not a bug.
- **Anchors** clear the sticky nav plus the sticky jump bar at 390px.
- Tag balance clean, zero inline scripts, zero JSON-LD blocks, zero em dashes,
  zero emojis.

### Contrast, measured not eyeballed, and two real failures found

Method: screenshot a plate with the text hidden, crop each element's box,
composite the text colour over every backdrop pixel honouring alpha, take the
worst ratio.

**Refinement worth keeping:** `visibility:hidden` also hides an element's own
background, so dark pill buttons measured 1.00:1 and 1.06:1 against whatever sat
behind them. Those were measurement artifacts, not defects. The fix is to carry
each target's computed `backgroundColor` and composite it in as the effective
backdrop. After that, both buttons measured above 10:1.

Two genuine failures, both fixed before shipping:

1. **The brand teal `#338093` fails AA at small heading sizes.** It measured
   4.15:1 on `--cream-lite` and 4.40:1 on `--paper` at 16.3px/700, which is under
   the 18.66px threshold for large text, so it needs 4.5. Moved `.pg-sub` and
   `.pg-group h3` to `--accent-2` `#2a6b7b`, already a site token, measuring
   5.53:1 and 5.87:1. **This is worth a site-wide sweep: the brand teal is
   probably used this way on other pages.**
2. **Hero text measured 2.73:1 at 390px.** The shared `.lwt-veil` is a 104deg
   gradient, heavy on the left and thin on the right. On a phone the hero copy
   runs the full width and lands on the thin side. Added a flat colour layer
   beneath the gradients on this page only, `rgba(8,16,24,.42)` under 900px and
   `.26` above. Now 4.82 to 5.87 at 390px, 4.44 to 8.06 at 1200px.
   **`villains-night.html` ships the same veil and may have the same problem with
   its own copy. Not checked, not changed.**

Also found and fixed while measuring: `.pg-card p` was overriding `.pg-when` on
specificity, so the date line rendered muted grey rather than teal. Made the
selector `.pg-card p.pg-when`.

---

## Push note

The push was rejected: the remote had 26 commits this session building a parallel
2027 redesign track (`home-2027`, `blog-2027/`, `css/e27.css` and so on, 141
files, all additions). Fetched and inspected before doing anything, confirmed no
overlap with `villains-night-program.html` or `sitemap.xml`, then rebased and
pushed clean. Worth knowing that two tracks are now live in this repo at once.

---

## QR code and box office sign (built same day)

Adam's goal, stated by voice: a repeatable system for mobile programs, so guests
scan at the box office instead of taking a printed one. Especially for latecomers
when the printed programs run out, and to cut paper and print cost.

Built and delivered, not in the repo (they are print assets, not site files):

- `villains-night-program-qr.svg`, vector, transparent, `#22353d`
- `villains-night-program-qr.png`, 1800px, white background
- `villains-night-box-office-sign.pdf`, letter size, portrait, real Mikado via
  the repo's own `/fonts/mikado.css`, rendered through Chromium

QR is version 5 at error correction H, which tolerates about 30 percent damage.

### A real bug this caught, worth remembering

**segno writes SVGs with `width`/`height` but no `viewBox`.** Sizing one with CSS
shrinks the viewport without scaling the path, so the code gets cropped. The
first sign rendered with only one of its three finder squares, and would not have
scanned. It looked plausible enough at a glance.

It was caught by decoding the QR off the rendered sign with OpenCV, not by
looking at it. Fix is to inject `viewBox="0 0 540 540"` into the SVG. The
delivered SVG has it.

**The rule this suggests: never ship a QR that has not been decoded from the
final rendered artifact.** Decoding the source PNG is not enough, since the bug
was introduced downstream of it. Verified after the fix at 1200, 800, 600 and
420px wide, with gaussian blur, and rotated 7 degrees. All decode to
`https://encorepa.org/villains-night-program`.

### Making this a system

The page is a template now. For the next show, the pieces that change are the
hero image and copy, the rosters, the team, and the What's Next cards. Donors,
mission and sponsors carry over. The builder script used for this one is at
`/tmp/.../scratchpad/build_program.py` for this session only, so the next one
should either copy `villains-night-program.html` directly or rebuild from it.

Suggested URL pattern: `/<show>-program`.

---

## Open

- **Sponsor artwork.** The two ads on page 2 are rendered as text. Canva's export
  URLs are not reachable from the sandbox, so the real artwork could not be
  pulled. If Adam exports the two ad images, they can be dropped straight in.
- **A QR code** in the printed program pointing at `/villains-night-program`
  would be the obvious way to connect the two. Not built.
- Confirm the Taylor Garrett tier.
- Fix the Carol dates on page 6 of the Canva document before printing.
- Sweep `#338093` used as small heading text across the rest of the site.
- Check whether `villains-night.html`'s hero has the same mobile contrast
  problem this page had.
