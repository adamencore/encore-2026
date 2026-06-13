import re, os, json, html
import pathlib as _pl; DEPLOY=str(_pl.Path(__file__).resolve().parent.parent)
os.makedirs(f"{DEPLOY}/page-to-stage", exist_ok=True)
base=open(f"{DEPLOY}/page-to-stage.html").read()
events=json.load(open(_pl.Path(__file__).resolve().parent/"events.json"))
def loc(e): return e['venue'] + (f" · {e['city']}" if e['city'] else "")

CLOCK='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'

# split base chrome around article
head_part, _, rest = base.partition('<article>')
article_inner, _, tail = rest.partition('</article>')  # tail = encph + footer + scripts

def feeline(e):
    fn = f' <span style="font-weight:400;color:rgba(233,228,224,.6);font-size:13px;">— {html.escape(e["fee_note"])}</span>' if e['fee_note'] else ''
    return f'{html.escape(e["fee"])}{fn}'

def perfline(e):
    note = f'<p class="desc" style="margin-top:14px;font-size:13.5px;color:rgba(233,228,224,.62);">Note: {html.escape(e["perf_note"])}</p>' if e['perf_note'] else ''
    return note

def jsonld(e):
    b,m,d=e['theme']
    offer = {"@type":"Offer","priceCurrency":"USD","url":"https://www.encorepa.org/page-to-stage-registration","category":"Registration"}
    if "–" in e['fee']:
        lo,hi=e['fee'].replace('$','').split('–'); offer.update({"price":lo,"highPrice":hi,"lowPrice":lo,"@type":"AggregateOffer"})
    else:
        offer["price"]=e['fee'].replace('$','')
    ev={"@context":"https://schema.org","@type":"EducationEvent","name":f"Page to Stage: {e['title']}",
        "description":e['blurb'],"organizer":{"@type":"Organization","name":"Encore Performing Arts","url":"https://www.encorepa.org"},
        "location":{"@type":"Place","name":e['venue'],"address":e['city'] or "TBA"},
        "eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode","offers":offer,
        "image":"https://www.encorepa.org/page-to-stage-og.jpg"}
    if e['iso']: ev["startDate"]=e['iso']
    bc={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":"https://www.encorepa.org/"},
        {"@type":"ListItem","position":2,"name":"Page to Stage","item":"https://www.encorepa.org/page-to-stage"},
        {"@type":"ListItem","position":3,"name":e['title'],"item":f"https://www.encorepa.org/page-to-stage/{e['slug']}"}]}
    return f'<script type="application/ld+json">\n{json.dumps(ev, indent=2)}\n</script>\n<script type="application/ld+json">\n{json.dumps(bc, indent=2)}\n</script>'

def build_article(e):
    b,m,d=e['theme']
    title=html.escape(e['title'])
    return f'''
  <!-- ========== HERO ========== -->
  <header class="hero">
    <div class="wrap">
      <div class="hero-card reveal" style="background:linear-gradient(160deg,{b},{m} 58%,{d});min-height:460px;">
        <div class="hero-top">
          <span class="hero-badge"><span class="dot"></span>Page to Stage · {html.escape(e['kind'])}</span>
        </div>
        <div class="hero-bottom">
          <span class="hero-eyebrow">Workshop + Live Theater · {html.escape(loc(e))}</span>
          <h1><em>{title}</em></h1>
          <p class="sub">{html.escape(e['blurb'])}</p>
          <div class="hero-actions">
            <a href="/page-to-stage-registration" class="btn btn-light">Reserve your spot →</a>
            <a href="/page-to-stage" class="btn btn-ghost" style="border-color:rgba(233,228,224,.4);color:var(--cream);">All opportunities</a>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- ========== DETAIL ========== -->
  <section aria-labelledby="d-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <div>
          <span class="pill" style="margin-bottom:18px;"><span class="dot"></span>The Experience</span>
          <h2 id="d-h">Workshop, then <em>the live show</em></h2>
        </div>
        <p class="lead">Every Page to Stage trip pairs a hands-on Encore workshop with a group visit to the professional production, so our Young Artists arrive ready to watch like makers — not just spectators.</p>
      </div>
      <div class="event reveal" style="background:linear-gradient(150deg,{m},{d});">
        <div>
          <span class="tag">{html.escape(e['kind'])}</span>
          <h3 style="font-style:italic;">{title}</h3>
          <p class="desc">{html.escape(e['blurb'])}</p>
          <div class="facts">
            <div class="fact"><div class="k">Workshop</div><div class="v">{html.escape(e['workshop'])}</div></div>
            <div class="fact"><div class="k">Performance</div><div class="v">{html.escape(e['perf'])}</div></div>
            <div class="fact"><div class="k">Where</div><div class="v">{html.escape(loc(e))}</div></div>
            <div class="fact"><div class="k">Fee</div><div class="v">{feeline(e)}</div></div>
          </div>
          {perfline(e)}
        </div>
        <div class="event-side">
          <div class="seats">{CLOCK} Limited seating</div>
          <div class="h">Reserve your spot</div>
          <p>Register first — we'll email a secure payment link to confirm. There's no checkout here; your place is held once payment is complete.</p>
          <a href="/page-to-stage-registration" class="btn btn-light" style="width:100%;justify-content:center;">Register for this trip →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ========== HOW REGISTRATION WORKS ========== -->
  <section id="how" aria-labelledby="how-h">
    <div class="wrap">
      <div class="sec-head reveal">
        <div>
          <span class="pill" style="margin-bottom:18px;"><span class="dot"></span>How Registration Works</span>
          <h2 id="how-h">Reserve, pay, <em>you're in</em></h2>
        </div>
        <p class="lead">A simple two-step process — the same way we handle auditions. No online cart or checkout.</p>
      </div>
      <div class="steps reveal">
        <div class="step">
          <div class="num">1</div>
          <h3>Reserve your spot</h3>
          <p>Fill out the quick <a href="/page-to-stage-registration">registration form</a> for the trip. It takes a couple of minutes and holds your interest while seats remain.</p>
        </div>
        <div class="step">
          <div class="num">2</div>
          <h3>Get a secure payment link</h3>
          <p>Encore emails you a secure link to pay. Payment is handled by a trusted processor — your card details never touch our website.</p>
        </div>
        <div class="step">
          <div class="num">3</div>
          <h3>You're confirmed</h3>
          <p>Once payment is complete, your spot is locked in. We'll follow up with trip details, timing, and anything to bring.</p>
        </div>
      </div>
      <p class="steps-note">Questions before you register? Call <a href="tel:+14354140049">(435) 414-0049</a> or email <a href="mailto:hello@encorepa.org">hello@encorepa.org</a>.</p>
    </div>
  </section>

  <!-- ========== CTA ========== -->
  <section>
    <div class="wrap">
      <div class="cta reveal" style="background:linear-gradient(150deg,{m},{d});">
        <div class="cta-inner">
          <div>
            <h2>Explore the rest of the <em>season</em></h2>
            <p>Page to Stage runs all year — workshops paired with live professional theater across Utah and beyond.</p>
          </div>
          <div style="display:flex;gap:11px;flex-wrap:wrap;">
            <a href="/page-to-stage-registration" class="btn btn-light">Reserve your spot →</a>
            <a href="/page-to-stage" class="btn btn-ghost" style="border-color:rgba(233,228,224,.4);color:var(--cream);">All opportunities</a>
          </div>
        </div>
      </div>
    </div>
  </section>
'''

