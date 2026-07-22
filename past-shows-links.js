/* Past Shows -> SmugMug gallery links (interim shim, v5).
   Repo path: js/past-shows-links.js
   v5: adds a sort bar above the grid (Featured / Newest / Oldest / A-Z).
   Also: v4 archive card injection, v3 Matilda+Shrek band collapse, v2 linking.
   Logs "past-shows-links: N cards linked" to the console.
   Replace with real static markup in the next tooled build session, then delete. */
(function () {
  var BASE = 'https://www.alanholbenphoto.com/Art-Music-Theater/Theater/Encore-Performing-Arts/n-r9cRgb/';
  var COLLAPSE = ['matilda-jr', 'shrek-kids'];
  var NEW_CARDS = [
    { slug: 'aristocats-kids', alt: "Disney's The Aristocats Kids" },
    { slug: 'music-man', alt: 'The Music Man' },
    { slug: 'descendants', alt: "Disney's Descendants The Musical" },
    { slug: 'encanto', alt: 'Encanto' },
    { slug: 'addams-family', alt: 'The Addams Family Jr.' }
  ];
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
    'les-miserables': '2025-Les-Miserables-rehearsal',
    'aristocats-kids': '2023-Aristocats-Kids',
    'music-man': '2023-Music-Man',
    'descendants': '2022-Descendants',
    'encanto': '2023-Encanto',
    'addams-family': '2021-Addams-Family'
  };
  function yearOf(slug) {
    var p = MAP[slug];
    var m = p ? p.match(/^(\d{4})-/) : null;
    if (m) return parseInt(m[1], 10);
    m = (slug || '').match(/(20\d\d)/);
    return m ? parseInt(m[1], 10) : 0;
  }
  function sortTitle(t) {
    return (t || '').replace(/^(Disney's|Roald Dahl's)\s+/i, '').replace(/^The\s+/i, '').toLowerCase();
  }
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
  function addNewCards() {
    var grid = document.querySelector('.ps-grid');
    if (!grid) return;
    NEW_CARDS.forEach(function (c) {
      if (document.querySelector('[data-slug="' + c.slug + '"]')) return;
      var a = document.createElement('a');
      a.className = 'ps-card';
      a.setAttribute('data-slug', c.slug);
      a.setAttribute('aria-label', c.alt);
      var img = document.createElement('img');
      img.src = '/img/past-shows/' + c.slug + '.jpg';
      img.alt = c.alt;
      img.loading = 'lazy';
      img.onerror = function () { a.remove(); };
      a.appendChild(img);
      grid.appendChild(a);
    });
  }
  function itemInfo(el) {
    var slug, img;
    if (el.classList && el.classList.contains('ps-group')) {
      var castEl = el.querySelector('[data-slug]');
      slug = castEl ? castEl.getAttribute('data-slug') : '';
      img = el.querySelector('.ps-head img') || el.querySelector('img');
    } else {
      slug = el.getAttribute ? (el.getAttribute('data-slug') || '') : '';
      img = el.querySelector ? el.querySelector('img') : null;
    }
    return { year: yearOf(slug), title: sortTitle(img ? img.getAttribute('alt') : slug) };
  }
  function buildSort() {
    var grid = document.querySelector('.ps-grid');
    if (!grid || document.querySelector('.ps-sort')) return;
    var original = Array.prototype.slice.call(grid.children);
    var st = document.createElement('style');
    st.textContent = '.ps-sort{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 22px;}' +
      '.ps-sort button{font-family:inherit;font-size:13.5px;font-weight:600;color:var(--charcoal,#123139);background:var(--paper,#fdfcfa);border:1px solid var(--line,rgba(21,65,76,.16));padding:9px 17px;border-radius:100px;cursor:pointer;transition:transform .2s,background .2s,color .2s;}' +
      '.ps-sort button:hover{transform:translateY(-1px);}' +
      '.ps-sort button[aria-pressed="true"]{background:var(--charcoal,#123139);color:var(--cream,#e9e4e0);border-color:var(--charcoal,#123139);}';
    document.head.appendChild(st);
    var bar = document.createElement('div');
    bar.className = 'ps-sort';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Sort shows');
    var modes = [
      { id: 'featured', label: 'Featured' },
      { id: 'new', label: 'Newest' },
      { id: 'old', label: 'Oldest' },
      { id: 'az', label: 'A to Z' }
    ];
    function apply(mode) {
      var items = original.filter(function (el) { return el.isConnected; });
      if (mode !== 'featured') {
        items = items.slice().sort(function (a, b) {
          var ia = itemInfo(a), ib = itemInfo(b);
          if (mode === 'new') return ib.year - ia.year || (ia.title < ib.title ? -1 : 1);
          if (mode === 'old') return ia.year - ib.year || (ia.title < ib.title ? -1 : 1);
          return ia.title < ib.title ? -1 : ia.title > ib.title ? 1 : 0;
        });
      }
      items.forEach(function (el) { grid.appendChild(el); });
      bar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false');
      });
    }
    modes.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.mode = m.id;
      b.textContent = m.label;
      b.setAttribute('aria-pressed', m.id === 'featured' ? 'true' : 'false');
      b.addEventListener('click', function () { apply(m.id); });
      bar.appendChild(b);
    });
    grid.parentElement.insertBefore(bar, grid);
  }
  function wire() {
    collapseGroups();
    addNewCards();
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
      if (card.tagName === 'A') { card.href = url; card.target = '_blank'; card.rel = 'noopener'; }
      else {
        var wrapA = card.closest('a');
        if (wrapA) { wrapA.href = url; wrapA.target = '_blank'; wrapA.rel = 'noopener'; }
        else {
          card.style.cursor = 'pointer';
          card.setAttribute('role', 'link');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label', 'Open photo gallery: ' + (img.getAttribute('alt') || slug));
          card.addEventListener('click', function () { window.open(url, '_blank', 'noopener'); });
          card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(url, '_blank', 'noopener'); }
          });
          card.querySelectorAll('*').forEach(function (el) {
            if (el.children.length === 0 && el.textContent.trim().toLowerCase() === 'gallery coming') { el.remove(); }
          });
        }
      }
    });
    buildSort();
    if (window.console && console.log) { console.log('past-shows-links: ' + linked + ' cards linked'); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
