# HANDOFF 2026-10-30: Villains Night closing-night post

**URL:** `/blog/villains-night-2026-closing-night`, filed under **Aspire**.

Written from Adam's own dictated account the night the run closed, with his
phrasing kept where he gave it, including "it is now, and it will always be,
about these Young Artists and their families" and "their love and their patience
are the beating heart of this organization".

## The numbers, checked rather than taken on trust

Adam said he could not remember the cast size and asked whether it was on
record. It was, from the online program built earlier in the week:

- **118 Young Artists across seven Aspire groups.** The program lists all of
  them by group.
- **Four ticketed performances plus the free sensory-friendly night.** Verified
  against the JSON-LD on `villains-night.html`, whose `subEvent` list holds
  exactly four after the sensory performance was retired: October 29 at 5:00pm
  and 7:30pm, October 30 at 5:00pm and 7:30pm. **This matched Adam's own count
  independently**, which is the useful kind of agreement.
- **Sixth year** and **every night sold out**: both are Adam's, not verifiable
  from anything in the repo or on ThunderTix from here, and stated as his.

## Photographs

15 photos, closing night. The usual recipe, and it earned its keep: **the
sources carried 88 EXIF entries between them**, so the chat upload did not strip
them. Rebuilt from raw pixels via `Image.new` plus `putdata`, resized to a
1600px long edge, written as webp plus jpg, with zero EXIF asserted on all 31
outputs including the 1200x630 Open Graph crop.

Laid out as one feature image, five figures with captions, and three
three-up galleries, which is the pattern the sensory post established.

**Worth your eye before this gets shared widely:** two frames show identifiable
faces who are not performers. `the-team-applauding` shows staff and ambassadors
along the wall, and `a-packed-electric-theater` shows audience members in their
seats, several in focus. This is a public ticketed performance rather than the
sensory house, so the bar is different from the sensory post, and the people in
frame are mostly Encore's own team and families. It was still worth flagging
rather than assuming. Say the word and either comes out in one line.

## Wiring

- `blog.html` and `blog/index.html`: 103 to 104 cards, new card inserted first.
- `sitemap.xml`: 158 to 159 urls.
- The previous-post link at the foot points at the sensory-friendly post, which
  is the correct chronological neighbour.

## Verification

- Every JSON-LD block parses, `node --check` passes on every inline script, and
  `sitemap.xml` parses as XML.
- Rendered over HTTP at 320, 390, 768, 1200 and 1600 on the post and both
  indexes, with lazy images forced eager and the page scrolled to the bottom so
  nothing was counted as loaded that had not been. No horizontal scroll, no
  broken images, no JavaScript errors. 15 images, 5 figures and 3 galleries
  present at 1200px; both indexes show 104 cards.
- Copy asserted free of em dashes and of "kid", "child" and "children". Nine
  uses of "Young Artists".

## Carried over, still open

- The `.post-foot a` contrast fix and the missing `blockquote` rule are applied
  to this post only, as with the sensory post. That now leaves **102 other blog
  posts** on `#338093` at 4.15:1, under AA. Worth one sweep rather than another
  per-post patch.
- 26 em dashes remain in `sensory-friendly-performances.html` body copy.
- The `-2027` preview pages still list the retired October 28 sensory
  performance.
- `senior.html` still advertises Villains Night as "Open, Performances October
  29 to 30" in its `OFFERINGS` array. **As of today that is stale.** The array
  has no `ends` field, unlike `tickets.html`, so it will not retire itself.
