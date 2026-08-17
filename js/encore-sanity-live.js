/* ============================================================
   ENCORE — live content from Sanity
   ------------------------------------------------------------
   Controls the announcement bar at the top of every page.
   Edit it in Sanity under "Site Settings", hit Publish,
   refresh the site. No pushing, no GitHub.

   It reads from /.netlify/functions/site-content, NOT from
   Sanity directly. That endpoint holds the read token on the
   server, so the Sanity dataset stays private and no password
   is ever exposed in the browser.

   SAFE BY DESIGN: if anything fails, this script does nothing
   and the bar keeps whatever text is already in the page.
   ============================================================ */
(function () {
  'use strict';

  var ENDPOINT = '/.netlify/functions/site-content';

  function applyAnnouncement(a) {
    if (!a) return;

    var bar = document.getElementById('anncBar') || document.querySelector('.annc');
    if (!bar) return;

    if (a.enabled === false) {
      bar.style.display = 'none';
      document.documentElement.style.setProperty('--annc-h', '0px');
      return;
    }

    var link = bar.querySelector('.annc-link');
    if (!link) return;

    var text = (a.text || '').trim();
    var href = (a.link || '').trim();
    if (!text) return;

    // If the message CHANGED, show it again to people who dismissed the old one.
    try {
      var seenKey = 'encoreAnncSeen';
      if (window.localStorage.getItem(seenKey) !== text) {
        window.localStorage.setItem(seenKey, text);
        bar.classList.remove('hide');
        bar.style.display = '';
        for (var i = window.localStorage.length - 1; i >= 0; i--) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf('encoreAnnc_') === 0) window.localStorage.removeItem(k);
        }
      }
    } catch (e) { /* private browsing — ignore */ }

    link.textContent = text;
    if (href) link.setAttribute('href', href);
  }


  /* ---------------------------------------------------------
     Footer: add the Classes link to the Explore column.
     Done here rather than editing ~66 page files by hand.
     Idempotent and self-removing if the link is ever baked in.
     --------------------------------------------------------- */
  function addClassesToFooter() {
    try {
      var cols = document.querySelectorAll('footer .foot-col');
      for (var i = 0; i < cols.length; i++) {
        var h = cols[i].querySelector('h5');
        if (!h || h.textContent.trim().toLowerCase() !== 'explore') continue;

        // already present (baked into the HTML, or added by a previous run)
        if (cols[i].querySelector('a[href="/classes"]')) return;

        var link = document.createElement('a');
        link.href = '/classes';
        link.textContent = 'Classes';

        // sit it next to Programs by Age, which is its natural neighbour
        var programs = cols[i].querySelector('a[href="/programs"]');
        if (programs && programs.nextSibling) {
          cols[i].insertBefore(link, programs.nextSibling);
        } else if (programs) {
          cols[i].appendChild(link);
        } else {
          cols[i].appendChild(link);
        }
        return;
      }
    } catch (e) { /* never break the page over a footer link */ }
  }

  function go() {
    if (!window.fetch) return;
    fetch(ENDPOINT, { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ok && d.announcement) applyAnnouncement(d.announcement);
      })
      .catch(function () { /* leave the page exactly as it is */ });
  }

  function init() {
    addClassesToFooter();   // runs regardless of whether Sanity responds
    go();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
