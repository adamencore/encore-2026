"""Builds the Ask Encore knowledge file from the live site's own pages.
Each page is rendered in Chromium (so catalogue pages that draw from JS arrays are included),
its <main> text is taken, and the result is written to netlify/functions/ask-encore-kb.json.
Re-run after any content change and commit the JSON."""
import json, re, datetime
from playwright.sync_api import sync_playwright
REPO = '/home/claude/encore-2026/'
PAGES = ['', 'about', 'programs', 'camps', 'junior', 'emerging-artists', 'senior', 'aspire-performing-co', 'aspire-traditions',
         'auditions', 'tickets', 'a-christmas-carol-tickets', 'christmas-carol-camp-2026', 'little-mermaid', 'classes',
         'classes/musical-theatre-foundations', 'classes/musical-theatre-jazz', 'classes/freestyle-hip-hop', 'classes/art-of-improv',
         'classes/audition-workshop', 'classes/finding-your-voice-in-tap', 'page-to-stage', 'sensory-friendly-performances',
         'asl-interpreted-performances', 'donate', 'core-community', 'contact', 'electric-theater', 'fees', 'multi-child-discount',
         'encore-scholarship-application', 'past-shows']
DROP = re.compile(r'^(Skip to content|Menu|Close|Get Tickets|Donate|Tickets|→|←|‹|›|▶|Play video)$')
out = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 900})
    pg.route(re.compile(r'elfsight|givebutter|youtube|google|thundertix'), lambda r: r.abort())
    for slug in PAGES:
        pg.goto(f'http://localhost:8765/{slug or "index"}.html', wait_until='domcontentloaded')
        pg.wait_for_timeout(400)
        title = pg.title().split(' | ')[0]
        txt = pg.evaluate("""() => { const m = document.querySelector('main') || document.body;
            const c = m.cloneNode(true); c.querySelectorAll('script,style,svg,nav,footer,form,[aria-hidden="true"],[hidden],.cpop,.mmenu,.annc').forEach(e => e.remove());
            return c.innerText; }""")
        lines = [re.sub(r'\s+', ' ', l).strip() for l in txt.split('\n')]
        lines = [l for l in lines if l and not DROP.match(l)]
        dedup = []
        for l in lines:
            if not dedup or dedup[-1] != l: dedup.append(l)
        text = '\n'.join(dedup).replace('—', ', ')
        out.append({'url': '/' + slug, 'title': title, 'text': text[:9000]})
    b.close()
kb = {'built': datetime.date.today().isoformat(), 'pages': out}
open(REPO + 'netlify/functions/ask-encore-kb.json', 'w').write(json.dumps(kb, ensure_ascii=False, indent=0))
chars = sum(len(x['text']) for x in out)
print(len(out), 'pages', chars, 'chars ~', chars // 4, 'tokens')
for x in out: print(len(x['text']), x['url'], x['title'][:50])
