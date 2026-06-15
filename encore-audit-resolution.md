# Encore Site Audit — Resolution Summary

## ✅ Resolved this session (commit to `adamencore/encore-2026`, branch `main`)

| Fix | File(s) | What changed |
|---|---|---|
| **Legal pages looping to Squarespace** | `_redirects` | Removed the `/terms-and-conditions` and `/privacy-policy` → Squarespace 302s. The built local pages now serve (and no infinite loop at cutover). |
| **/classes loop** | `_redirects` | Repointed `/classes` and `/encore-classes` from Squarespace → `/programs` (302). Loop gone, no 404. *(Interim — build a real classes page later if desired.)* |
| **Missing `/logo.png`** | `logo.png` (new, root) | Rendered faithfully from `favicon.svg` (512×512). Fixes the `Organization` schema logo referenced on **45 pages**. |
| **Missing `/og-image.jpg`** | `og-image.jpg` (new, root) | Branded 1200×630 default social card (teal, e! mark, wordmark). Fixes broken link previews on **22 pages incl. 19 blog posts**. *(Uses DejaVu, not Cabrio — regenerate with the licensed font later if you want.)* |
| **`/fees` 404** | `fees.html` (new), `sitemap.xml` | Built a real Participation Fees page — what the fee supports, per-show fees, multi-Young-Artist discount, scholarships, refund policy. Accurate to your stated policy; no invented dollar amounts (those live per show). Added to sitemap. |
| **Missing JSON-LD** | `programs.html`, `core-community.html` | Added Organization + WebPage + WebSite + BreadcrumbList structured data (the two pages that lacked it). |
| **Founding-year conflict** | `about.html` | Aligned `/about` from **2022 → 2021** to match the rest of the site and your live footer ("since 2021"). Removed the stale "reconcile before launch" dev note. **Please confirm 2021 is correct** — if it's actually 2022, I'll flip the whole site the other way. |

## ✂️ False alarms in my audit — corrected, nothing to fix
- **"Weak meta descriptions" (15 pages):** my audit regex was tripped by the apostrophe in "Encore's" and counted only "Encore" (6 chars). Your descriptions are actually full and well-written (150–270 chars). **No change needed.**
- **"2 images missing alt":** both were example `<img>` tags inside HTML comments / a gallery placeholder note, not rendered images. Your alt coverage is clean.
- **Long titles (41 pages):** mostly 63–78 chars including the "— Encore" suffix; cosmetic only. Left as-is. (One real outlier: `page-to-stage-registration` has a 276-char title — worth trimming when we wire that form.)

## ⏳ Needs a decision or asset from you (couldn't resolve unilaterally)
1. **Founding year** — defaulted to 2021; confirm or tell me 2022.
2. **Age-band map** — genuine public-facing conflicts that need your canonical numbers:
   - `/camps` shows both **6–9 and 7–11**; camp show pages say 7–11.
   - `/emerging-artists` shows **12–14, 9–13, and 13–18**; Peter Pan Jr. (Emerging) is 9–13.
   - `/junior` shows **7–11 and 9–13**.
   Give me the correct range per program and I'll sweep every page.
3. **Unwired forms** (you're fine on Elfsight) — home-page newsletter, the sensory + ASL "subscribe" boxes (fake `?subscribed=1`), and `page-to-stage-registration`. I need your Elfsight widget ID(s) to drop the real embed in.
4. **`/classes`** — interim redirect to `/programs`; decide if you want a dedicated classes page.
