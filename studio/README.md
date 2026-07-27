# Encore Sanity Studio

The content editor for encorepa.org.
Project ID `cakoldrm` · dataset `production`

## What this is

A separate Netlify site from encorepa.org. Deploying it does **not** touch the
website — the site keeps its current "push = deploy, no build step" setup.
This only adds an editing interface.

## One-time setup in Netlify (Adam)

1. Netlify → **Add new site** → **Import an existing project**
2. Choose the same GitHub repo: `adamencore/encore-2026`
3. Set these three fields, then deploy:
   - **Base directory:** `studio`
   - **Build command:** `npm run build`
   - **Publish directory:** `studio/dist`
4. Rename the site to something memorable, e.g. `encore-studio`
5. Open the URL and log in with the Encore Google account

Everything else (Node version, single-page-app routing, noindex headers) is
already handled by `netlify.toml` in this folder.

## Verified before delivery

- Installs cleanly (935 packages, Sanity v6.6.0)
- `sanity build` succeeds
- `tsc --noEmit` passes with zero type errors
- All nine content types present in the built bundle

## Content types

| Type | Purpose |
|---|---|
| `siteSettings` | Announcement bar + contact details. One record, site-wide. |
| `venue` | Electric Theater, St. George Academy. Referenced by every date. |
| `program` | The six programs. Age ranges live here, canonically. |
| `show` | Productions and camps. Feeds six different pages. |
| `blogPost` | Blog. Slugs preserved from Squarespace — never change them. |
| `teamMember` | Staff and mentors. |
| `page` | General content pages. |
| `formPage` | Elfsight-backed form pages. |
| `faq` | Serves both page FAQs and Ask Encore. |

## Design notes

**Venues are references, not typed text.** Correct the Electric Theater's
address once and it is correct everywhere — the root fix for the Ask Encore
audition-location problem.

**Age ranges live on `program`,** with a per-show override. Confirmed by Adam:
age requirements often change by show title, so the override is the norm rather
than the exception.

**`show.status` drives the site.** Setting a show to "Auditions closed" takes
audition calls down everywhere at once.

**Site Settings is locked to one record** — it cannot be duplicated or deleted.

## Agreed age bands (July 2026)

| Program | Ages |
|---|---|
| Camps | 5–12 |
| Junior Shows | 7–13 |
| Emerging Artists | 12–14 |
| Signature Series | 13–18 |
| Aspire Performing Co. | 5–18 |
| Page to Stage | All ages |

Aspire: Traditions is an exception — advanced performers 12–18 — recorded as a
per-show override, not a separate program.
