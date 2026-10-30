# HANDOFF 2026-10-30: program age ranges swept site-wide

Follows `AUDIT-2026-10-30-age-groups-and-program-names.md`, which found nine
conflicts in how the site states who may participate in what.

## The rulings

Adam, 2026-10-30:

| Program | Was on the site | Now |
|---|---|---|
| Musical Theater Camps | 7–18 on `/programs`, 5–12 in the `/camps` title and meta, 6–11 and 7–11 in its body | **6–11** |
| Junior | 7–11 on `/programs`, 7–13 in the `/junior` title and meta, 7–11 in its body | **7–13** |
| Aspire Performing Co. | 8–18 on `/programs`, 5–18 on its own page, 8 through senior in the footer of 199 pages | **6–18** |
| Emerging Artists | 12–14, already consistent | 12–14 |
| Signature Shows | "Advanced" with no age on its card, 13–18 on its own page | 13–18 |

Also ruled, separately: **"Apprentice Series" is not Encore vocabulary.** The
2027 sheet's Program column is internal scheduling shorthand. The site's
"Junior" was right and stays. That conflict is withdrawn from the audit.

## Two things applied that Adam did not state outright

Both are flagged here because they are inferences, not rulings.

1. **The organisation-wide range is now 6 to 18, not 7 to 18.** It follows
   necessarily from Camps and Aspire both starting at 6, but it is a claim about
   the whole organisation and it now appears in the homepage meta description,
   the homepage JSON-LD `description`, the Newsies band, and the auditions page
   eyebrow and meta. If the public number should stay 7 to 18, these five places
   are where to put it back.
2. **Signature Shows now carries "Ages 13–18" on its `/programs` card.** It was
   the one card with only a "Advanced" tag and no age, while its own page, title,
   meta, breadcrumb and JSON-LD all say 13–18. Adding it makes all six cards
   consistent.

## What changed

**200 HTML files.** 193 of them changed by exactly one line, the shared Aspire
footer blurb, "ages 8 through high school senior" to "ages 6 through high school
senior". That blurb is duplicated per page, which is why one word costs 193
files. 104 of the 193 are blog posts, which carry the same footer.

The seven pages with real content changes:

| Page | Lines | What |
|---|---|---|
| `aspire-performing-co.html` | 158 | every 5 to 6, across hero, body, FAQ answer and 3 JSON-LD blocks |
| `camps.html` | 43 | 5–12 to 6–11 in title, meta, canonical, pill, breadcrumb JSON-LD; one stray "ages 7 to 11" to "6 to 11" |
| `index.html` | 42 | org range 7–18 to 6–18 in meta, twitter, JSON-LD, Newsies band |
| `programs.html` | 22 | all five program cards plus three meta descriptions |
| `junior.html` | 12 | body copy 7 to 11 to 7 to 13; Aspire catalogue card 8–senior to 6–senior |
| `auditions.html` | 6 | eyebrow and meta 7 to 18 to 6 to 18 |
| `emerging-artists.html` | 4 | Aspire catalogue card 8–senior to 6–senior |

The large line counts on the first three are JSON-LD blocks being reserialised,
not sprawl. Blocks with no age string in them were spliced back byte for byte
specifically so the diff stays readable.

### The scope rule, and why

**Program-level ranges only. Per-show and per-class ages were left exactly as
they are.** A camp or show stating its own range is not the same claim as a tier
stating its band, and which one wins is the audit's conflict 9, still open. So
nothing was guessed. The cost is that these now disagree with the new bands, and
the list is the agenda for that decision:

| Page | Says | Program band is now |
|---|---|---|
| `lion-king-kids-camp-2026.html` (8 places) | 7–11 | Camps 6–11 |
| `little-mermaid-camp-2026.html` (5), `encore-experience-little-mermaid.html` (3) | 5–12 | Camps 6–11 |
| `camp-experience-team.html` chips (2) | 7–13 and 7–11 | Camps 6–11 |
| `peter-pan-jr-2026.html` + its registration and tickets pages (8) | 7–14 | Emerging Artists 12–14 |
| `a-christmas-carol-2026.html` + 3 registration pages (8) | 7–12 and 13–18 | Signature 13–18 |
| `anastasia-2026.html` (8) | 12–18 | Signature 13–18 |
| `summer-of-lion-king-2026.html` (14) | 8–18, split 8–13 and 14–18 | Signature 13–18 |
| `aspire-traditions.html` + registration (5) | 12–18 | Aspire 6–18 |
| `senior.html` Villains Night catalogue entry | 5–18 | Aspire 6–18 |

