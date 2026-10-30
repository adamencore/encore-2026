# AUDIT 2026-10-30: age ranges and program naming

Question: what does the website currently say about program groupings and
participant ages, and does it agree with the source of truth sheet?

Answer: **no. There are nine distinct conflicts, and the 2027 sheet cannot
settle them because its Ages column is almost entirely empty.**

Sources: every live `.html` page in the repo (blog archive and `-2027` preview
pages excluded), and the "2026/2027 Schedule Source of Truth" sheet, tabs
`Show Information` (2026) and `2027 Show Information`.

---

## 1. What the website says today

| Program | `/programs` card | Its own page | Footer, on 199 pages |
|---|---|---|---|
| Musical Theater Camps | **Ages 7–18** | **Ages 5–12** in title, meta and pill; body says "ages 6 to 11" twice and "ages 7 to 11" once | — |
| Junior | **Ages 7–11** | **Ages 7–13** in title, meta, canonical and pill; body says "ages 7 to 11" | — |
| Emerging Artists | **Ages 12–14** | **Ages 12–14** | — |
| Signature Shows | **"Advanced"**, no age given | **Ages 13–18** | — |
| Aspire Performing Co. | **Ages 8–18** | **Ages 5–18**, "age 5 through high school senior" | **"ages 8 through high school senior"** |
| Page to Stage | **"All ages"** | no age stated | — |
| Classes | — | Ages 7+, Ages 10+, Ages 12–18 per class | — |
| Auditions page | — | **Ages 7 to 18** | — |
| Homepage | — | **ages 7–18** | — |

---

## 2. Conflicts inside the website

1. **Camps has four different answers.** `/programs` says 7–18. `/camps` says
   5–12 in its title and meta, then "ages 6 to 11" in two places and "ages 7 to
   11" in a third. A parent of a 5 year old and a parent of a 17 year old could
   both read this page and conclude their child is eligible.
2. **Junior has two.** `/programs` says 7–11, `/junior` says 7–13 in its title,
   meta description, canonical and pill, and then "ages 7 to 11" in its own body.
3. **Aspire has three.** `/programs` says 8–18, `/aspire-performing-co` says
   5–18, and the footer on **199 pages** says 8 through high school senior. The
   2026 sheet backs the Aspire page: Villains Night is recorded as 5-18.
4. **Signature Shows carries no age on its card**, only "Advanced", while its own
   page says 13–18.
5. **The organisation-wide range is stated as 7–18** on the homepage and the
   auditions page. If Camps and Aspire genuinely start at 5, that is wrong and
   should read 5–18.
6. **The bands overlap and nothing says whether that is deliberate.** Junior
   7–13 overlaps Emerging 12–14 at ages 12 and 13; Emerging 12–14 overlaps
   Signature 13–18 at 13. A 13 year old qualifies for three tiers at once.
7. **Four different grammars are in use** for the same idea: "Ages 7–13",
   "ages 7 to 11", "ages 8 through high school senior", "Ages 7+", "All ages",
   "Ages 8–senior", "Advanced". Even on a single page, `/junior` uses an en dash
   range in its title and a spelled "to" range in its body.

---

## 3. Conflicts between the website and the sheet

8. **The 2027 sheet renames Junior.** Its Program column reads
   **"Apprentice Series (Junior Series)"**. The website says "Junior"
   everywhere, in page titles, URLs, nav and body copy. If Apprentice is the new
   name, nothing on the site reflects it yet, and `/junior` would want a
   redirect.

   Other vocabulary drift between the two:

   | Sheet | Website |
   |---|---|
   | Apprentice Series (Junior Series) | Junior |
   | Signature Series | Signature Shows |
   | Camp | Musical Theater Camps |
   | Emerging Artists | Emerging Artists (agrees) |
   | Aspire | Aspire Performing Co. |
   | Show with a Pro | no equivalent anywhere on the site |
   | no equivalent | Page to Stage |

9. **The sheet records ages per show, the website states them per program, and
   the two cross.** From the 2026 tab, where the Ages column is filled in:

   | Show | Sheet program | Sheet ages | What the site says that program is |
   |---|---|---|---|
   | Lion King Jr. | Signature Series | 7-18 | 13–18 |
   | Peter Pan Jr. | Emerging Artists | 7-14 | 12–14 |
   | Little Women | Signature Series | 13-18 | 13–18 (agrees) |
   | Aspire Villains Night | Aspire | 5-18 | 5–18 on its page, 8–18 on /programs |
   | Christmas Carol 2026 | Show with a Pro | 13-18 | program not on the site |
   | Camps (five of them) | Camp | 7-11 | 5–12 on /camps, 7–18 on /programs |

   **This is the root issue.** Lion King Jr. ran as a Signature Series show open
   to 7 year olds, and Peter Pan Jr. ran as Emerging Artists open to 7 year
   olds, while the site tells families those tiers start at 13 and 12. Either
   the tiers have soft age bands that flex per show, or the site's bands are
   wrong. Both are defensible; the site currently implies the first is not true.

---

## 4. Why the 2027 sheet cannot settle it yet

**The Ages row in `2027 Show Information` is empty except for two cells.** Of
the 17 shows listed, only two carry an age:

- Little Mermaid or Annie, Apprentice Series: **7-12**
- Jan Camp, Camp: **7-12**

Fifteen are blank, including both Aspire seasons, both Signature Series titles,
both Emerging Artists titles and the Christmas Carol.

And the one tier age it does give, **Apprentice Series 7-12**, matches neither
of the site's two answers for Junior, which are 7–11 and 7–13.

---

## 5. What needs deciding, in order

1. **Are age bands a property of the tier or of the individual show?** Everything
   else follows from this. If the tier, the per-show ages in the sheet need to
   come into line. If the show, the website must stop stating a single range per
   program and state it per show instead.
2. **Is Junior becoming Apprentice Series?** If yes, that is a rename across
   titles, URLs, nav, meta and a redirect from `/junior`.
3. **Does Aspire start at 5 or at 8?** This one is worth doing first regardless:
   it is wrong on 199 pages either way, and it is the only conflict currently
   telling a five year old's family both yes and no.
4. **Does the organisation say 5–18 or 7–18?**
5. **Is tier overlap intentional?** If a 13 year old may choose Emerging or
   Signature, say so; it reads as a mistake at the moment.
6. **Fill in the 2027 Ages column** before the 2027 pages are built, or the same
   drift repeats.

Once 1 through 5 are answered, the site-wide sweep is mechanical and small: one
phrasing standard, applied to roughly a dozen pages plus the shared footer.