# head replacements (PtS-specific strings -> per event)
def build_head(e):
    h=head_part
    title=html.escape(e['title'])
    nt=f"{e['title']} — Page to Stage | Encore Performing Arts"
    desc=f"{e['blurb']} A Page to Stage workshop-plus-live-theater experience with Encore Performing Arts."
    h=h.replace("<title>Page to Stage Theater Workshops | Encore Performing Arts — Encore</title>", f"<title>{html.escape(nt)}</title>")
    h=h.replace('content="Encore\'s Page to Stage program offers deep-dive theater workshops plus live show experiences to help students explore scripts, stories, and stagecraft."', f'content="{html.escape(desc)}"')
    h=h.replace('<link rel="canonical" href="https://www.encorepa.org/page-to-stage">', f'<link rel="canonical" href="https://www.encorepa.org/page-to-stage/{e["slug"]}">')
    h=h.replace('content="https://www.encorepa.org/page-to-stage"', f'content="https://www.encorepa.org/page-to-stage/{e["slug"]}"')
    h=h.replace('content="Page to Stage Theater Workshops | Encore Performing Arts — Encore"', f'content="{html.escape(nt)}"')
    h=h.replace('content="Deep-dive theater workshops plus live professional show experiences for young artists in southern Utah. Explore scripts, stories, and stagecraft from page to stage."', f'content="{html.escape(desc)}"')
    h=h.replace('<meta name="twitter:title" content="Page to Stage | Encore Performing Arts">', f'<meta name="twitter:title" content="{html.escape(nt)}">')
    h=h.replace('content="Theater workshops plus live show experiences for young artists in southern Utah."', f'content="{html.escape(e["blurb"])}"')
    h=h.replace('content="Encore young artists at a Page to Stage live theater experience"', f'content="Encore Young Artists at a Page to Stage trip to see {title}"')
    # JSON-LD swap (first ld+json block)
    h=re.sub(r'<script type="application/ld\+json">.*?</script>', jsonld(e).replace('\\','\\\\'), h, count=1, flags=re.S)
    # breadcrumb swap
    bc_old='''<nav class="crumbs" aria-label="Breadcrumb">
  <div class="wrap">
    <ol>
      <li><a href="/">Home</a></li>
      <li aria-current="page">Page to Stage</li>
    </ol>
  </div>
</nav>'''
    bc_new=f'''<nav class="crumbs" aria-label="Breadcrumb">
  <div class="wrap">
    <ol>
      <li><a href="/">Home</a></li>
      <li><a href="/page-to-stage">Page to Stage</a></li>
      <li aria-current="page">{title}</li>
    </ol>
  </div>
</nav>'''
    h=h.replace(bc_old, bc_new)
    # Per-event theming: accent + light-button text follow this event's palette (not brand teal)
    b,m,d=e['theme']
    h=h.replace('--accent:#358193;', f'--accent:{m};').replace('--accent-2:#2c6c7d;', f'--accent-2:{d};')
    h=h.replace('.btn-light{background:var(--cream);color:var(--charcoal);}',
                f'.btn-light{{background:var(--cream);color:{d};}}')
    return h

for e in events:
    page = build_head(e) + '<article>' + build_article(e) + '</article>' + tail
    open(f"{DEPLOY}/page-to-stage/{e['slug']}.html","w").write(page)

print("event pages written:", len(os.listdir(f"{DEPLOY}/page-to-stage")))
print(sorted(os.listdir(f"{DEPLOY}/page-to-stage")))
