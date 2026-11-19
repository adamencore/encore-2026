/* ============================================================
   Encore giving campaigns, driven by /data/campaigns.json.
   - Any element with [data-campaign-cards] gets a card grid of
     active campaigns (used on /donate and /campaigns).
   - /campaigns/<slug> (campaign.html via _redirects) fills itself
     from the matching campaign.
   Add or close a campaign by editing the JSON only.
   Needs /js/give.js on the page for the giving widget.
   ============================================================ */
(function () {
  'use strict';
  var DATA = '/data/campaigns.json';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function longDate(iso) {
    var p = String(iso).split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function isOpen(c) {
    if (!c.active) return false;
    if (!c.deadline) return true;
    var p = c.deadline.split('-');
    var end = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
    return Date.now() <= end.getTime();
  }
  function tagFor(c) {
    if (c.alwaysOpen) return 'Always open';
    if (c.goal && c.deadline) return 'Goal ' + money(c.goal) + ' by ' + longDate(c.deadline);
    if (c.goal) return 'Goal ' + money(c.goal);
    if (c.deadline) return 'Through ' + longDate(c.deadline);
    return 'Open now';
  }
  function load() {
    return fetch(DATA, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('campaigns ' + r.status);
      return r.json();
    }).then(function (d) { return d.campaigns || []; });
  }

  function cards(list) {
    return list.map(function (c) {
      var img = c.image ? '<div class="cc-img"><img src="' + esc(c.image) + '" alt="" loading="lazy" decoding="async"></div>' : '';
      var raised = c.raised && c.goal ? '<p class="cc-raised">' + money(c.raised) + ' raised of ' + money(c.goal) + '</p>' : '';
      return '<article class="cc">' + img +
        '<div class="cc-b"><div class="tag">' + esc(tagFor(c)) + '</div>' +
        '<h3><a href="/campaigns/' + esc(c.slug) + '">' + esc(c.title) + '</a></h3>' +
        '<p>' + esc(c.summary) + '</p>' + raised +
        '<a class="btn cc-go" href="/campaigns/' + esc(c.slug) + '" aria-label="Give to ' + esc(c.title) + '">Give to this campaign &rarr;</a></div></article>';
    }).join('');
  }

  function fillCards() {
    var slots = document.querySelectorAll('[data-campaign-cards]');
    if (!slots.length) return;
    load().then(function (all) {
      var open = all.filter(isOpen).sort(function (a, b) { return (b.alwaysOpen ? 1 : 0) - (a.alwaysOpen ? 1 : 0); });
      [].forEach.call(slots, function (el) { if (open.length) el.innerHTML = cards(open); });
    }).catch(function () { /* keep the static fallback card */ });
  }

  function fillDetail() {
    var page = document.querySelector('[data-campaign-page]');
    if (!page) return;
    var m = location.pathname.match(/^\/campaigns\/([A-Za-z0-9_-]+)\/?$/);
    var slug = m ? m[1] : new URLSearchParams(location.search).get('slug');
    if (!slug) { location.replace('/campaigns'); return; }

    load().then(function (all) {
      var c = all.filter(function (x) { return x.slug === slug; })[0];
      var open = c && isOpen(c);
      var widget = page.querySelector('[data-give-deferred]'); // mounted here, after data-ref is set
      if (!c || !open) {
        page.querySelector('[data-c-title]').textContent = c ? c.title : 'Campaign not found';
        page.querySelector('[data-c-summary]').textContent = c
          ? 'This campaign has closed. Thank you to everyone who gave. You can still support Encore below.'
          : 'We could not find that campaign. You can still support Encore below, or see every open campaign.';
        page.querySelector('[data-c-story]').hidden = true;
        widget.setAttribute('data-ref', 'campaign-closed-' + slug.replace(/[^A-Za-z0-9_-]/g, ''));
        document.title = (c ? c.title + ' (closed)' : 'Campaign not found') + ' | Encore Performing Arts';
      } else {
        document.title = c.title + ' | Give to Encore Performing Arts';
        var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', c.summary);
        var cn = document.querySelector('link[rel="canonical"]'); if (cn) cn.setAttribute('href', 'https://www.encorepa.org/campaigns/' + c.slug);
        page.querySelector('[data-c-title]').textContent = c.title;
        page.querySelector('[data-c-summary]').textContent = c.summary;
        page.querySelector('[data-c-tag]').textContent = tagFor(c);
        page.querySelector('[data-c-body]').innerHTML = (c.body || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
        var fl = page.querySelector('[data-c-funds]');
        if (c.funds && c.funds.length) fl.innerHTML = c.funds.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('');
        else fl.parentNode.hidden = true;
        var facts = [];
        if (c.goal) facts.push('<div><dt>Goal</dt><dd>' + money(c.goal) + '</dd></div>');
        if (c.raised) facts.push('<div><dt>Raised so far</dt><dd>' + money(c.raised) + '</dd></div>');
        if (c.deadline) facts.push('<div><dt>Ends</dt><dd>' + esc(longDate(c.deadline)) + '</dd></div>');
        var fe = page.querySelector('[data-c-facts]');
        if (facts.length) fe.innerHTML = facts.join(''); else fe.hidden = true;
        if (c.image) {
          var im = page.querySelector('[data-c-img]');
          im.innerHTML = '<img src="' + esc(c.image) + '" alt="" decoding="async">';
          im.hidden = false;
        }
        widget.setAttribute('data-ref', 'campaign-' + c.slug);
        widget.setAttribute('data-default', c.defaultFrequency === 'one-time' ? 'one-time' : 'monthly');
      }
      page.classList.add('is-ready');
      if (window.EncoreGive) window.EncoreGive.mount(widget);
    }).catch(function () {
      page.classList.add('is-ready');
      var w = page.querySelector('[data-give-deferred]');
      if (window.EncoreGive && w) window.EncoreGive.mount(w);
    });
  }

  function init() { fillCards(); fillDetail(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
