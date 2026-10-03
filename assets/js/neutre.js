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
})();
