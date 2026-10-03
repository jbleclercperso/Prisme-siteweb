/* Prisme — comportements de la version neutre du site (dossier /neutre/).
   Aucun traceur, aucune dépendance, rien d'enregistré dans le navigateur.
   Pas de contrôle d'âge ici. La démo est volontairement simple : elle garde
   les identifiants #demoApp et #demoPlayer de la page principale (../index.html), pour qu'une
   démo plus fidèle, commune aux deux versions, puisse la remplacer. */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cfg = window.PRISME_CONFIG || { links: {} };

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------ Liens */
  $$("[data-link]").forEach(function (a) {
    var url = cfg.links && cfg.links[a.getAttribute("data-link")];
    if (url) a.setAttribute("href", url);
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

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

  /* ------------------------------------------------------------ Accès anticipé */
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
    var ARTS = ["s1", "s5", "s3", "s7", "s2", "s6", "s9", "s4", "s11", "s8"];
    var NAMES = ["DJI_0412", "lagon_drone", "IMG_2041", "foret_GOPR0187", "sommet_DJI_0098",
                 "aurore_islande", "lac_annecy", "dunes_maroc", "canyon_vol_03", "tokyo_nuit"];
    var COLS = { vertical: [0, 0, 2, 3, 4, 5, 6, 4, 4, 5, 5], horizontal: [0, 0, 2, 3, 2, 3, 3, 4, 4, 3, 5] };
    var wallState = { n: 5, o: "vertical" };
    var renderWall = function () {
      var n = wallState.n, o = wallState.o, html = "";
      for (var i = 0; i < n; i++) {
        var left = 20 + ((i * 37) % 90);
        html += '<div class="panel"><div class="art ' + ARTS[i] + '" style="--dur:' + (14 + i % 5 * 2) + 's"></div>' +
          '<div class="panel-top"><span>' + NAMES[i] + (o === "vertical" ? "_9x16" : "_4K") + '.mp4</span><b>−' +
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

  /* ------------------------------------------------------------ Démo interactive (simple) */
  var app = $("#demoApp");
  if (!app) return;

  var ITEMS = [
    { name: "DJI_0412.MP4", res: "4K", meta: "2160p · 3,2 Go", dur: 182, art: "s1" },
    { name: "GOPR0187.MP4", res: "2,7K", meta: "1520p · 1,4 Go", dur: 256, art: "s7" },
    { name: "IMG_2041.MOV", res: "4K", meta: "2160p · 880 Mo", dur: 48, art: "s3" },
    { name: "lagon_vue_du_ciel.mp4", res: "4K", meta: "2160p · 2,1 Go", dur: 312, art: "s5" },
    { name: "mariage_julie_tom.mp4", res: "1080p", meta: "1080p · 4,3 Go", dur: 1653, art: "s12" },
    { name: "DJI_0098_sommet.MP4", res: "4K", meta: "2160p · 5,9 Go", dur: 402, art: "s2" },
    { name: "aurore_islande_timelapse.mp4", res: "4K", meta: "2160p · 1,1 Go", dur: 75, art: "s6" },
    { name: "dunes_maroc.mp4", res: "4K", meta: "2160p · 2,7 Go", dur: 220, art: "s4" },
    { name: "lac_annecy_famille.mp4", res: "1080p", meta: "1080p · 640 Mo", dur: 960, art: "s9" },
    { name: "rizieres_DJI_0233.MP4", res: "4K", meta: "2160p · 2,0 Go", dur: 140, art: "s10" },
    { name: "canyon_vol_03.mp4", res: "4K", meta: "2160p · 1,6 Go", dur: 198, art: "s11" },
    { name: "tokyo_nuit.mov", res: "4K", meta: "2160p · 3,3 Go", dur: 284, art: "s8" }
  ];
  var LABELS = { "6": "Voyages", "7": "Famille", "8": "Drone", "9": "À monter", "Delete": "Corbeille" };
  // Les vidéos et les dossiers de la démo peuvent venir du bloc JSON #demoData de la page.
  var dataEl = $("#demoData");
  if (dataEl) {
    try {
      var data = JSON.parse(dataEl.textContent);
      if (data.items && data.items.length) ITEMS = data.items;
      if (data.labels) LABELS = data.labels;
    } catch (e) { /* on garde les valeurs par défaut */ }
  }

  var el = {
    name: $("[data-demo='name']", app), meta: $("[data-demo='meta']", app),
    art: $("[data-demo='art']", app), remain: $("[data-demo='remain']", app), res: $("[data-demo='res']", app),
    bar: $("[data-demo='bar']", app), toast: $("[data-demo='toast']", app), strip: $("[data-demo='strip']", app),
    fav: $("[data-demo='fav']", app), player: $("#demoPlayer"),
    done: $("[data-demo='done']"), pace: $("[data-demo='pace']")
  };
  var counts = { "6": 0, "7": 0, "8": 0, "9": 0, "Delete": 0 };
  var favs = {};
  var idx = 0, pos = 0, paused = false, history = [], started = 0, decisions = 0, busy = false, live = false, toastTimer = 0;

  function fmt(s) {
    s = Math.max(0, Math.round(s));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }
  function item() { return ITEMS[idx % ITEMS.length]; }
  // Les cinq instants de la pellicule, répartis sur toute la durée.
  function instant(i) { return item().dur * (i * 2 + 1) / 10; }

  function render(animIn) {
    var it = item();
    el.name.textContent = it.name;
    el.meta.textContent = it.meta;
    el.res.textContent = it.res + " · " + it.name;
    var art = document.createElement("div");
    art.className = "art " + it.art + (animIn && !reduced ? " fly-in" : "");
    art.setAttribute("data-demo", "art");
    art.addEventListener("animationend", function (e) {
      if (e.animationName === "flyin") art.classList.remove("fly-in");
    });
    el.art.replaceWith(art);
    el.art = art;
    $$(".art", el.strip).forEach(function (s, i) {
      s.className = "art " + it.art;
      s.style.setProperty("--dur", (14 + i * 2) + "s");
      s.firstChild.textContent = fmt(instant(i));
    });
    pos = it.dur * 0.12;
    paused = false;
    showFav();
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
      toast("La suivante, sans rien toucher");
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

  function togglePause() {
    paused = !paused;
    toast(paused ? "❙❙  Pause" : "▶  Lecture");
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
    } else if (key === "Enter" && (!e || !e.target || e.target.tagName !== "BUTTON")) {
      if (e) e.preventDefault();
      togglePause();
    }
  }

  $$(".cmd", app).forEach(function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); handle(b.getAttribute("data-key")); });
  });
  el.fav.addEventListener("click", function (e) { e.stopPropagation(); setFav(!favs[idx]); });
  // Un clic sur l'image : pause ou reprise, comme dans Prisme.
  if (el.player) el.player.addEventListener("click", togglePause);

  // Survoler une case de la pellicule fait sauter la lecture à cet instant.
  $$(".art", el.strip).forEach(function (s, i) {
    var go = function () {
      pos = instant(i);
      $$(".art", el.strip).forEach(function (o) { o.classList.toggle("hot", o === s); });
    };
    s.addEventListener("pointerenter", go);
    s.addEventListener("click", go);
    s.addEventListener("pointerleave", function () { s.classList.remove("hot"); });
  });

  // Le clavier ne s'active que lorsque la démo est à l'écran (ou a le focus).
  function setLive(v) { live = v; app.classList.toggle("is-live", v); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { setLive(en.intersectionRatio >= 0.55); });
    }, { threshold: [0, 0.55, 1] }).observe(app);
  }
  app.addEventListener("focus", function () { setLive(true); });

  document.addEventListener("keydown", function (e) {
    if (!live || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); undo(); return; }
    if (e.ctrlKey || e.metaKey) return;
    if (e.key === " " && t && t.tagName === "BUTTON" && !app.contains(t)) return;
    if (e.key === " " && t && t.tagName === "BUTTON" && app.contains(t)) { e.preventDefault(); decide(" "); return; }
    if (e.key === "Enter" && t && (t.tagName === "A" || (t.tagName === "BUTTON" && !app.contains(t)))) return;
    handle(e.key, e);
  });

  // La lecture avance, le temps restant décompte.
  var last = performance.now();
  function tick(now) {
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    var it = item();
    if (!paused) pos += dt * 4;
    if (pos > it.dur) pos = 0;
    el.remain.textContent = "−" + fmt(it.dur - pos);
    el.bar.style.width = (pos / it.dur * 100).toFixed(2) + "%";
    requestAnimationFrame(tick);
  }
  render(false);
  requestAnimationFrame(tick);
})();
