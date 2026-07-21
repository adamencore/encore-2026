/* Past Shows -> SmugMug gallery links (interim shim, v3).
   Repo path: js/past-shows-links.js
   v3: collapses the Matilda + Shrek cast bands into single grid cards (their
   primary gallery covers all casts), then links every card. Logs
   "past-shows-links: N cards linked" to the console.
   Replace with real static markup in the next tooled build session, then delete. */
(function () {
  var BASE = 'https://www.alanholbenphoto.com/Art-Music-Theater/Theater/Encore-Performing-Arts/n-r9cRgb/';
  var COLLAPSE = ['matilda-jr', 'shrek-kids'];
  var MAP = {
    'chitty-chitty-bang-bang': '2025-Chitty-Chitty-Bang-Bang',
    'a-christmas-carol-2025': '2025-A-Christmas-Carol',
    'a-christmas-carol-2025-ivy-cast': '2025-A-Christmas-Carol/A-Christmas-Carol-Ivy-full',
    'a-christmas-carol-2025-holly-cast': '2025-A-Christmas-Carol/A-Christmas-Carol-Holly-full',
    'anastasia': '2026-Anastasia',
    'anastasia-empress-cast': '2026-Anastasia/2026-Anastasia-Empress-cast',
    'anastasia-imperial-cast': '2026-Anastasia/2026-Anastasia-Imperial-cast',
    'matilda-jr': '2026-Matilda',
    'shrek-kids': '2026-Shrek',
    'a-christmas-carol-2023-red-cast': '2023-A-Christmas-Carol-1/2023-A-Christmas-Carol-RED-11302023',
    'a-christmas-carol-2023-green-cast': '2023-A-Christmas-Carol-1/2023-A-Christmas-Carol-GREEN-12042023',
    'frozen-kids': '2024-Frozen',
    'hadestown-teen-edition': '2024-Hadestown-Teen-Edition',
    'greatest-showman': '2024-Greatest-Showman',
    'beauty-and-the-beast': '2024-Beauty-and-the-Beast',
    'aladdin-jr': '2024-Aladdin-Jr',
    '101-dalmatians': '2024-101-Dalmations',
    'villains-night-2024': '2024-Villains-Night',
    'alice-in-wonderland-jr': '2025-Alice-in-Wonderland-Jr',
    'seven-brides-for-seven-brothers': '2025-Seven-Brides-for-Seven-Brothers',
    'moana-jr': '2025-Moana-Jr',
    'newsies': '2023-Newsies-promo',
    'finding-nemo-jr': '2023-Nemo-Junior',
    'les-miserables': '2025-Les-Miserables-rehearsal'
  };
  function collapseGroups() {
    COLLAPSE.forEach(function (base) {
      var cast = document.querySelector('[data-slug^="' + base + '-"]');
      if (!cast) return;
      var group = cast.closest('.ps-group');
      if (!group || !group.parentElement) return;
      var head = group.querySelector('.ps-head');
      var img = head ? head.querySelector('img') : null;
      var pic = img ? (img.closest('picture') || img) : null;
      if (!pic) return;
      var a = document.createElement('a');
      a.className = 'ps-card';
      a.setAttribute('data-slug', base);
      a.setAttribute('aria-label', img.getAttribute('alt') || base);
      a.appendChild(pic);
      group.parentElement.replaceChild(a, group);
    });
  }
  function wire() {
    collapseGroups();
    var linked = 0;
    document.querySelectorAll('img').forEach(function (img) {
      var src = img.currentSrc || img.src || img.getAttribute('src') || '';
      if (src.indexOf('img/past-shows/') === -1) return;
      var slug = src.split('/').pop().split('?')[0].replace(/\.(webp|jpe?g|png)$/i, '');
      var card = img.closest('figure') || img.closest('a') || img.parentElement;
      if (!card || card.dataset.psLinked) return;
      var key = (card.getAttribute && card.getAttribute('data-slug')) || slug;
      var path = MAP[key] || MAP[slug];
      if (!path) return;
      card.dataset.psLinked = '1';
      var url = BASE + path;
      linked++;
      if (card.tagName === 'A') { card.href = url; card.target = '_blank'; card.rel = 'noopener'; return; }
      var wrapA = card.closest('a');
      if (wrapA) { wrapA.href = url; wrapA.target = '_blank'; wrapA.rel = 'noopener'; return; }
      card.style.cursor = 'pointer';
      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Open photo gallery: ' + (img.getAttribute('alt') || slug));
      function go() { window.open(url, '_blank', 'noopener'); }
      card.addEventListener('click', go);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
      card.querySelectorAll('*').forEach(function (el) {
        if (el.children.length === 0 && el.textContent.trim().toLowerCase() === 'gallery coming') { el.remove(); }
      });
    });
    if (window.console && console.log) { console.log('past-shows-links: ' + linked + ' cards linked'); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
