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

  /* ------------------------------------------------------------ Démo interactive */
  var app = $("#demoApp");
  if (!app) return;

  var ITEMS = [
    { name: "amateur_couple_weekend.mp4", folder: "À trier", res: "4K", meta: "2160p · 3,2 Go", dur: 1122, art: "a1" },
    { name: "pov_casting_blonde.mp4", folder: "À trier", res: "1080p", meta: "1080p · 1,4 Go", dur: 756, art: "a2" },
    { name: "milf_hotel_suite_4K.mkv", folder: "À trier", res: "4K", meta: "2160p · 5,9 Go", dur: 1862, art: "a9" },
    { name: "lesbian_massage_02.mp4", folder: "À trier", res: "1080p", meta: "1080p · 880 Mo", dur: 524, art: "a4" },
    { name: "backstage_studio_03.mp4", folder: "À trier", res: "720p", meta: "720p · 640 Mo", dur: 1160, art: "a5" },
    { name: "threesome_villa_ibiza.mp4", folder: "À trier", res: "1080p", meta: "1080p · 1,1 Go", dur: 908, art: "a6" },
    { name: "gonzo_scene_0412.mov", folder: "À trier", res: "4K", meta: "2160p · 8,3 Go", dur: 2571, art: "a7" },
    { name: "solo_shower_720p.mp4", folder: "À trier", res: "720p", meta: "720p · 512 Mo", dur: 372, art: "a3" },
    { name: "pov_girlfriend_4K.mp4", folder: "À trier", res: "4K", meta: "2160p · 2,0 Go", dur: 1653, art: "a10" },
    { name: "casting_couch_19.mp4", folder: "À trier", res: "1080p", meta: "1080p · 2,7 Go", dur: 665, art: "a8" },
    { name: "cam_show_replay_9.mp4", folder: "À trier", res: "1080p", meta: "1080p · 790 Mo", dur: 587, art: "a11" },
    { name: "vintage_70s_classic.mkv", folder: "À trier", res: "720p", meta: "720p · 1,6 Go", dur: 1998, art: "a12" }
  ];
  var LABELS = { "6": "Amateur", "7": "POV", "8": "MILF", "9": "À revoir", "Delete": "Corbeille" };

  var el = {
    name: $("[data-demo='name']", app), meta: $("[data-demo='meta']", app), folder: $("[data-demo='folder']", app),
    art: $("[data-demo='art']", app), remain: $("[data-demo='remain']", app), res: $("[data-demo='res']", app),
    bar: $("[data-demo='bar']", app), toast: $("[data-demo='toast']", app), strip: $("[data-demo='strip']", app),
    fav: $("[data-demo='fav']", app), player: $("#demoPlayer"),
    done: $("[data-demo='done']"), pace: $("[data-demo='pace']")
  };
  var counts = { "6": 0, "7": 0, "8": 0, "9": 0, "Delete": 0 };
  var favs = {};
  var idx = 0, pos = 0, history = [], started = 0, decisions = 0, busy = false, live = false, toastTimer = 0;

  function fmt(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function item() { return ITEMS[idx % ITEMS.length]; }

  function render(animIn) {
    var it = item();
    el.name.textContent = it.name;
    el.meta.textContent = it.meta;
    el.res.textContent = it.res + " · " + it.name;
    var art = document.createElement("div");
    art.className = "art " + it.art + (animIn && !reduced ? " fly-in" : "");
    art.setAttribute("data-demo", "art");
    el.art.replaceWith(art);
    el.art = art;
    $$(".art", el.strip).forEach(function (s, i) {
      s.className = "art " + it.art;
      s.firstChild.textContent = fmt(it.dur * (i * 2 + 1) / 10);
    });
    pos = it.dur * 0.12;
    showFav();
  }

  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 1100);
  }

  function bump(key) {
    var li = $(".dest-list li[data-dest='" + (key === "Backspace" ? "Delete" : key) + "']");
    if (!li) return;
    $(".count", li).textContent = counts[li.getAttribute("data-dest")];
    li.classList.remove("bump"); void li.offsetWidth; li.classList.add("bump");
    setTimeout(function () { li.classList.remove("bump"); }, 700);
  }

  function press(key) {
    var btn = $(".cmd[data-key='" + (key === "Backspace" ? "Delete" : key) + "']", app);
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
    busy = true;
    if (!reduced) el.art.classList.add(cls);
    setTimeout(function () { idx++; render(true); busy = false; }, reduced ? 0 : 320);
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
    var on = !!favs[idx];
    el.fav.classList.toggle("on", on);
    el.fav.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function setFav(on) {
    favs[idx] = on;
    showFav();
    toast(on ? "★  Ajoutée aux favoris" : "Retirée des favoris");
  }

  function handle(key, e) {
    if (/^[6-9]$/.test(key) || key === "Delete" || key === "Backspace" || key === " ") {
      if (e) e.preventDefault();
      decide(key);
    } else if (/^[1-5]$/.test(key)) {
      if (e) e.preventDefault();
      setFav(!favs[idx]);
    } else if (key === "0") {
      if (e) e.preventDefault();
      setFav(false);
    }
  }

  $$(".cmd", app).forEach(function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); handle(b.getAttribute("data-key")); });
  });
  el.fav.addEventListener("click", function (e) { e.stopPropagation(); setFav(!favs[idx]); });

  // Le clavier ne s'active que lorsque la démo est à l'écran (ou a le focus).
  function setLive(v) { live = v; app.classList.toggle("is-live", v); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { setLive(en.intersectionRatio >= 0.55); });
    }, { threshold: [0, 0.55, 1] }).observe(app);
  }
  app.addEventListener("focus", function () { setLive(true); });

  document.addEventListener("keydown", function (e) {
    if (!live || gateOpen() || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === " " && t && t.tagName === "BUTTON" && !app.contains(t)) return;
    if (e.key === " " && t && t.tagName === "BUTTON" && app.contains(t)) { e.preventDefault(); decide(" "); return; }
    handle(e.key, e);
  });

  // La lecture avance, le temps restant décompte.
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    var it = item();
    pos += dt * 4;
    if (pos > it.dur) pos = 0;
    el.remain.textContent = "−" + fmt(it.dur - pos);
    el.bar.style.width = (pos / it.dur * 100).toFixed(2) + "%";
    requestAnimationFrame(tick);
  }
  render(false);
  requestAnimationFrame(tick);
})();
