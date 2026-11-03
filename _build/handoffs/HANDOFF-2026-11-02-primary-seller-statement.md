# HANDOFF 2026-11-02: primary seller statement on ticket pages

Encore is applying for Google Ads event ticket seller certification as the
original seller of its own shows. A reviewer needs to see on the page that
Encore produces the show and sells at face value. No page said this.

## The sentence

> Encore Performing Arts produces this show. Tickets are sold only through our
> box office, at face value.

`tickets.html` and `tickets-2027.html` use **these shows**. The word "official"
is deliberately not used, per the brief. One copy per page, byte identical
apart from that this/these variant.

## Scope: 12 pages

**The sweep is the interesting part.** A plain grep for `thundertix` returns
**all 344 pages**, because the ThunderTix click conversion script shipped
earlier the same day contains the string `thundertix.com` on every page. That is
a false positive created by our own work. Grepping for a real `href` or
`ticketUrl` gives the true answer: **14 pages**.

| Page | Context | Variant |
|---|---|---|
| `tickets.html` | above the show card grid | these shows |
| `a-christmas-carol-tickets.html` | under the hero buttons, beside the $12 to $25 badge | this show |
| `peter-pan-jr-tickets.html` | under the hero buttons | this show |
| `little-women-tickets.html` | under the hero buttons, **also the template** | this show |
| `villains-night.html` | under the hero buttons | this show |
| `a-christmas-carol-2026.html` | under the performance calendar lead, beside the prices | this show |
| `peter-pan-jr-2026.html` | under the Get tickets block | this show |
| `little-mermaid-camp-2026.html` | under the hero buttons | this show |
| `lion-king-kids-camp-2026.html` | under the hero buttons | this show |
| `tickets-2027.html` | under the banner buttons | these shows |
| `a-christmas-carol-tickets-2027.html` | under the banner buttons | this show |
| `peter-pan-jr-tickets-2027.html` | under the banner buttons | this show |

**Two of the 14 were deliberately left out**, because the brief scoped this to
show and ticket pages and said to change nothing else:

1. **`index.html`.** It has a Get tickets button for Carol, but it is the
   homepage, not a show or ticket page. **This is the one worth a decision**,
   because a reviewer is likely to look at the homepage first. One line to add.
2. **`villains-night-program.html`.** The program people read at the venue, not
   a page anyone buys from.

**The `-2027` previews were included** even though they are noindex and
unlinked, for the same reason the Google tag was: they will replace the live
pages, and a missing seller statement there would silently undo this
certification work the day that track goes live.

## The wording conflict that matters most

**Three pages already tell the reader tickets are sold through a partner**, and
a reviewer skimming could read that against "sold only through our box office":

| Page | Existing sentence |
|---|---|
| `peter-pan-jr-2026.html` | "Tickets are sold through ThunderTix, our ticketing partner." |
| `tickets.html` | "Tickets for Encore productions are sold through our ticketing partner and open closer to each show." |
| `tickets-2027.html` | "Tickets are sold through our ticketing partner and open closer to each show." |

These are not actually contradictory. ThunderTix is the platform Encore's own
box office runs on. But "sold through our ticketing partner" next to "sold only
through our box office" is exactly the ambiguity this certification is about,
and the brief said not to touch existing copy, so **nothing was changed.**

On `peter-pan-jr-2026.html` the new line was at least **placed directly after**
the partner sentence rather than before it, so the order reads as partner note
then clarification.

**Suggested rewording, if wanted:** "Tickets are sold by Encore Performing Arts
through ThunderTix, our ticketing platform." That keeps the disclosure and
removes the reading that someone else is the seller. One word from Adam.

## Contrast: the measurement was wrong before it was right

Several of these lines sit on a photograph or a gradient, so contrast was
measured from rendered pixels. The first pass used worst-pixel-in-box and
reported five failures, including **1.67:1** on one preview page.

**That was the method, not the page.** Worst-pixel-in-box was reading:
- the four rounded corners of the plate, where bright photo shows through and no
  text exists
- the gaps at the ends of wrapped lines

The second pass measures **glyph pixels only**: screenshot the element, then
screenshot it again with the text forced transparent, and treat pixels that
differ strongly between the two as the solid core of the letterforms. Sample the
backdrop only under that mask. The line that read 1.67:1 actually measures
**7.63:1**.

This is worth keeping. The script is
`scratchpad/seller_contrast.mjs` and it is the right tool for any text on a
photo on this site.

### Final readings, worst case across 320, 390, 768, 1200 and 1600