Also deliberately untouched: the homepage "Classes & Workshops" pill at ages
7–18, which is correct for classes, whose lowest entry is Ages 7+; blog post
body copy, which is a dated record; and the `-2027` preview pages, which belong
to the other track.

**Phrasing was not standardised.** Each location kept its existing grammar and
only the numbers moved, so the numbers can be reviewed without also reviewing a
style change. Four grammars are still in use site-wide: "Ages 7–13", "ages 7 to
11", "ages 6 through high school senior", "Ages 7+".

## Verification

- **Structure.** Tag balance, `node --check` on every inline script, and
  `json.loads` on every JSON-LD block across all 200 files. 21 findings, every
  one proved byte-identical at HEAD by running the same checker against
  `git show HEAD:<file>`. They are the documented pre-existing conditions plus
  false positives: `unclosed ['slug']` is `{slug}` inside a JS template string,
  `<head> x3` on `hadestown-pro-shot` is the word in attribute values.
- **JSON-LD is lossless.** All 184 blocks parsed from HEAD and from the working
  tree and compared as objects. 183 identical to HEAD plus the age substitution.
  The 184th, `little-mermaid-camp-2026.html`, was **a fault in the verifier, not
  the file**: the check applied the camps-page rule globally, so it expected a
  5–12 to become 6–11 on an individual camp page the sweep correctly left alone.
  That file's real diff is the one footer line.
- **Rendered over HTTP**, never `file://`, at 320, 390, 768, 1200 and 1600 on
  all nine program and index pages. No horizontal scroll at any width, zero
  broken images.
- **Catalogue pages asserted on the rendered cards, not the source array.**
  `junior.html` 6 `.scard`s, `emerging-artists.html` 7, `senior.html` 8. The
  Aspire card reads "Year-round · Ages 6–senior" on the first two.
- **A flag checked and dismissed:** `classes.html` rendered 0 cards. It has no
  `OFFERINGS` array and no `#offgrid` at all, contrary to the note in
  `CLAUDE.md`, and its only change was the footer line. Not a regression.

## Open

1. **Conflict 9 is the only structural question left**: does a band belong to the
   tier or to the individual show? The table above is what it decides.
2. **`senior.html` still lists Villains Night as "Open", "Performances October
   29–30".** Correct today, stale tomorrow. `tickets.html` retires itself via
   `ends: 2026-10-30`; `senior.html`'s `OFFERINGS` array has no such mechanism,
   so it needs a hand. Worth giving that array an `ends` field.
3. ~~The 2027 sheet Ages column is still 15 of 17 blank.~~ **Filled the same
   day**, `2027 Show Information!B4:R4`, all 17 shows from the program bands.
   The two cells that already held 7-12 were overwritten: Little Mermaid or
   Annie to 7-13, Jan Camp to 6-11. **One cell to confirm: Christmas Carol,
   written as 7-18 by inference**, since "Show with a Pro" has no band of its
   own and the 2026 production ran two registration bands, 7 to 12 and 13 to 18.
   The sheet's Program column still says "Apprentice Series (Junior Series)" on
   two shows; worth renaming to "Junior Series" so the phrase stops resurfacing.
4. **Is tier overlap intentional?** Junior 7–13 now overlaps Emerging 12–14 at
   ages 12 and 13. A 13 year old qualifies for three tiers.
5. **The homepage "Shop by age" band gives no age for Camps, Aspire or Page to
   Stage** while Junior, Emerging and Signature each carry theirs. A gap rather
   than a conflict, now that the numbers exist.
6. `programs.html` has 3 `&mdash;` entities in body copy, against the house
   style. Pre-existing, left alone to keep this diff to numbers.
7. Still carried over: 26 em dashes in `sensory-friendly-performances.html`,
   `.post-foot a` at #338093 on the other 102 blog posts, the missing blog
   `blockquote` rule, and the `-2027` previews listing the retired Oct 28
   sensory performance.
