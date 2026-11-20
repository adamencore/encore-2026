/* ============================================================
   Encore giving widget (Stripe Payment Links)
   ------------------------------------------------------------
   One file owns every donation URL on the site. To swap a link,
   change it in LINKS below and nothing else.

   Usage
     <div class="give-widget" data-give data-ref="donate-page"
          data-default="monthly">
       <!-- no-JS fallback, always present in the markup -->
       <a class="btn give-go" href="https://buy.stripe.com/aFa6oH3lc4xx5Rk2etds400?client_reference_id=donate-page">Give now</a>
     </div>
     <script src="/js/give.js" defer></script>

   data-ref      -> Stripe client_reference_id (letters, numbers,
                    dashes, underscores; Stripe silently drops
                    anything else). Tags where a gift came from.
   data-default  -> "monthly" or "one-time" (default "monthly").

   Later seams (out of scope for phase 1): a custom monthly amount,
   a cover-the-fees checkbox and live totals all need Stripe
   Checkout or a webhook backend. Swap donate() to call a Netlify
   function then; nothing else on the page has to change.
   ============================================================ */
(function () {
  'use strict';

  var LINKS = {
    oneTime: 'https://buy.stripe.com/aFa6oH3lc4xx5Rk2etds400',
    monthly: {
      5:   'https://buy.stripe.com/28EbJ10904xxa7A1apds401',
      15:  'https://buy.stripe.com/cNi14n2h8aVVdjM7yNds402',
      25:  'https://buy.stripe.com/14AdR9cVM2pp6Vo9GVds403',
      50:  'https://buy.stripe.com/eVq3cvaNEe87bbEaKZds404',
      100: 'https://buy.stripe.com/6oUfZhf3U1lla7Af1fds405',
      250: 'https://buy.stripe.com/6oUfZh2h83tt1B4aKZds406'
    }
  };
  var ONE_TIME_PRESETS = [25, 55, 100, 250, 500, 1000];
  var MONTHLY_PRESETS = [5, 15, 25, 50, 100, 250];
  var CORE_AMOUNT = 25;

  function cleanRef(ref) {
    ref = String(ref || '').replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 200);
    return ref;
  }

  /* Build a Stripe Payment Link URL.
     opts.freq   'monthly' | 'one-time'
     opts.amount whole dollars (monthly must be one of MONTHLY_PRESETS;
                 one-time is prefilled with Stripe's prefilled_amount, in
                 cents, and the donor can still change it at checkout)
     opts.ref    client_reference_id
     opts.email  optional prefilled_email */
  function donate(opts) {
    opts = opts || {};
    var base, params = [];
    if (opts.freq === 'monthly') {
      base = LINKS.monthly[opts.amount] || LINKS.monthly[CORE_AMOUNT];
    } else {
      base = LINKS.oneTime;
      var a = parseInt(opts.amount, 10);
      if (a > 0) params.push('prefilled_amount=' + (a * 100));
    }
    var ref = cleanRef(opts.ref);
    if (ref) params.push('client_reference_id=' + ref);
    if (opts.email) params.push('prefilled_email=' + encodeURIComponent(opts.email));
    return base + (params.length ? '?' + params.join('&') : '');
  }

  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }

  function mount(root) {
    if (root.__give) return;
    root.__give = true;
    var ref = root.getAttribute('data-ref') || '';
    var freq = root.getAttribute('data-default') === 'one-time' ? 'one-time' : 'monthly';
    var amount = freq === 'monthly' ? CORE_AMOUNT : 100;
    var uid = 'gw' + Math.random().toString(36).slice(2, 7);

    root.innerHTML =
      '<div class="freq" role="group" aria-label="How often">' +
        '<button type="button" data-freq="monthly">Monthly</button>' +
        '<button type="button" data-freq="one-time">One-time</button>' +
      '</div>' +
      '<div class="amount-grid" role="group" aria-labelledby="' + uid + '"></div>' +
      '<p class="sr" id="' + uid + '">Choose an amount</p>' +
      '<a class="btn give-go" href="#">Give</a>' +
      '<p class="give-sub"></p>';

    var grid = root.querySelector('.amount-grid');
    var go = root.querySelector('.give-go');
    var sub = root.querySelector('.give-sub');

    function render() {
      [].forEach.call(root.querySelectorAll('.freq button'), function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-freq') === freq ? 'true' : 'false');
      });
      var presets = freq === 'monthly' ? MONTHLY_PRESETS : ONE_TIME_PRESETS;
      var html = '';
      presets.forEach(function (n) {
        var core = freq === 'monthly' && n === CORE_AMOUNT;
        var label = freq === 'monthly' ? 'Give ' + money(n) + ' monthly' : 'Give ' + money(n) + ' once';
        html += '<button type="button" class="amt' + (core ? ' core' : '') + '" data-amt="' + n + '" aria-label="' + label + (core ? ', Join The Core' : '') + '">' +
          money(n) + (core ? '<span class="amt-tag">Join The Core</span>' : '') + '</button>';
      });
      if (freq === 'one-time') html += '<button type="button" class="amt other" data-amt="other" aria-label="Give another amount once">Other</button>';
      grid.innerHTML = html;
      [].forEach.call(grid.querySelectorAll('.amt'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-amt')) === String(amount) ? 'true' : 'false');
      });

      var url, text;
      if (freq === 'monthly') {
        url = donate({ freq: 'monthly', amount: amount, ref: ref });
        text = 'Give ' + money(amount) + ' monthly';
        sub.innerHTML = 'Want a different monthly amount? <a href="/contact">Contact us</a>.';
      } else if (amount === 'other') {
        url = donate({ freq: 'one-time', ref: ref });
        text = 'Choose your amount';
        sub.innerHTML = 'You will enter your amount on the secure Stripe page.';
      } else {
        url = donate({ freq: 'one-time', amount: amount, ref: ref });
        text = 'Give ' + money(amount) + ' once';
        sub.innerHTML = 'You can change the amount on the secure Stripe page.';
      }
      go.href = url;
      go.innerHTML = text + ' &rarr;';
    }

    root.addEventListener('click', function (e) {
      var f = e.target.closest('[data-freq]');
      if (f) {
        freq = f.getAttribute('data-freq');
        amount = freq === 'monthly' ? CORE_AMOUNT : 100;
        render();
        return;
      }
      var a = e.target.closest('[data-amt]');
      if (a) {
        var v = a.getAttribute('data-amt');
        amount = v === 'other' ? 'other' : parseInt(v, 10);
        render();
        return;
      }
      if (e.target.closest('.give-go') && typeof window.gtag === 'function') {
        window.gtag('event', 'donate_click', {
          frequency: freq,
          value: amount === 'other' ? undefined : amount,
          currency: 'USD',
          give_ref: ref
        });
      }
    });

    render();
    root.classList.add('is-live');
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-give]'), mount);
  }

  window.EncoreGive = { donate: donate, mount: mount, init: init, LINKS: LINKS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
