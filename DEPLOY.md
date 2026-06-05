# Encore Performing Arts — Deployment Guide

Static site (plain HTML/CSS/JS, no build step). Push this folder to GitHub and connect it to Netlify.

## Deploy on Netlify

1. Push the contents of this folder to a GitHub repo (everything at the repo root — `index.html` must be at the top level).
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Build settings:
   - **Build command:** *(leave empty)*
   - **Publish directory:** `.` (the repo root)
4. Deploy.
5. Set **www.encorepa.org** as the **primary domain** in Site settings → Domain management. Netlify will auto-redirect the apex (`encorepa.org`) to www and force HTTPS.

## Clean URLs

Files are named by slug, and Netlify serves them without the `.html` extension:

| File | URL |
|---|---|
| `index.html` | `/` |
| `about.html` | `/about` |
| `tickets.html` | `/tickets` |
| `electric-theater.html` | `/electric-theater` |
| `aspire-performing-co.html` | `/aspire-performing-co` |
| `junior.html` / `emerging-artists.html` / `senior.html` | `/junior` etc. |
| `page-to-stage.html` | `/page-to-stage` |
| `summer-of-lion-king-2026.html` | `/summer-of-lion-king-2026` |
| `audition-registration.html` / `page-to-stage-registration.html` | `/audition-registration` etc. |
| `404.html` | served automatically on any not-found |

All internal links already use clean paths (`/about`, not `/about.html`).

## Files in this package

- The site pages above
- `netlify.toml` — publish dir + security headers + image caching
- `_redirects` — 301 redirect map (STARTER — see below)
- `robots.txt` — allows all, points to the sitemap
- `sitemap.xml` — the 10 indexable pages
- `404.html` — branded not-found page
- `img/` — `encore-logo.svg` plus empty `shows/`, `aspire/`, `team/` folders for real images

> Not part of the web deploy (handle separately): the Apps Script backend (`registration-backend-AppsScript.gs`) goes into Google Apps Script, and the `.xlsx` files are working documents.

## Before / at launch — checklist

**Redirects (do not skip).** `_redirects` only covers known cases. Pull the Google Search Console "all known pages" export and add a `301` for every old Squarespace URL that changed. Missing redirects = lost SEO + 404s.

**Forms.** Three forms post to a Google Apps Script Web App: `audition-registration.html`, `page-to-stage-registration.html`, and the ticket-change form on `tickets.html`. Deploy the Apps Script, then paste its Web App URL into the `ENDPOINT` constant in each of those files (search for `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`).

**Tickets.** Put your real ThunderTix links into the `ticketUrl` fields in the `TICKETS` array in `tickets.html`. Also consider pointing the site-wide "Get Tickets" nav button at `/tickets` (it currently points at the homepage events anchor).

**Images.** Drop real files into `img/`:
- `img/shows/<slug>-bg.webp` (+ optional `<slug>-logo.svg`) — show covers used on the homepage and tickets cards
- `img/aspire/*` — Aspire gallery (the Aspire page currently has photos inlined for preview; swap to files here to lighten it)
- `img/team/<name>.jpg` — About page headshots (rendered in B&W automatically)
- Social share images referenced in each page's `<head>`: `og-image.jpg`, `about-og.jpg`, `tickets-og.jpg`, `aspire-og.jpg`, `electric-theater-og.jpg`, `junior-og.jpg`, `emerging-artists-og.jpg`, `senior-og.jpg`, and `logo.png` (used in schema)

**Two content items to resolve:**
- **Founding year** — the About page shows 2022; the rest of the site uses 2021 (schema `foundingDate`, "home since 2021"). Pick one and make it consistent everywhere.
- **Slugs** — confirm `/about`, `/junior`, etc. against the live URL inventory; if a live page already ranks under a different slug, keep that slug and 301.

**Pages not yet rebuilt.** Internal links point to pages still on Squarespace (e.g. `/donate`, `/contact`, `/blog`, `/classes`, `/encore-classes`, `/sensory-friendly-performances`, `/events`, `/core-community`, `/encore-scholarship-application`, `/terms-and-conditions`, `/privacy-policy`). Until those are migrated into this repo, add temporary redirects in `_redirects` (or migrate them) so the links resolve instead of 404.

**Registration link placeholders.** Show/program pages link to per-instance registration slugs (e.g. `/summer-of-lion-king-8-13-registration`) that don't have files yet. Create them from the form templates, or use the commented redirects in `_redirects` to point them at the generic forms for now.

## Brand colors

When the real palette locks in, edit the CSS custom properties in the `:root` block at the top of each page's `<style>` (currently a neutral charcoal/cream placeholder). They're in one spot per file for a quick swap.
