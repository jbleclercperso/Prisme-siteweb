/* Prisme — comportements du site. Aucun traceur, aucune dépendance. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cfg = window.PRISME_CONFIG || { links: {} };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ Liens */
  $$("[data-link]").forEach(function (a) {
    var url = cfg.links && cfg.links[a.getAttribute("data-link")];
    if (url) a.setAttribute("href", url);
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  // L'adresse à taper sur la télé : celle du site tel qu'il est servi.
  if (/\./.test(location.hostname) && !/^\d+\.\d+\.\d+\.\d+$/.test(location.hostname)) {
    $$("[data-tv-host]").forEach(function (el) { el.textContent = location.host.replace(/^www\./, ""); });
  }

  /* ------------------------------------------------------------ Contrôle d'âge */
  var gate = $(".gate");
  if (gate) {
    var enter = $("[data-gate='enter']", gate);
    var leave = $(".gate-actions a", gate);
    if (leave && cfg.exitUrl) leave.setAttribute("href", cfg.exitUrl);
    if (root.classList.contains("gate-open") && enter) {
      setTimeout(function () { enter.focus(); }, 50);
    }
    if (enter) enter.addEventListener("click", function () {
      store("prisme-age", "ok");
      root.classList.remove("gate-open");
    });
    gate.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = $$("button, a", gate);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    });
  }
  function gateOpen() { return root.classList.contains("gate-open"); }

  /* ------------------------------------------------------------ Navigation */
  var nav = $("#nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-scrolled", window.scrollY > 12); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var toggle = $(".nav-toggle", nav);
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$(".nav-links a, .nav-cta a", nav).forEach(function (a) {
        a.addEventListener("click", function () {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ------------------------------------------------------------ Apparitions */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Halo qui suit la souris sur les tuiles */
  $$(".tile").forEach(function (t) {
    t.addEventListener("pointermove", function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty("--mx", (e.clientX - r.left) + "px");
      t.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ------------------------------------------------------------ Tarifs */
  $$("[data-billing]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-billing");
      $$("[data-billing]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      $$("[data-price-" + mode + "]").forEach(function (el) { el.textContent = el.getAttribute("data-price-" + mode); });
      $$("[data-sub-" + mode + "]").forEach(function (el) { el.textContent = el.getAttribute("data-sub-" + mode); });
    });
  });

  /* ------------------------------------------------------------ Clavier décoratif */
  var kb = $("#keyboard");
  if (kb && !reduced) {
    var lit = $$(".krow span[class]", kb);
    setInterval(function () {
      if (document.hidden || !lit.length) return;
      var k = lit[Math.floor(Math.random() * lit.length)];
      k.classList.add("flash");
      setTimeout(function () { k.classList.remove("flash"); }, 180);
    }, 700);
  }

  /* ------------------------------------------------------------ Mode discret */
  var quiet = $("#quietDemo");
  if (quiet) {
    var flip = function () { quiet.classList.toggle("is-quiet"); };
    quiet.addEventListener("click", flip);
    quiet.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
    });
  }

  // Le site lui-même a son mode discret : Ctrl+K le masque derrière une page neutre.
  var veil = null;
  function buildVeil() {
    veil = document.createElement("div");
    veil.setAttribute("aria-hidden", "true");
    veil.style.cssText = "position:fixed;inset:0;z-index:1000;background:#f4f5f7;color:#3b4350;" +
      "font:14px/1.5 'Segoe UI',system-ui,sans-serif;padding:48px 8vw;overflow:auto;display:none";
    veil.innerHTML =
      "<div style='max-width:900px;margin:0 auto'>" +
      "<h1 style='font-size:20px;font-weight:600;color:#1f2733;margin:0 0 6px;letter-spacing:0'>Indexation des sauvegardes</h1>" +
      "<div style='color:#6b7483;margin-bottom:18px'>Analyse en cours — 5 572 éléments examinés, dernier type traité : .docx</div>" +
      "<div style='height:8px;border-radius:4px;background:#dfe3e8;margin-bottom:24px;overflow:hidden'><i style='display:block;height:100%;width:62%;background:#9aa5b4'></i></div>" +
      "<table style='width:100%;border-collapse:collapse;font-size:13px'>" +
      "<tr style='color:#8a93a1;text-align:left'><th style='font-weight:500;padding:6px 0;border-bottom:1px solid #e3e6ea'>Volume</th><th style='font-weight:500;text-align:right;border-bottom:1px solid #e3e6ea'>Éléments</th><th style='font-weight:500;text-align:right;border-bottom:1px solid #e3e6ea'>Taille</th><th style='font-weight:500;text-align:right;border-bottom:1px solid #e3e6ea'>Dernier passage</th></tr>" +
      [["Modèles", "82 824", "69,8 Go", "28/09 14:44"], ["Correspondance", "31 869", "282,9 Go", "28/09 05:14"],
       ["Ressources", "22 073", "204,6 Go", "26/09 05:09"], ["Comptabilité", "53 673", "269,6 Go", "26/09 18:05"],
       ["Sauvegarde système", "44 285", "275,5 Go", "27/09 16:33"], ["Archives 2023", "11 671", "246,5 Go", "27/09 18:26"]]
        .map(function (r) {
          return "<tr><td style='padding:7px 0;border-bottom:1px solid #eef0f3'>" + r[0] + "</td>" +
            r.slice(1).map(function (c) { return "<td style='text-align:right;border-bottom:1px solid #eef0f3'>" + c + "</td>"; }).join("") + "</tr>";
        }).join("") +
      "</table><div style='margin-top:18px;color:#8a93a1;font-size:12px'>Prochain passage planifié à 00:07</div></div>";
    document.body.appendChild(veil);
  }
  var savedTitle = document.title;
  function toggleVeil() {
    if (!veil) buildVeil();
    var on = veil.style.display === "none";
    veil.style.display = on ? "block" : "none";
    document.title = on ? "Indexation des sauvegardes" : savedTitle;
    if (quiet) quiet.classList.toggle("is-quiet", on);
  }
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      toggleVeil();
    } else if (veil && veil.style.display !== "none" && e.key === "Escape") {
      toggleVeil();
    }
  });
  document.addEventListener("dblclick", function () {
    if (veil && veil.style.display !== "none") toggleVeil();
  });

  /* ------------------------------------------------------------ Paiement Stripe */
  // Chaque bouton de tarif demande une page de paiement à /api/checkout, puis
  // s'y rend. En cas d'échec, le lien d'origine reste là : rien n'est perdu.
  if (cfg.checkout && window.fetch) {
    var checkoutError = $("[data-checkout-error]");
    var reset = function (btn) {
      btn.removeAttribute("aria-busy");
      btn.textContent = btn.getAttribute("data-label") || btn.textContent;
    };
    $$("[data-checkout]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (btn.getAttribute("aria-busy") === "true") return;
        var plan = btn.getAttribute("data-checkout");
        if (plan === "subscribe") {
          var yearly = $("[data-billing='yearly']");
          plan = yearly && yearly.getAttribute("aria-pressed") === "false" ? "monthly" : "yearly";
        }
        btn.setAttribute("data-label", btn.textContent);
        btn.setAttribute("aria-busy", "true");
        btn.textContent = "Ouverture du paiement…";
        if (checkoutError) checkoutError.hidden = true;
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan })
        }).then(function (r) {
          return r.json().then(function (data) {
            if (!r.ok || !data.url) throw new Error(data.error || r.status);
            location.href = data.url;
          });
        }).catch(function () {
          reset(btn);
          if (checkoutError) checkoutError.hidden = false;
        });
      });
    });
    // Revenu de Stripe par « Retour », la page sort du cache telle qu'on l'a
    // quittée : le bouton ne doit pas rester sur « Ouverture du paiement… ».
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) $$("[data-checkout][aria-busy]").forEach(reset);
    });
  }

  /* ------------------------------------------------------------ Remerciement après paiement */
  var thanks = $("#thanks");
  if (thanks) {
    var sid = (location.search.match(/[?&]session_id=([^&]+)/) || [])[1];
    var show = function (state, data) {
      thanks.setAttribute("data-state", state);
      if (data && data.email) $$("[data-thanks-email]", thanks).forEach(function (el) { el.textContent = data.email; });
      var box = $("[data-thanks-licence]", thanks);
      if (box && data && data.licence) {
        $("[data-thanks-key]", box).textContent = data.licence;
        box.hidden = false;
        var copy = $("[data-copy-key]", box);
        copy.addEventListener("click", function () {
          var done = function () { copy.textContent = "Copiée"; setTimeout(function () { copy.textContent = "Copier la clé"; }, 1800); };
          if (navigator.clipboard) navigator.clipboard.writeText(data.licence).then(done, function () {});
          else {
            var range = document.createRange(); range.selectNodeContents($("[data-thanks-key]", box));
            var sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
          }
        });
      }
      if (data && data.plan) $$("[data-thanks-plan]", thanks).forEach(function (el) {
        el.textContent = { monthly: "Prisme, formule mensuelle", yearly: "Prisme, formule annuelle", lifetime: "Prisme à vie" }[data.plan] || "Prisme";
      });
    };
    if (!sid || !window.fetch) show("unknown");
    else {
      fetch("/api/session?session_id=" + encodeURIComponent(sid)).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.error || r.status);
          show(data.status === "paid" ? "paid" : data.status === "pending" ? "pending" : "unknown", data);
        });
      }).catch(function () { show("unknown"); });
    }
  }

  /* ------------------------------------------------------------ Téléchargement / accès anticipé */
  var ready = $("[data-download-ready]");
  if (ready && cfg.links && cfg.links.trial) ready.hidden = false;
  var wl = $("#waitlist");
  if (wl) {
    var form = $("form", wl);
    if (/[?&]merci/.test(location.search)) wl.classList.add("is-done");
    form.addEventListener("submit", function (e) {
      if (!window.fetch) return;
      e.preventDefault();
      var err = $("[data-form-error]", wl);
      err.hidden = true;
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        wl.classList.add("is-done");
      }).catch(function () { err.hidden = false; });
    });
  }

  /* ------------------------------------------------------------ Le Mur : de 2 à 10 vidéos */
  var wall = $("#wallDemo");
  if (wall) {
    var grid = $(".wall", wall), countEl = $("[data-wall='count']", wall);
    var ARTS = ["a5", "a12", "a3", "a9", "a7", "a2", "a10", "a6", "a1", "a11"];
    var NAMES = ["amateur_story_07", "pov_selfie_02", "creator_shower", "milf_mirror", "couple_hotel",
                 "lesbian_kiss_04", "cam_replay_12", "backstage_pov", "casting_22", "solo_bedroom"];
    var COLS = { vertical: [0, 0, 2, 3, 4, 5, 6, 4, 4, 5, 5], horizontal: [0, 0, 2, 3, 2, 3, 3, 4, 4, 3, 5] };
    var wallState = { n: 5, o: "vertical" };
    var renderWall = function () {
      var n = wallState.n, o = wallState.o, html = "";
      for (var i = 0; i < n; i++) {
        var left = 20 + ((i * 37) % 90);
        html += '<div class="panel"><div class="art ' + ARTS[i] + '" style="--dur:' + (8 + i % 5) + 's"></div>' +
          '<div class="panel-top"><span>' + NAMES[i] + (o === "vertical" ? "_vertical" : "_4K") + '.mp4</span><b>−' +
          Math.floor(left / 60) + ":" + ("0" + left % 60).slice(-2) + '</b></div>' +
          '<div class="panel-bot"><i>◂</i><i>❙❙</i><i>▸</i><i>☆</i><i>⤢</i></div>' +
          '<span class="bar"><i style="--len:' + (10 + (i * 7) % 16) + 's"></i></span></div>';
      }
      grid.innerHTML = html;
      grid.style.setProperty("--cols", COLS[o][n]);
      wall.classList.toggle("is-h", o === "horizontal");
      wall.classList.toggle("is-dense", n > 6);
      countEl.textContent = n;
      $$("[data-wall-o]", wall).forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-wall-o") === o ? "true" : "false");
      });
    };
    $$("[data-wall-step]", wall).forEach(function (b) {
      b.addEventListener("click", function () {
        wallState.n = Math.max(2, Math.min(10, wallState.n + parseInt(b.getAttribute("data-wall-step"), 10)));
        renderWall();
      });
    });
    $$("[data-wall-o]", wall).forEach(function (b) {
      b.addEventListener("click", function () { wallState.o = b.getAttribute("data-wall-o"); renderWall(); });
    });
    renderWall();
  }

  /* ------------------------------------------------------------ Démo interactive
     La fiche de Prisme et ses vrais gestes :
     - clic sur l'image = pause ; glisser = avancer ou reculer (toute la largeur
       vaut toute la durée) ; double-clic = plein écran ;
     - clic droit = les destinations en cercle autour du pointeur ;
     - molette = 5 s ; Maj maintenue = neuf instants ; Maj+← → = 10 s ;
     - survoler un des cinq instants de la pellicule = la lecture y saute ;
     - Espace = suivante, Entrée = pause, ← → = précédente / suivante,
       6 à 9 = ranger, Suppr = corbeille, 1 = favori, 0 = retirer, Ctrl+Z.
     Les vidéos et les destinations viennent du bloc JSON #demoData s'il existe
     (la version neutre du site a les siennes). */
  var app = $("#demoApp");
  if (!app) return;

  var ITEMS = [
    { name: "amateur_couple_weekend.mp4", res: "4K", meta: "2160p · 3,2 Go", dur: 1122, art: "a1" },
    { name: "pov_casting_blonde.mp4", res: "1080p", meta: "1080p · 1,4 Go", dur: 756, art: "a2" },
    { name: "milf_hotel_suite_4K.mkv", res: "4K", meta: "2160p · 5,9 Go", dur: 1862, art: "a9" },
    { name: "lesbian_massage_02.mp4", res: "1080p", meta: "1080p · 880 Mo", dur: 524, art: "a4" },
    { name: "backstage_studio_03.mp4", res: "720p", meta: "720p · 640 Mo", dur: 1160, art: "a5" },
    { name: "threesome_villa_ibiza.mp4", res: "1080p", meta: "1080p · 1,1 Go", dur: 908, art: "a6" },
    { name: "gonzo_scene_0412.mov", res: "4K", meta: "2160p · 8,3 Go", dur: 2571, art: "a7" },
    { name: "solo_shower_720p.mp4", res: "720p", meta: "720p · 512 Mo", dur: 372, art: "a3" },
    { name: "pov_girlfriend_4K.mp4", res: "4K", meta: "2160p · 2,0 Go", dur: 1653, art: "a10" },
    { name: "casting_couch_19.mp4", res: "1080p", meta: "1080p · 2,7 Go", dur: 665, art: "a8" },
    { name: "cam_show_replay_9.mp4", res: "1080p", meta: "1080p · 790 Mo", dur: 587, art: "a11" },
    { name: "vintage_70s_classic.mkv", res: "720p", meta: "720p · 1,6 Go", dur: 1998, art: "a12" }
  ];
  var LABELS = { "6": "Amateur", "7": "POV", "8": "MILF", "9": "À revoir", "Delete": "Corbeille" };
  var dataNode = $("#demoData");
  if (dataNode) {
    try {
      var data = JSON.parse(dataNode.textContent);
      if (data.items && data.items.length) ITEMS = data.items;
      if (data.labels) LABELS = data.labels;
    } catch (err) { /* on garde les exemples par défaut */ }
  }
  var DESTS = ["6", "7", "8", "9"].filter(function (k) { return LABELS[k]; });

  var ICON = {
    play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    starOn: '<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="#f5c542" stroke="#f5c542" stroke-width="1.8" stroke-linejoin="round"/></svg>'
  };

  var player = $("#demoPlayer");
  // Ce que la fiche affiche par-dessus l'image : fabriqué ici, pour que les
  // deux versions du site n'aient à fournir que le lecteur de base.
  function make(tag, cls, html) {
    var n = document.createElement(tag);
    n.className = cls;
    if (html) n.innerHTML = html;
    return n;
  }
  var big = make("span", "demo-big");
  var seekLabel = make("span", "demo-seek");
  var over = make("div", "demo-over",
    '<div class="ob-rail"><i></i></div>' +
    '<div class="ob-row">' +
      '<button type="button" class="ob-btn ob-fav" data-act="fav" aria-label="Favori"></button>' +
      '<span class="ob-name"></span><span class="ob-pos"></span>' +
      '<span class="ob-mid">' +
        '<button type="button" class="ob-btn" data-act="prev" aria-label="Précédente">' + ICON.prev + '</button>' +
        '<button type="button" class="ob-btn ob-play" data-act="pause" aria-label="Pause"></button>' +
        '<button type="button" class="ob-btn" data-act="next" aria-label="Suivante">' + ICON.next + '</button>' +
      '</span>' +
      '<span class="ob-left"></span>' +
      '<button type="button" class="ob-btn" data-act="full" aria-label="Plein écran">' + ICON.full + '</button>' +
    '</div>');
  var radial = make("div", "demo-radial");
  radial.hidden = true;
  var peek = make("div", "demo-peek");
  peek.hidden = true;
  [big, seekLabel, over, radial, peek].forEach(function (n) { player.appendChild(n); });

  var el = {
    name: $("[data-demo='name']", app), meta: $("[data-demo='meta']", app),
    art: $("[data-demo='art']", app), remain: $("[data-demo='remain']", app), res: $("[data-demo='res']", app),
    bar: $("[data-demo='bar']", app), toast: $("[data-demo='toast']", app), strip: $("[data-demo='strip']", app),
    fav: $("[data-demo='fav']", app),
    obname: $(".ob-name", over), obpos: $(".ob-pos", over), obleft: $(".ob-left", over),
    obrail: $(".ob-rail i", over), obfav: $(".ob-fav", over), obplay: $(".ob-play", over),
    done: $("[data-demo='done']"), pace: $("[data-demo='pace']")
  };
  var counts = {};
  DESTS.concat(["Delete"]).forEach(function (k) { counts[k] = 0; });
  var favs = {};
  var idx = 0, pos = 0, paused = false, cinema = false;
  var history = [], started = 0, decisions = 0;
  var busy = false, live = false, toastTimer = 0, seekTimer = 0, overTimer = 0, peekTimer = 0, stripTimer = 0;
  var CYCLES = 3;               // allers-retours de l'image sur toute la durée

  function fmt(s) {
    s = Math.max(0, Math.round(s));
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, r = s % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }
  function wrap(i) { return ((i % ITEMS.length) + ITEMS.length) % ITEMS.length; }
  function item() { return ITEMS[wrap(idx)]; }
  function clamp(t) { return Math.max(0, Math.min(item().dur - 0.5, t)); }

  // L'image « à cet instant » : son animation figée à la phase voulue. Le même
  // instant donne toujours la même image : la pellicule, les neuf instants et
  // le lecteur s'accordent.
  function span(node) {
    var d = parseFloat(getComputedStyle(node).animationDuration);
    return d > 0 ? d : 14;
  }
  function frame(node, t, dur) {
    var cycle = 2 * span(node);
    node.style.animationPlayState = "paused";
    node.style.animationDelay = (-(t / Math.max(1, dur)) * CYCLES * cycle) + "s";
  }
  function stripTimes() {
    var d = item().dur, out = [];
    for (var i = 0; i < 5; i++) out.push(d * (i * 2 + 1) / 10);
    return out;
  }

  function render(animIn) {
    var it = item();
    el.name.textContent = it.name;
    el.meta.textContent = it.meta;
    if (el.res) el.res.textContent = it.res + " · " + it.name;
    el.obname.textContent = it.name;
    el.obpos.textContent = (wrap(idx) + 1) + " / " + ITEMS.length;
    var art = document.createElement("div");
    art.className = "art " + it.art + (animIn && !reduced ? " fly-in" : "");
    art.setAttribute("data-demo", "art");
    el.art.replaceWith(art);
    el.art = art;
    if (animIn && !reduced) {
      setTimeout(function () { if (el.art === art) { art.classList.remove("fly-in"); frame(art, pos, it.dur); } }, 560);
    }
    var times = stripTimes();
    $$(".art", el.strip).forEach(function (cell, i) {
      cell.className = "art " + it.art;
      cell.removeAttribute("style");
      cell.setAttribute("data-t", times[i]);
      var label = cell.firstChild && cell.firstChild.nodeType === 1 ? cell.firstChild : cell.appendChild(document.createElement("span"));
      label.textContent = fmt(times[i]);
      frame(cell, times[i], it.dur);
    });
    pos = it.dur * 0.12;
    if (!animIn || reduced) frame(art, pos, it.dur);
    closeRadial();
    hidePeek();
    showFav();
    showPlay();
    paint();
  }

  function paint() {
    var it = item();
    var left = "−" + fmt(it.dur - pos);
    el.remain.textContent = left;
    el.obleft.textContent = left;
    var w = (pos / it.dur * 100).toFixed(2) + "%";
    el.bar.style.width = w;
    el.obrail.style.width = w;
    if (!el.art.classList.contains("fly-in") && !busy) frame(el.art, pos, it.dur);
  }

  function seek(t, label) {
    pos = clamp(t);
    paint();
    if (label) {
      seekLabel.textContent = fmt(pos) + " / " + fmt(item().dur);
      seekLabel.classList.add("show");
      clearTimeout(seekTimer);
      seekTimer = setTimeout(function () { seekLabel.classList.remove("show"); }, 900);
    }
  }

  function flash(icon) {
    big.innerHTML = icon;
    big.classList.remove("show"); void big.offsetWidth; big.classList.add("show");
  }
  function showPlay() {
    el.obplay.innerHTML = paused ? ICON.play : ICON.pause;
    el.obplay.setAttribute("aria-label", paused ? "Lecture" : "Pause");
  }
  function togglePause() {
    paused = !paused;
    showPlay();
    flash(paused ? ICON.pause : ICON.play);
  }

  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 1100);
  }

  function bump(key) {
    var li = $(".dest-list li[data-dest='" + key + "']");
    if (!li) return;
    $(".count", li).textContent = counts[key];
    li.classList.remove("bump"); void li.offsetWidth; li.classList.add("bump");
    setTimeout(function () { li.classList.remove("bump"); }, 700);
  }

  function press(key) {
    var btn = $(".cmd[data-key='" + key + "']", app);
    if (btn) { btn.classList.add("pressed"); setTimeout(function () { btn.classList.remove("pressed"); }, 160); }
  }

  function stats() {
    el.done.textContent = decisions;
    if (decisions >= 2) {
      var per = (Date.now() - started) / 1000 / (decisions - 1);
      el.pace.textContent = per < 10 ? per.toFixed(1).replace(".", ",") + " s" : Math.round(per) + " s";
    }
  }

  function decide(key) {
    if (busy) return;
    if (key === "Backspace") key = "Delete";
    if (key !== " " && !(key in counts)) return;
    press(key);
    var cls = key === "Delete" ? "fly-trash" : key === " " ? "fly-skip" : "fly-out";
    if (key !== " ") {
      counts[key]++;
      bump(key);
      decisions++;
      if (!started) started = Date.now();
      history.push({ key: key, idx: idx });
      toast(key === "Delete" ? "Mise à la corbeille de séance" : "Envoyée vers « " + LABELS[key] + " »");
    } else {
      history.push({ key: " ", idx: idx });
      toast("Passée, sans rien toucher");
    }
    stats();
    closeRadial();
    busy = true;
    if (!reduced) {
      el.art.style.animationPlayState = "";
      el.art.style.animationDelay = "";
      el.art.classList.add(cls);
    }
    setTimeout(function () { idx++; busy = false; render(true); }, reduced ? 0 : 320);
  }

  function step(delta) {
    if (busy) return;
    idx += delta;
    render(true);
  }

  function undo() {
    var last = history.pop();
    if (!last) { toast("Rien à annuler"); return; }
    if (last.key !== " ") {
      counts[last.key]--;
      bump(last.key);
      decisions--;
    }
    idx = last.idx;
    render(true);
    stats();
    toast("Annulé : la vidéo est revenue");
  }

  function showFav() {
    var on = !!favs[wrap(idx)];
    if (el.fav) {
      el.fav.classList.toggle("on", on);
      el.fav.setAttribute("aria-pressed", on ? "true" : "false");
    }
    el.obfav.innerHTML = on ? ICON.starOn : ICON.star;
    el.obfav.classList.toggle("on", on);
  }
  function setFav(on) {
    favs[wrap(idx)] = on;
    showFav();
    toast(on ? "★  Ajoutée aux favoris" : "Retirée des favoris");
  }

  // -- plein écran : la fiche couvre la fenêtre, la pellicule glisse de la droite
  function setCinema(on) {
    cinema = on;
    app.classList.toggle("cinema", on);
    root.classList.toggle("demo-cinema", on);
    if (on) app.focus({ preventScroll: true });
  }

  // -- le menu en rond (clic droit)
  function openRadial(x, y) {
    var box = player.getBoundingClientRect();
    var r = Math.min(78, Math.max(52, box.height * 0.28));
    var cx = Math.max(r + 40, Math.min(box.width - r - 40, x - box.left));
    var cy = Math.max(r + 16, Math.min(box.height - r - 16, y - box.top));
    radial.innerHTML = '<span class="dr-center"></span>';
    DESTS.forEach(function (k, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / DESTS.length;
      var b = make("button", "dr-opt", "<b>" + k + "</b> " + LABELS[k]);
      b.type = "button";
      b.style.left = (cx + Math.cos(a) * r) + "px";
      b.style.top = (cy + Math.sin(a) * r) + "px";
      b.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
      b.addEventListener("click", function (e) { e.stopPropagation(); decide(k); });
      radial.appendChild(b);
    });
    $(".dr-center", radial).style.left = cx + "px";
    $(".dr-center", radial).style.top = cy + "px";
    radial.hidden = false;
  }
  function closeRadial() { radial.hidden = true; }

  // -- Maj maintenue : neuf instants
  function showPeek() {
    var it = item();
    peek.innerHTML = "";
    for (var i = 0; i < 9; i++) {
      var t = it.dur * (i + 0.5) / 9;
      var cell = make("button", "dp-cell");
      cell.type = "button";
      var art = make("div", "art " + it.art);
      cell.appendChild(art);
      cell.appendChild(make("span", "dp-t", fmt(t)));
      (function (t) {
        cell.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
        cell.addEventListener("click", function (e) { e.stopPropagation(); seek(t, true); hidePeek(); });
      })(t);
      peek.appendChild(cell);
      frame(art, t, it.dur);
    }
    peek.hidden = false;
  }
  function hidePeek() { clearTimeout(peekTimer); peek.hidden = true; }

  // -- la barre au survol
  function wake() {
    over.classList.add("show");
    clearTimeout(overTimer);
    overTimer = setTimeout(function () { over.classList.remove("show"); }, 2500);
    if (cinema) {
      el.strip.classList.add("show");
      clearTimeout(stripTimer);
      stripTimer = setTimeout(function () { el.strip.classList.remove("show"); }, 2500);
    }
  }
  player.addEventListener("mousemove", wake);
  player.addEventListener("mouseleave", function () {
    clearTimeout(overTimer);
    over.classList.remove("show");
  });
  over.addEventListener("pointerdown", function (e) { e.stopPropagation(); });
  over.addEventListener("dblclick", function (e) { e.stopPropagation(); });
  $$(".ob-btn", over).forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var act = b.getAttribute("data-act");
      if (act === "fav") setFav(!favs[wrap(idx)]);
      else if (act === "prev") step(-1);
      else if (act === "next") step(1);
      else if (act === "pause") togglePause();
      else if (act === "full") setCinema(!cinema);
      wake();
    });
  });
  $(".ob-rail", over).addEventListener("click", function (e) {
    e.stopPropagation();
    var box = this.getBoundingClientRect();
    seek((e.clientX - box.left) / box.width * item().dur, true);
  });

  // -- sur l'image : clic, glisser, double-clic, clic droit, molette
  var down = null;
  player.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    if (!radial.hidden) { closeRadial(); return; }
    down = { x: e.clientX, pos: pos, drag: false, id: e.pointerId };
  });
  player.addEventListener("pointermove", function (e) {
    if (!down || e.pointerId !== down.id) return;
    var dx = e.clientX - down.x;
    if (!down.drag && Math.abs(dx) > 6) {
      down.drag = true;
      try { player.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    }
    if (down.drag) seek(down.pos + dx / player.clientWidth * item().dur, true);
  });
  function release(e) {
    if (!down || e.pointerId !== down.id) return;
    var was = down;
    down = null;
    if (!was.drag && e.type === "pointerup") togglePause();
  }
  player.addEventListener("pointerup", release);
  player.addEventListener("pointercancel", release);
  // Deux clics ont déjà remis la pause comme avant : le double-clic ne fait
  // que passer en plein écran, et la lecture continue.
  player.addEventListener("dblclick", function (e) { e.preventDefault(); setCinema(!cinema); });
  player.addEventListener("contextmenu", function (e) { e.preventDefault(); openRadial(e.clientX, e.clientY); });
  player.addEventListener("wheel", function (e) {
    e.preventDefault();
    closeRadial();
    seek(pos + (e.deltaY < 0 ? 5 : -5), true);
  }, { passive: false });

  // -- la pellicule : survoler un instant y fait sauter la lecture
  $$(".art", el.strip).forEach(function (cell) {
    function go() { seek(parseFloat(cell.getAttribute("data-t")) || 0, true); }
    cell.addEventListener("mouseenter", go);
    cell.addEventListener("click", go);
  });
  el.strip.addEventListener("mousemove", function () { if (cinema) wake(); });

  // -- boutons du bas
  $$(".cmd", app).forEach(function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); handle(b.getAttribute("data-key")); });
  });
  if (el.fav) el.fav.addEventListener("click", function (e) { e.stopPropagation(); setFav(!favs[wrap(idx)]); });

  function handle(key, e) {
    if (/^[6-9]$/.test(key) || key === "Delete" || key === "Backspace" || key === " ") {
      if (e) e.preventDefault();
      decide(key);
    } else if (/^[1-5]$/.test(key)) {
      if (e) e.preventDefault();
      setFav(!favs[wrap(idx)]);
    } else if (key === "0") {
      if (e) e.preventDefault();
      setFav(false);
    }
  }

  // Le clavier ne s'active que lorsque la démo est à l'écran (ou a le focus).
  function setLive(v) { live = v; app.classList.toggle("is-live", v); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { setLive(en.intersectionRatio >= 0.55 || cinema); });
    }, { threshold: [0, 0.55, 1] }).observe(app);
  }
  app.addEventListener("focus", function () { setLive(true); });

  document.addEventListener("keydown", function (e) {
    if ((!live && !cinema) || gateOpen() || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === "Shift") {
      if (!e.repeat && peek.hidden) { clearTimeout(peekTimer); peekTimer = setTimeout(showPeek, 250); }
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      var dir = e.key === "ArrowRight" ? 1 : -1;
      if (e.shiftKey) { clearTimeout(peekTimer); hidePeek(); seek(pos + dir * 10, true); }
      else step(dir);
      return;
    }
    if (e.key === "Escape") {
      if (!radial.hidden) closeRadial();
      else if (!peek.hidden) hidePeek();
      else if (cinema) setCinema(false);
      return;
    }
    if (e.key === "Enter") {
      if (t && t.tagName === "BUTTON") return;
      e.preventDefault();
      togglePause();
      return;
    }
    if (e.key === " " && t && t.tagName === "BUTTON" && !app.contains(t)) return;
    if (e.key === " " && t && t.tagName === "BUTTON" && app.contains(t)) { e.preventDefault(); decide(" "); return; }
    handle(e.key, e);
  });
  document.addEventListener("keyup", function (e) {
    if (e.key === "Shift") hidePeek();
  });
  window.addEventListener("blur", hidePeek);

  // La lecture avance, le temps restant décompte.
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!paused && !busy && !down) {
      pos += dt;
      if (pos > item().dur) pos = 0;
      paint();
    }
    requestAnimationFrame(tick);
  }
  render(false);
  requestAnimationFrame(tick);
})();