| Page | Worst |
|---|---|
| `a-christmas-carol-tickets.html` | 15.99:1 |
| `tickets-2027.html` | 12.70:1 |
| `little-mermaid-camp-2026.html` | 12.59:1 |
| `lion-king-kids-camp-2026.html` | 11.25:1 |
| `villains-night.html` | 8.85:1 |
| `peter-pan-jr-tickets.html` | 8.35:1 |
| `a-christmas-carol-tickets-2027.html` | 8.20:1 |
| `peter-pan-jr-tickets-2027.html` | 7.63:1 |
| `little-women-tickets.html` | 7.13:1 |
| `peter-pan-jr-2026.html` | 5.56:1 |
| `a-christmas-carol-2026.html` | 5.23:1 |
| `tickets.html` | 5.08:1 |

All above the 4.5:1 small-text requirement.

### Two heroes needed more than a colour

- **The camp pages' hero panel is a gradient built from the show palette.** Lion
  King's palette is bright enough that even pure white measured **4.11:1** at
  768px, against a backdrop reaching `rgb(185,105,41)`. Both camp pages now give
  the line a translucent dark plate, so **the template is palette-proof** rather
  than one page being tuned. Anything standing in for this line on a future camp
  page should keep the plate.
- **The three parallax banner heroes are photographs with highlights no text
  colour can clear.** Same plate.

The four `lwt-hero` and `cc-banner` ticket pages pass at 7:1 to 16:1 on colour
alone and were left clean.

## A pre-existing problem this uncovered

**The existing hero copy on these pages fails AA, and by more than the new line
ever did.** Measured side by side, on the same backdrop:

| Page | New line, before fixes | Existing `.lede` or `.tagline` beside it |
|---|---|---|
| `peter-pan-jr-tickets-2027.html` | 1.79:1 | **1.08:1** |
| `tickets-2027.html` | 4.32:1 | **1.33:1** |
| `a-christmas-carol-tickets-2027.html` | 1.94:1 | **1.49:1** |
| `lion-king-kids-camp-2026.html` | 3.83:1 | **2.47:1** |
| `little-mermaid-camp-2026.html` | 4.32:1 | **2.75:1** |

Those numbers are worst-pixel, so they overstate. But the pattern is real: light
cream copy over photographs and bright gradients, with no plate. **This belongs
with the `#338093` flag as its own accessibility pass**, and the glyph-masked
script is the tool for it.

## Verification

- One statement per page in the rendered DOM, correct this/these variant, no use
  of "official", on all 12 pages at 5 widths.
- No horizontal scroll at 320, 360, 390, 768, 1200 and 1600. The plate's right
  edge stays inside the viewport at every width.
- Every JSON-LD block still parses, 11 of them, and all 43 inline scripts pass
  `node --check`.
- **The Google tag and conversion script are untouched**, asserted rather than
  assumed: GA4 x2, Ads x3, `send_to` x2 and the listener once on every one of
  the 12 pages, each count identical to HEAD.
- Pure insertions: 93 lines added, nothing deleted or modified.

## Deploy

Commit `7ae4a79`, "Add primary seller statement to ticket pages", pushed to
`main`.

## Open

1. **`index.html` is the call to make.** A reviewer will probably land on the
   homepage, and it has a Get tickets button but no seller statement.
2. **The "ticketing partner" wording** on the three pages above.
3. **New ticket pages inherit the statement** from
   `little-women-tickets.html`, which is the template, so it travels the same
   way the audience code of conduct and the Google tag do. Worth adding to the
   list of things not to strip as template residue.
4. **The pre-existing hero contrast failures**, above.
5. **Unrelated, noticed while looking at the rendered page:**
   `lion-king-kids-camp-2026.html` has **25 em dashes** in its body copy,
   against the house style. It is the second page found like this, after
   `sensory-friendly-performances.html` with about 26. The other eleven pages
   touched here have none. Worth a sweep of its own rather than fixing one page
   at a time.

## Deploy, confirmed

Netlify deploy `6ae949a3`, state ready, commit `7ae4a79`, published
**2026-11-02 7:40:53pm Mountain**, 16 second build. Deploy summary: 12
generated pages uploaded, 28 redirect rules, 2 header rules, 3 functions, 1
edge function, secret scan clean.

Checked on the live site afterwards: all nine live pages serve the statement
exactly once, with the right this/these variant, no use of "official", and the
Google tag and conversion counts unchanged at GA4 x2 and `send_to` x2. The two
preview pages and `tickets-2027.html` are noindex, so they were verified
locally rather than live.
