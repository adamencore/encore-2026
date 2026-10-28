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

## Redesign, 2026-10-28: dress it in the show (`c1f8c1c`)

Adam: "make this look much more inviting and exciting but on brand with the
show." The first build was correct but read like a nonprofit handout.

**The palette was sampled, not invented.** Quantising the show's own key art
`img/shows/villains-night.jpg` gives deep navy `#0b365f`, mid teal `#165f7d`,
`#318496` (which is the Encore brand teal, already in the art), bright mist
`#139faa` and cream `#f4efe4`. So the show's brand and Encore's brand already
agree, and there was no need to reach for Halloween purple and orange.

The warm amber accent comes from the lantern and rim light on the cast cut-out.
That is why warm sits against cool on this page, and it is also why the Aspire
group names work as a device: Spark, Ignite, Ember, Inferno, Blaze, Rise,
Illuminate is a light ladder, so each group card carries its own lantern tone,
palest at Spark through hottest at Inferno and brightest at Illuminate.

Built on: `vn-bg` as the hero ground, `vn-logo` as the real title, the
`vn-cast-cutout` bleeding off the base, a drifting lantern-spark canvas that
respects `prefers-reduced-motion`, an amber Join The Core block, and the real
Peter Pan and Carol key art on the What's Next cards.

### Three contrast failures the measurement caught

Measured across **four animation frames**, because the spark canvas lightens the
hero and a single plate would have missed the worst case.

1. **The ghost button measured 1.20:1.** Its cream text sat over the lit blonde
   hair in the cast cut-out. Fixed structurally, not by nudging: the cut-out is
   1440x1280, so the hero copy now reserves `calc(var(--cast-w) * 0.8889)` below
   itself and the two cannot overlap at any width. **Derive the clearance from
   the asset's own aspect ratio rather than guessing a padding value.**
2. **The venue line measured 4.15:1**, mist `#9fd3dc` on the hero's teal. Now
   cream.
3. **The eyebrow measured 4.26:1.** Hero wash mid-stop moved from `.30` to `.46`.

Zero failures at 390 and 1200 afterwards, tightest margin 4.93:1. Inferno and
Blaze were lightened slightly because they first landed at 4.54:1, which passes
but is too thin to survive antialiasing.

### Two flags verified before being believed

- `vn-cast` reports as overflowing the viewport at 320 and 390. That is the
  intended full-bleed, `scrollWidth` equals `clientWidth`, and `.vn-hero` clips
  it. Not a bug.
- Two images report `naturalWidth: 0` in a full-page screenshot. They are
  `loading="lazy"` below the fold. Confirmed loading on scroll before dismissing
  it, rather than assuming. All five images resolve.

---

## The production sheet, 2026-10-28 (`4fde5eb`)

Adam pointed at a second sheet, **"Aspire Villains Night Production Sheet 2026"**,
id `15PCwoIR8oAe6hxBEToKuR-8c8EVLsqp9x5pvE5SvL1c`, tab **Program Information**.
This is a different sheet from the "2026 Schedule Source of Truth" and it is the
better source for program content. 33 tabs; the program one is index 0.

Its column layout: A and B hold the team, E and F hold the cast by group, G and
H hold featured roles and who plays them, and J, K and L hold Special Thanks at
the top and then the running order, the groups in each number, and the solos.

Added from it: **The Show**, all 22 numbers in order with group chips and solo
credits, and **Featured Roles**, 28 roles. The page had been missing the show
itself, which is the main thing a program is for.

### Conflicts and corrections, all needing Adam's eye

1. **Special Thanks is entirely different between the two sources.** The sheet
   says Utah Tech Lacrosse Team, Brian Tyrrell, and our amazing volunteers and
   families. The Canva program said the Fielding Family, the Campbell Family,
   the Encore Friends painting team, Clint and Angela Hoopes, Bridget Arias
   Cunningham and Nicole Ram. **No names in common.** The Canva list looks
   carried over from the Little Women program, which fits its truncated trailing
   comma. The page now uses the sheet. Ask whether the Canva names belong too.
2. **"Jea Nielson" was a typo for Jenna Nielson**, confirmed because the sheet
   says Jenna and Jenna Nielson is in the Illuminate roster. Fixed.
3. **Andrew Orton plays Captain Hook, sings in the Pirate Medley and is a Dapper
   Dan, but is in none of the seven group rosters.** Either he is a guest or
   staff performer, or a roster is missing him.
4. **Lilly Pearson** is in the Canva program's Illuminate but not the sheet's.
   The page keeps her, since the printed program is what the audience holds.
5. **Malia Wilkinson appears in both Rise and Illuminate** in the sheet.
6. Sheet typos normalised against the sheet's own roster spellings: Kara
   Gugliettei, Elle Mitchell, Parker DeRurange, Evan Ride.
7. Character spellings left exactly as the sheet has them, but two look wrong:
   **Dr. Facillier** (Disney spells it Facilier) and **Winnifred Sanderson**
   (Hocus Pocus spells it Winifred). Deliberately not corrected. Adam's call.
8. Blank in the sheet, so not shown: Company Manager, Music Operator, Set
   Designer/Styler, Set Assistant, Technical Director, Costume Designer,
   Rehearsal Coordinator and Assistant.

### The randomised-backdrop problem, worth keeping

The spark canvas seeds particle positions randomly on every load, so **the hero
backdrop is never the same twice and one measurement run can pass a page that
would fail on the next load.** Two hero elements duly failed on a reseed, at
3.84:1 and 4.36:1, after passing cleanly before.

Nudging the wash would only have moved the odds. The fix is structural: a scrim
on `.vn-hero-in::before` at `z-index:-1`, which rides inside that element's own
stacking context and therefore sits above both the spark canvas and the cast
cut-out but below the text. The floor no longer depends on where sparks land.

**Verification rule this gives: for anything with a randomised or animated
backdrop, measure across several independent page loads, not several frames of
one load, and treat stable numbers run to run as the evidence the fix worked.**
Three loads at 390 and 1200 now return identical lowest values.

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
