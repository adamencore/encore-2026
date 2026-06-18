/* ============================================================
   Ask Encore — instant-answer FAQ widget (self-contained, no backend)
   Floating button on every page. Client-side keyword search over a
   curated knowledge base; returns a concise answer + a link to the
   source page. No API key, no serverless function, free to run.

   Add site-wide with ONE tag before </body> (or via Netlify snippet
   injection):  <script defer src="/js/ask-encore.js"></script>
   ============================================================ */
(function () {
  if (window.__askEncoreLoaded) return;
  window.__askEncoreLoaded = true;

  var TEAL = "#338093", INK = "#22454d", CREAM = "#f4f0ea";

  /* ---- Curated knowledge base (edit here to keep answers current) ----
     a = answer shown · url/title = the source link · k = match keywords */
  var KB = [
    { title: "Programs", url: "/programs", k: "program programs classes overview what offer ages levels options",
      a: "Encore offers six youth programs: week-long Camps, Junior shows, Emerging Artists, the Signature Series, the audition-based Aspire Performing Co, and Page to Stage \u2014 each built for different ages and experience levels." },
    { title: "Musical Theater Camps", url: "/camps", k: "camp camps summer week intensive young beginner first short ages",
      a: "Camps are short, week-long intensives (generally ages 7\u201311) that end with one performance \u2014 a great first taste of theater. Check the specific camp's page for its exact ages and dates." },
    { title: "Junior shows", url: "/junior", k: "junior jr younger show production",
      a: "Junior productions are for younger Young Artists stepping into a fuller staged show. See the page for the current Junior title and age range." },
    { title: "Emerging Artists", url: "/emerging-artists", k: "emerging artists middle peter pan tween",
      a: "Emerging Artists is for middle-grade Young Artists building toward larger roles. Peter Pan Jr. is the current Emerging Artists production." },
    { title: "Signature Series", url: "/senior", k: "signature series teen teens older licensed lion king little women main mainstage",
      a: "The Signature Series is Encore's fully staged, licensed productions for teen Young Artists (generally ages 13\u201318). 2026 includes Disney's The Lion King Jr. and Little Women." },
    { title: "Aspire Performing Co", url: "/aspire-performing-co", k: "aspire company audition troupe villains illuminate touring",
      a: "Aspire is Encore's audition-based performing company. Its fall 2026 production is Villains Night, and it also tours (Illuminate at Disney California Adventure)." },
    { title: "Page to Stage", url: "/page-to-stage", k: "page to stage field trip workshop professional see watch register",
      a: "Page to Stage takes Young Artists to professional productions with field trips and workshops. It's register-only \u2014 no audition needed." },
    { title: "Auditions", url: "/auditions", k: "audition auditions tryout try out cast casting signup sign up prepare when how",
      a: "Auditions are open per production. Each show's audition page lists the dates, what to prepare, and how to sign up (some shows offer virtual auditions). Browse current openings on the auditions page." },
    { title: "Tickets", url: "/tickets", k: "ticket tickets buy purchase seats see show watch attend coming",
      a: "Tickets are sold through ThunderTix. The tickets page lists every show and links straight to purchase; shows not yet on sale show \u201cTickets coming soon.\u201d" },
    { title: "Disney's The Lion King Jr.", url: "/shows/lion-king", k: "lion king simba summer july show tickets on sale",
      a: "Disney's The Lion King Jr. runs July 18\u201325, 2026 at the Electric Theater (5:00 & 7:00 PM, $15). Sensory performance July 20, ASL July 23. On sale now \u2014 confirm on the page." },
    { title: "Little Women", url: "/tickets", k: "little women september fall signature show tickets",
      a: "Little Women performs September 5\u201312, 2026 at the Electric Theater, 7:30 PM. Tickets $22/$18/$15/$10. Confirm on-sale status on the tickets page." },
    { title: "Villains Night", url: "/tickets", k: "villains night aspire october halloween show tickets",
      a: "Villains Night (Aspire) performs October 29\u201330, 2026 at the Electric Theater (5:00 & 7:30 PM, $15). Sensory performance October 28. Confirm on-sale status on the tickets page." },
    { title: "Peter Pan Jr.", url: "/tickets", k: "peter pan november emerging show tickets",
      a: "Disney's Peter Pan Jr. performs November 19\u201321, 2026 at the Electric Theater (5:00 & 7:30 PM, $15). Sensory Nov 19, ASL Nov 21. Confirm on-sale status on the tickets page." },
    { title: "A Christmas Carol", url: "/tickets", k: "christmas carol december holiday winter show tickets scrooge",
      a: "A Christmas Carol performs November 30\u2013December 19, 2026 at the Electric Theater (7:30 PM, 2:00 PM matinee). Tickets $22/$18/$15/$10. Sensory Dec 1, ASL Dec 12." },
    { title: "Participation fees", url: "/fees", k: "fee fees cost costs price prices how much pay tuition expensive money afford participation",
      a: "Every production and camp has a participation fee covering licensing, costumes, sets, staff, and the venue. Each show lists its own fee on its page. Multi-Young-Artist discounts apply, and fees are non-refundable." },
    { title: "Scholarships", url: "/encore-scholarship-application", k: "scholarship scholarships financial aid help afford free assistance need cant afford",
      a: "Need-based scholarships are available for every program so cost is never a barrier. The application is simple and confidential." },
    { title: "The Electric Theater (venue & parking)", url: "/electric-theater", k: "venue where location address parking park directions theater theatre map get there",
      a: "Performances are at The Historic Electric Theater, 68 E Tabernacle St, St. George, UT 84770 \u2014 in downtown St. George with nearby public parking." },
    { title: "Sensory-friendly performances", url: "/sensory-friendly-performances", k: "sensory friendly autism accessible relaxed quiet lights sound",
      a: "Encore offers sensory-friendly performances with adjusted lights and sound and a welcoming, relaxed environment. Check each show for its sensory performance date." },
    { title: "ASL-interpreted performances", url: "/asl-interpreted-performances", k: "asl sign language interpreted deaf hearing accessible",
      a: "Select performances are ASL-interpreted. Check the show's listing for the ASL performance date." },
    { title: "Donate", url: "/donate", k: "donate donation give support contribute gift nonprofit 501 tax",
      a: "Encore is a 501(c)(3) nonprofit. Donations support youth musical theater in Southern Utah and can be made on the donate page." },
    { title: "The Core (monthly giving)", url: "/core-community", k: "core monthly giving member membership recurring support sustain",
      a: "The Core is Encore's community of monthly supporters who help sustain programming year-round." },
    { title: "Contact", url: "/contact", k: "contact call phone email reach question help talk message",
      a: "Reach Encore at hello@encorepa.org or (435) 414-0049, or use the contact form." },
    { title: "About Encore", url: "/about", k: "about who history founded story mission team",
      a: "Encore Performing Arts is a youth musical theater nonprofit founded in 2021, based at the historic Electric Theater in St. George, Utah, where performers are always called Young Artists." }
  ];

  var STOP = {the:1,a:1,an:1,is:1,are:1,do:1,does:1,can:1,how:1,what:1,when:1,where:1,who:1,i:1,my:1,we:1,you:1,for:1,to:1,of:1,and:1,or:1,in:1,on:1,at:1,it:1,me:1,about:1,get:1,have:1,with:1,your:1};

  function stemw(w){ return w.length > 3 ? w.replace(/ies$/, "y").replace(/(es|s)$/, "") : w; }
  function wordset(s){ var o={}; s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).forEach(function (w) { if (w) { o[w] = 1; o[stemw(w)] = 1; } }); return o; }
  KB.forEach(function (e) { e._kw = wordset(e.k); e._ti = wordset(e.title); e._an = wordset(e.a); });

  function search(q) {
    var terms = q.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
      .filter(function (t) { return t.length > 1 && !STOP[t]; });
    if (!terms.length) return [];
    return KB.map(function (e) {
      var score = 0;
      terms.forEach(function (t) {
        var s = stemw(t);
        if (e._kw[t] || e._kw[s]) score += 3;
        if (e._ti[t] || e._ti[s]) score += 2;
        if (e._an[t] || e._an[s]) score += 1;
      });
      return { e: e, score: score };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });
  }

  /* ---------- UI ---------- */
  var css = `
  .ae-btn{position:fixed;right:20px;bottom:20px;z-index:2147483000;display:flex;align-items:center;gap:9px;
    background:${TEAL};color:#fff;border:none;border-radius:999px;padding:13px 19px;font:600 15px/1 'Familjen Grotesk',system-ui,sans-serif;
    box-shadow:0 10px 30px rgba(0,0,0,.22);cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;}
  .ae-btn:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(0,0,0,.28);}
  .ae-btn svg{width:20px;height:20px;}
  .ae-panel{position:fixed;right:20px;bottom:20px;z-index:2147483001;width:380px;max-width:calc(100vw - 32px);
    height:580px;max-height:calc(100vh - 40px);background:#fff;border-radius:22px;overflow:hidden;display:none;
    flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.32);}
  .ae-panel.on{display:flex;}
  .ae-head{background:${TEAL};color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
  .ae-head h3{margin:0;font:600 18px/1.1 'Cabrio','Familjen Grotesk',system-ui,sans-serif;letter-spacing:-.01em;}
  .ae-head p{margin:3px 0 0;font:400 12.5px/1.3 'Familjen Grotesk',sans-serif;opacity:.85;}
  .ae-x{background:rgba(255,255,255,.16);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1;}
  .ae-body{flex:1;overflow-y:auto;padding:16px;background:${CREAM};font:400 14.5px/1.55 'Familjen Grotesk',system-ui,sans-serif;color:#2b2b2b;}
  .ae-msg{margin-bottom:14px;display:flex;}
  .ae-msg.u{justify-content:flex-end;}
  .ae-bub{max-width:84%;padding:10px 13px;border-radius:14px;}
  .ae-msg.a .ae-bub{background:#fff;border:1px solid #e6dfd3;border-top-left-radius:4px;}
  .ae-msg.u .ae-bub{background:${INK};color:#fff;border-top-right-radius:4px;}
  .ae-src{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;}
  .ae-src a{display:inline-flex;align-items:center;gap:5px;font:600 12.5px/1 'Familjen Grotesk',sans-serif;
    color:${TEAL};text-decoration:none;border:1.5px solid ${TEAL};border-radius:999px;padding:6px 11px;}
  .ae-src a:hover{background:${TEAL};color:#fff;}
  .ae-seealso{margin-top:9px;font-size:12.5px;color:#7a7264;}
  .ae-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;}
  .ae-chip{background:#fff;border:1px solid #ddd3c4;color:${INK};border-radius:999px;padding:7px 12px;
    font:500 12.5px/1 'Familjen Grotesk',sans-serif;cursor:pointer;}
  .ae-chip:hover{border-color:${TEAL};color:${TEAL};}
  .ae-foot{border-top:1px solid #e6dfd3;background:#fff;padding:10px 12px;}
  .ae-row{display:flex;gap:8px;align-items:flex-end;}
  .ae-row input{flex:1;border:1px solid #ddd3c4;border-radius:12px;padding:11px 12px;
    font:400 14px/1.4 'Familjen Grotesk',system-ui,sans-serif;outline:none;}
  .ae-row input:focus{border-color:${TEAL};}
  .ae-send{background:${TEAL};color:#fff;border:none;border-radius:12px;width:42px;height:42px;cursor:pointer;flex:none;}
  .ae-note{margin:8px 2px 0;font:400 10.5px/1.35 'Familjen Grotesk',sans-serif;color:#9a8f80;text-align:center;}
  @media(max-width:480px){.ae-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100vh;max-height:100vh;border-radius:0;}}
  `;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement("button");
  btn.className = "ae-btn"; btn.setAttribute("aria-label", "Ask Encore a question");
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>Ask Encore</span>';
  document.body.appendChild(btn);

  var panel = document.createElement("div");
  panel.className = "ae-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Ask Encore");
  panel.innerHTML =
    '<div class="ae-head"><div><h3>Ask Encore</h3><p>Quick answers, straight from our site</p></div>'
    + '<button class="ae-x" aria-label="Close">\u00d7</button></div>'
    + '<div class="ae-body" id="aeBody"></div>'
    + '<div class="ae-foot"><div class="ae-row">'
    + '<input id="aeIn" type="text" placeholder="Ask about auditions, tickets, fees\u2026" autocomplete="off">'
    + '<button class="ae-send" id="aeSend" aria-label="Search">\u2192</button></div>'
    + '<div class="ae-note">Answers come from our website \u2014 see the linked page for full details.</div></div>';
  document.body.appendChild(panel);

  var body = panel.querySelector("#aeBody");
  var input = panel.querySelector("#aeIn");
  var send = panel.querySelector("#aeSend");
  var greeted = false;

  function esc(s){ var d=document.createElement("div"); d.textContent=s; return d.innerHTML; }

  function addMsg(role, html){
    var m=document.createElement("div"); m.className="ae-msg "+role;
    m.innerHTML='<div class="ae-bub">'+html+"</div>";
    body.appendChild(m); body.scrollTop=body.scrollHeight; return m;
  }

  function greet(){
    if (greeted) return; greeted=true;
    var m=addMsg("a","Hi! Ask me anything about Encore \u2014 auditions, shows, tickets, fees, or our programs. I'll point you to the right page.");
    var chips=["When are auditions?","How much does it cost?","Where do I park?","What shows are coming up?"];
    var wrap=document.createElement("div"); wrap.className="ae-chips";
    chips.forEach(function(c){
      var b=document.createElement("button"); b.className="ae-chip"; b.textContent=c;
      b.onclick=function(){ input.value=c; run(); };
      wrap.appendChild(b);
    });
    m.querySelector(".ae-bub").appendChild(wrap);
  }

  function open(){ panel.classList.add("on"); btn.style.display="none"; greet(); setTimeout(function(){ input.focus(); },50); }
  function close(){ panel.classList.remove("on"); btn.style.display="flex"; }

  btn.onclick=open;
  panel.querySelector(".ae-x").onclick=close;
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&panel.classList.contains("on")) close(); });
  input.addEventListener("keydown",function(e){ if(e.key==="Enter"){ e.preventDefault(); run(); } });
  send.onclick=run;

  function run(){
    var q=input.value.trim(); if(!q) return;
    addMsg("u", esc(q)); input.value="";
    var hits=search(q);
    if(!hits.length || hits[0].score<2){
      var fb='I couldn\u2019t find that one. Try rephrasing, or reach out and we\u2019ll help.'
        + '<div class="ae-src"><a href="/contact">Contact us \u2192</a></div>';
      addMsg("a", fb); return;
    }
    var top=hits[0].e;
    var html=esc(top.a)
      + '<div class="ae-src"><a href="'+esc(top.url)+'">'+esc(top.title)+' \u2192</a></div>';
    // offer up to 2 close secondary matches
    var also=hits.slice(1).filter(function(x){ return x.score>=Math.max(3, hits[0].score*0.5) && x.e.url!==top.url; }).slice(0,2);
    if(also.length){
      html+='<div class="ae-seealso">See also: '
        + also.map(function(x){ return '<a href="'+esc(x.e.url)+'" style="color:'+TEAL+';font-weight:600;text-decoration:none;">'+esc(x.e.title)+'</a>'; }).join(" \u00b7 ")
        + '</div>';
    }
    addMsg("a", html);
  }
})();
