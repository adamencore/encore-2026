# HANDOFF 2026-10-29: sensory testimonials, Villains retirement, Villains recap post

Three pieces of work, all shipped to `main`.

---

## 1. Sensory testimonial from the feedback form (`33217b6`)

Source: **"Elfsight Form Responses Sensory Feedback"** in Drive, spreadsheet
`12Jaq26y9zWnR8rQwKmVk4Q4LqRARBc8fchpXt9GdZWw`. The live form is at
**encorepa.org/sensory-friendly-feedback**.

**Only column L is quotable.** Its question text ends "We may use it in future
promotional materials", which is the consent. The other columns are private
feedback and were deliberately left alone even though some lines are good
("Loved the costumes and the humor in it", "Been to others before. Always a
great time").

Six responses total since July 2025, four with a quote. One is Adam's own test
submission from his gmail, two were already on the page. **That left exactly one
new quote**, about Moana, now a third card.

`.quote-grid` was a fixed `1fr 1fr`, which would have stranded the third card
alone at half width. Now `auto-fit minmax(300px,1fr)`, reflowing 3 / 2 / 1.

Also removed the two em dashes from the existing figcaptions rather than adding
a third. 26 em dashes remain in that page's body copy, still untouched.

**Worth acting on:** the form is linked from nothing but the sitemap page, which
explains six responses in fifteen months. Asking for the quote in the post-show
email would do better than burying it last on a long form.

---

## 2. The Oct 28 sensory performance retired (`75ad50e`)

Adam asked to "take Villains Night off the site" the morning of the 29th, saying
it played last night. **The dates did not line up and the work stopped there.**
Both the site and the source-of-truth sheet had the sensory performance on
October 28 and the two ticketed performances on October 29 and 30. Taking the
show down that morning would have pulled ticket links for two performances that
had not happened. He confirmed he had miscommunicated and only wanted the
sensory listing retired.

**The lesson is the general one: when a request's premise contradicts the data,
check before acting, especially when the cost is live ticket sales.**

Swept every page for October 28. Three carried it:

- `sensory-friendly-performances`, the Oct 28 row in Upcoming
- `aspire-performing-co`, the fact tile and the come-see-the-show paragraph
- `villains-night`, hero copy, section intro, the Wed Oct 28 row, meta
  description, and the JSON-LD, where the sensory subEvent went 5 to 4

Left alone on purpose: the blog archive, which is a dated record, and the
`-2027` preview pages, which belong to the other track and still mention it.

`.aud-grid` was `repeat(4,1fr)` and would have left an empty column with three
tiles, so it is `auto-fit` now.

`tickets.html` needed nothing: its Villains entry carries `ends: 2026-10-30`
and retires itself.

---

## 3. New post: the Villains Night sensory night (`6214cd9`)

**URL:** `/blog/villains-night-sensory-friendly-performance-2026`

Eight photos from the sensory house, sent through chat at full resolution.

**Consent was checked before building, not after.** Six of the eight are the
post-show meet and greet and show identifiable guests, including a toddler, an
adult guest in close-up with a name badge, and several people with visible
disabilities. At a sensory-friendly performance, publishing those effectively
identifies people by their attendance. Adam confirmed photo releases cover all
of them. **Ask this every time; the answer is not assumable.**

Images rebuilt from raw pixels via `Image.new` + `putdata` rather than re-saved,
which is what actually drops embedded metadata, then resized and written as webp
plus jpg. Zero EXIF asserted on all 18 outputs. The chat upload had already
stripped EXIF, but the recipe ran anyway.

Filed under **Accessibility**, which is what the other six sensory posts use.
Wired into `blog.html`, `blog/index.html` and `sitemap.xml`.

### Two template gaps, fixed in this post only

Both were flagged rather than silently widened, because each affects all 103
posts and a one-file fix would make this post inconsistent with the rest.

1. **The blog template has no `blockquote` rule anywhere.** A pulled quote
   renders identically to body copy. Other posts with quotes have the same
   problem.
2. **`.post-foot a` is `var(--accent)` #338093 at 16px, measuring 4.15:1**,
   under AA. Now #2a6b7b at 5.21:1.

**The cascade trap worth remembering:** the first fix did not take. These posts
have **three `<style>` blocks**, and `.post-foot a` is redefined in the second,
so appending to the first lost on source order at equal specificity. Insert at
the **last** `</style>`. This was caught by re-measuring after the fix rather
than assuming the edit worked.

### Verification

320 through 1600: no horizontal scroll, all 9 images load, four figures and a
three-up gallery, zero contrast failures. Both blog indexes show the new card
first at 103 cards.

**A flag that was checked and dismissed:** `blog.html` and `blog/index.html`
report a stray `</body>`. Compared HEAD against HEAD~1 and it is byte-identical
in that respect; both files have always lacked an opening `<body>`, which is the
documented pre-existing condition on 193 of 312 pages. Nesting is otherwise
clean.

---

## Open

- Sweep `.post-foot a` #338093 across the other 102 blog posts.
- Add a `blockquote` rule to the blog template so quotes read as quotes.
- 26 em dashes still in `sensory-friendly-performances.html` body copy.
- `-2027` preview pages still list the Oct 28 sensory performance.
- The other feedback columns have good lines in them if Adam asks those families.
