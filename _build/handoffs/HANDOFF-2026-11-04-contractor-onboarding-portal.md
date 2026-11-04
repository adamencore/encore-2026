# HANDOFF 2026-11-04: contractor onboarding portal

Adam asked for an onboarding system rather than a form: a checklist that collects
what Encore needs, sends people out to QuickBooks and a background check vendor
and lets them confirm they went, and an animated child safety training branded to
the site. Explicitly not Elfsight.

Built from two source documents: the contractor onboarding packet draft and the
child safety training handoff.

## The access decision, which changed the architecture

Adam said it should sit behind the team page. **Built instead with its own gate
and its own password, at `/onboarding`.**

`/team/*` is one shared password. If onboarding lived there, a brand new
contractor would need the Team Hub password on day one. That password also
unlocks **`/team/photos`, the searchable library of photographs of Young
Artists**, which would hand an unscreened person access to pictures of minors
before their background check cleared. That is the exact risk the packet and the
safety training exist to manage.

So:
- `netlify/edge-functions/onboarding-gate.js` guards `/onboarding` and
  `/onboarding/*`, reading `ONBOARDING_PASSWORD`, cookie `onboarding_auth`,
  14 day session because onboarding happens over several sittings.
- It **falls back to `PROTECTED_PAGE_PASSWORD`** when `ONBOARDING_PASSWORD` is
  unset, so the portal is testable immediately, and the sign-in screen says so in
  an admin note. Set the separate one before sending the link to anyone.
- The Team Hub gained an **Onboarding** band at the top with a card linking out,
  plus a note telling staff to send the link and the onboarding code, not the
  Team Hub password.

## No form widget: it writes to a Sheet directly

`netlify/functions/onboarding.mjs`, served at `/onboarding/api/:action`, reusing
the service account pattern already proven by the Photo Library. Actions:

| Action | What it does |
|---|---|
| `save` | Upserts the contractor's row, keyed on lowercased email |
| `training` | Appends a training result and mirrors score onto their row |
| `ping` | Reports which environment variables are set, for debugging |

Two tabs, created on first use: **Onboarding** (32 columns) and **Training**
(10 columns).

**Partial saves merge rather than overwrite.** A contractor who fills in their
phone on Monday and ticks the background check on Friday must not lose the phone.
`toRow` keeps the existing cell whenever the incoming field is empty, except for
the timestamp and status columns which always move.

### It refuses to store tax and bank numbers

The packet says tax information goes in QuickBooks only and must not be emailed.
Rather than trust that instruction, the server enforces it. Free text fields
(allergies, dietary, accessibility, conflicts, anything else, bio) are screened
for an SSN shape, a run of nine or more digits, and the phrases social security,
taxpayer id, tax id, routing number, account number, bank account and card
number. A match is refused with a 422 and a message telling the contractor to put
it in QuickBooks instead.

**Phone fields are deliberately not screened**, so a ten digit mobile number does
not trip it. Verified with a test case.

**This also answers the contractor payroll page Adam parked on 2026-11-02.** The
question was how to collect bank details safely. The answer in his own packet is
that Encore never collects them: QuickBooks does. The portal walks contractors
there and the site refuses to hold the numbers.

## The checklist

`/onboarding`. Two paths, chosen on arrival, following the packet's V1 and V2
split.

| | New | Returning |
|---|---|---|
| Steps | 11 | 8 |
| Extra steps for new starters | mission, QuickBooks and W-9, background check | |

Steps are expandable cards rather than a linear wizard, because the flow sends
people out to QuickBooks and a background check vendor and they come back later.
Each card carries its own state, and progress, field values and open step are
kept in `localStorage` as well as on the server, so closing the tab loses
nothing.

Form steps complete themselves once their required fields are filled.
Acknowledgement and external steps complete on a checkbox. Proof of insurance is
optional and can be marked "does not apply to my role". The training step reads
the result the training page leaves behind and marks itself.

## Verification

- No horizontal scroll at 320, 390, 768, 1200 and 1600.
- No JavaScript errors at any width.
- Path switching gives 11 steps for New and 8 for Returning.
- Filling required details advances progress, an acknowledgement advances it
  again, and **a reload restores both the progress and the field values**.
- Saves reach the server, verified by intercepting the request.
- **All 140 rendered text elements clear WCAG AA**, tightest 5.05:1.

### Two contrast fixes, both the brand teal again

- Cream at 90 percent on `#338093` measured **3.42:1** on the selected path
  button. Even pure white on Berry is only 4.52:1, which is no margin at that
  size, so the selected state uses `#2d7284` at 5.45:1.
- The finish button's hover was `#3d93a8`, which is **white at 3.54:1 and fails**.
  A computed-style sweep does not catch hover states, so this was found by
  checking them by hand. Hover states now go darker, not lighter.

That is the third and fourth time `#338093` has produced a contrast failure on
this project. The standing recommendation to sweep it site wide still stands.

## A bug worth remembering

Step completion originally only recomputed on the `change` event. A contractor
who types their last required field and goes straight to the send button never
fires `change` on it, so the step stayed incomplete. It now recomputes on `input`
as well, repainting the tick and pill without collapsing the open card.

## What Adam must do before this is usable

### Netlify environment variables

| Variable | Value |
|---|---|
| `ONBOARDING_SHEET_ID` | `1b0-3N1AJ0fyFFYiI3tVqbgjOgImjrdgByf2XCKzwEt8` |
| `ONBOARDING_PASSWORD` | Choose one. Until set, the Team Hub password works. |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Already set for the Photo Library. Nothing to do. |

### Share the sheet

**The sheet will not accept writes until it is shared.** Open
[Encore Contractor Onboarding (responses)](https://docs.google.com/spreadsheets/d/1b0-3N1AJ0fyFFYiI3tVqbgjOgImjrdgByf2XCKzwEt8/edit)
and share it, with Editor access, with the `client_email` inside
`GOOGLE_SERVICE_ACCOUNT_KEY`. That is the same robot account the Photo Library
uses. `/onboarding/api/ping` reports which variables are set.

## Content the portal is still missing

Each of these renders as a visibly marked "Needs content" panel rather than
invented text, so nothing fake reaches a contractor.

1. **The Ten Agreements.** The full text lives in Encore A to Z and has never
   been pasted anywhere digital. The portal shows only No. 7, Safety Over
   Sequins. **This is the biggest blocker**, because the contractor is asked to
   agree to a document they cannot read.
2. **Background check vendor, link, and who pays.** The packet lists all three as
   open. Nothing can be confirmed until a vendor exists.
3. **Headshot upload destination.** Currently tells them to email Kristen.
4. **Board Chair name and contact**, for the training's reporting chain.

Also worth a decision, from the packet's own open questions: who tracks
completion, the training renewal cadence, which roles need proof of insurance,
whether the photo release is separate from the contract, and whether a long gap
should send a returning contractor down the new path.

## Smaller notes

- **The mission statement says "young artists" in lower case**, while house style
  capitalises Young Artists. It is quoted verbatim in the portal because it is
  the official wording used in grant applications. Worth deciding which is
  canonical, since the two now disagree in public.
- The packet notes some older contracts still say "Ten Commandments" rather than
  "Ten Agreements". The portal says Agreements and flags the discrepancy to
  staff.
- `/onboarding` is noindex, absent from the sitemap, and reachable only through
  the gate.
