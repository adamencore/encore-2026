# HANDOFF 2026-11-01: audience code of conduct

Adam asked for a professional, friendly statement that Encore reserves the right
to refuse entry to guests who are rude to or mistreat the team, volunteers or
cast.

## What already existed, and what did not

`terms-and-conditions.html` section 5 carries a **Participant Code of Conduct**:
"We reserve the right to remove any participant from a program or event for
behavior deemed inappropriate, disruptive, or unsafe", with examples including
bullying, harassment and disrespectful language.

**That governs participants, meaning Young Artists in programs. It does not
govern audiences.** There was no audience-facing equivalent anywhere on the
site, so this is a real gap rather than a duplicate. The new copy is worded to
sit alongside the terms language, reusing "safe, inclusive and respectful
environment", rather than inventing a second standard.

`tolerance-at-encore.html` is a values and inclusion statement, a different
thing again. The new block links to both.

## What was added

A `.house-note` callout titled **A welcoming house**, on
`a-christmas-carol-tickets.html`, placed at the top of the Inclusivity and
accessibility section, above the existing Policies list.

Four short paragraphs, in this order on purpose:

1. **Who you are being asked to be kind to**, before any rule: the cast are
   Young Artists and front of house is largely volunteers and parents.
2. **The ask**, in plain words, extended to other guests as well as to staff.
3. **The reservation of rights.** Refuse admission, or ask a guest to leave
   without a refund, for behaviour that is abusive, harassing or disruptive
   toward the company, volunteers, staff or other guests. Softened at both ends
   by "rarely and never lightly" and by naming who it protects.
4. **A route to report something**, so the policy reads as care for guests
   rather than only as a threat to them, plus links to the inclusion statement
   and the terms.

Deliberately a warm callout with a left accent rule rather than fine print, so
it can be pointed at, and deliberately not phrased as a legal notice.

## Verification

Renders clean at 320, 390, 560, 768, 1200 and 1600: no horizontal scroll, no
JavaScript errors. Zero em dashes, and the copy was asserted free of "kid",
"child" and "children", with Young Artists capitalised.

Contrast was measured on each rendered page rather than read from the
stylesheet, which is what caught the body-colour bug described below. After the
fix the worst reading across all five pages is **11.72:1**, against a 4.5:1
requirement.

## Rolled out to every ticketing page, same day

Adam: put it on the general ticketing page and all show ticket pages, now and
moving forward. Done, on five pages, byte-identical on all of them because the
block and its CSS were lifted from the Carol page rather than retyped:

| Page | |
|---|---|
| `tickets.html` | the general ticketing page |
| `a-christmas-carol-tickets.html` | |
| `little-women-tickets.html` | **also the template new ticket pages are built from** |
| `peter-pan-jr-tickets.html` | |
| `villains-night.html` | |

**"Moving forward" is handled two ways.** The block now lives in
`little-women-tickets.html`, which `CLAUDE.md` names as the template for new
ticketing pages, so new pages inherit it. And `CLAUDE.md` gained a
**Page conventions** entry naming the block, its placement, all five pages, and
a warning not to strip it along with the template residue.

### A real contrast bug this rollout exposed

The block used `var(--charcoal-soft)` for body copy, which measured 14.64:1 on
the Carol page. **On three of the other four it measured 4.15:1 and failed AA.**

`--charcoal-soft` is not one colour. The Carol page computes it from its show
palette, `color-mix(in srgb, var(--show-mid) 80%, #000)`, giving `#0f252a`.
But `little-women-tickets`, `peter-pan-jr-tickets` and `villains-night` all
define it as the **brand teal `#338093`**, which is 4.15:1 on cream-lite. That
is the same number, and the same colour, as the `.post-foot a` failure found on
the blog template earlier in the week.

The block now uses `var(--charcoal)`, which measures 11.72:1 or better on all
five. Verified by rendering each page and measuring, not by reading the
stylesheet.

**Worth a separate look: `#338093` is this site's brand teal, and wherever it
is used as small text on a light background it fails AA.** It is `--charcoal-soft`
on at least three ticket pages and `--accent` on the blog template. A proper
sweep would find every place it carries body text.

## Open

- **`villains-night-program.html` does not have the Inclusivity block**, so it
  took no insert. It is the online program people read at the venue, where a
  welcoming-house note arguably belongs most. It would need its own placement.
- **The `-2027` redesign previews have a different CSS architecture** and none
  of the tokens the block uses. They will need their own version before that
  track goes live.
- Still worth considering: a canonical copy in `terms-and-conditions.html` as a
  sibling to its participant code of conduct, with the five ticket pages linking
  to it rather than each holding the text. Five copies is five things to edit.
- **Unrelated, noticed in passing:** `tolerance-at-encore.html` uses em dashes
  and the word "children" in its body copy, both against the house style.
