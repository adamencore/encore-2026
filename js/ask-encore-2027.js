/* ============================================================
   Ask Encore (2027 design): chat box powered by Claude.
   Talks to /.netlify/functions/ask-encore, which answers only from
   the site's own pages. Loaded once from the shared 2027 footer.
   Until ANTHROPIC_API_KEY is set on Netlify, every question gets
   the contact fallback, so it is safe to ship before the key exists.
   ============================================================ */
(function () {
  if (window.__askEncore27) return;
  window.__askEncore27 = true;

  var ENDPOINT = '/.netlify/functions/ask-encore';
  var STORE = 'askEncore27';
  var SUGGEST = ['When are the next auditions?', 'How do I buy tickets?', 'What programs fit my Young Artist?', 'Do you offer sensory-friendly shows?'];
  var FALLBACK = 'Sorry, I can’t answer right now. You can reach the team at <a href="mailto:hello@encorepa.org">hello@encorepa.org</a> or <a href="tel:+14354140049">(435) 414-0049</a>.';
  var SLOW = 'You’ve asked a lot of questions in a short time. Please try again in a few minutes, or email <a href="mailto:hello@encorepa.org">hello@encorepa.org</a>.';

  var css = '' +
    '.ae-fab{position:fixed;right:20px;bottom:20px;z-index:90;display:inline-flex;align-items:center;gap:10px;height:56px;padding:0 22px 0 18px;border:0;border-radius:70px;background:var(--teal,#34789b);color:#fbf6f2;font:500 16px Mikado,system-ui,sans-serif;cursor:pointer;box-shadow:0 14px 34px -14px rgba(17,17,17,.6);transition:transform .2s,background .2s}' +
    '.ae-fab:hover{transform:translateY(-2px);background:#2a6584}' +
    '.ae-fab svg{width:22px;height:22px}' +
    'body.menu-open .ae-fab,body.ae-open .ae-fab{display:none}' +
    '.ae-panel{position:fixed;right:20px;bottom:20px;z-index:95;width:min(400px,calc(100vw - 40px));height:min(620px,calc(100vh - 40px));display:flex;flex-direction:column;background:#faf6f2;color:#111;border-radius:28px;overflow:hidden;box-shadow:0 30px 70px -24px rgba(17,17,17,.55);font-family:Mikado,system-ui,sans-serif}' +
    '.ae-panel[hidden]{display:none}' +
    '.ae-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 18px 16px 22px;background:#111;color:#fbf6f2}' +
    '.ae-head h2{margin:0;font:400 28px/1 "Instrument Serif",Georgia,serif;letter-spacing:-.02em}' +
    '.ae-head p{margin:4px 0 0;font-size:13px;font-weight:400;color:#c9cfc7}' +
    '.ae-x{flex:none;width:40px;height:40px;border-radius:50%;border:1.5px solid rgba(251,246,242,.4);background:none;color:#fbf6f2;font-size:22px;line-height:1;cursor:pointer}' +
    '.ae-x:hover{background:rgba(251,246,242,.12)}' +
    '.ae-log{flex:1;overflow-y:auto;padding:18px 16px 8px;display:flex;flex-direction:column;gap:10px}' +
    '.ae-msg{max-width:88%;padding:12px 15px;border-radius:20px;font-size:16px;line-height:1.45;font-weight:400;overflow-wrap:anywhere}' +
    '.ae-msg a{color:#2a6584;font-weight:700}' +
    '.ae-bot{align-self:flex-start;background:#fff;border-bottom-left-radius:6px}' +
    '.ae-me{align-self:flex-end;background:var(--teal,#34789b);color:#fbf6f2;border-bottom-right-radius:6px}' +
    '.ae-typing{display:inline-flex;gap:5px;padding:16px 18px}' +
    '.ae-typing i{width:7px;height:7px;border-radius:50%;background:#9aa;animation:aeDot 1s infinite}' +
    '.ae-typing i:nth-child(2){animation-delay:.15s}.ae-typing i:nth-child(3){animation-delay:.3s}' +
    '@keyframes aeDot{0%,80%,100%{opacity:.3}40%{opacity:1}}' +
    '.ae-sugg{display:flex;flex-wrap:wrap;gap:8px;padding:2px 16px 10px}' +
    '.ae-sugg button{border:0;background:#efedea;color:#3d3d3d;border-radius:70px;padding:8px 13px;font:400 14px Mikado,system-ui,sans-serif;cursor:pointer;text-align:left}' +
    '.ae-sugg button:hover{background:#e4e1dd}' +
    '.ae-form{display:flex;gap:8px;padding:12px 14px;border-top:1px solid #e6e1db;background:#faf6f2}' +
    '.ae-form input{flex:1;min-width:0;height:48px;border:1.5px solid #ddd7d0;border-radius:70px;padding:0 18px;font:400 16px Mikado,system-ui,sans-serif;color:#111;background:#fff}' +
    '.ae-form input:focus-visible{outline:3px solid #7dcbdd;outline-offset:1px}' +
    '.ae-form button{flex:none;width:48px;height:48px;border:0;border-radius:50%;background:var(--teal,#34789b);color:#fbf6f2;cursor:pointer;display:grid;place-items:center}' +
    '.ae-form button:disabled{opacity:.5;cursor:default}' +
    '.ae-form button svg{width:20px;height:20px}' +
    '.ae-fine{margin:0;padding:0 16px 12px;font-size:12px;line-height:1.4;color:#6a6a6a;background:#faf6f2}' +
    '@media (max-width:560px){.ae-fab{right:14px;bottom:14px;height:52px;padding:0 18px 0 15px}.ae-panel{right:0;bottom:0;width:100vw;height:100%;max-height:100dvh;border-radius:0}}' +
    '@media (prefers-reduced-motion:reduce){.ae-fab{transition:none}.ae-typing i{animation:none}}';

  var CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  var SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Escape everything, then allow only markdown links to site paths, bold, and line breaks.
  function render(s) {
    var h = esc(s);
    h = h.replace(/\[([^\]]{1,80})\]\((\/(?!\/)[^\s)]*)\)/g, function (_, t, u) { return '<a href="' + u + '">' + t + '</a>'; });
    h = h.replace(/\*\*([^*]{1,120})\*\*/g, '<strong>$1</strong>');
    return h.replace(/\n/g, '<br>');
  }

  var history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE) || '[]') || []; } catch (e) { history = []; }
  function save() { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-12))); } catch (e) {} }

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'ae-fab'; fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = CHAT + '<span>Ask Encore</span>';

  var panel = document.createElement('section');
  panel.className = 'ae-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'aeTitle');
  panel.innerHTML =
    '<div class="ae-head"><div><h2 id="aeTitle">Ask Encore</h2><p>Quick answers about shows, auditions and programs</p></div>' +
    '<button type="button" class="ae-x" aria-label="Close chat">&times;</button></div>' +
    '<div class="ae-log" aria-live="polite"></div>' +
    '<div class="ae-sugg"></div>' +
    '<form class="ae-form"><label for="aeIn" class="sr">Your question</label><input id="aeIn" type="text" maxlength="600" autocomplete="off" placeholder="Ask a question">' +
    '<button type="submit" aria-label="Send">' + SEND + '</button></form>' +
    '<p class="ae-fine">Answers are AI-generated from our website and can be wrong. Please don’t share personal details here.</p>';

  document.body.appendChild(fab); document.body.appendChild(panel);
  var log = panel.querySelector('.ae-log'), sugg = panel.querySelector('.ae-sugg'), form = panel.querySelector('.ae-form'),
      input = panel.querySelector('input'), sendBtn = form.querySelector('button'), busy = false;

  function bubble(role, html) {
    var d = document.createElement('div');
    d.className = 'ae-msg ' + (role === 'user' ? 'ae-me' : 'ae-bot');
    d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function drawSugg() {
    sugg.innerHTML = '';
    if (history.length) return;
    SUGGEST.forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
      b.addEventListener('click', function () { ask(q); }); sugg.appendChild(b);
    });
  }
  function boot() {
    log.innerHTML = '';
    bubble('assistant', 'Hi! I can help with shows, tickets, auditions, classes and programs at Encore. What would you like to know?');
    history.forEach(function (m) { bubble(m.role, m.role === 'user' ? esc(m.content) : render(m.content)); });
    drawSugg();
  }

  function ask(q) {
    q = (q || '').trim(); if (!q || busy) return;
    busy = true; sendBtn.disabled = true; input.value = '';
    history.push({ role: 'user', content: q.slice(0, 600) }); save();
    bubble('user', esc(q)); sugg.innerHTML = '';
    var t = bubble('assistant', '<span class="ae-typing" aria-label="Thinking"><i></i><i></i><i></i></span>');
    t.style.padding = '0';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        t.style.padding = '';
        if (d && d.ok && d.answer) {
          history.push({ role: 'assistant', content: d.answer }); save();
          t.innerHTML = render(d.answer);
        } else {
          history.pop(); save();
          t.innerHTML = d && d.reason === 'slow-down' ? SLOW : FALLBACK;
        }
      })
      .catch(function () { t.style.padding = ''; history.pop(); save(); t.innerHTML = FALLBACK; })
      .then(function () { busy = false; sendBtn.disabled = false; log.scrollTop = log.scrollHeight; input.focus(); });
  }

  function open() {
    panel.hidden = false; document.body.classList.add('ae-open'); fab.setAttribute('aria-expanded', 'true');
    if (!log.children.length) boot();
    setTimeout(function () { input.focus(); }, 40);
  }
  function close() {
    panel.hidden = true; document.body.classList.remove('ae-open'); fab.setAttribute('aria-expanded', 'false'); fab.focus();
  }
  fab.setAttribute('aria-expanded', 'false');
  fab.addEventListener('click', open);
  panel.querySelector('.ae-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
})();
