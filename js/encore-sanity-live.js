/* ============================================================
   ENCORE — live content from Sanity
   ------------------------------------------------------------
   Connects encorepa.org to the Sanity CMS.

   Right now it controls ONE thing: the announcement bar at the
   top of every page. Edit it in Sanity under "Site Settings",
   hit Publish, refresh the site — it changes. No pushing, no
   GitHub, no waiting.

   SAFE BY DESIGN: if Sanity is unreachable, slow, or the
   content is empty, this script does nothing at all and the
   bar keeps whatever text is already written into the page.
   It can't break the site.

   Project: cakoldrm   Dataset: production
   ============================================================ */
(function () {
  'use strict';

  var PROJECT = 'cakoldrm';
  var DATASET = 'production';
  var API_VERSION = 'v2023-05-03';

  var query =
    '*[_type=="siteSettings"][0]{announcementEnabled,announcementText,announcementLink}';

  var url =
    'https://' + PROJECT + '.apicdn.sanity.io/' + API_VERSION +
    '/data/query/' + DATASET + '?query=' + encodeURIComponent(query);

  function applyAnnouncement(s) {
    if (!s) return;

    var bar = document.getElementById('anncBar') || document.querySelector('.annc');
    if (!bar) return;

    // Turned off in Sanity -> hide the bar site-wide.
    if (s.announcementEnabled === false) {
      bar.style.display = 'none';
      document.documentElement.style.setProperty('--annc-h', '0px');
      return;
    }

    var link = bar.querySelector('.annc-link');
    if (!link) return;

    var text = (s.announcementText || '').trim();
    var href = (s.announcementLink || '').trim();
    if (!text) return;

    // If the message CHANGED, un-dismiss it for people who closed the old one.
    try {
      var seenKey = 'encoreAnncSeen';
      var lastSeen = window.localStorage.getItem(seenKey);
      if (lastSeen !== text) {
        window.localStorage.setItem(seenKey, text);
        bar.classList.remove('hide');
        bar.style.display = '';
        // clear any older dismissal flags this site has used
        for (var i = window.localStorage.length - 1; i >= 0; i--) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf('encoreAnnc_') === 0) window.localStorage.removeItem(k);
        }
      }
    } catch (e) { /* private browsing — ignore */ }

    link.textContent = text;
    if (href) link.setAttribute('href', href);
  }

  function go() {
    if (!window.fetch) return;
    fetch(url, { mode: 'cors', credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.result) applyAnnouncement(d.result); })
      .catch(function () { /* offline or blocked — leave the page as-is */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', go);
  } else {
    go();
  }
})();
