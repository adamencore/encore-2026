/* Past Shows -> SmugMug gallery links (interim shim).
   Repo path: js/past-shows-links.js
   Loaded from past-shows.html via:
   <script src="/js/past-shows-links.js" defer></script>
   Replace with real static <a> wrappers in the next tooled build session, then delete this file. */
(function () {
  var BASE = 'https://www.alanholbenphoto.com/Art-Music-Theater/Theater/Encore-Performing-Arts/n-r9cRgb/';
  var MAP = {
    'chitty-chitty-bang-bang': '2025-Chitty-Chitty-Bang-Bang',
    'a-christmas-carol-2025': '2025-A-Christmas-Carol',
    'a-christmas-carol-2025-ivy-cast': '2025-A-Christmas-Carol/A-Christmas-Carol-Ivy-full',
    'a-christmas-carol-2025-holly-cast': '2025-A-Christmas-Carol/A-Christmas-Carol-Holly-full',
    'anastasia': '2026-Anastasia',
    'anastasia-empress-cast': '2026-Anastasia/2026-Anastasia-Empress-cast',
    'anastasia-imperial-cast': '2026-Anastasia/2026-Anastasia-Imperial-cast',
    'matilda-jr': '2026-Matilda',
    'matilda-jr-mayhem-cast': '2026-Matilda/Matilda-Mayhem-cast',
    'matilda-jr-mischief-cast': '2026-Matilda',
    'shrek-kids': '2026-Shrek',
    'shrek-kids-fairytale-cast': '2026-Shrek/2026-Shrek-Fairytale-Cast',
    'shrek-kids-storybook-cast': '2026-Shrek/2026-Shrek-Storybook',
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
  document.querySelectorAll('img[src*="/img/past-shows/"]').forEach(function (img) {
    var slug = (img.getAttribute('src') || '').split('/').pop().replace(/\.(webp|jpe?g|png)$/i, '');
    var path = MAP[slug];
    if (!path) return;
    var card = img.closest('figure') || img.parentElement;
    if (!card) return;
    var url = BASE + path;
    if (card.closest('a')) { card.closest('a').href = url; return; }
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
})();
