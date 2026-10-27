/* Encore 2027 shared behavior: nav scroll state, mobile menu, banner parallax. */
(function(){
  var nav = document.getElementById('siteNav');
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('mMenu');
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Solid nav once the page scrolls
  function navState(){ if(nav) nav.classList.toggle('scrolled', (window.scrollY || window.pageYOffset) > 60); }

  // Mobile menu
  function setMenu(open){
    if(!menu || !burger) return;
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
    if(open){ var f = menu.querySelector('a'); if(f) setTimeout(function(){ f.focus(); }, 60); }
    else { burger.focus(); }
  }
  if(burger && menu){
    burger.addEventListener('click', function(){ setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function(e){
      if(!menu.classList.contains('open')) return;
      if(e.key === 'Escape'){ setMenu(false); return; }
      if(e.key === 'Tab'){
        var f = [burger].concat([].slice.call(menu.querySelectorAll('a,button')));
        var i = f.indexOf(document.activeElement);
        if(e.shiftKey && (i <= 0)){ e.preventDefault(); f[f.length-1].focus(); }
        else if(!e.shiftKey && i === f.length-1){ e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener('resize', function(){ if(window.innerWidth > 1100 && menu.classList.contains('open')) setMenu(false); });
  }

  // Parallax: [data-par="0.35"] moves at that fraction of scroll; [data-par-fade] also fades
  var pars = [].slice.call(document.querySelectorAll('[data-par]'));
  var ticking = false;
  function frame(){
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    navState();
    if(rm) return;
    pars.forEach(function(el){
      var host = el.closest('[data-par-host]') || el.parentNode;
      var h = host.offsetHeight;
      if(y > h + 100) return;
      var k = parseFloat(el.getAttribute('data-par')) || 0;
      el.style.transform = 'translate3d(0,' + (y * k).toFixed(1) + 'px,0)';
      if(el.hasAttribute('data-par-fade')) el.style.opacity = Math.max(0, 1 - y / (h * 0.75)).toFixed(3);
    });
  }
  window.addEventListener('scroll', function(){ if(!ticking){ ticking = true; requestAnimationFrame(frame); } }, {passive:true});
  frame();
})();
