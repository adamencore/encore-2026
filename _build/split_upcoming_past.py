import re, pathlib
f = pathlib.Path("page-to-stage.html")
s = f.read_text()

# 1) Isolate the listings section
m = re.search(r'(  <section id="next".*?\n  </section>\n)', s, re.S)
sec = m.group(1)

# 2) Pull the 10 card anchors in document order
cards = re.findall(r'      <a class="scard".*?\n      </a>\n', sec, re.S)
assert len(cards) == 10, f"expected 10 cards, got {len(cards)}"
by_slug = {}
for c in cards:
    slug = re.search(r'href="/page-to-stage/([^"]+)"', c).group(1)
    by_slug[slug] = c

upcoming = ['back-to-the-future','les-miserables','shakespearience','our-town','phantom-of-the-opera','anastasia','the-outsiders']
past     = ['come-from-away','hadestown','pippin']  # reverse-chronological (most recent first)
assert set(upcoming) | set(past) == set(by_slug), "slug mismatch"

up_html = "".join(by_slug[sl] for sl in upcoming)
# mark past cards
past_html = "".join(by_slug[sl].replace('<a class="scard"', '<a class="scard is-past"', 1) for sl in past)

new_sec = f'''  <section id="next" aria-labelledby="next-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <div>
          <span class="pill" style="margin-bottom:18px;"><span class="dot"></span>2026 Season</span>
          <h2 id="next-h">Upcoming <em>opportunities</em></h2>
        </div>
        <p class="lead">A full season of workshops paired with live professional theater, in date order. Seating on each trip is limited and tends to go quickly — reserve early.</p>
      </div>
      <div class="pts-grid reveal">
{up_html}      </div>
      <p class="aud-note" style="margin-top:24px;">Dates, venues, and fees for the 2026 season are being finalized — a few are still marked proposed or to be announced. <a href="/page-to-stage-registration">Reserve your interest</a> and we'll confirm details as they lock in.</p>
    </div>
  </section>

  <section id="past" aria-labelledby="past-h">
    <div class="wrap">
      <div class="sec-head reveal pts-past-head">
        <div>
          <span class="pill" style="margin-bottom:18px;"><span class="dot"></span>Archive</span>
          <h2 id="past-h">Past Page to Stage <em>events</em></h2>
        </div>
        <p class="lead">Workshops and live-theater trips that have already wrapped this season.</p>
      </div>
      <div class="pts-grid reveal">
{past_html}      </div>
    </div>
  </section>
'''

s = s.replace(sec, new_sec)

# 3) Add the is-past styling + past-head spacing, before the pts-grid media queries
anchor = "  @media(max-width:900px){.pts-grid{grid-template-columns:repeat(2,1fr);}}"
past_css = (
"  .pts-past-head{margin-top:72px;}\n"
"  .scard.is-past{opacity:.88;}\n"
"  .scard.is-past .scard-media{filter:saturate(.5) brightness(.9);}\n"
"  .scard.is-past:hover{opacity:1;}\n"
"  .scard.is-past:hover .scard-media{filter:none;}\n"
)
s = s.replace(anchor, past_css + anchor, 1)

f.write_text(s)
print("rewrote. upcoming:", len(upcoming), "past:", len(past))
