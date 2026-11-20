# encorepa.org

Static site for Encore Performing Arts. Committing to `main` deploys on Netlify.
Working notes for whoever edits the site live in `CLAUDE.md`.

## Giving (Stripe)

Online giving runs on **Stripe Payment Links**. There are no API keys, no
backend and no donor data on this site: every button opens a Stripe-hosted
checkout page, and Stripe handles the payment.

### Where things live

| File | What it does |
|---|---|
| `js/give.js` | The giving widget and the only place Stripe URLs are written (`LINKS`). It also has the `donate()` helper that builds a checkout URL. |
| `data/campaigns.json` | Every giving campaign. Edit this to add, change or close one. |
| `js/campaigns.js` | Draws the campaign cards on `/donate` and `/campaigns`, and fills each campaign page. |
| `campaign.html` | The one template behind every `/campaigns/<slug>` address (a rewrite in `_redirects`). |
| `campaigns.html` | The `/campaigns` index. |
| `donate.html`, `core-community.html` | The giving pages. |

### Swap a Stripe link

Open `js/give.js` and change the URL in `LINKS`:

- `LINKS.oneTime`: the "customers choose what to pay" link, used for every one-time gift.
- `LINKS.monthly[5]`, `[15]`, `[25]`, `[50]`, `[100]`, `[250]`: one fixed link per monthly amount. `[25]` is The Core.

A handful of plain fallback links are also written straight into the HTML, so giving still works if JavaScript fails. If the one-time link or the $25 link changes, search the repo for the old URL and replace those too:

```
grep -rl "buy.stripe.com/<old-id>" --include=*.html .
```

### Add a campaign

Add an object to `campaigns` in `data/campaigns.json`. No code changes are needed.

```json
{
  "slug": "spring-gala-2027",
  "title": "Spring Gala 2027",
  "summary": "One or two sentences for the card.",
  "body": ["First paragraph.", "Second paragraph."],
  "funds": ["What the money pays for", "One line each"],
  "image": "/img/gallery/hadestown-company.jpg",
  "goal": 15000,
  "raised": 0,
  "deadline": "2027-04-30",
  "active": true,
  "defaultFrequency": "one-time"
}
```

- **`slug`**: letters, numbers and dashes only. The page appears at `/campaigns/<slug>`.
- **`goal`, `raised`, `deadline`, `image`, `funds`**: all optional. Leave any of them out to hide it.
- **`raised`**: typed by hand. Payment Links cannot report live totals.
- **`defaultFrequency`**: which tab the widget opens on, `monthly` or `one-time`.
- **`alwaysOpen: true`**: shows the "Always open" tag. General Support uses it.
- **To close a campaign**, set `active` to `false`. A campaign also closes by itself the day after its `deadline`. A closed campaign drops off the cards, and its page shows a thank-you with the general giving widget.
- **Sitemap**: add the new page's URL to `sitemap.xml`.

### Where a gift came from

Every checkout link carries a Stripe `client_reference_id`, which shows on the payment in Stripe:

| Source | Tag |
|---|---|
| Donate page widget | `donate-page` |
| Donate page plain fallback link | `donate-page-fallback` |
| Core page | `core-page`, `core-page-hero` |
| A campaign page | `campaign-<slug>`, for example `campaign-build-2027` |
| 2027 preview pages | `donate-page-2027`, `core-page-2027` |

Stripe silently drops a `client_reference_id` with anything other than letters, numbers, dashes or underscores, or longer than 200 characters.

### One-time amounts

One-time preset buttons add Stripe's `prefilled_amount` parameter, in cents. For example, `?prefilled_amount=10000` opens checkout at $100. The donor can still change it. Stripe ignores the value if it is outside the link's minimum and maximum. The default maximum on a "customers choose" link is $10,000; raising it needs Stripe support. "Other" opens the link with no amount.

### Not in this phase

The code leaves seams for these:
- a custom monthly amount;
- a cover-the-fees checkbox;
- live campaign totals.

Each needs Stripe Checkout Sessions or a webhook through a Netlify function. When that happens, change `donate()` in `js/give.js` to call the function. The pages do not need to change.
