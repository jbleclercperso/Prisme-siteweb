/* Prisme — la démo de la fiche, commune aux versions du site (adulte, neutre,
   anglaise). Elle ne dépend que de la page : #demoApp, #demoPlayer, et, si la
   page en fournit un, le bloc JSON #demoData (ses vidéos et ses destinations). */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function gateOpen() { return root.classList.contains("gate-open"); }
  var lang = (root.getAttribute("lang") || "fr").slice(0, 2);
  var TEXT = {
    fr: {
      decimal: ",", gb: "Go", mb: "Mo",
      labels: { "6": "Amateur", "7": "POV", "8": "MILF", "9": "À revoir", "Delete": "Corbeille" },
      trashed: "Mise à la corbeille de séance",
      sent: function (to) { return "Envoyée vers « " + to + " »"; },
      skipped: "Passée, sans rien toucher",
      nothingToUndo: "Rien à annuler",
      undone: "Annulé : la vidéo est revenue",
      faved: "★  Ajoutée aux favoris", unfaved: "Retirée des favoris",
      ui: { fav: "Favori", prev: "Précédente", next: "Suivante", pause: "Pause", play: "Lecture", full: "Plein écran" }
    },
    en: {
      decimal: ".", gb: "GB", mb: "MB",
      labels: { "6": "Amateur", "7": "POV", "8": "MILF", "9": "Rewatch", "Delete": "Trash" },
      trashed: "Moved to the session trash",
      sent: function (to) { return "Sent to “" + to + "”"; },
      skipped: "Skipped, left untouched",
      nothingToUndo: "Nothing to undo",
      undone: "Undone: the video is back",
      faved: "★  Added to favorites", unfaved: "Removed from favorites",
      ui: { fav: "Favorite", prev: "Previous", next: "Next", pause: "Pause", play: "Play", full: "Full screen" }
    }
  };
  var T = TEXT[lang] || TEXT.fr;

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

  // Taille en Go : affichée en Mo sous 1 Go, avec la virgule ou le point selon la langue.
  var ITEMS = [
    { name: "amateur_couple_weekend.mp4", res: "4K", gb: 3.2, dur: 1122, art: "a1" },
    { name: "pov_casting_blonde.mp4", res: "1080p", gb: 1.4, dur: 756, art: "a2" },
    { name: "milf_hotel_suite_4K.mkv", res: "4K", gb: 5.9, dur: 1862, art: "a9" },
    { name: "lesbian_massage_02.mp4", res: "1080p", gb: 0.88, dur: 524, art: "a4" },
    { name: "backstage_studio_03.mp4", res: "720p", gb: 0.64, dur: 1160, art: "a5" },
    { name: "threesome_villa_ibiza.mp4", res: "1080p", gb: 1.1, dur: 908, art: "a6" },
    { name: "gonzo_scene_0412.mov", res: "4K", gb: 8.3, dur: 2571, art: "a7" },
    { name: "solo_shower_720p.mp4", res: "720p", gb: 0.512, dur: 372, art: "a3" },
    { name: "pov_girlfriend_4K.mp4", res: "4K", gb: 2.0, dur: 1653, art: "a10" },
    { name: "casting_couch_19.mp4", res: "1080p", gb: 2.7, dur: 665, art: "a8" },
    { name: "cam_show_replay_9.mp4", res: "1080p", gb: 0.79, dur: 587, art: "a11" },
    { name: "vintage_70s_classic.mkv", res: "720p", gb: 1.6, dur: 1998, art: "a12" }
  ];
  var LABELS = T.labels;
  function meta(it) {
    var size = it.gb < 1 ? Math.round(it.gb * 1000) + " " + T.mb : it.gb.toFixed(1).replace(".", T.decimal) + " " + T.gb;
    return (it.res === "4K" ? "2160p" : it.res) + " · " + size;
  }
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
      '<button type="button" class="ob-btn ob-fav" data-act="fav" aria-label="' + T.ui.fav + '"></button>' +
      '<span class="ob-name"></span><span class="ob-pos"></span>' +
      '<span class="ob-mid">' +
        '<button type="button" class="ob-btn" data-act="prev" aria-label="' + T.ui.prev + '">' + ICON.prev + '</button>' +
        '<button type="button" class="ob-btn ob-play" data-act="pause" aria-label="' + T.ui.pause + '"></button>' +
        '<button type="button" class="ob-btn" data-act="next" aria-label="' + T.ui.next + '">' + ICON.next + '</button>' +
      '</span>' +
      '<span class="ob-left"></span>' +
      '<button type="button" class="ob-btn" data-act="full" aria-label="' + T.ui.full + '">' + ICON.full + '</button>' +
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
    el.meta.textContent = it.meta || meta(it);
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
    el.obplay.setAttribute("aria-label", paused ? T.ui.play : T.ui.pause);
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
      el.pace.textContent = per < 10 ? per.toFixed(1).replace(".", T.decimal) + " s" : Math.round(per) + " s";
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
      toast(key === "Delete" ? T.trashed : T.sent(LABELS[key]));
    } else {
      history.push({ key: " ", idx: idx });
      toast(T.skipped);
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
    if (!last) { toast(T.nothingToUndo); return; }
    if (last.key !== " ") {
      counts[last.key]--;
      bump(last.key);
      decisions--;
    }
    idx = last.idx;
    render(true);
    stats();
    toast(T.undone);
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
    toast(on ? T.faved : T.unfaved);
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
